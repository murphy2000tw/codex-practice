#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('japanese/index.html');
const script = read('script.js');
const grammar = JSON.parse(read('grammar.json'));
const failures = [];
const notes = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const count = (pattern, source) => (source.match(pattern) || []).length;

const grammarMenuMatch = html.match(/<section id="japaneseGrammarMenuView"[\s\S]*?<\/section>/);
const grammarMenu = grammarMenuMatch ? grammarMenuMatch[0] : '';
const clozeItems = grammar.filter((item) => item.quiz && item.quiz.clozePrompt && item.quiz.answer);
const localStorageKeys = [...script.matchAll(/const\s+([A-Z0-9_]+KEY)\s*=\s*"([^"]+)"/g)].map((m) => m[2]);

assert(grammar.length === 290, `Expected grammar.json baseline to remain 290 items, found ${grammar.length}`);
assert(clozeItems.length === 130, `Expected grammar cloze baseline to remain 130 items, found ${clozeItems.length}`);
assert(/data-japanese-grammar-entry="practice"/.test(grammarMenu), 'Grammar menu must keep practice entry');
assert(/data-japanese-grammar-entry="quiz"/.test(grammarMenu), 'Grammar menu must keep quiz entry');
assert(!/sentenceComposition|句子重組/.test(html + script), 'Batch 16A-1 must not add sentence-composition runtime UI or flow');
assert(!/data-japanese-grammar-entry="sentenceComposition"/.test(html), 'Batch 16A-1 must not add a third grammar menu entry yet');
assert(!/japanese_sentence_composition/i.test(script), 'Batch 16A-1 must not add a new storage key');
assert(script.includes('JAPANESE_MISTAKE_BOOK_KEY = "japanese_mistake_book_v1"'), 'Mistake book must remain on japanese_mistake_book_v1');
assert(script.includes('grammarMeaning') && script.includes('grammarCloze'), 'Existing grammar mistake question types must remain discoverable');
assert(script.includes('function renderJapaneseView') && script.includes('resetJapaneseReviewPanel()'), 'View isolation renderer/reset flow must remain discoverable');
assert(script.includes('replaceChildren') && script.includes('textContent'), 'Safe DOM primitives must remain available for future feature implementation');
assert(html.includes('aria-live="polite"') && script.includes('aria-live'), 'aria-live status regions must remain discoverable');

notes.push(`grammarMenuEntries=${count(/data-japanese-grammar-entry=/g, grammarMenu)}`);
notes.push(`grammarItems=${grammar.length}`);
notes.push(`grammarClozeItems=${clozeItems.length}`);
notes.push(`mistakeBookKey=${localStorageKeys.find((key) => key === 'japanese_mistake_book_v1') || 'missing'}`);
notes.push(`innerHTMLAssignments=${count(/\.innerHTML\s*=/g, script)} (future sentence-composition question/answer data must not use these)`);
notes.push('sentenceCompositionRuntimeUi=absent');

if (failures.length) {
  console.error('Batch 16A-1 sentence-composition architecture audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16A-1 sentence-composition architecture audit passed.');
notes.forEach((note) => console.log(`- ${note}`));
