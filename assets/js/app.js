/**
 * app.js — bootstrap.
 *
 * Load the story set, load the record, paint the fixed content, wire the
 * controls, render. The set is fetched rather than bundled, so the first thing
 * this does is wait for it and report clearly if it cannot be read.
 */

import * as store from "./store.js";
import { loadCorpus } from "./corpus.js";
import { paintStaticContent, render, wire, go, toast } from "./ui.js";
import { activeRound } from "./model.js";

function fail(message) {
  const host = document.querySelector("#stage-story .lead-card");
  if (!host) return;
  host.innerHTML =
    '<p class="stage-tag">Something is missing</p>' +
    "<h2>The story set did not load</h2>" +
    '<p class="lede">' + message + "</p>" +
    '<p class="lede">If you opened this file directly from your computer, it needs to be served instead — see the README. ' +
    "Otherwise a refresh usually settles it.</p>" +
    '<button class="btn primary" onclick="location.reload()">Try again</button>';
}

try {
  const result = await loadCorpus();
  if (!result.count) throw new Error("The story set loaded but contains no usable stories.");

  store.load();
  paintStaticContent();
  wire();
  render(store.get());

  if (result.problems.length) toast(result.problems.length + " story entries were skipped");

  const round = activeRound(store.get());
  if (round && round.story.resolvedTitle) {
    document.getElementById("story-reveal").hidden = false;
    document.getElementById("open-story").hidden = true;
    document.getElementById("story-title").value = round.story.rawTitle;
    document.getElementById("story-note").value = round.story.note || "";
    go(round.completedAt ? "close" : "dna", store.get());
  }
} catch (err) {
  fail(err && err.message ? err.message : "The story set could not be read.");
}
