const ENGLISH_QUIZ_STORAGE_KEY = "englishQuizProgress_v1";
const ENGLISH_QUIZ_PROGRESS_VERSION = 1;
const ENGLISH_QUIZ_TARGET_COUNT = 10;
const ENGLISH_QUIZ_TIME_LIMIT_SECONDS = 10;

function createEmptyEnglishQuizProgress() {
  return {
    version: ENGLISH_QUIZ_PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
    questions: {},
  };
}

function canUseEnglishQuizLocalStorage() {
  try {
    const testKey = `${ENGLISH_QUIZ_STORAGE_KEY}_test`;
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function normalizeQuizNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
}

function normalizeEnglishQuizQuestionProgress(record, questionId, category) {
  const source = record && typeof record === "object" ? record : {};
  return {
    questionId: String(source.questionId || questionId),
    category: String(source.category || category),
    seenCount: normalizeQuizNumber(source.seenCount),
    answeredCount: normalizeQuizNumber(source.answeredCount),
    correctCount: normalizeQuizNumber(source.correctCount),
    wrongCount: normalizeQuizNumber(source.wrongCount),
    timeoutCount: normalizeQuizNumber(source.timeoutCount),
    lastSeenAt: typeof source.lastSeenAt === "string" ? source.lastSeenAt : "",
    lastAnsweredAt: typeof source.lastAnsweredAt === "string" ? source.lastAnsweredAt : "",
  };
}

function normalizeEnglishQuizProgress(progress) {
  const normalized = createEmptyEnglishQuizProgress();
  normalized.updatedAt = typeof progress?.updatedAt === "string" ? progress.updatedAt : normalized.updatedAt;

  if (progress?.questions && typeof progress.questions === "object" && !Array.isArray(progress.questions)) {
    Object.entries(progress.questions).forEach(([questionId, record]) => {
      if (!questionId) {
        return;
      }
      const normalizedRecord = normalizeEnglishQuizQuestionProgress(record, questionId, record?.category || "");
      normalized.questions[questionId] = normalizedRecord;
    });
  }

  return normalized;
}

function loadEnglishQuizProgress() {
  const emptyProgress = createEmptyEnglishQuizProgress();

  if (!canUseEnglishQuizLocalStorage()) {
    return emptyProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(ENGLISH_QUIZ_STORAGE_KEY);

    if (!storedProgress) {
      window.localStorage.setItem(ENGLISH_QUIZ_STORAGE_KEY, JSON.stringify(emptyProgress));
      return emptyProgress;
    }

    const parsedProgress = JSON.parse(storedProgress);
    if (!parsedProgress || parsedProgress.version !== ENGLISH_QUIZ_PROGRESS_VERSION) {
      throw new Error("Invalid English quiz progress data");
    }

    const normalizedProgress = normalizeEnglishQuizProgress(parsedProgress);
    window.localStorage.setItem(ENGLISH_QUIZ_STORAGE_KEY, JSON.stringify(normalizedProgress));
    return normalizedProgress;
  } catch (error) {
    try {
      window.localStorage.setItem(ENGLISH_QUIZ_STORAGE_KEY, JSON.stringify(emptyProgress));
    } catch (storageError) {
      // Progress is optional; keep the quiz usable when storage is unavailable.
    }
    return emptyProgress;
  }
}

function saveEnglishQuizProgress(progress) {
  const normalizedProgress = normalizeEnglishQuizProgress(progress);
  if (!canUseEnglishQuizLocalStorage()) {
    return normalizedProgress;
  }

  try {
    window.localStorage.setItem(ENGLISH_QUIZ_STORAGE_KEY, JSON.stringify(normalizedProgress));
  } catch (error) {
    // Ignore storage failures so quiz flow can continue.
  }

  return normalizedProgress;
}

function getQuestionProgress(questionId, category) {
  const progress = loadEnglishQuizProgress();
  return normalizeEnglishQuizQuestionProgress(progress.questions[questionId], questionId, category);
}

function updateQuestionProgress(questionId, category, updater) {
  const progress = loadEnglishQuizProgress();
  const current = normalizeEnglishQuizQuestionProgress(progress.questions[questionId], questionId, category);
  const now = new Date().toISOString();
  const next = updater(current, now);
  progress.questions[questionId] = next;
  progress.updatedAt = now;
  return saveEnglishQuizProgress(progress).questions[questionId];
}

function recordQuestionSeen(questionId, category) {
  return updateQuestionProgress(questionId, category, (record, now) => ({
    ...record,
    seenCount: normalizeQuizNumber(record.seenCount) + 1,
    lastSeenAt: now,
  }));
}

function recordQuestionAnswer(questionId, category, isCorrect) {
  return updateQuestionProgress(questionId, category, (record, now) => ({
    ...record,
    answeredCount: normalizeQuizNumber(record.answeredCount) + 1,
    correctCount: normalizeQuizNumber(record.correctCount) + (isCorrect ? 1 : 0),
    wrongCount: normalizeQuizNumber(record.wrongCount) + (isCorrect ? 0 : 1),
    lastAnsweredAt: now,
  }));
}

function recordQuestionTimeout(questionId, category) {
  return updateQuestionProgress(questionId, category, (record) => ({
    ...record,
    wrongCount: normalizeQuizNumber(record.wrongCount) + 1,
    timeoutCount: normalizeQuizNumber(record.timeoutCount) + 1,
  }));
}

function resetEnglishQuizProgress() {
  if (!canUseEnglishQuizLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(ENGLISH_QUIZ_STORAGE_KEY);
  } catch (error) {
    // Ignore storage failures.
  }
}

function shuffleEnglishQuizItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function ensureEnglishQuizQuestionIds(questions, category) {
  return questions.map((question, index) => ({
    ...question,
    questionId: String(question.questionId || question.id || `${category}_${String(index + 1).padStart(3, "0")}`),
    quizCategory: category,
  }));
}

function pickUniqueEnglishQuizItems(source, count, selectedIds) {
  const picked = [];
  shuffleEnglishQuizItems(source).forEach((item) => {
    if (picked.length >= count || selectedIds.has(item.questionId)) {
      return;
    }
    selectedIds.add(item.questionId);
    picked.push(item);
  });
  return picked;
}

function selectEnglishQuizQuestions(questions, category, targetCount = ENGLISH_QUIZ_TARGET_COUNT) {
  const availableQuestions = ensureEnglishQuizQuestionIds(questions, category).slice(0);
  if (availableQuestions.length <= targetCount) {
    return shuffleEnglishQuizItems(availableQuestions);
  }

  const progress = loadEnglishQuizProgress();
  const wrongPool = [];
  const answeredPool = [];
  const unseenPool = [];

  availableQuestions.forEach((question) => {
    const record = normalizeEnglishQuizQuestionProgress(progress.questions[question.questionId], question.questionId, category);
    if (record.wrongCount > 0 || record.timeoutCount > 0) {
      wrongPool.push(question);
      return;
    }
    if (record.answeredCount > 0) {
      answeredPool.push(question);
      return;
    }
    if (record.seenCount === 0) {
      unseenPool.push(question);
    } else {
      answeredPool.push(question);
    }
  });

  const selectedIds = new Set();
  let selected = [];

  if (wrongPool.length >= 2) {
    selected = selected.concat(pickUniqueEnglishQuizItems(wrongPool, 2, selectedIds));
    selected = selected.concat(pickUniqueEnglishQuizItems(answeredPool, 2, selectedIds));
  } else if (wrongPool.length === 1) {
    selected = selected.concat(pickUniqueEnglishQuizItems(wrongPool, 1, selectedIds));
    selected = selected.concat(pickUniqueEnglishQuizItems(answeredPool, 2, selectedIds));
  } else {
    const answeredTarget = Math.min(5, answeredPool.length);
    selected = selected.concat(pickUniqueEnglishQuizItems(answeredPool, answeredTarget, selectedIds));
  }

  selected = selected.concat(pickUniqueEnglishQuizItems(unseenPool, targetCount - selected.length, selectedIds));
  selected = selected.concat(pickUniqueEnglishQuizItems(answeredPool, targetCount - selected.length, selectedIds));
  selected = selected.concat(pickUniqueEnglishQuizItems(wrongPool, targetCount - selected.length, selectedIds));
  selected = selected.concat(pickUniqueEnglishQuizItems(availableQuestions, targetCount - selected.length, selectedIds));

  return shuffleEnglishQuizItems(selected.slice(0, targetCount));
}

function resetEnglishQuizProgressWithConfirm() {
  if (window.confirm("確定要清除英文測驗紀錄嗎？這不會影響日文資料。")) {
    resetEnglishQuizProgress();
    window.alert("英文測驗紀錄已清除。日文資料未受影響。");
  }
}
