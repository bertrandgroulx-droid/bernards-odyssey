# 🏛️ Bernard's Odyssey

**Storytelling is a survival tool. Homer's maritime terrain is the baseline; your situation is the instance.**

A tiny, dependency-free web app that runs the *Universal Storytelling System (Homeric Baseline)*: a
single `index.html`, no build step, no API keys, no network calls. Everything you type stays in your
own browser.

Every durable narrative runs on one structural continuum. The technological **props** change to match
an era's lifestyle. The internal **cognitive geometry** does not.

## The four modules

### 🗺️ The Ledger — the Deep-Time Parallel Matrix

Five elements, each holding its function across three thousand years:

| Element | Homeric baseline | Function |
| --- | --- | --- |
| The Trapped State of Stasis | The amnesiac shores of Lotus-Eater Island | Comfort that deletes the memory of the destination |
| The Medium of Geographic Transit | The wooden sailing ship | The vehicle you must steer but do not own |
| The Formless Dangerous Terrain | The untamed maritime void | Ground with no path — only bearings |
| The Sovereign Predatory Threat | The cave of Polyphemus | Power that eats and does not negotiate |
| The Tool of Pure Agency | The heavy bow of Odysseus | High-friction mastery nobody can perform for you |

Switch the era — **Homeric / Industrial / Corporate / Digital** — to see the same geometry wearing
different hardware, then name your own instance of each element.

### 🧭 The Audit — six plain-spoken Socratic prompts

Six legs of a voyage: the dream, the box, the shock, the loop, the decision, the practice. Answer in
plain words, then **run the mirror**.

The mirror is a local lexical engine — it reads what you actually wrote, not what you meant. It
measures agency verbs against hedges, obligation against decision, first-person acts against third
parties, past-conditional turns, deferral markers, fixed-identity nouns, cadence markers, and shared
vocabulary between answers. It returns four compressed sections:

1. **The ledger, filled** — your five elements, named back to you
2. **The four-part lifecycle** — Map, Collision, Armor, Exit
3. **Probabilities and blind spots** — the localized loops the text gives away
4. **One question, left open** — ownership stays with you

No diagnosis. No plan. No checklist. **Copy full prompt** exports your answers wrapped in the locked
system prompt, if you want to run the same analysis through a model.

### 🌺 Lotus Island — the shape of your stasis

The crew was not imprisoned. They were fed something pleasant and stopped wanting to leave. Four
forced-choice questions sort the shore into one of four mechanisms — **Provisioned** (material),
**Named** (identity), **Amnesiac** (relief on demand), **Preparing** (deferral) — plus a tally of the
ten sentences people say on the island.

### ⚓ The Crew — Achilles, Odysseus, Penelope or Circe

Ten forced-choice questions read one person's survival strategy: the Absolutist, the Tactician, the
Holder, the Transformer. None is the healthy one; each is a strategy with a bill attached.

Read yourself, then switch the subject and read your partner — two stored readings unlock the
**pairing** analysis (all ten combinations).

## Run it

It's a static page, so just open it:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Single `index.html`, ~1,850 lines, zero dependencies and zero network requests.
- State (answers, named elements, crew readings) persists in `localStorage` only.
- Responsive, keyboard-navigable tabs, and honours `prefers-reduced-motion`.
