const SHO_SENSEI_PICTURE_HOMOPHONES = new Set(["rain", "candy", "persimmon", "oyster"]);
const SHO_SENSEI_PICTURE_STORAGE_KEY = "japanese-sho-sensei-picture-quiz-v1";
const SHO_SENSEI_PICTURE_ROUND_SIZE = 20;
const SHO_SENSEI_PICTURE_HISTORY_LIMIT = 20;
const SHO_SENSEI_PICTURE_NEW_LIMIT = 4;

// The first release's playable IDs stay fixed so later additions can be recognized even on a new device.
const SHO_SENSEI_PICTURE_BASELINE_IDS = [
  "airplane", "apple", "apron", "balloon", "banana",
  "bean", "bear", "beer", "bento", "blue",
  "boat", "book", "camel", "candy", "canoe",
  "car", "cat", "chair", "cheese", "cheesecake",
  "child", "china", "chocolate-cake", "clock", "coffee",
  "cooked-rice", "cow", "crab", "cucumber", "curry-rice",
  "deer", "desk", "dog", "drum", "duck",
  "egg", "eggplant", "elephant", "eraser", "eye",
  "eyeglasses", "fish", "flower", "france", "frog",
  "giraffe", "grill", "hairy-caterpillar", "hamburger", "hand",
  "hat", "hong-kong", "house", "ice-cream", "italy",
  "japan", "kappa", "kuromi", "leg-foot", "lemon",
  "lion", "mandarin", "map", "meat", "melon",
  "milk-tea", "moon", "mop", "mountain", "neck",
  "nosebleed", "number-0", "number-1", "number-10", "number-2",
  "number-3", "number-4", "number-5", "number-6", "number-7",
  "number-8", "number-9", "octopus", "oyster", "paper",
  "pasta", "peach", "pencil", "persimmon", "person",
  "pig", "pillow", "pineapple", "pizza", "rain",
  "ramen", "red", "school", "scissors", "seagull",
  "seesaw", "shellfish", "shirt", "shoes", "sleep",
  "snow", "soccer", "south-korea", "spinning-top", "squid",
  "squirrel", "star", "stuffed-toy", "sushi", "taiwan",
  "teacher", "train", "tree", "truck", "trumpet",
  "turtle", "umbrella", "united-kingdom", "united-states", "utility-knife",
  "wash", "watermelon", "window", "write", "yacht",
];

function getShoSenseiPictureOptionLabel(word) {
  // Number questions ask for the Japanese reading of the pictured quantity.
  if (/^\d+$/.test(word.word)) return word.kana;
  if (SHO_SENSEI_PICTURE_HOMOPHONES.has(word.id)) return `${word.word}（${word.kana}）`;
  return word.word;
}

function getShoSenseiPictureWordForms(word) {
  return [word.word, word.kana, word.speechText, ...(word.variants || [])].filter(Boolean).map((form) =>
    form.normalize("NFKC").replace(/[\s。]/g, "").replace(/[ァ-ヶ]/g, (kana) =>
      String.fromCharCode(kana.charCodeAt(0) - 0x60)));
}

function createShoSenseiPictureQuestionBank(words, shuffle) {
  const wordsById = new Map(words.map((word) => [word.id, word]));
  const wordForms = new Map(words.map((word) => [word.id, getShoSenseiPictureWordForms(word)]));
  const areDistinct = (first, second) => first.id !== second.id && first.meaning !== second.meaning &&
    !wordForms.get(first.id).some((form) => wordForms.get(second.id).includes(form));
  const questions = [];

  for (const answer of wordsById.values()) {
    const { pictureQuizEligible, pictureQuizDistractorIds = [] } = answer;
    const imagePath = answer.pictureQuizImagePath || answer.imagePath;
    if (pictureQuizEligible !== true || !imagePath || !answer.speechText) continue;

    // Candidate IDs are reviewed against this particular image and sense in the shared word bank.
    const candidates = pictureQuizDistractorIds.map((id) => wordsById.get(id)).filter((word) =>
      word?.speechText && word.category !== answer.category && areDistinct(answer, word));
    const pairs = candidates.flatMap((first, index) => candidates.slice(index + 1)
      .filter((second) => areDistinct(first, second)).map((second) => [first, second]));
    const crossCategoryPairs = pairs.filter(([first, second]) => first.category !== second.category);
    const [distractors] = shuffle(crossCategoryPairs.length ? crossCategoryPairs : pairs);
    if (distractors) questions.push({ answer, imagePath, distractors });
  }
  return questions;
}

