#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE = "b47997a"; // PR #290 merge commit / Batch 17C-6 baseline.
const DOC = "docs/japanese-jlpt-batch17c7a-vocabulary-audit-plan.md";
const CHECKER = "scripts/check-japanese-jlpt-batch17c7a-vocabulary-audit-plan.js";
const ALLOWED_CHANGES = new Set([DOC, CHECKER]);
const LEVELS = ["N5", "N4"];
const REQUIRED_FIELDS = ["id", "level", "word", "kana", "meaning", "partOfSpeech", "example", "exampleKana", "exampleMeaning"];
const QUESTION_TYPES = ["kanji-reading", "orthography", "context", "paraphrase", "usage"];
const PARAPHRASE_RELATIONSHIP_FIELDS = ["synonyms", "synonym", "paraphrases", "paraphrase", "equivalentExpression"];
const USAGE_CONTRAST_FIELDS = ["usageSentences", "correctUsageIndex", "incorrectUsageReasons", "usageReviewId"];
const ALTERNATE_READING_FIELDS = ["alternateReadings", "acceptedReadings", "readings"];
const BLOCKERS = [
  "missing-required-field", "no-testable-kanji", "unreviewed-kanji", "duplicate-kana",
  "ambiguous-reading", "multiple-valid-orthographies", "unsafe-generated-distractor",
  "example-target-not-found", "example-kana-misaligned", "inflected-target-not-aligned",
  "ambiguous-context-answer", "missing-paraphrase-relationship", "missing-usage-contrast-data",
  "level-mismatch", "n5-usage-not-planned",
];

