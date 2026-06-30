const articlePracticeAnswerLabelMap = {
  a: "a",
  an: "an",
  the: "the",
  不填: "不填",
};

const articlePracticeQuestions = Array.isArray(window.articleQuestions) ? [...window.articleQuestions] : [];
const practiceScoreText = document.querySelector("#articlePracticeScore");
const practiceProgressText = document.querySelector("#articlePracticeProgress");
const practiceCategoryText = document.querySelector("#articlePracticeCategory");
const practiceSentenceText = document.querySelector("#articlePracticeSentence");
const practiceOptions = document.querySelector("#articlePracticeOptions");
const practiceFeedback = document.querySelector("#articlePracticeFeedback");
const practiceExplanation = document.querySelector("#articlePracticeExplanation");
const nextPracticeButton = document.querySelector("#nextArticlePracticeQuestion");
const restartPracticeButton = document.querySelector("#restartArticlePracticeOnly");

let orderedArticlePracticeQuestions = [];
let currentArticlePracticeIndex = 0;
let articlePracticeCorrectCount = 0;
let articlePracticeAnsweredCount = 0;
let hasAnsweredArticlePracticeQuestion = false;

function shuffleArticlePracticeQuestions(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getCurrentArticlePracticeQuestion() {
  return orderedArticlePracticeQuestions[currentArticlePracticeIndex];
}

function updateArticlePracticeStats() {
  practiceScoreText.textContent = `${articlePracticeCorrectCount} / ${articlePracticeAnsweredCount}`;
  practiceProgressText.textContent = orderedArticlePracticeQuestions.length ? `${currentArticlePracticeIndex + 1} / ${orderedArticlePracticeQuestions.length}` : "0 / 0";
}

function clearArticlePracticeFeedback() {
  practiceFeedback.className = "quiz-feedback article-feedback";
  practiceFeedback.textContent = "";
  practiceExplanation.textContent = "";
}

function renderArticlePracticeOptions(question) {
  const buttons = question.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option article-option";
    button.type = "button";
    button.textContent = articlePracticeAnswerLabelMap[option] || option;
    button.dataset.answer = option;
    button.addEventListener("click", () => handleArticlePracticeAnswer(option));
    return button;
  });
  practiceOptions.replaceChildren(...buttons);
}

function renderArticlePracticeQuestion() {
  const question = getCurrentArticlePracticeQuestion();
  hasAnsweredArticlePracticeQuestion = false;
  nextPracticeButton.disabled = true;
  clearArticlePracticeFeedback();

  if (!question) {
    practiceCategoryText.textContent = "分類：—";
    practiceSentenceText.textContent = "目前沒有可練習的冠詞題目。";
    practiceOptions.replaceChildren();
    updateArticlePracticeStats();
    return;
  }

  practiceCategoryText.textContent = `分類：${question.category || question.usageType || "冠詞"}`;
  practiceSentenceText.textContent = question.blankSentence || question.sentence || "";
  renderArticlePracticeOptions(question);
  updateArticlePracticeStats();
}

function handleArticlePracticeAnswer(answer) {
  const question = getCurrentArticlePracticeQuestion();
  if (!question || hasAnsweredArticlePracticeQuestion) return;

  hasAnsweredArticlePracticeQuestion = true;
  articlePracticeAnsweredCount += 1;
  const isCorrect = answer === question.answer;
  if (isCorrect) articlePracticeCorrectCount += 1;

  practiceOptions.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
    button.classList.toggle("is-wrong", button.dataset.answer === answer && !isCorrect);
  });
  practiceFeedback.className = `quiz-feedback article-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  practiceFeedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  practiceExplanation.textContent = question.explanation || "";
  nextPracticeButton.disabled = false;
  updateArticlePracticeStats();
}

function goToNextArticlePracticeQuestion() {
  if (currentArticlePracticeIndex >= orderedArticlePracticeQuestions.length - 1) {
    orderedArticlePracticeQuestions = shuffleArticlePracticeQuestions(articlePracticeQuestions);
    currentArticlePracticeIndex = 0;
  } else {
    currentArticlePracticeIndex += 1;
  }
  renderArticlePracticeQuestion();
}

function restartArticlePractice() {
  orderedArticlePracticeQuestions = shuffleArticlePracticeQuestions(articlePracticeQuestions);
  currentArticlePracticeIndex = 0;
  articlePracticeCorrectCount = 0;
  articlePracticeAnsweredCount = 0;
  renderArticlePracticeQuestion();
}

nextPracticeButton.addEventListener("click", goToNextArticlePracticeQuestion);
restartPracticeButton.addEventListener("click", restartArticlePractice);
restartArticlePractice();
