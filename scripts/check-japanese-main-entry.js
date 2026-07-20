const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

const failures = [];

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

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';
  const signatureEnd = source.indexOf(')', markerIndex);
  const braceStart = source.indexOf('{', signatureEnd);
  if (braceStart === -1) return '';
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(markerIndex, index + 1);
  }
  return '';
}

function requireIncludes(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

function requireNotIn(source, snippet, label) {
  if (source.includes(snippet)) failures.push(`Unexpected ${label}: ${snippet}`);
}

function requireEntries(container, expectedEntries, label) {
  const entries = [...container.matchAll(/data-japanese-entry="([^"]+)"/g)].map((match) => match[1]);
  const unexpected = entries.filter((entry) => !expectedEntries.includes(entry));
  const missing = expectedEntries.filter((entry) => !entries.includes(entry));
  if (unexpected.length > 0) failures.push(`${label} has unexpected entries: ${unexpected.join(', ')}`);
  if (missing.length > 0) failures.push(`${label} is missing entries: ${missing.join(', ')}`);
}

const root = extractById(html, 'japaneseContent');
const home = extractById(html, 'japaneseHomeContent');
const entrySection = home.match(/<section class="entry-section japanese-main-entry-section"[\s\S]*?<\/section>/)?.[0] ?? '';
const vocabulary = extractById(html, 'japaneseMainContent');
const reading = extractById(html, 'japaneseReadingPanel');
const listening = extractById(html, 'japaneseListeningPanel');
const renderJapaneseView = extractFunction(script, 'renderJapaneseView');
const switchJapaneseTab = extractFunction(script, 'switchJapaneseTab');
const listeningMenu = extractById(html, 'japaneseListeningMenuView');

requireIncludes(html, 'data-japanese-layout-version="2.3"', 'Japanese layout version marker');
requireIncludes(html, 'name="japanese-layout-version" content="2.3"', 'Japanese layout meta version marker');
if (!/\.\.\/script\.js\?v=(2\.[89]|3\.[012])/.test(html)) failures.push('Missing script cache-busting version: ../script.js?v=2.8 or v=2.9');
if (!/\.\.\/style\.css\?v=(2\.8|2\.9)/.test(html)) failures.push('Missing style cache-busting version: ../style.css?v=2.8 or v=2.9');
requireIncludes(html, 'data-japanese-back-home', 'feature-page return-to-home controls');

if (!root || !home || !vocabulary || !reading || !listening) {
  failures.push('Japanese page must declare home, vocabulary/grammar, reading, and listening top-level views inside japaneseContent.');
}

if (root && (!root.includes('id="japaneseHomeContent"') || !root.includes('id="japaneseMainContent"') || !root.includes('id="japaneseReadingPanel"') || !root.includes('id="japaneseListeningPanel"'))) {
  failures.push('Japanese view root must initially contain every top-level view so runtime navigation can move one clean view into place.');
}

if (!entrySection) {
  failures.push('Japanese main entry section is missing.');
} else {
  ['日文學習主入口', '日文學習功能', '單字', '閱讀', '文法', '聽力', '複習中心', '進入單字', '進入閱讀', '進入文法', '進入聽力', '開始複習'].forEach((required) => {
    if (!home.includes(required)) failures.push(`Japanese home is missing required entry text: ${required}`);
  });
  requireEntries(entrySection, ['vocabulary', 'reading', 'grammar', 'listening', 'reviewMenu'], 'Japanese main entry section');
}

['分類篩選', '詞性分類', '程度篩選', '搜尋單字', 'id="vocabularyCards"', '測驗題目', 'id="quizContent"', '閱讀練習 第', '閱讀測驗完成', '聽力測驗完成', '播放音訊', '第 1 題 / 10 題', '正確答案：'].forEach((forbidden) => {
  requireNotIn(home, forbidden, `home residual practice/quiz content ${forbidden}`);
});

[
  { name: 'Vocabulary/grammar view', source: vocabulary, required: ['返回日文首頁', 'data-japanese-back-home', '日文單字', 'data-japanese-vocabulary-entry="practice"', 'data-japanese-vocabulary-entry="quiz"', 'data-japanese-grammar-entry="practice"', 'data-japanese-grammar-entry="quiz"'] },
  { name: 'Reading view', source: reading, required: ['返回日文首頁', 'data-japanese-back-home', '日文閱讀', 'data-reading-mode="practice"', 'data-reading-mode="quiz"', 'id="readingContent"'] },
  { name: 'Listening view', source: listening, required: ['返回日文首頁', 'data-japanese-back-home', '日文聽力', 'data-listening-mode="practice"', 'data-listening-mode="quiz"', 'id="japaneseListeningContent"'] },
].forEach(({ name, source, required }) => {
  required.forEach((snippet) => requireIncludes(source, snippet, `${name} menu/navigation content`));
  ['data-japanese-entry=', '日文學習功能', '進入單字', '進入閱讀', '進入文法', '進入聽力'].forEach((forbidden) => {
    requireNotIn(source, forbidden, `${name} leaked home entry content`);
  });
});

['播放音訊', '第 1 題 / 10 題', '聽力測驗完成', '正確答案：', '今天下雨。', '今日は雨です。', 'きょうは あめです。'].forEach((forbidden) => {
  requireNotIn(listeningMenu, forbidden, `listening menu residual practice/quiz state ${forbidden}`);
});

[
  'let currentJapaneseView = "home"',
  'function normalizeJapaneseView(view)',
  'function getJapaneseViewElement(view)',
  'window.showJapaneseContentView = switchJapaneseTab',
  'window.showJapaneseContentView(button.dataset.japaneseEntry)',
  'window.showJapaneseContentView("home")',
  'initializeReadingPanel();',
  'initializeListeningPanel();',
  'resetJapaneseListeningState({ resetPracticeIndex: true });',
].forEach((snippet) => requireIncludes(script, snippet, 'current Japanese navigation/state-isolation script behavior'));

if (!renderJapaneseView.includes('japaneseContent.replaceChildren(nextViewElement)')) {
  failures.push('renderJapaneseView() must replace the single Japanese root with the selected top-level view.');
}
if (!renderJapaneseView.includes('japaneseHomeContent.hidden = panelView !== "home"')) {
  failures.push('renderJapaneseView() must hide the home view whenever a feature view is active.');
}
if (!renderJapaneseView.includes('japaneseMainContent.hidden = panelView !== "vocabulary" && panelView !== "grammar"')) {
  failures.push('renderJapaneseView() must show the shared vocabulary/grammar middle page only for vocabulary or grammar.');
}
if (!renderJapaneseView.includes('japaneseReadingPanel.hidden = panelView !== "reading"')) {
  failures.push('renderJapaneseView() must isolate the reading middle page from other modules.');
}
if (!renderJapaneseView.includes('japaneseListeningPanel.hidden = panelView !== "listening"')) {
  failures.push('renderJapaneseView() must isolate the listening middle page from other modules.');
}
if (!renderJapaneseView.includes('button.classList.remove("is-active")') || !renderJapaneseView.includes('button.setAttribute("aria-pressed", "false")')) {
  failures.push('renderJapaneseView() must clear stale home-entry active/pressed state after navigation.');
}

['renderJapaneseVocabularyView("menu")', 'renderJapaneseGrammarView("menu")', 'initializeReadingPanel();', 'initializeListeningPanel();'].forEach((snippet) => {
  requireIncludes(switchJapaneseTab, snippet, 'entry navigation opens a clean middle/menu view');
});

if (html.includes('window.showJapaneseContentView = (view) =>')) {
  failures.push('Japanese page must not keep a second inline view switcher that can query moved view nodes.');
}

if (failures.length > 0) {
  console.error('Japanese main entry audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese main entry audit passed.');
