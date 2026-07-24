const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'japaneseSentenceCompositionQuestions.json'), 'utf8'));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const block = (start, end) => script.slice(script.indexOf(start), end ? script.indexOf(end) : undefined);
const quizRender = block('function renderJapaneseSentenceCompositionQuizQuestion', 'function selectSentenceCompositionQuizChunk');
const resultRender = block('function renderJapaneseSentenceCompositionQuizComplete', 'function openJapaneseSentenceCompositionPractice');
const sentenceBlock = block('function resetJapaneseSentenceCompositionPracticeState', 'async function switchMode');
function extractById(source, id) {
  const markerIndex = source.indexOf(`id="${id}"`);
  if (markerIndex === -1) return '';
  const openStart = source.lastIndexOf('<', markerIndex);
  const tag = source.slice(openStart).match(/^<([a-z0-9-]+)/i)?.[1];
  if (!tag) return '';
  let depth = 0;
  const re = new RegExp(`<\\/?${tag}(?:\\s|>|/)`, 'gi');
  re.lastIndex = openStart;
  let m;
  while ((m = re.exec(source))) {
    depth += source[m.index + 1] === '/' ? -1 : 1;
    if (depth === 0) return source.slice(openStart, re.lastIndex);
  }
  return '';
}
const homeEntries = [...extractById(html, 'japaneseHomeContent').matchAll(/data-japanese-entry="([^"]+)"/g)].map((m) => m[1]);
const grammarEntries = [...extractById(html, 'japaneseGrammarMenuView').matchAll(/data-japanese-grammar-entry="([^"]+)"/g)].map((m) => m[1]);
const counts = data.reduce((acc, q) => { acc.total += 1; acc[q.level] = (acc[q.level] || 0) + 1; return acc; }, { total: 0, N5: 0, N4: 0 });

