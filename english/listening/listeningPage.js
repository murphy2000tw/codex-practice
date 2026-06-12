const listeningContent = document.querySelector("#listeningContent");
const listeningProgress = document.querySelector("#listeningProgress");
const listeningSupportMessage = document.querySelector("#listeningSupportMessage");
const listeningModeButtons = Array.from(document.querySelectorAll("[data-listening-type][data-listening-mode]"));

const listeningVocabulary = Array.isArray(geptVocabulary)
  ? geptVocabulary.filter((item) => item && typeof item.word === "string" && item.word.trim())
  : [];

const listeningSentences = [
  { id: "sentence_001", text: "I go to school by bus.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_002", text: "She is reading a book.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_003", text: "My father is a doctor.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_004", text: "The dog is under the table.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_005", text: "We have English class today.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_006", text: "He likes to play basketball.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_007", text: "There are three apples on the desk.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_008", text: "I get up at seven every morning.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_009", text: "It is sunny today.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_010", text: "Please open the window.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_011", text: "This is my new pencil.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_012", text: "Tom can ride a bike.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_013", text: "I want a glass of water.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_014", text: "The cat is sleeping on the sofa.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_015", text: "My mother cooks dinner at home.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_016", text: "We are going to the park.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_017", text: "I have two sisters.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_018", text: "He is wearing a blue jacket.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_019", text: "The bus stop is near my house.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_020", text: "May I borrow your ruler?", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_021", text: "They play soccer after school.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_022", text: "I brush my teeth before breakfast.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_023", text: "The library is on the second floor.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_024", text: "She drinks milk every morning.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_025", text: "My brother is twelve years old.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_026", text: "The teacher is writing on the board.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_027", text: "I am hungry now.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_028", text: "We eat lunch at school.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_029", text: "The shoes are under the bed.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_030", text: "Can you help me, please?", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_031", text: "I like music very much.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_032", text: "She washes her hands before dinner.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_033", text: "There is a bird in the tree.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_034", text: "He goes to bed at nine.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_035", text: "My favorite color is green.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_036", text: "The store opens at ten.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_037", text: "I can see a rainbow.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_038", text: "We need three eggs for the cake.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_039", text: "She has a red bag.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_040", text: "The boy is playing with his dog.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_041", text: "I do my homework after dinner.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_042", text: "It is time for class.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_043", text: "My grandparents live in Tainan.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_044", text: "He takes the train to Taipei.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_045", text: "The water is too hot.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_046", text: "Please write your name here.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_047", text: "I am looking for my keys.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_048", text: "We visit our uncle on Sunday.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_049", text: "The girl is singing a song.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_050", text: "This cake tastes good.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_051", text: "I need a clean shirt.", level: "GEPT Elementary", type: "sentence" },
  { id: "sentence_052", text: "She is waiting for the bus.", level: "GEPT Elementary", type: "sentence" },
];

const LISTENING_PROGRESS_KEY = "englishListeningProgress_v1";
const VOCAB_PROGRESS_KEY = "englishVocabProgress_v1";
const LISTENING_PROGRESS_VERSION = 1;
const VOCAB_PROGRESS_VERSION = 1;
const LISTENING_TEST_TARGET_COUNT = 10;
const listeningModePractice = "practice";
const listeningModeTest = "test";
const listeningTypeVocabulary = "vocabulary";
const listeningTypeSentence = "sentence";
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
let listeningType = listeningTypeVocabulary;
let practiceQuestions = [];
let practiceQuestionIndex = 0;
let practiceAnsweredCurrentQuestion = false;
let testQuestions = [];
let testQuestionIndex = 0;
let testAnsweredQuestionIds = new Set();
let testPlayedQuestionIds = new Set();
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

function getActivityConfig(type = listeningType) {
  if (type === listeningTypeSentence) {
    return {
      type: listeningTypeSentence,
      label: "句子聽力",
      practiceTitle: "句子聽力練習",
      testTitle: "句子聽力測驗",
      answerLabel: "英文句子",
      emptyMessage: "目前沒有可用的句子聽力題目",
      items: listeningSentences,
      getText: (item) => item.text,
      getSourceId: (item) => item.id || item.text,
      itemIdPrefix: "listening_sentence",
    };
  }

  return {
    type: listeningTypeVocabulary,
    label: "單字聽力",
    practiceTitle: "單字聽力練習",
    testTitle: "單字聽力測驗",
    answerLabel: "英文單字",
    emptyMessage: "目前沒有可用的單字聽力題目",
    items: listeningVocabulary,
    getText: (item) => item.word,
    getSourceId: (item) => item.word || item.id,
    itemIdPrefix: "listening_vocab",
  };
}

