const ENGLISH_LEARNING_PROGRESS_STORAGE_KEY = "englishLearningDailyProgressV1";
const ENGLISH_LEARNING_PROGRESS_VERSION = 1;
const ENGLISH_LEARNING_MODULES = ["vocabulary", "articles", "reading", "cloze", "listening"];
const ENGLISH_LEARNING_MODES = ["practice", "quiz"];

function createEmptyEnglishLearningProgress() {
  return { version: ENGLISH_LEARNING_PROGRESS_VERSION, updatedAt: new Date().toISOString(), days: {} };
}

function canUseEnglishLearningLocalStorage() {
  try {
    const key = `${ENGLISH_LEARNING_PROGRESS_STORAGE_KEY}_test`;
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

function toEnglishLearningNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
}

function getEnglishLearningLocalDateKey(dateValue = new Date()) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return getEnglishLearningLocalDateKey(new Date());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyEnglishModuleProgress() {
  return { sessions: 0, totalQuestions: 0, correctCount: 0, wrongCount: 0, practiceQuestions: 0, quizQuestions: 0, totalDurationSeconds: 0 };
}

function createEmptyEnglishDayProgress(dateKey) {
  return { date: dateKey, totalSessions: 0, totalQuestions: 0, correctCount: 0, wrongCount: 0, practiceQuestions: 0, quizQuestions: 0, totalDurationSeconds: 0, modules: {} };
}

function normalizeEnglishModuleProgress(moduleProgress) {
  const source = moduleProgress && typeof moduleProgress === "object" ? moduleProgress : {};
  return {
    sessions: toEnglishLearningNumber(source.sessions),
    totalQuestions: toEnglishLearningNumber(source.totalQuestions),
    correctCount: toEnglishLearningNumber(source.correctCount),
    wrongCount: toEnglishLearningNumber(source.wrongCount),
    practiceQuestions: toEnglishLearningNumber(source.practiceQuestions),
    quizQuestions: toEnglishLearningNumber(source.quizQuestions),
    totalDurationSeconds: toEnglishLearningNumber(source.totalDurationSeconds),
  };
}

function normalizeEnglishDayProgress(dayProgress, dateKey) {
  const source = dayProgress && typeof dayProgress === "object" ? dayProgress : {};
  const day = { ...createEmptyEnglishDayProgress(dateKey), date: typeof source.date === "string" ? source.date : dateKey };
  ["totalSessions", "totalQuestions", "correctCount", "wrongCount", "practiceQuestions", "quizQuestions", "totalDurationSeconds"].forEach((field) => {
    day[field] = toEnglishLearningNumber(source[field]);
  });
  if (source.modules && typeof source.modules === "object" && !Array.isArray(source.modules)) {
    Object.entries(source.modules).forEach(([module, moduleProgress]) => {
      if (ENGLISH_LEARNING_MODULES.includes(module)) day.modules[module] = normalizeEnglishModuleProgress(moduleProgress);
    });
  }
  return day;
}

function normalizeEnglishLearningProgress(progress) {
  const normalized = createEmptyEnglishLearningProgress();
  if (!progress || progress.version !== ENGLISH_LEARNING_PROGRESS_VERSION || typeof progress !== "object") return normalized;
  normalized.updatedAt = typeof progress.updatedAt === "string" ? progress.updatedAt : normalized.updatedAt;
  if (progress.days && typeof progress.days === "object" && !Array.isArray(progress.days)) {
    Object.entries(progress.days).forEach(([dateKey, dayProgress]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) normalized.days[dateKey] = normalizeEnglishDayProgress(dayProgress, dateKey);
    });
  }
  return normalized;
}

function getEnglishLearningProgress() {
  const empty = createEmptyEnglishLearningProgress();
  if (!canUseEnglishLearningLocalStorage()) return empty;
  try {
    const stored = window.localStorage.getItem(ENGLISH_LEARNING_PROGRESS_STORAGE_KEY);
    if (!stored) return empty;
    return normalizeEnglishLearningProgress(JSON.parse(stored));
  } catch (error) {
    return empty;
  }
}

