const READING_QUIZ_CATEGORY = "reading";
const readingPage = document.querySelector(".reading-practice-section");
const readingPageMode = readingPage?.dataset.readingPage === "practice" ? "practice" : "quiz";
const READING_QUIZ_TITLE = readingPageMode === "practice" ? "閱讀練習" : "閱讀測驗";
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
let hasAnsweredCurrentQuestion = false;
let quizResults = [];
let quizPhase = "idle";
let quizStartedAt = null;

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
const passageCard = document.querySelector(".reading-passage-card");
const questionCard = document.querySelector(".reading-question-card");
const questionPrompt = document.querySelector(".reading-question-prompt");
const feedbackArea = document.querySelector(".article-feedback-area");
const readingActions = document.querySelector(".reading-actions");
const quizStats = document.querySelector(".quiz-stats");
const readingModePanel = document.querySelector(".reading-mode-panel");
const readingReviewControls = document.querySelector(".reading-review-controls");
const practiceTestModeButton = document.querySelector('.reading-mode-button[data-reading-mode="test"]');
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

function getCurrentQuestion() {
  return quizQuestions[currentQuestionIndex];
}

function clearFeedback() {
  if (feedback) {
    feedback.className = "quiz-feedback reading-feedback";
    feedback.textContent = "";
  }
  if (explanation) explanation.textContent = "";
}

function updateScoreAndProgress() {
  if (scoreText) scoreText.textContent = `${correctCount} / ${quizResults.length}`;
  if (progressText) progressText.textContent = quizQuestions.length ? `${currentQuestionIndex + 1} / ${quizQuestions.length}` : "0 / 0";
  if (articleProgressText) articleProgressText.textContent = `${READING_QUIZ_TITLE}｜第 ${quizQuestions.length ? currentQuestionIndex + 1 : 0} / ${quizQuestions.length} 題`;
  if (wrongCountText) wrongCountText.textContent = `${quizResults.filter((result) => result.result !== "correct").length} 題`;
}

function goToNextQuestion() {
  if (quizPhase !== "running" || !hasAnsweredCurrentQuestion) {
    return;
  }
  if (currentQuestionIndex >= quizQuestions.length - 1) {
    renderCompletePanel();
    return;
  }
  currentQuestionIndex += 1;
  renderQuestion();
}

function goToNextArticle() {
  if (quizPhase !== "running" || !hasAnsweredCurrentQuestion) {
    return;
  }
  const currentPassageId = getCurrentQuestion()?.passageId;
  const nextArticleIndex = quizQuestions.findIndex((question, index) => index > currentQuestionIndex && question.passageId !== currentPassageId);
  if (nextArticleIndex === -1) {
    renderCompletePanel();
    return;
  }
  currentQuestionIndex = nextArticleIndex;
  renderQuestion();
}

