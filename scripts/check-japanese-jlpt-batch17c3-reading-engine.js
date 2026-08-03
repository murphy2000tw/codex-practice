#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { execFileSync } = require("child_process");

const BASE = "9c203f1474475ddd2e4c25c6a7886458beafad89";
const ALLOWED = new Set([
  "japanese/index.html",
  "script.js",
  "scripts/check-japanese-jlpt-batch17c3-reading-engine.js",
  "docs/japanese-jlpt-batch17c3-reading-engine.md",
]);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) fail(message);
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function pathsFrom(command) {
  const output = git(...command);
  return output ? output.split("\n") : [];
}

function functionBlock(source, functionName, nextFunctionName) {
  const start = source.indexOf(`function ${functionName}`);
  const end = source.indexOf(`function ${nextFunctionName}`, start);
  check(start >= 0 && end > start, `cannot locate ${functionName} runtime block`);
  return start >= 0 && end > start ? source.slice(start, end) : "";
}

check(git("merge-base", "HEAD", BASE) === BASE, "HEAD must descend from the Batch 17C-2 base commit");

const changed = new Set([
  ...pathsFrom(["diff", "--name-only", BASE]),
  ...pathsFrom(["diff", "--cached", "--name-only", BASE]),
  ...pathsFrom(["ls-files", "--others", "--exclude-standard"]),
]);
for (const path of changed) {
  check(ALLOWED.has(path), `disallowed committed, staged, unstaged, or untracked file: ${path}`);
}
for (const path of ALLOWED) {
  check(changed.has(path), `expected Batch 17C-3 file is not changed from base: ${path}`);
}

const html = read("japanese/index.html");
const script = read("script.js");
const doc = read("docs/japanese-jlpt-batch17c3-reading-engine.md");
const baseScript = git("show", `${BASE}:script.js`);

check(html.includes('../japaneseJlptReadingQuestions.json?v=17c2'), "reading URL/token missing");
check(html.includes('../japaneseJlptVocabularyGrammarQuestions.json?v=17b1'), "vocabulary/grammar token changed");
check(html.includes('../script.js?v=3.6'), "script cache token is not v=3.6");
check(html.includes('../style.css?v=2.9'), "stylesheet cache token changed");
check(html.includes('../japaneseReadingQuestions.js?v=1.0'), "existing reading-script token changed");

function listeningArray(source) {
  const start = source.indexOf("const JAPANESE_LISTENING_QUESTIONS = [");
  const end = source.indexOf("const LISTENING_QUIZ_SIZE", start);
  return source.slice(start, end);
}
check(listeningArray(script) === listeningArray(baseScript), "embedded listening array changed from base");

const validationBlock = functionBlock(script, "validateJapaneseJlptQuestionBank", "validateJapaneseJlptReadingBank");
[
  'question.section === "vocabulary"',
  'question.questionType === "meaning"',
  'question.section === "grammar"',
  'question.questionType === "cloze"',
  "vocabularyMeaning.length !== 10",
  "grammarMeaning.length !== 5",
  "grammarCloze.length !== 5",
  "question.options.length !== 4",
  "question.options.some",
  "Number.isInteger(question.answerIndex)",
  'typeof question.answerDisplay !== "object"',
  "isNonEmptyString(question.explanation)",
].forEach((needle) => check(validationBlock.includes(needle), `vocabulary/grammar validation missing: ${needle}`));

[
  'JAPANESE_JLPT_READING_DATA_VERSION = "17c2-n4-reading-v1"',
  'JAPANESE_JLPT_READING_POLICY_VERSION = "17c2-reading-internal-v1"',
  'JAPANESE_JLPT_READING_PROFILE_ID = "17c2-initial-fixed-v1"',
  'profile.selectionMode !== "fixed-manifest"',
  "availability.N5.available !== false",
  "availability.N5.setCount !== 0",
  "availability.N5.questionCount !== 0",
  "availability.N4.available !== true",
  "availability.N4.setCount !== 105",
  "availability.N4.questionCount !== 150",
  "new Set(profile.setIds).size !== 10",
  "questionCount !== 14",
  "Promise.all([",
  "loadJapaneseJlptQuestionBank()",
  "loadJapaneseJlptReadingBank()",
  'selectedJapaneseJlptLevel === "N5" || japaneseJlptReadingBank',
  'selectedJapaneseJlptLevel === "N4" && !japaneseJlptReadingBank',
  'selectedJapaneseJlptLevel === "N4" ? 34 : 20',
  "createJapaneseJlptReadingSnapshots",
  "set.questions.map",
  "rubyTerms: set.rubyTerms.map",
  "rubyCoverage:",
  "createRubyPartsFromTerms(value, rubyTerms)",
].forEach((needle) => check(script.includes(needle), `runtime contract marker missing: ${needle}`));

