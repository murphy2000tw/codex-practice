#!/usr/bin/env node
"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_PATH = path.join(ROOT, "japaneseJlptReadingN5ReviewedSource.json");
const MANIFEST_PATH = path.join(ROOT, "japaneseJlptReadingN5ReviewManifest.json");
const OUTPUT_PATH = path.join(ROOT, "japaneseJlptReadingN5Questions.json");
const N4_PATH = path.join(ROOT, "japaneseJlptReadingQuestions.json");
const SCHEMA_VERSION = "1.0.0";
const DATA_VERSION = "17c9c-n5-reading-v1";
const DERIVATION_VERSION = "17c9c-v1";
const SOURCE_VERSION = "17c9b-v1";
const MANIFEST_VERSION = "17c9b-v1";
const REVIEW_VERSION = "17c9b-review-v1";
const REVIEW_STATUS = "approved-for-derived-bank";
const REVIEW_METHOD = "site-internal-editorial";
const SECTIONS = Object.freeze(["short-passage", "medium-passage", "information-search", "notice-and-message"]);
const DISTRIBUTION = Object.freeze({"short-passage":[2,2],"medium-passage":[2,4],"information-search":[2,4],"notice-and-message":[2,2]});
const DISCLAIMER = "本站資料僅為 site-internal JLPT-style（站內 JLPT 風格）練習素材；不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方認證內容。";
const MARKUP = /<\/?[a-z][^>]*>|javascript\s*:|on(?:click|error|load)\s*=|<script/iu;
const HAN = /\p{Script=Han}/u;
const GENERIC_REASON = /^(?:不正確|不符合題意)[。.]?$|這個選項不符合題目要求，因此不是正確答案|本文と一致しないため不正解|這個答案與本文不同，所以不能選/u;

