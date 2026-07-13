#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');

const jpRe = /[ぁ-んァ-ン一-龯々ー]/;
const chunkRe = /[ぁ-んァ-ン一-龯々ー]+/g;
const particleSet = new Set('は が を に で へ と の も や から まで より ね よ な か ぞ こそ でも など だけ しか くらい ぐらい'.split(' '));
const grammarSet = new Set('です ます ない たい た だ でしょう ましょう でした ません たり て で いる ある なる する した して します しました ください'.split(' '));
const proper = new Set('田中 佐藤 山田 東京 大阪 京都 日本 アメリカ 中国 韓国 駅前 図書館'.split(' '));
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function loadWindowFile(p){ const ctx={window:{}, console}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(p,'utf8'), ctx, {filename:p}); return ctx.window; }
const vocab=readJson('vocabulary.json');
const grammar=readJson('grammar.json');
const reading=loadWindowFile('japaneseReadingQuestions.js').JAPANESE_READING_SETS || [];
const el={addEventListener(){}, removeEventListener(){}, classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{}, appendChild(){}, replaceChildren(){}, setAttribute(){}, getAttribute(){return null}, querySelector(){return el}, querySelectorAll(){return[]}, textContent:'', innerHTML:'', value:''};
function extractConstArray(file, name){
  const src=fs.readFileSync(file,'utf8');
  const marker=`const ${name} =`;
  const start=src.indexOf(marker);
  if(start<0) return [];
  const open=src.indexOf('[', start);
  let depth=0, inStr=null, esc=false;
  for(let i=open;i<src.length;i++){
    const ch=src[i];
    if(inStr){ if(esc) esc=false; else if(ch==='\\') esc=true; else if(ch===inStr) inStr=null; continue; }
    if(ch==='\"'||ch==="'"||ch==='`'){ inStr=ch; continue; }
    if(ch==='[') depth++;
    else if(ch===']'){ depth--; if(depth===0) return vm.runInNewContext(src.slice(open,i+1)); }
  }
  return [];
}
const listening=extractConstArray('script.js','JAPANESE_LISTENING_QUESTIONS');

