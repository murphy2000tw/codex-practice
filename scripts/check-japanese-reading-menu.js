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

const readingPanel = extractById(html, 'japaneseReadingPanel');
const readingMenu = extractById(html, 'japaneseReadingMenuView');
const readingContent = extractById(html, 'readingContent');

requireSnippet(html, 'id="japaneseReadingMenuView"', 'reading menu view');
requireSnippet(html, 'data-japanese-reading-view="menu"', 'menu state marker');
requireSnippet(html, 'data-japanese-reading-view="content"', 'reading content state marker');
requireSnippet(html, 'data-reading-mode="practice"', 'practice entry');
requireSnippet(html, 'data-reading-mode="quiz"', 'quiz entry');
requireSnippet(html, '閱讀練習保留 ruby 輔助；閱讀測驗模式維持不顯示 ruby', 'reading menu description');

if (!readingPanel.includes('返回日文首頁') || !readingPanel.includes('日文閱讀')) {
  failures.push('Reading panel must have home return control and main reading title.');
}
if (!readingMenu.includes('閱讀練習') || !readingMenu.includes('閱讀測驗')) {
  failures.push('Reading menu must expose reading practice and reading quiz cards.');
}
['reading-card', 'reading-question-block', 'quiz-options', 'reading-passage', '測驗題目'].forEach((forbidden) => {
  if (readingMenu.includes(forbidden)) failures.push(`Reading menu must not directly render article/question UI: ${forbidden}`);
});
if (!readingContent.includes('hidden')) failures.push('Reading content container should be hidden while the menu is active.');

[
  'let japaneseReadingView = "menu"',
  'function normalizeJapaneseReadingView(view)',
  '["menu", "practice", "quiz"].includes(view)',
  'function renderJapaneseReadingView(view = japaneseReadingView)',
  'function renderJapaneseReadingMenu()',
  'function renderJapaneseReadingPractice()',
  'function renderJapaneseReadingQuiz()',
  'renderJapaneseReadingView("menu");',
  'function createReadingContentTitle(titleText)',
  'setReadingContentNodes(title, card, next)',
  'setReadingContentNodes(...quizNodes)',
  'setReadingContentNodes(result)',
  'showRuby: true',
  'showRuby: false',
].forEach((snippet) => requireSnippet(script, snippet, 'reading menu script guard'));

if (script.includes('let activeReadingMode = "practice"')) {
  failures.push('Reading should no longer default directly to practice mode.');
}
if (html.includes('class="mode-panel reading-mode-panel"')) {
  failures.push('Reading menu must not use the old tab-like reading mode panel.');
}

if (failures.length > 0) {
  console.error('Japanese reading menu audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese reading menu audit passed.');
