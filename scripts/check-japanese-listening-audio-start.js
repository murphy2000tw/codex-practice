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

const frames = [];
const events = [];
const state = { speaks: 0, cancels: 0, resumes: 0 };
const japaneseVoice = { lang: "ja-JP", name: "Japanese" };
function Utterance(text) { this.text = text; }
const provider = {
  SpeechSynthesisUtterance: Utterance,
  requestAnimationFrame: (callback) => frames.push(callback),
  speechSynthesis: {
    getVoices: () => [{ lang: "en-US" }, japaneseVoice],
    resume: () => { state.resumes += 1; },
    speak: (utterance) => { state.speaks += 1; state.last = utterance; },
    cancel: () => { state.cancels += 1; },
  },
};
const context = { provider, events, Promise };
vm.createContext(context);
vm.runInContext(`${extractFunction("createJapaneseListeningModeSpeechController")}
this.controller=createJapaneseListeningModeSpeechController(provider,{maxPlaysPerItem:1});`, context);
const controller = context.controller;

check(controller.requestPlayback("one", "今日は雨です。", (event) => events.push(event)), "first click was rejected");
check(!controller.requestPlayback("one", "今日は雨です。", (event) => events.push(event)), "duplicate click scheduled playback");
check(state.speaks === 0 && state.resumes === 1 && frames.length === 1, "playback was not held in an event-driven preparation frame");
check(events.join() === "preparing", "preparation status was not published immediately");
frames.shift()();
check(state.speaks === 1 && state.last.text === "今日は雨です。", "prepared sentence did not play exactly once and unchanged");
check(state.last.voice === japaneseVoice && state.last.lang === "ja-JP", "Japanese voice was not selected explicitly");
state.last.onstart(); state.last.onend();
check(events.join() === "preparing,playing,ended", "playback lifecycle status order drifted");

controller.resetPlayback();
check(controller.requestPlayback("two", "次の問題です。", (event) => events.push(event)), "new item did not schedule");
controller.cancel();
frames.shift()();
check(state.speaks === 1 && state.cancels === 1, "cancelled pending playback arrived after navigation/reset");

console.log("Japanese listening audio start regression passed.");
