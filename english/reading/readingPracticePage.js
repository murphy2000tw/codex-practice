const readingArticles = Array.isArray(window.readingQuestions) ? window.readingQuestions : [];

const articleTitle = document.querySelector("#readingArticleTitle");
const articleMeta = document.querySelector("#readingArticleMeta");
const passageText = document.querySelector("#readingPassage");
const translationToggle = document.querySelector("#toggleReadingTranslation");
const translationText = document.querySelector("#readingTranslation");
const questionText = document.querySelector("#readingQuestion");
const questionTypeText = document.querySelector("#readingQuestionType");
const optionList = document.querySelector("#readingOptions");
const feedback = document.querySelector("#readingFeedback");
const explanation = document.querySelector("#readingExplanation");
const scoreText = document.querySelector("#readingScore");
const progressText = document.querySelector("#readingProgress");
const articleProgressText = document.querySelector("#readingArticleProgress");
const nextQuestionButton = document.querySelector("#nextReadingQuestion");
const nextArticleButton = document.querySelector("#nextReadingArticle");
const restartButtons = document.querySelectorAll(".js-restart-reading-practice");
const practicePanel = document.querySelector("#readingPracticePanel");
const completePanel = document.querySelector("#readingCompletePanel");
const totalAnsweredText = document.querySelector("#readingTotalAnswered");
const totalCorrectText = document.querySelector("#readingTotalCorrect");
const totalWrongText = document.querySelector("#readingTotalWrong");
const accuracyText = document.querySelector("#readingAccuracy");

let shuffledArticles = [];
let currentArticleIndex = 0;
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let selectedAnswer = "";
let hasAnsweredCurrentQuestion = false;
let isTranslationVisible = false;

function shuffleArticles(sourceArticles) {
  const shuffled = [...sourceArticles];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function getTotalQuestions() {
  return shuffledArticles.reduce((total, article) => total + article.questions.length, 0);
}

function getQuestionNumber() {
  return shuffledArticles
    .slice(0, currentArticleIndex)
    .reduce((total, article) => total + article.questions.length, currentQuestionIndex + 1);
}

function getCurrentArticle() {
  return shuffledArticles[currentArticleIndex];
}

function getCurrentQuestion() {
  const article = getCurrentArticle();
  return article ? article.questions[currentQuestionIndex] : null;
}

function updateTranslation() {
  const article = getCurrentArticle();

  translationToggle.textContent = isTranslationVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  translationToggle.setAttribute("aria-expanded", String(isTranslationVisible));
  translationText.hidden = !isTranslationVisible;
  translationText.textContent = article && isTranslationVisible ? article.translation : "";
}

function updateScoreAndProgress() {
  const article = getCurrentArticle();
  const articleQuestionCount = article ? article.questions.length : 0;
  const totalQuestions = getTotalQuestions();

  scoreText.textContent = `${correctCount} / ${answeredCount}`;
  progressText.textContent = `${Math.min(getQuestionNumber(), totalQuestions)} / ${totalQuestions}`;
  articleProgressText.textContent = article ? `第 ${currentArticleIndex + 1} 篇：${currentQuestionIndex + 1} / ${articleQuestionCount}` : "—";
}

function clearFeedback() {
  feedback.className = "quiz-feedback reading-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
}

function renderOptions(question) {
  const optionButtons = question.options.map((option) => {
    const button = document.createElement("button");
    button.className = "quiz-option reading-option";
    button.type = "button";
    button.textContent = option;
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

function updateActionButtons() {
  const article = getCurrentArticle();
  const isLastArticle = currentArticleIndex >= shuffledArticles.length - 1;
  const isLastQuestionInArticle = article ? currentQuestionIndex >= article.questions.length - 1 : true;

  nextQuestionButton.disabled = !hasAnsweredCurrentQuestion || isLastQuestionInArticle;
  nextArticleButton.disabled = !hasAnsweredCurrentQuestion || !isLastQuestionInArticle;
  nextArticleButton.textContent = isLastArticle && isLastQuestionInArticle ? "查看結果" : "下一篇文章";
}

function renderQuestion() {
  const article = getCurrentArticle();
  const question = getCurrentQuestion();

  if (!article || !question) {
    renderCompletePanel();
    return;
  }

  practicePanel.hidden = false;
  completePanel.hidden = true;
  articleTitle.textContent = article.title;
  articleMeta.textContent = `${article.level}｜${article.category}`;
  passageText.textContent = article.passage;
  questionTypeText.textContent = question.questionType ? `題型：${question.questionType}` : "題型：—";
  questionText.textContent = question.question;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  updateTranslation();
  renderOptions(question);
  updateScoreAndProgress();
  updateActionButtons();
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();
  const article = getCurrentArticle();

  if (!question || !article) {
    return;
  }

  selectedAnswer = answer;

  if (!hasAnsweredCurrentQuestion) {
    answeredCount += 1;

    if (answer === question.answer) {
      correctCount += 1;
    }
  }

  hasAnsweredCurrentQuestion = true;

  const isCorrect = answer === question.answer;
  const isLastArticle = currentArticleIndex >= shuffledArticles.length - 1;
  const isLastQuestionInArticle = currentQuestionIndex >= article.questions.length - 1;

  feedback.className = `quiz-feedback reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  explanation.textContent = question.explanation;

  renderOptions(question);
  updateScoreAndProgress();
  updateActionButtons();

  if (isLastArticle && isLastQuestionInArticle) {
    explanation.textContent = `${question.explanation} 這是最後一題，可以查看完成結果。`;
  } else if (isLastQuestionInArticle) {
    explanation.textContent = `${question.explanation} 這是本篇最後一題，可以進入下一篇文章。`;
  }
}

function renderCompletePanel() {
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  practicePanel.hidden = true;
  completePanel.hidden = false;
  totalAnsweredText.textContent = `${answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  updateScoreAndProgress();
}

function goToNextQuestion() {
  const article = getCurrentArticle();

  if (!article || currentQuestionIndex >= article.questions.length - 1) {
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
}

function goToNextArticle() {
  if (currentArticleIndex >= shuffledArticles.length - 1) {
    renderCompletePanel();
    return;
  }

  currentArticleIndex += 1;
  currentQuestionIndex = 0;
  isTranslationVisible = false;
  renderQuestion();
}

function restartPractice() {
  shuffledArticles = shuffleArticles(readingArticles);
  currentArticleIndex = 0;
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  isTranslationVisible = false;
  renderQuestion();
}

translationToggle.addEventListener("click", () => {
  isTranslationVisible = !isTranslationVisible;
  updateTranslation();
});
nextQuestionButton.addEventListener("click", goToNextQuestion);
nextArticleButton.addEventListener("click", goToNextArticle);
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));

restartPractice();
