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
const japaneseVocabularyMenuView = document.querySelector("#japaneseVocabularyMenuView");
const japaneseVocabularyStudyView = document.querySelector("#japaneseVocabularyStudyView");
const japaneseVocabularyEntryButtons = document.querySelectorAll("[data-japanese-vocabulary-entry]");
const japaneseGrammarMenuView = document.querySelector("#japaneseGrammarMenuView");
const japaneseGrammarEntryButtons = document.querySelectorAll("[data-japanese-grammar-entry]");
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
  if (["home", "vocabulary", "grammar", "reading", "listening", "listeningMenu", "listeningPractice", "listeningQuiz"].includes(view)) return view;
  return "home";
}

function getJapaneseViewElement(view) {
  if (view === "home") return japaneseHomeContent;
  if (view === "vocabulary" || view === "grammar") return japaneseMainContent;
  if (view === "reading") return japaneseReadingPanel;
  if (["listening", "listeningMenu", "listeningPractice", "listeningQuiz"].includes(view)) return japaneseListeningPanel;
  return japaneseHomeContent;
}

function renderJapaneseView(view) {
  const normalizedView = normalizeJapaneseView(view);
  const nextView = getJapaneseViewElement(normalizedView) ? normalizedView : "home";
  const panelView = ["listeningMenu", "listeningPractice", "listeningQuiz"].includes(nextView) ? "listening" : nextView;
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
  }
}

window.showJapaneseContentView = switchJapaneseTab;

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

function normalizeJapaneseVocabularyView(view) {
  if (view === "study" || view === "cards") return "practice";
  if (["menu", "practice", "quiz"].includes(view)) return view;
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
  if (["menu", "practice", "quiz"].includes(view)) return view;
  return "menu";
}

