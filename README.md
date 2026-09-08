# 🐴 Trojan Horse

**Storytelling as a survival tool.**

Name a story you love. The app reads it against the Homeric baseline, shows the cultural DNA it
carries, and then asks you seven questions that link that story to your own experience.

No account, no password, no server. Everything you type stays in your browser, and you can save it to
a file you own or delete it in one click.

## The model

Every durable story runs on a **four-part survival framework** with **six process elements**. The
processes are structural actions, not characters — the engine never asks who the Cyclops in your life
is, because that reduces things like an economic shift or a private loop to a cartoon villain.

| Stage | Process |
| --- | --- |
| **1 · Constructed Illusion** | **A** Lotus Island Stasis |
| **2 · Collapse to Point Zero** | **B** The Open Sea Void · **C** The Crew's Mistake |
| **3 · Identity Cage** | **D** The Cyclops's Cave · **E** Circe's Sedative Stagnation |
| **4 · Act of Pure Agency** | **F** The Ship & Bow Navigation |

Each stage returns a two-phase response, each one a compressed paragraph of **25 words or fewer** —
never a seven-to-nine word fragment:

- **Phase 1** — how your story fits the mechanics of that stage.
- **Phase 2** — how the action lines up with the corresponding Homeric process.

## How it runs

1. **Your Story** — a prompt box opens a single input, *The Story You Love*, then **Find its DNA**.
   Typeahead over the reference set, a file loader, or type anything at all.
2. **Cultural DNA** — the four stages and six processes, filled in for your story. A story outside the
   reference set gets six one-line fields so you can map it yourself; the method does not depend on
   the library.
3. **Multivariate Analysis** — three parts: **(a)** the input loaded, **(b)** the six process
   intensities with derived stasis / collapse / cage / agency indices, and **(c)** the plotted data —
   the whole set projected onto its first two principal components, with your story and your answers
   added without moving anything already on the map.
4. **Six Questions** — your turn, with a short reading of what the answers show.
5. **The Seventh** — behind a plainly-worded note about professional help, privacy and ownership.
6. **Close** — a quiet read, then the option to add another story.

## Architecture

Plain ES modules, no build step, no dependencies. Each module has one job, so the corpus, the scoring
and the presentation can each be replaced without touching the others.

```
index.html               shell and stage markup
assets/css/app.css       one stylesheet, design tokens at the top
assets/js/
  content.js             the creator's fixed script — never rewritten by the engine
  model.js               schema, factories, validation, migrations
  store.js               localStorage, file export and import
  corpus.js              60 stories mapped to the four stages and six processes
  analysis.js            matching, the two-phase read, vectors, PCA
  charts.js              inline SVG charts with a hover layer
  ui.js                  views and interaction
  app.js                 bootstrap
```

**Data model.** One `Record` per browser holds an ordered list of `Round`s; a `Round` is one story
taken through DNA → six questions → seventh question. Every round carries a six-dimensional `Vector`
(one value per process), which is what the charts and the projection consume. Adding a process, a
stage or a field means editing `content.js` and `model.js` — the charts, the indices and the
projection all read the vector generically. Saved records carry a schema version and pass through a
migration chain on load, so old files keep working.

**Extending the corpus.** Append an entry to `CORPUS` in `corpus.js` — `id`, `t`, `alt[]`, `kind`,
`sum`, the six weights `w{A..F}`, four stage lines `s{1..4}` and six process clauses `p{A..F}`.
Nothing else changes: matching, plotting and the projection pick it up.

**Charts.** Two forms only — magnitude bars for the six processes, and a 2-D projection of the set.
The categorical colours are validated for the dark surface across all pairs (worst-pair CVD ΔE 9.4,
normal-vision ΔE 20.9), every chart has a hover layer, and the bar chart is paired with a table view.

## Run it

The app uses ES modules, so it needs to be served rather than opened from disk:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- No credentials, no network calls, no analytics.
- Responsive, keyboard-navigable, and honours `prefers-reduced-motion`.
- This is a story game. It is not therapy, diagnosis or treatment.
