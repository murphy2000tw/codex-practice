const vocabularyEntrancePanel = document.querySelector("#vocabularyEntrancePanel");
const vocabularyAppPanel = document.querySelector("#vocabularyAppPanel");
const vocabularyCard = document.querySelector("#vocabularyCard");
const currentProgress = document.querySelector("#currentProgress");
const subpageTitle = document.querySelector("#subpage-title");
const practiceOnlyElements = document.querySelectorAll("[data-vocabulary-practice-only]");
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
const listeningModeButton = document.querySelector("#geptListeningModeButton");
const listeningTestModeButton = document.querySelector("#geptListeningTestModeButton");
const listeningPanel = document.querySelector("#geptListeningPanel");
const listeningTitle = document.querySelector("#geptListeningTitle");
const listeningContent = document.querySelector("#geptListeningContent");
const nextListeningQuestionButton = document.querySelector("#nextGeptListeningQuestion");
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
const wrongQuestionActions = reviewWrongQuestionsButton?.closest(".quiz-actions");
const quizNavigationActions = nextQuizQuestionButton?.closest(".quiz-actions");
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
const resetEnglishQuizProgressButton = document.querySelector("#resetEnglishQuizProgress");
const vocabulary = Array.isArray(geptVocabulary) ? geptVocabulary : [];
const allCategoriesLabel = "全部";
const allLevelsLabel = "全部級數";
const availableLevels = [allLevelsLabel, "初級", "中級", "中高級"];
const STORAGE_KEY = "englishVocabProgress_v1";
const progressVersion = 1;
const VOCAB_TEST_AUDIO_LIMIT_ONCE = false;
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
const listeningMode = "listening";
const listeningTestMode = "listening-test";
const vocabListeningTestQuestionLimit = 10;
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

function getInitialVocabularyMode() {
  const modeParam = new URLSearchParams(window.location.search).get("mode") || "";
  const normalizedMode = modeParam.trim().toLowerCase();

  if (["practice", "card", "cards"].includes(normalizedMode)) {
    return cardMode;
  }

  if (["quiz", "test"].includes(normalizedMode)) {
    return quizMode;
  }

  if (["listening", "listening-practice"].includes(normalizedMode)) {
    return listeningMode;
  }

  if (["listening-test", "listening-quiz"].includes(normalizedMode)) {
    return listeningTestMode;
  }

  return "entrance";
}

const isStandaloneVocabularyQuizPage = document.body?.dataset.vocabularyPage === "quiz";
const initialVocabularyMode = isStandaloneVocabularyQuizPage ? quizMode : getInitialVocabularyMode();
let currentMode = initialVocabularyMode === "entrance" ? cardMode : initialVocabularyMode;
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
let categoryQuizQuestions = [];
let vocabularyQuizResults = [];
let vocabularyQuizTimeoutCount = 0;
let vocabularyQuizTimer = null;
let vocabularyQuizRemainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
let vocabularyQuizPhase = "idle";
let vocabularyQuizStartedAt = null;
let vocabularyListeningTestStartedAt = null;
let vocabularyQuizPlayedAudioKeys = new Set();
let currentListeningWord = null;
let listeningOptions = [];
let selectedListeningAnswer = "";
let isListeningAnswered = false;
let vocabListeningTestQuestions = [];
let vocabListeningTestIndex = 0;
let vocabListeningTestCorrectCount = 0;
let vocabListeningTestResults = [];
let vocabListeningTestSelectedAnswer = "";
let vocabListeningTestHasPlayedAudio = false;
let vocabListeningTestPhase = "start";
let englishVocabProgress = loadEnglishVocabProgress();


function canSpeakEnglishWord(word) {
  return typeof word === "string" && word.trim().length > 0;
}

function canUseSpeechSynthesis() {
  return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

function stopEnglishWordAudio() {
  if (!canUseSpeechSynthesis()) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (error) {
    // Speech playback is optional; keep the vocabulary page usable if cancellation fails.
  }
}

function speakEnglishWord(word) {
  if (!canSpeakEnglishWord(word) || !canUseSpeechSynthesis()) {
    return false;
  }

  stopEnglishWordAudio();

  const utterance = new SpeechSynthesisUtterance(word.trim());
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    return false;
  }
}

function createEnglishWordAudioButton(word, options = {}) {
  const button = document.createElement("button");
  button.className = "word-audio-button";
  button.type = "button";
  button.textContent = "🔊";
  button.setAttribute("aria-label", `播放英文單字發音：${word || "單字"}`);
  button.title = "播放英文單字發音";

  if (options.disabled || !canSpeakEnglishWord(word)) {
    button.disabled = true;
  }

  button.addEventListener("click", () => {
    if (button.disabled) {
      return;
    }

    const didSpeak = speakEnglishWord(word);
    if (!didSpeak) {
      return;
    }

    button.classList.add("is-playing");
    window.setTimeout(() => {
      button.classList.remove("is-playing");
    }, 650);

    if (typeof options.onPlay === "function") {
      options.onPlay(button);
    }
  });

  return button;
}

function createEnglishWordWithAudio(headingTag, word, className, options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "english-word-audio-row";

  const wordTitle = document.createElement(headingTag);
  wordTitle.className = className;
  wordTitle.textContent = word || "—";

  wrapper.append(wordTitle, createEnglishWordAudioButton(options.speechWord || word, options));
  return wrapper;
}

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

    const normalizedProgress = normalizeEnglishVocabProgress(parsedProgress);
    saveEnglishVocabProgress(normalizedProgress);
    return normalizedProgress;
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

function normalizeProgressNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function calculateWordStatus(wordProgress) {
  const practiceCount = normalizeProgressNumber(wordProgress.practiceCount);
  const testSeenCount = normalizeProgressNumber(wordProgress.testSeenCount);
  const testCorrectCount = normalizeProgressNumber(wordProgress.testCorrectCount);

  if (practiceCount === 0 && testSeenCount === 0) {
    return progressStatusNew;
  }

  if (practiceCount >= 6 && testCorrectCount >= 6) {
    return progressStatusKnown;
  }

  return progressStatusLearning;
}

