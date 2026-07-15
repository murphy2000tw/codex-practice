#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));
const readingSets = window.JAPANESE_READING_SETS || [];
const vocabulary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vocabulary.json'), 'utf8'));
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const commonSource = script.match(/const commonReadingRubyTerms = (\[[\s\S]*?\n\];)/)?.[1];
if (!commonSource) throw new Error('Unable to find commonReadingRubyTerms in script.js');
const commonReadingRubyTerms = Function(`return ${commonSource.replace(/;\s*$/, '')}`)();

const kanaReadingPattern = /^[\u3041-\u3096\u30A1-\u30FAー]+$/u;
const kanjiPattern = /[\u3400-\u9FFF々〆ヵヶ]/u;
const categories = ['exact-match', 'safe-inflection-candidate', 'safe-compound-segmentation-candidate', 'no-lookup-needed', 'manual-review'];

function normalizeRubyTerms(rubyTerms) {
  if (!Array.isArray(rubyTerms)) return [];
  return rubyTerms
    .filter((term) => term && term.text && term.reading)
    .map((term) => ({ text: String(term.text).trim(), reading: String(term.reading).trim() }))
    .filter((term) => term.text && term.reading && kanaReadingPattern.test(term.reading) && kanjiPattern.test(term.text))
    .sort((a, b) => b.text.length - a.text.length || a.text.localeCompare(b.text, 'ja'));
}
function mergeAndDedupeTerms(vocabTerms = [], manualTerms = []) {
  const merged = new Map();
  normalizeRubyTerms(vocabTerms).forEach((term) => merged.set(term.text, term));
  normalizeRubyTerms(manualTerms).forEach((term) => merged.set(term.text, term));
  return normalizeRubyTerms([...merged.values()]);
}
function getReadingRubyTerms(readingSet) {
  const vocabTerms = Array.isArray(readingSet?.vocabulary) ? readingSet.vocabulary.map((item) => ({ text: item?.word, reading: item?.kana })) : [];
  return mergeAndDedupeTerms([...commonReadingRubyTerms, ...vocabTerms], readingSet?.rubyTerms || []);
}
function createRubyPartsFromTerms(text, rubyTerms) {
  const source = String(text ?? '');
  const terms = normalizeRubyTerms(rubyTerms);
  const parts = [];
  let index = 0;
  while (index < source.length) {
    const match = terms.find((term) => source.startsWith(term.text, index));
    if (match) { parts.push({ base: match.text, ruby: match.reading }); index += match.text.length; }
    else index += 1;
  }
  return parts;
}
function exactMatches(word, reading) { return vocabulary.filter((v) => v.word === word && (!reading || v.kana === reading)); }
function uniqueExact(word, reading) { const m = exactMatches(word, reading); return m.length === 1 ? m[0] : null; }
const byWordKana = new Map(vocabulary.map((v) => [`${v.word}\u0000${v.kana}`, v]));

