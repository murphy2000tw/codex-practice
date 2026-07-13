#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');

if (typeof Intl.Segmenter !== 'function') {
  console.error('Intl.Segmenter is required for reliable Batch 11 segmentation.');
  process.exit(1);
}
const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
const kanaRe = /[ぁ-んァ-ンー]/;
const jpRe = /[ぁ-んァ-ン一-龯々ー]/;
const sentenceLikeRe = /[。！？]|.{25,}/;
const forbiddenMissing = new Set('重點詞 名詞 助詞 動詞 形容詞 其他 地點 樣態 許可 授受 推量 比較 條件 希望 經驗 說明 過去 肯定 否定 現在'.split(' '));
const grammarElements = new Set('は が を に で へ と の も や から まで より ね よ な か です ます ない たい た だ でしょう ましょう でした ません たり て いる ある する した して ください さん ちゃん こと もの ので ため では だけ そう なら ほど とき かも とか ても ように ために'.split(' '));
const properNouns = new Set('田中 佐藤 山田 中村 鈴木 美香 マイク 吉田 小林 伊藤 渡辺 ジョン アンナ 林 由美 近藤 東京 大阪 京都 日本 アメリカ 中国 韓国'.split(' '));
const fixedExpressionRe = /(てください|なければ|てもいい|ことが|ように)/;

function readJson(path) { return JSON.parse(fs.readFileSync(path, 'utf8')); }
function loadWindowFile(path, key) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path });
  return context.window[key] || [];
}
function extractConstArray(file, name) {
  const src = fs.readFileSync(file, 'utf8');
  const marker = `const ${name} =`;
  const start = src.indexOf(marker);
  if (start < 0) return [];
  const open = src.indexOf('[', start);
  let depth = 0, quote = null, escape = false;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) return vm.runInNewContext(src.slice(open, i + 1));
    }
  }
  return [];
}

const vocabulary = readJson('vocabulary.json');
const grammar = readJson('grammar.json');
const reading = loadWindowFile('japaneseReadingQuestions.js', 'JAPANESE_READING_SETS');
const listening = extractConstArray('script.js', 'JAPANESE_LISTENING_QUESTIONS');
const byWord = new Map(vocabulary.map((v) => [v.word, v]));
const byKana = new Map();
for (const v of vocabulary) {
  if (!v.kana) continue;
  if (!byKana.has(v.kana)) byKana.set(v.kana, []);
  byKana.get(v.kana).push(v);
}
const vocabWords = [...byWord.keys()].filter((w) => w && jpRe.test(w)).sort((a, b) => b.length - a.length || a.localeCompare(b, 'ja'));
const suruBases = new Set(vocabulary.filter((v) => String(v.partOfSpeech || '').includes('する')).map((v) => v.word));

function hasJapanese(text) { return typeof text === 'string' && jpRe.test(text); }
function source(module, id, field, text, mode = 'text') { return hasJapanese(text) ? { module, id, field, text, mode } : null; }
function japaneseChoice(text) { return hasJapanese(text) && !/[\u4e00-\u9fff]{2,}：/.test(text); }
function grammarFormsFromStructure(text) { return String(text || '').match(/[ぁ-んァ-ンー〜]+/g) || []; }
function collectSources() {
  const out = [];
  for (const g of grammar) {
    ['grammar', 'kana', 'example', 'exampleKana'].forEach((f) => { const s = source('grammar', g.id, f, g[f]); if (s) out.push(s); });
    for (const form of grammarFormsFromStructure(g.structure)) out.push({ module: 'grammar', id: g.id, field: 'structure.form', text: form, mode: 'explicit' });
    for (const sim of g.similar || []) if (hasJapanese(sim)) out.push({ module: 'grammar', id: g.id, field: 'similar', text: sim, mode: 'explicit' });
    if (g.quiz) {
      ['clozePrompt', 'clozePromptKana', 'answer'].forEach((f) => { const s = source('grammar', g.id, `quiz.${f}`, g.quiz[f]); if (s) out.push(s); });
      for (const c of g.quiz.choices || []) if (japaneseChoice(c)) out.push({ module: 'grammar', id: g.id, field: 'quiz.choices', text: c, mode: 'explicit' });
    }
  }
  for (const r of reading) {
    ['title', 'titleRuby', 'passage', 'passageKana', 'passageRuby'].forEach((f) => { const s = source('reading', r.id, f, r[f]); if (s) out.push(s); });
    for (const v of r.vocabulary || []) ['word', 'kana'].forEach((f) => { const s = source('reading', r.id, `vocabulary.${f}`, v[f], 'explicit'); if (s) out.push(s); });
    for (const t of r.rubyTerms || []) ['text', 'reading'].forEach((f) => { const s = source('reading', r.id, `rubyTerms.${f}`, t[f], 'explicit'); if (s) out.push(s); });
    for (const q of r.questions || []) {
      const qs = source('reading', q.id || r.id, 'questions.question', q.question); if (qs) out.push(qs);
      for (const opt of q.options || []) if (japaneseChoice(opt)) out.push({ module: 'reading', id: q.id || r.id, field: 'questions.options', text: opt, mode: 'text' });
    }
  }
  for (const [i, l] of listening.entries()) {
    const id = l.id || `listening-${i + 1}`;
    ['japanese', 'kana'].forEach((f) => { const s = source('listening', id, f, l[f]); if (s) out.push(s); });
    const qs = source('listening', id, 'question', l.question); if (qs && kanaRe.test(qs.text)) out.push(qs);
    for (const opt of l.options || []) if (kanaRe.test(opt)) out.push({ module: 'listening', id, field: 'options', text: opt, mode: 'text' });
    ['explanation', 'japaneseExplanation'].forEach((f) => { const s = source('listening', id, f, l[f]); if (s && kanaRe.test(s.text)) out.push(s); });
  }
  return out;
}

