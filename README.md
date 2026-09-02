# 🏛️ Bernard's Odyssey

**Storytelling is a survival tool. Homer's maritime terrain is the baseline; your situation is the instance.**

A single-file, dependency-free web app running the *Universal Storytelling System (Homeric Baseline)*:
one `index.html`, no build step, no API keys, no network calls. Everything you type stays in your own
browser.

Every resilient narrative maps onto a single structural continuum. The technological **props** change
to match an era's lifestyle. The internal **cognitive geometry** does not.

## The five modules

### 🗺️ The Ledger — the Deep-Time Parallel Matrix

Five elements, each holding its function across three thousand years:

| Element | Homeric baseline | Function |
| --- | --- | --- |
| The Trapped State of Stasis | The amnesiac shores of Lotus-Eater Island | Comfort that neutralises the functional map |
| The Medium of Geographic Transit | The wooden sailing ship | The vehicle you must master but did not design |
| The Formless Dangerous Terrain | The untamed maritime void | Ground with no path — only bearings |
| The Sovereign Predatory Threat | The cave of Polyphemus | Raw devouring power, escaped by cunning |
| The Tool of Pure Agency | The heavy bow of Odysseus | High-friction mastery nobody can perform for you |

Switch the era — **Homeric / Hundred Acre Wood / Industrial / Corporate / Digital** — to see the same
geometry in different hardware, then name your own instance of each element.

### 🧭 The Audit — six questions, then the seventh

Delivered in two parts, as specified.

**Part One** is the six foundational questions that locate the breakdown in your current script: the
original ambition, the comfortable box, the sudden shock, the ruminating loop, the executive decision,
the daily practice.

**Part Two** unlocks once all six are answered, and asks the one question that isolates the blind spot:
*which of these six feels hardest to answer honestly right now?* The mirror leads with whichever
question you name, and weights its reading toward it.

The mirror is a local lexical engine — it reads what you actually wrote, not what you meant. It
weighs agency verbs against hedges, obligation against decision, first-person acts against third
parties, past-conditional turns, deferral markers, fixed-identity nouns, cadence markers, and shared
vocabulary between answers. Four compressed sections come back:

1. **The ledger, filled** — your five elements, named back to you
2. **The Homeric archetypal mirror** — your posture, matched to a figure in the epic
3. **The four-part lifecycle** — Map, Collision, Armor, Exit
4. **The blind spot** — the question you named, the probabilities, and one question left open

No diagnosis. No plan. No checklist. **Copy full prompt** exports your answers wrapped in the locked
system prompt if you want to run the same analysis through a model.

### 🌺 Lotus Island — the shape of your stasis

The crew was not imprisoned. They were fed something pleasant and stopped wanting to leave. Four
forced-choice questions sort the shore into **Provisioned** (material), **Named** (identity),
**Amnesiac** (relief on demand) or **Preparing** (deferral), plus a tally of the ten sentences people
say on the island.

### ⚓ The Anchors — five postures from the epic

| Pattern | Figure |
| --- | --- |
| The Stasis / Delay Loop | Penelope at the loom — weaving by day, unpicking by night |
| The Proxy Battle / Sacrificial Defence | Patroclus in another's armour |
| The Amnesiac Escape / Comfort Trap | Elpenor on Circe's roof |
| The Hubristic Defiance | Ajax son of Oileus, defying the gods on the rocks |
| The Bound Vigilance | Odysseus tied to the mast |

Eight forced-choice questions read one person against all five. None is the healthy one; each is a
survival strategy with a bill attached. Read yourself, then switch the subject and read your partner —
two stored readings unlock the **pairing** analysis across all fifteen combinations.

### 🍯 Worked Example — the Hundred Acre Wood

If the geometry is universal it holds on a narrative nobody would call heroic. Milne's wood is the
control case: the comparative alignment, the element mapping ledger against the Homeric baseline, the
four-part lifecycle, and the six-question audit — run end to end on Pooh, Piglet, Rabbit and Eeyore.

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

- Single `index.html`, ~2,100 lines, zero dependencies and zero network requests.
- State (answers, named elements, stored readings) persists in `localStorage` only.
- Responsive, keyboard-navigable tabs, and honours `prefers-reduced-motion`.
