#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");

const BASE = "270a4946b49adadb7245e9ee751a6cbd08891a15";
const PLAN = "docs/japanese-jlpt-batch17c5-expansion-quota-plan.md";
const CHECKER = "scripts/check-japanese-jlpt-batch17c5-expansion-quota-plan.js";
const ALLOWED = new Set([PLAN, CHECKER]);
let failed = false;

function check(condition, message) {
  if (!condition) {
    failed = true;
    console.error(`FAIL: ${message}`);
  }
}
function read(path) {
  return fs.readFileSync(path, "utf8");
}
function json(path) {
  return JSON.parse(read(path));
}
function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function lines(output) {
  return output ? output.split("\n").filter(Boolean) : [];
}
function countBy(items, field) {
  return Object.fromEntries(
    [...new Set(items.map((item) => item[field]))].map((value) => [
      value,
      items.filter((item) => item[field] === value).length,
    ]),
  );
}
function extractFunction(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`function ${nextName}`, start);
  check(start >= 0 && end > start, `cannot extract ${name}`);
  return start >= 0 && end > start ? source.slice(start, end) : "";
}

// Baseline and scope: the merge commit is PR #288, and this batch is additive only.
check(git("merge-base", "HEAD", BASE) === BASE, "HEAD must contain merged PR #288 baseline");
const changed = new Set([
  ...lines(git("diff", "--name-only", BASE)),
  ...lines(git("diff", "--cached", "--name-only")),
  ...lines(git("diff", "--name-only")),
  ...lines(git("ls-files", "--others", "--exclude-standard")),
]);
for (const path of changed) check(ALLOWED.has(path), `disallowed Batch 17C-5 path: ${path}`);
for (const path of ALLOWED) check(changed.has(path), `required new file missing from diff: ${path}`);
for (const path of ALLOWED)
  check(!lines(git("ls-tree", "-r", "--name-only", BASE, "--", path)).includes(path), `${path} must be newly added`);

const plan = read(PLAN);
const script = read("script.js");
const html = read("japanese/index.html");

// PR #288 runtime/data invariants.
[
  "getJapaneseJlptRandomIndex",
  "shuffleJapaneseJlptArray",
  "createBalancedJapaneseJlptAnswerPositions",
  "randomizeJapaneseJlptQuestionOptions",
].forEach((name) => check(script.includes(`function ${name}`), `PR #288 helper missing: ${name}`));
check(
  extractFunction(script, "getJapaneseJlptRandomIndex", "shuffleJapaneseJlptArray").includes("crypto.getRandomValues"),
  "JLPT random source must remain crypto.getRandomValues",
);
const start = extractFunction(script, "startJapaneseJlptMock", "returnToJapaneseJlptSetup");
check(start.includes('selectedJapaneseJlptLevel === "N4" ? 34 : 20'), "PR #288 N5/N4 baseline count guard missing");
check(
  start.indexOf("const questionSnapshots") < start.indexOf("createBalancedJapaneseJlptAnswerPositions") &&
    start.indexOf("createBalancedJapaneseJlptAnswerPositions") < start.indexOf("randomizeJapaneseJlptQuestionOptions"),
  "snapshot/balance/option sequencing regressed",
);
check(html.includes("../script.js?v=3.7"), "current script cache token missing");

// Dynamic repository inventory.
const jlpt = json("japaneseJlptVocabularyGrammarQuestions.json").questions;
const reading = json("japaneseJlptReadingQuestions.json");
const composition = json("japaneseSentenceCompositionQuestions.json");
const vocabulary = json("vocabulary.json");
const grammar = json("grammar.json");
const listeningStart = script.indexOf("const JAPANESE_LISTENING_QUESTIONS =");
const listeningEnd = script.indexOf("const LISTENING_QUIZ_SIZE", listeningStart);
check(listeningStart >= 0 && listeningEnd > listeningStart, "cannot extract listening bank");
const listeningContext = {};
vm.createContext(listeningContext);
vm.runInContext(`${script.slice(listeningStart, listeningEnd)};this.items=JAPANESE_LISTENING_QUESTIONS;`, listeningContext);
const listening = listeningContext.items;

