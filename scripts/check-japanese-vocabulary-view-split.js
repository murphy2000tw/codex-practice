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

function requireIncludes(source, snippet, label) {
  if (!source.includes(snippet)) failures.push(`Missing ${label}: ${snippet}`);
}

const vocabulary = extractById(html, 'japaneseMainContent');
const study = extractById(html, 'japaneseVocabularyStudyView');
const quiz = extractById(html, 'quizPanel');

requireIncludes(html, 'id="japaneseVocabularyStudyView"', 'Japanese vocabulary study view wrapper');
requireIncludes(html, 'data-japanese-vocabulary-view="study"', 'study view marker');
requireIncludes(html, 'data-japanese-vocabulary-view="quiz"', 'quiz view marker');
requireIncludes(html, 'id="backToVocabularyStudy"', 'back to vocabulary study button');
requireIncludes(script, 'let japaneseVocabularyView = "study"', 'vocabulary internal view state');
requireIncludes(script, 'function renderJapaneseVocabularyView', 'vocabulary internal view renderer');
requireIncludes(script, 'japaneseVocabularyStudyView.hidden = isQuizView', 'mutual study hiding logic');
requireIncludes(script, 'renderJapaneseVocabularyView(isWordQuizModeValue ? "quiz" : "study")', 'mode-driven vocabulary view render');
requireIncludes(script, 'backToVocabularyStudyButton.addEventListener("click", returnToJapaneseVocabularyStudy)', 'quiz back handler');
requireIncludes(script, 'await switchMode("cards")', 'main vocabulary entry starts in study view');

if (!vocabulary || !study || !quiz) failures.push('Could not extract vocabulary, study, or quiz section.');

['分類篩選', '詞性分類', '程度篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"', 'id="quizModeButton"'].forEach((required) => {
  if (!study.includes(required)) failures.push(`Study view missing required content: ${required}`);
});

['分類篩選', '詞性分類', '程度篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"', '3179'].forEach((forbidden) => {
  if (quiz.includes(forbidden)) failures.push(`Quiz view must not contain study-only content: ${forbidden}`);
});

['測驗題目', '請選出正確的中文意思', 'id="quizContent"', '下一題', '重新開始測驗', '返回單字學習'].forEach((required) => {
  if (!quiz.includes(required)) failures.push(`Quiz view missing required content: ${required}`);
});

const studyIndex = vocabulary.indexOf('id="japaneseVocabularyStudyView"');
const quizIndex = vocabulary.indexOf('id="quizPanel"');
if (studyIndex === -1 || quizIndex === -1 || studyIndex > quizIndex) {
  failures.push('Vocabulary study and quiz views should be sibling sections with study before quiz.');
}
if (study.includes('id="quizPanel"')) {
  failures.push('Quiz panel must not be nested inside the study view.');
}

if (failures.length > 0) {
  console.error('Japanese vocabulary view split audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese vocabulary view split audit passed.');
