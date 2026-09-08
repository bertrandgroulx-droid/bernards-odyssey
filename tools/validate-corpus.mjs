#!/usr/bin/env node
/**
 * Checks assets/data/corpus.json against the field rules before it ships.
 *
 *   node tools/validate-corpus.mjs [path-to-corpus.json]
 *
 * Exits non-zero on any error, so it can gate a deploy. Warnings (long prose,
 * duplicate aliases) are reported but do not fail the run.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] ? resolve(process.argv[2]) : resolve(here, "../assets/data/corpus.json");

const REQUIRED = ["id", "t", "kind", "sum", "w", "s1", "s2", "s3", "s4", "pA", "pB", "pC", "pD", "pE", "pF"];
const WEIGHTS = ["A", "B", "C", "D", "E", "F"];
const SENTENCES = ["sum", "s1", "s2", "s3", "s4"];
const CLAUSES = ["pA", "pB", "pC", "pD", "pE", "pF"];
const MAX_SENTENCE_WORDS = 25;
const MAX_CLAUSE_WORDS = 14;
const BANNED = /\b(masterclass|raw|definitive|exact|ultimate|pure gold)\b/i;

const words = s => String(s || "").trim().split(/\s+/).filter(Boolean).length;

const errors = [];
const warnings = [];

let doc;
try {
  doc = JSON.parse(await readFile(file, "utf8"));
} catch (err) {
  console.error("Could not read " + file + "\n  " + err.message);
  process.exit(1);
}

const stories = Array.isArray(doc) ? doc : doc.stories;
if (!Array.isArray(stories) || !stories.length) {
  console.error("No stories found in " + file);
  process.exit(1);
}

const ids = new Map();
const aliases = new Map();

stories.forEach((entry, i) => {
  const at = "story " + (i + 1) + (entry && entry.id ? " (" + entry.id + ")" : "");

  if (!entry || typeof entry !== "object") { errors.push(at + ": not an object"); return; }

  REQUIRED.forEach(key => {
    if (key === "w") return;
    if (typeof entry[key] !== "string" || !entry[key].trim()) errors.push(at + ": missing " + key);
  });

  if (entry.id && !/^[a-z0-9-]+$/.test(entry.id)) errors.push(at + ": id must be lowercase letters, digits or hyphens");
  if (entry.id && ids.has(entry.id)) errors.push(at + ": duplicate id, also used by story " + (ids.get(entry.id) + 1));
  if (entry.id) ids.set(entry.id, i);

  if (!entry.w || typeof entry.w !== "object") {
    errors.push(at + ": missing weights");
  } else {
    WEIGHTS.forEach(k => {
      const v = entry.w[k];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) {
        errors.push(at + ": weight " + k + " must be a number from 0 to 100");
      }
    });
  }

  if (entry.alt !== undefined && !Array.isArray(entry.alt)) errors.push(at + ": alt must be a list");
  [entry.t].concat(Array.isArray(entry.alt) ? entry.alt : []).forEach(name => {
    if (typeof name !== "string" || !name.trim()) return;
    const key = name.toLowerCase().trim();
    if (aliases.has(key) && aliases.get(key) !== entry.id) {
      warnings.push(at + ': the name "' + name + '" is also used by ' + aliases.get(key));
    }
    aliases.set(key, entry.id);
  });

  SENTENCES.forEach(k => {
    if (typeof entry[k] === "string" && words(entry[k]) > MAX_SENTENCE_WORDS) {
      warnings.push(at + ": " + k + " runs " + words(entry[k]) + " words and will be trimmed to " + MAX_SENTENCE_WORDS);
    }
  });
  CLAUSES.forEach(k => {
    if (typeof entry[k] === "string" && words(entry[k]) > MAX_CLAUSE_WORDS) {
      warnings.push(at + ": " + k + " runs " + words(entry[k]) + " words; keep clauses under " + MAX_CLAUSE_WORDS);
    }
  });

  if (BANNED.test(JSON.stringify(entry))) warnings.push(at + ": contains a word the tone rules exclude");
});

warnings.forEach(w => console.warn("warning  " + w));
errors.forEach(e => console.error("error    " + e));

if (errors.length) {
  console.error("\n" + errors.length + " error(s) in " + stories.length + " stories. Nothing was changed.");
  process.exit(1);
}
console.log("ok — " + stories.length + " stories, " + aliases.size + " searchable names, " + warnings.length + " warning(s).");
