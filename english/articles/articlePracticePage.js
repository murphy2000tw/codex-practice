const answerLabelMap = {
  a: "a",
  an: "an",
  the: "the",
  不填: "不填",
};

const ARTICLE_QUIZ_CATEGORY = "article";
const ARTICLE_QUIZ_TITLE = "冠詞測驗";
const questions = selectEnglishQuizQuestions(
  Array.isArray(window.articleQuestions) ? window.articleQuestions : [],
  ARTICLE_QUIZ_CATEGORY,
);

const progressText = document.querySelector("#articleProgress");
const scoreText = document.querySelector("#articleScore");
const scoreLabel = document.querySelector("#articleScoreLabel");
const wrongCountText = document.querySelector("#articleWrongCount");
const modeButtons = document.querySelectorAll(".article-mode-button");
const modeDescription = document.querySelector("#articleModeDescription");
const questionCategory = document.querySelector("#articleQuestionCategory");
const questionSentence = document.querySelector("#articleQuestionSentence");
const optionList = document.querySelector("#articleOptions");
const feedback = document.querySelector("#articleFeedback");
const explanation = document.querySelector("#articleExplanation");
const nextButton = document.querySelector("#nextArticleQuestion");
const restartButtons = document.querySelectorAll(".js-restart-article-practice");
const filterButtons = document.querySelectorAll(".js-article-filter");
const practicePanel = document.querySelector("#articlePracticePanel");
const completePanel = document.querySelector("#articleCompletePanel");
const totalAnsweredText = document.querySelector("#articleTotalAnswered");
const totalCorrectText = document.querySelector("#articleTotalCorrect");
const totalWrongText = document.querySelector("#articleTotalWrong");
const accuracyText = document.querySelector("#articleAccuracy");
const remainingWrongText = document.querySelector("#articleRemainingWrong");
const resultModeText = document.querySelector("#articleResultMode");
const completeBadge = document.querySelector("#articleCompleteBadge");
const completeTitle = document.querySelector("#articleCompleteTitle");
const completeMessage = document.querySelector("#articleCompleteMessage");
const startReviewButton = document.querySelector("#startArticleReview");
const completeReviewButton = document.querySelector("#completeArticleReview");
const backToPracticeButton = document.querySelector("#backToArticlePractice");
const clearWrongQuestionsButton = document.querySelector("#clearArticleWrongQuestions");
const reviewMessage = document.querySelector("#articleReviewMessage");

let quizQuestions = questions;
let currentQuestionIndex = 0;
let correctCount = 0;
let timeoutCount = 0;
let hasAnsweredCurrentQuestion = false;
let currentTimer = null;
let remainingSeconds = ENGLISH_QUIZ_TIME_LIMIT_SECONDS;
let quizResults = [];
let quizPhase = "idle";
let quizStartedAt = null;

const timerText = document.createElement("span");
timerText.innerHTML = `<span id="articleTimerStatus">尚未開始</span>`;
progressText.closest(".quiz-stats")?.append(timerText);

function getCurrentQuestion() {
  return quizQuestions[currentQuestionIndex];
}

function getDisplayQuestion(question) {
  return question?.blankSentence || question?.sentence || "";
}

function clearTimer() {
  if (currentTimer) {
    window.clearInterval(currentTimer);
    currentTimer = null;
  }
}

function updateTimerText() {
  const timerStatus = document.querySelector("#articleTimerStatus");
  if (timerStatus) {
    timerStatus.innerHTML = `剩餘：<strong id="articleTimer">${remainingSeconds}</strong> 秒`;
  }
}

function startTimer() {
  if (quizPhase !== "running") {
    return;
  }
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
  feedback.className = "quiz-feedback article-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
}

function updateScoreAndProgress() {
  scoreLabel.textContent = "本次分數";
  scoreText.textContent = `${correctCount} / ${quizResults.length}`;
  progressText.textContent = quizQuestions.length ? `${Math.min(currentQuestionIndex + 1, quizQuestions.length)} / ${quizQuestions.length}` : "0 / 0";
  wrongCountText.textContent = `${quizResults.filter((result) => result.result !== "correct").length} 題`;
}

