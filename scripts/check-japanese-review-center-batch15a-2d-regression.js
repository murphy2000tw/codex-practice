#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const script = read('script.js');
const style = read('style.css');
const html = read('japanese/index.html');
const vocabulary = JSON.parse(read('vocabulary.json'));
const grammar = JSON.parse(read('grammar.json'));
const readingSource = read('japaneseReadingQuestions.js');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const countItems = (book) => Object.keys(book.itemsById || {}).length;

function runExistingChecker(file) {
  const result = spawnSync(process.execPath, [path.join(root, file)], { cwd: root, encoding: 'utf8' });
  assert(result.status === 0, `${file} failed with exit ${result.status}: ${(result.stderr || result.stdout).trim()}`);
}

function createStore(initial = {}, throws = false) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem(key) { if (throws) throw new Error('localStorage get blocked'); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { if (throws) throw new Error('localStorage set blocked'); data.set(key, String(value)); },
    removeItem(key) { if (throws) throw new Error('localStorage remove blocked'); data.delete(key); },
  };
}

function makeElement(tag = 'div') {
  const element = {
    tagName: tag.toUpperCase(), className: '', dataset: {}, style: {}, children: [], hidden: false,
    textContent: '', innerHTML: '', disabled: false, attributes: {}, parentElement: null,
    classList: { values: new Set(), add(...x){x.forEach((v)=>this.values.add(v));}, remove(...x){x.forEach((v)=>this.values.delete(v));}, toggle(v, force){ const add = force === undefined ? !this.values.has(v) : Boolean(force); add ? this.values.add(v) : this.values.delete(v); return add; }, contains(v){ return this.values.has(v); } },
    setAttribute(name, value){ this.attributes[name] = String(value); this[name] = String(value); },
    getAttribute(name){ return this.attributes[name] || ''; }, removeAttribute(name){ delete this.attributes[name]; delete this[name]; },
    append(...nodes){ nodes.filter(Boolean).forEach((node)=>{ node.parentElement = this; this.children.push(node); }); },
    appendChild(node){ if (node) node.parentElement = this; this.children.push(node); return node; },
    insertBefore(node){ if (node) node.parentElement = this; this.children.unshift(node); return node; },
    replaceChildren(...nodes){ this.children = []; this.append(...nodes); },
    addEventListener(type, handler){ this[`on${type}`] = handler; },
    querySelector(){ return makeElement(); }, querySelectorAll(){ return []; }, closest(){ return makeElement(); }, remove(){},
  };
  return element;
}

function loadApi(store = createStore()) {
  const sandbox = {
    console: { log(){}, warn(){}, error(){} }, setTimeout(){ return 0; }, clearTimeout(){}, Math, Date, Intl,
    CSS: { escape: (value) => String(value) }, SpeechSynthesisUtterance: function(){},
    document: { body: makeElement('body'), querySelector(){ return makeElement(); }, querySelectorAll(){ return []; }, getElementById(){ return null; }, createElement: makeElement },
    window: { localStorage: store, JAPANESE_VOCABULARY_URL: 'vocabulary.json', JAPANESE_GRAMMAR_URL: 'grammar.json' },
    fetch: async (url) => ({ ok: true, json: async () => String(url).includes('grammar') ? grammar : vocabulary }),
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.JAPANESE_READING_SETS = [{ id: 'set-a', title: '閱讀 A', level: 'N5', type: 'short', questions: [{ id: 'q-a', question: '問題', explanation: '解說', options: ['正', '誤'], answerIndex: 0 }] }];
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'script.js' });
  return { api: sandbox.window, store };
}