function normalizeWordProgress(savedProgress = {}, wordText = "", wordKey = "") {
  const practiceCount = normalizeProgressNumber(
    savedProgress.practiceCount ?? savedProgress.studyCount,
  );
  const testCorrectCount = normalizeProgressNumber(
    savedProgress.testCorrectCount ?? savedProgress.correctCount,
  );
  const testWrongCount = normalizeProgressNumber(
    savedProgress.testWrongCount ?? savedProgress.wrongCount,
  );
  const testSeenCount = normalizeProgressNumber(
    savedProgress.testSeenCount ?? (testCorrectCount + testWrongCount),
  );
  const normalizedProgress = {
    word: savedProgress.word || wordText || wordKey,
    practiceCount,
    testSeenCount,
    testCorrectCount,
    testWrongCount,
    status: progressStatusNew,
    firstStudiedAt: savedProgress.firstStudiedAt || null,
    lastStudiedAt: savedProgress.lastStudiedAt || null,
    lastTestedAt: savedProgress.lastTestedAt || null,
  };

  normalizedProgress.status = calculateWordStatus(normalizedProgress);
  return normalizedProgress;
}

function normalizeEnglishVocabProgress(progress) {
  const normalizedProgress = {
    version: progressVersion,
    updatedAt: progress.updatedAt || new Date().toISOString(),
    words: {},
  };
  const savedWords = progress.words && typeof progress.words === "object" && !Array.isArray(progress.words)
    ? progress.words
    : {};

  Object.entries(savedWords).forEach(([wordKey, savedProgress]) => {
    const normalizedKey = String(wordKey || "").trim();

    if (!normalizedKey || !savedProgress || typeof savedProgress !== "object" || Array.isArray(savedProgress)) {
      return;
    }

    normalizedProgress.words[normalizedKey] = normalizeWordProgress(savedProgress, savedProgress.word, normalizedKey);
  });

  return normalizedProgress;
}

function getWordProgress(wordId, wordText) {
  const wordKey = getWordKey(wordId, wordText);

  if (!wordKey) {
    return normalizeWordProgress({}, wordText, wordKey);
  }

  const savedProgress = englishVocabProgress.words[wordKey];
  const normalizedProgress = normalizeWordProgress(savedProgress, wordText, wordKey);
  englishVocabProgress.words[wordKey] = normalizedProgress;
  return normalizedProgress;
}

function updateWordProgress(wordId, wordText, updateProgress) {
  const wordKey = getWordKey(wordId, wordText);

  if (!wordKey) {
    return null;
  }

  const currentProgress = getWordProgress(wordId, wordText);
  const nextProgress = {
    ...currentProgress,
    word: wordText || currentProgress.word || wordKey,
  };

  updateProgress(nextProgress);
  nextProgress.practiceCount = normalizeProgressNumber(nextProgress.practiceCount);
  nextProgress.testSeenCount = normalizeProgressNumber(nextProgress.testSeenCount);
  nextProgress.testCorrectCount = normalizeProgressNumber(nextProgress.testCorrectCount);
  nextProgress.testWrongCount = normalizeProgressNumber(nextProgress.testWrongCount);
  nextProgress.status = calculateWordStatus(nextProgress);
  englishVocabProgress.words[wordKey] = nextProgress;
  saveEnglishVocabProgress(englishVocabProgress);
  return nextProgress;
}

function recordWordPractice(wordId, wordText) {
  const studiedAt = new Date().toISOString();
  return updateWordProgress(wordId, wordText, (nextProgress) => {
    nextProgress.practiceCount += 1;
    nextProgress.firstStudiedAt = nextProgress.firstStudiedAt || studiedAt;
    nextProgress.lastStudiedAt = studiedAt;
  });
}

function recordWordTestSeen(wordId, wordText) {
  const testedAt = new Date().toISOString();
  return updateWordProgress(wordId, wordText, (nextProgress) => {
    nextProgress.testSeenCount += 1;
    nextProgress.firstStudiedAt = nextProgress.firstStudiedAt || testedAt;
    nextProgress.lastTestedAt = testedAt;
  });
}

function recordWordTestAnswer(wordId, wordText, isCorrect) {
  return updateWordProgress(wordId, wordText, (nextProgress) => {
    if (isCorrect) {
      nextProgress.testCorrectCount += 1;
    } else {
      nextProgress.testWrongCount += 1;
    }
  });
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


function getVocabularyEnglish(word) {
  return String(word?.word || word?.english || word?.en || word?.text || "").trim();
}

function getVocabularyMeaning(word) {
  return String(word?.meaning || word?.chinese || word?.zh || "").trim();
}

function getListeningPracticeSource() {
  const primarySource = filteredVocabulary.length ? filteredVocabulary : vocabulary;
  return primarySource.filter((word) => getVocabularyEnglish(word) && getVocabularyMeaning(word));
}

function resetListeningTestState() {
  stopEnglishWordAudio();
  vocabListeningTestQuestions = [];
  vocabListeningTestIndex = 0;
  vocabListeningTestCorrectCount = 0;
  vocabListeningTestResults = [];
  vocabListeningTestSelectedAnswer = "";
  vocabListeningTestHasPlayedAudio = false;
  vocabListeningTestPhase = "start";
}

function resetListeningState() {
  stopEnglishWordAudio();
  currentListeningWord = null;
  listeningOptions = [];
  selectedListeningAnswer = "";
  isListeningAnswered = false;
  resetListeningTestState();
}

function updateSearchControls() {
  if (clearSearchButton) {
    clearSearchButton.disabled = !searchQuery;
  }
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
    modeParts.push(`搜尋：${vocabularySearchInput?.value.trim() || searchQuery}`);
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

function clearVocabularyQuizTimer() {
  if (vocabularyQuizTimer) {
    window.clearInterval(vocabularyQuizTimer);
    vocabularyQuizTimer = null;
  }
}

function updateVocabularyQuizTimerText() {
  const timer = document.querySelector("#geptQuizTimer");
  if (timer) {
    timer.textContent = String(vocabularyQuizRemainingSeconds);
  }
}

function startVocabularyQuizTimer() {
  clearVocabularyQuizTimer();
  vocabularyQuizRemainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
  updateVocabularyQuizTimerText();
  vocabularyQuizTimer = window.setInterval(() => {
    vocabularyQuizRemainingSeconds -= 1;
    updateVocabularyQuizTimerText();
    if (vocabularyQuizRemainingSeconds <= 0) {
      handleQuizTimeout();
    }
  }, 1000);
}

function resetQuizState() {
  clearVocabularyQuizTimer();
  vocabularyQuizPhase = "ready";
  quizQuestionIndex = 0;
  quizCorrectCount = 0;
  quizAnsweredCount = 0;
  quizAnsweredCurrentQuestion = false;
  quizCurrentOptions = [];
  quizCurrentQuestionRemoved = false;
  vocabularyQuizResults = [];
  vocabularyQuizTimeoutCount = 0;
  vocabularyQuizStartedAt = null;
  vocabularyQuizPlayedAudioKeys = new Set();
  categoryQuizQuestions = selectEnglishQuizQuestions(filteredVocabulary, "vocabulary");
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
      resetListeningState();
      return;
    }
  }

  resetCurrentPosition();
  resetQuizState();
  resetListeningState();
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
    resetListeningState();
    return;
  }

  resetCurrentVocabulary();
}