function getListeningItemId(item, type = listeningType) {
  const config = getActivityConfig(type);
  if (type === listeningTypeSentence && typeof item?.id === "string" && item.id.trim()) {
    return `listening_${item.id.trim()}`;
  }
  const source = String(config.getSourceId(item) || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${config.itemIdPrefix}_${source || type}`;
}

function normalizeListeningItem(record = {}, itemId = "", text = "", type = listeningTypeVocabulary) {
  const normalizedType = futureListeningTypes.includes(record.type) ? record.type : type;
  return {
    itemId: record.itemId || itemId,
    type: normalizedType,
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
      normalized.items[itemId] = normalizeListeningItem(record, itemId, record.text || "", record.type || listeningTypeVocabulary);
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

function updateListeningProgress(item, type, updater) {
  const config = getActivityConfig(type);
  const progress = loadListeningProgress();
  const itemId = getListeningItemId(item, type);
  const text = config.getText(item);
  const now = new Date().toISOString();
  const current = normalizeListeningItem(progress.items[itemId], itemId, text, type);
  const next = updater(current, now) || current;
  next.itemId = itemId;
  next.type = type;
  next.text = text;
  progress.items[itemId] = next;
  progress.updatedAt = now;
  return saveListeningProgress(progress).items[itemId];
}

function recordListeningSeen(item, type = listeningType) {
  return updateListeningProgress(item, type, (record, now) => ({
    ...record,
    seenCount: normalizeListeningNumber(record.seenCount) + 1,
    lastSeenAt: now,
  }));
}

function recordListeningPlay(item, mode, type = listeningType) {
  return updateListeningProgress(item, type, (record) => ({
    ...record,
    practicePlayCount: normalizeListeningNumber(record.practicePlayCount) + (mode === listeningModePractice ? 1 : 0),
    testPlayCount: normalizeListeningNumber(record.testPlayCount) + (mode === listeningModeTest ? 1 : 0),
  }));
}

function recordListeningAnswer(item, isCorrect, type = listeningType) {
  return updateListeningProgress(item, type, (record, now) => ({
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

function getItemText(item, type = listeningType) {
  return getActivityConfig(type).getText(item);
}

function getListeningOptions(currentItem, type = listeningType) {
  const config = getActivityConfig(type);
  const correctAnswer = config.getText(currentItem);
  const distractors = shuffleListeningItems(config.items)
    .map((item) => config.getText(item))
    .filter((text) => text && text !== correctAnswer);
  return shuffleListeningItems([correctAnswer, ...new Set(distractors)].slice(0, 4));
}

function selectListeningTestQuestions(type = listeningType) {
  const config = getActivityConfig(type);
  const availableQuestions = shuffleListeningItems(config.items).slice(0);
  if (availableQuestions.length <= LISTENING_TEST_TARGET_COUNT) {
    return availableQuestions;
  }

  const progress = loadListeningProgress();
  const wrongPool = [];
  const answeredPool = [];
  const unseenPool = [];

  availableQuestions.forEach((item) => {
    const itemId = getListeningItemId(item, type);
    const record = normalizeListeningItem(progress.items[itemId], itemId, config.getText(item), type);
    if (record.type !== type) {
      unseenPool.push(item);
      return;
    }
    if (record.wrongCount > 0) {
      wrongPool.push(item);
      return;
    }
    if (record.answeredCount > 0 || record.seenCount > 0) {
      answeredPool.push(item);
      return;
    }
    unseenPool.push(item);
  });

  const selectedIds = new Set();
  const selected = [];
  const addFromPool = (pool, count) => {
    shuffleListeningItems(pool).forEach((item) => {
      const itemId = getListeningItemId(item, type);
      if (selected.length >= LISTENING_TEST_TARGET_COUNT || count <= 0 || selectedIds.has(itemId)) {
        return;
      }
      selectedIds.add(itemId);
      selected.push(item);
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
  listeningModeButtons.forEach((button) => {
    const isActive = button.dataset.listeningType === listeningType && button.dataset.listeningMode === listeningMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCurrentMode() {
  cancelEnglishSpeech();
  updateModeButtons();
  updateSpeechSupportMessage();

  const config = getActivityConfig();
  if (!config.items.length) {
    listeningProgress.textContent = `${config.label}：0 / 0`;
    listeningContent.replaceChildren(createEmptyMessage(config.emptyMessage));
    return;
  }

  if (listeningMode === listeningModePractice) {
    renderPracticePreparation();
    return;
  }

  renderTestPreparation();
}

function resetPracticeState() {
  practiceQuestions = shuffleListeningItems(getActivityConfig().items);
  practiceQuestionIndex = 0;
  practiceAnsweredCurrentQuestion = false;
}

function renderPracticePreparation() {
  testPhase = "ready";
  const config = getActivityConfig();
  listeningProgress.textContent = `${config.practiceTitle}：0 / ${config.items.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "練習準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.practiceTitle;
  const details = document.createElement("div");
  details.className = "quiz-ready-details";
  [
    `請聽音訊後選出正確${config.answerLabel}`,
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

function playPracticeItem(item) {
  if (speakEnglish(getItemText(item))) {
    recordListeningPlay(item, listeningModePractice);
  }
}

function renderPracticeQuestion() {
  cancelEnglishSpeech();
  const config = getActivityConfig();
  const currentItem = practiceQuestions[practiceQuestionIndex];
  if (!currentItem) {
    renderPracticePreparation();
    return;
  }

  recordListeningSeen(currentItem);
  practiceAnsweredCurrentQuestion = false;
  const practiceCurrentOptions = getListeningOptions(currentItem);
  listeningProgress.textContent = `${config.practiceTitle}：${practiceQuestionIndex + 1} / ${practiceQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `${config.practiceTitle}｜第 ${practiceQuestionIndex + 1} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = `請聽音訊後選出正確${config.answerLabel}。`;
  const playButton = createModeActionButton("播放音訊 / 再聽一次", () => playPracticeItem(currentItem), "secondary-button listening-play-button");
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
    optionButton.addEventListener("click", () => handlePracticeAnswer(optionButton, currentItem, feedback));
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

function handlePracticeAnswer(selectedButton, currentItem, feedback) {
  if (practiceAnsweredCurrentQuestion) {
    return;
  }

  const config = getActivityConfig();
  const correctAnswer = getItemText(currentItem);
  practiceAnsweredCurrentQuestion = true;
  const isCorrect = selectedButton.dataset.answer === correctAnswer;
  recordListeningAnswer(currentItem, isCorrect);

  listeningContent.querySelectorAll(".gept-quiz-option").forEach((button) => {
    const buttonIsCorrect = button.dataset.answer === correctAnswer;
    button.classList.toggle("is-correct", buttonIsCorrect);
    button.classList.toggle("is-wrong", button === selectedButton && !buttonIsCorrect);
    button.disabled = true;
  });

  feedback.classList.toggle("is-correct", isCorrect);
  feedback.classList.toggle("is-wrong", !isCorrect);
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確${config.answerLabel}是：${correctAnswer}`;
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
  testResults = [];
  testCorrectCount = 0;
  testPhase = "ready";
}

function renderTestPreparation() {
  resetTestState();
  const config = getActivityConfig();
  listeningProgress.textContent = `${config.testTitle}準備中：0 / ${testQuestions.length}`;
  const card = document.createElement("article");
  card.className = "quiz-card quiz-ready-card gept-quiz-card";
  const badge = document.createElement("span");
  badge.className = "card-number";
  badge.textContent = "測驗準備";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.testTitle;
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

function playTestItemOnce(item) {
  const itemId = getListeningItemId(item);
  if (testPlayedQuestionIds.has(itemId)) {
    return;
  }
  testPlayedQuestionIds.add(itemId);
  if (speakEnglish(getItemText(item))) {
    recordListeningPlay(item, listeningModeTest);
  }
}

function renderTestQuestion() {
  cancelEnglishSpeech();
  if (testPhase !== "running") {
    renderTestPreparation();
    return;
  }

  const config = getActivityConfig();
  const currentItem = testQuestions[testQuestionIndex];
  if (!currentItem) {
    renderTestCompletePanel();
    return;
  }

  recordListeningSeen(currentItem);
  const testCurrentOptions = getListeningOptions(currentItem);
  listeningProgress.textContent = `${config.testTitle}：${testQuestionIndex + 1} / ${testQuestions.length}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const prompt = document.createElement("div");
  prompt.className = "quiz-prompt";
  const label = document.createElement("p");
  label.className = "quiz-prompt-label";
  label.textContent = `${config.testTitle}｜第 ${testQuestionIndex + 1} / ${testQuestions.length} 題`;
  const instruction = document.createElement("p");
  instruction.className = "gept-quiz-instruction";
  instruction.textContent = `請聽音訊後選出正確${config.answerLabel}。`;
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
    optionButton.addEventListener("click", () => handleTestAnswer(optionButton, currentItem));
    options.append(optionButton);
  });

  card.append(prompt, options);
  listeningContent.replaceChildren(card);
  playTestItemOnce(currentItem);
}

function handleTestAnswer(selectedButton, currentItem) {
  if (testPhase !== "running") {
    return;
  }

  const itemId = getListeningItemId(currentItem);
  if (testAnsweredQuestionIds.has(itemId)) {
    return;
  }

  const correctAnswer = getItemText(currentItem);
  testAnsweredQuestionIds.add(itemId);
  const selectedAnswer = selectedButton.dataset.answer;
  const isCorrect = selectedAnswer === correctAnswer;
  recordListeningAnswer(currentItem, isCorrect);
  if (listeningType === listeningTypeVocabulary) {
    syncListeningTestAnswerToVocabProgress(currentItem, isCorrect);
  }

  if (isCorrect) {
    testCorrectCount += 1;
  }

  testResults.push({
    order: testQuestionIndex + 1,
    userAnswer: selectedAnswer,
    correctAnswer,
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
  const config = getActivityConfig();
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  testResults.forEach((result) => {
    const item = document.createElement("li");
    item.textContent = `第 ${result.order} 題｜你的答案：${result.userAnswer}｜正確${config.answerLabel}：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderTestCompletePanel() {
  cancelEnglishSpeech();
  testPhase = "complete";
  const config = getActivityConfig();
  const total = testResults.length;
  const wrongCount = total - testCorrectCount;
  const accuracy = total ? Math.round((testCorrectCount / total) * 100) : 0;
  listeningProgress.textContent = `${config.testTitle}完成：${total} / ${total}`;

  const card = document.createElement("article");
  card.className = "quiz-card gept-quiz-card";
  const title = document.createElement("h3");
  title.className = "quiz-title";
  title.textContent = config.testTitle;
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

function setListeningActivity(type, mode) {
  if (listeningType === type && listeningMode === mode) {
    return;
  }
  listeningType = type;
  listeningMode = mode;
  window.location.hash = `${type}-${mode}`;
  renderCurrentMode();
}

function parseListeningHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "test") {
    return { type: listeningTypeVocabulary, mode: listeningModeTest };
  }
  if (hash === "practice") {
    return { type: listeningTypeVocabulary, mode: listeningModePractice };
  }
  const [type, mode] = hash.split("-");
  return {
    type: type === listeningTypeSentence ? listeningTypeSentence : listeningTypeVocabulary,
    mode: mode === listeningModeTest ? listeningModeTest : listeningModePractice,
  };
}

listeningModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setListeningActivity(button.dataset.listeningType, button.dataset.listeningMode);
  });
});

window.addEventListener("beforeunload", cancelEnglishSpeech);
window.addEventListener("hashchange", () => {
  const nextActivity = parseListeningHash();
  if (nextActivity.type !== listeningType || nextActivity.mode !== listeningMode) {
    listeningType = nextActivity.type;
    listeningMode = nextActivity.mode;
    renderCurrentMode();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelEnglishSpeech();
  }
});

const initialActivity = parseListeningHash();
listeningType = initialActivity.type;
listeningMode = initialActivity.mode;
renderCurrentMode();
