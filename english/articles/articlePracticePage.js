const answerLabelMap = {
  a: "a",
  an: "an",
  the: "the",
  不填: "不填",
};

const questions = Array.isArray(window.articleQuestions) ? window.articleQuestions : [];

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

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let hasAnsweredCurrentQuestion = false;
let selectedAnswer = "";
let activeCategory = "all";
let currentMode = "practice";
let currentArticleMode = "practice";
let wrongQuestions = [];
let reviewQuestionTotal = 0;

function shuffleQuestions(sourceQuestions) {
  const shuffled = [...sourceQuestions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function getFilteredQuestions() {
  if (activeCategory === "all") {
    return questions;
  }

  return questions.filter((question) => question.category === activeCategory);
}

function getCurrentQuestion() {
  return shuffledQuestions[currentQuestionIndex];
}

function isReviewMode() {
  return currentMode === "review";
}

function getArticleModeLabel() {
  return currentArticleMode === "test" ? "測試模式" : "練習模式";
}

function updateArticleModeControls() {
  modeButtons.forEach((button) => {
    const isActive = button.dataset.articleMode === currentArticleMode;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  modeDescription.textContent = currentArticleMode === "test"
    ? "測試模式：不顯示解釋，適合檢查自己是否真的會用冠詞。"
    : "練習模式：答題後會顯示解釋，適合學習文法觀念。";
}

function updateReviewControls() {
  const hasWrongQuestions = wrongQuestions.length > 0;

  wrongCountText.textContent = `${wrongQuestions.length} 題`;
  startReviewButton.disabled = !hasWrongQuestions;
  completeReviewButton.disabled = !hasWrongQuestions;
  backToPracticeButton.hidden = !isReviewMode();
  scoreLabel.textContent = isReviewMode() ? "錯題複習分數" : "目前分數";
}

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${answeredCount}`;
  const currentProgress = shuffledQuestions.length ? Math.min(currentQuestionIndex + 1, shuffledQuestions.length) : 0;
  progressText.textContent = `${currentProgress} / ${shuffledQuestions.length}`;
  updateReviewControls();
}

function clearFeedback() {
  feedback.className = "quiz-feedback article-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
}

function createWrongQuestion(question, answer) {
  return {
    id: question.id,
    blankSentence: question.blankSentence,
    sentence: question.sentence,
    answer: question.answer,
    selectedAnswer: answer,
    explanation: question.explanation,
    category: question.category,
    usageType: question.usageType,
    options: question.options,
  };
}

function addWrongQuestion(question, answer) {
  const hasWrongQuestion = wrongQuestions.some((wrongQuestion) => wrongQuestion.id === question.id);

  if (!hasWrongQuestion) {
    wrongQuestions = [...wrongQuestions, createWrongQuestion(question, answer)];
  }
}

function removeWrongQuestion(questionId) {
  wrongQuestions = wrongQuestions.filter((wrongQuestion) => wrongQuestion.id !== questionId);
}

function renderOptions(question) {
  const optionButtons = question.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option article-option";
    button.type = "button";
    button.textContent = answerLabelMap[option] || option;
    button.dataset.answer = option;
    button.setAttribute("aria-pressed", String(option === selectedAnswer));

    if (hasAnsweredCurrentQuestion) {
      button.classList.toggle("is-correct", option === question.answer);
      button.classList.toggle("is-wrong", option === selectedAnswer && option !== question.answer);
    }

    button.addEventListener("click", () => handleAnswer(option));
    return button;
  });

  optionList.replaceChildren(...optionButtons);
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category === activeCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = isReviewMode();
  });
}

function showReviewMessage(message) {
  reviewMessage.textContent = message;
}

function resetCounters() {
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  hasAnsweredCurrentQuestion = false;
  selectedAnswer = "";
}

function renderQuestion() {
  const question = getCurrentQuestion();

  if (!question) {
    practicePanel.hidden = false;
    completePanel.hidden = true;
    questionCategory.textContent = isReviewMode() ? "錯題複習：目前沒有錯題" : "分類：沒有題目";
    questionSentence.textContent = isReviewMode() ? "目前沒有錯題可以複習。" : "這個分類目前沒有可練習的題目。";
    optionList.replaceChildren();
    clearFeedback();
    updateScoreAndProgress();
    nextButton.disabled = true;
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = isReviewMode()
    ? `錯題複習｜分類：${question.category}｜用法：${question.usageType || "基本用法"}`
    : `分類：${question.category}｜用法：${question.usageType || "基本用法"}`;
  questionSentence.textContent = question.blankSentence;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  renderOptions(question);
  updateScoreAndProgress();
  nextButton.disabled = true;
  nextButton.textContent = currentQuestionIndex >= shuffledQuestions.length - 1 ? "完成後查看結果" : "下一題";
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();

  if (!question) {
    return;
  }

  selectedAnswer = answer;
  const isCorrect = answer === question.answer;

  if (!hasAnsweredCurrentQuestion) {
    answeredCount += 1;

    if (isCorrect) {
      correctCount += 1;

      if (isReviewMode()) {
        removeWrongQuestion(question.id);
      }
    } else if (!isReviewMode()) {
      addWrongQuestion(question, answer);
    }
  }

  hasAnsweredCurrentQuestion = true;

  feedback.className = `quiz-feedback article-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  explanation.textContent = currentArticleMode === "practice" ? question.explanation : "";
  renderOptions(question);
  updateScoreAndProgress();
  nextButton.disabled = currentQuestionIndex >= shuffledQuestions.length - 1;

  if (currentQuestionIndex === shuffledQuestions.length - 1) {
    renderCompletePanel(false);
  }
}

function renderCompletePanel(hidePractice = true) {
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  practicePanel.hidden = hidePractice;
  completePanel.hidden = false;
  completeBadge.textContent = isReviewMode() ? "複習完成" : "完成";
  completeTitle.textContent = isReviewMode() ? "錯題複習完成！" : "冠詞練習完成！";
  resultModeText.textContent = `模式：${getArticleModeLabel()}`;
  totalAnsweredText.textContent = `${isReviewMode() ? reviewQuestionTotal : answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  remainingWrongText.textContent = `${wrongQuestions.length} 題`;

  if (isReviewMode()) {
    completeMessage.textContent = wrongQuestions.length
      ? `剩餘 ${wrongQuestions.length} 題錯題，可繼續複習或返回一般練習。`
      : "太好了，本次錯題已全部完成！";
  } else {
    completeMessage.textContent = wrongQuestions.length
      ? `本次錯題：${wrongQuestions.length} 題，可點選「錯題複習」加強。`
      : "太好了，本輪沒有錯題！";
  }

  updateScoreAndProgress();
}

function goToNextQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length - 1) {
    renderCompletePanel();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
}

function restartPractice() {
  currentMode = "practice";
  shuffledQuestions = shuffleQuestions(getFilteredQuestions());
  reviewQuestionTotal = 0;
  resetCounters();
  showReviewMessage("");
  updateArticleModeControls();
  updateFilterButtons();
  renderQuestion();
}

function restartCurrentPractice() {
  if (isReviewMode()) {
    startWrongQuestionReview();
    return;
  }

  restartPractice();
}

function startWrongQuestionReview() {
  if (!wrongQuestions.length) {
    showReviewMessage("目前沒有錯題");
    updateReviewControls();
    return;
  }

  currentMode = "review";
  shuffledQuestions = shuffleQuestions(wrongQuestions);
  reviewQuestionTotal = shuffledQuestions.length;
  resetCounters();
  showReviewMessage("");
  updateFilterButtons();
  renderQuestion();
}

function returnToPractice() {
  restartPractice();
}

function clearWrongQuestions() {
  wrongQuestions = [];
  showReviewMessage("本次錯題已清除");

  if (isReviewMode()) {
    restartPractice();
    showReviewMessage("本次錯題已清除，已返回一般練習。");
    return;
  }

  updateScoreAndProgress();
  if (!practicePanel.hidden && getCurrentQuestion()) {
    renderOptions(getCurrentQuestion());
  }
  if (!completePanel.hidden) {
    renderCompletePanel(practicePanel.hidden);
  }
}

function changeCategoryFilter(category) {
  activeCategory = category;
  restartPractice();
}

function changeArticleMode(nextMode) {
  if (!nextMode || nextMode === currentArticleMode) {
    return;
  }

  currentArticleMode = nextMode;
  restartPractice();
}

nextButton.addEventListener("click", goToNextQuestion);
restartButtons.forEach((button) => button.addEventListener("click", restartCurrentPractice));
filterButtons.forEach((button) => {
  button.addEventListener("click", () => changeCategoryFilter(button.dataset.category || "all"));
});
modeButtons.forEach((button) => {
  button.addEventListener("click", () => changeArticleMode(button.dataset.articleMode));
});
startReviewButton.addEventListener("click", startWrongQuestionReview);
completeReviewButton.addEventListener("click", startWrongQuestionReview);
backToPracticeButton.addEventListener("click", returnToPractice);
clearWrongQuestionsButton.addEventListener("click", clearWrongQuestions);

restartPractice();
