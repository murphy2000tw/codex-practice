#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const run = (cmd) => cp.execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
const questions = JSON.parse(read('japaneseSentenceCompositionQuestions.json'));
const grammar = JSON.parse(read('grammar.json'));
const html = read('japanese/index.html');
const script = read('script.js');
const failures = [];
const assert = (ok, msg) => { if (!ok) failures.push(msg); };
const required = ['id','level','before','after','slots','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed','reviewNote'];
const grammarIds = new Set(grammar.map(g => g.id));
const ambiguityFixIds = new Set(['sc-n5-004','sc-n5-005','sc-n4-001','sc-n5-015','sc-n5-029']);
const ambiguityFixExpected = new Map(Object.entries({
  'sc-n5-004': { before:'田中さんは駅で先生に会', after:'。', chunks:[['a','って'],['c','に帰り'],['b','いっしょ'],['d','ました']], correctOrder:['a','b','c','d'], starSlot:3, completeSentence:'田中さんは駅で先生に会っていっしょに帰りました。' },
  'sc-n5-005': { before:'この店は安', after:'。', chunks:[['a','いです'],['b','が'],['d','ないです'],['c','あまり広く']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'この店は安いですがあまり広くないです。' },
  'sc-n4-001': { before:'雨が', after:'。', chunks:[['a','やんだら駅まで'],['b','歩いて'],['d','ましょう'],['c','行き']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'雨がやんだら駅まで歩いて行きましょう。' },
  'sc-n5-015': { before:'クラスで田中さん', after:'。', chunks:[['c','背'],['a','が'],['b','いちばん'],['d','が高いです']], correctOrder:['a','b','c','d'], starSlot:2, completeSentence:'クラスで田中さんがいちばん背が高いです。' },
  'sc-n5-029': { before:'あした雨', after:'。', chunks:[['a','が'],['b','降りますから'],['c','出かけ'],['d','ません']], correctOrder:['a','b','c','d'], starSlot:0, completeSentence:'あした雨が降りますから出かけません。' }
}));
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function assertAmbiguityFixShape(q) {
  const exp = ambiguityFixExpected.get(q.id);
  if (!exp) return;
  assert(q.before === exp.before, `${q.id}: ambiguity-fix before changed`);
  assert(q.after === exp.after, `${q.id}: ambiguity-fix after changed`);
  assert(q.completeSentence === exp.completeSentence, `${q.id}: ambiguity-fix completeSentence changed`);
  assert(sameJson(q.correctOrder, exp.correctOrder), `${q.id}: ambiguity-fix correctOrder changed`);
  assert(q.starSlot === exp.starSlot, `${q.id}: ambiguity-fix starSlot changed`);
  assert(sameJson((q.chunks || []).map(c => [c.id, c.text]), exp.chunks), `${q.id}: ambiguity-fix chunks changed`);
  assert(/已檢查24種排列/.test(q.reviewNote || ''), `${q.id}: ambiguity-fix reviewNote must document 24 permutations`);
}

assert(run('git merge-base --is-ancestor 8741b97b91561decbeb3218756e44f3641ea1b00 HEAD; echo $?') === '0', 'HEAD must contain PR #275 merge commit 8741b97b91561decbeb3218756e44f3641ea1b00');
let baseQuestions = [];
try { baseQuestions = JSON.parse(run('git show 8741b97b91561decbeb3218756e44f3641ea1b00:japaneseSentenceCompositionQuestions.json')); } catch (e) { failures.push('cannot read PR #275 baseline questions'); }
const baseById = new Map(baseQuestions.map(q => [q.id, q]));
for (const q of questions.slice(0, 40)) {
  if (ambiguityFixIds.has(q.id)) assertAmbiguityFixShape(q);
  else assert(JSON.stringify(q) === JSON.stringify(baseById.get(q.id)), `${q.id}: original 40 non-ambiguity-fix question must match PR #275 baseline exactly`);
}
const ids = new Set(); const sentences = new Set();
const levels = { N5: 0, N4: 0 }; const allStars = [0,0,0,0]; const allPos = [0,0,0,0]; const newStars = [0,0,0,0]; const newPos = [0,0,0,0];
let dupIds=0, dupSentences=0, missing=0, invalidGrammar=0, invalidChunkTextType=0, emptyChunks=0, punctuationOnlyChunks=0, chunkWithoutWordChar=0, mapping=0, reconstruction=0;
const expectedNew = new Set([...Array.from({length:10},(_,i)=>`sc-n5-${String(i+21).padStart(3,'0')}`), ...Array.from({length:10},(_,i)=>`sc-n4-${String(i+21).padStart(3,'0')}`)]);
const expectedSentences = new Map([
['sc-n5-021','母は台所でお茶を飲んでいます。'],['sc-n5-022','弟は毎晩九時に寝ますよ。'],['sc-n5-023','わたしはスーパーでパンを二つ買いました。'],['sc-n5-024','このかばんはとても軽いです。'],['sc-n5-025','駅の前に大きいバスが来ました。'],['sc-n5-026','日曜日は家で音楽を聞きます。'],['sc-n5-027','先生は黒板に漢字を書いています。'],['sc-n5-028','きのう友だちと公園でサッカーをしました。'],['sc-n5-029','あした雨が降りますから出かけません。'],['sc-n5-030','妹は新しい靴をほしがっています。'],
['sc-n4-021','妹は熱があるらしいです。'],['sc-n4-022','この箱は一人で持つには重すぎます。'],['sc-n4-023','このペンは字が書きやすいです。'],['sc-n4-024','この説明は字が小さくて読みにくいです。'],['sc-n4-025','子どもが急に泣き始めました。'],['sc-n4-026','レポートを全部書き終わりました。'],['sc-n4-027','大切な書類を電車に忘れてしまいました。'],['sc-n4-028','この店ではカードで払うことができます。'],['sc-n4-029','健康のために毎日野菜を食べるようにしています。'],['sc-n4-030','地震の場合はすぐに外へ出てください。']]);
for (const q of questions) {
  if (ids.has(q.id)) dupIds++; ids.add(q.id);
  if (sentences.has(q.completeSentence)) dupSentences++; sentences.add(q.completeSentence);
  const miss = required.filter(k => !(k in q)); if (miss.length) { missing++; failures.push(`${q.id}: missing ${miss.join(',')}`); }
  if (levels[q.level] !== undefined) levels[q.level]++;
  const chunkIds = (q.chunks || []).map(c => c.id);
  if (!(Array.isArray(q.chunks) && q.chunks.length === 4 && new Set(chunkIds).size === 4 && Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && new Set(q.correctOrder).size === 4 && q.correctOrder.every(id => chunkIds.includes(id)))) { mapping++; failures.push(`${q.id}: correctOrder/chunks mapping error`); }
  for (const chunk of q.chunks || []) { if (typeof chunk.text !== 'string') { invalidChunkTextType++; continue; } const t=chunk.text.trim(); if(!t) emptyChunks++; if(/^[、。！？・\s]+$/.test(t)) punctuationOnlyChunks++; if(!/[ぁ-んァ-ン一-龯々〆ヵヶA-Za-z0-9]/.test(t)) chunkWithoutWordChar++; }
  const text = Object.fromEntries((q.chunks || []).map(c => [c.id, c.text]));
  if (q.completeSentence !== q.before + (q.correctOrder || []).map(id => text[id]).join('') + q.after) reconstruction++;
  if (!(Array.isArray(q.grammarIds) && q.grammarIds.length && q.grammarIds.every(id => grammarIds.has(id)))) invalidGrammar++;
  if (q.starSlot >= 0 && q.starSlot < 4) allStars[q.starSlot]++;
  const pos = (q.chunks || []).findIndex(c => c.id === q.correctOrder?.[q.starSlot]); if (pos >= 0) allPos[pos]++;
  if (ambiguityFixIds.has(q.id)) assertAmbiguityFixShape(q);
  if (expectedNew.has(q.id)) { newStars[q.starSlot]++; if (pos >= 0) newPos[pos]++; assert(q.uniqueAnswerReviewed === true, `${q.id}: uniqueAnswerReviewed must be true`); assert(/已檢查24種排列/.test(q.reviewNote), `${q.id}: reviewNote must document 24 permutations`); assert(q.completeSentence === expectedSentences.get(q.id), `${q.id}: locked completeSentence changed`); }
}
assert(questions.length === 60, `total must be 60, got ${questions.length}`); assert(levels.N5 === 30, `N5 must be 30, got ${levels.N5}`); assert(levels.N4 === 30, `N4 must be 30, got ${levels.N4}`);
assert(JSON.stringify(questions.slice(40).map(q => q.id).sort()) === JSON.stringify([...expectedNew].sort()), 'new ID range must be exact');
assert(dupIds===0, `duplicate ID must be 0, got ${dupIds}`); assert(dupSentences===0, `duplicate completeSentence must be 0, got ${dupSentences}`); assert(missing===0, `missing required fields must be 0, got ${missing}`); assert(invalidGrammar===0, `invalid grammarIds must be 0, got ${invalidGrammar}`); assert(invalidChunkTextType===0, `invalid chunk.text type must be 0, got ${invalidChunkTextType}`); assert(emptyChunks===0, `empty chunk must be 0, got ${emptyChunks}`); assert(punctuationOnlyChunks===0, `punctuation-only chunk must be 0, got ${punctuationOnlyChunks}`); assert(chunkWithoutWordChar===0, `chunk without Japanese/English/number must be 0, got ${chunkWithoutWordChar}`); assert(mapping===0, `correctOrder/chunks mapping error must be 0, got ${mapping}`); assert(reconstruction===0, `completeSentence reconstruction error must be 0, got ${reconstruction}`);
assert(JSON.stringify(newStars)==='[5,5,5,5]', `new starSlot distribution must be [5,5,5,5], got ${JSON.stringify(newStars)}`); assert(JSON.stringify(newPos)==='[5,5,5,5]', `new correct option positions must be [5,5,5,5], got ${JSON.stringify(newPos)}`); assert(JSON.stringify(allStars)==='[15,15,15,15]', `all starSlot distribution must be [15,15,15,15], got ${JSON.stringify(allStars)}`); assert(JSON.stringify(allPos)==='[15,15,15,15]', `all correct option positions must be [15,15,15,15], got ${JSON.stringify(allPos)}`);
assert(/japaneseSentenceCompositionQuestions\.json\?v=16d3a/.test(html), 'question cache must be v=16d3a'); assert(/script\.js\?v=3\.3/.test(html), 'script cache must remain v=3.3'); assert(/style\.css\?v=2\.9/.test(html), 'style cache must remain v=2.9'); assert(!run('git diff --name-only -- script.js style.css'), 'script.js and style.css must be unmodified'); assert(!/localStorage\.setItem\([^)]*sentenceComposition/.test(script), 'must not add sentence-composition localStorage key');
console.log(`Final counts: total=${questions.length}, N5=${levels.N5}, N4=${levels.N4}`); console.log(`Duplicate IDs=${dupIds}, duplicate completeSentence=${dupSentences}, missing=${missing}, invalidGrammar=${invalidGrammar}`); console.log(`Chunk issues: invalidTextType=${invalidChunkTextType}, empty=${emptyChunks}, punctuationOnly=${punctuationOnlyChunks}, noJapaneseEnglishNumber=${chunkWithoutWordChar}`); console.log(`Mapping errors=${mapping}, reconstruction errors=${reconstruction}`); console.log(`New starSlot distribution=${JSON.stringify(newStars)}, new correct option positions=${JSON.stringify(newPos)}`); console.log(`All starSlot distribution=${JSON.stringify(allStars)}, all correct option positions=${JSON.stringify(allPos)}`);
if (failures.length) { console.error('Batch sentence composition data check failed:'); failures.forEach(f => console.error(`- ${f}`)); process.exit(1); }
console.log('Batch sentence composition data check passed.');
