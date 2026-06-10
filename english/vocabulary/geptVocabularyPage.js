const vocabularyCard = document.querySelector("#vocabularyCard");
const currentProgress = document.querySelector("#currentProgress");
const previousWordButton = document.querySelector("#previousWord");
const nextWordButton = document.querySelector("#nextWord");
const toggleChineseButton = document.querySelector("#toggleChinese");
const reshuffleVocabularyButton = document.querySelector("#reshuffleVocabulary");
const categoryFilters = document.querySelector("#geptCategoryFilters");
const vocabularySearchInput = document.querySelector("#geptVocabularySearch");
const clearSearchButton = document.querySelector("#clearGeptSearch");
const randomStatus = document.querySelector("#geptRandomStatus");
const cardModeButton = document.querySelector("#geptCardModeButton");
const quizModeButton = document.querySelector("#geptQuizModeButton");
const quizPanel = document.querySelector("#geptQuizPanel");
const quizContent = document.querySelector("#geptQuizContent");
const quizTitle = document.querySelector("#geptQuizTitle");
const quizTypeButtons = document.querySelectorAll("[data-gept-quiz-type]");
const quizScore = document.querySelector("#geptQuizScore");
const quizProgress = document.querySelector("#geptQuizProgress");
const wrongQuestionCount = document.querySelector("#geptWrongQuestionCount");
const reviewWrongQuestionsButton = document.querySelector("#reviewGeptWrongQuestions");
const returnQuizButton = document.querySelector("#returnGeptQuiz");
const clearWrongQuestionsButton = document.querySelector("#clearGeptWrongQuestions");
const nextQuizQuestionButton = document.querySelector("#nextGeptQuizQuestion");
const reshuffleQuizVocabularyButton = document.querySelector("#reshuffleGeptQuizVocabulary");
const vocabularyControls = document.querySelector("#geptVocabularyControls");
const vocabularyTotalText = document.querySelector("#geptVocabularyTotalText");
const vocabularyTotalInline = document.querySelector("#geptVocabularyTotalInline");
const vocabularyTotalValue = document.querySelector("#geptVocabularyTotalValue");
const englishProgressTotal = document.querySelector("#englishProgressTotal");
const englishProgressKnown = document.querySelector("#englishProgressKnown");
const englishProgressLearning = document.querySelector("#englishProgressLearning");
const englishProgressNew = document.querySelector("#englishProgressNew");
const englishProgressCompletion = document.querySelector("#englishProgressCompletion");
const englishProgressFilters = document.querySelector("#englishProgressFilters");
const resetEnglishProgressButton = document.querySelector("#resetEnglishProgress");
const vocabulary = Array.isArray(geptVocabulary) ? geptVocabulary : [];
const allCategoriesLabel = "全部";
const allLevelsLabel = "全部級數";
const availableLevels = [allLevelsLabel, "初級", "中級", "中高級"];
const STORAGE_KEY = "englishVocabProgress_v1";
const progressVersion = 1;
const progressStatusAll = "all";
const progressStatusNew = "new";
const progressStatusLearning = "learning";
const progressStatusKnown = "known";
const progressStatusLabels = {
  [progressStatusNew]: "尚未學習",
  [progressStatusLearning]: "學習中",
  [progressStatusKnown]: "已熟悉",
};
const progressFilterOptions = [
  { status: progressStatusAll, label: "全部" },
  { status: progressStatusNew, label: progressStatusLabels[progressStatusNew] },
  { status: progressStatusLearning, label: progressStatusLabels[progressStatusLearning] },
  { status: progressStatusKnown, label: progressStatusLabels[progressStatusKnown] },
];
const cardMode = "card";
const quizMode = "quiz";
const englishToChineseQuizType = "english-to-chinese";
const chineseToEnglishQuizType = "chinese-to-english";
const quizTypeSettings = {
  [englishToChineseQuizType]: {
    title: "看英文選中文",
    promptField: "word",
    answerField: "meaning",
    instruction: "請選出正確中文意思：",
  },
  [chineseToEnglishQuizType]: {
    title: "看中文選英文",
    promptField: "meaning",
    answerField: "word",
    instruction: "請選出正確英文單字：",
  },
};

