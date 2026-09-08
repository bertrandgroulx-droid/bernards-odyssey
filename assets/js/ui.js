/**
 * ui.js — views and interaction.
 *
 * One render pass per state change. Each stage renders from the record alone,
 * so any stage can be re-entered at any time without special-casing.
 */

import { CONTENT, STAGES, PROCESSES, PROCESS_ORDER } from "./content.js";
import { activeRound, newRound, roundProgress } from "./model.js";
import * as store from "./store.js";
import * as A from "./analysis.js";
import { processBars, corpusMap, legend } from "./charts.js";
import { CORPUS } from "./corpus.js";

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const QIDS = CONTENT.questions.map(q => q.id);

const STEPS = [
  { key: "story",     label: "Your Story" },
  { key: "dna",       label: "Cultural DNA" },
  { key: "mva",       label: "Multivariate Analysis" },
  { key: "questions", label: "Six Questions" },
  { key: "seventh",   label: "The Seventh" },
  { key: "close",     label: "Close" }
];

let current = "story";
let toastTimer = null;

export function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ */
/* Fixed copy                                                          */
/* ------------------------------------------------------------------ */

export function paintStaticContent() {
  $("#title").textContent = CONTENT.title;
  $("#subtitle").textContent = CONTENT.subtitle;
  $("#intro").innerHTML = CONTENT.intro
    .map((p, i) => '<p' + (i === CONTENT.intro.length - 1 ? ' class="pivot"' : "") + ">" + esc(p) + "</p>").join("");

  $("#story-box-label").textContent = CONTENT.storyBoxLabel;
  $("#story-lede").textContent = CONTENT.storyLede;
  $("#story-input-label").textContent = CONTENT.storyInputLabel;
  $("#find-dna").textContent = CONTENT.findDnaLabel;
  $("#dna-title").textContent = CONTENT.dnaTitle;
  $("#clear-record").textContent = CONTENT.clearRecordLabel;
  $("#privacy").textContent = CONTENT.privacy;
  $("#footer-note").textContent = CONTENT.footer;

  $("#framework").innerHTML =
    "<h3>The framework</h3><p>" + esc(CONTENT.frameworkIntro) + "</p>" +
    STAGES.map(s =>
      '<div class="stage-line"><span class="sn">' + s.n + "</span><div><b>" + esc(s.name) + "</b> — " +
      s.processes.map(c => esc(PROCESSES[c].code + ". " + PROCESSES[c].name)).join(" &amp; ") + ". " +
      s.processes.map(c => esc(PROCESSES[c].def)).join(" ") + "</div></div>").join("");

  $("#generic-frame").innerHTML =
    "<h3>" + esc(CONTENT.genericFrameworkTitle) + "</h3>" +
    CONTENT.genericFramework.map(row =>
      "<p><b>" + esc(row[0]) + ":</b> " + esc(row[1]) + "</p>").join("");

  $("#disclaimer").innerHTML =
    "<h3>" + esc(CONTENT.disclaimerTitle) + "</h3>" +
    CONTENT.disclaimer.map(p => "<p>" + esc(p) + "</p>").join("");

  $("#suggest").innerHTML = A.sampleTitles(5)
    .map(t => '<button class="chip" data-pick="' + esc(t) + '">' + esc(t) + "</button>").join("");
}

/* ------------------------------------------------------------------ */
/* Rail and step visibility                                            */
/* ------------------------------------------------------------------ */

function unlocked(record) {
  const r = activeRound(record);
  const p = roundProgress(r, QIDS);
  return {
    story: true,
    dna: p.hasDna,
    mva: p.hasDna,
    questions: p.hasDna,
    seventh: p.sixDone,
    close: p.sixDone && Boolean(r && r.completedAt)
  };
}

