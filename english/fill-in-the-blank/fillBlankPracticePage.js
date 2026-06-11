const CLOZE_QUIZ_CATEGORY = "cloze";
const CLOZE_QUIZ_TITLE = "填空測驗";
const allFillBlankQuestions = Array.isArray(window.fillBlankQuestions) ? window.fillBlankQuestions : [];
let quizQuestions = selectEnglishQuizQuestions(allFillBlankQuestions, CLOZE_QUIZ_CATEGORY);

const progressText = document.querySelector("#fillBlankProgress");
const questionTotalText = document.querySelector("#fillBlankQuestionTotal");
const categoryTotalText = document.querySelector("#fillBlankCategoryTotal");
const scoreText = document.querySelector("#fillBlankScore");
const wrongCountText = document.querySelector("#fillBlankWrongCount");
const modeButtons = document.querySelectorAll(".fill-blank-mode-button");
const modeDescription = document.querySelector("#fillBlankModeDescription");
const questionCategory = document.querySelector("#fillBlankQuestionCategory");
const questionSentence = document.querySelector("#fillBlankQuestionSentence");
const answerInput = document.querySelector("#fillBlankAnswerInput");
const checkButton = document.querySelector("#checkFillBlankAnswer");
const hintButton = document.querySelector("#showFillBlankHint");
const hintText = document.querySelector("#fillBlankHint");
const feedback = document.querySelector("#fillBlankFeedback");
const explanation = document.querySelector("#fillBlankExplanation");
const translation = document.querySelector("#fillBlankTranslation");
const nextButton = document.querySelector("#nextFillBlankQuestion");
const restartButtons = document.querySelectorAll(".js-restart-fill-blank-practice");
const practicePanel = document.querySelector("#fillBlankPracticePanel");
const completePanel = document.querySelector("#fillBlankCompletePanel");
const completeTitle = document.querySelector("#fillBlankCompleteTitle");
const resultModeText = document.querySelector("#fillBlankResultMode");
const wrongResultMessage = document.querySelector("#fillBlankWrongResultMessage");
const totalAnsweredText = document.querySelector("#fillBlankTotalAnswered");
const totalCorrectText = document.querySelector("#fillBlankTotalCorrect");
const totalWrongText = document.querySelector("#fillBlankTotalWrong");
const accuracyText = document.querySelector("#fillBlankAccuracy");
const remainingWrongText = document.querySelector("#fillBlankRemainingWrong");
const startWrongReviewButton = document.querySelector("#startFillBlankWrongReview");
const clearWrongQuestionsButton = document.querySelector("#clearFillBlankWrongQuestions");
const exitWrongReviewButton = document.querySelector("#exitFillBlankWrongReview");
const resultWrongReviewButton = document.querySelector("#reviewWrongFromFillBlankResult");

let currentQuestionIndex = 0;
let correctCount = 0;
let timeoutCount = 0;
let hasAnsweredCurrentQuestion = false;
let currentTimer = null;
let remainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
let quizResults = [];

const timerText = document.createElement("span");
timerText.innerHTML = `剩餘：<strong id="fillBlankTimer">${ENGLISH_QUIZ_TIME_LIMIT_SECONDS}</strong> 秒`;
progressText.closest(".quiz-stats")?.append(timerText);

function normalizeAnswer(answer) {
  return String(answer)
    .trim()
    .replace(/[。．.！？!?，,；;：:]+$/g, "")
    .trim()
    .toLowerCase();
}

function isCorrectAnswer(userAnswer, question) {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const acceptableAnswers = Array.isArray(question.acceptableAnswers) && question.acceptableAnswers.length
    ? question.acceptableAnswers
    : [question.answer];
  return acceptableAnswers.some((acceptableAnswer) => normalizeAnswer(String(acceptableAnswer)) === normalizedUserAnswer);
}

function updateQuestionSummary() {
  if (questionTotalText) questionTotalText.textContent = `${allFillBlankQuestions.length} 題`;
  if (categoryTotalText) categoryTotalText.textContent = `${new Set(allFillBlankQuestions.map((question) => question.category).filter(Boolean)).size} 類`;
}

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
  const timer = document.querySelector("#fillBlankTimer");
  if (timer) timer.textContent = String(remainingSeconds);
}

function startTimer() {
  clearTimer();
  remainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
  updateTimerText();
  currentTimer = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerText();
    if (remainingSeconds <= 0) handleTimeout();
  }, 1000);
}

