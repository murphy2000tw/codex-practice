const VOCABULARY_CARD_COUNT = 10;
const GRAMMAR_CARD_COUNT = 5;
const VOCABULARY_URL = window.JAPANESE_VOCABULARY_URL || "vocabulary.json";
const GRAMMAR_URL = window.JAPANESE_GRAMMAR_URL || "grammar.json";
const SENTENCE_COMPOSITION_URL = window.JAPANESE_SENTENCE_COMPOSITION_URL || "japaneseSentenceCompositionQuestions.json";

const JAPANESE_VOCAB_SEEN_COUNTS_KEY = "japanese_vocab_seen_counts";
const JAPANESE_GRAMMAR_SEEN_COUNTS_KEY = "japanese_grammar_seen_counts";

const JAPANESE_VOCABULARY_BOOK_KEY = "japanese_vocabulary_book_v1";
const JAPANESE_VOCABULARY_BOOK_SCHEMA_VERSION = 1;
const JAPANESE_VOCABULARY_BOOK_SOURCES = Object.freeze(["vocabulary-card", "reading-lookup"]);
let japaneseVocabularyBookMemoryRaw = null;
let japaneseVocabularyBookStorageFallback = false;

function createEmptyJapaneseVocabularyBook() {
  return { schemaVersion: JAPANESE_VOCABULARY_BOOK_SCHEMA_VERSION, itemsById: {} };
}

function normalizeJapaneseVocabularyBookId(id) {
  return String(id ?? "").trim();
}

function isAllowedJapaneseVocabularyBookSource(source) {
  return JAPANESE_VOCABULARY_BOOK_SOURCES.includes(source);
}

function normalizeJapaneseVocabularyBookData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return createEmptyJapaneseVocabularyBook();
  if (data.schemaVersion !== JAPANESE_VOCABULARY_BOOK_SCHEMA_VERSION) return createEmptyJapaneseVocabularyBook();
  if (!data.itemsById || typeof data.itemsById !== "object" || Array.isArray(data.itemsById)) return createEmptyJapaneseVocabularyBook();

  const normalized = createEmptyJapaneseVocabularyBook();
  Object.entries(data.itemsById).forEach(([key, item]) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const vocabularyId = normalizeJapaneseVocabularyBookId(item.vocabularyId ?? key);
    if (!vocabularyId || vocabularyId !== normalizeJapaneseVocabularyBookId(key)) return;
    if (!isAllowedJapaneseVocabularyBookSource(item.source)) return;
    const createdAt = String(item.createdAt ?? "");
    const updatedAt = String(item.updatedAt ?? "");
    if (!createdAt || Number.isNaN(Date.parse(createdAt)) || !updatedAt || Number.isNaN(Date.parse(updatedAt))) return;
    normalized.itemsById[vocabularyId] = { vocabularyId, source: item.source, createdAt, updatedAt };
  });
  return normalized;
}

function readJapaneseVocabularyBookRaw() {
  if (japaneseVocabularyBookStorageFallback) return japaneseVocabularyBookMemoryRaw;
  try {
    return window.localStorage?.getItem(JAPANESE_VOCABULARY_BOOK_KEY) ?? null;
  } catch (error) {
    japaneseVocabularyBookStorageFallback = true;
    return japaneseVocabularyBookMemoryRaw;
  }
}

function writeJapaneseVocabularyBookRaw(rawData) {
  if (japaneseVocabularyBookStorageFallback) {
    japaneseVocabularyBookMemoryRaw = rawData;
    return;
  }
  try {
    window.localStorage?.setItem(JAPANESE_VOCABULARY_BOOK_KEY, rawData);
  } catch (error) {
    japaneseVocabularyBookStorageFallback = true;
    japaneseVocabularyBookMemoryRaw = rawData;
  }
}

function readJapaneseVocabularyBook() {
  try {
    const rawData = readJapaneseVocabularyBookRaw();
    return rawData ? normalizeJapaneseVocabularyBookData(JSON.parse(rawData)) : createEmptyJapaneseVocabularyBook();
  } catch (error) {
    return createEmptyJapaneseVocabularyBook();
  }
}

function writeJapaneseVocabularyBook(book) {
  const normalized = normalizeJapaneseVocabularyBookData(book);
  writeJapaneseVocabularyBookRaw(JSON.stringify(normalized));
  return normalized;
}

function isJapaneseVocabularySaved(id) {
  const vocabularyId = normalizeJapaneseVocabularyBookId(id);
  if (!vocabularyId) return false;
  return Boolean(readJapaneseVocabularyBook().itemsById[vocabularyId]);
}

function addJapaneseVocabularyToBook(id, source, now = new Date()) {
  const vocabularyId = normalizeJapaneseVocabularyBookId(id);
  if (!vocabularyId || !isAllowedJapaneseVocabularyBookSource(source)) return readJapaneseVocabularyBook();
  const book = readJapaneseVocabularyBook();
  const timestamp = now.toISOString();
  const existing = book.itemsById[vocabularyId];
  book.itemsById[vocabularyId] = {
    vocabularyId,
    source,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };
  return writeJapaneseVocabularyBook(book);
}

function removeJapaneseVocabularyFromBook(id) {
  const vocabularyId = normalizeJapaneseVocabularyBookId(id);
  const book = readJapaneseVocabularyBook();
  if (vocabularyId) delete book.itemsById[vocabularyId];
  return writeJapaneseVocabularyBook(book);
}

function clearJapaneseVocabularyBook() {
  return writeJapaneseVocabularyBook(createEmptyJapaneseVocabularyBook());
}

function resolveJapaneseVocabularyBookItems(currentVocabulary = vocabulary) {
  const byId = new Map((Array.isArray(currentVocabulary) ? currentVocabulary : []).map((entry) => [normalizeJapaneseVocabularyBookId(entry?.id), entry]));
  return Object.values(readJapaneseVocabularyBook().itemsById).map((item) => {
    const entry = byId.get(item.vocabularyId);
    return entry
      ? { ...item, status: "available", entry }
      : { ...item, status: "missing", entry: null };
  });
}

function getJapaneseVocabularyBookStorageNotice() {
  return japaneseVocabularyBookStorageFallback ? "此瀏覽器無法永久保存，資料只保留到關閉頁面" : "";
}

let japaneseVocabularyBookToastTimer = null;

function getJapaneseVocabularyBookToast() {
  let toast = document.getElementById?.("japaneseVocabularyBookToast");
  if (toast) return toast;
  toast = document.createElement("div");
  toast.id = "japaneseVocabularyBookToast";
  toast.className = "vocabulary-book-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.hidden = true;
  document.body?.appendChild(toast);
  return toast;
}

function showJapaneseVocabularyBookToast(message) {
  if (!message) return;
  const toast = getJapaneseVocabularyBookToast();
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");
  clearTimeout(japaneseVocabularyBookToastTimer);
  japaneseVocabularyBookToastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
    toast.textContent = "";
  }, 1800);
}

function updateJapaneseVocabularyBookButtonState(button, saved) {
  button.textContent = saved ? "移除" : "生字本";
  button.setAttribute("aria-pressed", saved ? "true" : "false");
  button.setAttribute("aria-label", saved ? "移出生字本" : "加入生字本");
}

function syncJapaneseVocabularyBookButtons(vocabularyId, message = "") {
  const normalizedId = normalizeJapaneseVocabularyBookId(vocabularyId);
  const saved = isJapaneseVocabularySaved(normalizedId);
  document.querySelectorAll(`[data-vocabulary-book-id="${CSS.escape(normalizedId)}"]`).forEach((button) => {
    updateJapaneseVocabularyBookButtonState(button, saved);
    const status = button.parentElement?.querySelector(".vocabulary-book-status");
    if (status) status.textContent = [message, getJapaneseVocabularyBookStorageNotice()].filter(Boolean).join(" ");
  });
  showJapaneseVocabularyBookToast(message);
}

function createJapaneseVocabularyBookControl(vocabularyId, source) {
  const normalizedId = normalizeJapaneseVocabularyBookId(vocabularyId);
  const wrapper = document.createElement("div");
  wrapper.className = `vocabulary-book-control${source === "vocabulary-card" ? " vocabulary-card-book-control" : ""}`;
  const button = document.createElement("button");
  button.className = "secondary-button vocabulary-book-button";
  button.type = "button";
  button.dataset.vocabularyBookId = normalizedId;
  button.dataset.vocabularyBookSource = source;
  const status = document.createElement("p");
  status.className = "vocabulary-book-status";
  status.setAttribute("aria-live", "polite");
  button.addEventListener("click", () => {
    const wasSaved = isJapaneseVocabularySaved(normalizedId);
    if (wasSaved) removeJapaneseVocabularyFromBook(normalizedId);
    else addJapaneseVocabularyToBook(normalizedId, source);
    syncJapaneseVocabularyBookButtons(normalizedId, wasSaved ? "已從生字本移除" : "已加入生字本");
  });
  const saved = isJapaneseVocabularySaved(normalizedId);
  updateJapaneseVocabularyBookButtonState(button, saved);
  status.textContent = getJapaneseVocabularyBookStorageNotice();
  wrapper.append(button, status);
  return wrapper;
}


const JAPANESE_MISTAKE_BOOK_KEY = "japanese_mistake_book_v1";
const JAPANESE_MISTAKE_BOOK_SCHEMA_VERSION = 1;
const JAPANESE_MISTAKE_QUESTION_TYPES = Object.freeze({
  vocabularyMeaning: { module: "vocabulary", keyParts: ["module", "questionType", "itemId"] },
  grammarMeaning: { module: "grammar", keyParts: ["module", "questionType", "itemId"] },
  grammarCloze: { module: "grammar", keyParts: ["module", "questionType", "itemId"] },
  readingQuestion: { module: "reading", keyParts: ["module", "questionType", "relatedId", "itemId"] },
  listeningMeaning: { module: "listening", keyParts: ["module", "questionType", "itemId"] },
});
let japaneseMistakeBookMemoryRaw = null;
let japaneseMistakeBookStorageFallback = false;
const japaneseMistakeBookMissingIdWarnings = new Set();

function createEmptyJapaneseMistakeBook() {
  return { schemaVersion: JAPANESE_MISTAKE_BOOK_SCHEMA_VERSION, itemsById: {} };
}

function normalizeJapaneseMistakeBookId(id) {
  return String(id ?? "").trim();
}

function isValidJapaneseMistakeTimestamp(value) {
  return typeof value === "string" && value && !Number.isNaN(Date.parse(value));
}

function getJapaneseMistakeTypeDefinition(questionType) {
  return JAPANESE_MISTAKE_QUESTION_TYPES[questionType] || null;
}

function createJapaneseMistakeDedupeKey({ module, questionType, itemId, relatedId }) {
  const definition = getJapaneseMistakeTypeDefinition(questionType);
  const normalizedModule = normalizeJapaneseMistakeBookId(module);
  const normalizedItemId = normalizeJapaneseMistakeBookId(itemId);
  const normalizedRelatedId = normalizeJapaneseMistakeBookId(relatedId ?? itemId);
  if (!definition || definition.module !== normalizedModule || !normalizedItemId || !normalizedRelatedId) return "";
  const values = { module: normalizedModule, questionType, itemId: normalizedItemId, relatedId: normalizedRelatedId };
  return definition.keyParts.map((part) => values[part]).join(":");
}

function normalizeJapaneseMistakeBookData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return createEmptyJapaneseMistakeBook();
  if (data.schemaVersion !== JAPANESE_MISTAKE_BOOK_SCHEMA_VERSION) return createEmptyJapaneseMistakeBook();
  if (!data.itemsById || typeof data.itemsById !== "object" || Array.isArray(data.itemsById)) return createEmptyJapaneseMistakeBook();
  const normalized = createEmptyJapaneseMistakeBook();
  Object.entries(data.itemsById).forEach(([key, item]) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const module = normalizeJapaneseMistakeBookId(item.module);
    const questionType = normalizeJapaneseMistakeBookId(item.questionType);
    const itemId = normalizeJapaneseMistakeBookId(item.itemId);
    const relatedId = normalizeJapaneseMistakeBookId(item.relatedId ?? itemId);
    const dedupeKey = createJapaneseMistakeDedupeKey({ module, questionType, itemId, relatedId });
    const wrongCount = Number(item.wrongCount);
    const createdAt = String(item.createdAt ?? "");
    const updatedAt = String(item.updatedAt ?? "");
    const lastWrongAt = String(item.lastWrongAt ?? "");
    if (!dedupeKey || dedupeKey !== normalizeJapaneseMistakeBookId(key)) return;
    if (!Number.isInteger(wrongCount) || wrongCount < 1) return;
    if (![createdAt, updatedAt, lastWrongAt].every(isValidJapaneseMistakeTimestamp)) return;
    normalized.itemsById[dedupeKey] = {
      module, questionType, itemId, relatedId, wrongCount, lastWrongAt,
      userAnswer: String(item.userAnswer ?? ""),
      correctAnswer: String(item.correctAnswer ?? ""),
      createdAt, updatedAt,
    };
  });
  return normalized;
}

function readJapaneseMistakeBookRaw() {
  if (japaneseMistakeBookStorageFallback) return japaneseMistakeBookMemoryRaw;
  try { return window.localStorage?.getItem(JAPANESE_MISTAKE_BOOK_KEY) ?? null; }
  catch (error) { japaneseMistakeBookStorageFallback = true; return japaneseMistakeBookMemoryRaw; }
}

function writeJapaneseMistakeBookRaw(rawData) {
  if (japaneseMistakeBookStorageFallback) { japaneseMistakeBookMemoryRaw = rawData; return; }
  try { window.localStorage?.setItem(JAPANESE_MISTAKE_BOOK_KEY, rawData); }
  catch (error) { japaneseMistakeBookStorageFallback = true; japaneseMistakeBookMemoryRaw = rawData; }
}

function readJapaneseMistakeBook() {
  try { const rawData = readJapaneseMistakeBookRaw(); return rawData ? normalizeJapaneseMistakeBookData(JSON.parse(rawData)) : createEmptyJapaneseMistakeBook(); }
  catch (error) { return createEmptyJapaneseMistakeBook(); }
}

function writeJapaneseMistakeBook(book) {
  const normalized = normalizeJapaneseMistakeBookData(book);
  writeJapaneseMistakeBookRaw(JSON.stringify(normalized));
  return normalized;
}

function warnJapaneseMistakeMissingIdOnce(context) {
  if (!context || japaneseMistakeBookMissingIdWarnings.has(context)) return;
  japaneseMistakeBookMissingIdWarnings.add(context);
  console.warn(`Japanese mistake book skipped missing stable ID: ${context}`);
}

function recordJapaneseMistake(payload, now = new Date()) {
  const timestamp = now.toISOString();
  const module = normalizeJapaneseMistakeBookId(payload?.module);
  const questionType = normalizeJapaneseMistakeBookId(payload?.questionType);
  const itemId = normalizeJapaneseMistakeBookId(payload?.itemId);
  const relatedId = normalizeJapaneseMistakeBookId(payload?.relatedId ?? payload?.itemId);
  const dedupeKey = createJapaneseMistakeDedupeKey({ module, questionType, itemId, relatedId });
  if (!dedupeKey) { warnJapaneseMistakeMissingIdOnce(`${module || "unknown"}:${questionType || "unknown"}`); return readJapaneseMistakeBook(); }
  const book = readJapaneseMistakeBook();
  const existing = book.itemsById[dedupeKey];
  book.itemsById[dedupeKey] = {
    module, questionType, itemId, relatedId,
    wrongCount: existing ? existing.wrongCount + 1 : 1,
    lastWrongAt: timestamp,
    userAnswer: String(payload?.userAnswer ?? ""),
    correctAnswer: String(payload?.correctAnswer ?? ""),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };
  return writeJapaneseMistakeBook(book);
}

function hasJapaneseMistake(dedupeKey) {
  return Boolean(readJapaneseMistakeBook().itemsById[normalizeJapaneseMistakeBookId(dedupeKey)]);
}

function getAllJapaneseMistakeRecords() {
  return Object.values(readJapaneseMistakeBook().itemsById);
}

function removeJapaneseMistake(dedupeKey) {
  const book = readJapaneseMistakeBook();
  delete book.itemsById[normalizeJapaneseMistakeBookId(dedupeKey)];
  return writeJapaneseMistakeBook(book);
}

function clearJapaneseMistakeBook() {
  return writeJapaneseMistakeBook(createEmptyJapaneseMistakeBook());
}

function recordActiveQuizMistake(selectedOption, correctAnswer) {
  const activeQuestion = isGrammarQuizMode() ? currentGrammarQuizQuestion : currentQuizQuestion;
  if (isGrammarQuizMode()) {
    const grammarId = activeQuestion?.grammar?.id;
    recordJapaneseMistake({ module: "grammar", questionType: isGrammarClozeQuizType() ? "grammarCloze" : "grammarMeaning", itemId: grammarId, relatedId: grammarId, userAnswer: selectedOption?.meaning, correctAnswer });
  } else {
    const vocabularyId = activeQuestion?.word?.id;
    recordJapaneseMistake({ module: "vocabulary", questionType: "vocabularyMeaning", itemId: vocabularyId, relatedId: vocabularyId, userAnswer: selectedOption?.meaning, correctAnswer });
  }
}

Object.assign(window, {
  JAPANESE_VOCABULARY_BOOK_KEY,
  createEmptyJapaneseVocabularyBook,
  normalizeJapaneseVocabularyBookData,
  readJapaneseVocabularyBook,
  writeJapaneseVocabularyBook,
  isJapaneseVocabularySaved,
  addJapaneseVocabularyToBook,
  removeJapaneseVocabularyFromBook,
  resolveJapaneseVocabularyBookItems,
  clearJapaneseVocabularyBook,
  JAPANESE_MISTAKE_BOOK_KEY,
  JAPANESE_MISTAKE_QUESTION_TYPES,
  createEmptyJapaneseMistakeBook,
  normalizeJapaneseMistakeBookData,
  readJapaneseMistakeBook,
  writeJapaneseMistakeBook,
  createJapaneseMistakeDedupeKey,
  recordJapaneseMistake,
  hasJapaneseMistake,
  getAllJapaneseMistakeRecords,
  removeJapaneseMistake,
  clearJapaneseMistakeBook,
});


function readSeenCounts(storageKey) {
  try {
    const rawCounts = window.localStorage?.getItem(storageKey);
    const parsedCounts = rawCounts ? JSON.parse(rawCounts) : {};

    if (!parsedCounts || typeof parsedCounts !== "object" || Array.isArray(parsedCounts)) {
      return {};
    }

    return parsedCounts;
  } catch (error) {
    return {};
  }
}

function writeSeenCounts(storageKey, seenCounts) {
  try {
    window.localStorage?.setItem(storageKey, JSON.stringify(seenCounts));
  } catch (error) {
    // localStorage may be unavailable in private or restricted browser contexts.
  }
}

