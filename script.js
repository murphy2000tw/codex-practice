const CARD_COUNT = 10;
const VOCABULARY_URL = "vocabulary.json";
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
const toggleButton = document.querySelector("#toggleAnswers");
const shuffleButton = document.querySelector("#shuffleWords");
const wordSetStatus = document.querySelector("#wordSetStatus");
const wordSearchInput = document.querySelector("#wordSearch");
const clearSearchButton = document.querySelector("#clearSearch");
const cardModeButton = document.querySelector("#cardModeButton");
const quizModeButton = document.querySelector("#quizModeButton");
const controlsPanel = document.querySelector(".controls");
const quizPanel = document.querySelector("#quizPanel");
const quizContent = document.querySelector("#quizContent");
const nextQuizQuestionButton = document.querySelector("#nextQuizQuestion");
const restartQuizButton = document.querySelector("#restartQuiz");
const quizAnsweredCount = document.querySelector("#quizAnsweredCount");
const quizCorrectCount = document.querySelector("#quizCorrectCount");
const quizAccuracy = document.querySelector("#quizAccuracy");

let vocabulary = [];
let filteredVocabulary = [];
let wordDeck = [];
let currentWords = [];
let previousWordIds = new Set();
let answersVisible = false;
let currentGroupNumber = 0;
let reshuffleNotice = "";
let activeCategoryId = "all";
let activeLevelId = "all";
let searchQuery = "";
let activeMode = "cards";
let currentQuizQuestion = null;
let quizAnsweredCountValue = 0;
let quizCorrectCountValue = 0;
let quizHasAnsweredCurrentQuestion = false;

function getActiveCategory() {
  return CATEGORY_FILTERS.find((category) => category.id === activeCategoryId) ?? CATEGORY_FILTERS[0];
}

function getActiveLevel() {
  return LEVEL_FILTERS.find((level) => level.id === activeLevelId) ?? LEVEL_FILTERS[0];
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

function getFilteredVocabulary() {
  return getWordsForActiveFilters().filter((word) => wordMatchesSearch(word, searchQuery));
}

function shuffleWords(words) {
  const shuffledWords = [...words];

  for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledWords[index], shuffledWords[randomIndex]] = [shuffledWords[randomIndex], shuffledWords[index]];
  }

  return shuffledWords;
}

function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

function getPartOfSpeechGroup(partOfSpeech) {
  return PART_OF_SPEECH_GROUPS.find((group) => group.matches.includes(partOfSpeech))?.id ?? "other";
}

function hasSamePartOfSpeechGroup(word, referenceWord) {
  return getPartOfSpeechGroup(word.partOfSpeech) === getPartOfSpeechGroup(referenceWord.partOfSpeech);
}

