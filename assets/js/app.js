/**
 * app.js — bootstrap.
 *
 * Load the record, paint the fixed content, wire the controls, render.
 */

import * as store from "./store.js";
import { paintStaticContent, render, wire, go } from "./ui.js";
import { activeRound } from "./model.js";

store.load();
paintStaticContent();
wire();
render(store.get());

const round = activeRound(store.get());
if (round && round.story.resolvedTitle) {
  document.getElementById("story-reveal").hidden = false;
  document.getElementById("open-story").hidden = true;
  document.getElementById("story-title").value = round.story.rawTitle;
  document.getElementById("story-note").value = round.story.note || "";
  go(round.completedAt ? "close" : "dna", store.get());
}
