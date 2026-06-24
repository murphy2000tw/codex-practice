#!/usr/bin/env node
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));

const readingSets = window.JAPANESE_READING_SETS || [];
const kanjiPattern = /[\u4E00-\u9FFF]/u;
const rtPattern = /<rt>(.*?)<\/rt>/g;
const rubyPattern = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;

const confirmedReadings = new Map(Object.entries({
  '駅': 'えき',
  '写真': 'しゃしん',
  '印刷': 'いんさつ',
  '画面': 'がめん',
  '店員': 'てんいん',
  '時間': 'じかん',
  '電車': 'でんしゃ',
  '急行': 'きゅうこう',
  '普通電車': 'ふつうでんしゃ',
}));

function stripRubyMarkup(value) {
  return String(value ?? '')
    .replace(/<ruby>/g, '')
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<\/ruby>/g, '');
}

function collectKanji(value) {
  return [...new Set(String(value ?? '').match(/[\u4E00-\u9FFF]/gu) || [])];
}

function collectAnnotatedTerms(markup) {
  return [...String(markup ?? '').matchAll(rubyPattern)].map((match) => ({
    base: stripRubyMarkup(match[1]),
    rt: match[2],
  }));
}

function collectRubyKanji(markup) {
  const covered = new Set();
  for (const term of collectAnnotatedTerms(markup)) {
    for (const char of collectKanji(term.base)) covered.add(char);
  }
  return covered;
}

function hasMalformedRuby(markup) {
  const withoutValidRuby = String(markup ?? '').replace(rubyPattern, '');
  return /<\/?ruby>|<\/?rt>/.test(withoutValidRuby);
}

const errors = [];
const warnings = [];
const report = [];

for (const readingSet of readingSets) {
  const reportItem = {
    id: readingSet.id,
    title: readingSet.title,
    titleRuby: readingSet.titleRuby,
    passage: readingSet.passage,
    passageRuby: readingSet.passageRuby,
    annotatedTerms: [],
    unannotatedKanji: [],
  };

  for (const field of ['titleRuby', 'passageRuby']) {
    const markup = String(readingSet[field] ?? '');
    const expected = field === 'titleRuby' ? readingSet.title : readingSet.passage;

    if (hasMalformedRuby(markup)) {
      errors.push(`${readingSet.id} (${readingSet.title}) ${field}: malformed ruby HTML`);
    }

    for (const match of markup.matchAll(rtPattern)) {
      const rt = match[1];
      if (!rt.trim()) errors.push(`${readingSet.id} (${readingSet.title}) ${field}: empty <rt>`);
      if (kanjiPattern.test(rt)) errors.push(`${readingSet.id} (${readingSet.title}) ${field}: <rt> contains kanji: ${rt}`);
    }

    const actual = stripRubyMarkup(markup);
    if (actual !== expected) {
      errors.push(`${readingSet.id} (${readingSet.title}) ${field}: base text mismatch\n  expected: ${expected}\n  actual:   ${actual}`);
    }

    const annotatedTerms = collectAnnotatedTerms(markup);
    reportItem.annotatedTerms.push(...annotatedTerms.map((term) => `${term.base}（${term.rt}）`));
    for (const term of annotatedTerms) {
      const confirmed = confirmedReadings.get(term.base);
      if (confirmed && term.rt !== confirmed) {
        errors.push(`${readingSet.id} (${readingSet.title}) ${field}: ${term.base} rt should be ${confirmed}, got ${term.rt}`);
      }
    }

    const kanji = collectKanji(expected);
    const covered = collectRubyKanji(markup);
    const missing = kanji.filter((char) => !covered.has(char));
    if (missing.length) {
      const warning = `${readingSet.id} (${readingSet.title}) ${field}: unannotated kanji: ${missing.join('')}`;
      warnings.push(warning);
      reportItem.unannotatedKanji.push(`${field}: ${missing.join('')}`);
    }
  }

  report.push(reportItem);
}

console.log('Reading ruby manual review report:');
for (const item of report) {
  console.log(`- ${item.id} ${item.title}`);
  console.log(`  titleRuby: ${item.titleRuby}`);
  console.log(`  passage: ${item.passage}`);
  console.log(`  passageRuby: ${item.passageRuby}`);
  console.log(`  annotatedTerms: ${item.annotatedTerms.length ? item.annotatedTerms.join(', ') : '(none)'}`);
  console.log(`  unannotatedKanji: ${item.unannotatedKanji.length ? item.unannotatedKanji.join('; ') : '(none)'}`);
}

if (warnings.length) {
  console.warn('\nWarnings (not failures):');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nErrors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`\nChecked ${readingSets.length} reading sets: ruby structure is valid, <rt> entries are kana-only and non-empty, base text matches title/passage, and confirmed readings passed. ${warnings.length} unannotated-kanji warnings.`);
}
