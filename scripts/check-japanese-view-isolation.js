const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

const failures = [];

function requireSnippet(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

function extractById(source, id) {
  const idIndex = source.indexOf(`id="${id}"`);
  if (idIndex === -1) return '';
  const tagStart = source.lastIndexOf('<', idIndex);
  const openTag = source.slice(tagStart).match(/^<([a-z0-9-]+)/i);
  if (!openTag) return '';
  const tag = openTag[1];
  let depth = 0;
  const tagPattern = new RegExp(`<\\/?${tag}(?=[\\s>])[^>]*>`, 'gi');
  tagPattern.lastIndex = tagStart;
  let match;
  while ((match = tagPattern.exec(source))) {
    if (match[0][1] === '/') depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(tagStart, tagPattern.lastIndex);
  }
  return '';
}

requireSnippet(html, 'id="japaneseContent"', 'single Japanese view root');
requireSnippet(html, 'id="japaneseHomeContent"', 'home view wrapper');
requireSnippet(html, 'id="japaneseMainContent" hidden', 'vocabulary view wrapper');
requireSnippet(html, 'id="japaneseReadingPanel"', 'reading view wrapper');
requireSnippet(html, 'id="japaneseReviewPanel"', 'review view wrapper');
requireSnippet(html, 'data-japanese-back-home', 'feature-page back-home button');
requireSnippet(html, 'data-japanese-layout-version="2.3"', 'page version marker');
requireSnippet(html, 'name="japanese-layout-version" content="2.3"', 'meta version marker');
if (!/\.\.\/script\.js\?v=(2\.[89]|3\.0)/.test(html)) failures.push('Missing JS cache-busting version: ../script.js?v=2.8 or v=2.9');
if (!/\.\.\/style\.css\?v=(2\.8|2\.9)/.test(html)) failures.push('Missing CSS cache-busting version: ../style.css?v=2.8 or v=2.9');

requireSnippet(script, 'let currentJapaneseView = "home"', 'current view state');
requireSnippet(script, 'function renderJapaneseView(view)', 'top-level Japanese view renderer');
requireSnippet(script, 'japaneseContent.replaceChildren(nextViewElement)', 'single-root replacement');
requireSnippet(script, 'window.showJapaneseContentView = switchJapaneseTab', 'global page-level view switcher');
requireSnippet(script, 'button.classList.remove("is-active")', 'entry active-state reset');
requireSnippet(script, 'button.setAttribute("aria-pressed", "false")', 'entry pressed-state reset');

const root = extractById(html, 'japaneseContent');
const home = extractById(html, 'japaneseHomeContent');
const vocabulary = extractById(html, 'japaneseMainContent');
const reading = extractById(html, 'japaneseReadingPanel');
const listening = extractById(html, 'japaneseListeningPanel');

if (!root.includes('id="japaneseHomeContent"') || !root.includes('id="japaneseMainContent"') || !root.includes('id="japaneseReadingPanel"') || !root.includes('id="japaneseListeningPanel"') || !root.includes('id="japaneseReviewPanel"')) {
  failures.push('Japanese view root must initially contain home, vocabulary, reading, listening, and review top-level views so the renderer can move exactly one view into the root.');
}

if (!home.includes('日文學習主入口') || !home.includes('日文學習功能') || !home.includes('data-japanese-entry="vocabulary"') || !home.includes('data-japanese-entry="reading"') || !home.includes('data-japanese-entry="grammar"') || !home.includes('data-japanese-entry="listening"')) {
  failures.push('Home view must contain the title and the navigable Japanese learning entry area.');
}

['分類篩選', '搜尋單字', 'id="vocabularyCards"'].forEach((forbidden) => {
  if (home.includes(forbidden)) failures.push(`Home view must not contain vocabulary UI: ${forbidden}`);
});

if (vocabulary.includes('data-japanese-entry=') || vocabulary.includes('日文學習功能') || vocabulary.includes('進入單字') || vocabulary.includes('進入閱讀')) {
  failures.push('Vocabulary view must not contain Japanese home entry cards.');
}

['返回日文首頁', 'data-japanese-back-home', '日文單字', '分類篩選', '搜尋單字', 'id="vocabularyCards"'].forEach((required) => {
  if (!vocabulary.includes(required)) failures.push(`Vocabulary view missing required content: ${required}`);
});

if (reading.includes('data-japanese-entry=') || reading.includes('日文學習功能') || reading.includes('進入單字') || reading.includes('進入閱讀')) {
  failures.push('Reading view must not contain Japanese home entry cards.');
}

['返回日文首頁', 'data-japanese-back-home', '日文閱讀', '閱讀練習', '閱讀測驗', 'data-reading-mode="practice"', 'data-reading-mode="quiz"'].forEach((required) => {
  if (!reading.includes(required)) failures.push(`Reading view missing required content: ${required}`);
});

if (listening.includes('data-japanese-entry=') || listening.includes('日文學習功能') || listening.includes('進入單字') || listening.includes('進入閱讀')) {
  failures.push('Listening view must not contain Japanese home entry cards.');
}

['返回日文首頁', 'data-japanese-back-home', '日文聽力', '聽力練習', '聽力測驗', 'data-listening-mode="practice"', 'data-listening-mode="quiz"'].forEach((required) => {
  if (!listening.includes(required)) failures.push(`Listening view missing required content: ${required}`);
});

const navigableEntries = [...home.matchAll(/data-japanese-entry="([^"]+)"/g)].map((match) => match[1]);
const unexpectedEntries = navigableEntries.filter((entry) => !['vocabulary', 'grammar', 'reading', 'listening', 'reviewMenu'].includes(entry));
if (unexpectedEntries.length > 0) failures.push(`Unexpected navigable Japanese entries: ${unexpectedEntries.join(', ')}`);
if (!home.includes('data-japanese-entry="vocabulary"') || !home.includes('data-japanese-entry="reading"') || !home.includes('data-japanese-entry="grammar"') || !home.includes('data-japanese-entry="listening"') || !home.includes('data-japanese-entry="reviewMenu"')) {
  failures.push('Japanese home must expose vocabulary, reading, grammar, listening, and review menu entries.');
}

const renderBody = script.match(/function renderJapaneseView\(view\) \{[\s\S]*?\n\}/)?.[0] ?? '';
if (!script.includes('initializeReadingPanel();') || !script.includes('function bindReadingModeButtons(') || !script.includes('event.target.closest("[data-reading-mode]")') || !script.includes('function renderJapaneseReadingView(')) {
  failures.push('Reading view render must initialize scoped reading practice / quiz mode handlers.');
}

if (!script.includes('renderJapaneseReviewView') || !script.includes('resetJapaneseReviewPanel') || !script.includes('reviewMenu')) {
  failures.push('Review view render must initialize isolated review menu, vocabulary book, and mistake book views.');
}

if (!script.includes('initializeListeningPanel();') || !script.includes('function bindListeningModeButtons(') || !script.includes('function renderJapaneseListeningView(') || !script.includes('"listeningMenu"') || !script.includes('"listeningPractice"') || !script.includes('"listeningQuiz"')) {
  failures.push('Listening view render must initialize scoped listening menu / practice / quiz handlers.');
}

if (!renderBody.includes('japaneseContent.replaceChildren(nextViewElement)')) {
  failures.push('renderJapaneseView() must replace the full Japanese root, not a lower content container.');
}

if (failures.length > 0) {
  console.error('Japanese view isolation audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese view isolation audit passed.');
