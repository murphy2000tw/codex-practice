#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const planPath = path.join(root, 'docs/japanese-sentence-composition-batch16c-plan.md');
const plan = fs.readFileSync(planPath, 'utf8');
const lines = plan.split(/\r?\n/);
function assert(condition, message) { if (!condition) { console.error(`FAIL: ${message}`); process.exitCode = 1; } }
[
  '文法練習','文法測驗','句子重組練習','句子重組測驗',
  '頁面主標題為「句子重組」','練習模式','測驗模式',
  '作答後立即顯示','不寫入錯題本','每次固定 5 題','不得重複題目','不顯示答對／答錯',
  'N5、N4、混合','結果頁顯示答對題數','每題使用者答案','★正確答案',
  'sentenceComposition','grammar:sentenceComposition:<questionId>','穩定 `questionId`','不新增 localStorage key',
  'view isolation','禁止用 `innerHTML`','Batch 16C-2A','Batch 16C-2B','Batch 16C-3',
  'total=20','N5=8','N4=12'
].forEach((text)=>assert(plan.includes(text), `plan missing ${text}`));
assert(/data-japanese-grammar-entry=\"practice\"/.test(plan), 'missing practice data attribute');
assert(/data-japanese-grammar-entry=\"quiz\"/.test(plan), 'missing quiz data attribute');
assert(/sentence-composition-practice/.test(plan), 'missing sentence composition practice data attribute proposal');
assert(/sentence-composition-quiz/.test(plan), 'missing sentence composition quiz data attribute proposal');
assert(/不計分[\s\S]*不寫入錯題本[\s\S]*不新增 localStorage/.test(plan), 'practice contract must state no scoring, no mistake write, no localStorage');
assert(/測驗開始前選擇 N5、N4、混合[\s\S]*每次固定 5 題[\s\S]*不得重複題目/.test(plan), 'quiz setup/fixed unique contract missing');
assert(/題庫內容必須使用 `textContent`／DOM API[\s\S]*禁止用 `innerHTML`/.test(plan), 'safe DOM rule missing');
assert(lines.length <= 800, `plan too long: ${lines.length} lines`);
assert(!/```json[\s\S]{1000,}```/.test(plan), 'plan must not embed large JSON');
if (!process.exitCode) console.log(`Batch 16C plan check passed (${lines.length} lines).`);