const expectedIds = [
  "jlpt-reading-set-n4-001",
  "jlpt-reading-set-n4-002",
  "jlpt-reading-set-n4-003",
  "jlpt-reading-set-n4-016",
  "jlpt-reading-set-n4-017",
  "jlpt-reading-set-n4-026",
  "jlpt-reading-set-n4-027",
  "jlpt-reading-set-n4-031",
  "jlpt-reading-set-n4-032",
  "jlpt-reading-set-n4-015",
];
const runtimeIds = [...script.matchAll(/"jlpt-reading-set-n4-\d{3}"/g)]
  .slice(0, 10)
  .map((match) => JSON.parse(match[0]));
check(JSON.stringify(runtimeIds) === JSON.stringify(expectedIds), "runtime manifest order changed");

const jlptStart = script.indexOf("const JAPANESE_JLPT_LEVELS");
const jlptEnd = script.indexOf("window.showJapaneseContentView", jlptStart);
check(jlptStart >= 0 && jlptEnd > jlptStart, "cannot locate JLPT runtime boundaries");
const jlptRuntime = script.slice(jlptStart, jlptEnd);
const forbiddenRuntimeTokens = [
  "Math.random",
  "innerHTML",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "document.cookie",
  "setInterval",
  "score",
  "percentage",
  "accuracy",
  "correctCount",
  "resultsPage",
  "成績頁",
  "addJapaneseMistake",
  "writeJapaneseMistake",
  "addJapaneseVocabulary",
  "writeJapaneseVocabulary",
  "startJapaneseListening",
  "renderJapaneseListening",
  "getReadingRubyTerms",
  "commonReadingRubyTerms",
  "vocabulary.json",
  "grammar.json",
  "japaneseReadingQuestions.js",
];
for (const token of forbiddenRuntimeTokens) {
  check(!jlptRuntime.includes(token), `forbidden JLPT runtime token: ${token}`);
}

const renderBlock = functionBlock(script, "renderJapaneseJlptQuestion", "renderJapaneseJlptCompletion");
const answerGateStart = renderBlock.indexOf("if (answer) {");
const answerGateEnd = renderBlock.indexOf("const next", answerGateStart);
check(answerGateStart >= 0 && answerGateEnd > answerGateStart, "cannot locate answer-gated feedback block");
const answerGate = renderBlock.slice(answerGateStart, answerGateEnd);
[
  '"正確答案"',
  "question.answerDisplay",
  "question.explanation",
  "question.passageKana",
].forEach((needle) => check(answerGate.includes(needle), `answer-only detail is not answer-gated: ${needle}`));
check(renderBlock.includes('document.createElement("button")'), "answer options are not native buttons");
check(renderBlock.includes('button.type = "button"'), "answer option button type missing");
check(renderBlock.includes("button.disabled = Boolean(answer)"), "answered options are not disabled");
check(renderBlock.includes('feedback.setAttribute("aria-live", "polite")'), "feedback aria-live missing");
check(renderBlock.includes("heading.focus()"), "new-question focus handling missing");

const completionBlock = functionBlock(script, "renderJapaneseJlptCompletion", "advanceJapaneseJlptQuestion");
check(completionBlock.includes("heading.focus()"), "completion focus handling missing");

const panelBlock = functionBlock(script, "renderJapaneseJlptPanel", "selectJapaneseJlptLevel");
check(panelBlock.includes('selectedJapaneseJlptLevel === "N5" || japaneseJlptReadingBank'), "N5 is not isolated from reading failure");
check(panelBlock.includes("japaneseJlptReadingLoadError"), "N4 reading failure is not displayed");
const startBlock = functionBlock(script, "startJapaneseJlptMock", "returnToJapaneseJlptSetup");
check(startBlock.includes('selectedJapaneseJlptLevel === "N4" && !japaneseJlptReadingBank'), "N4 can start without the reading bank");

[
  "N5：20 題",
  "N4：34 題",
  "固定 10 組／14 題",
  "rubyTerms",
  "原始純文字",
  "passageKana",
  "分別 fetch、分別驗證",
  "不計分",
  "不計時",
  "非官方",
].forEach((needle) => check(doc.includes(needle), `documentation marker missing: ${needle}`));

const data = JSON.parse(read("japaneseJlptReadingQuestions.json"));
check(data.schemaVersion === 1, "source reading schema changed");
check(data.dataVersion === "17c2-n4-reading-v1", "source reading data version changed");
check(data.policyVersion === "17c2-reading-internal-v1", "source reading policy version changed");

if (!process.exitCode) {
  console.log("PASS: Batch 17C-3 N4 JLPT reading engine checks passed.");
}
