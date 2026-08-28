#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");

const BASE = "5883d2f328be3571cc716fde85f724918e220864";
const DOC = "docs/japanese-jlpt-batch17c10a-product-quota-activation-plan.md";
const SELF = "scripts/check-japanese-jlpt-batch17c10a-product-quota-activation-plan.js";
const ALLOWED = new Set([DOC, SELF]);
const LEGACY_TYPES = new Set(["meaning", "cloze", "legacy-reading-question"]);
const EXPECTED_TYPES = {
  vocabulary: new Set(["kanji-reading", "orthography", "context", "paraphrase", "usage"]),
  grammar: new Set(["form-selection", "sentence-composition"]),
  reading: new Set(["short-passage", "medium-passage", "information-search", "notice-and-message"]),
};
const LOCKED_QUOTAS = {
  N5: { vocabulary: { "kanji-reading": 2, orthography: 2, context: 2, paraphrase: 2 }, grammar: { "form-selection": 2, "sentence-composition": 2 }, reading: { "short-passage": 2, "medium-passage": 2, "information-search": 2, "notice-and-message": 2 } },
  N4: { vocabulary: { "kanji-reading": 2, orthography: 2, context: 2, paraphrase: 2, usage: 2 }, grammar: { "form-selection": 4, "sentence-composition": 4 }, reading: { "short-passage": 4, "medium-passage": 4, "information-search": 4, "notice-and-message": 4 } },
};
const read = (path) => fs.readFileSync(path, "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const check = (value, message) => { if (!value) throw new Error(`Batch 17C-10B check: ${message}`); };

const documentText = read(DOC);
const match = documentText.match(/<!-- JLPT_17C10_PRODUCT_QUOTA_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- JLPT_17C10_PRODUCT_QUOTA_END -->/);
check(match, "machine-readable quota block missing or ambiguous");
const contract = JSON.parse(match[1]);

function validateContract(value) {
  check(value.profileVersion === "17c10-product-v1", "profileVersion drift");
  check(value.profileId === "site-jlpt-style-product", "profileId drift");
  check(value.profileKind === "production", "profileKind drift");
  check(JSON.stringify(Object.keys(value.levels)) === JSON.stringify(["N5", "N4"]), "levels must be exactly N5/N4");
  for (const [level, profile] of Object.entries(value.levels)) {
    check(JSON.stringify(Object.keys(profile.sections)) === JSON.stringify(["vocabulary", "grammar", "reading", "listening"]), `${level} sections drift`);
    let levelTotal = 0;
    for (const [sectionName, section] of Object.entries(profile.sections)) {
      if (sectionName === "listening") {
        check(section.included === false && section.status === "future" && section.total === null && Object.keys(section.questionTypes).length === 0, `${level} listening activated early`);
        continue;
      }
      check(section.included === true && section.status === "available", `${level}/${sectionName} availability drift`);
      const typeTotal = Object.entries(section.questionTypes).reduce((sum, [type, quota]) => {
        check(EXPECTED_TYPES[sectionName].has(type), `${level}/${sectionName} unknown questionType ${type}`);
        check(!LEGACY_TYPES.has(type), `${level} legacy type leaked into product profile`);
        check(Number.isSafeInteger(quota) && quota > 0, `${level}/${sectionName}/${type} invalid quota`);
        return sum + quota;
      }, 0);
      check(typeTotal === section.total, `${level}/${sectionName} questionType sum does not equal section total`);
      check(JSON.stringify(section.questionTypes) === JSON.stringify(LOCKED_QUOTAS[level][sectionName]), `${level}/${sectionName} fixed quota drift`);
      levelTotal += section.total;
    }
    check(levelTotal === profile.total, `${level} section sum does not equal level total`);
  }
  check(value.levels.N5.total === 20 && value.levels.N4.total === 34, "fixed level totals drift");
  check(!Object.prototype.hasOwnProperty.call(value.levels.N5.sections.vocabulary.questionTypes, "usage"), "N5 usage is forbidden");
}
validateContract(contract);

const script = read("script.js");
const start = script.indexOf("function deepFreezeJapaneseJlptValue");
const end = script.indexOf("function appendJapaneseJlptDetail");
check(start >= 0 && end > start, "production adapter contract extraction boundaries missing");
const context = { console, crypto: require("crypto").webcrypto, window: {} };
vm.createContext(context);
vm.runInContext(`
const JAPANESE_JLPT_LEVELS=Object.freeze(["N5","N4"]);
const JAPANESE_JLPT_POLICY_VERSION="17b1-internal-v1",JAPANESE_JLPT_READING_DATA_VERSION="17c2-n4-reading-v1",JAPANESE_JLPT_READING_POLICY_VERSION="17c2-reading-internal-v1",JAPANESE_JLPT_READING_PROFILE_ID="17c2-initial-fixed-v1";
const JAPANESE_JLPT_READING_SET_IDS=Object.freeze(["jlpt-reading-set-n4-001","jlpt-reading-set-n4-002","jlpt-reading-set-n4-003","jlpt-reading-set-n4-016","jlpt-reading-set-n4-017","jlpt-reading-set-n4-026","jlpt-reading-set-n4-027","jlpt-reading-set-n4-031","jlpt-reading-set-n4-032","jlpt-reading-set-n4-015"]);
let japaneseJlptQuestionBank=null,japaneseJlptLoadError="",japaneseJlptIsLoading=false,japaneseJlptSession=null,japaneseJlptSessionBuildError=null;
let japaneseJlptProductCandidates=null,japaneseJlptActiveProfileVersion="17c6-compat-v1",japaneseJlptActiveProfileId="site-jlpt-style-compatibility",japaneseJlptProductLoadError="";
let japaneseJlptQuestionContent=null;
function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}
${script.slice(start, end)}
renderJapaneseJlptPanel=()=>{};
clearJapaneseJlptSession=()=>{japaneseJlptSession=null;};
this.api={createJapaneseJlptVocabularyDerivedCandidates,createJapaneseJlptGrammarFormSelectionCandidates,createJapaneseJlptSentenceCompositionCandidates,createJapaneseJlptN5ReadingCandidates,createJapaneseJlptN4ReadingCandidates,validateJapaneseJlptProfile,prepareJapaneseJlptCandidatePools,selectJapaneseJlptQuestions,createJapaneseJlptPreRandomizationSnapshot,createBalancedJapaneseJlptAnswerPositions,randomizeJapaneseJlptQuestionOptions,JAPANESE_JLPT_PROFILE_REGISTRY,loadJapaneseJlptProductBanks,
resetLoaderState(){japaneseJlptQuestionBank=null;japaneseJlptReadingBank=null;japaneseJlptProductCandidates=null;japaneseJlptActiveProfileVersion=JAPANESE_JLPT_COMPAT_PROFILE_VERSION;japaneseJlptActiveProfileId=JAPANESE_JLPT_COMPAT_PROFILE_ID;japaneseJlptProductLoadError="";japaneseJlptLoadError="";japaneseJlptReadingLoadError="";japaneseJlptIsLoading=false;japaneseJlptReadingIsLoading=false;japaneseJlptSession={partial:true};},
getLoaderState(){return {candidateCount:japaneseJlptProductCandidates&&japaneseJlptProductCandidates.length,profileVersion:japaneseJlptActiveProfileVersion,profileId:japaneseJlptActiveProfileId,loadError:japaneseJlptProductLoadError,session:japaneseJlptSession,compatQuestionBank:Boolean(japaneseJlptQuestionBank),compatReadingBank:Boolean(japaneseJlptReadingBank)};}};`, context);
const api = context.api;

const banks = {
  vocabularyAuto: JSON.parse(read("japaneseJlptVocabularyAutoQuestions.json")),
  vocabularySemantic: JSON.parse(read("japaneseJlptVocabularySemanticQuestions.json")),
  grammarForm: JSON.parse(read("japaneseJlptGrammarFormSelectionQuestions.json")),
  sentenceComposition: JSON.parse(read("japaneseSentenceCompositionQuestions.json")),
  readingN5: JSON.parse(read("japaneseJlptReadingN5Questions.json")),
  readingN4: JSON.parse(read("japaneseJlptReadingQuestions.json")),
};
const usageReviewManifest = JSON.parse(read("japaneseJlptVocabularyUsageReviewManifest.json"));
const bankBytes = JSON.stringify(banks);
const candidates = [
  ...api.createJapaneseJlptVocabularyDerivedCandidates(banks.vocabularyAuto, banks.vocabularySemantic),
  ...api.createJapaneseJlptGrammarFormSelectionCandidates(banks.grammarForm),
  ...api.createJapaneseJlptSentenceCompositionCandidates(banks.sentenceComposition),
  ...api.createJapaneseJlptN5ReadingCandidates(banks.readingN5),
  ...api.createJapaneseJlptN4ReadingCandidates(banks.readingN4),
];
const capacity = {};
for (const question of candidates) {
  capacity[question.level] ||= {};
  capacity[question.level][question.section] ||= {};
  capacity[question.level][question.section][question.questionType] = (capacity[question.level][question.section][question.questionType] || 0) + 1;
}
const expectedCapacity = {
  N5: { vocabulary: { "kanji-reading": 12, orthography: 12, context: 12, paraphrase: 12 }, grammar: { "form-selection": 12, "sentence-composition": 30 }, reading: { "short-passage": 2, "medium-passage": 4, "information-search": 4, "notice-and-message": 2 } },
  N4: { vocabulary: { "kanji-reading": 12, orthography: 12, context: 12, paraphrase: 12, usage: 12 }, grammar: { "form-selection": 12, "sentence-composition": 30 }, reading: { "short-passage": 41, "medium-passage": 35, "information-search": 33, "notice-and-message": 41 } },
};
for (const [level, sections] of Object.entries(expectedCapacity)) for (const [section, types] of Object.entries(sections)) {
  check(capacity[level] && capacity[level][section], `${level}/${section} dynamic adapter pool missing`);
  check(Object.keys(capacity[level][section]).length === Object.keys(types).length, `${level}/${section} unexpected dynamic adapter type`);
  for (const [type, count] of Object.entries(types)) check(capacity[level][section][type] === count, `${level}/${section}/${type} capacity must be ${count}`);
}
for (const [level, levelProfile] of Object.entries(contract.levels)) for (const [section, sectionProfile] of Object.entries(levelProfile.sections)) {
  if (!sectionProfile.included) continue;
  for (const [type, quota] of Object.entries(sectionProfile.questionTypes)) check(quota <= capacity[level][section][type], `${level}/${section}/${type} quota exceeds actual pool`);
}

const registry = { schemaVersion: 1, profiles: { [contract.profileVersion]: contract } };
const objectReferences = (value, found = new Set()) => {
  if (value && typeof value === "object" && !found.has(value)) {
    found.add(value);
    Object.values(value).forEach((nested) => objectReferences(nested, found));
  }
  return found;
};
const sharesNestedReference = (first, second) => {
  const firstReferences = objectReferences(first);
  return [...objectReferences(second)].some((reference) => firstReferences.has(reference));
};
const isDeepFrozen = (value, seen = new Set()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return true;
  seen.add(value);
  return Object.isFrozen(value) && Object.values(value).every((nested) => isDeepFrozen(nested, seen));
};
const deterministicProvider = (seed) => {
  let state = seed >>> 0;
  return (max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
};
const expectedSections = { N5: { vocabulary: 8, grammar: 4, reading: 8 }, N4: { vocabulary: 10, grammar: 8, reading: 16 } };
const pipelineResults = {};
for (const level of ["N5", "N4"]) {
  const { profile, levelProfile } = api.validateJapaneseJlptProfile(registry, contract.profileVersion, contract.profileId, level);
  const pools = api.prepareJapaneseJlptCandidatePools(level, profile, levelProfile, candidates, contract.profileVersion);
  const selected = api.selectJapaneseJlptQuestions(pools, deterministicProvider(level === "N5" ? 5 : 4));
  check(selected.length === levelProfile.total && new Set(selected.map((q) => q.id)).size === selected.length, `${level} selection must satisfy fixed total without replacement`);
  const candidateBytes = JSON.stringify(candidates);
  const snapshot = api.createJapaneseJlptPreRandomizationSnapshot(selected, levelProfile);
  check(snapshot.length === levelProfile.total, `${level} snapshot total drift`);
  for (const [section, total] of Object.entries(expectedSections[level])) check(snapshot.filter((q) => q.section === section).length === total, `${level} snapshot ${section} must contain ${total}`);
  check(isDeepFrozen(snapshot), `${level} snapshot and every nested object/array must be deeply frozen`);
  check(JSON.stringify(candidates) === candidateBytes && JSON.stringify(banks) === bankBytes, `${level} snapshot creation mutated source banks/candidates`);
  check(candidates.every((q) => !Object.isFrozen(q)) && !Object.isFrozen(banks), `${level} snapshot creation froze source banks/candidates`);
  selected.forEach((question, index) => check(!sharesNestedReference(question, snapshot[index]), `${level} candidate and snapshot share nested references`));
  const reading = selected.filter((q) => q.section === "reading");
  check(new Set(reading.map((q) => `${q.setId}\u0000${q.questionId}`)).size === reading.length, `${level} reading (setId, questionId) canonical identities must be unique`);
  for (const setId of new Set(reading.map((q) => q.setId))) {
    const indexes = snapshot.map((q, index) => q.section === "reading" && q.setId === setId ? index : -1).filter((index) => index >= 0);
    const group = indexes.map((index) => snapshot[index]);
    check(indexes.every((index, position) => position === 0 || index === indexes[position - 1] + 1), `${level}/${setId} reading questions must be adjacent`);
    check(group.every((q, index) => index === 0 || q.readingQuestionIndex >= group[index - 1].readingQuestionIndex), `${level}/${setId} reading order drift`);
    check(group.every((q) => q.selectedSessionQuestionCount === group.length && q.sourceSetQuestionCount === q.readingQuestionCount), `${level}/${setId} selected/source question count drift`);
    check(group.every((q) => q.displayPassage && q.passageKana && Array.isArray(q.rubyTerms) && q.rubyCoverage && Number.isSafeInteger(q.readingSetIndex) && Number.isSafeInteger(q.readingSetCount) && Number.isSafeInteger(q.readingQuestionIndex) && Number.isSafeInteger(q.readingQuestionCount) && (q.material === undefined || typeof q.material === "object") && (q.passageEvidence === undefined || Array.isArray(q.passageEvidence)) && (q.informationEvidence === undefined || Array.isArray(q.informationEvidence))), `${level}/${setId} passage/material/evidence/ruby/index metadata incomplete`);
  }
  const positions = api.createBalancedJapaneseJlptAnswerPositions(snapshot.length, deterministicProvider(level === "N5" ? 50 : 40));
  const positionCounts = [0, 1, 2, 3].map((position) => positions.filter((value) => value === position).length);
  check(positions.length === levelProfile.total && positionCounts.reduce((sum, count) => sum + count, 0) === levelProfile.total, `${level} answer position total drift`);
  if (level === "N5") check(JSON.stringify(positionCounts) === JSON.stringify([5, 5, 5, 5]), "N5 answer positions must be 5/5/5/5");
  else check(positionCounts.every((count) => count === 8 || count === 9) && Math.max(...positionCounts) - Math.min(...positionCounts) <= 1 && positionCounts.filter((count) => count === 8).length === 2 && positionCounts.filter((count) => count === 9).length === 2, "N4 answer positions must be a permutation of 8/8/9/9");
  const snapshotBytes = JSON.stringify(snapshot);
  const randomized = snapshot.map((question, index) => api.randomizeJapaneseJlptQuestionOptions(question, positions[index], deterministicProvider(index + (level === "N5" ? 100 : 200))));
  check(JSON.stringify(snapshot) === snapshotBytes, `${level} randomization mutated immutable snapshot`);
  randomized.forEach((question, index) => {
    const before = snapshot[index]; const permutation = question.optionPermutation;
    check(question.answerIndex === positions[index] && question.options[question.answerIndex] === before.options[before.answerIndex], `${level}/${question.questionType} answerIndex no longer identifies the true answer`);
    check(!sharesNestedReference(question, before), `${level}/${question.questionType} randomized question shares nested references with snapshot`);
    if (question.questionType === "orthography") check(question.optionReviews.every((review, optionIndex) => review.value === question.options[optionIndex]), "orthography optionReviews alignment drift");
    if (question.questionType === "context") check(question.substitutionReviews.every((review, optionIndex) => review.value === question.options[optionIndex]) && question.optionSourceIds.length === 4, "context source/review alignment drift");
    if (question.questionType === "paraphrase") check(question.optionReviews.every((review, optionIndex) => review.expression === question.options[optionIndex]), "paraphrase optionReviews alignment drift");
    if (question.questionType === "usage") check(question.correctUsageIndex === question.answerIndex && question.usageSentences.every((usage, optionIndex) => usage.sentence === question.options[optionIndex] && usage.acceptedAsCorrect === (optionIndex === question.answerIndex)) && question.incorrectUsageReasons.every((reason) => reason.usageIndex !== question.answerIndex), "usage metadata alignment drift");
    if (question.questionType === "form-selection") check(permutation.version === "17c8d-v1" && question.optionReviews.every((review, optionIndex) => review.choiceIndex === optionIndex && review.value === question.options[optionIndex] && review.originalChoiceIndex === permutation.randomizedIndexToOriginalIndex[optionIndex]) && permutation.correctCanonicalOptionId === `${question.sourceQuestionId}#choice-${before.answerIndex}`, "form-selection permutation/canonical identity drift");
    if (question.questionType === "sentence-composition") check(permutation.version === "17c8d-v1" && question.options.every((option, optionIndex) => question.chunks[optionIndex].text === option && question.optionChunkIds[optionIndex] === question.chunks[optionIndex].id) && question.optionChunkIds[question.answerIndex] === question.correctChunkId && permutation.correctCanonicalOptionId === question.correctChunkId && JSON.stringify(question.canonicalChunkIds) === JSON.stringify(before.canonicalChunkIds), "sentence-composition chunk/permutation identity drift");
    if (question.section === "reading") {
      check(permutation.version === "17c9d-v1" && permutation.correctCanonicalOptionId === `${question.sourceQuestionId}#option-${before.answerIndex}`, "reading permutation/canonical identity drift");
      for (const key of ["passageEvidence", "informationEvidence", "material", "rubyTerms", "rubyCoverage", "displayPassage", "passageKana", "readingSetIndex", "readingSetCount", "readingQuestionIndex", "readingQuestionCount", "sourceSetQuestionCount", "selectedSessionQuestionCount"]) check(JSON.stringify(question[key]) === JSON.stringify(before[key]), `reading ${key} changed during randomization`);
      if (Array.isArray(question.optionReviews)) check(question.optionReviews.every((review, optionIndex) => review.optionIndex === optionIndex && review.option === question.options[optionIndex] && review.originalOptionIndex === permutation.randomizedIndexToOriginalIndex[optionIndex]), "reading optionReviews alignment drift");
    }
    if (permutation) check(permutation.correctRandomizedIndex === question.answerIndex && permutation.correctOriginalIndex === before.answerIndex && permutation.randomizedCanonicalOptionIds[question.answerIndex] === permutation.correctCanonicalOptionId && permutation.randomizedIndexToOriginalIndex.every((original, current) => permutation.originalIndexToRandomizedIndex[original] === current), `${level}/${question.questionType} permutation metadata alignment drift`);
  });
  pipelineResults[level] = positionCounts;
}

let negatives = 0;
function rejects(name, mutate) {
  const fixture = clone(contract);
  mutate(fixture);
  let rejected = false;
  try { validateContract(fixture); } catch (_) { rejected = true; }
  check(rejected, `negative fixture accepted: ${name}`);
  negatives += 1;
}
rejects("unknown questionType", (x) => { x.levels.N4.sections.grammar.questionTypes.attacker = 1; x.levels.N4.sections.grammar.total += 1; x.levels.N4.total += 1; });
rejects("wrong section total", (x) => { x.levels.N5.sections.grammar.total = 5; x.levels.N5.total = 21; });
rejects("wrong level total", (x) => { x.levels.N4.total = 35; });
rejects("N5 usage", (x) => { x.levels.N5.sections.vocabulary.questionTypes.usage = 1; x.levels.N5.sections.vocabulary.total += 1; x.levels.N5.total += 1; });
rejects("listening included", (x) => { x.levels.N4.sections.listening.included = true; });
rejects("listening status", (x) => { x.levels.N5.sections.listening.status = "available"; });
rejects("legacy type", (x) => { x.levels.N4.sections.reading.questionTypes["legacy-reading-question"] = 1; x.levels.N4.sections.reading.total += 1; x.levels.N4.total += 1; });
rejects("silent fallback shape", (x) => { delete x.levels.N5.sections.reading.questionTypes["short-passage"]; x.levels.N5.sections.reading.questionTypes["medium-passage"] += 2; });

{
  const short = candidates.filter((q) => !(q.level === "N5" && q.section === "reading" && q.questionType === "short-passage" && q === candidates.find((item) => item.level === "N5" && item.section === "reading" && item.questionType === "short-passage")));
  const { profile, levelProfile } = api.validateJapaneseJlptProfile(registry, contract.profileVersion, contract.profileId, "N5");
  let error; let session; let randomCalls = 0;
  try {
    const pools = api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, short, contract.profileVersion);
    session = api.selectJapaneseJlptQuestions(pools, () => { randomCalls += 1; return 0; });
  } catch (caught) { error = caught; }
  check(session === undefined && randomCalls === 0 && error && error.code === "JLPT_INSUFFICIENT_POOL", "insufficient capacity must atomically throw JLPT_INSUFFICIENT_POOL before randomness/partial session");
  check(error.details.level === "N5" && error.details.section === "reading" && error.details.questionType === "short-passage" && error.details.required === 2 && error.details.available === 1, "insufficient pool structured details drift");
  negatives += 1;
}
{
  const contaminated = clone(candidates);
  contaminated.find((q) => q.level === "N5" && q.section === "reading").questionType = "unknown-reading-fallback";
  let rejected = false;
  try {
    const { profile, levelProfile } = api.validateJapaneseJlptProfile(registry, contract.profileVersion, contract.profileId, "N5");
    api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, contaminated, contract.profileVersion);
  } catch (_) { rejected = true; }
  check(rejected, "unknown candidate type must fail closed rather than silently fallback");
  negatives += 1;
}
check(negatives === 10, `negative fixture count drift: ${negatives}`);

