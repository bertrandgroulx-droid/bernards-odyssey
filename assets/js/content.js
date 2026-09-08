/**
 * content.js — the creator's fixed script.
 *
 * Every string in this module is authored copy. The engine reads it and never
 * rewrites, paraphrases or trims it. Generated text lives in analysis.js and is
 * always rendered as a separate, clearly-marked block.
 *
 * To extend the app with new fixed copy, add it here and reference it by key.
 * Nothing outside this file should contain user-facing prose that the creator
 * wrote.
 */

export const CONTENT = Object.freeze({
  title: "Trojan Horse",
  subtitle: "Storytelling as a survival tool",

  intro: Object.freeze([
    "ANY STORY of surviving hardship, loss or melt-down - using your own personal knowledge, abilities, skills, or powers - carries the same literary DNA that goes back thousands of years to our ancient ancestors telling similar stories around the fire. Scenery, characters, and props have changed to match the storyteller’s lifestyle, but their cultural and psychological impact have not.",
    "Homer’s Iliad & Odyssey is a universal baseline for Stories that Survive because most people have been interested in them for thousands of years. The Odyssey is not preserved because it is old. It is old because it is still needed. Why is that?",
    "Because Homer’s stories perfectly capture civilization’s fundamental human struggle. Deciding how to live our lives. Take Your Story For Instance.",
    "The app runs in that order. You name any story. The app will show you the exact Homeric Cultural DNA it carries. Then you provide feedback to seven listed questions that link Homer’s story to your own Experiences."
  ]),

  storyBoxLabel: "1. Your Story",
  storyLede: "Name a story you love. Not a story about you. A film, a novel, a short story, a play, epic poem, myth, or a series. Something you’ve returned to. A STORY you’d defend at a dinner table. Stories that last are carrying something; My job is to find out what yours is carrying.",
  storyInputLabel: "The Story You Love",
  findDnaLabel: "Find its DNA",

  dnaTitle: "The Cultural DNA of your Story - Compare this against the Homeric baseline.",
  frameworkIntro: "Every durable STORY runs on the same four-part survival framework with six “activity or process” elements:",

  genericFrameworkTitle: "The four-part framework, in plain words",
  genericFramework: Object.freeze([
    ["Constructed Illusion", "You’re living inside a safe, comfortable bubble, following a script that makes you think you have everything figured out."],
    ["Collapse to Point Zero", "The bubble pops, reality breaks through, and the familiar things you used to rely on are stripped away until you are back at baseline."],
    ["Identity Cage", "You realize the defensive mask or identity you built to get by no longer helps, leaving you stuck in your own head repeating the same old loops."],
    ["Act of Pure Agency", "You step back from feeling like a helpless victim. You look at yourself honestly, take total ownership of your situation, and choose to rewrite your own script."]
  ]),

  sixQuestionsLabel: "Six Questions",
  questions: Object.freeze([
    { id: "q1", stage: 1, process: "A", title: "What is your dream or ambition?", sub: "The original ambition; the specific ideal outcome you’re hoping to achieve, maintain, or advance?" },
    { id: "q2", stage: 1, process: "A", title: "What’s holding you back?", sub: "" },
    { id: "q3", stage: 2, process: "B", title: "What shock, crisis, speed-bump intruding on your comfort zone?", sub: "" },
    { id: "q4", stage: 3, process: "D", title: "How do you let yourself become stuck?", sub: "In your head, motivation, energy, anxiety etc." },
    { id: "q5", stage: 4, process: "F", title: "What do you specifically need to do - or own - to become unstuck?", sub: "What choices are needed?" },
    { id: "q6", stage: 4, process: "F", title: "How are you using your resources to get unstuck?", sub: "Skills, knowledge, networks, alternative activities?" }
  ]),

  seventhLabel: "Q #7",
  seventhQuestion: "What have you lost that you are still mourning?",

  disclaimerTitle: "Before the last question",
  disclaimer: Object.freeze([
    "This is a story game, not care. It does not diagnose anything and it is not a substitute for a doctor, a therapist, or a counsellor. If any of this brings up something heavy, please talk to a professional — a GP, a licensed therapist, or your local crisis line. If you are in danger right now, contact your local emergency number.",
    "The last question is optional. You can read the close without answering it."
  ]),

  privacy: "Your words are yours. Everything you type stays in this browser — there is no account, no server, and nothing is uploaded. Saving a record writes a file to your own device; clearing the record deletes it here for good. You own what you write, and you can take it with you.",

  clearRecordLabel: "Clear the record",
  addStoryLabel: "Add your story",

  footer: "Trojan Horse — a story game. The pattern is older than the props."
});

/** The four lifecycle stages. Fixed script. */
export const STAGES = Object.freeze([
  { n: 1, key: "illusion", name: "Constructed Illusion",
    plain: "You’re living inside a safe, comfortable bubble, following a script that makes you think you have everything figured out.",
    processes: ["A"] },
  { n: 2, key: "collapse", name: "Collapse to Point Zero",
    plain: "The bubble pops, reality breaks through, and the familiar things you used to rely on are stripped away until you are back at baseline.",
    processes: ["B", "C"] },
  { n: 3, key: "cage", name: "Identity Cage",
    plain: "You realize the defensive mask or identity you built to get by no longer helps, leaving you stuck in your own head repeating the same old loops.",
    processes: ["D", "E"] },
  { n: 4, key: "agency", name: "Act of Pure Agency",
    plain: "You step back from feeling like a helpless victim. You look at yourself honestly, take total ownership of your situation, and choose to rewrite your own script.",
    processes: ["F"] }
]);

/**
 * The six subsumed processes. These are structural actions, not characters.
 * The engine is banned from asking "who is the Cyclops in your life" — the
 * process is the unit of analysis, never the cast.
 */
export const PROCESSES = Object.freeze({
  A: { code: "A", stage: 1, name: "Lotus Island Stasis",
       def: "Living inside a safe, comfortable bubble where the original mental map is neutralized by ease.",
       homeric: "the crew eats the lotus and stops asking about home" },
  B: { code: "B", stage: 2, name: "The Open Sea Void",
       def: "Getting hit by raw reality and losing all familiar external props or security blankets on the open, untamed water.",
       homeric: "the ship is driven past every landmark into open water" },
  C: { code: "C", stage: 2, name: "The Crew’s Mistake",
       def: "Making a bad miscalculation, human error, or short-sighted choice out of impatience that blows the entire trajectory off course into regret.",
       homeric: "the crew opens the bag of winds in sight of home" },
  D: { code: "D", stage: 3, name: "The Cyclops’s Cave",
       def: "Getting stuck inside your own head repeating loops, paralyzed by a predatory internal or environmental cage.",
       homeric: "the cave is shut by a stone no one inside can move" },
  E: { code: "E", stage: 3, name: "Circe’s Sedative Stagnation",
       def: "Settling for a comfortable holding pattern or routine that numbs your growth, stalling out because the routine protects you from immediate friction.",
       homeric: "a year passes on Circe’s island before anyone mentions leaving" },
  F: { code: "F", stage: 4, name: "The Ship & Bow Navigation",
       def: "Taking absolute ownership, executing focused internal mastery, handling the immediate tools, and physically rewriting your own script to find the way home.",
       homeric: "the raft is built by hand, and the bow is strung by the one man who trained for it" }
});

export const PROCESS_ORDER = Object.freeze(["A", "B", "C", "D", "E", "F"]);