function renderJapaneseGrammarView(view = japaneseGrammarView) {
  japaneseGrammarView = normalizeJapaneseGrammarView(view);
  const isMenuView = japaneseGrammarView === "menu";
  const isPracticeView = japaneseGrammarView === "practice";
  const isQuizView = japaneseGrammarView === "quiz";

  if (japaneseVocabularyMenuView && currentJapaneseView === "grammar") {
    japaneseVocabularyMenuView.hidden = true;
  }

  if (japaneseGrammarMenuView) {
    japaneseGrammarMenuView.hidden = currentJapaneseView !== "grammar" || !isMenuView;
  }

  if (japaneseVocabularyStudyView) {
    japaneseVocabularyStudyView.hidden = currentJapaneseView === "grammar" ? !isPracticeView : japaneseVocabularyStudyView.hidden;
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
  if (["menu", "practice", "quiz"].includes(view)) return view;
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

function renderRubyParts(parent, parts) {
  parent.replaceChildren();
  parts.forEach((part) => {
    if (part.base && part.ruby) {
      const ruby = document.createElement("span");
      ruby.className = "jp-ruby";
      ruby.setAttribute("role", "text");
      ruby.setAttribute("aria-label", `${part.base}（${part.ruby}）`);

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
  });
}

function renderRubyText(parent, text, rubyTerms) {
  renderRubyParts(parent, createRubyPartsFromTerms(text, rubyTerms));
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
  if (showRuby) renderRubyText(title, readingSet.title, getReadingRubyTerms(readingSet));
  else title.textContent = readingSet.title;
  header.append(meta, title);

  const passage = document.createElement("p");
  passage.className = "reading-passage";
  if (showRuby) renderRubyText(passage, readingSet.passage, getReadingRubyTerms(readingSet));
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
  { id: "jl-001", level: "N5", category: "日常", japanese: "今日は雨です。", kana: "きょうは あめです。", zh: "今天下雨。", question: "這句日文的意思是什麼？", options: ["今天下雨。", "明天放晴。", "今天很熱。", "昨天很冷。"], answerIndex: 0 },
  { id: "jl-002", level: "N5", category: "交通", japanese: "駅まで歩いて行きます。", kana: "えきまで あるいて いきます。", zh: "我走路去車站。", question: "這句日文的意思是什麼？", options: ["我坐車去學校。", "我走路去車站。", "我在車站等朋友。", "我騎腳踏車回家。"], answerIndex: 1 },
  { id: "jl-003", level: "N5", category: "餐廳", japanese: "水を一杯ください。", kana: "みずを いっぱい ください。", zh: "請給我一杯水。", question: "這句日文的意思是什麼？", options: ["請給我一杯水。", "請給我一杯茶。", "請給我菜單。", "請再說一次。"], answerIndex: 0 },
  { id: "jl-004", level: "N5", category: "學校", japanese: "明日は学校へ行きません。", kana: "あしたは がっこうへ いきません。", zh: "明天不去學校。", question: "這句日文的意思是什麼？", options: ["今天要去學校。", "明天不去學校。", "昨天沒去公司。", "明天要去圖書館。"], answerIndex: 1 },
  { id: "jl-005", level: "N5", category: "交通", japanese: "この電車は東京へ行きますか。", kana: "この でんしゃは とうきょうへ いきますか。", zh: "這班電車會去東京嗎？", question: "這句日文的意思是什麼？", options: ["這班巴士幾點來？", "這班電車會去東京嗎？", "東京車站在哪裡？", "我想買電車票。"], answerIndex: 1 },
  { id: "jl-006", level: "N5", category: "日常", japanese: "昨日、友だちと映画を見ました。", kana: "きのう、ともだちと えいがを みました。", zh: "昨天和朋友看了電影。", question: "這句日文的意思是什麼？", options: ["昨天和朋友看了電影。", "今天和家人吃飯。", "明天想去看電影。", "昨天在家讀書。"], answerIndex: 0 },
  { id: "jl-007", level: "N5", category: "日常", japanese: "すみません、トイレはどこですか。", kana: "すみません、トイレは どこですか。", zh: "不好意思，廁所在哪裡？", question: "這句日文的意思是什麼？", options: ["不好意思，車站在哪裡？", "不好意思，廁所在哪裡？", "請問現在幾點？", "請問這個多少錢？"], answerIndex: 1 },
  { id: "jl-008", level: "N4", category: "日常", japanese: "朝ごはんを食べてから、会社へ行きます。", kana: "あさごはんを たべてから、かいしゃへ いきます。", zh: "吃完早餐後去公司。", question: "這句日文的意思是什麼？", options: ["吃完早餐後去公司。", "下班後去吃晚餐。", "沒吃早餐就去學校。", "吃完午餐後回家。"], answerIndex: 0 },
  { id: "jl-009", level: "N5", category: "日常", japanese: "もう一度言ってください。", kana: "もういちど いってください。", zh: "請再說一次。", question: "這句日文的意思是什麼？", options: ["請慢慢寫。", "請再說一次。", "請等一下。", "請看這裡。"], answerIndex: 1 },
  { id: "jl-010", level: "N5", category: "時間", japanese: "バスは十時に来ます。", kana: "バスは じゅうじに きます。", zh: "公車十點會來。", question: "這句日文的意思是什麼？", options: ["電車九點出發。", "公車十點會來。", "朋友十點回家。", "學校八點開始。"], answerIndex: 1 },
];

let japaneseListeningMenuView = document.querySelector("#japaneseListeningMenuView");
let japaneseListeningContent = document.querySelector("#japaneseListeningContent");
let japaneseListeningView = "menu";
let currentListeningIndex = 0;
let listeningQuizIndex = 0;
let listeningQuizCorrectCount = 0;
let listeningQuizAnswered = false;
let listeningQuizSelectedIndex = null;

function normalizeJapaneseListeningView(view) {
  return ["menu", "practice", "quiz"].includes(view) ? view : "menu";
}

function createListeningBackMenuButton() {
  const button = document.createElement("button");
  button.className = "secondary-button reading-back-menu-button listening-back-menu-button";
  button.type = "button";
  button.textContent = "返回聽力選單";
  button.addEventListener("click", () => renderJapaneseListeningView("menu"));
  return button;
}

function setListeningContentNodes(...nodes) {
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
  currentJapaneseView = "listeningMenu";
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = false;
  if (japaneseListeningContent) {
    japaneseListeningContent.replaceChildren();
    japaneseListeningContent.hidden = true;
  }
}

function renderJapaneseListeningPractice() {
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
  renderJapaneseListeningQuizQuestion();
}

function renderJapaneseListeningQuizQuestion() {
  currentJapaneseView = "listeningQuiz";
  const item = JAPANESE_LISTENING_QUESTIONS[listeningQuizIndex];
  if (!item) return renderJapaneseListeningQuizResults();
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;
  const status = Object.assign(document.createElement("p"), { className: "status-message", textContent: "請先聽音訊，再選擇中文意思。" });
  const title = Object.assign(document.createElement("h3"), { className: "reading-content-title", textContent: "聽力測驗" });
  const progress = Object.assign(document.createElement("p"), { className: "set-status", textContent: `第 ${listeningQuizIndex + 1} 題 / ${JAPANESE_LISTENING_QUESTIONS.length} 題` });
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
      renderJapaneseListeningQuizQuestion();
    });
    options.appendChild(button);
  });
  if (listeningQuizAnswered) feedback.textContent = listeningQuizSelectedIndex === item.answerIndex ? "答對了！" : "答錯了，請查看正確答案。";
  card.append(createListeningPlayButton(item, status), status, prompt, options, feedback, detail);
  const nodes = [createListeningBackMenuButton(), title, progress, card];
  if (listeningQuizAnswered) {
    const next = Object.assign(document.createElement("button"), { className: "answer-button", type: "button", textContent: listeningQuizIndex + 1 >= JAPANESE_LISTENING_QUESTIONS.length ? "查看結果" : "下一題" });
    next.addEventListener("click", () => { listeningQuizIndex += 1; listeningQuizAnswered = false; listeningQuizSelectedIndex = null; renderJapaneseListeningQuizQuestion(); });
    nodes.push(next);
  }
  setListeningContentNodes(...nodes);
}

function renderJapaneseListeningQuizResults() {
  currentJapaneseView = "listeningQuiz";
  if (japaneseListeningMenuView) japaneseListeningMenuView.hidden = true;
  const total = JAPANESE_LISTENING_QUESTIONS.length;
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
  startJapaneseListeningQuiz();
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
  renderJapaneseListeningView("menu");
}

window.JAPANESE_LISTENING_QUESTIONS = JAPANESE_LISTENING_QUESTIONS;
window.initializeListeningPanel = initializeListeningPanel;
window.renderJapaneseListeningView = renderJapaneseListeningView;
