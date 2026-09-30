#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const BASE = "cf56785";
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(`Batch 18A-4 check: ${message}`); };
const script = read("script.js");
const html = read("japanese/index.html");

function extractFunction(name) {
  const start = script.indexOf(`function ${name}(`);
  check(start >= 0, `missing function ${name}`);
  const brace = script.indexOf("{", start);
  let depth = 0; let quote = null; let escaped = false; let templateDepth = 0;
  for (let index = brace; index < script.length; index += 1) {
    const char = script[index]; const next = script[index + 1];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (quote === "`" && char === "$" && next === "{") { templateDepth += 1; index += 1; }
      else if (quote === "`" && char === "}" && templateDepth) templateDepth -= 1;
      else if (char === quote && !templateDepth) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth += 1;
    if (char === "}" && --depth === 0) return script.slice(start, index + 1);
  }
  throw new Error(`unterminated function ${name}`);
}
function extractBalanced(marker, open, close) {
  const markerIndex = script.indexOf(marker); check(markerIndex >= 0, `missing ${marker}`);
  const start = script.indexOf(open, markerIndex); let depth = 0; let quote = null; let escaped = false;
  for (let index = start; index < script.length; index += 1) {
    const char = script[index];
    if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === open) depth += 1;
    if (char === close && --depth === 0) return script.slice(start, index + 1);
  }
  throw new Error(`unterminated ${marker}`);
}