function getQuizOptionCandidates(words, questionWord, usedMeanings, usedWordIds) {
  return shuffleWords(words).filter((word) => {
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

function updateQuizStats() {
  const accuracy = quizAnsweredCountValue === 0
    ? 0
    : Math.round((quizCorrectCountValue / quizAnsweredCountValue) * 100);

  quizAnsweredCount.textContent = String(quizAnsweredCountValue);
  quizCorrectCount.textContent = String(quizCorrectCountValue);
  quizAccuracy.textContent = `${accuracy}%`;
}

function resetQuizStats() {
  quizAnsweredCountValue = 0;
  quizCorrectCountValue = 0;
  updateQuizStats();
}

function getTotalGroups() {
  return Math.max(1, Math.ceil(filteredVocabulary.length / CARD_COUNT));
}

function buildFreshDeck() {
  const shuffledVocabulary = shuffleWords(filteredVocabulary);

  if (previousWordIds.size === 0) {
    return shuffledVocabulary;
  }

  const wordsNotInPreviousSet = shuffledVocabulary.filter((word) => !previousWordIds.has(word.id));
  const wordsInPreviousSet = shuffledVocabulary.filter((word) => previousWordIds.has(word.id));

  return [...wordsNotInPreviousSet, ...wordsInPreviousSet];
}

function resetDeck() {
  wordDeck = buildFreshDeck();
  currentGroupNumber = 0;
  reshuffleNotice = "";
}

function refreshDeckIfNeeded() {
  if (wordDeck.length > 0) {
    reshuffleNotice = "";
    return;
  }

  wordDeck = buildFreshDeck();
  currentGroupNumber = 0;
  reshuffleNotice = "已重新洗牌。";
}

function getNextWordSet() {
  refreshDeckIfNeeded();

  const cardsToShow = Math.min(CARD_COUNT, wordDeck.length);
  const nextWords = wordDeck.slice(0, cardsToShow);
  wordDeck = wordDeck.slice(cardsToShow);
  currentGroupNumber += 1;

  return nextWords;
}

function createDetailRow(label, value) {
  return `
    <div class="answer-row">
      <span>${label}</span>
      <strong>${value}</strong>
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

function renderCards(words) {
  const cards = words.map((word, index) => createCard(word, index));
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

  const questionWord = getRandomWord(filteredVocabulary);
  const wrongOptions = createWrongQuizOptions(questionWord);

  if (wrongOptions.length < 3) {
    currentQuizQuestion = null;
    quizHasAnsweredCurrentQuestion = false;
    renderQuizStatus("目前可用的選項不足 4 個，請調整分類或搜尋條件。");
    return;
  }

  const options = shuffleWords([
    { meaning: questionWord.meaning, isCorrect: true },
    ...wrongOptions,
  ]);

  currentQuizQuestion = {
    word: questionWord,
    options,
  };
  quizHasAnsweredCurrentQuestion = false;
  nextQuizQuestionButton.hidden = true;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (!currentQuizQuestion) {
    return;
  }

  const question = document.createElement("article");
  question.className = "quiz-card";

  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  prompt.innerHTML = `
    <p class="quiz-prompt-label">這個單字的中文意思是？</p>
    <h3 class="japanese-word">${currentQuizQuestion.word.word}</h3>
    <p class="kana">${currentQuizQuestion.word.kana}</p>
  `;

  const optionsGroup = document.createElement("div");
  optionsGroup.className = "quiz-options";
  optionsGroup.setAttribute("role", "group");
  optionsGroup.setAttribute("aria-label", "測驗選項");

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  const optionButtons = currentQuizQuestion.options.map((option) => {
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
  if (quizHasAnsweredCurrentQuestion || !currentQuizQuestion) {
    return;
  }

  quizHasAnsweredCurrentQuestion = true;
  quizAnsweredCountValue += 1;

  if (selectedOption.isCorrect) {
    quizCorrectCountValue += 1;
    feedback.textContent = "答對了！";
    feedback.classList.add("is-correct");
  } else {
    feedback.textContent = `答錯了，正確答案是：${currentQuizQuestion.word.meaning}`;
    feedback.classList.add("is-wrong");
  }

  optionButtons.forEach((button, index) => {
    const option = currentQuizQuestion.options[index];
    button.disabled = true;
    button.classList.toggle("is-correct", option.isCorrect);
    button.classList.toggle("is-wrong", button.textContent === selectedOption.meaning && !selectedOption.isCorrect);
  });

  updateQuizStats();
  nextQuizQuestionButton.hidden = false;
}

function restartQuiz() {
  resetQuizStats();
  createQuizQuestion();
}

function switchMode(mode) {
  activeMode = mode;
  const isQuizMode = activeMode === "quiz";

  cardModeButton.classList.toggle("is-active", !isQuizMode);
  cardModeButton.setAttribute("aria-pressed", String(!isQuizMode));
  quizModeButton.classList.toggle("is-active", isQuizMode);
  quizModeButton.setAttribute("aria-pressed", String(isQuizMode));

  controlsPanel.hidden = isQuizMode;
  cardsContainer.hidden = isQuizMode;
  quizPanel.hidden = !isQuizMode;

  if (isQuizMode) {
    createQuizQuestion();
  } else {
    updateWordSetStatus();
    updateAnswersVisibility();
  }
}

function updateCategoryCount() {
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
    const isActive = button.dataset.categoryId === activeCategoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  levelFilters.querySelectorAll(".filter-button").forEach((button) => {
    const isActive = button.dataset.levelId === activeLevelId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateWordSetStatus() {
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
  previousWordIds = new Set(currentWords.map((word) => word.id));
  renderCards(currentWords);
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
    createQuizQuestion();
  } else {
    showNewWordSet();
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

function applySearch(query) {
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
    nextQuizQuestionButton.disabled = true;
    restartQuizButton.disabled = true;
  }
}

toggleButton.addEventListener("click", () => {
  answersVisible = !answersVisible;
  updateAnswersVisibility();
});

shuffleButton.addEventListener("click", showNewWordSet);

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
nextQuizQuestionButton.addEventListener("click", createQuizQuestion);
restartQuizButton.addEventListener("click", restartQuiz);

clearSearchButton.disabled = true;
updateQuizStats();

loadVocabulary();
