const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const failures = [];

function extractById(source, id) {
  const marker = `id="${id}"`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';
  const openStart = source.lastIndexOf('<', markerIndex);
  const tagMatch = source.slice(openStart).match(/^<([a-z0-9-]+)/i);
  if (!tagMatch) return '';
  const tag = tagMatch[1].toLowerCase();
  let depth = 0;
  const tagPattern = new RegExp(`<\\/?${tag}(?:\\s|>|/)`, 'gi');
  tagPattern.lastIndex = openStart;
  let match;
  while ((match = tagPattern.exec(source))) {
    const isClose = source[match.index + 1] === '/';
    if (isClose) depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(openStart, tagPattern.lastIndex);
  }
  return '';
}

function requireIncludes(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

function requireExcludes(source, snippet, label) {
  if (source.includes(snippet)) failures.push(`Unexpected ${label}: ${snippet}`);
}

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';
  const braceStart = source.indexOf('{', markerIndex);
  if (braceStart === -1) return '';
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(markerIndex, index + 1);
  }
  return '';
}

const home = extractById(html, 'japaneseHomeContent');
const listeningPanel = extractById(html, 'japaneseListeningPanel');
const listeningMenu = extractById(html, 'japaneseListeningMenuView');
const readingMenu = extractById(html, 'japaneseReadingMenuView');
const vocabularyMenu = extractById(html, 'japaneseVocabularyMenuView');
const grammarMenu = extractById(html, 'japaneseGrammarMenuView');
const listeningPracticeRenderer = extractFunction(script, 'renderJapaneseListeningPractice');
const listeningQuizRenderer = extractFunction(script, 'renderJapaneseListeningQuizQuestion');

requireIncludes(home, 'data-japanese-entry="listening"', 'Japanese home listening entry');
requireIncludes(home, '進入聽力', 'Japanese home listening action');
requireIncludes(script, 'window.showJapaneseContentView(button.dataset.japaneseEntry)', 'main entry routing');
requireIncludes(script, 'initializeListeningPanel()', 'listening panel initialization');
requireIncludes(script, 'renderJapaneseListeningView("menu")', 'listening menu routing');
requireIncludes(script, '"listeningMenu"', 'dedicated listening menu view state');
requireIncludes(script, '"listeningPractice"', 'dedicated listening practice view state');
requireIncludes(script, '"listeningQuiz"', 'dedicated listening quiz view state');

requireIncludes(listeningPanel, 'JAPANESE LISTENING', 'listening title eyebrow');
requireIncludes(listeningPanel, '日文聽力', 'listening title');
requireIncludes(listeningPanel, '返回日文首頁', 'listening back home');
requireIncludes(listeningMenu, 'data-listening-mode="practice"', 'listening practice entry');
requireIncludes(listeningMenu, 'data-listening-mode="quiz"', 'listening quiz entry');
[
  '今天下雨。',
  '第 1 題 / 10 題',
  '播放音訊',
  '請先聽音訊，再選擇中文意思',
  '中文選項',
  '今日は雨です。',
  'きょうは あめです。',
  '這句日文的意思是什麼？',
  'options',
  'answerIndex',
].forEach((forbidden) => {
  requireExcludes(listeningMenu, forbidden, `listening menu question content ${forbidden}`);
});

requireIncludes(script, '返回聽力選單', 'listening back menu button');
requireIncludes(script, 'function renderJapaneseListeningPractice', 'listening practice renderer');
requireIncludes(script, 'currentJapaneseView = "listeningPractice"', 'practice view state assignment');
requireIncludes(script, 'if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;', 'practice/quiz hide menu cards');
requireIncludes(script, 'listening-japanese', 'practice Japanese display');
requireIncludes(script, 'listening-kana', 'practice kana display');
requireIncludes(script, 'listening-translation', 'practice translation display');
requireIncludes(script, 'function renderJapaneseListeningQuizQuestion', 'listening quiz renderer');
requireIncludes(script, 'currentJapaneseView = "listeningQuiz"', 'quiz view state assignment');
requireIncludes(script, 'detail.hidden = !listeningQuizAnswered', 'quiz hides answer details before answering');
requireIncludes(script, 'if (listeningQuizAnswered) feedback.textContent', 'quiz reveals feedback after answering');
requireIncludes(script, 'if (japaneseListeningContent) {\n    japaneseListeningContent.replaceChildren();\n    japaneseListeningContent.hidden = true;\n  }', 'menu clears previous practice/quiz content');
['data-listening-mode="practice"', 'data-listening-mode="quiz"', '開始聽力練習', '開始聽力測驗'].forEach((forbidden) => {
  requireExcludes(listeningPracticeRenderer, forbidden, `practice renderer menu entry ${forbidden}`);
  requireExcludes(listeningQuizRenderer, forbidden, `quiz renderer menu entry ${forbidden}`);
});
requireIncludes(script, 'SpeechSynthesisUtterance', 'Web Speech API playback');
requireIncludes(script, 'utterance.lang = "ja-JP"', 'Japanese speech language');
requireIncludes(script, '此裝置可能不支援日文語音播放', 'speech unsupported fallback');

['data-japanese-vocabulary-entry="practice"', 'data-japanese-vocabulary-entry="quiz"'].forEach((required) => requireIncludes(vocabularyMenu, required, `vocabulary menu unaffected ${required}`));
['data-reading-mode="practice"', 'data-reading-mode="quiz"'].forEach((required) => requireIncludes(readingMenu, required, `reading menu unaffected ${required}`));
['data-japanese-grammar-entry="practice"', 'data-japanese-grammar-entry="quiz"'].forEach((required) => requireIncludes(grammarMenu, required, `grammar menu unaffected ${required}`));

const englishIndex = fs.readFileSync(path.join(__dirname, '..', 'english', 'index.html'), 'utf8');
const englishVocabulary = fs.readFileSync(path.join(__dirname, '..', 'english', 'vocabulary', 'index.html'), 'utf8');
requireIncludes(englishIndex, '英文學習', 'English home still present');
requireIncludes(englishVocabulary, 'GEPT', 'English vocabulary still present');

if (failures.length > 0) {
  console.error('Japanese listening menu audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese listening menu audit passed.');
