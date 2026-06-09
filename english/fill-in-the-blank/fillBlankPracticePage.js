const questions = Array.isArray(window.fillBlankQuestions) ? window.fillBlankQuestions : [];

const progressText = document.querySelector("#fillBlankProgress");
const scoreText = document.querySelector("#fillBlankScore");
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
const resultModeText = document.querySelector("#fillBlankResultMode");
const totalAnsweredText = document.querySelector("#fillBlankTotalAnswered");
const totalCorrectText = document.querySelector("#fillBlankTotalCorrect");
const totalWrongText = document.querySelector("#fillBlankTotalWrong");
const accuracyText = document.querySelector("#fillBlankAccuracy");

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let hasAnsweredCurrentQuestion = false;
let wasCurrentAnswerCorrect = false;
let currentFillBlankMode = "practice";

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

function updateFillBlankModeControls() {
  modeButtons.forEach((button) => {
    const isActive = button.dataset.fillBlankMode === currentFillBlankMode;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  modeDescription.textContent = currentFillBlankMode === "test"
    ? "測試模式：不提供提示、解釋與中文翻譯，適合測驗作答能力。"
    : "練習模式：可以查看提示、解釋與中文翻譯，適合學習。";
}

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${answeredCount}`;
  progressText.textContent = `${Math.min(currentQuestionIndex + 1, shuffledQuestions.length)} / ${shuffledQuestions.length}`;
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

function renderQuestion() {
  const question = getCurrentQuestion();

  if (!question) {
    renderCompletePanel();
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  questionCategory.textContent = `分類：${question.category}`;
  questionSentence.textContent = question.blankSentence;
  answerInput.value = "";
  answerInput.disabled = false;
  hasAnsweredCurrentQuestion = false;
  wasCurrentAnswerCorrect = false;
  clearFeedback();
  hideHint();
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
  resultModeText.textContent = `模式：${getFillBlankModeLabel()}`;
  totalAnsweredText.textContent = `${answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
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

function restartPractice() {
  shuffledQuestions = shuffleQuestions(questions);
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  hasAnsweredCurrentQuestion = false;
  wasCurrentAnswerCorrect = false;
  updateFillBlankModeControls();
  renderQuestion();
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

restartPractice();
