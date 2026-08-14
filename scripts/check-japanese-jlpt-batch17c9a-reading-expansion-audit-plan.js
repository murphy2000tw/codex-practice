#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");

const BASE = "d312db8aa5273d94796237c445d2da6ee53f060e";
const PLAN = "docs/japanese-jlpt-batch17c9a-reading-expansion-audit-plan.md";
const CHECKER = "scripts/check-japanese-jlpt-batch17c9a-reading-expansion-audit-plan.js";
const ALLOWED = new Set([PLAN, CHECKER]);
const SECTIONS = ["short-passage", "medium-passage", "information-search", "notice-and-message"];
const EXPECTED_REJECTED_FIXTURES = 18;

function read(path) { return fs.readFileSync(path, "utf8"); }
function git(...args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }
function lines(value) { return value ? value.split("\n").filter(Boolean) : []; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function requireText(value, label) { assert.strictEqual(typeof value, "string", `${label} must be text`); assert(value.trim(), `${label} must not be empty`); }
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function loadSource() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read("japaneseReadingQuestions.js"), sandbox, { filename: "japaneseReadingQuestions.js" });
  return JSON.parse(JSON.stringify(sandbox.window.JAPANESE_READING_SETS));
}
function builderWhitelist() {
  const source = read("scripts/build-japanese-jlpt-batch17c2-reading-data.js");
  const match = source.match(/const SECTION_TYPES = Object\.freeze\((\{[\s\S]*?\})\);/);
  assert(match, "builder SECTION_TYPES whitelist not found");
  return JSON.parse(JSON.stringify(vm.runInNewContext(`(${match[1]})`)));
}
function extractCompatProfile() {
  const source = read("script.js");
  const start = source.indexOf('"17c6-compat-v1": {');
  const end = source.indexOf("\n  },\n});", start);
  assert(start >= 0 && end > start, "compat profile not found");
  return source.slice(start, end);
}
function inventory(bank) {
  const sections = {};
  for (const section of SECTIONS) {
    const sets = bank.readingSets.filter((set) => set.section === section);
    const lengths = sets.map((set) => Array.from(set.displayPassage).length);
    sections[section] = {
      sets: sets.length,
      questions: sets.reduce((sum, set) => sum + set.questions.length, 0),
      passageCodePoints: { minimum: Math.min(...lengths), median: median(lengths), maximum: Math.max(...lengths) },
    };
  }
  return {
    availability: { N5: { sets: bank.availability.N5.setCount, questions: bank.availability.N5.questionCount },
      N4: { sets: bank.readingSets.filter((set) => set.level === "N4").length,
        questions: bank.readingSets.filter((set) => set.level === "N4").reduce((n, set) => n + set.questions.length, 0) } },
    sourceTypeCount: new Set(bank.readingSets.map((set) => set.type)).size,
    questionsPerSet: { minimum: Math.min(...bank.readingSets.map((set) => set.questions.length)), maximum: Math.max(...bank.readingSets.map((set) => set.questions.length)) },
    sections,
    initialManifest: { sets: bank.selectionProfiles.N4.initial.setCount, questions: bank.selectionProfiles.N4.initial.questionCount },
  };
}
function sourceDerivedAgree(source, bank) {
  if (source.length !== bank.readingSets.length) return false;
  const derivedBySource = new Map(bank.readingSets.map((set) => [set.sourceSetId, set]));
  return source.every((set) => {
    const derived = derivedBySource.get(set.id);
    return derived && derived.level === set.level && derived.type === set.type && derived.originalTitle === set.title &&
      derived.originalPassage === set.passage && derived.passageKana === set.passageKana && derived.questions.length === set.questions.length &&
      set.questions.every((question) => {
        const dq = derived.questions.find((item) => item.sourceQuestionId === question.id);
        return dq && dq.originalText === question.question && JSON.stringify(dq.options) === JSON.stringify(question.options) &&
          dq.answerIndex === question.answerIndex && dq.answerDisplay === question.options[question.answerIndex] && dq.explanation === question.explanation;
      });
  });
}
function validate(state) {
  const { bank, source, whitelist, compat, controls } = state;
  assert.deepStrictEqual(bank.typeToSection, whitelist, "typeToSection differs from builder whitelist");
  assert.strictEqual(bank.availability.N5.available, false, "N5 reading must remain unavailable");
  assert.strictEqual(bank.availability.N5.setCount, 0, "N5 set count must be zero");
  assert.strictEqual(bank.availability.N5.questionCount, 0, "N5 question count must be zero");
  const actual = inventory(bank);
  assert.strictEqual(actual.availability.N4.sets, 105, "N4 set count drift");
  assert.strictEqual(actual.availability.N4.questions, 150, "N4 question count drift");
  assert.deepStrictEqual(Object.fromEntries(SECTIONS.map((s) => [s, [actual.sections[s].sets, actual.sections[s].questions]])),
    { "short-passage": [39, 41], "medium-passage": [15, 35], "information-search": [17, 33], "notice-and-message": [34, 41] }, "canonical section count drift");
  const knownTypes = new Set(Object.values(whitelist).flat());
  assert(bank.readingSets.every((set) => knownTypes.has(set.type)), "unknown source type");
  assert.strictEqual(new Set(bank.readingSets.map((set) => set.id)).size, bank.readingSets.length, "duplicate set ID");
  const questions = bank.readingSets.flatMap((set) => { assert(set.questions.length >= 1 && set.questions.length <= 3, "set must have 1..3 questions"); return set.questions; });
  assert.strictEqual(new Set(questions.map((q) => q.id)).size, questions.length, "duplicate question ID");
  for (const question of questions) {
    assert(Array.isArray(question.options) && question.options.length === 4, "question must have four options");
    question.options.forEach((option) => requireText(option, "option"));
    assert.strictEqual(new Set(question.options).size, 4, "options must be distinct");
    assert(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3, "answerIndex out of range");
    assert.strictEqual(question.answerDisplay, question.options[question.answerIndex], "answerDisplay mismatch");
    requireText(question.explanation, "explanation");
  }
  assert.strictEqual(actual.initialManifest.sets, 10, "manifest set count drift");
  assert.strictEqual(actual.initialManifest.questions, 14, "manifest question count drift");
  assert(compat.includes("N5: { total: 20") && compat.includes('reading: { included: false, status: "unavailable", total: null'), "production N5 reading/total changed");
  assert(compat.includes("N4: { total: 34") && compat.includes('reading: { included: true, status: "available", total: 14'), "production N4 reading changed");
  assert.strictEqual((compat.match(/listening: \{ included: false, status: "future"/g) || []).length, 2, "listening status changed");
  assert.strictEqual(controls.runtimeRubyInference, false, "runtime ruby inference forbidden");
  assert.strictEqual(controls.n4ToN5Fallback, false, "N4 to N5 fallback forbidden");
  assert.strictEqual(controls.seed.productQuota, false, "seed capacity is not product quota");
  assert(sourceDerivedAgree(source, bank), "source/derived mapping mismatch");
}

assert.strictEqual(git("merge-base", "HEAD", BASE), BASE, "PR #298 merge commit must be a HEAD ancestor");
const changed = new Set([...lines(git("diff", "--name-only", BASE)), ...lines(git("diff", "--cached", "--name-only")), ...lines(git("ls-files", "--others", "--exclude-standard"))]);
for (const path of changed) assert(ALLOWED.has(path), `scope violation: ${path}`);
for (const path of ALLOWED) { assert(changed.has(path), `required file missing: ${path}`); assert(!lines(git("ls-tree", "-r", "--name-only", BASE, "--", path)).includes(path), `${path} must be new`); }

const protectedPaths = ["japaneseJlptReadingPolicy.json", "japaneseJlptReadingQuestions.json", "japaneseReadingQuestions.js", "script.js"];
for (const path of protectedPaths) assert.strictEqual(git("diff", BASE, "--", path), "", `${path} changed`);
assert.strictEqual(lines(git("diff", "--name-only", BASE, "--", "*.html", "*.css")).length, 0, "HTML/CSS changed");
assert.strictEqual(lines(git("diff", "--name-only", BASE, "--", "scripts/check-*.js")).filter((p) => p !== CHECKER).length, 0, "historical checker changed");
const additions = git("diff", "--unified=0", BASE, "--", PLAN, CHECKER).split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++ ")).join("\n");
for (const forbidden of ["fe" + "tch(", "im" + "port(", "<scr" + "ipt", "local" + "Storage", "session" + "Storage", "cach" + "es.", "CACHE" + "_NAME"])
  assert(!additions.includes(forbidden), `new production integration forbidden: ${forbidden}`);

const bank = JSON.parse(read("japaneseJlptReadingQuestions.json"));
const state = { bank, source: loadSource(), whitelist: builderWhitelist(), compat: extractCompatProfile(),
  controls: { runtimeRubyInference: false, n4ToN5Fallback: false, seed: { label: "seed capacity", productQuota: false } } };
validate(state);

const plan = read(PLAN);
const match = plan.match(/<!-- READING_INVENTORY_JSON_START\s*([\s\S]*?)\s*READING_INVENTORY_JSON_END -->/);
assert(match, "machine-readable inventory block missing");
assert.deepStrictEqual(JSON.parse(match[1]), inventory(bank), "document inventory differs from dynamic inventory");
for (const marker of ["site-internal JLPT-style", "(setId, questionId)", "answerable questions", "uniqueAnswerReviewed: true", "optionReviews[4]", "sourceDigest", "passageEvidence", "informationEvidence", "runtime 不得猜讀音", "reading 不得包含漢字", "innerHTML", "productQuota: false", "Batch 17C-9B", "Batch 17C-9C", "Batch 17C-9D", "Batch 17C-10", "sourceSetQuestionCount", "selectedSessionQuestionCount"])
  assert(plan.includes(marker), `contract marker missing: ${marker}`);

const fixtures = [
  ["N5 available", (s) => { s.bank.availability.N5.available = true; }],
  ["N4 set drift", (s) => { s.bank.readingSets.pop(); }],
  ["N4 question drift", (s) => { s.bank.readingSets[0].questions.pop(); }],
  ["section drift", (s) => { s.bank.readingSets[0].section = "medium-passage"; }],
  ["unknown type", (s) => { s.bank.readingSets[0].type = "unknown"; }],
  ["duplicate set ID", (s) => { s.bank.readingSets[1].id = s.bank.readingSets[0].id; }],
  ["duplicate question ID", (s) => { s.bank.readingSets[1].questions[0].id = s.bank.readingSets[0].questions[0].id; }],
  ["option count", (s) => { s.bank.readingSets[0].questions[0].options.pop(); }],
  ["duplicate option", (s) => { const q = s.bank.readingSets[0].questions[0]; q.options[1] = q.options[0]; }],
  ["answerIndex", (s) => { s.bank.readingSets[0].questions[0].answerIndex = 4; }],
  ["manifest sets", (s) => { s.bank.selectionProfiles.N4.initial.setCount = 9; }],
  ["manifest questions", (s) => { s.bank.selectionProfiles.N4.initial.questionCount = 13; }],
  ["production N5 enabled", (s) => { s.compat = s.compat.replace('reading: { included: false, status: "unavailable"', 'reading: { included: true, status: "available"'); }],
  ["production N4 changed", (s) => { s.compat = s.compat.replace('total: 14, selectionMode: "legacy-fixed-manifest"', 'total: 15, selectionMode: "legacy-fixed-manifest"'); }],
  ["listening changed", (s) => { s.compat = s.compat.replace('listening: { included: false, status: "future"', 'listening: { included: true, status: "available"'); }],
  ["ruby inference", (s) => { s.controls.runtimeRubyInference = true; }],
  ["N4 fallback", (s) => { s.controls.n4ToN5Fallback = true; }],
  ["seed product quota", (s) => { s.controls.seed.productQuota = true; }],
  ["source derived mismatch", (s) => { s.source[0].passage += "改"; }],
];
// One combined manifest fixture covers both exact manifest dimensions, keeping the expected total explicit.
fixtures[10][1] = (s) => { s.bank.selectionProfiles.N4.initial.setCount = 9; s.bank.selectionProfiles.N4.initial.questionCount = 13; };
fixtures.splice(11, 1);
assert.strictEqual(fixtures.length, EXPECTED_REJECTED_FIXTURES, "fixture declaration count changed");
let rejected = 0;
for (const [name, mutate] of fixtures) {
  const fixture = clone(state);
  mutate(fixture);
  assert.throws(() => validate(fixture), undefined, `${name} fixture must be rejected`);
  rejected += 1;
}
assert(rejected === EXPECTED_REJECTED_FIXTURES);

console.log(`PASS: Batch 17C-9A audit; rejected ${rejected}/${EXPECTED_REJECTED_FIXTURES} negative fixtures`);
console.log(JSON.stringify(inventory(bank), null, 2));
