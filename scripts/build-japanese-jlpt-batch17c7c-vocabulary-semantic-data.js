#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const PATHS = Object.freeze({
  source: path.join(ROOT, "vocabulary.json"),
  paraphrase: path.join(ROOT, "japaneseJlptVocabularyParaphraseReviewManifest.json"),
  usage: path.join(ROOT, "japaneseJlptVocabularyUsageReviewManifest.json"),
  output: path.join(ROOT, "japaneseJlptVocabularySemanticQuestions.json")
});
const VERSIONS = Object.freeze({ schema: "1.0.0", manifest: "17c7c-v1", derivation: "17c7c-v1", namespace: "jlpt-vocab-17c7c-v1" });
const TYPES = Object.freeze(["paraphrase", "usage"]);
const fail = message => { throw new Error(`Batch 17C-7C build: ${message}`); };
const requireString = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`); };
const occurrences = (text, term) => term ? text.split(term).length - 1 : 0;
const hasHan = value => /[\u3400-\u9fff々]/u.test(value);
const stableId = record => {
  const identity = `${VERSIONS.namespace}|${record.level}|${record.questionType}|${record.sourceId}|${record.authoringId}`;
  return `${VERSIONS.namespace}-${record.level.toLowerCase()}-${record.questionType}-${crypto.createHash("sha256").update(identity).digest("hex").slice(0, 16)}`;
};

function validateCommon(record, sourceById) {
  const label = record?.authoringId || "record";
  ["authoringId","level","section","questionType","sourceBank","reviewStatus","reviewVersion","reviewMethod","explanation","derivationVersion"].forEach(key => requireString(record?.[key], `${label}.${key}`));
  if (!Number.isInteger(record.sourceId) || !sourceById.has(record.sourceId)) fail(`${label} has missing source ID`);
  if (!TYPES.includes(record.questionType)) fail(`${label} has unsupported questionType`);
  if (record.level !== "N5" && record.level !== "N4") fail(`${label} has unsupported level`);
  if (record.level === "N5" && record.questionType === "usage") fail(`${label} attempts N5 usage`);
  if (record.section !== "vocabulary" || record.sourceBank !== "vocabulary.json") fail(`${label} has invalid routing metadata`);
  if (record.reviewStatus !== "approved-for-derived-bank" || record.reviewMethod !== "site-internal-editorial" || record.uniqueAnswerReviewed !== true) fail(`${label} has missing/unapproved review metadata`);
  if (record.reviewVersion !== "17c7c-review-v1" || record.derivationVersion !== VERSIONS.derivation || !Array.isArray(record.reviewTags) || record.reviewTags.length === 0) fail(`${label} lacks versioned review metadata`);
  const source = sourceById.get(record.sourceId);
  if (source.level !== record.level) fail(`${label} level mismatch`);
  const fields = ["word","kana","meaning","partOfSpeech","example","exampleKana","exampleMeaning"];
  fields.forEach(key => { if (record.sourceSnapshot?.[key] !== source[key]) fail(`${label} source snapshot ${key} drift`); });
  if (!Array.isArray(record.sourceIds) || record.sourceIds.length < 1 || record.sourceIds[0] !== record.sourceId || new Set(record.sourceIds).size !== record.sourceIds.length) fail(`${label} has invalid sourceIds`);
  record.sourceIds.forEach(id => {
    const joined = sourceById.get(id);
    if (!joined) fail(`${label} references missing source ID ${id}`);
    if (joined.level !== record.level) fail(`${label} attempts cross-level fallback`);
  });
  return source;
}

function validateParaphrase(record, source) {
  const label = record.authoringId;
  ["targetExpression","targetExpressionKana","prompt","promptKana","equivalentExpression","equivalentExpressionKana","interchangeabilityScope","semanticReviewId"].forEach(key => requireString(record[key], `${label}.${key}`));
  if (record.targetExpression !== source.word || record.targetExpressionKana !== source.kana) fail(`${label} target snapshot mismatch`);
  if (record.equivalentSource?.kind !== "authored-expression" && record.equivalentSource?.kind !== "vocabulary-source") fail(`${label} must declare equivalent expression provenance`);
  if (record.equivalentSource.kind === "authored-expression") {
    if (record.equivalentSource.sourceId != null) fail(`${label} authored expression must not invent sourceId`);
  } else {
    const equivalent = arguments[2]?.get(record.equivalentSource.sourceId);
    if (!equivalent || equivalent.level !== record.level || equivalent.word !== record.equivalentExpression || equivalent.kana !== record.equivalentExpressionKana || !record.sourceIds.includes(equivalent.id)) fail(`${label} equivalent vocabulary source mismatch`);
  }
  if (!Array.isArray(record.options) || record.options.length !== 4) fail(`${label} must have four options`);
  const expressions = record.options.map(x => x?.expression);
  if (expressions.some(x => typeof x !== "string" || !x.trim()) || new Set(expressions).size !== 4) fail(`${label} has blank or duplicate options`);
  if (!Number.isInteger(record.answerIndex) || record.answerIndex < 0 || record.answerIndex > 3) fail(`${label} answerIndex out of bounds`);
  if (record.options.filter(x => x.acceptedAsCorrect === true).length !== 1 || record.options[record.answerIndex].acceptedAsCorrect !== true || record.options[record.answerIndex].expression !== record.equivalentExpression) fail(`${label} must have exactly one accepted answer`);
  record.options.forEach((option, index) => {
    requireString(option.expressionKana, `${label}.options[${index}].expressionKana`);
    requireString(option.languageReviewStatus, `${label}.options[${index}].languageReviewStatus`);
    if (index !== record.answerIndex) requireString(option.incorrectReason, `${label}.options[${index}].incorrectReason`);
    if (index !== record.answerIndex && option.acceptedAsCorrect !== false) fail(`${label} has invalid rejected option review`);
  });
}

function validateUsage(record, source) {
  const label = record.authoringId;
  ["targetWord","targetKana","prompt","usageReviewId"].forEach(key => requireString(record[key], `${label}.${key}`));
  if (record.level !== "N4" || record.targetWord !== source.word || record.targetKana !== source.kana) fail(`${label} usage target mismatch`);
  if (!Array.isArray(record.usageSentences) || record.usageSentences.length !== 4) fail(`${label} must have four usage sentences`);
  const sentences = record.usageSentences.map(x => x?.sentence);
  if (sentences.some(x => typeof x !== "string" || !x.trim()) || new Set(sentences).size !== 4) fail(`${label} has blank or duplicate sentences`);
  if (!Number.isInteger(record.correctUsageIndex) || record.correctUsageIndex < 0 || record.correctUsageIndex > 3) fail(`${label} correctUsageIndex out of bounds`);
  if (!Array.isArray(record.incorrectUsageReasons) || record.incorrectUsageReasons.length !== 3) fail(`${label} must have three incorrect usage reasons`);
  const reviewedIndexes = new Set();
  record.incorrectUsageReasons.forEach((review, index) => {
    if (!Number.isInteger(review?.usageIndex) || review.usageIndex === record.correctUsageIndex || reviewedIndexes.has(review.usageIndex)) fail(`${label}.incorrectUsageReasons[${index}] has invalid usageIndex`);
    reviewedIndexes.add(review.usageIndex); requireString(review.reason, `${label}.incorrectUsageReasons[${index}].reason`); requireString(review.languageReviewStatus, `${label}.incorrectUsageReasons[${index}].languageReviewStatus`);
  });
  record.usageSentences.forEach((item, index) => {
    requireString(item.sentenceKana, `${label}.usageSentences[${index}].sentenceKana`);
    if (hasHan(item.sentenceKana)) fail(`${label}.usageSentences[${index}] sentenceKana is not a complete kana rendering`);
    const hit = item.targetOccurrence;
    if (!Number.isInteger(hit?.start) || !Number.isInteger(hit?.end) || item.sentence.slice(hit.start, hit.end) !== record.targetWord) fail(`${label}.usageSentences[${index}] target occurrence index mismatch`);
    if (occurrences(item.sentence, record.targetWord) !== 1 || occurrences(item.sentenceKana, record.targetKana) !== 1) fail(`${label}.usageSentences[${index}] target surface/kana must occur exactly once`);
    if (typeof item.acceptedAsCorrect !== "boolean" || item.acceptedAsCorrect !== (index === record.correctUsageIndex)) fail(`${label}.usageSentences[${index}] acceptance mismatch`);
  });
}

function buildData(vocabulary, paraphraseManifest, usageManifest) {
  if (!Array.isArray(vocabulary)) fail("source must be an array");
  for (const [name, manifest, type] of [["paraphrase",paraphraseManifest,"paraphrase"],["usage",usageManifest,"usage"]]) {
    if (!manifest || manifest.schemaVersion !== VERSIONS.schema || manifest.manifestVersion !== VERSIONS.manifest || manifest.questionType !== type || !Array.isArray(manifest.records)) fail(`${name} manifest schema/version mismatch`);
  }
  const sourceById = new Map(vocabulary.map(item => [item.id, item]));
  const all = [...paraphraseManifest.records, ...usageManifest.records];
  if (all.length !== paraphraseManifest.records.length + usageManifest.records.length) fail("manifest records may not be filtered");
  const authoringIds = new Set(), reviewIds = new Set();
  const questions = all.map(record => {
    const source = validateCommon(record, sourceById);
    if (authoringIds.has(record.authoringId)) fail(`duplicate authoringId ${record.authoringId}`); authoringIds.add(record.authoringId);
    if (record.questionType === "paraphrase") {
      validateParaphrase(record, source, sourceById);
      if (reviewIds.has(record.semanticReviewId)) fail(`duplicate review ID ${record.semanticReviewId}`); reviewIds.add(record.semanticReviewId);
    } else {
      validateUsage(record, source);
      if (reviewIds.has(record.usageReviewId)) fail(`duplicate review ID ${record.usageReviewId}`); reviewIds.add(record.usageReviewId);
    }
    const options = record.questionType === "paraphrase" ? record.options.map(x => x.expression) : record.usageSentences.map(x => x.sentence);
    const answerIndex = record.questionType === "paraphrase" ? record.answerIndex : record.correctUsageIndex;
    const id = stableId(record);
    const common = { id, sourceQuestionId:`vocabulary.json#${record.sourceId}:${record.questionType}:${record.authoringId}`, manifestAuthoringId:record.authoringId, level:record.level, section:"vocabulary", questionType:record.questionType, sourceBank:"vocabulary.json", sourceIds:record.sourceIds, originalText:source.example, displayText:record.prompt, prompt:record.prompt, kana:source.kana, promptKana:record.promptKana || null, options, answerIndex, answerDisplay:options[answerIndex], explanation:record.explanation, kanjiPolicy:"record-display-reviewed", rubyTerms:[], reviewStatus:record.reviewStatus, reviewVersion:record.reviewVersion, reviewMethod:record.reviewMethod, reviewTags:record.reviewTags, uniqueAnswerReviewed:true, derivationVersion:record.derivationVersion };
    if (record.questionType === "paraphrase") Object.assign(common,{targetExpression:record.targetExpression,targetExpressionKana:record.targetExpressionKana,equivalentExpression:record.equivalentExpression,equivalentExpressionKana:record.equivalentExpressionKana,interchangeabilityScope:record.interchangeabilityScope,semanticReviewId:record.semanticReviewId,optionReviews:record.options});
    else Object.assign(common,{targetWord:record.targetWord,targetKana:record.targetKana,usageSentences:record.usageSentences,correctUsageIndex:record.correctUsageIndex,incorrectUsageReasons:record.incorrectUsageReasons,usageReviewId:record.usageReviewId});
    return common;
  }).sort((a,b) => a.level.localeCompare(b.level) || TYPES.indexOf(a.questionType)-TYPES.indexOf(b.questionType) || a.manifestAuthoringId.localeCompare(b.manifestAuthoringId));
  const inventory={N5:{paraphrase:0,usage:0,total:0},N4:{paraphrase:0,usage:0,total:0},total:questions.length,note:"data inventory / seed capacity; not a product quota"};
  questions.forEach(q=>{inventory[q.level][q.questionType]++;inventory[q.level].total++;});
  if (inventory.N5.paraphrase!==12 || inventory.N4.paraphrase!==12 || inventory.N4.usage!==12 || inventory.N5.usage!==0 || questions.length!==36) fail("inventory must be N5 paraphrase 12, N4 paraphrase 12, N4 usage 12, N5 usage 0");
  if (new Set(questions.map(q=>q.id)).size!==questions.length || new Set(questions.map(q=>q.sourceQuestionId)).size!==questions.length) fail("duplicate derived ID or sourceQuestionId");
  return {schemaVersion:VERSIONS.schema,derivationVersion:VERSIONS.derivation,manifestVersion:VERSIONS.manifest,disclaimer:"site-internal editorial-reviewed semantic seed data; not connected to production sessions.",generatedFrom:["vocabulary.json","japaneseJlptVocabularyParaphraseReviewManifest.json","japaneseJlptVocabularyUsageReviewManifest.json"],inventory,questions};
}
function serialize(data){return `${JSON.stringify(data,null,2)}\n`;}
function readJson(file){return JSON.parse(fs.readFileSync(file,"utf8"));}
function main(){
  const bytes=serialize(buildData(readJson(PATHS.source),readJson(PATHS.paraphrase),readJson(PATHS.usage)));
  if(process.argv.includes("--check")){if(!fs.existsSync(PATHS.output)||fs.readFileSync(PATHS.output,"utf8")!==bytes)fail("committed output drift; run builder without --check");console.log("PASS: Batch 17C-7C derived bank is byte-for-byte current.");return;}
  const temporary=`${PATHS.output}.tmp-${process.pid}`; fs.writeFileSync(temporary,bytes); fs.renameSync(temporary,PATHS.output); console.log(`Built ${path.basename(PATHS.output)}.`);
}
if(require.main===module){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={buildData,serialize,stableId,VERSIONS,PATHS};