assert(/\.\.\/script\.js\?v=3\.[23]/.test(html), 'japanese/index.html must explicitly reference script.js?v=3.2 or v3.3');
assert(/\.\.\/style\.css\?v=2\.9/.test(html), 'style.css cache query must remain v2.9');
assert(!/本次 5 題作答完成，測驗結果將於下一階段顯示。/.test(script), 'temporary completion message must be removed');
assert(/if \(sentenceCompositionQuizCompleted\) \{ renderJapaneseSentenceCompositionQuizComplete\(\); return; \}/.test(script) && /sentenceCompositionQuizAnswers\.length === actualQuestionCount/.test(resultRender), 'result page must be gated by completed five-answer state');
assert(/sentenceCompositionQuizQuestions\.length/.test(resultRender) && /sentenceCompositionQuizAnswers/.test(resultRender), 'result must use in-memory quiz questions and answers');
assert(/filter\(\(answer\) => answer\?\.isCorrect === true\)\.length/.test(resultRender), 'correct count must use isCorrect === true');
assert(/const wrongCount = actualQuestionCount - correctCount;/.test(resultRender), 'wrong count must be total minus correct');
assert(/Math\.round\(\(correctCount \/ actualQuestionCount\) \* 100\)/.test(resultRender), 'accuracy must be rounded from actual quiz question count');
assert(/總題數：\$\{actualQuestionCount\} 題/.test(resultRender) && /答對：\$\{correctCount\} 題/.test(resultRender) && /答錯：\$\{wrongCount\} 題/.test(resultRender), 'summary must show total/correct/wrong');
assert(/sentenceCompositionQuizQuestions\.forEach\(\(question, index\)/.test(resultRender) && /sentenceCompositionQuizAnswers\[index\]/.test(resultRender), 'per-question results must follow original quiz order');
assert(/第 \$\{index \+ 1\} 題/.test(resultRender) && /等級：/.test(resultRender) && /本題結果：/.test(resultRender), 'per-question result heading, level and status required');
assert(/使用者答案：\$\{formatSentenceCompositionOption\(question, answer\.selectedChunkId\)\}/.test(resultRender), 'user answer must show option number and text');
assert(/★ 正確答案：\$\{formatSentenceCompositionOption\(question, correctStarChunkId\)\}/.test(resultRender), 'correct star answer must show option number and text');
assert(/return question\.correctOrder\[question\.starSlot\];/.test(script), 'correct star answer must use correctOrder[starSlot]');
assert(/findIndex\(\(chunk\) => chunk\.id === id\)/.test(script), 'option numbers must use original chunks order');
assert(/correctOrder\.map\(\(id\) => getSentenceCompositionChunkById\(question, id\)\?\.text/.test(script), 'correct order must resolve chunk text');
for (const label of ['完整句子：', '假名：', '中文：', '解析：']) assert(resultRender.includes(label), `result must show ${label}`);
assert(!/(completeSentence|kana|meaning|explanation|正確|答對|答錯|正確率|完整正確)/.test(quizRender), 'quiz-taking render must not leak answers or explanations');
assert(/createSentenceCompositionButton\("再測一次", "answer-button", startSentenceCompositionQuizSetup\)/.test(resultRender), 'retry button must restart setup with same selected level');
assert(/sentenceCompositionQuizQuestions = quizQuestions;[\s\S]*currentSentenceCompositionQuizIndex = 0;[\s\S]*currentSentenceCompositionQuizAnswer = null;[\s\S]*sentenceCompositionQuizAnswers = \[\];[\s\S]*sentenceCompositionQuizCompleted = false;[\s\S]*sentenceCompositionQuizLocked = false;/.test(script), 'retry/start must clear previous quiz state');
assert(/createSentenceCompositionButton\("返回文法選單", "secondary-button", returnToJapaneseGrammarMenu\)/.test(resultRender) && /resetJapaneseSentenceCompositionState\(\)/.test(block('function returnToJapaneseGrammarMenu', 'function openJapaneseVocabularyPractice')), 'grammar menu return must reset quiz and result state');
assert(/resetJapaneseSentenceCompositionPracticeState/.test(script) && /resetJapaneseSentenceCompositionQuizState/.test(script), 'practice and quiz result state must be isolated');
assert(/function recordSentenceCompositionQuizMistake/.test(script) || !/recordJapaneseMistake\([\s\S]{0,500}sentenceComposition|sentenceComposition[\s\S]{0,500}recordJapaneseMistake\(/.test(script), 'must not write mistake book before Batch 16C-2B-3');
assert(!/localStorage\.?setItem\([^)]*sentenceComposition|localStorage\.setItem\([^)]*japanese_mistake_book_v1/.test(script), 'must not add sentence composition localStorage writes');
assert(counts.total === 60 && counts.N5 === 30 && counts.N4 === 30, `question data must remain total=60 N5=30 N4=30, got ${JSON.stringify(counts)}`);
assert(homeEntries.length === 5, `Japanese home must keep 5 entries, found ${homeEntries.length}`);
assert(JSON.stringify(grammarEntries) === JSON.stringify(['practice', 'quiz', 'sentence-composition-practice', 'sentence-composition-quiz']), 'grammar menu must keep 4 entries');
assert(!/innerHTML\s*=/.test(sentenceBlock), 'sentence composition must avoid innerHTML');
assert(/button\.type = "button"/.test(script) && /role", "status"/.test(script) && /aria-live/.test(script) && /:focus-visible/.test(css) && /sentence-composition-slot/.test(css) && /env\(safe-area-inset-bottom\)/.test(css), 'mobile and keyboard accessibility contracts must remain');
assert(/slot\.textContent = isStarSlot \? "（★）" : "（　）";/.test(script), 'star slot no-wrap content contract must remain');


const starSlots = [0, 0, 0, 0];
const correctOptionPositions = [0, 0, 0, 0];
for (const question of data) {
  if (Number.isInteger(question.starSlot) && question.starSlot >= 0 && question.starSlot < 4) starSlots[question.starSlot] += 1;
  const correctId = question.correctOrder?.[question.starSlot];
  const optionIndex = (question.chunks || []).findIndex((chunk) => chunk.id === correctId);
  if (optionIndex >= 0) correctOptionPositions[optionIndex] += 1;
}
assert(JSON.stringify(starSlots) === JSON.stringify([15, 15, 15, 15]), `starSlot distribution must be 15 each, got ${starSlots}`);
assert(JSON.stringify(correctOptionPositions) === JSON.stringify([15, 15, 15, 15]), `correct option positions must be 15 each, got ${correctOptionPositions}`);
assert(/japaneseSentenceCompositionQuestions\.json\?v=16d3b/.test(html), 'question data cache query must be v=16d3b');

if (failures.length) {
  console.error('Batch 16C-2B-2 sentence composition results audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16C-2B-2 sentence composition results audit passed.');
