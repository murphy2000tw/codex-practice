#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");

const BASE = "ec40572cf5c676c3b2262516cf8ccd99751c1d30";
const ALLOWED = new Set([
  "script.js",
  "japanese/index.html",
  "scripts/check-japanese-jlpt-batch17c4-answer-randomization.js",
  "docs/japanese-jlpt-batch17c4-answer-randomization.md",
]);
let failed = false;
function check(condition, message) {
  if (!condition) {
    failed = true;
    console.error(`FAIL: ${message}`);
  }
}
function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function paths(args) {
  const output = git(...args);
  return output ? output.split("\n") : [];
}
function read(path) {
  return fs.readFileSync(path, "utf8");
}
function block(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`function ${nextName}`, start);
  check(start >= 0 && end > start, `cannot extract ${name}`);
  return start >= 0 && end > start ? source.slice(start, end) : "";
}

check(git("merge-base", "HEAD", BASE) === BASE, `HEAD must contain BASE ${BASE}`);
const changed = new Set([
  ...paths(["diff", "--name-only", BASE]),
  ...paths(["diff", "--cached", "--name-only"]),
  ...paths(["diff", "--name-only"]),
  ...paths(["ls-files", "--others", "--exclude-standard"]),
]);
for (const path of changed) check(ALLOWED.has(path), `disallowed changed file: ${path}`);
for (const path of ALLOWED) check(changed.has(path), `required changed file missing: ${path}`);

const script = read("script.js");
const html = read("japanese/index.html");
const baseScript = git("show", `${BASE}:script.js`);
check(html.includes('../script.js?v=3.7'), "script cache token must be v=3.7");
[
  '../style.css?v=2.10',
  '../japaneseReadingQuestions.js?v=1.0',
  '../japaneseJlptVocabularyGrammarQuestions.json?v=17b1',
  '../japaneseJlptReadingQuestions.json?v=17c2',
].forEach((token) => check(html.includes(token), `unchanged cache token missing: ${token}`));

const helperNames = [
  "getJapaneseJlptRandomIndex",
  "shuffleJapaneseJlptArray",
  "createBalancedJapaneseJlptAnswerPositions",
  "randomizeJapaneseJlptQuestionOptions",
];
helperNames.forEach((name) => check(script.includes(`function ${name}`), `helper missing: ${name}`));
check(block(script, helperNames[0], helperNames[1]).includes("crypto.getRandomValues"), "runtime random helper must use crypto.getRandomValues");
const shuffleBlock = block(script, helperNames[1], helperNames[2]);
check(shuffleBlock.includes("index -= 1") && shuffleBlock.includes("swapIndex"), "Fisher-Yates shuffle markers missing");
const optionBlock = block(script, helperNames[3], "createJapaneseJlptQuestionSnapshot");
check(optionBlock.includes("originalIndex"), "options must track originalIndex");
check(optionBlock.includes("const options =") && optionBlock.includes("return { ...questionSnapshot, options"), "randomizer must return new options and snapshot");

