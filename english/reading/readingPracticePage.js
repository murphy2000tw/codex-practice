const READING_QUIZ_CATEGORY = "reading";
const READING_QUIZ_TITLE = "閱讀測驗";
const readingArticles = Array.isArray(window.readingQuestions) ? window.readingQuestions : [];

function flattenReadingQuestions(articles) {
  return articles.flatMap((article, articleIndex) => (Array.isArray(article.questions) ? article.questions : []).map((question, questionIndex) => ({
    ...question,
    questionId: question.id || `reading_${String(articleIndex + 1).padStart(3, "0")}_${String(questionIndex + 1).padStart(2, "0")}`,
    passageId: article.id,
    passageTitle: article.title,
    passage: article.passage,
    translation: article.translation,
    category: article.category,
    level: article.level,
  })));
}

let quizQuestions = selectEnglishQuizQuestions(flattenReadingQuestions(readingArticles), READING_QUIZ_CATEGORY);
let currentQuestionIndex = 0;
let correctCount = 0;
let timeoutCount = 0;
let hasAnsweredCurrentQuestion = false;
let currentTimer = null;
let remainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
let quizResults = [];

const articleTitle = document.querySelector("#readingArticleTitle");
const articleMeta = document.querySelector("#readingArticleMeta");
const passageText = document.querySelector("#readingPassage");
const translationToggle = document.querySelector("#toggleReadingTranslation");
const translationText = document.querySelector("#readingTranslation");
const modeButtons = document.querySelectorAll(".reading-mode-button");
const modeDescription = document.querySelector("#readingModeDescription");
const questionText = document.querySelector("#readingQuestion");
const questionTypeText = document.querySelector("#readingQuestionType");
const optionList = document.querySelector("#readingOptions");
const feedback = document.querySelector("#readingFeedback");
const explanation = document.querySelector("#readingExplanation");
const scoreText = document.querySelector("#readingScore");
const wrongCountText = document.querySelector("#readingWrongCount");
const progressText = document.querySelector("#readingProgress");
const articleProgressText = document.querySelector("#readingArticleProgress");
const wrongMessage = document.querySelector("#readingWrongMessage");
const startWrongReviewButton = document.querySelector("#startReadingWrongReview");
const clearWrongListButton = document.querySelector("#clearReadingWrongList");
const returnPracticeButton = document.querySelector("#returnReadingPractice");
const reviewWrongFromResultButton = document.querySelector("#reviewReadingWrongFromResult");
const clearWrongFromResultButton = document.querySelector("#clearReadingWrongFromResult");
const nextQuestionButton = document.querySelector("#nextReadingQuestion");
const nextArticleButton = document.querySelector("#nextReadingArticle");
const restartButtons = document.querySelectorAll(".js-restart-reading-practice");
const practicePanel = document.querySelector("#readingPracticePanel");
const completePanel = document.querySelector("#readingCompletePanel");
const resultTitle = document.querySelector("#readingResultTitle");
const resultModeText = document.querySelector("#readingResultMode");
const resultMessage = document.querySelector("#readingResultMessage");
const totalAnsweredText = document.querySelector("#readingTotalAnswered");
const totalCorrectText = document.querySelector("#readingTotalCorrect");
const totalWrongText = document.querySelector("#readingTotalWrong");
const accuracyText = document.querySelector("#readingAccuracy");
const resultWrongSummary = document.querySelector("#readingResultWrongSummary");
const resultWrongCountText = document.querySelector("#readingResultWrongCount");
const resultWrongLabel = document.querySelector("#readingResultWrongLabel");
const totalAnsweredLabel = document.querySelector("#readingTotalAnsweredLabel");
const totalCorrectLabel = document.querySelector("#readingTotalCorrectLabel");
const totalWrongLabel = document.querySelector("#readingTotalWrongLabel");
const accuracyLabel = document.querySelector("#readingAccuracyLabel");

const timerText = document.createElement("span");
timerText.innerHTML = `剩餘：<strong id="readingTimer">${ENGLISH_QUIZ_TIME_LIMIT_SECONDS}</strong> 秒`;
progressText.closest(".quiz-stats")?.append(timerText);

function getCurrentQuestion() {
  return quizQuestions[currentQuestionIndex];
}

function clearTimer() {
  if (currentTimer) {
    window.clearInterval(currentTimer);
    currentTimer = null;
  }
}

function updateTimerText() {
  const timer = document.querySelector("#readingTimer");
  if (timer) {
    timer.textContent = String(remainingSeconds);
  }
}

