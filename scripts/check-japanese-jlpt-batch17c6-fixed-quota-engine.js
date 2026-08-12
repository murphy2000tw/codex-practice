#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");
const BASE = "878e8bc";
const ALLOWED = new Set(["script.js", "japanese/index.html", "docs/japanese-jlpt-batch17c6-fixed-quota-engine.md", "scripts/check-japanese-jlpt-batch17c6-fixed-quota-engine.js"]);
let failed = false;
function check(value, message) { if (!value) { failed = true; console.error(`FAIL: ${message}`); } }
function git(...args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function provider(seed = 1) { let state = seed >>> 0; return (max) => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state % max; }; }
function positionCounts(questions) { return [0, 1, 2, 3].map((index) => questions.filter((q) => q.answerIndex === index).length); }

check(git("merge-base", "HEAD", BASE) === git("rev-parse", BASE), "HEAD must contain merged PR #289 baseline");
const changed = new Set([...git("diff", "--name-only", BASE).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
for (const path of changed) check(ALLOWED.has(path), `protected or unexpected file changed: ${path}`);
for (const path of ALLOWED) check(changed.has(path), `required Batch 17C-6 file missing: ${path}`);

const script = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("japanese/index.html", "utf8");
check(html.includes('../script.js?v=3.8'), "script cache token must be v=3.8");
check(!script.slice(script.indexOf("const JAPANESE_JLPT_LEVELS"), script.indexOf("function appendJapaneseJlptDetail")).includes("Math.random"), "JLPT engine must not use Math.random");
for (const name of ["getJapaneseJlptRandomIndex", "shuffleJapaneseJlptArray", "createBalancedJapaneseJlptAnswerPositions", "randomizeJapaneseJlptQuestionOptions"])
  check(script.includes(`function ${name}`), `PR #288 helper missing: ${name}`);
check(script.includes("crypto.getRandomValues") && script.includes("value[0] >= limit"), "crypto rejection sampling missing");
const selectionAt = script.indexOf("const selected = selectJapaneseJlptQuestions", script.indexOf("function buildJapaneseJlptSession"));
const snapshotAt = script.indexOf("createJapaneseJlptPreRandomizationSnapshot", selectionAt);
const balanceAt = script.indexOf("createBalancedJapaneseJlptAnswerPositions", snapshotAt);
const randomizeAt = script.indexOf("randomizeJapaneseJlptQuestionOptions", balanceAt);
check(selectionAt >= 0 && snapshotAt > selectionAt && balanceAt > snapshotAt && randomizeAt > balanceAt, "pipeline order must be selection -> snapshot -> balance -> option randomization");

const sourceStart = script.indexOf("function deepFreezeJapaneseJlptValue");
const sourceEnd = script.indexOf("function appendJapaneseJlptDetail");
const helperStart = script.indexOf("function getJapaneseJlptRandomIndex");
const context = { console, crypto: require("crypto").webcrypto };
vm.createContext(context);
const source = `${script.slice(sourceStart, script.indexOf("let japaneseJlptReadingBank", sourceStart))}\n${script.slice(helperStart, sourceEnd)}\nthis.api={registry:JAPANESE_JLPT_PROFILE_REGISTRY,validateJapaneseJlptProfile,buildJapaneseJlptSession,prepareJapaneseJlptCandidatePools,selectJapaneseJlptQuestions,createJapaneseJlptPreRandomizationSnapshot,createJapaneseJlptReadingSnapshots,randomizeJapaneseJlptQuestionOptions};`;
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}\n${source}`, context);
const api = context.api;
check(Object.isFrozen(api.registry) && Object.isFrozen(api.registry.profiles["17c6-compat-v1"].levels.N4.sections.reading), "registry must be deeply frozen");
for (const level of ["N5", "N4"]) {
  const result = api.validateJapaneseJlptProfile(api.registry, "17c6-compat-v1", "site-jlpt-style-compatibility", level);
  check(result.levelProfile.total === (level === "N5" ? 20 : 34), `${level} compatibility total incorrect`);
}
const excludedFixture = clone(api.registry);
excludedFixture.profiles["17c6-compat-v1"].levels.N5.sections.reading = { included: false, status: "unavailable", total: null };
check(api.validateJapaneseJlptProfile(excludedFixture, "17c6-compat-v1", "site-jlpt-style-compatibility", "N5").levelProfile.total === 20, "included:false must not require quota or count toward total");
const badQuota = clone(api.registry);
badQuota.profiles["17c6-compat-v1"].levels.N5.sections.grammar.questionTypes.cloze = 4;
let quotaRejected = false; try { api.validateJapaneseJlptProfile(badQuota, "17c6-compat-v1", "site-jlpt-style-compatibility", "N5"); } catch (_) { quotaRejected = true; }
check(quotaRejected, "quota sum mismatch must be rejected");

const vg = JSON.parse(fs.readFileSync("japaneseJlptVocabularyGrammarQuestions.json", "utf8"));
const reading = JSON.parse(fs.readFileSync("japaneseJlptReadingQuestions.json", "utf8"));
const manifest = reading.selectionProfiles.N4.initial.setIds;
const readingBank = { selectedSets: manifest.map((id) => reading.readingSets.find((set) => set.id === id)) };
for (const level of ["N5", "N4"]) {
  const bankBefore = JSON.stringify(vg); const readingBefore = JSON.stringify(readingBank);
  const session = api.buildJapaneseJlptSession(level, vg, readingBank, provider(level === "N5" ? 17 : 29));
  check(session.questionSnapshots.length === (level === "N5" ? 20 : 34), `${level} session total incorrect`);
  const counts = positionCounts(session.questionSnapshots);
  check(level === "N5" ? counts.every((n) => n === 5) : counts.every((n) => n === 8 || n === 9) && Math.max(...counts) - Math.min(...counts) <= 1, `${level} answer positions unbalanced`);
  const ids = session.preRandomizationSnapshot.map((q) => q.section === "reading" ? `${q.setId}:${q.questionId}` : `${q.level}:${q.section}:${q.questionType}:${q.sourceQuestionId}`);
  check(new Set(ids).size === ids.length, `${level} has repeated canonical identity`);
  check(Object.isFrozen(session.preRandomizationSnapshot) && session.preRandomizationSnapshot.every(Object.isFrozen), `${level} snapshot not immutable`);
  check(JSON.stringify(vg) === bankBefore && JSON.stringify(readingBank) === readingBefore, `${level} source bank mutated`);
  const immutableSnapshotJson = JSON.stringify(session.preRandomizationSnapshot);
  session.preRandomizationSnapshot.forEach((question, index) => {
    const randomized = api.randomizeJapaneseJlptQuestionOptions(question, (question.answerIndex + 1) % 4, provider(index + 101));
    randomized.options[0] = "checker mutation";
    randomized.answerIndex = 3;
  });
  check(JSON.stringify(session.preRandomizationSnapshot) === immutableSnapshotJson, `${level} pre-randomization snapshot changed during/after option randomization`);
  if (level === "N4") {
    const rq = session.preRandomizationSnapshot.filter((q) => q.section === "reading");
    check(rq.length === 14, "reading quota must count 14 questions, not sets");
    const actualSetIds = [...new Set(rq.map((q) => q.setId))];
    check(JSON.stringify(actualSetIds) === JSON.stringify(manifest), "legacy fixed manifest exact setId list/order changed");
    const expectedPairs = readingBank.selectedSets.flatMap((set) => set.questions.map((question) => [set.id, question.id]));
    check(JSON.stringify(rq.map((question) => [question.setId, question.questionId])) === JSON.stringify(expectedPairs), "legacy fixed manifest exact questionId composition/order changed");
    check(rq.every((q) => ["displayTitle","displayPassage","passageKana","rubyTerms","rubyCoverage","sourceSetId","setId","questionId","explanation","options","answerIndex","sourceSetQuestionCount","selectedSessionQuestionCount"].every((key) => q[key] !== undefined)), "reading snapshot metadata incomplete");
    check(rq.every((q, i, all) => i === 0 || q.setId !== all[i - 1].setId || q.readingQuestionIndex > all[i - 1].readingQuestionIndex), "reading set question order changed");
  }
}

const shortBank = { ...vg, questions: vg.questions.filter((q) => q.id !== "jlpt-vocab-n5-001") };
let publishedSession = null; let insufficient;
const beforeShort = JSON.stringify(shortBank);
try { publishedSession = api.buildJapaneseJlptSession("N5", shortBank, null, provider(3)); } catch (error) { insufficient = error; }
check(publishedSession === null, "insufficient pool must not publish a partial session");
check(insufficient && insufficient.code === "JLPT_INSUFFICIENT_POOL" && JSON.stringify(insufficient.details) === JSON.stringify({ level:"N5", section:"vocabulary", questionType:"meaning", required:10, available:9, profileVersion:"17c6-compat-v1" }), "insufficient pool structured error incomplete");
check(JSON.stringify(shortBank) === beforeShort, "insufficient failure mutated source bank");

// All pools are prepared and validated before selection consumes any randomness.
const n5Profile = api.validateJapaneseJlptProfile(api.registry, "17c6-compat-v1", "site-jlpt-style-compatibility", "N5");
const n5Candidates = vg.questions.filter((question) => question.level === "N5").map((question) => ({
  ...clone(question), sourceQuestionId: question.id, sourceBank: "fixture",
}));
const lastPoolShort = n5Candidates.filter((question) => question.id !== "jlpt-grammar-cloze-n5-005");
let randomCalls = 0; let lateInsufficient;
try {
  const pools = api.prepareJapaneseJlptCandidatePools("N5", n5Profile.profile, n5Profile.levelProfile, lastPoolShort, "fixture-profile-v9");
  api.selectJapaneseJlptQuestions(pools, (max) => { randomCalls += 1; return provider(5)(max); });
} catch (error) { lateInsufficient = error; }
check(randomCalls === 0, "late insufficient pool must fail before any randomIndexProvider call");
check(lateInsufficient && lateInsufficient.details.profileVersion === "fixture-profile-v9" && lateInsufficient.details.section === "grammar" && lateInsufficient.details.questionType === "cloze", "late insufficient error must use explicitly supplied profileVersion and pool details");

for (const [label, mutate] of [
  ["missing required field", (candidate) => { delete candidate.section; }],
  ["unregistered classification", (candidate) => { candidate.questionType = "borrowed-fallback"; }],
]) {
  const invalid = clone(n5Candidates);
  mutate(invalid[0]);
  let rejected = false;
  try { api.prepareJapaneseJlptCandidatePools("N5", n5Profile.profile, n5Profile.levelProfile, invalid, "fixture-profile"); } catch (_) { rejected = true; }
  check(rejected, `${label} candidate must be rejected rather than silently filtered`);
}

// Excluded reading neither creates a pool nor requires a reading bank.
const n5Pools = api.prepareJapaneseJlptCandidatePools("N5", n5Profile.profile, n5Profile.levelProfile, n5Candidates, "17c6-compat-v1");
check([...n5Pools.values()].every((pool) => pool.sectionName !== "reading"), "included:false reading must not create or validate a pool");
check(api.buildJapaneseJlptSession("N5", vg, null, provider(71)).questionSnapshots.length === 20, "included:false reading must not require a reading bank or block start");
const renderBlock = script.slice(script.indexOf("function renderJapaneseJlptPanel"), script.indexOf("function selectJapaneseJlptLevel"));
const startBlock = script.slice(script.indexOf("function startJapaneseJlptMock"), script.indexOf("function returnToJapaneseJlptSetup"));
check(renderBlock.includes("sections.reading.included") && startBlock.includes("sections.reading.included") && !startBlock.includes('selectedJapaneseJlptLevel === "N4"'), "reading startup requirement must come from profile included, not level name");

// A partial reading selection must deep-clone metadata, count selected questions, and retain same-set order.
const multiQuestionSet = reading.readingSets.find((set) => set.questions.length >= 3);
const readingCandidates = Array.from(api.createJapaneseJlptReadingSnapshots([multiQuestionSet]));
const partialPools = new Map([["N4\u0000reading\u0000legacy-reading-question", {
  sectionName: "reading", quota: 2, candidates: readingCandidates,
}]]);
const partialCandidates = Array.from(api.selectJapaneseJlptQuestions(partialPools, provider(83)));
const partialBefore = JSON.stringify(partialCandidates);
const partialLevelProfile = { total: 2, sections: {
  vocabulary: { included: false, status: "available", total: null },
  grammar: { included: false, status: "available", total: null },
  reading: { included: true, status: "available", total: 2, questionTypes: { "legacy-reading-question": 2 } },
  listening: { included: false, status: "future", total: null },
} };
const partialSnapshot = api.createJapaneseJlptPreRandomizationSnapshot(partialCandidates, partialLevelProfile);
check(JSON.stringify(partialCandidates) === partialBefore && !Object.isFrozen(partialCandidates[0].options) && !Object.isFrozen(partialCandidates[0].rubyTerms) && !Object.isFrozen(partialCandidates[0].rubyCoverage), "snapshot creation must not mutate or freeze candidate nested metadata");
check(partialSnapshot.every((question) => question.selectedSessionQuestionCount === 2 && question.sourceSetQuestionCount === multiQuestionSet.questions.length), "reading selected/source question counts must reflect selection and source independently");
check(partialSnapshot[0].readingQuestionIndex < partialSnapshot[1].readingQuestionIndex, "partial same-set reading selection must retain source question order");
check(partialSnapshot[0].options !== partialCandidates[0].options && partialSnapshot[0].rubyTerms !== partialCandidates[0].rubyTerms && partialSnapshot[0].rubyCoverage !== partialCandidates[0].rubyCoverage, "snapshot nested values must be deep clones");
const partialRandomized = api.randomizeJapaneseJlptQuestionOptions(partialSnapshot[0], (partialSnapshot[0].answerIndex + 1) % 4, provider(97));
check(partialRandomized.options !== partialSnapshot[0].options && partialRandomized.rubyTerms !== partialSnapshot[0].rubyTerms && partialRandomized.rubyCoverage !== partialSnapshot[0].rubyCoverage, "randomized question must not share nested snapshot references");
check(!script.slice(script.indexOf("const JAPANESE_JLPT_LEVELS"), sourceEnd).match(/localStorage|sessionStorage|indexedDB/), "JLPT session engine must remain memory-only");

if (failed) process.exit(1);
console.log("PASS: Batch 17C-6 fixed-quota engine checks passed.");
