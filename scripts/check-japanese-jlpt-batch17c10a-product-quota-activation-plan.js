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
const check = (value, message) => { if (!value) throw new Error(`Batch 17C-10A check: ${message}`); };

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
const context = { console, crypto: require("crypto").webcrypto };
vm.createContext(context);
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}\n${script.slice(start, end)}\nthis.api={createJapaneseJlptVocabularyDerivedCandidates,createJapaneseJlptGrammarFormSelectionCandidates,createJapaneseJlptSentenceCompositionCandidates,createJapaneseJlptN5ReadingCandidates,createJapaneseJlptN4ReadingCandidates,validateJapaneseJlptProfile,prepareJapaneseJlptCandidatePools,selectJapaneseJlptQuestions,JAPANESE_JLPT_PROFILE_REGISTRY};`, context);
const api = context.api;

const candidates = [
  ...api.createJapaneseJlptVocabularyDerivedCandidates(JSON.parse(read("japaneseJlptVocabularyAutoQuestions.json")), JSON.parse(read("japaneseJlptVocabularySemanticQuestions.json"))),
  ...api.createJapaneseJlptGrammarFormSelectionCandidates(JSON.parse(read("japaneseJlptGrammarFormSelectionQuestions.json"))),
  ...api.createJapaneseJlptSentenceCompositionCandidates(JSON.parse(read("japaneseSentenceCompositionQuestions.json"))),
  ...api.createJapaneseJlptN5ReadingCandidates(JSON.parse(read("japaneseJlptReadingN5Questions.json"))),
  ...api.createJapaneseJlptN4ReadingCandidates(JSON.parse(read("japaneseJlptReadingQuestions.json"))),
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
for (const level of ["N5", "N4"]) {
  const { profile, levelProfile } = api.validateJapaneseJlptProfile(registry, contract.profileVersion, contract.profileId, level);
  const pools = api.prepareJapaneseJlptCandidatePools(level, profile, levelProfile, candidates, contract.profileVersion);
  const selected = api.selectJapaneseJlptQuestions(pools, () => 0);
  check(selected.length === levelProfile.total && new Set(selected.map((q) => q.id)).size === selected.length, `${level} selection must satisfy fixed total without replacement`);
  const reading = selected.filter((q) => q.section === "reading");
  for (const setId of new Set(reading.map((q) => q.setId))) {
    const group = reading.filter((q) => q.setId === setId);
    check(group.every((q, index) => index === 0 || q.readingQuestionIndex >= group[index - 1].readingQuestionIndex), `${level}/${setId} reading order drift`);
    check(group.every((q) => q.sourceSetQuestionCount === q.readingQuestionCount && q.displayPassage && Number.isSafeInteger(q.readingSetIndex)), `${level}/${setId} passage metadata incomplete`);
  }
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

const compat = api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles["17c6-compat-v1"];
check(compat && compat.levels.N5.total === 20 && compat.levels.N4.total === 34, "17c6-compat-v1 missing or totals changed");
check(compat.levels.N5.sections.vocabulary.questionTypes.meaning === 10 && compat.levels.N5.sections.grammar.questionTypes.cloze === 5 && compat.levels.N4.sections.reading.questionTypes["legacy-reading-question"] === 14, "17c6 legacy contract not fully retained");
check(!api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles[contract.profileVersion], "product profile was prematurely registered in runtime");
check(/非官方/.test(documentText) && /JLPT-style/.test(documentText), "non-official JLPT-style disclosure missing");
check(/selection → immutable snapshot → balanced answer positions → randomization/.test(documentText), "pipeline ordering contract missing");

check(git("merge-base", "--is-ancestor", BASE, "HEAD") === "", "required PR #302 merge commit is not an ancestor");
const changed = new Set([...git("diff", "--name-only", BASE).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
check(changed.size === 2 && [...changed].every((path) => ALLOWED.has(path)), `scope must contain only the plan and checker: ${[...changed].join(", ")}`);
const protectedPaths = ["script.js", "index.html", "japanese/index.html", "style.css", "japanese/style.css"];
for (const path of protectedPaths.filter((path) => fs.existsSync(path))) check(git("hash-object", path) === git("rev-parse", `${BASE}:${path}`), `${path} changed`);
const forbiddenChanged = [...changed].filter((path) => path !== SELF && (path.endsWith(".html") || path.endsWith(".css") || path.endsWith(".json") || path.startsWith("scripts/")));
check(forbiddenChanged.length === 0, `runtime/bank/existing-checker scope violation: ${forbiddenChanged.join(", ")}`);
const baselineScript = git("show", `${BASE}:script.js`);
const inventory = (text, expression) => (text.match(expression) || []).length;
for (const [name, expression] of [["localStorage", /\blocalStorage\b/g], ["sessionStorage", /\bsessionStorage\b/g], ["IndexedDB", /\bindexedDB\b/g], ["Cache API", /\bcaches\b/g]]) check(inventory(script, expression) === inventory(baselineScript, expression), `${name} API inventory changed`);
const registryBlock = (text) => text.slice(text.indexOf("const JAPANESE_JLPT_PROFILE_REGISTRY"), text.indexOf("function validateJapaneseJlptProfile"));
check(registryBlock(script) === registryBlock(baselineScript), "production registry changed");

console.log("PASS: Batch 17C-10A product quota contract validated from machine-readable documentation.");
console.log("PASS: Dynamic adapter capacities: vocabulary N5 4x12 / N4 5x12; grammar each level 12/30; reading N5 2/4/4/2 / N4 41/35/33/41.");
console.log(`PASS: N5 20 and N4 34 quotas fit all pools; compat/runtime/storage isolation verified; ${negatives} negative fixtures rejected.`);
