const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const questions = JSON.parse(fs.readFileSync(path.join(root, 'japaneseSentenceCompositionQuestions.json'), 'utf8'));
const failures = [];
const assert = (ok, msg) => { if (!ok) failures.push(msg); };
const between = (src, start, end) => { const a = src.indexOf(start); if (a < 0) return ''; const b = end ? src.indexOf(end, a + start.length) : -1; return src.slice(a, b >= 0 ? b : undefined); };
function extractById(source, id) {
  const marker = source.indexOf(`id="${id}"`); if (marker < 0) return '';
  const open = source.lastIndexOf('<', marker); const tag = source.slice(open).match(/^<([a-z0-9-]+)/i)?.[1]; if (!tag) return '';
  let depth = 0; const re = new RegExp(`<\\/?${tag}(?:\\s|>|/)`, 'gi'); re.lastIndex = open; let m;
  while ((m = re.exec(source))) { depth += source[m.index + 1] === '/' ? -1 : 1; if (depth === 0) return source.slice(open, re.lastIndex); }
  return '';
}
const home = extractById(html, 'japaneseHomeContent');
const grammarMenu = extractById(html, 'japaneseGrammarMenuView');
const scBlock = between(script, 'function resetJapaneseSentenceCompositionPracticeState', 'function openJapaneseSentenceCompositionPractice');
const practiceRender = between(script, 'function renderJapaneseSentenceCompositionPractice', 'function createSentenceCompositionFeedback');
const feedbackRender = between(script, 'function createSentenceCompositionFeedback', 'function selectSentenceCompositionChunk');
const quizSetup = between(script, 'function renderJapaneseSentenceCompositionQuizSetup', 'function startSentenceCompositionQuizSetup');
const quizStart = between(script, 'function startSentenceCompositionQuizSetup', 'function buildSentenceCompositionMistakeSnapshot');
const quizRender = between(script, 'function renderJapaneseSentenceCompositionQuizQuestion', 'function selectSentenceCompositionQuizChunk');
const quizConfirm = between(script, 'function confirmSentenceCompositionQuizAnswer', 'function renderJapaneseSentenceCompositionQuizComplete');
const resultRender = between(script, 'function renderJapaneseSentenceCompositionQuizComplete', 'function openJapaneseSentenceCompositionPractice');

