/**
 * model.js — data model and schema.
 *
 * One Record per browser. A Record holds an ordered list of Rounds; a Round is
 * one story taken all the way through DNA → six questions → seventh question.
 * Every value the app persists is defined here, so storage, export, import and
 * migration all have a single source of truth.
 *
 *   Record  { version, createdAt, updatedAt, rounds[], activeRoundId }
 *   Round   { id, createdAt, completedAt, story, vector, answers, seventh }
 *   Story   { rawTitle, resolvedTitle, kind, source: 'corpus'|'self', matchId, note, self{} }
 *   Vector  { A..F: 0–100 }   the six process intensities
 */

import { PROCESS_ORDER } from "./content.js";

export const SCHEMA_VERSION = 1;

export function uid(prefix) {
  return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyVector(fill) {
  const v = {};
  PROCESS_ORDER.forEach(k => { v[k] = typeof fill === "number" ? fill : 0; });
  return v;
}

export function vectorValues(v) {
  return PROCESS_ORDER.map(k => Number(v && v[k]) || 0);
}

export function newStory(rawTitle) {
  return {
    rawTitle: String(rawTitle || "").trim(),
    resolvedTitle: "",
    kind: "",
    source: "self",
    matchId: null,
    note: "",
    self: {}            // process code → the user's own one-line instance
  };
}

export function newRound(rawTitle) {
  return {
    id: uid("round"),
    createdAt: Date.now(),
    completedAt: null,
    story: newStory(rawTitle),
    vector: emptyVector(0),
    answers: {},        // q1…q6 → string
    seventh: ""
  };
}

export function newRecord() {
  return {
    version: SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rounds: [],
    activeRoundId: null
  };
}

/** Round progress, used for step locking and for the closing sequence. */
export function roundProgress(round, questionIds) {
  if (!round) return { hasStory: false, hasDna: false, answered: 0, sixDone: false, seventhDone: false };
  const answered = questionIds.filter(id => String(round.answers[id] || "").trim()).length;
  return {
    hasStory: Boolean(round.story.rawTitle),
    hasDna: Boolean(round.story.resolvedTitle),
    answered,
    sixDone: answered === questionIds.length,
    seventhDone: Boolean(String(round.seventh || "").trim())
  };
}

export function activeRound(record) {
  if (!record.activeRoundId) return null;
  return record.rounds.filter(r => r.id === record.activeRoundId)[0] || null;
}

export function completedRounds(record) {
  return record.rounds.filter(r => r.completedAt);
}

/**
 * Migrations run oldest-first. Each entry takes a record at version n and
 * returns one at version n+1, so adding a field later never breaks a saved file.
 */
const MIGRATIONS = [];

export function migrate(raw) {
  let rec = raw;
  if (!rec || typeof rec !== "object") return newRecord();
  let v = Number(rec.version) || 0;
  while (v < SCHEMA_VERSION && MIGRATIONS[v]) {
    rec = MIGRATIONS[v](rec);
    v += 1;
  }
  return normalise(rec);
}

/** Defensive read: an imported or hand-edited file can be missing anything. */
export function normalise(rec) {
  const base = newRecord();
  const out = Object.assign(base, rec || {});
  out.version = SCHEMA_VERSION;
  out.rounds = Array.isArray(out.rounds) ? out.rounds.map(normaliseRound).filter(Boolean) : [];
  if (!out.rounds.some(r => r.id === out.activeRoundId)) {
    out.activeRoundId = out.rounds.length ? out.rounds[out.rounds.length - 1].id : null;
  }
  return out;
}

function normaliseRound(r) {
  if (!r || typeof r !== "object") return null;
  const base = newRound("");
  const out = Object.assign(base, r);
  out.story = Object.assign(newStory(""), r.story || {});
  out.story.self = Object.assign({}, (r.story && r.story.self) || {});
  out.vector = Object.assign(emptyVector(0), r.vector || {});
  out.answers = Object.assign({}, r.answers || {});
  out.seventh = String(r.seventh || "");
  return out;
}