{
  const duplicated = candidates.concat([candidates.find((q) => q.level === "N5" && q.questionType === "kanji-reading")]);
  let rejected = false;
  try {
    const { profile, levelProfile } = api.validateJapaneseJlptProfile(registry, contract.profileVersion, contract.profileId, "N5");
    api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, duplicated, contract.profileVersion);
  } catch (_) { rejected = true; }
  check(rejected, "duplicate canonical identity must fail closed");
  negatives += 1;
}
{
  let rejected = false;
  try { api.createBalancedJapaneseJlptAnswerPositions(20, () => -1); } catch (_) { rejected = true; }
  check(rejected, "invalid random provider must fail closed");
  negatives += 1;
}

const compat = api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles["17c6-compat-v1"];
check(compat && compat.levels.N5.total === 20 && compat.levels.N4.total === 34, "17c6-compat-v1 missing or totals changed");
check(compat.levels.N5.sections.vocabulary.questionTypes.meaning === 10 && compat.levels.N5.sections.grammar.questionTypes.cloze === 5 && compat.levels.N4.sections.reading.questionTypes["legacy-reading-question"] === 14, "17c6 legacy contract not fully retained");
check(JSON.stringify(api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles[contract.profileVersion]) === JSON.stringify(contract), "runtime product profile differs from machine-readable contract");
check(/非官方/.test(documentText) && /JLPT-style/.test(documentText), "non-official JLPT-style disclosure missing");
check(/selection → immutable snapshot → balanced answer positions → randomization/.test(documentText), "pipeline ordering contract missing");

