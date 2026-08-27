#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASE = "5b858ed";
const ALLOWED = new Set([
  "script.js", "japanese/index.html",
  "docs/japanese-jlpt-batch18a2-listening-adapter.md",
  "scripts/check-japanese-jlpt-batch18a2-listening-adapter.js",
]);
const REQUIRED_STRINGS = ["id", "level", "category", "japanese", "kana", "zh", "question"];
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
const check = (condition, message) => { if (!condition) throw new Error(`Batch 18A-2 check: ${message}`); };

function extractBalanced(source, marker, openCharacter, closeCharacter) {
  const markerIndex = source.indexOf(marker);
  check(markerIndex >= 0, `${marker} missing`);
  const start = source.indexOf(openCharacter, markerIndex + marker.length - 1);
  check(start >= 0, `${marker} body missing`);
  let depth = 0; let quote = null; let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") { quote = character; continue; }
    if (character === openCharacter) depth += 1;
    if (character === closeCharacter && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Batch 18A-2 check: ${marker} is incomplete`);
}
function extractFunction(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  check(start >= 0, `${name} missing`);
  return source.slice(start, source.indexOf("{", start)) + extractBalanced(source, marker, "{", "}");
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function mustFail(label, callback) {
  let failed = false;
  try { callback(); } catch (_error) { failed = true; }
  check(failed, `${label} must fail closed`);
}

const script = read("script.js");
const baseScript = git("show", `${BASE}:script.js`);
const arraySource = extractBalanced(script, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]");
check(arraySource === extractBalanced(baseScript, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]"), "source listening bank changed");
const versionNames = [
  "JAPANESE_JLPT_LISTENING_SOURCE_BANK", "JAPANESE_JLPT_LISTENING_SOURCE_VERSION",
  "JAPANESE_JLPT_LISTENING_ADAPTER_VERSION",
];
const declarations = versionNames.map((name) => {
  const match = script.match(new RegExp(`const ${name} = ("[^"]+");`));
  check(match, `${name} declaration missing`);
  return `const ${name} = ${match[1]};`;
}).join("\n");
const context = {};
vm.createContext(context);
vm.runInContext(`"use strict";
this.questions = ${arraySource};
${declarations}
${extractFunction(script, "deepFreezeJapaneseJlptValue")}
${extractFunction(script, "adaptJapaneseJlptListeningQuestion")}
${extractFunction(script, "createJapaneseJlptListeningCandidates")}
this.adapt = adaptJapaneseJlptListeningQuestion;
this.create = createJapaneseJlptListeningCandidates;`, context);
const source = context.questions;
const originalSnapshot = JSON.stringify(source);
const candidates = context.create(source);

check(source.length === 100 && candidates.length === 100, "inventory must total 100");
check(source.filter((item) => item.level === "N5").length === 69, "N5 inventory must be 69");
check(source.filter((item) => item.level === "N4").length === 31, "N4 inventory must be 31");
const expectedIds = Array.from({ length: 100 }, (_, index) => `jl-${String(index + 1).padStart(3, "0")}`);
check(JSON.stringify([...new Set(source.map((item) => item.id))].sort()) === JSON.stringify(expectedIds), "IDs must be complete and unique jl-001..jl-100");
source.forEach((item) => {
  check(REQUIRED_STRINGS.every((field) => typeof item[field] === "string" && item[field].trim()), `${item.id} required string invalid`);
  check(["N5", "N4"].includes(item.level), `${item.id} level invalid`);
  check(Array.isArray(item.options) && item.options.length === 4 && item.options.every((option) => typeof option === "string" && option.trim()), `${item.id} options invalid`);
  check(Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex <= 3, `${item.id} answerIndex invalid`);
  check(item.options[item.answerIndex] === item.zh, `${item.id} answer contract invalid`);
});
check(new Set(candidates.map((item) => item.id)).size === 100, "canonical identities must be unique");
candidates.forEach((candidate, index) => {
  const item = source[index];
  check(candidate.id === `japanese-jlpt-listening:${item.id}` && candidate.sourceId === item.id, `${item.id} provenance identity invalid`);
  check(candidate.sourceBank === "JAPANESE_LISTENING_QUESTIONS" && candidate.sourceVersion === "18a2-listening-source-v1" && candidate.adapterVersion === "18a2-listening-adapter-v1", `${item.id} provenance version invalid`);
  check(candidate.section === "listening" && candidate.questionType === "listeningMeaning", `${item.id} candidate classification invalid`);
  check(candidate.canonicalCorrectOption === item.zh && candidate.canonicalCorrectOption === item.options[item.answerIndex], `${item.id} canonical correct option invalid`);
  check(candidate.options !== item.options, `${item.id} shares mutable options reference`);
  check(Object.isFrozen(candidate) && Object.isFrozen(candidate.options), `${item.id} candidate must be deeply frozen`);
});
check(Object.isFrozen(candidates), "candidate collection must be frozen");
check(JSON.stringify(source) === originalSnapshot, "adapter modified source data");
check(!Object.isFrozen(source) && source.every((item) => !Object.isFrozen(item) && !Object.isFrozen(item.options)), "adapter froze source data");
const isolatedSource = clone(source); const isolatedCandidates = context.create(isolatedSource);
isolatedSource[0].options[0] = "source mutation";
check(isolatedCandidates[0].options[0] !== "source mutation", "source mutation affected candidate");
mustFail("candidate mutation", () => { isolatedCandidates[0].options[0] = "candidate mutation"; });
check(isolatedSource[0].options[0] === "source mutation", "candidate mutation affected source");