let failed = false;
function check(condition, message) {
  if (!condition) {
    failed = true;
    console.error(`FAIL: ${message}`);
  }
}
function read(name) { return fs.readFileSync(path.join(ROOT, name), "utf8"); }
function git(...args) { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim(); }
function nonEmpty(value) { return value !== undefined && value !== null && String(value).trim() !== ""; }
function occurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = String(haystack).indexOf(String(needle), offset)) !== -1) {
    count += 1;
    offset += String(needle).length;
  }
  return count;
}
function groupedDuplicates(items, key) {
  const groups = new Map();
  for (const item of items) {
    const value = key(item);
    groups.set(value, [...(groups.get(value) || []), item]);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}
function groupSummary(groups) {
  return {
    groups: groups.length,
    items: groups.reduce((sum, group) => sum + group.length, 0),
    maxGroupSize: Math.max(0, ...groups.map((group) => group.length)),
  };
}
function normalizedMeaning(value) {
  return String(value).trim().replace(/[，,、；;。.!！？?\s]/gu, "");
}
function populatedRelationshipCount(items, fields) {
  return items.reduce((count, item) => count + fields.filter((field) => {
    const value = item[field];
    return Array.isArray(value) ? value.length > 0 : nonEmpty(value);
  }).length, 0);
}
function sourceSemantics(items) {
  return {
    recognizedParaphraseOrSynonymFields: PARAPHRASE_RELATIONSHIP_FIELDS,
    recognizedUsageContrastFields: USAGE_CONTRAST_FIELDS,
    entriesWithParaphraseOrSynonymData: items.filter((item) =>
      populatedRelationshipCount([item], PARAPHRASE_RELATIONSHIP_FIELDS) > 0).length,
    entriesWithUsageContrastData: items.filter((item) =>
      populatedRelationshipCount([item], USAGE_CONTRAST_FIELDS) > 0).length,
    paraphraseOrSynonymPopulatedFields: populatedRelationshipCount(items, PARAPHRASE_RELATIONSHIP_FIELDS),
    usageContrastPopulatedFields: populatedRelationshipCount(items, USAGE_CONTRAST_FIELDS),
  };
}
function inventoryFor(items) {
  const homophones = groupedDuplicates(items, (item) => item.kana);
  const meaningRisks = groupedDuplicates(items, (item) => normalizedMeaning(item.meaning));
  const homophoneIds = new Set(homophones.flat().map((item) => item.id));
  const uniqueWordExample = items.filter((item) => occurrences(item.example, item.word) === 1);
  const uniqueKanaExample = items.filter((item) => occurrences(item.exampleKana, item.kana) === 1);
  const aligned = items.filter((item) => occurrences(item.example, item.word) === 1
    && occurrences(item.exampleKana, item.kana) === 1);
  const withKanji = items.filter((item) => /\p{Script=Han}/u.test(item.word));
  const complete = Object.fromEntries(REQUIRED_FIELDS.map((field) =>
    [field, items.filter((item) => nonEmpty(item[field])).length]));
  return {
    sourceCount: items.length,
    requiredFieldComplete: complete,
    withKanji: withKanji.length,
    withoutKanji: items.length - withKanji.length,
    unique: {
      word: new Set(items.map((item) => item.word)).size,
      kana: new Set(items.map((item) => item.kana)).size,
      meaning: new Set(items.map((item) => item.meaning)).size,
    },
    homophoneKana: groupSummary(homophones),
    normalizedMeaningRisk: groupSummary(meaningRisks),
    exampleWordAlignment: {
      found: items.filter((item) => occurrences(item.example, item.word) > 0).length,
      uniqueOccurrence: uniqueWordExample.length,
      multipleOccurrences: items.filter((item) => occurrences(item.example, item.word) > 1).length,
    },
    exampleKanaAlignment: {
      found: items.filter((item) => occurrences(item.exampleKana, item.kana) > 0).length,
      uniqueOccurrence: uniqueKanaExample.length,
      multipleOccurrences: items.filter((item) => occurrences(item.exampleKana, item.kana) > 1).length,
    },
    sameBlankStructuralCandidates: aligned.length,
    sourceKeys: [...new Set(items.flatMap((item) => Object.keys(item)))].sort(),
    sourceSemanticRelations: sourceSemantics(items),
    eligibility: {
      "kanji-reading": {
        available: 0, structuralCandidates: withKanji.length, requiresHumanReview: withKanji.length,
        excluded: items.length - withKanji.length,
        blockers: {
          "no-testable-kanji": items.length - withKanji.length,
          "unreviewed-kanji": withKanji.length,
          "unsafe-generated-distractor": withKanji.length,
        },
        readingAmbiguityAssessment: {
          sourceDetectable: items.some((item) => ALTERNATE_READING_FIELDS.some((field) => field in item)),
          recognizedAlternateReadingFields: ALTERNATE_READING_FIELDS,
          confirmedCount: null,
          requiresHumanReview: withKanji.length,
        },
      },
      orthography: {
        available: 0, structuralCandidates: withKanji.length, requiresHumanReview: withKanji.length,
        excluded: items.length - withKanji.length,
        blockers: {
          "no-testable-kanji": items.length - withKanji.length,
          "unreviewed-kanji": withKanji.length,
          "duplicate-kana": [...homophoneIds].filter((id) => withKanji.some((item) => item.id === id)).length,
          "multiple-valid-orthographies": [...homophoneIds].filter((id) => withKanji.some((item) => item.id === id)).length,
          "unsafe-generated-distractor": withKanji.length,
        },
      },
      context: {
        available: 0, structuralCandidates: aligned.length, requiresHumanReview: aligned.length,
        excluded: items.length - aligned.length,
        blockers: {
          "example-target-not-found": items.length - uniqueWordExample.length,
          "example-kana-misaligned": items.length - uniqueKanaExample.length,
          "inflected-target-not-aligned": items.filter((item) =>
            occurrences(item.example, item.word) !== 1 || occurrences(item.exampleKana, item.kana) !== 1).length,
          "ambiguous-context-answer": aligned.length,
          "unsafe-generated-distractor": aligned.length,
        },
      },
      paraphrase: {
        available: 0, structuralCandidates: 0, requiresAuthoredSemanticData: items.length, excluded: 0,
        blockers: { "missing-paraphrase-relationship": items.length },
      },
      usage: null,
    },
  };
}

let vocabulary;
try {
  vocabulary = JSON.parse(read("vocabulary.json"));
  check(Array.isArray(vocabulary), "vocabulary.json must contain an array");
} catch (error) {
  check(false, `vocabulary.json must parse: ${error.message}`);
  vocabulary = [];
}
const inventory = Object.fromEntries(LEVELS.map((level) =>
  [level, inventoryFor(vocabulary.filter((item) => item.level === level))]));
inventory.N5.eligibility.usage = {
  available: 0, structuralCandidates: 0, requiresAuthoredSemanticData: 0,
  excluded: inventory.N5.sourceCount,
  blockers: { "n5-usage-not-planned": inventory.N5.sourceCount },
};
inventory.N4.eligibility.usage = {
  available: 0, structuralCandidates: 0, requiresAuthoredSemanticData: inventory.N4.sourceCount,
  excluded: 0, blockers: { "missing-usage-contrast-data": inventory.N4.sourceCount },
};

for (const level of LEVELS) {
  check(inventory[level].sourceCount > 0, `${level} source inventory must not be empty`);
  for (const field of REQUIRED_FIELDS) {
    check(inventory[level].requiredFieldComplete[field] === inventory[level].sourceCount,
      `${level} ${field} completeness changed`);
  }
}
check(vocabulary.every((item) => !["synonyms", "synonym", "paraphrases", "paraphrase", "equivalentExpression"].some((key) => key in item)),
  "vocabulary source unexpectedly contains formal paraphrase relationships");
check(vocabulary.every((item) => !["usageSentences", "correctUsageIndex", "incorrectUsageReasons", "usageReviewId"].some((key) => key in item)),
  "vocabulary source unexpectedly contains usage contrast data");
check(LEVELS.every((level) => inventory[level].sourceSemanticRelations.paraphraseOrSynonymPopulatedFields === 0
  && inventory[level].sourceSemanticRelations.usageContrastPopulatedFields === 0
  && inventory[level].sourceSemanticRelations.entriesWithParaphraseOrSynonymData === 0
  && inventory[level].sourceSemanticRelations.entriesWithUsageContrastData === 0),
"current source semantic relationship counts must be dynamically zero");

// Synthetic contracts: cross-entry homophones are an orthography risk, not confirmed reading ambiguity.
const homophoneFixture = [
  { id: "a", level: "N5", word: "会う", kana: "あう", meaning: "meet", partOfSpeech: "verb", example: "会う。", exampleKana: "あう。", exampleMeaning: "meet" },
  { id: "b", level: "N5", word: "合う", kana: "あう", meaning: "fit", partOfSpeech: "verb", example: "合う。", exampleKana: "あう。", exampleMeaning: "fit" },
];
const homophoneAudit = inventoryFor(homophoneFixture);
check(homophoneAudit.homophoneKana.items === 2, "synthetic homophone inventory must detect both entries");
check(!("ambiguous-reading" in homophoneAudit.eligibility["kanji-reading"].blockers)
  && homophoneAudit.eligibility["kanji-reading"].readingAmbiguityAssessment.confirmedCount === null,
"cross-entry homophones must not become confirmed kanji-reading ambiguity");
check(homophoneAudit.eligibility["kanji-reading"].readingAmbiguityAssessment.sourceDetectable === false
  && homophoneAudit.eligibility["kanji-reading"].readingAmbiguityAssessment.requiresHumanReview === 2,
"missing alternate-reading metadata must remain unassessed and require human review");
check(homophoneAudit.eligibility.orthography.blockers["multiple-valid-orthographies"] === 2,
"context-free orthography fixture must flag multiple-valid-orthographies risk");
const semanticFixture = homophoneFixture.map((item) => ({ ...item }));
semanticFixture[0].synonyms = ["出会う"];
semanticFixture[1].usageSentences = [{ sentence: "サイズが合う。", correct: true }];
const semanticAudit = inventoryFor(semanticFixture).sourceSemanticRelations;
check(semanticAudit.paraphraseOrSynonymPopulatedFields > 0,
"synthetic synonym relationship must increase the dynamic semantic count");
check(semanticAudit.usageContrastPopulatedFields > 0,
  "synthetic usage contrast must increase the dynamic semantic count");
check(semanticAudit.entriesWithParaphraseOrSynonymData === 1
  && semanticAudit.entriesWithUsageContrastData === 1,
"synthetic semantic fixtures must count affected entries dynamically");

const doc = read(DOC);
const match = doc.match(/<!-- INVENTORY_JSON_START\s*\n([\s\S]*?)\nINVENTORY_JSON_END -->/);
check(match, "document must contain machine-readable inventory block");
if (match) {
  try {
    check(JSON.stringify(JSON.parse(match[1])) === JSON.stringify(inventory),
      "document inventory JSON must exactly match dynamic vocabulary audit");
  } catch (error) { check(false, `document inventory JSON must parse: ${error.message}`); }
}

for (const level of LEVELS) check(doc.includes(`\`${level}\``), `document must name ${level}`);
for (const type of QUESTION_TYPES) check(doc.includes(`\`${type}\``), `question type contract missing: ${type}`);
for (const blocker of BLOCKERS) check(doc.includes(`\`${blocker}\``), `blocker taxonomy missing: ${blocker}`);
for (const status of ["eligible-for-automatic-adapter", "eligible-after-kanji-review", "requires-human-distractor-review", "requires-authored-semantic-data", "excluded"])
  check(doc.includes(`\`${status}\``), `eligibility status missing: ${status}`);
for (const layer of ["Authoring schema", "Committed derived schema", "Runtime candidate schema"])
  check(doc.includes(`### ${layer}`), `${layer} definition missing`);
for (const key of ["sourceQuestionId", "sourceIds", "reviewVersion", "derivationVersion", "uniqueAnswerReviewed", "semanticReviewId", "usageReviewId", "targetOccurrence", "inflectionMetadata"])
  check(doc.includes(`\`${key}\``), `schema/provenance key missing: ${key}`);
check(doc.includes("stable ID") && doc.includes("不得依陣列位置"), "stable ID rule missing");
check(doc.includes("(level, vocabulary, questionType)"), "runtime vocabulary pool-key rule missing");
check(doc.includes("獨立 derived bank") && doc.includes("不餵入 compatibility session"), "safe disabled integration decision missing");
check(doc.includes("N5 usage: not planned") && doc.includes("N4 usage: planned"), "N5/N4 usage target contract missing");
check(doc.includes("confirmedCount: null") && doc.includes("sourceDetectable: false")
  && doc.includes("unknown/unassessed") && doc.includes("不會使「看不同漢字詞選讀音」自動成為多解"),
"document must keep kanji-reading ambiguity unassessed rather than infer it from homophones");
check(doc.includes("context-free kana prompt") && doc.includes("multiple-valid-orthographies"),
"document must retain the homophone risk for context-free orthography");
for (const field of [...PARAPHRASE_RELATIONSHIP_FIELDS, ...USAGE_CONTRAST_FIELDS])
  check(doc.includes(`\`${field}\``), `recognized semantic source field missing from document: ${field}`);
check(doc.includes("這些 0 是逐 entry 動態計算，不是常數"),
"document must explain dynamic semantic relationship zero counts");
check(doc.includes("available` 必須維持 **0**") || doc.includes("available 必須維持 0"), "semantic types must remain unavailable without authored data");
check(doc.includes("不是最終產品 quota") && doc.includes("Batch 17C-10"), "candidate/product quota boundary missing");
check(!doc.includes("17C-10 最終產品 quota 為"), "document must not decide final product quota");
check(doc.includes("母庫筆數不等於 eligible") && doc.includes("site-internal") && doc.includes("非官方"), "source-count and non-official disclaimers missing");
for (const batch of ["17C-7B", "17C-7C", "17C-7D"]) check(doc.includes(`Batch ${batch}`), `${batch} handoff missing`);

const policy = JSON.parse(read("japaneseJlptKanjiPolicy.json"));
check(policy.allowedPolicies.join("|") === "level-native|ruby-required|kana-replacement|excluded", "allowedPolicies changed");
check(policy.fallbackOrder.join("|") === "kana-replacement|ruby-required|excluded", "fallbackOrder changed");
for (const level of LEVELS) {
  check(policy.levels[level].reviewStatus === "pending", `${level} kanji review must remain pending`);
  check(Array.isArray(policy.levels[level].kanjiAllowList) && policy.levels[level].kanjiAllowList.length === 0,
    `${level} kanji allow list must remain empty`);
}
check(doc.includes(policy.policyVersion) && doc.includes("pending") && doc.includes("空 allow list"), "policy audit conclusion missing");

const script = read("script.js");
const start = script.indexOf("function deepFreezeJapaneseJlptValue");
const end = script.indexOf("let japaneseJlptReadingBank", start);
const context = {};
vm.createContext(context);
vm.runInContext(`${script.slice(start, end)}\nthis.registry=JAPANESE_JLPT_PROFILE_REGISTRY;`, context);
const compat = context.registry.profiles["17c6-compat-v1"];
check(compat.levels.N5.total === 20 && compat.levels.N5.sections.vocabulary.total === 10 && compat.levels.N5.sections.grammar.total === 10,
  "N5 compatibility behavior must remain 10 vocabulary + 10 grammar = 20");
check(compat.levels.N4.total === 34 && compat.levels.N4.sections.vocabulary.total === 10
  && compat.levels.N4.sections.grammar.total === 10 && compat.levels.N4.sections.reading.total === 14,
  "N4 compatibility behavior must remain 10 vocabulary + 10 grammar + 14 reading = 34");
for (const level of LEVELS) check(Object.keys(compat.levels[level].sections.vocabulary.questionTypes).join() === "meaning",
  `${level} compatibility vocabulary must register only meaning`);

check(git("merge-base", "HEAD", BASE) === git("rev-parse", BASE), "branch must contain PR #290 merge commit");
const changed = new Set([
  ...git("diff", "--name-only", BASE).split("\n"),
  ...git("ls-files", "--others", "--exclude-standard").split("\n"),
].filter(Boolean));
for (const file of changed) check(ALLOWED_CHANGES.has(file), `protected or unexpected file changed since PR #290: ${file}`);
for (const file of ALLOWED_CHANGES) check(changed.has(file), `required Batch 17C-7A file missing: ${file}`);
const added = [...changed].map(read).join("\n");
check(!/\b(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|removeItem|clear)\s*\(/.test(added)
  && !/\bindexedDB\s*\.\s*open\s*\(/.test(added), "Batch 17C-7A must not add storage/cache writes");

console.log(JSON.stringify(inventory, null, 2));
if (failed) process.exit(1);
console.log("PASS: Batch 17C-7A vocabulary audit plan checks passed.");
