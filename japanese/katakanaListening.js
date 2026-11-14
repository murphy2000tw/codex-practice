function shuffleKatakanaListeningItems(items, random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

function createKatakanaListeningDeck(kana, random = Math.random) {
  let cards = [];
  let previousAnswer = null;
  return {
    next() {
      if (cards.length === 0) {
        cards = shuffleKatakanaListeningItems([...kana], random);
        if (cards.length > 1 && cards[0] === previousAnswer) {
          const other = 1 + Math.floor(random() * (cards.length - 1));
          [cards[0], cards[other]] = [cards[other], cards[0]];
        }
      }
      previousAnswer = cards.shift();
      return previousAnswer;
    },
    reset() {
      cards = [];
      previousAnswer = null;
    },
  };
}

function buildKatakanaListeningQuestion(kana, answer, random = Math.random) {
  // Keep both kana eligible as answers, but exclude the homophone from distractors.
  const homophone = answer === 'オ' ? 'ヲ' : answer === 'ヲ' ? 'オ' : null;
  const distractors = kana.filter((character) => character !== answer && character !== homophone);
  const options = [answer, ...shuffleKatakanaListeningItems(distractors, random).slice(0, 3)];
  return { answer, options: shuffleKatakanaListeningItems(options, random) };
}

(() => {
  const panel = japaneseKatakanaListeningPanel;
  if (!panel) return;
  const kana = Object.keys(KATAKANA_TO_HIRAGANA);
  const deck = createKatakanaListeningDeck(kana);
  const controller = createHiraganaChartPlaybackController({
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (timer) => window.clearTimeout(timer),
  });
  const play = panel.querySelector('#katakana-listening-play');
  const status = panel.querySelector('#katakana-listening-status');
  const heading = panel.querySelector('#katakana-listening-question');
  const options = panel.querySelector('#katakana-listening-options');
  const feedback = panel.querySelector('#katakana-listening-feedback');
  const next = panel.querySelector('#katakana-listening-next');
  const stats = panel.querySelector('#katakana-listening-stats');
  let visible = false;
  let question = null;
  let questionNumber = 0;
  let answered = false;
  let answeredCount = 0;
  let correctCount = 0;
  let playbackGeneration = 0;
  let completionTimer = null;

  function renderStats() {
    const accuracy = answeredCount === 0 ? '—' : `${Math.round(correctCount / answeredCount * 100)}%`;
    stats.textContent = `已作答：${answeredCount} 題　答對：${correctCount} 題　正確率：${accuracy}`;
  }

  function stopPlayback() {
    playbackGeneration += 1;
    if (completionTimer !== null) window.clearTimeout(completionTimer);
    completionTimer = null;
    controller.cancel();
    play.classList.remove('is-playing');
  }

  function showQuestion() {
    stopPlayback();
    const currentQuestion = buildKatakanaListeningQuestion(kana, deck.next());
    question = currentQuestion;
    questionNumber += 1;
    answered = false;
    heading.textContent = `第 ${questionNumber} 題：請選出聽到的片假名`;
    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    status.textContent = '已備妥錄音，請點擊播放按鈕聆聽。';
    next.hidden = true;
    options.replaceChildren();
    currentQuestion.options.forEach((character) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option hiragana-key';
      button.lang = 'ja';
      button.textContent = character;
      button.addEventListener('click', () => {
        if (answered || !visible || question !== currentQuestion) return;
        answered = true;
        const correct = character === currentQuestion.answer;
        answeredCount += 1;
        if (correct) correctCount += 1;
        renderStats();
        feedback.className = `quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        feedback.textContent = `${correct ? '答對了！' : '答錯了。'}正確答案：${currentQuestion.answer}`;
        options.querySelectorAll('button').forEach((option) => {
          option.disabled = true;
          if (option.textContent === currentQuestion.answer) option.classList.add('is-correct');
          else if (option === button) option.classList.add('is-wrong');
        });
        next.hidden = false;
      });
      options.appendChild(button);
    });
    requestAnimationFrame(() => { if (visible && question === currentQuestion) heading.focus(); });
  }

  play.addEventListener('click', () => {
    if (!visible || !question) return;
    stopPlayback();
    if (!getKatakanaChartRecordingUrl(question.answer)) {
      status.textContent = '本題錄音未能載入，請重新進入練習後再試。';
      return;
    }
    const generation = playbackGeneration;
    play.classList.add('is-playing');
    // The existing WAV controller calls Audio.play() synchronously on this click stack.
    controller.requestPlayback(`katakana-listening-${questionNumber}`, KATAKANA_TO_HIRAGANA[question.answer], (state) => {
      if (!visible || generation !== playbackGeneration) return;
      status.textContent = state === 'preparing' ? '準備播放錄音…'
        : state === 'playing' ? '正在播放錄音…'
        : state === 'ended' ? '播放完畢，可再次播放。'
        : state === 'timeout' ? '錄音載入逾時，請確認網路連線後再次點擊播放。'
        : '錄音未能播放，請確認裝置音量及網路連線後再次點擊重試。';
      if (state === 'playing' && completionTimer === null) {
        // This timer only bounds missing end/error events; it never defers play().
        completionTimer = window.setTimeout(() => {
          if (!visible || generation !== playbackGeneration) return;
          stopPlayback();
          status.textContent = '錄音播放逾時，請再次點擊播放；若仍無聲，請確認裝置音量及網路連線。';
        }, 15000);
      }
      if (state === 'ended' || state === 'error' || state === 'timeout') stopPlayback();
    });
  });
  next.addEventListener('click', () => { if (visible && answered) showQuestion(); });
  window.japaneseKatakanaListeningPage = {
    onViewChange(view) {
      visible = view === 'katakanaListening';
      stopPlayback();
      deck.reset();
      question = null;
      answeredCount = 0;
      correctCount = 0;
      renderStats();
      if (visible) {
        questionNumber = 0;
        showQuestion();
      }
    },
  };
  window.addEventListener('pagehide', stopPlayback);
})();