const bucketStats = {};
for (const [bucket, types] of Object.entries(reading.typeToSection)) {
  const sets = reading.readingSets.filter((set) => types.includes(set.type));
  bucketStats[`${bucket}_sets`] = sets.length;
  bucketStats[`${bucket}_questions`] = sets.reduce((total, set) => total + set.questions.length, 0);
}
const active = reading.selectionProfiles.N4.initial;
const actualInventory = {
  jlptVocabularyGrammar: {
    total: jlpt.length,
    N5: jlpt.filter((q) => q.level === "N5").length,
    N4: jlpt.filter((q) => q.level === "N4").length,
    N5_vocabulary_meaning: jlpt.filter((q) => q.level === "N5" && q.section === "vocabulary" && q.questionType === "meaning").length,
    N5_grammar_meaning: jlpt.filter((q) => q.level === "N5" && q.section === "grammar" && q.questionType === "meaning").length,
    N5_grammar_cloze: jlpt.filter((q) => q.level === "N5" && q.section === "grammar" && q.questionType === "cloze").length,
    N4_vocabulary_meaning: jlpt.filter((q) => q.level === "N4" && q.section === "vocabulary" && q.questionType === "meaning").length,
    N4_grammar_meaning: jlpt.filter((q) => q.level === "N4" && q.section === "grammar" && q.questionType === "meaning").length,
    N4_grammar_cloze: jlpt.filter((q) => q.level === "N4" && q.section === "grammar" && q.questionType === "cloze").length,
  },
  jlptReading: {
    N5_sets: reading.availability.N5.setCount,
    N5_questions: reading.availability.N5.questionCount,
    N4_sets: reading.readingSets.filter((set) => set.level === "N4").length,
    N4_questions: reading.readingSets.filter((set) => set.level === "N4").reduce((n, set) => n + set.questions.length, 0),
    ...bucketStats,
    active_N4_sets: active.setIds.length,
    active_N4_questions: active.questionCount,
  },
  sentenceComposition: { total: composition.length, ...countBy(composition, "level") },
  listening: { total: listening.length, ...countBy(listening, "level") },
  sourceBanks: {
    vocabulary_total: vocabulary.length,
    vocabulary_N5: vocabulary.filter((q) => q.level === "N5").length,
    vocabulary_N4: vocabulary.filter((q) => q.level === "N4").length,
    grammar_total: grammar.length,
    grammar_N5: grammar.filter((q) => q.level === "N5").length,
    grammar_N4: grammar.filter((q) => q.level === "N4").length,
  },
};
const inventoryMatch = plan.match(/<!-- INVENTORY_JSON_START\s*([\s\S]*?)\s*INVENTORY_JSON_END -->/);
check(inventoryMatch, "machine-readable inventory block missing from plan");
if (inventoryMatch) {
  let recorded;
  try {
    recorded = JSON.parse(inventoryMatch[1]);
  } catch (error) {
    check(false, `plan inventory JSON invalid: ${error.message}`);
  }
  if (recorded) check(JSON.stringify(recorded) === JSON.stringify(actualInventory), "plan inventory differs from dynamically computed repository inventory");
}
check(composition.every((q) => q.uniqueAnswerReviewed === true), "sentence composition unique-answer guarantee regressed");

// The source reading file must dynamically agree with its derived bank.
const readingContext = { window: {} };
vm.createContext(readingContext);
vm.runInContext(read("japaneseReadingQuestions.js"), readingContext);
const sourceReading = readingContext.window.JAPANESE_READING_SETS;
check(sourceReading.length === reading.readingSets.length, "source/derived reading set count mismatch");
check(
  sourceReading.reduce((n, set) => n + set.questions.length, 0) === actualInventory.jlptReading.N4_questions,
  "source/derived reading question count mismatch",
);

// Planning contract coverage (semantic markers, not hard-coded inventory validation).
const requiredMarkers = [
  "Question Type Matrix", "profileVersion", "level total", "section total", "questionType quota",
  "Insufficient-pool policy", "crypto.getRandomValues", "無放回抽樣", "immutable", "sourceQuestionId",
  "QUESTION SELECTION → SESSION SNAPSHOT → BALANCED ANSWER POSITION GENERATION → OPTION RANDOMIZATION",
  "同 session", "重新無放回抽取", "N5 是真正 0 組／0 題", "uniqueAnswerReviewed",
  'section="listening"', "Batch 17C-6", "Batch 17C-7", "Batch 17C-8", "Batch 17C-9",
  "Batch 17C-10", "Batch 17D-1", "Batch 17D-2", "Batch 17D-3", "Batch 17E-1", "Batch 17E-2", "Batch 17E-3",
];
requiredMarkers.forEach((marker) => check(plan.includes(marker), `planning marker missing: ${marker}`));
[
  "自動縮減", "借 N4", "複製題", "略過 section", "silent fallback", "不建立半個 session",
].forEach((idea) => check(plan.includes(idea), `insufficient-pool safeguard missing: ${idea}`));

// Regression protection: only new documentation/check logic, with no persistence or cache edits.
const additions = git("diff", "--unified=0", BASE, "--", PLAN, CHECKER);
[
  /localStorage\s*\.(?:setItem|removeItem|clear)/,
  /sessionStorage\s*\.(?:setItem|removeItem|clear)/,
  /indexedDB\s*\.open/,
].forEach((pattern) => check(!pattern.test(additions), `forbidden persistence/cache implementation in new files: ${pattern}`));
check(!/(?:script|style)\.\w+\?v=[\w.-]+/.test(plan), "plan must not introduce a cache-token edit");
const protectedPaths = [
  "script.js", "style.css", "japanese/index.html", "vocabulary.json", "grammar.json",
  "japaneseReadingQuestions.js", "japaneseSentenceCompositionQuestions.json",
  "japaneseJlptVocabularyGrammarQuestions.json", "japaneseJlptReadingQuestions.json",
  "japaneseJlptKanjiPolicy.json", "japaneseJlptReadingPolicy.json",
];
protectedPaths.forEach((path) => check(!changed.has(path), `protected runtime/data path changed: ${path}`));
check(
  ![...changed].some((path) => path.startsWith("scripts/check-") && path !== CHECKER),
  "historical checker changed or weakened",
);

if (failed) process.exit(1);
console.log("PASS: Batch 17C-5 expansion/quota planning, inventory, scope, and regression checks passed.");
