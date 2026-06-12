const listeningContent = document.querySelector("#listeningContent");
const listeningProgress = document.querySelector("#listeningProgress");
const listeningSupportMessage = document.querySelector("#listeningSupportMessage");
const practiceModeButton = document.querySelector("#wordListeningPracticeMode");
const testModeButton = document.querySelector("#wordListeningTestMode");

const listeningVocabulary = Array.isArray(geptVocabulary)
  ? geptVocabulary.filter((item) => item && typeof item.word === "string" && item.word.trim())
  : [];
const LISTENING_PROGRESS_KEY = "englishListeningProgress_v1";
const VOCAB_PROGRESS_KEY = "englishVocabProgress_v1";
const LISTENING_PROGRESS_VERSION = 1;
const VOCAB_PROGRESS_VERSION = 1;
const LISTENING_TEST_TARGET_COUNT = 10;
const listeningModePractice = "practice";
const listeningModeTest = "test";
const listeningTypeVocabulary = "vocabulary";
const futureListeningTypes = [
  "vocabulary",
  "sentence",
  "qa",
  "geptPicture",
  "geptQuestionResponse",
  "geptConversation",
  "geptShortTalk",
  "geptFullMock",
];

let listeningMode = listeningModePractice;
let practiceQuestions = [];
let practiceQuestionIndex = 0;
let practiceAnsweredCurrentQuestion = false;
let practiceCurrentOptions = [];
let testQuestions = [];
let testQuestionIndex = 0;
let testAnsweredQuestionIds = new Set();
let testPlayedQuestionIds = new Set();
let testCurrentOptions = [];
let testResults = [];
let testCorrectCount = 0;
let testPhase = "ready";

function canUseListeningLocalStorage() {
  try {
    const testKey = `${LISTENING_PROGRESS_KEY}_test`;
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function createEmptyListeningProgress() {
  return {
    version: LISTENING_PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
    items: {},
  };
}

function normalizeListeningNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function getListeningItemId(word) {
  const source = String(word?.word || word?.id || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `listening_vocab_${source || "word"}`;
}

function normalizeListeningItem(record = {}, itemId = "", text = "") {
  return {
    itemId: record.itemId || itemId,
    type: futureListeningTypes.includes(record.type) ? record.type : listeningTypeVocabulary,
    text: record.text || text,
    seenCount: normalizeListeningNumber(record.seenCount),
    answeredCount: normalizeListeningNumber(record.answeredCount),
    correctCount: normalizeListeningNumber(record.correctCount),
    wrongCount: normalizeListeningNumber(record.wrongCount),
    practicePlayCount: normalizeListeningNumber(record.practicePlayCount),
    testPlayCount: normalizeListeningNumber(record.testPlayCount),
    lastSeenAt: typeof record.lastSeenAt === "string" ? record.lastSeenAt : null,
    lastAnsweredAt: typeof record.lastAnsweredAt === "string" ? record.lastAnsweredAt : null,
  };
}

function normalizeListeningProgress(progress) {
  const normalized = createEmptyListeningProgress();
  normalized.updatedAt = typeof progress?.updatedAt === "string" ? progress.updatedAt : normalized.updatedAt;

  if (progress?.items && typeof progress.items === "object" && !Array.isArray(progress.items)) {
    Object.entries(progress.items).forEach(([itemId, record]) => {
      if (!itemId || !record || typeof record !== "object" || Array.isArray(record)) {
        return;
      }
      normalized.items[itemId] = normalizeListeningItem(record, itemId, record.text || "");
    });
  }

  return normalized;
}

function loadListeningProgress() {
  const emptyProgress = createEmptyListeningProgress();

  if (!canUseListeningLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(LISTENING_PROGRESS_KEY);
    if (!storedProgress) {
      window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);
    if (!parsedProgress || parsedProgress.version !== LISTENING_PROGRESS_VERSION) {
      throw new Error("Invalid listening progress data");
    }

    const normalizedProgress = normalizeListeningProgress(parsedProgress);
    window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(normalizedProgress));
    return normalizedProgress;
  } catch (error) {
    try {
      window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(emptyProgress));
    } catch (storageError) {
      // Listening remains usable even when localStorage is unavailable.
    }
    return emptyProgress;
  }
}

function saveListeningProgress(progress) {
  const normalizedProgress = normalizeListeningProgress(progress);
  if (!canUseListeningLocalStorage()) {
    return normalizedProgress;
  }

  try {
    window.localStorage.setItem(LISTENING_PROGRESS_KEY, JSON.stringify(normalizedProgress));
  } catch (error) {
    // Listening records are optional; keep the activity usable.
  }

  return normalizedProgress;
}

function updateListeningProgress(word, updater) {
  const progress = loadListeningProgress();
  const itemId = getListeningItemId(word);
  const now = new Date().toISOString();
  const current = normalizeListeningItem(progress.items[itemId], itemId, word.word);
  const next = updater(current, now) || current;
  next.itemId = itemId;
  next.type = listeningTypeVocabulary;
  next.text = word.word;
  progress.items[itemId] = next;
  progress.updatedAt = now;
  return saveListeningProgress(progress).items[itemId];
}

function recordListeningSeen(word) {
  return updateListeningProgress(word, (record, now) => ({
    ...record,
    seenCount: normalizeListeningNumber(record.seenCount) + 1,
    lastSeenAt: now,
  }));
}

function recordListeningPlay(word, mode) {
  return updateListeningProgress(word, (record) => ({
    ...record,
    practicePlayCount: normalizeListeningNumber(record.practicePlayCount) + (mode === listeningModePractice ? 1 : 0),
    testPlayCount: normalizeListeningNumber(record.testPlayCount) + (mode === listeningModeTest ? 1 : 0),
  }));
}

function recordListeningAnswer(word, isCorrect) {
  return updateListeningProgress(word, (record, now) => ({
    ...record,
    answeredCount: normalizeListeningNumber(record.answeredCount) + 1,
    correctCount: normalizeListeningNumber(record.correctCount) + (isCorrect ? 1 : 0),
    wrongCount: normalizeListeningNumber(record.wrongCount) + (isCorrect ? 0 : 1),
    lastAnsweredAt: now,
  }));
}

function loadVocabProgress() {
  const emptyProgress = {
    version: VOCAB_PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
    words: {},
  };

  if (!canUseListeningLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(VOCAB_PROGRESS_KEY);
    if (!storedProgress) {
      window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);
    if (!parsedProgress || parsedProgress.version !== VOCAB_PROGRESS_VERSION || typeof parsedProgress.words !== "object" || Array.isArray(parsedProgress.words)) {
      throw new Error("Invalid vocabulary progress data");
    }
    return parsedProgress;
  } catch (error) {
    try {
      window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(emptyProgress));
    } catch (storageError) {
      // Keep listening usable when storage fails.
    }
    return emptyProgress;
  }
}

function normalizeVocabProgressNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function calculateVocabStatus(record) {
  const practiceCount = normalizeVocabProgressNumber(record.practiceCount);
  const testSeenCount = normalizeVocabProgressNumber(record.testSeenCount);
  const testCorrectCount = normalizeVocabProgressNumber(record.testCorrectCount);

  if (practiceCount === 0 && testSeenCount === 0) {
    return "new";
  }

  if (practiceCount >= 6 && testCorrectCount >= 6) {
    return "known";
  }

  return "learning";
}

function syncListeningTestAnswerToVocabProgress(word, isCorrect) {
  if (!word?.id && !word?.word) {
    return;
  }

  const progress = loadVocabProgress();
  const wordKey = String(word.id || word.word || "").trim();
  if (!wordKey) {
    return;
  }

  const now = new Date().toISOString();
  const current = progress.words[wordKey] && typeof progress.words[wordKey] === "object" && !Array.isArray(progress.words[wordKey])
    ? progress.words[wordKey]
    : {};
  const nextRecord = {
    word: current.word || word.word || wordKey,
    practiceCount: normalizeVocabProgressNumber(current.practiceCount ?? current.studyCount),
    testSeenCount: normalizeVocabProgressNumber(current.testSeenCount ?? 0) + 1,
    testCorrectCount: normalizeVocabProgressNumber(current.testCorrectCount ?? current.correctCount) + (isCorrect ? 1 : 0),
    testWrongCount: normalizeVocabProgressNumber(current.testWrongCount ?? current.wrongCount) + (isCorrect ? 0 : 1),
    status: "new",
    firstStudiedAt: current.firstStudiedAt || now,
    lastStudiedAt: current.lastStudiedAt || null,
    lastTestedAt: now,
  };
  nextRecord.status = calculateVocabStatus(nextRecord);
  progress.words[wordKey] = nextRecord;
  progress.updatedAt = now;

  if (!canUseListeningLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    // Vocab sync is optional; do not block listening.
  }
}

function shuffleListeningItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function getListeningOptions(currentWord) {
  const correctAnswer = currentWord.word;
  const distractors = shuffleListeningItems(listeningVocabulary)
    .filter((word) => word.word && word.word !== correctAnswer)
    .map((word) => word.word);
  return shuffleListeningItems([correctAnswer, ...new Set(distractors)].slice(0, 4));
}

function selectListeningTestQuestions() {
  const availableQuestions = shuffleListeningItems(listeningVocabulary).slice(0);
  if (availableQuestions.length <= LISTENING_TEST_TARGET_COUNT) {
    return availableQuestions;
  }

  const progress = loadListeningProgress();
  const wrongPool = [];
  const answeredPool = [];
  const unseenPool = [];

  availableQuestions.forEach((word) => {
    const record = normalizeListeningItem(progress.items[getListeningItemId(word)], getListeningItemId(word), word.word);
    if (record.wrongCount > 0) {
      wrongPool.push(word);
      return;
    }
    if (record.answeredCount > 0 || record.seenCount > 0) {
      answeredPool.push(word);
      return;
    }
    unseenPool.push(word);
  });

  const selectedIds = new Set();
  const selected = [];
  const addFromPool = (pool, count) => {
    shuffleListeningItems(pool).forEach((word) => {
      if (selected.length >= LISTENING_TEST_TARGET_COUNT || count <= 0 || selectedIds.has(getListeningItemId(word))) {
        return;
      }
      selectedIds.add(getListeningItemId(word));
      selected.push(word);
      count -= 1;
    });
  };

  addFromPool(wrongPool, 2);
  addFromPool(answeredPool, 2);
  addFromPool(unseenPool, LISTENING_TEST_TARGET_COUNT - selected.length);
  addFromPool([...wrongPool, ...answeredPool, ...unseenPool], LISTENING_TEST_TARGET_COUNT - selected.length);
  return shuffleListeningItems(selected).slice(0, LISTENING_TEST_TARGET_COUNT);
}

function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

function cancelEnglishSpeech() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

function updateSpeechSupportMessage() {
  const supported = isSpeechSynthesisSupported();
  listeningSupportMessage.hidden = supported;
  listeningSupportMessage.textContent = supported
    ? ""
    : "此瀏覽器不支援語音播放，請改用 Chrome、Safari 或 Edge。";
  return supported;
}