let currentMode = cardMode;
let currentWordIndex = 0;
let chineseVisible = false;
let selectedCategory = allCategoriesLabel;
let selectedLevel = allLevelsLabel;
let selectedProgressStatus = progressStatusAll;
let searchQuery = "";
let categoryVocabulary = [];
let filteredVocabulary = [];
let quizQuestionIndex = 0;
let quizCorrectCount = 0;
let quizAnsweredCount = 0;
let quizAnsweredCurrentQuestion = false;
let quizCurrentOptions = [];
let quizCurrentQuestionRemoved = false;
let currentQuizType = englishToChineseQuizType;
let wrongQuestions = [];
let wrongReviewQuestions = [];
let isWrongReviewMode = false;
let englishVocabProgress = loadEnglishVocabProgress();

function createEmptyEnglishVocabProgress() {
  return {
    version: progressVersion,
    updatedAt: new Date().toISOString(),
    words: {},
  };
}

function canUseLocalStorage() {
  try {
    const testKey = `${STORAGE_KEY}_test`;
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function loadEnglishVocabProgress() {
  const emptyProgress = createEmptyEnglishVocabProgress();

  if (!canUseLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(STORAGE_KEY);

    if (!storedProgress) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);

    if (
      !parsedProgress
      || parsedProgress.version !== progressVersion
      || typeof parsedProgress.words !== "object"
      || Array.isArray(parsedProgress.words)
    ) {
      throw new Error("Invalid English vocabulary progress data");
    }

    return {
      version: progressVersion,
      updatedAt: parsedProgress.updatedAt || emptyProgress.updatedAt,
      words: parsedProgress.words,
    };
  } catch (error) {
    saveEnglishVocabProgress(emptyProgress);
    return emptyProgress;
  }
}

function saveEnglishVocabProgress(progress) {
  progress.updatedAt = new Date().toISOString();

  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    // Progress is optional; the page should keep working even if saving fails.
  }
}

function getWordKey(wordId, wordText) {
  return String(wordId || wordText || "").trim();
}

function getWordProgress(wordId, wordText) {
  const wordKey = getWordKey(wordId, wordText);
  const savedProgress = englishVocabProgress.words[wordKey];

  if (savedProgress && progressStatusLabels[savedProgress.status]) {
    return savedProgress;
  }

  return {
    word: wordText || wordKey,
    status: progressStatusNew,
    studyCount: 0,
    correctCount: 0,
    wrongCount: 0,
    firstStudiedAt: null,
    lastStudiedAt: null,
  };
}

function markWordProgress(wordId, wordText, status) {
  const wordKey = getWordKey(wordId, wordText);

  if (!wordKey) {
    return;
  }

  const currentProgress = getWordProgress(wordId, wordText);
  const studiedAt = new Date().toISOString();
  const nextProgress = {
    ...currentProgress,
    word: wordText || currentProgress.word || wordKey,
    status,
    studyCount: (currentProgress.studyCount || 0) + 1,
    correctCount: currentProgress.correctCount || 0,
    wrongCount: currentProgress.wrongCount || 0,
    firstStudiedAt: currentProgress.firstStudiedAt || studiedAt,
    lastStudiedAt: studiedAt,
  };

  if (status === progressStatusKnown) {
    nextProgress.correctCount += 1;
  }

  if (status === progressStatusLearning) {
    nextProgress.wrongCount += 1;
  }

  englishVocabProgress.words[wordKey] = nextProgress;
  saveEnglishVocabProgress(englishVocabProgress);
}

function markWordKnown(wordId, wordText) {
  markWordProgress(wordId, wordText, progressStatusKnown);
}

function markWordLearning(wordId, wordText) {
  markWordProgress(wordId, wordText, progressStatusLearning);
}

function resetEnglishVocabProgress() {
  englishVocabProgress = createEmptyEnglishVocabProgress();

  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Reset is optional; keep the page usable if storage access fails.
  }
}

function getVocabularyWordKey(word) {
  return getWordKey(word.id, word.word);
}

function getVocabularyWordStatus(word) {
  return getWordProgress(word.id, word.word).status;
}

function wordMatchesProgressFilter(word) {
  return selectedProgressStatus === progressStatusAll || getVocabularyWordStatus(word) === selectedProgressStatus;
}

function renderVocabularyTotalText() {
  const totalText = `${vocabulary.length} 個 GEPT 初級單字`;

  if (vocabularyTotalText) {
    vocabularyTotalText.textContent = totalText;
  }

  if (vocabularyTotalInline) {
    vocabularyTotalInline.textContent = totalText;
  }

  if (vocabularyTotalValue) {
    vocabularyTotalValue.textContent = vocabulary.length;
  }
}

