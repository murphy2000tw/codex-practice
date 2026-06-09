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

let shuffledArticles = [];
let currentArticleIndex = 0;
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let selectedAnswer = "";
let hasAnsweredCurrentQuestion = false;
let isTranslationVisible = false;
let readingWrongQuestions = [];
let isWrongReviewMode = false;
let shuffledWrongReviewQuestions = [];
let currentWrongReviewIndex = 0;
let wrongReviewCorrectCount = 0;
let wrongReviewAnsweredCount = 0;
let wrongReviewTotalCount = 0;

function shuffleArticles(sourceArticles) {
  const shuffled = [...sourceArticles];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function shuffleWrongQuestions(sourceQuestions) {
  return shuffleArticles(sourceQuestions);
}

function getTotalQuestions() {
  if (isWrongReviewMode) {
    return shuffledWrongReviewQuestions.length;
  }

  return shuffledArticles.reduce((total, article) => total + article.questions.length, 0);
}

function getQuestionNumber() {
  if (isWrongReviewMode) {
    return currentWrongReviewIndex + 1;
  }

  return shuffledArticles
    .slice(0, currentArticleIndex)
    .reduce((total, article) => total + article.questions.length, currentQuestionIndex + 1);
}

function getCurrentWrongReviewItem() {
  return shuffledWrongReviewQuestions[currentWrongReviewIndex];
}

function getCurrentArticle() {
  if (isWrongReviewMode) {
    const wrongItem = getCurrentWrongReviewItem();

    return wrongItem
      ? {
          id: wrongItem.passageId,
          title: wrongItem.passageTitle,
          level: "錯題複習",
          category: wrongItem.category,
          passage: wrongItem.passage,
          translation: wrongItem.translation,
          questions: [
            {
              id: wrongItem.questionId,
              question: wrongItem.question,
              options: wrongItem.options,
              answer: wrongItem.answer,
              explanation: wrongItem.explanation,
              questionType: wrongItem.questionType,
            },
          ],
        }
      : null;
  }

  return shuffledArticles[currentArticleIndex];
}

function getCurrentQuestion() {
  if (isWrongReviewMode) {
    return getCurrentArticle()?.questions[0] || null;
  }

  const article = getCurrentArticle();
  return article ? article.questions[currentQuestionIndex] : null;
}

function updateWrongReviewControls() {
  wrongCountText.textContent = `${readingWrongQuestions.length} 題`;
  startWrongReviewButton.disabled = readingWrongQuestions.length === 0;
  reviewWrongFromResultButton.disabled = readingWrongQuestions.length === 0;
  clearWrongListButton.disabled = readingWrongQuestions.length === 0;
  clearWrongFromResultButton.disabled = readingWrongQuestions.length === 0;
  returnPracticeButton.hidden = !isWrongReviewMode;
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
  const articleQuestionCount = isWrongReviewMode ? getTotalQuestions() : article ? article.questions.length : 0;
  const totalQuestions = getTotalQuestions();
  scoreText.textContent = isWrongReviewMode ? `${wrongReviewCorrectCount} / ${wrongReviewAnsweredCount}` : `${correctCount} / ${answeredCount}`;
  progressText.textContent = `${Math.min(getQuestionNumber(), totalQuestions)} / ${totalQuestions}`;
  articleProgressText.textContent = article
    ? isWrongReviewMode
      ? `錯題複習：${currentWrongReviewIndex + 1} / ${articleQuestionCount}`
      : `第 ${currentArticleIndex + 1} 篇：${currentQuestionIndex + 1} / ${articleQuestionCount}`
    : "—";
  updateWrongReviewControls();
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
  if (isWrongReviewMode) {
    const isLastWrongReviewQuestion = currentWrongReviewIndex >= shuffledWrongReviewQuestions.length - 1;

    nextQuestionButton.disabled = !hasAnsweredCurrentQuestion;
    nextQuestionButton.textContent = isLastWrongReviewQuestion ? "查看結果" : "下一題";
    nextArticleButton.hidden = true;
    nextArticleButton.disabled = true;
    return;
  }

  const article = getCurrentArticle();
  const isLastArticle = currentArticleIndex >= shuffledArticles.length - 1;
  const isLastQuestionInArticle = article ? currentQuestionIndex >= article.questions.length - 1 : true;

  nextQuestionButton.hidden = false;
  nextQuestionButton.textContent = "下一題";
  nextQuestionButton.disabled = !hasAnsweredCurrentQuestion || isLastQuestionInArticle;
  nextArticleButton.hidden = false;
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

function createWrongQuestionRecord(article, question, answer) {
  return {
    passageId: article.id,
    passageTitle: article.title,
    passage: article.passage,
    translation: article.translation,
    questionId: question.id,
    question: question.question,
    options: [...question.options],
    answer: question.answer,
    selectedAnswer: answer,
    explanation: question.explanation,
    questionType: question.questionType,
    category: article.category,
  };
}

function addReadingWrongQuestion(article, question, answer) {
  if (readingWrongQuestions.some((wrongQuestion) => wrongQuestion.questionId === question.id)) {
    return;
  }

  readingWrongQuestions.push(createWrongQuestionRecord(article, question, answer));
}

function removeReadingWrongQuestion(questionId) {
  readingWrongQuestions = readingWrongQuestions.filter((wrongQuestion) => wrongQuestion.questionId !== questionId);
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();
  const article = getCurrentArticle();

  if (!question || !article) {
    return;
  }

  selectedAnswer = answer;

  if (!hasAnsweredCurrentQuestion) {
    const isCorrect = answer === question.answer;

    if (isWrongReviewMode) {
      wrongReviewAnsweredCount += 1;

      if (isCorrect) {
        wrongReviewCorrectCount += 1;
        removeReadingWrongQuestion(question.id);
      }
    } else {
      answeredCount += 1;

      if (isCorrect) {
        correctCount += 1;
      } else {
        addReadingWrongQuestion(article, question, answer);
      }
    }
  }

  hasAnsweredCurrentQuestion = true;

  const isCorrect = answer === question.answer;
  const isLastArticle = currentArticleIndex >= shuffledArticles.length - 1;
  const isLastQuestionInArticle = isWrongReviewMode ? currentWrongReviewIndex >= shuffledWrongReviewQuestions.length - 1 : currentQuestionIndex >= article.questions.length - 1;

  feedback.className = `quiz-feedback reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  explanation.textContent = question.explanation;
  wrongMessage.textContent = "";

  renderOptions(question);
  updateScoreAndProgress();
  updateActionButtons();

  if (isWrongReviewMode && isLastQuestionInArticle) {
    explanation.textContent = `${question.explanation} 這是最後一道錯題，可以查看複習結果。`;
  } else if (isWrongReviewMode) {
    explanation.textContent = `${question.explanation} 可以繼續下一道錯題。`;
  } else if (isLastArticle && isLastQuestionInArticle) {
    explanation.textContent = `${question.explanation} 這是最後一題，可以查看完成結果。`;
  } else if (isLastQuestionInArticle) {
    explanation.textContent = `${question.explanation} 這是本篇最後一題，可以進入下一篇文章。`;
  }
}

function renderNormalCompletePanel() {
  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  resultTitle.textContent = "閱讀測驗完成！";
  totalAnsweredLabel.textContent = "總作答";
  totalCorrectLabel.textContent = "答對";
  totalWrongLabel.textContent = "答錯";
  accuracyLabel.textContent = "正確率";
  resultWrongLabel.textContent = "本次錯題";
  resultWrongSummary.hidden = false;
  totalAnsweredText.textContent = `${answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  resultWrongCountText.textContent = `${readingWrongQuestions.length} 題`;
  resultMessage.textContent = readingWrongQuestions.length > 0 ? `本次錯題：${readingWrongQuestions.length} 題，可以進入錯題複習。` : "太好了，本輪沒有錯題！";
  reviewWrongFromResultButton.hidden = false;
  clearWrongFromResultButton.hidden = false;
}

function renderWrongReviewCompletePanel() {
  const wrongReviewWrongCount = wrongReviewAnsweredCount - wrongReviewCorrectCount;

  resultTitle.textContent = "閱讀錯題複習完成！";
  totalAnsweredLabel.textContent = "本次複習題數";
  totalCorrectLabel.textContent = "答對題數";
  totalWrongLabel.textContent = "答錯題數";
  accuracyLabel.textContent = "剩餘錯題數";
  resultWrongSummary.hidden = true;
  totalAnsweredText.textContent = `${wrongReviewTotalCount} 題`;
  totalCorrectText.textContent = `${wrongReviewCorrectCount} 題`;
  totalWrongText.textContent = `${wrongReviewWrongCount} 題`;
  accuracyText.textContent = `${readingWrongQuestions.length} 題`;
  resultMessage.textContent = readingWrongQuestions.length === 0 ? "太好了，本次閱讀錯題已全部完成！" : `仍有 ${readingWrongQuestions.length} 題可繼續複習。`;
  reviewWrongFromResultButton.hidden = readingWrongQuestions.length === 0;
  clearWrongFromResultButton.hidden = readingWrongQuestions.length === 0;
}

function renderCompletePanel() {
  practicePanel.hidden = true;
  completePanel.hidden = false;

  if (isWrongReviewMode) {
    renderWrongReviewCompletePanel();
  } else {
    renderNormalCompletePanel();
  }

  updateScoreAndProgress();
}

function goToNextQuestion() {
  if (isWrongReviewMode) {
    if (currentWrongReviewIndex >= shuffledWrongReviewQuestions.length - 1) {
      renderCompletePanel();
      return;
    }

    currentWrongReviewIndex += 1;
    isTranslationVisible = false;
    renderQuestion();
    return;
  }

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

function startWrongReview() {
  if (readingWrongQuestions.length === 0) {
    wrongMessage.textContent = "目前沒有錯題";
    updateWrongReviewControls();
    return;
  }

  isWrongReviewMode = true;
  shuffledWrongReviewQuestions = shuffleWrongQuestions(readingWrongQuestions);
  currentWrongReviewIndex = 0;
  wrongReviewCorrectCount = 0;
  wrongReviewAnsweredCount = 0;
  wrongReviewTotalCount = shuffledWrongReviewQuestions.length;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  isTranslationVisible = false;
  wrongMessage.textContent = "閱讀錯題複習模式";
  renderQuestion();
}

function returnToPractice() {
  isWrongReviewMode = false;
  shuffledWrongReviewQuestions = [];
  currentWrongReviewIndex = 0;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  isTranslationVisible = false;
  wrongMessage.textContent = "已返回一般閱讀測驗";
  renderQuestion();
}

function clearWrongQuestions() {
  readingWrongQuestions = [];
  updateWrongReviewControls();
  wrongMessage.textContent = "已清除本次閱讀錯題";

  if (isWrongReviewMode) {
    isWrongReviewMode = false;
    shuffledWrongReviewQuestions = [];
    currentWrongReviewIndex = 0;
    renderQuestion();
    return;
  }

  if (!completePanel.hidden) {
    renderCompletePanel();
    return;
  }

  updateScoreAndProgress();
}

function restartPractice() {
  isWrongReviewMode = false;
  shuffledWrongReviewQuestions = [];
  currentWrongReviewIndex = 0;
  shuffledArticles = shuffleArticles(readingArticles);
  currentArticleIndex = 0;
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  selectedAnswer = "";
  hasAnsweredCurrentQuestion = false;
  isTranslationVisible = false;
  wrongMessage.textContent = "";
  renderQuestion();
}

translationToggle.addEventListener("click", () => {
  isTranslationVisible = !isTranslationVisible;
  updateTranslation();
});
startWrongReviewButton.addEventListener("click", startWrongReview);
reviewWrongFromResultButton.addEventListener("click", startWrongReview);
clearWrongListButton.addEventListener("click", clearWrongQuestions);
clearWrongFromResultButton.addEventListener("click", clearWrongQuestions);
returnPracticeButton.addEventListener("click", returnToPractice);
nextQuestionButton.addEventListener("click", goToNextQuestion);
nextArticleButton.addEventListener("click", goToNextArticle);
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));

restartPractice();