function speakEnglish(text, options = {}) {
  if (!updateSpeechSupportMessage()) {
    return false;
  }

  cancelEnglishSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function createEmptyMessage(message) {
  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const status = document.createElement("p");
  status.className = "status-message quiz-status-message";
  status.textContent = message;
  card.append(status);
  return card;
}

function createModeActionButton(label, onClick, className = "answer-button") {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function updateModeButtons() {
  const isPracticeMode = listeningMode === listeningModePractice;
  practiceModeButton.classList.toggle("is-active", isPracticeMode);
  practiceModeButton.setAttribute("aria-pressed", String(isPracticeMode));
  testModeButton.classList.toggle("is-active", !isPracticeMode);
  testModeButton.setAttribute("aria-pressed", String(!isPracticeMode));
}

function renderCurrentMode() {
  cancelEnglishSpeech();
  updateModeButtons();
  updateSpeechSupportMessage();

  if (!listeningVocabulary.length) {
    listeningProgress.textContent = "單字聽力：0 / 0";
    listeningContent.replaceChildren(createEmptyMessage("目前沒有可用的單字聽力題目"));
    return;
  }

  if (listeningMode === listeningModePractice) {
    renderPracticePreparation();
    return;
  }

  renderTestPreparation();
}

function resetPracticeState() {
  practiceQuestions = shuffleListeningItems(listeningVocabulary);
  practiceQuestionIndex = 0;
  practiceAnsweredCurrentQuestion = false;
  practiceCurrentOptions = [];
}

function renderPracticePreparation() {
  testPhase = "ready";
  listeningProgress.textContent = `單字聽力練習：0 / ${listeningVocabulary.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "練習準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字聽力練習";
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    "請聽音訊後選出正確英文單字",
    "播放次數不限，可以重複聆聽",
    "不設定答題秒數",
    "不顯示中文提示",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  card.append(badge, title, details, createModeActionButton("開始練習", () => {
    resetPracticeState();
    renderPracticeQuestion();
  }));
  listeningContent.replaceChildren(card);
}

function playPracticeWord(word) {
  if (speakEnglish(word.word)) {
    recordListeningPlay(word, listeningModePractice);
  }
}

function renderPracticeQuestion() {
  cancelEnglishSpeech();
  const currentWord = practiceQuestions[practiceQuestionIndex];
  if (!currentWord) {
    renderPracticePreparation();
    return;
  }

  recordListeningSeen(currentWord);
  practiceAnsweredCurrentQuestion = false;
  practiceCurrentOptions = getListeningOptions(currentWord);
  listeningProgress.textContent = `單字聽力練習：${practiceQuestionIndex + 1} / ${practiceQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `單字聽力練習｜第 ${practiceQuestionIndex + 1} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = "請聽音訊後選出正確英文單字。";
  const playButton = createModeActionButton("播放音訊 / 再聽一次", () => playPracticeWord(currentWord), "secondary-button listening-play-button");
  prompt.append(label, instruction, playButton);

  const options = document.createElement("div");
  options.className = "quiz-options gept-quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  practiceCurrentOptions.forEach((answer, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-quiz-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    optionButton.dataset.answer = answer;
    optionButton.addEventListener("click", () => handlePracticeAnswer(optionButton, currentWord, feedback));
    options.append(optionButton);
  });

  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const nextButton = createModeActionButton("下一題", () => {
    practiceQuestionIndex = practiceQuestionIndex >= practiceQuestions.length - 1 ? 0 : practiceQuestionIndex + 1;
    renderPracticeQuestion();
  });
  nextButton.disabled = true;
  nextButton.id = "nextListeningPracticeQuestion";
  actions.append(nextButton);

  card.append(prompt, options, feedback, actions);
  listeningContent.replaceChildren(card);
}

function handlePracticeAnswer(selectedButton, currentWord, feedback) {
  if (practiceAnsweredCurrentQuestion) {
    return;
  }

  practiceAnsweredCurrentQuestion = true;
  const isCorrect = selectedButton.dataset.answer === currentWord.word;
  recordListeningAnswer(currentWord, isCorrect);

  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    const buttonIsCorrect = button.dataset.answer === currentWord.word;
    button.classList.toggle("is-correct", buttonIsCorrect);
    button.classList.toggle("is-wrong", button === selectedButton && !buttonIsCorrect);
    button.disabled = true;
  });

  feedback.classList.toggle("is-correct", isCorrect);
  feedback.classList.toggle("is-wrong", !isCorrect);
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確英文答案是：${currentWord.word}`;
  const nextButton = document.querySelector("#nextListeningPracticeQuestion");
  if (nextButton) {
    nextButton.disabled = false;
  }
}

function resetTestState() {
  cancelEnglishSpeech();
  testQuestions = selectListeningTestQuestions();
  testQuestionIndex = 0;
  testAnsweredQuestionIds = new Set();
  testPlayedQuestionIds = new Set();
  testCurrentOptions = [];
  testResults = [];
  testCorrectCount = 0;
  testPhase = "ready";
}

function renderTestPreparation() {
  resetTestState();
  listeningProgress.textContent = `單字聽力測驗準備中：0 / ${testQuestions.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字聽力測驗";
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    `本次測驗：${testQuestions.length} 題`,
    "音訊只能播放一次",
    "不顯示中文提示",
    "不設定答題秒數",
  ].forEach((text) => {
    const item = document.createElement("p");
    item.textContent = text;
    details.append(item);
  });
  card.append(badge, title, details, createModeActionButton("開始測驗", () => {
    if (testPhase === "running") {
      return;
    }
    testPhase = "running";
    renderTestQuestion();
  }));
  listeningContent.replaceChildren(card);
}

function playTestWordOnce(word) {
  const itemId = getListeningItemId(word);
  if (testPlayedQuestionIds.has(itemId)) {
    return;
  }
  testPlayedQuestionIds.add(itemId);
  if (speakEnglish(word.word)) {
    recordListeningPlay(word, listeningModeTest);
  }
}

function renderTestQuestion() {
  cancelEnglishSpeech();
  if (testPhase !== "running") {
    renderTestPreparation();
    return;
  }

  const currentWord = testQuestions[testQuestionIndex];
  if (!currentWord) {
    renderTestCompletePanel();
    return;
  }

  recordListeningSeen(currentWord);
  testCurrentOptions = getListeningOptions(currentWord);
  listeningProgress.textContent = `單字聽力測驗：${testQuestionIndex + 1} / ${testQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `單字聽力測驗｜第 ${testQuestionIndex + 1} / ${testQuestions.length} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = "請聽音訊後選出正確英文單字。";
  const playStatus = document.createElement("p");
  playStatus.className = "listening-play-status";
  playStatus.textContent = "音訊已播放一次，請作答。";
  prompt.append(label, instruction, playStatus);

  const options = document.createElement("div");
  options.className = "quiz-options gept-quiz-options";
  testCurrentOptions.forEach((answer, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option gept-quiz-option";
    optionButton.type = "button";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    optionButton.dataset.answer = answer;
    optionButton.addEventListener("click", () => handleTestAnswer(optionButton, currentWord));
    options.append(optionButton);
  });

  card.append(prompt, options);
  listeningContent.replaceChildren(card);
  playTestWordOnce(currentWord);
}

function handleTestAnswer(selectedButton, currentWord) {
  if (testPhase !== "running") {
    return;
  }

  const itemId = getListeningItemId(currentWord);
  if (testAnsweredQuestionIds.has(itemId)) {
    return;
  }

  testAnsweredQuestionIds.add(itemId);
  const selectedAnswer = selectedButton.dataset.answer;
  const isCorrect = selectedAnswer === currentWord.word;
  recordListeningAnswer(currentWord, isCorrect);
  syncListeningTestAnswerToVocabProgress(currentWord, isCorrect);

  if (isCorrect) {
    testCorrectCount += 1;
  }

  testResults.push({
    order: testQuestionIndex + 1,
    userAnswer: selectedAnswer,
    correctAnswer: currentWord.word,
    result: isCorrect ? "correct" : "wrong",
  });

  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    button.disabled = true;
  });

  window.setTimeout(() => {
    if (testQuestionIndex >= testQuestions.length - 1) {
      renderTestCompletePanel();
      return;
    }
    testQuestionIndex += 1;
    renderTestQuestion();
  }, 450);
}

function createTestResultList() {
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  testResults.forEach((result) => {
    const item = document.createElement("li");
    item.textContent = `第 ${result.order} 題｜你的答案：${result.userAnswer}｜正確英文單字：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderTestCompletePanel() {
  cancelEnglishSpeech();
  testPhase = "complete";
  const total = testResults.length;
  const wrongCount = total - testCorrectCount;
  const accuracy = total ? Math.round((testCorrectCount / total) * 100) : 0;
  listeningProgress.textContent = `單字聽力測驗完成：${total} / ${total}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = "單字聽力測驗";
  const summary = document.createElement("p");
  summary.className = "article-result-message";
  summary.textContent = `總題數：${total} 題｜答對：${testCorrectCount} 題｜答錯：${wrongCount} 題｜正確率：${accuracy}%`;
  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const retryButton = createModeActionButton("再測一次", renderTestPreparation);
  const homeLink = document.createElement("a");
  homeLink.className = "secondary-button";
  homeLink.href = "../";
  homeLink.textContent = "回英文學習首頁";
  actions.append(retryButton, homeLink);
  card.append(title, summary, createTestResultList(), actions);
  listeningContent.replaceChildren(card);
}

practiceModeButton.addEventListener("click", () => {
  if (listeningMode === listeningModePractice) {
    return;
  }
  listeningMode = listeningModePractice;
  window.location.hash = "practice";
  renderCurrentMode();
});

testModeButton.addEventListener("click", () => {
  if (listeningMode === listeningModeTest) {
    return;
  }
  listeningMode = listeningModeTest;
  window.location.hash = "test";
  renderCurrentMode();
});

window.addEventListener("beforeunload", cancelEnglishSpeech);
window.addEventListener("hashchange", () => {
  const nextMode = window.location.hash === "#test" ? listeningModeTest : listeningModePractice;
  if (nextMode !== listeningMode) {
    listeningMode = nextMode;
    renderCurrentMode();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelEnglishSpeech();
  }
});

listeningMode = window.location.hash === "#test" ? listeningModeTest : listeningModePractice;
renderCurrentMode();
