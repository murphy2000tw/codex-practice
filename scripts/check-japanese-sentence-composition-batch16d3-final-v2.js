#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');
const BASE = '8b6ee96b03159d23276fbd3196f7448bfa7d5fb9';
const DATA = 'japaneseSentenceCompositionQuestions.json';
const REPORT = 'docs/japanese-sentence-composition-batch16d3-final-audit-v2.md';
const PERMS = 'docs/japanese-sentence-composition-batch16d3-final-permutations.json';
const FROZEN = ['script.js', 'style.css', 'grammar.json', 'vocabulary.json'];
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
const baseQuestions = JSON.parse(git(['show', `${BASE}:${DATA}`]));
const baseById = new Map(baseQuestions.map((q) => [q.id, q]));
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

const allowedDataDiffIds = new Set(['sc-n5-001', 'sc-n4-006']);
for (const q of questions) {
  const base = baseById.get(q.id);
  if (!base) fail(`Question ${q.id} is new compared with PR #278`);
  if (!allowedDataDiffIds.has(q.id) && !same(q, base)) fail(`Non-target question changed compared with PR #278: ${q.id}`);
}
for (const base of baseQuestions) if (!questions.some((q) => q.id === base.id)) fail(`Question ${base.id} from PR #278 is missing`);
const fixedN5 = questions.find((q) => q.id === 'sc-n5-001');
if (fixedN5) {
  if (fixedN5.level !== 'N5') fail('sc-n5-001 level changed unexpectedly');
  if (!same(fixedN5.correctOrder, ['a','b','c','d']) || fixedN5.starSlot !== 0) fail('sc-n5-001 correctOrder/starSlot changed unexpectedly');
  if (fixedN5.before !== 'わたしは毎朝七時に' || fixedN5.after !== '。') fail('sc-n5-001 before/after not fixed as required');
  if (!same(fixedN5.chunks.map((c) => [c.id, c.text]), [['a','起き'], ['b','て顔を'], ['d','ます'], ['c','洗い']])) fail('sc-n5-001 chunks do not match required split and ID order');
  if (fixedN5.completeSentence !== 'わたしは毎朝七時に起きて顔を洗います。') fail('sc-n5-001 completeSentence changed unexpectedly');
}
const fixedN4 = questions.find((q) => q.id === 'sc-n4-006');
if (fixedN4) {
  if (fixedN4.level !== 'N4') fail('sc-n4-006 level changed unexpectedly');
  if (!same(fixedN4.correctOrder, ['a','b','c','d']) || fixedN4.starSlot !== 1) fail('sc-n4-006 correctOrder/starSlot changed unexpectedly');
  if (fixedN4.before !== '明日は朝早く' || fixedN4.after !== '。') fail('sc-n4-006 before/after not fixed as required');
  if (!same(fixedN4.chunks.map((c) => [c.id, c.text]), [['a','起きて'], ['b','空港へ行く'], ['d','です'], ['c','予定']])) fail('sc-n4-006 chunks do not match required split and ID order');
  if (fixedN4.completeSentence !== '明日は朝早く起きて空港へ行く予定です。') fail('sc-n4-006 completeSentence changed unexpectedly');
}

for (const prefix of ['sc-n5', 'sc-n4']) for (let i = 1; i <= 30; i++) if (!ids.has(`${prefix}-${String(i).padStart(3, '0')}`)) fail(`Missing sequential ID ${prefix}-${String(i).padStart(3, '0')}`);
if (stats.total !== 60 || stats.N5 !== 30 || stats.N4 !== 30) fail(`Bad total/N5/N4: ${stats.total}/${stats.N5}/${stats.N4}`);
for (const [key, value] of Object.entries(stats)) if (!['total','N5','N4'].includes(key) && value !== 0) fail(`${key} is ${value}`);
if (!same(starDist, [15,15,15,15])) fail(`starSlot distribution ${JSON.stringify(starDist)} != [15,15,15,15]`);
if (!same(optionDist, [15,15,15,15])) fail(`correct option position distribution ${JSON.stringify(optionDist)} != [15,15,15,15]`);
const html = read('japanese/index.html');
if (!html.includes('japaneseSentenceCompositionQuestions.json?v=16d3b')) fail('Question cache is not v=16d3b');
if (html.includes('japaneseSentenceCompositionQuestions.json?v=16d3a')) fail('Old question cache v=16d3a is still present');
const baseHtml = execFileSync('git', ['show', `${BASE}:japanese/index.html`], { encoding: 'utf8' });
const expectedHtml = baseHtml.replace('japaneseSentenceCompositionQuestions.json?v=16d3a', 'japaneseSentenceCompositionQuestions.json?v=16d3b');
if (html !== expectedHtml) fail('japanese/index.html differs from PR #278 by more than the exact v=16d3a to v=16d3b cache update');
if (!html.includes('script src="../script.js?v=3.3"')) fail('script.js?v=3.3 cache reference changed');
if (!html.includes('href="../style.css?v=2.9"')) fail('style.css?v=2.9 cache reference changed');
if (!Array.isArray(evidence)) fail('permutations JSON root is not an array');
if (Array.isArray(evidence) && evidence.length !== 60) fail(`permutations JSON item count is ${evidence.length}`);
const byId = new Map(questions.map((q) => [q.id, q]));
const questionIdSet = new Set(questions.map((q) => q.id));
const evidenceIds = new Set();
const duplicateEvidenceIds = new Set();
for (const item of Array.isArray(evidence) ? evidence : []) {
  if (evidenceIds.has(item.id)) duplicateEvidenceIds.add(item.id);
  evidenceIds.add(item.id);
}
for (const id of duplicateEvidenceIds) fail(`Evidence contains duplicate question ID ${id}`);
for (const id of questionIdSet) if (!evidenceIds.has(id)) fail(`Evidence is missing question ID ${id}`);
for (const id of evidenceIds) if (!questionIdSet.has(id)) fail(`Evidence contains unknown question ID ${id}`);
if (evidenceIds.size !== questionIdSet.size) fail(`Evidence ID set size ${evidenceIds.size} does not match question ID set size ${questionIdSet.size}`);

