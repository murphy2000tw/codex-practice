const answerLabelMap = {
  a: "a",
  an: "an",
  the: "the",
  不填: "不填",
};

const questions = Array.isArray(window.articleQuestions) ? window.articleQuestions : [];

const progressText = document.querySelector("#articleProgress");
const scoreText = document.querySelector("#articleScore");
const questionCategory = document.querySelector("#articleQuestionCategory");
const questionSentence = document.querySelector("#articleQuestionSentence");
const optionList = document.querySelector("#articleOptions");
const feedback = document.querySelector("#articleFeedback");
const explanation = document.querySelector("#articleExplanation");
const nextButton = document.querySelector("#nextArticleQuestion");
const restartButtons = document.querySelectorAll(".js-restart-article-practice");
const practicePanel = document.querySelector("#articlePracticePanel");
const completePanel = document.querySelector("#articleCompletePanel");
const totalAnsweredText = document.querySelector("#articleTotalAnswered");
const totalCorrectText = document.querySelector("#articleTotalCorrect");
const totalWrongText = document.querySelector("#articleTotalWrong");
const accuracyText = document.querySelector("#articleAccuracy");

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answeredCount = 0;
let hasAnsweredCurrentQuestion = false;
let selectedAnswer = "";

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

function updateScoreAndProgress() {
  scoreText.textContent = `${correctCount} / ${answeredCount}`;
  progressText.textContent = `${Math.min(currentQuestionIndex + 1, shuffledQuestions.length)} / ${shuffledQuestions.length}`;
}

function clearFeedback() {
  feedback.className = "quiz-feedback article-feedback";
  feedback.textContent = "";
  explanation.textContent = "";
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

  if (!hasAnsweredCurrentQuestion) {
    answeredCount += 1;

    if (answer === question.answer) {
      correctCount += 1;
    }
  }

  hasAnsweredCurrentQuestion = true;

  const isCorrect = answer === question.answer;
  feedback.className = `quiz-feedback article-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  feedback.textContent = isCorrect ? "答對了！" : `答錯了，正確答案是：${question.answer}`;
  explanation.textContent = question.explanation;
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
  totalAnsweredText.textContent = `${answeredCount} 題`;
  totalCorrectText.textContent = `${correctCount} 題`;
  totalWrongText.textContent = `${wrongCount} 題`;
  accuracyText.textContent = `${accuracy}%`;
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
  shuffledQuestions = shuffleQuestions(questions);
  currentQuestionIndex = 0;
  correctCount = 0;
  answeredCount = 0;
  hasAnsweredCurrentQuestion = false;
  selectedAnswer = "";
  renderQuestion();
}

nextButton.addEventListener("click", goToNextQuestion);
restartButtons.forEach((button) => button.addEventListener("click", restartPractice));

restartPractice();