function syncShoSenseiPictureProgress(state, ids, shuffle) {
  const knownIds = new Set([...SHO_SENSEI_PICTURE_BASELINE_IDS, ...state.seenAddedIds]);
  state.practicedIds = state.practicedIds.filter((id) => ids.has(id));
  state.priorityIds = state.priorityIds.filter((id) => ids.has(id));
  state.cycleOrder = state.cycleOrder.filter((id) => ids.has(id));
  const orderedIds = new Set(state.cycleOrder);
  state.cycleOrder.push(...shuffle([...ids].filter((id) => !orderedIds.has(id))));
  for (const id of ids) {
    if (knownIds.has(id)) continue;
    // Retain discovery IDs so a removed question cannot become new again when restored.
    state.seenAddedIds.push(id);
    state.priorityIds.push(id);
  }
}

function selectShoSenseiPictureRound(bank, state, shuffle) {
  const total = Math.min(bank.length, SHO_SENSEI_PICTURE_ROUND_SIZE);
  const questions = [];
  const selectedIds = new Set();
  const byId = new Map(bank.map((question) => [question.answer.id, question]));
  const categories = [...new Set(bank.map(({ answer }) => answer.category))];
  let categoryIndex = categories.indexOf(state.lastCategory) + 1;

  function take(pool, count) {
    if (!count) return;
    const groups = new Map();
    for (const question of pool) {
      const category = question.answer.category;
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(question);
    }
    while (count > 0 && groups.size > 0) {
      const category = categories[categoryIndex % categories.length];
      categoryIndex += 1;
      const group = groups.get(category);
      if (!group) continue;
      const question = group.shift();
      questions.push(question);
      selectedIds.add(question.answer.id);
      if (!group.length) groups.delete(category);
      count -= 1;
    }
  }

  const practiced = new Set(state.practicedIds);
  const priority = new Set(state.priorityIds);
  const remaining = state.cycleOrder.filter((id) => !practiced.has(id)).map((id) => byId.get(id));
  take(remaining.filter(({ answer }) => priority.has(answer.id)), Math.min(total, SHO_SENSEI_PICTURE_NEW_LIMIT));
  take(remaining.filter(({ answer }) => !selectedIds.has(answer.id)), total - questions.length);
  let nextCycleOrder = null;
  if (questions.length < total) {
    // Prepare the new cycle's order, but commit it only after an answer crosses the boundary.
    nextCycleOrder = shuffle(state.cycleOrder);
    take(nextCycleOrder.filter((id) => !selectedIds.has(id)).map((id) => byId.get(id)), total - questions.length);
  }
  return { questions: arrangeShoSenseiPictureOptions(questions, shuffle), nextCycleOrder };
}

function arrangeShoSenseiPictureOptions(questions, shuffle) {
  const positions = [0, 1, 2];
  let batch = [];
  let previousPosition = null;
  return questions.map(({ answer, imagePath, distractors }) => {
    if (!batch.length) {
      const [first] = shuffle(positions.filter((position) => position !== previousPosition));
      batch = [first, ...shuffle(positions.filter((position) => position !== first))];
    }
    const correctPosition = batch.shift();
    const options = shuffle(distractors);
    options.splice(correctPosition, 0, answer);
    previousPosition = correctPosition;
    return { answer, imagePath, options, correctPosition };
  });
}

function createShoSenseiPictureStore(setAvailable) {
  const readIds = (ids) => Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === "string"))] : [];
  let state = { cycleOrder: [], practicedIds: [], priorityIds: [], seenAddedIds: [], lastCategory: null, results: [] };
  let unsaved = false;

  function read() {
    if (unsaved) return state;
    try {
      const saved = JSON.parse(localStorage.getItem(SHO_SENSEI_PICTURE_STORAGE_KEY)) || {};
      const results = Array.isArray(saved.results) ? saved.results.filter((record) =>
        typeof record?.id === "string" && Number.isFinite(Date.parse(record.completedAt)) &&
        Number.isInteger(record.total) && record.total > 0 && record.total <= SHO_SENSEI_PICTURE_ROUND_SIZE &&
        Number.isInteger(record.correct) && record.correct >= 0 && record.correct <= record.total &&
        record.accuracy === Math.round(record.correct / record.total * 100)) : [];
      state = {
        cycleOrder: readIds(saved.cycleOrder),
        practicedIds: readIds(saved.practicedIds),
        priorityIds: readIds(saved.priorityIds),
        seenAddedIds: readIds(saved.seenAddedIds),
        lastCategory: saved.lastCategory ?? null,
        results: results.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
          .slice(0, SHO_SENSEI_PICTURE_HISTORY_LIMIT),
      };
      setAvailable(true);
    } catch {
      setAvailable(false);
    }
    return state;
  }

  return {
    read,
    update(change) {
      // Re-read before each change so a round cannot overwrite a more recent progress or results snapshot.
      change(read());
      try {
        localStorage.setItem(SHO_SENSEI_PICTURE_STORAGE_KEY, JSON.stringify(state));
        unsaved = false;
      } catch {
        unsaved = true;
      }
      setAvailable(!unsaved);
      return state;
    },
  };
}