function parseReportSections(markdown) {
  const matches = [...markdown.matchAll(/^### (sc-n[45]-\d{3})\s*$/gm)];
  const sections = new Map();
  const duplicates = new Set();
  for (let i = 0; i < matches.length; i++) {
    const id = matches[i][1];
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    if (sections.has(id)) duplicates.add(id);
    sections.set(id, markdown.slice(start, end));
  }
  return { sections, duplicates, count: matches.length };
}
const reportSections = parseReportSections(report);
if (reportSections.count !== 60) fail(`Report question section count is ${reportSections.count}`);
for (const id of reportSections.duplicates) fail(`Report contains duplicate question section ${id}`);
for (const id of questionIdSet) if (!reportSections.sections.has(id)) fail(`Report is missing question section ${id}`);
for (const id of reportSections.sections.keys()) if (!questionIdSet.has(id)) fail(`Report contains unknown question section ${id}`);

let totalPermutations = 0;
for (const item of Array.isArray(evidence) ? evidence : []) {
  const q = byId.get(item.id);
  if (!q) continue;
  if (!Array.isArray(item.permutations) || item.permutations.length !== 24) { fail(`${item.id} does not have exactly 24 permutations`); continue; }
  totalPermutations += item.permutations.length;
  const expectedOrders = new Set(permute(q.chunks.map((c) => c.id)).map((order) => order.join('|')));
  const correctKey = q.correctOrder.join('|');
  const seen = new Set();
  let expectedCount = 0, alternateCount = 0, invalidCount = 0;
  let correctOrderRecord = null;
  const textById = new Map(q.chunks.map((c) => [c.id, c.text]));
  for (const p of item.permutations) {
    if (!Array.isArray(p.order) || p.order.length !== 4) fail(`${item.id} has malformed order`);
    const key = (p.order || []).join('|');
    if (seen.has(key)) fail(`${item.id} duplicate order ${key}`);
    seen.add(key);
    if (!expectedOrders.has(key)) fail(`${item.id} has non-4! order ${key}`);
    if (key === correctKey) correctOrderRecord = p;
    const rebuilt = q.before + (p.order || []).map((id) => textById.get(id)).join('') + q.after;
    if (rebuilt !== p.sentence) fail(`${item.id} order ${key} sentence reconstruction mismatch`);
    if (!['VALID_EXPECTED','VALID_ALTERNATE','INVALID_GRAMMAR'].includes(p.verdict)) fail(`${item.id} order ${key} has invalid verdict ${p.verdict}`);
    if (!p.reason || String(p.reason).length < 20) fail(`${item.id} order ${key} lacks a concrete reason`);
    if (p.verdict === 'VALID_EXPECTED') {
      expectedCount++;
      if (key !== correctKey) fail(`${item.id} VALID_EXPECTED order ${key} does not match correctOrder ${correctKey}`);
    } else if (p.verdict === 'VALID_ALTERNATE') {
      alternateCount++;
    } else if (p.verdict === 'INVALID_GRAMMAR') {
      invalidCount++;
      if (key === correctKey) fail(`${item.id} correctOrder ${correctKey} is marked INVALID_GRAMMAR`);
    }
  }
  if (seen.size !== 24) fail(`${item.id} unique order count is ${seen.size}`);
  if (expectedOrders.size !== 24) fail(`${item.id} generated expected 4! order count is ${expectedOrders.size}`);
  for (const order of expectedOrders) if (!seen.has(order)) fail(`${item.id} missing 4! order ${order}`);
  if (!correctOrderRecord) fail(`${item.id} correctOrder ${correctKey} is absent from permutations`);
  else if (correctOrderRecord.verdict !== 'VALID_EXPECTED') fail(`${item.id} correctOrder ${correctKey} is marked ${correctOrderRecord.verdict}`);
  if (expectedCount !== 1) fail(`${item.id} VALID_EXPECTED count is ${expectedCount}`);
  if (alternateCount !== 0) fail(`${item.id} VALID_ALTERNATE count is ${alternateCount}`);
  if (invalidCount !== 23) fail(`${item.id} INVALID_GRAMMAR count is ${invalidCount}`);
  const section = reportSections.sections.get(item.id);
  if (section) {
    if (!section.includes('24/24 completed')) fail(`Report section ${item.id} lacks 24/24 completed`);
    if (!section.includes('VALID_EXPECTED數量：1')) fail(`Report section ${item.id} lacks VALID_EXPECTED數量：1`);
    if (!section.includes('VALID_ALTERNATE數量：0')) fail(`Report section ${item.id} lacks VALID_ALTERNATE數量：0`);
    if (!section.includes('最終結論：PASS_UNIQUE')) fail(`Report section ${item.id} lacks 最終結論：PASS_UNIQUE`);
  }
}
if (totalPermutations !== 1440) fail(`total permutations is ${totalPermutations}`);
console.log('\nFinal statistics');
console.log(JSON.stringify({ stats, starSlotDistribution: starDist, correctOptionPositionDistribution: optionDist, evidenceQuestions: evidence.length, totalPermutations }, null, 2));
if (failures.length) { console.error('\nFAILURES:'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('\nAll structural, baseline, cache, and audit-evidence checks passed. Manual grammar verdicts are recorded in the Markdown report and permutations JSON.');
