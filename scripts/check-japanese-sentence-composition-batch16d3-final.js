#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');

const BASE = '3d5b8c062282609bc1b1b6e725bb0448de97e646';
const DATA = 'japaneseSentenceCompositionQuestions.json';
const FROZEN = [DATA, 'script.js', 'style.css', 'japanese/index.html', 'grammar.json', 'vocabulary.json'];
const REPORT = 'docs/japanese-sentence-composition-batch16d3-final-audit.md';
const REQUIRED_FUNCTIONS = [
  'renderJapaneseSentenceCompositionPractice','selectSentenceCompositionChunk','submitSentenceCompositionAnswer',
  'createSentenceCompositionFeedback','renderJapaneseSentenceCompositionQuizSetup','startSentenceCompositionQuiz',
  'renderJapaneseSentenceCompositionQuizQuestion','selectSentenceCompositionQuizChunk','confirmSentenceCompositionQuizAnswer',
  'renderJapaneseSentenceCompositionQuizComplete','recordSentenceCompositionQuizMistake',
  'appendSentenceCompositionMistakeFields','findSentenceCompositionById'
];
const REQUIRED_CONTRACTS = [
  'JAPANESE_MISTAKE_BOOK_KEY','questionType: "sentenceComposition"','sentenceComposition: { module: "grammar", keyParts: ["module", "questionType", "itemId"] }',
  'createElement','textContent','replaceChildren','aria-live','role", "status"','keydown','is-selected',
  'sentence-composition-quiz-results','sentence-composition-chunk','sentence-composition-slot'
];
function fail(msg){ failures.push(msg); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function git(args){ return execFileSync('git', args, {encoding:'utf8'}).trim(); }
const failures = [];
console.log('Batch 16D-3 final checker');
try { git(['merge-base','--is-ancestor', BASE, 'HEAD']); console.log(`HEAD contains PR #277 merge commit: OK (${BASE})`); } catch { fail(`HEAD does not contain ${BASE}`); }
for (const p of FROZEN) {
  try {
    execFileSync('git', ['diff', '--quiet', BASE, '--', p]);
  } catch (e) { fail(`Could not compare ${p} with ${BASE}: ${e.message}`); }
}
const questions = readJson(DATA), grammar = readJson('grammar.json');
const grammarIds = new Set(grammar.map(g => g.id));
const ids = new Set(), sentences = new Set(), starDist = [0,0,0,0], optionDist = [0,0,0,0];
let counts = {total: questions.length, N5:0, N4:0, duplicateId:0, duplicateSentence:0, missing:0, invalidGrammarIds:0, invalidChunkTextType:0, emptyChunk:0, punctuationOnlyChunk:0, chunkWithoutJapaneseEnglishNumber:0, wrongChunkCount:0, duplicateChunkId:0, mapping:0, starSlotSlots:0, reconstruction:0, kana:0, meaning:0, explanation:0, uniqueReviewed:0};
const required = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed'];
function hasJapEngNum(s){ return /[\u3040-\u30ff\u3400-\u9fffA-Za-z0-9０-９]/.test(s); }
function zh(s){ return /[\u4e00-\u9fff]/.test(s) && !/[ぁ-んァ-ン]/.test(s); }
for (const q of questions) {
  if (q.level === 'N5') counts.N5++; if (q.level === 'N4') counts.N4++;
  if (ids.has(q.id)) counts.duplicateId++; ids.add(q.id);
  if (sentences.has(q.completeSentence)) counts.duplicateSentence++; sentences.add(q.completeSentence);
  for (const f of required) if (!(f in q)) counts.missing++;
  if (!Array.isArray(q.grammarIds) || q.grammarIds.some(id => !grammarIds.has(id))) counts.invalidGrammarIds++;
  if (!Array.isArray(q.chunks) || q.chunks.length !== 4) counts.wrongChunkCount++;
  const chunkIds = new Set();
  for (const c of q.chunks || []) {
    if (typeof c.text !== 'string') counts.invalidChunkTextType++;
    const t = String(c.text || '');
    if (!t.trim()) counts.emptyChunk++;
    if (t && !hasJapEngNum(t)) counts.punctuationOnlyChunk++;
    if (!hasJapEngNum(t)) counts.chunkWithoutJapaneseEnglishNumber++;
    if (chunkIds.has(c.id)) counts.duplicateChunkId++; chunkIds.add(c.id);
  }
  if (!Array.isArray(q.correctOrder) || q.correctOrder.length !== 4 || q.correctOrder.some(id => !chunkIds.has(id))) counts.mapping++;
  if (!Array.isArray(q.slots) || q.slots.length !== 4 || q.slots.filter(s=>s==='★').length !== 1 || q.slots[q.starSlot] !== '★') counts.starSlotSlots++;
  const byId = new Map((q.chunks||[]).map(c=>[c.id,c.text]));
  const rebuilt = String(q.before||'') + (q.correctOrder||[]).map(id=>byId.get(id)).join('') + String(q.after||'');
  if (rebuilt !== q.completeSentence) counts.reconstruction++;
  if (!String(q.kana||'').trim() || /\s/.test(q.kana) || !/[ぁ-ん]/.test(q.kana)) counts.kana++;
  if (!String(q.meaning||'').trim() || !zh(q.meaning)) counts.meaning++;
  if (!String(q.explanation||'').trim() || String(q.explanation).length < 20) counts.explanation++;
  if (q.uniqueAnswerReviewed !== true) counts.uniqueReviewed++;
  if (Number.isInteger(q.starSlot) && q.starSlot >=0 && q.starSlot <4) starDist[q.starSlot]++;
  const starId = q.correctOrder?.[q.starSlot];
  const pos = (q.chunks||[]).findIndex(c=>c.id===starId);
  if (pos >= 0) optionDist[pos]++;
}
for (const [level, prefix] of [['N5','sc-n5'],['N4','sc-n4']]) for (let i=1;i<=30;i++) if (!ids.has(`${prefix}-${String(i).padStart(3,'0')}`)) fail(`Missing ID ${prefix}-${String(i).padStart(3,'0')}`);
if (counts.total !== 60 || counts.N5 !== 30 || counts.N4 !== 30) fail(`Bad counts total/N5/N4: ${counts.total}/${counts.N5}/${counts.N4}`);
for (const [k,v] of Object.entries(counts)) if (!['total','N5','N4'].includes(k) && v !== 0) fail(`${k} count is ${v}`);
if (JSON.stringify(starDist) !== '[15,15,15,15]') fail(`starSlot distribution ${JSON.stringify(starDist)} != [15,15,15,15]`);
if (JSON.stringify(optionDist) !== '[15,15,15,15]') fail(`star correct option distribution ${JSON.stringify(optionDist)} != [15,15,15,15]`);
const html = fs.readFileSync('japanese/index.html','utf8'), js = fs.readFileSync('script.js','utf8'), css = fs.readFileSync('style.css','utf8');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d2b')) fail('Question cache version is not v=16d2b');
if (!html.includes('script src="../script.js?v=3.3"')) fail('script.js cache version is not v=3.3');
if (!html.includes('href="../style.css?v=2.9"')) fail('style.css cache version is not v=2.9');
for (const f of REQUIRED_FUNCTIONS) if (!js.includes(`function ${f}`)) fail(`Missing function ${f}`);
for (const s of REQUIRED_CONTRACTS) if (!(js+html+css).includes(s)) fail(`Missing contract marker ${s}`);
if (/sentenceComposition[\s\S]{0,120}\.innerHTML\s*=/.test(js)) fail('Unsafe sentence composition innerHTML assignment found in script.js');
const report = fs.existsSync(REPORT) ? fs.readFileSync(REPORT,'utf8') : '';
for (const id of ids) {
  const n = (report.match(new RegExp(`\\| ${id} \\|`, 'g')) || []).length;
  if (n !== 1) fail(`Report row count for ${id} is ${n}`);
}
if ((report.match(/\| sc-n[45]-\d{3} \|/g) || []).length !== 60) fail('Report does not contain exactly 60 audit rows');
for (const bad of ['FAIL','AMBIGUOUS','疑似多重正解','未完成','TODO']) if (report.includes(bad)) fail(`Report contains disallowed marker: ${bad}`);
for (const id of ids) {
  const row = report.split('\n').find(line => line.startsWith(`| ${id} |`)) || '';
  if (!row.includes('24/24') || !row.includes('PASS_UNIQUE')) fail(`Report row for ${id} lacks 24/24 PASS_UNIQUE`);
}
console.log('\nFinal statistics');
console.log(JSON.stringify({counts, starSlotDistribution: starDist, starCorrectOptionPositionDistribution: optionDist}, null, 2));
if (failures.length) { console.error('\nFAILURES:'); failures.forEach(f=>console.error(`- ${f}`)); process.exit(1); }
console.log('\nAll automated structural, baseline, contract, and report-completeness checks passed. Manual Japanese judgement is recorded in the audit report, not inferred by this script.');
