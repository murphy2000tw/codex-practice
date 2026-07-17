#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const plan = read('docs/japanese-sentence-composition-batch16a-plan.md');
const script = read('script.js');
const grammar = JSON.parse(read('grammar.json'));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const requireText = (text) => assert(plan.includes(text), `Plan missing required text: ${text}`);

[
  'Batch 16A-1', '句子重組', '日文文法', '不新增日文首頁第六個入口', 'japanese_mistake_book_v1',
  'grammarMeaning', 'grammarCloze', 'sentenceComposition', 'grammar:sentenceComposition:<questionId>',
  'id', 'level', 'before', 'after', 'chunks', 'correctOrder', 'starSlot', 'completeSentence', 'kana', 'meaning', 'explanation', 'grammarIds',
  '正好四個片段', 'chunk ID 與文字均不可重複', 'correctOrder 必須完整包含四個 chunk', 'starSlot 必須合法',
  'correctOrder[starSlot]', '重組結果必須與 completeSentence 一致', '只能有一個合理答案', 'N5', 'N4',
  '不得使用 innerHTML 插入題目或答案資料', '練習模式', '測驗模式', 'Batch 16A-2', 'Batch 16B', 'Batch 16C', 'Batch 16D',
  '未新增正式 UI', '未新增正式題庫', '未新增 JLPT 完整模擬測驗', '未做全站漢字／ruby 調整'
].forEach(requireText);

assert(grammar.length === 290, `grammar.json baseline changed: ${grammar.length}`);
assert(grammar.filter((item) => item.quiz && item.quiz.clozePrompt && item.quiz.answer).length === 130, 'grammar cloze baseline changed');
const hasBatch16BPractice = fs.existsSync(path.join(root, 'scripts/check-japanese-sentence-composition-batch16b-practice.js'));
if (!hasBatch16BPractice) {
  assert(!/sentenceComposition/.test(script), 'script.js must not contain sentenceComposition runtime code before Batch 16B');
}
assert(!/localStorage[\s\S]{0,160}japanese_sentence_composition|japanese_sentence_composition[\s\S]{0,160}localStorage/i.test(script), 'script.js must not add sentence-composition storage key');

if (failures.length) {
  console.error('Batch 16A-1 sentence-composition plan check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16A-1 sentence-composition plan check passed.');