function saveEnglishLearningProgress(data) {
  const normalized = normalizeEnglishLearningProgress(data);
  normalized.updatedAt = new Date().toISOString();
  if (!canUseEnglishLearningLocalStorage()) return normalized;
  try { window.localStorage.setItem(ENGLISH_LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(normalized)); } catch (error) {}
  return normalized;
}

function normalizeEnglishLearningSessionOptions(options) {
  if (!options || typeof options !== "object" || !ENGLISH_LEARNING_MODULES.includes(options.module)) return null;
  const mode = ENGLISH_LEARNING_MODES.includes(options.mode) ? options.mode : null;
  if (!mode) return null;
  const totalQuestions = toEnglishLearningNumber(options.totalQuestions);
  const correctCount = Math.min(toEnglishLearningNumber(options.correctCount), totalQuestions);
  const wrongCount = Math.max(0, Math.min(toEnglishLearningNumber(options.wrongCount ?? totalQuestions - correctCount), totalQuestions - correctCount));
  return {
    module: options.module,
    mode,
    totalQuestions,
    correctCount,
    wrongCount,
    durationSeconds: toEnglishLearningNumber(options.durationSeconds),
    startedAt: typeof options.startedAt === "string" ? options.startedAt : new Date().toISOString(),
    endedAt: typeof options.endedAt === "string" ? options.endedAt : new Date().toISOString(),
  };
}

function recordEnglishLearningSession(options) {
  const session = normalizeEnglishLearningSessionOptions(options);
  if (!session || session.totalQuestions <= 0) return getEnglishLearningProgress();
  const progress = getEnglishLearningProgress();
  const dateKey = getEnglishLearningLocalDateKey(session.endedAt || session.startedAt);
  const day = normalizeEnglishDayProgress(progress.days[dateKey], dateKey);
  const moduleProgress = normalizeEnglishModuleProgress(day.modules[session.module]);
  day.totalSessions += 1;
  day.totalQuestions += session.totalQuestions;
  day.correctCount += session.correctCount;
  day.wrongCount += session.wrongCount;
  day.totalDurationSeconds += session.durationSeconds;
  day[session.mode === "practice" ? "practiceQuestions" : "quizQuestions"] += session.totalQuestions;
  moduleProgress.sessions += 1;
  moduleProgress.totalQuestions += session.totalQuestions;
  moduleProgress.correctCount += session.correctCount;
  moduleProgress.wrongCount += session.wrongCount;
  moduleProgress.totalDurationSeconds += session.durationSeconds;
  moduleProgress[session.mode === "practice" ? "practiceQuestions" : "quizQuestions"] += session.totalQuestions;
  day.modules[session.module] = moduleProgress;
  progress.days[dateKey] = day;
  return saveEnglishLearningProgress(progress);
}

function getTodayEnglishLearningSummary() {
  const progress = getEnglishLearningProgress();
  const dateKey = getEnglishLearningLocalDateKey();
  return normalizeEnglishDayProgress(progress.days[dateKey], dateKey);
}

function getRecentEnglishLearningDays(days = 7) {
  const count = Math.max(1, toEnglishLearningNumber(days) || 7);
  const progress = getEnglishLearningProgress();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const dateKey = getEnglishLearningLocalDateKey(date);
    return normalizeEnglishDayProgress(progress.days[dateKey], dateKey);
  }).reverse();
}

function getEnglishModuleSummary() {
  const summary = Object.fromEntries(ENGLISH_LEARNING_MODULES.map((module) => [module, createEmptyEnglishModuleProgress()]));
  Object.values(getEnglishLearningProgress().days).forEach((day) => {
    Object.entries(day.modules || {}).forEach(([module, moduleProgress]) => {
      if (!summary[module]) return;
      const normalized = normalizeEnglishModuleProgress(moduleProgress);
      Object.keys(summary[module]).forEach((field) => { summary[module][field] += normalized[field]; });
    });
  });
  return summary;
}

