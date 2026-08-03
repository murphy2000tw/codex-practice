#!/usr/bin/env node

"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "japaneseJlptReadingQuestions.json");
const SOURCE_COMMIT = "d01d2f043cef25462ede56fd3329fe5a65670757";
const DATA_VERSION = "17c2-n4-reading-v1";
const POLICY_VERSION = "17c2-reading-internal-v1";
const SECTION_TYPES = Object.freeze({
  "short-passage": ["短文理解", "文意推論", "日記", "活動紹介", "旅行メモ", "朋友訊息"],
  "medium-passage": ["中短文理解"],
  "information-search": ["情報検索", "時刻表", "分別表", "簡單行程表"],
  "notice-and-message": [
    "社區公告", "ホテル案内", "交通通知", "伝言メモ", "学校通知", "店家公告", "失物招領公告", "使用規則",
    "預約確認", "店員說明", "店家資訊", "宅配通知", "交通案内", "ホテル受付案内", "病院案内", "店長メモ",
    "図書館公告", "映画館公告", "活動通知",
  ],
});
const FALLBACK_TYPES = ["日記", "交通通知", "伝言メモ", "学校通知", "店家公告", "使用規則"];
const HAN = /\p{Script=Han}/u;

function compareText(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    const difference = a[index].codePointAt(0) - b[index].codePointAt(0);
    if (difference) return difference;
  }
  return a.length - b.length;
}

function numericId(id) {
  const match = id.match(/(\d+)(?!.*\d)/);
  assert(match, `ID has no numeric suffix: ${id}`);
  return Number(match[1]);
}

function requireText(value, label) {
  assert.strictEqual(typeof value, "string", `${label} must be a string`);
  assert(value.trim(), `${label} must not be empty`);
}

function loadSource() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, "japaneseReadingQuestions.js"), "utf8"), sandbox, {
    filename: "japaneseReadingQuestions.js",
  });
  return sandbox.window.JAPANESE_READING_SETS;
}

function validateSource(readingSets) {
  assert(Array.isArray(readingSets), "window.JAPANESE_READING_SETS must be an array");
  assert.strictEqual(readingSets.length, 105, "Source must contain 105 reading sets");
  const setIds = new Set();
  const questionIds = new Set();
  const knownTypes = new Set(Object.values(SECTION_TYPES).flat());
  const unknownTypes = [...new Set(readingSets.map((set) => set.type).filter((type) => !knownTypes.has(type)))];
  assert.strictEqual(unknownTypes.length, 0, `Unknown source type(s): ${unknownTypes.join(", ")}`);
  let questionCount = 0;
  for (const [setIndex, set] of readingSets.entries()) {
    const label = `source[${setIndex}]`;
    for (const field of ["id", "level", "type", "title", "passage", "passageKana"]) requireText(set[field], `${label}.${field}`);
    assert.strictEqual(set.level, "N4", `${label}.level must be N4`);
    assert(!setIds.has(set.id), `Duplicate source set ID: ${set.id}`);
    setIds.add(set.id);
    assert(Array.isArray(set.questions) && set.questions.length >= 1 && set.questions.length <= 3,
      `${label}.questions must contain one to three questions`);
    assert(Array.isArray(set.rubyTerms), `${label}.rubyTerms must be an array`);
    questionCount += set.questions.length;
    for (const [questionIndex, question] of set.questions.entries()) {
      const questionLabel = `${label}.questions[${questionIndex}]`;
      for (const field of ["id", "question", "explanation"]) requireText(question[field], `${questionLabel}.${field}`);
      assert(!questionIds.has(question.id), `Duplicate source question ID: ${question.id}`);
      questionIds.add(question.id);
      assert(Array.isArray(question.options) && question.options.length === 4, `${questionLabel} must have four options`);
      question.options.forEach((option, index) => requireText(option, `${questionLabel}.options[${index}]`));
      assert.strictEqual(new Set(question.options).size, 4, `${questionLabel} options must be distinct`);
      assert(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3,
        `${questionLabel}.answerIndex must be 0 through 3`);
    }
  }
  assert.strictEqual(questionCount, 150, "Source must contain 150 questions");
  assert.strictEqual(readingSets.filter((set) => set.level === "N5").length, 0, "Source must contain zero N5 sets");
}