function getSeenCount(seenCounts, itemKey) {
  const count = Number(seenCounts[itemKey]);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function incrementSeenCount(storageKey, itemKey) {
  const seenCounts = readSeenCounts(storageKey);
  seenCounts[itemKey] = getSeenCount(seenCounts, itemKey) + 1;
  writeSeenCounts(storageKey, seenCounts);
}

function getVocabularySeenKey(word) {
  return String(word.id ?? word.word);
}

function getGrammarSeenKey(grammar) {
  return String(grammar.grammarId ?? grammar.id ?? grammar.grammar);
}

function pickLeastSeenItem(items, storageKey, getItemKey, excludeKeys = new Set()) {
  if (items.length === 0) {
    return null;
  }

  const seenCounts = readSeenCounts(storageKey);
  const availableItems = items.filter((item) => !excludeKeys.has(getItemKey(item)));
  const candidates = availableItems.length > 0 ? availableItems : items;
  const leastSeenCount = Math.min(...candidates.map((item) => getSeenCount(seenCounts, getItemKey(item))));
  const leastSeenItems = candidates.filter((item) => getSeenCount(seenCounts, getItemKey(item)) === leastSeenCount);

  return getRandomItem(leastSeenItems);
}

function pickLeastSeenItems(items, itemCount, storageKey, getItemKey, previousKeys = new Set()) {
  const pickedItems = [];
  const pickedKeys = new Set();
  const previousFilteredKeys = new Set([...previousKeys].filter((key) => items.some((item) => getItemKey(item) === key)));

  while (pickedItems.length < itemCount && pickedItems.length < items.length) {
    const excludeKeys = pickedKeys.size + previousFilteredKeys.size < items.length
      ? new Set([...pickedKeys, ...previousFilteredKeys])
      : pickedKeys;
    const pickedItem = pickLeastSeenItem(items, storageKey, getItemKey, excludeKeys);

    if (!pickedItem) {
      break;
    }

    pickedItems.push(pickedItem);
    pickedKeys.add(getItemKey(pickedItem));
  }

  return pickedItems;
}

function incrementSeenCountsForItems(items, storageKey, getItemKey) {
  items.forEach((item) => incrementSeenCount(storageKey, getItemKey(item)));
}
function confirmResetJapaneseQuizProgress(resetAction) {
  const confirmed = window.confirm("確定要重設日文學習進度嗎？此動作無法復原。");

  if (!confirmed) {
    return false;
  }

  resetAction();
  window.alert("日文測驗進度已重設。");
  return true;
}

const CATEGORY_FILTERS = [
  { id: "all", label: "全部", matches: null },
  { id: "noun", label: "名詞", matches: ["名詞", "代名詞", "疑問詞", "連體詞"] },
  { id: "verb", label: "動詞", matches: ["動詞"] },
  { id: "i-adjective", label: "い形容詞", matches: ["い形容詞"] },
  { id: "na-adjective", label: "な形容詞", matches: ["な形容詞"] },
  { id: "adverb", label: "副詞", matches: ["副詞"] },
  { id: "number-counter", label: "數字／量詞", matches: ["數詞", "數量詞"] },
  { id: "expression", label: "表達句型", matches: ["感嘆詞"] },
];
const LEVEL_FILTERS = [
  { id: "all", label: "全部程度", level: null },
  { id: "n5", label: "N5", level: "N5" },
  { id: "n4", label: "N4", level: "N4" },
];
const GRAMMAR_CATEGORY_FILTERS = [
  { id: "all", label: "全部分類", category: null },
  { id: "particle", label: "助詞", category: "助詞" },
  { id: "verb-change", label: "動詞變化", category: "動詞變化" },
  { id: "desire", label: "希望", category: "希望" },
  { id: "obligation-permission", label: "義務・許可", category: "義務・許可" },
  { id: "experience", label: "經驗", category: "經驗" },
  { id: "condition", label: "條件", category: "條件" },
  { id: "giving-receiving", label: "授受", category: "授受" },
  { id: "conjecture-appearance", label: "推量・樣態", category: "推量・樣態" },
  { id: "parallel-example", label: "並列・例示", category: "並列・例示" },
  { id: "purpose-reason", label: "目的・理由", category: "目的・理由" },
  { id: "other", label: "其他", category: "其他" },
];

const PART_OF_SPEECH_GROUPS = [
  { id: "verb", matches: ["動詞"] },
  { id: "i-adjective", matches: ["い形容詞"] },
  { id: "na-adjective", matches: ["な形容詞"] },
  { id: "adverb", matches: ["副詞"] },
  { id: "number-counter", matches: ["數詞", "數量詞", "數量詞相關"] },
  { id: "noun", matches: ["名詞", "代名詞", "疑問詞"] },
  { id: "other", matches: ["連體詞", "接続詞", "感嘆詞", "表達句型"] },
];

const cardsContainer = document.querySelector("#vocabularyCards");
const categoryFilters = document.querySelector("#categoryFilters");
const levelFilters = document.querySelector("#levelFilters");
const categoryCount = document.querySelector("#categoryCount");
const categoryFilterLabel = document.querySelector("#categoryFilterLabel");
const levelFilterLabel = document.querySelector("#levelFilterLabel");
const toggleButton = document.querySelector("#toggleAnswers");
const shuffleButton = document.querySelector("#shuffleWords");
const wordSetStatus = document.querySelector("#wordSetStatus");
const wordSearchInput = document.querySelector("#wordSearch");
const searchLabel = document.querySelector("#searchLabel");
const clearSearchButton = document.querySelector("#clearSearch");
const cardModeButton = document.querySelector("#cardModeButton");
const quizModeButton = document.querySelector("#quizModeButton");
const grammarModeButton = document.querySelector("#grammarModeButton");
const grammarQuizModeButton = document.querySelector("#grammarQuizModeButton");
const controlsPanel = document.querySelector(".controls");
const quizPanel = document.querySelector("#quizPanel");
const japaneseVocabularyMenuView = document.querySelector("#japaneseVocabularyMenuView");
const japaneseVocabularyStudyView = document.querySelector("#japaneseVocabularyStudyView");
const japaneseVocabularyEntryButtons = document.querySelectorAll("[data-japanese-vocabulary-entry]");
const japaneseGrammarMenuView = document.querySelector("#japaneseGrammarMenuView");
const japaneseGrammarEntryButtons = document.querySelectorAll("[data-japanese-grammar-entry]");
const japaneseSentenceCompositionView = document.querySelector("#japaneseSentenceCompositionView");
const sentenceCompositionContent = document.querySelector("#sentenceCompositionContent");
const backToGrammarMenuFromSentenceCompositionButton = document.querySelector("#backToGrammarMenuFromSentenceComposition");
const backToVocabularyMenuFromPracticeButton = document.querySelector("#backToVocabularyMenuFromPractice");
const backToVocabularyStudyButton = document.querySelector("#backToVocabularyStudy");
const quizContent = document.querySelector("#quizContent");
const quizTitle = document.querySelector(".quiz-title");
const nextQuizQuestionButton = document.querySelector("#nextQuizQuestion");
const restartQuizButton = document.querySelector("#restartQuiz");
const quizAnsweredCount = document.querySelector("#quizAnsweredCount");
const quizCorrectCount = document.querySelector("#quizCorrectCount");
const quizAccuracy = document.querySelector("#quizAccuracy");
const grammarQuizTypeControls = document.querySelector("#grammarQuizTypeControls");
const grammarMeaningQuizTypeButton = document.querySelector("#grammarMeaningQuizTypeButton");
const grammarClozeQuizTypeButton = document.querySelector("#grammarClozeQuizTypeButton");
const japaneseContent = document.querySelector("#japaneseContent");
const japaneseHomeContent = document.querySelector("#japaneseHomeContent");
const japaneseMainContent = document.querySelector("#japaneseMainContent");
const japaneseReadingPanel = document.querySelector("#japaneseReadingPanel");
const japaneseReviewPanel = document.querySelector("#japaneseReviewPanel");
const japaneseReviewMenuView = document.querySelector("#japaneseReviewMenuView");
const japaneseReviewContent = document.querySelector("#japaneseReviewContent");
const japaneseListeningPanel = document.querySelector("#japaneseListeningPanel");
const japaneseTabButtons = document.querySelectorAll(".japanese-tab-button");
const japaneseEntryButtons = document.querySelectorAll("[data-japanese-entry]");
const japaneseBackHomeButtons = document.querySelectorAll("[data-japanese-back-home]");
const modeButtons = document.querySelectorAll(".mode-button[data-mode-group]");
const modePanels = document.querySelectorAll("[data-mode-panel]");
const japaneseFeatureEyebrow = document.querySelector("#japanese-feature-eyebrow");
const japaneseFeatureTitle = document.querySelector("#vocabulary-page-title");
const japaneseFeatureDescription = document.querySelector("#japanese-feature-description");

let vocabulary = [];
let filteredVocabulary = [];
let currentWords = [];
let previousWordIds = new Set();
let grammarItems = [];
let filteredGrammar = [];
let currentGrammarItems = [];
let previousGrammarIds = new Set();
let answersVisible = false;
let currentGroupNumber = 0;
let currentGrammarGroupNumber = 0;
let reshuffleNotice = "";
let grammarReshuffleNotice = "";
let activeCategoryId = "all";
let activeLevelId = "all";
let activeGrammarCategoryId = "all";
let activeGrammarLevelId = "all";
let searchQuery = "";
let grammarSearchQuery = "";
let activeMode = "cards";
let japaneseVocabularyView = "menu";
let japaneseGrammarView = "menu";
let currentJapaneseView = "home";
let activeJapaneseTab = "home";
let currentQuizQuestion = null;
let quizAnsweredCountValue = 0;
let quizCorrectCountValue = 0;
let quizHasAnsweredCurrentQuestion = false;
let currentGrammarQuizQuestion = null;
let activeGrammarQuizType = "meaning";
let grammarQuizAnsweredCountValue = 0;
let grammarQuizCorrectCountValue = 0;
let grammarQuizHasAnsweredCurrentQuestion = false;
let wordQuizRoundSeenKeys = new Set();
let grammarQuizRoundSeenKeys = new Set();
let grammarHasLoaded = false;
let grammarIsLoading = false;
let sentenceCompositionQuestions = [];
let sentenceCompositionHasLoaded = false;
let sentenceCompositionIsLoading = false;
let activeSentenceCompositionLevel = "all";
let currentSentenceCompositionQuestion = null;
let currentSentenceCompositionAnswer = [];
let currentSentenceCompositionLocked = false;
let previousSentenceCompositionQuestionId = null;

function isJapaneseHomeTab() {
  return currentJapaneseView === "home";
}

function getModePanelView(view) {
  return view === "vocabulary" ? "vocab" : view;
}

function updateModeButtonsForJapaneseTab() {
  const activeModePanelView = getModePanelView(currentJapaneseView);

  modePanels.forEach((panel) => {
    panel.hidden = isJapaneseHomeTab() || panel.dataset.modePanel !== activeModePanelView;
  });

  modeButtons.forEach((button) => {
    button.hidden = false;
  });
}

function normalizeJapaneseView(view) {
  if (view === "vocab") return "vocabulary";
  if (["home", "vocabulary", "grammar", "reading", "listening", "listeningMenu", "listeningPractice", "listeningQuiz", "reviewMenu", "vocabularyBook", "mistakeBook"].includes(view)) return view;
  return "home";
}

function getJapaneseViewElement(view) {
  if (view === "home") return japaneseHomeContent;
  if (view === "vocabulary" || view === "grammar") return japaneseMainContent;
  if (view === "reading") return japaneseReadingPanel;
  if (["listening", "listeningMenu", "listeningPractice", "listeningQuiz"].includes(view)) return japaneseListeningPanel;
  if (["reviewMenu", "vocabularyBook", "mistakeBook"].includes(view)) return japaneseReviewPanel;
  return japaneseHomeContent;
}

function renderJapaneseView(view) {
  const normalizedView = normalizeJapaneseView(view);
  const nextView = getJapaneseViewElement(normalizedView) ? normalizedView : "home";
  const panelView = ["listeningMenu", "listeningPractice", "listeningQuiz"].includes(nextView) ? "listening" : (["reviewMenu", "vocabularyBook", "mistakeBook"].includes(nextView) ? "review" : nextView);
  currentJapaneseView = nextView;
  activeJapaneseTab = getModePanelView(panelView);

  const nextViewElement = getJapaneseViewElement(nextView);
  if (japaneseContent && nextViewElement) {
    japaneseContent.replaceChildren(nextViewElement);
  }

  if (japaneseHomeContent) japaneseHomeContent.hidden = panelView !== "home";
  if (japaneseMainContent) japaneseMainContent.hidden = panelView !== "vocabulary" && panelView !== "grammar";
  if (japaneseFeatureEyebrow && japaneseFeatureTitle && japaneseFeatureDescription) {
    const isGrammarView = panelView === "grammar";
    japaneseFeatureEyebrow.textContent = isGrammarView ? "JAPANESE GRAMMAR" : "Japanese Vocabulary";
    japaneseFeatureTitle.textContent = isGrammarView ? "日文文法" : "日文單字";
    japaneseFeatureDescription.textContent = isGrammarView
      ? "文法區保留文法練習與文法測驗入口；練習模式可查看說明，測驗模式專注作答。"
      : "選擇要進行單字練習或單字測驗。";
  }
  if (japaneseReadingPanel) japaneseReadingPanel.hidden = panelView !== "reading";
  if (japaneseListeningPanel) japaneseListeningPanel.hidden = panelView !== "listening";
  if (japaneseReviewPanel) japaneseReviewPanel.hidden = panelView !== "review";
  if (panelView !== "review") resetJapaneseReviewPanel();
  if (panelView !== "grammar") resetJapaneseSentenceCompositionState();

  japaneseTabButtons.forEach((button) => {
    const isActive = button.dataset.japaneseTab === panelView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  japaneseEntryButtons.forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });

  updateModeButtonsForJapaneseTab();
}

async function switchJapaneseTab(tab) {
  const normalizedTab = normalizeJapaneseView(tab);
  renderJapaneseView(normalizedTab);

  if (normalizedTab === "vocabulary") {
    activeMode = "cards";
    renderJapaneseVocabularyView("menu");
  } else if (normalizedTab === "grammar") {
    activeMode = "grammar";
    renderJapaneseGrammarView("menu");
  } else if (normalizedTab === "reading" && typeof initializeReadingPanel === "function") {
    initializeReadingPanel();
  } else if (normalizedTab === "listening" && typeof initializeListeningPanel === "function") {
    initializeListeningPanel();
  } else if (["reviewMenu", "vocabularyBook", "mistakeBook"].includes(normalizedTab)) {
    await renderJapaneseReviewView(normalizedTab);
  }
}

window.showJapaneseContentView = switchJapaneseTab;


const JAPANESE_REVIEW_QUESTION_TYPE_LABELS = Object.freeze({
  vocabularyMeaning: "單字測驗", grammarMeaning: "文法意思", grammarCloze: "文法填空", readingQuestion: "閱讀測驗", listeningMeaning: "聽力測驗",
});
const JAPANESE_REVIEW_MODULE_LABELS = Object.freeze({ vocabulary: "單字", grammar: "文法", reading: "閱讀", listening: "聽力" });
const JAPANESE_REVIEW_MODULE_ORDER = Object.freeze(["vocabulary", "grammar", "reading", "listening"]);

function resetJapaneseReviewPanel() {
  if (japaneseReviewMenuView) japaneseReviewMenuView.replaceChildren();
  if (japaneseReviewContent) japaneseReviewContent.replaceChildren();
}

function createReviewButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className || "secondary-button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function appendReviewField(parent, label, value) {
  const p = document.createElement("p");
  p.className = "review-field";
  const strong = document.createElement("strong");
  strong.textContent = `${label}：`;
  const span = document.createElement("span");
  span.textContent = String(value ?? "—");
  p.append(strong, span);
  parent.appendChild(p);
}

function getJapaneseReviewCounts() {
  return { vocabulary: Object.keys(readJapaneseVocabularyBook().itemsById).length, mistakes: Object.keys(readJapaneseMistakeBook().itemsById).length };
}

async function renderJapaneseReviewView(view) {
  if (!japaneseReviewMenuView || !japaneseReviewContent) return;
  resetJapaneseReviewPanel();
  if (view === "reviewMenu") return renderJapaneseReviewMenu();
  if (view === "vocabularyBook") return renderJapaneseVocabularyBookPage();
  if (view === "mistakeBook") return renderJapaneseMistakeBookPage();
}

function renderJapaneseReviewMenu() {
  const counts = getJapaneseReviewCounts();
  const section = document.createElement("section");
  section.className = "entry-section japanese-review-menu";
  const header = document.createElement("div");
  header.className = "category-header";
  const title = document.createElement("h2");
  title.id = "japanese-review-title";
  title.textContent = "複習中心";
  const count = document.createElement("p");
  count.className = "category-count";
  count.textContent = `生字 ${counts.vocabulary} 筆・錯題 ${counts.mistakes} 筆`;
  header.append(title, count);
  const grid = document.createElement("div");
  grid.className = "entry-grid japanese-review-entry-grid";
  [["01","生字本",`目前收藏總數：${counts.vocabulary}`,"查看生字本","vocabularyBook"],["02","錯題本",`目前錯題總數：${counts.mistakes}`,"查看錯題本","mistakeBook"]].forEach(([num,name,text,action,target]) => {
    const card = createReviewButton("", "word-card entry-card japanese-main-entry-card review-menu-card", () => switchJapaneseTab(target));
    const n = Object.assign(document.createElement("span"), { className: "card-number", textContent: num });
    const h = Object.assign(document.createElement("h3"), { className: "entry-card-title", textContent: name });
    const p = Object.assign(document.createElement("p"), { className: "entry-card-text", textContent: text });
    const a = Object.assign(document.createElement("span"), { className: "entry-card-action", textContent: action });
    card.append(n,h,p,a); grid.appendChild(card);
  });
  section.append(header, grid, createReviewButton("返回日文首頁", "secondary-button review-back-button", () => switchJapaneseTab("home")));
  japaneseReviewMenuView.replaceChildren(section);
}

function sourceLabel(source) { return source === "reading-lookup" ? "閱讀查字" : "單字練習"; }
function dateText(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "日期無效" : new Intl.DateTimeFormat("zh-Hant-TW", { dateStyle:"medium", timeStyle:"short" }).format(date); }

function renderJapaneseVocabularyBookPage(message = "") {
  const items = resolveJapaneseVocabularyBookItems().sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
  const section = document.createElement("section"); section.className="japanese-review-book";
  const status = Object.assign(document.createElement("p"), { className:"status-message review-status", textContent: message }); status.setAttribute("role","status"); status.setAttribute("aria-live","polite");
  const title = Object.assign(document.createElement("h2"), { textContent:"生字本" });
  const count = Object.assign(document.createElement("p"), { className:"category-count", textContent:`收藏總數：${items.length}` });
  const actions = document.createElement("div"); actions.className="review-actions";
  actions.append(createReviewButton("返回複習中心","secondary-button",()=>switchJapaneseTab("reviewMenu")));
  const clear = createReviewButton("清空生字本","secondary-button danger-button",()=>{ if(window.confirm("確定要清空生字本嗎？此操作無法復原。")){ clearJapaneseVocabularyBook(); renderJapaneseVocabularyBookPage("已清空生字本"); }});
  clear.disabled = items.length === 0; actions.append(clear);
  const notice = Object.assign(document.createElement("p"), { className:"review-storage-notice", textContent:getJapaneseVocabularyBookStorageNotice() });
  const list = document.createElement("div"); list.className="vocabulary-book-list";
  if (!items.length) list.appendChild(Object.assign(document.createElement("p"), { className:"empty-state", textContent:"生字本目前是空的，可以從單字練習卡或閱讀查字卡加入單字。" }));
  items.forEach((item)=>{ const card=document.createElement("article"); card.className="review-card vocabulary-book-card"; if(item.status==="missing"){ appendReviewField(card,"狀態","此單字已從題庫移除"); appendReviewField(card,"vocabulary ID",item.vocabularyId); } else { const e=item.entry; appendReviewField(card,"單字",e.word); appendReviewField(card,"假名",e.kana); appendReviewField(card,"中文意思",e.meaning); appendReviewField(card,"詞性",e.partOfSpeech); appendReviewField(card,"程度",e.level); appendReviewField(card,"加入來源",sourceLabel(item.source)); const details=document.createElement("details"); const summary=document.createElement("summary"); summary.textContent="查看例句"; details.appendChild(summary); appendReviewField(details,"日文例句",e.example); appendReviewField(details,"例句假名",e.exampleKana); appendReviewField(details,"中文翻譯",e.exampleMeaning); card.appendChild(details);} const rm=createReviewButton("移除","secondary-button",()=>{removeJapaneseVocabularyFromBook(item.vocabularyId); renderJapaneseVocabularyBookPage("已從生字本移除");}); card.appendChild(rm); list.appendChild(card); });
  section.append(title,count,actions,status,notice,list); japaneseReviewContent.replaceChildren(section);
}

function findVocabularyById(id){ return vocabulary.find((x)=>String(x.id)===String(id)); }
function findGrammarById(id){ return grammarItems.find((x)=>String(x.id ?? x.grammarId)===String(id)); }
function findReadingQuestion(record){ const set=(window.JAPANESE_READING_SETS||[]).find((x)=>String(x.id)===String(record.relatedId)); const q=set?.questions?.find((x)=>String(x.id)===String(record.itemId)); return set&&q?{set,q}:null; }
function findListeningById(id){ return (window.JAPANESE_LISTENING_QUESTIONS||JAPANESE_LISTENING_QUESTIONS||[]).find((x)=>String(x.id)===String(id)); }

function appendMistakeResolvedFields(card, record) {
  let found = false;
  if (record.questionType === "vocabularyMeaning") { const e=findVocabularyById(record.itemId); if(e){found=true; ["word","kana","meaning","level","partOfSpeech"].forEach(k=>appendReviewField(card,k,e[k]));} }
  if (record.questionType === "grammarMeaning") { const e=findGrammarById(record.itemId); if(e){found=true; appendReviewField(card,"grammar",e.grammar); appendReviewField(card,"kana",e.kana); appendReviewField(card,"meaning",e.meaning); appendReviewField(card,"level",e.level); appendReviewField(card,"category",e.category);} }
  if (record.questionType === "grammarCloze") { const e=findGrammarById(record.itemId); if(e){found=true; appendReviewField(card,"quiz.clozePrompt",e.quiz?.clozePrompt); appendReviewField(card,"quiz.clozePromptKana",e.quiz?.clozePromptKana); appendReviewField(card,"quiz.clozeMeaning",e.quiz?.clozeMeaning); appendReviewField(card,"quiz.explanation",e.quiz?.explanation); appendReviewField(card,"level",e.level); appendReviewField(card,"category",e.category);} }
  if (record.questionType === "readingQuestion") { const r=findReadingQuestion(record); if(r){found=true; appendReviewField(card,"readingSet.title",r.set.title); appendReviewField(card,"readingSet.level",r.set.level); appendReviewField(card,"readingSet.type",r.set.type); appendReviewField(card,"question.question",r.q.question); appendReviewField(card,"question.explanation",r.q.explanation);} }
  if (record.questionType === "listeningMeaning") { const e=findListeningById(record.itemId); if(e){found=true; ["japanese","kana","zh","level","category","question"].forEach(k=>appendReviewField(card,k,e[k]));} }
  if (!found) { appendReviewField(card,"狀態","此題已從題庫移除或目前無法載入"); ["module","questionType","itemId","relatedId"].forEach(k=>appendReviewField(card,k,record[k])); }
}

async function renderJapaneseMistakeBookPage(message = "") {
  if (!grammarHasLoaded && typeof ensureGrammarLoaded === "function") await ensureGrammarLoaded();
  const records = getAllJapaneseMistakeRecords();
  const section=document.createElement("section"); section.className="japanese-review-book";
  const title=Object.assign(document.createElement("h2"),{textContent:"錯題本"}); const count=Object.assign(document.createElement("p"),{className:"category-count",textContent:`錯題總數：${records.length}`});
  const actions=document.createElement("div"); actions.className="review-actions"; actions.append(createReviewButton("返回複習中心","secondary-button",()=>switchJapaneseTab("reviewMenu")));
  const clear=createReviewButton("清空錯題本","secondary-button danger-button",()=>{ if(window.confirm("確定要清空錯題本嗎？此操作無法復原。")){ clearJapaneseMistakeBook(); renderJapaneseMistakeBookPage("已清空錯題本"); }}); clear.disabled=records.length===0; actions.append(clear);
  const status=Object.assign(document.createElement("p"),{className:"status-message review-status",textContent:message}); status.setAttribute("role","status"); status.setAttribute("aria-live","polite");
  const notice=Object.assign(document.createElement("p"),{className:"review-storage-notice",textContent:japaneseMistakeBookStorageFallback ? "此瀏覽器無法永久保存，資料只保留到關閉頁面" : ""});
  const body=document.createElement("div"); body.className="mistake-book-list";
  if(!records.length) body.appendChild(Object.assign(document.createElement("p"),{className:"empty-state",textContent:"錯題本目前是空的；日文測驗答錯的題目會記錄在這裡。"}));
  JAPANESE_REVIEW_MODULE_ORDER.forEach((module)=>{ const group=records.filter(r=>r.module===module).sort((a,b)=>Date.parse(b.lastWrongAt)-Date.parse(a.lastWrongAt)); if(!group.length)return; const sec=document.createElement("section"); sec.className="mistake-module-group"; const h=Object.assign(document.createElement("h3"),{textContent:`${JAPANESE_REVIEW_MODULE_LABELS[module]}（${group.length}）`}); sec.appendChild(h); group.forEach((record)=>{ const card=document.createElement("article"); card.className="review-card mistake-book-card"; appendReviewField(card,"題型標籤",JAPANESE_REVIEW_QUESTION_TYPE_LABELS[record.questionType] || record.questionType); appendMistakeResolvedFields(card,record); appendReviewField(card,"你的答案",record.userAnswer); appendReviewField(card,"正確答案",record.correctAnswer); appendReviewField(card,"答錯次數",record.wrongCount); appendReviewField(card,"最近答錯時間",dateText(record.lastWrongAt)); const key=createJapaneseMistakeDedupeKey(record); card.appendChild(createReviewButton("移除","secondary-button",()=>{removeJapaneseMistake(key); renderJapaneseMistakeBookPage("已從錯題本移除");})); sec.appendChild(card); }); body.appendChild(sec); });
  section.append(title,count,actions,status,notice,body); japaneseReviewContent.replaceChildren(section);
}


