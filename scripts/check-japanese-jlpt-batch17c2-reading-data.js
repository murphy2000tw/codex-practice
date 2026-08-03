#!/usr/bin/env node

"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const builder = require("./build-japanese-jlpt-batch17c2-reading-data.js");

const root = path.resolve(__dirname, "..");
const allowedFiles = new Set([
  "japaneseJlptReadingPolicy.json",
  "japaneseJlptReadingQuestions.json",
  "scripts/build-japanese-jlpt-batch17c2-reading-data.js",
  "scripts/check-japanese-jlpt-batch17c2-reading-data.js",
  "docs/japanese-jlpt-batch17c2-reading-data.md",
]);

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function lines(value) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function requireText(value, label) {
  assert.strictEqual(typeof value, "string", `${label} must be a string`);
  assert(value.trim(), `${label} must not be empty`);
}

assert.doesNotThrow(
  () => execFileSync("git", ["merge-base", "--is-ancestor", builder.SOURCE_COMMIT, "HEAD"], { cwd: root }),
  `HEAD must contain required base commit ${builder.SOURCE_COMMIT}`,
);

const committed = lines(git(["diff", "--name-only", `${builder.SOURCE_COMMIT}..HEAD`]));
const staged = lines(git(["diff", "--cached", "--name-only"]));
const unstaged = lines(git(["diff", "--name-only"]));
const untracked = lines(git(["ls-files", "--others", "--exclude-standard"]));
const changed = new Set([...committed, ...staged, ...unstaged, ...untracked]);
assert.strictEqual(changed.size, 5, "Batch 17C-2 must change exactly five files");
for (const file of changed) assert(allowedFiles.has(file), `Out-of-scope changed file: ${file}`);
for (const file of allowedFiles) {
  assert(changed.has(file), `Required file has no actual change: ${file}`);
  assert(fs.existsSync(path.join(root, file)), `Required file is missing: ${file}`);
}

const policy = JSON.parse(fs.readFileSync(path.join(root, "japaneseJlptReadingPolicy.json"), "utf8"));
assert.strictEqual(policy.schemaVersion, 1);
assert.strictEqual(policy.policyVersion, builder.POLICY_VERSION);
assert.strictEqual(policy.baseKanjiPolicyVersion, "17b1-internal-v1");
assert.strictEqual(policy.levels.N5.available, false);
assert.strictEqual(policy.levels.N5.reason, "題庫尚未準備完成");
assert.strictEqual(policy.levels.N4.available, true);
assert.strictEqual(policy.levels.N4.kanjiPolicy, "ruby-required");
assert.strictEqual(policy.levels.N4.runtimeRubyInference, false);
assert.strictEqual(policy.safeDomRequired, true);
for (const field of ["disclaimer", "unmatchedHanPolicy"]) {
  requireText(policy[field], `policy.${field}`);
  assert(policy[field].includes("非官方") || policy[field].includes("不代表官方"), `policy.${field} must disclaim official status`);
}

const dataText = fs.readFileSync(path.join(root, "japaneseJlptReadingQuestions.json"), "utf8");
const data = JSON.parse(dataText);
const expected = builder.buildData();
assert.strictEqual(dataText, builder.serialize(expected), "Derived data must exactly match deterministic builder output");
assert.strictEqual(data.schemaVersion, 1);
assert.strictEqual(data.dataVersion, builder.DATA_VERSION);
assert.strictEqual(data.policyVersion, builder.POLICY_VERSION);
assert.strictEqual(data.sourceCommit, builder.SOURCE_COMMIT);
assert.deepStrictEqual(data.generatedFrom, ["japaneseReadingQuestions.js", "japaneseJlptReadingPolicy.json"]);
assert.deepStrictEqual(data.availability.N5, { available: false, setCount: 0, questionCount: 0, reason: "題庫尚未準備完成" });
assert.deepStrictEqual(data.availability.N4, { available: true, setCount: 105, questionCount: 150 });
requireText(data.disclaimer, "data.disclaimer");
assert(data.disclaimer.includes("非官方") && data.disclaimer.includes("不是官方"), "Data must contain a non-official disclaimer");
assert.deepStrictEqual(data.typeToSection, builder.SECTION_TYPES);

const source = builder.loadSource();
builder.validateSource(source);
assert.strictEqual(data.readingSets.length, 105);
assert.strictEqual(data.readingSets.reduce((count, set) => count + set.questions.length, 0), 150);
assert.strictEqual(data.readingSets.filter((set) => set.level === "N5").length, 0);
const sourceById = new Map(source.map((set) => [set.id, set]));
const setIds = new Set();
const sourceSetIds = new Set();
const questionIds = new Set();
const sourceQuestionIds = new Set();

