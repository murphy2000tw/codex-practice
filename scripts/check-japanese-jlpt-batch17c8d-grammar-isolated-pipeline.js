#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");
const BASE = "db55f743855c9280957be26f2fd623994baca6a3";
const FORM_PATH = "japaneseJlptGrammarFormSelectionQuestions.json";
const COMPOSITION_PATH = "japaneseSentenceCompositionQuestions.json";
const ALLOWED = new Set(["script.js", "japanese/index.html", __filename.replace(`${process.cwd()}/`, ""),
  "docs/japanese-jlpt-batch17c8d-grammar-isolated-pipeline.md"]);
const read = (path) => fs.readFileSync(path, "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const assert = (value, message) => { if (!value) throw new Error(`Batch 17C-8D check: ${message}`); };
const isDeepFrozen = (value, seen = new Set()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return true;
  seen.add(value);
  return Object.isFrozen(value) && Object.values(value).every((nested) => isDeepFrozen(nested, seen));
};
const nestedReferences = (value, references = new Set()) => {
  if (!value || typeof value !== "object" || references.has(value)) return references;
  references.add(value); Object.values(value).forEach((nested) => nestedReferences(nested, references));
  return references;
};
const sharesNestedReference = (first, second) => {
  const firstReferences = nestedReferences(first);
  return [...nestedReferences(second)].some((reference) => firstReferences.has(reference));
};
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const script = read("script.js");
const html = read("japanese/index.html");
const formBytes = read(FORM_PATH); const compositionBytes = read(COMPOSITION_PATH);
const formBank = JSON.parse(formBytes); const compositionBank = JSON.parse(compositionBytes);
const start = script.indexOf("function deepFreezeJapaneseJlptValue");
const end = script.indexOf("function appendJapaneseJlptDetail");
const context = { console };
vm.createContext(context);
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}\n${script.slice(start, end)}\nthis.api={adaptJapaneseJlptGrammarFormSelectionQuestion,createJapaneseJlptGrammarFormSelectionCandidates,createJapaneseJlptSentenceCompositionCandidates,validateJapaneseJlptProfile,normalizeJapaneseJlptCandidate,getJapaneseJlptCanonicalIdentity,prepareJapaneseJlptCandidatePools,selectJapaneseJlptQuestions,createJapaneseJlptPreRandomizationSnapshot,createBalancedJapaneseJlptAnswerPositions,randomizeJapaneseJlptQuestionOptions,JAPANESE_JLPT_PROFILE_REGISTRY};`, context);
const api = context.api;

const PROFILE_VERSION = "17c8d-isolated-grammar-fixture-v1";
const PROFILE_ID = "site-jlpt-style-grammar-fixture";
const isolatedRegistry = { schemaVersion: 1, profiles: { [PROFILE_VERSION]: {
  profileVersion: PROFILE_VERSION, profileId: PROFILE_ID, profileKind: "test-only-isolated", levels: {
    N5: { total: 8, sections: { grammar: { included: true, status: "available", total: 8,
      questionTypes: { "form-selection": 4, "sentence-composition": 4 } } } },
    N4: { total: 8, sections: { grammar: { included: true, status: "available", total: 8,
      questionTypes: { "form-selection": 4, "sentence-composition": 4 } } } },
  },
} } };
const formCandidates = Array.from(api.createJapaneseJlptGrammarFormSelectionCandidates(formBank));
const compositionCandidates = Array.from(api.createJapaneseJlptSentenceCompositionCandidates(compositionBank));
const candidates = [...formCandidates, ...compositionCandidates];
assert(formCandidates.filter((q) => q.level === "N5").length === 12 && formCandidates.filter((q) => q.level === "N4").length === 12, "form pools 必須各 12");
assert(compositionCandidates.filter((q) => q.level === "N5").length === 30 && compositionCandidates.filter((q) => q.level === "N4").length === 30, "composition pools 必須各 30");
assert(candidates.length === 84 && candidates.filter((q) => q.level === "N5").length === 42 && candidates.filter((q) => q.level === "N4").length === 42, "combined inventory 必須為 84／每級 42");
assert(new Set(candidates.map(api.getJapaneseJlptCanonicalIdentity)).size === 84, "canonical identities 必須全域唯一");
assert(JSON.stringify(api.createJapaneseJlptGrammarFormSelectionCandidates(formBank)) === JSON.stringify(formCandidates), "form adapter 不 deterministic");

function provider(mode) { return (max) => mode === "high" ? max - 1 : 0; }
function runLevel(level, mode) {
  const { profile, levelProfile } = api.validateJapaneseJlptProfile(isolatedRegistry, PROFILE_VERSION, PROFILE_ID, level);
  const pools = api.prepareJapaneseJlptCandidatePools(level, profile, levelProfile, candidates, PROFILE_VERSION);
  assert([...pools.values()].every((pool) => pool.candidates.length === (pool.questionType === "form-selection" ? 12 : 30)), `${level} prepared pool capacity 錯誤`);
  const selected = api.selectJapaneseJlptQuestions(pools, provider(mode));
  const candidateBytes = JSON.stringify(selected); const snapshot = api.createJapaneseJlptPreRandomizationSnapshot(selected, levelProfile);
  assert(isDeepFrozen(snapshot), "snapshot 與所有巢狀 object／array 必須 deep frozen");
  snapshot.forEach((question) => {
    for (const key of ["optionReviews", "chunks", "optionChunkIds", "correctOrder", "canonicalChunkIds", "reviewTags", "rubyTerms"])
      if (Object.prototype.hasOwnProperty.call(question, key)) assert(isDeepFrozen(question[key]), `${question.questionType}.${key} 未 deep frozen`);
  });
  assert(JSON.stringify(selected) === candidateBytes && selected.every((q) => !Object.isFrozen(q)), "snapshot 建立修改或 freeze candidate");
  selected.forEach((question, index) => assert(!sharesNestedReference(question, snapshot[index]), "candidate 與 snapshot 共用 nested reference"));
  const snapshotBytes = JSON.stringify(snapshot);
  const positions = api.createBalancedJapaneseJlptAnswerPositions(8, provider(mode));
  assert([0, 1, 2, 3].every((position) => positions.filter((x) => x === position).length === 2), "答案位置必須各兩次");
  const randomized = snapshot.map((question, index) => api.randomizeJapaneseJlptQuestionOptions(question, positions[index], provider(mode)));
  assert(JSON.stringify(snapshot) === snapshotBytes, "randomization 修改 snapshot bytes");
  randomized.forEach((question, index) => {
    const before = snapshot[index]; const metadata = question.optionPermutation;
    assert(!sharesNestedReference(before, question), "snapshot 與 randomized question 共用 nested reference");
    assert(question !== before && question.options !== before.options && question.answerIndex === positions[index] && question.answerDisplay === question.options[question.answerIndex], "randomized clone／answer alignment 無效");
    assert(metadata.version === "17c8d-v1" && metadata.correctRandomizedIndex === question.answerIndex && metadata.correctOriginalIndex === before.answerIndex && metadata.randomizedCanonicalOptionIds[question.answerIndex] === metadata.correctCanonicalOptionId, "permutation metadata 無效");
    assert(metadata.randomizedIndexToOriginalIndex.every((original, current) => metadata.originalIndexToRandomizedIndex[original] === current), "permutation inverse mapping 無效");
    if (question.questionType === "form-selection") {
      assert(question.optionReviews.every((review, current) => review.choiceIndex === current && review.value === question.options[current] && review.originalChoiceIndex === metadata.randomizedIndexToOriginalIndex[current]), "form optionReviews 未同步");
      assert(question.optionReviews[question.answerIndex].acceptedAsCorrect && metadata.correctCanonicalOptionId === `${question.sourceQuestionId}#choice-${before.answerIndex}`, "form correct canonical identity 無效");
    } else {
      assert(question.options.every((text, current) => text === question.chunks[current].text && question.optionChunkIds[current] === question.chunks[current].id), "chunk arrays 未同步");
      assert(question.correctChunkId === before.correctChunkId && JSON.stringify(question.correctOrder) === JSON.stringify(before.correctOrder) && JSON.stringify(question.canonicalChunkIds) === JSON.stringify(before.canonicalChunkIds), "canonical chunk data 漂移");
      assert(question.optionChunkIds[question.answerIndex] === question.correctChunkId && metadata.correctCanonicalOptionId === question.correctChunkId, "chunk correct identity 無效");
    }
  });
  const formIndex = randomized.findIndex((question) => question.questionType === "form-selection");
  const compositionIndex = randomized.findIndex((question) => question.questionType === "sentence-composition");
  const immutableBytes = JSON.stringify(snapshot);
  randomized[formIndex].optionReviews[0].value = "randomized form fixture";
  randomized[formIndex].optionPermutation.randomizedIndexToOriginalIndex[0] = 99;
  randomized[formIndex].optionPermutation.preRandomizationCanonicalOptionIds[0] = "randomized form identity fixture";
  randomized[compositionIndex].chunks[0].text = "randomized composition fixture";
  randomized[compositionIndex].optionChunkIds[0] = "randomized composition identity fixture";
  randomized[compositionIndex].optionPermutation.originalIndexToRandomizedIndex[0] = 99;
  randomized[compositionIndex].optionPermutation.randomizedCanonicalOptionIds[0] = "randomized composition metadata fixture";
  assert(JSON.stringify(snapshot) === immutableBytes, "randomized nested mutation 影響 snapshot");
  return { selected, snapshot, randomized };
}
const lowN5 = runLevel("N5", "low"); runLevel("N4", "low");
const highN5 = runLevel("N5", "high"); runLevel("N4", "high");
assert(JSON.stringify(lowN5.selected.map((q) => q.id)) !== JSON.stringify(highN5.selected.map((q) => q.id)), "不同 deterministic providers 應可改變 selection");
assert(lowN5.selected.every((q, i) => api.getJapaneseJlptCanonicalIdentity(q) === api.getJapaneseJlptCanonicalIdentity(lowN5.snapshot[i])), "snapshot stable identity 漂移");