function isGrammarMode() {
  return activeMode === "grammar" || activeMode === "grammar-quiz";
}

window.isGrammarMode = isGrammarMode;
Object.defineProperty(window, "activeMode", {
  get: () => activeMode,
});

function isQuizMode() {
  return activeMode === "quiz" || activeMode === "grammar-quiz";
}

function isGrammarQuizMode() {
  return activeMode === "grammar-quiz";
}

function isGrammarClozeQuizType() {
  return isGrammarQuizMode() && activeGrammarQuizType === "cloze";
}

function getActiveCategory() {
  return CATEGORY_FILTERS.find((category) => category.id === activeCategoryId) ?? CATEGORY_FILTERS[0];
}

function getActiveLevel() {
  return LEVEL_FILTERS.find((level) => level.id === activeLevelId) ?? LEVEL_FILTERS[0];
}

function getActiveGrammarCategory() {
  return GRAMMAR_CATEGORY_FILTERS.find((category) => category.id === activeGrammarCategoryId) ?? GRAMMAR_CATEGORY_FILTERS[0];
}

function getActiveGrammarLevel() {
  return LEVEL_FILTERS.find((level) => level.id === activeGrammarLevelId) ?? LEVEL_FILTERS[0];
}

function getPartOfSpeechValues(partOfSpeech) {
  return String(partOfSpeech ?? "")
    .split(/[／/・、,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function wordMatchesPartOfSpeech(word, matches) {
  return getPartOfSpeechValues(word.partOfSpeech).some((partOfSpeech) => matches.includes(partOfSpeech));
}

function getWordsForCategory(category) {
  if (!category.matches) {
    return vocabulary;
  }

  return vocabulary.filter((word) => wordMatchesPartOfSpeech(word, category.matches));
}

function getWordsForLevel(words, level) {
  if (!level.level) {
    return words;
  }

  return words.filter((word) => word.level === level.level);
}

function getWordsForActiveFilters() {
  return getWordsForLevel(getWordsForCategory(getActiveCategory()), getActiveLevel());
}

function getGrammarForCategory(category) {
  if (!category.category) {
    return grammarItems;
  }

  return grammarItems.filter((grammar) => grammar.category === category.category);
}

function getGrammarForLevel(items, level) {
  if (!level.level) {
    return items;
  }

  return items.filter((grammar) => grammar.level === level.level);
}

function getGrammarForActiveFilters() {
  return getGrammarForLevel(getGrammarForCategory(getActiveGrammarCategory()), getActiveGrammarLevel());
}

function normalizeSearchText(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function wordMatchesSearch(word, query) {
  if (!query) {
    return true;
  }

  const searchableFields = [
    word.word,
    word.kana,
    word.meaning,
    word.partOfSpeech,
    word.level,
    word.example,
    word.exampleKana,
    word.exampleMeaning,
  ];

  return searchableFields.some((field) => normalizeSearchText(field).includes(query));
}

function grammarMatchesSearch(grammar, query) {
  if (!query) {
    return true;
  }

  const searchableFields = [
    grammar.grammar,
    grammar.kana,
    grammar.meaning,
    grammar.structure,
    grammar.usage,
    grammar.example,
    grammar.exampleKana,
    grammar.exampleMeaning,
    grammar.note,
    Array.isArray(grammar.similar) ? grammar.similar.join("、") : grammar.similar,
    grammar.category,
    grammar.level,
    grammar.quiz?.clozePrompt,
    grammar.quiz?.clozePromptKana,
    grammar.quiz?.clozeMeaning,
    grammar.quiz?.answer,
    grammar.quiz?.explanation,
    Array.isArray(grammar.quiz?.choices) ? grammar.quiz.choices.join("、") : "",
  ];

  return searchableFields.some((field) => normalizeSearchText(field).includes(query));
}

function getFilteredVocabulary() {
  return getWordsForActiveFilters().filter((word) => wordMatchesSearch(word, searchQuery));
}

function getFilteredGrammar() {
  return getGrammarForActiveFilters().filter((grammar) => grammarMatchesSearch(grammar, grammarSearchQuery));
}

function shuffleItems(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
  }

  return shuffledItems;
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getPartOfSpeechGroup(partOfSpeech) {
  const partOfSpeechValues = getPartOfSpeechValues(partOfSpeech);

  return PART_OF_SPEECH_GROUPS.find((group) => (
    partOfSpeechValues.some((value) => group.matches.includes(value))
  ))?.id ?? "other";
}

function hasSamePartOfSpeechGroup(word, referenceWord) {
  return getPartOfSpeechGroup(word.partOfSpeech) === getPartOfSpeechGroup(referenceWord.partOfSpeech);
}

function getQuizOptionCandidates(words, questionWord, usedMeanings, usedWordIds) {
  return shuffleItems(words).filter((word) => {
    if (word.id === questionWord.id || usedWordIds.has(word.id)) {
      return false;
    }

    return !usedMeanings.has(word.meaning);
  });
}

function addWrongQuizOptionsFromSource(options, sourceWords, questionWord, usedMeanings, usedWordIds) {
  const candidates = getQuizOptionCandidates(sourceWords, questionWord, usedMeanings, usedWordIds);

  candidates.some((word) => {
    options.push({ meaning: word.meaning, isCorrect: false });
    usedMeanings.add(word.meaning);
    usedWordIds.add(word.id);

    return options.length === 3;
  });
}

function createWrongQuizOptions(questionWord) {
  const wrongOptions = [];
  const usedMeanings = new Set([questionWord.meaning]);
  const usedWordIds = new Set([questionWord.id]);
  const filteredSameGroupWords = filteredVocabulary.filter((word) => hasSamePartOfSpeechGroup(word, questionWord));
  const sameLevelSameGroupWords = vocabulary.filter((word) => (
    word.level === questionWord.level && hasSamePartOfSpeechGroup(word, questionWord)
  ));
  const sameGroupWords = vocabulary.filter((word) => hasSamePartOfSpeechGroup(word, questionWord));

  [
    filteredSameGroupWords,
    sameLevelSameGroupWords,
    sameGroupWords,
    filteredVocabulary,
    vocabulary,
  ].some((sourceWords) => {
    addWrongQuizOptionsFromSource(wrongOptions, sourceWords, questionWord, usedMeanings, usedWordIds);

    return wrongOptions.length === 3;
  });

  return wrongOptions;
}

function getGrammarQuizOptionCandidates(items, questionGrammar, usedMeanings, usedGrammarIds) {
  return shuffleItems(items).filter((grammar) => {
    if (grammar.id === questionGrammar.id || usedGrammarIds.has(grammar.id)) {
      return false;
    }

    return grammar.meaning !== questionGrammar.meaning && !usedMeanings.has(grammar.meaning);
  });
}

function addWrongGrammarQuizOptionsFromSource(options, sourceGrammarItems, questionGrammar, usedMeanings, usedGrammarIds) {
  const candidates = getGrammarQuizOptionCandidates(sourceGrammarItems, questionGrammar, usedMeanings, usedGrammarIds);

  candidates.some((grammar) => {
    options.push({ meaning: grammar.meaning, isCorrect: false });
    usedMeanings.add(grammar.meaning);
    usedGrammarIds.add(grammar.id);

    return options.length === 3;
  });
}

function createWrongGrammarQuizOptions(questionGrammar) {
  const wrongOptions = [];
  const usedMeanings = new Set([questionGrammar.meaning]);
  const usedGrammarIds = new Set([questionGrammar.id]);
  const sameLevelGrammarItems = grammarItems.filter((grammar) => grammar.level === questionGrammar.level);
  const sameCategoryGrammarItems = grammarItems.filter((grammar) => grammar.category === questionGrammar.category);

  [
    sameLevelGrammarItems,
    sameCategoryGrammarItems,
    grammarItems,
  ].some((sourceGrammarItems) => {
    addWrongGrammarQuizOptionsFromSource(wrongOptions, sourceGrammarItems, questionGrammar, usedMeanings, usedGrammarIds);

    return wrongOptions.length === 3;
  });

  return wrongOptions;
}

function updateQuizStats() {
  const answeredCount = isGrammarQuizMode() ? grammarQuizAnsweredCountValue : quizAnsweredCountValue;
  const correctCount = isGrammarQuizMode() ? grammarQuizCorrectCountValue : quizCorrectCountValue;
  const accuracy = answeredCount === 0
    ? 0
    : Math.round((correctCount / answeredCount) * 100);

  quizAnsweredCount.textContent = String(answeredCount);
  quizCorrectCount.textContent = String(correctCount);
  quizAccuracy.textContent = `${accuracy}%`;
}

function resetQuizStats() {
  if (isGrammarQuizMode()) {
    grammarQuizAnsweredCountValue = 0;
    grammarQuizCorrectCountValue = 0;
  } else {
    quizAnsweredCountValue = 0;
    quizCorrectCountValue = 0;
  }

  updateQuizStats();
}

function getTotalGroups() {
  return Math.max(1, Math.ceil(filteredVocabulary.length / VOCABULARY_CARD_COUNT));
}

function getTotalGrammarGroups() {
  return Math.max(1, Math.ceil(filteredGrammar.length / GRAMMAR_CARD_COUNT));
}

function resetDeck() {
  currentGroupNumber = 0;
  reshuffleNotice = "";
}

function resetGrammarDeck() {
  currentGrammarGroupNumber = 0;
  grammarReshuffleNotice = "";
}

function getNextWordSet() {
  const cardsToShow = Math.min(VOCABULARY_CARD_COUNT, filteredVocabulary.length);
  const nextWords = pickLeastSeenItems(
    filteredVocabulary,
    cardsToShow,
    JAPANESE_VOCAB_SEEN_COUNTS_KEY,
    getVocabularySeenKey,
    previousWordIds,
  );
  currentGroupNumber += 1;

  return nextWords;
}

function getNextGrammarSet() {
  const cardsToShow = Math.min(GRAMMAR_CARD_COUNT, filteredGrammar.length);
  const nextGrammarItems = pickLeastSeenItems(
    filteredGrammar,
    cardsToShow,
    JAPANESE_GRAMMAR_SEEN_COUNTS_KEY,
    getGrammarSeenKey,
    previousGrammarIds,
  );
  currentGrammarGroupNumber += 1;

  return nextGrammarItems;
}

function formatSimilarValue(value) {
  if (Array.isArray(value)) {
    return value.join("、");
  }

  return value;
}

function createDetailRow(label, value) {
  const normalizedValue = formatSimilarValue(value);

  if (!normalizedValue) {
    return "";
  }

  return `
    <div class="answer-row">
      <span>${label}</span>
      <strong>${normalizedValue}</strong>
    </div>
  `;
}

function createCard(word, index) {
  const card = document.createElement("article");
  card.className = "word-card";

  card.innerHTML = `
    <div>
      <div class="vocabulary-card-header">
        <span class="card-number">單字 ${index + 1}</span>
      </div>
      <h2 class="japanese-word">${word.word}</h2>
      <p class="kana">${word.kana}</p>
    </div>
    <div class="answer" hidden>
      ${createDetailRow("中文意思", word.meaning)}
      ${createDetailRow("詞性", word.partOfSpeech)}
      ${createDetailRow("程度", word.level)}
      ${createDetailRow("例句", word.example)}
      ${createDetailRow("例句假名", word.exampleKana)}
      ${createDetailRow("中文翻譯", word.exampleMeaning)}
    </div>
  `;

  const vocabularyBookControl = createJapaneseVocabularyBookControl(word.id, "vocabulary-card");
  card.querySelector(".vocabulary-card-header")?.appendChild(vocabularyBookControl);

  return card;
}

function createGrammarCard(grammar, index) {
  const card = document.createElement("article");
  card.className = "word-card grammar-card";

  card.innerHTML = `
    <div>
      <span class="card-number">文法 ${index + 1}</span>
      <h2 class="japanese-word grammar-title">${grammar.grammar}</h2>
      <p class="kana">${grammar.kana}</p>
      <div class="grammar-meta" aria-label="文法基本資訊">
        <span>${grammar.level}</span>
        <span>${grammar.category}</span>
      </div>
    </div>
    <div class="answer grammar-answer" hidden>
      ${createDetailRow("中文意思", grammar.meaning)}
      ${createDetailRow("接續／結構", grammar.structure)}
      ${createDetailRow("用法說明", grammar.usage)}
      ${createDetailRow("日文例句", grammar.example)}
      ${createDetailRow("例句假名", grammar.exampleKana)}
      ${createDetailRow("中文翻譯", grammar.exampleMeaning)}
      ${createDetailRow("補充說明", grammar.note)}
      ${createDetailRow("相似用法差異", grammar.similar)}
    </div>
  `;

  return card;
}

function renderCards(words) {
  const cards = words.map((word, index) => createCard(word, index));
  cardsContainer.replaceChildren(...cards);
  updateAnswersVisibility();
}

function renderGrammarCards(items) {
  const cards = items.map((grammar, index) => createGrammarCard(grammar, index));
  cardsContainer.replaceChildren(...cards);
  updateAnswersVisibility();
}

function renderStatus(message) {
  const status = document.createElement("p");
  status.className = "status-message";
  status.textContent = message;
  cardsContainer.replaceChildren(status);
}

function renderQuizStatus(message) {
  const status = document.createElement("p");
  status.className = "status-message quiz-status-message";
  status.textContent = message;
  quizContent.replaceChildren(status);
  nextQuizQuestionButton.hidden = true;
}

function createQuizQuestion() {
  if (filteredVocabulary.length < 4) {
    currentQuizQuestion = null;
    quizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前篩選結果不足 4 個單字，請調整分類或搜尋條件。");
    return;
  }

  const questionWord = pickLeastSeenItem(
    filteredVocabulary,
    JAPANESE_VOCAB_SEEN_COUNTS_KEY,
    getVocabularySeenKey,
    wordQuizRoundSeenKeys,
  );
  const questionWordKey = getVocabularySeenKey(questionWord);
  wordQuizRoundSeenKeys.add(questionWordKey);
  if (wordQuizRoundSeenKeys.size >= filteredVocabulary.length) {
    wordQuizRoundSeenKeys = new Set();
  }
  const wrongOptions = createWrongQuizOptions(questionWord);

  if (wrongOptions.length < 3) {
    currentQuizQuestion = null;
    quizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前可用的選項不足 4 個，請調整分類或搜尋條件。");
    return;
  }

  const options = shuffleItems([
    { meaning: questionWord.meaning, isCorrect: true },
    ...wrongOptions,
  ]);

  currentQuizQuestion = {
    word: questionWord,
    options,
  };
  incrementSeenCount(JAPANESE_VOCAB_SEEN_COUNTS_KEY, questionWordKey);
  quizHasAnsweredCurrentQuestion = false;
  nextQuizQuestionButton.hidden = true;
  renderQuizQuestion();
}


function hasUsableGrammarClozeQuiz(grammar) {
  const quiz = grammar.quiz;

  return Boolean(
    quiz
      && quiz.clozePrompt
      && quiz.clozePromptKana
      && quiz.clozeMeaning
      && quiz.answer
      && quiz.explanation
      && Array.isArray(quiz.choices)
      && quiz.choices.length === 4
      && new Set(quiz.choices).size === 4
      && quiz.choices.includes(quiz.answer),
  );
}

function getFilteredGrammarWithClozeQuiz() {
  return filteredGrammar.filter(hasUsableGrammarClozeQuiz);
}

function createGrammarMeaningQuizQuestion() {

  if (grammarIsLoading) {
    currentGrammarQuizQuestion = null;
    grammarQuizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("正在載入文法資料…");
    return;
  }

  if (filteredGrammar.length < 4) {
    currentGrammarQuizQuestion = null;
    grammarQuizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前篩選結果不足 4 條文法，請調整分類或搜尋條件。");
    return;
  }

  const questionGrammar = pickLeastSeenItem(
    filteredGrammar,
    JAPANESE_GRAMMAR_SEEN_COUNTS_KEY,
    getGrammarSeenKey,
    grammarQuizRoundSeenKeys,
  );
  const questionGrammarKey = getGrammarSeenKey(questionGrammar);
  grammarQuizRoundSeenKeys.add(questionGrammarKey);
  if (grammarQuizRoundSeenKeys.size >= filteredGrammar.length) {
    grammarQuizRoundSeenKeys = new Set();
  }
  const wrongOptions = createWrongGrammarQuizOptions(questionGrammar);

  if (wrongOptions.length < 3) {
    currentGrammarQuizQuestion = null;
    grammarQuizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前可用的文法選項不足 4 個，請調整分類或搜尋條件。");
    return;
  }

  const options = shuffleItems([
    { meaning: questionGrammar.meaning, isCorrect: true },
    ...wrongOptions,
  ]);

  currentGrammarQuizQuestion = {
    grammar: questionGrammar,
    options,
  };
  incrementSeenCount(JAPANESE_GRAMMAR_SEEN_COUNTS_KEY, questionGrammarKey);
  grammarQuizHasAnsweredCurrentQuestion = false;
  nextQuizQuestionButton.hidden = true;
  renderQuizQuestion();
}

function createGrammarClozeQuizQuestion() {
  if (grammarIsLoading) {
    currentGrammarQuizQuestion = null;
    grammarQuizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("正在載入文法資料…");
    return;
  }

  const clozeGrammarItems = getFilteredGrammarWithClozeQuiz();

  if (clozeGrammarItems.length === 0) {
    currentGrammarQuizQuestion = null;
    grammarQuizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前篩選結果沒有可用的填空題，請調整分類或搜尋條件。");
    return;
  }

  const questionGrammar = pickLeastSeenItem(
    clozeGrammarItems,
    JAPANESE_GRAMMAR_SEEN_COUNTS_KEY,
    getGrammarSeenKey,
    grammarQuizRoundSeenKeys,
  );
  const questionGrammarKey = getGrammarSeenKey(questionGrammar);
  grammarQuizRoundSeenKeys.add(questionGrammarKey);
  if (grammarQuizRoundSeenKeys.size >= clozeGrammarItems.length) {
    grammarQuizRoundSeenKeys = new Set();
  }
  const options = shuffleItems(questionGrammar.quiz.choices.map((choice) => ({
    meaning: choice,
    isCorrect: choice === questionGrammar.quiz.answer,
  })));

  currentGrammarQuizQuestion = {
    grammar: questionGrammar,
    options,
  };
  incrementSeenCount(JAPANESE_GRAMMAR_SEEN_COUNTS_KEY, questionGrammarKey);
  grammarQuizHasAnsweredCurrentQuestion = false;
  nextQuizQuestionButton.hidden = true;
  renderQuizQuestion();
}

function createGrammarQuizQuestion() {
  if (isGrammarClozeQuizType()) {
    createGrammarClozeQuizQuestion();
    return;
  }

  createGrammarMeaningQuizQuestion();
}

function renderQuizQuestion() {
  const activeQuestion = isGrammarQuizMode() ? currentGrammarQuizQuestion : currentQuizQuestion;

  if (!activeQuestion) {
    return;
  }

  const question = document.createElement("article");
  question.className = "quiz-card";

  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";

  if (isGrammarClozeQuizType()) {
    prompt.innerHTML = `
      <p class="quiz-prompt-label">請選出最適合放入空格「＿＿」的文法片段</p>
      <h3 class="japanese-word grammar-title cloze-prompt">${activeQuestion.grammar.quiz.clozePrompt}</h3>
      <p class="kana">${activeQuestion.grammar.quiz.clozePromptKana}</p>
      <p class="cloze-meaning">中文提示：${activeQuestion.grammar.quiz.clozeMeaning}</p>
      <div class="grammar-meta quiz-grammar-meta" aria-label="文法題目資訊">
        <span>程度：${activeQuestion.grammar.level}</span>
        <span>分類：${activeQuestion.grammar.category}</span>
      </div>
    `;
  } else if (isGrammarQuizMode()) {
    prompt.innerHTML = `
      <p class="quiz-prompt-label">這個文法的中文意思是？</p>
      <h3 class="japanese-word grammar-title">${activeQuestion.grammar.grammar}</h3>
      <p class="kana">${activeQuestion.grammar.kana}</p>
      <div class="grammar-meta quiz-grammar-meta" aria-label="文法題目資訊">
        <span>程度：${activeQuestion.grammar.level}</span>
        <span>分類：${activeQuestion.grammar.category}</span>
      </div>
    `;
  } else {
    prompt.innerHTML = `
      <p class="quiz-prompt-label">這個單字的中文意思是？</p>
      <h3 class="japanese-word">${activeQuestion.word.word}</h3>
      <p class="kana">${activeQuestion.word.kana}</p>
    `;
  }

  const optionsGroup = document.createElement("div");
  optionsGroup.className = "quiz-options";
  optionsGroup.setAttribute("role", "group");
  optionsGroup.setAttribute("aria-label", "測驗選項");

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  const optionButtons = activeQuestion.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.type = "button";
    button.textContent = option.meaning;
    button.addEventListener("click", () => handleQuizAnswer(option, optionButtons, feedback));
    return button;
  });

  optionsGroup.replaceChildren(...optionButtons);
  question.replaceChildren(prompt, optionsGroup, feedback);
  quizContent.replaceChildren(question);
}

function handleQuizAnswer(selectedOption, optionButtons, feedback) {
  const activeQuestion = isGrammarQuizMode() ? currentGrammarQuizQuestion : currentQuizQuestion;
  const hasAnsweredCurrentQuestion = isGrammarQuizMode()
    ? grammarQuizHasAnsweredCurrentQuestion
    : quizHasAnsweredCurrentQuestion;

  if (hasAnsweredCurrentQuestion || !activeQuestion) {
    return;
  }

  if (isGrammarQuizMode()) {
    grammarQuizHasAnsweredCurrentQuestion = true;
    grammarQuizAnsweredCountValue += 1;
  } else {
    quizHasAnsweredCurrentQuestion = true;
    quizAnsweredCountValue += 1;
  }

  if (selectedOption.isCorrect) {
    if (isGrammarQuizMode()) {
      grammarQuizCorrectCountValue += 1;
    } else {
      quizCorrectCountValue += 1;
    }

    feedback.textContent = "答對了！";
    feedback.classList.add("is-correct");
  } else {
    const correctMeaning = isGrammarClozeQuizType()
      ? activeQuestion.grammar.quiz.answer
      : isGrammarQuizMode() ? activeQuestion.grammar.meaning : activeQuestion.word.meaning;
    recordActiveQuizMistake(selectedOption, correctMeaning);
    feedback.textContent = `答錯了，正確答案是：${correctMeaning}`;
    feedback.classList.add("is-wrong");
  }

  if (isGrammarClozeQuizType()) {
    const explanation = document.createElement("span");
    explanation.className = "quiz-explanation";
    explanation.textContent = `解釋：${activeQuestion.grammar.quiz.explanation}`;
    feedback.appendChild(explanation);
  }

  optionButtons.forEach((button, index) => {
    const option = activeQuestion.options[index];
    button.disabled = true;
    button.classList.toggle("is-correct", option.isCorrect);
    button.classList.toggle("is-wrong", button.textContent === selectedOption.meaning && !selectedOption.isCorrect);
  });

  updateQuizStats();
  nextQuizQuestionButton.hidden = false;
}

function createActiveQuizQuestion() {
  if (isGrammarQuizMode()) {
    createGrammarQuizQuestion();
    return;
  }

  createQuizQuestion();
}

function restartQuiz() {
  if (isGrammarQuizMode()) {
    grammarQuizRoundSeenKeys = new Set();
  } else {
    wordQuizRoundSeenKeys = new Set();
  }

  resetQuizStats();
  createActiveQuizQuestion();
}

function getQuizTitle() {
  if (!isGrammarQuizMode()) {
    return "請選出正確的中文意思";
  }

  return isGrammarClozeQuizType() ? "請選出正確的文法填空答案" : "請選出正確的文法中文意思";
}

function updateGrammarQuizTypeButtons() {
  const isMeaningType = activeGrammarQuizType === "meaning";
  grammarMeaningQuizTypeButton.classList.toggle("is-active", isMeaningType);
  grammarMeaningQuizTypeButton.setAttribute("aria-pressed", String(isMeaningType));
  grammarClozeQuizTypeButton.classList.toggle("is-active", !isMeaningType);
  grammarClozeQuizTypeButton.setAttribute("aria-pressed", String(!isMeaningType));
}

function switchGrammarQuizType(type) {
  if (activeGrammarQuizType === type) {
    return;
  }

  activeGrammarQuizType = type;
  quizTitle.textContent = getQuizTitle();
  updateGrammarQuizTypeButtons();
  restartQuiz();
}

function normalizeJapaneseVocabularyView(view) {
  if (view === "study" || view === "cards") return "practice";
  if (["menu", "practice", "quiz", "sentence-composition"].includes(view)) return view;
  return "menu";
}

function renderJapaneseVocabularyView(view = japaneseVocabularyView) {
  japaneseVocabularyView = normalizeJapaneseVocabularyView(view);
  const isMenuView = japaneseVocabularyView === "menu";
  const isPracticeView = japaneseVocabularyView === "practice";
  const isQuizView = japaneseVocabularyView === "quiz";

  if (japaneseVocabularyMenuView) {
    japaneseVocabularyMenuView.hidden = !isMenuView || currentJapaneseView !== "vocabulary";
  }

  if (japaneseVocabularyStudyView) {
    japaneseVocabularyStudyView.hidden = currentJapaneseView === "vocabulary" ? !isPracticeView : false;
  }

  if (quizPanel) {
    quizPanel.hidden = currentJapaneseView === "vocabulary" ? !isQuizView : !isGrammarQuizMode();
  }
}

function normalizeJapaneseGrammarView(view) {
  if (view === "study" || view === "cards") return "practice";
  if (["menu", "practice", "quiz", "sentence-composition"].includes(view)) return view;
  return "menu";
}

function renderJapaneseGrammarView(view = japaneseGrammarView) {
  japaneseGrammarView = normalizeJapaneseGrammarView(view);
  const isMenuView = japaneseGrammarView === "menu";
  const isPracticeView = japaneseGrammarView === "practice";
  const isQuizView = japaneseGrammarView === "quiz";
  const isSentenceCompositionView = japaneseGrammarView === "sentence-composition";

  if (japaneseVocabularyMenuView && currentJapaneseView === "grammar") {
    japaneseVocabularyMenuView.hidden = true;
  }

  if (japaneseGrammarMenuView) {
    japaneseGrammarMenuView.hidden = currentJapaneseView !== "grammar" || !isMenuView;
  }

  if (japaneseVocabularyStudyView) {
    japaneseVocabularyStudyView.hidden = currentJapaneseView === "grammar" ? !isPracticeView : japaneseVocabularyStudyView.hidden;
  }

  if (japaneseSentenceCompositionView) {
    japaneseSentenceCompositionView.hidden = currentJapaneseView !== "grammar" || !isSentenceCompositionView;
    if (currentJapaneseView !== "grammar" || !isSentenceCompositionView) resetJapaneseSentenceCompositionState();
  }

  if (quizPanel) {
    quizPanel.hidden = currentJapaneseView === "grammar" ? !isQuizView : quizPanel.hidden;
  }

  if (backToVocabularyMenuFromPracticeButton) {
    backToVocabularyMenuFromPracticeButton.textContent = currentJapaneseView === "grammar" ? "返回文法選單" : "返回單字選單";
  }

  if (backToVocabularyStudyButton) {
    backToVocabularyStudyButton.textContent = currentJapaneseView === "grammar" ? "返回文法選單" : "返回單字選單";
  }
}

function returnToJapaneseVocabularyMenu() {
  if (currentJapaneseView === "grammar") {
    returnToJapaneseGrammarMenu();
    return;
  }

  activeMode = "cards";
  renderJapaneseVocabularyView("menu");
}

function returnToJapaneseGrammarMenu() {
  activeMode = "grammar";
  resetJapaneseSentenceCompositionState();
  renderJapaneseGrammarView("menu");
}

function openJapaneseVocabularyPractice() {
  switchMode("cards");
}

function openJapaneseVocabularyQuiz() {
  switchMode("quiz");
}

function openJapaneseGrammarPractice() {
  switchMode("grammar");
}

function openJapaneseGrammarQuiz() {
  switchMode("grammar-quiz");
}

function resetJapaneseSentenceCompositionState() {
  currentSentenceCompositionQuestion = null;
  currentSentenceCompositionAnswer = [];
  currentSentenceCompositionLocked = false;
  if (sentenceCompositionContent) sentenceCompositionContent.replaceChildren();
}

function getFilteredSentenceCompositionQuestions() {
  if (activeSentenceCompositionLevel === "N5" || activeSentenceCompositionLevel === "N4") {
    return sentenceCompositionQuestions.filter((question) => question.level === activeSentenceCompositionLevel);
  }
  return sentenceCompositionQuestions.slice();
}

async function ensureSentenceCompositionLoaded() {
  if (sentenceCompositionHasLoaded || sentenceCompositionIsLoading) return true;
  sentenceCompositionIsLoading = true;
  try {
    const response = await fetch(SENTENCE_COMPOSITION_URL);
    if (!response.ok) throw new Error(`無法讀取句子重組資料：${response.status}`);
    sentenceCompositionQuestions = await response.json();
    sentenceCompositionHasLoaded = true;
    return true;
  } catch (error) {
    console.error(error);
    renderSentenceCompositionLoadError();
    return false;
  } finally {
    sentenceCompositionIsLoading = false;
  }
}

function createSentenceCompositionButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function renderSentenceCompositionLoadError() {
  if (!sentenceCompositionContent) return;
  const panel = document.createElement("div");
  panel.className = "sentence-composition-card";
  const title = document.createElement("h2");
  title.textContent = "句子重組資料載入失敗";
  const text = document.createElement("p");
  text.textContent = "目前無法載入題目，請確認 japaneseSentenceCompositionQuestions.json 是否存在且格式正確。";
  const retry = createSentenceCompositionButton("重試", "secondary-button", () => { sentenceCompositionHasLoaded = false; renderJapaneseSentenceCompositionPractice(); });
  panel.append(title, text, retry);
  sentenceCompositionContent.replaceChildren(panel);
}

function chooseNextSentenceCompositionQuestion() {
  const pool = getFilteredSentenceCompositionQuestions();
  if (!pool.length) return null;
  const candidates = pool.filter((question) => question.id !== previousSentenceCompositionQuestionId);
  const source = candidates.length ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function getSentenceCompositionChunkById(question, id) {
  return question.chunks.find((chunk) => chunk.id === id);
}

function renderJapaneseSentenceCompositionPractice(statusText = "請依序選取四個片段。") {
  if (!sentenceCompositionContent) return;
  if (!sentenceCompositionHasLoaded) {
    sentenceCompositionContent.textContent = "正在載入句子重組題目…";
    ensureSentenceCompositionLoaded().then((loaded) => { if (loaded) startNextSentenceCompositionQuestion(); });
    return;
  }
  if (!currentSentenceCompositionQuestion) currentSentenceCompositionQuestion = chooseNextSentenceCompositionQuestion();
  const question = currentSentenceCompositionQuestion;
  if (!question) { sentenceCompositionContent.textContent = "此篩選沒有可用題目。"; return; }

  const wrapper = document.createElement("div");
  wrapper.className = "sentence-composition-card";
  const title = document.createElement("h2");
  title.id = "sentence-composition-title";
  title.textContent = "句子重組";
  const counts = { all: sentenceCompositionQuestions.length, N5: sentenceCompositionQuestions.filter((q) => q.level === "N5").length, N4: sentenceCompositionQuestions.filter((q) => q.level === "N4").length };
  const meta = document.createElement("p");
  meta.className = "sentence-composition-meta";
  meta.textContent = `目前篩選：${activeSentenceCompositionLevel === "all" ? "全部" : activeSentenceCompositionLevel}（全部 ${counts.all} 題，N5 ${counts.N5} 題，N4 ${counts.N4} 題）`;
  const filters = document.createElement("div");
  filters.className = "sentence-composition-filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "句子重組程度篩選");
  [["all", "全部"], ["N5", "N5"], ["N4", "N4"]].forEach(([level, label]) => {
    const button = createSentenceCompositionButton(label, `filter-button${activeSentenceCompositionLevel === level ? " is-active" : ""}`, () => { activeSentenceCompositionLevel = level; startNextSentenceCompositionQuestion(true); });
    button.setAttribute("aria-pressed", String(activeSentenceCompositionLevel === level));
    filters.append(button);
  });
  const questionLine = document.createElement("div");
  questionLine.className = "sentence-composition-line";
  const before = document.createElement("span"); before.textContent = question.before;
  const answerSlots = document.createElement("div"); answerSlots.className = "sentence-composition-slots";
  for (let index = 0; index < 4; index += 1) {
    const placedId = currentSentenceCompositionAnswer[index];
    const chunk = placedId ? getSentenceCompositionChunkById(question, placedId) : null;
    const slot = createSentenceCompositionButton(chunk ? chunk.text : `第 ${index + 1} 格`, `sentence-composition-slot${chunk ? " is-filled" : ""}`, () => removeSentenceCompositionChunk(index));
    slot.disabled = currentSentenceCompositionLocked || !chunk;
    answerSlots.append(slot);
  }
  const after = document.createElement("span"); after.textContent = question.after;
  questionLine.append(before, answerSlots, after);
  const bank = document.createElement("div"); bank.className = "sentence-composition-chunks";
  question.chunks.forEach((chunk) => {
    const selected = currentSentenceCompositionAnswer.includes(chunk.id);
    const button = createSentenceCompositionButton(chunk.text, "sentence-composition-chunk", () => selectSentenceCompositionChunk(chunk.id));
    button.disabled = selected || currentSentenceCompositionLocked;
    bank.append(button);
  });
  const status = document.createElement("p"); status.className = "sentence-composition-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); status.textContent = statusText;
  const actions = document.createElement("div"); actions.className = "sentence-composition-actions";
  actions.append(createSentenceCompositionButton("清除重排", "secondary-button", clearSentenceCompositionAnswer), createSentenceCompositionButton("確認答案", "answer-button", submitSentenceCompositionAnswer), createSentenceCompositionButton("下一題", "secondary-button", () => startNextSentenceCompositionQuestion()));
  wrapper.append(title, meta, filters, questionLine, bank, status, actions);
  if (currentSentenceCompositionLocked) wrapper.append(createSentenceCompositionFeedback());
  sentenceCompositionContent.replaceChildren(wrapper);
}

function createSentenceCompositionFeedback() {
  const q = currentSentenceCompositionQuestion;
  const correct = currentSentenceCompositionAnswer.join(",") === q.correctOrder.join(",");
  const box = document.createElement("div"); box.className = `sentence-composition-feedback ${correct ? "is-correct" : "is-wrong"}`; box.setAttribute("role", "status");
  const heading = document.createElement("h3"); heading.textContent = correct ? "答對了" : "再看看正確順序";
  const sentence = document.createElement("p"); sentence.textContent = q.completeSentence;
  const kana = document.createElement("p"); kana.textContent = `假名：${q.kana}`;
  const meaning = document.createElement("p"); meaning.textContent = `中文：${q.meaning}`;
  const explanation = document.createElement("p"); explanation.textContent = `解析：${q.explanation}`;
  box.append(heading, sentence, kana, meaning, explanation);
  return box;
}

function selectSentenceCompositionChunk(chunkId) {
  if (currentSentenceCompositionLocked || currentSentenceCompositionAnswer.includes(chunkId) || currentSentenceCompositionAnswer.length >= 4) return;
  currentSentenceCompositionAnswer.push(chunkId);
  renderJapaneseSentenceCompositionPractice("已放入片段。");
}

function removeSentenceCompositionChunk(index) {
  if (currentSentenceCompositionLocked) return;
  currentSentenceCompositionAnswer.splice(index, 1);
  renderJapaneseSentenceCompositionPractice("已移回待選區。");
}

function clearSentenceCompositionAnswer() {
  if (currentSentenceCompositionLocked) return;
  currentSentenceCompositionAnswer = [];
  renderJapaneseSentenceCompositionPractice("已清除，請重新排列。");
}

function submitSentenceCompositionAnswer() {
  if (!currentSentenceCompositionQuestion || currentSentenceCompositionLocked) return;
  if (currentSentenceCompositionAnswer.length < 4) { renderJapaneseSentenceCompositionPractice("請先填滿四格再確認。"); return; }
  currentSentenceCompositionLocked = true;
  renderJapaneseSentenceCompositionPractice();
}

function startNextSentenceCompositionQuestion(forceFilterReset = false) {
  if (currentSentenceCompositionQuestion) previousSentenceCompositionQuestionId = currentSentenceCompositionQuestion.id;
  currentSentenceCompositionQuestion = forceFilterReset ? null : chooseNextSentenceCompositionQuestion();
  currentSentenceCompositionAnswer = [];
  currentSentenceCompositionLocked = false;
  renderJapaneseSentenceCompositionPractice();
}

function openJapaneseSentenceCompositionPractice() {
  activeMode = "grammar";
  renderJapaneseGrammarView("sentence-composition");
  resetJapaneseSentenceCompositionState();
  renderJapaneseSentenceCompositionPractice();
}

async function switchMode(mode) {
  activeMode = mode;
  const isQuizModeValue = isQuizMode();
  const isWordQuizModeValue = activeMode === "quiz";
  const isGrammarModeValue = isGrammarMode();
  const isGrammarCardModeValue = activeMode === "grammar";
  const isGrammarQuizModeValue = isGrammarQuizMode();

  if (cardModeButton) {
    cardModeButton.classList.toggle("is-active", activeMode === "cards");
    cardModeButton.setAttribute("aria-pressed", String(activeMode === "cards"));
  }
  if (quizModeButton) {
    quizModeButton.classList.toggle("is-active", isWordQuizModeValue);
    quizModeButton.setAttribute("aria-pressed", String(isWordQuizModeValue));
  }
  if (grammarModeButton) {
    grammarModeButton.classList.toggle("is-active", isGrammarCardModeValue);
    grammarModeButton.setAttribute("aria-pressed", String(isGrammarCardModeValue));
  }
  if (grammarQuizModeButton) {
    grammarQuizModeButton.classList.toggle("is-active", isGrammarQuizModeValue);
    grammarQuizModeButton.setAttribute("aria-pressed", String(isGrammarQuizModeValue));
  }
  updateModeButtonsForJapaneseTab();

  controlsPanel.hidden = isQuizModeValue;
  cardsContainer.hidden = isQuizModeValue;
  quizPanel.hidden = !isQuizModeValue;
  if (currentJapaneseView === "vocabulary") {
    renderJapaneseVocabularyView(isWordQuizModeValue ? "quiz" : "practice");
    renderJapaneseGrammarView("menu");
  } else if (currentJapaneseView === "grammar") {
    renderJapaneseVocabularyView("menu");
    renderJapaneseGrammarView(isGrammarQuizModeValue ? "quiz" : "practice");
  } else {
    renderJapaneseVocabularyView("practice");
    renderJapaneseGrammarView("menu");
  }
  grammarQuizTypeControls.hidden = !isGrammarQuizModeValue;
  updateGrammarQuizTypeButtons();
  quizTitle.textContent = getQuizTitle();
  shuffleButton.textContent = isGrammarModeValue ? "換一組文法" : "換一組單字";
  searchLabel.textContent = isGrammarModeValue ? "搜尋文法" : "搜尋單字";
  wordSearchInput.placeholder = isGrammarModeValue
    ? "搜尋文法、假名、意思、結構、用法、例句、填空題、分類或程度"
    : "搜尋日文、假名、中文、詞性、程度或例句";
  wordSearchInput.value = isGrammarModeValue ? grammarSearchQuery : searchQuery;

  renderCategoryFilters();

  if (isGrammarQuizModeValue) {
    await ensureGrammarLoaded();
    refreshFilteredGrammar();
    updateQuizStats();
  } else if (isWordQuizModeValue) {
    createQuizQuestion();
    updateQuizStats();
  } else if (isGrammarCardModeValue) {
    await ensureGrammarLoaded();
    refreshFilteredGrammar();
  } else {
    if (currentWords.length > 0) {
      renderCards(currentWords);
    } else {
      showNewWordSet();
    }

    updateWordSetStatus();
    updateAnswersVisibility();
  }
}

function updateCategoryCount() {
  if (isGrammarMode()) {
    const activeCategory = getActiveGrammarCategory();
    const activeLevel = getActiveGrammarLevel();
    const filterTotal = getGrammarForActiveFilters().length;
    const filterDescription = `分類「${activeCategory.label}」／程度「${activeLevel.label}」`;

    if (grammarIsLoading) {
      categoryCount.textContent = "正在載入文法資料…";
      return;
    }

    if (grammarSearchQuery) {
      categoryCount.textContent = `目前${filterDescription}共有 ${filterTotal} 條文法；搜尋「${grammarSearchQuery}」共有 ${filteredGrammar.length} 條文法`;
      return;
    }

    categoryCount.textContent = `目前${filterDescription}共有 ${filterTotal} 條文法`;
    return;
  }

  const activeCategory = getActiveCategory();
  const activeLevel = getActiveLevel();
  const filterTotal = getWordsForActiveFilters().length;
  const filterDescription = `分類「${activeCategory.label}」／程度「${activeLevel.label}」`;

  if (searchQuery) {
    categoryCount.textContent = `目前${filterDescription}共有 ${filterTotal} 個單字；搜尋「${searchQuery}」共有 ${filteredVocabulary.length} 個單字`;
    return;
  }

  categoryCount.textContent = `目前${filterDescription}共有 ${filterTotal} 個單字`;
}

function updateFilterButtons() {
  categoryFilters.querySelectorAll(".filter-button").forEach((button) => {
    const isActive = isGrammarMode()
      ? button.dataset.grammarCategoryId === activeGrammarCategoryId
      : button.dataset.categoryId === activeCategoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  levelFilters.querySelectorAll(".filter-button").forEach((button) => {
    const isActive = isGrammarMode()
      ? button.dataset.grammarLevelId === activeGrammarLevelId
      : button.dataset.levelId === activeLevelId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateWordSetStatus() {
  if (isGrammarMode()) {
    if (grammarIsLoading) {
      wordSetStatus.textContent = "正在載入文法資料…";
      return;
    }

    if (filteredGrammar.length === 0) {
      wordSetStatus.textContent = "找不到符合的文法，請調整分類或搜尋條件。";
      return;
    }

    const totalGroups = getTotalGrammarGroups();
    const groupText = `目前顯示第 ${currentGrammarGroupNumber} 組 / 共 ${totalGroups} 組`;
    wordSetStatus.textContent = grammarReshuffleNotice ? `${grammarReshuffleNotice} ${groupText}` : groupText;
    return;
  }

  if (filteredVocabulary.length === 0) {
    wordSetStatus.textContent = searchQuery ? "沒有符合搜尋條件的單字。" : "目前沒有可顯示的單字。";
    return;
  }

  const totalGroups = getTotalGroups();
  const groupText = `目前顯示第 ${currentGroupNumber} 組 / 共 ${totalGroups} 組`;
  wordSetStatus.textContent = reshuffleNotice ? `${reshuffleNotice} ${groupText}` : groupText;
}

function updateAnswersVisibility() {
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.hidden = !answersVisible;
  });

  toggleButton.textContent = answersVisible ? "隱藏答案" : "顯示答案";
  toggleButton.setAttribute("aria-pressed", String(answersVisible));
}

function showNewWordSet() {
  if (filteredVocabulary.length === 0) {
    currentWords = [];
    currentGroupNumber = 0;
    renderStatus(searchQuery ? "找不到符合的單字，請試試其他關鍵字。" : "這個分類目前沒有單字。");
    updateWordSetStatus();
    return;
  }

  answersVisible = false;
  currentWords = getNextWordSet();
  previousWordIds = new Set(currentWords.map(getVocabularySeenKey));
  incrementSeenCountsForItems(currentWords, JAPANESE_VOCAB_SEEN_COUNTS_KEY, getVocabularySeenKey);
  renderCards(currentWords);
  updateWordSetStatus();
}

function showNewGrammarSet() {
  if (filteredGrammar.length === 0) {
    currentGrammarItems = [];
    currentGrammarGroupNumber = 0;
    renderStatus("找不到符合的文法，請調整分類或搜尋條件。");
    updateWordSetStatus();
    return;
  }

  answersVisible = false;
  currentGrammarItems = getNextGrammarSet();
  previousGrammarIds = new Set(currentGrammarItems.map(getGrammarSeenKey));
  incrementSeenCountsForItems(currentGrammarItems, JAPANESE_GRAMMAR_SEEN_COUNTS_KEY, getGrammarSeenKey);
  renderGrammarCards(currentGrammarItems);
  updateWordSetStatus();
}

function refreshFilteredVocabulary() {
  filteredVocabulary = getFilteredVocabulary();
  previousWordIds = new Set();
  resetDeck();
  updateFilterButtons();
  updateCategoryCount();
  clearSearchButton.disabled = searchQuery.length === 0;

  if (activeMode === "quiz") {
    wordQuizRoundSeenKeys = new Set();
    createQuizQuestion();
  } else if (activeMode === "cards") {
    showNewWordSet();
  }
}

function refreshFilteredGrammar() {
  filteredGrammar = getFilteredGrammar();
  previousGrammarIds = new Set();
  resetGrammarDeck();
  updateFilterButtons();
  updateCategoryCount();
  clearSearchButton.disabled = grammarSearchQuery.length === 0;

  if (isGrammarQuizMode()) {
    grammarQuizRoundSeenKeys = new Set();
    createGrammarQuizQuestion();
  } else if (isGrammarMode()) {
    showNewGrammarSet();
  }
}

function applyCategory(categoryId) {
  activeCategoryId = categoryId;
  refreshFilteredVocabulary();
}

function applyLevel(levelId) {
  activeLevelId = levelId;
  refreshFilteredVocabulary();
}

function applyGrammarCategory(categoryId) {
  activeGrammarCategoryId = categoryId;
  refreshFilteredGrammar();
}

function applyGrammarLevel(levelId) {
  activeGrammarLevelId = levelId;
  refreshFilteredGrammar();
}

function applySearch(query) {
  if (isGrammarMode()) {
    grammarSearchQuery = normalizeSearchText(query);
    refreshFilteredGrammar();
    return;
  }

  searchQuery = normalizeSearchText(query);
  refreshFilteredVocabulary();
}

function createFilterButton(label, onClick) {
  const button = document.createElement("button");
  button.className = "filter-button";
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", onClick);
  return button;
}

function renderCategoryFilters() {
  if (isGrammarMode()) {
    categoryFilterLabel.textContent = "文法分類";
    levelFilterLabel.textContent = "程度篩選";
    categoryFilters.setAttribute("aria-label", "選擇文法分類");
    levelFilters.setAttribute("aria-label", "選擇文法程度");

    const grammarCategoryButtons = GRAMMAR_CATEGORY_FILTERS.map((category) => {
      const button = createFilterButton(category.label, () => applyGrammarCategory(category.id));
      button.dataset.grammarCategoryId = category.id;
      return button;
    });

    const grammarLevelButtons = LEVEL_FILTERS.map((level) => {
      const button = createFilterButton(level.label, () => applyGrammarLevel(level.id));
      button.dataset.grammarLevelId = level.id;
      return button;
    });

    categoryFilters.replaceChildren(...grammarCategoryButtons);
    levelFilters.replaceChildren(...grammarLevelButtons);
    updateFilterButtons();
    updateCategoryCount();
    return;
  }

  categoryFilterLabel.textContent = "詞性分類";
  levelFilterLabel.textContent = "程度篩選";
  categoryFilters.setAttribute("aria-label", "選擇單字分類");
  levelFilters.setAttribute("aria-label", "選擇單字程度");

  const categoryButtons = CATEGORY_FILTERS.map((category) => {
    const button = createFilterButton(category.label, () => applyCategory(category.id));
    button.dataset.categoryId = category.id;
    return button;
  });

  const levelButtons = LEVEL_FILTERS.map((level) => {
    const button = createFilterButton(level.label, () => applyLevel(level.id));
    button.dataset.levelId = level.id;
    return button;
  });

  categoryFilters.replaceChildren(...categoryButtons);
  levelFilters.replaceChildren(...levelButtons);
  updateFilterButtons();
  updateCategoryCount();
}

async function loadVocabulary() {
  try {
    const response = await fetch(VOCABULARY_URL);

    if (!response.ok) {
      throw new Error(`無法讀取單字資料：${response.status}`);
    }

    vocabulary = await response.json();
    filteredVocabulary = getFilteredVocabulary();

    if (!isJapaneseHomeTab()) {
      renderCategoryFilters();
      applyCategory(activeCategoryId);
    }
  } catch (error) {
    console.error(error);
    renderStatus("目前無法載入單字資料，請確認 vocabulary.json 是否存在且格式正確。");
    wordSetStatus.textContent = "單字資料載入失敗。";
    categoryCount.textContent = "分類資料載入失敗。";
    toggleButton.disabled = true;
    shuffleButton.disabled = true;
    wordSearchInput.disabled = true;
    clearSearchButton.disabled = true;
    if (cardModeButton) cardModeButton.disabled = true;
    if (quizModeButton) quizModeButton.disabled = true;
    if (grammarModeButton) grammarModeButton.disabled = true;
    if (grammarQuizModeButton) grammarQuizModeButton.disabled = true;
    nextQuizQuestionButton.disabled = true;
    restartQuizButton.disabled = true;
  }
}

async function ensureGrammarLoaded() {
  if (grammarHasLoaded || grammarIsLoading) {
    return;
  }

  grammarIsLoading = true;
  renderStatus("正在載入文法資料…");
  updateCategoryCount();
  updateWordSetStatus();

  try {
    const response = await fetch(GRAMMAR_URL);

    if (!response.ok) {
      throw new Error(`無法讀取文法資料：${response.status}`);
    }

    grammarItems = await response.json();
    grammarHasLoaded = true;
  } catch (error) {
    console.error(error);
    renderStatus("目前無法載入文法資料，請確認 grammar.json 是否存在且格式正確。");
    wordSetStatus.textContent = "文法資料載入失敗。";
    categoryCount.textContent = "文法分類資料載入失敗。";
    toggleButton.disabled = true;
    shuffleButton.disabled = true;
    wordSearchInput.disabled = true;
    clearSearchButton.disabled = true;
    if (grammarQuizModeButton) grammarQuizModeButton.disabled = true;
  } finally {
    grammarIsLoading = false;
  }
}

toggleButton.addEventListener("click", () => {
  answersVisible = !answersVisible;
  updateAnswersVisibility();
});

shuffleButton.addEventListener("click", () => {
  if (isGrammarMode()) {
    showNewGrammarSet();
    return;
  }

  showNewWordSet();
});

wordSearchInput.addEventListener("input", (event) => {
  applySearch(event.target.value);
});

clearSearchButton.addEventListener("click", () => {
  wordSearchInput.value = "";
  applySearch("");
  wordSearchInput.focus();
});

window.switchMode = switchMode;

if (cardModeButton) {
  cardModeButton.addEventListener("click", () => switchMode("cards"));
}
if (quizModeButton) {
  quizModeButton.addEventListener("click", () => switchMode("quiz"));
}
if (grammarModeButton) grammarModeButton.addEventListener("click", () => switchMode("grammar"));
if (grammarQuizModeButton) grammarQuizModeButton.addEventListener("click", () => switchMode("grammar-quiz"));
nextQuizQuestionButton.addEventListener("click", createActiveQuizQuestion);
restartQuizButton.addEventListener("click", () => {
  confirmResetJapaneseQuizProgress(restartQuiz);
});
if (backToVocabularyMenuFromPracticeButton) {
  backToVocabularyMenuFromPracticeButton.addEventListener("click", returnToJapaneseVocabularyMenu);
}
if (backToVocabularyStudyButton) {
  backToVocabularyStudyButton.addEventListener("click", returnToJapaneseVocabularyMenu);
}
if (backToGrammarMenuFromSentenceCompositionButton) {
  backToGrammarMenuFromSentenceCompositionButton.addEventListener("click", returnToJapaneseGrammarMenu);
}
japaneseVocabularyEntryButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    if (button.dataset.japaneseVocabularyEntry === "quiz") {
      openJapaneseVocabularyQuiz();
      return;
    }
    openJapaneseVocabularyPractice();
  });
});
japaneseGrammarEntryButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    if (button.dataset.japaneseGrammarEntry === "quiz") {
      openJapaneseGrammarQuiz();
      return;
    }
    if (button.dataset.japaneseGrammarEntry === "sentence-composition") {
      openJapaneseSentenceCompositionPractice();
      return;
    }

    openJapaneseGrammarPractice();
  });
});
grammarMeaningQuizTypeButton.addEventListener("click", () => switchGrammarQuizType("meaning"));
grammarClozeQuizTypeButton.addEventListener("click", () => switchGrammarQuizType("cloze"));
japaneseTabButtons.forEach((button) => {
  button.addEventListener("click", () => switchJapaneseTab(button.dataset.japaneseTab));
});
japaneseEntryButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.showJapaneseContentView(button.dataset.japaneseEntry);
  });
});
japaneseBackHomeButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    if (["listening", "listeningMenu", "listeningPractice", "listeningQuiz"].includes(currentJapaneseView) && typeof resetJapaneseListeningState === "function") {
      resetJapaneseListeningState();
    }
    window.showJapaneseContentView("home");
  });
});