function updateModeButtons() {
  const isCardMode = currentMode === cardMode;
  const isQuizMode = currentMode === quizMode;
  const isListeningMode = currentMode === listeningMode;
  const isListeningTestMode = currentMode === listeningTestMode;
  cardModeButton?.classList.toggle("is-active", isCardMode);
  cardModeButton?.setAttribute("aria-pressed", String(isCardMode));
  quizModeButton?.classList.toggle("is-active", isQuizMode);
  quizModeButton?.setAttribute("aria-pressed", String(isQuizMode));
  listeningModeButton?.classList.toggle("is-active", isListeningMode);
  listeningModeButton?.setAttribute("aria-pressed", String(isListeningMode));
  listeningTestModeButton?.classList.toggle("is-active", isListeningTestMode);
  listeningTestModeButton?.setAttribute("aria-pressed", String(isListeningTestMode));
}

function updateModeScopedVisibility() {
  const isCardMode = currentMode === cardMode;

  practiceOnlyElements.forEach((element) => {
    element.hidden = !isCardMode;
  });

  if (currentProgress) {
    currentProgress.hidden = !isCardMode;
  }

  if (!subpageTitle) {
    return;
  }

  if (currentMode === quizMode) {
    subpageTitle.textContent = "單字測驗";
    return;
  }

  if (currentMode === listeningMode) {
    subpageTitle.textContent = "單字聽力練習";
    return;
  }

  if (currentMode === listeningTestMode) {
    subpageTitle.textContent = "單字聽力測驗";
    return;
  }

  subpageTitle.textContent = "單字卡學習";
}

