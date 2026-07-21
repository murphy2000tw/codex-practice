const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const failures = [];
const assert = (ok, msg) => { if (!ok) failures.push(msg); };

function makeElement() { return { hidden:false, dataset:{}, style:{}, children:[], textContent:'', setAttribute(){}, addEventListener(){}, append(...n){this.children.push(...n);}, appendChild(n){this.children.push(n);return n;}, replaceChildren(...n){this.children=n;}, querySelector(){return makeElement();}, querySelectorAll(){return [];}, classList:{add(){},remove(){},toggle(){},contains(){return false;}} }; }
function createStore(throws = false) { const data = new Map(); return { data, getItem(k){ if (throws) throw new Error('blocked'); return data.has(k) ? data.get(k) : null; }, setItem(k,v){ if (throws) throw new Error('blocked'); data.set(k,String(v)); }, removeItem(k){ if (throws) throw new Error('blocked'); data.delete(k); } }; }
function loadApi(store = createStore()) { const sandbox = { console:{ warn(){}, log(){}, error(){} }, setTimeout(){}, clearTimeout(){}, window:{ localStorage:store, JAPANESE_VOCABULARY_URL:'vocabulary.json', JAPANESE_GRAMMAR_URL:'grammar.json' }, document:{ querySelector(){return makeElement();}, querySelectorAll(){return [];}, getElementById(){return null;}, createElement(){return makeElement();}, body:makeElement() }, CSS:{ escape:String }, SpeechSynthesisUtterance:function(){} }; sandbox.window.window=sandbox.window; sandbox.window.document=sandbox.document; vm.createContext(sandbox); vm.runInContext(script, sandbox); return { api:sandbox.window, store }; }

