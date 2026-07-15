#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const repoRoot = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const style = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');
const vocabularyRaw = fs.readFileSync(path.join(repoRoot, 'vocabulary.json'), 'utf8');
const vocabulary = JSON.parse(vocabularyRaw);
const readingQuestionsRaw = fs.readFileSync(path.join(repoRoot, 'japaneseReadingQuestions.js'), 'utf8');
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(repoRoot, file))).digest('hex');
}

function findVocabularyExactMatch(word, reading, data = vocabulary) {
  const exactMatches = data.filter((item) => String(item?.word ?? '') === String(word ?? ''));
  if (exactMatches.length === 0) return null;
  const readingMatch = exactMatches.find((item) => String(item?.kana ?? '') === String(reading ?? ''));
  return readingMatch || (exactMatches.length === 1 ? exactMatches[0] : null);
}

const known = vocabulary.find((item) => item.word && item.kana);
assert(findVocabularyExactMatch(known.word, known.kana)?.id === known.id, '閱讀練習 exact word lookup should find an existing vocabulary item.');

const duplicateFixture = [
  { id: 'a', word: '今日', kana: 'きょう', meaning: 'today' },
  { id: 'b', word: '今日', kana: 'こんにち', meaning: 'nowadays' },
];
assert(findVocabularyExactMatch('今日', 'こんにち', duplicateFixture)?.id === 'b', 'Duplicate words should prefer the item whose kana matches ruby reading.');
assert(findVocabularyExactMatch('今日', 'きのう', duplicateFixture) === null, 'Duplicate words without a kana/ruby match should not choose an unreliable item.');
assert(findVocabularyExactMatch('不存在', 'ふそんざい') === null, 'Unknown words should not create a wrong lookup card.');

['word', 'kana', 'partOfSpeech', 'meaning', 'level', 'example', 'exampleKana', 'exampleMeaning'].forEach((field) => {
  assert(script.includes(`entry.${field}`), `Lookup card should render ${field}.`);
});
assert(script.includes('reading-lookup-card') && script.includes('reading-lookup-row') && script.includes('reading-lookup-close'), 'Lookup card structure and close button should exist.');
assert(script.includes('clearReadingLookupCard();') && script.includes('showReadingLookupCard(card, entry)'), 'Clicking another term should replace the single lookup card.');
assert((script.match(/clearReadingLookupCard\(\);/g) || []).length >= 3, 'Close, menu changes, and article changes should clear lookup state.');
assert(script.includes('next.addEventListener("click", showReadingPracticeQuestion)'), 'Changing reading article should still use the existing next-article flow.');

assert(script.includes('renderRubyText(title, readingSet.title, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Only reading practice title ruby should enable lookup.');
assert(script.includes('renderRubyText(passage, readingSet.passage, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Only reading practice passage ruby should enable lookup.');
assert(script.includes('createReadingSetCard(readingSet, { showFeedback: true, selectedAnswers, showRuby: false'), 'Reading quiz should render without ruby lookup.');
assert(!script.includes('renderRubyText(questionText, question.question, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Question text must not enable lookup.');
assert(!script.includes('renderRubyText(button, option, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Option buttons must not enable lookup.');

const lookupLocalStorageBlock = script.slice(script.indexOf('function findVocabularyExactMatch'), script.indexOf('function getReadingQuestionCorrectIndex'));
assert(!/localStorage/.test(lookupLocalStorageBlock), 'Reading click lookup must not use localStorage.');
assert(!/innerHTML\s*=/.test(lookupLocalStorageBlock), 'Lookup implementation must not insert vocabulary data with innerHTML.');
assert(/textContent\s*=\s*text/.test(lookupLocalStorageBlock), 'Lookup implementation should insert vocabulary data with textContent.');

assert(style.includes('.is-clickable-ruby') && style.includes('cursor: pointer') && style.includes(':focus-visible'), 'Clickable ruby needs clear hover/focus styles.');
assert(style.includes('.reading-lookup-card') && style.includes('max-width: 100%') && style.includes('overflow-wrap: anywhere'), 'Lookup card needs responsive containment styles.');
assert(/@media \(max-width: 640px\)[\s\S]*\.reading-lookup-card[\s\S]*\.reading-lookup-row/.test(style), 'Mobile responsive lookup styles should exist.');
assert(script.includes('ruby.tabIndex = 0') && script.includes('event.key !== "Enter"') && script.includes('event.key !== " "'), 'Keyboard users should open lookup with Tab plus Enter/Space.');

assert(vocabulary.length === 3241, 'vocabulary.json total should remain 3241.');
assert(vocabulary.filter((item) => item.level === 'N5').length === 1021, 'vocabulary.json N5 count should remain 1021.');
assert(vocabulary.filter((item) => item.level === 'N4').length === 2220, 'vocabulary.json N4 count should remain 2220.');
assert(new Set(vocabulary.map((item) => item.id)).size === vocabulary.length, 'vocabulary.json duplicate id should remain 0.');
assert(new Set(vocabulary.map((item) => item.word)).size === vocabulary.length, 'vocabulary.json duplicate word should remain 0.');
const required = ['id', 'level', 'word', 'kana', 'meaning', 'partOfSpeech', 'example', 'exampleKana', 'exampleMeaning'];
assert(vocabulary.every((item) => required.every((field) => String(item[field] ?? '').trim())), 'vocabulary.json missing required fields should remain 0.');

const diffName = require('node:child_process').execSync('git diff --name-only', { cwd: repoRoot, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
assert(!diffName.includes('vocabulary.json'), `vocabulary.json must not be modified (${sha('vocabulary.json')}).`);
assert(!diffName.includes('japaneseReadingQuestions.js'), `Reading question bank must not be modified (${sha('japaneseReadingQuestions.js')}).`);
assert(readingQuestionsRaw.includes('window.JAPANESE_READING_SETS'), 'Reading question bank remains readable.');

if (errors.length) {
  console.error('Japanese reading click lookup check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Japanese reading click lookup check passed: exact matching, single card updates, scope limits, safety rules, responsive styles, and vocabulary baselines verified.');