for (const [setIndex, set] of data.readingSets.entries()) {
  const label = `readingSets[${setIndex}]`;
  assert(!setIds.has(set.id), `Duplicate derived set ID: ${set.id}`);
  assert(!sourceSetIds.has(set.sourceSetId), `Duplicate sourceSetId: ${set.sourceSetId}`);
  setIds.add(set.id);
  sourceSetIds.add(set.sourceSetId);
  const original = sourceById.get(set.sourceSetId);
  assert(original, `${label}.sourceSetId is not traceable`);
  assert.strictEqual(set.level, "N4");
  assert.strictEqual(set.section, Object.keys(builder.SECTION_TYPES).find((section) => builder.SECTION_TYPES[section].includes(original.type)));
  assert.strictEqual(set.type, original.type);
  assert.strictEqual(set.originalTitle, original.title);
  assert.strictEqual(set.displayTitle, original.title);
  assert.strictEqual(set.originalPassage, original.passage);
  assert.strictEqual(set.displayPassage, original.passage);
  assert.strictEqual(set.passageKana, original.passageKana);
  assert.strictEqual(set.kanjiPolicy, "ruby-required");
  assert.strictEqual(set.reviewStatus, "internal-source-only");
  assert.deepStrictEqual(set.rubyTerms, builder.normalizeRubyTerms(original.rubyTerms, `${original.id}.rubyTerms`));
  const displayTexts = [set.displayTitle, set.displayPassage, ...set.questions.flatMap((question) => [question.displayText, ...question.options])];
  assert.deepStrictEqual(set.rubyCoverage, builder.calculateRubyCoverage(displayTexts, set.rubyTerms));
  assert(["complete", "partial"].includes(set.rubyCoverage.status));
  assert.strictEqual(new Set(set.rubyCoverage.uncoveredHan).size, set.rubyCoverage.uncoveredHan.length);
  assert.deepStrictEqual([...set.rubyCoverage.uncoveredHan].sort(builder.compareText), set.rubyCoverage.uncoveredHan);
  assert.strictEqual(set.questions.length, original.questions.length, `${label} must preserve bound questions`);
  set.questions.forEach((question, questionIndex) => {
    const sourceQuestion = original.questions[questionIndex];
    assert(!questionIds.has(question.id), `Duplicate derived question ID: ${question.id}`);
    assert(!sourceQuestionIds.has(question.sourceQuestionId), `Duplicate sourceQuestionId: ${question.sourceQuestionId}`);
    questionIds.add(question.id);
    sourceQuestionIds.add(question.sourceQuestionId);
    assert.strictEqual(question.sourceQuestionId, sourceQuestion.id);
    assert.strictEqual(question.originalText, sourceQuestion.question);
    assert.strictEqual(question.displayText, sourceQuestion.question);
    assert.deepStrictEqual(question.options, Array.from(sourceQuestion.options));
    assert.strictEqual(question.answerIndex, sourceQuestion.answerIndex);
    assert.strictEqual(question.answerDisplay, sourceQuestion.options[sourceQuestion.answerIndex]);
    assert.strictEqual(question.explanation, sourceQuestion.explanation);
  });
}

const sortedIds = [...data.readingSets]
  .sort((left, right) => Object.keys(builder.SECTION_TYPES).indexOf(left.section) - Object.keys(builder.SECTION_TYPES).indexOf(right.section)
    || builder.SECTION_TYPES[left.section].indexOf(left.type) - builder.SECTION_TYPES[right.section].indexOf(right.type)
    || builder.numericId(left.sourceSetId) - builder.numericId(right.sourceSetId))
  .map((set) => set.id);
assert.deepStrictEqual(data.readingSets.map((set) => set.id), sortedIds, "readingSets order is not deterministic");

const manifest = data.selectionProfiles.N4.initial;
assert.strictEqual(manifest.profileVersion, "17c2-initial-fixed-v1");
assert.strictEqual(manifest.level, "N4");
assert.strictEqual(manifest.setCount, 10);
assert.strictEqual(manifest.selectionMode, "fixed-manifest");
assert.deepStrictEqual(manifest.quotas, { "短文理解": 3, "中短文理解": 2, "情報検索": 2, "文意推論": 2, fallback: 1 });
assert.strictEqual(manifest.setIds.length, 10);
assert.strictEqual(new Set(manifest.setIds).size, 10);
const selected = manifest.setIds.map((id) => data.readingSets.find((set) => set.id === id));
assert(selected.every(Boolean), "Every manifest set ID must exist");
assert(selected.every((set) => set.level === "N4"), "Every manifest set must be N4");
for (const [type, quota] of [["短文理解", 3], ["中短文理解", 2], ["情報検索", 2], ["文意推論", 2]]) {
  assert.strictEqual(selected.filter((set) => set.type === type).length, quota, `${type} quota must match`);
}
assert.strictEqual(selected.filter((set) => !["短文理解", "中短文理解", "情報検索", "文意推論"].includes(set.type)).length, 1);
assert.strictEqual(manifest.questionCount, selected.reduce((total, set) => total + set.questions.length, 0));
assert.deepStrictEqual(manifest, expected.selectionProfiles.N4.initial, "Manifest must be the deterministic fixed selection");

const generatorText = fs.readFileSync(path.join(root, "scripts/build-japanese-jlpt-batch17c2-reading-data.js"), "utf8");
for (const forbidden of ["Math" + ".random", "Date" + ".now", "locale" + "Compare"]) {
  assert(!generatorText.includes(forbidden), `Generator must not use ${forbidden}`);
}

for (const command of [
  ["scripts/build-japanese-jlpt-batch17c2-reading-data.js", "--check"],
  ["scripts/check-reading-ruby.js"],
]) {
  const result = spawnSync(process.execPath, command, { cwd: root, encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.strictEqual(result.status, 0, `${command.join(" ")} must exit successfully`);
}

const coverageCounts = data.readingSets.reduce((counts, set) => {
  counts[set.rubyCoverage.status] += 1;
  return counts;
}, { complete: 0, partial: 0 });
console.log(`Reading data: 105 sets, 150 questions; N4 105/150; N5 0/0; rubyCoverage complete ${coverageCounts.complete}, partial ${coverageCounts.partial}.`);
console.log(`Initial manifest: ${manifest.setIds.join(", ")} (${manifest.questionCount} questions).`);
console.log("PASS: Batch 17C-2 N4 JLPT derived reading data checks passed.");
