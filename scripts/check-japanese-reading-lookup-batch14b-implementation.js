#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const style = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');
const plan = fs.readFileSync(path.join(repoRoot, 'docs/japanese-reading-lookup-batch14b-plan.md'), 'utf8');
const vocabulary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vocabulary.json'), 'utf8'));
const errors = [];
const assert = (ok, msg) => { if (!ok) errors.push(msg); };
const unique = (word, kana) => vocabulary.filter((v) => v.word === word && v.kana === kana);
const inflections = [
  ['温めて', 'あたためて', '温める', 'あたためる', 2263],
  ['書きました', 'かきました', '書く', 'かく', 201],
  ['調べ', 'しらべ', '調べる', 'しらべる', 1028],
  ['迷っています', 'まよっています', '迷う', 'まよう', 2314],
  ['誘い', 'さそい', '誘う', 'さそう', 1024],
];
const compounds = [
  { surface: '手伝う予定', reading: 'てつだうよてい', segments: [['手伝う', 'てつだう', 1040], ['予定', 'よてい', 1238]] },
  { surface: '朝の電車', reading: 'あさのでんしゃ', segments: [['朝', 'あさ', 170], ['の'], ['電車', 'でんしゃ', 348]] },
];
const inflectionBlock = script.match(/const READING_LOOKUP_INFLECTION_WHITELIST = Object\.freeze\(\[([\s\S]*?)\n\]\);/)?.[1] || '';
const compoundBlock = script.match(/const READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST = Object\.freeze\(\[([\s\S]*?)\n\]\);/)?.[1] || '';
assert((inflectionBlock.match(/surface:/g) || []).length === 5, '5 approved inflection whitelist entries must be implemented.');
for (const [surface, reading, base, kana, id] of inflections) {
  assert(inflectionBlock.includes(`surface: "${surface}"`) && inflectionBlock.includes(`reading: "${reading}"`) && inflectionBlock.includes(`baseWord: "${base}"`) && inflectionBlock.includes(`baseKana: "${kana}"`) && inflectionBlock.includes(`vocabularyId: ${id}`), `Inflection whitelist mismatch: ${surface}/${reading}.`);
  const hits = unique(base, kana);
  assert(hits.length === 1 && Number(hits[0].id) === id, `Inflection base must uniquely match vocabulary id ${id}.`);
}
assert(script.includes('appendReadingLookupRow(list, "原文形式", inflection.surface)') && script.includes('appendReadingLookupRow(list, "基本形", inflection.baseWord)'), 'Inflection lookup card must show original/base form hints.');
const priorityBlock = script.slice(script.indexOf('function getReadingLookupMatch'), script.indexOf('function clearReadingLookupCard'));
assert(priorityBlock.indexOf('findVocabularyExactMatch(part.base, part.ruby)') < priorityBlock.indexOf('getReadingInflectionLookup(part)'), 'Exact-match must be checked before inflection whitelist.');
assert(priorityBlock.indexOf('getReadingInflectionLookup(part)') < priorityBlock.indexOf('READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST.find'), 'Inflection whitelist must be checked before compound segmentation.');
assert((compoundBlock.match(/surface:/g) || []).length === 6, '2 compound whitelist entries plus their clickable segment surfaces must be implemented.');
for (const compound of compounds) {
  assert(compoundBlock.includes(`surface: "${compound.surface}"`) && compoundBlock.includes(`reading: "${compound.reading}"`), `Compound whitelist mismatch: ${compound.surface}/${compound.reading}.`);
  const coveredSurface = compound.segments.map((s) => s[0]).join('');
  const coveredReading = compound.segments.map((s) => s.length === 1 ? s[0] : s[1]).join('');
  assert(coveredSurface === compound.surface && coveredReading === compound.reading, `Compound must fully cover ${compound.surface}/${compound.reading}.`);
  for (const segment of compound.segments.filter((s) => s.length > 1)) {
    const hits = unique(segment[0], segment[1]);
    assert(hits.length === 1 && Number(hits[0].id) === segment[2], `Compound segment must uniquely match vocabulary id ${segment[2]}.`);
  }
}
assert(compoundBlock.includes('{ text: "の" }') && !compoundBlock.includes('vocabularyId: の'), 'The literal の segment must remain non-clickable.');
assert(script.includes('showReadingLookupCard(card, lookup)') && script.includes('clearReadingLookupCard();'), 'Single lookup card update/close flow must remain.');
assert(script.includes('renderRubyText(title, readingSet.title, getReadingRubyTerms(readingSet), { enableLookup: true })') && script.includes('renderRubyText(passage, readingSet.passage, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Lookup must stay scoped to reading practice title/passage.');
assert(!script.includes('renderRubyText(questionText, question.question, getReadingRubyTerms(readingSet), { enableLookup: true })') && !script.includes('renderRubyText(button, option, getReadingRubyTerms(readingSet), { enableLookup: true })'), 'Reading quiz questions/options must not enable lookup.');
const lookupBlock = script.slice(script.indexOf('const READING_LOOKUP_INFLECTION_WHITELIST'), script.indexOf('function getReadingTitleRubyParts'));
assert(!/localStorage/.test(lookupBlock), 'Reading lookup implementation must not use localStorage.');
assert(!/innerHTML\s*=/.test(lookupBlock), 'Vocabulary lookup data must not be inserted with innerHTML.');
assert(/textContent\s*=/.test(lookupBlock), 'Vocabulary lookup data should be inserted with textContent.');
assert(!/(endsWith|replace)\([^)]*(ました|ています|て|い|べ|う|く|る)/.test(lookupBlock), 'No loose global inflection or suffix guessing rules should exist.');
assert(!/(split|match)\([^)]*(電車|予定|の)/.test(lookupBlock), 'No fuzzy compound tokenizer should exist.');
assert((plan.match(/\| .*? \| .*? \| .*? \| 未能以完整 word/g) || []).length === 54, '54 manual-review rows must remain manual in the plan.');
for (const [surface, reading] of plan.matchAll(/\| ([^|]+) \| ([^|]+) \| [^|]+ \| 未能以完整 word/g)) {
  assert(!inflectionBlock.includes(`surface: "${surface.trim()}"`) && !compoundBlock.includes(`surface: "${surface.trim()}"`), `Manual-review item must not enter whitelist: ${surface}/${reading}.`);
}
assert(style.includes('.is-clickable-ruby') && style.includes(':focus-visible') && script.includes('ruby.tabIndex = 0') && script.includes('event.key !== "Enter"') && script.includes('event.key !== " "'), 'Keyboard operation and focus styling must remain.');
assert(style.includes('@media (max-width: 640px)') && style.includes('overflow-wrap: anywhere') && style.includes('max-width: 100%'), 'Mobile responsive lookup styles must remain.');
assert(vocabulary.length === 3241, 'vocabulary total should remain 3241.');
assert(vocabulary.filter((item) => item.level === 'N5').length === 1021, 'N5 count should remain 1021.');
assert(vocabulary.filter((item) => item.level === 'N4').length === 2220, 'N4 count should remain 2220.');
assert(new Set(vocabulary.map((item) => item.id)).size === vocabulary.length, 'duplicate id should remain 0.');
assert(new Set(vocabulary.map((item) => item.word)).size === vocabulary.length, 'duplicate word should remain 0.');
const required = ['id', 'level', 'word', 'kana', 'meaning', 'partOfSpeech', 'example', 'exampleKana', 'exampleMeaning'];
assert(vocabulary.every((item) => required.every((field) => String(item[field] ?? '').trim())), 'missing required fields should remain 0.');
if (errors.length) { console.error('Batch 14B-2 implementation check failed:'); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); }
console.log('Batch 14B-2 implementation check passed: whitelist inflections, compound segmentation, priority, scope, DOM safety, manual-review protection, accessibility, responsive styles, and vocabulary baselines verified.');
