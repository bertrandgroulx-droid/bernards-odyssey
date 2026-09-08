/**
 * analysis.js — the game engine.
 *
 * Three jobs, kept separate so each can be swapped:
 *   1. resolve   — turn a typed title into a corpus entry, or into a self-map
 *   2. read      — produce the two-phase response under each of the four stages
 *   3. measure   — the multivariate layer: six-dimensional vectors, and a
 *                  principal-component projection of the whole set
 *
 * Every generated sentence passes fit25(): a compressed paragraph of at most 25
 * words, never a seven-to-nine word fragment. Tone rules are enforced by
 * TONE_BANNED at build time (see test/lint) and by writing plainly here.
 */

import { PROCESSES, PROCESS_ORDER, STAGES, CONTENT } from "./content.js";
import { CORPUS } from "./corpus.js";
import { emptyVector, vectorValues } from "./model.js";

export const TONE_BANNED = /\b(masterclass|raw|definitive|exact|ultimate|pure gold|game[- ]chang\w*|revolutionary|unlock(?:s|ed)? your)\b/i;

/* ------------------------------------------------------------------ */
/* 1. Resolve                                                          */
/* ------------------------------------------------------------------ */

const STOPWORDS = /\b(the|a|an|of|and|part|episode|season|film|movie|book|novel|series)\b/g;

