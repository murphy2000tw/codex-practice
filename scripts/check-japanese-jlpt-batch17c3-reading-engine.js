#!/usr/bin/env node
"use strict";
const fs = require("fs");
const { execFileSync } = require("child_process");
const BASE = "9c203f1474475ddd2e4c25c6a7886458beafad89";
const ALLOWED = new Set(["japanese/index.html", "script.js", "scripts/check-japanese-jlpt-batch17c3-reading-engine.js", "docs/japanese-jlpt-batch17c3-reading-engine.md"]);
function fail(message) { console.error(`FAIL: ${message}`); process.exitCode = 1; }
function check(condition, message) { if (!condition) fail(message); }
function git(...args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }
function read(path) { return fs.readFileSync(path, "utf8"); }
check(git("merge-base", "HEAD", BASE) === BASE, "HEAD must descend from the Batch 17C-2 base commit");
const changed = git("diff", "--name-only", `${BASE}...HEAD`).split("\n").filter(Boolean);
for (const path of changed) check(ALLOWED.has(path), `disallowed changed file: ${path}`);
const html = read("japanese/index.html"); const script = read("script.js"); const doc = read("docs/japanese-jlpt-batch17c3-reading-engine.md");
check(html.includes('../japaneseJlptReadingQuestions.json?v=17c2'), "reading URL/token missing");
check(html.includes('../japaneseJlptVocabularyGrammarQuestions.json?v=17b1'), "vocabulary/grammar token changed");
check(html.includes('../script.js?v=3.6'), "script cache token is not v=3.6");
check(html.includes('../style.css?v=2.9') && html.includes('../japaneseReadingQuestions.js?v=1.0'), "protected cache token changed");
const baseScript = git("show", `${BASE}:script.js`);
function listeningArray(source) { const start = source.indexOf("const JAPANESE_LISTENING_QUESTIONS = ["); const end = source.indexOf("const LISTENING_QUIZ_SIZE", start); return source.slice(start, end); }
check(listeningArray(script) === listeningArray(baseScript), "embedded listening array changed");
[
  'JAPANESE_JLPT_READING_DATA_VERSION = "17c2-n4-reading-v1"', 'JAPANESE_JLPT_READING_POLICY_VERSION = "17c2-reading-internal-v1"',
  'JAPANESE_JLPT_READING_PROFILE_ID = "17c2-initial-fixed-v1"', 'profile.selectionMode !== "fixed-manifest"',
  'availability.N5.available !== false', 'availability.N4.setCount !== 105', 'questionCount !== 14', 'new Set(profile.setIds).size !== 10',
  'Promise.all([loadJapaneseJlptQuestionBank(), loadJapaneseJlptReadingBank()])', 'selectedJapaneseJlptLevel === "N5" || japaneseJlptReadingBank',
  'selectedJapaneseJlptLevel === "N4" && !japaneseJlptReadingBank', 'const expectedCount = selectedJapaneseJlptLevel === "N4" ? 34 : 20',
  'createJapaneseJlptReadingSnapshots', 'set.questions.map', 'rubyTerms: set.rubyTerms.map', 'createRubyPartsFromTerms(value, rubyTerms)',
  'button.type = "button"', 'feedback.setAttribute("aria-live", "polite")', 'question.passageKana', 'heading.focus()',
].forEach((needle) => check(script.includes(needle), `runtime contract marker missing: ${needle}`));
const ids = [...script.matchAll(/"jlpt-reading-set-n4-\d{3}"/g)].slice(0, 10).map((match) => JSON.parse(match[0]));
check(JSON.stringify(ids) === JSON.stringify(["jlpt-reading-set-n4-001","jlpt-reading-set-n4-002","jlpt-reading-set-n4-003","jlpt-reading-set-n4-016","jlpt-reading-set-n4-017","jlpt-reading-set-n4-026","jlpt-reading-set-n4-027","jlpt-reading-set-n4-031","jlpt-reading-set-n4-032","jlpt-reading-set-n4-015"]), "runtime manifest order changed");
const forbiddenJlptBlock = script.slice(script.indexOf("const JAPANESE_JLPT_LEVELS"), script.indexOf("window.showJapaneseContentView"));
["getReadingRubyTerms", "commonReadingRubyTerms", "vocabulary.json", "grammar.json", "japaneseReadingQuestions", "innerHTML", "Math.random", "localStorage", "sessionStorage", "indexedDB", "document.cookie"].forEach((token) => check(!forbiddenJlptBlock.includes(token), `forbidden JLPT runtime token: ${token}`));
check(forbiddenJlptBlock.indexOf('if (answer) {') < forbiddenJlptBlock.indexOf('question.passageKana'), "passageKana is not answer-gated");
["N5：20 題", "N4：34 題", "固定 10 組／14 題", "rubyTerms", "原始純文字", "passageKana", "分別 fetch、分別驗證", "不計分", "不計時", "非官方"].forEach((needle) => check(doc.includes(needle), `documentation marker missing: ${needle}`));
const data = JSON.parse(read("japaneseJlptReadingQuestions.json"));
check(data.schemaVersion === 1 && data.dataVersion === "17c2-n4-reading-v1" && data.policyVersion === "17c2-reading-internal-v1", "source reading data contract changed");
if (!process.exitCode) console.log("PASS: Batch 17C-3 N4 JLPT reading engine checks passed.");
