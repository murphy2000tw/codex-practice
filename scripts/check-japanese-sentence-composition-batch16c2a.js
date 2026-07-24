const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'japaneseSentenceCompositionQuestions.json'), 'utf8'));
const failures = [];

function fail(message) { failures.push(message); }
function assert(condition, message) { if (!condition) fail(message); }
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
const requiredGrammarEntries = ['practice', 'quiz', 'sentence-composition-practice', 'sentence-composition-quiz'];

assert(mainEntries.length === 5, `Japanese home must have 5 entries, found ${mainEntries.length}`);
assert(grammarEntries.length === 4, `Grammar menu must have 4 entries, found ${grammarEntries.length}`);
assert(JSON.stringify(grammarEntries) === JSON.stringify(requiredGrammarEntries), `Grammar entries must be ${requiredGrammarEntries.join(', ')}`);
assert(!grammarEntries.includes('sentence-composition'), 'Old sentence-composition entry must not remain in grammar menu');
assert(script.includes('title.textContent = "句子重組"'), 'Sentence composition title must be 句子重組');
assert(script.includes('mode.textContent = "練習模式"'), 'Practice mode label must exist');
assert(script.includes('mode.textContent = "測驗模式"'), 'Quiz mode label must exist');
assert(script.includes('return question.correctOrder[question.starSlot];'), 'Practice must use correctOrder[starSlot] for ★ answer');
assert(script.includes('questionLine.append(before, answerSlots, after);'), 'Practice must keep continuous JLPT sentence layout');
assert(script.includes('slot.textContent = isStarSlot ? "（★）" : "（　）";'), 'Practice must render dynamic star slot');
assert(script.includes('description.textContent = "每次測驗固定 5 題"'), 'Quiz setup must describe fixed 5 questions');
assert(script.includes('["N5", `N5：${counts.N5} 題`]') && script.includes('["N4", `N4：${counts.N4} 題`]') && script.includes('["mixed", `混合：${counts.all} 題`]'), 'Quiz setup must include N5, N4, mixed counts');
assert(!script.includes('sentenceCompositionScore') && !script.includes('sentenceCompositionResult') && !script.includes('japanese_mistake_book_v1') || script.indexOf('japanese_mistake_book_v1') < script.indexOf('sentenceCompositionQuestions'), 'Batch 16C-2A must not add sentence composition scoring/result/mistake writes');
assert(!/localStorage\?\.setItem\([^)]*sentenceComposition|localStorage\.setItem\([^)]*sentenceComposition/.test(script), 'Must not add sentence composition localStorage writes');
assert(script.includes('resetJapaneseSentenceCompositionPracticeState') && script.includes('resetJapaneseSentenceCompositionQuizSetupState') && script.includes('if (panelView !== "grammar") resetJapaneseSentenceCompositionState();'), 'Practice/quiz/leave reset flow must exist');
assert(!/innerHTML\s*=/.test(script.slice(script.indexOf('function renderJapaneseSentenceCompositionPractice'), script.indexOf('async function switchMode'))), 'Sentence composition rendering must not assign innerHTML');
assert(script.includes('button.type = "button"') && script.includes('aria-pressed') && script.includes('role", "status"') && css.includes(':focus-visible'), 'Mobile and keyboard accessibility contracts must exist');
const counts = data.reduce((acc, q) => { acc.total += 1; acc[q.level] = (acc[q.level] || 0) + 1; return acc; }, { total: 0 });
assert(counts.total === 60 && counts.N5 === 30 && counts.N4 === 30, `Question baseline must be total=60, N5=30, N4=30; got total=${counts.total}, N5=${counts.N5}, N4=${counts.N4}`);


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
  console.error('Batch 16C-2A sentence composition audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16C-2A sentence composition audit passed.');
