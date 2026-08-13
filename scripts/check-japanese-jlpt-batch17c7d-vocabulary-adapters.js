#!/usr/bin/env node
"use strict";
const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");
let failed = false;
const check = (value, message) => { if (!value) { failed = true; console.error(`FAIL: ${message}`); } };
const clone = (value) => JSON.parse(JSON.stringify(value));
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const provider = (seed = 1, counter) => { let state = seed >>> 0; return (max) => { if (counter) counter.calls += 1; state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state % max; }; };

const fallback = "a31236098b2ed62dadade07071473ef45e2b27a6";
const refs = [process.env.JLPT_17C7D_BASE_REF, "origin/main", "main", fallback].filter(Boolean);
const baseRef = refs.find((ref) => { try { git("rev-parse", "--verify", `${ref}^{commit}`); return true; } catch (_) { return false; } });
check(Boolean(baseRef), "scope base ref must resolve");
const base = baseRef ? git("merge-base", "HEAD", baseRef) : fallback;
const allowed = new Set(["script.js", "japanese/index.html", "scripts/check-japanese-jlpt-batch17c7d-vocabulary-adapters.js", "docs/japanese-jlpt-batch17c7d-vocabulary-adapters.md"]);
const changed = new Set([...git("diff", "--name-only", base).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
for (const path of changed) check(allowed.has(path), `unexpected Batch 17C-7D scope: ${path}`);
for (const path of allowed) check(changed.has(path), `required Batch 17C-7D file missing: ${path}`);

const script = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("japanese/index.html", "utf8");
const auto = JSON.parse(fs.readFileSync("japaneseJlptVocabularyAutoQuestions.json", "utf8"));
const semantic = JSON.parse(fs.readFileSync("japaneseJlptVocabularySemanticQuestions.json", "utf8"));
const start = script.indexOf("function deepFreezeJapaneseJlptValue");
const end = script.indexOf("function appendJapaneseJlptDetail");
const context = { console, crypto: require("crypto").webcrypto };
vm.createContext(context);
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}\n${script.slice(start, end)}\nthis.api={JAPANESE_JLPT_PROFILE_REGISTRY,adaptJapaneseJlptVocabularyDerivedQuestion,createJapaneseJlptVocabularyDerivedCandidates,validateJapaneseJlptProfile,prepareJapaneseJlptCandidatePools,selectJapaneseJlptQuestions,createJapaneseJlptPreRandomizationSnapshot,createBalancedJapaneseJlptAnswerPositions,randomizeJapaneseJlptQuestionOptions,getJapaneseJlptCanonicalIdentity};`, context);
const api = context.api;
const candidates = Array.from(api.createJapaneseJlptVocabularyDerivedCandidates(auto, semantic));
check(candidates.length === 108, "adapter must produce 108 candidates");
const expected = { N5:{"kanji-reading":12,orthography:12,context:12,paraphrase:12}, N4:{"kanji-reading":12,orthography:12,context:12,paraphrase:12,usage:12} };
for (const [level, types] of Object.entries(expected)) for (const [type, count] of Object.entries(types))
  check(candidates.filter((q) => q.level === level && q.section === "vocabulary" && q.questionType === type).length === count, `${level} vocabulary/${type} pool must contain 12`);
check(!candidates.some((q) => q.level === "N5" && q.questionType === "usage"), "N5 usage pool must not exist");
check(new Set(candidates.map(api.getJapaneseJlptCanonicalIdentity)).size === 108, "canonical identities must be unique");
const requiredByType = {"kanji-reading":["sourceIds","readingReview","kanjiReview","distractorReviews","distractors"],orthography:["sourceIds","targetOccurrence","optionReviews","renderingPolicy","distractors"],context:["sourceIds","targetOccurrence","inflectionMetadata","optionSourceIds","substitutionReviews","distractors"],paraphrase:["sourceIds","interchangeabilityScope","semanticReviewId","optionReviews"],usage:["sourceIds","usageSentences","incorrectUsageReasons","usageReviewId"]};
check(candidates.every((q) => ["reviewStatus","reviewVersion","reviewMethod","reviewTags","uniqueAnswerReviewed","derivationVersion",...requiredByType[q.questionType]].every((key) => q[key] !== undefined)), "provenance, review, derivation and type metadata must survive adaptation");

const bankBefore = JSON.stringify([auto, semantic]);
for (const key of ["options","rubyTerms","reviewTags","targetOccurrence","optionReviews","substitutionReviews","usageSentences","incorrectUsageReasons"]) {
  const q = candidates.find((item) => item[key] && typeof item[key] === "object");
  if (q) { if (Array.isArray(q[key])) q[key].push({ checkerMutation:true }); else q[key].checkerMutation = true; }
}
check(JSON.stringify([auto, semantic]) === bankBefore, "candidate nested mutation must not change either source bank");
const cleanCandidates = Array.from(api.createJapaneseJlptVocabularyDerivedCandidates(auto, semantic));

const isolated = { schemaVersion:1, profiles:{ "17c7d-isolated-vocabulary-fixture-v1": { profileVersion:"17c7d-isolated-vocabulary-fixture-v1", profileId:"site-jlpt-style-vocabulary-fixture", profileKind:"test-only-isolated", levels:{} } } };
for (const [level, types] of Object.entries(expected)) isolated.profiles["17c7d-isolated-vocabulary-fixture-v1"].levels[level] = { total:Object.keys(types).length, sections:{ vocabulary:{ included:true,status:"available",total:Object.keys(types).length,questionTypes:Object.fromEntries(Object.keys(types).map((type) => [type,1])) } } };
for (const level of ["N5","N4"]) {
  const validated = api.validateJapaneseJlptProfile(isolated,"17c7d-isolated-vocabulary-fixture-v1","site-jlpt-style-vocabulary-fixture",level);
  const pools = api.prepareJapaneseJlptCandidatePools(level,validated.profile,validated.levelProfile,cleanCandidates,validated.profile.profileVersion);
  check([...pools.values()].every((pool) => pool.candidates.length === 12 && pool.level === level && pool.sectionName === "vocabulary"), `${level} normalized pool keys and capacities must be exact`);
  const selected = Array.from(api.selectJapaneseJlptQuestions(pools,provider(level === "N5" ? 5 : 7)));
  const before = JSON.stringify(selected);
  const snapshot = Array.from(api.createJapaneseJlptPreRandomizationSnapshot(selected,validated.levelProfile));
  check(JSON.stringify(selected) === before && selected.every((q) => !Object.isFrozen(q) && !Object.isFrozen(q.options)), `${level} snapshot must not mutate/freeze candidates`);
  const deeplyFrozen = (value) => !value || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deeplyFrozen));
  check(snapshot.every(deeplyFrozen), `${level} snapshot must be deeply frozen`);
  const snapshotBefore = JSON.stringify(snapshot);
  const positions = Array.from(api.createBalancedJapaneseJlptAnswerPositions(snapshot.length,provider(11)));
  const randomized = snapshot.map((q,index) => api.randomizeJapaneseJlptQuestionOptions(q,positions[index],provider(index + 20)));
  check(JSON.stringify(snapshot) === snapshotBefore, `${level} option randomization must not mutate snapshot`);
  check(randomized.every((q,index) => q !== snapshot[index] && q.options !== snapshot[index].options), `${level} randomized values must not share snapshot mutable references`);
  for (const q of randomized) {
    if (q.questionType === "orthography") check(q.optionReviews.every((r,i) => r.value === q.options[i]), "orthography optionReviews alignment");
    if (q.questionType === "context") check(q.substitutionReviews.every((r,i) => r.value === q.options[i]) && q.optionSourceIds.length === 4, "context metadata alignment");
    if (q.questionType === "paraphrase") check(q.optionReviews.every((r,i) => r.expression === q.options[i]), "paraphrase optionReviews alignment");
    if (q.questionType === "usage") check(q.correctUsageIndex === q.answerIndex && q.usageSentences.every((r,i) => r.sentence === q.options[i] && r.acceptedAsCorrect === (i === q.answerIndex)) && JSON.stringify(q.incorrectUsageReasons.map((r) => r.usageIndex).sort()) === JSON.stringify([0,1,2,3].filter((i) => i !== q.answerIndex)), "usage linked metadata alignment");
  }
}

function rejects(mutator, message) { const a=clone(auto), s=clone(semantic); mutator(a,s); let rejected=false; try { api.createJapaneseJlptVocabularyDerivedCandidates(a,s); } catch (_) { rejected=true; } check(rejected,message); }
rejects((a) => { delete a.questions[0].reviewVersion; }, "missing required field must fail");
rejects((a) => { a.questions[0].questionType="unknown"; }, "unknown type must fail");
rejects((a,s) => { const q=s.questions.find((x) => x.questionType==="usage"); q.level="N5"; }, "N5 usage and level/type fallback must fail");
rejects((a) => { a.questions[1].id=a.questions[0].id; }, "duplicate id must fail");
rejects((a) => { a.questions[1].sourceQuestionId=a.questions[0].sourceQuestionId; }, "duplicate sourceQuestionId must fail");
rejects((a) => { a.questions[0].answerDisplay="mismatch"; }, "answerDisplay mismatch must fail");
rejects((a) => { delete a.questions[0].uniqueAnswerReviewed; }, "missing review metadata must fail");

const validated = api.validateJapaneseJlptProfile(isolated,"17c7d-isolated-vocabulary-fixture-v1","site-jlpt-style-vocabulary-fixture","N4");
const short = cleanCandidates.filter((q) => !(q.level === "N4" && q.questionType === "usage" && q === cleanCandidates.find((x) => x.level === "N4" && x.questionType === "usage")));
const counter={calls:0}; let error; let session=null;
try { const pools=api.prepareJapaneseJlptCandidatePools("N4",validated.profile,validated.levelProfile.map || {...validated.levelProfile,sections:{vocabulary:{...validated.levelProfile.sections.vocabulary,questionTypes:{...validated.levelProfile.sections.vocabulary.questionTypes,usage:12},total:16}},total:16},short,"insufficient-fixture"); session=api.selectJapaneseJlptQuestions(pools,provider(1,counter)); } catch (e) { error=e; }
check(session === null && counter.calls === 0 && error && error.code === "JLPT_INSUFFICIENT_POOL" && error.details.level === "N4" && error.details.section === "vocabulary" && error.details.questionType === "usage" && error.details.required === 12 && error.details.available === 11 && error.details.profileVersion === "insufficient-fixture", "insufficient pool must fail structurally before randomness or partial selection");

const compat=api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles["17c6-compat-v1"];
check(JSON.stringify(compat.levels.N5) === JSON.stringify({total:20,sections:{vocabulary:{included:true,status:"available",total:10,questionTypes:{meaning:10}},grammar:{included:true,status:"available",total:10,questionTypes:{meaning:5,cloze:5}},reading:{included:false,status:"unavailable",total:null,questionTypes:{}},listening:{included:false,status:"future",total:null,questionTypes:{}}}}), "N5 compatibility profile changed");
check(compat.levels.N4.total===34 && compat.levels.N4.sections.vocabulary.questionTypes.meaning===10 && compat.levels.N4.sections.grammar.total===10 && compat.levels.N4.sections.reading.total===14, "N4 compatibility profile changed");
check(!JSON.stringify(api.JAPANESE_JLPT_PROFILE_REGISTRY).match(/kanji-reading|orthography|paraphrase|usage/), "production registry contains new vocabulary types");
const buildBlock=script.slice(script.indexOf("function buildJapaneseJlptSession"),script.indexOf("function appendJapaneseJlptDetail"));
check(!buildBlock.includes("Derived") && buildBlock.includes("questionBank.questions.map(createJapaneseJlptQuestionSnapshot)"), "production build path must not call adapter");
check(!html.match(/japaneseJlptVocabulary(?:Auto|Semantic)Questions/) && !script.match(/fetch\([^)]*japaneseJlptVocabulary(?:Auto|Semantic)Questions|import\([^)]*japaneseJlptVocabulary(?:Auto|Semantic)Questions/), "production must not load derived banks");
check(html.includes('../script.js?v=3.9'), "script cache token must be v3.9");
const baseScript=git("show",`${base}:script.js`); const storage=(text) => [...text.matchAll(/\b(?:localStorage|sessionStorage|indexedDB|caches)\b/g)].map((m)=>m[0]).sort().join("|");
check(storage(script)===storage(baseScript), "storage API inventory changed");
if (failed) process.exit(1);
console.log(`PASS: Batch 17C-7D vocabulary adapters (108 candidates; N5 48, N4 60; 9 pools x 12). Scope base: ${baseRef} @ ${base}.`);