clearSearchButton.disabled = true;
renderJapaneseView("home");
updateQuizStats();

loadVocabulary();

const JAPANESE_READING_SEEN_COUNTS_KEY = "japanese_reading_seen_counts";
const READING_QUIZ_SIZE = 10;
let japaneseReadingMenuView = document.querySelector("#japaneseReadingMenuView");
let readingPracticeModeButton = document.querySelector('[data-reading-mode="practice"]');
let readingQuizModeButton = document.querySelector('[data-reading-mode="quiz"]');
let readingContent = document.querySelector("#readingContent");
const japaneseReadingSets = Array.isArray(window.JAPANESE_READING_SETS)
  ? window.JAPANESE_READING_SETS
  : (Array.isArray(window.JAPANESE_READING_QUESTIONS) ? window.JAPANESE_READING_QUESTIONS : []);
let japaneseReadingView = "menu";
let currentReadingSet = null;
let readingPracticeAnswers = {};
let readingQuizItems = [];
let readingQuizSets = [];
let readingQuizAnswers = [];
let currentReadingQuizSetIndex = 0;

function getReadingSeenKey(readingSet) {
  return String(readingSet.id);
}

function getReadingSetQuestionCount(readingSet) {
  return Array.isArray(readingSet.questions) ? readingSet.questions.length : 0;
}