function renderCurrentMode() {
  updateModeButtons();
  updateModeScopedVisibility();

  const isQuizMode = currentMode === quizMode;
  const isListeningMode = currentMode === listeningMode;
  const isListeningTestMode = currentMode === listeningTestMode;
  const isAnyListeningMode = isListeningMode || isListeningTestMode;
  if (vocabularyCard) {
    vocabularyCard.hidden = isQuizMode || isAnyListeningMode;
  }
  if (vocabularyControls) {
    vocabularyControls.hidden = isQuizMode || isAnyListeningMode;
  }
  if (quizPanel) {
    quizPanel.hidden = !isQuizMode;
  }
  if (listeningPanel) {
    listeningPanel.hidden = !isAnyListeningMode;
  }

  if (isQuizMode) {
    resetListeningState();
    renderQuizPreparation();
    return;
  }

  clearVocabularyQuizTimer();
  vocabularyQuizPhase = "idle";

  if (isListeningMode) {
    renderVocabListeningPractice();
    return;
  }

  if (isListeningTestMode) {
    renderVocabListeningTestStart();
    return;
  }

  resetListeningState();
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
  if (!categoryFilters) {
    return;
  }
  const filterButtons = categoryFilters.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategoryFilters() {
  if (!categoryFilters) {
    return;
  }
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

  if (!englishProgressTotal || !englishProgressKnown || !englishProgressLearning || !englishProgressNew || !englishProgressCompletion) {
    return;
  }

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
  if (!englishProgressFilters) {
    return;
  }
  const filterButtons = englishProgressFilters.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.progressStatus === selectedProgressStatus;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderProgressFilters() {
  if (!englishProgressFilters) {
    return;
  }
  const filterButtons = progressFilterOptions.map(createProgressFilterButton);
  englishProgressFilters.replaceChildren(...filterButtons);
}

function createWordProgressDetail(label, value) {
  const item = document.createElement("span");
  item.textContent = `${label}：${value}`;
  return item;
}

function createWordProgressControls(word) {
  const progress = getWordProgress(word.id, word.word);
  const wrapper = document.createElement("div");
  wrapper.className = "english-word-progress-controls";

  const statusText = document.createElement("p");
  statusText.className = "english-word-status";
  statusText.textContent = `狀態：${progressStatusLabels[progress.status] || progressStatusLabels[progressStatusNew]}`;

  const details = document.createElement("div");
  details.className = "english-word-progress-actions";
  details.append(
    createWordProgressDetail("練習次數", progress.practiceCount),
    createWordProgressDetail("測驗出現", progress.testSeenCount),
    createWordProgressDetail("測驗答對", progress.testCorrectCount),
    createWordProgressDetail("測驗答錯", progress.testWrongCount),
  );

  wrapper.append(statusText, details);
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
  stopEnglishWordAudio();

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
  recordWordPractice(currentWord.id, currentWord.word);
  renderEnglishProgressSummary();

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

  const wordTitleRow = createEnglishWordWithAudio("h2", currentWord.word, "english-word");

  const partOfSpeech = document.createElement("p");
  partOfSpeech.className = "kana english-part-of-speech";
  partOfSpeech.textContent = currentWord.partOfSpeech || "—";

  cardHeader.append(wordMeta, wordTitleRow, partOfSpeech);

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

function updateQuizActionVisibility() {
  const isReady = vocabularyQuizPhase === "ready";
  const isRunning = vocabularyQuizPhase === "running";
  const isComplete = vocabularyQuizPhase === "complete";
  const canReviewWrongQuestions = wrongQuestions.length > 0;

  if (wrongQuestionActions) {
    wrongQuestionActions.hidden = isReady || isRunning || (isComplete && !canReviewWrongQuestions && !isWrongReviewMode);
  }

  if (quizNavigationActions) {
    quizNavigationActions.hidden = isReady || isComplete || (!isWrongReviewMode && isRunning);
  }

  reviewWrongQuestionsButton.hidden = !canReviewWrongQuestions;
  clearWrongQuestionsButton.hidden = !canReviewWrongQuestions;
  returnQuizButton.hidden = !isWrongReviewMode;
}

function updateWrongQuestionControls() {
  wrongQuestionCount.textContent = `${wrongQuestions.length} 題`;
  reviewWrongQuestionsButton.disabled = !wrongQuestions.length;
  clearWrongQuestionsButton.disabled = !wrongQuestions.length;
  returnQuizButton.hidden = !isWrongReviewMode;
  updateQuizActionVisibility();
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
  return isWrongReviewMode ? wrongReviewQuestions : categoryQuizQuestions;
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
  if (currentProgress) {
    currentProgress.textContent = isWrongReviewMode ? "錯題複習：0 / 0" : "測驗模式：0 / 0";
  }
  nextQuizQuestionButton.disabled = true;
  reshuffleQuizVocabularyButton.disabled = true;
  updateRandomStatus();
  updateSearchControls();
  updateWrongQuestionControls();
}

function generateVocabListeningQuestion() {
  const source = getListeningPracticeSource();

  if (source.length < 4) {
    currentListeningWord = null;
    listeningOptions = [];
    selectedListeningAnswer = "";
    isListeningAnswered = false;
    return false;
  }

  const uniqueByEnglish = [];
  const seenEnglish = new Set();
  source.forEach((word) => {
    const english = getVocabularyEnglish(word);
    if (!english || seenEnglish.has(english)) {
      return;
    }
    seenEnglish.add(english);
    uniqueByEnglish.push(word);
  });

  if (uniqueByEnglish.length < 4) {
    currentListeningWord = null;
    listeningOptions = [];
    selectedListeningAnswer = "";
    isListeningAnswered = false;
    return false;
  }

  const shuffledWords = shuffleVocabulary(uniqueByEnglish);
  currentListeningWord = shuffledWords[0];
  const correctEnglish = getVocabularyEnglish(currentListeningWord);
  const wrongOptions = shuffledWords
    .slice(1)
    .map((word) => getVocabularyEnglish(word))
    .filter((english) => english && english !== correctEnglish)
    .slice(0, 3);

  listeningOptions = shuffleVocabulary([correctEnglish, ...wrongOptions]);
  selectedListeningAnswer = "";
  isListeningAnswered = false;
  return listeningOptions.length === 4;
}

function playCurrentListeningWord() {
  if (!currentListeningWord) {
    return false;
  }

  return speakEnglishWord(getVocabularyEnglish(currentListeningWord));
}

function handleListeningAnswer(option) {
  if (isListeningAnswered || !currentListeningWord) {
    return;
  }

  selectedListeningAnswer = option;
  isListeningAnswered = true;
  renderVocabListeningPractice();
}

function goToNextListeningQuestion() {
  stopEnglishWordAudio();
  generateVocabListeningQuestion();
  renderVocabListeningPractice();
}

function renderVocabListeningPractice() {
  clearVocabularyQuizTimer();
  stopEnglishWordAudio();
  vocabularyQuizPhase = "idle";
  quizTitle.textContent = "單字測驗";
  listeningTitle.textContent = "單字聽力練習";
  currentProgress.textContent = "單字聽力練習";
  nextListeningQuestionButton.hidden = false;
  nextListeningQuestionButton.textContent = "下一題";
  updateRandomStatus();
  updateSearchControls();

  const source = getListeningPracticeSource();
  if (source.length < 4 || (!currentListeningWord && !generateVocabListeningQuestion())) {
    const statusMessage = document.createElement("p");
    statusMessage.className = "status-message quiz-status-message";
    statusMessage.textContent = "目前可練習的單字少於 4 筆，請調整分類、進度或搜尋條件。";
    listeningContent.replaceChildren(statusMessage);
    nextListeningQuestionButton.disabled = true;
    return;
  }

  const correctEnglish = getVocabularyEnglish(currentListeningWord);
  const correctMeaning = getVocabularyMeaning(currentListeningWord);
  const isCorrect = isListeningAnswered && selectedListeningAnswer === correctEnglish;

  const card = document.createElement("article");
  card.className = "quiz-card gept-listening-card";

  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt gept-listening-prompt";

  const promptLabel = document.createElement("p");
  promptLabel.className = "quiz-prompt-label";
  promptLabel.textContent = "聽發音，選出正確的英文單字";

  const playButton = createEnglishWordAudioButton(correctEnglish);
  playButton.classList.add("gept-listening-audio-button");
  playButton.textContent = "🔊 聽單字";
  playButton.setAttribute("aria-label", "播放本題英文單字發音");

  prompt.append(promptLabel, playButton);

  const options = document.createElement("div");
  options.className = "quiz-options gept-listening-options";

  listeningOptions.forEach((option, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-listening-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    optionButton.dataset.answer = option;
    optionButton.disabled = isListeningAnswered;

    if (isListeningAnswered) {
      optionButton.classList.toggle("is-correct", option === correctEnglish);
      optionButton.classList.toggle("is-wrong", option === selectedListeningAnswer && option !== correctEnglish);
    }

    optionButton.addEventListener("click", () => handleListeningAnswer(option));
    options.append(optionButton);
  });

  const feedback = document.createElement("div");
  feedback.className = "quiz-feedback gept-listening-feedback";
  feedback.setAttribute("aria-live", "polite");

  if (isListeningAnswered) {
    feedback.classList.add(isCorrect ? "is-correct" : "is-wrong");
    const result = document.createElement("p");
    result.textContent = isCorrect ? "答對了！" : "再練一次！";
    const answer = document.createElement("p");
    answer.textContent = `正確答案：${correctEnglish}`;
    const meaning = document.createElement("p");
    meaning.textContent = `中文意思：${correctMeaning || "—"}`;
    feedback.append(result, answer, meaning);
  }

  card.append(prompt, options, feedback);
  listeningContent.replaceChildren(card);
  nextListeningQuestionButton.disabled = !isListeningAnswered;
}

function getUniqueVocabListeningTestSource() {
  const uniqueWords = [];
  const seenEnglish = new Set();

  getListeningPracticeSource().forEach((word) => {
    const english = getVocabularyEnglish(word);
    const meaning = getVocabularyMeaning(word);
    if (!english || !meaning || seenEnglish.has(english)) {
      return;
    }

    seenEnglish.add(english);
    uniqueWords.push(word);
  });

  return uniqueWords;
}

function generateVocabListeningTestQuestions() {
  const uniqueWords = getUniqueVocabListeningTestSource();

  if (uniqueWords.length < 4) {
    return [];
  }

  return shuffleVocabulary(uniqueWords)
    .slice(0, Math.min(vocabListeningTestQuestionLimit, uniqueWords.length))
    .map((word) => {
      const correctEnglish = getVocabularyEnglish(word);
      const wrongOptions = shuffleVocabulary(uniqueWords)
        .map((optionWord) => getVocabularyEnglish(optionWord))
        .filter((english) => english && english !== correctEnglish)
        .slice(0, 3);

      return {
        word,
        options: shuffleVocabulary([correctEnglish, ...wrongOptions]),
      };
    })
    .filter((question) => question.options.length === 4);
}

function startVocabListeningTest() {
  stopEnglishWordAudio();
  vocabListeningTestQuestions = generateVocabListeningTestQuestions();
  vocabListeningTestIndex = 0;
  vocabListeningTestCorrectCount = 0;
  vocabListeningTestResults = [];
  vocabListeningTestSelectedAnswer = "";
  vocabListeningTestHasPlayedAudio = false;
  vocabularyListeningTestStartedAt = new Date().toISOString();
  vocabListeningTestPhase = vocabListeningTestQuestions.length ? "question" : "start";
  renderVocabListeningTestQuestion();
}

function renderVocabListeningTestStart() {
  clearVocabularyQuizTimer();
  stopEnglishWordAudio();
  vocabularyQuizPhase = "idle";
  listeningTitle.textContent = "單字聽力測驗";
  currentProgress.textContent = "單字聽力測驗準備";
  nextListeningQuestionButton.hidden = true;
  nextListeningQuestionButton.disabled = true;
  updateRandomStatus();
  updateSearchControls();

  const source = getUniqueVocabListeningTestSource();
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-listening-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字聽力測驗";
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    "聽發音，選出正確的英文單字。",
    "每題只能播放一次，答題後不會立即顯示答案或中文意思。",
    `本次預設 ${vocabListeningTestQuestionLimit} 題；若可用單字不足，會以目前可用單字數量出題。`,
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });

  if (source.length < 4) {
    const warning = document.createElement("p");
    warning.className = "status-message quiz-status-message";
    warning.textContent = "目前可測驗的單字少於 4 筆，請調整分類、進度或搜尋條件。";
    card.append(badge, title, details, warning);
  } else {
    const startButton = document.createElement("button");
    startButton.className = "answer-button quiz-start-button";
    startButton.type = "button";
    startButton.textContent = "開始測驗";
    startButton.addEventListener("click", startVocabListeningTest);
    card.append(badge, title, details, startButton);
  }

  listeningContent.replaceChildren(card);
}

function getCurrentVocabListeningTestQuestion() {
  return vocabListeningTestQuestions[vocabListeningTestIndex] || null;
}

function playCurrentVocabListeningTestWord() {
  const question = getCurrentVocabListeningTestQuestion();
  if (!question || vocabListeningTestHasPlayedAudio) {
    return false;
  }

  const didSpeak = speakEnglishWord(getVocabularyEnglish(question.word));
  if (didSpeak) {
    vocabListeningTestHasPlayedAudio = true;
    renderVocabListeningTestQuestion();
  }
  return didSpeak;
}

function handleVocabListeningTestAnswer(option) {
  const question = getCurrentVocabListeningTestQuestion();
  if (!question || vocabListeningTestSelectedAnswer) {
    return;
  }

  const correctEnglish = getVocabularyEnglish(question.word);
  const isCorrect = option === correctEnglish;
  vocabListeningTestSelectedAnswer = option;
  if (isCorrect) {
    vocabListeningTestCorrectCount += 1;
  }
  vocabListeningTestResults.push({
    order: vocabListeningTestIndex + 1,
    word: question.word,
    userAnswer: option,
    isCorrect,
  });
  renderVocabListeningTestQuestion();
}

function goToNextVocabListeningTestQuestion() {
  stopEnglishWordAudio();
  if (!vocabListeningTestSelectedAnswer) {
    return;
  }

  if (vocabListeningTestIndex >= vocabListeningTestQuestions.length - 1) {
    renderVocabListeningTestResult();
    return;
  }

  vocabListeningTestIndex += 1;
  vocabListeningTestSelectedAnswer = "";
  vocabListeningTestHasPlayedAudio = false;
  renderVocabListeningTestQuestion();
}

function renderVocabListeningTestQuestion() {
  const question = getCurrentVocabListeningTestQuestion();
  if (!question) {
    renderVocabListeningTestStart();
    return;
  }

  listeningTitle.textContent = "單字聽力測驗";
  currentProgress.textContent = `單字聽力測驗：第 ${vocabListeningTestIndex + 1} / ${vocabListeningTestQuestions.length} 題`;
  nextListeningQuestionButton.hidden = false;
  nextListeningQuestionButton.disabled = !vocabListeningTestSelectedAnswer;
  nextListeningQuestionButton.textContent = vocabListeningTestIndex >= vocabListeningTestQuestions.length - 1 ? "查看結果" : "下一題";

  const card = document.createElement("article");
  card.className = "quiz-card gept-listening-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt gept-listening-prompt";
  const promptLabel = document.createElement("p");
  promptLabel.className = "quiz-prompt-label";
  promptLabel.textContent = `第 ${vocabListeningTestIndex + 1} / ${vocabListeningTestQuestions.length} 題｜聽發音，選出正確的英文單字`;
  const playButton = createEnglishWordAudioButton(getVocabularyEnglish(question.word), {
    disabled: vocabListeningTestHasPlayedAudio,
    onPlay: () => {
      vocabListeningTestHasPlayedAudio = true;
      renderVocabListeningTestQuestion();
    },
  });
  playButton.classList.add("gept-listening-audio-button");
  playButton.textContent = vocabListeningTestHasPlayedAudio ? "已播放" : "🔊 聽單字";
  playButton.setAttribute("aria-label", "播放本題英文單字發音（限一次）");
  prompt.append(promptLabel, playButton);

  const options = document.createElement("div");
  options.className = "quiz-options gept-listening-options";
  question.options.forEach((option, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-listening-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    optionButton.disabled = Boolean(vocabListeningTestSelectedAnswer);
    if (vocabListeningTestSelectedAnswer === option) {
      optionButton.classList.add("is-selected");
    }
    optionButton.addEventListener("click", () => handleVocabListeningTestAnswer(option));
    options.append(optionButton);
  });

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback gept-listening-feedback";
  feedback.textContent = vocabListeningTestSelectedAnswer ? "已作答，請前往下一題。" : "";

  card.append(prompt, options, feedback);
  listeningContent.replaceChildren(card);
}

function renderVocabListeningTestResult() {
  stopEnglishWordAudio();
  vocabListeningTestPhase = "result";
  listeningTitle.textContent = "單字聽力測驗結果";
  currentProgress.textContent = `單字聽力測驗完成：${vocabListeningTestQuestions.length} / ${vocabListeningTestQuestions.length}`;
  nextListeningQuestionButton.hidden = true;
  nextListeningQuestionButton.disabled = true;

  const total = vocabListeningTestResults.length;
  const accuracy = total ? Math.round((vocabListeningTestCorrectCount / total) * 100) : 0;
  const wrongResults = vocabListeningTestResults.filter((result) => !result.isCorrect);
  const endedAt = new Date().toISOString();
  recordEnglishLearningSession({
    module: "listening",
    mode: "quiz",
    totalQuestions: total,
    correctCount: vocabListeningTestCorrectCount,
    wrongCount: Math.max(0, total - vocabListeningTestCorrectCount),
    durationSeconds: vocabularyListeningTestStartedAt ? Math.max(0, Math.round((new Date(endedAt) - new Date(vocabularyListeningTestStartedAt)) / 1000)) : 0,
    startedAt: vocabularyListeningTestStartedAt || endedAt,
    endedAt,
  });
  const card = document.createElement("article");
  card.className = "quiz-card gept-listening-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字聽力測驗結果";
  const summary = document.createElement("p");
  summary.className = "article-result-message";
  summary.textContent = `分數：${vocabListeningTestCorrectCount} / ${total}｜正確率：${accuracy}%｜${accuracy >= 80 ? "很棒！繼續保持！" : "再練一次會更熟！"}`;
  const wrongTitle = document.createElement("h4");
  wrongTitle.textContent = "錯題整理";
  const wrongList = document.createElement("div");
  wrongList.className = "quiz-ready-details";

  if (!wrongResults.length) {
    const perfect = document.createElement("p");
    perfect.textContent = "全部答對，太棒了！";
    wrongList.append(perfect);
  } else {
    const list = document.createElement("ol");
    list.className = "quiz-result-list";
    wrongResults.forEach((result) => {
      const item = document.createElement("li");
      item.textContent = `第 ${result.order} 題｜正確英文單字：${getVocabularyEnglish(result.word)}｜中文意思：${getVocabularyMeaning(result.word) || "—"}｜你選的答案：${result.userAnswer}`;
      list.append(item);
    });
    wrongList.append(list);
  }

  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const retryButton = document.createElement("button");
  retryButton.className = "answer-button";
  retryButton.type = "button";
  retryButton.textContent = "再測一次";
  retryButton.addEventListener("click", startVocabListeningTest);
  const practiceButton = document.createElement("button");
  practiceButton.className = "secondary-button";
  practiceButton.type = "button";
  practiceButton.textContent = "回到單字聽力練習";
  practiceButton.addEventListener("click", () => {
    currentMode = listeningMode;
    resetListeningState();
    renderCurrentMode();
  });
  const homeLink = document.createElement("a");
  homeLink.className = "secondary-button";
  homeLink.href = "../";
  homeLink.textContent = "返回英文學習首頁";
  actions.append(retryButton, practiceButton, homeLink);
  card.append(title, summary, wrongTitle, wrongList, actions);
  listeningContent.replaceChildren(card);
}



function scrollToVocabularyQuizStart() {
  quizPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function createVocabularyQuizStartButton() {
  const startButton = document.createElement("button");
  startButton.className = "answer-button quiz-start-button";
  startButton.type = "button";
  startButton.textContent = "開始測驗";
  startButton.addEventListener("click", () => {
    if (vocabularyQuizPhase === "running") {
      return;
    }
    vocabularyQuizPhase = "running";
    updateQuizActionVisibility();
    vocabularyQuizStartedAt = new Date().toISOString();
    renderQuizQuestion();
  });
  return startButton;
}

function renderQuizPreparation() {
  clearVocabularyQuizTimer();
  vocabularyQuizPhase = "ready";
  const activeQuestions = getActiveQuizQuestions();
  const quizTypeSetting = getCurrentQuizTypeSetting();
  quizTitle.textContent = isWrongReviewMode ? `錯題複習：${quizTypeSetting.title}` : "單字測驗";
  updateQuizTypeButtons(currentQuizType);
  updateWrongQuestionControls();
  updateQuizActionVisibility();
  quizScore.textContent = "0 / 0";
  quizProgress.textContent = `0 / ${activeQuestions.length}`;
  if (currentProgress) {
    currentProgress.textContent = activeQuestions.length ? `測驗準備中：0 / ${activeQuestions.length}` : "測驗準備中：0 / 0";
  }
  nextQuizQuestionButton.disabled = true;
  reshuffleQuizVocabularyButton.disabled = false;
  reshuffleQuizVocabularyButton.textContent = isWrongReviewMode ? "重新隨機錯題" : "重新隨機";

  if (!activeQuestions.length) {
    renderEmptyQuizMessage(isWrongReviewMode ? "目前沒有錯題。" : "目前沒有可用題目");
    return;
  }

  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字測驗準備";
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    `測驗類型：單字測驗`,
    `本次測驗：${activeQuestions.length} 題`,
    `每題限時：${ENGLISH_QUIZ_TIME_LIMIT_SECONDS} 秒`,
    "請按下方按鈕開始測驗。",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  card.append(badge, title, details, createVocabularyQuizStartButton());
  quizContent.replaceChildren(card);
  updateRandomStatus();
  updateSearchControls();
}

function createVocabularyQuizResultList() {
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  vocabularyQuizResults.forEach((result) => {
    const item = document.createElement("li");
    item.textContent = `第 ${result.order} 題｜${result.question}｜你的答案：${result.userAnswer}｜正確答案：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : result.result === "timeout" ? "逾時" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderVocabularyQuizCompletePanel() {
  clearVocabularyQuizTimer();
  vocabularyQuizPhase = "complete";
  const total = vocabularyQuizResults.length;
  const wrongCount = total - quizCorrectCount;
  const accuracy = total ? Math.round((quizCorrectCount / total) * 100) : 0;
  const endedAt = new Date().toISOString();
  recordEnglishLearningSession({
    module: "vocabulary",
    mode: "quiz",
    totalQuestions: total,
    correctCount: quizCorrectCount,
    wrongCount,
    durationSeconds: vocabularyQuizStartedAt ? Math.max(0, Math.round((new Date(endedAt) - new Date(vocabularyQuizStartedAt)) / 1000)) : 0,
    startedAt: vocabularyQuizStartedAt || endedAt,
    endedAt,
  });
  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字測驗完成！";
  const summary = document.createElement("p");
  summary.className = "article-result-message";
  summary.textContent = `測驗類型：單字測驗｜總題數：${total} 題｜答對：${quizCorrectCount} 題｜答錯：${wrongCount} 題｜逾時：${vocabularyQuizTimeoutCount} 題｜正確率：${accuracy}%`;
  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const retryButton = document.createElement("button");
  retryButton.className = "answer-button";
  retryButton.type = "button";
  retryButton.textContent = "再測一次";
  retryButton.addEventListener("click", () => {
    resetQuizState();
    renderQuizPreparation();
  });
  const homeLink = document.createElement("a");
  homeLink.className = "secondary-button";
  homeLink.href = "./";
  homeLink.textContent = "返回單字入口頁";
  actions.append(retryButton, homeLink);
  card.append(title, summary, createVocabularyQuizResultList(), actions);
  quizContent.replaceChildren(card);
  nextQuizQuestionButton.disabled = true;
  reshuffleQuizVocabularyButton.disabled = false;
  quizProgress.textContent = `${total} / ${total}`;
  if (currentProgress) {
    currentProgress.textContent = `單字測驗完成：${total} / ${total}`;
  }
  updateQuizScoreDisplay();
  updateQuizActionVisibility();
}

function renderQuizQuestion() {
  stopEnglishWordAudio();

  if (vocabularyQuizPhase !== "running") {
    renderQuizPreparation();
    return;
  }
  const activeQuestions = getActiveQuizQuestions();
  const currentQuestion = activeQuestions[quizQuestionIndex];
  const activeQuizType = currentQuestion ? getQuizTypeForQuestion(currentQuestion) : currentQuizType;
  const quizTypeSetting = quizTypeSettings[activeQuizType] || getCurrentQuizTypeSetting();
  quizTitle.textContent = isWrongReviewMode ? `錯題複習：${quizTypeSetting.title}` : "單字測驗";
  updateQuizTypeButtons(activeQuizType);
  updateWrongQuestionControls();
  updateQuizActionVisibility();

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
  recordQuestionSeen(currentWord.questionId || currentWord.id, "vocabulary");
  recordWordTestSeen(currentWord.id, currentWord.word);
  renderEnglishProgressSummary();

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
  promptLabel.textContent = `單字測驗｜第 ${quizQuestionIndex + 1} / ${activeQuestions.length} 題｜剩餘 ${ENGLISH_QUIZ_TIME_LIMIT_SECONDS} 秒`;
  promptLabel.innerHTML = `單字測驗｜第 ${quizQuestionIndex + 1} / ${activeQuestions.length} 題｜剩餘 <strong id="geptQuizTimer">${ENGLISH_QUIZ_TIME_LIMIT_SECONDS}</strong> 秒`;

  const quizAudioKey = `${activeQuizType}::${currentWord.questionId || currentWord.id || currentWord.word}::${quizQuestionIndex}`;
  const wordTitleRow = createEnglishWordWithAudio(
    "h3",
    currentWord[quizTypeSetting.promptField] || "—",
    "english-word gept-quiz-word",
    {
      speechWord: currentWord.word,
      disabled: VOCAB_TEST_AUDIO_LIMIT_ONCE && vocabularyQuizPlayedAudioKeys.has(quizAudioKey),
      onPlay: (button) => {
        if (VOCAB_TEST_AUDIO_LIMIT_ONCE) {
          vocabularyQuizPlayedAudioKeys.add(quizAudioKey);
          button.disabled = true;
        }
      },
    },
  );

  const promptText = document.createElement("p");
  promptText.className = "gept-quiz-instruction";
  promptText.textContent = quizTypeSetting.instruction;

  prompt.append(promptLabel, wordTitleRow, promptText);

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

  nextQuizQuestionButton.disabled = true;
  reshuffleQuizVocabularyButton.disabled = false;
  reshuffleQuizVocabularyButton.textContent = isWrongReviewMode ? "重新隨機錯題" : "重新隨機";
  nextQuizQuestionButton.textContent = "答題後自動下一題";
  updateQuizActionVisibility();
  if (currentProgress) {
    currentProgress.textContent = isWrongReviewMode
      ? `錯題複習：${quizQuestionIndex + 1} / ${activeQuestions.length}`
      : `測驗模式：${quizQuestionIndex + 1} / ${activeQuestions.length}`;
  }
  updateQuizScoreDisplay();
  updateRandomStatus();
  updateSearchControls();
  if (!isWrongReviewMode) {
    startVocabularyQuizTimer();
  }
}

function handleQuizAnswer(selectedButton, correctAnswer) {
  if (vocabularyQuizPhase !== "running") {
    return;
  }
  const feedback = document.querySelector("#geptQuizFeedback");
  const optionButtons = quizContent.querySelectorAll(".gept-quiz-option");
  const activeQuestions = getActiveQuizQuestions();
  const currentQuestion = activeQuestions[quizQuestionIndex];
  const activeQuizType = getQuizTypeForQuestion(currentQuestion);
  const isCorrect = selectedButton.dataset.answer === correctAnswer;

  if (!quizAnsweredCurrentQuestion) {
    quizAnsweredCurrentQuestion = true;
    quizAnsweredCount += 1;

    recordQuestionAnswer(currentQuestion.questionId || currentQuestion.id, "vocabulary", isCorrect);
    recordWordTestAnswer(currentQuestion.id, currentQuestion.word, isCorrect);
    renderEnglishProgressSummary();

    if (isCorrect) {
      quizCorrectCount += 1;

      if (isWrongReviewMode) {
        removeWrongQuestion(currentQuestion);
        quizCurrentQuestionRemoved = true;
      }
    } else if (!isWrongReviewMode) {
      recordWrongQuestion(currentQuestion, activeQuizType, selectedButton.dataset.answer, correctAnswer);
    }

    if (!isWrongReviewMode) {
      vocabularyQuizResults.push({
        order: quizQuestionIndex + 1,
        question: currentQuestion[quizTypeSettings[activeQuizType].promptField],
        userAnswer: selectedButton.dataset.answer,
        correctAnswer,
        result: isCorrect ? "correct" : "wrong",
      });
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

  if (!isWrongReviewMode) {
    clearVocabularyQuizTimer();
    window.setTimeout(() => {
      if (quizQuestionIndex >= activeQuestions.length - 1) {
        renderVocabularyQuizCompletePanel();
        return;
      }
      quizQuestionIndex += 1;
      renderQuizQuestion();
    }, 650);
  }
}


function handleQuizTimeout() {
  if (vocabularyQuizPhase !== "running") {
    return;
  }
  const activeQuestions = getActiveQuizQuestions();
  const currentQuestion = activeQuestions[quizQuestionIndex];
  if (!currentQuestion || quizAnsweredCurrentQuestion || isWrongReviewMode) {
    return;
  }
  const activeQuizType = getQuizTypeForQuestion(currentQuestion);
  const quizTypeSetting = quizTypeSettings[activeQuizType] || getCurrentQuizTypeSetting();
  const correctAnswer = currentQuestion[quizTypeSetting.answerField];
  quizAnsweredCurrentQuestion = true;
  quizAnsweredCount += 1;
  vocabularyQuizTimeoutCount += 1;
  clearVocabularyQuizTimer();
  recordQuestionTimeout(currentQuestion.questionId || currentQuestion.id, "vocabulary");
  recordWordTestAnswer(currentQuestion.id, currentQuestion.word, false);
  renderEnglishProgressSummary();
  recordWrongQuestion(currentQuestion, activeQuizType, "未作答", correctAnswer);
  vocabularyQuizResults.push({
    order: quizQuestionIndex + 1,
    question: currentQuestion[quizTypeSetting.promptField],
    userAnswer: "未作答",
    correctAnswer,
    result: "timeout",
  });
  quizContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === correctAnswer);
  });
  const feedback = document.querySelector("#geptQuizFeedback");
  if (feedback) {
    feedback.classList.add("is-wrong");
    feedback.textContent = `逾時，正確答案是：${correctAnswer}`;
  }
  updateQuizScoreDisplay();
  window.setTimeout(() => {
    if (quizQuestionIndex >= activeQuestions.length - 1) {
      renderVocabularyQuizCompletePanel();
      return;
    }
    quizQuestionIndex += 1;
    renderQuizQuestion();
  }, 650);
}

previousWordButton?.addEventListener("click", () => {
  if (currentWordIndex > 0) {
    currentWordIndex -= 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

nextWordButton?.addEventListener("click", () => {
  if (currentWordIndex < filteredVocabulary.length - 1) {
    currentWordIndex += 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

toggleChineseButton?.addEventListener("click", () => {
  if (toggleChineseButton.disabled) {
    return;
  }

  chineseVisible = !chineseVisible;
  updateChineseVisibility();
});

reshuffleVocabularyButton?.addEventListener("click", () => {
  reshuffleCurrentVocabulary();
  renderCurrentMode();
});

vocabularySearchInput?.addEventListener("input", () => {
  searchQuery = normalizeSearchText(vocabularySearchInput.value);
  applySearchToCategoryVocabulary();
  renderCurrentMode();
});

clearSearchButton?.addEventListener("click", () => {
  vocabularySearchInput.value = "";
  searchQuery = "";
  resetCurrentVocabulary();
  renderCurrentMode();
});

cardModeButton?.addEventListener("click", () => {
  if (currentMode === cardMode) {
    return;
  }

  currentMode = cardMode;
  isWrongReviewMode = false;
  renderCurrentMode();
});

quizModeButton?.addEventListener("click", () => {
  if (currentMode === quizMode) {
    return;
  }

  currentMode = quizMode;
  isWrongReviewMode = false;
  resetQuizState();
  renderCurrentMode();
  scrollToVocabularyQuizStart();
});

listeningModeButton?.addEventListener("click", () => {
  if (currentMode === listeningMode) {
    return;
  }

  currentMode = listeningMode;
  isWrongReviewMode = false;
  resetQuizState();
  resetListeningState();
  renderCurrentMode();
  listeningPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
});

listeningTestModeButton?.addEventListener("click", () => {
  if (currentMode === listeningTestMode) {
    return;
  }

  currentMode = listeningTestMode;
  isWrongReviewMode = false;
  resetQuizState();
  resetListeningState();
  renderCurrentMode();
  listeningPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
});

nextListeningQuestionButton?.addEventListener("click", () => {
  if (currentMode === listeningTestMode) {
    goToNextVocabListeningTestQuestion();
    return;
  }

  goToNextListeningQuestion();
});

quizTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isWrongReviewMode || currentQuizType === button.dataset.geptQuizType) {
      return;
    }

    currentQuizType = button.dataset.geptQuizType;
    resetQuizState();
    renderQuizPreparation();
    scrollToVocabularyQuizStart();
  });
});

reshuffleQuizVocabularyButton?.addEventListener("click", () => {
  if (isWrongReviewMode) {
    wrongReviewQuestions = shuffleVocabulary(wrongQuestions);
    resetQuizState();
    renderCurrentMode();
    return;
  }

  reshuffleCurrentVocabulary();
  renderCurrentMode();
  scrollToVocabularyQuizStart();
});

nextQuizQuestionButton?.addEventListener("click", () => {
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

reviewWrongQuestionsButton?.addEventListener("click", () => {
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

returnQuizButton?.addEventListener("click", () => {
  isWrongReviewMode = false;
  reshuffleQuizVocabularyButton.textContent = "重新隨機";
  resetQuizState();
  renderCurrentMode();
});

clearWrongQuestionsButton?.addEventListener("click", () => {
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

if (resetEnglishQuizProgressButton) {
  resetEnglishQuizProgressButton.addEventListener("click", resetEnglishQuizProgressWithConfirm);
}

resetEnglishProgressButton?.addEventListener("click", () => {
  confirmResetProgressWithPassword("英文單字學習進度已清除。日文資料未受影響。", () => {
    resetEnglishVocabProgress();
    renderEnglishProgressSummary();
    applySearchToCategoryVocabulary();
    renderCurrentMode();
  });
});

window.addEventListener("pagehide", stopEnglishWordAudio);
window.addEventListener("beforeunload", () => {
  clearVocabularyQuizTimer();
  stopEnglishWordAudio();
});

if (vocabularyEntrancePanel && vocabularyAppPanel) {
  const isEntranceMode = initialVocabularyMode === "entrance";
  vocabularyEntrancePanel.hidden = !isEntranceMode;
  vocabularyAppPanel.hidden = isEntranceMode;
}

renderVocabularyTotalText();
renderEnglishProgressSummary();
renderProgressFilters();
resetCurrentVocabulary();
renderCategoryFilters();
updateWrongQuestionControls();
renderCurrentMode();
