#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const questions = JSON.parse(read('japaneseSentenceCompositionQuestions.json'));
const grammar = JSON.parse(read('grammar.json'));
const html = read('japanese/index.html');
const script = read('script.js');
const css = read('style.css');
const failures = [];
const assert = (ok, msg) => { if (!ok) failures.push(msg); };
const run = (cmd) => cp.execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();

assert(run('git merge-base --is-ancestor ca6a1bbb5dbc213006965863e59f18c39553dd98 HEAD; echo $?') === '0', 'HEAD must contain PR #274 merge commit ca6a1bbb5dbc213006965863e59f18c39553dd98');
let baseQuestions = [];
try { baseQuestions = JSON.parse(run('git show ca6a1bbb5dbc213006965863e59f18c39553dd98:japaneseSentenceCompositionQuestions.json')); } catch (e) { failures.push('cannot read PR #274 baseline questions'); }
assert(JSON.stringify(questions.slice(0, 20)) === JSON.stringify(baseQuestions), 'original 20 questions must match PR #274 baseline exactly');

const required = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed','reviewNote'];
const expectedN5 = Array.from({length:12}, (_,i)=>`sc-n5-${String(i+9).padStart(3,'0')}`);
const expectedN4 = Array.from({length:8}, (_,i)=>`sc-n4-${String(i+13).padStart(3,'0')}`);
const expectedNew = new Set([...expectedN5, ...expectedN4]);
const grammarIds = new Set(grammar.map(g => g.id));
const ids = new Set(); const sentences = new Set();
const levels = { N5: 0, N4: 0 }; const allStars = [0,0,0,0]; const allPos = [0,0,0,0]; const newStars = [0,0,0,0]; const newPos = [0,0,0,0];
let dupIds = 0, dupSentences = 0, missing = 0;
const mainGrammar = {};
for (const q of questions) {
  if (ids.has(q.id)) dupIds++; ids.add(q.id);
  if (sentences.has(q.completeSentence)) dupSentences++; sentences.add(q.completeSentence);
  const miss = required.filter(k => !(k in q)); if (miss.length) { missing++; failures.push(`${q.id}: missing ${miss.join(',')}`); }
  assert(Array.isArray(q.chunks) && q.chunks.length === 4, `${q.id}: chunks must be exactly 4`);
  const chunkIds = (q.chunks || []).map(c => c.id);
  assert(new Set(chunkIds).size === 4, `${q.id}: chunk ids must be unique`);
  assert(Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && new Set(q.correctOrder).size === 4 && q.correctOrder.every(id => chunkIds.includes(id)), `${q.id}: correctOrder must exactly match chunk ids`);
  assert(Number.isInteger(q.starSlot) && q.starSlot >= 0 && q.starSlot < 4 && Array.isArray(q.slots) && q.slots.length === 4 && q.slots.filter(s => s === '★').length === 1 && q.slots[q.starSlot] === '★', `${q.id}: starSlot/slots mismatch`);
  const text = Object.fromEntries((q.chunks || []).map(c => [c.id, c.text]));
  assert(q.completeSentence === q.before + (q.correctOrder || []).map(id => text[id]).join('') + q.after, `${q.id}: completeSentence reconstruction mismatch`);
  assert(Array.isArray(q.grammarIds) && q.grammarIds.length > 0 && q.grammarIds.every(id => grammarIds.has(id)), `${q.id}: grammarIds must exist in grammar.json`);
  assert(q.uniqueAnswerReviewed === true, `${q.id}: uniqueAnswerReviewed must be true`);
  assert(typeof q.reviewNote === 'string' && q.reviewNote.trim().length >= 25, `${q.id}: reviewNote missing or too short`);
  if (levels[q.level] !== undefined) levels[q.level]++;
  if (q.starSlot >= 0 && q.starSlot < 4) allStars[q.starSlot]++;
  const pos = (q.chunks || []).findIndex(c => c.id === q.correctOrder?.[q.starSlot]); if (pos >= 0) allPos[pos]++;
  if (expectedNew.has(q.id)) { newStars[q.starSlot]++; if (pos >= 0) newPos[pos]++; const primary = q.grammarIds[0]; mainGrammar[primary] = (mainGrammar[primary] || 0) + 1; }
}
assert(questions.length === 40, `total must be 40, got ${questions.length}`);
assert(levels.N5 === 20, `N5 must be 20, got ${levels.N5}`);
assert(levels.N4 === 20, `N4 must be 20, got ${levels.N4}`);
assert(JSON.stringify(questions.slice(20).map(q => q.id).sort()) === JSON.stringify([...expectedNew].sort()), 'new ID range must be exact');
assert(dupIds === 0, `duplicate ID must be 0, got ${dupIds}`);
assert(dupSentences === 0, `duplicate completeSentence must be 0, got ${dupSentences}`);
assert(missing === 0, `missing required fields must be 0, got ${missing}`);
assert(JSON.stringify(newStars) === '[5,5,5,5]', `new starSlot distribution must be 5 each, got ${newStars}`);
assert(JSON.stringify(newPos) === '[5,5,5,5]', `new correct option positions must be 5 each, got ${newPos}`);
assert(JSON.stringify(allStars) === '[10,10,10,10]', `all starSlot distribution must be 10 each, got ${allStars}`);
assert(JSON.stringify(allPos) === '[10,10,10,10]', `all correct option positions must be 10 each, got ${allPos}`);
assert(Object.values(mainGrammar).every(n => n <= 2), `primary grammar distribution exceeds 2: ${JSON.stringify(mainGrammar)}`);
['n5-grammar-021','n5-grammar-004','n5-grammar-007','n5-grammar-227','n5-grammar-009','n5-grammar-240','n5-grammar-049','n5-grammar-036','n5-grammar-037','n4-grammar-059','n4-grammar-062','n4-grammar-065','n4-grammar-066','n4-grammar-104','n4-grammar-148','n4-grammar-075','n4-grammar-241'].forEach(id => assert(questions.slice(20).some(q => q.grammarIds.includes(id)), `planned grammarId missing: ${id}`));
assert(/japaneseSentenceCompositionQuestions\.json\?v=16d2a/.test(html), 'question cache must be v=16d2a');
assert(/script\.js\?v=3\.3/.test(html), 'script cache must remain v=3.3');
assert(/style\.css\?v=2\.9/.test(html), 'style cache must remain v=2.9');
assert(!run('git diff --name-only -- script.js style.css'), 'script.js and style.css must be unmodified');
assert(!/localStorage\.setItem\([^)]*sentenceComposition/.test(script), 'must not add sentence-composition localStorage key');
['renderJapaneseSentenceCompositionPractice','renderJapaneseSentenceCompositionQuizQuestion','renderJapaneseSentenceCompositionQuizComplete','renderJapaneseMistakeBook'].forEach(name => assert(script.includes(name), `${name} must exist`));

if (failures.length) { console.error('Batch 16D-2A data check failed:'); failures.forEach(f => console.error(`- ${f}`)); process.exit(1); }
console.log('Batch 16D-2A data check passed.');
