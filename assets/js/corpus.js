/**
 * corpus.js — loads the reference set.
 *
 * The stories themselves live in assets/data/corpus.json so they can be edited
 * without touching code. This module fetches that file once, validates every
 * entry, and exposes the result.
 *
 * CORPUS is a live array that is filled in place, never reassigned — modules
 * that import it hold a valid reference from the moment they load, and see the
 * stories as soon as loadCorpus() resolves.
 *
 * Field rules are in assets/data/corpus.schema.json. `node tools/validate-corpus.mjs`
 * checks a file against them before you commit; the deploy runs the same check.
 */

export const CORPUS = [];

export const CORPUS_URL = new URL("../data/corpus.json", import.meta.url).href;

const REQUIRED = ["id", "t", "kind", "sum", "w", "s1", "s2", "s3", "s4", "pA", "pB", "pC", "pD", "pE", "pF"];
const WEIGHTS = ["A", "B", "C", "D", "E", "F"];

/**
 * Returns a list of problems with one entry. Empty means it is usable.
 * Kept deliberately forgiving: a single bad row is dropped with a warning
 * rather than taking the whole set down.
 */
export function validateStory(entry, index) {
  const where = "story " + (index + 1) + (entry && entry.id ? " (" + entry.id + ")" : "");
  if (!entry || typeof entry !== "object") return [where + ": not an object"];
  const problems = [];
  REQUIRED.forEach(key => {
    if (key === "w") return;
    if (typeof entry[key] !== "string" || !entry[key].trim()) problems.push(where + ": missing " + key);
  });
  if (!entry.w || typeof entry.w !== "object") {
    problems.push(where + ": missing weights");
  } else {
    WEIGHTS.forEach(k => {
      const v = entry.w[k];
      if (typeof v !== "number" || v < 0 || v > 100) problems.push(where + ": weight " + k + " must be 0-100");
    });
  }
  if (entry.alt && !Array.isArray(entry.alt)) problems.push(where + ": alt must be a list");
  return problems;
}

/** Normalises one entry so downstream code can assume the shape. */
function adopt(entry) {
  return Object.assign({}, entry, { alt: Array.isArray(entry.alt) ? entry.alt : [] });
}

/**
 * Fetches and installs the set. Resolves with { count, problems, ids }.
 * Throws only if the file cannot be read or parsed at all.
 */
export async function loadCorpus(url) {
  const res = await fetch(url || CORPUS_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("Could not load the story set (" + res.status + ").");
  const doc = await res.json();
  const stories = Array.isArray(doc) ? doc : (doc && doc.stories);
  if (!Array.isArray(stories)) throw new Error("The story set is not in the expected shape.");

  const problems = [];
  const seen = new Set();
  CORPUS.length = 0;
  stories.forEach((entry, i) => {
    const issues = validateStory(entry, i);
    if (entry && seen.has(entry.id)) issues.push("story " + (i + 1) + ": duplicate id " + entry.id);
    if (issues.length) { problems.push.apply(problems, issues); return; }
    seen.add(entry.id);
    CORPUS.push(adopt(entry));
  });

  if (problems.length) console.warn("Story set: " + problems.length + " entry problem(s) skipped\n" + problems.join("\n"));
  return { count: CORPUS.length, problems: problems, ids: Array.from(seen) };
}
