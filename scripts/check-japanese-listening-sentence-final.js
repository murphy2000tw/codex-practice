const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const failures = [];

function fail(message) { failures.push(message); }
function requireIncludes(source, snippet, label) { if (!source.includes(snippet)) fail(`Missing ${label}: ${snippet}`); }
function requireExcludes(source, snippet, label) { if (source.includes(snippet)) fail(`Unexpected ${label}: ${snippet}`); }

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
  const markerIndex = source.indexOf(`id="${id}"`);
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
    if (source[match.index + 1] === '/') depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(openStart, tagPattern.lastIndex);
  }
  return '';
}

function extractConstArray(source, name) {
  const marker = `const ${name} = [`;
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const arrayStart = source.indexOf('[', start);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
    } else if (char === '[') depth += 1;
    else if (char === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(arrayStart, index + 1);
    }
  }
  return null;
}

function extractConstNumber(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\d+)\\s*;`));
  return match ? Number(match[1]) : null;
}

const arraySource = extractConstArray(script, 'JAPANESE_LISTENING_QUESTIONS');
let questions = [];
if (!arraySource) fail('JAPANESE_LISTENING_QUESTIONS constant does not exist.');
else {
  try { questions = vm.runInNewContext(arraySource); }
  catch (error) { fail(`JAPANESE_LISTENING_QUESTIONS could not be parsed: ${error.message}`); }
}

if (questions.length !== 30) fail(`JAPANESE_LISTENING_QUESTIONS should contain exactly 30 questions, found ${questions.length}.`);
const quizSize = extractConstNumber(script, 'LISTENING_QUIZ_SIZE');
if (quizSize !== 10) fail(`LISTENING_QUIZ_SIZE should be 10, found ${quizSize}.`);

const requiredFields = ['id', 'level', 'category', 'japanese', 'kana', 'zh', 'question', 'options', 'answerIndex'];
const ids = new Set();
const japaneseSentences = new Set();
questions.forEach((question, index) => {
  requiredFields.forEach((field) => {
    if (question[field] === undefined || question[field] === null || question[field] === '') fail(`Question ${index + 1} has invalid ${field}.`);
  });
  if (ids.has(question.id)) fail(`Question ${index + 1} has duplicate id ${question.id}.`);
  ids.add(question.id);
  if (!/^jl-\d{3}$/.test(question.id)) fail(`Question ${index + 1} id should match jl-xxx: ${question.id}.`);
  if (!['N5', 'N4'].includes(question.level)) fail(`Question ${index + 1} level should be N5 or N4.`);
  if (question.question !== '這句日文的意思是什麼？') fail(`Question ${index + 1} question should be 這句日文的意思是什麼？`);
  if (japaneseSentences.has(question.japanese)) fail(`Question ${index + 1} has duplicate Japanese sentence.`);
  japaneseSentences.add(question.japanese);
  if (!Array.isArray(question.options)) fail(`Question ${index + 1} options is not an array.`);
  else {
    if (question.options.length !== 4) fail(`Question ${index + 1} should have 4 options, found ${question.options.length}.`);
    question.options.forEach((option, optionIndex) => { if (!option) fail(`Question ${index + 1} option ${optionIndex + 1} is empty.`); });
  }
  if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex > 3) fail(`Question ${index + 1} answerIndex is invalid.`);
  if (question.options && question.options[question.answerIndex] !== question.zh) fail(`Question ${index + 1} correct option does not match zh.`);
});

const listeningMenu = extractById(html, 'japaneseListeningMenuView');
const practiceRenderer = extractFunction(script, 'renderJapaneseListeningPractice');
const quizStarter = extractFunction(script, 'startJapaneseListeningQuiz');
const quizRenderer = extractFunction(script, 'renderJapaneseListeningQuizQuestion');
const resultRenderer = extractFunction(script, 'renderJapaneseListeningQuizResults');
const resetFn = extractFunction(script, 'resetJapaneseListeningState');
const viewRenderer = extractFunction(script, 'renderJapaneseListeningView');
const backButtonFn = extractFunction(script, 'createListeningBackMenuButton');
const setContentFn = extractFunction(script, 'setListeningContentNodes');
const speechCancelFn = extractFunction(script, 'cancelJapaneseListeningSpeech');
const createQuizItemsFn = extractFunction(script, 'createListeningQuizItems');

requireIncludes(listeningMenu, 'data-listening-mode="practice"', 'listening practice entry');
requireIncludes(listeningMenu, 'data-listening-mode="quiz"', 'listening quiz entry');
['今日は雨です。', 'きょうは あめです。', '今天下雨。', '播放音訊', '第 1 題 / 10 題', '這句日文的意思是什麼？'].forEach((snippet) => {
  requireExcludes(listeningMenu, snippet, `listening menu direct question content ${snippet}`);
});

requireIncludes(script, 'const LISTENING_QUIZ_SIZE = 10;', 'quiz size constant');
requireIncludes(script, 'let listeningQuizItems = [];', 'quiz item state');
requireIncludes(createQuizItemsFn, 'shuffleItems(JAPANESE_LISTENING_QUESTIONS)', 'quiz item source shuffles full bank');
requireIncludes(createQuizItemsFn, 'Math.min(LISTENING_QUIZ_SIZE, JAPANESE_LISTENING_QUESTIONS.length)', 'quiz item size guard');
requireIncludes(quizStarter, 'listeningQuizItems = createListeningQuizItems();', 'quiz start draws fresh items');
requireIncludes(resultRenderer, 'const total = listeningQuizItems.length', 'quiz result total uses drawn quiz length');
requireIncludes(quizRenderer, 'const item = listeningQuizItems[listeningQuizIndex]', 'quiz question source uses drawn items');
requireIncludes(quizRenderer, 'listeningQuizItems.length', 'quiz progress and final navigation use drawn quiz length');
requireIncludes(resetFn, 'listeningQuizItems = [];', 'reset clears quiz item state');
requireIncludes(backButtonFn, 'resetJapaneseListeningState();', 'back to listening menu resets state');
requireIncludes(resetFn, 'cancelJapaneseListeningSpeech();', 'reset cancels speech synthesis');
requireIncludes(setContentFn, 'cancelJapaneseListeningSpeech();', 'view changes cancel speech synthesis');
requireIncludes(speechCancelFn, 'window.speechSynthesis.cancel()', 'speech cancel helper calls speechSynthesis.cancel');

requireIncludes(practiceRenderer, 'textContent: "聽力練習"', 'practice title');
requireIncludes(practiceRenderer, 'createListeningPlayButton(item, status)', 'practice playback button');
requireIncludes(practiceRenderer, 'listening-japanese', 'practice Japanese sentence');
requireIncludes(practiceRenderer, 'listening-kana', 'practice kana');
requireIncludes(practiceRenderer, 'listening-translation', 'practice Chinese meaning');
requireIncludes(practiceRenderer, '(currentListeningIndex + 1) % JAPANESE_LISTENING_QUESTIONS.length', 'practice cycles through all questions');

requireIncludes(viewRenderer, 'startJapaneseListeningQuiz()', 'quiz entry starts fresh');
requireIncludes(quizRenderer, 'textContent: "聽力測驗"', 'quiz title');
requireIncludes(quizRenderer, 'detail.hidden = !listeningQuizAnswered', 'quiz hides answer details before answer');
requireIncludes(quizRenderer, 'disabled: listeningQuizAnswered', 'quiz locks options after answer');
requireIncludes(quizRenderer, 'if (listeningQuizAnswered) {', 'quiz gates answer styling and next button');
requireIncludes(quizRenderer, 'button.classList.toggle("is-correct"', 'quiz correct styling after answer');
requireIncludes(quizRenderer, 'button.classList.toggle("is-wrong"', 'quiz wrong styling after answer');
requireIncludes(quizRenderer, '查看結果', 'quiz final result button');
requireIncludes(resultRenderer, '聽力測驗完成', 'result heading');
requireIncludes(resultRenderer, '總答題數', 'result total count');
requireIncludes(resultRenderer, '答對題數', 'result correct count');
requireIncludes(resultRenderer, '正確率', 'result accuracy');
requireIncludes(resultRenderer, '重新開始測驗', 'result restart button');
requireIncludes(resultRenderer, 'restart.addEventListener("click", startJapaneseListeningQuiz)', 'restart redraws fresh quiz items');

if (failures.length > 0) {
  console.error('Japanese listening sentence final audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese listening sentence final audit passed.');
