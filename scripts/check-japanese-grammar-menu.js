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

const grammarMenu = extractById(html, 'japaneseGrammarMenuView');
const practice = extractById(html, 'japaneseVocabularyStudyView');
const quiz = extractById(html, 'quizPanel');

requireIncludes(html, 'id="japaneseGrammarMenuView"', 'grammar menu view');
requireIncludes(html, 'data-japanese-grammar-entry="practice"', 'grammar practice entry');
requireIncludes(html, 'data-japanese-grammar-entry="quiz"', 'grammar quiz entry');
requireIncludes(script, 'function renderJapaneseGrammarView', 'grammar view renderer');
requireIncludes(script, 'renderJapaneseGrammarView("menu")', 'grammar menu routing');
requireIncludes(script, 'openJapaneseGrammarPractice()', 'grammar practice routing');
requireIncludes(script, 'openJapaneseGrammarQuiz()', 'grammar quiz routing');

['文法練習', '文法測驗'].forEach((required) => {
  if (!grammarMenu.includes(required)) failures.push(`Grammar menu missing required entry: ${required}`);
});
['文法題目', 'quizContent', '下一題', '換一組文法', '文法功能', 'mode-switch'].forEach((forbidden) => {
  if (grammarMenu.includes(forbidden)) failures.push(`Grammar menu must not contain practice/quiz UI: ${forbidden}`);
});
['data-japanese-grammar-entry="quiz"', '文法測驗</h3>', '文法功能', 'mode-switch'].forEach((forbidden) => {
  if (practice.includes(forbidden)) failures.push(`Grammar practice container must not contain quiz entry/switch UI: ${forbidden}`);
});
['data-japanese-grammar-entry="practice"', '文法練習</h3>', '文法功能', 'mode-switch'].forEach((forbidden) => {
  if (quiz.includes(forbidden)) failures.push(`Grammar quiz container must not contain practice entry/switch UI: ${forbidden}`);
});

if (failures.length > 0) {
  console.error('Japanese grammar menu audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese grammar menu audit passed.');