// Static configuration/scope checks complement (but do not replace) runtime fixtures below.
const profile = script.slice(script.indexOf('"17c10-product-v1": {'), script.indexOf('"17c6-compat-v1": {'));
check(/N5:\s*\{ total: 30/.test(profile) && /N4:\s*\{ total: 44/.test(profile), "formal totals must be N5=30 and N4=44");
check((profile.match(/listening: \{ included: true, status: "available", total: 10, questionTypes: \{ listeningMeaning: 10 \} \}/g) || []).length === 2, "both listening quotas must be 10");
const compat = script.slice(script.indexOf('"17c6-compat-v1": {'), script.indexOf("const JAPANESE_JLPT_COMPAT_PROFILE_VERSION"));
check(/N5:\s*\{ total: 20/.test(compat) && /N4:\s*\{ total: 34/.test(compat), "17c6 compatibility profile changed");
check(!script.includes("已使用相容模式"), "production failure must not silently fall back");
check(html.includes("N5 共 30 題、N4 共 44 題") && html.includes("聽力各 10 題") && html.includes("script.js?v=4.6"), "setup copy or cache token missing");
const base = cp.execFileSync("git", ["show", `${BASE}:script.js`], { cwd: ROOT, encoding: "utf8" });
for (const [label, re] of [["localStorage", /\blocalStorage\b/g], ["sessionStorage", /\bsessionStorage\b/g], ["IndexedDB", /\bindexedDB\b/g], ["Cache API", /\bcaches\b/g]])
  check((script.match(re) || []).length === (base.match(re) || []).length, `${label} inventory changed`);

class NodeFixture {
  constructor(tag = "div") { this.tagName = tag; this.children = []; this.hidden = false; this.disabled = false; this.className = ""; this.attributes = {}; this.listeners = {}; this._text = ""; this.classList = { add() {}, remove() {}, toggle() {} }; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map((child) => child.textContent || "").join(""); }
  append(...children) { children.flat().forEach((child) => this.children.push(typeof child === "string" ? { textContent: child } : child)); }
  appendChild(child) { this.append(child); return child; }
  replaceChildren(...children) { this.children = []; this._text = ""; this.append(...children); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { if (!this.disabled && this.listeners.click) this.listeners.click({ preventDefault() {} }); }
  focus() {}
  find(predicate, found = []) { if (predicate(this)) found.push(this); this.children.forEach((child) => child.find && child.find(predicate, found)); return found; }
}
const documentFixture = { createElement: (tag) => new NodeFixture(tag), createTextNode: (value) => ({ textContent: String(value) }) };
const runtime = { console, document: documentFixture, window: {}, Set, Object, Array, Math, NodeFixture };
vm.createContext(runtime);
const functions = [
  "deepFreezeJapaneseJlptValue", "deepCloneJapaneseJlptValue", "isNonEmptyString",
  "validateJapaneseJlptProfile",
  "adaptJapaneseJlptListeningQuestion", "createJapaneseJlptListeningCandidates",
  "validateJapaneseJlptListeningCapability", "randomIndexJapaneseJlptListening", "shuffleJapaneseJlptListening",
  "validateJapaneseJlptListeningCandidatePool", "buildJapaneseJlptListeningIsolatedSession",
  "createJapaneseJlptListeningPreAnswerViewModel", "createJapaneseJlptListeningIsolatedController",
  "cancelJapaneseJlptListeningUtterance", "resetJapaneseJlptListeningPlayback", "requestJapaneseJlptListeningPlayback",
  "appendJapaneseJlptDetail", "appendJapaneseJlptQuestionFeedback", "answerJapaneseJlptQuestion",
  "renderJapaneseJlptQuestion", "renderJapaneseJlptCompletion", "advanceJapaneseJlptQuestion",
  "clearJapaneseJlptSession", "resetJapaneseJlptState", "selectJapaneseJlptLevel", "returnToJapaneseJlptSetup",
  "startJapaneseJlptMock",
];
const sourceArray = extractBalanced("const JAPANESE_LISTENING_QUESTIONS =", "[", "]");
vm.runInContext(`
const JAPANESE_JLPT_LISTENING_SOURCE_BANK="JAPANESE_LISTENING_QUESTIONS";
const JAPANESE_JLPT_LISTENING_SOURCE_VERSION="18a2-listening-source-v1";
const JAPANESE_JLPT_LISTENING_ADAPTER_VERSION="18a2-listening-adapter-v1";
const JAPANESE_JLPT_LISTENING_SESSION_SIZE=10;
const JAPANESE_JLPT_LEVELS=Object.freeze(["N5","N4"]);
const JAPANESE_LISTENING_QUESTIONS=${sourceArray};
let japaneseJlptSession=null,japaneseJlptSessionBuildError=null,japaneseJlptProductCandidates=[{}],japaneseJlptQuestionBank=null,japaneseJlptReadingBank=null;
let japaneseJlptActiveProfileVersion="17c10-product-v1",japaneseJlptActiveProfileId="site-jlpt-style-product";
const JAPANESE_JLPT_PRODUCT_PROFILE_VERSION="17c10-product-v1",JAPANESE_JLPT_PRODUCT_PROFILE_ID="site-jlpt-style-product";
let japaneseJlptListeningCandidates=null,japaneseJlptListeningVoice=null,japaneseJlptListeningGeneration=0,japaneseJlptListeningUtterance=null,japaneseJlptListeningPlayedSourceIds=new Set();
let selectedJapaneseJlptLevel=null;
const japaneseJlptQuestionContent=new NodeFixture("section"),japaneseJlptStatus=new NodeFixture("div"),japaneseJlptLevelSetup=new NodeFixture("section"),japaneseJlptStartActions=new NodeFixture("div"),japaneseJlptUnavailableNote=new NodeFixture("p"),startJapaneseJlptMockButton=new NodeFixture("button");
const japaneseJlptLevelButtons=["N5","N4"].map(level=>{const node=new NodeFixture("button");node.dataset={japaneseJlptLevel:level};return node;});
function appendJapaneseJlptRubyText(parent,value){parent.textContent=value;}
function appendJapaneseJlptLabeledTable(){return false;}
function validateJapaneseJlptProfile(_registry,_version,_id,level){return {levelProfile:{sections:{reading:{included:true}}}};}
const JAPANESE_JLPT_PROFILE_REGISTRY=${extractBalanced("const JAPANESE_JLPT_PROFILE_REGISTRY =", "{", "}")};
let buildCalls=0;
function buildJapaneseJlptSession(level){buildCalls+=1;const question={id:"formal-start",sourceId:"formal-start",level,section:"listening",questionType:"listeningMeaning",question:"請聽語音並選擇正確意思。",japanese:"テスト",options:["甲","乙","丙","丁"],answerIndex:0,canonicalCorrectOption:"甲"};return {selectedLevel:level,profileVersion:"17c10-product-v1",profileId:"site-jlpt-style-product",questionSnapshots:[question],preRandomizationSnapshot:[question],currentIndex:0,answers:[]};}
function renderJapaneseJlptPanel(){}
${functions.map(extractFunction).join("\n")}
this.api={
  source:JAPANESE_LISTENING_QUESTIONS,createJapaneseJlptListeningCandidates,buildJapaneseJlptListeningIsolatedSession,
  registry:JAPANESE_JLPT_PROFILE_REGISTRY,validateJapaneseJlptProfile,
  createJapaneseJlptListeningIsolatedController,validateJapaneseJlptListeningCapability,startJapaneseJlptMock,
  renderJapaneseJlptQuestion,answerJapaneseJlptQuestion,renderJapaneseJlptCompletion,advanceJapaneseJlptQuestion,
  clearJapaneseJlptSession,resetJapaneseJlptState,selectJapaneseJlptLevel,returnToJapaneseJlptSetup,
  setProvider(provider){window.speechSynthesis=provider&&provider.speechSynthesis;window.SpeechSynthesisUtterance=provider&&provider.SpeechSynthesisUtterance;},
  setLevel(level){selectedJapaneseJlptLevel=level;},setSession(value){japaneseJlptSession=value;},
  setVoice(value){japaneseJlptListeningVoice=value;},setCandidates(value){japaneseJlptListeningCandidates=value;},
  get(){return {session:japaneseJlptSession,buildCalls,played:[...japaneseJlptListeningPlayedSourceIds],utterance:japaneseJlptListeningUtterance,generation:japaneseJlptListeningGeneration,content:japaneseJlptQuestionContent,status:japaneseJlptStatus,selectedLevel:selectedJapaneseJlptLevel,voice:japaneseJlptListeningVoice};}
};`, runtime);
const api = runtime.api;
const candidates = api.createJapaneseJlptListeningCandidates(api.source);
for (const [level, total] of [["N5", 30], ["N4", 44]]) {
  const runtimeProfile = api.validateJapaneseJlptProfile(api.registry, "17c10-product-v1", "site-jlpt-style-product", level).levelProfile;
  check(runtimeProfile.total === total && runtimeProfile.sections.listening.total === 10,
    `${level} runtime profile must contain ${total} total and 10 listening questions`);
  const session = api.buildJapaneseJlptListeningIsolatedSession(level, candidates, () => 0.314159);
  check(session.size === 10 && session.questions.length === 10, `${level} listening session must contain 10 questions within formal total ${total}`);
  check(session.questions.every((question) => question.level === level), `${level} listening session crossed levels`);
  check(new Set(session.questions.map((question) => question.sourceId)).size === 10, `${level} listening session repeated a sourceId`);
  check(session.questions.every((question) => Object.isFrozen(question) && Object.isFrozen(question.options)), `${level} listening questions must remain immutable`);
}

function speechProvider({ voice = true, throwConstructor = false, throwSpeak = false } = {}) {
  const state = { speaks: 0, cancels: 0, utterances: [] };
  function Utterance(text) { if (throwConstructor) throw new Error("constructor failed"); this.text = text; state.utterances.push(this); }
  return { state, speechSynthesis: { getVoices: () => voice ? [{ lang: "ja-JP", name: "mock" }] : [], speak: () => { state.speaks += 1; if (throwSpeak) throw new Error("speak failed"); }, cancel: () => { state.cancels += 1; } }, SpeechSynthesisUtterance: Utterance };
}
// Formal start capability gate must reject atomically before build/session publication.
for (const fixture of [null, { speechSynthesis: speechProvider().speechSynthesis }, speechProvider({ voice: false })]) {
  api.clearJapaneseJlptSession(); api.setLevel("N5"); api.setProvider(fixture);
  const before = api.get().buildCalls; api.startJapaneseJlptMock(); const state = api.get();
  check(state.session === null && state.buildCalls === before, "speech capability failure built or published a partial formal session");
  check(state.status.textContent.includes("無法開始聽力測驗"), "speech capability failure omitted generic error");
  check(!/今日は雨|きょうは|今天下雨/.test(state.status.textContent), "speech capability error leaked question content");
}
const validStart = speechProvider(); api.clearJapaneseJlptSession(); api.setLevel("N4"); api.setProvider(validStart);
const buildsBeforeSuccess = api.get().buildCalls; api.startJapaneseJlptMock();
check(api.get().session && api.get().buildCalls === buildsBeforeSuccess + 1,
  `valid speech capability did not build exactly one complete formal session (${api.get().status.textContent})`);
api.returnToJapaneseJlptSetup(); api.setLevel("N4"); api.startJapaneseJlptMock();
check(api.get().session && api.get().played.length === 0 && api.get().buildCalls === buildsBeforeSuccess + 2,
  "restarting did not create a fresh formal session/playback budget");

// Actual formal renderer: no source text/answer before answer, feedback and score after answer.
const selected = api.buildJapaneseJlptListeningIsolatedSession("N5", candidates, () => 0.271828).questions[0];
const formalSession = { selectedLevel: "N5", questionSnapshots: [selected], currentIndex: 0, answers: [] };
const provider = speechProvider(); api.setProvider(provider); api.setVoice(provider.speechSynthesis.getVoices()[0]); api.setSession(formalSession);
api.renderJapaneseJlptQuestion();
let state = api.get();
check(!state.content.textContent.includes(selected.japanese) &&
  !state.content.textContent.includes(api.source.find((q) => q.id === selected.sourceId).kana) &&
  !state.content.textContent.includes("中文意思：") && !state.content.textContent.includes("正確答案：") &&
  !state.content.textContent.includes("答對") && !state.content.textContent.includes("答錯"),
"pre-answer DOM disclosed source text, translation metadata, or answer feedback");
const buttons = state.content.find((node) => node.tagName === "button");
const play = buttons.find((button) => button.textContent.includes("播放日文語音"));
check(play && !play.disabled, "formal listening play button missing");
play.click();
check(play.disabled && api.get().played.includes(selected.sourceId) && provider.state.speaks === 1, "first click did not immediately consume formal playback");
play.click(); check(provider.state.speaks === 1, "disabled formal playback button replayed");
api.answerJapaneseJlptQuestion(selected.answerIndex);
state = api.get();
check(state.content.textContent.includes(selected.japanese) && state.content.textContent.includes(selected.canonicalCorrectOption) && state.content.textContent.includes("答對"), "post-answer feedback omitted Japanese, translation, or correctness");
api.renderJapaneseJlptCompletion();
check(api.get().content.textContent.includes("成績：1／1"), "completion score/total incorrect");

// Constructor/speak errors consume the only attempt. Test production helper and isolated controller contract.
for (const options of [{ throwConstructor: true }, { throwSpeak: true }]) {
  const failing = speechProvider(options); api.setProvider(failing); api.setVoice({ lang: "ja-JP" }); api.setSession({ selectedLevel: "N5", questionSnapshots: [selected], currentIndex: 0, answers: [] });
  api.resetJapaneseJlptState(); // clears previous played set, then restore active fixture
  api.setLevel("N5"); api.setSession({ selectedLevel: "N5", questionSnapshots: [selected], currentIndex: 0, answers: [] }); api.setVoice({ lang: "ja-JP" });
  api.renderJapaneseJlptQuestion(); const failingPlay = api.get().content.find((node) => node.tagName === "button").find((button) => button.textContent.includes("播放"));
  failingPlay.click();
  check(api.get().played.includes(selected.sourceId), `${JSON.stringify(options)} refunded formal playback`);
  const speaks = failing.state.speaks; failingPlay.click(); check(failing.state.speaks === speaks, `${JSON.stringify(options)} permitted replay`);
}

// Owned cancellation, stale callbacks, reset/level return and fresh-session behavior.
const lifecycle = speechProvider(); api.setProvider(lifecycle); api.setVoice({ lang: "ja-JP" }); api.setLevel("N5");
api.clearJapaneseJlptSession(); api.setVoice({ lang: "ja-JP" }); api.setLevel("N5");
api.setSession({ selectedLevel: "N5", questionSnapshots: [selected, { ...selected, sourceId: "jl-next" }], currentIndex: 0, answers: [{ selectedIndex: selected.answerIndex, isCorrect: true }] });
api.renderJapaneseJlptQuestion(); api.get().content.find((node) => node.tagName === "button").find((button) => button.textContent.includes("播放")).click();
const stale = lifecycle.state.utterances.at(-1); api.advanceJapaneseJlptQuestion();
check(lifecycle.state.cancels === 1, "changing question did not cancel owned utterance");
stale.onend(); check(api.get().utterance === null, "stale callback changed the new question lifecycle");
api.returnToJapaneseJlptSetup(); check(api.get().session === null && api.get().played.length === 0, "return did not clear session and played set");
api.setLevel("N4"); api.resetJapaneseJlptState(); check(api.get().selectedLevel === null && api.get().session === null, "reset/level change retained formal state");
const independent = speechProvider(); const independentController = api.createJapaneseJlptListeningIsolatedController(independent);
check(independentController.start("N5", candidates, () => 0.42).ok && independentController.requestPlayback(), "independent controller fixture failed");
api.setProvider(lifecycle); api.clearJapaneseJlptSession();
check(independent.state.cancels === 0 && independentController.getViewModel().playbackRemaining === 0, "formal reset polluted independent listening state");
independentController.reset(); check(independent.state.cancels === 1, "independent controller lost ownership of its utterance");

console.log("Batch 18A-4 production runtime integration audit passed.");
console.log("Runtime sessions: N5=30/N4=44 profiles with 10 unique, level-isolated listening questions each.");
console.log("Runtime capability gates, disclosure timing, one-play failures, score, cancellation, stale callbacks, restart and mode isolation passed.");
