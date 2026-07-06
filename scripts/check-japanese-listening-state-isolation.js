const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const failures = [];

function requireSnippet(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

function requireNotIn(source, snippet, label) {
  if (source.includes(snippet)) failures.push(`Unexpected ${label}: ${snippet}`);
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
const viewRenderer = extractFunction(script, 'renderJapaneseListeningView');
const practiceRenderer = extractFunction(script, 'renderJapaneseListeningPractice');
const quizRenderer = extractFunction(script, 'renderJapaneseListeningQuizQuestion');
const initializer = extractFunction(script, 'initializeListeningPanel');

['播放音訊', '第 1 題 / 10 題', '請先聽音訊，再選擇中文意思', '今天下雨。', '今日は雨です。', 'きょうは あめです。', '這句日文的意思是什麼？'].forEach((forbidden) => {
  requireNotIn(menuHtml, forbidden, `listening menu residual question content ${forbidden}`);
});

['japaneseListeningView = "menu"', 'listeningQuizIndex = 0', 'listeningQuizCorrectCount = 0', 'listeningQuizAnswered = false', 'listeningQuizSelectedIndex = null', 'window.speechSynthesis.cancel()', 'japaneseListeningContent.replaceChildren()', 'japaneseListeningContent.hidden = true'].forEach((required) => {
  requireSnippet(resetFn, required, `listening reset clears state ${required}`);
});

requireSnippet(backButtonFn, 'resetJapaneseListeningState();', 'back to listening menu resets listening state');
requireSnippet(backButtonFn, 'renderJapaneseListeningView("menu")', 'back to listening menu renders menu after reset');
requireSnippet(menuRenderer, 'resetJapaneseListeningState();', 'menu renderer clears previous practice or quiz DOM');
requireSnippet(initializer, 'resetJapaneseListeningState({ resetPracticeIndex: true });', 'entering listening from home starts from clean state');
requireSnippet(script, 'if (["listening", "listeningMenu", "listeningPractice", "listeningQuiz"].includes(currentJapaneseView) && typeof resetJapaneseListeningState === "function")', 'back home detects listening views');
requireSnippet(script, 'window.showJapaneseContentView("home")', 'back home still navigates home');

requireSnippet(viewRenderer, 'if (japaneseListeningView === "menu") return renderJapaneseListeningMenu();', 'menu render is mutually exclusive');
requireSnippet(viewRenderer, 'if (japaneseListeningView === "practice") return renderJapaneseListeningPractice();', 'practice render is mutually exclusive');
requireSnippet(viewRenderer, 'if (japaneseListeningView === "quiz") return startJapaneseListeningQuiz();', 'quiz render is mutually exclusive');
requireSnippet(practiceRenderer, 'setListeningContentNodes(createListeningBackMenuButton(), title, card, next);', 'practice replaces content with practice-only nodes');
requireSnippet(quizRenderer, 'setListeningContentNodes(...nodes);', 'quiz replaces content with quiz-only nodes');

if (failures.length > 0) {
  console.error('Japanese listening state isolation audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese listening state isolation audit passed.');
