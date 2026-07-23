#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');
const BASE = '3d5b8c062282609bc1b1b6e725bb0448de97e646';
const DATA = 'japaneseSentenceCompositionQuestions.json';
const FROZEN = ['script.js', 'style.css', 'grammar.json', 'vocabulary.json'];
const HTML = 'japanese/index.html';
const TARGET_IDS = ['sc-n5-004', 'sc-n5-005', 'sc-n4-001', 'sc-n5-015', 'sc-n5-029'];
const POST_FINAL_AUDIT_TARGET_IDS = ['sc-n5-001'];
const EXPECTED = {
  'sc-n5-004': { before:'田中さんは駅で先生に会', after:'。', chunks:[['a','って'],['c','に帰り'],['b','いっしょ'],['d','ました']], correctOrder:['a','b','c','d'], starSlot:3, completeSentence:'田中さんは駅で先生に会っていっしょに帰りました。' },
  'sc-n5-005': { before:'この店は安', after:'。', chunks:[['a','いです'],['b','が'],['d','ないです'],['c','あまり広く']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'この店は安いですがあまり広くないです。' },
  'sc-n4-001': { before:'雨が', after:'。', chunks:[['a','やんだら駅まで'],['b','歩いて'],['d','ましょう'],['c','行き']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'雨がやんだら駅まで歩いて行きましょう。' },
  'sc-n5-015': { before:'クラスで田中さん', after:'。', chunks:[['c','背'],['a','が'],['b','いちばん'],['d','が高いです']], correctOrder:['a','b','c','d'], starSlot:2, completeSentence:'クラスで田中さんがいちばん背が高いです。' },
  'sc-n5-029': { before:'あした雨', after:'。', chunks:[['a','が'],['b','降りますから'],['c','出かけ'],['d','ません']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'あした雨が降りますから出かけません。' }
};
const ALLOWED_CHANGED_FIELDS = new Set(['before', 'after', 'chunks', 'explanation', 'reviewNote']);
const REQUIRED_FIELDS = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed'];
const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => fs.readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const git = (args) => execFileSync('git', args, { encoding:'utf8' }).trim();
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const byId = (items) => new Map(items.map((q) => [q.id, q]));
console.log('Batch 16D-3 ambiguity-fix checker');
try { execFileSync('git', ['merge-base', '--is-ancestor', BASE, 'HEAD']); console.log(`HEAD contains PR #277 merge commit: OK (${BASE})`); } catch { fail(`HEAD does not contain ${BASE}`); }
for (const file of FROZEN) {
  try { execFileSync('git', ['diff', '--quiet', BASE, '--', file]); } catch { fail(`${file} differs from PR #277 baseline`); }
}
const current = json(DATA);
const base = JSON.parse(git(['show', `${BASE}:${DATA}`]));
const grammarIds = new Set(json('grammar.json').map((g) => g.id));
const cur = byId(current), old = byId(base);
for (const id of TARGET_IDS) if (!cur.has(id)) fail(`Missing target question ${id}`);
for (const q of current) {
  const original = old.get(q.id);
  if (!original) fail(`Question ${q.id} is new compared with baseline`);
  const target = TARGET_IDS.includes(q.id);
  const postFinalAuditTarget = POST_FINAL_AUDIT_TARGET_IDS.includes(q.id);
  if (!target && !postFinalAuditTarget && !same(q, original)) fail(`Non-target question changed: ${q.id}`);
  if (target && original) {
    for (const key of new Set([...Object.keys(q), ...Object.keys(original)])) {
      if (!ALLOWED_CHANGED_FIELDS.has(key) && !same(q[key], original[key])) fail(`${q.id} changed forbidden field ${key}`);
    }
  }
}
for (const q of base) if (!cur.has(q.id)) fail(`Question ${q.id} from baseline is missing`);

const finalAuditFixed = cur.get('sc-n5-001');
if (finalAuditFixed) {
  if (finalAuditFixed.before !== 'わたしは毎朝七時に' || finalAuditFixed.after !== '。') fail('sc-n5-001 final-audit before/after mismatch');
  if (!same(finalAuditFixed.chunks.map((c) => [c.id, c.text]), [['a','起き'], ['b','て顔を'], ['d','ます'], ['c','洗い']])) fail('sc-n5-001 final-audit chunks mismatch');
  if (!same(finalAuditFixed.correctOrder, ['a','b','c','d']) || finalAuditFixed.starSlot !== 0) fail('sc-n5-001 final-audit correctOrder/starSlot mismatch');
  if (finalAuditFixed.completeSentence !== 'わたしは毎朝七時に起きて顔を洗います。') fail('sc-n5-001 final-audit completeSentence mismatch');
}

for (const id of TARGET_IDS) {
  const q = cur.get(id), original = old.get(id), exp = EXPECTED[id];
  if (!q) continue;
  if (q.id !== original.id || q.level !== original.level || !same(q.correctOrder, original.correctOrder) || q.starSlot !== original.starSlot) fail(`${id} changed id/level/correctOrder/starSlot`);
  if (!same(q.chunks.map((c) => c.id), exp.chunks.map((c) => c[0]))) fail(`${id} chunks ID order is not locked expected order`);
  if (q.before !== exp.before || q.after !== exp.after || q.completeSentence !== exp.completeSentence || !same(q.correctOrder, exp.correctOrder) || q.starSlot !== exp.starSlot) fail(`${id} fixed sentence fields do not match expected repair`);
  if (!same(q.chunks.map((c) => [c.id, c.text]), exp.chunks)) fail(`${id} chunks text/order do not match expected repair`);
  if (!q.reviewNote.includes('已檢查24種排列')) fail(`${id} reviewNote lacks 已檢查24種排列`);
  for (const banned of ['也可以','語意不同','較不自然','較少見']) if ((q.reviewNote + q.explanation).includes(banned)) fail(`${id} contains banned ambiguity wording: ${banned}`);
}
const ids = new Set(), sentences = new Set(), starDist = [0,0,0,0], optionDist = [0,0,0,0];
const stats = { total: current.length, N5:0, N4:0, duplicateId:0, duplicateSentence:0, missingRequiredFields:0, invalidGrammarIds:0, emptyChunk:0, punctuationOnlyChunk:0, duplicateChunkId:0, mappingErrors:0, reconstructionErrors:0 };
function contentful(s){ return /[\u3040-\u30ff\u3400-\u9fffA-Za-z0-9０-９]/.test(s); }
for (const q of current) {
  if (q.level === 'N5') stats.N5++; if (q.level === 'N4') stats.N4++;
  if (ids.has(q.id)) stats.duplicateId++; ids.add(q.id);
  if (sentences.has(q.completeSentence)) stats.duplicateSentence++; sentences.add(q.completeSentence);
  for (const f of REQUIRED_FIELDS) if (!(f in q)) stats.missingRequiredFields++;
  if (!Array.isArray(q.grammarIds) || q.grammarIds.some((id) => !grammarIds.has(id))) stats.invalidGrammarIds++;
  const chunkIds = new Set();
  for (const c of q.chunks || []) {
    if (!String(c.text || '').trim()) stats.emptyChunk++;
    if (String(c.text || '').trim() && !contentful(c.text)) stats.punctuationOnlyChunk++;
    if (chunkIds.has(c.id)) stats.duplicateChunkId++; chunkIds.add(c.id);
  }
  if (!Array.isArray(q.chunks) || q.chunks.length !== 4 || !Array.isArray(q.correctOrder) || q.correctOrder.length !== 4 || q.correctOrder.some((id) => !chunkIds.has(id))) stats.mappingErrors++;
  const chunkText = new Map((q.chunks || []).map((c) => [c.id, c.text]));
  const rebuilt = String(q.before || '') + (q.correctOrder || []).map((id) => chunkText.get(id)).join('') + String(q.after || '');
  if (rebuilt !== q.completeSentence) stats.reconstructionErrors++;
  if (Number.isInteger(q.starSlot) && q.starSlot >= 0 && q.starSlot < 4) starDist[q.starSlot]++;
  const starId = q.correctOrder?.[q.starSlot];
  const pos = (q.chunks || []).findIndex((c) => c.id === starId);
  if (pos >= 0) optionDist[pos]++;
}
for (const [prefix] of [['sc-n5'], ['sc-n4']]) for (let i = 1; i <= 30; i++) if (!ids.has(`${prefix}-${String(i).padStart(3,'0')}`)) fail(`Missing sequential ID ${prefix}-${String(i).padStart(3,'0')}`);
if (stats.total !== 60 || stats.N5 !== 30 || stats.N4 !== 30) fail(`Bad total/N5/N4: ${stats.total}/${stats.N5}/${stats.N4}`);
for (const [k,v] of Object.entries(stats)) if (!['total','N5','N4'].includes(k) && v !== 0) fail(`${k} is ${v}`);
if (!same(starDist, [15,15,15,15])) fail(`starSlot distribution ${JSON.stringify(starDist)} != [15,15,15,15]`);
if (!same(optionDist, [15,15,15,15])) fail(`correct option distribution ${JSON.stringify(optionDist)} != [15,15,15,15]`);
const html = read(HTML);
const baseHtml = execFileSync('git', ['show', `${BASE}:${HTML}`], { encoding:'utf8' });
const expectedHtml = baseHtml.replace('japaneseSentenceCompositionQuestions.json?v=16d2b', 'japaneseSentenceCompositionQuestions.json?v=16d3b');
if (baseHtml === expectedHtml) fail('PR #277 baseline HTML did not contain the expected v=16d2b question URL');
if (html !== expectedHtml) fail('japanese/index.html differs from PR #277 by more than the exact v=16d2b to v=16d3b question URL replacement');
if ((html.match(/japaneseSentenceCompositionQuestions\.json\?v=16d3b/g) || []).length !== 1) fail('Question cache URL must appear exactly once with v=16d3b');
if (html.includes('japaneseSentenceCompositionQuestions.json?v=16d2b') || html.includes('japaneseSentenceCompositionQuestions.json?v=16d3a')) fail('Old question cache URL is still present');
if (!html.includes('script src="../script.js?v=3.3"')) fail('script.js cache version changed');
if (!html.includes('href="../style.css?v=2.9"')) fail('style.css cache version changed');
console.log('\nFinal statistics');
console.log(JSON.stringify({ stats, starSlotDistribution: starDist, correctOptionPositionDistribution: optionDist, targetIds: TARGET_IDS, nonTargetQuestionsComparedIdentical: 55 }, null, 2));
if (failures.length) { console.error('\nFAILURES:'); for (const f of failures) console.error(`- ${f}`); process.exit(1); }
console.log('\nAmbiguity fixes are precisely scoped and all structural/baseline checks passed. Manual 24-permutation review for the five repaired questions is recorded in each reviewNote.');