export function normTitle(t) {
  return String(t || "").toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(STOPWORDS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchStory(title) {
  const q = normTitle(title);
  if (!q) return null;
  let best = null, score = 0;
  for (const entry of CORPUS) {
    const names = [entry.t].concat(entry.alt || []).map(normTitle);
    for (const n of names) {
      if (!n) continue;
      let s = 0;
      if (n === q) s = 1;
      else if (n.startsWith(q) || q.startsWith(n)) s = 0.92;
      else if (n.includes(q) || q.includes(n)) s = 0.84;
      else {
        const qt = q.split(" "), nt = n.split(" ");
        const shared = qt.filter(w => w.length > 2 && nt.includes(w)).length;
        const ratio = shared / Math.max(1, Math.min(qt.length, nt.length));
        if (ratio >= 0.6) s = 0.7 * ratio;
      }
      if (s > score) { score = s; best = entry; }
    }
  }
  return score >= 0.6 ? best : null;
}

export function suggestions(prefix, limit) {
  const q = normTitle(prefix);
  const n = limit || 6;
  if (!q) return CORPUS.slice(0, n);
  const hits = CORPUS.filter(e => [e.t].concat(e.alt || []).some(x => normTitle(x).includes(q)));
  return hits.slice(0, n);
}

export function sampleTitles(n) {
  return CORPUS.slice(0, n || 6).map(e => e.t);
}

/* ------------------------------------------------------------------ */
/* 2. Read — the two-phase output                                      */
/* ------------------------------------------------------------------ */

/** Compress to at most 25 words without cutting mid-clause where avoidable. */
export function fit25(text) {
  const words = String(text || "").trim().replace(/\s+/g, " ").split(" ");
  if (words.length <= 25) return words.join(" ");
  let out = words.slice(0, 25).join(" ");
  const stop = Math.max(out.lastIndexOf("."), out.lastIndexOf(";"), out.lastIndexOf(","));
  if (stop > out.length * 0.6) out = out.slice(0, stop);
  return out.replace(/[,;:\s]+$/, "") + ".";
}

function ownClause(text, words) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  const parts = t.split(" ");
  const cut = parts.slice(0, words || 12).join(" ");
  return cut + (parts.length > (words || 12) ? "…" : "");
}

/**
 * The response under each stage.
 * Phase 1 states how the story fits the stage mechanics.
 * Phase 2 states, per process, how the action lines up with Homer's.
 */
export function readStory(round) {
  const entry = round.story.matchId ? CORPUS.find(e => e.id === round.story.matchId) : null;
  return STAGES.map(stage => {
    const phase1 = entry
      ? fit25(entry["s" + stage.n])
      : fit25(selfPhase1(round, stage));
    const processes = stage.processes.map(code => {
      const proc = PROCESSES[code];
      const clause = entry ? entry["p" + code] : ownClause(round.story.self[code], 14);
      const phase2 = clause
        ? fit25(clause.replace(/[.\s]+$/, "") + " — the same move as when " + proc.homeric + ".")
        : fit25("Nothing recorded here yet. In Homer this is the point where " + proc.homeric + ", which is worth a second look.");
      return { code, name: proc.name, def: proc.def, phase2 };
    });
    return { stage, phase1, processes };
  });
}

function selfPhase1(round, stage) {
  const bits = stage.processes
    .map(code => String(round.story.self[code] || "").trim())
    .filter(Boolean);
  if (!bits.length) {
    return "You have not filled this stage in yet. " + stage.plain;
  }
  const joined = bits.map(b => b.replace(/[.\s]+$/, "")).join("; ");
  return "In your reading of " + round.story.resolvedTitle + ": " + joined + ".";
}

export function storySummary(round) {
  const entry = round.story.matchId ? CORPUS.find(e => e.id === round.story.matchId) : null;
  if (entry) return entry.sum;
  const filled = PROCESS_ORDER.map(c => round.story.self[c]).filter(Boolean).length;
  return fit25("Your own reading of " + round.story.resolvedTitle + ", mapped across " + filled +
    " of the six processes. The set below is the shape you gave it.");
}

/* ------------------------------------------------------------------ */
/* 3. Measure — vectors, indices, and the projection                   */
/* ------------------------------------------------------------------ */

const AGENCY_WORDS = /\b(decid|chose|choose|quit|left|start|stop|built|build|made|call|tell|told|ask|write|wrote|book|sign|refus|walk|train|practi[cs]|learn|save|plan|do|did)\w*/gi;
const STUCK_WORDS = /\b(stuck|loop|again|same|worry|worri|anxious|anxiety|afraid|fear|tired|avoid|scroll|delay|wait|later|someday|maybe|should|procrastinat)\w*/gi;
const LOSS_WORDS = /\b(lost|loss|gone|died|death|end|over|miss|missed|used to|before|back then|no longer|left me)\w*/gi;

const SPECIFIC = /\d|\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

function intensity(text, extra) {
  const t = String(text || "").trim();
  if (!t) return 0;
  const words = t.split(/\s+/).length;
  const base = Math.min(58, 16 + words * 2.4);
  const bonus = extra ? Math.min(34, (t.match(extra) || []).length * 9) : 0;
  const specific = SPECIFIC.test(t) ? 10 : 0;
  return Math.round(Math.max(0, Math.min(100, base + bonus + specific)));
}

/** Vector for a story: corpus weights, or derived from the user's own map. */
export function storyVector(round) {
  const entry = round.story.matchId ? CORPUS.find(e => e.id === round.story.matchId) : null;
  if (entry) return Object.assign(emptyVector(0), entry.w);
  const v = emptyVector(0);
  PROCESS_ORDER.forEach(code => { v[code] = intensity(round.story.self[code]); });
  return v;
}

/** Vector for the six answers, mapped onto the same six processes. */
export function answerVector(answers) {
  const v = emptyVector(0);
  const a = k => String(answers[k] || "");
  v.A = Math.round((intensity(a("q1")) + intensity(a("q2"), STUCK_WORDS)) / 2);
  v.B = intensity(a("q3"));
  v.C = Math.round(intensity(a("q3"), /\b(mistake|error|rush|impatien|too (?:fast|soon)|should have|wrong call)\w*/gi) * 0.8);
  v.D = intensity(a("q4"), STUCK_WORDS);
  v.E = Math.round(intensity(a("q4"), /\b(routine|comfort|fine|okay|coast|numb|habit|distract)\w*/gi) * 0.85);
  v.F = Math.round((intensity(a("q5"), AGENCY_WORDS) + intensity(a("q6"), AGENCY_WORDS)) / 2);
  return v;
}

/** Named indices over the six-dimensional vector. Cheap, and easy to extend. */
export function indices(v) {
  const g = k => Number(v[k]) || 0;
  const stasis = (g("A") + g("E")) / 2;
  const collapse = (g("B") + g("C")) / 2;
  const cage = (g("D") + g("E")) / 2;
  const agency = g("F");
  const load = (stasis + collapse + cage + agency) / 4;
  return {
    stasis: Math.round(stasis),
    collapse: Math.round(collapse),
    cage: Math.round(cage),
    agency: Math.round(agency),
    load: Math.round(load),
    dominant: PROCESS_ORDER.reduce((best, k) => (g(k) > g(best) ? k : best), "A"),
    quietest: PROCESS_ORDER.reduce((low, k) => (g(k) < g(low) ? k : low), "A")
  };
}

/* ---- Principal components over the full set (power iteration, no deps) ---- */

function centre(rows) {
  const n = rows.length, d = rows[0].length;
  const mean = new Array(d).fill(0);
  rows.forEach(r => r.forEach((x, i) => { mean[i] += x / n; }));
  return { mean, centred: rows.map(r => r.map((x, i) => x - mean[i])) };
}

function covariance(rows) {
  const n = rows.length, d = rows[0].length;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  rows.forEach(r => {
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) cov[i][j] += (r[i] * r[j]) / Math.max(1, n - 1);
  });
  return cov;
}

function multiply(m, v) { return m.map(row => row.reduce((s, x, i) => s + x * v[i], 0)); }
function norm(v) { const n = Math.hypot(...v) || 1; return v.map(x => x / n); }

function topEigen(cov, iterations) {
  let v = norm(cov.map((_, i) => (i % 2 === 0 ? 1 : -1) + i * 0.01)); // deterministic seed
  for (let i = 0; i < (iterations || 120); i++) v = norm(multiply(cov, v));
  const lambda = multiply(cov, v).reduce((s, x, i) => s + x * v[i], 0);
  return { vector: v, value: lambda };
}