function validatePolicy(policy) {
  assert.strictEqual(policy.schemaVersion, 1);
  assert.strictEqual(policy.policyVersion, POLICY_VERSION);
  assert.strictEqual(policy.baseKanjiPolicyVersion, "17b1-internal-v1");
  assert.strictEqual(policy.levels.N5.available, false);
  assert.strictEqual(policy.levels.N5.reason, "題庫尚未準備完成");
  assert.strictEqual(policy.levels.N4.available, true);
  assert.strictEqual(policy.levels.N4.kanjiPolicy, "ruby-required");
  assert.strictEqual(policy.levels.N4.rubySource, "source-rubyTerms");
  assert.strictEqual(policy.levels.N4.runtimeRubyInference, false);
  assert.strictEqual(policy.levels.N4.reviewStatus, "internal-source-only");
  assert.strictEqual(policy.safeDomRequired, true);
  requireText(policy.disclaimer, "policy.disclaimer");
  requireText(policy.unmatchedHanPolicy, "policy.unmatchedHanPolicy");
}

function normalizeRubyTerms(sourceTerms, label) {
  const seen = new Set();
  const result = Array.from(sourceTerms, (term, index) => {
    requireText(term.text, `${label}[${index}].text`);
    requireText(term.reading, `${label}[${index}].reading`);
    assert(!HAN.test(term.reading), `${label}[${index}].reading must not contain Han characters`);
    assert(!seen.has(term.text), `${label} contains duplicate text: ${term.text}`);
    seen.add(term.text);
    return { text: term.text, reading: term.reading };
  });
  return result.sort((left, right) => Array.from(right.text).length - Array.from(left.text).length || compareText(left.text, right.text));
}

function calculateRubyCoverage(displayTexts, rubyTerms) {
  const covered = new Set();
  const uncovered = new Set();
  for (const value of displayTexts) {
    const characters = Array.from(value);
    const offsets = [];
    let offset = 0;
    for (const character of characters) {
      offsets.push(offset);
      offset += character.length;
    }
    const marked = characters.map(() => false);
    for (const term of rubyTerms) {
      let start = 0;
      while ((start = value.indexOf(term.text, start)) !== -1) {
        covered.add(term.text);
        const end = start + term.text.length;
        offsets.forEach((characterOffset, index) => {
          if (characterOffset >= start && characterOffset < end) marked[index] = true;
        });
        start = end;
      }
    }
    characters.forEach((character, index) => {
      if (HAN.test(character) && !marked[index]) uncovered.add(character);
    });
  }
  const uncoveredHan = [...uncovered].sort(compareText);
  return {
    status: uncoveredHan.length === 0 ? "complete" : "partial",
    coveredTerms: rubyTerms.map((term) => term.text).filter((text) => covered.has(text)),
    uncoveredHan,
  };
}

function sectionFor(type) {
  return Object.keys(SECTION_TYPES).find((section) => SECTION_TYPES[section].includes(type));
}

function derivedSet(source) {
  const rubyTerms = normalizeRubyTerms(source.rubyTerms, `${source.id}.rubyTerms`);
  const questions = source.questions.map((question) => ({
    id: question.id.replace("jp-reading-q-", "jlpt-reading-q-"),
    sourceQuestionId: question.id,
    originalText: question.question,
    displayText: question.question,
    options: [...question.options],
    answerIndex: question.answerIndex,
    answerDisplay: question.options[question.answerIndex],
    explanation: question.explanation,
  }));
  const displayTexts = [source.title, source.passage, ...questions.flatMap((question) => [question.displayText, ...question.options])];
  return {
    id: source.id.replace("jp-reading-set-", "jlpt-reading-set-"),
    level: source.level,
    section: sectionFor(source.type),
    type: source.type,
    sourceSetId: source.id,
    originalTitle: source.title,
    displayTitle: source.title,
    originalPassage: source.passage,
    displayPassage: source.passage,
    passageKana: source.passageKana,
    rubyTerms,
    rubyCoverage: calculateRubyCoverage(displayTexts, rubyTerms),
    kanjiPolicy: "ruby-required",
    reviewStatus: "internal-source-only",
    questions,
  };
}

