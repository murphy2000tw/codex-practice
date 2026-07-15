#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');

const SCRIPT_PATH = 'script.js';
const STYLE_PATH = 'style.css';
const JAPANESE_INDEX_PATH = 'japanese/index.html';
const VOCABULARY_PATH = 'vocabulary.json';
const script = fs.readFileSync(SCRIPT_PATH, 'utf8');
const style = fs.readFileSync(STYLE_PATH, 'utf8');
const japaneseIndex = fs.readFileSync(JAPANESE_INDEX_PATH, 'utf8');
const vocabulary = JSON.parse(fs.readFileSync(VOCABULARY_PATH, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadHarness({ brokenStorage = false, initial = new Map() } = {}) {
  const store = new Map(initial);
  const listeners = [];
  function makeElement(tag = 'div') {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      dataset: {},
      style: {},
      parentElement: null,
      children: [],
      hidden: false,
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute(name, value) { this[name] = String(value); },
      removeAttribute(name) { delete this[name]; },
      append(...nodes) { nodes.forEach((node) => { if (node) node.parentElement = this; this.children.push(node); }); },
      appendChild(node) { if (node) node.parentElement = this; this.children.push(node); return node; },
      insertBefore(node) { if (node) node.parentElement = this; this.children.push(node); return node; },
      replaceChildren(...nodes) { this.children = []; this.append(...nodes); },
      addEventListener(type, handler) { listeners.push({ target: this, type, handler }); },
      querySelector: () => null,
      querySelectorAll: () => [],
      remove() {},
    };
  }
  const document = {
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    createElement(tag) {
      return makeElement(tag);
    },
  };
  const localStorage = {
    getItem(key) { if (brokenStorage) throw new Error('blocked'); return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { if (brokenStorage) throw new Error('blocked'); store.set(key, String(value)); },
    removeItem(key) { if (brokenStorage) throw new Error('blocked'); store.delete(key); },
  };
  const context = {
    window: {},
    document,
    console,
    CSS: { escape: (value) => String(value) },
    setTimeout,
    clearTimeout,
    fetch: async (url) => ({ ok: true, json: async () => (String(url).includes('grammar') ? [] : vocabulary) }),
    Math,
    Date,
  };
  context.window = { localStorage, JAPANESE_VOCABULARY_URL: 'vocabulary.json', JAPANESE_GRAMMAR_URL: 'grammar.json' };
  context.localStorage = localStorage;
  context.vocabulary = vocabulary;
  vm.createContext(context);
  vm.runInContext(script, context, { filename: SCRIPT_PATH });
  return { context, store, listeners };
}

function checkStorageUtilities() {
  const { context, store } = loadHarness();
  const api = context.window;
  assert(api.JAPANESE_VOCABULARY_BOOK_KEY === 'japanese_vocabulary_book_v1', 'storage key mismatch');
  assert(api.createEmptyJapaneseVocabularyBook().schemaVersion === 1, 'schemaVersion must be 1');
  assert(api.createEmptyJapaneseVocabularyBook().itemsById && !Array.isArray(api.createEmptyJapaneseVocabularyBook().itemsById), 'itemsById must be object');

  let book = api.addJapaneseVocabularyToBook(123, 'vocabulary-card', new Date('2026-01-01T00:00:00.000Z'));
  assert(book.itemsById['123'], 'numeric id must normalize to string');
  assert(api.isJapaneseVocabularySaved('123'), 'isSaved should find added id');
  assert(!api.isJapaneseVocabularySaved('124'), 'isSaved should reject missing id');

  book = api.addJapaneseVocabularyToBook('123', 'reading-lookup', new Date('2026-01-02T00:00:00.000Z'));
  assert(Object.keys(book.itemsById).length === 1, 'duplicate add must not create second item');
  assert(book.itemsById['123'].createdAt === '2026-01-01T00:00:00.000Z', 'duplicate add must preserve createdAt');
  assert(book.itemsById['123'].updatedAt === '2026-01-02T00:00:00.000Z', 'duplicate add must update updatedAt');
  assert(book.itemsById['123'].source === 'reading-lookup', 'duplicate add must update source');

  const afterInvalidSource = api.addJapaneseVocabularyToBook('456', 'quiz-option');
  assert(!afterInvalidSource.itemsById['456'], 'source whitelist should reject quiz-option');

  const resolved = api.resolveJapaneseVocabularyBookItems([{ id: '123', word: 'x' }, { id: '999', word: 'y' }]);
  assert(resolved[0].status === 'available' && resolved[0].entry.word === 'x', 'resolve should attach current vocabulary data by id');
  api.addJapaneseVocabularyToBook('404404', 'vocabulary-card', new Date('2026-01-03T00:00:00.000Z'));
  const missing = api.resolveJapaneseVocabularyBookItems([{ id: '123', word: 'x' }]).find((item) => item.vocabularyId === '404404');
  assert(missing && missing.status === 'missing' && missing.entry === null, 'resolve should preserve missing ids');

  api.removeJapaneseVocabularyFromBook('123');
  assert(!api.isJapaneseVocabularySaved('123'), 'remove should delete one id');
  assert(api.isJapaneseVocabularySaved('404404'), 'single remove must not clear other ids');
  api.clearJapaneseVocabularyBook();
  assert(api.resolveJapaneseVocabularyBookItems([]).length === 0, 'clear should empty vocabulary book');

  store.set('japanese_vocabulary_book_v1', '{bad json');
  assert(Object.keys(api.readJapaneseVocabularyBook().itemsById).length === 0, 'broken JSON should safely return empty schema');
  store.set('japanese_vocabulary_book_v1', JSON.stringify({ schemaVersion: 2, itemsById: {} }));
  assert(Object.keys(api.readJapaneseVocabularyBook().itemsById).length === 0, 'wrong schema should safely return empty schema');
  store.set('japanese_vocabulary_book_v1', JSON.stringify({ schemaVersion: 1, itemsById: [] }));
  assert(Object.keys(api.readJapaneseVocabularyBook().itemsById).length === 0, 'invalid itemsById should safely return empty schema');
}

function checkFallbackAndSeenKeys() {
  const seen = new Map([
    ['japanese_vocab_seen_counts', '{"a":1}'],
    ['japanese_grammar_seen_counts', '{"b":2}'],
    ['japanese_reading_seen_counts', '{"c":3}'],
  ]);
  const { context } = loadHarness({ brokenStorage: true, initial: seen });
  const api = context.window;
  api.addJapaneseVocabularyToBook('1', 'vocabulary-card', new Date('2026-01-01T00:00:00.000Z'));
  assert(api.isJapaneseVocabularySaved('1'), 'fallback memory storage should support add/isSaved');
  api.removeJapaneseVocabularyFromBook('1');
  assert(!api.isJapaneseVocabularySaved('1'), 'fallback memory storage should support remove');
  assert(context.getJapaneseVocabularyBookStorageNotice() === '此瀏覽器無法永久保存，資料只保留到關閉頁面', 'fallback notice mismatch');
  assert(seen.get('japanese_vocab_seen_counts') === '{"a":1}', 'vocab seen-count key must not be modified');
  assert(seen.get('japanese_grammar_seen_counts') === '{"b":2}', 'grammar seen-count key must not be modified');
  assert(seen.get('japanese_reading_seen_counts') === '{"c":3}', 'reading seen-count key must not be modified');
}

function checkIntegrationBoundaries() {
  assert(/function createCard\(word, index\)[\s\S]*createJapaneseVocabularyBookControl\(word\.id, "vocabulary-card"\)/.test(script), 'vocabulary-card control must be in createCard using word.id');
  assert(/<div class="vocabulary-card-header">[\s\S]*<span class="card-number">單字/.test(script), 'vocabulary card number must be inside the top header container');
  assert(/card\.querySelector\("\.vocabulary-card-header"\)\?\.appendChild\(vocabularyBookControl\)/.test(script), 'vocabulary-card control must be appended beside the number in the top header');
  assert(!/card\.appendChild\(vocabularyBookControl\)/.test(script), 'vocabulary card must not append a full-width vocabulary book control below the card body');
  assert(/button\.textContent = button\.dataset\.vocabularyBookSource === "vocabulary-card"[\s\S]*\? "生字本"/.test(script), 'vocabulary-card button text must stay fixed as 生字本');
  assert(/button\.setAttribute\("aria-pressed", saved \? "true" : "false"\)/.test(script), 'vocabulary book buttons must keep aria-pressed in sync');
  assert(/button\.setAttribute\("aria-label", saved \? "移出生字本" : "加入生字本"\)/.test(script), 'vocabulary book buttons must expose dynamic aria-label');
  assert(/\.vocabulary-card-header\s*{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*8px;/.test(style), 'vocabulary card header must use left-aligned flex layout with 8px gap');
  assert(!/\.vocabulary-card-header\s*{[^}]*justify-content:\s*space-between/.test(style), 'vocabulary card header must not use space-between');
  assert(/\.vocabulary-card-book-control \.vocabulary-book-button\s*{[\s\S]*width:\s*auto;[\s\S]*font-size:\s*0\.85rem;/.test(style), 'vocabulary card book button must remain compact and not full width');
  assert(/\.vocabulary-book-control:not\(\.vocabulary-card-book-control\) \.vocabulary-book-button/.test(style), 'mobile full-width rule must not apply to vocabulary-card book button');
  assert(/function showReadingLookupCard\(card, lookup\)[\s\S]*createJapaneseVocabularyBookControl\(entry\.id, "reading-lookup"\)/.test(script), 'reading lookup control must use canonical lookup.entry.id');
  assert(/: \(saved \? "移出生字本" : "加入生字本"\)/.test(script), 'reading lookup button must keep existing dynamic visible text');
  const allControlCalls = [...script.matchAll(/createJapaneseVocabularyBookControl\(/g)].length;
  assert(allControlCalls === 3, 'vocabulary book control should only be defined plus used by two approved flows');
  assert(!/japanese_mistake_book_v1/.test(script + style + japaneseIndex), 'must not add mistake-book key');
  assert(!/review center|複習中心/.test(japaneseIndex), 'must not add review center entry or view');
  assert(!/innerHTML\s*=\s*[^;]*(VocabularyBook|vocabularyBook|itemsById|japanese_vocabulary_book_v1)/.test(script), 'storage/book data must not be inserted with innerHTML');
  assert(/READING_LOOKUP_INFLECTION_WHITELIST[\s\S]*vocabularyId/.test(script), 'inflection lookup whitelist must preserve canonical ids');
  assert(/READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST[\s\S]*segments[\s\S]*vocabularyId/.test(script), 'compound segment lookup must preserve segment canonical ids');
  assert(!/data-japanese-vocabulary-entry="quiz"[\s\S]{0,200}生字本/.test(japaneseIndex), 'vocabulary quiz must not expose vocabulary book entry');
  assert(!/data-reading-mode="quiz"[\s\S]{0,250}生字本/.test(japaneseIndex), 'reading quiz must not expose vocabulary book entry');
  assert(!/data-japanese-entry="grammar"[\s\S]{0,250}生字本/.test(japaneseIndex), 'grammar page must not expose vocabulary book entry');
  assert(!/data-japanese-entry="listening"[\s\S]{0,250}生字本/.test(japaneseIndex), 'listening page must not expose vocabulary book entry');
  assert(/<meta name="japanese-layout-version" content="2\.3">/.test(japaneseIndex), 'japanese-layout-version meta must remain 2.3');
  assert(/<body data-japanese-layout-version="2\.3">/.test(japaneseIndex), 'japanese-layout-version body marker must remain 2.3');
  assert(/\.\.\/style\.css\?v=2\.5/.test(japaneseIndex), 'style cache query must update to v=2.5');
  assert(/\.\.\/script\.js\?v=2\.5/.test(japaneseIndex), 'script cache query must update to v=2.5');
}

function checkVocabularyBaseline() {
  assert(vocabulary.length === 3241, `vocabulary total expected 3241, got ${vocabulary.length}`);
  const n5 = vocabulary.filter((item) => item.level === 'N5').length;
  const n4 = vocabulary.filter((item) => item.level === 'N4').length;
  assert(n5 === 1021, `N5 expected 1021, got ${n5}`);
  assert(n4 === 2220, `N4 expected 2220, got ${n4}`);
  const ids = new Set();
  const words = new Set();
  let duplicateId = 0;
  let duplicateWord = 0;
  let missingRequired = 0;
  vocabulary.forEach((item) => {
    const id = String(item.id ?? '');
    const word = String(item.word ?? '');
    if (!id || !word || !item.kana || !item.meaning || !item.level) missingRequired += 1;
    if (ids.has(id)) duplicateId += 1;
    ids.add(id);
    if (words.has(word)) duplicateWord += 1;
    words.add(word);
  });
  assert(duplicateId === 0, `duplicate id expected 0, got ${duplicateId}`);
  assert(duplicateWord === 0, `duplicate word expected 0, got ${duplicateWord}`);
  assert(missingRequired === 0, `missing required fields expected 0, got ${missingRequired}`);
}

checkStorageUtilities();
checkFallbackAndSeenKeys();
checkIntegrationBoundaries();
checkVocabularyBaseline();
console.log('Batch 15A-2A Japanese vocabulary book checks passed.');
