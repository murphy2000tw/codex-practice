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
requireSnippet(html, 'data-japanese-back-home', 'feature-page back-home button');
requireSnippet(html, 'data-japanese-layout-version="2.3"', 'page version marker');
requireSnippet(html, 'name="japanese-layout-version" content="2.3"', 'meta version marker');
requireSnippet(html, '../script.js?v=2.3', 'JS cache-busting version');
requireSnippet(html, '../style.css?v=2.3', 'CSS cache-busting version');

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

if (!root.includes('id="japaneseHomeContent"') || !root.includes('id="japaneseMainContent"') || !root.includes('id="japaneseReadingPanel"')) {
  failures.push('Japanese view root must initially contain home, vocabulary, and reading top-level views so the renderer can move exactly one view into the root.');
}

if (!home.includes('日文學習主入口') || !home.includes('日文四大功能') || !home.includes('data-japanese-entry="vocabulary"') || !home.includes('data-japanese-entry="reading"')) {
  failures.push('Home view must contain the title and the navigable four-card entry area.');
}

['分類篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"'].forEach((forbidden) => {
  if (home.includes(forbidden)) failures.push(`Home view must not contain vocabulary UI: ${forbidden}`);
});

if (vocabulary.includes('data-japanese-entry=') || vocabulary.includes('日文四大功能') || vocabulary.includes('進入單字') || vocabulary.includes('進入閱讀')) {
  failures.push('Vocabulary view must not contain Japanese four-entry cards.');
}

['返回日文首頁', 'data-japanese-back-home', '日文單字', '分類篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"'].forEach((required) => {
  if (!vocabulary.includes(required)) failures.push(`Vocabulary view missing required content: ${required}`);
});

if (reading.includes('data-japanese-entry=') || reading.includes('日文四大功能') || reading.includes('進入單字') || reading.includes('進入閱讀')) {
  failures.push('Reading view must not contain Japanese four-entry cards.');
}

['返回日文首頁', 'data-japanese-back-home', '日文閱讀', '閱讀練習', '閱讀測驗'].forEach((required) => {
  if (!reading.includes(required)) failures.push(`Reading view missing required content: ${required}`);
});

const navigableEntries = [...home.matchAll(/data-japanese-entry="([^"]+)"/g)].map((match) => match[1]);
const unexpectedEntries = navigableEntries.filter((entry) => !['vocabulary', 'reading'].includes(entry));
if (unexpectedEntries.length > 0) failures.push(`Unexpected navigable Japanese entries: ${unexpectedEntries.join(', ')}`);
if (!home.includes('aria-label="文法準備中"') || !home.includes('aria-label="聽力準備中"')) {
  failures.push('Grammar and listening must remain coming-soon cards, not tabs.');
}

const renderBody = script.match(/function renderJapaneseView\(view\) \{[\s\S]*?\n\}/)?.[0] ?? '';
if (!renderBody.includes('japaneseContent.replaceChildren(nextViewElement)')) {
  failures.push('renderJapaneseView() must replace the full Japanese root, not a lower content container.');
}

if (failures.length > 0) {
  console.error('Japanese view isolation audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese view isolation audit passed.');