function getReadingSetById(readingSetId) {
  return japaneseReadingSets.find((readingSet) => getReadingSeenKey(readingSet) === readingSetId);
}

function normalizeJapaneseReadingView(view) {
  if (["menu", "practice", "quiz", "sentence-composition"].includes(view)) return view;
  return "menu";
}

function updateReadingHeader() {
  const title = document.querySelector("#reading-page-title");
  const description = document.querySelector("#japaneseReadingPanel .feature-page-description");
  if (!title || !description) return;

  const readingHeader = document.querySelector("#japaneseReadingPanel .feature-page-header");
  if (readingHeader) readingHeader.hidden = currentJapaneseView !== "reading";

  title.textContent = "日文閱讀";
  description.textContent = "閱讀練習保留 ruby 輔助；閱讀測驗模式維持不顯示 ruby。";
}

function createReadingContentTitle(titleText) {
  const title = document.createElement("h2");
  title.className = "reading-page-mode-title";
  title.textContent = titleText;
  return title;
}

function createReadingBackMenuButton() {
  const button = document.createElement("button");
  button.className = "secondary-button vocabulary-back-menu-button reading-back-menu-button";
  button.type = "button";
  button.textContent = "返回閱讀選單";
  button.addEventListener("click", () => renderJapaneseReadingView("menu"));
  return button;
}

function setReadingContentNodes(...nodes) {
  if (!readingContent) return;
  readingContent.replaceChildren(...nodes);
}

function renderJapaneseReadingMenu() {
  clearReadingLookupCard();
  if (japaneseReadingMenuView) japaneseReadingMenuView.hidden = currentJapaneseView !== "reading";
  if (readingContent) {
    readingContent.hidden = true;
    readingContent.replaceChildren();
  }
}

function renderJapaneseReadingPractice() {
  if (japaneseReadingMenuView) japaneseReadingMenuView.hidden = true;
  if (readingContent) readingContent.hidden = false;
  showReadingPracticeQuestion();
}

function renderJapaneseReadingQuiz() {
  if (japaneseReadingMenuView) japaneseReadingMenuView.hidden = true;
  if (readingContent) readingContent.hidden = false;
  startReadingQuiz();
}

function renderJapaneseReadingView(view = japaneseReadingView) {
  clearReadingLookupCard();
  japaneseReadingView = normalizeJapaneseReadingView(view);
  updateReadingHeader();

  if (japaneseReadingView === "menu") {
    renderJapaneseReadingMenu();
    return;
  }

  if (japaneseReadingView === "practice") {
    renderJapaneseReadingPractice();
    return;
  }

  if (japaneseReadingView === "quiz") {
    renderJapaneseReadingQuiz();
  }
}

function setReadingMode(mode) {
  renderJapaneseReadingView(mode === "quiz" ? "quiz" : "practice");
}

function renderReadingUnavailable() {
  setReadingContentNodes(Object.assign(document.createElement("p"), { className: "status-message", textContent: "目前無法載入閱讀題庫。" }));
}


const rubyReadingPattern = /^[\u3041-\u3096\u30A1-\u30FAー]+$/u;
const rubyBaseKanjiPattern = /[\u3400-\u9FFF々〆ヵヶ]/u;

const commonReadingRubyTerms = [
  { text: "来週", reading: "らいしゅう" }, { text: "今週", reading: "こんしゅう" }, { text: "一週間", reading: "いっしゅうかん" },
  { text: "誕生日", reading: "たんじょうび" }, { text: "五十分", reading: "ごじゅっぷん" }, { text: "三十分", reading: "さんじゅっぷん" },
  { text: "十分", reading: "じゅっぷん" }, { text: "学習室", reading: "がくしゅうしつ" }, { text: "宿題", reading: "しゅくだい" },
  { text: "授業", reading: "じゅぎょう" }, { text: "学生料金", reading: "がくせいりょうきん" }, { text: "学生証", reading: "がくせいしょう" },
  { text: "朝食券", reading: "ちょうしょくけん" }, { text: "店長", reading: "てんちょう" }, { text: "開店前", reading: "かいてんまえ" },
  { text: "図書館", reading: "としょかん" }, { text: "市立図書館", reading: "しりつとしょかん" }, { text: "市役所前", reading: "しやくしょまえ" },
  { text: "道路工事", reading: "どうろこうじ" }, { text: "自転車置き場", reading: "じてんしゃおきば" }, { text: "地域清掃", reading: "ちいきせいそう" },
  { text: "日本語", reading: "にほんご" }, { text: "日本語の宿題", reading: "にほんごのしゅくだい" }, { text: "郵便局", reading: "ゆうびんきょく" },
  { text: "再配達", reading: "さいはいたつ" }, { text: "不在票", reading: "ふざいひょう" }, { text: "映画館", reading: "えいがかん" },
  { text: "割引", reading: "わりびき" }, { text: "受付", reading: "うけつけ" }, { text: "返却箱", reading: "へんきゃくばこ" },
  { text: "料理教室", reading: "りょうりきょうしつ" }, { text: "薬局", reading: "やっきょく" }, { text: "台所", reading: "だいどころ" },
  { text: "市民図書館のお知らせ", reading: "しみんとしょかんのおしらせ" }, { text: "市民図書館", reading: "しみんとしょかん" }, { text: "駅前スーパー", reading: "えきまえスーパー" },
  { text: "料理教室", reading: "りょうりきょうしつ" }, { text: "魚売り場", reading: "さかなうりば" }, { text: "買い物袋", reading: "かいものぶくろ" },
  { text: "使用規則", reading: "しようきそく" }, { text: "出口工事", reading: "でぐちこうじ" }, { text: "西出口", reading: "にしでぐち" },
  { text: "東出口", reading: "ひがしでぐち" }, { text: "返却箱", reading: "へんきゃくばこ" }, { text: "伝言メモ", reading: "でんごんメモ" },
  { text: "歯医者", reading: "はいしゃ" }, { text: "薬局", reading: "やっきょく" }, { text: "台所", reading: "だいどころ" },
  { text: "予約", reading: "よやく" }, { text: "受付", reading: "うけつけ" }, { text: "辞書", reading: "じしょ" }, { text: "混む", reading: "こむ" },
  { text: "期末試験", reading: "きまつしけん" }, { text: "営業時間", reading: "えいぎょうじかん" }, { text: "朝の電車", reading: "あさのでんしゃ" },
  { text: "持ち帰り", reading: "もちかえり" }, { text: "京都旅行", reading: "きょうとりょこう" }, { text: "町内会", reading: "ちょうないかい" },
  { text: "収集日", reading: "しゅうしゅうび" }, { text: "水曜日", reading: "すいようび" }, { text: "燃えるごみ", reading: "もえるごみ" },
  { text: "十分前", reading: "じゅっぷんまえ" }, { text: "一時間", reading: "いちじかん" }, { text: "来週", reading: "らいしゅう" },
  { text: "復習", reading: "ふくしゅう" }, { text: "毎晩", reading: "まいばん" }, { text: "閉店", reading: "へいてん" },
  { text: "店内", reading: "てんない" }, { text: "工事", reading: "こうじ" }, { text: "博物館", reading: "はくぶつかん" },
  { text: "屋内", reading: "おくない" }, { text: "市場", reading: "いちば" }, { text: "切符", reading: "きっぷ" },
  { text: "部屋", reading: "へや" }, { text: "受付", reading: "うけつけ" }, { text: "荷物", reading: "にもつ" },
  { text: "飲み物", reading: "のみもの" }, { text: "急行", reading: "きゅうこう" }, { text: "店長", reading: "てんちょう" },
  { text: "学校祭", reading: "がっこうさい" }, { text: "準備", reading: "じゅんび" }, { text: "予約確認", reading: "よやくかくにん" },
  { text: "前日", reading: "ぜんじつ" }, { text: "午後", reading: "ごご" }, { text: "連絡", reading: "れんらく" },
  { text: "当日", reading: "とうじつ" }, { text: "変更", reading: "へんこう" }, { text: "道路", reading: "どうろ" },
  { text: "中央公園", reading: "ちゅうおうこうえん" }, { text: "開店時間", reading: "かいてんじかん" }, { text: "平日", reading: "へいじつ" },
  { text: "来月", reading: "らいげつ" }, { text: "日曜日", reading: "にちようび" }, { text: "普通電車", reading: "ふつうでんしゃ" },
  { text: "受付", reading: "うけつけ" }, { text: "荷物", reading: "にもつ" }, { text: "朝食", reading: "ちょうしょく" },
  { text: "地域清掃", reading: "ちいきせいそう" }, { text: "軍手", reading: "ぐんて" }, { text: "飲み物", reading: "のみもの" },
  { text: "写真部", reading: "しゃしんぶ" }, { text: "建物", reading: "たてもの" }, { text: "授業", reading: "じゅぎょう" },
  { text: "学生", reading: "がくせい" }, { text: "予定", reading: "よてい" }, { text: "営業", reading: "えいぎょう" },
  { text: "時間", reading: "じかん" }, { text: "駅前", reading: "えきまえ" }, { text: "教室", reading: "きょうしつ" },
  { text: "習慣", reading: "しゅうかん" }, { text: "文化祭", reading: "ぶんかさい" }, { text: "放課後", reading: "ほうかご" },
  { text: "今週", reading: "こんしゅう" }, { text: "一週間", reading: "いっしゅうかん" }, { text: "朝食券", reading: "ちょうしょくけん" },
  { text: "開店前", reading: "かいてんまえ" }, { text: "質問", reading: "しつもん" }, { text: "説明", reading: "せつめい" },
  { text: "市役所前", reading: "しやくしょまえ" }, { text: "道路工事", reading: "どうろこうじ" }, { text: "三番バス", reading: "さんばんバス" },
  { text: "南口", reading: "みなみぐち" }, { text: "図書館", reading: "としょかん" }, { text: "読み聞かせ会", reading: "よみきかせかい" },
  { text: "参加費", reading: "さんかひ" }, { text: "自転車置き場", reading: "じてんしゃおきば" }, { text: "旅行", reading: "りょこう" },
  { text: "充電器", reading: "じゅうでんき" }, { text: "手伝う予定", reading: "てつだうよてい" }, { text: "郵便局", reading: "ゆうびんきょく" },
  { text: "再配達", reading: "さいはいたつ" }, { text: "不在票", reading: "ふざいひょう" },
];

function normalizeRubyTerms(rubyTerms) {
  if (!Array.isArray(rubyTerms)) return [];
  return rubyTerms
    .filter((term) => term && term.text && term.reading)
    .map((term) => ({ text: String(term.text).trim(), reading: String(term.reading).trim() }))
    .filter((term) => term.text && term.reading && rubyReadingPattern.test(term.reading) && rubyBaseKanjiPattern.test(term.text))
    .sort((a, b) => b.text.length - a.text.length || a.text.localeCompare(b.text, "ja"));
}

function mergeAndDedupeTerms(vocabTerms = [], manualTerms = []) {
  const merged = new Map();
  normalizeRubyTerms(vocabTerms).forEach((term) => merged.set(term.text, term));
  normalizeRubyTerms(manualTerms).forEach((term) => merged.set(term.text, term));
  return normalizeRubyTerms([...merged.values()]);
}

function getReadingRubyTerms(readingSet) {
  const vocabTerms = Array.isArray(readingSet?.vocabulary)
    ? readingSet.vocabulary.map((item) => ({ text: item?.word, reading: item?.kana }))
    : [];
  return mergeAndDedupeTerms([...commonReadingRubyTerms, ...vocabTerms], readingSet?.rubyTerms || []);
}

function createRubyPartsFromTerms(text, rubyTerms) {
  const source = String(text ?? "");
  const terms = normalizeRubyTerms(rubyTerms);
  if (!source || !terms.length) return [{ text: source }];

  const parts = [];
  const pushText = (value) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && Object.prototype.hasOwnProperty.call(last, "text")) last.text += value;
    else parts.push({ text: value });
  };

  let index = 0;
  while (index < source.length) {
    const match = terms.find((term) => source.startsWith(term.text, index));
    if (match) {
      parts.push({ base: match.text, ruby: match.reading });
      index += match.text.length;
    } else {
      pushText(source[index]);
      index += 1;
    }
  }

  return parts;
}


const READING_LOOKUP_INFLECTION_WHITELIST = Object.freeze([
  { surface: "温めて", reading: "あたためて", baseWord: "温める", baseKana: "あたためる", vocabularyId: 2263 },
  { surface: "書きました", reading: "かきました", baseWord: "書く", baseKana: "かく", vocabularyId: 201 },
  { surface: "調べ", reading: "しらべ", baseWord: "調べる", baseKana: "しらべる", vocabularyId: 1028 },
  { surface: "迷っています", reading: "まよっています", baseWord: "迷う", baseKana: "まよう", vocabularyId: 2314 },
  { surface: "誘い", reading: "さそい", baseWord: "誘う", baseKana: "さそう", vocabularyId: 1024 },
]);

const READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST = Object.freeze([
  {
    surface: "手伝う予定",
    reading: "てつだうよてい",
    segments: [
      { surface: "手伝う", reading: "てつだう", vocabularyId: 1040 },
      { surface: "予定", reading: "よてい", vocabularyId: 1238 },
    ],
  },
  {
    surface: "朝の電車",
    reading: "あさのでんしゃ",
    segments: [
      { surface: "朝", reading: "あさ", vocabularyId: 170 },
      { text: "の" },
      { surface: "電車", reading: "でんしゃ", vocabularyId: 348 },
    ],
  },
]);