const byWord=new Map(), byKana=new Map();
for(const v of vocab){ byWord.set(v.word, v); if(v.kana){ if(!byKana.has(v.kana)) byKana.set(v.kana, []); byKana.get(v.kana).push(v); } }
const vocabWords=[...byWord.keys()].filter(w=>w && jpRe.test(w)).sort((a,b)=>b.length-a.length || a.localeCompare(b,'ja'));
const suruBases=new Set(vocab.filter(v=>String(v.partOfSpeech||'').includes('する')).map(v=>v.word));
function guessKana(s){ return /^[ぁ-んー]+$/.test(s)?s:'待人工確認'; }
function normalize(surface){
  if(byWord.has(surface)) return {status:'exact-match', lemma:surface, type:'exact'};
  const tries=[];
  if(surface.endsWith('しました')) tries.push([surface.slice(0,-4),'する動詞・丁寧過去']);
  if(surface.endsWith('します')) tries.push([surface.slice(0,-3),'する動詞・丁寧']);
  if(surface.endsWith('して')) tries.push([surface.slice(0,-2),'する動詞・て形']);
  if(surface.endsWith('しない')) tries.push([surface.slice(0,-3),'する動詞・否定']);
  if(surface.endsWith('でした')) tries.push([surface.slice(0,-3),'な形容詞・丁寧過去']);
  if(surface.endsWith('だった')) tries.push([surface.slice(0,-3),'な形容詞・過去']);
  if(surface.endsWith('かった')) tries.push([surface.slice(0,-3)+'い','い形容詞・過去']);
  if(surface.endsWith('くない')) tries.push([surface.slice(0,-3)+'い','い形容詞・否定']);
  if(surface.endsWith('くて')) tries.push([surface.slice(0,-2)+'い','い形容詞・て形']);
  if(surface.endsWith('ませんでした')) tries.push([surface.slice(0,-6)+'る','一段動詞・丁寧否定過去']);
  if(surface.endsWith('ました')) tries.push([surface.slice(0,-3)+'る','一段動詞・丁寧過去'], [surface.slice(0,-3)+'む','五段動詞・丁寧過去'], [surface.slice(0,-3)+'く','五段動詞・丁寧過去']);
  if(surface.endsWith('ます')) tries.push([surface.slice(0,-2)+'る','一段動詞・丁寧'], [surface.slice(0,-2)+'む','五段動詞・丁寧'], [surface.slice(0,-2)+'く','五段動詞・丁寧']);
  if(surface.endsWith('ない')) tries.push([surface.slice(0,-2)+'る','動詞・否定']);
  if(surface.endsWith('て')) tries.push([surface.slice(0,-1)+'る','一段動詞・て形']);
  for(const [lemma,type] of tries){ if(byWord.has(lemma) || suruBases.has(lemma)) return {status:'lemma-match', lemma, type}; }
  if(byKana.has(surface)) return {status:'kana-match', lemma:byKana.get(surface)[0].word, type:'kana'};
  if(particleSet.has(surface)||grammarSet.has(surface)) return {status:'grammar-element', lemma:surface, type:'grammar'};
  if(proper.has(surface)) return {status:'proper-noun', lemma:surface, type:'proper'};
  return null;
}
function collectStrings(obj, path='', out=[]){
  if(typeof obj==='string'){ if(jpRe.test(obj)) out.push({text:obj,path}); return out; }
  if(Array.isArray(obj)) obj.forEach((x,i)=>collectStrings(x,`${path}[${i}]`,out));
  else if(obj&&typeof obj==='object') Object.entries(obj).forEach(([k,v])=>collectStrings(v,path?`${path}.${k}`:k,out));
  return out;
}
const sources=[];
grammar.forEach(g=>collectStrings(g).forEach(s=>sources.push({module:'grammar', id:g.id||'grammar', ...s})));
reading.forEach(r=>collectStrings(r).forEach(s=>sources.push({module:'reading', id:r.id||r.title||'reading', ...s})));
listening.forEach((l,i)=>collectStrings(l).forEach(s=>sources.push({module:'listening', id:l.id||`listening-${i+1}`, ...s})));
const counts={grammarItems:grammar.length, grammarQuestions:grammar.filter(g=>g.quiz).length, readingArticles:reading.length, readingQuestions:reading.reduce((n,r)=>n+(r.questions?.length||0),0), listeningQuestions:listening.length};
const records=[];
function addRecord(surface, source, norm, kind='token'){
  records.push({surface, lemma:norm.lemma||surface, status:norm.status, type:norm.type||'', module:source.module, id:source.id, sentence:source.text.slice(0,80), kind});
}
for(const src of sources){
  for(const chunk of src.text.match(chunkRe)||[]){
    let i=0;
    while(i<chunk.length){
      let matched=null;
      for(const w of vocabWords){ if(w.length>1 && chunk.startsWith(w,i)){ matched=w; break; } }
      if(matched){ addRecord(matched,src,{status:'exact-match',lemma:matched,type:'longest'}); i+=matched.length; continue; }
      let rest=chunk.slice(i); let n=normalize(rest);
      if(n){ addRecord(rest,src,n); break; }
      let next=rest.match(/^[一-龯々ぁ-んァ-ンー]{2,}/)?.[0] || rest[0];
      if(particleSet.has(next)||grammarSet.has(next)) addRecord(next,src,{status:'grammar-element',lemma:next,type:'grammar'});
      else addRecord(next,src,{status: next.length>=4?'compound':(next.length>1?'missing-candidate':'manual-review'), lemma:next, type: next.length>=4?'possible compound':(next.length>1?'candidate':'needs segmentation')});
      i+=next.length;
    }
  }
}
function uniqByLemma(status){ const m=new Map(); for(const r of records.filter(x=>x.status===status)){ const k=r.lemma; if(!m.has(k)) m.set(k,{...r,count:0,mods:new Set(),ids:[]}); const e=m.get(k); e.count++; e.mods.add(r.module); if(e.ids.length<3&&!e.ids.includes(r.id)) e.ids.push(r.id); } return [...m.values()]; }
const modules=['grammar','reading','listening'];
function cov(mod){ const rs=records.filter(r=>!mod||r.module===mod); const exact=rs.filter(r=>r.status==='exact-match').length; const norm=rs.filter(r=>['exact-match','lemma-match'].includes(r.status)).length; const adjDen=rs.filter(r=>!['grammar-element','proper-noun'].includes(r.status)).length; const adjNum=rs.filter(r=>['exact-match','lemma-match','kana-match'].includes(r.status)).length; return {total:rs.length, exact, norm, adjDen, adjNum}; }
const missingAll=uniqByLemma('missing-candidate').sort((a,b)=>b.count-a.count||a.lemma.localeCompare(b.lemma,'ja'));
const missing=missingAll.slice(0,120);
const manual=uniqByLemma('manual-review').sort((a,b)=>b.count-a.count||a.lemma.localeCompare(b.lemma,'ja')).slice(0,200);
const compounds=uniqByLemma('compound').sort((a,b)=>b.mods.size-a.mods.size||b.count-a.count||a.lemma.localeCompare(b.lemma,'ja')).slice(0,100);
const fixed=records.filter(r=>/[てください|なければ|てもいい|ことが|ように]/.test(r.sentence)).slice(0,100);
const lemmasByMod={}; for(const m of modules) lemmasByMod[m]=new Set(records.filter(r=>r.module===m).map(r=>r.lemma)).size;
const totalLemmas=new Set(records.map(r=>r.lemma)).size;
const samples={godan:[],ichidan:[],irregular:[],suru:[],iAdj:[],naAdj:[]};
for(const r of records.filter(r=>r.status==='lemma-match')){ let k=r.type.includes('五段')?'godan':r.type.includes('一段')?'ichidan':r.type.includes('する')?'suru':r.type.includes('い形容詞')?'iAdj':r.type.includes('な形容詞')?'naAdj':r.lemma==='来る'||r.lemma==='する'?'irregular':null; if(k&&samples[k].length<10) samples[k].push(r); }
function pct(a,b){return b?`${(a/b*100).toFixed(1)}%`:'0.0%'}
function coverageTable(){ return ['| 模組 | Exact | Normalized | Review-adjusted |','|---|---:|---:|---:|',...['grammar','reading','listening','overall'].map(m=>{const c=cov(m==='overall'?null:m); return `| ${m} | ${c.exact}/${c.total} (${pct(c.exact,c.total)}) | ${c.norm}/${c.total} (${pct(c.norm,c.total)}) | ${c.adjNum}/${c.adjDen} (${pct(c.adjNum,c.adjDen)}) |`;})].join('\n'); }
function rows(items, type){ return items.map(x=> type==='missing' ? `| ${x.lemma} | ${guessKana(x.surface)} | 待人工確認 | 待人工確認 | 待人工確認 | ${[...x.mods].join(', ')} | ${x.count} | ${x.ids.join(', ')} | ${x.sentence} | 低 | 保守斷詞候選 |` : `| ${x.surface} | ${x.lemma} | ${guessKana(x.surface)} | ${[...x.mods].join(', ')} | ${x.count} | ${x.ids.join(', ')} | ${x.sentence} | 需人工確認斷詞或基本形 |`).join('\n'); }
let md=`# Batch 11：日文跨模組單字覆蓋率盤點（精簡報告）\n\n## Summary\n本報告由 \`scripts/audit-japanese-cross-module-vocabulary.js\` 產生；僅盤點文法、閱讀、聽力中日文內容詞與 \`vocabulary.json\` 的覆蓋狀態，未修改正式資料。\n\n## 檢查檔案\n- vocabulary.json\n- grammar.json\n- japaneseReadingQuestions.js\n- script.js（JAPANESE_LISTENING_QUESTIONS）\n\n## 方法與限制\n採用題庫既有欄位、\`vocabulary.json\` 最長字串比對、保守動詞／形容詞基本形還原與簡易排除助詞助動詞。未使用外部 API 或大型形態分析器；無法可靠切分者列為 manual-review，因此結果不是百分之百形態分析。\n\n## 各模組資料數量\n- 文法項目數：${counts.grammarItems}\n- 文法題目數：${counts.grammarQuestions}\n- 閱讀文章數：${counts.readingArticles}\n- 閱讀問題數：${counts.readingQuestions}\n- 聽力題目數：${counts.listeningQuestions}\n\n## 各模組獨立基本形數量\n- 文法：${lemmasByMod.grammar}\n- 閱讀：${lemmasByMod.reading}\n- 聽力：${lemmasByMod.listening}\n\n## 跨模組去重後基本形總數\n${totalLemmas}\n\n## Exact／Normalized／Review-adjusted coverage\n${coverageTable()}\n\n## Missing candidates\n去重後 missing-candidate 基本形數量：${missingAll.length}；下表列前 ${missing.length} 項。\n\n| 建議基本形 | 假名 | 詞性 | 中文意思 | JLPT 程度 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 信心 | 備註 |\n|---|---|---|---|---|---|---:|---|---|---|---|\n${rows(missing,'missing')}\n\n## Manual review\nmanual-review 去重項目數：${uniqByLemma('manual-review').length}；下表最多列 200 項。\n\n| 表面形式 | 可能基本形 | 假名 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 需要確認原因 |\n|---|---|---|---|---:|---|---|---|\n${rows(manual,'manual')}\n\n## 複合詞與固定表現\n- 複合詞總數：${uniqByLemma('compound').length}\n- 固定表現抽樣數：${fixed.length}\n\n| 類型 | 項目 | 出現模組 | 出現次數 | 代表來源 ID |\n|---|---|---|---:|---|\n${compounds.map(x=>`| 複合詞 | ${x.lemma} | ${[...x.mods].join(', ')} | ${x.count} | ${x.ids.join(', ')} |`).join('\n')}\n\n## 專有名詞數量摘要\n專有名詞去重數：${uniqByLemma('proper-noun').length}\n\n## 動詞及形容詞基本形還原抽樣\n| 類別 | 表面形式 | 基本形 | 變化類型 | 來源模組 | 來源 ID |\n|---|---|---|---|---|---|\n${Object.entries(samples).flatMap(([k,arr])=>arr.map(r=>`| ${k} | ${r.surface} | ${r.lemma} | ${r.type} | ${r.module} | ${r.id} |`)).join('\n')}\n\n## Batch 12 建議優先順序\n1. 優先人工確認 missing-candidate 與 manual-review 高頻項。\n2. 確認複合詞是否應拆分、作為固定表現、或新增為獨立詞條。\n3. 確認 kana-match 的同音詞風險後，再補入 vocabulary.json。\n\n## 確認未修改正式資料\n本批僅新增盤點腳本與精簡報告；未修改 vocabulary.json、grammar.json、japaneseReadingQuestions.js、script.js、japanese/index.html、style.css 或英文網站檔案。\n`;
fs.writeFileSync('docs/japanese-cross-module-vocabulary-audit.md', md);
console.log(`Generated docs/japanese-cross-module-vocabulary-audit.md`);
console.log(`records=${records.length} missing=${missingAll.length} manual=${uniqByLemma('manual-review').length} compounds=${uniqByLemma('compound').length}`);
console.log(coverageTable());