const sourceCopy = clone(formBank); const isolatedCandidate = api.createJapaneseJlptGrammarFormSelectionCandidates(sourceCopy)[0];
assert(!sharesNestedReference(sourceCopy.questions[0], isolatedCandidate), "form source 與 candidate 共用 nested reference");
const sourceBefore = JSON.stringify(sourceCopy); isolatedCandidate.optionReviews[0].value = "fixture"; isolatedCandidate.rubyTerms.push({ nested: true });
assert(JSON.stringify(sourceCopy) === sourceBefore, "candidate mutation 影響 form source");
const candidateCopy = api.createJapaneseJlptGrammarFormSelectionCandidates(sourceCopy); const candidateBefore = JSON.stringify(candidateCopy);
sourceCopy.questions[0].optionReviews[0].value = "source fixture"; sourceCopy.questions[0].rubyTerms.push({ source: true });
assert(JSON.stringify(candidateCopy) === candidateBefore, "source mutation 影響既有 candidate");

let rejected = 0;
function reject(name, call) { let failed = false; try { call(); } catch (_) { failed = true; } assert(failed, `negative fixture accepted: ${name}`); rejected += 1; }
function rejectForm(name, mutate) { const fixture = clone(formBank); mutate(fixture); reject(name, () => api.createJapaneseJlptGrammarFormSelectionCandidates(fixture)); }
function rejectComposition(name, mutate) { const fixture = clone(compositionBank); mutate(fixture); reject(name, () => api.createJapaneseJlptSentenceCompositionCandidates(fixture)); }
rejectForm("root schema", (b) => { b.schemaVersion = "2"; });
rejectForm("derivation version", (b) => { b.derivationVersion = "bad"; });
rejectForm("manifest version", (b) => { b.manifestVersion = "bad"; });
rejectForm("source policy", (b) => { b.sourcePolicyVersion = "bad"; });
rejectForm("inventory", (b) => { b.inventory.N5.total = 11; });
rejectForm("invalid inventory capacity flags", (b) => { b.inventory.seedCapacity = false; b.inventory.productQuota = true; });
rejectForm("invalid generatedFrom", (b) => { b.generatedFrom.reverse(); });
rejectForm("duplicate id", (b) => { b.questions[1].id = b.questions[0].id; });
rejectForm("duplicate sourceQuestionId", (b) => { b.questions[1].sourceQuestionId = b.questions[0].sourceQuestionId; });
rejectForm("arbitrary stable ID", (b) => { b.questions[0].id = "arbitrary-but-unique-id"; });
rejectForm("arbitrary sourceQuestionId", (b) => { b.questions[0].sourceQuestionId = "grammar.json#arbitrary-but-unique"; });
rejectForm("missing sourceIds", (b) => { delete b.questions[0].sourceIds; });
rejectForm("invalid sourceDigest", (b) => { b.questions[0].sourceDigest = "x"; });
rejectForm("level", (b) => { b.questions[0].level = "N3"; });
rejectForm("section", (b) => { b.questions[0].section = "vocabulary"; });
rejectForm("questionType", (b) => { b.questions[0].questionType = "cloze"; });
rejectForm("three options", (b) => { b.questions[0].options.pop(); });
rejectForm("blank option", (b) => { b.questions[0].options[0] = " "; });
rejectForm("duplicate option", (b) => { b.questions[0].options[1] = b.questions[0].options[0]; });
rejectForm("answerIndex", (b) => { b.questions[0].answerIndex = 4; });
rejectForm("answerDisplay", (b) => { b.questions[0].answerDisplay = "wrong"; });
rejectForm("review metadata", (b) => { delete b.questions[0].reviewMethod; });
rejectForm("missing required reviewTags", (b) => { b.questions[0].reviewTags = b.questions[0].reviewTags.filter((tag) => tag !== "unique-answer-reviewed"); });
rejectForm("invalid kanjiPolicy", (b) => { b.questions[0].kanjiPolicy = "arbitrary-policy"; });
rejectForm("optionReviews count", (b) => { b.questions[0].optionReviews.pop(); });
rejectForm("optionReviews order", (b) => { [b.questions[0].optionReviews[0], b.questions[0].optionReviews[1]] = [b.questions[0].optionReviews[1], b.questions[0].optionReviews[0]]; });
rejectForm("multiple correct reviews", (b) => { b.questions[0].optionReviews[1].acceptedAsCorrect = true; });
rejectForm("missing incorrect reason", (b) => { b.questions[0].optionReviews[1].incorrectReason = " "; });
rejectForm("vague incorrectReason", (b) => { b.questions[0].optionReviews[1].incorrectReason = "錯"; });
rejectForm("incorrect correct-review status", (b) => { b.questions[0].optionReviews[b.questions[0].answerIndex].languageReviewStatus = "reviewed-incorrect"; });
rejectForm("incorrect distractor-review status", (b) => { b.questions[0].optionReviews.find((review) => !review.acceptedAsCorrect).languageReviewStatus = "reviewed-correct"; });
rejectComposition("missing chunk id", (b) => { b[0].chunks[0].id = ""; });
rejectComposition("duplicate chunk id", (b) => { b[0].chunks[1].id = b[0].chunks[0].id; });
rejectComposition("unknown chunk", (b) => { b[0].correctOrder[0] = "unknown"; });
rejectComposition("correctChunkId unresolved", (b) => { b[0].correctOrder[1] = b[0].correctOrder[0]; });
reject("incoming permutation metadata", () => api.randomizeJapaneseJlptQuestionOptions({ ...clone(lowN5.snapshot[0]), optionPermutation: { version: "bad" } }, 0, provider("low")));
reject("invalid targetAnswerIndex", () => api.randomizeJapaneseJlptQuestionOptions(clone(lowN5.snapshot[0]), 4, provider("low")));
reject("invalid random index", () => api.randomizeJapaneseJlptQuestionOptions(clone(lowN5.snapshot[0]), 0, (max) => max));
function shortage(type, quota, available) {
  const fixture = clone(isolatedRegistry); fixture.profiles[PROFILE_VERSION].levels.N5.total = quota;
  fixture.profiles[PROFILE_VERSION].levels.N5.sections.grammar.total = quota;
  fixture.profiles[PROFILE_VERSION].levels.N5.sections.grammar.questionTypes = { [type]: quota };
  const { profile, levelProfile } = api.validateJapaneseJlptProfile(fixture, PROFILE_VERSION, PROFILE_ID, "N5");
  let calls = 0; let error;
  try { const pools = api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, candidates.filter((q) => q.questionType === type), PROFILE_VERSION); api.selectJapaneseJlptQuestions(pools, () => { calls += 1; return 0; }); } catch (caught) { error = caught; }
  assert(error && error.code === "JLPT_INSUFFICIENT_POOL" && error.details.level === "N5" && error.details.section === "grammar" && error.details.questionType === type && error.details.required === quota && error.details.available === available && error.details.profileVersion === PROFILE_VERSION && calls === 0, `${type} shortage 必須在 random 前 fail closed (${error && error.message})`);
  rejected += 1;
}
shortage("form-selection", 13, 12); shortage("sentence-composition", 31, 30);
reject("cross-level fallback", () => { const { profile, levelProfile } = api.validateJapaneseJlptProfile(isolatedRegistry, PROFILE_VERSION, PROFILE_ID, "N5"); api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, candidates.filter((q) => q.level === "N4"), PROFILE_VERSION); });
reject("cross-type fallback", () => { const fixture = clone(candidates); fixture[0].questionType = "meaning"; const { profile, levelProfile } = api.validateJapaneseJlptProfile(isolatedRegistry, PROFILE_VERSION, PROFILE_ID, "N5"); api.prepareJapaneseJlptCandidatePools("N5", profile, levelProfile, fixture, PROFILE_VERSION); });
const EXPECTED_REJECTED_FIXTURES = 42;
assert(rejected === EXPECTED_REJECTED_FIXTURES, `negative fixture 數量必須精確為 ${EXPECTED_REJECTED_FIXTURES}`);