const ENGLISH_LEARNING_MODULE_NAMES = {
  vocabulary: "單字",
  articles: "冠詞",
  reading: "閱讀",
  cloze: "填空",
  listening: "聽力",
};

function calculateEnglishAccuracy(correctCount, totalQuestions) {
  const total = toEnglishLearningNumber(totalQuestions);
  if (total <= 0) return "-";
  return `${Math.round((toEnglishLearningNumber(correctCount) / total) * 100)}%`;
}

function getEnglishAccuracyNumber(correctCount, totalQuestions) {
  const total = toEnglishLearningNumber(totalQuestions);
  if (total <= 0) return 0;
  return Math.round((toEnglishLearningNumber(correctCount) / total) * 100);
}

function formatEnglishProgressDate(dateValue) {
  const dateKey = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : getEnglishLearningLocalDateKey(dateValue);
  return dateKey.replaceAll("-", "/");
}

function formatEnglishLearningDuration(seconds) {
  const totalSeconds = toEnglishLearningNumber(seconds);
  if (totalSeconds <= 0) return "0 分鐘";
  if (totalSeconds < 60) return "不到 1 分鐘";
  return `約 ${Math.ceil(totalSeconds / 60)} 分鐘`;
}

function getEnglishLearningModuleName(module) {
  return ENGLISH_LEARNING_MODULE_NAMES[module] || module;
}

function getUsedEnglishLearningModuleNames(dayProgress) {
  const day = normalizeEnglishDayProgress(dayProgress, dayProgress?.date || getEnglishLearningLocalDateKey());
  const names = Object.entries(day.modules)
    .filter(([, moduleProgress]) => normalizeEnglishModuleProgress(moduleProgress).totalQuestions > 0)
    .map(([module]) => getEnglishLearningModuleName(module));
  return names.length ? names.join("、") : "尚未使用";
}

function getRecentSevenDaysSummary() {
  const days = getRecentEnglishLearningDays(7);
  const moduleTotals = Object.fromEntries(ENGLISH_LEARNING_MODULES.map((module) => [module, createEmptyEnglishModuleProgress()]));
  const summary = { learningDays: 0, totalDurationSeconds: 0, totalQuestions: 0, correctCount: 0, mostUsedModule: "資料不足", weakestModule: "資料不足", days };
  days.forEach((day) => {
    if (day.totalQuestions > 0 || day.totalDurationSeconds > 0) summary.learningDays += 1;
    summary.totalDurationSeconds += day.totalDurationSeconds;
    summary.totalQuestions += day.totalQuestions;
    summary.correctCount += day.correctCount;
    Object.entries(day.modules || {}).forEach(([module, moduleProgress]) => {
      if (!moduleTotals[module]) return;
      const normalized = normalizeEnglishModuleProgress(moduleProgress);
      Object.keys(moduleTotals[module]).forEach((field) => { moduleTotals[module][field] += normalized[field]; });
    });
  });
  const usedModules = Object.entries(moduleTotals).filter(([, moduleProgress]) => moduleProgress.totalQuestions > 0);
  if (usedModules.length) {
    summary.mostUsedModule = getEnglishLearningModuleName(usedModules.slice().sort((a, b) => b[1].totalQuestions - a[1].totalQuestions)[0][0]);
  }
  const enoughDataModules = usedModules.filter(([, moduleProgress]) => moduleProgress.totalQuestions >= 10);
  if (enoughDataModules.length) {
    summary.weakestModule = getEnglishLearningModuleName(enoughDataModules.slice().sort((a, b) => getEnglishAccuracyNumber(a[1].correctCount, a[1].totalQuestions) - getEnglishAccuracyNumber(b[1].correctCount, b[1].totalQuestions))[0][0]);
  }
  return summary;
}

function getEnglishLearningStreak() {
  const progress = getEnglishLearningProgress();
  let streak = 0;
  const date = new Date();
  while (true) {
    const dateKey = getEnglishLearningLocalDateKey(date);
    const day = normalizeEnglishDayProgress(progress.days[dateKey], dateKey);
    if (day.totalQuestions <= 0 && day.totalDurationSeconds <= 0) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}
