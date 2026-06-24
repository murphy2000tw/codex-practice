#!/usr/bin/env node
const path = require('node:path');

global.window = {};
require(path.join(__dirname, '..', 'japaneseReadingQuestions.js'));

const readingSets = window.JAPANESE_READING_SETS || [];
const kanjiPattern = /[\u4E00-\u9FFF]/u;
const rtPattern = /<rt>(.*?)<\/rt>/g;

function stripRubyMarkup(value) {
  return String(value ?? '')
    .replace(/<ruby>/g, '')
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<\/ruby>/g, '');
}

const rtIssues = [];
const textIssues = [];

for (const readingSet of readingSets) {
  for (const field of ['titleRuby', 'passageRuby']) {
    const markup = String(readingSet[field] ?? '');
    for (const match of markup.matchAll(rtPattern)) {
      if (kanjiPattern.test(match[1])) {
        rtIssues.push({
          id: readingSet.id,
          title: readingSet.title,
          field,
          rt: match[1],
        });
      }
    }

    const expected = field === 'titleRuby' ? readingSet.title : readingSet.passage;
    const actual = stripRubyMarkup(markup);
    if (actual !== expected) {
      textIssues.push({
        id: readingSet.id,
        title: readingSet.title,
        field,
        expected,
        actual,
      });
    }
  }
}

if (rtIssues.length) {
  console.error('Ruby <rt> entries containing kanji:');
  for (const issue of rtIssues) {
    console.error(`- ${issue.id} (${issue.title}) ${issue.field}: ${issue.rt}`);
  }
}

if (textIssues.length) {
  console.error('Ruby base text does not match title/passage:');
  for (const issue of textIssues) {
    console.error(`- ${issue.id} (${issue.title}) ${issue.field}`);
    console.error(`  expected: ${issue.expected}`);
    console.error(`  actual:   ${issue.actual}`);
  }
}

if (rtIssues.length || textIssues.length) {
  process.exitCode = 1;
} else {
  console.log(`Checked ${readingSets.length} reading sets: all titleRuby/passageRuby <rt> entries are kana-only and base text matches title/passage.`);
}