function findVocabularyExactMatch(word, reading) {
  const exactMatches = vocabulary.filter((item) => String(item?.word ?? "") === String(word ?? ""));
  if (exactMatches.length === 0) return null;
  const readingMatch = exactMatches.find((item) => String(item?.kana ?? "") === String(reading ?? ""));
  return readingMatch || (exactMatches.length === 1 ? exactMatches[0] : null);
}

function getVocabularyByExactId(word, reading, vocabularyId) {
  const entry = findVocabularyExactMatch(word, reading);
  return entry && Number(entry.id) === Number(vocabularyId) ? entry : null;
}

function getReadingInflectionLookup(part) {
  const rule = READING_LOOKUP_INFLECTION_WHITELIST.find((item) => (
    item.surface === part?.base
      && item.reading === part?.ruby
  ));
  if (!rule) return null;

  const entry = getVocabularyByExactId(rule.baseWord, rule.baseKana, rule.vocabularyId);
  if (!entry) return null;

  return {
    entry,
    inflection: {
      surface: rule.surface,
      reading: rule.reading,
      baseWord: rule.baseWord,
      baseKana: rule.baseKana,
    },
  };
}

function getReadingLookupMatch(part) {
  if (!part?.base || !part?.ruby) return null;
  const exactEntry = findVocabularyExactMatch(part.base, part.ruby);
  if (exactEntry) return { entry: exactEntry };
  return getReadingInflectionLookup(part);
}

function getReadingCompoundSegments(part) {
  if (!part?.base || !part?.ruby) return null;
  if (findVocabularyExactMatch(part.base, part.ruby)) return null;
  if (getReadingInflectionLookup(part)) return null;

  const compound = READING_LOOKUP_COMPOUND_SEGMENT_WHITELIST.find((item) => (
    item.surface === part.base && item.reading === part.ruby
  ));
  if (!compound) return null;

  const segments = compound.segments.map((segment) => {
    if (segment.text) return { text: segment.text };
    const entry = getVocabularyByExactId(segment.surface, segment.reading, segment.vocabularyId);
    if (!entry) return null;
    return { base: segment.surface, ruby: segment.reading, lookup: { entry } };
  });
  if (segments.some((segment) => !segment)) return null;

  const coveredSurface = segments.map((segment) => segment.base ?? segment.text ?? "").join("");
  const coveredReading = segments.map((segment) => segment.ruby ?? segment.text ?? "").join("");
  if (coveredSurface !== compound.surface || coveredReading !== compound.reading) return null;
  return segments;
}

function clearReadingLookupCard() {
  document.querySelectorAll(".reading-lookup-card").forEach((card) => card.remove());
}

function appendReadingLookupRow(list, labelText, value) {
  const text = String(value ?? "").trim();
  if (!text) return;
  const row = document.createElement("div");
  row.className = "reading-lookup-row";
  const label = document.createElement("dt");
  label.textContent = labelText;
  const description = document.createElement("dd");
  description.textContent = text;
  row.append(label, description);
  list.appendChild(row);
}

// Batch 14A compatibility: clicking another term still calls the single-card update path formerly checked as showReadingLookupCard(card, entry).
function showReadingLookupCard(card, lookup) {
  clearReadingLookupCard();
  if (!card || !lookup?.entry) return;
  const { entry, inflection } = lookup;

  const lookupCard = document.createElement("section");
  lookupCard.className = "reading-lookup-card";
  lookupCard.setAttribute("aria-label", "查字資訊");

  const heading = document.createElement("h3");
  heading.textContent = "查字資訊";
  const list = document.createElement("dl");
  list.className = "reading-lookup-list";
  if (inflection) {
    appendReadingLookupRow(list, "原文形式", inflection.surface);
    appendReadingLookupRow(list, "原文假名", inflection.reading);
    appendReadingLookupRow(list, "基本形", inflection.baseWord);
    appendReadingLookupRow(list, "基本形假名", inflection.baseKana);
  }
  appendReadingLookupRow(list, "單字", entry.word);
  appendReadingLookupRow(list, "假名", entry.kana);
  appendReadingLookupRow(list, "詞性", entry.partOfSpeech);
  appendReadingLookupRow(list, "中文意思", entry.meaning);
  appendReadingLookupRow(list, "程度", entry.level);
  appendReadingLookupRow(list, "日文例句", entry.example);
  appendReadingLookupRow(list, "例句假名", entry.exampleKana);
  appendReadingLookupRow(list, "例句中文", entry.exampleMeaning);

  const close = document.createElement("button");
  close.className = "secondary-button reading-lookup-close";
  close.type = "button";
  close.textContent = "關閉";
  close.addEventListener("click", clearReadingLookupCard);

  const vocabularyBookControl = createJapaneseVocabularyBookControl(entry.id, "reading-lookup");
  lookupCard.append(heading, list, vocabularyBookControl, close);
  const passage = card.querySelector(".reading-passage");
  if (passage?.nextSibling) card.insertBefore(lookupCard, passage.nextSibling);
  else card.appendChild(lookupCard);
}

function activateReadingLookupTerm(termElement) {
  const card = termElement?.closest(".reading-card");
  const lookup = getReadingLookupMatch({
    base: termElement?.dataset.lookupSurface,
    ruby: termElement?.dataset.lookupReading,
  });
  if (card && lookup) showReadingLookupCard(card, lookup);
}

function appendRubyPart(parent, part, enableLookup) {
  const renderParts = enableLookup ? getReadingCompoundSegments(part) : null;
  if (renderParts) {
    renderParts.forEach((segment) => appendRubyPart(parent, segment, enableLookup));
    return;
  }

  if (part.base && part.ruby) {
    const ruby = document.createElement("span");
    ruby.className = "jp-ruby";
    ruby.setAttribute("role", "text");
    ruby.setAttribute("aria-label", `${part.base}（${part.ruby}）`);
    const lookup = part.lookup || (enableLookup ? getReadingLookupMatch(part) : null);
    if (lookup) {
      ruby.classList.add("is-clickable-ruby");
      ruby.dataset.lookupSurface = part.base;
      ruby.dataset.lookupReading = part.ruby;
      ruby.setAttribute("role", "button");
      ruby.tabIndex = 0;
      ruby.setAttribute("aria-label", `${part.base}（${part.ruby}）：點擊查字`);
      ruby.addEventListener("click", () => activateReadingLookupTerm(ruby));
      ruby.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateReadingLookupTerm(ruby);
      });
    }

    const rt = document.createElement("span");
    rt.className = "jp-rt";
    rt.setAttribute("aria-hidden", "true");
    rt.textContent = part.ruby;

    const rb = document.createElement("span");
    rb.className = "jp-rb";
    rb.setAttribute("aria-hidden", "true");
    rb.textContent = part.base;

    ruby.append(rt, rb);
    parent.appendChild(ruby);
  } else {
    parent.append(document.createTextNode(part.text ?? ""));
  }
}

function renderRubyParts(parent, parts, { enableLookup = false } = {}) {
  parent.replaceChildren();
  parts.forEach((part) => appendRubyPart(parent, part, enableLookup));
}

function renderRubyText(parent, text, rubyTerms, options = {}) {
  renderRubyParts(parent, createRubyPartsFromTerms(text, rubyTerms), options);
}

function getReadingTitleRubyParts(readingSet) {
  return createRubyPartsFromTerms(readingSet.title, getReadingRubyTerms(readingSet));
}

function getReadingPassageRubyParts(readingSet) {
  return createRubyPartsFromTerms(readingSet.passage, getReadingRubyTerms(readingSet));
}

