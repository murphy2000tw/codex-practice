const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'japanese', 'index.html');
const scriptPath = path.join(root, 'script.js');
const baseCommit = 'd895d3714c545de750a1b2a490b346632d4ace53';
const html = fs.readFileSync(htmlPath, 'utf8');
const script = fs.readFileSync(scriptPath, 'utf8');
const failures = [];
const protectedFiles = [
  'vocabulary.json',
  'grammar.json',
  'japaneseReadingQuestions.js',
  'japaneseSentenceCompositionQuestions.json',
  'docs/japanese-sentence-composition-batch16d3-final-audit-v2.md',
  'docs/japanese-sentence-composition-batch16d3-final-permutations.json',
  'docs/japanese-jlpt-batch17a-plan.md',
  'scripts/check-japanese-jlpt-batch17a-plan.js',
];

function fail(message) { failures.push(message); }
function includes(source, snippet, label) { if (!source.includes(snippet)) fail(`Missing ${label}: ${snippet}`); }
function run(command) { return cp.execSync(command, { cwd: root, encoding: 'utf8' }); }
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) return '';
  const brace = source.indexOf('{', start);
  let depth = 0;
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  return '';
}
function extractConstArray(source, name) {
  const start = source.indexOf(`const ${name} = [`);
  if (start === -1) return '';
  const end = source.indexOf('\n];', start);
  return end === -1 ? '' : source.slice(start, end + 3);
}

try { run(`git merge-base --is-ancestor ${baseCommit} HEAD`); } catch { fail(`HEAD must contain PR #280 merge commit ${baseCommit}`); }

includes(html, 'data-japanese-entry="jlptMock"', 'JLPT home entry');
['vocabulary', 'reading', 'grammar', 'listening', 'reviewMenu'].forEach((entry) => includes(html, `data-japanese-entry="${entry}"`, `original Japanese entry ${entry}`));
const entries = [...html.matchAll(/data-japanese-entry="([^"]+)"/g)].map((m) => m[1]);
const firstSix = entries.slice(0, 6).join(',');
if (firstSix !== 'vocabulary,reading,grammar,listening,reviewMenu,jlptMock') fail(`Japanese home entry order changed: ${firstSix}`);
includes(html, 'id="japaneseJlptPanel"', 'JLPT panel');
if (!/<section[^>]+id="japaneseJlptPanel"[^>]+hidden/.test(html)) fail('JLPT panel must be hidden by default.');
['JLPT 模擬測驗', '不代表官方 JLPT 試題或官方成績', 'data-japanese-jlpt-level="N5"', 'data-japanese-jlpt-level="N4"', 'id="backToJapaneseHomeFromJlpt"', '開始模擬測驗（尚未開放）', '正式測驗將於後續批次開放'].forEach((snippet) => includes(html, snippet, 'JLPT static UI'));
if (!/<button[^>]+data-japanese-jlpt-level="N5"[^>]+aria-pressed="false"/.test(html)) fail('N5 button must use aria-pressed.');
if (!/<button[^>]+data-japanese-jlpt-level="N4"[^>]+aria-pressed="false"/.test(html)) fail('N4 button must use aria-pressed.');
if (!/id="japaneseJlptStatus"[^>]+(aria-live="polite"|role="status")/.test(html)) fail('JLPT status must expose aria-live or role=status.');
if (!/<button[^>]+id="startJapaneseJlptMock"[^>]+disabled/.test(html)) fail('Start mock button must be disabled.');

includes(script, 'let selectedJapaneseJlptLevel = null', 'memory-only JLPT level state');
if (!/function resetJapaneseJlptState\(\)[\s\S]*selectedJapaneseJlptLevel = null/.test(script)) fail('Returning/leaving must clear JLPT level state.');
if (!/backToJapaneseHomeFromJlptButton[\s\S]*resetJapaneseJlptState\(\)[\s\S]*showJapaneseContentView\("home"\)/.test(script)) fail('JLPT back-home flow must reset state then return home.');
if (/localStorage[\s\S]{0,160}jlpt|jlpt[\s\S]{0,160}localStorage/i.test(script)) fail('JLPT state must not use LocalStorage.');
['japanese_vocabulary_book_v1', 'japanese_mistake_book_v1'].forEach((key) => includes(script, key, `existing storage key ${key}`));
protectedFiles.forEach((file) => { try { run(`git diff --quiet ${baseCommit} -- ${file}`); } catch { fail(`Protected formal/planning data changed: ${file}`); } });
const baseScript = run(`git show ${baseCommit}:script.js`);
if (extractConstArray(script, 'JAPANESE_LISTENING_QUESTIONS') !== extractConstArray(baseScript, 'JAPANESE_LISTENING_QUESTIONS')) fail('JAPANESE_LISTENING_QUESTIONS differs from PR #280 merge commit.');
['renderJapaneseJlptPanel', 'resetJapaneseJlptState', 'selectJapaneseJlptLevel'].forEach((name) => {
  const fn = extractFunction(script, name);
  if (!fn) fail(`Missing JLPT function ${name}`);
  if (/innerHTML/.test(fn)) fail(`${name} must not use innerHTML.`);
});
if (!html.includes('../script.js?v=3.4')) fail('script.js cache must be v=3.4.');
const styleChanged = run(`git diff --name-only ${baseCommit} -- style.css`).trim() !== '';
if (styleChanged && !html.includes('../style.css?v=3.0')) fail('Modified style.css must use cache v=3.0.');
if (!styleChanged && !html.includes('../style.css?v=2.9')) fail('Unmodified style.css must keep cache v=2.9.');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d3b')) fail('Sentence composition cache must remain v=16d3b.');
if (/JLPT[\s\S]{0,180}(score|correctCount|countdown|timer|result|結果|localStorage|shuffleItems|slice\()/i.test(script)) fail('JLPT code must not implement scoring, timer, result, draw, or storage.');
includes(script, '目前缺少足夠的 N5 閱讀題庫', 'N5 reading insufficient status');
includes(script, '現有 N4 閱讀資料已盤點，正式 JLPT 題面尚未建立', 'N4 reading inventoried status');
['docs/japanese-sentence-composition-batch16d3-final-audit-v2.md', 'docs/japanese-jlpt-batch17a-plan.md'].forEach((file) => { try { run(`git diff --quiet ${baseCommit} -- ${file}`); } catch { fail(`PR #279/#280 planning/audit file modified: ${file}`); } });

if (failures.length) {
  console.error('Batch 17A-2 JLPT entry audit failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log('Batch 17A-2 JLPT entry audit passed.');