function getAvailableCategories() {
  return [...new Set(vocabulary.map((word) => word.category).filter(Boolean))];
}

function getFilteredVocabulary() {
  return vocabulary.filter((word) => {
    const matchesCategory = selectedCategory === allCategoriesLabel || word.category === selectedCategory;
    const matchesLevel = selectedLevel === allLevelsLabel || word.level === selectedLevel;

    return matchesCategory && matchesLevel;
  });
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
    word.meaning,
    word.category,
    word.example,
    word.translation,
  ];

  return searchableFields.some((field) => normalizeSearchText(field).includes(query));
}

function shuffleVocabulary(words) {
  const shuffledWords = [...words];

  for (let i = shuffledWords.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[randomIndex]] = [shuffledWords[randomIndex], shuffledWords[i]];
  }

  return shuffledWords;
}

function updateSearchControls() {
  clearSearchButton.disabled = !searchQuery;
}

function getCurrentModeText() {
  const modeParts = [];

  if (selectedCategory !== allCategoriesLabel) {
    modeParts.push(`分類：${selectedCategory}`);
  }

  if (selectedLevel !== allLevelsLabel) {
    modeParts.push(`級數：${selectedLevel}`);
  }

  if (selectedProgressStatus !== progressStatusAll) {
    modeParts.push(`進度：${progressStatusLabels[selectedProgressStatus]}`);
  }

  if (searchQuery) {
    modeParts.push(`搜尋：${vocabularySearchInput.value.trim()}`);
  }

  return modeParts.length ? modeParts.join("，") : "全部分類、全部級數、全部進度";
}

function updateRandomStatus() {
  if (!randomStatus) {
    return;
  }

  const modeText = getCurrentModeText();
  const resultText = filteredVocabulary.length
    ? `目前以隨機順序顯示 ${filteredVocabulary.length} 個單字。`
    : "目前沒有符合條件的單字。";
  randomStatus.textContent = `${resultText}（${modeText}）`;
}

function resetCurrentPosition() {
  currentWordIndex = 0;
  chineseVisible = false;
}

function resetQuizState() {
  quizQuestionIndex = 0;
  quizCorrectCount = 0;
  quizAnsweredCount = 0;
  quizAnsweredCurrentQuestion = false;
  quizCurrentOptions = [];
  quizCurrentQuestionRemoved = false;
}

function applySearchToCategoryVocabulary(options = {}) {
  const preserveWordKey = options.preserveWordKey || "";
  filteredVocabulary = categoryVocabulary.filter((word) => (
    wordMatchesSearch(word, searchQuery) && wordMatchesProgressFilter(word)
  ));

  if (preserveWordKey) {
    const preservedIndex = filteredVocabulary.findIndex((word) => getVocabularyWordKey(word) === preserveWordKey);

    if (preservedIndex >= 0) {
      currentWordIndex = preservedIndex;
      chineseVisible = false;
      resetQuizState();
      return;
    }
  }

  resetCurrentPosition();
  resetQuizState();
}

function resetCurrentVocabulary() {
  categoryVocabulary = shuffleVocabulary(getFilteredVocabulary());
  applySearchToCategoryVocabulary();
}

function reshuffleCurrentVocabulary() {
  if (searchQuery) {
    filteredVocabulary = shuffleVocabulary(categoryVocabulary.filter((word) => (
      wordMatchesSearch(word, searchQuery) && wordMatchesProgressFilter(word)
    )));
    resetCurrentPosition();
    resetQuizState();
    return;
  }

  resetCurrentVocabulary();
}

function updateModeButtons() {
  const isCardMode = currentMode === cardMode;
  cardModeButton.classList.toggle("is-active", isCardMode);
  cardModeButton.setAttribute("aria-pressed", String(isCardMode));
  quizModeButton.classList.toggle("is-active", !isCardMode);
  quizModeButton.setAttribute("aria-pressed", String(!isCardMode));
}

function renderCurrentMode() {
  updateModeButtons();

  const isQuizMode = currentMode === quizMode;
  vocabularyCard.hidden = isQuizMode;
  vocabularyControls.hidden = isQuizMode;
  quizPanel.hidden = !isQuizMode;

  if (isQuizMode) {
    renderQuizQuestion();
    return;
  }

  renderCurrentWord();
}

