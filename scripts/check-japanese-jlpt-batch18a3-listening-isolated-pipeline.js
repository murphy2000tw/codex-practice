#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const BASE = "6ec1641";
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
const check = (condition, message) => { if (!condition) throw new Error(`Batch 18A-3 check: ${message}`); };

function balanced(source, marker, open, close) {
  const markerIndex = source.indexOf(marker);
  check(markerIndex >= 0, `${marker} missing`);
  const start = source.indexOf(open, markerIndex);
  let depth = 0; let quote = null; let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if ('"\'`'.includes(character)) { quote = character; continue; }
    if (character === open) depth += 1;
    else if (character === close && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Batch 18A-3 check: ${marker} incomplete`);
}
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  check(start >= 0, `${name} missing`);
  const parametersStart = source.indexOf("(", start);
  let depth = 0; let parametersEnd = -1;
  for (let index = parametersStart; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")" && --depth === 0) { parametersEnd = index; break; }
  }
  const bodyStart = source.indexOf("{", parametersEnd);
  let bodyDepth = 0; let quote = null; let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if ('"\'`'.includes(character)) { quote = character; continue; }
    if (character === "{") bodyDepth += 1;
    else if (character === "}" && --bodyDepth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Batch 18A-3 check: ${name} incomplete`);
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deterministic(seed) {
  let state = seed >>> 0;
  const random = () => { random.calls += 1; state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  random.calls = 0;
  return random;
}
function expectFailBeforeRandom(label, build, candidates, mutate, level = "N5") {
  const invalid = clone(candidates); mutate(invalid); const random = deterministic(1); let failed = false;
  try { build(level, invalid, random); } catch (_error) { failed = true; }
  check(failed && random.calls === 0, `${label} must fail before randomization`);
}
function mockProvider({ japanese = true, throwSpeak = false, throwConstructor = false, omit = null } = {}) {
  const utterances = [];
  class Utterance {
    constructor(text) { if (throwConstructor) throw new Error("constructor fixture"); this.text = text; utterances.push(this); }
  }
  const voice = { lang: "ja-JP", name: "mock-ja" };
  const synthesis = {
    speaks: 0, cancels: 0,
    getVoices: () => japanese ? [voice] : [{ lang: "en-US" }],
    speak() { this.speaks += 1; if (throwSpeak) throw new Error("speak fixture"); },
    cancel() { this.cancels += 1; },
  };
  const provider = { speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance, utterances, voice };
  if (omit === "speechSynthesis") provider.speechSynthesis = null;
  if (omit === "Utterance") provider.SpeechSynthesisUtterance = null;
  if (omit === "getVoices") delete synthesis.getVoices;
  return provider;
}

const script = read("script.js");
const baseScript = git("show", `${BASE}:script.js`);
const bankSource = balanced(script, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]");
check(bankSource === balanced(baseScript, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]"), "source question bank changed");
const pipelineFunctions = [
  "deepFreezeJapaneseJlptValue", "adaptJapaneseJlptListeningQuestion", "createJapaneseJlptListeningCandidates",
  "validateJapaneseJlptListeningCapability", "randomIndexJapaneseJlptListening", "shuffleJapaneseJlptListening",
  "validateJapaneseJlptListeningCandidatePool", "buildJapaneseJlptListeningIsolatedSession",
  "createJapaneseJlptListeningPreAnswerViewModel", "createJapaneseJlptListeningIsolatedController",
  "createJapaneseListeningModeSpeechController",
];
const context = {};
vm.createContext(context);
vm.runInContext(`
const JAPANESE_JLPT_LISTENING_SOURCE_BANK="JAPANESE_LISTENING_QUESTIONS";
const JAPANESE_JLPT_LISTENING_SOURCE_VERSION="18a2-listening-source-v1";
const JAPANESE_JLPT_LISTENING_ADAPTER_VERSION="18a2-listening-adapter-v1";
const JAPANESE_JLPT_LISTENING_SESSION_SIZE=10;
${pipelineFunctions.map((name) => extractFunction(script, name)).join("\n")}
this.bank=${bankSource}; this.create=createJapaneseJlptListeningCandidates;
this.build=buildJapaneseJlptListeningIsolatedSession; this.jlptController=createJapaneseJlptListeningIsolatedController;
this.modeController=createJapaneseListeningModeSpeechController;`, context);

const originalBank = JSON.stringify(context.bank);
const candidates = context.create(context.bank);
const originalCandidates = JSON.stringify(candidates);
const extraPositionPairs = new Set();
for (const seed of [1, 2, 3, 4, 5, 18, 43, 81]) {
  const session = context.build("N5", candidates, deterministic(seed));
  const counts = [0, 1, 2, 3].map((position) => session.questions.filter((q) => q.answerIndex === position).length);
  check(JSON.stringify([...counts].sort()) === "[2,2,3,3]", `seed ${seed} positions not balanced`);
  extraPositionPairs.add(counts.map((count, position) => count === 3 ? position : null).filter((value) => value !== null).join(","));
}
check(extraPositionPairs.size > 1 && !([...extraPositionPairs].every((pair) => pair === "0,1")), "third answers remain permanently assigned to A/B");

for (const level of ["N5", "N4"]) {
  const session = context.build(level, candidates, deterministic(level === "N5" ? 18 : 43));
  check(session.questions.length === 10 && session.snapshot.length === 10, `${level} session and snapshot must contain ten questions`);
  check(session.questions.every((q) => q.level === level) && new Set(session.questions.map((q) => q.sourceId)).size === 10, `${level} selection invalid`);
  check([...session.questions.map((q) => q.sourceId)].sort().join() === [...session.snapshot.map((q) => q.sourceId)].sort().join(), `${level} snapshot source set differs`);
  session.questions.forEach((question) => {
    const snapshot = session.snapshot.find((item) => item.sourceId === question.sourceId);
    check(question.options[question.answerIndex] === question.canonicalCorrectOption, `${question.sourceId} canonical answer mismatch`);
    check([...question.optionPermutation].sort().join() === "0,1,2,3", `${question.sourceId} permutation is not reversible`);
    check(snapshot.options[snapshot.answerIndex] === snapshot.canonicalCorrectOption, `${question.sourceId} snapshot lost pre-randomized answer`);
    check(Object.isFrozen(question) && Object.isFrozen(question.options) && Object.isFrozen(question.optionPermutation), `${question.sourceId} question not deep frozen`);
    check(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.options), `${question.sourceId} snapshot not deep frozen`);
    const candidate = candidates.find((item) => item.sourceId === question.sourceId);
    check(snapshot !== candidate && snapshot.options !== candidate.options && question.options !== snapshot.options, `${question.sourceId} shares mutable references`);
  });
  check(Object.isFrozen(session.snapshot) && Object.isFrozen(session.questions), `${level} collections not frozen`);
}
check(JSON.stringify(context.bank) === originalBank && JSON.stringify(candidates) === originalCandidates, "source bank or adapter candidates mutated");

expectFailBeforeRandom("duplicate sourceId", context.build, candidates, (bank) => { bank[1].sourceId = bank[0].sourceId; });
expectFailBeforeRandom("N3 level", context.build, candidates, (bank) => { bank[0].level = "N3"; });
expectFailBeforeRandom("N5/N4 inventory", context.build, candidates, (bank) => { bank.find((q) => q.level === "N5").level = "N4"; });
expectFailBeforeRandom("insufficient bank", context.build, candidates, (bank) => { bank.pop(); });
expectFailBeforeRandom("canonical answer", context.build, candidates, (bank) => { bank[0].canonicalCorrectOption = "not an option"; });

for (const fixture of [
  { omit: "speechSynthesis" }, { omit: "Utterance" }, { omit: "getVoices" }, { japanese: false },
]) {
  const random = deterministic(10); const controller = context.jlptController(mockProvider(fixture));
  check(!controller.start("N5", candidates, random).ok && random.calls === 0, `capability fixture ${JSON.stringify(fixture)} did not fail before random`);
}
const jlptProvider = mockProvider();
const jlpt = context.jlptController(jlptProvider);
check(jlpt.start("N5", candidates, deterministic(7)).ok && !Object.isFrozen(jlptProvider.voice), "voice host object was frozen");
check(jlptProvider.speechSynthesis.cancels === 0, "JLPT start cancelled speech it does not own");
const publicKeys = Object.keys(jlpt);
check(!publicKeys.some((key) => /internal|session|answer|question/i.test(key)), "controller exposes an internal test/session API");
const preAnswer = jlpt.getViewModel();
for (const secret of ["japanese", "kana", "zh", "answerIndex", "canonicalCorrectOption", "optionPermutation", "canonicalOptionIdentities"])
  check(!Object.prototype.hasOwnProperty.call(preAnswer, secret), `public view leaks ${secret}`);
check(jlpt.requestPlayback() && jlptProvider.utterances[0].voice === jlptProvider.voice, "controller did not use its saved validated voice");
check(!jlpt.requestPlayback() && jlptProvider.speechSynthesis.speaks === 1, "JLPT replay was not rejected");
const oldJlptUtterance = jlptProvider.utterances[0]; jlpt.moveTo(1);
check(jlptProvider.speechSynthesis.cancels === 1, "JLPT did not cancel its owned utterance on move");
jlpt.reset(); jlpt.dispose(); check(jlptProvider.speechSynthesis.cancels === 1, "JLPT reset/dispose cancelled without owning an utterance");
oldJlptUtterance.onstart(); oldJlptUtterance.onend(); oldJlptUtterance.onerror();

for (const fixture of [{ throwSpeak: true }, { throwConstructor: true }]) {
  const provider = mockProvider(fixture); const controller = context.jlptController(provider);
  controller.start("N4", candidates, deterministic(9));
  check(!controller.requestPlayback() && controller.getViewModel().playbackRemaining === 0 && !controller.requestPlayback(), `${JSON.stringify(fixture)} refunded JLPT playback`);
}

// Exercise the independent quiz and practice state helpers through click-shaped fixtures.
const shared = mockProvider();
const quiz = context.modeController(shared, { maxPlaysPerItem: 1 });
const practice = context.modeController(shared);
function buttonFixture(controller, itemId) {
  const button = { disabled: !controller.hasPlayback(itemId) };
  button.click = () => {
    if (!controller.hasPlayback(itemId)) return;
    if (controller === quiz) button.disabled = true;
    controller.requestPlayback(itemId, `audio:${itemId}`, () => {});
  };
  return button;
}
const quizFirst = buttonFixture(quiz, "jl-001"); quizFirst.click();
check(quizFirst.disabled && shared.speechSynthesis.speaks === 1, "quiz first click did not immediately disable and speak once");
quizFirst.click(); check(shared.speechSynthesis.speaks === 1, "quiz second click spoke again");
const rerendered = buttonFixture(quiz, "jl-001"); check(rerendered.disabled, "quiz rerender restored playback");
const nextQuestion = buttonFixture(quiz, "jl-002"); check(!nextQuestion.disabled, "next quiz question lacks its own playback");
nextQuestion.click(); check(shared.speechSynthesis.speaks === 2, "next quiz question did not speak once");
quiz.resetPlayback(); const restarted = buttonFixture(quiz, "jl-001"); check(!restarted.disabled, "new quiz did not restore playback");
const practiceButton = buttonFixture(practice, "jl-001"); practiceButton.click(); practiceButton.click();
check(shared.speechSynthesis.speaks === 4, "practice did not allow two plays");

const isolationProvider = mockProvider();
const isolatedQuiz = context.modeController(isolationProvider, { maxPlaysPerItem: 1 });
const isolatedPractice = context.modeController(isolationProvider);
const quizStates = []; const practiceStates = [];
isolatedPractice.requestPlayback("p", "practice", (state) => practiceStates.push(state));
const stalePractice = isolationProvider.utterances.at(-1); isolatedPractice.cancel();
isolatedQuiz.requestPlayback("q", "quiz", (state) => quizStates.push(state));
stalePractice.onstart(); stalePractice.onend(); stalePractice.onerror();
check(practiceStates.length === 0 && quizStates.length === 0, "late practice callback polluted quiz/practice state");
const staleQuiz = isolationProvider.utterances.at(-1); isolatedQuiz.cancel();
isolatedPractice.requestPlayback("p", "practice", (state) => practiceStates.push(state));
staleQuiz.onstart(); staleQuiz.onend(); staleQuiz.onerror();
check(quizStates.length === 0 && practiceStates.length === 0, "late quiz callback polluted practice/quiz state");
const cancelsBeforeUnowned = isolationProvider.speechSynthesis.cancels;
isolatedQuiz.cancel(); check(isolationProvider.speechSynthesis.cancels === cancelsBeforeUnowned, "unowned mode cancel affected another mode");

for (const fixture of [{ throwSpeak: true }, { throwConstructor: true }]) {
  const provider = mockProvider(fixture); const controller = context.modeController(provider, { maxPlaysPerItem: 1 });
  check(!controller.requestPlayback("q", "audio", () => {}) && !controller.hasPlayback("q") && !controller.requestPlayback("q", "audio", () => {}), `${JSON.stringify(fixture)} refunded quiz playback`);
}
check(jlpt.getViewModel().status === "unavailable" && quiz.hasPlayback("jl-001") && quiz.hasPlayback("jl-003"), "JLPT and independent quiz played sets are not isolated");

const profile = balanced(script, "const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}");
check(profile.includes("N5: { total: 20") && profile.includes("N4: { total: 34") && (profile.match(/listening: \{ included: false, status: "future"/g) || []).length >= 4, "production totals/listening status changed");
check(extractFunction(script, "buildJapaneseJlptSession") === extractFunction(baseScript, "buildJapaneseJlptSession"), "production JLPT builder changed");
check(script.includes('listening.textContent = "聽力：後續批次開放"'), "future UI notice removed");
const pipelineText = pipelineFunctions.slice(3).map((name) => extractFunction(script, name)).join("\n");
for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", "caches.", "fetch(", "import(", "document."])
  check(!pipelineText.includes(forbidden), `pipeline uses forbidden dependency ${forbidden}`);

if (process.env.JLPT_BATCH18A3_HISTORICAL_SCOPE === "1") {
  const allowed = new Set(["script.js", "japanese/index.html", "docs/japanese-jlpt-batch18a3-listening-isolated-pipeline.md", "scripts/check-japanese-jlpt-batch18a3-listening-isolated-pipeline.js", "scripts/check-japanese-jlpt-batch18a2-listening-adapter.js"]);
  git("diff", "--name-only", BASE).split("\n").filter(Boolean).forEach((file) => check(allowed.has(file), `historical scope file not allowed: ${file}`));
  const htmlDiff = git("diff", BASE, "--", "japanese/index.html");
  check(htmlDiff.includes("v=4.4") && htmlDiff.includes("v=4.5") && htmlDiff.split("\n").filter((line) => /^[+-](?![+-])/.test(line)).length === 2, "historical cache token change invalid");
}

console.log("Batch 18A-3 JLPT listening isolated pipeline audit passed.");
console.log(`N5/N4 snapshots=10; balanced positions=2/2/3/3; observed third-position pairs=${[...extraPositionPairs].join(" | ")}.`);
console.log("Capability/voice ownership, cancel ownership, one-play clicks, rerender/restart, and constructor/speak failures passed.");
console.log("Practice/quiz/JLPT playback sets and stale callbacks are isolated; production JLPT listening remains dormant at N5=20/N4=34.");