function sortReadingSets(readingSets) {
  const sections = Object.keys(SECTION_TYPES);
  return readingSets.sort((left, right) => sections.indexOf(left.section) - sections.indexOf(right.section)
    || SECTION_TYPES[left.section].indexOf(left.type) - SECTION_TYPES[right.section].indexOf(right.type)
    || numericId(left.sourceSetId) - numericId(right.sourceSetId));
}

function initialManifest(readingSets) {
  const selected = [];
  const take = (type, count) => {
    const matches = readingSets.filter((set) => set.type === type && !selected.includes(set)).slice(0, count);
    assert.strictEqual(matches.length, count, `Not enough source sets for ${type}`);
    selected.push(...matches);
  };
  take("短文理解", 3);
  take("中短文理解", 2);
  take("情報検索", 2);
  take("文意推論", 2);
  const allTypeOrder = Object.values(SECTION_TYPES).flat();
  const remainingFallbackTypes = allTypeOrder.filter((type) => !FALLBACK_TYPES.includes(type));
  const fallbackTypeOrder = [...FALLBACK_TYPES, ...remainingFallbackTypes];
  const fallbackType = fallbackTypeOrder.find((type) => readingSets.some((set) => set.type === type && !selected.includes(set)));
  assert(fallbackType, "No fallback reading set is available");
  take(fallbackType, 1);
  return {
    profileVersion: "17c2-initial-fixed-v1",
    level: "N4",
    setCount: selected.length,
    questionCount: selected.reduce((total, set) => total + set.questions.length, 0),
    selectionMode: "fixed-manifest",
    quotas: { "短文理解": 3, "中短文理解": 2, "情報検索": 2, "文意推論": 2, fallback: 1 },
    fallbackTypeOrder,
    setIds: selected.map((set) => set.id),
  };
}

function buildData() {
  const policy = JSON.parse(fs.readFileSync(path.join(root, "japaneseJlptReadingPolicy.json"), "utf8"));
  validatePolicy(policy);
  const source = loadSource();
  validateSource(source);
  const readingSets = sortReadingSets(source.map(derivedSet));
  return {
    schemaVersion: 1,
    dataVersion: DATA_VERSION,
    policyVersion: POLICY_VERSION,
    sourceCommit: SOURCE_COMMIT,
    disclaimer: "本站資料僅供站內非官方 JLPT 風格模擬測驗使用；不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方難度認證。",
    generatedFrom: ["japaneseReadingQuestions.js", "japaneseJlptReadingPolicy.json"],
    availability: {
      N5: { available: false, setCount: 0, questionCount: 0, reason: "題庫尚未準備完成" },
      N4: { available: true, setCount: 105, questionCount: 150 },
    },
    typeToSection: SECTION_TYPES,
    selectionProfiles: { N4: { initial: initialManifest(readingSets) } },
    readingSets,
  };
}

function serialize(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && (args.length === 0 || args[0] === "--check"), "Usage: build-japanese-jlpt-batch17c2-reading-data.js [--check]");
  const generated = serialize(buildData());
  if (args[0] === "--check") {
    assert(fs.existsSync(outputPath), "Committed japaneseJlptReadingQuestions.json is missing");
    assert.strictEqual(fs.readFileSync(outputPath, "utf8"), generated, "Committed derived reading JSON is not reproducible");
    console.log("PASS: Batch 17C-2 derived reading JSON is byte-for-byte reproducible.");
    return;
  }
  fs.writeFileSync(outputPath, generated);
  console.log("Wrote japaneseJlptReadingQuestions.json (105 sets, 150 questions)." );
}

if (require.main === module) main();

module.exports = {
  DATA_VERSION, FALLBACK_TYPES, POLICY_VERSION, SECTION_TYPES, SOURCE_COMMIT,
  buildData, calculateRubyCoverage, compareText, loadSource, normalizeRubyTerms, numericId, serialize, validateSource,
};