function clearFeedback() {
  feedback.className = "quiz-feedback fill-blank-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
  translation.textContent = "";
  hintText.hidden = true;
  hintText.textContent = "";
}

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${quizResults.length}`;
  progressText.textContent = quizQuestions.length ? `${currentQuestionIndex + 1} / ${quizQuestions.length}` : "0 / 0";
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
  if (!question || hasAnsweredCurrentQuestion) return;
  hasAnsweredCurrentQuestion = true;
  clearTimer();
  const isCorrect = result === "correct";

  if (result === "timeout") {
    timeoutCount += 1;
    recordQuestionTimeout(question.questionId, CLOZE_QUIZ_CATEGORY);
  } else {
    recordQuestionAnswer(question.questionId, CLOZE_QUIZ_CATEGORY, isCorrect);
  }
  if (isCorrect) correctCount += 1;

  quizResults.push({
    order: currentQuestionIndex + 1,
    question: question.blankSentence || question.sentence,
    userAnswer: result === "timeout" ? "未作答" : userAnswer,
    correctAnswer: question.answer,
    result,
  });
  updateScoreAndProgress();
}

function renderQuestion() {
  const question = getCurrentQuestion();
  clearTimer();

  if (!question) {
    practicePanel.hidden = false;
    completePanel.hidden = true;
    questionCategory.textContent = `${CLOZE_QUIZ_TITLE}｜目前沒有題目`;
    questionSentence.textContent = "這個分類目前沒有可測驗的題目。";
    answerInput.value = "";
    answerInput.disabled = true;
    checkButton.disabled = true;
    nextButton.disabled = true;
    clearFeedback();
    updateScoreAndProgress();
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = `${CLOZE_QUIZ_TITLE}｜第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`;
  questionSentence.textContent = question.blankSentence;
  answerInput.value = "";
  answerInput.disabled = false;
  checkButton.disabled = false;
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  updateScoreAndProgress();
  modeDescription.textContent = "分類測驗：只抽填空題，每題 10 秒，完成後顯示總表。";
  modeButtons.forEach((button) => { button.disabled = true; });
  hintButton.hidden = true;
  hintButton.disabled = true;
  nextButton.disabled = true;
  nextButton.textContent = "答題後自動下一題";
  recordQuestionSeen(question.questionId, CLOZE_QUIZ_CATEGORY);
  startTimer();
  answerInput.focus();
}

function handleCheckAnswer() {
  const question = getCurrentQuestion();
  if (!question || hasAnsweredCurrentQuestion) return;

  const userAnswer = answerInput.value.trim();
  const isCorrect = isCorrectAnswer(userAnswer, question);
  recordResult(question, userAnswer, isCorrect ? "correct" : "wrong");
  answerInput.disabled = true;
  checkButton.disabled = true;
  feedback.className = `quiz-feedback fill-blank-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  scheduleNextQuestion();
}

function handleTimeout() {
  const question = getCurrentQuestion();
  if (!question || hasAnsweredCurrentQuestion) return;
  recordResult(question, "未作答", "timeout");
  answerInput.disabled = true;
  checkButton.disabled = true;
  feedback.className = "quiz-feedback fill-blank-feedback is-wrong";
  feedback.textContent = `逾時，正確答案是：${question.answer}`;
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
  completeTitle.textContent = `${CLOZE_QUIZ_TITLE}完成！`;
  resultModeText.textContent = `測驗類型：${CLOZE_QUIZ_TITLE}`;
  wrongResultMessage.textContent = `本次共 ${total} 題，答錯 ${wrongCount} 題，其中逾時 ${timeoutCount} 題。`;
  totalAnsweredText.textContent = `${total} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  remainingWrongText.textContent = `${timeoutCount} 題`;
  remainingWrongText.nextElementSibling.textContent = "逾時";
  resultWrongReviewButton.hidden = true;
  completePanel.querySelector(".quiz-result-list")?.remove();
  completePanel.querySelector(".article-result-card")?.append(createResultList());
}

function restartPractice() {
  clearTimer();
  quizQuestions = selectEnglishQuizQuestions(allFillBlankQuestions, CLOZE_QUIZ_CATEGORY);
  currentQuestionIndex = 0;
  correctCount = 0;
  timeoutCount = 0;
  hasAnsweredCurrentQuestion = false;
  quizResults = [];
  startWrongReviewButton.disabled = true;
  clearWrongQuestionsButton.disabled = true;
  exitWrongReviewButton.hidden = true;
  renderQuestion();
}

checkButton.addEventListener("click", handleCheckAnswer);
hintButton.addEventListener("click", () => {});
nextButton.addEventListener("click", () => {});
answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleCheckAnswer();
});
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));
startWrongReviewButton.addEventListener("click", () => {});
resultWrongReviewButton.addEventListener("click", () => {});
clearWrongQuestionsButton.addEventListener("click", () => {});
exitWrongReviewButton.addEventListener("click", () => {});
window.addEventListener("beforeunload", clearTimer);

updateQuestionSummary();
restartPractice();
