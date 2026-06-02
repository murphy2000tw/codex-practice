const CARD_COUNT = 10;
const VOCABULARY_URL = "vocabulary.json";
const CATEGORY_FILTERS = [
  { id: "all", label: "全部", matches: null },
  { id: "noun", label: "名詞", matches: ["名詞", "代名詞", "疑問詞", "連體詞"] },
  { id: "verb", label: "動詞", matches: ["動詞"] },
  { id: "i-adjective", label: "い形容詞", matches: ["い形容詞"] },
  { id: "na-adjective", label: "な形容詞", matches: ["な形容詞"] },
  { id: "adverb", label: "副詞", matches: ["副詞"] },
  { id: "number-counter", label: "數字／量詞", matches: ["數詞", "數量詞"] },
  { id: "expression", label: "表達句型", matches: ["感嘆詞"] },
];

const cardsContainer = document.querySelector("#vocabularyCards");
const categoryFilters = document.querySelector("#categoryFilters");
const categoryCount = document.querySelector("#categoryCount");
const toggleButton = document.querySelector("#toggleAnswers");
const shuffleButton = document.querySelector("#shuffleWords");
const wordSetStatus = document.querySelector("#wordSetStatus");

let vocabulary = [];
let filteredVocabulary = [];
let wordDeck = [];
let currentWords = [];
let previousWordIds = new Set();
let answersVisible = false;
let currentGroupNumber = 0;
let reshuffleNotice = "";
let activeCategoryId = "all";

function getActiveCategory() {
  return CATEGORY_FILTERS.find((category) => category.id === activeCategoryId) ?? CATEGORY_FILTERS[0];
}

function getWordsForCategory(category) {
  if (!category.matches) {
    return vocabulary;
  }

  return vocabulary.filter((word) => category.matches.includes(word.partOfSpeech));
}

function shuffleWords(words) {
  const shuffledWords = [...words];

  for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledWords[index], shuffledWords[randomIndex]] = [shuffledWords[randomIndex], shuffledWords[index]];
  }

  return shuffledWords;
}

function getTotalGroups() {
  return Math.max(1, Math.ceil(filteredVocabulary.length / CARD_COUNT));
}

function buildFreshDeck() {
  const shuffledVocabulary = shuffleWords(filteredVocabulary);

  if (previousWordIds.size === 0) {
    return shuffledVocabulary;
  }

  const wordsNotInPreviousSet = shuffledVocabulary.filter((word) => !previousWordIds.has(word.id));
  const wordsInPreviousSet = shuffledVocabulary.filter((word) => previousWordIds.has(word.id));

  return [...wordsNotInPreviousSet, ...wordsInPreviousSet];
}

function resetDeck() {
  wordDeck = buildFreshDeck();
  currentGroupNumber = 0;
  reshuffleNotice = "";
}

function refreshDeckIfNeeded() {
  if (wordDeck.length > 0) {
    reshuffleNotice = "";
    return;
  }

  wordDeck = buildFreshDeck();
  currentGroupNumber = 0;
  reshuffleNotice = "已重新洗牌。";
}

function getNextWordSet() {
  refreshDeckIfNeeded();

  const cardsToShow = Math.min(CARD_COUNT, wordDeck.length);
  const nextWords = wordDeck.slice(0, cardsToShow);
  wordDeck = wordDeck.slice(cardsToShow);
  currentGroupNumber += 1;

  return nextWords;
}

function createDetailRow(label, value) {
  return `
    <div class="answer-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function createCard(word, index) {
  const card = document.createElement("article");
  card.className = "word-card";

  card.innerHTML = `
    <div>
      <span class="card-number">單字 ${index + 1}</span>
      <h2 class="japanese-word">${word.word}</h2>
      <p class="kana">${word.kana}</p>
    </div>
    <div class="answer" hidden>
      ${createDetailRow("中文意思", word.meaning)}
      ${createDetailRow("詞性", word.partOfSpeech)}
      ${createDetailRow("例句", word.example)}
      ${createDetailRow("例句假名", word.exampleKana)}
      ${createDetailRow("中文翻譯", word.exampleMeaning)}
    </div>
  `;

  return card;
}

function renderCards(words) {
  const cards = words.map((word, index) => createCard(word, index));
  cardsContainer.replaceChildren(...cards);
  updateAnswersVisibility();
}

function renderStatus(message) {
  const status = document.createElement("p");
  status.className = "status-message";
  status.textContent = message;
  cardsContainer.replaceChildren(status);
}

function updateCategoryCount() {
  const activeCategory = getActiveCategory();
  categoryCount.textContent = `目前分類「${activeCategory.label}」共有 ${filteredVocabulary.length} 個單字`;
}

function updateCategoryButtons() {
  categoryFilters.querySelectorAll(".category-button").forEach((button) => {
    const isActive = button.dataset.categoryId === activeCategoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateWordSetStatus() {
  const totalGroups = getTotalGroups();
  const groupText = `目前顯示第 ${currentGroupNumber} 組 / 共 ${totalGroups} 組`;
  wordSetStatus.textContent = reshuffleNotice ? `${reshuffleNotice} ${groupText}` : groupText;
}

function updateAnswersVisibility() {
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.hidden = !answersVisible;
  });

  toggleButton.textContent = answersVisible ? "隱藏答案" : "顯示答案";
  toggleButton.setAttribute("aria-pressed", String(answersVisible));
}

function showNewWordSet() {
  answersVisible = false;
  currentWords = getNextWordSet();
  previousWordIds = new Set(currentWords.map((word) => word.id));
  renderCards(currentWords);
  updateWordSetStatus();
}

function applyCategory(categoryId) {
  activeCategoryId = categoryId;
  filteredVocabulary = getWordsForCategory(getActiveCategory());
  previousWordIds = new Set();
  resetDeck();
  updateCategoryButtons();
  updateCategoryCount();

  if (filteredVocabulary.length === 0) {
    currentWords = [];
    currentGroupNumber = 0;
    renderStatus("這個分類目前沒有單字。");
    updateWordSetStatus();
    return;
  }

  showNewWordSet();
}

function renderCategoryFilters() {
  const buttons = CATEGORY_FILTERS.map((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.dataset.categoryId = category.id;
    button.textContent = category.label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => applyCategory(category.id));
    return button;
  });

  categoryFilters.replaceChildren(...buttons);
  updateCategoryButtons();
}

async function loadVocabulary() {
  try {
    const response = await fetch(VOCABULARY_URL);

    if (!response.ok) {
      throw new Error(`無法讀取單字資料：${response.status}`);
    }

    vocabulary = await response.json();
    renderCategoryFilters();
    applyCategory(activeCategoryId);
  } catch (error) {
    console.error(error);
    renderStatus("目前無法載入單字資料，請確認 vocabulary.json 是否存在且格式正確。");
    wordSetStatus.textContent = "單字資料載入失敗。";
    categoryCount.textContent = "分類資料載入失敗。";
    toggleButton.disabled = true;
    shuffleButton.disabled = true;
  }
}

toggleButton.addEventListener("click", () => {
  answersVisible = !answersVisible;
  updateAnswersVisibility();
});

shuffleButton.addEventListener("click", showNewWordSet);

loadVocabulary();