function createCategoryFilterButton(category) {
  const button = document.createElement("button");
  const categoryCount = category === allCategoriesLabel
    ? vocabulary.length
    : vocabulary.filter((word) => word.category === category).length;
  button.className = "filter-button";
  button.type = "button";
  button.textContent = `${category} (${categoryCount})`;
  button.dataset.category = category;
  button.setAttribute("aria-pressed", String(category === selectedCategory));

  if (category === selectedCategory) {
    button.classList.add("is-active");
  }

  button.addEventListener("click", () => {
    if (selectedCategory === category) {
      return;
    }

    selectedCategory = category;
    resetCurrentVocabulary();
    updateCategoryFilterButtons();
    renderCurrentMode();
  });

  return button;
}

function updateCategoryFilterButtons() {
  const filterButtons = categoryFilters.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategoryFilters() {
  const availableCategories = getAvailableCategories();
  const filterButtons = [allCategoriesLabel, ...availableCategories].map(createCategoryFilterButton);
  categoryFilters.replaceChildren(...filterButtons);
}

function getEnglishProgressSummary() {
  const summary = {
    total: vocabulary.length,
    known: 0,
    learning: 0,
    new: 0,
  };

  vocabulary.forEach((word) => {
    const status = getVocabularyWordStatus(word);

    if (status === progressStatusKnown) {
      summary.known += 1;
    } else if (status === progressStatusLearning) {
      summary.learning += 1;
    } else {
      summary.new += 1;
    }
  });

  summary.completionRate = summary.total ? Math.round((summary.known / summary.total) * 100) : 0;
  return summary;
}

function renderEnglishProgressSummary() {
  const summary = getEnglishProgressSummary();

  englishProgressTotal.textContent = summary.total;
  englishProgressKnown.textContent = summary.known;
  englishProgressLearning.textContent = summary.learning;
  englishProgressNew.textContent = summary.new;
  englishProgressCompletion.textContent = `${summary.completionRate}%`;
}

function createProgressFilterButton(option) {
  const button = document.createElement("button");
  button.className = "filter-button";
  button.type = "button";
  button.textContent = option.label;
  button.dataset.progressStatus = option.status;
  button.setAttribute("aria-pressed", String(option.status === selectedProgressStatus));

  if (option.status === selectedProgressStatus) {
    button.classList.add("is-active");
  }

  button.addEventListener("click", () => {
    if (selectedProgressStatus === option.status) {
      return;
    }

    selectedProgressStatus = option.status;
    applySearchToCategoryVocabulary();
    updateProgressFilterButtons();
    renderCurrentMode();
  });

  return button;
}

function updateProgressFilterButtons() {
  const filterButtons = englishProgressFilters.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.progressStatus === selectedProgressStatus;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderProgressFilters() {
  const filterButtons = progressFilterOptions.map(createProgressFilterButton);
  englishProgressFilters.replaceChildren(...filterButtons);
}

function createStudyActionButton(label, action) {
  const button = document.createElement("button");
  button.className = label === "我會了" ? "answer-button" : "secondary-button";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function renderProgressAfterWordAction(wordKey) {
  renderEnglishProgressSummary();
  applySearchToCategoryVocabulary({ preserveWordKey: wordKey });
  renderCurrentMode();
}

function createWordProgressControls(word) {
  const progress = getWordProgress(word.id, word.word);
  const wrapper = document.createElement("div");
  wrapper.className = "english-word-progress-controls";

  const statusText = document.createElement("p");
  statusText.className = "english-word-status";
  statusText.textContent = `目前學習狀態：${progressStatusLabels[progress.status] || progressStatusLabels[progressStatusNew]}`;

  const actions = document.createElement("div");
  actions.className = "english-word-progress-actions";
  actions.append(
    createStudyActionButton("我會了", () => {
      const wordKey = getVocabularyWordKey(word);
      markWordKnown(word.id, word.word);
      renderProgressAfterWordAction(wordKey);
    }),
    createStudyActionButton("還不熟", () => {
      const wordKey = getVocabularyWordKey(word);
      markWordLearning(word.id, word.word);
      renderProgressAfterWordAction(wordKey);
    }),
  );

  wrapper.append(statusText, actions);
  return wrapper;
}

function createVocabularyDetail(label, value, extraClass = "") {
  const row = document.createElement("div");
  row.className = `vocabulary-detail${extraClass ? ` ${extraClass}` : ""}`;

  const labelElement = document.createElement("span");
  labelElement.className = "vocabulary-detail-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value || "—";

  row.append(labelElement, valueElement);
  return row;
}

function createHiddenChineseHint() {
  const row = document.createElement("div");
  row.className = "vocabulary-detail js-chinese-hint";

  const labelElement = document.createElement("span");
  labelElement.className = "vocabulary-detail-label";
  labelElement.textContent = "中文已隱藏";

  const valueElement = document.createElement("strong");
  valueElement.textContent = "請先自己回想答案。";

  row.append(labelElement, valueElement);
  return row;
}

function updateChineseVisibility() {
  const chineseDetails = vocabularyCard.querySelectorAll(".js-chinese-detail");
  chineseDetails.forEach((detail) => {
    detail.hidden = !chineseVisible;
  });

  const chineseHints = vocabularyCard.querySelectorAll(".js-chinese-hint");
  chineseHints.forEach((hint) => {
    hint.hidden = chineseVisible;
  });

  toggleChineseButton.textContent = chineseVisible ? "隱藏中文" : "顯示中文";
  toggleChineseButton.setAttribute("aria-pressed", String(chineseVisible));
}

function renderEmptyVocabularyMessage(message, progressText = "0 / 0") {
  vocabularyCard.replaceChildren();
  vocabularyCard.classList.add("status-message");
  vocabularyCard.textContent = message;
  currentProgress.textContent = progressText;
  updateRandomStatus();
  previousWordButton.disabled = true;
  nextWordButton.disabled = true;
  toggleChineseButton.disabled = true;
  reshuffleVocabularyButton.disabled = true;
  updateSearchControls();
}

function renderCurrentWord() {
  if (!vocabulary.length) {
    renderEmptyVocabularyMessage("目前沒有可顯示的 GEPT 初級單字資料。");
    return;
  }

  if (!categoryVocabulary.length && !searchQuery) {
    renderEmptyVocabularyMessage("此分類目前沒有單字。");
    return;
  }

  if (!filteredVocabulary.length) {
    const emptyMessage = searchQuery
      ? "找不到符合條件的單字，請換個關鍵字試試。"
      : "此分類目前沒有單字。";
    renderEmptyVocabularyMessage(emptyMessage);
    return;
  }

  if (currentWordIndex >= filteredVocabulary.length) {
    currentWordIndex = filteredVocabulary.length - 1;
  }

  const currentWord = filteredVocabulary[currentWordIndex];
  const cardHeader = document.createElement("div");
  const cardNumber = document.createElement("span");
  cardNumber.className = "card-number";
  cardNumber.textContent = `隨機顯示 ${currentWordIndex + 1}`;

  const wordMeta = document.createElement("div");
  wordMeta.className = "vocabulary-card-meta";

  const levelBadge = document.createElement("span");
  levelBadge.className = "vocabulary-level-badge";
  levelBadge.textContent = currentWord.level || "—";

  wordMeta.append(cardNumber, levelBadge);

  const wordTitle = document.createElement("h2");
  wordTitle.className = "english-word";
  wordTitle.textContent = currentWord.word || "—";

  const partOfSpeech = document.createElement("p");
  partOfSpeech.className = "kana english-part-of-speech";
  partOfSpeech.textContent = currentWord.partOfSpeech || "—";

  cardHeader.append(wordMeta, wordTitle, partOfSpeech);

  const details = document.createElement("div");
  details.className = "vocabulary-details";
  details.append(
    createVocabularyDetail("分類", currentWord.category),
    createVocabularyDetail("中文意思", currentWord.meaning, "js-chinese-detail"),
    createVocabularyDetail("英文例句", currentWord.example),
    createVocabularyDetail("中文翻譯", currentWord.translation, "js-chinese-detail"),
    createHiddenChineseHint(),
  );

  const progressControls = createWordProgressControls(currentWord);

  vocabularyCard.classList.remove("status-message");
  vocabularyCard.replaceChildren(cardHeader, details, progressControls);

  currentProgress.textContent = `隨機顯示：${currentWordIndex + 1} / ${filteredVocabulary.length}`;
  previousWordButton.disabled = currentWordIndex === 0;
  nextWordButton.disabled = currentWordIndex === filteredVocabulary.length - 1;
  toggleChineseButton.disabled = false;
  reshuffleVocabularyButton.disabled = false;
  updateSearchControls();
  updateRandomStatus();
  updateChineseVisibility();
}

function getCurrentQuizTypeSetting() {
  return quizTypeSettings[currentQuizType] || quizTypeSettings[englishToChineseQuizType];
}

function getWrongQuestionKey(word, quizType) {
  return `${quizType}::${word.word}`;
}

function getWrongQuestionRecordKey(record) {
  return `${record.quizTypeKey}::${record.word}`;
}

function updateWrongQuestionControls() {
  wrongQuestionCount.textContent = `${wrongQuestions.length} 題`;
  reviewWrongQuestionsButton.disabled = !wrongQuestions.length;
  clearWrongQuestionsButton.disabled = !wrongQuestions.length;
  returnQuizButton.hidden = !isWrongReviewMode;
}

function recordWrongQuestion(word, quizType, selectedAnswer, correctAnswer) {
  const wrongQuestionKey = getWrongQuestionKey(word, quizType);
  const alreadyRecorded = wrongQuestions.some((record) => getWrongQuestionRecordKey(record) === wrongQuestionKey);

  if (alreadyRecorded) {
    return;
  }

  const quizTypeSetting = quizTypeSettings[quizType] || quizTypeSettings[englishToChineseQuizType];
  wrongQuestions.push({
    word: word.word,
    meaning: word.meaning,
    category: word.category,
    quizType: quizTypeSetting.title,
    quizTypeKey: quizType,
    question: word[quizTypeSetting.promptField],
    selectedAnswer,
    correctAnswer,
  });
  updateWrongQuestionControls();
}

function removeWrongQuestion(record) {
  const recordKey = getWrongQuestionRecordKey(record);
  wrongQuestions = wrongQuestions.filter((wrongQuestion) => getWrongQuestionRecordKey(wrongQuestion) !== recordKey);
  wrongReviewQuestions = wrongReviewQuestions.filter((wrongQuestion) => getWrongQuestionRecordKey(wrongQuestion) !== recordKey);
  updateWrongQuestionControls();
}

function getActiveQuizQuestions() {
  return isWrongReviewMode ? wrongReviewQuestions : filteredVocabulary;
}

function getQuizTypeForQuestion(question) {
  return isWrongReviewMode ? question.quizTypeKey : currentQuizType;
}

function updateQuizTypeButtons(activeQuizType = currentQuizType) {
  quizTypeButtons.forEach((button) => {
    const isActive = button.dataset.geptQuizType === activeQuizType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = isWrongReviewMode;
  });
}

function getQuizOptionValues(currentWord, answerField) {
  const correctAnswer = currentWord[answerField];
  const optionSource = isWrongReviewMode ? vocabulary : filteredVocabulary;
  const filteredWrongAnswers = optionSource
    .filter((word) => word.word !== currentWord.word && word[answerField] && word[answerField] !== correctAnswer)
    .map((word) => word[answerField]);
  const backupWrongAnswers = vocabulary
    .filter((word) => word !== currentWord && word[answerField] && word[answerField] !== correctAnswer)
    .map((word) => word[answerField]);
  const wrongAnswers = [...new Set([...shuffleVocabulary(filteredWrongAnswers), ...shuffleVocabulary(backupWrongAnswers)])]
    .slice(0, 3);

  return shuffleVocabulary([correctAnswer, ...wrongAnswers].filter(Boolean));
}

function updateQuizScoreDisplay() {
  const activeQuestions = getActiveQuizQuestions();
  quizScore.textContent = `${quizCorrectCount} / ${quizAnsweredCount}`;
  quizProgress.textContent = activeQuestions.length
    ? `${Math.min(quizQuestionIndex + 1, activeQuestions.length)} / ${activeQuestions.length}`
    : "0 / 0";
  updateWrongQuestionControls();
}

function renderEmptyQuizMessage(message) {
  quizContent.replaceChildren();
  const statusMessage = document.createElement("p");
  statusMessage.className = "status-message quiz-status-message";
  statusMessage.textContent = message;
  quizContent.append(statusMessage);
  quizScore.textContent = "0 / 0";
  quizProgress.textContent = "0 / 0";
  currentProgress.textContent = isWrongReviewMode ? "錯題複習：0 / 0" : "測驗模式：0 / 0";
  nextQuizQuestionButton.disabled = true;
  reshuffleQuizVocabularyButton.disabled = true;
  updateRandomStatus();
  updateSearchControls();
  updateWrongQuestionControls();
}

function renderQuizQuestion() {
  const activeQuestions = getActiveQuizQuestions();
  const currentQuestion = activeQuestions[quizQuestionIndex];
  const activeQuizType = currentQuestion ? getQuizTypeForQuestion(currentQuestion) : currentQuizType;
  const quizTypeSetting = quizTypeSettings[activeQuizType] || getCurrentQuizTypeSetting();
  quizTitle.textContent = isWrongReviewMode ? `錯題複習：${quizTypeSetting.title}` : quizTypeSetting.title;
  updateQuizTypeButtons(activeQuizType);
  updateWrongQuestionControls();

  if (!vocabulary.length) {
    renderEmptyQuizMessage("目前沒有可顯示的 GEPT 初級單字資料。");
    return;
  }

  if (isWrongReviewMode && !activeQuestions.length) {
    renderEmptyQuizMessage("目前沒有錯題。");
    return;
  }

  if (!isWrongReviewMode && !filteredVocabulary.length) {
    renderEmptyQuizMessage("目前沒有符合條件的單字，請調整分類或搜尋關鍵字。");
    return;
  }

  if (quizQuestionIndex >= activeQuestions.length) {
    quizQuestionIndex = activeQuestions.length - 1;
  }

  const currentWord = activeQuestions[quizQuestionIndex];
  const correctAnswer = currentWord[quizTypeSetting.answerField];
  quizAnsweredCurrentQuestion = false;
  quizCurrentQuestionRemoved = false;
  quizCurrentOptions = getQuizOptionValues(currentWord, quizTypeSetting.answerField);

  const quizCard = document.createElement("article");
  quizCard.className = "quiz-card gept-quiz-card";

  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";

  const promptLabel = document.createElement("p");
  promptLabel.className = "quiz-prompt-label";
  promptLabel.textContent = "題目：";

  const wordTitle = document.createElement("h3");
  wordTitle.className = "english-word gept-quiz-word";
  wordTitle.textContent = currentWord[quizTypeSetting.promptField] || "—";

  const promptText = document.createElement("p");
  promptText.className = "gept-quiz-instruction";
  promptText.textContent = quizTypeSetting.instruction;

  prompt.append(promptLabel, wordTitle, promptText);

  const options = document.createElement("div");
  options.className = "quiz-options gept-quiz-options";

  quizCurrentOptions.forEach((answer, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-quiz-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    optionButton.dataset.answer = answer;
    optionButton.addEventListener("click", () => handleQuizAnswer(optionButton, correctAnswer));
    options.append(optionButton);
  });

  const feedback = document.createElement("p");
  feedback.id = "geptQuizFeedback";
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  quizCard.append(prompt, options, feedback);
  quizContent.replaceChildren(quizCard);

  nextQuizQuestionButton.disabled = quizQuestionIndex >= activeQuestions.length - 1;
  reshuffleQuizVocabularyButton.disabled = false;
  reshuffleQuizVocabularyButton.textContent = isWrongReviewMode ? "重新隨機錯題" : "重新隨機";
  nextQuizQuestionButton.textContent = quizQuestionIndex >= activeQuestions.length - 1 ? "已完成目前題組" : "下一題";
  currentProgress.textContent = isWrongReviewMode
    ? `錯題複習：${quizQuestionIndex + 1} / ${activeQuestions.length}`
    : `測驗模式：${quizQuestionIndex + 1} / ${activeQuestions.length}`;
  updateQuizScoreDisplay();
  updateRandomStatus();
  updateSearchControls();
}

function handleQuizAnswer(selectedButton, correctAnswer) {
  const feedback = document.querySelector("#geptQuizFeedback");
  const optionButtons = quizContent.querySelectorAll(".gept-quiz-option");
  const activeQuestions = getActiveQuizQuestions();
  const currentQuestion = activeQuestions[quizQuestionIndex];
  const activeQuizType = getQuizTypeForQuestion(currentQuestion);
  const isCorrect = selectedButton.dataset.answer === correctAnswer;

  if (!quizAnsweredCurrentQuestion) {
    quizAnsweredCurrentQuestion = true;
    quizAnsweredCount += 1;

    if (isCorrect) {
      quizCorrectCount += 1;

      if (isWrongReviewMode) {
        removeWrongQuestion(currentQuestion);
        quizCurrentQuestionRemoved = true;
      }
    } else if (!isWrongReviewMode) {
      recordWrongQuestion(currentQuestion, activeQuizType, selectedButton.dataset.answer, correctAnswer);
    }
  }

  optionButtons.forEach((button) => {
    const buttonIsCorrect = button.dataset.answer === correctAnswer;
    button.classList.toggle("is-correct", buttonIsCorrect);
    button.classList.toggle("is-wrong", button === selectedButton && !buttonIsCorrect);
    button.disabled = true;
  });

  feedback.classList.toggle("is-correct", isCorrect);
  feedback.classList.toggle("is-wrong", !isCorrect);
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${correctAnswer}`;

  if (isCorrect && isWrongReviewMode) {
    if (!wrongReviewQuestions.length) {
      feedback.textContent = "答對了！本次錯題已全部完成。";
      nextQuizQuestionButton.disabled = true;
      nextQuizQuestionButton.textContent = "已完成錯題複習";
    } else {
      nextQuizQuestionButton.disabled = false;
      nextQuizQuestionButton.textContent = "下一題";
    }
  }

  updateQuizScoreDisplay();
}

previousWordButton.addEventListener("click", () => {
  if (currentWordIndex > 0) {
    currentWordIndex -= 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

nextWordButton.addEventListener("click", () => {
  if (currentWordIndex < filteredVocabulary.length - 1) {
    currentWordIndex += 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

toggleChineseButton.addEventListener("click", () => {
  if (toggleChineseButton.disabled) {
    return;
  }

  chineseVisible = !chineseVisible;
  updateChineseVisibility();
});

reshuffleVocabularyButton.addEventListener("click", () => {
  reshuffleCurrentVocabulary();
  renderCurrentMode();
});

vocabularySearchInput.addEventListener("input", () => {
  searchQuery = normalizeSearchText(vocabularySearchInput.value);
  applySearchToCategoryVocabulary();
  renderCurrentMode();
});

clearSearchButton.addEventListener("click", () => {
  vocabularySearchInput.value = "";
  searchQuery = "";
  resetCurrentVocabulary();
  renderCurrentMode();
});

cardModeButton.addEventListener("click", () => {
  if (currentMode === cardMode) {
    return;
  }

  currentMode = cardMode;
  isWrongReviewMode = false;
  renderCurrentMode();
});

quizModeButton.addEventListener("click", () => {
  if (currentMode === quizMode) {
    return;
  }

  currentMode = quizMode;
  isWrongReviewMode = false;
  resetQuizState();
  renderCurrentMode();
});

quizTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isWrongReviewMode || currentQuizType === button.dataset.geptQuizType) {
      return;
    }

    currentQuizType = button.dataset.geptQuizType;
    resetQuizState();
    renderQuizQuestion();
  });
});

reshuffleQuizVocabularyButton.addEventListener("click", () => {
  if (isWrongReviewMode) {
    wrongReviewQuestions = shuffleVocabulary(wrongQuestions);
    resetQuizState();
    renderCurrentMode();
    return;
  }

  reshuffleCurrentVocabulary();
  renderCurrentMode();
});

nextQuizQuestionButton.addEventListener("click", () => {
  const activeQuestions = getActiveQuizQuestions();

  if (quizCurrentQuestionRemoved) {
    renderQuizQuestion();
    return;
  }

  if (quizQuestionIndex >= activeQuestions.length - 1) {
    return;
  }

  quizQuestionIndex += 1;
  renderQuizQuestion();
});

reviewWrongQuestionsButton.addEventListener("click", () => {
  if (!wrongQuestions.length) {
    renderEmptyQuizMessage("目前沒有錯題。");
    return;
  }

  currentMode = quizMode;
  isWrongReviewMode = true;
  wrongReviewQuestions = shuffleVocabulary(wrongQuestions);
  resetQuizState();
  renderCurrentMode();
});

returnQuizButton.addEventListener("click", () => {
  isWrongReviewMode = false;
  reshuffleQuizVocabularyButton.textContent = "重新隨機";
  resetQuizState();
  renderCurrentMode();
});

clearWrongQuestionsButton.addEventListener("click", () => {
  wrongQuestions = [];
  wrongReviewQuestions = [];

  if (isWrongReviewMode) {
    isWrongReviewMode = false;
    resetQuizState();
    renderCurrentMode();
    updateWrongQuestionControls();
    return;
  }

  updateWrongQuestionControls();
  updateQuizScoreDisplay();
});

resetEnglishProgressButton.addEventListener("click", () => {
  const confirmed = window.confirm("確定要清除英文單字學習進度嗎？這不會影響日文資料。");

  if (!confirmed) {
    return;
  }

  resetEnglishVocabProgress();
  renderEnglishProgressSummary();
  applySearchToCategoryVocabulary();
  renderCurrentMode();
});

renderVocabularyTotalText();
renderEnglishProgressSummary();
renderProgressFilters();
resetCurrentVocabulary();
renderCategoryFilters();
updateWrongQuestionControls();
renderCurrentMode();
