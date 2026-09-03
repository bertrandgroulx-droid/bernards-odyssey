# 🏛️ Bernard's Odyssey

**Storytelling is a survival tool. Homer's maritime terrain is the baseline; your situation is the instance.**

A single-file, dependency-free web app running the *Universal Storytelling System (Homeric Baseline)*:
one `index.html`, no build step, no API keys, no network calls. Everything you type stays in your own
browser.

## Why it works

1. **Narrative is a survival mechanism.** Before writing, the only way to transmit what kills you and
   what saves you was a story a person could carry on foot. The teaching is the payload; the plot is
   the packaging that survives the journey.
2. **Stories are selected, like DNA.** A story lasts three thousand years only if it keeps teaching
   something necessary. The *Odyssey* is not preserved because it is old — it is old because it kept
   being needed, and the same structure re-instantiates in every era with new props.
3. **Rehearsal rewires.** A story run repeatedly through a nervous system trains the response before
   the event. Good stories produce better adapters, by pre-loading a pattern for terrain you have not
   met yet.

Which is why the app sequences **recognition first, then the questions**: you find your own terrain in
the ledger before anything personal is asked, so the connection is made before it is examined.

## How it runs — four steps, in order

### 1 · Name a story you love

Not a story about you. A film, a novel, a myth, a series — anything you have returned to more than
once. Up to three. Stories that last are carrying something; the first job is to find out what yours
is carrying.

### 2 · Its Cultural DNA

The app reads your story against the Homeric baseline and shows the five elements inside it:

| Element | Homeric baseline |
| --- | --- |
| The trapped state of stasis | Lotus-Eater Island |
| The medium of transit | The wooden ship |
| The formless terrain | The maritime void |
| The sovereign threat | The cave of Polyphemus |
| The tool of pure agency | The bow of Odysseus |

A corpus of **41 durable stories** is mapped element by element, with a four-phase reading and the
archetypal posture its protagonist runs. Story not in the corpus? Five fields let you map it yourself
against the same baseline — the method does not depend on the library.

Name two or three and you get **the shared strand**: the posture you chose more than once, and the
vocabulary your stories have in common. That part is not a fact about the stories. It is a fact about
the reader.

### 3 · The six questions

Only now does the app ask about you — the same five elements, on your own terrain: the original
ambition, the comfortable box, the sudden shock, the ruminating loop, the executive decision, the
daily practice.

Each question offers three **sentence stems** you can click to seed the box, and a **worked answer**
from someone in a situation like yours (work, a stalled project, a relationship, a rupture, or
someone else's story). A sentence is enough, questions can be skipped, and *"I don't know"* is read
as a position rather than an absence.

### 4 · The seventh question

It appears only once all six are answered, and it is the one that isolates the blind spot: *which of
these six felt hardest to answer honestly?* The mirror leads with whichever you name and weights its
whole reading toward it.

Then the mirror returns four compressed sections: **the ledger filled**, **the Homeric archetypal
mirror** (Penelope at the loom, Patroclus in another's armour, Elpenor on the roof, Ajax son of
Oileus, or Odysseus at the mast — scored from your own text and cited), **the four-part lifecycle**
(Map, Collision, Armor, Exit), and **the blind spot with one question left open**.

No diagnosis. No plan. No checklist. **Copy full prompt** exports your answers wrapped in the system
prompt if you want the same analysis run through a model.

## Further instruments

Available after the mirror, not competing with it:

- **Lotus Island** — four questions on the shape of your stasis, plus the ten sentences people say on
  the island.
- **The Anchors** — eight forced-choice questions reading one person against the five postures, for
  you or your partner, with pairing analysis across all fifteen combinations.
- **The Drift** — every reading stored with its date and measurable signals, and what moved between
  the first and the latest. Rehearsal is a claim about repetition; one reading proves nothing.

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

- Single `index.html`, ~3,250 lines, zero dependencies and zero network requests.
- State (answers, named elements, stored readings, reflections) persists in `localStorage` only.
- Responsive, keyboard-navigable tabs, and honours `prefers-reduced-motion`.
- A structured reflection instrument. Not therapy, diagnosis or treatment.
