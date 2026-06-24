const VOCABULARY_CARD_COUNT = 10;
const GRAMMAR_CARD_COUNT = 5;
const VOCABULARY_URL = window.JAPANESE_VOCABULARY_URL || "vocabulary.json";
const GRAMMAR_URL = window.JAPANESE_GRAMMAR_URL || "grammar.json";

const JAPANESE_VOCAB_SEEN_COUNTS_KEY = "japanese_vocab_seen_counts";
const JAPANESE_GRAMMAR_SEEN_COUNTS_KEY = "japanese_grammar_seen_counts";

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
const japaneseMainContent = document.querySelector("#japaneseMainContent");
const japaneseReadingPanel = document.querySelector("#japaneseReadingPanel");
const japaneseListeningPanel = document.querySelector("#japaneseListeningPanel");
const japaneseTabButtons = document.querySelectorAll(".japanese-tab-button");
const modeButtons = document.querySelectorAll(".mode-button[data-mode-group]");
const modePanels = document.querySelectorAll("[data-mode-panel]");

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
let activeJapaneseTab = "vocab";
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

function updateModeButtonsForJapaneseTab() {
  modePanels.forEach((panel) => {
    panel.hidden = panel.dataset.modePanel !== activeJapaneseTab;
  });

  modeButtons.forEach((button) => {
    button.hidden = false;
  });
}