function scheduleNextQuestion() {
  window.setTimeout(() => {
    if (quizPhase !== "running") {
      return;
    }
    if (currentQuestionIndex >= quizQuestions.length - 1) {
      renderCompletePanel();
      return;
    }
    currentQuestionIndex += 1;
    renderQuestion();
  }, 650);
}

function recordResult(question, userAnswer, result) {
  if (quizPhase !== "running" || !question || hasAnsweredCurrentQuestion) {
    return;
  }
  hasAnsweredCurrentQuestion = true;
  clearTimer();

  const isCorrect = result === "correct";
  if (result === "timeout") {
    timeoutCount += 1;
    recordQuestionTimeout(question.questionId, ARTICLE_QUIZ_CATEGORY);
  } else {
    recordQuestionAnswer(question.questionId, ARTICLE_QUIZ_CATEGORY, isCorrect);
  }
  if (isCorrect) {
    correctCount += 1;
  }

  quizResults.push({
    order: currentQuestionIndex + 1,
    question: getDisplayQuestion(question),
    userAnswer: result === "timeout" ? "未作答" : userAnswer,
    correctAnswer: question.answer,
    result,
  });
  updateScoreAndProgress();
}

function renderOptions(question) {
  const optionButtons = question.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option article-option";
    button.type = "button";
    button.textContent = answerLabelMap[option] || option;
    button.dataset.answer = option;
    button.addEventListener("click", () => handleAnswer(option));
    return button;
  });
  optionList.replaceChildren(...optionButtons);
}


