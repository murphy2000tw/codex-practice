function shuffleHiraganaListeningItems(items, random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

function createHiraganaListeningDeck(kana, random = Math.random) {
  let cards = [];
  let previousAnswer = null;
  return {
    next() {
      if (cards.length === 0) {
        cards = shuffleHiraganaListeningItems([...kana], random);
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

function buildHiraganaListeningQuestion(kana, answer, random = Math.random) {
  // Keep both kana eligible as answers, but exclude the homophone from distractors.
  const homophone = answer === 'お' ? 'を' : answer === 'を' ? 'お' : null;
  const distractors = kana.filter((character) => character !== answer && character !== homophone);
  const options = [answer, ...shuffleHiraganaListeningItems(distractors, random).slice(0, 3)];
  return { answer, options: shuffleHiraganaListeningItems(options, random) };
}

(() => {
  // Inactive panels are retained by the existing router outside the document.
  const panel = japaneseHiraganaListeningPanel;
  if (!panel) return;
  const kana = Array.from(japaneseHiraganaPanel.querySelectorAll('[data-hiragana]'), (key) => key.dataset.hiragana);
  const deck = createHiraganaListeningDeck(kana);
  const provider = getJapaneseListeningSpeechProvider();
  const controller = createJapaneseListeningModeSpeechController(provider);
  const play = panel.querySelector('#hiragana-listening-play');
  const status = panel.querySelector('#hiragana-listening-status');
  const heading = panel.querySelector('#hiragana-listening-question');
  const options = panel.querySelector('#hiragana-listening-options');
  const feedback = panel.querySelector('#hiragana-listening-feedback');
  const next = panel.querySelector('#hiragana-listening-next');
  let visible = false;
  let playing = false;
  let question = null;
  let questionNumber = 0;
  let answered = false;

  function stopPlayback() {
    controller.cancel();
    playing = false;
    play.classList.remove('is-playing');
  }

  function checkVoice() {
    const capability = validateJapaneseJlptListeningCapability(provider);
    if (!capability.ok) {
      status.textContent = capability.code === 'speech-unavailable'
        ? '此瀏覽器不支援語音合成，請改用支援語音功能的瀏覽器或裝置。'
        : '目前沒有可用的日文語音。請在裝置的語音設定安裝或啟用日文語音後重新載入；若語音仍在載入，請稍候再點擊。';
      return false;
    }
    status.textContent = '已備妥日文語音，請點擊播放按鈕聆聽。';
    return true;
  }

  function showQuestion() {
    stopPlayback();
    question = buildHiraganaListeningQuestion(kana, deck.next());
    questionNumber += 1;
    answered = false;
    heading.textContent = `第 ${questionNumber} 題：請選出聽到的平假名`;
    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    next.hidden = true;
    options.replaceChildren();
    question.options.forEach((character) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option hiragana-key';
      button.lang = 'ja';
      button.textContent = character;
      button.addEventListener('click', () => {
        if (answered || !visible) return;
        answered = true;
        const correct = character === question.answer;
        feedback.className = `quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        feedback.textContent = `${correct ? '答對了！' : '答錯了。'}正確答案：${question.answer}`;
        options.querySelectorAll('button').forEach((option) => {
          option.disabled = true;
          if (option.textContent === question.answer) option.classList.add('is-correct');
          else if (option === button) option.classList.add('is-wrong');
        });
        next.hidden = false;
      });
      options.appendChild(button);
    });
    checkVoice();
    requestAnimationFrame(() => { if (visible) heading.focus(); });
  }

  play.addEventListener('click', () => {
    if (!visible || !question) return;
    stopPlayback();
    if (!checkVoice()) return;
    playing = true;
    play.classList.add('is-playing');
    controller.requestPlayback(`hiragana-listening-${questionNumber}`, question.answer, (state) => {
      status.textContent = state === 'preparing' ? '準備播放日文發音…'
        : state === 'playing' ? '正在播放日文發音…'
        : state === 'ended' ? '播放完畢，可再次播放。'
        : '日文語音播放失敗，請確認裝置音量、語音設定及網路連線後再試。';
      if (state === 'ended' || state === 'error') {
        playing = false;
        play.classList.remove('is-playing');
      }
    });
  });
  next.addEventListener('click', () => { if (visible && answered) showQuestion(); });
  window.japaneseHiraganaListeningPage = {
    onViewChange(view) {
      visible = view === 'hiraganaListening';
      stopPlayback();
      deck.reset();
      question = null;
      if (visible) {
        questionNumber = 0;
        showQuestion();
      }
    },
  };
  provider.speechSynthesis?.addEventListener('voiceschanged', () => {
    if (visible && !playing) checkVoice();
  });
  window.addEventListener('pagehide', stopPlayback);
})();