const baselineScript = git("show", `${BASE}:script.js`);
const inventory = (text, expression) => (text.match(expression) || []).length;
for (const [name, expression] of [["localStorage", /\blocalStorage\b/g], ["sessionStorage", /\bsessionStorage\b/g], ["IndexedDB", /\bindexedDB\b/g], ["Cache API", /\bcaches\b/g]])
  check(inventory(script, expression) === inventory(baselineScript, expression), `${name} API inventory changed`);
const protectedData = git("diff", "--name-only", BASE, "--", "*.json").trim().split("\n").filter(Boolean);
const allowedExplanationData = new Set(["japaneseJlptVocabularySemanticQuestions.json", "japaneseJlptVocabularyUsageReviewManifest.json"]);
check(protectedData.every((path) => allowedExplanationData.has(path)), `unexpected formal question bank/manifest modified: ${protectedData.join(", ")}`);
const japaneseIndex = read("japanese/index.html");
const productionScriptReferences = [...japaneseIndex.matchAll(/<script\s+src=["']\.\.\/script\.js\?v=([^"']+)["']\s*><\/script>/g)];
check(productionScriptReferences.length === 1, "japanese/index.html must contain exactly one production script.js reference");
check(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/.test(productionScriptReferences[0][1]), "script.js cache token must exist and have a valid format");