const approvedInflections = [
  { surface: '温めて', reading: 'あたためて', base: '温める', baseKana: 'あたためる', rule: '一段動詞・て形: る→て; reading あたためる→あたためて', reason: '出現形は温める動作のて形で、既存語彙「温める」にだけ一致する。' },
  { surface: '書きました', reading: 'かきました', base: '書く', baseKana: 'かく', rule: '五段動詞カ行・丁寧過去: く→きました; reading かく→かきました', reason: '出現形は「書く」の丁寧過去で、既存語彙「書く」にだけ一致する。' },
  { surface: '調べ', reading: 'しらべ', base: '調べる', baseKana: 'しらべる', rule: '一段動詞・連用形: る→∅; reading しらべる→しらべ', reason: '出現形は「調べてから」の連用形部分で、既存語彙「調べる」にだけ一致する。' },
  { surface: '迷っています', reading: 'まよっています', base: '迷う', baseKana: 'まよう', rule: '五段動詞ワ行・ている丁寧形: う→っています; reading まよう→まよっています', reason: '出現形は継続状態「迷っています」で、既存語彙「迷う」にだけ一致する。' },
  { surface: '誘い', reading: 'さそい', base: '誘う', baseKana: 'さそう', rule: '五段動詞ワ行・連用形: う→い; reading さそう→さそい', reason: '出現形は名詞化された連用形で、既存語彙「誘う」にだけ一致する。' },
];
const approvedCompounds = [
  { surface: '朝の電車', reading: 'あさのでんしゃ', segments: [{ word: '朝', kana: 'あさ' }, { literal: 'の' }, { word: '電車', kana: 'でんしゃ' }], reason: '朝＋の＋電車の順に原 surface/reading を完全覆蓋し、語彙部分は各一筆。' },
  { surface: '手伝う予定', reading: 'てつだうよてい', segments: [{ word: '手伝う', kana: 'てつだう' }, { word: '予定', kana: 'よてい' }], reason: '手伝う＋予定で原 surface/reading を完全覆蓋し、各部分皆唯一對應 vocabulary。' },
];
function classify(term) {
  const hit = uniqueExact(term.surface, term.reading);
  if (hit) return { category: 'exact-match', vocabulary: { id: hit.id, word: hit.word, kana: hit.kana } };
  const inf = approvedInflections.find((x) => x.surface === term.surface && x.reading === term.reading);
  if (inf) {
    const v = uniqueExact(inf.base, inf.baseKana);
    return { category: 'safe-inflection-candidate', base: inf.base, baseKana: inf.baseKana, vocabulary: { id: v.id, word: v.word, kana: v.kana, partOfSpeech: v.partOfSpeech }, rule: inf.rule, reason: inf.reason };
  }
  const comp = approvedCompounds.find((x) => x.surface === term.surface && x.reading === term.reading);
  if (comp) {
    const segments = comp.segments.map((s) => s.literal ? s : { ...s, vocabulary: (() => { const v = uniqueExact(s.word, s.kana); return { id: v.id, word: v.word, kana: v.kana }; })() });
    return { category: 'safe-compound-segmentation-candidate', segments, reason: comp.reason };
  }
  return { category: 'manual-review', reason: '未能以完整 word 精確查到，且未列入本批人工核准的唯一活用還原或完整複合詞切分；為避免顯示錯誤詞義，保留人工確認。' };
}