for (const field of REQUIRED_STRINGS) {
  const invalid = clone(source); invalid[0][field] = " ";
  mustFail(`invalid ${field}`, () => context.create(invalid));
}
for (const mutate of [
  (bank) => { bank[0].options = bank[0].options.slice(0, 3); },
  (bank) => { bank[0].options[0] = " "; },
  (bank) => { bank[0].answerIndex = 4; },
  (bank) => { bank[0].zh = "wrong answer"; },
  (bank) => { bank[0].level = "N3"; },
  (bank) => { bank[1].id = bank[0].id; },
  (bank) => { bank[99].id = "jl-101"; },
  (bank) => { bank[0].level = "N4"; },
]) {
  const invalid = clone(source); mutate(invalid);
  mustFail("invalid source mutation", () => context.create(invalid));
}
mustFail("missing ID and inventory", () => context.create(clone(source).slice(1)));
mustFail("wrong inventory", () => context.create([...clone(source), clone(source[0])]));

check(extractFunction(script, "buildJapaneseJlptSession") === extractFunction(baseScript, "buildJapaneseJlptSession"), "production session builder changed");
check(extractBalanced(script, "const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}") === extractBalanced(baseScript, "const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}"), "production profile or quota changed");
for (const level of ["N5", "N4"]) {
  const expectedTotal = level === "N5" ? 20 : 34;
  const profileText = extractBalanced(script, "const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}");
  check(profileText.includes(`${level}: { total: ${expectedTotal}`), `${level} production total changed`);
}
check((script.match(/listening: \{ included: false, status: "future", total: null, questionTypes: \{\} \}/g) || []).length >= 4, "listening future status changed");
const adapterText = [extractFunction(script, "adaptJapaneseJlptListeningQuestion"), extractFunction(script, "createJapaneseJlptListeningCandidates")].join("\n");
for (const forbidden of ["fetch(", "import(", "document.", "localStorage", "sessionStorage", "speechSynthesis", "buildJapaneseJlptSession("])
  check(!adapterText.includes(forbidden), `adapter contains forbidden production dependency: ${forbidden}`);
check(!extractFunction(script, "buildJapaneseJlptSession").includes("createJapaneseJlptListeningCandidates"), "production session invokes dormant adapter");

const htmlDiff = git("diff", BASE, "--", "japanese/index.html");
check(htmlDiff.includes('script.js?v=4.3') && htmlDiff.includes('script.js?v=4.4'), "script cache token was not incremented once");
check(htmlDiff.split("\n").filter((line) => /^[+-](?![+-])/.test(line)).length === 2, "japanese/index.html contains changes beyond cache token");
const changed = new Set([...git("diff", "--name-only", `${BASE}...HEAD`).split("\n"), ...git("diff", "--name-only").split("\n"), ...git("diff", "--name-only", "--cached").split("\n")].filter(Boolean));
for (const file of changed) check(ALLOWED.has(file), `file outside Batch 18A-2 scope changed: ${file}`);
check(![...changed].some((file) => file.endsWith(".json") || file === "style.css"), "UI, storage/cache schema, or question-bank file changed");

console.log("Batch 18A-2 JLPT listening immutable adapter audit passed.");
console.log("Inventory: total=100; N5=69; N4=31; IDs=jl-001..jl-100 unique and complete.");
console.log("Provenance, canonical answers, fail-closed mutations, deep freeze, and reference isolation passed.");
console.log("JLPT listening remains future/dormant; production totals remain N5=20 and N4=34.");