class DomNode {
  constructor(tagName = "#text", text = "") { this.tagName = tagName; this.children = []; this._text = text; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(""); }
  append(...children) { children.flat().forEach((child) => this.children.push(typeof child === "string" ? new DomNode("#text", child) : child)); }
  appendChild(child) { this.append(child); return child; }
  queryTags(found = []) { if (this.tagName !== "#text") found.push(this.tagName); this.children.forEach((child) => child.queryTags(found)); return found; }
}
let innerHtmlWrites = 0;
Object.defineProperty(DomNode.prototype, "innerHTML", { set() { innerHtmlWrites += 1; throw new Error("innerHTML is forbidden"); } });
const uiDocument = { createElement: (tag) => new DomNode(tag), createTextNode: (value) => new DomNode("#text", String(value)) };
const uiStart = script.indexOf("function appendJapaneseJlptDetail");
const uiEnd = script.indexOf("function answerJapaneseJlptQuestion", uiStart);
check(uiStart >= 0 && uiEnd > uiStart, "UI render helper extraction boundaries missing");
const uiContext = { document: uiDocument };
vm.createContext(uiContext);
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string"&&value.trim().length>0;} function createRubyPartsFromTerms(value){return [String(value)];} function renderRubyParts(parent,parts){parent.textContent=parts.join("");} ${script.slice(uiStart, uiEnd)} this.ui={appendJapaneseJlptAnswerFeedbackDetails,appendJapaneseJlptQuestionFeedback,appendJapaneseJlptLabeledTable};`, uiContext);
const detailValues = (root) => root.children
  .filter((child) => child.tagName === "p" && child.children.length >= 2)
  .map((child) => child.children.slice(1).map((part) => part.textContent).join(""));
