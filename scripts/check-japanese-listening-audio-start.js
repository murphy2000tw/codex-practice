#!/usr/bin/env node
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const source = fs.readFileSync(path.resolve(__dirname, "..", "script.js"), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(`Listening audio start check: ${message}`); };

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  check(start >= 0, `missing ${name}`);
  const brace = source.indexOf("{", source.indexOf(") {", start));
  let depth = 0;
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`unterminated ${name}`);
}

function sharedFixture({ throwSpeak = false } = {}) {
  const frames = [];
  const state = { speaks: 0, cancels: 0, resumes: 0, pausedOtherSpeech: true, utterances: [] };
  const japaneseVoice = { lang: "ja-JP", name: "Japanese" };
  function Utterance(text) { this.text = text; state.utterances.push(this); }
  const speechSynthesis = {
    getVoices: () => [{ lang: "en-US" }, japaneseVoice],
    resume: () => { state.resumes += 1; state.pausedOtherSpeech = false; },
    speak: (utterance) => { state.speaks += 1; state.last = utterance; if (throwSpeak) throw new Error("speak failed"); },
    cancel: () => { state.cancels += 1; },
  };
  return { frames, state, japaneseVoice, speechSynthesis, Utterance };
}

// General practice/quiz controller: it shares the global synthesis object with an
// unrelated paused utterance and must not resume or cancel it while only preparing.
{
  const fixture = sharedFixture(); const events = [];
  const provider = { speechSynthesis: fixture.speechSynthesis, SpeechSynthesisUtterance: fixture.Utterance,
    requestAnimationFrame: (callback) => fixture.frames.push(callback) };
  const context = { provider, events, Promise }; vm.createContext(context);
  vm.runInContext(`${extractFunction("createJapaneseListeningModeSpeechController")}
this.controller=createJapaneseListeningModeSpeechController(provider,{maxPlaysPerItem:1});`, context);
  const controller = context.controller;
  check(controller.requestPlayback("one", "今日は雨です。", (event) => events.push(event)), "general first click was rejected");
  check(!controller.requestPlayback("one", "今日は雨です。", () => {}), "general duplicate click scheduled playback");
  check(fixture.state.speaks === 0 && fixture.state.cancels === 0 && fixture.state.resumes === 0,
    "general preparation interfered with shared synthesis");
  check(fixture.state.pausedOtherSpeech && events.join() === "preparing", "general preparation resumed other paused speech or omitted status");
  controller.cancel(); fixture.frames.shift()();
  check(fixture.state.speaks === 0 && fixture.state.cancels === 0 && fixture.state.pausedOtherSpeech,
    "cancelling general pending playback interfered with shared synthesis");

  controller.resetPlayback();
  check(controller.requestPlayback("two", "次の問題です。", (event) => events.push(event)), "general new item did not schedule");
  fixture.frames.shift()();
  check(fixture.state.speaks === 1 && fixture.state.last.voice === fixture.japaneseVoice && fixture.state.last.lang === "ja-JP",
    "general prepared utterance did not use the Japanese voice");
  controller.cancel();
  check(fixture.state.cancels === 1, "general submitted utterance was not cancelled by its owner");
}

function createFormalHarness(fixture) {
  const questionA = { section: "listening", sourceId: "jl-001", japanese: "今日は雨です。" };
  const questionB = { section: "listening", sourceId: "jl-002", japanese: "次の問題です。" };
  const context = { Promise, Set, questionA, questionB, window: {
    speechSynthesis: fixture.speechSynthesis, SpeechSynthesisUtterance: fixture.Utterance,
    requestAnimationFrame: (callback) => fixture.frames.push(callback),
  } };
  vm.createContext(context);
  vm.runInContext(`
let japaneseJlptListeningGeneration=0,japaneseJlptListeningUtterance=null,japaneseJlptListeningSubmitted=false;
let japaneseJlptListeningVoice={lang:"ja-JP"},japaneseJlptListeningPlayedSourceIds=new Set();
let japaneseJlptSession={questionSnapshots:[questionA,questionB],currentIndex:0};
${extractFunction("cancelJapaneseJlptListeningUtterance")}
${extractFunction("resetJapaneseJlptListeningPlayback")}
${extractFunction("requestJapaneseJlptListeningPlayback")}
this.api={request:requestJapaneseJlptListeningPlayback,cancel:cancelJapaneseJlptListeningUtterance,
 reset:resetJapaneseJlptListeningPlayback,move(index){japaneseJlptSession.currentIndex=index;cancelJapaneseJlptListeningUtterance();},
 leave(){resetJapaneseJlptListeningPlayback();japaneseJlptSession=null;},restore(){japaneseJlptSession={questionSnapshots:[questionA,questionB],currentIndex:0};},
 state(){return {played:[...japaneseJlptListeningPlayedSourceIds],utterance:japaneseJlptListeningUtterance,submitted:japaneseJlptListeningSubmitted};}};`, context);
  return { api: context.api, questionA, questionB };
}

// Formal JLPT uses a manually advanced frame so preparation and stale callbacks
// cannot be hidden by an immediately executing rAF mock.
{
  const fixture = sharedFixture(); const events = []; const { api, questionA, questionB } = createFormalHarness(fixture);
  check(api.request(questionA, (event) => events.push(event)), "formal first click was rejected");
  check(!api.request(questionA, () => {}), "formal double click scheduled playback");
  check(events.join() === "preparing" && fixture.state.speaks === 0 && fixture.state.cancels === 0 && fixture.state.resumes === 0,
    "formal preparation was not pending or interfered with shared synthesis");
  api.move(1); fixture.frames.shift()();
  check(fixture.state.speaks === 0 && fixture.state.cancels === 0 && fixture.state.pausedOtherSpeech,
    "formal question change did not invalidate pending playback locally");

  check(api.request(questionB, (event) => events.push(event)), "formal next question did not schedule");
  fixture.frames.shift()();
  check(fixture.state.speaks === 1 && api.state().submitted, "formal frame did not submit playback");
  const stale = fixture.state.last; api.leave();
  check(fixture.state.cancels === 1 && api.state().played.length === 0, "formal return did not cancel submitted speech and reset budget");
  stale.onend(); check(api.state().utterance === null, "formal delayed callback changed state after return");

  api.restore();
  check(api.request(questionA, () => {}), "formal fresh session did not restore playback budget");
  api.reset(); fixture.frames.shift()();
  check(fixture.state.speaks === 1 && fixture.state.cancels === 1 && api.state().played.length === 0,
    "formal reset allowed pending playback or used global cancel");
}

// A speak failure consumes the formal one-play budget and reports error without
// leaving an owned/submitted utterance behind.
{
  const fixture = sharedFixture({ throwSpeak: true }); const events = []; const { api, questionA } = createFormalHarness(fixture);
  check(api.request(questionA, (event) => events.push(event)), "formal error fixture did not schedule");
  fixture.frames.shift()();
  check(events.join() === "preparing,error" && api.state().played.includes(questionA.sourceId) && !api.state().utterance && !api.state().submitted,
    "formal playback error refunded budget or retained ownership");
  check(!api.request(questionA, () => {}), "formal playback error allowed a refund replay");
}

check(source.includes("function clearJapaneseJlptSession() {\n  resetJapaneseJlptListeningPlayback();") &&
  source.includes("function resetJapaneseJlptState() {\n  clearJapaneseJlptSession();") &&
  source.includes("function returnToJapaneseJlptSetup() {\n  clearJapaneseJlptSession();"),
"formal return/reset no longer invalidate listening playback");
console.log("Japanese listening audio start regression passed.");