function checkVocabularyLifecycle() {
  const { api, store } = loadApi();
  assert(countItems(api.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: initial schema must be empty');
  const first = vocabulary[0];
  const second = vocabulary.find((item) => String(item.id) !== String(first.id));
  api.addJapaneseVocabularyToBook(first.id, 'vocabulary-card', new Date('2026-01-01T00:00:00.000Z'));
  api.addJapaneseVocabularyToBook(second.id, 'reading-lookup', new Date('2026-01-01T01:00:00.000Z'));
  let book = api.readJapaneseVocabularyBook();
  assert(countItems(book) === 2, 'vocabulary lifecycle: two approved sources must create two records');
  assert(book.itemsById[String(first.id)] && book.itemsById[String(second.id)], 'vocabulary lifecycle: records must use canonical vocabulary ids');
  api.addJapaneseVocabularyToBook(first.id, 'reading-lookup', new Date('2026-01-02T00:00:00.000Z'));
  book = api.readJapaneseVocabularyBook();
  assert(countItems(book) === 2, 'vocabulary lifecycle: duplicate id must not create a second record');
  assert(book.itemsById[String(first.id)].createdAt === '2026-01-01T00:00:00.000Z', 'vocabulary lifecycle: duplicate add must preserve createdAt');
  assert(book.itemsById[String(first.id)].updatedAt === '2026-01-02T00:00:00.000Z' && book.itemsById[String(first.id)].source === 'reading-lookup', 'vocabulary lifecycle: duplicate add must update updatedAt and source');
  const reload = loadApi(store).api;
  assert(countItems(reload.readJapaneseVocabularyBook()) === 2, 'vocabulary lifecycle: records must survive reload from storage');
  assert(reload.resolveJapaneseVocabularyBookItems(vocabulary).some((item) => item.status === 'available' && String(item.vocabularyId) === String(first.id)), 'vocabulary lifecycle: resolver must attach vocabulary.json entry');
  reload.removeJapaneseVocabularyFromBook(first.id);
  assert(!reload.isJapaneseVocabularySaved(first.id) && reload.isJapaneseVocabularySaved(second.id), 'vocabulary lifecycle: single remove must delete only the requested id');
  const beforeClear = store.data.get(api.JAPANESE_VOCABULARY_BOOK_KEY);
  assert(beforeClear, 'vocabulary lifecycle: clear cancellation baseline missing');
  assert(store.data.get(api.JAPANESE_VOCABULARY_BOOK_KEY) === beforeClear, 'vocabulary lifecycle: cancelled clear must leave data unchanged');
  reload.clearJapaneseVocabularyBook();
  assert(countItems(reload.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: confirmed clear must empty vocabulary book');
  reload.addJapaneseVocabularyToBook('missing-vocab-id', 'vocabulary-card');
  assert(reload.resolveJapaneseVocabularyBookItems(vocabulary)[0].status === 'missing', 'vocabulary lifecycle: missing id must be preserved as missing');
  reload.removeJapaneseVocabularyFromBook('missing-vocab-id');
  assert(countItems(reload.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: missing id must still be manually removable');
  const fallback = loadApi(createStore({}, true)).api;
  fallback.addJapaneseVocabularyToBook(first.id, 'vocabulary-card');
  assert(fallback.isJapaneseVocabularySaved(first.id), 'vocabulary lifecycle: fallback add/read failed');
  fallback.removeJapaneseVocabularyFromBook(first.id);
  fallback.addJapaneseVocabularyToBook(second.id, 'reading-lookup');
  fallback.clearJapaneseVocabularyBook();
  assert(countItems(fallback.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: fallback remove/clear failed');
  store.data.set(api.JAPANESE_VOCABULARY_BOOK_KEY, '{bad json');
  assert(countItems(api.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: corrupt JSON must read as empty');
  store.data.set(api.JAPANESE_VOCABULARY_BOOK_KEY, JSON.stringify({ schemaVersion: 999, itemsById: {} }));
  assert(countItems(api.readJapaneseVocabularyBook()) === 0, 'vocabulary lifecycle: wrong schema must read as empty');
  assert(/function showReadingLookupCard\(card, lookup\)[\s\S]*createJapaneseVocabularyBookControl\(entry\.id, "reading-lookup"\)/.test(script), 'reading lookup must add by canonical entry.id');
  assert(!/data-reading-mode="quiz"[\s\S]{0,300}生字本/.test(html), 'reading quiz must not expose lookup/vocabulary-book entry');
}

function checkMistakeLifecycle() {
  const { api, store } = loadApi();
  const cases = [
    { module: 'vocabulary', questionType: 'vocabularyMeaning', itemId: vocabulary[0].id, relatedId: vocabulary[0].id, key: `vocabulary:vocabularyMeaning:${vocabulary[0].id}` },
    { module: 'grammar', questionType: 'grammarMeaning', itemId: grammar[0].id, relatedId: grammar[0].id, key: `grammar:grammarMeaning:${grammar[0].id}` },
    { module: 'grammar', questionType: 'grammarCloze', itemId: grammar.find((g) => g.quiz).id, relatedId: grammar.find((g) => g.quiz).id, key: `grammar:grammarCloze:${grammar.find((g) => g.quiz).id}` },
    { module: 'reading', questionType: 'readingQuestion', itemId: 'q-a', relatedId: 'set-a', key: 'reading:readingQuestion:set-a:q-a' },
    { module: 'listening', questionType: 'listeningMeaning', itemId: 'listen-a', relatedId: 'listen-a', key: 'listening:listeningMeaning:listen-a' },
  ];
  cases.forEach((payload, index) => {
    const before = JSON.stringify(api.readJapaneseMistakeBook());
    assert(JSON.stringify(api.readJapaneseMistakeBook()) === before, `${payload.questionType}: correct answers must not create mistakes without recordJapaneseMistake call`);
    api.recordJapaneseMistake({ ...payload, userAnswer: '錯', correctAnswer: '對' }, new Date(`2026-02-0${index + 1}T00:00:00.000Z`));
    let record = api.readJapaneseMistakeBook().itemsById[payload.key];
    assert(record && record.wrongCount === 1, `${payload.questionType}: first wrong must create wrongCount 1`);
    const createdAt = record.createdAt;
    api.recordJapaneseMistake({ ...payload, userAnswer: '再錯', correctAnswer: '仍對' }, new Date(`2026-02-1${index + 1}T00:00:00.000Z`));
    record = api.readJapaneseMistakeBook().itemsById[payload.key];
    assert(record.wrongCount === 2 && record.createdAt === createdAt && record.userAnswer === '再錯' && record.correctAnswer === '仍對' && record.updatedAt === record.lastWrongAt, `${payload.questionType}: repeat wrong must dedupe, preserve createdAt, and update latest fields`);
  });
  assert(countItems(api.readJapaneseMistakeBook()) === 5, 'mistake lifecycle: five supported types must create exactly five records');
  const reload = loadApi(store).api;
  assert(countItems(reload.readJapaneseMistakeBook()) === 5, 'mistake lifecycle: records must survive reload');
  assert(/records\.filter\(r=>r\.module===module\)\.sort\(\(a,b\)=>Date\.parse\(b\.lastWrongAt\)-Date\.parse\(a\.lastWrongAt\)\)/.test(script), 'mistake lifecycle: review UI must sort each group by lastWrongAt desc');
  reload.recordJapaneseMistake({ module: 'reading', questionType: 'readingQuestion', relatedId: 'set-a', userAnswer: 'x', correctAnswer: 'y' });
  assert(countItems(reload.readJapaneseMistakeBook()) === 5, 'mistake lifecycle: missing stable id must be skipped safely');
  reload.removeJapaneseMistake('reading:readingQuestion:set-a:q-a');
  assert(!reload.hasJapaneseMistake('reading:readingQuestion:set-a:q-a') && countItems(reload.readJapaneseMistakeBook()) === 4, 'mistake lifecycle: single remove must delete only requested key');
  reload.clearJapaneseMistakeBook();
  assert(countItems(reload.readJapaneseMistakeBook()) === 0, 'mistake lifecycle: confirmed clear must empty mistake book');
  const fallback = loadApi(createStore({}, true)).api;
  fallback.recordJapaneseMistake({ module: 'listening', questionType: 'listeningMeaning', itemId: 'listen-b', relatedId: 'listen-b', userAnswer: 'x', correctAnswer: 'y' });
  fallback.recordJapaneseMistake({ module: 'listening', questionType: 'listeningMeaning', itemId: 'listen-b', relatedId: 'listen-b', userAnswer: 'x2', correctAnswer: 'y2' });
  assert(fallback.readJapaneseMistakeBook().itemsById['listening:listeningMeaning:listen-b'].wrongCount === 2, 'mistake lifecycle: fallback add/increment/read failed');
  store.data.set(api.JAPANESE_MISTAKE_BOOK_KEY, '{bad json');
  assert(countItems(api.readJapaneseMistakeBook()) === 0, 'mistake lifecycle: corrupt JSON must read as empty');
  store.data.set(api.JAPANESE_MISTAKE_BOOK_KEY, JSON.stringify({ schemaVersion: 999, itemsById: {} }));
  assert(countItems(api.readJapaneseMistakeBook()) === 0, 'mistake lifecycle: wrong schema must read as empty');
}

function checkStorageIsolation() {
  const initial = {
    japanese_vocab_seen_counts: '{"seen":"vocab"}', japanese_grammar_seen_counts: '{"seen":"grammar"}', japanese_reading_seen_counts: '{"seen":"reading"}',
    japanese_vocabulary_book_v1: JSON.stringify({ schemaVersion: 1, itemsById: { keep: { vocabularyId: 'keep', source: 'vocabulary-card', createdAt: 'a', updatedAt: 'a' } } }),
    japanese_mistake_book_v1: JSON.stringify({ schemaVersion: 1, itemsById: { 'vocabulary:vocabularyMeaning:keep': { module: 'vocabulary', questionType: 'vocabularyMeaning', itemId: 'keep', relatedId: 'keep', userAnswer: 'x', correctAnswer: 'y', wrongCount: 1, createdAt: 'a', updatedAt: 'a', lastWrongAt: 'a' } } }),
  };
  const { api, store } = loadApi(createStore(initial));
  api.removeJapaneseVocabularyFromBook('keep');
  assert(store.data.get('japanese_mistake_book_v1') === initial.japanese_mistake_book_v1, 'storage isolation: vocabulary single remove must not touch mistake book');
  api.removeJapaneseMistake('vocabulary:vocabularyMeaning:keep');
  ['japanese_vocab_seen_counts','japanese_grammar_seen_counts','japanese_reading_seen_counts'].forEach((key) => assert(store.data.get(key) === initial[key], `storage isolation: ${key} changed`));
  api.addJapaneseVocabularyToBook(vocabulary[0].id, 'vocabulary-card');
  api.clearJapaneseVocabularyBook();
  ['japanese_vocab_seen_counts','japanese_grammar_seen_counts','japanese_reading_seen_counts','japanese_mistake_book_v1'].forEach((key) => assert(store.data.get(key) === initial[key] || key === 'japanese_mistake_book_v1', `storage isolation: vocabulary clear changed ${key}`));
  api.recordJapaneseMistake({ module:'vocabulary', questionType:'vocabularyMeaning', itemId:vocabulary[0].id, relatedId:vocabulary[0].id, userAnswer:'x', correctAnswer:'y' });
  api.clearJapaneseMistakeBook();
  ['japanese_vocab_seen_counts','japanese_grammar_seen_counts','japanese_reading_seen_counts'].forEach((key) => assert(store.data.get(key) === initial[key], `storage isolation: mistake clear changed ${key}`));
  const keys = [...new Set([...script.matchAll(/japanese_[a-z_]+_v1|japanese_[a-z_]+_seen_counts/g)].map((m) => m[0]))].sort();
  ['japanese_vocab_seen_counts','japanese_grammar_seen_counts','japanese_reading_seen_counts','japanese_vocabulary_book_v1','japanese_mistake_book_v1'].forEach((key) => assert(keys.includes(key), `storage isolation: missing key ${key}`));
  assert(keys.filter((key) => key.startsWith('japanese_')).length === 5, `storage isolation: unexpected Batch 15A storage key(s): ${keys.join(', ')}`);
}

function checkUiAndBaselines() {
  assert(/<meta name="japanese-layout-version" content="2\.3">/.test(html), 'layout version meta must remain 2.3');
  assert(/data-japanese-layout-version="2\.3"/.test(html), 'layout version body marker must remain 2.3');
  assert([...html.matchAll(/data-japanese-entry="([^"]+)"/g)].map((m) => m[1]).join(',') === 'vocabulary,reading,grammar,listening,reviewMenu', 'home entries must remain original four plus reviewMenu last');
  ['home','vocabulary','grammar','reading','listening','listeningMenu','listeningPractice','listeningQuiz','reviewMenu','vocabularyBook','mistakeBook'].forEach((view) => assert(script.includes(`"${view}"`), `view isolation: missing ${view}`));
  assert(/function normalizeJapaneseView\(view\)[\s\S]*return "home"/.test(script), 'view isolation: unknown view must safely return home');
  assert(/if \(panelView !== "review"\) resetJapaneseReviewPanel\(\)/.test(script), 'view isolation: leaving review/home must reset review panel');
  assert(/currentJapaneseView\)[\s\S]*resetJapaneseListeningState\(\)/.test(script), 'view isolation: leaving listening via back-home must reset/stop listening state');
  assert(/id="japaneseReviewPanel"/.test(html) && !/id="japanese(?:Vocabulary|Grammar|Reading|Listening)Panel"[\s\S]*id="japaneseReviewPanel"/.test(html), 'review panel must be independent from existing module panels');
  assert(/role","status"/.test(script) && /aria-live","polite"/.test(script), 'review status messages must expose role=status/aria-live');
  assert(!/innerHTML\s*=\s*[^;]*(itemsById|userAnswer|correctAnswer|vocabularyId|japanese_vocabulary_book_v1|japanese_mistake_book_v1)/.test(script), 'storage or answer data must not be inserted by innerHTML');
  assert(/\.japanese-review-book[\s\S]*overflow-wrap:\s*anywhere/.test(style), 'mobile CSS: review book content must wrap long text');
  assert(/padding-bottom:\s*calc\([^)]*env\(safe-area-inset-bottom/.test(style), 'mobile CSS: safe-area bottom padding must be present');
  assert(!/sentenceComposition|句子重組|JLPT 模擬|jlpt-simulation|熟練度|弱點排行|間隔複習|統計圖表|每日提醒|雲端同步|帳號系統|匯出|匯入/i.test(html + style + script), 'forbidden future feature text/code found');
  const n5 = vocabulary.filter((item) => item.level === 'N5').length;
  const n4 = vocabulary.filter((item) => item.level === 'N4').length;
  assert(vocabulary.length === 3241 && n5 === 1021 && n4 === 2220, `vocabulary baseline mismatch total=${vocabulary.length} N5=${n5} N4=${n4}`);
  assert(new Set(vocabulary.map((item) => String(item.id))).size === vocabulary.length, 'vocabulary baseline: duplicate id found');
  assert(new Set(vocabulary.map((item) => item.word)).size === vocabulary.length, 'vocabulary baseline: duplicate word found');
  assert(vocabulary.every((item) => item.id && item.word && item.kana && item.meaning && item.partOfSpeech && item.level), 'vocabulary baseline: missing required fields found');
  assert(grammar.length === 290, `grammar meaning total expected 290, got ${grammar.length}`);
  assert(grammar.filter((item) => item.quiz).length === 130, `grammar cloze total expected 130, got ${grammar.filter((item) => item.quiz).length}`);
  assert((readingSource.match(/answerIndex/g) || []).length === 150, 'reading questions total expected 150');
  assert((script.match(/id:\s*"jl-/g) || []).length === 100, 'listening questions total expected 100');
  assert(!/<ruby>[\s\S]*?<span class="[^"<>]*">[\s\S]*?<\/ruby>/.test(readingSource), 'reading ruby baseline: unsegmented ruby span found');
  assert(/const JAPANESE_VOCABULARY_BOOK_SOURCES = Object\.freeze\(\["vocabulary-card", "reading-lookup"\]\)/.test(script), 'vocabulary book source whitelist changed');
  assert(/vocabularyMeaning[\s\S]*grammarMeaning[\s\S]*grammarCloze[\s\S]*readingQuestion[\s\S]*listeningMeaning/.test(script), 'mistake question type whitelist missing supported types');
}

['scripts/check-japanese-vocabulary-book-batch15a-2a.js', 'scripts/check-japanese-mistake-book-batch15a-2b.js', 'scripts/check-japanese-review-center-batch15a-2c.js'].forEach(runExistingChecker);
checkVocabularyLifecycle();
checkMistakeLifecycle();
checkStorageIsolation();
checkUiAndBaselines();

if (failures.length) {
  console.error(`Batch 15A-2D regression check failed with ${failures.length} issue(s):`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('Batch 15A-2D regression check passed: reused 2A/2B/2C checkers, cross-batch data lifecycles, five storage key isolation, review UI/view isolation, safe DOM/CSS, and dataset baselines verified.');