let uiFixtures = 0;
for (const type of ["kanji-reading", "orthography", "context", "paraphrase", "usage", "form-selection", "sentence-composition"]) {
  const question = candidates.find((item) => item.questionType === type);
  const root = new DomNode("div");
  check(question, `${type} UI fixture missing`);
  uiContext.ui.appendJapaneseJlptQuestionFeedback(root, question);
  check(!/(?:^|[^0-9])0：|1：|2：/.test(root.textContent), `${type} string answerDisplay was split into numeric keys`);
  check(!root.textContent.includes("[object Object]"), `${type} rendered an object coercion`);
  check(detailValues(root).filter((value) => value === question.options[question.answerIndex]).length === 1, `${type} full feedback duplicated or omitted the correct answer`);
  if (type === "orthography") {
    check(detailValues(root).includes(question.kana), "orthography feedback omitted the word kana");
    check(!detailValues(root).includes(question.sourceExampleKana), "orthography feedback mislabeled the full example kana as the word kana");
  }
  if (type === "form-selection") check([question.grammar, question.structure, question.exampleMeaning].every((value) => root.textContent.includes(value)), "form-selection detail UI incomplete");
  if (type === "sentence-composition") check([question.completeSentence, question.kana, question.meaning, question.answerDisplay].every((value) => root.textContent.includes(value)), "sentence-composition detail UI incomplete");
  uiFixtures += 1;
  const incompleteRoot = new DomNode("div");
  uiContext.ui.appendJapaneseJlptAnswerFeedbackDetails(incompleteRoot, {
    questionType: type, section: question.section, answerDisplay: null,
    options: ["安全答案", "B", "C", "D"], answerIndex: 0, explanation: "安全解析",
  });
  check(incompleteRoot.textContent.includes("安全答案") && incompleteRoot.textContent.includes("安全解析") &&
    !incompleteRoot.textContent.includes("[object Object]"), `${type} incomplete metadata fallback was unsafe`);
  uiFixtures += 1;
}
{
  for (const level of ["N5", "N4"]) {
    const reading = candidates.find((item) => item.level === level && item.section === "reading");
    const root = new DomNode("div");
    check(reading, `${level} reading feedback fixture missing`);
    uiContext.ui.appendJapaneseJlptQuestionFeedback(root, reading);
    check(detailValues(root).filter((value) => value === reading.options[reading.answerIndex]).length === 1, `${level} reading feedback repeated the correct answer`);
    check(!root.textContent.includes("答案說明："), `${level} identical answerDisplay rendered as an answer explanation`);
    const supplemented = clone(reading);
    supplemented.answerDisplay = "本文另有補充依據";
    const supplementedRoot = new DomNode("div");
    uiContext.ui.appendJapaneseJlptQuestionFeedback(supplementedRoot, supplemented);
    check(supplementedRoot.textContent.includes("答案說明：本文另有補充依據"), `${level} meaningful answer explanation was omitted`);
    uiFixtures += 2;
  }
}
{
  const fixedSentencePosition = /第\s*[一二三四\d]+\s*句/;
  const usageCandidates = candidates.filter((item) => item.level === "N4" && item.questionType === "usage");
  check(usageCandidates.length === 12, `N4 usage candidate count drift: ${usageCandidates.length}`);
  check((JSON.stringify(banks.vocabularySemantic).match(new RegExp(fixedSentencePosition.source, "g")) || []).length === 0, "semantic question bank retained fixed sentence-position text");
  check((JSON.stringify(usageReviewManifest).match(new RegExp(fixedSentencePosition.source, "g")) || []).length === 0, "usage review manifest retained fixed sentence-position text");
  usageCandidates.forEach((usage, index) => {
    const forcedPosition = 1 + (index % 3);
    const correctOption = usage.options[usage.answerIndex];
    const randomized = api.randomizeJapaneseJlptQuestionOptions(usage, forcedPosition, () => 0);
    check(randomized.answerIndex === forcedPosition, `${usage.targetWord} correct usage was not forced away from the first position`);
    check(randomized.options[randomized.answerIndex] === correctOption, `${usage.targetWord} randomized answerIndex no longer identifies the correct usage`);
    check(!fixedSentencePosition.test(randomized.explanation), `${usage.targetWord} explanation retained a fixed sentence-position reference`);
    const root = new DomNode("div");
    uiContext.ui.appendJapaneseJlptQuestionFeedback(root, randomized);
    check(detailValues(root).filter((value) => value === correctOption).length === 1, `${usage.targetWord} displayed correct usage sentence differs from the randomized correct option`);
    uiFixtures += 1;
  });
}
{
  const legacyRoot = new DomNode("div");
  const legacy = { questionType: "meaning", answerDisplay: { word: "挨拶", kana: "あいさつ", meaning: "問候" } };
  uiContext.ui.appendJapaneseJlptAnswerFeedbackDetails(legacyRoot, legacy);
  check(Object.values(legacy.answerDisplay).every((value) => legacyRoot.textContent.includes(value)), "legacy answerDisplay object no longer renders normally");
  uiFixtures += 1;
}
{
  const reading = candidates.find((item) => item.questionType === "information-search" && item.material && item.material.type === "labeled-table");
  const root = new DomNode("div");
  check(reading && uiContext.ui.appendJapaneseJlptLabeledTable(root, reading.material, reading.rubyTerms), "labeled-table helper did not render");
  const tags = root.queryTags();
  for (const tag of ["table", "thead", "tbody", "tr", "th", "td"]) check(tags.includes(tag), `labeled-table missing <${tag}>`);
  for (const hidden of [reading.material.id, reading.material.rows[0].id, reading.material.rows[0].cells[0].id, "plainTextProjection", "cellIds", "rowId"])
    check(!root.textContent.includes(hidden), `labeled-table exposed internal metadata: ${hidden}`);
  check(!root.textContent.includes(JSON.stringify(reading.material)), "labeled-table exposed raw JSON");
  uiFixtures += 1;
}
check(innerHtmlWrites === 0 && !/\.innerHTML\s*=/.test(script.slice(uiStart, uiEnd)), "question-bank UI wrote innerHTML");
check(uiFixtures === 32, `UI render fixture count drift: ${uiFixtures}`);

