#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "vocabulary.json");
const MANIFEST = path.join(ROOT, "japaneseJlptVocabularyAutoReviewManifest.json");
const OUTPUT = path.join(ROOT, "japaneseJlptVocabularyAutoQuestions.json");
const VERSIONS = Object.freeze({ schema: "1.0.0", manifest: "17c7b-v1", policy: "17b1-internal-v1", derivation: "17c7b-v1" });
const TYPES = ["kanji-reading", "orthography", "context"];
const hasKanji = (value) => /[\u3400-\u9fff々]/u.test(value);
const occurrences = (text, term) => term ? text.split(term).length - 1 : 0;
const fail = (message) => { throw new Error(`Batch 17C-7B build: ${message}`); };
const requireString = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`); };

function validateReview(record, sourceById) {
  const label = record && record.authoringId || "record";
  ["authoringId", "level", "section", "questionType", "sourceBank", "reviewStatus", "reviewVersion", "reviewMethod", "explanation", "derivationVersion"].forEach(key => requireString(record[key], `${label}.${key}`));
  if (!Number.isInteger(record.sourceId) || !sourceById.has(record.sourceId)) fail(`${label} has missing source ID`);
  if (!TYPES.includes(record.questionType)) fail(`${label} has unsupported question type`);
  if (record.authoringId !== `17c7b-${record.level.toLowerCase()}-${record.questionType}-src-${record.sourceId}`) fail(`${label} must use source-based stable authoring ID`);
  if (record.section !== "vocabulary" || record.sourceBank !== "vocabulary.json") fail(`${label} has invalid routing metadata`);
  if (record.reviewStatus !== "approved-for-derived-bank" || record.reviewMethod !== "site-internal-editorial" || record.uniqueAnswerReviewed !== true) fail(`${label} is not fully approved`);
  if (record.derivationVersion !== VERSIONS.derivation || !Array.isArray(record.reviewTags) || !record.reviewTags.length || !record.targetReview) fail(`${label} lacks review metadata`);
  const source = sourceById.get(record.sourceId);
  if (source.level !== record.level) fail(`${label} level mismatch`);
  const snapshot = record.sourceSnapshot || {};
  ["word", "kana", "meaning", "partOfSpeech", "example", "exampleKana", "exampleMeaning"].forEach(key => {
    if (snapshot[key] !== source[key]) fail(`${label} source ${key} drift`);
  });
  if (!Array.isArray(record.sourceIds) || record.sourceIds[0] !== record.sourceId) fail(`${label} sourceIds must begin with target`);
  record.sourceIds.forEach(id => {
    const joined = sourceById.get(id);
    if (!joined) fail(`${label} references missing source ID ${id}`);
    if (joined.level !== record.level) fail(`${label} attempts cross-level fallback`);
  });
  if (!Array.isArray(record.options) || record.options.length !== 4 || record.options.some(x => typeof x !== "string" || !x.trim()) || new Set(record.options).size !== 4) fail(`${label} must have four unique options`);
  if (!Number.isInteger(record.answerIndex) || record.answerIndex < 0 || record.answerIndex > 3 || record.options[record.answerIndex] !== record.correctOption || record.options.filter(x => x === record.correctOption).length !== 1) fail(`${label} must have exactly one correct option`);
  if (!Array.isArray(record.distractors) || record.distractors.length !== 3) fail(`${label} lacks distractor reviews`);
  record.distractors.forEach((item, index) => {
    requireString(item.value, `${label}.distractors[${index}].value`); requireString(item.incorrectReason, `${label}.distractors[${index}].incorrectReason`); requireString(item.languageReviewStatus, `${label}.distractors[${index}].languageReviewStatus`);
    if (item.acceptedAsCorrect !== false || item.value === record.correctOption) fail(`${label} has invalid distractor`);
  });
  if (record.questionType === "kanji-reading") {
    if (record.testedWord !== source.word || record.testedReading !== source.kana || !hasKanji(record.testedWord)) fail(`${label} reading target drift`);
    if (record.prompt.includes(source.kana) || /<ruby|<rt/i.test(record.prompt)) fail(`${label} reading prompt leaks answer`);
    if (!record.readingReview || record.readingReview.ambiguous !== false || record.readingReview.commonAlternateReadingsReviewed !== true || !record.kanjiReview || record.kanjiReview.displayedKanjiReviewed !== true || !Array.isArray(record.distractorReviews) || record.distractorReviews.length !== 3) fail(`${label} lacks reading/kanji review`);
  } else if (record.questionType === "orthography") {
    if (record.correctOrthography !== source.word || !record.promptKana.includes(`【${source.kana}】`) || !record.renderingPolicy || !Array.isArray(record.optionReviews) || record.optionReviews.length !== 4) fail(`${label} lacks orthography review`);
    const o = record.targetOccurrence || {};
    if (source.example.slice(o.sourceStart, o.sourceEnd) !== source.word || source.exampleKana.slice(o.kanaStart, o.kanaEnd) !== source.kana) fail(`${label} orthography occurrence mismatch`);
    record.optionReviews.forEach(x => { if (!x.displayKanjiReviewStatus || !x.languageReviewStatus || (x.acceptedAsCorrect === false && !x.incorrectReason)) fail(`${label} incomplete option review`); });
  } else {
    if (occurrences(source.example, source.word) !== 1 || occurrences(source.exampleKana, source.kana) !== 1 || record.targetPartOfSpeech !== source.partOfSpeech) fail(`${label} context alignment is unsafe`);
    const o = record.targetOccurrence || {};
    if (source.example.slice(o.sourceStart, o.sourceEnd) !== source.word || source.exampleKana.slice(o.kanaStart, o.kanaEnd) !== source.kana) fail(`${label} context occurrence mismatch`);
    const expectedWord = source.example.slice(0, o.sourceStart) + "＿＿" + source.example.slice(o.sourceEnd);
    const expectedKana = source.exampleKana.slice(0, o.kanaStart) + "＿＿" + source.exampleKana.slice(o.kanaEnd);
    if (record.blankedPrompt !== expectedWord || record.blankedPromptKana !== expectedKana || record.correctOption !== source.kana) fail(`${label} context blank is not index-derived`);
    if (!record.inflectionMetadata || record.inflectionMetadata.rule !== "uninflected-exact-surface" || !Array.isArray(record.substitutionReviews) || record.substitutionReviews.length !== 4) fail(`${label} lacks substitution review`);
    record.substitutionReviews.forEach(x => { if (!x.substitutedSentence || x.grammarFormReviewed !== true || x.semanticFitReviewed !== true || !x.languageReviewStatus || (x.acceptedAsCorrect === false && !x.incorrectReason)) fail(`${label} incomplete substitution review`); });
  }
  return source;
}

function buildData(vocabulary, manifest) {
  if (!Array.isArray(vocabulary) || !manifest || manifest.schemaVersion !== VERSIONS.schema || manifest.manifestVersion !== VERSIONS.manifest || manifest.sourcePolicyVersion !== VERSIONS.policy || !Array.isArray(manifest.records)) fail("manifest/source schema or version mismatch");
  const sourceById = new Map(vocabulary.map(item => [item.id, item]));
  const seenTargets = new Map();
  const records = manifest.records.filter(record => record.reviewStatus === "approved-for-derived-bank" && record.uniqueAnswerReviewed === true);
  const questions = records.map(record => {
    const source = validateReview(record, sourceById);
    const levelTargets = seenTargets.get(record.level) || new Set();
    if (levelTargets.has(record.sourceId)) fail(`${record.level} target ${record.sourceId} is reused`);
    levelTargets.add(record.sourceId); seenTargets.set(record.level, levelTargets);
    const id = `jlpt-vocab-17c7b-${record.level.toLowerCase()}-${record.questionType}-src-${record.sourceId}`;
    const common = {id,sourceQuestionId:`vocabulary.json#${record.sourceId}`,level:record.level,section:"vocabulary",questionType:record.questionType,sourceBank:"vocabulary.json",sourceIds:record.sourceIds,originalText:source.example,displayText:record.questionType === "context" ? record.blankedPromptKana : (record.questionType === "orthography" ? record.promptKana : record.prompt),kana:source.kana,promptKana:record.questionType === "orthography" ? record.promptKana : (record.questionType === "context" ? record.blankedPromptKana : null),options:record.options,answerIndex:record.answerIndex,answerDisplay:record.correctOption,explanation:record.explanation,kanjiPolicy:record.questionType === "kanji-reading" ? "level-native-record-reviewed" : "record-display-reviewed",rubyTerms:[],reviewStatus:record.reviewStatus,reviewVersion:record.reviewVersion,reviewMethod:record.reviewMethod,reviewTags:record.reviewTags,uniqueAnswerReviewed:true,derivationVersion:VERSIONS.derivation};
    if (record.questionType === "kanji-reading") Object.assign(common,{testedWord:record.testedWord,testedReading:record.testedReading,testedKanji:record.testedKanji,readingReview:record.readingReview,kanjiReview:record.kanjiReview,distractorReviews:record.distractorReviews,distractors:record.distractors});
    if (record.questionType === "orthography") Object.assign(common,{sourceExample:record.sourceExample,sourceExampleKana:record.sourceExampleKana,sourceExampleMeaning:record.sourceExampleMeaning,targetOccurrence:record.targetOccurrence,correctOrthography:record.correctOrthography,orthographyRiskTags:record.orthographyRiskTags,optionReviews:record.optionReviews,renderingPolicy:record.renderingPolicy,distractors:record.distractors});
    if (record.questionType === "context") Object.assign(common,{sourceExample:record.sourceExample,sourceExampleKana:record.sourceExampleKana,sourceExampleMeaning:record.sourceExampleMeaning,blankedPrompt:record.blankedPrompt,blankedPromptKana:record.blankedPromptKana,targetOccurrence:record.targetOccurrence,inflectionMetadata:record.inflectionMetadata,targetPartOfSpeech:record.targetPartOfSpeech,optionSourceIds:record.optionSourceIds,substitutionReviews:record.substitutionReviews,distractors:record.distractors});
    return common;
  }).sort((a,b) => a.level.localeCompare(b.level) || TYPES.indexOf(a.questionType)-TYPES.indexOf(b.questionType) || Number(a.sourceQuestionId.split("#")[1])-Number(b.sourceQuestionId.split("#")[1]));
  const inventory = {N5:{"kanji-reading":0,orthography:0,context:0,total:0},N4:{"kanji-reading":0,orthography:0,context:0,total:0},total:questions.length,note:"data inventory / seed capacity; not a product quota"};
  questions.forEach(q => { inventory[q.level][q.questionType]++; inventory[q.level].total++; });
  for (const level of ["N5","N4"]) { if (inventory[level].total !== 36 || seenTargets.get(level)?.size !== 36) fail(`${level} must contain 36 unique targets`); TYPES.forEach(type => { if (inventory[level][type] !== 12) fail(`${level}/${type} must contain 12 records`); }); }
  if (questions.length !== 72 || new Set(questions.map(q=>q.id)).size !== 72 || new Set(questions.map(q=>q.sourceQuestionId)).size !== 72) fail("derived identities are not unique");
  return {schemaVersion:VERSIONS.schema,derivationVersion:VERSIONS.derivation,manifestVersion:VERSIONS.manifest,sourcePolicyVersion:VERSIONS.policy,disclaimer:manifest.disclaimer,generatedFrom:["vocabulary.json","japaneseJlptVocabularyAutoReviewManifest.json"],inventory,questions};
}

function serialize(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function main() {
  const vocabulary = JSON.parse(fs.readFileSync(SOURCE,"utf8")); const manifest = JSON.parse(fs.readFileSync(MANIFEST,"utf8")); const bytes = serialize(buildData(vocabulary,manifest));
  if (process.argv.includes("--check")) { if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT,"utf8") !== bytes) fail("committed output drift; run builder without --check"); console.log("PASS: Batch 17C-7B derived bank is byte-for-byte current."); }
  else { const temporary=`${OUTPUT}.tmp-${process.pid}`; fs.writeFileSync(temporary,bytes); fs.renameSync(temporary,OUTPUT); console.log(`Built ${path.basename(OUTPUT)}.`); }
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode=1; } }
module.exports={buildData,serialize,VERSIONS};
