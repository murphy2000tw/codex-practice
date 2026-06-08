const vocabularyCard = document.querySelector("#vocabularyCard");
const currentProgress = document.querySelector("#currentProgress");
const previousWordButton = document.querySelector("#previousWord");
const nextWordButton = document.querySelector("#nextWord");
const toggleChineseButton = document.querySelector("#toggleChinese");
const reshuffleVocabularyButton = document.querySelector("#reshuffleVocabulary");
const categoryFilters = document.querySelector("#geptCategoryFilters");
const vocabularySearchInput = document.querySelector("#geptVocabularySearch");
const clearSearchButton = document.querySelector("#clearGeptSearch");
const randomStatus = document.querySelector("#geptRandomStatus");
const vocabulary = Array.isArray(geptVocabulary) ? geptVocabulary : [];
const allCategoriesLabel = "全部";

let currentWordIndex = 0;
let chineseVisible = false;
let selectedCategory = allCategoriesLabel;
let searchQuery = "";
let categoryVocabulary = [];
let filteredVocabulary = [];

function getAvailableCategories() {
  return [...new Set(vocabulary.map((word) => word.category).filter(Boolean))];
}

function getFilteredVocabulary() {
  if (selectedCategory === allCategoriesLabel) {
    return [...vocabulary];
  }

  return vocabulary.filter((word) => word.category === selectedCategory);
}

function normalizeSearchText(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function wordMatchesSearch(word, query) {
  if (!query) {
    return true;
  }

  const searchableFields = [
    word.word,
    word.meaning,
    word.category,
    word.example,
    word.translation,
  ];

  return searchableFields.some((field) => normalizeSearchText(field).includes(query));
}

function shuffleVocabulary(words) {
  const shuffledWords = [...words];

  for (let i = shuffledWords.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[randomIndex]] = [shuffledWords[randomIndex], shuffledWords[i]];
  }

  return shuffledWords;
}

function updateSearchControls() {
  clearSearchButton.disabled = !searchQuery;
}

function getCurrentModeText() {
  const modeParts = [];

  if (selectedCategory !== allCategoriesLabel) {
    modeParts.push(`分類：${selectedCategory}`);
  }

  if (searchQuery) {
    modeParts.push(`搜尋：${vocabularySearchInput.value.trim()}`);
  }

  return modeParts.length ? modeParts.join("，") : "全部分類";
}

function updateRandomStatus() {
  if (!randomStatus) {
    return;
  }

  const modeText = getCurrentModeText();
  const resultText = filteredVocabulary.length
    ? `目前以隨機順序顯示 ${filteredVocabulary.length} 個單字。`
    : "目前沒有符合條件的單字。";
  randomStatus.textContent = `${resultText}（${modeText}）`;
}

function resetCurrentPosition() {
  currentWordIndex = 0;
  chineseVisible = false;
}

function applySearchToCategoryVocabulary() {
  filteredVocabulary = categoryVocabulary.filter((word) => wordMatchesSearch(word, searchQuery));
  resetCurrentPosition();
}

function resetCurrentVocabulary() {
  categoryVocabulary = shuffleVocabulary(getFilteredVocabulary());
  applySearchToCategoryVocabulary();
}

function reshuffleCurrentVocabulary() {
  if (searchQuery) {
    filteredVocabulary = shuffleVocabulary(categoryVocabulary.filter((word) => wordMatchesSearch(word, searchQuery)));
    resetCurrentPosition();
    return;
  }

  resetCurrentVocabulary();
}

function createCategoryFilterButton(category) {
  const button = document.createElement("button");
  const categoryCount = category === allCategoriesLabel
    ? vocabulary.length
    : vocabulary.filter((word) => word.category === category).length;
  button.className = "filter-button";
  button.type = "button";
  button.textContent = `${category} (${categoryCount})`;
  button.dataset.category = category;
  button.setAttribute("aria-pressed", String(category === selectedCategory));

  if (category === selectedCategory) {
    button.classList.add("is-active");
  }

  button.addEventListener("click", () => {
    if (selectedCategory === category) {
      return;
    }

    selectedCategory = category;
    resetCurrentVocabulary();
    updateCategoryFilterButtons();
    renderCurrentWord();
  });

  return button;
}

function updateCategoryFilterButtons() {
  const filterButtons = categoryFilters.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategoryFilters() {
  const availableCategories = getAvailableCategories();
  const filterButtons = [allCategoriesLabel, ...availableCategories].map(createCategoryFilterButton);
  categoryFilters.replaceChildren(...filterButtons);
}

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

function renderEmptyVocabularyMessage(message, progressText = "0 / 0") {
  vocabularyCard.replaceChildren();
  vocabularyCard.classList.add("status-message");
  vocabularyCard.textContent = message;
  currentProgress.textContent = progressText;
  updateRandomStatus();
  previousWordButton.disabled = true;
  nextWordButton.disabled = true;
  toggleChineseButton.disabled = true;
  reshuffleVocabularyButton.disabled = true;
  updateSearchControls();
}

function renderCurrentWord() {
  if (!vocabulary.length) {
    renderEmptyVocabularyMessage("目前沒有可顯示的 GEPT 初級單字資料。");
    return;
  }

  if (!categoryVocabulary.length && !searchQuery) {
    renderEmptyVocabularyMessage("此分類目前沒有單字。");
    return;
  }

  if (!filteredVocabulary.length) {
    const emptyMessage = searchQuery
      ? "找不到符合條件的單字，請換個關鍵字試試。"
      : "此分類目前沒有單字。";
    renderEmptyVocabularyMessage(emptyMessage);
    return;
  }

  if (currentWordIndex >= filteredVocabulary.length) {
    currentWordIndex = filteredVocabulary.length - 1;
  }

  const currentWord = filteredVocabulary[currentWordIndex];
  const cardHeader = document.createElement("div");
  const cardNumber = document.createElement("span");
  cardNumber.className = "card-number";
  cardNumber.textContent = `隨機顯示 ${currentWordIndex + 1}`;

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

  currentProgress.textContent = `隨機顯示：${currentWordIndex + 1} / ${filteredVocabulary.length}`;
  previousWordButton.disabled = currentWordIndex === 0;
  nextWordButton.disabled = currentWordIndex === filteredVocabulary.length - 1;
  toggleChineseButton.disabled = false;
  reshuffleVocabularyButton.disabled = false;
  updateSearchControls();
  updateRandomStatus();
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
  if (currentWordIndex < filteredVocabulary.length - 1) {
    currentWordIndex += 1;
    chineseVisible = false;
    renderCurrentWord();
  }
});

toggleChineseButton.addEventListener("click", () => {
  if (toggleChineseButton.disabled) {
    return;
  }

  chineseVisible = !chineseVisible;
  updateChineseVisibility();
});

reshuffleVocabularyButton.addEventListener("click", () => {
  reshuffleCurrentVocabulary();
  renderCurrentWord();
});

vocabularySearchInput.addEventListener("input", () => {
  searchQuery = normalizeSearchText(vocabularySearchInput.value);
  applySearchToCategoryVocabulary();
  renderCurrentWord();
});

clearSearchButton.addEventListener("click", () => {
  vocabularySearchInput.value = "";
  searchQuery = "";
  resetCurrentVocabulary();
  renderCurrentWord();
});

resetCurrentVocabulary();
renderCategoryFilters();
renderCurrentWord();