function createReadingMeta(readingSet) {
  const details = document.createElement("div");
  details.className = "reading-details";

  const kanaSection = document.createElement("section");
  const kanaTitle = document.createElement("h4");
  kanaTitle.textContent = "文章假名";
  const kanaText = document.createElement("p");
  kanaText.className = "reading-kana";
  kanaText.textContent = readingSet?.passageKana || "暫無資料";
  kanaSection.append(kanaTitle, kanaText);
  details.appendChild(kanaSection);

  const vocabularySection = document.createElement("section");
  const vocabularyTitle = document.createElement("h4");
  vocabularyTitle.textContent = "重要單字";
  const vocabularyList = document.createElement("ul");
  const vocabularyItems = Array.isArray(readingSet?.vocabulary) ? readingSet.vocabulary : [];
  if (vocabularyItems.length > 0) {
    vocabularyItems.forEach((item) => {
      const listItem = document.createElement("li");
      const word = document.createElement("strong");
      word.textContent = item?.word || "暫無單字";
      listItem.append(word, `（${item?.kana || "暫無假名"}）：${item?.meaning || "暫無說明"}`);
      vocabularyList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "暫無資料";
    vocabularyList.appendChild(listItem);
  }
  vocabularySection.append(vocabularyTitle, vocabularyList);
  details.appendChild(vocabularySection);

  const grammarSection = document.createElement("section");
  const grammarTitle = document.createElement("h4");
  grammarTitle.textContent = "文法重點";
  const grammarList = document.createElement("ul");
  const grammarPoints = Array.isArray(readingSet?.grammarPoints) ? readingSet.grammarPoints : [];
  if (grammarPoints.length > 0) {
    grammarPoints.forEach((point) => {
      const listItem = document.createElement("li");
      listItem.textContent = point || "暫無資料";
      grammarList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "暫無資料";
    grammarList.appendChild(listItem);
  }
  grammarSection.append(grammarTitle, grammarList);
  details.appendChild(grammarSection);

  return details;
}


function getReadingQuestionCorrectIndex(question) {
  if (!question || !Array.isArray(question.options)) return -1;
  if (Number.isInteger(question.answerIndex)) return question.answerIndex;
  if (Number.isInteger(question.correctIndex)) return question.correctIndex;
  if (typeof question.correctAnswer === "string") return question.options.indexOf(question.correctAnswer);
  return -1;
}

function isReadingSelectedIndexCorrect(question, selectedIndex) {
  return selectedIndex === getReadingQuestionCorrectIndex(question);
}

function applyReadingOptionFeedback(button, optionIndex, question, selectedAnswer, { reveal = false } = {}) {
  const hasAnswer = selectedAnswer !== undefined;
  const shouldShowFeedback = reveal || hasAnswer;
  const correctIndex = getReadingQuestionCorrectIndex(question);
  const isCorrectOption = optionIndex === correctIndex;
  const isSelectedWrongOption = hasAnswer && selectedAnswer === optionIndex && !isCorrectOption;

  button.disabled = shouldShowFeedback;
  button.classList.toggle("is-correct", shouldShowFeedback && isCorrectOption);
  button.classList.toggle("is-wrong", shouldShowFeedback && isSelectedWrongOption);
}

function createReadingSetCard(readingSet, { reveal = false, showFeedback = false, selectedAnswers = {}, onAnswer, showRuby = false } = {}) {
  const card = document.createElement("article");
  card.className = "reading-card";

  const header = document.createElement("div");
  header.className = "reading-card-header";
  const meta = document.createElement("span");
  meta.className = "card-number";
  meta.textContent = `${readingSet.level}・${readingSet.type}`;
  const title = document.createElement("h2");
  if (showRuby) renderRubyText(title, readingSet.title, getReadingRubyTerms(readingSet), { enableLookup: true });
  else title.textContent = readingSet.title;
  header.append(meta, title);

  const passage = document.createElement("p");
  passage.className = "reading-passage";
  if (showRuby) renderRubyText(passage, readingSet.passage, getReadingRubyTerms(readingSet), { enableLookup: true });
  else passage.textContent = readingSet.passage;
  card.append(header, passage);
  readingSet.questions.forEach((question, questionIndex) => {
    const questionBlock = document.createElement("section");
    questionBlock.className = "reading-question-block";
    const feedback = document.createElement("div");
    feedback.className = "reading-feedback";
    const optionButtons = question.options.map((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "quiz-option reading-option";
      button.type = "button";
      button.dataset.optionIndex = String(optionIndex);
      if (showRuby) renderRubyText(button, option, getReadingRubyTerms(readingSet));
      else button.textContent = option;
      button.addEventListener("click", () => onAnswer?.(questionIndex, optionIndex, optionButtons, feedback));
      if (showFeedback || reveal) {
        applyReadingOptionFeedback(button, optionIndex, question, selectedAnswers[question.id], { reveal });
      }
      return button;
    });
    const selectedAnswer = selectedAnswers[question.id];
    if ((showFeedback && selectedAnswer !== undefined) || reveal) {
      const correctIndex = getReadingQuestionCorrectIndex(question);
      const correct = isReadingSelectedIndexCorrect(question, selectedAnswer);
      feedback.classList.add(correct ? "is-correct" : "is-wrong");
      feedback.innerHTML = `<strong>${correct ? "答對了！" : `答錯了，正確答案是：${question.options[correctIndex]}`}</strong><p class="reading-explanation">解析：${question.explanation}</p>`;
    }
    const options = document.createElement("div");
    options.className = "quiz-options reading-options";
    options.replaceChildren(...optionButtons);
    const prompt = document.createElement("p");
    prompt.className = "reading-question";
    prompt.append(`第 ${questionIndex + 1} 題：`);
    if (showRuby) {
      const questionText = document.createElement("span");
      renderRubyText(questionText, question.question, getReadingRubyTerms(readingSet));
      prompt.append(questionText);
    } else {
      prompt.append(question.question);
    }
    questionBlock.append(prompt, options, feedback);
    card.appendChild(questionBlock);
  });
  if (reveal) {
    card.appendChild(createReadingMeta(readingSet));
  }
  return card;
}

function showReadingPracticeQuestion() {
  if (japaneseReadingSets.length === 0) return renderReadingUnavailable();
  currentReadingSet = pickLeastSeenItem(japaneseReadingSets, JAPANESE_READING_SEEN_COUNTS_KEY, getReadingSeenKey);
  incrementSeenCount(JAPANESE_READING_SEEN_COUNTS_KEY, getReadingSeenKey(currentReadingSet));
  readingPracticeAnswers = {};
  const backToReadingMenu = createReadingBackMenuButton();
  const title = createReadingContentTitle("閱讀練習");
  const card = createReadingSetCard(currentReadingSet, { showFeedback: true, onAnswer: handleReadingPracticeAnswer, showRuby: true });
  const next = document.createElement("button");
  next.className = "answer-button";
  next.type = "button";
  next.textContent = "換一篇閱讀";
  next.addEventListener("click", showReadingPracticeQuestion);
  setReadingContentNodes(backToReadingMenu, title, card, next);
}

function handleReadingPracticeAnswer(questionIndex, selectedIndex, optionButtons, feedback) {
  if (!currentReadingSet) return;
  const question = currentReadingSet.questions[questionIndex];
  if (!question || readingPracticeAnswers[question.id] !== undefined) return;
  readingPracticeAnswers[question.id] = selectedIndex;
  const correctIndex = getReadingQuestionCorrectIndex(question);
  const correct = isReadingSelectedIndexCorrect(question, selectedIndex);
  feedback.classList.add(correct ? "is-correct" : "is-wrong");
  feedback.innerHTML = `<strong>${correct ? "答對了！" : `答錯了，正確答案是：${question.options[correctIndex]}`}</strong><p class="reading-explanation">解析：${question.explanation}</p>`;
  optionButtons.forEach((button, index) => {
    applyReadingOptionFeedback(button, index, question, selectedIndex);
  });
  if (Object.keys(readingPracticeAnswers).length === getReadingSetQuestionCount(currentReadingSet) && !feedback.closest(".reading-card").querySelector(".reading-details")) {
    feedback.closest(".reading-card").appendChild(createReadingMeta(currentReadingSet));
  }
}

function startReadingQuiz() {
  const pickedSets = [];
  let questionTotal = 0;
  while (questionTotal < READING_QUIZ_SIZE && pickedSets.length < japaneseReadingSets.length) {
    const remaining = READING_QUIZ_SIZE - questionTotal;
    const excludeKeys = new Set(pickedSets.map(getReadingSeenKey));
    const fittingSets = japaneseReadingSets.filter((set) => !excludeKeys.has(getReadingSeenKey(set)) && getReadingSetQuestionCount(set) <= remaining);
    const pool = fittingSets.length > 0 ? fittingSets : japaneseReadingSets.filter((set) => !excludeKeys.has(getReadingSeenKey(set)));
    const pickedSet = pickLeastSeenItem(pool, JAPANESE_READING_SEEN_COUNTS_KEY, getReadingSeenKey);
    if (!pickedSet) break;
    pickedSets.push(pickedSet);
    questionTotal += Math.min(getReadingSetQuestionCount(pickedSet), remaining);
  }
  incrementSeenCountsForItems(pickedSets, JAPANESE_READING_SEEN_COUNTS_KEY, getReadingSeenKey);
  readingQuizItems = pickedSets.flatMap((readingSet) => readingSet.questions.map((question) => ({ readingSetId: readingSet.id, question }))).slice(0, READING_QUIZ_SIZE);
  readingQuizSets = pickedSets.map((readingSet) => ({
    ...readingSet,
    questions: readingQuizItems.filter((item) => item.readingSetId === readingSet.id).map((item) => item.question),
  })).filter((readingSet) => readingSet.questions.length > 0);
  readingQuizAnswers = [];
  currentReadingQuizSetIndex = 0;
  renderReadingQuizQuestion();
}

function renderReadingQuizQuestion() {
  const readingSet = readingQuizSets[currentReadingQuizSetIndex];
  if (!readingSet) return renderReadingQuizResults();
  const answeredInPreviousSets = readingQuizSets.slice(0, currentReadingQuizSetIndex).reduce((sum, set) => sum + set.questions.length, 0);
  const backToReadingMenu = createReadingBackMenuButton();
  const title = createReadingContentTitle("閱讀測驗");
  const status = document.createElement("p");
  status.className = "set-status reading-quiz-status";
  status.textContent = `閱讀測驗 第 ${currentReadingQuizSetIndex + 1} 篇（${answeredInPreviousSets + 1}～${answeredInPreviousSets + readingSet.questions.length} / ${readingQuizItems.length} 題）`;
  const selectedAnswers = {};
  readingSet.questions.forEach((question, questionIndex) => {
    const answer = readingQuizAnswers[answeredInPreviousSets + questionIndex];
    if (answer !== undefined) selectedAnswers[question.id] = answer;
  });
  const card = createReadingSetCard(readingSet, { showFeedback: true, selectedAnswers, showRuby: false, onAnswer: (questionIndex, selectedIndex) => {
    if (readingQuizAnswers[answeredInPreviousSets + questionIndex] !== undefined) return;
    readingQuizAnswers[answeredInPreviousSets + questionIndex] = selectedIndex;
    const question = readingSet.questions[questionIndex];
    const correctIndex = getReadingQuestionCorrectIndex(question);
    if (!isReadingSelectedIndexCorrect(question, selectedIndex)) {
      recordJapaneseMistake({ module: "reading", questionType: "readingQuestion", itemId: question?.id, relatedId: readingSet?.id, userAnswer: question?.options?.[selectedIndex], correctAnswer: question?.options?.[correctIndex] });
    }
    renderReadingQuizQuestion();
  }});
  const setComplete = readingSet.questions.every((_question, index) => readingQuizAnswers[answeredInPreviousSets + index] !== undefined);
  const quizNodes = [backToReadingMenu, title, status, card];
  if (setComplete) {
    const next = document.createElement("button");
    next.className = "answer-button";
    next.type = "button";
    next.textContent = currentReadingQuizSetIndex + 1 >= readingQuizSets.length ? "查看測驗結果" : "下一篇閱讀";
    next.addEventListener("click", () => {
      currentReadingQuizSetIndex += 1;
      renderReadingQuizQuestion();
    });
    quizNodes.push(next);
  }
  setReadingContentNodes(...quizNodes);
}

function renderReadingQuizResults() {
  const correctCount = readingQuizItems.filter((item, i) => isReadingSelectedIndexCorrect(item.question, readingQuizAnswers[i])).length;
  const backToReadingMenu = createReadingBackMenuButton();
  const result = document.createElement("article");
  result.className = "reading-card reading-result-card";
  result.innerHTML = `<h2>閱讀測驗完成</h2><p class="reading-score">總分：${correctCount} / ${readingQuizItems.length}</p>`;
  const list = document.createElement("div");
  list.className = "reading-result-list";
  const groupedItems = readingQuizItems.reduce((groups, item, index) => {
    const readingSet = getReadingSetById(item.readingSetId);
    const group = groups.find((entry) => entry.readingSet.id === item.readingSetId);
    const answer = readingQuizAnswers[index];
    const resultItem = { question: item.question, answer, index };
    if (group) group.items.push(resultItem);
    else groups.push({ readingSet, items: [resultItem] });
    return groups;
  }, []);
  list.innerHTML = groupedItems.map(({ readingSet, items }) => `<section class="reading-result-item"><h3>${readingSet.title}</h3>${items.map(({ question, answer, index }) => {
    const correctIndex = getReadingQuestionCorrectIndex(question);
    return `<div class="reading-result-question"><p>第 ${index + 1} 題：${question.question}</p><p>你的答案：${question.options[answer] ?? "未作答"}</p><p>正確答案：${question.options[correctIndex]}</p><p>${isReadingSelectedIndexCorrect(question, answer) ? "答對" : "答錯"}</p><p>解析：${question.explanation}</p></div>`;
  }).join("")}</section>`).join("");
  const restart = document.createElement("button");
  restart.className = "answer-button";
  restart.type = "button";
  restart.textContent = "重新開始閱讀測驗";
  restart.addEventListener("click", startReadingQuiz);
  result.append(list, restart);
  setReadingContentNodes(backToReadingMenu, result);
}

function bindReadingModeButtons(readingViewElement = document.querySelector("#japaneseReadingPanel")) {
  if (!readingViewElement) return;

  japaneseReadingMenuView = readingViewElement.querySelector("#japaneseReadingMenuView");
  readingPracticeModeButton = readingViewElement.querySelector('[data-reading-mode="practice"]');
  readingQuizModeButton = readingViewElement.querySelector('[data-reading-mode="quiz"]');
  readingContent = readingViewElement.querySelector("#readingContent");

  if (readingViewElement.dataset.readingModeBound === "true") return;
  readingViewElement.dataset.readingModeBound = "true";
  readingViewElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading-mode]");
    if (!button || !readingViewElement.contains(button)) return;

    event.preventDefault();
    renderJapaneseReadingView(button.dataset.readingMode === "quiz" ? "quiz" : "practice");
  });
}

let readingPanelInitialized = false;
function initializeReadingPanel() {
  const readingViewElement = document.querySelector("#japaneseReadingPanel");
  bindReadingModeButtons(readingViewElement);
  readingPanelInitialized = true;

  renderJapaneseReadingView("menu");
}

window.bindReadingModeButtons = bindReadingModeButtons;

window.renderJapaneseReadingView = renderJapaneseReadingView;
window.initializeReadingPanel = initializeReadingPanel;

const JAPANESE_LISTENING_QUESTIONS = [
  {id:"jl-001",level:"N5",category:"日常",japanese:"今日は雨です。",kana:"きょうは あめです。",zh:"今天下雨。",question:"這句日文的意思是什麼？",options:["今天下雨。","明天放晴。","今天很熱。","昨天很冷。"],answerIndex:0},
  {id:"jl-002",level:"N5",category:"交通",japanese:"駅まで歩いて行きます。",kana:"えきまで あるいて いきます。",zh:"我走路去車站。",question:"這句日文的意思是什麼？",options:["我坐車去學校。","我走路去車站。","我在車站等朋友。","我騎腳踏車回家。"],answerIndex:1},
  {id:"jl-003",level:"N5",category:"餐廳",japanese:"水を一杯ください。",kana:"みずを いっぱい ください。",zh:"請給我一杯水。",question:"這句日文的意思是什麼？",options:["請給我一杯茶。","請給我菜單。","請給我一杯水。","請再說一次。"],answerIndex:2},
  {id:"jl-004",level:"N5",category:"學校",japanese:"明日は学校へ行きません。",kana:"あしたは がっこうへ いきません。",zh:"明天不去學校。",question:"這句日文的意思是什麼？",options:["今天要去學校。","昨天沒去公司。","明天要去圖書館。","明天不去學校。"],answerIndex:3},
  {id:"jl-005",level:"N5",category:"交通",japanese:"この電車は東京へ行きますか。",kana:"この でんしゃは とうきょうへ いきますか。",zh:"這班電車會去東京嗎？",question:"這句日文的意思是什麼？",options:["這班電車會去東京嗎？","這班巴士幾點來？","東京車站在哪裡？","我想買電車票。"],answerIndex:0},
  {id:"jl-006",level:"N5",category:"日常",japanese:"昨日、友だちと映画を見ました。",kana:"きのう、ともだちと えいがを みました。",zh:"昨天和朋友看了電影。",question:"這句日文的意思是什麼？",options:["今天和家人吃飯。","昨天和朋友看了電影。","明天想去看電影。","昨天在家讀書。"],answerIndex:1},
  {id:"jl-007",level:"N5",category:"日常",japanese:"すみません、トイレはどこですか。",kana:"すみません、トイレは どこですか。",zh:"不好意思，廁所在哪裡？",question:"這句日文的意思是什麼？",options:["不好意思，車站在哪裡？","請問現在幾點？","不好意思，廁所在哪裡？","請問這個多少錢？"],answerIndex:2},
  {id:"jl-008",level:"N4",category:"工作",japanese:"朝ごはんを食べてから、会社へ行きます。",kana:"あさごはんを たべてから、かいしゃへ いきます。",zh:"吃完早餐後去公司。",question:"這句日文的意思是什麼？",options:["下班後去吃晚餐。","沒吃早餐就去學校。","吃完午餐後回家。","吃完早餐後去公司。"],answerIndex:3},
  {id:"jl-009",level:"N5",category:"日常",japanese:"もう一度言ってください。",kana:"もういちど いってください。",zh:"請再說一次。",question:"這句日文的意思是什麼？",options:["請再說一次。","請慢慢寫。","請等一下。","請看這裡。"],answerIndex:0},
  {id:"jl-010",level:"N5",category:"時間",japanese:"バスは十時に来ます。",kana:"バスは じゅうじに きます。",zh:"公車十點會來。",question:"這句日文的意思是什麼？",options:["電車九點出發。","公車十點會來。","朋友十點回家。","學校八點開始。"],answerIndex:1},
  {id:"jl-011",level:"N5",category:"日常",japanese:"毎朝七時に起きます。",kana:"まいあさ しちじに おきます。",zh:"我每天早上七點起床。",question:"這句日文的意思是什麼？",options:["我每天晚上七點睡覺。","我今天早上八點出門。","我每天早上七點起床。","我昨天七點回家。"],answerIndex:2},
  {id:"jl-012",level:"N5",category:"家庭",japanese:"母は料理が上手です。",kana:"ははは りょうりが じょうずです。",zh:"媽媽很會做菜。",question:"這句日文的意思是什麼？",options:["爸爸正在買菜。","姐姐不喜歡做菜。","弟弟想吃晚餐。","媽媽很會做菜。"],answerIndex:3},
  {id:"jl-013",level:"N5",category:"學校",japanese:"図書館で本を読みます。",kana:"としょかんで ほんを よみます。",zh:"我在圖書館看書。",question:"這句日文的意思是什麼？",options:["我在圖書館看書。","我在教室寫字。","我在書店買書。","我在公園散步。"],answerIndex:0},
  {id:"jl-014",level:"N5",category:"日常",japanese:"今日はとても忙しいです。",kana:"きょうは とても いそがしいです。",zh:"今天非常忙。",question:"這句日文的意思是什麼？",options:["今天非常安靜。","今天非常忙。","明天很有空。","昨天很開心。"],answerIndex:1},
  {id:"jl-015",level:"N5",category:"日常",japanese:"犬と公園へ行きました。",kana:"いぬと こうえんへ いきました。",zh:"我和狗去了公園。",question:"這句日文的意思是什麼？",options:["我和貓在家。","我和朋友去了學校。","我和狗去了公園。","我在公園看見狗。"],answerIndex:2},
  {id:"jl-016",level:"N5",category:"交通",japanese:"次の駅で降ります。",kana:"つぎの えきで おります。",zh:"我在下一站下車。",question:"這句日文的意思是什麼？",options:["我在這站上車。","電車很快到站。","車站在前面。","我在下一站下車。"],answerIndex:3},
  {id:"jl-017",level:"N5",category:"交通",japanese:"自転車で学校へ行きます。",kana:"じてんしゃで がっこうへ いきます。",zh:"我騎腳踏車去學校。",question:"這句日文的意思是什麼？",options:["我騎腳踏車去學校。","我搭公車去公司。","我走路去車站。","我坐電車回家。"],answerIndex:0},
  {id:"jl-018",level:"N5",category:"交通",japanese:"切符を二枚買いました。",kana:"きっぷを にまい かいました。",zh:"我買了兩張票。",question:"這句日文的意思是什麼？",options:["我拿了一張地圖。","我買了兩張票。","我忘了車票。","我賣了兩本書。"],answerIndex:1},
  {id:"jl-019",level:"N5",category:"購物",japanese:"このかばんはいくらですか。",kana:"この かばんは いくらですか。",zh:"這個包包多少錢？",question:"這句日文的意思是什麼？",options:["這個包包在哪裡？","這雙鞋多少錢？","這個包包多少錢？","那個包包很重嗎？"],answerIndex:2},
  {id:"jl-020",level:"N5",category:"餐廳",japanese:"ラーメンを一つお願いします。",kana:"ラーメンを ひとつ おねがいします。",zh:"請給我一碗拉麵。",question:"這句日文的意思是什麼？",options:["請給我一杯咖啡。","請給我兩份壽司。","請把菜單給我。","請給我一碗拉麵。"],answerIndex:3},
  {id:"jl-021",level:"N5",category:"購物",japanese:"白いシャツを探しています。",kana:"しろい シャツを さがしています。",zh:"我正在找白色襯衫。",question:"這句日文的意思是什麼？",options:["我正在找白色襯衫。","我正在穿藍色外套。","我想買黑色鞋子。","我看見紅色帽子。"],answerIndex:0},
  {id:"jl-022",level:"N5",category:"餐廳",japanese:"ここで食べてもいいですか。",kana:"ここで たべても いいですか。",zh:"可以在這裡吃嗎？",question:"這句日文的意思是什麼？",options:["可以在這裡拍照嗎？","可以在這裡吃嗎？","要在那裡等嗎？","要一起吃飯嗎？"],answerIndex:1},
  {id:"jl-023",level:"N4",category:"天氣",japanese:"明日は暑くなるでしょう。",kana:"あしたは あつく なるでしょう。",zh:"明天可能會變熱。",question:"這句日文的意思是什麼？",options:["今天可能會下雪。","昨天變得很冷。","明天可能會變熱。","明天早上會下雨。"],answerIndex:2},
  {id:"jl-024",level:"N5",category:"時間",japanese:"今、何時ですか。",kana:"いま、なんじですか。",zh:"現在幾點？",question:"這句日文的意思是什麼？",options:["今天星期幾？","你幾點起床？","車站在哪裡？","現在幾點？"],answerIndex:3},
  {id:"jl-025",level:"N5",category:"天氣",japanese:"外は少し寒いです。",kana:"そとは すこし さむいです。",zh:"外面有點冷。",question:"這句日文的意思是什麼？",options:["外面有點冷。","房間裡很熱。","外面非常吵。","今天有點忙。"],answerIndex:0},
  {id:"jl-026",level:"N4",category:"日常",japanese:"宿題が終わったら、テレビを見ます。",kana:"しゅくだいが おわったら、テレビを みます。",zh:"作業做完後看電視。",question:"這句日文的意思是什麼？",options:["看完電視後做作業。","作業做完後看電視。","作業還沒做完。","我一邊看電視一邊寫信。"],answerIndex:1},
  {id:"jl-027",level:"N4",category:"工作",japanese:"会議は三時から始まります。",kana:"かいぎは さんじから はじまります。",zh:"會議從三點開始。",question:"這句日文的意思是什麼？",options:["會議在三點結束。","工作從九點開始。","會議從三點開始。","課程在三點取消。"],answerIndex:2},
  {id:"jl-028",level:"N4",category:"旅行",japanese:"ホテルを予約してあります。",kana:"ホテルを よやくして あります。",zh:"我已經訂好飯店了。",question:"這句日文的意思是什麼？",options:["我正在找飯店。","我取消了機票。","我想換房間。","我已經訂好飯店了。"],answerIndex:3},
  {id:"jl-029",level:"N4",category:"旅行",japanese:"道に迷ったので、地図を見ました。",kana:"みちに まよったので、ちずを みました。",zh:"因為迷路了，所以看了地圖。",question:"這句日文的意思是什麼？",options:["因為迷路了，所以看了地圖。","因為下雨了，所以回飯店。","因為很累，所以搭計程車。","因為地圖不見了，所以問路。"],answerIndex:0},
  {id:"jl-030",level:"N4",category:"工作",japanese:"仕事が終わってから、友だちに会います。",kana:"しごとが おわってから、ともだちに あいます。",zh:"工作結束後去見朋友。",question:"這句日文的意思是什麼？",options:["見完朋友後去工作。","工作結束後去見朋友。","工作開始前去買東西。","朋友下班後回家。"],answerIndex:1},
  {id:"jl-031",level:"N5",category:"日常生活",japanese:"朝、コーヒーを飲みます。",kana:"あさ、コーヒーを のみます。",zh:"早上喝咖啡。",question:"這句日文的意思是什麼？",options:["晚上喝茶。","中午吃麵包。","早上喝咖啡。","早上買牛奶。"],answerIndex:2},
  {id:"jl-032",level:"N5",category:"學校",japanese:"先生に質問しました。",kana:"せんせいに しつもんしました。",zh:"我問了老師問題。",question:"這句日文的意思是什麼？",options:["老師回答了朋友。","我在教室睡覺。","學生寫了名字。","我問了老師問題。"],answerIndex:3},
  {id:"jl-033",level:"N5",category:"交通",japanese:"バス停はあそこです。",kana:"バスていは あそこです。",zh:"公車站在那裡。",question:"這句日文的意思是什麼？",options:["公車站在那裡。","電車站在這裡。","計程車很貴。","公車已經走了。"],answerIndex:0},
  {id:"jl-034",level:"N5",category:"餐廳",japanese:"この店の料理はおいしいです。",kana:"この みせの りょうりは おいしいです。",zh:"這家店的料理很好吃。",question:"這句日文的意思是什麼？",options:["那家店離車站很遠。","這家店的料理很好吃。","這個房間非常安靜。","這道菜有一點辣。"],answerIndex:1},
  {id:"jl-035",level:"N5",category:"購物",japanese:"赤い靴を買いました。",kana:"あかい くつを かいました。",zh:"我買了紅色鞋子。",question:"這句日文的意思是什麼？",options:["我穿了白色襯衫。","我賣了黑色包包。","我買了紅色鞋子。","我正在找藍色帽子。"],answerIndex:2},
  {id:"jl-036",level:"N5",category:"時間",japanese:"授業は九時半に始まります。",kana:"じゅぎょうは くじはんに はじまります。",zh:"課九點半開始。",question:"這句日文的意思是什麼？",options:["課十點結束。","會議八點半開始。","學校今天休息。","課九點半開始。"],answerIndex:3},
  {id:"jl-037",level:"N5",category:"天氣",japanese:"今日は風が強いです。",kana:"きょうは かぜが つよいです。",zh:"今天風很大。",question:"這句日文的意思是什麼？",options:["今天風很大。","今天雨很小。","明天會很熱。","昨天雪很大。"],answerIndex:0},
  {id:"jl-038",level:"N5",category:"家庭",japanese:"弟は部屋にいます。",kana:"おとうとは へやに います。",zh:"弟弟在房間裡。",question:"這句日文的意思是什麼？",options:["姐姐在廚房裡。","弟弟在房間裡。","爸爸在公司。","媽媽去了車站。"],answerIndex:1},
  {id:"jl-039",level:"N5",category:"旅行",japanese:"写真をたくさん撮りました。",kana:"しゃしんを たくさん とりました。",zh:"拍了很多照片。",question:"這句日文的意思是什麼？",options:["買了很多禮物。","看了很多書。","拍了很多照片。","走了很長的路。"],answerIndex:2},
  {id:"jl-040",level:"N5",category:"工作",japanese:"今日は会社を休みます。",kana:"きょうは かいしゃを やすみます。",zh:"今天請假不上班。",question:"這句日文的意思是什麼？",options:["今天去公司開會。","明天開始工作。","昨天工作很忙。","今天請假不上班。"],answerIndex:3},
  {id:"jl-041",level:"N5",category:"醫院 / 藥局",japanese:"頭が痛いです。",kana:"あたまが いたいです。",zh:"我頭痛。",question:"這句日文的意思是什麼？",options:["我頭痛。","我肚子餓。","我很想睡。","我牙齒痛。"],answerIndex:0},
  {id:"jl-042",level:"N5",category:"便利商店",japanese:"お弁当を温めてください。",kana:"おべんとうを あたためてください。",zh:"請幫我加熱便當。",question:"這句日文的意思是什麼？",options:["請幫我影印文件。","請幫我加熱便當。","請給我一個袋子。","請找我零錢。"],answerIndex:1},
  {id:"jl-043",level:"N5",category:"電話 / 約定",japanese:"あとで電話します。",kana:"あとで でんわします。",zh:"我等一下打電話。",question:"這句日文的意思是什麼？",options:["我現在寫信。","我明天見朋友。","我等一下打電話。","我昨天收到電話。"],answerIndex:2},
  {id:"jl-044",level:"N5",category:"方向 / 地點",japanese:"銀行は郵便局の隣です。",kana:"ぎんこうは ゆうびんきょくの となりです。",zh:"銀行在郵局旁邊。",question:"這句日文的意思是什麼？",options:["郵局在車站前面。","銀行在學校後面。","醫院在公園裡。","銀行在郵局旁邊。"],answerIndex:3},
  {id:"jl-045",level:"N4",category:"請求 / 許可",japanese:"ここに座ってもいいですか。",kana:"ここに すわっても いいですか。",zh:"可以坐在這裡嗎？",question:"這句日文的意思是什麼？",options:["可以坐在這裡嗎？","可以站在那裡嗎？","請坐在教室裡。","不要坐在這裡。"],answerIndex:0},
  {id:"jl-046",level:"N4",category:"日常生活",japanese:"シャワーを浴びてから寝ます。",kana:"シャワーを あびてから ねます。",zh:"洗完澡後睡覺。",question:"這句日文的意思是什麼？",options:["睡醒後洗澡。","洗完澡後睡覺。","洗完衣服後出門。","吃完飯後讀書。"],answerIndex:1},
  {id:"jl-047",level:"N5",category:"學校",japanese:"ノートを忘れました。",kana:"ノートを わすれました。",zh:"我忘了帶筆記本。",question:"這句日文的意思是什麼？",options:["我買了新鉛筆。","我交了作業。","我忘了帶筆記本。","我借了字典。"],answerIndex:2},
  {id:"jl-048",level:"N5",category:"交通",japanese:"電車が少し遅れています。",kana:"でんしゃが すこし おくれています。",zh:"電車有點誤點。",question:"這句日文的意思是什麼？",options:["公車很快到了。","電車非常空。","車票有點貴。","電車有點誤點。"],answerIndex:3},
  {id:"jl-049",level:"N4",category:"餐廳",japanese:"辛い物は食べられません。",kana:"からい ものは たべられません。",zh:"我不能吃辣的東西。",question:"這句日文的意思是什麼？",options:["我不能吃辣的東西。","我想吃甜的東西。","我不喝冷的飲料。","我已經吃飽了。"],answerIndex:0},
  {id:"jl-050",level:"N5",category:"購物",japanese:"もう少し安い物はありますか。",kana:"もうすこし やすい ものは ありますか。",zh:"有再便宜一點的東西嗎？",question:"這句日文的意思是什麼？",options:["有再大一點的房間嗎？","有再便宜一點的東西嗎？","可以用信用卡嗎？","這個東西很貴嗎？"],answerIndex:1},
  {id:"jl-051",level:"N5",category:"時間",japanese:"日曜日に友だちと会います。",kana:"にちようびに ともだちと あいます。",zh:"星期日和朋友見面。",question:"這句日文的意思是什麼？",options:["星期六和家人吃飯。","星期一去學校。","星期日和朋友見面。","星期五看電影。"],answerIndex:2},
  {id:"jl-052",level:"N4",category:"天氣",japanese:"雨が降りそうです。",kana:"あめが ふりそうです。",zh:"看起來快要下雨了。",question:"這句日文的意思是什麼？",options:["雨已經停了。","天氣變得很冷。","明天應該會放晴。","看起來快要下雨了。"],answerIndex:3},
  {id:"jl-053",level:"N4",category:"家庭",japanese:"妹は歌を歌いながら歩きます。",kana:"いもうとは うたを うたいながら あるきます。",zh:"妹妹一邊唱歌一邊走路。",question:"這句日文的意思是什麼？",options:["妹妹一邊唱歌一邊走路。","姐姐一邊走路一邊看書。","妹妹唱完歌後回家。","弟弟一邊跑步一邊笑。"],answerIndex:0},
  {id:"jl-054",level:"N4",category:"旅行",japanese:"京都へ行ったことがあります。",kana:"きょうとへ いったことが あります。",zh:"我去過京都。",question:"這句日文的意思是什麼？",options:["我想去東京。","我去過京都。","我住在大阪。","我明天去奈良。"],answerIndex:1},
  {id:"jl-055",level:"N4",category:"工作",japanese:"明日までに資料を出さなければなりません。",kana:"あしたまでに しりょうを ださなければなりません。",zh:"必須在明天前交資料。",question:"這句日文的意思是什麼？",options:["明天之前不用開會。","今天要看完資料。","必須在明天前交資料。","資料已經交出去了。"],answerIndex:2},
  {id:"jl-056",level:"N5",category:"醫院 / 藥局",japanese:"この薬を飲んでください。",kana:"この くすりを のんでください。",zh:"請服用這個藥。",question:"這句日文的意思是什麼？",options:["請量一下體溫。","請在這裡等。","請買這個藥。","請服用這個藥。"],answerIndex:3},
  {id:"jl-057",level:"N5",category:"便利商店",japanese:"レシートをください。",kana:"レシートを ください。",zh:"請給我收據。",question:"這句日文的意思是什麼？",options:["請給我收據。","請給我筷子。","請給我袋子。","請給我水。"],answerIndex:0},
  {id:"jl-058",level:"N4",category:"電話 / 約定",japanese:"六時に駅で会いましょう。",kana:"ろくじに えきで あいましょう。",zh:"六點在車站見面吧。",question:"這句日文的意思是什麼？",options:["七點在學校上課吧。","六點在車站見面吧。","六點搭電車回家吧。","明天在公園散步吧。"],answerIndex:1},
  {id:"jl-059",level:"N5",category:"方向 / 地點",japanese:"まっすぐ行ってください。",kana:"まっすぐ いってください。",zh:"請直走。",question:"這句日文的意思是什麼？",options:["請右轉。","請等一下。","請直走。","請坐下。"],answerIndex:2},
  {id:"jl-060",level:"N4",category:"請求 / 許可",japanese:"窓を開けてもいいですか。",kana:"まどを あけても いいですか。",zh:"可以打開窗戶嗎？",question:"這句日文的意思是什麼？",options:["請關上門好嗎？","可以借這本書嗎？","請把窗戶擦乾淨。","可以打開窗戶嗎？"],answerIndex:3},
  {id:"jl-061",level:"N5",category:"日常生活",japanese:"朝ごはんにパンを食べます。",kana:"あさごはんに パンを たべます。",zh:"早餐吃麵包。",question:"這句日文的意思是什麼？",options:["早餐吃麵包。","午餐吃米飯。","晚餐喝湯。","早上買水果。"],answerIndex:0},
  {id:"jl-062",level:"N4",category:"日常生活",japanese:"部屋を掃除してから、出かけます。",kana:"へやを そうじしてから、でかけます。",zh:"打掃房間後出門。",question:"這句日文的意思是什麼？",options:["回家後打掃房間。","打掃房間後出門。","出門前洗衣服。","打掃教室後回家。"],answerIndex:1},
  {id:"jl-063",level:"N5",category:"學校",japanese:"教室に学生がいます。",kana:"きょうしつに がくせいが います。",zh:"教室裡有學生。",question:"這句日文的意思是什麼？",options:["圖書館裡有老師。","學生在操場跑步。","教室裡有學生。","教室裡沒有桌子。"],answerIndex:2},
  {id:"jl-064",level:"N4",category:"學校",japanese:"明日、漢字のテストがあると思います。",kana:"あした、かんじの テストが あると おもいます。",zh:"我想明天有漢字考試。",question:"這句日文的意思是什麼？",options:["我覺得今天沒有課。","明天要交日記。","昨天有數學考試。","我想明天有漢字考試。"],answerIndex:3},
  {id:"jl-065",level:"N5",category:"交通",japanese:"タクシーで空港へ行きます。",kana:"タクシーで くうこうへ いきます。",zh:"搭計程車去機場。",question:"這句日文的意思是什麼？",options:["搭計程車去機場。","搭公車去學校。","坐電車去公司。","走路去車站。"],answerIndex:0},
  {id:"jl-066",level:"N4",category:"交通",japanese:"電車よりバスのほうが安いです。",kana:"でんしゃより バスの ほうが やすいです。",zh:"公車比電車便宜。",question:"這句日文的意思是什麼？",options:["電車比公車快。","公車比電車便宜。","計程車比公車貴。","公車站比車站遠。"],answerIndex:1},
  {id:"jl-067",level:"N5",category:"餐廳",japanese:"メニューを見せてください。",kana:"メニューを みせてください。",zh:"請給我看菜單。",question:"這句日文的意思是什麼？",options:["請給我水。","請結帳。","請給我看菜單。","請幫我加熱。"],answerIndex:2},
  {id:"jl-068",level:"N4",category:"餐廳",japanese:"予約をしていないので、少し待ちます。",kana:"よやくを していないので、すこし まちます。",zh:"因為沒有預約，所以稍等一下。",question:"這句日文的意思是什麼？",options:["因為已經吃飽，所以回家。","因為菜很辣，所以喝水。","因為店很近，所以走路去。","因為沒有預約，所以稍等一下。"],answerIndex:3},
  {id:"jl-069",level:"N5",category:"購物",japanese:"この店でお土産を買います。",kana:"この みせで おみやげを かいます。",zh:"在這家店買伴手禮。",question:"這句日文的意思是什麼？",options:["在這家店買伴手禮。","在那家店吃晚餐。","在車站買票。","在書店看雜誌。"],answerIndex:0},
  {id:"jl-070",level:"N5",category:"購物",japanese:"カードで払ってもいいですか。",kana:"カードで はらっても いいですか。",zh:"可以用卡付款嗎？",question:"這句日文的意思是什麼？",options:["可以在這裡坐嗎？","可以用卡付款嗎？","要用現金付款嗎？","請給我收據。"],answerIndex:1},
  {id:"jl-071",level:"N5",category:"時間",japanese:"午後二時に来てください。",kana:"ごご にじに きてください。",zh:"請下午兩點來。",question:"這句日文的意思是什麼？",options:["請早上九點走。","我晚上七點回家。","請下午兩點來。","公車十點出發。"],answerIndex:2},
  {id:"jl-072",level:"N4",category:"時間",japanese:"宿題は今夜までにしなければなりません。",kana:"しゅくだいは こんやまでに しなければなりません。",zh:"作業必須在今晚以前做完。",question:"這句日文的意思是什麼？",options:["作業明天不用交。","今晚想看電視。","考試必須早上開始。","作業必須在今晚以前做完。"],answerIndex:3},
  {id:"jl-073",level:"N5",category:"天氣",japanese:"今日は雪が降っています。",kana:"きょうは ゆきが ふっています。",zh:"今天正在下雪。",question:"這句日文的意思是什麼？",options:["今天正在下雪。","明天會下雨。","今天風很大。","昨天很熱。"],answerIndex:0},
  {id:"jl-074",level:"N4",category:"天氣",japanese:"寒いので、コートを着ます。",kana:"さむいので、コートを きます。",zh:"因為很冷，所以穿外套。",question:"這句日文的意思是什麼？",options:["因為很熱，所以開窗。","因為很冷，所以穿外套。","因為下雨，所以帶傘。","因為風大，所以回家。"],answerIndex:1},
  {id:"jl-075",level:"N5",category:"家庭",japanese:"父は新聞を読んでいます。",kana:"ちちは しんぶんを よんでいます。",zh:"爸爸正在看報紙。",question:"這句日文的意思是什麼？",options:["媽媽正在做晚餐。","哥哥正在看電視。","爸爸正在看報紙。","妹妹正在寫作業。"],answerIndex:2},
  {id:"jl-076",level:"N5",category:"家庭",japanese:"家族で晩ごはんを食べました。",kana:"かぞくで ばんごはんを たべました。",zh:"和家人吃了晚餐。",question:"這句日文的意思是什麼？",options:["和朋友看了電影。","一個人去了公園。","和同事喝了咖啡。","和家人吃了晚餐。"],answerIndex:3},
  {id:"jl-077",level:"N5",category:"旅行",japanese:"駅で地図をもらいました。",kana:"えきで ちずを もらいました。",zh:"在車站拿了地圖。",question:"這句日文的意思是什麼？",options:["在車站拿了地圖。","在飯店買了票。","在機場等朋友。","在公園拍了照片。"],answerIndex:0},
  {id:"jl-078",level:"N4",category:"旅行",japanese:"来年、日本へ旅行する予定です。",kana:"らいねん、にほんへ りょこうする よていです。",zh:"明年預定去日本旅行。",question:"這句日文的意思是什麼？",options:["去年去了日本留學。","明年預定去日本旅行。","明天要去東京出差。","今年不打算旅行。"],answerIndex:1},
  {id:"jl-079",level:"N5",category:"工作",japanese:"机の上に書類があります。",kana:"つくえの うえに しょるいが あります。",zh:"桌上有文件。",question:"這句日文的意思是什麼？",options:["椅子下有包包。","書架上有雜誌。","桌上有文件。","門口有客人。"],answerIndex:2},
  {id:"jl-080",level:"N4",category:"工作",japanese:"今日は早く帰るつもりです。",kana:"きょうは はやく かえる つもりです。",zh:"今天打算早點回去。",question:"這句日文的意思是什麼？",options:["明天想早點上班。","今天必須加班。","昨天很晚才回家。","今天打算早點回去。"],answerIndex:3},
  {id:"jl-081",level:"N5",category:"醫院 / 藥局",japanese:"病院は駅の近くです。",kana:"びょういんは えきの ちかくです。",zh:"醫院在車站附近。",question:"這句日文的意思是什麼？",options:["醫院在車站附近。","藥局在學校旁邊。","車站在醫院後面。","銀行在公園附近。"],answerIndex:0},
  {id:"jl-082",level:"N4",category:"醫院 / 藥局",japanese:"熱があるので、薬局へ行きます。",kana:"ねつが あるので、やっきょくへ いきます。",zh:"因為發燒，所以去藥局。",question:"這句日文的意思是什麼？",options:["因為肚子餓，所以去餐廳。","因為發燒，所以去藥局。","因為頭痛，所以回學校。","因為很累，所以去銀行。"],answerIndex:1},
  {id:"jl-083",level:"N5",category:"便利商店",japanese:"コピーを一枚お願いします。",kana:"コピーを いちまい おねがいします。",zh:"請幫我影印一份。",question:"這句日文的意思是什麼？",options:["請給我一個便當。","請加熱一杯咖啡。","請幫我影印一份。","請找我一百日圓。"],answerIndex:2},
  {id:"jl-084",level:"N5",category:"便利商店",japanese:"袋は要りません。",kana:"ふくろは いりません。",zh:"我不需要袋子。",question:"這句日文的意思是什麼？",options:["我想要筷子。","請給我收據。","袋子在哪裡？","我不需要袋子。"],answerIndex:3},
  {id:"jl-085",level:"N5",category:"電話 / 約定",japanese:"明日の約束を忘れないでください。",kana:"あしたの やくそくを わすれないでください。",zh:"請不要忘記明天的約定。",question:"這句日文的意思是什麼？",options:["請不要忘記明天的約定。","請取消今天的約定。","請明天打電話給我。","請不要忘記帶傘。"],answerIndex:0},
  {id:"jl-086",level:"N4",category:"電話 / 約定",japanese:"用事があるので、約束の時間を変えたいです。",kana:"ようじが あるので、やくそくの じかんを かえたいです。",zh:"因為有事，想改約定時間。",question:"這句日文的意思是什麼？",options:["因為沒空，想取消旅行。","因為有事，想改約定時間。","因為遲到，想搭計程車。","因為很忙，想早點睡。"],answerIndex:1},
  {id:"jl-087",level:"N5",category:"方向 / 地點",japanese:"トイレは二階にあります。",kana:"トイレは にかいに あります。",zh:"廁所在二樓。",question:"這句日文的意思是什麼？",options:["教室在一樓。","電梯在右邊。","廁所在二樓。","出口在前面。"],answerIndex:2},
  {id:"jl-088",level:"N5",category:"方向 / 地點",japanese:"ここを右に曲がってください。",kana:"ここを みぎに まがってください。",zh:"請在這裡右轉。",question:"這句日文的意思是什麼？",options:["請在前面左轉。","請直走到車站。","請在那裡停車。","請在這裡右轉。"],answerIndex:3},
  {id:"jl-089",level:"N5",category:"請求 / 許可",japanese:"ペンを貸してください。",kana:"ペンを かしてください。",zh:"請借我筆。",question:"這句日文的意思是什麼？",options:["請借我筆。","請給我紙。","請寫名字。","請看黑板。"],answerIndex:0},
  {id:"jl-090",level:"N4",category:"請求 / 許可",japanese:"写真を撮ってもいいですか。",kana:"しゃしんを とっても いいですか。",zh:"可以拍照嗎？",question:"這句日文的意思是什麼？",options:["可以唱歌嗎？","可以拍照嗎？","請幫我拍照。","請不要拍照。"],answerIndex:1},
  {id:"jl-091",level:"N5",category:"郵局 / 銀行",japanese:"郵便局で切手を買います。",kana:"ゆうびんきょくで きってを かいます。",zh:"在郵局買郵票。",question:"這句日文的意思是什麼？",options:["在銀行換錢。","在便利商店買信封。","在郵局買郵票。","在車站買車票。"],answerIndex:2},
  {id:"jl-092",level:"N4",category:"郵局 / 銀行",japanese:"銀行でお金をおろすことができます。",kana:"ぎんこうで おかねを おろすことが できます。",zh:"可以在銀行提款。",question:"這句日文的意思是什麼？",options:["可以在郵局寄信。","可以在店裡刷卡。","可以在車站買票。","可以在銀行提款。"],answerIndex:3},
  {id:"jl-093",level:"N5",category:"圖書館",japanese:"静かに本を読んでください。",kana:"しずかに ほんを よんでください。",zh:"請安靜地看書。",question:"這句日文的意思是什麼？",options:["請安靜地看書。","請大聲說話。","請在教室寫字。","請把書買回家。"],answerIndex:0},
  {id:"jl-094",level:"N5",category:"圖書館",japanese:"この本は来週返します。",kana:"この ほんは らいしゅう かえします。",zh:"這本書下週歸還。",question:"這句日文的意思是什麼？",options:["那本書今天購買。","這本書下週歸還。","這本書昨天借出。","雜誌明天送到。"],answerIndex:1},
  {id:"jl-095",level:"N5",category:"飯店 / 住宿",japanese:"チェックインをお願いします。",kana:"チェックインを おねがいします。",zh:"我要辦理入住。",question:"這句日文的意思是什麼？",options:["我要辦理退房。","請打掃房間。","我要辦理入住。","請叫計程車。"],answerIndex:2},
  {id:"jl-096",level:"N4",category:"飯店 / 住宿",japanese:"部屋が寒いので、毛布をください。",kana:"へやが さむいので、もうふを ください。",zh:"因為房間很冷，請給我毛毯。",question:"這句日文的意思是什麼？",options:["因為房間很熱，請開窗。","因為房間很吵，想換房間。","因為床很大，請拍照。","因為房間很冷，請給我毛毯。"],answerIndex:3},
  {id:"jl-097",level:"N5",category:"休假 / 週末",japanese:"週末は家で休みます。",kana:"しゅうまつは いえで やすみます。",zh:"週末在家休息。",question:"這句日文的意思是什麼？",options:["週末在家休息。","平日去公司。","假日去學校。","晚上在外面吃飯。"],answerIndex:0},
  {id:"jl-098",level:"N4",category:"休假 / 週末",japanese:"日曜日は映画を見に行くつもりです。",kana:"にちようびは えいがを みに いく つもりです。",zh:"星期日打算去看電影。",question:"這句日文的意思是什麼？",options:["星期六預定去旅行。","星期日打算去看電影。","明天必須去上班。","週末想在家讀書。"],answerIndex:1},
  {id:"jl-099",level:"N5",category:"身體狀況",japanese:"今日は少し疲れています。",kana:"きょうは すこし つかれています。",zh:"今天有點累。",question:"這句日文的意思是什麼？",options:["今天很開心。","昨天有點冷。","今天有點累。","明天很忙。"],answerIndex:2},
  {id:"jl-100",level:"N4",category:"身體狀況",japanese:"早く寝たほうがいいです。",kana:"はやく ねた ほうが いいです。",zh:"最好早點睡。",question:"這句日文的意思是什麼？",options:["可以晚點起床。","必須早點出門。","想慢慢吃飯。","最好早點睡。"],answerIndex:3}
];

const LISTENING_QUIZ_SIZE = 10;

let japaneseListeningMenuView = document.querySelector("#japaneseListeningMenuView");
let japaneseListeningContent = document.querySelector("#japaneseListeningContent");
let japaneseListeningView = "menu";
let currentListeningIndex = 0;
let listeningQuizIndex = 0;
let listeningQuizCorrectCount = 0;
let listeningQuizAnswered = false;
let listeningQuizSelectedIndex = null;
let listeningQuizItems = [];

function normalizeJapaneseListeningView(view) {
  return ["menu", "practice", "quiz"].includes(view) ? view : "menu";
}

function cancelJapaneseListeningSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createListeningQuizItems() {
  return shuffleItems(JAPANESE_LISTENING_QUESTIONS).slice(0, Math.min(LISTENING_QUIZ_SIZE, JAPANESE_LISTENING_QUESTIONS.length));
}

function resetJapaneseListeningState({ resetPracticeIndex = false } = {}) {
  japaneseListeningView = "menu";
  currentJapaneseView = "listeningMenu";
  if (resetPracticeIndex) currentListeningIndex = 0;
  listeningQuizIndex = 0;
  listeningQuizCorrectCount = 0;
  listeningQuizAnswered = false;
  listeningQuizSelectedIndex = null;
  listeningQuizItems = [];
  cancelJapaneseListeningSpeech();
  if (japaneseListeningContent) {
    japaneseListeningContent.replaceChildren();
    japaneseListeningContent.hidden = true;
  }
}

function createListeningBackMenuButton() {
  const button = document.createElement("button");
  button.className = "secondary-button reading-back-menu-button listening-back-menu-button";
  button.type = "button";
  button.textContent = "返回聽力選單";
  button.addEventListener("click", () => {
    resetJapaneseListeningState();
    renderJapaneseListeningView("menu");
  });
  return button;
}

function setListeningContentNodes(...nodes) {
  cancelJapaneseListeningSpeech();
  if (!japaneseListeningContent) return;
  japaneseListeningContent.replaceChildren(...nodes);
  japaneseListeningContent.hidden = false;
}

function speakJapaneseListening(text, statusElement) {
  if (!statusElement) return;
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    statusElement.textContent = "此裝置可能不支援日文語音播放，請稍後再試或更換瀏覽器。";
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.86;
    utterance.pitch = 1;
    utterance.onerror = () => {
      statusElement.textContent = "此裝置可能不支援日文語音播放，請稍後再試或更換瀏覽器。";
    };
    utterance.onstart = () => { statusElement.textContent = "正在播放日文音訊…"; };
    utterance.onend = () => { statusElement.textContent = "播放完成，可再次播放。"; };
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    statusElement.textContent = "此裝置可能不支援日文語音播放，請稍後再試或更換瀏覽器。";
  }
}