function scrollToPreparationPanel() {
  practicePanel?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderPreparationPanel() {
  clearTimer();
  quizPhase = "ready";
  practicePanel.hidden = false;
  completePanel.hidden = true;
  const total = quizQuestions.length;
  questionCategory.textContent = `${ARTICLE_QUIZ_TITLE}｜測驗準備中`;
  questionSentence.textContent = total ? "請按下方按鈕開始測驗。" : "目前沒有可用題目";
  optionList.replaceChildren();
  clearFeedback();
  scoreLabel.textContent = "本次分數";
  scoreText.textContent = "0 / 0";
  progressText.textContent = `0 / ${total}`;
  wrongCountText.textContent = "0 題";
  const timerStatus = document.querySelector("#articleTimerStatus");
  if (timerStatus) timerStatus.textContent = "尚未開始";
  nextButton.disabled = true;
  nextButton.textContent = "答題後自動下一題";

  const readyCard = document.createElement("article");
  readyCard.className = "quiz-card quiz-ready-card";
  readyCard.innerHTML = `
    <span class="card-number">測驗準備</span>
    <h3 class="quiz-title">英文測驗準備</h3>
    <div class="quiz-ready-details">
      <p>測驗類型：${ARTICLE_QUIZ_TITLE}</p>
      <p>本次測驗：${total} 題</p>
      <p>每題限時：${ENGLISH_QUIZ_TIME_LIMIT_SECONDS} 秒</p>
      <p>請按下方按鈕開始測驗。</p>
    </div>
  `;
  if (total) {
    const startButton = document.createElement("button");
    startButton.className = "answer-button quiz-start-button";
    startButton.type = "button";
    startButton.textContent = "開始測驗";
    startButton.addEventListener("click", () => {
      if (quizPhase === "running") return;
      quizPhase = "running";
      quizStartedAt = new Date().toISOString();
      renderQuestion();
    });
    readyCard.append(startButton);
  } else {
    readyCard.querySelector(".quiz-ready-details p:last-child").textContent = "目前沒有可用題目。";
  }
  optionList.replaceChildren(readyCard);
}

function renderQuestion() {
  if (quizPhase !== "running") {
    renderPreparationPanel();
    return;
  }
  const question = getCurrentQuestion();
  clearTimer();

  if (!question) {
    practicePanel.hidden = false;
    completePanel.hidden = true;
    questionCategory.textContent = `${ARTICLE_QUIZ_TITLE}｜目前沒有題目`;
    questionSentence.textContent = "這個分類目前沒有可測驗的題目。";
    optionList.replaceChildren();
    clearFeedback();
    updateScoreAndProgress();
    nextButton.disabled = true;
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = `${ARTICLE_QUIZ_TITLE}｜第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`;
  questionSentence.textContent = getDisplayQuestion(question);
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  renderOptions(question);
  updateScoreAndProgress();
  nextButton.disabled = true;
  nextButton.textContent = "答題後自動下一題";
  recordQuestionSeen(question.questionId, ARTICLE_QUIZ_CATEGORY);
  startTimer();
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();
  if (quizPhase !== "running" || !question || hasAnsweredCurrentQuestion) {
    return;
  }

  const isCorrect = answer === question.answer;
  recordResult(question, answer, isCorrect ? "correct" : "wrong");
  optionList.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
    button.classList.toggle("is-wrong", button.dataset.answer === answer && !isCorrect);
  });
  feedback.className = `quiz-feedback article-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  scheduleNextQuestion();
}

function handleTimeout() {
  const question = getCurrentQuestion();
  if (quizPhase !== "running" || !question || hasAnsweredCurrentQuestion) {
    return;
  }
  recordResult(question, "未作答", "timeout");
  optionList.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
  });
  feedback.className = "quiz-feedback article-feedback is-wrong";
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
  quizPhase = "complete";
  const total = quizResults.length;
  const wrongCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const endedAt = new Date().toISOString();
  recordEnglishLearningSession({
    module: "articles",
    mode: "quiz",
    totalQuestions: total,
    correctCount,
    wrongCount,
    durationSeconds: quizStartedAt ? Math.max(0, Math.round((new Date(endedAt) - new Date(quizStartedAt)) / 1000)) : 0,
    startedAt: quizStartedAt || endedAt,
    endedAt,
  });

  practicePanel.hidden = true;
  completePanel.hidden = false;
  completeBadge.textContent = "完成";
  completeTitle.textContent = `${ARTICLE_QUIZ_TITLE}完成！`;
  resultModeText.textContent = `測驗類型：${ARTICLE_QUIZ_TITLE}`;
  totalAnsweredText.textContent = `${total} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  remainingWrongText.textContent = `${timeoutCount} 題`;
  remainingWrongText.nextElementSibling.textContent = "逾時";
  completeMessage.textContent = `本次共 ${total} 題，答錯 ${wrongCount} 題，其中逾時 ${timeoutCount} 題。`;
  completePanel.querySelector(".quiz-result-list")?.remove();
  completePanel.querySelector(".article-result-card")?.append(createResultList());
}

function restartPractice(shouldScroll = false) {
  clearTimer();
  quizPhase = "ready";
  quizQuestions = selectEnglishQuizQuestions(Array.isArray(window.articleQuestions) ? window.articleQuestions : [], ARTICLE_QUIZ_CATEGORY);
  currentQuestionIndex = 0;
  correctCount = 0;
  timeoutCount = 0;
  hasAnsweredCurrentQuestion = false;
  quizResults = [];
  quizStartedAt = null;
  reviewMessage.textContent = "";
  modeDescription.textContent = "分類測驗：只抽冠詞題，每題 10 秒，完成後顯示總表。";
  modeButtons.forEach((button) => { button.disabled = true; });
  filterButtons.forEach((button) => { button.disabled = true; });
  startReviewButton.disabled = true;
  if (completeReviewButton) completeReviewButton.disabled = true;
  backToPracticeButton.hidden = true;
  clearWrongQuestionsButton.disabled = true;
  renderPreparationPanel();
  if (shouldScroll) {
    scrollToPreparationPanel();
  }
}

nextButton.addEventListener("click", () => {});
restartButtons.forEach((button) => button.addEventListener("click", () => restartPractice(true)));
window.addEventListener("beforeunload", clearTimer);

restartPractice();
