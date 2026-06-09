const questions = Array.isArray(window.fillBlankQuestions) ? window.fillBlankQuestions : [];

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

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let hasAnsweredCurrentQuestion = false;
let wasCurrentAnswerCorrect = false;
let currentFillBlankMode = "practice";
let wrongQuestions = [];
let isWrongReviewMode = false;
let wrongReviewSessionTotal = 0;

function updateQuestionSummary() {
  if (questionTotalText) {
    questionTotalText.textContent = `${questions.length} 題`;
  }

  if (categoryTotalText) {
    const categoryCount = new Set(questions.map((question) => question.category).filter(Boolean)).size;
    categoryTotalText.textContent = `${categoryCount} 類`;
  }
}

function shuffleQuestions(sourceQuestions) {
  const shuffled = [...sourceQuestions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function getCurrentQuestion() {
  return shuffledQuestions[currentQuestionIndex];
}

function normalizeAnswer(answer) {
  return answer
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

function getFillBlankModeLabel() {
  return currentFillBlankMode === "test" ? "測試模式" : "練習模式";
}

function getModeDescriptionText() {
  return currentFillBlankMode === "test"
    ? "測試模式：不提供提示、解釋與中文翻譯，適合測驗作答能力。"
    : "練習模式：可以查看提示、解釋與中文翻譯，適合學習。";
}

function updateWrongQuestionControls() {
  const wrongCount = wrongQuestions.length;

  if (wrongCountText) {
    wrongCountText.textContent = `${wrongCount} 題`;
  }

  [startWrongReviewButton, resultWrongReviewButton].forEach((button) => {
    if (button) {
      button.disabled = wrongCount === 0;
    }
  });

  if (clearWrongQuestionsButton) {
    clearWrongQuestionsButton.disabled = wrongCount === 0;
  }

  if (exitWrongReviewButton) {
    exitWrongReviewButton.hidden = !isWrongReviewMode;
  }
}

function updateFillBlankModeControls() {
  modeButtons.forEach((button) => {
    const isActive = button.dataset.fillBlankMode === currentFillBlankMode;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  modeDescription.textContent = isWrongReviewMode
    ? `錯題複習：${getModeDescriptionText()}`
    : getModeDescriptionText();
  updateWrongQuestionControls();
}

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${answeredCount}`;
  progressText.textContent = `${Math.min(currentQuestionIndex + 1, shuffledQuestions.length)} / ${shuffledQuestions.length}`;
  updateWrongQuestionControls();
}

function clearFeedback() {
  feedback.className = "quiz-feedback fill-blank-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
  translation.textContent = "";
}

function hideHint() {
  hintText.hidden = true;
  hintText.textContent = "";
  hintButton.setAttribute("aria-expanded", "false");
}

function updateHintButtonVisibility() {
  const isPracticeMode = currentFillBlankMode === "practice";

  hintButton.hidden = !isPracticeMode;
  hintButton.disabled = !isPracticeMode;
}

function showHint() {
  const question = getCurrentQuestion();

  if (currentFillBlankMode !== "practice" || !question) {
    return;
  }

  hintText.textContent = `提示：${question.hint}`;
  hintText.hidden = false;
  hintButton.setAttribute("aria-expanded", "true");
}

function createWrongQuestionRecord(question, selectedAnswer) {
  return {
    id: question.id,
    sentence: question.sentence,
    blankSentence: question.blankSentence,
    answer: question.answer,
    acceptableAnswers: Array.isArray(question.acceptableAnswers) ? [...question.acceptableAnswers] : [],
    selectedAnswer,
    translation: question.translation,
    explanation: question.explanation,
    category: question.category,
    hint: question.hint,
    practiceMode: getFillBlankModeLabel(),
  };
}

function addWrongQuestion(question, selectedAnswer) {
  if (!question || wrongQuestions.some((wrongQuestion) => wrongQuestion.id === question.id)) {
    return;
  }

  wrongQuestions.push(createWrongQuestionRecord(question, selectedAnswer));
  updateWrongQuestionControls();
}

function removeWrongQuestion(questionId) {
  wrongQuestions = wrongQuestions.filter((wrongQuestion) => wrongQuestion.id !== questionId);
  updateWrongQuestionControls();
}

function renderEmptyWrongReviewMessage() {
  isWrongReviewMode = false;
  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = "錯題複習";
  questionSentence.textContent = "目前沒有錯題";
  answerInput.value = "";
  answerInput.disabled = true;
  checkButton.disabled = true;
  nextButton.disabled = true;
  nextButton.textContent = "下一題";
  clearFeedback();
  hideHint();
  updateFillBlankModeControls();
  updateScoreAndProgress();
}

function renderQuestion() {
  const question = getCurrentQuestion();

  if (!question) {
    if (isWrongReviewMode && wrongQuestions.length === 0 && wrongReviewSessionTotal === 0) {
      renderEmptyWrongReviewMessage();
      return;
    }

    renderCompletePanel();
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = isWrongReviewMode ? `錯題複習｜分類：${question.category}` : `分類：${question.category}`;
  questionSentence.textContent = question.blankSentence;
  answerInput.value = "";
  answerInput.disabled = false;
  checkButton.disabled = false;
  hasAnsweredCurrentQuestion = false;
  wasCurrentAnswerCorrect = false;
  clearFeedback();
  hideHint();
  updateFillBlankModeControls();
  updateHintButtonVisibility();
  updateScoreAndProgress();
  nextButton.disabled = true;
  nextButton.textContent = currentQuestionIndex >= shuffledQuestions.length - 1 ? "查看結果" : "下一題";
  answerInput.focus();
}

function renderAnswerResult(question, isCorrect) {
  feedback.className = `quiz-feedback fill-blank-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;

  if (currentFillBlankMode === "practice") {
    explanation.textContent = `解釋：${question.explanation}`;
    translation.textContent = `中文：${question.translation}`;
    return;
  }

  explanation.textContent = "";
  translation.textContent = "";
}

function handleCheckAnswer() {
  const question = getCurrentQuestion();

  if (!question) {
    return;
  }

  const userAnswer = answerInput.value;
  const isCorrect = isCorrectAnswer(userAnswer, question);

  if (!hasAnsweredCurrentQuestion) {
    answeredCount += 1;

    if (isCorrect) {
      correctCount += 1;

      if (isWrongReviewMode) {
        removeWrongQuestion(question.id);
      }
    } else {
      addWrongQuestion(question, userAnswer.trim());
    }

    wasCurrentAnswerCorrect = isCorrect;
  }

  hasAnsweredCurrentQuestion = true;
  renderAnswerResult(question, wasCurrentAnswerCorrect);
  updateScoreAndProgress();
  nextButton.disabled = false;

  if (currentQuestionIndex >= shuffledQuestions.length - 1) {
    nextButton.textContent = "查看結果";
  }
}

function renderCompletePanel() {
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  practicePanel.hidden = true;
  completePanel.hidden = false;
  completeTitle.textContent = isWrongReviewMode ? "填空錯題複習完成！" : "填空題練習完成！";
  resultModeText.textContent = isWrongReviewMode ? `錯題複習模式：${getFillBlankModeLabel()}` : `模式：${getFillBlankModeLabel()}`;
  totalAnsweredText.textContent = `${answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  remainingWrongText.textContent = `${wrongQuestions.length} 題`;

  if (isWrongReviewMode) {
    wrongResultMessage.textContent = wrongQuestions.length === 0
      ? `本次複習題數：${wrongReviewSessionTotal} 題。太好了，本次填空錯題已全部完成！`
      : `本次複習題數：${wrongReviewSessionTotal} 題，剩餘錯題：${wrongQuestions.length} 題。`;
  } else {
    wrongResultMessage.textContent = wrongQuestions.length === 0
      ? "太好了，本輪沒有錯題！"
      : `本次錯題：${wrongQuestions.length} 題`;
  }

  updateFillBlankModeControls();
  updateScoreAndProgress();
}

function goToNextQuestion() {
  if (!hasAnsweredCurrentQuestion) {
    return;
  }

  if (currentQuestionIndex >= shuffledQuestions.length - 1) {
    renderCompletePanel();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
}

function resetPracticeState(nextQuestions) {
  shuffledQuestions = shuffleQuestions(nextQuestions);
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  hasAnsweredCurrentQuestion = false;
  wasCurrentAnswerCorrect = false;
  updateFillBlankModeControls();
  renderQuestion();
}

function restartPractice() {
  if (isWrongReviewMode) {
    wrongReviewSessionTotal = wrongQuestions.length;
    resetPracticeState(wrongQuestions);
    return;
  }

  wrongReviewSessionTotal = 0;
  resetPracticeState(questions);
}

function startWrongReview() {
  if (wrongQuestions.length === 0) {
    renderEmptyWrongReviewMessage();
    return;
  }

  isWrongReviewMode = true;
  wrongReviewSessionTotal = wrongQuestions.length;
  resetPracticeState(wrongQuestions);
}

function exitWrongReview() {
  isWrongReviewMode = false;
  wrongReviewSessionTotal = 0;
  resetPracticeState(questions);
}

function clearWrongQuestions() {
  wrongQuestions = [];
  updateWrongQuestionControls();

  if (isWrongReviewMode) {
    renderEmptyWrongReviewMessage();
    return;
  }

  if (completePanel.hidden) {
    feedback.className = "quiz-feedback fill-blank-feedback";
    feedback.textContent = "已清除本次填空錯題。";
  } else {
    renderCompletePanel();
  }
}

function changeFillBlankMode(nextMode) {
  if (!nextMode || nextMode === currentFillBlankMode) {
    return;
  }

  currentFillBlankMode = nextMode;
  restartPractice();
}

checkButton.addEventListener("click", handleCheckAnswer);
hintButton.addEventListener("click", showHint);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => changeFillBlankMode(button.dataset.fillBlankMode));
});
nextButton.addEventListener("click", goToNextQuestion);
answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleCheckAnswer();
  }
});
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));
startWrongReviewButton.addEventListener("click", startWrongReview);
resultWrongReviewButton.addEventListener("click", startWrongReview);
clearWrongQuestionsButton.addEventListener("click", clearWrongQuestions);
exitWrongReviewButton.addEventListener("click", exitWrongReview);

updateQuestionSummary();
restartPractice();