export function go(key, record) {
  const open = unlocked(record);
  if (!open[key]) {
    toast(key === "seventh" ? "Answer the six questions first" : "Find the DNA of a story first");
    return;
  }
  current = key;
  STEPS.forEach(s => { $("#stage-" + s.key).hidden = s.key !== key; });
  paintRail(record);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function paintRail(record) {
  const open = unlocked(record);
  const r = activeRound(record);
  const p = roundProgress(r, QIDS);
  const done = { story: p.hasStory, dna: p.hasDna, mva: p.hasDna, questions: p.sixDone, seventh: p.seventhDone, close: Boolean(r && r.completedAt) };
  $("#rail-inner").innerHTML = STEPS.map((s, i) =>
    '<button class="step-btn" data-step="' + s.key + '"' +
    ' aria-current="' + (s.key === current) + '"' +
    ' data-locked="' + (open[s.key] ? 0 : 1) + '"' +
    ' data-done="' + (done[s.key] ? 1 : 0) + '">' +
    '<span class="n">' + (i + 1) + "</span>" + esc(s.label) + "</button>").join("");
  $$("[data-step]").forEach(b => b.addEventListener("click", () => go(b.dataset.step, store.get())));
}

/* ------------------------------------------------------------------ */
/* Step 1 — the story                                                  */
/* ------------------------------------------------------------------ */

function paintTypeahead(value) {
  const box = $("#typeahead");
  const hits = value.trim() ? A.suggestions(value, 6) : [];
  if (!hits.length) { box.hidden = true; box.innerHTML = ""; return; }
  box.hidden = false;
  box.innerHTML = hits.map(h =>
    '<li role="option"><button type="button" data-pick="' + esc(h.t) + '">' + esc(h.t) +
    '<span class="k">' + esc(h.kind) + "</span></button></li>").join("");
}

function pickTitle(title) {
  $("#story-title").value = title;
  $("#typeahead").hidden = true;
  $("#story-title").focus();
}

/** Resolve the typed title into a round, then move to the DNA step. */
function runDna() {
  const raw = $("#story-title").value.trim();
  if (!raw) { toast("Name a story first"); $("#story-title").focus(); return; }
  const note = $("#story-note").value.trim();
  const hit = A.matchStory(raw);

  store.set(rec => {
    const round = newRound(raw);
    round.story.note = note;
    if (hit) {
      round.story.matchId = hit.id;
      round.story.resolvedTitle = hit.t;
      round.story.kind = hit.kind;
      round.story.source = "corpus";
    } else {
      round.story.resolvedTitle = raw;
      round.story.kind = "Your own reading";
      round.story.source = "self";
    }
    round.vector = A.storyVector(round);
    rec.rounds.push(round);
    rec.activeRoundId = round.id;
  });

  render(store.get());
  go("dna", store.get());
}

/* ------------------------------------------------------------------ */
/* Step 2 — the DNA read                                               */
/* ------------------------------------------------------------------ */

function renderDna(record) {
  const round = activeRound(record);
  const host = $("#dna-out");
  if (!round || !round.story.resolvedTitle) { host.innerHTML = ""; return; }

  const read = A.readStory(round);
  const head =
    '<div class="dna-head"><p class="t">' + esc(round.story.resolvedTitle) + '</p>' +
    '<p class="k">' + esc(round.story.kind) + "</p></div>" +
    '<p class="dna-summary">' + esc(A.storySummary(round)) + "</p>";

  const selfForm = round.story.source === "self"
    ? '<div class="card"><h3>Map it yourself</h3>' +
      "<p class=\"lede\">This one is not in the reference set, which changes nothing about the method. Put one line against each process and the read assembles.</p>" +
      PROCESS_ORDER.map(code =>
        '<div class="field"><label for="self-' + code + '">' + code + ". " + esc(PROCESSES[code].name) + "</label>" +
        '<p class="hint">' + esc(PROCESSES[code].def) + "</p>" +
        '<input type="text" id="self-' + code + '" data-self="' + code + '" autocomplete="off" value="' +
        esc(round.story.self[code] || "") + '" placeholder="One line from your story." /></div>').join("") +
      '<button class="btn primary" id="save-self">Update the read</button></div>'
    : "";

  const matrix = '<div class="matrix">' + read.map(block =>
    '<div class="mstage"><div class="left">' +
      '<p class="num">STAGE ' + block.stage.n + "</p>" +
      '<p class="name">' + esc(block.stage.name) + "</p>" +
      block.processes.map(p =>
        '<p class="proc"><span class="code">' + p.code + '</span><span class="pname">' + esc(p.name) + "</span></p>").join("") +
    "</div><div class=\"right\">" +
      '<p><span class="phase">Phase 1 — your story in this stage</span>' + esc(block.phase1) + "</p>" +
      block.processes.map(p =>
        '<p class="p2"><span class="phase">Phase 2 — process ' + p.code + "</span>" + esc(p.phase2) + "</p>").join("") +
    "</div></div>").join("") + "</div>";

  host.innerHTML = head + selfForm + matrix;

  $$("[data-self]").forEach(inp => inp.addEventListener("input", () => {
    const code = inp.dataset.self;
    store.set(rec => {
      const r = activeRound(rec);
      r.story.self[code] = inp.value;
      r.vector = A.storyVector(r);
    });
  }));
  const save = $("#save-self");
  if (save) save.addEventListener("click", () => { render(store.get()); toast("Read updated"); });
}

/* ------------------------------------------------------------------ */
/* Step 3 — multivariate analysis                                      */
/* ------------------------------------------------------------------ */

function renderMva(record) {
  const round = activeRound(record);
  const host = $("#mva-out");
  if (!round) { host.innerHTML = ""; return; }

  const hasAnswers = QIDS.some(id => String(round.answers[id] || "").trim());
  const aVec = hasAnswers ? A.answerVector(round.answers) : null;
  const ix = A.indices(round.vector);

  const series = [{ key: "story", label: round.story.resolvedTitle, colorVar: "--series-1", vector: round.vector }];
  if (aVec) series.push({ key: "answers", label: "Your six answers", colorVar: "--series-2", vector: aVec });

  const points = [{ id: round.id, label: round.story.resolvedTitle, kind: "story", vector: round.vector }];
  if (aVec) points.push({ id: round.id + "-a", label: "Your answers", kind: "answers", vector: aVec });
  record.rounds.filter(r => r.id !== round.id && r.story.resolvedTitle).forEach(r => {
    points.push({ id: r.id, label: r.story.resolvedTitle, kind: "story", vector: r.vector });
  });

  const projection = A.project(points);
  const axisNames = { pc1: A.axisLabel(projection.axes.pc1.loadings), pc2: A.axisLabel(projection.axes.pc2.loadings) };

  host.innerHTML =
    '<div class="card"><h3>a · Input loaded</h3>' +
      '<div class="readout">' +
        stat("Story", esc(round.story.resolvedTitle), esc(round.story.kind)) +
        stat("Source", round.story.source === "corpus" ? "Reference set" : "Your own map", CORPUS.length + " stories in the set") +
        stat("Six answers", hasAnswers ? QIDS.filter(id => String(round.answers[id] || "").trim()).length + " of 6" : "none yet", "added as you go") +
        stat("Rounds", String(record.rounds.length), "in this record") +
      "</div>" +
      (round.story.note ? "<p class=\"lede\" style=\"margin:0\">Your note: “" + esc(round.story.note) + "”</p>" : "") +
    "</div>" +

    '<div class="card"><h3>b · Multivariate information</h3>' +
      '<div class="readout">' +
        stat("Stasis", ix.stasis + "/100", "processes A and E") +
        stat("Collapse", ix.collapse + "/100", "processes B and C") +
        stat("Cage", ix.cage + "/100", "processes D and E") +
        stat("Agency", ix.agency + "/100", "process F") +
      "</div>" +
      '<figure class="chart-fig"><div class="chart-scroll" id="bars-slot"></div>' +
      "<figcaption>Process intensity, 0–100. " +
      (aVec ? "Your story and your six answers, side by side." : "Your story. Your answers join this chart once you have written them.") +
      "</figcaption></figure>" +
      '<div id="bars-legend"></div>' +
      tableView(series) +
    "</div>" +

    '<div class="card"><h3>c · Plotted data — the full set</h3>' +
      "<p class=\"lede\">Every story in the reference set, plotted on the two components that carry most of the variation across all six processes. " +
      "Together these two axes hold " + Math.round((projection.axes.pc1.share + projection.axes.pc2.share) * 100) + "% of it. " +
      "Yours is added without moving anything already on the map.</p>" +
      '<figure class="chart-fig"><div class="chart-scroll" id="map-slot"></div>' +
      "<figcaption>Horizontal: more " + esc(axisNames.pc1.positive) + " to the right. Vertical: more " + esc(axisNames.pc2.positive) + " upward.</figcaption></figure>" +
      '<div id="map-legend"></div>' +
    "</div>";

  $("#bars-slot").appendChild(processBars(series));
  if (series.length > 1) {
    $("#bars-legend").appendChild(legend([
      { label: round.story.resolvedTitle, color: "#3987e5" },
      { label: "Your six answers", color: "#d95926" }
    ]));
  }
  $("#map-slot").appendChild(corpusMap(projection, axisNames));
  $("#map-legend").appendChild(legend([
    { label: "The reference set", color: "#71808f", round: true, faded: true },
    { label: "Your story", color: "#3987e5", round: true }
  ].concat(aVec ? [{ label: "Your answers", color: "#d95926", round: true }] : [])));
}

function stat(lab, val, sub) {
  return '<div class="stat"><p class="lab">' + lab + '</p><p class="val">' + val + '</p><p class="sub">' + sub + "</p></div>";
}

function tableView(series) {
  return '<table class="data"><caption class="sr-only">Process intensities</caption><thead><tr><th>Process</th>' +
    series.map(s => "<th>" + esc(s.label) + "</th>").join("") + "</tr></thead><tbody>" +
    PROCESS_ORDER.map(code =>
      '<tr><td class="name">' + code + " · " + esc(PROCESSES[code].name) + "</td>" +
      series.map(s => '<td class="n">' + (Number(s.vector[code]) || 0) + "</td>").join("") + "</tr>").join("") +
    "</tbody></table>";
}

/* ------------------------------------------------------------------ */
/* Step 4 — the six questions                                          */
/* ------------------------------------------------------------------ */

function renderQuestions(record) {
  const round = activeRound(record);
  const host = $("#questions-out");
  if (!round) { host.innerHTML = ""; return; }

  host.innerHTML = CONTENT.questions.map((q, i) =>
    '<div class="q"><p class="qn">Q' + (i + 1) + "</p>" +
    '<p class="qt">' + esc(q.title) + "</p>" +
    (q.sub ? '<p class="qs">' + esc(q.sub) + "</p>" : "") +
    '<label class="sr-only" for="' + q.id + '">' + esc(q.title) + "</label>" +
    '<textarea id="' + q.id + '" data-q="' + q.id + '" rows="2" placeholder="A sentence is a complete answer.">' +
    esc(round.answers[q.id] || "") + "</textarea>" +
    '<p class="count" data-count="' + q.id + '"></p></div>').join("");

  $$("[data-q]").forEach(ta => {
    const paint = () => {
      const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
      $('[data-count="' + ta.dataset.q + '"]').textContent = n + (n === 1 ? " word" : " words");
    };
    paint();
    ta.addEventListener("input", () => {
      paint();
      store.set(rec => { activeRound(rec).answers[ta.dataset.q] = ta.value; });
    });
  });

  const res = $("#six-response");
  const p = roundProgress(round, QIDS);
  if (p.answered && $("#six-response").dataset.shown === round.id) renderSixResponse(record);
  else res.innerHTML = "";
}

function renderSixResponse(record) {
  const round = activeRound(record);
  const out = A.readSix(round);
  const res = $("#six-response");
  res.dataset.shown = round.id;
  res.innerHTML = '<div class="echo"><h3>What the six answers show</h3>' +
    out.responses.map(r =>
      "<p><b>" + esc(r.stage.name) + ".</b> " + esc(r.text) + "</p>").join("") +
    "<p class=\"quiet\">Your answers are now plotted alongside the story in the multivariate step.</p>" +
    (roundProgress(round, QIDS).sixDone
      ? '<div class="cta"><button class="btn primary" data-go="seventh">Go to the seventh question</button></div>'
      : "<p class=\"quiet\">Fill the rest when you are ready — the seventh question opens once all six are in.</p>") +
    "</div>";
  wireGo();
}

/* ------------------------------------------------------------------ */
/* Step 5 — the seventh question                                       */
/* ------------------------------------------------------------------ */

function renderSeventh(record) {
  const round = activeRound(record);
  const host = $("#seventh-out");
  if (!round) { host.innerHTML = ""; return; }

  host.innerHTML =
    '<div class="q"><p class="qn">' + esc(CONTENT.seventhLabel) + "</p>" +
    '<p class="qt">' + esc(CONTENT.seventhQuestion) + "</p>" +
    '<label class="sr-only" for="q7">' + esc(CONTENT.seventhQuestion) + "</label>" +
    '<textarea id="q7" rows="3" placeholder="Optional. Nothing here is sent anywhere.">' + esc(round.seventh || "") + "</textarea>" +
    "</div>" +
    '<div class="cta"><button class="btn primary" id="finish-round">Close this round</button></div>';

  $("#q7").addEventListener("input", e => {
    store.set(rec => { activeRound(rec).seventh = e.target.value; });
  });
  $("#finish-round").addEventListener("click", () => {
    store.set(rec => { activeRound(rec).completedAt = Date.now(); });
    render(store.get());
    go("close", store.get());
  });
}

/* ------------------------------------------------------------------ */
/* Step 6 — the close, and the next story                              */
/* ------------------------------------------------------------------ */

function renderClose(record) {
  const round = activeRound(record);
  const host = $("#close-out");
  if (!round || !round.completedAt) { host.innerHTML = ""; return; }

  host.innerHTML =
    "<h2>That is the round</h2>" +
    '<div class="echo">' + A.closeText(record, round).map(l => "<p>" + esc(l) + "</p>").join("") + "</div>" +
    '<div class="card"><h3>' + esc(CONTENT.addStoryLabel) + "</h3>" +
    "<p class=\"lede\">The set reads better with more than one story in it. Add another whenever you like — the first round stays exactly as it is.</p>" +
    '<div class="field"><label for="next-story">' + esc(CONTENT.storyInputLabel) + "</label>" +
    '<input type="text" id="next-story" autocomplete="off" placeholder="Another story you love" /></div>' +
    '<button class="btn primary" id="add-story">' + esc(CONTENT.addStoryLabel) + "</button></div>";

  $("#add-story").addEventListener("click", () => {
    const t = $("#next-story").value.trim();
    if (!t) { toast("Name a story first"); return; }
    $("#story-title").value = t;
    $("#story-note").value = "";
    $("#story-reveal").hidden = false;
    runDna();
  });
}

/* ------------------------------------------------------------------ */
/* Render + wiring                                                     */
/* ------------------------------------------------------------------ */

export function render(record) {
  renderDna(record);
  renderMva(record);
  renderQuestions(record);
  renderSeventh(record);
  renderClose(record);
  paintRail(record);
  wireGo();
}

function wireGo() {
  $$("[data-go]").forEach(b => {
    if (b.dataset.wired) return;
    b.dataset.wired = "1";
    b.addEventListener("click", () => go(b.dataset.go, store.get()));
  });
}

export function wire() {
  $("#open-story").addEventListener("click", () => {
    $("#story-reveal").hidden = false;
    $("#open-story").hidden = true;
    $("#story-title").focus();
  });

  $("#story-title").addEventListener("input", e => paintTypeahead(e.target.value));
  $("#story-title").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); runDna(); } });
  document.addEventListener("click", e => {
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      $("#story-reveal").hidden = false;
      $("#open-story").hidden = true;
      pickTitle(pick.dataset.pick);
      return;
    }
    if (!e.target.closest("#typeahead") && !e.target.closest("#story-title")) $("#typeahead").hidden = true;
  });

  $("#find-dna").addEventListener("click", runDna);
  $("#submit-six").addEventListener("click", () => {
    const round = activeRound(store.get());
    if (!round) return;
    if (!QIDS.some(id => String(round.answers[id] || "").trim())) { toast("Write at least one answer"); return; }
    renderSixResponse(store.get());
    renderMva(store.get());
    paintRail(store.get());
    $("#six-response").scrollIntoView({ block: "start" });
  });

  $("#story-file").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const res = await store.readTitleFromFile(file);
      if (res.record) { render(store.get()); toast("Record loaded"); return; }
      $("#story-title").value = res.title;
      if (res.note) $("#story-note").value = res.note;
      toast("Loaded from file");
    } catch (err) { toast(err.message); }
  });

  $("#export").addEventListener("click", () => { store.exportFile(); toast("Record saved to your device"); });
  $("#import-open").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { await store.importFile(file); render(store.get()); toast("Record loaded"); }
    catch (err) { toast(err.message); }
  });

  $("#clear-record").addEventListener("click", () => {
    if (!confirm("Delete every story, answer and note in this browser? This cannot be undone.")) return;
    store.reset();
    $("#story-title").value = "";
    $("#story-note").value = "";
    $("#six-response").dataset.shown = "";
    render(store.get());
    go("story", store.get());
    toast("Record cleared");
  });
}