async function switchJapaneseTab(tab) {
  activeJapaneseTab = tab;

  japaneseTabButtons.forEach((button) => {
    const isActive = button.dataset.japaneseTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const isVocabOrGrammarTab = tab === "vocab" || tab === "grammar";
  japaneseMainContent.hidden = !isVocabOrGrammarTab;
  japaneseReadingPanel.hidden = tab !== "reading";
  japaneseListeningPanel.hidden = tab !== "listening";
  updateModeButtonsForJapaneseTab();

  if (tab === "vocab" && isGrammarMode()) {
    await switchMode("cards");
  } else if (tab === "grammar" && !isGrammarMode()) {
    await switchMode("grammar");
  } else if (tab === "reading" && typeof initializeReadingPanel === "function") {
    initializeReadingPanel();
  }
}

function isGrammarMode() {
  return activeMode === "grammar" || activeMode === "grammar-quiz";
}

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

function getWordsForCategory(category) {
  if (!category.matches) {
    return vocabulary;
  }

  return vocabulary.filter((word) => category.matches.includes(word.partOfSpeech));
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
  return PART_OF_SPEECH_GROUPS.find((group) => group.matches.includes(partOfSpeech))?.id ?? "other";
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
      <span class="card-number">單字 ${index + 1}</span>
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

async function switchMode(mode) {
  activeMode = mode;
  const isQuizModeValue = isQuizMode();
  const isWordQuizModeValue = activeMode === "quiz";
  const isGrammarModeValue = isGrammarMode();
  const isGrammarCardModeValue = activeMode === "grammar";
  const isGrammarQuizModeValue = isGrammarQuizMode();

  cardModeButton.classList.toggle("is-active", activeMode === "cards");
  cardModeButton.setAttribute("aria-pressed", String(activeMode === "cards"));
  quizModeButton.classList.toggle("is-active", isWordQuizModeValue);
  quizModeButton.setAttribute("aria-pressed", String(isWordQuizModeValue));
  grammarModeButton.classList.toggle("is-active", isGrammarCardModeValue);
  grammarModeButton.setAttribute("aria-pressed", String(isGrammarCardModeValue));
  grammarQuizModeButton.classList.toggle("is-active", isGrammarQuizModeValue);
  grammarQuizModeButton.setAttribute("aria-pressed", String(isGrammarQuizModeValue));
  updateModeButtonsForJapaneseTab();

  controlsPanel.hidden = isQuizModeValue;
  cardsContainer.hidden = isQuizModeValue;
  quizPanel.hidden = !isQuizModeValue;
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
    renderCategoryFilters();
    applyCategory(activeCategoryId);
  } catch (error) {
    console.error(error);
    renderStatus("目前無法載入單字資料，請確認 vocabulary.json 是否存在且格式正確。");
    wordSetStatus.textContent = "單字資料載入失敗。";
    categoryCount.textContent = "分類資料載入失敗。";
    toggleButton.disabled = true;
    shuffleButton.disabled = true;
    wordSearchInput.disabled = true;
    clearSearchButton.disabled = true;
    cardModeButton.disabled = true;
    quizModeButton.disabled = true;
    grammarModeButton.disabled = true;
    grammarQuizModeButton.disabled = true;
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
    grammarQuizModeButton.disabled = true;
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

cardModeButton.addEventListener("click", () => switchMode("cards"));
quizModeButton.addEventListener("click", () => switchMode("quiz"));
grammarModeButton.addEventListener("click", () => switchMode("grammar"));
grammarQuizModeButton.addEventListener("click", () => switchMode("grammar-quiz"));
nextQuizQuestionButton.addEventListener("click", createActiveQuizQuestion);
restartQuizButton.addEventListener("click", () => {
  confirmResetJapaneseQuizProgress(restartQuiz);
});
grammarMeaningQuizTypeButton.addEventListener("click", () => switchGrammarQuizType("meaning"));
grammarClozeQuizTypeButton.addEventListener("click", () => switchGrammarQuizType("cloze"));
japaneseTabButtons.forEach((button) => {
  button.addEventListener("click", () => switchJapaneseTab(button.dataset.japaneseTab));
});

clearSearchButton.disabled = true;
updateModeButtonsForJapaneseTab();
updateQuizStats();

loadVocabulary();

const JAPANESE_READING_SEEN_COUNTS_KEY = "japanese_reading_seen_counts";
const READING_QUIZ_SIZE = 10;
const readingPracticeModeButton = document.querySelector("#readingPracticeModeButton");
const readingQuizModeButton = document.querySelector("#readingQuizModeButton");
const readingContent = document.querySelector("#readingContent");
const japaneseReadingSets = Array.isArray(window.JAPANESE_READING_SETS)
  ? window.JAPANESE_READING_SETS
  : (Array.isArray(window.JAPANESE_READING_QUESTIONS) ? window.JAPANESE_READING_QUESTIONS : []);
let activeReadingMode = "practice";
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

function setReadingMode(mode) {
  activeReadingMode = mode;
  readingPracticeModeButton?.classList.toggle("is-active", mode === "practice");
  readingPracticeModeButton?.setAttribute("aria-pressed", String(mode === "practice"));
  readingQuizModeButton?.classList.toggle("is-active", mode === "quiz");
  readingQuizModeButton?.setAttribute("aria-pressed", String(mode === "quiz"));
  if (mode === "quiz") {
    startReadingQuiz();
  } else {
    showReadingPracticeQuestion();
  }
}

function renderReadingUnavailable() {
  readingContent.replaceChildren(Object.assign(document.createElement("p"), { className: "status-message", textContent: "目前無法載入閱讀題庫。" }));
}


function isJapaneseKanji(char) {
  return /[\u3400-\u9fff々〆ヵヶ]/u.test(char);
}

function toHiraganaReadingText(text) {
  return String(text ?? "")
    .replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/\s+/g, "");
}

function createRubyPartsFromKana(text, kana) {
  const source = String(text ?? "");
  const reading = toHiraganaReadingText(kana);
  if (!source || !reading) return [{ text: source }];
  const parts = [];
  let sourceIndex = 0;
  let readingIndex = 0;

  const pushText = (value) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && Object.prototype.hasOwnProperty.call(last, "text")) last.text += value;
    else parts.push({ text: value });
  };

  while (sourceIndex < source.length) {
    const char = source[sourceIndex];
    if (!isJapaneseKanji(char)) {
      pushText(char);
      const normalizedChar = toHiraganaReadingText(char);
      if (normalizedChar && reading.startsWith(normalizedChar, readingIndex)) {
        readingIndex += normalizedChar.length;
      }
      sourceIndex += 1;
      continue;
    }

    const kanjiStart = sourceIndex;
    while (sourceIndex < source.length && isJapaneseKanji(source[sourceIndex])) sourceIndex += 1;
    const base = source.slice(kanjiStart, sourceIndex);
    let nextLiteral = "";
    let lookAhead = sourceIndex;
    while (lookAhead < source.length && !isJapaneseKanji(source[lookAhead])) {
      nextLiteral += source[lookAhead];
      lookAhead += 1;
    }
    const normalizedNextLiteral = toHiraganaReadingText(nextLiteral);
    let ruby = "";
    if (normalizedNextLiteral) {
      const nextReadingIndex = reading.indexOf(normalizedNextLiteral, readingIndex);
      if (nextReadingIndex >= readingIndex) {
        ruby = reading.slice(readingIndex, nextReadingIndex);
        readingIndex = nextReadingIndex;
      }
    } else {
      ruby = reading.slice(readingIndex);
      readingIndex = reading.length;
    }

    if (ruby) parts.push({ base, ruby });
    else pushText(base);
  }

  return parts;
}

function createTitleRubyParts(readingSet) {
  const title = String(readingSet.title ?? "");
  if (!title) return [{ text: title }];

  const passage = String(readingSet.passage ?? "");
  const passageTitleIndex = passage.indexOf(title);
  if (passageTitleIndex >= 0) {
    const passageParts = createRubyPartsFromKana(readingSet.passage, readingSet.passageKana);
    const titleParts = [];
    let cursor = 0;
    const titleStart = passageTitleIndex;
    const titleEnd = titleStart + title.length;
    const pushText = (value) => {
      if (!value) return;
      const last = titleParts[titleParts.length - 1];
      if (last && Object.prototype.hasOwnProperty.call(last, "text")) last.text += value;
      else titleParts.push({ text: value });
    };

    passageParts.forEach((part) => {
      const value = part.base ?? part.text ?? "";
      const partStart = cursor;
      const partEnd = partStart + value.length;
      cursor = partEnd;
      if (partEnd <= titleStart || partStart >= titleEnd) return;
      const sliceStart = Math.max(titleStart, partStart) - partStart;
      const sliceEnd = Math.min(titleEnd, partEnd) - partStart;
      const slicedValue = value.slice(sliceStart, sliceEnd);
      if (part.base && part.ruby && sliceStart === 0 && sliceEnd === value.length) {
        titleParts.push({ base: slicedValue, ruby: part.ruby });
      } else {
        pushText(slicedValue);
      }
    });

    if (titleParts.some((part) => part.ruby)) return titleParts;
  }

  const vocabulary = Array.isArray(readingSet.vocabulary) ? readingSet.vocabulary : [];
  const parts = [];
  let index = 0;
  const pushText = (value) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && Object.prototype.hasOwnProperty.call(last, "text")) last.text += value;
    else parts.push({ text: value });
  };

  while (index < title.length) {
    const match = vocabulary
      .filter((item) => item.word && item.kana && title.startsWith(item.word, index))
      .sort((a, b) => b.word.length - a.word.length)[0];
    if (match) {
      parts.push({ base: match.word, ruby: match.kana });
      index += match.word.length;
    } else {
      pushText(title[index]);
      index += 1;
    }
  }
  return parts;
}