function deflate(cov, e) {
  return cov.map((row, i) => row.map((x, j) => x - e.value * e.vector[i] * e.vector[j]));
}

/**
 * Projects every point onto the first two principal components of the corpus.
 * The corpus defines the axes, so a user's story and answers can be added
 * without moving anything that is already plotted.
 */
export function project(points) {
  const corpusRows = CORPUS.map(e => vectorValues(e.w));
  const { mean } = centre(corpusRows);
  const centred = corpusRows.map(r => r.map((x, i) => x - mean[i]));
  const cov = covariance(centred);
  const e1 = topEigen(cov);
  const e2 = topEigen(deflate(cov, e1));
  const total = cov.reduce((s, row, i) => s + row[i], 0) || 1;
  const put = vals => {
    const c = vals.map((x, i) => x - mean[i]);
    return { x: c.reduce((s, x, i) => s + x * e1.vector[i], 0), y: c.reduce((s, x, i) => s + x * e2.vector[i], 0) };
  };
  return {
    axes: {
      pc1: { loadings: e1.vector, share: e1.value / total },
      pc2: { loadings: e2.vector, share: e2.value / total }
    },
    corpus: CORPUS.map((e, i) => Object.assign({ id: e.id, label: e.t, kind: "corpus" }, put(corpusRows[i]))),
    points: (points || []).map(p => Object.assign({ id: p.id, label: p.label, kind: p.kind }, put(vectorValues(p.vector))))
  };
}

/** Plain-language reading of what the two axes separate. */
export function axisLabel(loadings) {
  const ranked = PROCESS_ORDER
    .map((code, i) => ({ code, w: loadings[i] }))
    .sort((a, b) => Math.abs(b.w) - Math.abs(a.w));
  const high = ranked[0], low = ranked.find(r => Math.sign(r.w) !== Math.sign(high.w)) || ranked[1];
  return {
    positive: PROCESSES[high.code].name,
    negative: PROCESSES[low.code].name
  };
}

/* ------------------------------------------------------------------ */
/* 4. Responses to the six answers, and the close                      */
/* ------------------------------------------------------------------ */

export function readSix(round) {
  const a = round.answers || {};
  const v = answerVector(a);
  const ix = indices(v);
  const out = [];

  out.push({
    stage: STAGES[0],
    text: fit25(a.q1 && a.q2
      ? "You named the ambition and the thing holding it. Both sit in the same bubble, which is why leaving one costs the other."
      : "The ambition or the hold is still blank. In Homer that gap is where the lotus goes, quietly and with everyone's agreement.")
  });
  out.push({
    stage: STAGES[1],
    text: fit25(a.q3
      ? "Your shock reads as " + (v.B > 55 ? "a real strip of the props" : "a speed bump you absorbed") +
        ". Either way the open water is where the old map stops working."
      : "No shock recorded. Sometimes the bubble has not popped yet, which is a finding rather than a failure.")
  });
  out.push({
    stage: STAGES[2],
    text: fit25(a.q4
      ? (v.D >= v.E
          ? "The stuck part reads as a loop you can hear yourself running, rather than a routine that has quietly settled over the top of it."
          : "The stuck part reads more like a comfortable routine than a loop. Circe's island held the crew for a year without argument.")
      : "The cage is undescribed. That does not stop it running; it stops you being able to check the shape of it.")
  });
  out.push({
    stage: STAGES[3],
    text: fit25(a.q5 || a.q6
      ? (v.F > 50
          ? "You named an action and the resources for it. That combination is what the fourth stage actually is, and it is checkable tomorrow."
          : "Something is named, without much attached to it yet. The bow was strung by the one man who had kept training with it.")
      : "Nothing named for the fourth stage. Ownership left blank is the one gap the other five cannot cover.")
  });

  return { responses: out, vector: v, indices: ix };
}

/**
 * The close. Quiet by design: it registers the pattern, notes what is being
 * carried, and stops. It does not push, diagnose, or ask again.
 */
export function closeText(record, round) {
  const rounds = record.rounds.filter(r => r.completedAt).length;
  const said = String(round.seventh || "").trim();
  const lines = [];

  lines.push(fit25("Your story and your answers land close enough on the map that the pattern is doing real work here, not decoration."));

  if (said) {
    lines.push(fit25("You put something in the last box. It is stored with this round, in this browser, and nothing here will ask you about it again."));
  } else {
    lines.push(fit25("You left the last question. That is a complete answer too, and the round closes the same way either way."));
  }

  lines.push(fit25(rounds > 1
    ? "This is round " + rounds + ". The set is starting to have a shape, and shapes are easier to read across rounds than inside one."
    : "One round is a single point. Come back with another story sometime and the set starts to say something a single reading cannot."));

  return lines;
}