function createListeningPlayButton(item, status) {
  const button = document.createElement("button");
  button.className = "answer-button listening-play-button";
  button.type = "button";
  button.textContent = "播放音訊";
  button.addEventListener("click", () => speakJapaneseListening(item.japanese, status));
  return button;
}

function renderJapaneseListeningMenu() {
  resetJapaneseListeningState();
  currentJapaneseView = "listeningMenu";
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = false;
}

function renderJapaneseListeningPractice() {
  listeningQuizIndex = 0;
  listeningQuizCorrectCount = 0;
  listeningQuizAnswered = false;
  listeningQuizSelectedIndex = null;
  currentJapaneseView = "listeningPractice";
  const item = JAPANESE_LISTENING_QUESTIONS[currentListeningIndex % JAPANESE_LISTENING_QUESTIONS.length];
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;
  const status = Object.assign(document.createElement("p"), { className: "status-message", textContent: "請按播放音訊，可重複播放。" });
  const title = Object.assign(document.createElement("h3"), { className: "reading-content-title", textContent: "聽力練習" });
  const card = document.createElement("article");
  card.className = "reading-card listening-card";
  card.innerHTML = `<div class="reading-card-header"><span class="card-number">${item.level}・${item.category}</span><h2>題目卡片</h2></div><p class="listening-japanese">${item.japanese}</p><p class="reading-kana listening-kana">${item.kana}</p><p class="reading-translation listening-translation">${item.zh}</p>`;
  card.insertBefore(createListeningPlayButton(item, status), card.children[1]);
  card.appendChild(status);
  const next = Object.assign(document.createElement("button"), { className: "secondary-button", type: "button", textContent: "下一題 / 換一題" });
  next.addEventListener("click", () => { currentListeningIndex = (currentListeningIndex + 1) % JAPANESE_LISTENING_QUESTIONS.length; renderJapaneseListeningPractice(); });
  setListeningContentNodes(createListeningBackMenuButton(), title, card, next);
}

function startJapaneseListeningQuiz() {
  listeningQuizIndex = 0;
  listeningQuizCorrectCount = 0;
  listeningQuizAnswered = false;
  listeningQuizSelectedIndex = null;
  listeningQuizItems = createListeningQuizItems();
  renderJapaneseListeningQuizQuestion();
}

function renderJapaneseListeningQuizQuestion() {
  currentJapaneseView = "listeningQuiz";
  const item = listeningQuizItems[listeningQuizIndex];
  if (!item) return renderJapaneseListeningQuizResults();
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;
  const status = Object.assign(document.createElement("p"), { className: "status-message", textContent: "請先聽音訊，再選擇中文意思。" });
  const title = Object.assign(document.createElement("h3"), { className: "reading-content-title", textContent: "聽力測驗" });
  const progress = Object.assign(document.createElement("p"), { className: "set-status", textContent: `第 ${listeningQuizIndex + 1} 題 / ${listeningQuizItems.length} 題` });
  const card = document.createElement("article");
  card.className = "quiz-card listening-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  prompt.innerHTML = `<p class="quiz-prompt-label">${item.question}</p>`;
  const options = document.createElement("div");
  options.className = "quiz-options";
  const feedback = Object.assign(document.createElement("div"), { className: "quiz-feedback", textContent: "" });
  const detail = document.createElement("div");
  detail.className = "reading-details listening-answer-details";
  detail.hidden = !listeningQuizAnswered;
  detail.innerHTML = `<p>正確答案：${item.options[item.answerIndex]}</p><p>日文句子：${item.japanese}</p><p>假名：${item.kana}</p><p>中文意思：${item.zh}</p>`;
  item.options.forEach((option, index) => {
    const button = Object.assign(document.createElement("button"), { className: "quiz-option", type: "button", textContent: option, disabled: listeningQuizAnswered });
    if (listeningQuizAnswered) {
      button.classList.toggle("is-correct", index === item.answerIndex);
      button.classList.toggle("is-wrong", index === listeningQuizSelectedIndex && index !== item.answerIndex);
    }
    button.addEventListener("click", () => {
      listeningQuizAnswered = true;
      listeningQuizSelectedIndex = index;
      if (index === item.answerIndex) listeningQuizCorrectCount += 1;
      else recordJapaneseMistake({ module: "listening", questionType: "listeningMeaning", itemId: item?.id, relatedId: item?.id, userAnswer: item?.options?.[index], correctAnswer: item?.options?.[item.answerIndex] });
      renderJapaneseListeningQuizQuestion();
    });
    options.appendChild(button);
  });
  if (listeningQuizAnswered) feedback.textContent = listeningQuizSelectedIndex === item.answerIndex ? "答對了！" : "答錯了，請查看正確答案。";
  card.append(createListeningPlayButton(item, status), status, prompt, options, feedback, detail);
  const nodes = [createListeningBackMenuButton(), title, progress, card];
  if (listeningQuizAnswered) {
    const next = Object.assign(document.createElement("button"), { className: "answer-button", type: "button", textContent: listeningQuizIndex + 1 >= listeningQuizItems.length ? "查看結果" : "下一題" });
    next.addEventListener("click", () => { listeningQuizIndex += 1; listeningQuizAnswered = false; listeningQuizSelectedIndex = null; renderJapaneseListeningQuizQuestion(); });
    nodes.push(next);
  }
  setListeningContentNodes(...nodes);
}

function renderJapaneseListeningQuizResults() {
  currentJapaneseView = "listeningQuiz";
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;
  const total = listeningQuizItems.length;
  const accuracy = Math.round((listeningQuizCorrectCount / total) * 100);
  const result = document.createElement("section");
  result.className = "reading-card listening-result-card";
  result.innerHTML = `<h3>聽力測驗完成</h3><p>總答題數：${total}</p><p>答對題數：${listeningQuizCorrectCount}</p><p>正確率：${accuracy}%</p>`;
  const restart = Object.assign(document.createElement("button"), { className: "answer-button", type: "button", textContent: "重新開始測驗" });
  restart.addEventListener("click", startJapaneseListeningQuiz);
  result.appendChild(restart);
  setListeningContentNodes(createListeningBackMenuButton(), result);
}

function renderJapaneseListeningView(view = japaneseListeningView) {
  japaneseListeningView = normalizeJapaneseListeningView(view);
  if (japaneseListeningView === "menu") return renderJapaneseListeningMenu();
  if (japaneseListeningView === "practice") return renderJapaneseListeningPractice();
  if (japaneseListeningView === "quiz") return startJapaneseListeningQuiz();
  return renderJapaneseListeningMenu();
}

function bindListeningModeButtons(listeningViewElement = document.querySelector("#japaneseListeningPanel")) {
  if (!listeningViewElement) return;
  japaneseListeningMenuView = listeningViewElement.querySelector("#japaneseListeningMenuView");
  japaneseListeningContent = listeningViewElement.querySelector("#japaneseListeningContent");
  listeningViewElement.querySelectorAll("[data-listening-mode]").forEach((button) => {
    if (button.dataset.listeningBound === "true") return;
    button.dataset.listeningBound = "true";
    button.addEventListener("click", () => renderJapaneseListeningView(button.dataset.listeningMode === "quiz" ? "quiz" : "practice"));
  });
}

function initializeListeningPanel() {
  bindListeningModeButtons();
  resetJapaneseListeningState({ resetPracticeIndex: true });
  renderJapaneseListeningView("menu");
}

window.LISTENING_QUIZ_SIZE = LISTENING_QUIZ_SIZE;
window.initializeListeningPanel = initializeListeningPanel;
window.renderJapaneseListeningView = renderJapaneseListeningView;
window.resetJapaneseListeningState = resetJapaneseListeningState;