function createRubyPartsFromMarkup(markup, fallbackText = "") {
  const source = String(markup ?? "");
  if (!source) return [{ text: String(fallbackText ?? "") }];

  const parts = [];
  const pushText = (value) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && Object.prototype.hasOwnProperty.call(last, "text")) last.text += value;
    else parts.push({ text: value });
  };

  const rubyPattern = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
  let cursor = 0;
  let match;
  while ((match = rubyPattern.exec(source)) !== null) {
    pushText(source.slice(cursor, match.index));
    const base = match[1].replace(/<[^>]+>/g, "");
    const ruby = match[2].replace(/<[^>]+>/g, "");
    if (base && ruby) parts.push({ base, ruby });
    else pushText(base);
    cursor = match.index + match[0].length;
  }
  pushText(source.slice(cursor));

  return parts.length ? parts : [{ text: String(fallbackText ?? "") }];
}

function renderRubyParts(parent, parts) {
  parent.replaceChildren();
  parts.forEach((part) => {
    if (part.base && part.ruby) {
      const ruby = document.createElement("ruby");
      ruby.append(document.createTextNode(part.base));
      const rt = document.createElement("rt");
      rt.textContent = part.ruby;
      ruby.appendChild(rt);
      parent.appendChild(ruby);
    } else {
      parent.append(document.createTextNode(part.text ?? ""));
    }
  });
}

function getReadingTitleRubyParts(readingSet) {
  return readingSet.titleRubyParts ?? createRubyPartsFromMarkup(readingSet.titleRuby ?? readingSet.title, readingSet.title);
}

function getReadingPassageRubyParts(readingSet) {
  return readingSet.passageRubyParts ?? createRubyPartsFromMarkup(readingSet.passageRuby ?? readingSet.passage, readingSet.passage);
}

function createReadingMeta(readingSet) {
  const details = document.createElement("div");
  details.className = "reading-details";
  details.innerHTML = `
    <section><h4>文章假名</h4><p class="reading-kana">${readingSet.passageKana}</p></section>
    <section><h4>重要單字</h4><ul>${readingSet.vocabulary.map((item) => `<li><strong>${item.word}</strong>（${item.kana}）：${item.meaning}</li>`).join("")}</ul></section>
    <section><h4>文法重點</h4><ul>${readingSet.grammarPoints.map((point) => `<li>${point}</li>`).join("")}</ul></section>
  `;
  return details;
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
  if (showRuby) renderRubyParts(title, getReadingTitleRubyParts(readingSet));
  else title.textContent = readingSet.title;
  header.append(meta, title);

  const passage = document.createElement("p");
  passage.className = "reading-passage";
  if (showRuby) renderRubyParts(passage, getReadingPassageRubyParts(readingSet));
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
      button.textContent = option;
      button.addEventListener("click", () => onAnswer?.(questionIndex, optionIndex, optionButtons, feedback));
      if (selectedAnswers[question.id] !== undefined || reveal) {
        button.disabled = true;
        if (showFeedback || reveal) {
          button.classList.toggle("is-correct", optionIndex === question.answerIndex);
          button.classList.toggle("is-wrong", selectedAnswers[question.id] === optionIndex && optionIndex !== question.answerIndex);
        }
      }
      return button;
    });
    const selectedAnswer = selectedAnswers[question.id];
    if ((showFeedback && selectedAnswer !== undefined) || reveal) {
      const correct = selectedAnswer === question.answerIndex;
      feedback.classList.add(correct ? "is-correct" : "is-wrong");
      feedback.innerHTML = `<strong>${correct ? "答對了！" : `答錯了，正確答案是：${question.options[question.answerIndex]}`}</strong><p class="reading-explanation">解析：${question.explanation}</p>`;
    }
    const options = document.createElement("div");
    options.className = "quiz-options reading-options";
    options.replaceChildren(...optionButtons);
    questionBlock.innerHTML = `<p class="reading-question">第 ${questionIndex + 1} 題：${question.question}</p>`;
    questionBlock.append(options, feedback);
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
  const card = createReadingSetCard(currentReadingSet, { showFeedback: true, onAnswer: handleReadingPracticeAnswer, showRuby: true });
  const next = document.createElement("button");
  next.className = "answer-button";
  next.type = "button";
  next.textContent = "換一篇閱讀";
  next.addEventListener("click", showReadingPracticeQuestion);
  readingContent.replaceChildren(card, next);
}

