#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { execFileSync } = require("child_process");

const BASE = "e03709d853f28156124225187c6a43bf0c9aba6f";
const ALLOWED = new Set([
  "style.css",
  "japanese/index.html",
  "scripts/check-japanese-jlpt-batch17c3a-ruby-layout.js",
]);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) fail(message);
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitRaw(...args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function pathsFrom(args) {
  const output = git(...args);
  return output ? output.split("\n") : [];
}

function cssRuleFor(source, selector) {
  const selectorIndex = source.indexOf(selector);
  if (selectorIndex < 0) return "";
  const blockStart = source.indexOf("{", selectorIndex);
  const blockEnd = source.indexOf("}", blockStart);
  return blockStart >= 0 && blockEnd > blockStart
    ? source.slice(selectorIndex, blockEnd + 1)
    : "";
}

check(git("merge-base", "HEAD", BASE) === BASE, "HEAD must descend from the Batch 17C-3A base commit");

const changed = new Set([
  ...pathsFrom(["diff", "--name-only", BASE]),
  ...pathsFrom(["diff", "--cached", "--name-only"]),
  ...pathsFrom(["diff", "--name-only"]),
  ...pathsFrom(["ls-files", "--others", "--exclude-standard"]),
]);
for (const path of changed) {
  check(ALLOWED.has(path), `disallowed committed, staged, unstaged, or untracked file: ${path}`);
}
for (const path of ALLOWED) {
  check(changed.has(path), `expected Batch 17C-3A file is not changed from base: ${path}`);
}

const html = fs.readFileSync("japanese/index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");

check(html.includes('../style.css?v=2.10'), "stylesheet cache token is not v=2.10");
[
  '../script.js?v=3.6',
  '../japaneseReadingQuestions.js?v=1.0',
  '../japaneseJlptVocabularyGrammarQuestions.json?v=17b1',
  '../japaneseJlptReadingQuestions.json?v=17c2',
].forEach((token) => check(html.includes(token), `required unchanged cache token missing: ${token}`));

const scopes = ["h4", ".quiz-prompt", ".quiz-option"];
const rubyKinds = [".jp-ruby", ".jp-rt", ".jp-rb"];
for (const scope of scopes) {
  for (const kind of rubyKinds) {
    const selector = `#japaneseJlptQuestionContent ${scope} ${kind}`;
    check(css.includes(selector), `scoped JLPT ruby selector missing: ${selector}`);
  }
}

const requiredDeclarations = {
  ".jp-ruby": [
    "position: relative", "display: inline-block", "padding-top: 0.72em",
    "vertical-align: baseline", "line-height: 1.15", "white-space: nowrap",
    "word-break: keep-all", "letter-spacing: 0", "word-spacing: 0",
  ],
  ".jp-rt": [
    "position: absolute", "left: 50%", "top: 0", "transform: translateX(-50%)",
    "font-size: 0.42em", "line-height: 1", "white-space: nowrap",
    "pointer-events: none",
  ],
  ".jp-rb": [
    "display: inline-block", "font-size: 1em", "line-height: 1.15",
    "white-space: nowrap",
  ],
};
for (const kind of rubyKinds) {
  const rule = cssRuleFor(css, `.reading-passage ${kind}`);
  check(Boolean(rule), `existing reading rule missing for ${kind}`);
  for (const scope of scopes) {
    check(
      rule.includes(`#japaneseJlptQuestionContent ${scope} ${kind}`),
      `JLPT selector does not reuse the existing reading ${kind} rule: ${scope}`,
    );
  }
  for (const declaration of requiredDeclarations[kind]) {
    check(rule.includes(`${declaration};`), `${kind} existing positioning rule changed or missing: ${declaration}`);
  }
}

for (const scope of [".reading-passage", ".reading-question", ".reading-option", ".reading-card-header h2"]) {
  for (const kind of rubyKinds) {
    check(css.includes(`${scope} ${kind}`), `existing reading ruby selector missing: ${scope} ${kind}`);
  }
}

check(fs.readFileSync("script.js", "utf8") === gitRaw("show", `${BASE}:script.js`), "script.js changed from base");

const protectedPaths = [
  "japaneseJlptReadingQuestions.json",
  "japaneseJlptReadingPolicy.json",
  "japaneseJlptVocabularyGrammarQuestions.json",
  "japaneseReadingQuestions.js",
  "vocabulary.json",
  "grammar.json",
  ...pathsFrom(["ls-files", "scripts/*builder*", "scripts/build-*", "scripts/check-*"])
    .filter((path) => path !== "scripts/check-japanese-jlpt-batch17c3a-ruby-layout.js"),
];
for (const path of protectedPaths) {
  check(!changed.has(path), `protected data, builder, or historical checker changed: ${path}`);
}

if (!process.exitCode) {
  console.log("PASS: Batch 17C-3A JLPT reading ruby layout checks passed.");
}