const startBlock = block(script, "startJapaneseJlptMock", "returnToJapaneseJlptSetup");
const buildAt = startBlock.indexOf("const questionSnapshots");
const readingAt = startBlock.indexOf("createJapaneseJlptReadingSnapshots");
const positionsAt = startBlock.indexOf("createBalancedJapaneseJlptAnswerPositions");
const mapAt = startBlock.indexOf("questionSnapshots.map", positionsAt);
check(buildAt >= 0 && readingAt > buildAt && positionsAt > readingAt && mapAt > positionsAt, "session must build fixed snapshots before option randomization");
check(!/shuffleJapaneseJlptArray\s*\(\s*questionSnapshots/.test(startBlock), "questionSnapshots must not be shuffled");
check(startBlock.includes('selectedJapaneseJlptLevel === "N4" ? 34 : 20'), "N5/N4 counts must remain 20/34");
check(script.includes("selectedSets.length !== 10 || questionCount !== 14"), "reading must remain 10 sets / 14 questions");

function unchangedRegion(startNeedle, endNeedle, label) {
  const currentStart = script.indexOf(startNeedle);
  const currentEnd = script.indexOf(endNeedle, currentStart);
  const baseStart = baseScript.indexOf(startNeedle);
  const baseEnd = baseScript.indexOf(endNeedle, baseStart);
  check(currentStart >= 0 && currentEnd > currentStart && baseStart >= 0 && baseEnd > baseStart, `cannot locate ${label}`);
  check(script.slice(currentStart, currentEnd) === baseScript.slice(baseStart, baseEnd), `${label} changed`);
}
unchangedRegion("function createJapaneseJlptReadingSnapshots", "function appendJapaneseJlptDetail", "reading snapshot fields/order");
unchangedRegion("function renderJapaneseJlptQuestion", "function renderJapaneseJlptCompletion", "answer display and rendering");

const runtimeStart = script.indexOf("const JAPANESE_JLPT_LEVELS");
const runtimeEnd = script.indexOf("window.showJapaneseContentView", runtimeStart);
const runtime = script.slice(runtimeStart, runtimeEnd);
[
  "localStorage", "sessionStorage", "indexedDB", "document.cookie", "setInterval",
  "addJapaneseMistake", "writeJapaneseMistake", "addJapaneseVocabulary", "writeJapaneseVocabulary",
].forEach((token) => check(!runtime.includes(token), `forbidden runtime token: ${token}`));

const helperSource = script.slice(
  script.indexOf(`function ${helperNames[0]}`),
  script.indexOf("function createJapaneseJlptQuestionSnapshot"),
);
const context = {};
vm.createContext(context);
vm.runInContext(`${helperSource}\nthis.helpers={shuffleJapaneseJlptArray,createBalancedJapaneseJlptAnswerPositions,randomizeJapaneseJlptQuestionOptions};`, context);
const { createBalancedJapaneseJlptAnswerPositions: positions, randomizeJapaneseJlptQuestionOptions: randomize } = context.helpers;
function provider(seed = 7) {
  let state = seed >>> 0;
  return (max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}
function counts(values) {
  return [0, 1, 2, 3].map((position) => values.filter((value) => value === position).length);
}
const n5 = Array.from(positions(20, provider(17)));
check(n5.length === 20 && n5.every((value) => Number.isInteger(value) && value >= 0 && value <= 3), "N5 positions invalid");
check(counts(n5).every((count) => count === 5), "N5 distribution must be 5/5/5/5");
check(!n5.every((value, index) => value === index % 4), "N5 positions use fixed cycle");
const n4 = Array.from(positions(34, provider(29)));
const n4Counts = counts(n4);
check(n4.length === 34 && n4.every((value) => Number.isInteger(value) && value >= 0 && value <= 3), "N4 positions invalid");
check(n4Counts.every((count) => count === 8 || count === 9) && Math.max(...n4Counts) - Math.min(...n4Counts) <= 1, "N4 distribution must be balanced 8/9");
check(!n4.every((value, index) => value === index % 4), "N4 positions use fixed cycle");

for (let target = 0; target < 4; target += 1) {
  const original = { id: "q", options: ["A", "B", "C", "D"], answerIndex: 2, explanation: "same" };
  const originalOptions = original.options;
  const output = randomize(original, target, provider(target + 1));
  check(output !== original && output.options !== originalOptions, `target ${target}: output must be new`);
  check(output.options.length === 4 && output.answerIndex === target && output.options[target] === "C", `target ${target}: correct option lost`);
  check(JSON.stringify([...output.options].sort()) === JSON.stringify(["A", "B", "C", "D"]), `target ${target}: option lost/duplicated`);
  check(original.answerIndex === 2 && original.options === originalOptions && JSON.stringify(original.options) === '["A","B","C","D"]', `target ${target}: input mutated`);
}
const ordered = [0, 1, 2, 3].map((id) => ({ id, readingSetId: `set-${Math.floor(id / 2)}`, options: ["A", "B", "C", "D"], answerIndex: id % 4, marker: `m${id}` }));
const randomized = ordered.map((question, index) => randomize(question, index, provider(index + 41)));
check(JSON.stringify(randomized.map(({ id }) => id)) === JSON.stringify(ordered.map(({ id }) => id)), "question ID order changed");
check(JSON.stringify(randomized.map(({ readingSetId }) => readingSetId)) === JSON.stringify(ordered.map(({ readingSetId }) => readingSetId)), "readingSetId order changed");
check(randomized.every((question, index) => question.marker === ordered[index].marker), "non-option question fields changed");

if (failed) process.exit(1);
console.log("PASS: Batch 17C-4 balanced JLPT answer randomization checks passed.");
