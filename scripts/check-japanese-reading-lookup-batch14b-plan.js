#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = path.join(__dirname, '..');
const mdPath = path.join(repoRoot, 'docs/japanese-reading-lookup-batch14b-plan.md');
const md = fs.readFileSync(mdPath, 'utf8');
const vocabulary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vocabulary.json'), 'utf8'));
const readingRaw = fs.readFileSync(path.join(repoRoot, 'japaneseReadingQuestions.js'), 'utf8');
const errors = [];
const expected = {
  'exact-match': 234,
  'safe-inflection-candidate': 5,
  'safe-compound-segmentation-candidate': 2,
  'no-lookup-needed': 0,
  'manual-review': 54,
};
function assert(ok, msg) { if (!ok) errors.push(msg); }
function uniqueVocabulary(word, kana) { return vocabulary.filter((v) => v.word === word && v.kana === kana); }
function extractCount(label) {
  const match = md.match(new RegExp(`- ${label}：([0-9]+)`));
  return match ? Number(match[1]) : NaN;
}
function section(title) {
  const match = md.match(new RegExp(`## ${title}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[1].trim() : '';
}
function tableRows(title) {
  return section(title).split('\n').filter((line) => line.startsWith('| ') && !/^\|[-:| ]+\|$/.test(line) && !line.includes('surface | reading'));
}
function cells(row) { return row.slice(1, -1).split('|').map((cell) => cell.trim()); }

assert(md.split('\n').length <= 800, 'markdown report must not exceed 800 lines');
assert(!md.includes('~~~json') && !md.includes('```json'), 'markdown report must not embed JSON');
assert(!md.includes('"items"') && !md.includes('"exampleMeaning"'), 'markdown report must not embed full machine summary or vocabulary objects');
const longPassages = [...readingRaw.matchAll(/"passage": "([^"]{60,})"/g)].map((m) => m[1]);
for (const passage of longPassages) assert(!md.includes(passage), 'markdown report must not embed full article passages');
for (const [label, value] of Object.entries(expected)) assert(extractCount(label) === value, `${label} count should remain ${value}`);
assert(md.includes('- 閱讀文章數：105'), 'reading article count should remain 105');
assert(md.includes('- title/passage 實際 ruby 詞總出現次數：842'), 'ruby occurrence count should remain 842');
assert(md.includes('- 去重後 surface＋reading 數量：295'), 'unique surface+reading count should remain 295');
assert(md.includes('234/295（79.32%）'), 'before coverage should remain 234/295 (79.32%)');
assert(md.includes('241/295（81.69%）'), 'after coverage should remain 241/295 (81.69%)');

const inflectionRows = tableRows('safe-inflection 完整清單');
assert(inflectionRows.length === expected['safe-inflection-candidate'], 'safe-inflection row count should remain 5');
for (const row of inflectionRows) {
  const [surface, reading, base, baseKana, id, partOfSpeech, rule, reason] = cells(row);
  assert(surface && reading && base && baseKana && id && partOfSpeech && rule && reason, `safe-inflection evidence incomplete: ${row}`);
  const hits = uniqueVocabulary(base, baseKana);
  assert(hits.length === 1 && String(hits[0].id) === id, `safe-inflection base should uniquely match vocabulary: ${base}/${baseKana}`);
}

const compoundRows = tableRows('safe-compound 完整清單');
assert(compoundRows.length === expected['safe-compound-segmentation-candidate'], 'safe-compound row count should remain 2');
for (const row of compoundRows) {
  const [surface, reading, segmentation, reason] = cells(row);
  assert(surface && reading && segmentation && reason, `safe-compound evidence incomplete: ${row}`);
  const parts = segmentation.split(' + ');
  assert(parts.length >= 2, `compound needs at least two segments: ${surface}`);
  const surfaceCovered = parts.map((part) => part.startsWith('literal:') ? part.replace('literal:', '') : part.split(':')[1].split('/')[0]).join('');
  const readingCovered = parts.map((part) => part.startsWith('literal:') ? part.replace('literal:', '') : part.split('/')[1]).join('');
  assert(surfaceCovered === surface, `compound surface must be fully covered: ${surface}`);
  assert(readingCovered === reading, `compound reading must be fully covered: ${reading}`);
  for (const part of parts.filter((p) => !p.startsWith('literal:'))) {
    const [id, wordKana] = part.split(':');
    const [word, kana] = wordKana.split('/');
    const hits = uniqueVocabulary(word, kana);
    assert(hits.length === 1 && String(hits[0].id) === id, `compound segment should uniquely match vocabulary: ${word}/${kana}`);
  }
}

const manualRows = tableRows('manual-review 完整清單');
assert(manualRows.length === expected['manual-review'], 'manual-review row count should remain 54');
const manualKeys = new Set();
for (const row of manualRows) {
  const [surface, reading, sourceIds, reason] = cells(row);
  assert(surface && reading && sourceIds && reason, `manual-review row incomplete: ${row}`);
  assert(sourceIds.split(',').every((id) => /^jp-reading-set-n4-\d{3}$/.test(id.trim())), `manual source IDs should be comma-separated reading set IDs: ${row}`);
  manualKeys.add(`${surface}\u0000${reading}`);
}
assert(manualKeys.size === expected['manual-review'], 'manual-review surface+reading entries must be unique');
const safeKeys = new Set([...inflectionRows, ...compoundRows].map((row) => { const [surface, reading] = cells(row); return `${surface}\u0000${reading}`; }));
for (const key of manualKeys) assert(!safeKeys.has(key), `manual-review item must not appear in safe list: ${key}`);
assert(md.includes('Batch 14B-2 建議安全規則'), 'report should include Batch 14B-2 safe rule recommendations');
assert(md.includes('Batch 14B-2 不得自動處理'), 'report should include forbidden automatic handling section');
assert(md.includes('優先順序與衝突處理'), 'report should include priority and conflict handling');
assert(vocabulary.length === 3241, 'vocabulary total should remain 3241');
assert(vocabulary.filter((item) => item.level === 'N5').length === 1021, 'N5 count should remain 1021');
assert(vocabulary.filter((item) => item.level === 'N4').length === 2220, 'N4 count should remain 2220');
assert(new Set(vocabulary.map((item) => item.id)).size === vocabulary.length, 'duplicate id should remain 0');
assert(new Set(vocabulary.map((item) => item.word)).size === vocabulary.length, 'duplicate word should remain 0');
const required = ['id', 'level', 'word', 'kana', 'meaning', 'partOfSpeech', 'example', 'exampleKana', 'exampleMeaning'];
assert(vocabulary.every((item) => required.every((field) => String(item[field] ?? '').trim())), 'missing required fields should remain 0');
if (errors.length) { console.error('Batch 14B-1 compact plan check failed:'); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log('Batch 14B-1 compact plan check passed: counts, compactness, safe evidence, manual-review completeness, no embedded full articles/JSON, and vocabulary baselines verified.');
