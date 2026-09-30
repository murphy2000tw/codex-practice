#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const BASE = "cf56785";
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(`Batch 18A-4 check: ${message}`); };
const script = read("script.js");
const html = read("japanese/index.html");
const profile = script.slice(script.indexOf('"17c10-product-v1": {'), script.indexOf('"17c6-compat-v1": {'));
check(/N5:\s*\{ total: 30/.test(profile) && /N4:\s*\{ total: 44/.test(profile), "formal totals must be N5=30 and N4=44");
check((profile.match(/listening: \{ included: true, status: "available", total: 10, questionTypes: \{ listeningMeaning: 10 \} \}/g) || []).length === 2, "both listening quotas must be 10");
const compat = script.slice(script.indexOf('"17c6-compat-v1": {'), script.indexOf("const JAPANESE_JLPT_COMPAT_PROFILE_VERSION"));
check(/N5:\s*\{ total: 20/.test(compat) && /N4:\s*\{ total: 34/.test(compat), "17c6 compatibility profile changed");
for (const token of [
  "...createJapaneseJlptListeningCandidates(JAPANESE_LISTENING_QUESTIONS)",
  "buildJapaneseJlptListeningIsolatedSession(", "validateJapaneseJlptListeningCapability({",
  "japaneseJlptListeningPlayedSourceIds.add(question.sourceId)", "cancelJapaneseJlptListeningUtterance();",
  "requestJapaneseJlptListeningPlayback(question)", "成績：${correct}／${japaneseJlptSession.questionSnapshots.length}",
]) check(script.includes(token), `missing production integration: ${token}`);
check(script.indexOf("validateJapaneseJlptListeningCapability({", script.indexOf("function startJapaneseJlptMock")) < script.indexOf("buildJapaneseJlptSession(", script.indexOf("function startJapaneseJlptMock")), "capability gate must run before session build");
check(!script.includes("已使用相容模式"), "production failure must not silently fall back");
check(html.includes("N5 共 30 題、N4 共 44 題") && html.includes("聽力各 10 題") && html.includes("script.js?v=4.6"), "setup copy or cache token missing");
const base = cp.execFileSync("git", ["show", `${BASE}:script.js`], { cwd: ROOT, encoding: "utf8" });
for (const [label, re] of [["localStorage", /\blocalStorage\b/g], ["sessionStorage", /\bsessionStorage\b/g], ["IndexedDB", /\bindexedDB\b/g], ["Cache API", /\bcaches\b/g]])
  check((script.match(re) || []).length === (base.match(re) || []).length, `${label} inventory changed`);
for (const file of ["japaneseJlptReadingQuestions.json", "japaneseJlptReadingN5Questions.json", "japaneseJlptVocabularyGrammarQuestions.json"])
  check(cp.execFileSync("git", ["hash-object", file], { cwd: ROOT, encoding: "utf8" }).trim() === cp.execFileSync("git", ["rev-parse", `${BASE}:${file}`], { cwd: ROOT, encoding: "utf8" }).trim(), `${file} changed`);
console.log("Batch 18A-4 product activation audit passed.");
console.log("Formal totals N5=30/N4=44; listening quota=10 each; compatibility profile preserved.");
console.log("Fail-closed capability gate, one-play lifecycle, result score, storage and bank scope checks passed.");