// Entry/page structure and cache contracts.
assert(/^b42bab4c6b45f2c4a800d992d790d714726101c6$/.test(require('child_process').execSync('git merge-base HEAD b42bab4c6b45f2c4a800d992d790d714726101c6', { cwd: root, encoding: 'utf8' }).trim()), 'branch must contain PR #272 merge commit b42bab4c6b45f2c4a800d992d790d714726101c6');
assert(/\.\.\/script\.js\?v=3\.3/.test(html), 'script.js cache version must remain v3.3');
assert(/\.\.\/style\.css\?v=2\.9/.test(html), 'style.css cache version must remain v2.9');
assert(/<meta name="viewport" content="width=device-width, initial-scale=1\.0">/.test(html), 'viewport meta must exist');
assert(JSON.stringify([...home.matchAll(/data-japanese-entry="([^"]+)"/g)].map(m => m[1])) === JSON.stringify(['vocabulary','reading','grammar','listening','reviewMenu']), 'Japanese home must keep exactly five main entries');
assert(JSON.stringify([...grammarMenu.matchAll(/data-japanese-grammar-entry="([^"]+)"/g)].map(m => m[1])) === JSON.stringify(['practice','quiz','sentence-composition-practice','sentence-composition-quiz']), 'grammar menu must keep exactly four entries');
['單字','閱讀','文法','聽力','複習中心','文法練習','文法測驗','句子重組練習','句子重組測驗'].forEach(t => assert(html.includes(t), `missing entry label ${t}`));
assert(/title\.textContent = "句子重組"/.test(practiceRender) && /title\.textContent = "句子重組"/.test(quizSetup) && /title\.textContent = "句子重組"/.test(quizRender) && /title\.textContent = "句子重組"/.test(resultRender), 'sentence composition title must be 句子重組');
assert(/練習模式/.test(practiceRender) && /測驗模式/.test(quizSetup) && /測驗模式/.test(quizRender) && /測驗結果/.test(resultRender), 'mode labels must be present');
assert(!/文の組み立て ★格選擇/.test(html + script), 'old title must not reappear');

// Practice contracts.
assert(/\[\["all", "全部"\], \["N5", "N5"\], \["N4", "N4"\]\]/.test(practiceRender), 'practice filters all/N5/N4 must exist');
assert(/createSentenceCompositionQuestionLine/.test(practiceRender) && /question\.before/.test(script) && /question\.after/.test(script), 'JLPT continuous sentence line must remain');
assert(/index === question\.starSlot/.test(script) && /for \(let index = 0; index < 4; index \+= 1\)/.test(script), 'star slot must dynamically render in one of four slots');
assert(/question\.chunks\.forEach\(\(chunk, index\)/.test(practiceRender) && /`\$\{index \+ 1\}\. \$\{chunk\.text\}`/.test(practiceRender), 'option numbering must follow original chunks order');
['答對了','再看看正確順序','★格正確答案','完整正確順序','completeSentence','假名：','中文：','解析：'].forEach(t => assert(feedbackRender.includes(t), `practice feedback missing ${t}`));
assert(!/score|correctCount|wrongCount|recordSentenceCompositionQuizMistake|recordJapaneseMistake/.test(between(script, 'function submitSentenceCompositionAnswer', 'function startNextSentenceCompositionQuestion')), 'practice must not score or write mistake book');
assert(/pool\.filter\(\(question\) => question\.id !== previousSentenceCompositionQuestionId\)/.test(script), 'practice next question should avoid immediate repeat');
assert(/function returnToJapaneseGrammarMenu[\s\S]*resetJapaneseSentenceCompositionState\(\)/.test(script), 'return to grammar menu must clear sentence-composition content/state');

// Quiz/result contracts.
assert(/const SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT = 5/.test(script) && /shuffled\.slice\(0, SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT\)/.test(script), 'quiz must draw fixed five questions');
assert(/const shuffled = pool\.slice\(\);[\s\S]*return shuffled\.slice\(0, SENTENCE_COMPOSITION_QUIZ_QUESTION_COUNT\)/.test(script), 'quiz draw must shuffle a copied pool and slice five unique questions');
assert(/第 \$\{currentSentenceCompositionQuizIndex \+ 1\} 題／共 \$\{sentenceCompositionQuizQuestions\.length\} 題/.test(quizRender), 'quiz progress must be shown');
assert(/confirm\.disabled = sentenceCompositionQuizLocked \|\| !currentSentenceCompositionQuizAnswer/.test(quizRender), 'quiz requires selection before confirmation');
assert(/if \(!question \|\| !currentSentenceCompositionQuizAnswer\)/.test(quizConfirm), 'quiz cannot advance without selected answer');
assert(!/(答對|答錯|正確答案|完整正確|假名|中文|解析|completeSentence|kana|meaning|explanation)/.test(quizRender), 'quiz-taking UI must not leak answer details');
assert(/sentenceCompositionQuizCompleted = true;[\s\S]*renderJapaneseSentenceCompositionQuizComplete/.test(quizConfirm), 'fifth question must enter result page');
assert(!/countdown|timer|setInterval|上一題|previousSentenceCompositionQuiz/i.test(scBlock), 'quiz must not add timer or previous-question editing');
assert(/filter\(\(answer\) => answer\?\.isCorrect === true\)\.length/.test(resultRender) && /const wrongCount = actualQuestionCount - correctCount/.test(resultRender) && /Math\.round\(\(correctCount \/ actualQuestionCount\) \* 100\)/.test(resultRender), 'result summary counts/percentage must be calculated correctly');
['使用者答案','★ 正確答案','完整正確排列順序','完整句子','假名','中文','解析'].forEach(t => assert(resultRender.includes(t), `result detail missing ${t}`));
assert(/再測一次/.test(resultRender) && /startSentenceCompositionQuizSetup/.test(resultRender) && /sentenceCompositionQuizAnswers = \[\]/.test(quizStart), 'retry must clear previous quiz answers');
assert(/返回文法選單/.test(resultRender) && !/recordSentenceCompositionQuizMistake|recordJapaneseMistake/.test(resultRender), 'result page must not write mistake book and must include grammar-menu return');

// Mistake-book/storage contracts.
assert(/sentenceComposition:\s*\{ module: "grammar", keyParts: \["module", "questionType", "itemId"\] \}/.test(script), 'dedupe key must be grammar:sentenceComposition:<questionId>');
assert(/sentenceComposition: "句子重組"/.test(script), 'mistake type label must be 句子重組');
assert(/japanese_mistake_book_v1/.test(script), 'must use existing mistake-book storage key');
assert(!/localStorage\.setItem\([^)]*sentenceComposition/.test(script), 'must not add sentence-composition-specific localStorage key');
assert(/if \(currentSentenceCompositionQuizAnswer !== correctStarChunkId\) recordSentenceCompositionQuizMistake/.test(quizConfirm), 'only wrong quiz answers may be recorded');
assert(/warnJapaneseMistakeMissingIdOnce\("grammar:sentenceComposition"\)/.test(script), 'missing questionId must warn once and skip');
assert(/findSentenceCompositionById[\s\S]*sentenceCompositionQuestions\.find/.test(script) && /resolveSentenceCompositionMistakeQuestion[\s\S]*record\.chunks/.test(script), 'mistake rendering must prefer live data and fallback to snapshot');
assert(/removeJapaneseMistake\(key\)/.test(script) && /clearJapaneseMistakeBook\(\)/.test(script), 'single delete and clear mistake book behaviors must remain');
assert(/function clearJapaneseMistakeBook\(\)[\s\S]*writeJapaneseMistakeBook\(createEmptyJapaneseMistakeBook\(\)\)/.test(script), 'clear mistake book must only rewrite the existing mistake-book store');
assert(/catch \(error\) \{ return createEmptyJapaneseMistakeBook\(\); \}/.test(script) && /japaneseMistakeBookMemoryRaw/.test(script), 'malformed JSON/storage failure fallback must remain');

// Cross-page isolation.
['openJapaneseSentenceCompositionPractice','openJapaneseSentenceCompositionQuizSetup','returnToJapaneseGrammarMenu','switchJapaneseTab','renderJapaneseView'].forEach(name => assert(script.includes(name), `${name} must exist for navigation isolation`));
assert(/if \(panelView !== "grammar"\) resetJapaneseSentenceCompositionState\(\)/.test(script) && /if \(currentJapaneseView !== "grammar" \|\| !isSentenceCompositionView\) resetJapaneseSentenceCompositionState\(\)/.test(script), 'leaving sentence composition/grammar must reset isolated question/answer/locked/result state');
assert(/resetJapaneseSentenceCompositionQuizSetupState\(\);[\s\S]*resetJapaneseSentenceCompositionPracticeState\(\)/.test(script), 'practice and quiz switching must reset opposite mode state');

// Mobile/accessibility/security static audit.
assert(/document\.createElement\("button"\)/.test(script) && /button\.type = "button"/.test(script), 'options/actions must use real buttons');
assert(/aria-pressed/.test(practiceRender) && /aria-pressed/.test(quizRender), 'options must expose aria-pressed');
assert(/role", "status"/.test(scBlock) || /aria-live/.test(scBlock), 'status messages must use role=status or aria-live');
assert(/:focus-visible/.test(css), 'focus-visible styles must exist');
assert(/@media \(max-width: 640px\)[\s\S]*sentence-composition/.test(css), 'mobile sentence-composition styles must exist');
assert(/\.sentence-composition-line[\s\S]*line-height:[\s\S]*word-break: normal/.test(css) && /\.sentence-composition-chunk[\s\S]*white-space: normal/.test(css), 'mobile/static layout must allow natural wrapping');
assert(/\.sentence-composition-slot[\s\S]*white-space: nowrap[\s\S]*word-break: keep-all/.test(css), '（　） and （★） must not break inside symbols');
assert(/\.sentence-composition-view[\s\S]*env\(safe-area-inset-bottom/.test(css), 'safe-area bottom padding must be preserved');
assert(/textContent/.test(scBlock) && !/innerHTML\s*=/.test(scBlock), 'sentence-composition question/answer text must use textContent/DOM APIs, not innerHTML');
assert(!/console\.log\([^)]*(question|chunks|completeSentence|kana|meaning)/.test(script), 'must not console.log full question content');

// Data integrity.
const ids = new Set(); const levels = { N5: 0, N4: 0 }; const starSlots = [0,0,0,0]; const correctOptionPositions = [0,0,0,0]; let missing = 0; let badOrder = 0;
for (const q of questions) {
  if (!q || !q.id || !q.level || !q.before || !q.after || !Array.isArray(q.chunks) || q.chunks.length !== 4 || !Array.isArray(q.correctOrder) || q.correctOrder.length !== 4 || typeof q.starSlot !== 'number' || !q.completeSentence || !q.kana || !q.meaning || !q.explanation) missing += 1;
  if (ids.has(q.id)) failures.push(`duplicate question ID ${q.id}`); ids.add(q.id); if (levels[q.level] !== undefined) levels[q.level] += 1;
  if (q.starSlot >= 0 && q.starSlot < 4) starSlots[q.starSlot] += 1; else badOrder += 1;
  const chunkIds = new Set((q.chunks || []).map(c => c.id)); if ((q.correctOrder || []).some(id => !chunkIds.has(id)) || new Set(q.correctOrder).size !== 4) badOrder += 1;
  const correctId = q.correctOrder?.[q.starSlot]; const optionIndex = (q.chunks || []).findIndex(c => c.id === correctId); if (optionIndex >= 0) correctOptionPositions[optionIndex] += 1; else badOrder += 1;
}
assert(questions.length === 40, `total must be 40, got ${questions.length}`); assert(levels.N5 === 20 && levels.N4 === 20, `N5/N4 counts must be 20/20, got ${levels.N5}/${levels.N4}`);
assert(ids.size === questions.length, 'duplicate question ID count must be 0'); assert(missing === 0, `missing required fields must be 0, got ${missing}`);
assert(JSON.stringify(starSlots) === JSON.stringify([10,10,10,10]), `starSlot distribution must be 10 each, got ${starSlots}`);
assert(JSON.stringify(correctOptionPositions) === JSON.stringify([10,10,10,10]), `correct option positions must be 10 each, got ${correctOptionPositions}`);
assert(badOrder === 0, `correctOrder/chunks mapping errors must be 0, got ${badOrder}`);

// Storage harness for dedupe/fallback semantics.
function makeElement(){return {hidden:false,dataset:{},style:{},children:[],textContent:'',className:'',setAttribute(){},addEventListener(){},append(...n){this.children.push(...n)},appendChild(n){this.children.push(n);return n},replaceChildren(...n){this.children=n},querySelector(){return makeElement()},querySelectorAll(){return []},classList:{add(){},remove(){},toggle(){},contains(){return false}}};}
function createStore(throws=false){const data=new Map();return{data,getItem(k){if(throws)throw Error('blocked');return data.has(k)?data.get(k):null},setItem(k,v){if(throws)throw Error('blocked');data.set(k,String(v))},removeItem(k){if(throws)throw Error('blocked');data.delete(k)}};}
function loadApi(store=createStore()){const sandbox={console:{warn(){},log(){},error(){}},setTimeout(){},clearTimeout(){},fetch:async()=>({ok:true,json:async()=>questions}),window:{localStorage:store,JAPANESE_SENTENCE_COMPOSITION_URL:'x'},document:{querySelector(){return makeElement()},querySelectorAll(){return[]},getElementById(){return null},createElement(){return makeElement()},body:makeElement()},CSS:{escape:String},SpeechSynthesisUtterance:function(){}};sandbox.window.window=sandbox.window;sandbox.window.document=sandbox.document;vm.createContext(sandbox);vm.runInContext(script,sandbox);return{api:sandbox.window,store};}
const {api, store} = loadApi();
assert(api.createJapaneseMistakeDedupeKey({module:'grammar',questionType:'sentenceComposition',itemId:'sc-1',relatedId:'sc-1'}) === 'grammar:sentenceComposition:sc-1', 'dedupe key mismatch');
api.recordJapaneseMistake({module:'grammar',questionType:'sentenceComposition',itemId:'sc-1',relatedId:'sc-1',questionId:'sc-1',selectedChunkId:'b',correctStarChunkId:'a',userAnswer:'2. x',correctAnswer:'1. y'}, new Date('2026-01-01T00:00:00.000Z'));
let rec = api.readJapaneseMistakeBook().itemsById['grammar:sentenceComposition:sc-1']; const createdAt = rec.createdAt;
api.recordJapaneseMistake({module:'grammar',questionType:'sentenceComposition',itemId:'sc-1',relatedId:'sc-1',questionId:'sc-1',selectedChunkId:'c',correctStarChunkId:'a',userAnswer:'3. z',correctAnswer:'1. y'}, new Date('2026-01-02T00:00:00.000Z'));
rec = api.readJapaneseMistakeBook().itemsById['grammar:sentenceComposition:sc-1'];
assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 1 && rec.wrongCount === 2 && rec.createdAt === createdAt && rec.updatedAt === '2026-01-02T00:00:00.000Z' && rec.lastWrongAt === rec.updatedAt && rec.userAnswer === '3. z', 'repeat wrong must dedupe, preserve createdAt, and update latest fields');
api.recordJapaneseMistake({module:'grammar',questionType:'sentenceComposition',userAnswer:'x',correctAnswer:'y'}); assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 1, 'missing questionId must safely skip');
api.recordJapaneseMistake({module:'vocabulary',questionType:'vocabularyMeaning',itemId:'v1',relatedId:'v1',userAnswer:'x',correctAnswer:'y'}); api.removeJapaneseMistake('grammar:sentenceComposition:sc-1'); assert(!api.hasJapaneseMistake('grammar:sentenceComposition:sc-1') && api.hasJapaneseMistake('vocabulary:vocabularyMeaning:v1'), 'single sentence-composition delete must not affect other mistakes');
store.data.set('japanese_vocabulary_seen_counts','keep'); store.data.set('japanese_grammar_seen_counts','keep'); store.data.set('japanese_listening_seen_counts','keep'); store.data.set('other_key','keep'); api.clearJapaneseMistakeBook(); assert(['japanese_vocabulary_seen_counts','japanese_grammar_seen_counts','japanese_listening_seen_counts','other_key'].every(k => store.data.get(k)==='keep'), 'clear mistake book must not affect other storage data');
store.data.set('japanese_mistake_book_v1','{bad json'); assert(Object.keys(api.readJapaneseMistakeBook().itemsById).length === 0, 'malformed JSON must fallback to empty book');
const fallback = loadApi(createStore(true)).api; fallback.recordJapaneseMistake({module:'grammar',questionType:'sentenceComposition',itemId:'sc-f',relatedId:'sc-f',userAnswer:'x',correctAnswer:'y'}); assert(fallback.hasJapaneseMistake('grammar:sentenceComposition:sc-f'), 'localStorage failure must use in-memory fallback');

if (failures.length) { console.error('Batch 16C-3 final sentence-composition regression audit failed:'); failures.forEach(f => console.error(`- ${f}`)); process.exit(1); }
console.log('Batch 16C-3 final sentence-composition regression audit passed.');
console.log('Mobile coverage: static/DOM audit only; real mobile browser testing remains for post-merge user verification.');
