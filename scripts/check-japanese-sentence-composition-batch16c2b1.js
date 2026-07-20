const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'japaneseSentenceCompositionQuestions.json'), 'utf8'));
const failures = [];
const fail = (message) => failures.push(message);
const assert = (condition, message) => { if (!condition) fail(message); };

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
    depth += isClose ? -1 : 1;
    if (depth === 0) return source.slice(openStart, tagPattern.lastIndex);
  }
  return '';
}

const home = extractById(html, 'japaneseHomeContent');
const grammarMenu = extractById(html, 'japaneseGrammarMenuView');
const mainEntries = [...home.matchAll(/data-japanese-entry="([^"]+)"/g)].map((m) => m[1]);
const grammarEntries = [...grammarMenu.matchAll(/data-japanese-grammar-entry="([^"]+)"/g)].map((m) => m[1]);
const counts = data.reduce((acc, question) => {
  acc.total += 1;
  acc[question.level] = (acc[question.level] || 0) + 1;
  return acc;
}, { total: 0, N5: 0, N4: 0 });
const quizBlock = script.slice(script.indexOf('const SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT'), script.indexOf('function openJapaneseSentenceCompositionPractice'));
const quizQuestionRenderBlock = script.slice(script.indexOf('function renderJapaneseSentenceCompositionQuizQuestion'), script.indexOf('function selectSentenceCompositionQuizChunk'));
const sentenceCompositionBlock = script.slice(script.indexOf('function resetJapaneseSentenceCompositionPracticeState'), script.indexOf('async function switchMode'));

assert(/const SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT = 5;/.test(script), 'quiz must be fixed at 5 questions');
assert(/\.\.\/script\.js\?v=3\.1/.test(html), 'script cache query must be v=3.1');
assert(/function getSentenceCompositionQuizPool\(level\)[\s\S]*level === "N5" \|\| level === "N4"[\s\S]*question\.level === level[\s\S]*sentenceCompositionQuestions\.slice\(\)/.test(script), 'N5/N4/mixed quiz pools must use the correct ranges');
assert(/drawSentenceCompositionQuizQuestions[\s\S]*pool\.slice\(\)[\s\S]*shuffled\.slice\(0, SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT\)/.test(script), 'drawing must copy and slice without mutating the source question array');
assert(!/sentenceCompositionQuestions\.sort\(|sentenceCompositionQuestions\.splice\(|sentenceCompositionQuestions\.push\(|sentenceCompositionQuestions\.pop\(|sentenceCompositionQuestions\.shift\(|sentenceCompositionQuestions\.unshift\(/.test(quizBlock), 'quiz draw must not mutate the original question array');
assert(/sentenceCompositionQuizQuestions = quizQuestions;/.test(script) && /quizQuestions\.length < SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT/.test(script), 'quiz must safely stop when fewer than 5 questions are available');
assert(/progress\.textContent = `第 \$\{currentSentenceCompositionQuizIndex \+ 1\} 題／共 \$\{sentenceCompositionQuizQuestions\.length\} 題`;/.test(script), 'progress must use the actual quiz question length');
assert(/return question\.correctOrder\[question\.starSlot\];/.test(script), 'correct star answer must use correctOrder[starSlot]');
assert(/confirm\.disabled = sentenceCompositionQuizLocked \|\| !currentSentenceCompositionQuizAnswer;/.test(script), 'confirm must be disabled until an answer is selected');
assert(/confirmSentenceCompositionQuizAnswer[\s\S]*sentenceCompositionQuizLocked = true;[\s\S]*sentenceCompositionQuizAnswers\.push/.test(script), 'confirm must lock, record, then advance');
assert(/if \(sentenceCompositionQuizLocked \|\| sentenceCompositionQuizCompleted\) return;/.test(script), 'each quiz question must guard against duplicate records');
assert(/questionId: question\.id[\s\S]*selectedChunkId: currentSentenceCompositionQuizAnswer[\s\S]*correctStarChunkId[\s\S]*isCorrect: currentSentenceCompositionQuizAnswer === correctStarChunkId/.test(script), 'answer records must keep required fields');
assert(!/renderJapaneseSentenceCompositionQuizQuestion[\s\S]*createSentenceCompositionFeedback/.test(script), 'quiz question rendering must not show immediate feedback');
assert(!/(completeSentence|kana|meaning|explanation|正確|答對|答錯|百分比|分數)/.test(quizQuestionRenderBlock), 'quiz process must not leak answers or explanations');
assert(/本次 5 題作答完成，測驗結果將於下一階段顯示。/.test(script), 'fifth question must show only the non-leaking temporary completion message');
assert(!/倒數|timer|countdown|上一題|previousSentenceCompositionQuiz/.test(quizBlock), 'quiz must not add timer or previous-question editing');
assert(!/recordJapaneseMistake\([\s\S]{0,400}sentenceComposition|sentenceComposition[\s\S]{0,400}recordJapaneseMistake\(/.test(script), 'quiz must not write mistake book yet');
assert(!/localStorage\?\.setItem\([^)]*sentenceComposition|localStorage\.setItem\([^)]*sentenceComposition/.test(script), 'quiz must not add sentence composition localStorage keys');
assert(/resetJapaneseSentenceCompositionPracticeState/.test(script) && /resetJapaneseSentenceCompositionQuizState/.test(script) && /sentenceCompositionQuizAnswers = \[\];/.test(script) && /currentSentenceCompositionAnswer = \[\];/.test(script), 'practice and quiz state must be separate and resettable');
assert(mainEntries.length === 5, `Japanese home must keep 5 entries, found ${mainEntries.length}`);
assert(JSON.stringify(grammarEntries) === JSON.stringify(['practice', 'quiz', 'sentence-composition-practice', 'sentence-composition-quiz']), 'grammar menu must keep exactly 4 expected entries');
assert(counts.total === 20 && counts.N5 === 8 && counts.N4 === 12, `question data must remain total=20 N5=8 N4=12, got total=${counts.total} N5=${counts.N5} N4=${counts.N4}`);
assert(!/innerHTML\s*=/.test(sentenceCompositionBlock), 'sentence composition must use safe DOM APIs instead of innerHTML');
assert(/button\.type = "button"/.test(script) && /aria-pressed/.test(script) && /role", "status"/.test(script) && /aria-live/.test(script) && /sentence-composition-slot/.test(css) && /:focus-visible/.test(css) && /env\(safe-area-inset-bottom\)/.test(css), 'mobile and keyboard accessibility contracts must remain');
assert(/slot\.textContent = isStarSlot \? "（★）" : "（　）";/.test(script), 'dynamic star slot rendering must remain');

const idsByLevel = new Map();
for (const question of data) {
  assert(question && question.id, 'every question must have an id');
  const key = question.level || 'unknown';
  if (!idsByLevel.has(key)) idsByLevel.set(key, new Set());
  assert(!idsByLevel.get(key).has(question.id), `duplicate question id in ${key}: ${question.id}`);
  idsByLevel.get(key).add(question.id);
}

if (failures.length) {
  console.error('Batch 16C-2B-1 sentence composition quiz audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16C-2B-1 sentence composition quiz audit passed.');