const PRODUCT_FIXTURES = [
  ["japaneseJlptVocabularyAutoQuestions.json", banks.vocabularyAuto],
  ["japaneseJlptVocabularySemanticQuestions.json", banks.vocabularySemantic],
  ["japaneseJlptGrammarFormSelectionQuestions.json", banks.grammarForm],
  ["japaneseSentenceCompositionQuestions.json", banks.sentenceComposition],
  ["japaneseJlptReadingN5Questions.json", banks.readingN5],
  ["japaneseJlptReadingQuestions.json", banks.readingN4],
];
const compatBanks = { "japaneseJlptVocabularyGrammarQuestions.json": JSON.parse(read("japaneseJlptVocabularyGrammarQuestions.json")), "japaneseJlptReadingQuestions.json": banks.readingN4 };
const fakeFetch = (failedPath = "") => {
  let failuresRemaining = failedPath ? 1 : 0;
  return async (url) => {
  const path = String(url).split("/").pop().split("?")[0];
  if (path === failedPath && failuresRemaining-- > 0) return { ok: false, status: 503, json: async () => { throw new Error("unreachable"); } };
  const fixture = PRODUCT_FIXTURES.find(([name]) => name === path);
  const data = fixture ? fixture[1] : compatBanks[path];
  return data ? { ok: true, status: 200, json: async () => clone(data) } : { ok: false, status: 404, json: async () => ({}) };
  };
};