function createShoSenseiPictureQuiz(view, { loadWords, shuffle, playWord, stopSpeech, onBack }) {
  const exercise = view.querySelector("[data-picture-quiz-exercise]");
  const result = view.querySelector("[data-picture-quiz-result]");
  const history = view.querySelector("[data-picture-quiz-history]");
  const storageStatus = view.querySelector("[data-picture-quiz-storage]");
  const progress = view.querySelector("[data-picture-quiz-progress]");
  const questionPanel = view.querySelector("[data-picture-quiz-question]");
  const prompt = questionPanel.querySelector(".quiz-prompt-label");
  const image = questionPanel.querySelector("img");
  const options = view.querySelector("[data-picture-quiz-options]");
  const speechStatus = view.querySelector("[data-picture-quiz-speech]");
  const feedback = view.querySelector("[data-picture-quiz-feedback]");
  const optionTemplate = view.querySelector("[data-picture-quiz-option]");
  const mistakeTemplate = view.querySelector("[data-picture-quiz-mistake]");
  const mistakes = view.querySelector("[data-picture-quiz-mistakes]");
  const historyList = view.querySelector("[data-picture-quiz-history-list]");
  const next = view.querySelector("[data-picture-quiz-next]");
  const restart = view.querySelector("[data-picture-quiz-restart]");
  const store = createShoSenseiPictureStore((available) => {
    storageStatus.textContent = available ? "" : "瀏覽器無法儲存紀錄，這回的練習進度與成績未儲存。";
  });
  let loadGeneration = 0;
  let round = null;
  let historyTrigger;

  function showPanel(panel, focus = panel.querySelector("h2")) {
    stopSpeech();
    for (const section of [exercise, result, history]) section.hidden = section !== panel;
    focus.focus();
  }

  function clearQuestion() {
    stopSpeech();
    questionPanel.hidden = true;
    options.replaceChildren();
    feedback.textContent = "";
    next.hidden = true;
  }

  function bindSpeech(button, word, status) {
    button.setAttribute("aria-label", `聽發音：${getShoSenseiPictureOptionLabel(word)}`);
    button.addEventListener("click", () => playWord(word, status));
  }

  function recordAnswer(question, chosen) {
    round.answers.push(chosen);
    const total = round.questions.length;
    if (round.answers.length === total) {
      const correct = round.answers.filter((word, index) => word.id === round.questions[index].answer.id).length;
      round.result = {
        id: round.id,
        completedAt: new Date().toISOString(),
        correct,
        total,
        accuracy: Math.round(correct / total * 100),
      };
    }
    store.update((state) => {
      const { id, category } = question.answer;
      if (state.cycleOrder.includes(id)) {
        if (state.practicedIds.length === state.cycleOrder.length) {
          const sameBank = round.bankIds.size === state.cycleOrder.length &&
            state.cycleOrder.every((id) => round.bankIds.has(id));
          state.cycleOrder = (sameBank && round.nextCycleOrder) || shuffle(state.cycleOrder);
          state.practicedIds = [];
        }
        if (!state.practicedIds.includes(id)) state.practicedIds.push(id);
        state.priorityIds = state.priorityIds.filter((pendingId) => pendingId !== id);
        state.lastCategory = category;
      }
      if (round.result && !state.results.some(({ id }) => id === round.id)) {
        state.results = [round.result, ...state.results]
          .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
          .slice(0, SHO_SENSEI_PICTURE_HISTORY_LIMIT);
      }
    });
  }

  function renderQuestion() {
    clearQuestion();
    const { questions, index } = round;
    const question = questions[index];
    const { answer, imagePath, options: words, correctPosition } = question;
    const buttons = [];
    progress.textContent = `第 ${index + 1} 題／共 ${questions.length} 題`;
    image.src = imagePath;

    for (const [position, word] of words.entries()) {
      const row = optionTemplate.content.firstElementChild.cloneNode(true);
      const [choose, listen] = row.querySelectorAll("button");
      choose.textContent = getShoSenseiPictureOptionLabel(word);
      bindSpeech(listen, word, speechStatus);
      choose.addEventListener("click", () => {
        if (exercise.hidden || round?.questions[round.index] !== question || round.answers[index]) return;
        const correct = position === correctPosition;
        recordAnswer(question, word);
        if (!correct) choose.classList.add("is-wrong");
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
    round = null;
    clearQuestion();
    mistakes.replaceChildren();
    restart.hidden = true;
    progress.textContent = "正在載入題目…";
    showPanel(exercise);
    try {
      const words = await loadWords();
      if (generation !== loadGeneration) return;
      const bank = createShoSenseiPictureQuestionBank(words, shuffle);
      const bankIds = new Set(bank.map(({ answer }) => answer.id));
      const state = store.update((saved) => syncShoSenseiPictureProgress(saved, bankIds, shuffle));
      const { questions, nextCycleOrder } = selectShoSenseiPictureRound(bank, state, shuffle);
      restart.textContent = questions.length ? "重新開始" : "重試";
      restart.hidden = false;
      if (questions.length) {
        const id = crypto.getRandomValues(new Uint32Array(4)).join("-");
        round = { id, bankIds, questions, nextCycleOrder, index: 0, answers: [], result: null };
        renderQuestion();
      } else {
        progress.textContent = "目前沒有可出題的圖片。";
      }
    } catch (_error) {
      if (generation !== loadGeneration) return;
      progress.textContent = "無法載入題目，請再試一次。";
      restart.textContent = "重試";
      restart.hidden = false;
    }
  }

  function scoreText({ correct, total, accuracy }) {
    return `答對 ${correct}／${total}，正確率 ${accuracy}%`;
  }

  function renderResult() {
    clearQuestion();
    result.querySelector("[data-picture-quiz-score]").textContent = scoreText(round.result);
    mistakes.replaceChildren();
    for (const [index, { answer, imagePath }] of round.questions.entries()) {
      const chosen = round.answers[index];
      if (chosen.id === answer.id) continue;
      const card = mistakeTemplate.content.firstElementChild.cloneNode(true);
      card.querySelector("h4").textContent = `第 ${index + 1} 題`;
      card.querySelector("img").src = imagePath;
      const [selectedWord, correctWord] = card.querySelectorAll('[lang="ja"]');
      selectedWord.textContent = getShoSenseiPictureOptionLabel(chosen);
      correctWord.textContent = getShoSenseiPictureOptionLabel(answer);
      bindSpeech(card.querySelector("button"), answer, card.querySelector('[role="status"]'));
      mistakes.append(card);
    }
    result.querySelector("[data-picture-quiz-perfect]").hidden = mistakes.childElementCount > 0;
    showPanel(result);
  }

  function openHistory(event) {
    historyTrigger = event.currentTarget;
    const records = store.read().results;
    historyList.replaceChildren();
    history.querySelector("[data-picture-quiz-no-history]").hidden = records.length > 0;
    for (const record of records) {
      const card = document.createElement("article");
      card.className = "sentence-composition-card";
      const time = document.createElement("time");
      time.dateTime = record.completedAt;
      time.textContent = new Date(record.completedAt).toLocaleString("zh-TW", { hour12: false });
      const score = document.createElement("p");
      score.textContent = scoreText(record);
      card.append(time, score);
      historyList.append(card);
    }
    showPanel(history);
  }

  next.addEventListener("click", () => {
    if (exercise.hidden || next.hidden) return;
    if (!round.result) {
      round.index += 1;
      renderQuestion();
      prompt.focus();
    } else {
      renderResult();
    }
  });
  restart.addEventListener("click", start);
  result.querySelector("[data-picture-quiz-again]").addEventListener("click", start);
  for (const button of view.querySelectorAll("[data-picture-quiz-open-history]")) {
    button.addEventListener("click", openHistory);
  }
  history.querySelector("[data-picture-quiz-history-back]").addEventListener("click", () => {
    showPanel(result.contains(historyTrigger) ? result : exercise, historyTrigger);
  });
  for (const button of view.querySelectorAll("[data-picture-quiz-back]")) {
    button.addEventListener("click", onBack);
  }
  return {
    start,
    close() {
      loadGeneration += 1;
      round = null;
      clearQuestion();
    },
  };
}