const clone = (value) => structuredClone(value);
function stableComparator(left, right) {
  const a = Array.from(left), b = Array.from(right);
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    const difference = a[i].codePointAt(0) - b[i].codePointAt(0);
    if (difference) return difference;
  }
  return a.length - b.length;
}
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort(stableComparator).map((key) => [key, canonicalize(value[key])]));
  return value;
}
const canonicalJSON = (value) => JSON.stringify(canonicalize(value));
function sourceDigest(set) {
  const copy = clone(set); delete copy.sourceDigest;
  return crypto.createHash("sha256").update(canonicalJSON(copy), "utf8").digest("hex");
}
const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;
const text = (value) => typeof value === "string" && value.trim().length > 0;
function scanSafe(value, label) {
  if (typeof value === "string") assert(!MARKUP.test(value), `${label} contains executable markup`);
  else if (Array.isArray(value)) value.forEach((item, index) => scanSafe(item, `${label}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => scanSafe(item, `${label}.${key}`));
}
function projection(material) {
  return [material.headings[0].label, material.columns.map((x) => x.label).join("｜"), ...material.rows.map((row) => row.cells.map((cell) => cell.text).join("｜"))].join("\n");
}
function validateQuestion(question, set, globalQuestionIds, globalSourceQuestionIds) {
  assert(text(question.id) && text(question.sourceQuestionId), "stable question identities are required");
  assert(/^jlpt-reading-17c9b-n5-[a-z-]+$/.test(question.id) && !/(?:^|-)\d+$/.test(question.id), "array-position question identity");
  assert(!globalQuestionIds.has(question.id), `duplicate question ID: ${question.id}`); globalQuestionIds.add(question.id);
  assert(!globalSourceQuestionIds.has(question.sourceQuestionId), `duplicate sourceQuestion ID: ${question.sourceQuestionId}`); globalSourceQuestionIds.add(question.sourceQuestionId);
  assert(text(question.question) && text(question.questionKana) && text(question.explanation), "question text/kana/explanation required");
  assert(Array.isArray(question.options) && question.options.length === 4 && question.options.every(text) && new Set(question.options).size === 4, "four distinct nonempty options required");
  assert(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3, "answerIndex must be 0..3");
  assert.strictEqual(question.answerDisplay, question.options[question.answerIndex], "answerDisplay mismatch");
  assert.strictEqual(question.uniqueAnswerReviewed, true, "uniqueAnswerReviewed must be true");
  assert(Array.isArray(question.optionReviews) && question.optionReviews.length === 4, "four option reviews required");
  const rejectedReasons = [];
  question.optionReviews.forEach((review, index) => {
    assert.strictEqual(review.optionIndex, index, "option review index order drift");
    assert.strictEqual(review.option, question.options[index], "option review option drift");
    assert(text(review.reason), "option review reason required");
    if (index === question.answerIndex) assert.strictEqual(review.verdict, "supported", "answer must be supported");
    else { assert.strictEqual(review.verdict, "rejected", "distractor must be rejected"); assert(!GENERIC_REASON.test(review.reason.trim()), "generic distractor reason"); rejectedReasons.push(review.reason.trim()); }
  });
  assert.strictEqual(question.optionReviews.filter((x) => x.verdict === "supported").length, 1, "exactly one supported option required");
  assert.strictEqual(new Set(rejectedReasons).size, 3, "distractor reasons must differ");
  assert(text(question.correctAnswerReview), "correctAnswerReview required");
  if (set.section === "information-search") validateInformationEvidence(question, set.material);
  else {
    assert(Array.isArray(question.passageEvidence) && question.passageEvidence.length, "passage evidence required");
    const length = Array.from(set.passage).length;
    const spans = new Set();
    question.passageEvidence.forEach((evidence) => {
      assert(text(evidence.spanId) && !spans.has(evidence.spanId), "duplicate/missing passage span"); spans.add(evidence.spanId);
      assert(Number.isInteger(evidence.startCodePoint) && Number.isInteger(evidence.endCodePoint) && evidence.startCodePoint >= 0 && evidence.startCodePoint < evidence.endCodePoint && evidence.endCodePoint <= length, "passage evidence offset out of bounds");
      assert.strictEqual(Array.from(set.passage).slice(evidence.startCodePoint, evidence.endCodePoint).join(""), evidence.text, "passage evidence text mismatch");
    });
  }
}
function validateInformationEvidence(question, material) {
  assert(material && material.type === "labeled-table" && text(material.plainTextProjection), "safe structured material and projection required");
  assert.strictEqual(projection(material), material.plainTextProjection, "plain-text material projection drift");
  const allIds = new Set();
  [...material.headings, ...material.columns, ...material.rows, ...material.rows.flatMap((row) => row.cells)].forEach((item) => { assert(text(item.id) && !allIds.has(item.id), "duplicate material identity"); allIds.add(item.id); });
  const rows = new Map(material.rows.map((row) => [row.id, new Set(row.cells.map((cell) => cell.id))]));
  assert(["referenced-row", "all-material-rows"].includes(question.informationEvidenceScope), "invalid information evidence scope");
  assert(Array.isArray(question.informationEvidence) && question.informationEvidence.length, "information evidence required");
  const seenRows = new Set(), seenCells = new Set();
  question.informationEvidence.forEach((evidence) => {
    const owned = rows.get(evidence.rowId);
    assert(owned && Array.isArray(evidence.cellIds) && evidence.cellIds.length >= 2 && evidence.cellIds.every((id) => owned.has(id)), "cross-row information evidence");
    assert(!seenRows.has(evidence.rowId), "duplicate evidence row"); seenRows.add(evidence.rowId);
    evidence.cellIds.forEach((id) => { assert(!seenCells.has(id), "duplicate evidence cell"); seenCells.add(id); });
  });
  if (question.informationEvidenceScope === "all-material-rows") assert.strictEqual(seenRows.size, rows.size, "comparison evidence must include every material row");
}
function validateInputs(source, manifest, n4Data = {readingSets:[]}) {
  scanSafe(source, "source"); scanSafe(manifest, "manifest");
  assert.strictEqual(source.schemaVersion, SCHEMA_VERSION); assert.strictEqual(source.sourceVersion, SOURCE_VERSION); assert.strictEqual(source.reviewVersion, REVIEW_VERSION); assert.strictEqual(source.productQuota, false);
  assert.strictEqual(source.disclaimer, DISCLAIMER); assert(Array.isArray(source.sets) && source.sets.length === 8, "source requires 8 sets");
  assert.strictEqual(manifest.schemaVersion, SCHEMA_VERSION); assert.strictEqual(manifest.manifestVersion, MANIFEST_VERSION); assert.strictEqual(manifest.sourceVersion, SOURCE_VERSION); assert.strictEqual(manifest.reviewVersion, REVIEW_VERSION);
  assert.strictEqual(manifest.seedCapacity, true); assert.strictEqual(manifest.productQuota, false); assert(Array.isArray(manifest.records) && manifest.records.length === 8, "manifest requires 8 records");
  assert.strictEqual(manifest.inventory.sets, 8); assert.strictEqual(manifest.inventory.questions, 12);
  const records = new Map(); manifest.records.forEach((record) => { assert(text(record.setId) && !records.has(record.setId), "duplicate manifest record"); records.set(record.setId, record); });
  const n4Sets = n4Data.readingSets || [];
  const n4Ids = new Set(n4Sets.flatMap((set) => [set.id,set.sourceSetId,...set.questions.flatMap((q) => [q.id,q.sourceQuestionId])].filter(Boolean)));
  const n4Content = new Set(n4Sets.flatMap((set) => [set.originalPassage,set.displayPassage,...set.questions.flatMap((q) => [q.originalText,q.displayText,JSON.stringify(q.options)])].filter(Boolean)));
  const setIds = new Set(), qids = new Set(), sqids = new Set(), counts = Object.fromEntries(SECTIONS.map((section) => [section, [0, 0]]));
  for (const set of source.sets) {
    assert(SECTIONS.includes(set.section), "unknown section"); assert.strictEqual(set.level, "N5"); assert(/^jlpt-reading-17c9b-n5-[a-z-]+$/.test(set.id) && !/(?:^|-)\d+$/.test(set.id), "array-position set identity");
    assert(!n4Ids.has(set.id) && !n4Content.has(set.passage), "N4 set identity/content reuse");
    assert(!setIds.has(set.id), `duplicate set ID: ${set.id}`); setIds.add(set.id); counts[set.section][0] += 1; counts[set.section][1] += set.questions.length;
    ["sourceType","title","passage","passageKana","kanjiKanaPolicy","uniqueAnswerReviewSummary","disclaimer","provenance"].forEach((key) => assert(text(set[key]), `${set.id}.${key} required`));
    const passageRange = {"short-passage":[35,80],"medium-passage":[70,130],"information-search":[45,110],"notice-and-message":[35,90]}[set.section];
    assert(Array.from(set.passage).length >= passageRange[0] && Array.from(set.passage).length <= passageRange[1], "passage length outside reviewed range");
    assert.strictEqual(set.reviewStatus, REVIEW_STATUS); assert.strictEqual(set.reviewVersion, REVIEW_VERSION); assert.strictEqual(set.reviewMethod, REVIEW_METHOD);
    assert(Array.isArray(set.rubyTerms), "rubyTerms required"); set.rubyTerms.forEach((term) => assert(text(term.text) && text(term.reading) && !HAN.test(term.reading), "invalid ruby reading"));
    const displays = [set.title, set.passage, ...set.questions.flatMap((q) => [q.question, ...q.options])];
    displays.forEach((display) => (display.match(/\p{Script=Han}+/gu) || []).forEach((han) => assert(set.rubyTerms.some((term) => term.text.includes(han) || han.includes(term.text)), "ruby coverage missing")));
    if (set.section === "information-search") assert(set.material, "information material required"); else assert(!set.material, "material only allowed for information-search");
    set.questions.forEach((question) => { assert(!n4Ids.has(question.id) && !n4Ids.has(question.sourceQuestionId) && !n4Content.has(question.question) && !n4Content.has(JSON.stringify(question.options)), "N4 question identity/content reuse"); validateQuestion(question, set, qids, sqids); });
    const digest = sourceDigest(set); assert.strictEqual(set.sourceDigest, digest, "source digest drift");
    const record = records.get(set.id); assert(record, `manifest record missing: ${set.id}`);
    assert.strictEqual(canonicalJSON(record.sourceSnapshot), canonicalJSON(set), "source snapshot drift"); assert.strictEqual(record.sourceDigest, digest, "manifest digest drift");
    assert.strictEqual(record.level, set.level); assert.strictEqual(record.section, set.section); assert.strictEqual(record.reviewStatus, set.reviewStatus); assert.strictEqual(record.reviewVersion, set.reviewVersion); assert.strictEqual(record.reviewMethod, set.reviewMethod);
    assert.deepStrictEqual(record.questionIds, set.questions.map((question) => question.id), "manifest question IDs drift");
  }
  assert.strictEqual(records.size, setIds.size); records.forEach((_, id) => assert(setIds.has(id), `orphan manifest record: ${id}`));
  assert.strictEqual(qids.size, 12); assert.strictEqual(sqids.size, 12);
  SECTIONS.forEach((section) => { assert.deepStrictEqual(counts[section], DISTRIBUTION[section], `${section} distribution drift`); assert.deepStrictEqual([manifest.inventory.sections[section].sets, manifest.inventory.sections[section].questions], DISTRIBUTION[section]); });
}
function deriveSet(set) {
  const questions = set.questions.map((question) => ({
    id: question.id, sourceQuestionId: question.sourceQuestionId, originalText: question.question, displayText: question.question,
    questionKana: question.questionKana, options: clone(question.options), answerIndex: question.answerIndex, answerDisplay: question.answerDisplay,
    explanation: question.explanation, uniqueAnswerReviewed: question.uniqueAnswerReviewed, optionReviews: clone(question.optionReviews), correctAnswerReview: question.correctAnswerReview,
    ...(question.passageEvidence ? { passageEvidence: clone(question.passageEvidence) } : {}),
    ...(question.informationEvidence ? { informationEvidence: clone(question.informationEvidence), informationEvidenceScope: question.informationEvidenceScope } : {}),
    derivationVersion: DERIVATION_VERSION,
  }));
  return { id:set.id, sourceSetId:set.id, level:set.level, section:set.section, type:set.sourceType, sourceType:set.sourceType,
    originalTitle:set.title, displayTitle:set.title, originalPassage:set.passage, displayPassage:set.passage, passageKana:set.passageKana,
    rubyTerms:clone(set.rubyTerms), rubyCoverage:{status:"complete",coveredTerms:set.rubyTerms.map((x)=>x.text),uncoveredHan:[]}, kanjiPolicy:set.kanjiKanaPolicy,
    ...(set.material ? {material:clone(set.material)} : {}), sourceSetQuestionCount:questions.length, reviewStatus:set.reviewStatus, reviewVersion:set.reviewVersion,
    reviewMethod:set.reviewMethod, sourceDigest:sourceDigest(set), uniqueAnswerReviewSummary:set.uniqueAnswerReviewSummary, disclaimer:set.disclaimer, provenance:set.provenance, questions };
}
function validateDerived(data, source) {
  scanSafe(data, "derived");
  assert.strictEqual(data.schemaVersion, SCHEMA_VERSION); assert.strictEqual(data.dataVersion, DATA_VERSION); assert.strictEqual(data.derivationVersion, DERIVATION_VERSION);
  assert.strictEqual(data.sourceVersion, SOURCE_VERSION); assert.strictEqual(data.manifestVersion, MANIFEST_VERSION); assert.strictEqual(data.reviewVersion, REVIEW_VERSION); assert.strictEqual(data.disclaimer, DISCLAIMER);
  assert.deepStrictEqual(data.generatedFrom, [path.basename(SOURCE_PATH), path.basename(MANIFEST_PATH)]);
  assert.deepStrictEqual(data.inventory, {level:"N5",setCount:8,questionCount:12,seedCapacity:true,productQuota:false,note:"seed capacity; not a product quota",sections:Object.fromEntries(SECTIONS.map((s)=>[s,{setCount:DISTRIBUTION[s][0],questionCount:DISTRIBUTION[s][1]}]))});
  assert(!Object.hasOwn(data, "availability") && !Object.hasOwn(data, "selectionProfile"), "activation/profile fields forbidden");
  const expected = source.sets.map(deriveSet).sort((a,b)=>SECTIONS.indexOf(a.section)-SECTIONS.indexOf(b.section)||stableComparator(a.sourceSetId,b.sourceSetId));
  assert.deepStrictEqual(data.readingSets, expected, "derived identity/text/answer/evidence drift");
}
function buildData(source, manifest, n4Data = {readingSets:[]}) {
  validateInputs(source, manifest, n4Data);
  const readingSets = source.sets.map(deriveSet).sort((a,b)=>SECTIONS.indexOf(a.section)-SECTIONS.indexOf(b.section)||stableComparator(a.sourceSetId,b.sourceSetId));
  const data = {schemaVersion:SCHEMA_VERSION,dataVersion:DATA_VERSION,derivationVersion:DERIVATION_VERSION,sourceVersion:SOURCE_VERSION,manifestVersion:MANIFEST_VERSION,reviewVersion:REVIEW_VERSION,disclaimer:DISCLAIMER,
    generatedFrom:[path.basename(SOURCE_PATH),path.basename(MANIFEST_PATH)],inventory:{level:"N5",setCount:8,questionCount:12,seedCapacity:true,productQuota:false,note:"seed capacity; not a product quota",sections:Object.fromEntries(SECTIONS.map((s)=>[s,{setCount:DISTRIBUTION[s][0],questionCount:DISTRIBUTION[s][1]}]))},readingSets};
  validateDerived(data, source); return data;
}
function readJSON(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function main(args = process.argv.slice(2)) {
  assert(args.length === 0 || (args.length === 1 && args[0] === "--check"), "usage: builder [--check]");
  const expected = serialize(buildData(readJSON(SOURCE_PATH), readJSON(MANIFEST_PATH), readJSON(N4_PATH)));
  if (args[0] === "--check") { assert(fs.existsSync(OUTPUT_PATH) && fs.readFileSync(OUTPUT_PATH, "utf8") === expected, "FAIL committed N5 derived bank drift"); console.log("PASS committed N5 derived bank matches deterministic build"); return; }
  const temporary = `${OUTPUT_PATH}.tmp`;
  try { fs.writeFileSync(temporary, expected, "utf8"); fs.renameSync(temporary, OUTPUT_PATH); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  console.log("PASS wrote japaneseJlptReadingN5Questions.json: 8 sets / 12 questions");
}
module.exports={buildData,validateInputs,validateDerived,serialize,canonicalize,canonicalJSON,sourceDigest,stableComparator,SCHEMA_VERSION,DATA_VERSION,DERIVATION_VERSION,SOURCE_VERSION,MANIFEST_VERSION,REVIEW_VERSION,SOURCE_PATH,MANIFEST_PATH,OUTPUT_PATH,N4_PATH,SECTIONS,DISTRIBUTION};
if (require.main === module) { try { main(); } catch (error) { console.error(`FAIL ${error.message}`); process.exitCode=1; } }