async function verifyProductionLoader() {
  api.resetLoaderState();
  await api.loadJapaneseJlptProductBanks(fakeFetch());
  const success = api.getLoaderState();
  check(success.candidateCount === 354, `production success published ${success.candidateCount}, expected 354 candidates; ${success.loadError}`);
  check(success.profileVersion === contract.profileVersion && success.profileId === contract.profileId, "production success did not activate product profile");
  let loadFailures = 0;
  for (const [failedBank] of PRODUCT_FIXTURES) {
    api.resetLoaderState();
    await api.loadJapaneseJlptProductBanks(fakeFetch(failedBank));
    const state = api.getLoaderState();
    check(state.candidateCount === null, `${failedBank} failure published product candidates`);
    check(state.profileVersion === "17c6-compat-v1" && state.profileId === "site-jlpt-style-compatibility", `${failedBank} failure did not retain compatibility profile`);
    check(state.session === null, `${failedBank} failure retained a partial session`);
    check(state.compatQuestionBank, `${failedBank} failure did not load compatibility question data`);
    check(state.compatReadingBank, `${failedBank} failure did not load compatibility reading data`);
    check(state.loadError.includes("新題型載入失敗，已使用相容模式"), `${failedBank} failure message missing`);
    loadFailures += 1;
  }
  return loadFailures;
}

verifyProductionLoader().then((loadFailures) => {
  check(loadFailures === 6, "six production loader failure fixtures did not run");
  console.log("PASS: Batch 17C-10B product activation validated from machine-readable documentation.");
  console.log("PASS: Production loader success fixture published 354 candidates and activated product.");
  console.log("PASS: Production loader executed 6 per-bank HTTP failure fixtures; candidates/session remained atomic and compat stayed active.");
  console.log(`PASS: ${uiFixtures} UI render fixtures preserved string/legacy answers and produced a safe labeled table without internal JSON.`);
  console.log(`PASS: N5 20-question complete pipeline; answer positions ${pipelineResults.N5.join("/")}.`);
  console.log(`PASS: N4 34-question complete pipeline; answer positions ${[...pipelineResults.N4].sort((a,b)=>a-b).join("/")}.`);
  console.log(`PASS: Immutable/reference/metadata checks passed; ${negatives} negative fixtures rejected.`);
}).catch((error) => { console.error(error); process.exitCode = 1; });
