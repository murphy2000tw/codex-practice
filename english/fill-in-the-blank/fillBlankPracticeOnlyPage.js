const fillBlankPracticeQuestions = Array.isArray(window.fillBlankQuestions) ? window.fillBlankQuestions : [];
let fillBlankPracticeOrder = [...fillBlankPracticeQuestions];
let fillBlankPracticeIndex = 0;
let fillBlankPracticeCorrect = 0;
let fillBlankPracticeAnswered = 0;
let fillBlankPracticeAnsweredCurrent = false;

const fillBlankPracticeElements = {
  progress: document.querySelector("#fillBlankProgress"),
  score: document.querySelector("#fillBlankScore"),
  category: document.querySelector("#fillBlankQuestionCategory"),
  sentence: document.querySelector("#fillBlankQuestionSentence"),
  input: document.querySelector("#fillBlankAnswerInput"),
  check: document.querySelector("#checkFillBlankAnswer"),
  hint: document.querySelector("#fillBlankHint"),
  hintButton: document.querySelector("#showFillBlankHint"),
  feedback: document.querySelector("#fillBlankFeedback"),
  explanation: document.querySelector("#fillBlankExplanation"),
  translation: document.querySelector("#fillBlankTranslation"),
  next: document.querySelector("#nextFillBlankQuestion"),
  restart: document.querySelector("#restartFillBlankPractice"),
};

function normalizeFillBlankPracticeAnswer(answer) {
  return String(answer).trim().replace(/[。．.！？!?，,；;：:]+$/g, "").trim().toLowerCase();
}

function isFillBlankPracticeCorrect(userAnswer, question) {
  const acceptableAnswers = Array.isArray(question.acceptableAnswers) && question.acceptableAnswers.length
    ? question.acceptableAnswers
    : [question.answer];
  return acceptableAnswers.some((answer) => normalizeFillBlankPracticeAnswer(answer) === normalizeFillBlankPracticeAnswer(userAnswer));
}

function getCurrentFillBlankPracticeQuestion() {
  return fillBlankPracticeOrder[fillBlankPracticeIndex];
}

function updateFillBlankPracticeStatus() {
  fillBlankPracticeElements.score.textContent = `${fillBlankPracticeCorrect} / ${fillBlankPracticeAnswered}`;
  fillBlankPracticeElements.progress.textContent = fillBlankPracticeOrder.length
    ? `${fillBlankPracticeIndex + 1} / ${fillBlankPracticeOrder.length}`
    : "0 / 0";
}

function clearFillBlankPracticeFeedback() {
  fillBlankPracticeElements.feedback.className = "quiz-feedback fill-blank-feedback";
  fillBlankPracticeElements.feedback.textContent = "";
  fillBlankPracticeElements.explanation.textContent = "";
  fillBlankPracticeElements.translation.textContent = "";
  fillBlankPracticeElements.hint.hidden = true;
  fillBlankPracticeElements.hint.textContent = "";
  fillBlankPracticeElements.hintButton.setAttribute("aria-expanded", "false");
}

function renderFillBlankPracticeQuestion() {
  const question = getCurrentFillBlankPracticeQuestion();
  clearFillBlankPracticeFeedback();
  fillBlankPracticeAnsweredCurrent = false;
  updateFillBlankPracticeStatus();

  if (!question) {
    fillBlankPracticeElements.category.textContent = "分類：—";
    fillBlankPracticeElements.sentence.textContent = "目前沒有可練習的填空題。";
    fillBlankPracticeElements.input.disabled = true;
    fillBlankPracticeElements.check.disabled = true;
    fillBlankPracticeElements.next.disabled = true;
    fillBlankPracticeElements.hintButton.disabled = true;
    return;
  }

  fillBlankPracticeElements.category.textContent = `分類：${question.category || "填空"}`;
  fillBlankPracticeElements.sentence.textContent = question.blankSentence || question.sentence;
  fillBlankPracticeElements.input.value = "";
  fillBlankPracticeElements.input.disabled = false;
  fillBlankPracticeElements.check.disabled = false;
  fillBlankPracticeElements.next.disabled = false;
  fillBlankPracticeElements.hintButton.disabled = false;
  fillBlankPracticeElements.input.focus();
}

function checkFillBlankPracticeAnswer() {
  const question = getCurrentFillBlankPracticeQuestion();
  if (!question || fillBlankPracticeAnsweredCurrent) return;

  const userAnswer = fillBlankPracticeElements.input.value.trim();
  const isCorrect = isFillBlankPracticeCorrect(userAnswer, question);
  fillBlankPracticeAnsweredCurrent = true;
  fillBlankPracticeAnswered += 1;
  if (isCorrect) fillBlankPracticeCorrect += 1;

  fillBlankPracticeElements.input.disabled = true;
  fillBlankPracticeElements.check.disabled = true;
  fillBlankPracticeElements.feedback.className = `quiz-feedback fill-blank-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  fillBlankPracticeElements.feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  fillBlankPracticeElements.explanation.textContent = question.explanation || "";
  fillBlankPracticeElements.translation.textContent = question.translation ? `中文：${question.translation}` : "";
  updateFillBlankPracticeStatus();
}

function showFillBlankPracticeHint() {
  const question = getCurrentFillBlankPracticeQuestion();
  if (!question) return;
  const isHidden = fillBlankPracticeElements.hint.hidden;
  fillBlankPracticeElements.hint.hidden = !isHidden;
  fillBlankPracticeElements.hint.textContent = question.hint || "這題沒有提示。";
  fillBlankPracticeElements.hintButton.textContent = isHidden ? "隱藏提示" : "顯示提示";
  fillBlankPracticeElements.hintButton.setAttribute("aria-expanded", String(isHidden));
}

function moveToNextFillBlankPracticeQuestion() {
  if (!fillBlankPracticeOrder.length) return;
  fillBlankPracticeIndex = (fillBlankPracticeIndex + 1) % fillBlankPracticeOrder.length;
  renderFillBlankPracticeQuestion();
}

function restartFillBlankPractice() {
  fillBlankPracticeOrder = [...fillBlankPracticeQuestions];
  fillBlankPracticeIndex = 0;
  fillBlankPracticeCorrect = 0;
  fillBlankPracticeAnswered = 0;
  renderFillBlankPracticeQuestion();
}

fillBlankPracticeElements.check.addEventListener("click", checkFillBlankPracticeAnswer);
fillBlankPracticeElements.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") checkFillBlankPracticeAnswer();
});
fillBlankPracticeElements.hintButton.addEventListener("click", showFillBlankPracticeHint);
fillBlankPracticeElements.next.addEventListener("click", moveToNextFillBlankPracticeQuestion);
fillBlankPracticeElements.restart.addEventListener("click", restartFillBlankPractice);

restartFillBlankPractice();
