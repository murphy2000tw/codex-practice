#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const PATHS = Object.freeze({
  source: path.join(ROOT, "grammar.json"),
  manifest: path.join(ROOT, "japaneseJlptGrammarFormSelectionReviewManifest.json"),
  output: path.join(ROOT, "japaneseJlptGrammarFormSelectionQuestions.json")
});
const VERSIONS = Object.freeze({ schema: "1.0.0", manifest: "17c8b-v1", review: "17c8b-review-v1", sourcePolicy: "full-canonical-source-v1", derivation: "17c8b-v1" });
const DISCLAIMER = "Site-internal JLPT-style material; not official JLPT questions, not officially certified, and not reviewed by a professional Japanese testing organization; site-internal-editorial-reviewed.";
const fail = message => { throw new Error(`Batch 17C-8B build: ${message}`); };
const canonical = value => JSON.stringify(value);
const digestSource = source => crypto.createHash("sha256").update(canonical(source), "utf8").digest("hex");
const requireString = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`); };
const blankCount = value => typeof value === "string" ? value.split("＿＿").length - 1 : 0;
const stableId = record => `jlpt-grammar-17c8b-${record.level.toLowerCase()}-form-selection-${record.sourceId}`;

function validateRecord(record, sourceById, seen) {
  const label = record?.authoringId || "record";
  ["authoringId", "sourceId", "level", "section", "questionType", "sourceBank", "sourceDigest", "reviewStatus", "reviewVersion", "reviewMethod", "reviewerRationale"].forEach(key => requireString(record?.[key], `${label}.${key}`));
  if (/^(?:record|item|question)-?\d+$/i.test(record.authoringId) || /(?:index|position)/i.test(record.authoringId)) fail(`${label} has array-position based authoring identity`);
  if (seen.sourceIds.has(record.sourceId)) fail(`duplicate source ID ${record.sourceId}`);
  if (seen.authoringIds.has(record.authoringId)) fail(`duplicate authoringId ${record.authoringId}`);
  seen.sourceIds.add(record.sourceId); seen.authoringIds.add(record.authoringId);
  const source = sourceById.get(record.sourceId);
  if (!source) fail(`${label} has missing source ${record.sourceId}`);
  if (record.level !== source.level || !["N5", "N4"].includes(record.level)) fail(`${label} level mismatch or cross-level fallback`);
  if (record.section !== "grammar" || record.questionType !== "form-selection" || record.sourceBank !== "grammar.json") fail(`${label} has invalid routing metadata`);
  if (!Array.isArray(record.sourceIds) || record.sourceIds.length !== 1 || record.sourceIds[0] !== record.sourceId) fail(`${label} sourceIds must contain only its exact sourceId`);
  if (canonical(record.sourceSnapshot) !== canonical(source)) fail(`${label} full sourceSnapshot drift`);
  if (record.sourceDigest !== digestSource(source)) fail(`${label} sourceDigest mismatch`);
  if (record.reviewStatus !== "approved-for-derived-bank" || record.reviewVersion !== VERSIONS.review || record.reviewMethod !== "site-internal-editorial" || record.uniqueAnswerReviewed !== true) fail(`${label} is not approved with required review metadata`);
  if (!Array.isArray(record.reviewTags) || !record.reviewTags.includes("site-internal-editorial-reviewed")) fail(`${label} lacks review tags`);
  for (const key of ["promptAlignmentReview", "kanaAlignmentReview", "meaningAlignmentReview", "answerUniquenessReview", "displayKanjiKanaReview"]) requireString(record[key], `${label}.${key}`);
  const quiz = source.quiz;
  if (!quiz || typeof quiz !== "object") fail(`${label} source has no quiz`);
  if (blankCount(quiz.clozePrompt) !== 1 || blankCount(quiz.clozePromptKana) !== 1) fail(`${label} prompt and promptKana must each contain exactly one blank`);
  for (const key of ["clozePrompt", "clozePromptKana", "clozeMeaning", "answer", "explanation"]) requireString(quiz[key], `${label}.quiz.${key}`);
  if (!Array.isArray(quiz.choices) || quiz.choices.length !== 4) fail(`${label} must have exactly four choices`);
  if (quiz.choices.some(choice => typeof choice !== "string" || !choice.trim())) fail(`${label} has blank choices`);
  if (new Set(quiz.choices).size !== 4) fail(`${label} has duplicate choices`);
  const answerHits = quiz.choices.filter(choice => choice === quiz.answer).length;
  if (answerHits !== 1) fail(`${label} answer must occur exactly once in choices`);
  if (!Array.isArray(record.optionReviews) || record.optionReviews.length !== 4) fail(`${label} must have four optionReviews`);
  const answerIndex = quiz.choices.indexOf(quiz.answer);
  record.optionReviews.forEach((review, index) => {
    if (review?.choiceIndex !== index || review?.value !== quiz.choices[index]) fail(`${label} optionReviews are not index-aligned`);
    if (review.grammarFitReviewed !== true) fail(`${label} option ${index} lacks grammar-fit review`);
    const correct = index === answerIndex;
    if (review.acceptedAsCorrect !== correct || review.languageReviewStatus !== (correct ? "reviewed-correct" : "reviewed-incorrect")) fail(`${label} option ${index} acceptance review mismatch`);
    if (correct && review.incorrectReason !== null) fail(`${label} correct option incorrectReason must be null`);
    if (!correct) requireString(review.incorrectReason, `${label}.optionReviews[${index}].incorrectReason`);
  });
  if (record.optionReviews.filter(review => review.acceptedAsCorrect === true).length !== 1) fail(`${label} must approve exactly one option`);
  return { source, quiz, answerIndex };
}

function buildData(grammar, manifest) {
  if (!Array.isArray(grammar)) fail("grammar source must be an array");
  if (!manifest || manifest.schemaVersion !== VERSIONS.schema || manifest.manifestVersion !== VERSIONS.manifest || manifest.reviewVersion !== VERSIONS.review || manifest.sourcePolicyVersion !== VERSIONS.sourcePolicy) fail("manifest schema/version/source policy mismatch");
  if (manifest.disclaimer !== DISCLAIMER || manifest.seedCapacity !== true || manifest.inventory?.note !== "seed capacity; not a product quota" || !Array.isArray(manifest.records)) fail("manifest disclaimer or seed-capacity metadata mismatch");
  const sourceById = new Map();
  grammar.forEach(source => { requireString(source?.id, "source.id"); if (sourceById.has(source.id)) fail(`duplicate grammar source ID ${source.id}`); sourceById.set(source.id, source); });
  const seen = { sourceIds: new Set(), authoringIds: new Set() };
  const questions = manifest.records.map(record => {
    const { source, quiz, answerIndex } = validateRecord(record, sourceById, seen);
    const id = stableId(record);
    return {
      id, sourceQuestionId: `grammar.json#${record.sourceId}`, level: record.level, section: "grammar", questionType: "form-selection", sourceBank: "grammar.json", sourceIds: [...record.sourceIds],
      originalText: quiz.clozePrompt, displayText: quiz.clozePrompt, prompt: quiz.clozePrompt, promptKana: quiz.clozePromptKana, promptMeaning: quiz.clozeMeaning,
      options: [...quiz.choices], answerIndex, answerDisplay: quiz.choices[answerIndex], explanation: quiz.explanation,
      grammarId: source.id, grammar: source.grammar, grammarKana: source.kana, structure: source.structure, usage: source.usage, example: source.example, exampleKana: source.exampleKana, exampleMeaning: source.exampleMeaning, category: source.category,
      kanjiPolicy: "source-display-and-kana-reviewed", rubyTerms: [], reviewStatus: record.reviewStatus, reviewVersion: record.reviewVersion, reviewMethod: record.reviewMethod, reviewTags: [...record.reviewTags], uniqueAnswerReviewed: true,
      sourceDigest: record.sourceDigest, derivationVersion: VERSIONS.derivation, optionReviews: record.optionReviews.map(review => ({ ...review }))
    };
  }).sort((a, b) => a.level < b.level ? 1 : a.level > b.level ? -1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const inventory = { N5: { "form-selection": 0, total: 0 }, N4: { "form-selection": 0, total: 0 }, total: questions.length, seedCapacity: true, productQuota: false, note: "seed capacity; not a product quota" };
  questions.forEach(question => { inventory[question.level]["form-selection"]++; inventory[question.level].total++; });
  if (questions.length !== 24 || inventory.N5.total !== 12 || inventory.N4.total !== 12) fail("inventory must contain exactly 12 N5 and 12 N4 questions");
  if (manifest.inventory?.N5?.["form-selection"] !== 12 || manifest.inventory?.N4?.["form-selection"] !== 12 || manifest.inventory?.total !== 24) fail("manifest inventory mismatch");
  if (new Set(questions.map(q => q.id)).size !== 24 || new Set(questions.map(q => q.sourceQuestionId)).size !== 24) fail("derived IDs must be unique");
  return { schemaVersion: VERSIONS.schema, derivationVersion: VERSIONS.derivation, manifestVersion: VERSIONS.manifest, sourcePolicyVersion: VERSIONS.sourcePolicy, disclaimer: DISCLAIMER, generatedFrom: ["grammar.json", "japaneseJlptGrammarFormSelectionReviewManifest.json"], inventory, questions };
}

const serialize = data => `${JSON.stringify(data, null, 2)}\n`;
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
function main() {
  const bytes = serialize(buildData(readJson(PATHS.source), readJson(PATHS.manifest)));
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(PATHS.output) || fs.readFileSync(PATHS.output, "utf8") !== bytes) fail("committed derived bank drift; run builder without --check");
    console.log("PASS: Batch 17C-8B derived bank is byte-for-byte current."); return;
  }
  const temporary = `${PATHS.output}.tmp-${process.pid}`;
  try { fs.writeFileSync(temporary, bytes); fs.renameSync(temporary, PATHS.output); } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  console.log(`Built ${path.basename(PATHS.output)}.`);
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = { buildData, serialize, stableId, digestSource, canonical, VERSIONS, DISCLAIMER, PATHS };
