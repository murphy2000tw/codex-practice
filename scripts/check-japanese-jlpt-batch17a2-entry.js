const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const baseCommit = 'd895d3714c545de750a1b2a490b346632d4ace53';
const html = fs.readFileSync(path.join(root, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
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
const expectedHomeEntries = ['vocabulary', 'reading', 'grammar', 'listening', 'reviewMenu', 'jlptMock'];
const formalFlowPattern = /\b(score|correctCount|wrongCount|accuracy|countdown|timer|setInterval|result|results|draw|shuffleItems|startJapaneseJlpt|recordJapaneseMistake|recordActiveQuizMistake)\b|開始正式|測驗結果|答對|倒數|計分|抽題|結果頁/i;

function fail(message) { failures.push(message); }
function includes(source, snippet, label) { if (!source.includes(snippet)) fail(`Missing ${label}: ${snippet}`); }
function run(command) { return cp.execSync(command, { cwd: root, encoding: 'utf8' }); }
function extractById(source, id) {
  const idIndex = source.indexOf(`id="${id}"`);
  if (idIndex === -1) return '';
  const tagStart = source.lastIndexOf('<', idIndex);
  const openTag = source.slice(tagStart).match(/^<([a-z0-9-]+)/i);
  if (!openTag) return '';
  const tag = openTag[1];
  let depth = 0;
  const pattern = new RegExp(`<\\/?${tag}(?=[\\s>])[^>]*>`, 'gi');
  pattern.lastIndex = tagStart;
  let match;
  while ((match = pattern.exec(source))) {
    if (match[0][1] === '/') depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(tagStart, pattern.lastIndex);
  }
  return '';
}
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) return '';
  const brace = source.indexOf('{', start);
  if (brace === -1) return '';
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
function assertRegex(source, regex, label) { if (!regex.test(source)) fail(`Missing ${label}: ${regex}`); }

try { run(`git merge-base --is-ancestor ${baseCommit} HEAD`); } catch { fail(`HEAD must contain PR #280 merge commit ${baseCommit}`); }

const home = extractById(html, 'japaneseHomeContent');
const jlptPanel = extractById(html, 'japaneseJlptPanel');
const entrySection = home.match(/<section class="entry-section japanese-main-entry-section"[\s\S]*?<\/section>/)?.[0] || '';
const homeEntries = [...entrySection.matchAll(/data-japanese-entry="([^"]+)"/g)].map((m) => m[1]);
if (JSON.stringify(homeEntries) !== JSON.stringify(expectedHomeEntries)) fail(`Home entry order must be exactly ${expectedHomeEntries.join(',')}; got ${homeEntries.join(',')}`);
expectedHomeEntries.forEach((entry) => includes(entrySection, `data-japanese-entry="${entry}"`, `home entry ${entry}`));

includes(html, 'id="japaneseJlptPanel"', 'JLPT panel');
if (!/<section[^>]+id="japaneseJlptPanel"[^>]+hidden/.test(html)) fail('JLPT panel must be hidden by default.');
['JLPT 模擬測驗', '不代表官方 JLPT 試題或官方成績', 'data-japanese-jlpt-level="N5"', 'data-japanese-jlpt-level="N4"', 'id="backToJapaneseHomeFromJlpt"', '開始模擬測驗（尚未開放）', '正式測驗將於後續批次開放'].forEach((snippet) => includes(jlptPanel, snippet, 'JLPT static UI'));
assertRegex(jlptPanel, /<button[^>]+data-japanese-jlpt-level="N5"[^>]+aria-pressed="false"[^>]*>N5<\/button>/, 'N5 button text and aria-pressed');
assertRegex(jlptPanel, /<button[^>]+data-japanese-jlpt-level="N4"[^>]+aria-pressed="false"[^>]*>N4<\/button>/, 'N4 button text and aria-pressed');
assertRegex(jlptPanel, /id="japaneseJlptStatus"[^>]+role="status"[^>]+aria-live="polite"/, 'JLPT aria-live status region');
assertRegex(jlptPanel, /<button[^>]+id="startJapaneseJlptMock"[^>]+disabled[^>]+aria-describedby="japanese-jlpt-unavailable-note"/, 'disabled start button with explanation');

const renderJapaneseView = extractFunction(script, 'renderJapaneseView');
const switchJapaneseTab = extractFunction(script, 'switchJapaneseTab');
const resetJapaneseJlptState = extractFunction(script, 'resetJapaneseJlptState');
const renderJapaneseJlptPanel = extractFunction(script, 'renderJapaneseJlptPanel');
const selectJapaneseJlptLevel = extractFunction(script, 'selectJapaneseJlptLevel');
['normalizeJapaneseView', 'getJapaneseViewElement', 'renderJapaneseView', 'switchJapaneseTab', 'resetJapaneseJlptState', 'renderJapaneseJlptPanel', 'selectJapaneseJlptLevel'].forEach((name) => includes(script, `function ${name}`, `JLPT/navigation function ${name}`));
includes(script, 'let selectedJapaneseJlptLevel = null', 'memory-only JLPT level state');
includes(script, 'if (view === "jlptMock") return japaneseJlptPanel;', 'JLPT view element mapping');
includes(switchJapaneseTab, 'renderJapaneseJlptPanel();', 'JLPT entry render call');
['japaneseHomeContent.hidden = panelView !== "home"', 'japaneseMainContent.hidden = panelView !== "vocabulary" && panelView !== "grammar"', 'japaneseReadingPanel.hidden = panelView !== "reading"', 'japaneseListeningPanel.hidden = panelView !== "listening"', 'japaneseReviewPanel.hidden = panelView !== "review"', 'japaneseJlptPanel.hidden = panelView !== "jlptMock"'].forEach((snippet) => includes(renderJapaneseView, snippet, `view isolation ${snippet}`));
includes(renderJapaneseView, 'if (panelView !== "jlptMock") resetJapaneseJlptState();', 'leaving JLPT resets level state');
includes(resetJapaneseJlptState, 'selectedJapaneseJlptLevel = null', 'reset clears selected level');
includes(resetJapaneseJlptState, 'button.classList.remove("is-active")', 'reset clears selected visual style');
includes(resetJapaneseJlptState, 'button.setAttribute("aria-pressed", "false")', 'reset clears aria-pressed');
includes(resetJapaneseJlptState, 'japaneseJlptStatus.replaceChildren()', 'reset clears visible status text');
assertRegex(script, /backToJapaneseHomeFromJlptButton[\s\S]*resetJapaneseJlptState\(\)[\s\S]*window\.showJapaneseContentView\("home"\)/, 'back home clears state before returning home');

assertRegex(renderJapaneseJlptPanel, /const isSelected = button\.dataset\.japaneseJlptLevel === selectedJapaneseJlptLevel[\s\S]*classList\.toggle\("is-active", isSelected\)[\s\S]*setAttribute\("aria-pressed", String\(isSelected\)\)/, 'mutually exclusive aria and visual selected state');
includes(renderJapaneseJlptPanel, 'heading.textContent = `已選擇 ${selectedJapaneseJlptLevel}`', 'visible selected-level status synchronized with selected state');
assertRegex(selectJapaneseJlptLevel, /selectedJapaneseJlptLevel = level;[\s\S]*renderJapaneseJlptPanel\(\)/, 'level select updates memory state and rerenders');
['N5', 'N4'].forEach((level) => includes(jlptPanel, `data-japanese-jlpt-level="${level}"`, `JLPT level ${level}`));
['目前缺少足夠的 N5 閱讀題庫', '現有 N4 閱讀資料已盤點，正式 JLPT 題面尚未建立'].forEach((message) => includes(script, message, `required reading status ${message}`));

const jlptRuntime = [resetJapaneseJlptState, renderJapaneseJlptPanel, selectJapaneseJlptLevel].join('\n');
if (/innerHTML/.test(jlptRuntime)) fail('JLPT dynamic runtime functions must not use innerHTML.');
if (/localStorage[\s\S]{0,180}jlpt|jlpt[\s\S]{0,180}localStorage/i.test(script)) fail('JLPT state must not use LocalStorage.');
if (formalFlowPattern.test(jlptRuntime)) fail('JLPT runtime must not implement official quiz flow, draw, scoring, timer, result, or mistake recording.');
if (/(?:N5|N4|JLPT)[\s\S]{0,120}\d+\s*題|\d+\s*題[\s\S]{0,120}(?:N5|N4|JLPT)/.test(jlptPanel + jlptRuntime)) fail('JLPT UI/runtime must not hard-code question counts.');

['japanese_vocabulary_book_v1', 'japanese_mistake_book_v1', 'JAPANESE_VOCABULARY_BOOK_SCHEMA_VERSION = 1', 'JAPANESE_MISTAKE_BOOK_SCHEMA_VERSION = 1'].forEach((snippet) => includes(script, snippet, `existing storage key/schema ${snippet}`));
protectedFiles.forEach((file) => { try { run(`git diff --quiet ${baseCommit} -- ${file}`); } catch { fail(`Protected formal/planning data changed: ${file}`); } });
const baseScript = run(`git show ${baseCommit}:script.js`);
if (extractConstArray(script, 'JAPANESE_LISTENING_QUESTIONS') !== extractConstArray(baseScript, 'JAPANESE_LISTENING_QUESTIONS')) fail('JAPANESE_LISTENING_QUESTIONS differs from PR #280 merge commit.');
if (!html.includes('../script.js?v=3.4')) fail('script.js cache must be v=3.4.');
const styleChanged = run(`git diff --name-only ${baseCommit} -- style.css`).trim() !== '';
if (styleChanged && !html.includes('../style.css?v=3.0')) fail('Modified style.css must use cache v=3.0.');
if (!styleChanged && !html.includes('../style.css?v=2.9')) fail('Unmodified style.css must keep cache v=2.9.');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d3b')) fail('Sentence composition cache must remain v=16d3b.');
['docs/japanese-sentence-composition-batch16d3-final-audit-v2.md', 'docs/japanese-jlpt-batch17a-plan.md'].forEach((file) => { try { run(`git diff --quiet ${baseCommit} -- ${file}`); } catch { fail(`PR #279/#280 planning/audit file modified: ${file}`); } });

if (failures.length) {
  console.error('Batch 17A-2 JLPT entry audit failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log('Batch 17A-2 JLPT entry audit passed.');
