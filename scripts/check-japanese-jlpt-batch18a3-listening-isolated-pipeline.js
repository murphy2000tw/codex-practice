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
const check = (value, message) => { if (!value) throw new Error(`Batch 18A-3 check: ${message}`); };
function balanced(source, marker, open, close) {
  const markerIndex = source.indexOf(marker); check(markerIndex >= 0, `${marker} missing`);
  const start = source.indexOf(open, markerIndex); let depth = 0; let quote = null; let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const c = source[i];
    if (quote) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === quote) quote = null; continue; }
    if ('"\'`'.includes(c)) { quote = c; continue; }
    if (c === open) depth += 1; else if (c === close && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Batch 18A-3 check: ${marker} incomplete`);
}
function fn(source, name) { const start = source.indexOf(`function ${name}`); check(start >= 0, `${name} missing`); return source.slice(start, source.indexOf("{", start)) + balanced(source, `function ${name}`, "{", "}"); }
function deterministic(seed) { let state = seed >>> 0; const random = () => { random.calls += 1; state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; }; random.calls = 0; return random; }
function mockProvider({ japanese = true, throwSpeak = false } = {}) {
  const utterances = []; const statuses = [];
  class Utterance { constructor(text) { this.text = text; utterances.push(this); } }
  const speechSynthesis = { speaks: 0, cancels: 0, getVoices: () => japanese ? [{ lang: "ja-JP", name: "mock-ja" }] : [{ lang: "en-US" }], speak() { this.speaks += 1; if (throwSpeak) throw new Error("speak fixture"); }, cancel() { this.cancels += 1; } };
  return { speechSynthesis, SpeechSynthesisUtterance: Utterance, utterances, statuses, onStatus: (status) => statuses.push(status) };
}
const script = read("script.js"); const baseScript = git("show", `${BASE}:script.js`);
const array = balanced(script, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]");
check(array === balanced(baseScript, "const JAPANESE_LISTENING_QUESTIONS =", "[", "]"), "source question bank changed");
const names = ["deepFreezeJapaneseJlptValue", "adaptJapaneseJlptListeningQuestion", "createJapaneseJlptListeningCandidates", "validateJapaneseJlptListeningCapability", "randomIndexJapaneseJlptListening", "shuffleJapaneseJlptListening", "validateJapaneseJlptListeningCandidatePool", "buildJapaneseJlptListeningIsolatedSession", "createJapaneseJlptListeningPreAnswerViewModel", "createJapaneseJlptListeningIsolatedController"];
const context = {}; vm.createContext(context);
vm.runInContext(`const JAPANESE_JLPT_LISTENING_SOURCE_BANK="JAPANESE_LISTENING_QUESTIONS"; const JAPANESE_JLPT_LISTENING_SOURCE_VERSION="18a2-listening-source-v1"; const JAPANESE_JLPT_LISTENING_ADAPTER_VERSION="18a2-listening-adapter-v1"; const JAPANESE_JLPT_LISTENING_SESSION_SIZE=10; ${names.map((name) => fn(script, name)).join("\n")} this.bank=${array}; this.create=createJapaneseJlptListeningCandidates; this.build=buildJapaneseJlptListeningIsolatedSession; this.controller=createJapaneseJlptListeningIsolatedController;`, context);
const before = JSON.stringify(context.bank); const candidates = context.create(context.bank); const candidateBefore = JSON.stringify(candidates);
const n5Random = deterministic(18); const n4Random = deterministic(43);
const n5 = context.build("N5", candidates, n5Random); const n4 = context.build("N4", candidates, n4Random);
for (const [level, session] of [["N5", n5], ["N4", n4]]) {
  check(session.questions.length === 10 && session.questions.every((q) => q.level === level), `${level} must select exactly ten same-level questions`);
  check(new Set(session.questions.map((q) => q.sourceId)).size === 10, `${level} source IDs duplicated`);
  const distribution = [0, 1, 2, 3].map((index) => session.questions.filter((q) => q.answerIndex === index).length).sort();
  check(JSON.stringify(distribution) === "[2,2,3,3]", `${level} answer positions not balanced`);
  session.questions.forEach((q) => {
    check(q.options[q.answerIndex] === q.canonicalCorrectOption, `${q.sourceId} canonical answer mismatch`);
    check([...q.optionPermutation].sort().join() === "0,1,2,3", `${q.sourceId} permutation not reversible`);
    check(q.optionPermutation.map((i) => q.canonicalOptionIdentities[i]).length === 4 && q.sourceBank && q.sourceVersion && q.adapterVersion, `${q.sourceId} provenance incomplete`);
  });
  check(Object.isFrozen(session.snapshot) && session.snapshot.every((q) => Object.isFrozen(q) && Object.isFrozen(q.options)), `${level} snapshot not immutable`);
}
const n5Again = context.build("N5", candidates, deterministic(81));
check(JSON.stringify(n5.questions.map((q) => [q.sourceId, q.optionPermutation])) !== JSON.stringify(n5Again.questions.map((q) => [q.sourceId, q.optionPermutation])), "new session did not redraw and rerandomize");
check(JSON.stringify(context.bank) === before && JSON.stringify(candidates) === candidateBefore, "source, candidates, or snapshot mutated");
const noJaRandom = deterministic(1); const unavailable = context.controller(mockProvider({ japanese: false }));
const unavailableResult = unavailable.start("N5", candidates, noJaRandom);
check(!unavailableResult.ok && noJaRandom.calls === 0 && !/jl-|假名|中文|正確/.test(unavailableResult.message), "capability gate did not fail closed before randomization");
const provider = mockProvider(); const controller = context.controller(provider); check(controller.start("N5", candidates, deterministic(7)).ok, "controller start failed");
const pre = controller.getViewModel();
for (const secret of ["japanese", "kana", "zh", "canonicalCorrectOption", "answerIndex", "optionPermutation", "canonicalOptionIdentities"]) check(!Object.prototype.hasOwnProperty.call(pre, secret), `pre-answer view leaks ${secret}`);
check(pre.playbackRemaining === 1 && controller.requestPlayback() && controller.getViewModel().playbackRemaining === 0, "first request did not consume playback immediately");
check(provider.speechSynthesis.speaks === 1 && !controller.requestPlayback() && provider.speechSynthesis.speaks === 1, "second request called speak");
const stale = provider.utterances[0]; controller.moveTo(1); const statusCount = provider.statuses.length; stale.onstart(); stale.onend(); stale.onerror(); check(provider.statuses.length === statusCount, "stale callback changed current session");
check(provider.speechSynthesis.cancels >= 2, "move/reset lifecycle did not cancel"); controller.reset(); controller.dispose(); check(provider.speechSynthesis.cancels >= 4, "reset/dispose did not cancel");
const throwingProvider = mockProvider({ throwSpeak: true }); const throwing = context.controller(throwingProvider); throwing.start("N4", candidates, deterministic(5)); check(!throwing.requestPlayback() && throwing.getViewModel().playbackRemaining === 0 && !throwing.requestPlayback() && throwingProvider.speechSynthesis.speaks === 1, "speak failure refunded playback");
check(script.includes("listeningQuizPlayedItemIds = new Set()") && script.includes("button.disabled = onePlay && listeningQuizPlayedItemIds.has(item.id)") && script.includes("listeningQuizPlayedItemIds.add(item.id)") && script.includes("createListeningPlayButton(item, status, { onePlay: true })"), "independent quiz one-play state missing");
check(script.includes("createListeningPlayButton(item, status), card.children[1]") && script.includes("可重複播放"), "practice unlimited playback changed");
check(!fn(script, "createJapaneseJlptListeningIsolatedController").includes("listeningQuizPlayedItemIds"), "JLPT controller shares independent quiz count");
check(!fn(script, "speakJapaneseListening").includes("createJapaneseJlptListeningIsolatedController"), "independent callback reaches JLPT state");
const profile = balanced(script, "const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}");
check(profile.includes("N5: { total: 20") && profile.includes("N4: { total: 34") && (profile.match(/listening: \{ included: false, status: "future"/g) || []).length >= 4, "production totals or future listening changed");
check(fn(script, "buildJapaneseJlptSession") === fn(baseScript, "buildJapaneseJlptSession") && !fn(script, "buildJapaneseJlptSession").includes("ListeningIsolated"), "production JLPT builder connected listening");
check(script.includes('listening.textContent = "聽力：後續批次開放"'), "future UI notice removed");
const pipelineText = names.slice(3).map((name) => fn(script, name)).join("\n");
for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", "caches.", "fetch(", "import(", "document."]) check(!pipelineText.includes(forbidden), `pipeline uses forbidden dependency ${forbidden}`);
if (process.env.JLPT_BATCH18A3_HISTORICAL_SCOPE === "1") {
  const allowed = new Set(["script.js", "japanese/index.html", "docs/japanese-jlpt-batch18a3-listening-isolated-pipeline.md", "scripts/check-japanese-jlpt-batch18a3-listening-isolated-pipeline.js", "scripts/check-japanese-jlpt-batch18a2-listening-adapter.js"]);
  const changed = git("diff", "--name-only", BASE).split("\n").filter(Boolean); changed.forEach((file) => check(allowed.has(file), `historical scope file not allowed: ${file}`));
  const htmlDiff = git("diff", BASE, "--", "japanese/index.html"); check(htmlDiff.includes("v=4.4") && htmlDiff.includes("v=4.5") && htmlDiff.split("\n").filter((line) => /^[+-](?![+-])/.test(line)).length === 2, "historical cache token change invalid");
}
console.log("Batch 18A-3 JLPT listening isolated pipeline audit passed.");
console.log("N5=10 and N4=10; balanced answer positions=2/2/3/3; immutable provenance and pre-answer redaction passed.");
console.log("Capability fail-closed, one-play consumption, stale callbacks, cancellation, and three-mode isolation passed.");
console.log("Production JLPT listening remains future/dormant; totals remain N5=20 and N4=34.");
