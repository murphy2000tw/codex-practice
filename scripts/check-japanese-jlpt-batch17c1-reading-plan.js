#!/usr/bin/env node

"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const baseCommit = "41bf7b29e272ad24eed31709192e0cde97a2964a";
const allowedFiles = new Set([
  "docs/japanese-jlpt-batch17c1-reading-plan.md",
  "scripts/check-japanese-jlpt-batch17c1-reading-plan.js",
]);

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function lines(value) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function requireNonEmptyString(value, label) {
  assert.strictEqual(typeof value, "string", `${label} must be a string`);
  assert(value.trim(), `${label} must not be empty`);
}

assert.doesNotThrow(
  () => execFileSync("git", ["merge-base", "--is-ancestor", baseCommit, "HEAD"], { cwd: root }),
  `HEAD must contain required base commit ${baseCommit}`,
);

const committed = lines(git(["diff", "--name-only", `${baseCommit}..HEAD`]));
const staged = lines(git(["diff", "--cached", "--name-only"]));
const unstaged = lines(git(["diff", "--name-only"]));
const untracked = lines(git(["ls-files", "--others", "--exclude-standard"]));
const changed = new Set([...committed, ...staged, ...unstaged, ...untracked]);

assert(changed.size > 0, "Batch 17C-1 must contain actual changes");
for (const file of changed) assert(allowedFiles.has(file), `Out-of-scope changed file: ${file}`);
for (const file of allowedFiles) {
  assert(fs.existsSync(path.join(root, file)), `Required file is missing: ${file}`);
  assert(changed.has(file), `Required file has no actual change: ${file}`);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "japaneseReadingQuestions.js"), "utf8"), sandbox, {
  filename: "japaneseReadingQuestions.js",
});
const readingSets = sandbox.window.JAPANESE_READING_SETS;
assert(Array.isArray(readingSets), "window.JAPANESE_READING_SETS must be an array");
assert.strictEqual(readingSets.length, 105, "Reading set count must be 105");

const setFields = ["id", "level", "type", "title", "passage", "passageKana"];
const questionFields = ["id", "question", "explanation"];
const setIds = new Set();
const questionIds = new Set();
const typeDistribution = new Map();
const sizeDistribution = new Map();
let totalQuestions = 0;
let n5Sets = 0;
let n5Questions = 0;

for (const [setIndex, set] of readingSets.entries()) {
  const setLabel = `readingSets[${setIndex}]`;
  for (const field of setFields) requireNonEmptyString(set[field], `${setLabel}.${field}`);
  assert.strictEqual(set.level, "N4", `${setLabel}.level must be N4`);
  assert(!setIds.has(set.id), `Duplicate reading set ID: ${set.id}`);
  setIds.add(set.id);
  assert(Array.isArray(set.questions) && set.questions.length > 0, `${setLabel}.questions must be a non-empty array`);

  if (set.level === "N5") n5Sets += 1;
  totalQuestions += set.questions.length;
  sizeDistribution.set(set.questions.length, (sizeDistribution.get(set.questions.length) || 0) + 1);
  const typeCount = typeDistribution.get(set.type) || { sets: 0, questions: 0 };
  typeCount.sets += 1;
  typeCount.questions += set.questions.length;
  typeDistribution.set(set.type, typeCount);

  for (const [questionIndex, question] of set.questions.entries()) {
    const questionLabel = `${setLabel}.questions[${questionIndex}]`;
    for (const field of questionFields) requireNonEmptyString(question[field], `${questionLabel}.${field}`);
    assert(!questionIds.has(question.id), `Duplicate question ID: ${question.id}`);
    questionIds.add(question.id);
    assert(Array.isArray(question.options), `${questionLabel}.options must be an array`);
    assert.strictEqual(question.options.length, 4, `${questionLabel} must have exactly four options`);
    question.options.forEach((option, optionIndex) => requireNonEmptyString(option, `${questionLabel}.options[${optionIndex}]`));
    assert.strictEqual(new Set(question.options).size, 4, `${questionLabel} options must be distinct`);
    assert(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3,
      `${questionLabel}.answerIndex must be an integer from 0 through 3`);
    if (set.level === "N5") n5Questions += 1;
  }
}

assert.strictEqual(totalQuestions, 150, "Question count must be 150");
assert.strictEqual(n5Sets, 0, "N5 reading set count must be 0");
assert.strictEqual(n5Questions, 0, "N5 reading question count must be 0");

const documentPath = path.join(root, "docs/japanese-jlpt-batch17c1-reading-plan.md");
const documentText = fs.readFileSync(documentPath, "utf8");
const requiredHeadings = [
  "## 1. 定位與範圍", "## 2. 基準與來源", "## 3. 題庫數量盤點", "## 4. Schema 與完整性稽核",
  "## 5. N4 可用性評估", "## 6. N5 缺口政策", "## 7. JLPT 閱讀衍生資料契約草案",
  "## 8. 後續測驗流程草案", "## 9. 顯示與無障礙規格", "## 10. 後續批次拆分", "## 11. 明確不做事項",
];
for (const heading of requiredHeadings) assert(documentText.includes(heading), `Plan is missing heading: ${heading}`);
for (const phrase of [
  baseCommit, "105 組、150 題", "N4-only", "N5 為 **0 組、0 題", "站內非官方 JLPT 風格模擬測驗",
  "禁止把 N4 閱讀題混入 N5", "Batch 17C-2", "Batch 17C-3", "題庫尚未準備完成",
]) assert(documentText.includes(phrase), `Plan is missing required content: ${phrase}`);

const documentedTypes = new Map();
for (const match of documentText.matchAll(/^\| ([^|]+?) \| (\d+) \| (\d+) \|$/gm)) {
  documentedTypes.set(match[1].trim(), { sets: Number(match[2]), questions: Number(match[3]) });
}
assert.deepStrictEqual([...documentedTypes], [...typeDistribution], "Documented type distribution must match live data and source order");

const sizeSection = documentText.match(/### 每組題數分布\s+([\s\S]*?)(?=\n## )/);
assert(sizeSection, "Plan must contain the per-set question-count distribution section");
const documentedSizes = new Map();
for (const match of sizeSection[1].matchAll(/^\| (\d+) \| (\d+) \|$/gm)) {
  documentedSizes.set(Number(match[1]), Number(match[2]));
}
assert.deepStrictEqual([...documentedSizes], [...sizeDistribution], "Documented set-size distribution must match live data");

console.log("Reading inventory: 105 sets, 150 questions; N4 105/150; N5 0/0.");
console.log("Type distribution (sets/questions):");
for (const [type, count] of typeDistribution) console.log(`- ${type}: ${count.sets}/${count.questions}`);
console.log("Questions per set (questions: sets):");
for (const [questionCount, setCount] of sizeDistribution) console.log(`- ${questionCount}: ${setCount}`);

const rubyCheck = spawnSync(process.execPath, ["scripts/check-reading-ruby.js"], {
  cwd: root,
  encoding: "utf8",
});
if (rubyCheck.stdout) process.stdout.write(rubyCheck.stdout);
if (rubyCheck.stderr) process.stderr.write(rubyCheck.stderr);
assert.strictEqual(rubyCheck.status, 0, "scripts/check-reading-ruby.js must exit successfully");

console.log("PASS: Batch 17C-1 JLPT reading audit and plan checks passed.");