assert(/sentenceComposition:\s*\{\s*module:\s*"grammar",\s*keyParts:\s*\["module",\s*"questionType",\s*"itemId"\]/.test(script), 'sentenceComposition type must use grammar:sentenceComposition:<questionId>');
assert(/sentenceComposition:\s*"句子重組"/.test(script), 'mistake book label must be 句子重組');
assert((script.match(/japanese_mistake_book_v1/g) || []).length > 0 && !/sentenceComposition.*localStorage\.setItem|localStorage\.setItem.*sentenceComposition/.test(script), 'must reuse existing mistake-book key and not add sentence composition storage keys');
assert(/function recordSentenceCompositionQuizMistake\(question, selectedChunkId, correctStarChunkId\)[\s\S]*questionType:\s*"sentenceComposition"/.test(script), 'dedicated quiz mistake helper missing');
assert(/function confirmSentenceCompositionQuizAnswer\(\)[\s\S]*sentenceCompositionQuizLocked = true;[\s\S]*if \(currentSentenceCompositionQuizAnswer !== correctStarChunkId\) recordSentenceCompositionQuizMistake/.test(script), 'only locked wrong quiz confirmation may record');
assert(!/submitSentenceCompositionAnswer[\s\S]{0,500}recordSentenceCompositionQuizMistake/.test(script), 'practice mode must not record');
assert(/warnJapaneseMistakeMissingIdOnce\("grammar:sentenceComposition"\)/.test(script), 'missing questionId must warn once and skip');
const resultBlock = script.slice(script.indexOf('function renderJapaneseSentenceCompositionQuizComplete'), script.indexOf('function openJapaneseSentenceCompositionPractice'));
assert(!/recordSentenceCompositionQuizMistake|recordJapaneseMistake/.test(resultBlock), 'result page must not write mistake records');
['questionId','level','before','after','chunks','starSlot','correctOrder','selectedChunkId','correctStarChunkId','completeSentence','kana','meaning','explanation','source'].forEach((field)=>assert(script.includes(field), `snapshot field ${field} missing`));
['難度','題目句型／空格位置','使用者選擇','正確星號位置選項','完整正確排列','完整句子','假名','中文意思','解說','出處','答錯次數','最近答錯時間'].forEach((text)=>assert(script.includes(text), `display field ${text} missing`));
assert(/findSentenceCompositionById[\s\S]*sentenceCompositionQuestions\.find/.test(script) && /resolveSentenceCompositionMistakeQuestion[\s\S]*record\.chunks/.test(script), 'must prefer live bank and fall back to snapshot');
assert(!/innerHTML\s*=/.test(script.slice(script.indexOf('function appendSentenceCompositionMistakeFields'), script.indexOf('function selectSentenceCompositionQuizChunk'))), 'sentence composition mistake rendering must use safe DOM APIs');
assert(/removeJapaneseMistake\(key\)/.test(script), 'single-record removal must use dedupe key');
assert(/clearJapaneseMistakeBook\(\); renderJapaneseMistakeBookPage\("已清空錯題本"\)/.test(script), 'clear mistake book behavior missing');
assert(/\.\.\/script\.js\?v=3\.3/.test(html), 'script cache must be v3.3');
assert(/\.\.\/style\.css\?v=2\.9/.test(html), 'style cache must remain v2.9');
assert(/SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT/.test(script) && /renderJapaneseSentenceCompositionPractice/.test(script) && /renderJapaneseSentenceCompositionQuizComplete/.test(script), 'existing practice, quiz, and result page must remain present');

const { api, store } = loadApi();
assert(api.createJapaneseMistakeDedupeKey({ module:'grammar', questionType:'sentenceComposition', itemId:'sc-1', relatedId:'sc-1' }) === 'grammar:sentenceComposition:sc-1', 'sentenceComposition dedupe key mismatch');
api.recordJapaneseMistake({ module:'grammar', questionType:'sentenceComposition', itemId:'sc-1', relatedId:'sc-1', questionId:'sc-1', level:'N5', before:'私は', after:'行きます', chunks:[{id:'a',text:'学校へ'}], starSlot:1, correctOrder:['a'], selectedChunkId:'b', correctStarChunkId:'a', completeSentence:'私は学校へ行きます', kana:'わたしはがっこうへいきます', meaning:'我去學校', explanation:'助詞へ', source:'fixture', userAnswer:'2. 駅へ', correctAnswer:'1. 学校へ' }, new Date('2026-01-01T00:00:00.000Z'));
let rec = api.readJapaneseMistakeBook().itemsById['grammar:sentenceComposition:sc-1'];
const createdAt = rec && rec.createdAt;
api.recordJapaneseMistake({ module:'grammar', questionType:'sentenceComposition', itemId:'sc-1', relatedId:'sc-1', questionId:'sc-1', selectedChunkId:'c', correctStarChunkId:'a', userAnswer:'3. 図書館へ', correctAnswer:'1. 学校へ' }, new Date('2026-01-02T00:00:00.000Z'));
rec = api.readJapaneseMistakeBook().itemsById['grammar:sentenceComposition:sc-1'];
assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 1 && rec.wrongCount === 2, 'repeat wrong must dedupe and increment to 2');
assert(rec.createdAt === createdAt && rec.updatedAt === '2026-01-02T00:00:00.000Z' && rec.lastWrongAt === rec.updatedAt && rec.userAnswer === '3. 図書館へ' && rec.selectedChunkId === 'c', 'repeat wrong must preserve createdAt and update timestamps/latest answer');
const beforeCorrect = JSON.stringify(api.readJapaneseMistakeBook());
assert(JSON.stringify(api.readJapaneseMistakeBook()) === beforeCorrect, 'correct answers must not record or delete existing mistakes');
api.recordJapaneseMistake({ module:'grammar', questionType:'sentenceComposition', userAnswer:'x', correctAnswer:'y' });
assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 1, 'missing questionId/itemId must skip safely');
api.recordJapaneseMistake({ module:'vocabulary', questionType:'vocabularyMeaning', itemId:'v1', relatedId:'v1', userAnswer:'x', correctAnswer:'y' });
api.removeJapaneseMistake('grammar:sentenceComposition:sc-1');
assert(!api.hasJapaneseMistake('grammar:sentenceComposition:sc-1') && api.hasJapaneseMistake('vocabulary:vocabularyMeaning:v1'), 'single delete must not affect other mistakes');
store.data.set('japanese_vocabulary_seen_counts', 'keep'); store.data.set('japanese_grammar_seen_counts', 'keep'); store.data.set('japanese_listening_seen_counts', 'keep');
api.clearJapaneseMistakeBook();
assert(store.data.get('japanese_vocabulary_seen_counts') === 'keep' && store.data.get('japanese_grammar_seen_counts') === 'keep' && store.data.get('japanese_listening_seen_counts') === 'keep', 'clear must not affect other storage keys');
store.data.set('japanese_mistake_book_v1', '{bad json'); assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 0, 'malformed JSON must read empty');
const fallback = loadApi(createStore(true)).api; fallback.recordJapaneseMistake({ module:'grammar', questionType:'sentenceComposition', itemId:'sc-f', relatedId:'sc-f', userAnswer:'x', correctAnswer:'y' }); assert(fallback.hasJapaneseMistake('grammar:sentenceComposition:sc-f'), 'storage fallback must work');

if (failures.length) { console.error('Batch 16C-2B-3 sentence composition mistake-book check failed:'); failures.forEach(f => console.error(`- ${f}`)); process.exit(1); }
console.log('Batch 16C-2B-3 sentence composition mistake-book check passed.');