assert(git("merge-base", "--is-ancestor", BASE, "HEAD") === "", "HEAD 未包含 PR #297 merge commit");
const changed = new Set([...git("diff", "--name-only", BASE).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
for (const file of changed) assert(ALLOWED.has(file), `scope guard rejects ${file}`);
assert(changed.size === 4 && [...ALLOWED].every((file) => changed.has(file)), "changed files 必須精確為允許的四個檔案");
assert(git("hash-object", FORM_PATH) === git("rev-parse", `${BASE}:${FORM_PATH}`) && git("hash-object", COMPOSITION_PATH) === git("rev-parse", `${BASE}:${COMPOSITION_PATH}`), "正式 grammar banks bytes 改變");
const baseHtml = git("show", `${BASE}:japanese/index.html`);
assert(html === `${baseHtml}\n`.replace('../script.js?v=4.0', '../script.js?v=4.1') || html === baseHtml.replace('../script.js?v=4.0', '../script.js?v=4.1'), "HTML 只能更新 cache token 4.0 → 4.1");
const production = api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles["17c6-compat-v1"];
assert(production.levels.N5.total === 20 && production.levels.N4.total === 34 && !JSON.stringify(production).match(/form-selection|sentence-composition/), "production profile 或 quota 改變");
assert(!JSON.stringify(api.JAPANESE_JLPT_PROFILE_REGISTRY).includes(PROFILE_VERSION), "isolated profile 進入 production registry");
const buildBlock = script.slice(script.indexOf("function buildJapaneseJlptSession"), script.indexOf("function appendJapaneseJlptDetail"));
assert(!buildBlock.match(/createJapaneseJlpt(?:GrammarFormSelection|SentenceComposition)Candidates/), "production session 呼叫 grammar adapter");
const jlptEntryBlock = script.slice(script.indexOf("async function loadJapaneseJlptQuestionBank"), script.indexOf("function selectJapaneseJlptLevel"));
assert(!html.includes(FORM_PATH) && !jlptEntryBlock.includes(FORM_PATH) &&
  !jlptEntryBlock.includes(COMPOSITION_PATH) && !jlptEntryBlock.includes("permutation"), "JLPT 入口載入 isolated bank 或 evidence");
const baseScript = git("show", `${BASE}:script.js`); const count = (text, pattern) => (text.match(pattern) || []).length;
for (const [name, pattern] of Object.entries({ localStorage:/\blocalStorage\b/g, sessionStorage:/\bsessionStorage\b/g, indexedDB:/\bindexedDB\b/g, cacheApi:/\bcaches\b/g }))
  assert(count(script, pattern) === count(baseScript, pattern), `${name} inventory 改變`);
assert(script.includes("let sentenceCompositionQuestions = []") && script.includes("sentenceCompositionQuestions = await response.json()"), "一般句子重組 state 改變");
assert(read(FORM_PATH) === formBytes && read(COMPOSITION_PATH) === compositionBytes, "checker 修改正式 bank");
console.log(`PASS: isolated profile ${PROFILE_VERSION}; 84 candidates (N5 42 / N4 42); pools 12/12 form-selection and 30/30 sentence-composition; balanced 2/2/2/2 answer positions; 17c8d-v1 identity permutations; ${rejected} negative fixtures; shortage and production isolation verified.`);
