const SHO_SENSEI_PICTURE_HOMOPHONES = new Set(["rain", "candy", "persimmon", "oyster"]);

function getShoSenseiPictureOptionLabel(word) {
  // The number cards show Arabic numerals. The answer is the Japanese reading.
  if (/^\d+$/.test(word.word)) return word.kana;
  if (SHO_SENSEI_PICTURE_HOMOPHONES.has(word.id)) return `${word.word}（${word.kana}）`;
  return word.word;
}

function getShoSenseiPictureWordForms(word) {
  return [word.word, word.kana, word.speechText, ...(word.variants || [])].filter(Boolean).map((form) =>
    form.normalize("NFKC").replace(/[\s。]/g, "").replace(/[ァ-ヶ]/g, (kana) =>
      String.fromCharCode(kana.charCodeAt(0) - 0x60)));
}

function createShoSenseiPictureQuestions(words, shuffle) {
  const wordsById = new Map(words.map((word) => [word.id, word]));
  const wordForms = new Map(words.map((word) => [word.id, getShoSenseiPictureWordForms(word)]));
  const areDistinct = (first, second) => first.id !== second.id && first.meaning !== second.meaning &&
    !wordForms.get(first.id).some((form) => wordForms.get(second.id).includes(form));
  const questions = [];

  for (const answer of words) {
    const { imagePath, pictureQuizEligible, pictureQuizDistractorIds = [] } = answer;
    if (pictureQuizEligible !== true || !imagePath || !answer.speechText) continue;

    // Candidate IDs are reviewed against this particular image and sense in the shared word bank.
    const candidates = pictureQuizDistractorIds.map((id) => wordsById.get(id)).filter((word) =>
      word?.speechText && word.category !== answer.category && areDistinct(answer, word));
    const pairs = candidates.flatMap((first, index) => candidates.slice(index + 1)
      .filter((second) => areDistinct(first, second)).map((second) => [first, second]));
    const crossCategoryPairs = pairs.filter(([first, second]) => first.category !== second.category);
    const [distractors] = shuffle(crossCategoryPairs.length ? crossCategoryPairs : pairs);
    if (distractors) questions.push({ answer, distractors });
  }

  const positions = [0, 1, 2];
  let batch = [];
  let previousPosition = null;
  return shuffle(questions).map(({ answer, distractors }) => {
    if (!batch.length) {
      const [first] = shuffle(positions.filter((position) => position !== previousPosition));
      batch = [first, ...shuffle(positions.filter((position) => position !== first))];
    }
    const correctPosition = batch.shift();
    const options = shuffle(distractors);
    options.splice(correctPosition, 0, answer);
    previousPosition = correctPosition;
    return { answer, options, correctPosition };
  });
}

function createShoSenseiPictureQuiz(view, { loadWords, shuffle, playWord, stopSpeech, onBack }) {
  const title = view.querySelector("h2");
  const progress = view.querySelector("[data-picture-quiz-progress]");
  const questionPanel = view.querySelector("[data-picture-quiz-question]");
  const prompt = questionPanel.querySelector(".quiz-prompt-label");
  const image = questionPanel.querySelector("img");
  const options = view.querySelector("[data-picture-quiz-options]");
  const speechStatus = view.querySelector("[data-picture-quiz-speech]");
  const feedback = view.querySelector("[data-picture-quiz-feedback]");
  const optionTemplate = view.querySelector("[data-picture-quiz-option]");
  const next = view.querySelector("[data-picture-quiz-next]");
  const restart = view.querySelector("[data-picture-quiz-restart]");
  let loadGeneration = 0;
  let questions = [];
  let index = 0;
  let correctCount = 0;

  function clearQuestion() {
    stopSpeech();
    questionPanel.hidden = true;
    options.replaceChildren();
    feedback.textContent = "";
    next.hidden = true;
  }

  function renderQuestion() {
    clearQuestion();
    const { answer, options: words, correctPosition } = questions[index];
    const buttons = [];
    progress.textContent = `第 ${index + 1} 題／共 ${questions.length} 題`;
    image.src = answer.imagePath;

    for (const [position, word] of words.entries()) {
      const row = optionTemplate.content.firstElementChild.cloneNode(true);
      const [choose, listen] = row.querySelectorAll("button");
      const label = getShoSenseiPictureOptionLabel(word);
      choose.textContent = label;
      listen.setAttribute("aria-label", `聽發音：${label}`);
      listen.addEventListener("click", () => playWord(word, speechStatus));
      choose.addEventListener("click", () => {
        const correct = position === correctPosition;
        if (correct) correctCount += 1;
        else choose.classList.add("is-wrong");
        buttons[correctPosition].classList.add("is-correct");
        buttons.forEach((button) => { button.disabled = true; });

        const answerText = document.createElement("span");
        answerText.lang = "ja";
        answerText.textContent = getShoSenseiPictureOptionLabel(answer);
        feedback.replaceChildren(correct ? "答對了！正確答案是 " : "答錯了。正確答案是 ", answerText);
        next.textContent = index + 1 < questions.length ? "下一題" : "查看結果";
        next.hidden = false;
        next.focus();
      });
      buttons.push(choose);
      options.append(row);
    }
    questionPanel.hidden = false;
  }

  async function start() {
    const generation = ++loadGeneration;
    clearQuestion();
    restart.hidden = true;
    title.focus();
    progress.textContent = "正在載入題目…";
    try {
      const words = await loadWords();
      if (generation !== loadGeneration) return;
      questions = createShoSenseiPictureQuestions(words, shuffle);
      index = 0;
      correctCount = 0;
      restart.textContent = questions.length ? "重新開始" : "重試";
      restart.hidden = false;
      if (questions.length) renderQuestion();
      else progress.textContent = "目前沒有可出題的圖片。";
    } catch (_error) {
      if (generation !== loadGeneration) return;
      progress.textContent = "無法載入題目，請再試一次。";
      restart.textContent = "重試";
      restart.hidden = false;
    }
  }

  next.addEventListener("click", () => {
    if (next.hidden) return;
    index += 1;
    if (index < questions.length) {
      renderQuestion();
      prompt.focus();
    } else {
      clearQuestion();
      progress.textContent = `完成練習！答對 ${correctCount} 題，共 ${questions.length} 題。`;
      restart.focus();
    }
  });
  restart.addEventListener("click", start);
  view.querySelector("[data-picture-quiz-back]").addEventListener("click", onBack);
  return {
    start,
    close() {
      loadGeneration += 1;
      clearQuestion();
    },
  };
}
