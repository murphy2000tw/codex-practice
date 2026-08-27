#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE = "040321d";
const DOC = "docs/japanese-jlpt-batch18a1-listening-activation-plan.md";
const SELF = "scripts/check-japanese-jlpt-batch18a1-listening-activation-plan.js";
const ALLOWED = new Set([DOC, SELF]);
const REQUIRED_FIELDS = ["id", "level", "category", "japanese", "kana", "zh", "question", "options", "answerIndex"];
const EXPECTED_CATEGORIES = {
  "日常": [7, 1], "交通": [8, 1], "餐廳": [5, 2], "學校": [5, 1], "工作": [2, 5],
  "時間": [5, 1], "家庭": [4, 1], "購物": [6, 0], "天氣": [3, 3], "旅行": [2, 4],
  "日常生活": [2, 2], "醫院 / 藥局": [3, 1], "便利商店": [4, 0], "電話 / 約定": [2, 2],
  "方向 / 地點": [4, 0], "請求 / 許可": [1, 3], "郵局 / 銀行": [1, 1], "圖書館": [2, 0],
  "飯店 / 住宿": [1, 1], "休假 / 週末": [1, 1], "身體狀況": [1, 1]
};

const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(`Batch 18A-1 check: ${message}`); };
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

function extractConstArray(source, name) {
  const marker = `const ${name} = [`;
  const start = source.indexOf(marker);
  check(start >= 0, `${name} declaration missing`);
  const arrayStart = source.indexOf("[", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") { quote = character; continue; }
    if (character === "[") depth += 1;
    if (character === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(arrayStart, index + 1);
    }
  }
  throw new Error(`Batch 18A-1 check: ${name} array is incomplete`);
}

const script = read("script.js");
const context = {};
vm.createContext(context);
vm.runInContext(`this.questions = ${extractConstArray(script, "JAPANESE_LISTENING_QUESTIONS")};`, context);
const questions = context.questions;

check(Array.isArray(questions) && questions.length === 100, `question count must be 100, found ${questions.length}`);
const levelCounts = { N5: 0, N4: 0 };
const answerCounts = [0, 0, 0, 0];
const levelAnswerCounts = { N5: [0, 0, 0, 0], N4: [0, 0, 0, 0] };
const categoryCounts = Object.fromEntries(Object.keys(EXPECTED_CATEGORIES).map((category) => [category, { N5: 0, N4: 0 }]));
const seenIds = new Set();

questions.forEach((question, index) => {
  const expectedId = `jl-${String(index + 1).padStart(3, "0")}`;
  check(question && typeof question === "object" && !Array.isArray(question), `item ${expectedId} must be an object`);
  check(REQUIRED_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(question, field)), `${expectedId} required fields incomplete`);
  check(question.id === expectedId, `expected ordered ID ${expectedId}, found ${question.id}`);
  check(!seenIds.has(question.id), `duplicate ID ${question.id}`);
  seenIds.add(question.id);
  check(question.level === "N5" || question.level === "N4", `${question.id} invalid level`);
  for (const field of ["id", "category", "japanese", "kana", "zh", "question"]) {
    check(typeof question[field] === "string" && question[field].trim().length > 0, `${question.id} invalid ${field}`);
  }
  check(Array.isArray(question.options) && question.options.length === 4, `${question.id} must have exactly four options`);
  check(question.options.every((option) => typeof option === "string" && option.trim().length > 0), `${question.id} options must be non-empty strings`);
  check(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3, `${question.id} answerIndex must be 0..3`);
  check(question.options[question.answerIndex] === question.zh, `${question.id} correct option must equal zh`);
  check(categoryCounts[question.category], `${question.id} unexpected category ${question.category}`);
  levelCounts[question.level] += 1;
  answerCounts[question.answerIndex] += 1;
  levelAnswerCounts[question.level][question.answerIndex] += 1;
  categoryCounts[question.category][question.level] += 1;
});

check(seenIds.size === 100, "IDs must be unique jl-001 through jl-100");
check(levelCounts.N5 === 69 && levelCounts.N4 === 31, `level counts must be N5=69/N4=31, found ${JSON.stringify(levelCounts)}`);
check(JSON.stringify(answerCounts) === JSON.stringify([25, 25, 25, 25]), `answer distribution must be 25/25/25/25, found ${answerCounts.join("/")}`);
check(JSON.stringify(levelAnswerCounts.N5) === JSON.stringify([21, 12, 22, 14]), "N5 answer-position inventory drift");
check(JSON.stringify(levelAnswerCounts.N4) === JSON.stringify([4, 13, 3, 11]), "N4 answer-position inventory drift");
for (const [category, [n5, n4]] of Object.entries(EXPECTED_CATEGORIES)) {
  check(categoryCounts[category].N5 === n5 && categoryCounts[category].N4 === n4, `${category} category count drift`);
}

const documentText = read(DOC);
const quotaMatch = documentText.match(/<!-- JLPT_18A1_LISTENING_QUOTA_RECOMMENDATION_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- JLPT_18A1_LISTENING_QUOTA_RECOMMENDATION_END -->/);
check(quotaMatch, "machine-readable fixed-quota recommendation missing");
const quota = JSON.parse(quotaMatch[1]);
check(quota.status === "recommendation-only-not-production", "quota must remain recommendation-only");
check(quota.N5.listeningQuota === 10 && quota.N5.currentTotal === 20 && quota.N5.futureTotal === 30, "N5 recommendation must be 10 and future total 30");
check(quota.N4.listeningQuota === 10 && quota.N4.currentTotal === 34 && quota.N4.futureTotal === 44, "N4 recommendation must be 10 and future total 44");
for (const batch of ["Batch 18A-2", "Batch 18A-3", "Batch 18A-4", "Batch 18A-5"]) check(documentText.includes(batch), `${batch} plan missing`);
for (const phrase of ["immutable adapter", "provenance", "隔離 pipeline", "正式配額及 UI 啟用", "桌機、手機與語音實測驗收", "fail closed", "每題最多播放 2 次", "sourceId"]) check(documentText.includes(phrase), `required future contract missing: ${phrase}`);

const changed = new Set([
  ...git("diff", "--name-only", `${BASE}...HEAD`).split("\n"),
  ...git("diff", "--name-only").split("\n"),
  ...git("diff", "--name-only", "--cached").split("\n")
].filter(Boolean));
for (const file of changed) check(ALLOWED.has(file), `forbidden production file changed: ${file}`);
check(git("hash-object", "script.js") === git("rev-parse", `${BASE}:script.js`), "script.js or production listening/JLPT behavior changed");
for (const forbidden of ["style.css", "japanese/index.html"]) check(git("hash-object", forbidden) === git("rev-parse", `${BASE}:${forbidden}`), `${forbidden} changed`);
check(![...changed].some((file) => file.endsWith(".json")), "production question-bank JSON or localStorage schema data changed");

console.log("Batch 18A-1 JLPT listening activation plan audit passed.");
console.log(`Inventory: total=${questions.length}; N5=${levelCounts.N5}; N4=${levelCounts.N4}; answers=${answerCounts.join("/")}.`);
console.log(`Level answer positions: N5=${levelAnswerCounts.N5.join("/")}; N4=${levelAnswerCounts.N4.join("/")}.`);
console.log("Recommendation only: N5 listening=10 (total 30); N4 listening=10 (total 44). JLPT listening remains disabled.");