function recordResult(question, userAnswer, result) {
  if (quizPhase !== "running" || !question || hasAnsweredCurrentQuestion) {
    return;
  }
  hasAnsweredCurrentQuestion = true;
  const isCorrect = result === "correct";

  recordQuestionAnswer(question.questionId, READING_QUIZ_CATEGORY, isCorrect);
  if (isCorrect) {
    correctCount += 1;
  }

  quizResults.push({
    order: currentQuestionIndex + 1,
    question: question.question,
    userAnswer,
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
  optionList?.replaceChildren(...buttons);
}


function scrollToPreparationPanel() {
  practicePanel?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setQuizViewState(state) {
  const isReady = state === "ready";
  if (readingPageMode === "practice") {
    if (readingModePanel) readingModePanel.hidden = true;
    if (readingReviewControls) readingReviewControls.hidden = true;
    if (wrongMessage) wrongMessage.hidden = true;
  }
  if (readingPageMode === "quiz") {
    if (passageCard) passageCard.hidden = isReady;
    if (questionCard) questionCard.hidden = isReady;
    if (questionPrompt) questionPrompt.hidden = isReady;
    if (feedbackArea) feedbackArea.hidden = isReady;
    if (readingActions) readingActions.hidden = isReady;
    if (quizStats) quizStats.hidden = isReady;
    if (readingModePanel) readingModePanel.hidden = true;
    if (readingReviewControls) readingReviewControls.hidden = true;
    if (wrongMessage) wrongMessage.hidden = true;
  }
}

function renderPreparationPanel() {
  quizPhase = "ready";
  setQuizViewState("ready");
  if (practicePanel) practicePanel.hidden = false;
  if (completePanel) completePanel.hidden = true;
  const total = quizQuestions.length;
  if (articleTitle) articleTitle.textContent = `${READING_QUIZ_TITLE}準備`;
  if (articleMeta) articleMeta.textContent = `${READING_QUIZ_TITLE}｜測驗準備中`;
  if (passageText) passageText.textContent = "";
  if (translationText) {
    translationText.textContent = "";
    translationText.hidden = true;
  }
  if (translationToggle) translationToggle.disabled = true;
  if (questionTypeText) questionTypeText.textContent = `本次測驗：${total} 題`;
  if (questionText) questionText.textContent = "";
  optionList?.replaceChildren();
  clearFeedback();
  if (scoreText) scoreText.textContent = "0 / 0";
  if (progressText) progressText.textContent = `0 / ${total}`;
  if (articleProgressText) articleProgressText.textContent = `${READING_QUIZ_TITLE}｜測驗準備中`;
  if (wrongCountText) wrongCountText.textContent = "0 題";
  if (nextQuestionButton) nextQuestionButton.disabled = true;
  if (nextArticleButton) nextArticleButton.disabled = true;

  practicePanel?.querySelector(".quiz-ready-card")?.remove();
  const readyCard = document.createElement("article");
  readyCard.className = "quiz-card quiz-ready-card";
  readyCard.innerHTML = `
    <span class="card-number">測驗準備</span>
    <h3 class="quiz-title">${READING_QUIZ_TITLE}準備</h3>
    <div class="quiz-ready-details">
      <p>測驗類型：${READING_QUIZ_TITLE}</p>
      <p>本次測驗：${total} 題</p>
      <p>${total ? "請慢慢閱讀文章，完成後再作答。" : "目前沒有可用題目。"}</p>
    </div>
  `;
  if (total) {
    const startButton = document.createElement("button");
    startButton.className = "answer-button quiz-start-button";
    startButton.type = "button";
    startButton.textContent = readingPageMode === "practice" ? "開始練習" : "開始測驗";
    startButton.addEventListener("click", () => {
      if (quizPhase === "running") return;
      quizPhase = "running";
      quizStartedAt = new Date().toISOString();
      renderQuestion();
    });
    readyCard.append(startButton);
  }
  practicePanel?.prepend(readyCard);
}

function renderQuestion() {
  if (quizPhase !== "running") {
    renderPreparationPanel();
    return;
  }
  practicePanel?.querySelector(".quiz-ready-card")?.remove();
  const question = getCurrentQuestion();
  if (!question) {
    if (practicePanel) practicePanel.hidden = false;
    if (completePanel) completePanel.hidden = true;
    if (articleTitle) articleTitle.textContent = `${READING_QUIZ_TITLE}：目前沒有題目`;
    if (articleMeta) articleMeta.textContent = "";
    if (passageText) passageText.textContent = "這個分類目前沒有可測驗的題目。";
    if (questionText) questionText.textContent = "";
    optionList?.replaceChildren();
    clearFeedback();
    updateScoreAndProgress();
    return;
  }

  setQuizViewState("running");
  if (practicePanel) practicePanel.hidden = false;
  if (completePanel) completePanel.hidden = true;
  if (articleTitle) articleTitle.textContent = question.passageTitle || READING_QUIZ_TITLE;
  if (articleMeta) articleMeta.textContent = `分類：${question.category || "閱讀"}｜第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`;
  if (passageText) passageText.textContent = question.passage || "";
  if (translationText) {
    translationText.textContent = "";
    translationText.hidden = true;
  }
  if (translationToggle) translationToggle.disabled = true;
  if (questionTypeText) questionTypeText.textContent = question.questionType ? `題型：${question.questionType}` : "題型：—";
  if (questionText) questionText.textContent = question.question;
  hasAnsweredCurrentQuestion = false;
  clearFeedback();
  renderOptions(question);
  updateScoreAndProgress();
  if (nextQuestionButton) nextQuestionButton.disabled = true;
  if (nextArticleButton) nextArticleButton.disabled = true;
  recordQuestionSeen(question.questionId, READING_QUIZ_CATEGORY);
}

function handleAnswer(answer) {
  const question = getCurrentQuestion();
  if (quizPhase !== "running" || !question || hasAnsweredCurrentQuestion) {
    return;
  }
  const isCorrect = answer === question.answer;
  recordResult(question, answer, isCorrect ? "correct" : "wrong");
  optionList?.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("is-correct", button.dataset.answer === question.answer);
    button.classList.toggle("is-wrong", button.dataset.answer === answer && !isCorrect);
  });
  if (feedback) {
    feedback.className = `quiz-feedback reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
    feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  }
  if (explanation) explanation.textContent = readingPageMode === "practice" ? (question.explanation || "") : "";
  if (nextQuestionButton) nextQuestionButton.disabled = false;
  if (nextArticleButton) nextArticleButton.disabled = false;
}

function createResultList() {
  const list = document.createElement("ol");
  list.className = "quiz-result-list";
  quizResults.forEach((result) => {
    const item = document.createElement("li");
    item.textContent = `第 ${result.order} 題｜${result.question}｜你的答案：${result.userAnswer}｜正確答案：${result.correctAnswer}｜結果：${result.result === "correct" ? "答對" : "答錯"}`;
    list.append(item);
  });
  return list;
}

function renderCompletePanel() {
  quizPhase = "complete";
  const total = quizResults.length;
  const wrongCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const endedAt = new Date().toISOString();
  recordEnglishLearningSession({
    module: "reading",
    mode: readingPageMode === "practice" ? "practice" : "quiz",
    totalQuestions: total,
    correctCount,
    wrongCount,
    durationSeconds: quizStartedAt ? Math.max(0, Math.round((new Date(endedAt) - new Date(quizStartedAt)) / 1000)) : 0,
    startedAt: quizStartedAt || endedAt,
    endedAt,
  });
  setQuizViewState("complete");
  if (practicePanel) practicePanel.hidden = true;
  if (completePanel) completePanel.hidden = false;
  if (resultTitle) resultTitle.textContent = `${READING_QUIZ_TITLE}完成！`;
  if (resultModeText) {
    resultModeText.textContent = `測驗類型：${READING_QUIZ_TITLE}`;
    resultModeText.hidden = false;
  }
  totalAnsweredLabel.textContent = "總題數";
  totalCorrectLabel.textContent = "答對";
  totalWrongLabel.textContent = "答錯";
  accuracyLabel.textContent = "正確率";
  resultWrongLabel.textContent = "本次錯題";
  resultWrongSummary.hidden = false;
  totalAnsweredText.textContent = `${total} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
  resultWrongCountText.textContent = `${wrongCount} 題`;
  resultMessage.textContent = `本次共 ${total} 題，答對 ${correctCount} 題，答錯 ${wrongCount} 題。`;
  if (reviewWrongFromResultButton) reviewWrongFromResultButton.hidden = true;
  if (clearWrongFromResultButton) clearWrongFromResultButton.hidden = true;
  completePanel?.querySelector(".quiz-result-list")?.remove();
  completePanel?.querySelector(".article-result-card")?.append(createResultList());
}

function restartPractice(shouldScroll = false) {
  quizPhase = "ready";
  quizQuestions = selectEnglishQuizQuestions(flattenReadingQuestions(readingArticles), READING_QUIZ_CATEGORY);
  currentQuestionIndex = 0;
  correctCount = 0;
  hasAnsweredCurrentQuestion = false;
  quizResults = [];
  quizStartedAt = null;
  if (modeDescription) modeDescription.textContent = readingPageMode === "practice" ? "閱讀練習：作答後可以查看解答說明。" : "閱讀測驗：請慢慢閱讀文章，完成後再作答。";
  modeButtons.forEach((button) => { button.disabled = true; });
  if (startWrongReviewButton) startWrongReviewButton.disabled = true;
  if (clearWrongListButton) clearWrongListButton.disabled = true;
  if (returnPracticeButton) returnPracticeButton.hidden = true;
  if (wrongMessage) wrongMessage.textContent = "";
  if (readingPageMode === "practice") {
    quizPhase = "running";
    quizStartedAt = new Date().toISOString();
    renderQuestion();
  } else {
    renderPreparationPanel();
  }
  if (shouldScroll) {
    scrollToPreparationPanel();
  }
}

translationToggle?.addEventListener("click", () => {});
nextQuestionButton?.addEventListener("click", goToNextQuestion);
nextArticleButton?.addEventListener("click", goToNextArticle);
restartButtons.forEach((button) => button.addEventListener("click", () => restartPractice(true)));
restartPractice();