function startTimer() {
  clearTimer();
  remainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
  updateTimerText();
  currentTimer = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerText();
    if (remainingSeconds <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function clearFeedback() {
  feedback.className = "quiz-feedback reading-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
}

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${quizResults.length}`;
  progressText.textContent = quizQuestions.length ? `${currentQuestionIndex + 1} / ${quizQuestions.length}` : "0 / 0";
  articleProgressText.textContent = `${READING_QUIZ_TITLE}｜第 ${quizQuestions.length ? currentQuestionIndex + 1 : 0} / ${quizQuestions.length} 題`;
  wrongCountText.textContent = `${quizResults.filter((result) => result.result !== "correct").length} 題`;
}

function scheduleNextQuestion() {
  window.setTimeout(() => {
    if (currentQuestionIndex >= quizQuestions.length - 1) {
      renderCompletePanel();
      return;
    }
    currentQuestionIndex += 1;
    renderQuestion();
  }, 650);
}

function recordResult(question, userAnswer, result) {
  if (!question || hasAnsweredCurrentQuestion) {
    return;
  }
  hasAnsweredCurrentQuestion = true;
  clearTimer();
  const isCorrect = result === "correct";

  if (result === "timeout") {
    timeoutCount += 1;
    recordQuestionTimeout(question.questionId, READING_QUIZ_CATEGORY);
  } else {
    recordQuestionAnswer(question.questionId, READING_QUIZ_CATEGORY, isCorrect);
  }
  if (isCorrect) {
    correctCount += 1;
  }

  quizResults.push({
    order: currentQuestionIndex + 1,
    question: question.question,
    userAnswer: result === "timeout" ? "未作答" : userAnswer,
    correctAnswer: question.answer,
    result,
  });
  updateScoreAndProgress();
}

function renderOptions(question) {
  const buttons = question.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option reading-option";
    button.type = "button";
    button.textContent = option;
    button.dataset.answer = option;
    button.addEventListener("click", () => handleAnswer(option));
    return button;
  });
  optionList.replaceChildren(...buttons);
}

function renderQuestion() {
  const question = getCurrentQuestion();
  clearTimer();

  if (!question) {
    practicePanel.hidden = false;
    completePanel.hidden = true;
    articleTitle.textContent = `${READING_QUIZ_TITLE}：目前沒有題目`;
    articleMeta.textContent = "";
    passageText.textContent = "這個分類目前沒有可測驗的題目。";
    questionText.textContent = "";
    optionList.replaceChildren();
    clearFeedback();
    updateScoreAndProgress();
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  articleTitle.textContent = question.passageTitle || READING_QUIZ_TITLE;
  articleMeta.textContent = `分類：${question.category || "閱讀"}｜第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`;
  passageText.textContent = question.passage || "";
  translationText.textContent = "";
  translationText.hidden = true;
  translationToggle.disabled = true;
  questionTypeText.textContent = question.questionType ? `題型：${question.questionType}` : "題型：—";
  questionText.textContent = question.question;
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  renderOptions(question);
  updateScoreAndProgress();
  nextQuestionButton.disabled = true;
  nextArticleButton.disabled = true;
  recordQuestionSeen(question.questionId, READING_QUIZ_CATEGORY);
  startTimer();
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();
  if (!question || hasAnsweredCurrentQuestion) {
    return;
  }
  const isCorrect = answer === question.answer;
  recordResult(question, answer, isCorrect ? "correct" : "wrong");
  optionList.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
    button.classList.toggle("is-wrong", button.dataset.answer === answer && !isCorrect);
  });
  feedback.className = `quiz-feedback reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  explanation.textContent = question.explanation || "";
  scheduleNextQuestion();
}

function handleTimeout() {
  const question = getCurrentQuestion();
  if (!question || hasAnsweredCurrentQuestion) {
    return;
  }
  recordResult(question, "未作答", "timeout");
  optionList.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
  });
  feedback.className = "quiz-feedback reading-feedback is-wrong";
  feedback.textContent = `逾時，正確答案是：${question.answer}`;
  explanation.textContent = question.explanation || "";
  scheduleNextQuestion();
}

function createResultList() {
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  quizResults.forEach((result) => {
    const item = document.createElement("li");
    item.textContent = `第 ${result.order} 題｜${result.question}｜你的答案：${result.userAnswer}｜正確答案：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : result.result === "timeout" ? "逾時" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderCompletePanel() {
  clearTimer();
  const total = quizResults.length;
  const wrongCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  practicePanel.hidden = true;
  completePanel.hidden = false;
  resultTitle.textContent = `${READING_QUIZ_TITLE}完成！`;
  resultModeText.textContent = `測驗類型：${READING_QUIZ_TITLE}`;
  resultModeText.hidden = false;
  totalAnsweredLabel.textContent = "總題數";
  totalCorrectLabel.textContent = "答對";
  totalWrongLabel.textContent = "答錯";
  accuracyLabel.textContent = "正確率";
  resultWrongLabel.textContent = "逾時";
  resultWrongSummary.hidden = false;
  totalAnsweredText.textContent = `${total} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  resultWrongCountText.textContent = `${timeoutCount} 題`;
  resultMessage.textContent = `本次共 ${total} 題，答錯 ${wrongCount} 題，其中逾時 ${timeoutCount} 題。`;
  reviewWrongFromResultButton.hidden = true;
  clearWrongFromResultButton.hidden = true;
  completePanel.querySelector(".quiz-result-list")?.remove();
  completePanel.querySelector(".article-result-card")?.append(createResultList());
}

function restartPractice() {
  clearTimer();
  quizQuestions = selectEnglishQuizQuestions(flattenReadingQuestions(readingArticles), READING_QUIZ_CATEGORY);
  currentQuestionIndex = 0;
  correctCount = 0;
  timeoutCount = 0;
  hasAnsweredCurrentQuestion = false;
  quizResults = [];
  modeDescription.textContent = "分類測驗：只抽閱讀題，每題 10 秒，完成後顯示總表。";
  modeButtons.forEach((button) => { button.disabled = true; });
  startWrongReviewButton.disabled = true;
  clearWrongListButton.disabled = true;
  returnPracticeButton.hidden = true;
  wrongMessage.textContent = "";
  renderQuestion();
}

translationToggle.addEventListener("click", () => {});
nextQuestionButton.addEventListener("click", () => {});
nextArticleButton.addEventListener("click", () => {});
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));
window.addEventListener("beforeunload", clearTimer);

restartPractice();
