const vocabularyCard = document.querySelector("#vocabularyCard");
const currentProgress = document.querySelector("#currentProgress");
const previousWordButton = document.querySelector("#previousWord");
const nextWordButton = document.querySelector("#nextWord");
const toggleChineseButton = document.querySelector("#toggleChinese");
const vocabulary = Array.isArray(geptVocabulary) ? geptVocabulary : [];

let currentWordIndex = 0;
let chineseVisible = false;

function createVocabularyDetail(label, value, extraClass = "") {
  const row = document.createElement("div");
  row.className = `vocabulary-detail${extraClass ? ` ${extraClass}` : ""}`;

  const labelElement = document.createElement("span");
  labelElement.className = "vocabulary-detail-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value || "—";

  row.append(labelElement, valueElement);
  return row;
}

function createHiddenChineseHint() {
  const row = document.createElement("div");
  row.className = "vocabulary-detail js-chinese-hint";

  const labelElement = document.createElement("span");
  labelElement.className = "vocabulary-detail-label";
  labelElement.textContent = "中文已隱藏";

  const valueElement = document.createElement("strong");
  valueElement.textContent = "請先自己回想答案。";

  row.append(labelElement, valueElement);
  return row;
}

function updateChineseVisibility() {
  const chineseDetails = vocabularyCard.querySelectorAll(".js-chinese-detail");
  chineseDetails.forEach((detail) => {
    detail.hidden = !chineseVisible;
  });

  const chineseHints = vocabularyCard.querySelectorAll(".js-chinese-hint");
  chineseHints.forEach((hint) => {
    hint.hidden = chineseVisible;
  });

  toggleChineseButton.textContent = chineseVisible ? "隱藏中文" : "顯示中文";
  toggleChineseButton.setAttribute("aria-pressed", String(chineseVisible));
}

function renderCurrentWord() {
  if (!vocabulary.length) {
    vocabularyCard.replaceChildren();
    vocabularyCard.classList.add("status-message");
    vocabularyCard.textContent = "目前沒有可顯示的 GEPT 初級單字資料。";
    currentProgress.textContent = "0 / 0";
    previousWordButton.disabled = true;
    nextWordButton.disabled = true;
    toggleChineseButton.disabled = true;
    return;
  }

  const currentWord = vocabulary[currentWordIndex] || vocabulary[0];
  const cardHeader = document.createElement("div");
  const cardNumber = document.createElement("span");
  cardNumber.className = "card-number";
  cardNumber.textContent = `單字 ${currentWordIndex + 1}`;

  const wordTitle = document.createElement("h2");
  wordTitle.className = "english-word";
  wordTitle.textContent = currentWord.word || "—";

  const partOfSpeech = document.createElement("p");
  partOfSpeech.className = "kana english-part-of-speech";
  partOfSpeech.textContent = currentWord.partOfSpeech || "—";

  cardHeader.append(cardNumber, wordTitle, partOfSpeech);

  const details = document.createElement("div");
  details.className = "vocabulary-details";
  details.append(
    createVocabularyDetail("分類", currentWord.category),
    createVocabularyDetail("中文意思", currentWord.meaning, "js-chinese-detail"),
    createVocabularyDetail("英文例句", currentWord.example),
    createVocabularyDetail("中文翻譯", currentWord.translation, "js-chinese-detail"),
    createHiddenChineseHint(),
  );

  vocabularyCard.classList.remove("status-message");
  vocabularyCard.replaceChildren(cardHeader, details);

  currentProgress.textContent = `${currentWordIndex + 1} / ${vocabulary.length}`;
  previousWordButton.disabled = currentWordIndex === 0;
  nextWordButton.disabled = currentWordIndex === vocabulary.length - 1;
  toggleChineseButton.disabled = false;
  updateChineseVisibility();
}

previousWordButton.addEventListener("click", () => {
  if (currentWordIndex > 0) {
    currentWordIndex -= 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

nextWordButton.addEventListener("click", () => {
  if (currentWordIndex < vocabulary.length - 1) {
    currentWordIndex += 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

toggleChineseButton.addEventListener("click", () => {
  chineseVisible = !chineseVisible;
  updateChineseVisibility();
});

renderCurrentWord();
