#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'japaneseSentenceCompositionQuestions.json');
const grammarPath = path.join(root, 'grammar.json');
const vocabPath = path.join(root, 'vocabulary.json');
const errors = [];
const summary = { total: 0, N5: 0, N4: 0, starSlot: [0,0,0,0], answerOptionPosition: [0,0,0,0], grammarIdsUsed: new Set(), duplicateQuestionId: 0, duplicateCompleteSentence: 0, duplicateExplanation: 0, duplicateReviewNote: 0, missing: 0, reconstruction: 0, duplicateChunkId: 0, duplicateChunkText: 0 };
function fail(msg){ errors.push(msg); }
function readJson(file){ try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch(e){ fail(`${path.basename(file)} is not valid JSON: ${e.message}`); return null; } }
const questions = readJson(dataPath);
const grammar = readJson(grammarPath) || [];
const vocab = readJson(vocabPath) || [];
const grammarIds = new Set(Array.isArray(grammar) ? grammar.map(g=>g.id) : []);
if (!Array.isArray(questions)) fail('root must be a JSON array');
if (!Array.isArray(grammar)) fail('grammar.json root must be array');
if (!Array.isArray(vocab)) fail('vocabulary.json root must be array');
const clozeCount = Array.isArray(grammar) ? grammar.filter(g=>g.quiz && g.quiz.clozePrompt).length : 0;
if (grammar.length !== 290 || clozeCount !== 130) fail(`grammar baseline changed: total=${grammar.length}, cloze=${clozeCount}`);
const vocabN5 = Array.isArray(vocab) ? vocab.filter(v=>v.level === 'N5').length : 0;
const vocabN4 = Array.isArray(vocab) ? vocab.filter(v=>v.level === 'N4').length : 0;
if (vocab.length !== 3241 || vocabN5 !== 1021 || vocabN4 !== 2220) fail(`vocabulary baseline changed: total=${vocab.length}, N5=${vocabN5}, N4=${vocabN4}`);
const expectedIds = [...Array.from({length:8},(_,i)=>`sc-n5-${String(i+1).padStart(3,'0')}`), ...Array.from({length:12},(_,i)=>`sc-n4-${String(i+1).padStart(3,'0')}`)];
const idSeen = new Set(); const sentenceSeen = new Set(); const explanationSeen = new Set(); const reviewNoteSeen = new Set();
const unsafe = /<[^>]+>|innerHTML|script|javascript:|\bon[a-z]+\s*=/i;
const fields = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed','reviewNote'];
if (Array.isArray(questions)) {
  summary.total = questions.length;
  if (questions.length !== 20) fail(`question count must be 20, got ${questions.length}`);
  questions.forEach((q, i) => {
    for (const f of fields) if (!(f in q)) { summary.missing++; fail(`${q.id || `#${i}`}: missing ${f}`); }
    if (q.id !== expectedIds[i]) fail(`question order/id mismatch at ${i}: expected ${expectedIds[i]}, got ${q.id}`);
    if (idSeen.has(q.id)) { summary.duplicateQuestionId++; fail(`${q.id}: duplicate id`); } else idSeen.add(q.id);
    if (sentenceSeen.has(q.completeSentence)) { summary.duplicateCompleteSentence++; fail(`${q.id}: duplicate completeSentence`); } else sentenceSeen.add(q.completeSentence);
    if (explanationSeen.has(q.explanation)) { summary.duplicateExplanation++; fail(`${q.id}: duplicate explanation`); } else explanationSeen.add(q.explanation);
    if (reviewNoteSeen.has(q.reviewNote)) { summary.duplicateReviewNote++; fail(`${q.id}: duplicate reviewNote`); } else reviewNoteSeen.add(q.reviewNote);
    if (q.level !== (i < 8 ? 'N5' : 'N4')) fail(`${q.id}: incorrect level ${q.level}`);
    if (q.level === 'N5') summary.N5++; if (q.level === 'N4') summary.N4++;
    for (const [k,v] of Object.entries(q)) if (typeof v === 'string' && unsafe.test(v)) fail(`${q.id}: unsafe string in ${k}`);
    if (!Array.isArray(q.chunks) || q.chunks.length !== 4) fail(`${q.id}: chunks must have four entries`);
    if (!Array.isArray(q.slots) || q.slots.length !== 4) fail(`${q.id}: slots must have four entries`);
    if (!Array.isArray(q.correctOrder) || q.correctOrder.length !== 4) fail(`${q.id}: correctOrder must have four ids`);
    const chunkIds = (q.chunks || []).map(c=>c.id); const chunkTexts = (q.chunks || []).map(c=>c.text);
    if (new Set(chunkIds).size !== 4 || chunkIds.some(id=>!['a','b','c','d'].includes(id))) { summary.duplicateChunkId++; fail(`${q.id}: invalid or duplicate chunk ids`); }
    if (new Set(chunkTexts).size !== 4 || chunkTexts.some(t=>typeof t !== 'string' || !t.trim())) { summary.duplicateChunkText++; fail(`${q.id}: invalid or duplicate chunk text`); }
    if ((q.correctOrder || []).slice().sort().join(',') !== 'a,b,c,d') fail(`${q.id}: correctOrder must contain a,b,c,d once`);
    if (chunkIds.join(',') === (q.correctOrder || []).join(',')) fail(`${q.id}: display chunk order exposes answer`);
    const stars = Array.isArray(q.slots) ? q.slots.filter(s=>s==='★').length : 0;
    if (stars !== 1 || q.slots[q.starSlot] !== '★') fail(`${q.id}: slots/starSlot mismatch`);
    if (![0,1,2,3].includes(q.starSlot)) fail(`${q.id}: invalid starSlot`); else summary.starSlot[q.starSlot]++;
    const byId = Object.fromEntries((q.chunks || []).map(c=>[c.id,c.text]));
    const rebuilt = String(q.before || '') + (q.correctOrder || []).map(id=>byId[id]).join('') + String(q.after || '');
    if (rebuilt !== q.completeSentence) { summary.reconstruction++; fail(`${q.id}: reconstruction mismatch`); }
    const ans = (q.correctOrder || [])[q.starSlot]; const pos = chunkIds.indexOf(ans); if (pos >= 0) summary.answerOptionPosition[pos]++;
    for (const f of ['kana','meaning','explanation','reviewNote']) if (typeof q[f] !== 'string' || !q[f].trim()) fail(`${q.id}: ${f} is blank`);
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 35) fail(`${q.id}: explanation is too short for review quality`);
    if (typeof q.reviewNote !== 'string' || q.reviewNote.trim().length < 45) fail(`${q.id}: reviewNote is too short for uniqueness review quality`);
    if (q.uniqueAnswerReviewed !== true) fail(`${q.id}: uniqueAnswerReviewed must be true`);
    if (!Array.isArray(q.grammarIds) || q.grammarIds.length < 1) fail(`${q.id}: grammarIds required`);
    for (const gid of q.grammarIds || []) { summary.grammarIdsUsed.add(gid); if (!grammarIds.has(gid)) fail(`${q.id}: unknown grammarId ${gid}`); }
  });
}
if (summary.N5 !== 8 || summary.N4 !== 12) fail(`level counts must be N5=8,N4=12 got N5=${summary.N5},N4=${summary.N4}`);
if (summary.starSlot.join(',') !== '5,5,5,5') fail(`starSlot distribution must be 5,5,5,5 got ${summary.starSlot.join(',')}`);
if (summary.answerOptionPosition.join(',') !== '5,5,5,5') fail(`answer option distribution must be 5,5,5,5 got ${summary.answerOptionPosition.join(',')}`);
console.log('Japanese sentence composition Batch 16A-2 data check');
console.log(`total: ${summary.total}`);
console.log(`N5 / N4: ${summary.N5} / ${summary.N4}`);
console.log(`starSlot distribution: ${summary.starSlot.join(', ')}`);
console.log(`answer option position distribution: ${summary.answerOptionPosition.join(', ')}`);
console.log(`grammarIds used: ${summary.grammarIdsUsed.size}`);
console.log(`duplicates: questionId=${summary.duplicateQuestionId}, completeSentence=${summary.duplicateCompleteSentence}, explanation=${summary.duplicateExplanation}, reviewNote=${summary.duplicateReviewNote}, chunkId=${summary.duplicateChunkId}, chunkText=${summary.duplicateChunkText}`);
console.log(`missing: ${summary.missing}`);
console.log(`reconstruction errors: ${summary.reconstruction}`);
if (errors.length) { console.error(`FAIL: ${errors.length} error(s)`); for (const e of errors) console.error(`- ${e}`); process.exit(1); }
console.log('PASS');
