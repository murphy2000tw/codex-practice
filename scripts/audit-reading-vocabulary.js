const fs = require('fs');
const path = require('path');
const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));
const readingSets = window.JAPANESE_READING_SETS || [];
const vocabulary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vocabulary.json'), 'utf8'));
const byWord = new Map();
const byKana = new Map();
for (const item of vocabulary) {
  if (!byWord.has(item.word)) byWord.set(item.word, []);
  byWord.get(item.word).push(item);
  if (!byKana.has(item.kana)) byKana.set(item.kana, []);
  byKana.get(item.kana).push(item);
}
const manual = {
  郵便局:['ゆうびんきょく','名詞','郵局','高'], 荷物:['にもつ','名詞','行李、包裹','高'], 窓口:['まどぐち','名詞','窗口、櫃台','中'], 必要:['ひつよう','な形容詞/名詞','必要','高'], 普通:['ふつう','な形容詞/名詞','普通','高'],
  申込:['もうしこみ','名詞','申請、報名','高'], 料理教室:['りょうりきょうしつ','名詞','料理教室','中'], 参加:['さんか','名詞/する動詞','參加','高'], 持ち物:['もちもの','名詞','攜帶物品','中'], 締切:['しめきり','名詞','截止期限','中'],
  図書館:['としょかん','名詞','圖書館','高'], 返却:['へんきゃく','名詞/する動詞','歸還','中'], 延長:['えんちょう','名詞/する動詞','延長','中'], 資料:['しりょう','名詞','資料','高'], 辞書:['じしょ','名詞','字典','高'],
  台風:['たいふう','名詞','颱風','高'], 予定:['よてい','名詞/する動詞','預定','高'], 中止:['ちゅうし','名詞/する動詞','中止','高'], 連絡:['れんらく','名詞/する動詞','聯絡','高'], 安全:['あんぜん','な形容詞/名詞','安全','高'],
  病院:['びょういん','名詞','醫院','高'], 予約:['よやく','名詞/する動詞','預約','高'], 保険証:['ほけんしょう','名詞','健保卡、保險證','中'], 受付:['うけつけ','名詞','櫃台、受理','高'], 薬局:['やっきょく','名詞','藥局','中'],
  地震:['じしん','名詞','地震','高'], 避難:['ひなん','名詞/する動詞','避難','中'], 階段:['かいだん','名詞','樓梯','高'], 出口:['でぐち','名詞','出口','高'], 放送:['ほうそう','名詞/する動詞','廣播','中'],
  面接:['めんせつ','名詞/する動詞','面試','中'], 履歴書:['りれきしょ','名詞','履歷表','中'], 経験:['けいけん','名詞/する動詞','經驗','高'], 店長:['てんちょう','名詞','店長','中'], 制服:['せいふく','名詞','制服','中'],
  洗濯機:['せんたくき','名詞','洗衣機','高'], 故障:['こしょう','名詞/する動詞','故障','中'], 修理:['しゅうり','名詞/する動詞','修理','高'], 保証書:['ほしょうしょ','名詞','保證書','中'], 電器店:['でんきてん','名詞','電器行','低'],
  観光:['かんこう','名詞/する動詞','觀光','高'], 案内所:['あんないじょ','名詞','服務處、詢問處','中'], 地図:['ちず','名詞','地圖','高'], 名所:['めいしょ','名詞','名勝','中'], 入場料:['にゅうじょうりょう','名詞','入場費','中'],
  会議:['かいぎ','名詞/する動詞','會議','高'], 資料:['しりょう','名詞','資料','高'], 部長:['ぶちょう','名詞','部長','中'], 印刷:['いんさつ','名詞/する動詞','印刷','中'], 準備:['じゅんび','名詞/する動詞','準備','高'],
  相談:['そうだん','名詞/する動詞','商量、諮詢','高'], 大家:['おおや','名詞','房東','中'], 家賃:['やちん','名詞','房租','中'], 騒音:['そうおん','名詞','噪音','中'], 引っ越し:['ひっこし','名詞/する動詞','搬家','高'],
  工場:['こうじょう','名詞','工廠','高'], 見学:['けんがく','名詞/する動詞','參觀見習','中'], 説明:['せつめい','名詞/する動詞','說明','高'], 機械:['きかい','名詞','機器','高'], 写真:['しゃしん','名詞','照片','高'],
  季節:['きせつ','名詞','季節','高'], 桜:['さくら','名詞','櫻花','高'], 紅葉:['こうよう','名詞/する動詞','紅葉','中'], 気温:['きおん','名詞','氣溫','高'], 景色:['けしき','名詞','景色','高']
};
const verbForms = [
 ['送りたくて','送る','おくる','寄送','郵便局の荷物','たい形＋て形，建議收錄辭書形'],['行きました','行く','いく','去','郵便局の荷物','ます形過去'],['聞きました','聞く','きく','聽、詢問','郵便局の荷物','ます形過去'],['送ることにしました','送る','おくる','寄送','郵便局の荷物','辭書形＋ことにする'],
 ['申し込んでください','申し込む','もうしこむ','申請、報名','料理教室の申込','て形＋ください'],['持って来てください','持って来る','もってくる','帶來','料理教室の申込','て形＋ください'],['調べました','調べる','しらべる','調查、查詢','図書館の本','ます形過去'],['返してください','返す','かえす','歸還','図書館の本','て形＋ください'],
 ['開けないでください','開ける','あける','打開','台風の日','ないでください'],['連絡します','連絡する','れんらくする','聯絡','台風の日','ます形'],['予約しました','予約する','よやくする','預約','病院の予約','ます形過去'],['見せてください','見せる','みせる','給……看','病院の予約','て形＋ください'],
 ['逃げてください','逃げる','にげる','逃離','地震の訓練','て形＋ください'],['使わないでください','使う','つかう','使用','地震の訓練','ないでください'],['受けました','受ける','うける','接受、參加','アルバイトの面接','ます形過去'],['働けます','働く','はたらく','工作','アルバイトの面接','可能形'],
 ['動かなくなりました','動く','うごく','運轉、動','洗濯機の故障','否定連用＋なる'],['修理してもらう','修理する','しゅうりする','請人修理','洗濯機の故障','て形＋もらう'],['もらいました','もらう','もらう','收到','観光案内所','ます形過去'],['回るつもりです','回る','まわる','巡遊、繞行','観光案内所','辭書形＋つもり'],
 ['始まる前','始まる','はじまる','開始','会議の準備','辭書形'],['配りました','配る','くばる','分發','会議の準備','ます形過去'],['困っています','困る','こまる','困擾','アパートの相談','ている'],['引っ越そうか','引っ越す','ひっこす','搬家','アパートの相談','意向形'],
 ['見学しました','見学する','けんがくする','參觀見習','工場見学','ます形過去'],['撮ってはいけません','撮る','とる','拍攝','工場見学','てはいけない'],['咲く','咲く','さく','開花','日本の季節','辭書形'],['見に行く','見に行く','みにいく','去看','日本の季節','目的＋行く']
];
const termMap = new Map();
function addTerm(word,kana,source,pos='閱讀資料',kind='') { if (!word) return; const key=word; const sourceTitle = typeof source === 'string' ? source : source.title; if(!termMap.has(key)) termMap.set(key,{word,kana:kana||'',sources:new Set(),positions:new Set(),kind}); const t=termMap.get(key); if(kana&&!t.kana)t.kana=kana; if(sourceTitle)t.sources.add(sourceTitle); if(pos)t.positions.add(pos); }
for (const set of readingSets) {
 addTerm(set.title, set.titleRuby, set.title, 'title','title');
 (set.vocabulary||[]).forEach(v=>addTerm(v.word,v.kana,set,'vocabulary','vocabulary'));
 (set.rubyTerms||[]).forEach(r=>addTerm(r.text,r.reading,set,'rubyTerms','ruby'));
}
const terms=[...termMap.values()].sort((a,b)=>a.word.localeCompare(b.word,'ja'));
const existing=[], missing=[], confirm=[];
for(const t of terms){ const hits=byWord.get(t.word)||[]; const kanaHits=t.kana?(byKana.get(t.kana)||[]):[]; const note=[]; if(hits.length){ const hit=hits[0]; if(t.kana && hit.kana!==t.kana) note.push(`單字庫假名為 ${hit.kana}`); existing.push({...t,hit,note:note.join('；')||'已收錄'}); } else { const m=manual[t.word]; const sameKana=kanaHits.length?`同假名單字庫詞：${kanaHits.map(x=>x.word).join('、')}`:''; const needs=!m || sameKana; const row={...t, kana:t.kana||(m&&m[0])||'', pos:(m&&m[1])||'待確認', meaning:(m&&m[2])||'待確認', level:needs?'人工確認':(m&&m[3])||'中', note:sameKana||(!m?'讀音/意思/詞性需人工確認':'建議收錄')}; missing.push(row); if(needs) confirm.push(row); } }
const qCount=readingSets.reduce((n,s)=>n+(s.questions||[]).length,0);
function esc(s){return String(s??'').replace(/\|/g,'／').replace(/\n/g,' ')}
function row(cols){return `| ${cols.map(esc).join(' | ')} |`}
let md = `# 閱讀文章單字盤點與單字庫差異檢查\n\n## 1. 檢查摘要\n\n* 檢查了哪些檔案：\`japaneseReadingQuestions.js\`、\`script.js\`、\`vocabulary.json\`、\`scripts/check-reading-ruby.js\`。\n* 閱讀文章總數：${readingSets.length}\n* 題目總數：${qCount}\n* 初步盤點出的詞彙數量：${terms.length}\n* 已存在於單字庫的詞彙數量：${existing.length}\n* 尚未收錄於單字庫的候選詞彙數量：${missing.length}\n* 需要人工確認的詞彙數量：${confirm.length}\n\n## 2. 已存在於單字庫的閱讀詞彙\n\n| 單字 | 假名 | 詞性 | 中文意思 | 來源文章 | 備註 |\n| -- | -- | -- | ---- | ---- | -- |\n`;
existing.forEach(e=>{md+=row([e.word,e.hit.kana,e.hit.partOfSpeech,e.hit.meaning,[...e.sources].join('、'),e.note])+'\n'});
md += `\n## 3. 尚未收錄於單字庫的候選詞彙\n\n| 建議收錄單字 | 假名 | 建議詞性 | 中文意思草案 | 來源文章 | 出現位置 | 建議等級 | 備註 |\n| ------ | -- | ---- | ------ | ---- | ---- | ---- | -- |\n`;
missing.forEach(m=>{md+=row([m.word,m.kana,m.pos,m.meaning,[...m.sources].join('、'),[...m.positions].join('、'),m.level,m.note])+'\n'});
md += `\n## 4. 動詞變化形回推清單\n\n| 文章中出現 | 建議辭書形 | 假名 | 中文意思 | 來源文章 | 備註 |\n| ----- | ----- | -- | ---- | ---- | -- |\n`;
verbForms.forEach(v=>{md+=row(v)+'\n'});
md += `\n## 5. ruby / vocabulary 差異檢查\n\n| 詞 | 假名 | 是否存在於單字庫 | 來源文章 | 問題 |\n| - | -- | -------- | ---- | -- |\n`;
terms.filter(t=>t.kind==='ruby'||t.kind==='vocabulary').forEach(t=>{ const hit=(byWord.get(t.word)||[])[0]; let problem=hit?'單字庫有；可檢查是否也需補 rubyTerms':'ruby/vocabulary 有，但單字庫沒有'; if(hit&&t.kana&&hit.kana!==t.kana) problem=`假名不一致：ruby/vocabulary=${t.kana}，單字庫=${hit.kana}`; md+=row([t.word,t.kana,hit?'是':'否',[...t.sources].join('、'),problem])+'\n'; });
md += `\n## 6. 建議下一步\n\n### A. 安全加入單字庫的詞彙\n\n優先處理建議等級「高」且已有明確假名、詞性與中文意思草案的生活常見詞，例如：${missing.filter(x=>x.level==='高').slice(0,20).map(x=>`\`${x.word}\``).join('、')}。\n\n### B. 需要人工確認後再加入的詞彙\n\n建議等級為「人工確認」的項目應先確認讀音、詞性、是否為專有名詞或是否只是文章標題組合詞，再決定是否收錄。\n\n### C. 不建議加入或暫緩加入的詞彙\n\n人名、單篇標題組合詞、過長片語與只為 ruby 顯示服務的低頻詞可暫緩加入，避免正式單字庫膨脹。\n\n### D. 若要正式執行方案 C，建議採用的資料格式與流程\n\n1. 先以本報告「高」與「中」等級候選詞建立小批次匯入清單。\n2. 每筆資料補齊 \`level\`、\`word\`、\`kana\`、\`meaning\`、\`partOfSpeech\`、\`example\`、\`exampleKana\`、\`exampleMeaning\`。\n3. 動詞一律以辭書形收錄，變化形只放在例句或備註。\n4. 匯入前再次檢查同漢字不同假名、同假名不同意思與重複 \`word\`。\n5. 匯入後執行 JSON 驗證、網站健康檢查與 ruby 檢查。\n`;
fs.writeFileSync(path.join(repoRoot,'docs/reading-vocabulary-audit.md'), md);
console.log(JSON.stringify({readingSets:readingSets.length,questions:qCount,terms:terms.length,existing:existing.length,missing:missing.length,confirm:confirm.length,report:'docs/reading-vocabulary-audit.md'},null,2));
