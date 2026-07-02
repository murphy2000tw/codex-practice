const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

const failures = [];

const requiredHtml = [
  'id="japaneseContent"',
  'id="japaneseHomeContent"',
  'id="japaneseMainContent" hidden',
  'data-japanese-back-home',
  'window.showJapaneseContentView = (view) =>',
  'japaneseContent.replaceChildren(nextElement)',
  'event.stopImmediatePropagation();',
  '}, { capture: true });',
  '../script.js?v=2.2',
  '../style.css?v=2.2',
];

requiredHtml.forEach((snippet) => {
  if (!html.includes(snippet)) {
    failures.push(`Missing HTML view-isolation guard: ${snippet}`);
  }
});

const requiredScript = [
  'let currentJapaneseView = "home"',
  'function renderJapaneseView(view)',
  'japaneseContent.replaceChildren(nextViewElement)',
  'button.classList.remove("is-active")',
  'button.setAttribute("aria-pressed", "false")',
  'if (!isJapaneseHomeTab()) {',
];

requiredScript.forEach((snippet) => {
  if (!script.includes(snippet)) {
    failures.push(`Missing JS view-isolation guard: ${snippet}`);
  }
});

const entrySection = html.match(/<section class="entry-section japanese-main-entry-section"[\s\S]*?<\/section>/)?.[0] ?? '';
if (entrySection.includes('分類篩選') || entrySection.includes('搜尋單字') || entrySection.includes('單字功能') || entrySection.includes('3179')) {
  failures.push('Home entry section must not contain vocabulary UI text.');
}

const navigableEntries = [...entrySection.matchAll(/data-japanese-entry="([^"]+)"/g)].map((match) => match[1]);
const unexpectedEntries = navigableEntries.filter((entry) => !['vocabulary', 'reading'].includes(entry));
if (unexpectedEntries.length > 0) {
  failures.push(`Unexpected navigable Japanese entries: ${unexpectedEntries.join(', ')}`);
}

if (!entrySection.includes('aria-label="文法準備中"') || !entrySection.includes('aria-label="聽力準備中"')) {
  failures.push('Grammar and listening must remain coming-soon cards, not tabs.');
}

if (failures.length > 0) {
  console.error('Japanese view isolation audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese view isolation audit passed.');