const observed = new Map();
let totalOccurrences = 0;
for (const set of readingSets) {
  const terms = getReadingRubyTerms(set);
  for (const field of ['title', 'passage']) {
    for (const part of createRubyPartsFromTerms(set[field], terms)) {
      if (!part.base) continue;
      totalOccurrences += 1;
      const key = `${part.base}\u0000${part.ruby}`;
      if (!observed.has(key)) observed.set(key, { surface: part.base, reading: part.ruby, count: 0, setIds: new Set(), locations: new Set() });
      const row = observed.get(key); row.count += 1; row.setIds.add(set.id); row.locations.add(field);
    }
  }
}
const items = [...observed.values()].map((x) => ({ ...x, setIds: [...x.setIds].sort(), locations: [...x.locations].sort(), ...classify(x) })).sort((a,b)=>a.surface.localeCompare(b.surface,'ja')||a.reading.localeCompare(b.reading,'ja'));
const summary = Object.fromEntries(categories.map((c) => [c, items.filter((x) => x.category === c).length]));
const exactBefore = summary['exact-match'];
const safeAfter = exactBefore + summary['safe-inflection-candidate'] + summary['safe-compound-segmentation-candidate'];
const report = { readingArticleCount: readingSets.length, totalRubyOccurrences: totalOccurrences, uniqueSurfaceReadingCount: items.length, categories: summary, coverage: { beforeExactLookupCount: exactBefore, afterSafePlanLookupCount: safeAfter, beforeCoverage: exactBefore / items.length, afterCoverage: safeAfter / items.length } };
fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
function table(rows, cols) { return rows.map((r) => `| ${cols.map((c) => String(c(r)).replace(/\|/g, '/')).join(' | ')} |`).join('\n'); }
const manual = items.filter((x)=>x.category==='manual-review');
const inf = items.filter((x)=>x.category==='safe-inflection-candidate');
const comp = items.filter((x)=>x.category==='safe-compound-segmentation-candidate');
const manualReason = '未能以完整 word 精確查到，且未列入本批人工核准的唯一活用還原或完整複合詞切分；為避免顯示錯誤詞義，保留人工確認。';
const md = `# Batch 14B-1：日文閱讀進階查字候選盤點與安全規則設計

本報告只盤點閱讀練習 title/passage 實際由 Batch 14A ruby rendering 產生且允許點擊查字的 ruby 詞；不包含閱讀測驗題目、選項、文法/單字/聽力頁面或英文網站。本檔保留 Batch 14B-2 判斷所需資訊，省略 exact-match 逐筆明細與完整文章內容。

## 盤點摘要
- 閱讀文章數：${readingSets.length}
- title/passage 實際 ruby 詞總出現次數：${totalOccurrences}
- 去重後 surface＋reading 數量：${items.length}
- exact-match：${summary['exact-match']}
- safe-inflection-candidate：${summary['safe-inflection-candidate']}
- safe-compound-segmentation-candidate：${summary['safe-compound-segmentation-candidate']}
- no-lookup-needed：${summary['no-lookup-needed']}
- manual-review：${summary['manual-review']}

## exact-match 摘要
Batch 14A 已能以完整 word＋ruby reading 唯一對應 vocabulary.json 的項目共 ${summary['exact-match']} 筆；為避免報告過長，本階段不逐筆列出 exact-match 明細。Batch 14B-2 應維持 exact-match 最高優先序。

## safe-inflection 完整清單
| surface | reading | 基本形 | 基本形 kana | vocabulary id | 詞性 | 活用規則 | 判定理由 |
|---|---|---|---|---:|---|---|---|
${table(inf, [(r)=>r.surface,(r)=>r.reading,(r)=>r.base,(r)=>r.baseKana,(r)=>r.vocabulary.id,(r)=>r.vocabulary.partOfSpeech,(r)=>r.rule,(r)=>r.reason])}

## safe-compound 完整清單
| surface | reading | 切分結果 | 完整覆蓋證據 |
|---|---|---|---|
${table(comp, [(r)=>r.surface,(r)=>r.reading,(r)=>r.segments.map((s)=>s.literal?`literal:${s.literal}`:`${s.vocabulary.id}:${s.word}/${s.kana}`).join(' + '),(r)=>r.reason])}

## manual-review 完整清單
| surface | reading | 來源 ID | 不能自動處理的理由 |
|---|---|---|---|
${table(manual, [(r)=>r.surface,(r)=>r.reading,(r)=>r.setIds.join(', '),()=>manualReason])}

## Batch 14B-2 建議安全規則
1. exact-match 優先維持現狀：surface＋reading 唯一對應 vocabulary.json 時才顯示卡片。
2. 經核准完整複合詞：若未來 vocabulary 已存在完整複合詞，優先於拆分。
3. 經核准活用還原白名單：僅允許本報告 safe-inflection 清單列出的 surface＋reading 實例，不建立全域寬鬆活用規則。
4. 經核准複合詞切分白名單：僅允許本報告 safe-compound 清單列出的完整 surface/reading 覆蓋。
5. 無可靠結果時不啟用查字。

## Batch 14B-2 不得自動處理
manual-review 表內全部 ${manual.length} 筆不得自動還原或拆分；不得對閱讀測驗、題目、選項、其他日文頁面、英文網站或任意全文點擊查字套用規則。

## 優先順序與衝突處理
exact-match → 經核准完整複合詞 → 經核准活用還原 → 經核准複合詞切分 → 不啟用查字。若同一 surface＋reading 同時命中多條非 exact 規則，以白名單中較高優先級為準；任何非唯一 vocabulary 對應一律降為 manual-review。

## 覆蓋率預估
- 套用前可查 ruby 詞：${exactBefore}/${items.length}（${(exactBefore/items.length*100).toFixed(2)}%）
- 套用安全規則後可查 ruby 詞：${safeAfter}/${items.length}（${(safeAfter/items.length*100).toFixed(2)}%）

## vocabulary.json 基準
- total：3241
- N5：1021
- N4：2220
- duplicate id：0
- duplicate word：0
- missing required fields：0

## 測試結果摘要
本批應執行並通過：\`node --check\` 兩支 Batch 14B-1 腳本、Batch 14B-1 audit/check、既有日文閱讀查字與 ruby/menu/main/view/site health 檢查、\`python3 -m json.tool\` 檢查 vocabulary/grammar，以及 \`git diff --check\`。
`;
fs.writeFileSync(path.join(repoRoot, 'docs/japanese-reading-lookup-batch14b-plan.md'), md);
console.log(`Batch 14B-1 audit complete: ${items.length} unique ruby terms, ${totalOccurrences} occurrences.`);
console.log(JSON.stringify(report.categories));
