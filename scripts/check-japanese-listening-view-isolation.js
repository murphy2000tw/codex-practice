const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const failures = [];

function requireSnippet(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

function forbidSnippet(source, snippet, label) {
  if (source.includes(snippet)) failures.push(`Unexpected ${label}: ${snippet}`);
}

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';
  const signatureEnd = source.indexOf(')', markerIndex);
  const braceStart = source.indexOf('{', signatureEnd);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(markerIndex, index + 1);
  }
  return '';
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

const menuHtml = extractById(html, 'japaneseListeningMenuView');
const resetFn = extractFunction(script, 'resetJapaneseListeningState');
const backButtonFn = extractFunction(script, 'createListeningBackMenuButton');
const menuRenderer = extractFunction(script, 'renderJapaneseListeningMenu');
const practiceRenderer = extractFunction(script, 'renderJapaneseListeningPractice');
const quizRenderer = extractFunction(script, 'renderJapaneseListeningQuizQuestion');
const initializer = extractFunction(script, 'initializeListeningPanel');

['播放音訊', '題目卡片', '第 1 題 / 10 題', '請先聽音訊，再選擇中文意思', '今天下雨。', '今日は雨です。', 'きょうは あめです。', '這句日文的意思是什麼？'].forEach((snippet) => {
  forbidSnippet(menuHtml, snippet, `question content in listening menu ${snippet}`);
});

[
  'japaneseListeningView = "menu"',
  'currentJapaneseView = "listeningMenu"',
  'listeningQuizIndex = 0',
  'listeningQuizCorrectCount = 0',
  'listeningQuizAnswered = false',
  'listeningQuizSelectedIndex = null',
  'listeningQuizItems = []',
  'cancelJapaneseListeningSpeech();',
  'japaneseListeningContent.replaceChildren();',
  'japaneseListeningContent.hidden = true'
].forEach((snippet) => requireSnippet(resetFn, snippet, `listening reset cleanup ${snippet}`));

requireSnippet(backButtonFn, 'resetJapaneseListeningState();', 'back-to-menu button clears stale listening state');
requireSnippet(backButtonFn, 'renderJapaneseListeningView("menu")', 'back-to-menu button renders listening menu');
requireSnippet(menuRenderer, 'resetJapaneseListeningState();', 'menu renderer clears stale listening content');
requireSnippet(menuRenderer, 'japaneseListeningMenuView.hidden = false', 'menu renderer shows only listening entries');
requireSnippet(practiceRenderer, 'currentJapaneseView = "listeningPractice"', 'practice renderer uses practice view state');
requireSnippet(practiceRenderer, 'setListeningContentNodes(createListeningBackMenuButton(), title, card, next);', 'practice renderer replaces content nodes');
requireSnippet(quizRenderer, 'currentJapaneseView = "listeningQuiz"', 'quiz renderer uses quiz view state');
requireSnippet(quizRenderer, 'setListeningContentNodes(...nodes);', 'quiz renderer replaces content nodes');
requireSnippet(initializer, 'resetJapaneseListeningState({ resetPracticeIndex: true });', 'entering listening hub starts clean');
requireSnippet(initializer, 'renderJapaneseListeningView("menu");', 'entering listening hub renders menu');

if (failures.length > 0) {
  console.error('Japanese listening view isolation audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese listening view isolation audit passed.');
