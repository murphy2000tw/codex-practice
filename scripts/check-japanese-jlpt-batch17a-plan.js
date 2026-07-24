#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');

const requiredCommit = '691636ade52be08afeab2790babc3d3e91ae5b61';
const allowedFiles = new Set([
  'docs/japanese-jlpt-batch17a-plan.md',
  'scripts/check-japanese-jlpt-batch17a-plan.js',
]);
const forbiddenFiles = [
  'japanese/index.html',
  'script.js',
  'style.css',
  'vocabulary.json',
  'grammar.json',
  'japaneseReadingQuestions.js',
  'japaneseSentenceCompositionQuestions.json',
];
const requiredSections = [
  '## 1. 現況盤點','## 2. 使用者需求','## 3. 一般學習測驗與 JLPT 模擬測驗的定位差異','## 4. JLPT 專區入口與頁面層級建議','## 5. N5／N4 等級選擇方式','## 6. 單字、文法、閱讀、聽力四部分的納入方式','## 7. 句子重組是否納入及其定位','## 8. 漢字、假名與 ruby 顯示政策','## 9. 題庫重用範圍','## 10. 缺少的題庫與資料欄位','## 11. 測驗狀態、結果頁與重新測驗流程','## 12. 生字本／錯題本整合方式','## 13. LocalStorage 相容與版本策略','## 14. 手機版、鍵盤操作與無障礙要求','## 15. 安全 DOM 要求','## 16. 快取版本管理方式','## 17. 自動測試與人工測試計畫','## 18. 後續分批實作順序','## 19. 明確列出本批次不做的內容',
];
const requiredBatches = ['Batch 17A-2','Batch 17B','Batch 17C','Batch 17D','Batch 17E'];
function fail(message){ console.error(`❌ ${message}`); process.exitCode = 1; }
function pass(message){ console.log(`✅ ${message}`); }
function git(args){ return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
try { execFileSync('git', ['merge-base','--is-ancestor', requiredCommit, 'HEAD']); pass('HEAD contains PR #279 merge commit.'); } catch { fail(`HEAD does not contain ${requiredCommit}.`); }
const changed = git(['diff','--name-only', `${requiredCommit}..HEAD`]).split('\n').filter(Boolean);
const stagedOrWorking = git(['status','--short']).split('\n').filter(Boolean).map((line)=>line.slice(3));
for (const file of [...new Set([...changed, ...stagedOrWorking])]) {
  if (!allowedFiles.has(file)) fail(`File is not allowed in Batch 17A-1: ${file}`);
}
if (changed.length || stagedOrWorking.length) pass('Changed files are limited to the plan and checker.');
for (const file of forbiddenFiles) {
  if (changed.includes(file) || stagedOrWorking.includes(file)) fail(`Forbidden file was modified: ${file}`);
}
pass('Forbidden runtime and production data files are unchanged in this PR.');
const sc = JSON.parse(fs.readFileSync('japaneseSentenceCompositionQuestions.json','utf8'));
const counts = sc.reduce((acc,q)=>{ acc.total += 1; acc[q.level] = (acc[q.level] || 0) + 1; return acc; }, { total: 0 });
if (counts.total !== 60 || counts.N5 !== 30 || counts.N4 !== 30) fail(`Sentence composition counts changed: ${JSON.stringify(counts)}`); else pass('Sentence composition counts remain total 60, N5 30, N4 30.');
const html = fs.readFileSync('japanese/index.html','utf8');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d3b')) fail('Sentence composition cache version is not v=16d3b.'); else pass('Sentence composition cache version remains v=16d3b.');
if (!html.includes('../script.js?v=3.3')) fail('script.js cache version changed from v=3.3.'); else pass('script.js cache version remains v=3.3.');
if (!html.includes('../style.css?v=2.9')) fail('style.css cache version changed from v=2.9.'); else pass('style.css cache version remains v=2.9.');
const planPath = 'docs/japanese-jlpt-batch17a-plan.md';
if (!fs.existsSync(planPath)) fail('Planning document is missing.');
const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath,'utf8') : '';
for (const section of requiredSections) if (!plan.includes(section)) fail(`Missing required section: ${section}`);
for (const batch of requiredBatches) if (!plan.includes(batch)) fail(`Missing follow-up batch: ${batch}`);
if (requiredSections.every((section)=>plan.includes(section)) && requiredBatches.every((batch)=>plan.includes(batch))) pass('Plan contains all required sections and follow-up batches.');
for (const term of ['練習模式','一般學習測驗','JLPT 模擬測驗']) if (!plan.includes(term)) fail(`Plan does not distinguish: ${term}`);
if (['練習模式','一般學習測驗','JLPT 模擬測驗'].every((term)=>plan.includes(term))) pass('Plan distinguishes practice, general tests, and JLPT mock tests.');
for (const term of ['漢字','假名','ruby','displayText','kana','rubyTerms','kanjiPolicy']) if (!plan.includes(term)) fail(`Kanji/kana/ruby policy missing term: ${term}`);
if (['漢字','假名','ruby','displayText','kana','rubyTerms','kanjiPolicy'].every((term)=>plan.includes(term))) pass('Plan includes explicit kanji/kana/ruby display policy and fields.');
const forbiddenClaims = ['已完成 JLPT','已實作 JLPT','正式符合官方 JLPT','完全符合官方 JLPT','已新增 JLPT 測驗 UI'];
for (const claim of forbiddenClaims) if (plan.includes(claim)) fail(`Plan appears to claim unimplemented functionality: ${claim}`);
if (!forbiddenClaims.some((claim)=>plan.includes(claim))) pass('Plan does not claim unimplemented JLPT functionality is complete.');
if (process.exitCode) process.exit(process.exitCode);
