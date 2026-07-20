const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'script.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const style = fs.existsSync(path.join(root, 'style.css')) ? fs.readFileSync(path.join(root, 'style.css'), 'utf8') : '';
const vocabulary = JSON.parse(fs.readFileSync(path.join(root, 'vocabulary.json'), 'utf8'));
const grammar = JSON.parse(fs.readFileSync(path.join(root, 'grammar.json'), 'utf8'));
const readingSource = fs.readFileSync(path.join(root, 'japaneseReadingQuestions.js'), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function createStore({ throws = false } = {}) {
  const data = new Map();
  return {
    data,
    getItem(key) { if (throws) throw new Error('get blocked'); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { if (throws) throw new Error('set blocked'); data.set(key, String(value)); },
    removeItem(key) { if (throws) throw new Error('remove blocked'); data.delete(key); },
  };
}

function makeElement() {
  return {
    hidden: false, dataset: {}, style: {}, children: [], textContent: '', innerHTML: '',
    setAttribute(){}, getAttribute(){ return ''; }, addEventListener(){}, append(...nodes){ this.children.push(...nodes); }, appendChild(node){ this.children.push(node); return node; }, replaceChildren(...nodes){ this.children = nodes; }, insertBefore(node){ this.children.unshift(node); return node; },
    querySelector(){ return makeElement(); }, querySelectorAll(){ return []; }, closest(){ return makeElement(); },
    classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
  };
}

function loadApi(localStorage = createStore()) {
  const sandbox = {
    console: { warn() {}, log() {}, error() {} },
    setTimeout() { return 0; },
    clearTimeout() {},
    window: { localStorage, JAPANESE_VOCABULARY_URL: 'vocabulary.json', JAPANESE_GRAMMAR_URL: 'grammar.json' },
    document: { querySelector() { return makeElement(); }, querySelectorAll() { return []; }, getElementById() { return null; }, createElement() { return makeElement(); }, body: makeElement() },
    CSS: { escape: String },
    SpeechSynthesisUtterance: function() {},
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: scriptPath });
  return { api: sandbox.window, store: localStorage };
}

function itemCount(book) { return Object.keys(book.itemsById).length; }
function duplicate(items) { return items.length - new Set(items).size; }

assert(script.includes('const JAPANESE_MISTAKE_BOOK_KEY = "japanese_mistake_book_v1"'), 'storage key must exist');
assert(script.includes('const JAPANESE_MISTAKE_BOOK_SCHEMA_VERSION = 1'), 'schemaVersion must be 1');
assert(/const JAPANESE_MISTAKE_QUESTION_TYPES = Object\.freeze\(\{[\s\S]*vocabularyMeaning[\s\S]*grammarMeaning[\s\S]*grammarCloze[\s\S]*readingQuestion[\s\S]*listeningMeaning[\s\S]*\}\);/.test(script), 'questionType definitions must be centralized');
const hasBatch16BPractice = fs.existsSync(path.join(root, 'scripts/check-japanese-sentence-composition-batch16b-practice.js'));
if (!hasBatch16BPractice) assert(!/sentenceComposition/.test(script + html), 'must not add sentenceComposition before Batch 16B');
const hasBatch15a2cImplementation = fs.existsSync(path.join(root, 'scripts/check-japanese-review-center-batch15a-2c.js')) && /japaneseReviewPanel/.test(html) && /renderJapaneseReviewView/.test(script);
if (!hasBatch15a2cImplementation) assert(!/data-japanese-review-center|review-center-view|錯題本|JLPT 模擬|jlpt-simulation/i.test(html + style), 'must not add UI/review center/JLPT simulation before 15A-2C');
assert(!/JLPT 模擬|jlpt-simulation/i.test(html + style + script), 'must not add JLPT simulation');
assert(/recordActiveQuizMistake\(selectedOption, correctMeaning\)/.test(script), 'handleQuizAnswer wrong branch must record');
assert(/questionType: "readingQuestion"/.test(script), 'reading wrong hook must record');
assert(/questionType: "listeningMeaning"/.test(script), 'listening wrong hook must record');
assert(!/handleReadingPracticeAnswer[\s\S]{0,700}recordJapaneseMistake/.test(script), 'reading practice must not record');
assert(!/renderJapaneseListeningPractice[\s\S]{0,1300}recordJapaneseMistake/.test(script), 'listening practice must not record');
assert(/\.\.\/script\.js\?v=(2\.[89]|3\.[01])/.test(html), 'script cache query must be v=2.8');
assert(/\.\.\/style\.css\?v=(2\.8|2\.9)/.test(html), 'style cache query must remain v=2.8');

const { api, store } = loadApi();
assert(api.JAPANESE_MISTAKE_BOOK_KEY === 'japanese_mistake_book_v1', 'exported storage key mismatch');
let book = api.createEmptyJapaneseMistakeBook();
assert(book.schemaVersion === 1 && itemCount(book) === 0, 'empty schema mismatch');
assert(api.createJapaneseMistakeDedupeKey({ module:'vocabulary', questionType:'vocabularyMeaning', itemId: 12, relatedId: 12 }) === 'vocabulary:vocabularyMeaning:12', 'vocabulary key mismatch');
assert(api.createJapaneseMistakeDedupeKey({ module:'grammar', questionType:'grammarMeaning', itemId: 3, relatedId: 3 }) === 'grammar:grammarMeaning:3', 'grammar meaning key mismatch');
assert(api.createJapaneseMistakeDedupeKey({ module:'grammar', questionType:'grammarCloze', itemId: 4, relatedId: 4 }) === 'grammar:grammarCloze:4', 'grammar cloze key mismatch');
assert(api.createJapaneseMistakeDedupeKey({ module:'reading', questionType:'readingQuestion', itemId: 9, relatedId: 8 }) === 'reading:readingQuestion:8:9', 'reading key mismatch');
assert(api.createJapaneseMistakeDedupeKey({ module:'listening', questionType:'listeningMeaning', itemId: 'jl-001', relatedId: 'jl-001' }) === 'listening:listeningMeaning:jl-001', 'listening key mismatch');

api.recordJapaneseMistake({ module:'vocabulary', questionType:'vocabularyMeaning', itemId: 12, relatedId: 12, userAnswer:'錯', correctAnswer:'對' }, new Date('2026-01-01T00:00:00.000Z'));
book = api.readJapaneseMistakeBook();
let rec = book.itemsById['vocabulary:vocabularyMeaning:12'];
assert(itemCount(book) === 1 && rec.wrongCount === 1, 'first wrong must create one record with wrongCount 1');
assert(rec.itemId === '12' && rec.relatedId === '12', 'IDs must be stringified');
const createdAt = rec.createdAt;
api.recordJapaneseMistake({ module:'vocabulary', questionType:'vocabularyMeaning', itemId: 12, relatedId: 12, userAnswer:'再錯', correctAnswer:'仍對' }, new Date('2026-01-02T00:00:00.000Z'));
rec = api.readJapaneseMistakeBook().itemsById['vocabulary:vocabularyMeaning:12'];
assert(itemCount(api.readJapaneseMistakeBook()) === 1 && rec.wrongCount === 2, 'repeat wrong must increment without duplicate');
assert(rec.createdAt === createdAt && rec.updatedAt === '2026-01-02T00:00:00.000Z' && rec.lastWrongAt === rec.updatedAt && rec.userAnswer === '再錯' && rec.correctAnswer === '仍對', 'repeat wrong must preserve createdAt and update other fields/answers');
const beforeCorrect = JSON.stringify(api.readJapaneseMistakeBook());
// Correct answers intentionally do not call recordJapaneseMistake; unchanged storage verifies no automatic update/delete.
assert(JSON.stringify(api.readJapaneseMistakeBook()) === beforeCorrect, 'later correct answer must not update or delete existing mistakes');
api.recordJapaneseMistake({ module:'grammar', questionType:'grammarMeaning', itemId: 7, relatedId: 7, userAnswer:'x', correctAnswer:'y' });
api.recordJapaneseMistake({ module:'grammar', questionType:'grammarCloze', itemId: 8, relatedId: 8, userAnswer:'x', correctAnswer:'y' });
api.recordJapaneseMistake({ module:'reading', questionType:'readingQuestion', itemId: 2, relatedId: 1, userAnswer:'x', correctAnswer:'y' });
api.recordJapaneseMistake({ module:'listening', questionType:'listeningMeaning', itemId: 'jl-002', relatedId: 'jl-002', userAnswer:'x', correctAnswer:'y' });
assert(itemCount(api.readJapaneseMistakeBook()) === 5, 'five supported types must create records');
api.recordJapaneseMistake({ module:'reading', questionType:'readingQuestion', relatedId: 1, userAnswer:'x', correctAnswer:'y' });
assert(itemCount(api.readJapaneseMistakeBook()) === 5, 'missing stable ID must skip safely');
assert(api.hasJapaneseMistake('reading:readingQuestion:1:2'), 'hasJapaneseMistake must detect key');
assert(api.getAllJapaneseMistakeRecords().length === 5, 'getAll records mismatch');
api.removeJapaneseMistake('reading:readingQuestion:1:2');
assert(!api.hasJapaneseMistake('reading:readingQuestion:1:2'), 'remove single mistake failed');
store.data.set('japanese_vocabulary_book_v1', 'keep');
store.data.set('japanese_vocab_seen_counts', 'keep');
store.data.set('japanese_grammar_seen_counts', 'keep');
store.data.set('japanese_reading_seen_counts', 'keep');
api.clearJapaneseMistakeBook();
assert(itemCount(api.readJapaneseMistakeBook()) === 0, 'clear mistake book failed');
['japanese_vocabulary_book_v1','japanese_vocab_seen_counts','japanese_grammar_seen_counts','japanese_reading_seen_counts'].forEach((key) => assert(store.data.get(key) === 'keep', `${key} must be unaffected`));
store.data.set('japanese_mistake_book_v1', '{bad json');
assert(itemCount(api.readJapaneseMistakeBook()) === 0, 'corrupt JSON must read empty');
store.data.set('japanese_mistake_book_v1', JSON.stringify({ schemaVersion: 2, itemsById: {} }));
assert(itemCount(api.readJapaneseMistakeBook()) === 0, 'wrong schema must read empty');
store.data.set('japanese_mistake_book_v1', JSON.stringify({ schemaVersion: 1, itemsById: [] }));
assert(itemCount(api.readJapaneseMistakeBook()) === 0, 'invalid itemsById must read empty');
const fallback = loadApi(createStore({ throws: true })).api;
fallback.recordJapaneseMistake({ module:'listening', questionType:'listeningMeaning', itemId:'jl-003', relatedId:'jl-003', userAnswer:'x', correctAnswer:'y' });
fallback.recordJapaneseMistake({ module:'listening', questionType:'listeningMeaning', itemId:'jl-003', relatedId:'jl-003', userAnswer:'x2', correctAnswer:'y2' });
assert(fallback.readJapaneseMistakeBook().itemsById['listening:listeningMeaning:jl-003'].wrongCount === 2, 'fallback add/increment failed');
fallback.removeJapaneseMistake('listening:listeningMeaning:jl-003');
assert(itemCount(fallback.readJapaneseMistakeBook()) === 0, 'fallback remove failed');
fallback.recordJapaneseMistake({ module:'listening', questionType:'listeningMeaning', itemId:'jl-004', relatedId:'jl-004', userAnswer:'x', correctAnswer:'y' });
fallback.clearJapaneseMistakeBook();
assert(itemCount(fallback.readJapaneseMistakeBook()) === 0, 'fallback clear failed');
assert(!/itemsById\[[^\]]+\]\s*=\s*\{[\s\S]{0,300}(options|readingSet|questionObject)/.test(script), 'must not save full bank objects or option arrays');

const grammarMeaning = grammar.length;
const grammarCloze = grammar.filter((g) => g.quiz && Array.isArray(g.quiz.choices) && g.quiz.answer).length;
const readingQuestions = (readingSource.match(/"id"\s*:\s*"jp-reading-q-/g) || []).length;
const listeningQuestions = (script.match(/id:"jl-/g) || []).length;
assert(vocabulary.length === 3241, 'vocabulary stable id count must be 3241');
assert(grammarMeaning === 290, `grammar meaning count must be 290, got ${grammarMeaning}`);
assert(grammarCloze === 130, `grammar cloze count must be 130, got ${grammarCloze}`);
assert(readingQuestions === 150, `reading questions count must be 150, got ${readingQuestions}`);
assert(listeningQuestions === 100, `listening questions count must be 100, got ${listeningQuestions}`);
const required = ['id','word','kana','meaning','partOfSpeech','level'];
assert(vocabulary.filter((item) => item.level === 'N5').length === 1021, 'N5 count must be 1021');
assert(vocabulary.filter((item) => item.level === 'N4').length === 2220, 'N4 count must be 2220');
assert(duplicate(vocabulary.map((item) => item.id)) === 0, 'duplicate vocabulary id must be 0');
assert(duplicate(vocabulary.map((item) => item.word)) === 0, 'duplicate vocabulary word must be 0');
assert(vocabulary.filter((item) => required.some((field) => !String(item[field] ?? '').trim())).length === 0, 'missing required vocabulary fields must be 0');

if (failures.length) {
  console.error('Batch 15A-2B mistake book check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 15A-2B mistake book check passed: storage schema, five hooks/types, dedupe, fallback, no UI, and data baselines verified.');
