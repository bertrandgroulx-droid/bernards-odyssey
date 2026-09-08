/**
 * store.js — persistence, export and import.
 *
 * The only module that touches localStorage or the filesystem. Views subscribe
 * and re-render; nothing else reads storage directly.
 */

import { migrate, newRecord, normalise } from "./model.js";

const KEY = "trojanhorse.record.v1";

let state = newRecord();
const listeners = new Set();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? migrate(JSON.parse(raw)) : newRecord();
  } catch (e) {
    state = newRecord();          // private mode, quota, or a corrupt value
  }
  return state;
}

export function get() { return state; }

export function set(mutator) {
  if (typeof mutator === "function") mutator(state);
  state.updatedAt = Date.now();
  persist();
  emit();
  return state;
}

export function reset() {
  state = newRecord();
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
  emit();
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() { listeners.forEach(fn => fn(state)); }

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* not fatal */ }
}

/* ---------- File export / import: the user owns their record ---------- */

export function exportFile() {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trojan-horse-record-" + stamp + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        state = migrate(parsed);
        persist();
        emit();
        resolve(state);
      } catch (e) {
        reject(new Error("That file is not a Trojan Horse record."));
      }
    };
    reader.readAsText(file);
  });
}

/** Reads a plain text or markdown file and returns its first non-empty line. */
export function readTitleFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.onload = () => {
      const text = String(reader.result || "");
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.rounds) { state = migrate(parsed); persist(); emit(); resolve({ record: true }); return; }
        } catch (e) { /* fall through and treat it as text */ }
      }
      const lines = text.split(/\r?\n/).map(l => l.replace(/^#+\s*/, "").trim()).filter(Boolean);
      resolve({ title: lines[0] || "", note: lines.slice(1).join(" ").slice(0, 240) });
    };
    reader.readAsText(file);
  });
}

export { normalise };