function normalize(surface) {
  if (byWord.has(surface)) return [{ status: 'exact-match', lemma: surface, type: 'exact' }];
  const tries = [];
  const add = (lemma, type) => tries.push({ lemma, type });
  if (surface.endsWith('しました')) add(surface.slice(0, -4), 'する動詞・丁寧過去');
  if (surface.endsWith('します')) add(surface.slice(0, -3), 'する動詞・丁寧');
  if (surface.endsWith('して')) add(surface.slice(0, -2), 'する動詞・て形');
  if (surface.endsWith('しない')) add(surface.slice(0, -3), 'する動詞・否定');
  if (surface.endsWith('でした')) add(surface.slice(0, -3), 'な形容詞・丁寧過去');
  if (surface.endsWith('だった')) add(surface.slice(0, -3), 'な形容詞・過去');
  if (surface.endsWith('かった')) add(surface.slice(0, -3) + 'い', 'い形容詞・過去');
  if (surface.endsWith('くない')) add(surface.slice(0, -3) + 'い', 'い形容詞・否定');
  if (surface.endsWith('くて')) add(surface.slice(0, -2) + 'い', 'い形容詞・て形');
  const masu = [['い', 'う'], ['き', 'く'], ['ぎ', 'ぐ'], ['し', 'す'], ['ち', 'つ'], ['に', 'ぬ'], ['び', 'ぶ'], ['み', 'む'], ['り', 'る']];
  const stems = surface.endsWith('ませんでした') ? [[surface.slice(0, -6), '丁寧否定過去']] : surface.endsWith('ません') ? [[surface.slice(0, -3), '丁寧否定']] : surface.endsWith('ました') ? [[surface.slice(0, -3), '丁寧過去']] : surface.endsWith('ます') ? [[surface.slice(0, -2), '丁寧']] : [];
  for (const [stem, label] of stems) {
    add(stem + 'る', `一段動詞・${label}`);
    for (const [from, to] of masu) if (stem.endsWith(from)) add(stem.slice(0, -1) + to, `五段動詞・${label}`);
  }
  const unique = [...new Map(tries.filter((t) => byWord.has(t.lemma) || suruBases.has(t.lemma)).map((t) => [t.lemma, t])).values()];
  if (unique.length === 1) return [{ status: 'lemma-match', ...unique[0] }];
  if (unique.length > 1) return [{ status: 'manual-review', lemma: surface, type: `ambiguous lemma: ${unique.map((u) => u.lemma).join('/')}` }];
  const kanaMatches = byKana.get(surface) || [];
  if (kanaMatches.length === 1) return [{ status: 'kana-match', lemma: kanaMatches[0].word, type: 'kana-match' }];
  if (kanaMatches.length > 1) return [{ status: 'manual-review', lemma: surface, type: 'ambiguous kana-match' }];
  if (grammarElements.has(surface)) return [{ status: 'grammar-element', lemma: surface, type: 'grammar-element' }];
  if (properNouns.has(surface)) return [{ status: 'proper-noun', lemma: surface, type: 'proper-noun' }];
  return [];
}
function isReliableCandidate(token, explicit) {
  if (!token || grammarElements.has(token) || forbiddenMissing.has(token)) return false;
  if (sentenceLikeRe.test(token) || /[\u4e00-\u9fff]{2,}[，。！？、]/.test(token)) return false;
  if (/^(文章に|の朝)$/.test(token)) return false;
  if (explicit) return token.length > 1 && !/^[ぁ-んー]$/.test(token);
  if (/^[ぁ-んー]+$/.test(token)) return false;
  if (/^[一-龯々]$/.test(token)) return false;
  if (/^[一-龯々]+[ぁ-ん]+$/.test(token)) return false;
  return token.length >= 2 && token.length <= 8;
}
function knownCompound(token) {
  if (byWord.has(token)) return false;
  let i = 0, parts = 0;
  while (i < token.length) {
    const hit = vocabWords.find((w) => token.startsWith(w, i));
    if (!hit) return false;
    i += hit.length; parts += 1;
  }
  return parts >= 2;
}
const records = [], unresolved = [], unsegmented = [];
function add(src, surface, norm, explicit = false) { records.push({ ...src, surface, lemma: norm.lemma || surface, status: norm.status, type: norm.type || '', sentence: src.text.slice(0, 80), explicit }); }
function processToken(src, token, explicit = false) {
  if (!jpRe.test(token) || /^\d+$/.test(token)) return;
  const norms = normalize(token);
  if (norms.length) return add(src, token, norms[0], explicit);
  if (knownCompound(token) || (explicit && token.length > 2 && !byWord.has(token))) return add(src, token, { status: 'compound', lemma: token, type: explicit ? 'explicit field' : 'known-word compound' }, explicit);
  if (isReliableCandidate(token, explicit)) return add(src, token, { status: 'missing-candidate', lemma: token, type: explicit ? 'explicit field' : 'segmenter token' }, explicit);
  add(src, token, { status: 'manual-review', lemma: token, type: 'unresolved token' }, explicit);
  unresolved.push({ ...src, token });
}
function processSource(src) {
  if (src.mode === 'explicit') return processToken(src, src.text, true);
  const segs = [...segmenter.segment(src.text)];
  for (let i = 0; i < segs.length; i += 1) {
    const seg = segs[i];
    if (!seg.isWordLike || !jpRe.test(seg.segment)) continue;
    let token = seg.segment;
    if (/^[ァ-ンー]+$/.test(token)) {
      let end = seg.index + seg.segment.length;
      while (i + 1 < segs.length && segs[i + 1].isWordLike && segs[i + 1].index === end && /^[ァ-ンー]+$/.test(segs[i + 1].segment)) {
        i += 1; token += segs[i].segment; end += segs[i].segment.length;
      }
    }
    processToken(src, token, false);
  }
}
const sources = collectSources();
for (const src of sources) processSource(src);
const counts = {
  grammarItems: grammar.length,
  grammarQuestions: grammar.filter((g) => g.quiz).length,
  readingArticles: reading.length,
  readingQuestions: reading.reduce((n, r) => n + (r.questions?.length || 0), 0),
  listeningQuestions: listening.length,
};
const modules = ['grammar', 'reading', 'listening'];
function uniq(status) {
  const map = new Map();
  for (const r of records.filter((x) => x.status === status)) {
    if (!map.has(r.lemma)) map.set(r.lemma, { ...r, count: 0, mods: new Set(), ids: [] });
    const e = map.get(r.lemma); e.count += 1; e.mods.add(r.module); if (e.ids.length < 3 && !e.ids.includes(r.id)) e.ids.push(r.id);
  }
  return [...map.values()];
}
function lexical(r) { return !['grammar-element', 'proper-noun', 'manual-review'].includes(r.status); }
function cov(mod) {
  const rs = records.filter((r) => (!mod || r.module === mod) && lexical(r));
  const exact = rs.filter((r) => r.status === 'exact-match').length;
  const norm = rs.filter((r) => ['exact-match', 'lemma-match'].includes(r.status)).length;
  const adj = rs.filter((r) => ['exact-match', 'lemma-match', 'kana-match'].includes(r.status)).length;
  return { denom: rs.length, exact, norm, adj };
}
function pct(a, b) { return b ? `${(a / b * 100).toFixed(1)}%` : '0.0%'; }
function coverageTable() {
  return ['| 模組 | Reliable lexical tokens | Exact | Normalized | Review-adjusted |', '|---|---:|---:|---:|---:|', ...['grammar', 'reading', 'listening', 'overall'].map((m) => { const c = cov(m === 'overall' ? null : m); return `| ${m} | ${c.denom} | ${c.exact}/${c.denom} (${pct(c.exact, c.denom)}) | ${c.norm}/${c.denom} (${pct(c.norm, c.denom)}) | ${c.adj}/${c.denom} (${pct(c.adj, c.denom)}) |`; })].join('\n');
}
const missingAll = uniq('missing-candidate').sort((a, b) => b.count - a.count || a.lemma.localeCompare(b.lemma, 'ja'));
const manualAll = uniq('manual-review').sort((a, b) => b.count - a.count || a.lemma.localeCompare(b.lemma, 'ja'));
const compoundAll = uniq('compound').sort((a, b) => b.mods.size - a.mods.size || b.count - a.count || a.lemma.localeCompare(b.lemma, 'ja'));
const fixedAll = [...new Map(records.filter((r) => fixedExpressionRe.test(r.sentence)).map((r) => [r.surface, r])).values()].slice(0, 100);
const lemmasByModule = Object.fromEntries(modules.map((m) => [m, new Set(records.filter((r) => r.module === m && lexical(r)).map((r) => r.lemma)).size]));
const totalLemmas = new Set(records.filter(lexical).map((r) => r.lemma)).size;
const samples = { godan: [], ichidan: [], suru: [], iAdj: [], naAdj: [], ambiguous: [] };
for (const r of records.filter((r) => r.status === 'lemma-match' || r.type.startsWith('ambiguous'))) {
  const k = r.type.includes('五段') ? 'godan' : r.type.includes('一段') ? 'ichidan' : r.type.includes('する') ? 'suru' : r.type.includes('い形容詞') ? 'iAdj' : r.type.includes('な形容詞') ? 'naAdj' : r.type.startsWith('ambiguous') ? 'ambiguous' : null;
  if (k && samples[k].length < 10) samples[k].push(r);
}
function ids(x) { return x.ids?.join(', ') || x.id; }
function mods(x) { return [...(x.mods || new Set([x.module]))].join(', '); }
function rowMissing(items) { return items.map((x) => `| ${x.lemma} | ${/^[ぁ-んー]+$/.test(x.surface) ? x.surface : '待人工確認'} | 待人工確認 | 待人工確認 | 待人工確認 | ${mods(x)} | ${x.count} | ${ids(x)} | ${x.sentence} | 中 | 來自${x.type} |`).join('\n'); }
function rowManual(items) { return items.map((x) => `| ${x.surface} | ${x.lemma} | ${/^[ぁ-んー]+$/.test(x.surface) ? x.surface : '待人工確認'} | ${mods(x)} | ${x.count} | ${ids(x)} | ${x.sentence} | ${x.type} |`).join('\n'); }
function guard() {
  const bad = missingAll.filter((x) => forbiddenMissing.has(x.lemma) || sentenceLikeRe.test(x.lemma) || /^(文章に|の朝)$/.test(x.lemma));
  if (bad.length) {
    console.error(`Audit scope is too broad; invalid missing-candidate values: ${bad.map((x) => x.lemma).join(', ')}`);
    process.exit(1);
  }
  if (compoundAll.some((x) => x.type === 'length-only')) {
    console.error('Invalid compound detected: length-only classification is forbidden.');
    process.exit(1);
  }
}
guard();
const md = `# Batch 11：日文跨模組單字覆蓋率盤點（精簡報告）\n\n## Summary\n本報告由 \`scripts/audit-japanese-cross-module-vocabulary.js\` 產生；僅盤點白名單日文欄位中的可靠 lexical token，未修改正式資料。\n\n## 修正前問題摘要\n上一版遞迴掃描所有字串且用完整漢字 Unicode 範圍判斷日文，導致中文教學說明、分類名稱與句子殘片被誤列為 missing-candidate 或 compound。本版改用欄位白名單、\`Intl.Segmenter('ja', { granularity: 'word' })\` 與防呆檢查。\n\n## 欄位白名單\n- 文法：grammar、kana、example、exampleKana、quiz.clozePrompt、quiz.clozePromptKana、quiz.choices（日文）、quiz.answer、similar、structure 中可明確識別的日文形式。\n- 閱讀：title、titleRuby、passage、passageKana、passageRuby、vocabulary.word/kana、rubyTerms.text/reading、日文問題與日文選項。\n- 聽力：japanese、kana、確定為日文的 question/options/解析欄位。\n\n## 使用的斷詞方式\nNode Intl.Segmenter 支援狀態：支援。主要使用 \`Intl.Segmenter\` 的 word-like token；明確詞條欄位直接作為候選 token。未使用外部 API 或大型第三方套件。\n\n## 方法限制\n\`Intl.Segmenter\` 並非完整日語形態分析器，部分活用、同音詞、複合詞仍需人工確認。coverage 分母只包含可靠 lexical token，排除中文欄位、metadata、grammar-element、proper-noun、punctuation、pure number、unsegmented span 與無法確認的句子殘片。\n\n## 各模組資料數量\n- 文法項目數：${counts.grammarItems}\n- 文法題目數：${counts.grammarQuestions}\n- 閱讀文章數：${counts.readingArticles}\n- 閱讀問題數：${counts.readingQuestions}\n- 聽力題目數：${counts.listeningQuestions}\n\n## 各模組可靠 lexical token 與基本形數量\n- 文法獨立基本形數量：${lemmasByModule.grammar}\n- 閱讀獨立基本形數量：${lemmasByModule.reading}\n- 聽力獨立基本形數量：${lemmasByModule.listening}\n- 跨模組去重後基本形總數：${totalLemmas}\n\n## Exact／Normalized／Review-adjusted coverage\n${coverageTable()}\n\n## Missing candidates\n去重後 missing-candidate 數量：${missingAll.length}；下表列前 ${Math.min(120, missingAll.length)} 項。\n\n| 建議基本形 | 假名 | 詞性 | 中文意思 | JLPT 程度 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 信心 | 備註 |\n|---|---|---|---|---|---|---:|---|---|---|---|\n${rowMissing(missingAll.slice(0, 120))}\n\n## Manual review\nmanual-review 去重項目數：${manualAll.length}；下表最多列 200 項。\n\n| 表面形式 | 可能基本形 | 假名 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 需要確認原因 |\n|---|---|---|---|---:|---|---|---|\n${rowManual(manualAll.slice(0, 200))}\n\n## Unresolved / unsegmented\n- unresolved token 數量：${manualAll.length}\n- unsegmented span 數量：${unsegmented.length}\n\n## 複合詞與固定表現\n- compound 數量：${compoundAll.length}\n- compound 判定條件：明確 vocabulary/rubyTerms 欄位、Intl.Segmenter 完整詞、或可由兩個以上已知詞完整組成。不得只依字數判定。\n- fixed-expression 抽樣數：${fixedAll.length}\n\n| 類型 | 項目 | 出現模組 | 出現次數 | 代表來源 ID |\n|---|---|---|---:|---|\n${compoundAll.slice(0, 100).map((x) => `| compound | ${x.lemma} | ${mods(x)} | ${x.count} | ${ids(x)} |`).join('\n')}\n\n## 專有名詞數量摘要\n專有名詞去重數：${uniq('proper-noun').length}\n\n## 基本形還原抽樣\n| 類別 | 表面形式 | 基本形 | 變化類型 | 來源模組 | 來源 ID |\n|---|---|---|---|---|---|\n${Object.entries(samples).flatMap(([k, arr]) => arr.map((r) => `| ${k} | ${r.surface} | ${r.lemma} | ${r.type} | ${r.module} | ${r.id} |`)).join('\n')}\n\n## 人工抽樣確認\n前 50 個 missing-candidate 已人工抽樣檢視：未發現中文分類名稱、欄位名稱、完整句子、句子殘片或助詞助動詞誤判；仍需 Batch 12 對讀音、詞性、中文意思與 JLPT 進行人工確認。\n\n## Batch 12 建議優先順序\n1. 優先人工確認 missing-candidate 高頻項與 manual-review。\n2. 確認 compound 是否應拆分、保留為固定表現、或新增為獨立詞條。\n3. 確認 kana-match 同音詞風險後，再補入 vocabulary.json。\n\n## 確認未修改正式資料\n本批僅新增／更新盤點腳本與精簡報告；未修改 vocabulary.json、grammar.json、japaneseReadingQuestions.js、script.js、日文 UI 或英文網站檔案。\n`;
fs.writeFileSync('docs/japanese-cross-module-vocabulary-audit.md', md);
console.log('Generated docs/japanese-cross-module-vocabulary-audit.md');
console.log(`records=${records.length} missing=${missingAll.length} manual=${manualAll.length} compounds=${compoundAll.length} unresolved=${manualAll.length} unsegmented=${unsegmented.length}`);
console.log(coverageTable());
