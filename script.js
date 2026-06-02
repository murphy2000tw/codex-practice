const CARD_COUNT = 10;
const VOCABULARY_URL = "vocabulary.json";

const cardsContainer = document.querySelector("#vocabularyCards");
const toggleButton = document.querySelector("#toggleAnswers");
const shuffleButton = document.querySelector("#shuffleWords");
const wordSetStatus = document.querySelector("#wordSetStatus");

let vocabulary = [];
let wordDeck = [];
let currentWords = [];
let previousWordIds = new Set();
let answersVisible = false;
let currentGroupNumber = 0;
let reshuffleNotice = "";

function shuffleWords(words) {
  const shuffledWords = [...words];

  for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledWords[index], shuffledWords[randomIndex]] = [shuffledWords[randomIndex], shuffledWords[index]];
  }

  return shuffledWords;
}

function getTotalGroups() {
  return Math.ceil(vocabulary.length / CARD_COUNT);
}

function buildFreshDeck() {
  const shuffledVocabulary = shuffleWords(vocabulary);

  if (previousWordIds.size === 0) {
    return shuffledVocabulary;
  }

  const wordsNotInPreviousSet = shuffledVocabulary.filter((word) => !previousWordIds.has(word.id));
  const wordsInPreviousSet = shuffledVocabulary.filter((word) => previousWordIds.has(word.id));

  return [...wordsNotInPreviousSet, ...wordsInPreviousSet];
}

function refreshDeckIfNeeded() {
  if (wordDeck.length >= CARD_COUNT) {
    reshuffleNotice = "";
    return;
  }

  wordDeck = buildFreshDeck();
  currentGroupNumber = 0;
  reshuffleNotice = "已重新洗牌。";
}

function getNextWordSet() {
  refreshDeckIfNeeded();

  const nextWords = wordDeck.slice(0, CARD_COUNT);
  wordDeck = wordDeck.slice(CARD_COUNT);
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

async function loadVocabulary() {
  try {
    const response = await fetch(VOCABULARY_URL);

    if (!response.ok) {
      throw new Error(`無法讀取單字資料：${response.status}`);
    }

    vocabulary = await response.json();
    showNewWordSet();
  } catch (error) {
    console.error(error);
    renderStatus("目前無法載入單字資料，請確認 vocabulary.json 是否存在且格式正確。");
    wordSetStatus.textContent = "單字資料載入失敗。";
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
