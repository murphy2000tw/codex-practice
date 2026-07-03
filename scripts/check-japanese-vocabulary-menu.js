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
const menu = extractById(html, 'japaneseVocabularyMenuView');
const practice = extractById(html, 'japaneseVocabularyStudyView');
const quiz = extractById(html, 'quizPanel');

requireIncludes(html, 'id="japaneseVocabularyMenuView"', 'Japanese vocabulary menu view wrapper');
requireIncludes(html, 'data-japanese-vocabulary-view="menu"', 'menu view marker');
requireIncludes(html, 'data-japanese-vocabulary-view="practice"', 'practice view marker');
requireIncludes(html, 'data-japanese-vocabulary-view="quiz"', 'quiz view marker');
requireIncludes(html, 'data-japanese-vocabulary-entry="practice"', 'practice entry button');
requireIncludes(html, 'data-japanese-vocabulary-entry="quiz"', 'quiz entry button');
requireIncludes(html, 'id="backToVocabularyMenuFromPractice"', 'practice back to vocabulary menu button');
requireIncludes(html, 'id="backToVocabularyStudy"', 'quiz back to vocabulary menu button');
requireIncludes(script, 'let japaneseVocabularyView = "menu"', 'vocabulary internal menu state');
requireIncludes(script, 'function normalizeJapaneseVocabularyView', 'vocabulary view normalizer');
requireIncludes(script, '["menu", "practice", "quiz"].includes(view)', 'menu/practice/quiz states');
requireIncludes(script, 'renderJapaneseVocabularyView("menu")', 'main vocabulary entry starts in menu view');
requireIncludes(script, 'renderJapaneseVocabularyView(isWordQuizModeValue ? "quiz" : "practice")', 'mode-driven practice/quiz render');
requireIncludes(script, 'backToVocabularyMenuFromPracticeButton.addEventListener("click", returnToJapaneseVocabularyMenu)', 'practice back handler');
requireIncludes(script, 'backToVocabularyStudyButton.addEventListener("click", returnToJapaneseVocabularyMenu)', 'quiz back handler');

if (!vocabulary || !menu || !practice || !quiz) failures.push('Could not extract vocabulary, menu, practice, or quiz section.');

['單字練習', '單字測驗', '可瀏覽單字、搜尋、分類、複習例句', '開始單字測驗，檢查記憶狀況'].forEach((required) => {
  if (!menu.includes(required)) failures.push(`Menu view missing required content: ${required}`);
});

['分類篩選', '詞性分類', '程度篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"', '測驗題目', 'id="quizContent"'].forEach((forbidden) => {
  if (menu.includes(forbidden)) failures.push(`Menu view must not contain practice/quiz content: ${forbidden}`);
});

['返回單字選單', '分類篩選', '詞性分類', '程度篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"'].forEach((required) => {
  if (!practice.includes(required)) failures.push(`Practice view missing required content: ${required}`);
});

['分類篩選', '詞性分類', '程度篩選', '搜尋單字', '單字功能', 'id="vocabularyCards"', '3179'].forEach((forbidden) => {
  if (quiz.includes(forbidden)) failures.push(`Quiz view must not contain practice-only content: ${forbidden}`);
});

['測驗題目', '請選出正確的中文意思', 'id="quizContent"', '下一題', '重新開始測驗', '返回單字選單'].forEach((required) => {
  if (!quiz.includes(required)) failures.push(`Quiz view missing required content: ${required}`);
});

const menuIndex = vocabulary.indexOf('id="japaneseVocabularyMenuView"');
const practiceIndex = vocabulary.indexOf('id="japaneseVocabularyStudyView"');
const quizIndex = vocabulary.indexOf('id="quizPanel"');
if (menuIndex === -1 || practiceIndex === -1 || quizIndex === -1 || !(menuIndex < practiceIndex && practiceIndex < quizIndex)) {
  failures.push('Vocabulary menu, practice, and quiz views should be sibling sections in order.');
}
if (practice.includes('id="quizPanel"') || menu.includes('id="quizPanel"')) {
  failures.push('Quiz panel must not be nested inside the menu or practice view.');
}

if (failures.length > 0) {
  console.error('Japanese vocabulary view split audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese vocabulary view split audit passed.');
