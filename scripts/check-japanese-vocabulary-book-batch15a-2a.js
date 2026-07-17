#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.join(__dirname, '..');

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
      classList: {
        values: new Set(),
        add(...names) { names.forEach((name) => this.values.add(name)); },
        remove(...names) { names.forEach((name) => this.values.delete(name)); },
        toggle(name, force) { const shouldAdd = force === undefined ? !this.values.has(name) : Boolean(force); if (shouldAdd) this.values.add(name); else this.values.delete(name); return shouldAdd; },
        contains(name) { return this.values.has(name); },
      },
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
  const elementsById = new Map();
  const document = {
    body: makeElement('body'),
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    getElementById(id) { return elementsById.get(id) || null; },
    createElement(tag) {
      const element = makeElement(tag);
      Object.defineProperty(element, 'id', {
        get() { return this._id || ''; },
        set(value) { this._id = String(value); elementsById.set(this._id, this); },
      });
      return element;
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
  return { context, store, listeners, document };
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

function checkButtonAndToastFeedback() {
  const { context, document } = loadHarness();
  const api = context.window;
  const control = context.createJapaneseVocabularyBookControl('toast-1', 'vocabulary-card');
  const button = control.children[0];
  assert(button.textContent === '生字本', 'unsaved vocabulary-card button text must be 生字本');
  assert(button['aria-pressed'] === 'false', 'unsaved button aria-pressed must be false');
  assert(button['aria-label'] === '加入生字本', 'unsaved button aria-label must be 加入生字本');

  api.addJapaneseVocabularyToBook('toast-1', 'vocabulary-card', new Date('2026-01-01T00:00:00.000Z'));
  context.updateJapaneseVocabularyBookButtonState(button, true);
  assert(button.textContent === '移除', 'saved vocabulary-card button text must be 移除');
  assert(button['aria-pressed'] === 'true', 'saved button aria-pressed must be true');
  assert(button['aria-label'] === '移出生字本', 'saved button aria-label must be 移出生字本');

  context.showJapaneseVocabularyBookToast('已加入生字本');
  const toast = document.getElementById('japaneseVocabularyBookToast');
  assert(toast, 'visible feedback toast must be created');
  assert(toast.textContent === '已加入生字本', 'add toast text mismatch');
  assert(toast.role === 'status', 'toast role must be status');
  assert(toast['aria-live'] === 'polite', 'toast aria-live must be polite');
  assert(document.body.children.filter((node) => node.id === 'japaneseVocabularyBookToast').length === 1, 'toast must be a singleton DOM element');
  context.showJapaneseVocabularyBookToast('已從生字本移除');
  assert(document.getElementById('japaneseVocabularyBookToast') === toast, 'repeated feedback must reuse the same toast element');
  assert(toast.textContent === '已從生字本移除', 'remove toast text mismatch');
}

function checkIntegrationBoundaries() {
  assert(/function createCard\(word, index\)[\s\S]*createJapaneseVocabularyBookControl\(word\.id, "vocabulary-card"\)/.test(script), 'vocabulary-card control must be in createCard using word.id');
  assert(/<div class="vocabulary-card-header">[\s\S]*<span class="card-number">單字/.test(script), 'vocabulary card number must be inside the top header container');
  assert(/card\.querySelector\("\.vocabulary-card-header"\)\?\.appendChild\(vocabularyBookControl\)/.test(script), 'vocabulary-card control must be appended beside the number in the top header');
  assert(!/card\.appendChild\(vocabularyBookControl\)/.test(script), 'vocabulary card must not append a full-width vocabulary book control below the card body');
  assert(/button\.textContent = saved \? "移除" : "生字本"/.test(script), 'vocabulary book button text must switch between 生字本 and 移除');
  assert(/button\.setAttribute\("aria-pressed", saved \? "true" : "false"\)/.test(script), 'vocabulary book buttons must keep aria-pressed in sync');
  assert(/button\.setAttribute\("aria-label", saved \? "移出生字本" : "加入生字本"\)/.test(script), 'vocabulary book buttons must expose dynamic aria-label');
  assert(/\.vocabulary-card-header\s*{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*8px;/.test(style), 'vocabulary card header must use left-aligned flex layout with 8px gap');
  assert(!/\.vocabulary-card-header\s*{[^}]*justify-content:\s*space-between/.test(style), 'vocabulary card header must not use space-between');
  assert(/\.vocabulary-card-book-control \.vocabulary-book-button\s*{[\s\S]*width:\s*4\.25rem;[\s\S]*min-width:\s*4\.25rem;[\s\S]*font-size:\s*0\.85rem;/.test(style), 'vocabulary card book button must remain compact with stable width');
  assert(/\.vocabulary-book-control:not\(\.vocabulary-card-book-control\) \.vocabulary-book-button/.test(style), 'mobile full-width rule must not apply to vocabulary-card book button');
  assert(/function showReadingLookupCard\(card, lookup\)[\s\S]*createJapaneseVocabularyBookControl\(entry\.id, "reading-lookup"\)/.test(script), 'reading lookup control must use canonical lookup.entry.id');
  assert(!/button\.textContent[^{;]*移出生字本/.test(script), 'visible button text must not use long add/remove labels');
  const allControlCalls = [...script.matchAll(/createJapaneseVocabularyBookControl\(/g)].length;
  assert(allControlCalls === 3, 'vocabulary book control should only be defined plus used by two approved flows');
  assert(/japanese_vocabulary_book_v1/.test(script), 'vocabulary-book key must remain present');
  const hasBatch15a2cImplementation = fs.existsSync(path.join(root, 'scripts/check-japanese-review-center-batch15a-2c.js')) && /japaneseReviewPanel/.test(japaneseIndex) && /renderJapaneseReviewView/.test(script);
if (!hasBatch15a2cImplementation) assert(!/review center|複習中心/.test(japaneseIndex), 'must not add review center entry or view before 15A-2C');
  assert(!/innerHTML\s*=\s*[^;]*(VocabularyBook|vocabularyBook|itemsById|japanese_vocabulary_book_v1)/.test(script), 'storage/book data must not be inserted with innerHTML');
  assert(/READING_LOOKUP_INFLECTION_WHITELIST[\s\S]*vocabularyId/.test(script), 'inflection lookup whitelist must preserve canonical ids');
  assert(/READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST[\s\S]*segments[\s\S]*vocabularyId/.test(script), 'compound segment lookup must preserve segment canonical ids');
  assert(!/data-japanese-vocabulary-entry="quiz"[\s\S]{0,200}生字本/.test(japaneseIndex), 'vocabulary quiz must not expose vocabulary book entry');
  assert(!/data-reading-mode="quiz"[\s\S]{0,250}生字本/.test(japaneseIndex), 'reading quiz must not expose vocabulary book entry');
  assert(!/data-japanese-entry="grammar"[\s\S]{0,250}生字本/.test(japaneseIndex), 'grammar page must not expose vocabulary book entry');
  assert(!/data-japanese-entry="listening"[\s\S]{0,250}生字本/.test(japaneseIndex), 'listening page must not expose vocabulary book entry');
  assert(/<meta name="japanese-layout-version" content="2\.3">/.test(japaneseIndex), 'japanese-layout-version meta must remain 2.3');
  assert(/<body data-japanese-layout-version="2\.3">/.test(japaneseIndex), 'japanese-layout-version body marker must remain 2.3');
  assert(/\.\.\/style\.css\?v=(2\.8|2\.9)/.test(japaneseIndex), 'style cache query must update to v=2.8');
  assert(/\.\.\/script\.js\?v=(2\.[89]|3\.0)/.test(japaneseIndex), 'script cache query must update to v=2.8');
  assert(/function getJapaneseVocabularyBookToast\(\)[\s\S]*getElementById\?\.\("japaneseVocabularyBookToast"\)[\s\S]*document\.body\?\.appendChild\(toast\)/.test(script), 'toast must be created once and appended without moving card layout');
  assert(/function showJapaneseVocabularyBookToast\(message\)[\s\S]*toast\.textContent = message[\s\S]*setTimeout\([\s\S]*1800/.test(script), 'toast must use textContent and disappear automatically');
  assert(!/vocabulary-book-toast[\s\S]{0,500}innerHTML/.test(script), 'toast must not use innerHTML');
  assert(/\.vocabulary-book-toast\s*{[\s\S]*position:\s*fixed;[\s\S]*bottom:\s*calc\(1rem \+ env\(safe-area-inset-bottom, 0px\)\)/.test(style), 'toast must be fixed near the safe-area-aware bottom center');
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
checkButtonAndToastFeedback();
checkIntegrationBoundaries();
checkVocabularyBaseline();
console.log('Batch 15A-2A Japanese vocabulary book checks passed.');