function handleReadingPracticeAnswer(questionIndex, selectedIndex, optionButtons, feedback) {
  if (!currentReadingSet) return;
  const question = currentReadingSet.questions[questionIndex];
  if (!question || readingPracticeAnswers[question.id] !== undefined) return;
  readingPracticeAnswers[question.id] = selectedIndex;
  const correct = selectedIndex === question.answerIndex;
  feedback.classList.add(correct ? "is-correct" : "is-wrong");
  feedback.innerHTML = `<strong>${correct ? "答對了！" : `答錯了，正確答案是：${question.options[question.answerIndex]}`}</strong><p class="reading-explanation">解析：${question.explanation}</p>`;
  optionButtons.forEach((button, index) => {
    button.disabled = true;
    button.classList.toggle("is-correct", index === question.answerIndex);
    button.classList.toggle("is-wrong", index === selectedIndex && !correct);
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
  const status = document.createElement("p");
  status.className = "set-status reading-quiz-status";
  status.textContent = `閱讀測驗 第 ${currentReadingQuizSetIndex + 1} 篇（${answeredInPreviousSets + 1}～${answeredInPreviousSets + readingSet.questions.length} / ${readingQuizItems.length} 題）`;
  const selectedAnswers = {};
  readingSet.questions.forEach((question, questionIndex) => {
    const answer = readingQuizAnswers[answeredInPreviousSets + questionIndex];
    if (answer !== undefined) selectedAnswers[question.id] = answer;
  });
  const card = createReadingSetCard(readingSet, { selectedAnswers, onAnswer: (questionIndex, selectedIndex) => {
    readingQuizAnswers[answeredInPreviousSets + questionIndex] = selectedIndex;
    if (readingSet.questions.every((_question, index) => readingQuizAnswers[answeredInPreviousSets + index] !== undefined)) {
      currentReadingQuizSetIndex += 1;
      renderReadingQuizQuestion();
    } else {
      renderReadingQuizQuestion();
    }
  }});
  readingContent.replaceChildren(status, card);
}

function renderReadingQuizResults() {
  const correctCount = readingQuizItems.filter((item, i) => readingQuizAnswers[i] === item.question.answerIndex).length;
  const result = document.createElement("article");
  result.className = "reading-card reading-result-card";
  result.innerHTML = `<h2>測驗完成</h2><p class="reading-score">總分：${correctCount} / ${readingQuizItems.length}</p>`;
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
  list.innerHTML = groupedItems.map(({ readingSet, items }) => `<section class="reading-result-item"><h3>${readingSet.title}</h3>${items.map(({ question, answer, index }) => `<div class="reading-result-question"><p>第 ${index + 1} 題：${question.question}</p><p>你的答案：${question.options[answer] ?? "未作答"}</p><p>正確答案：${question.options[question.answerIndex]}</p><p>${answer === question.answerIndex ? "答對" : "答錯"}</p><p>解析：${question.explanation}</p></div>`).join("")}</section>`).join("");
  const restart = document.createElement("button");
  restart.className = "answer-button";
  restart.type = "button";
  restart.textContent = "重新開始閱讀測驗";
  restart.addEventListener("click", startReadingQuiz);
  result.append(list, restart);
  readingContent.replaceChildren(result);
}

readingPracticeModeButton?.addEventListener("click", () => setReadingMode("practice"));
readingQuizModeButton?.addEventListener("click", () => setReadingMode("quiz"));

let readingPanelInitialized = false;
function initializeReadingPanel() {
  if (readingPanelInitialized) { return; }
  readingPanelInitialized = true;
  setReadingMode("practice");
}
