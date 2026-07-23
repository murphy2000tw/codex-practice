#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');
const BASE = '8b6ee96b03159d23276fbd3196f7448bfa7d5fb9';
const DATA = 'japaneseSentenceCompositionQuestions.json';
const REPORT = 'docs/japanese-sentence-composition-batch16d3-final-audit-v2.md';
const PERMS = 'docs/japanese-sentence-composition-batch16d3-final-permutations.json';
const FROZEN = [DATA, 'script.js', 'style.css', 'japanese/index.html', 'grammar.json', 'vocabulary.json'];
const failures = [];
const fail = (message) => failures.push(message);
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
function permute(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => permute(items.slice(0, index).concat(items.slice(index + 1))).map((rest) => [item, ...rest]));
}
console.log('Batch 16D-3 final audit v2 evidence checker');
console.log('Note: this checker validates data and audit-evidence completeness only; it does not claim to automatically judge Japanese grammar.');
try { execFileSync('git', ['merge-base', '--is-ancestor', BASE, 'HEAD']); console.log(`HEAD contains PR #278 merge commit: OK (${BASE})`); } catch { fail(`HEAD does not contain PR #278 merge commit ${BASE}`); }
for (const file of FROZEN) {
  try { execFileSync('git', ['diff', '--quiet', BASE, '--', file]); } catch { fail(`${file} differs from PR #278 merge commit ${BASE}`); }
}
const questions = json(DATA);
const grammarIds = new Set(json('grammar.json').map((g) => g.id));
const report = read(REPORT);
const evidence = json(PERMS);
const required = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed'];
const ids = new Set();
const sentences = new Set();
const stats = { total: questions.length, N5: 0, N4: 0, duplicateId: 0, duplicateCompleteSentence: 0, invalidGrammarIds: 0, missingFields: 0, emptyChunk: 0, punctuationOnlyChunk: 0, mappingError: 0, reconstructionError: 0 };
const starDist = [0,0,0,0];
const optionDist = [0,0,0,0];
const contentful = (s) => /[\u3040-\u30ff\u3400-\u9fffA-Za-z0-9０-９]/.test(s);
for (const q of questions) {
  if (q.level === 'N5') stats.N5++; if (q.level === 'N4') stats.N4++;
  if (ids.has(q.id)) stats.duplicateId++; ids.add(q.id);
  if (sentences.has(q.completeSentence)) stats.duplicateCompleteSentence++; sentences.add(q.completeSentence);
  for (const field of required) if (!(field in q)) stats.missingFields++;
  if (!Array.isArray(q.grammarIds) || q.grammarIds.some((id) => !grammarIds.has(id))) stats.invalidGrammarIds++;
  const chunkIds = new Set((q.chunks || []).map((c) => c.id));
  for (const c of q.chunks || []) { if (!String(c.text || '').trim()) stats.emptyChunk++; if (String(c.text || '').trim() && !contentful(c.text)) stats.punctuationOnlyChunk++; }
  if (!Array.isArray(q.chunks) || q.chunks.length !== 4 || chunkIds.size !== 4 || !Array.isArray(q.correctOrder) || q.correctOrder.length !== 4 || q.correctOrder.some((id) => !chunkIds.has(id))) stats.mappingError++;
  const textById = new Map((q.chunks || []).map((c) => [c.id, c.text]));
  const rebuilt = String(q.before || '') + (q.correctOrder || []).map((id) => textById.get(id)).join('') + String(q.after || '');
  if (rebuilt !== q.completeSentence) stats.reconstructionError++;
  if (Number.isInteger(q.starSlot) && q.starSlot >= 0 && q.starSlot < 4) starDist[q.starSlot]++;
  const optionIndex = (q.chunks || []).findIndex((c) => c.id === q.correctOrder?.[q.starSlot]);
  if (optionIndex >= 0) optionDist[optionIndex]++;
}
for (const prefix of ['sc-n5', 'sc-n4']) for (let i = 1; i <= 30; i++) if (!ids.has(`${prefix}-${String(i).padStart(3, '0')}`)) fail(`Missing sequential ID ${prefix}-${String(i).padStart(3, '0')}`);
if (stats.total !== 60 || stats.N5 !== 30 || stats.N4 !== 30) fail(`Bad total/N5/N4: ${stats.total}/${stats.N5}/${stats.N4}`);
for (const [key, value] of Object.entries(stats)) if (!['total','N5','N4'].includes(key) && value !== 0) fail(`${key} is ${value}`);
if (!same(starDist, [15,15,15,15])) fail(`starSlot distribution ${JSON.stringify(starDist)} != [15,15,15,15]`);
if (!same(optionDist, [15,15,15,15])) fail(`correct option position distribution ${JSON.stringify(optionDist)} != [15,15,15,15]`);
const html = read('japanese/index.html');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d3a')) fail('Question cache is not v=16d3a');
if (!html.includes('script src="../script.js?v=3.3"')) fail('script.js?v=3.3 cache reference changed');
if (!html.includes('href="../style.css?v=2.9"')) fail('style.css?v=2.9 cache reference changed');
if (!Array.isArray(evidence) || evidence.length !== 60) fail(`permutations JSON item count is ${Array.isArray(evidence) ? evidence.length : 'not an array'}`);
let totalPermutations = 0;
const byId = new Map(questions.map((q) => [q.id, q]));
for (const item of evidence) {
  const q = byId.get(item.id);
  if (!q) { fail(`Evidence contains unknown question ${item.id}`); continue; }
  if (!Array.isArray(item.permutations) || item.permutations.length !== 24) { fail(`${item.id} does not have exactly 24 permutations`); continue; }
  totalPermutations += item.permutations.length;
  const expectedOrders = new Set(permute(q.chunks.map((c) => c.id)).map((order) => order.join('|')));
  const seen = new Set();
  let expectedCount = 0, alternateCount = 0;
  const textById = new Map(q.chunks.map((c) => [c.id, c.text]));
  for (const p of item.permutations) {
    if (!Array.isArray(p.order) || p.order.length !== 4) fail(`${item.id} has malformed order`);
    const key = (p.order || []).join('|');
    if (seen.has(key)) fail(`${item.id} duplicate order ${key}`); seen.add(key);
    if (!expectedOrders.has(key)) fail(`${item.id} has non-4! order ${key}`);
    const rebuilt = q.before + (p.order || []).map((id) => textById.get(id)).join('') + q.after;
    if (rebuilt !== p.sentence) fail(`${item.id} order ${key} sentence reconstruction mismatch`);
    if (!['VALID_EXPECTED','VALID_ALTERNATE','INVALID_GRAMMAR'].includes(p.verdict)) fail(`${item.id} order ${key} has invalid verdict ${p.verdict}`);
    if (!p.reason || String(p.reason).length < 20) fail(`${item.id} order ${key} lacks a concrete reason`);
    if (p.verdict === 'VALID_EXPECTED') expectedCount++;
    if (p.verdict === 'VALID_ALTERNATE') alternateCount++;
  }
  if (seen.size !== 24) fail(`${item.id} unique order count is ${seen.size}`);
  if (expectedCount !== 1) fail(`${item.id} VALID_EXPECTED count is ${expectedCount}`);
  if (alternateCount !== 0) fail(`${item.id} VALID_ALTERNATE count is ${alternateCount}`);
  if (!report.includes(`### ${item.id}`) || !report.includes('最終結論：PASS_UNIQUE')) fail(`Report is missing PASS_UNIQUE section for ${item.id}`);
}
if (totalPermutations !== 1440) fail(`total permutations is ${totalPermutations}`);
console.log('\nFinal statistics');
console.log(JSON.stringify({ stats, starSlotDistribution: starDist, correctOptionPositionDistribution: optionDist, evidenceQuestions: evidence.length, totalPermutations }, null, 2));
if (failures.length) { console.error('\nFAILURES:'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('\nAll structural, baseline, cache, and audit-evidence checks passed. Manual grammar verdicts are recorded in the Markdown report and permutations JSON.');
