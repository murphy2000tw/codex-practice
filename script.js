const vocabulary = [
  { japanese: "私", kana: "わたし", meaning: "我", partOfSpeech: "代名詞" },
  { japanese: "学生", kana: "がくせい", meaning: "學生", partOfSpeech: "名詞" },
  { japanese: "先生", kana: "せんせい", meaning: "老師；醫生", partOfSpeech: "名詞" },
  { japanese: "水", kana: "みず", meaning: "水", partOfSpeech: "名詞" },
  { japanese: "本", kana: "ほん", meaning: "書", partOfSpeech: "名詞" },
  { japanese: "行く", kana: "いく", meaning: "去", partOfSpeech: "動詞" },
  { japanese: "食べる", kana: "たべる", meaning: "吃", partOfSpeech: "動詞" },
  { japanese: "大きい", kana: "おおきい", meaning: "大的", partOfSpeech: "い形容詞" },
  { japanese: "静か", kana: "しずか", meaning: "安靜的", partOfSpeech: "な形容詞" },
  { japanese: "今日", kana: "きょう", meaning: "今天", partOfSpeech: "名詞" }
];

const cardsContainer = document.querySelector("#vocabularyCards");
const toggleButton = document.querySelector("#toggleAnswers");
let answersVisible = false;

function createCard(word, index) {
  const card = document.createElement("article");
  card.className = "word-card";

  card.innerHTML = `
    <div>
      <span class="card-number">單字 ${index + 1}</span>
      <h2 class="japanese-word">${word.japanese}</h2>
      <p class="kana">${word.kana}</p>
    </div>
    <div class="answer" hidden>
      <div class="answer-row"><span>中文意思</span><strong>${word.meaning}</strong></div>
      <div class="answer-row"><span>詞性</span><strong>${word.partOfSpeech}</strong></div>
    </div>
  `;

  return card;
}

function renderCards() {
  const cards = vocabulary.map((word, index) => createCard(word, index));
  cardsContainer.replaceChildren(...cards);
}

function updateAnswersVisibility() {
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.hidden = !answersVisible;
  });

  toggleButton.textContent = answersVisible ? "隱藏答案" : "顯示答案";
  toggleButton.setAttribute("aria-pressed", String(answersVisible));
}

toggleButton.addEventListener("click", () => {
  answersVisible = !answersVisible;
  updateAnswersVisibility();
});

renderCards();
