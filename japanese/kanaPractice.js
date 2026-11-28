(() => {
  const charts = {
    dakuten: {
      columns: ['あ段', 'い段', 'う段', 'え段', 'お段'],
      rows: ['が ぎ ぐ げ ご', 'ざ じ ず ぜ ぞ', 'だ ぢ づ で ど', 'ば び ぶ べ ぼ'],
    },
    handakuten: {
      columns: ['あ段', 'い段', 'う段', 'え段', 'お段'],
      rows: ['ぱ ぴ ぷ ぺ ぽ'],
    },
    yoon: {
      columns: ['ゃ', 'ゅ', 'ょ'],
      rows: [
        'きゃ きゅ きょ', 'しゃ しゅ しょ', 'ちゃ ちゅ ちょ', 'にゃ にゅ にょ',
        'ひゃ ひゅ ひょ', 'みゃ みゅ みょ', 'りゃ りゅ りょ', 'ぎゃ ぎゅ ぎょ',
        'じゃ じゅ じょ', 'びゃ びゅ びょ', 'ぴゃ ぴゅ ぴょ',
      ],
    },
  };
  const controller = createJapaneseGeneralListeningSpeechController(getJapaneseListeningSpeechProvider());
  const statuses = new Map();
  let activeStatus = null;
  let activeButton = null;

  function clearActiveButton() {
    activeButton?.classList.remove('is-playing');
    activeButton = null;
  }

  function stopPlayback() {
    controller.cancel();
    clearActiveButton();
    if (activeStatus) activeStatus.textContent = '';
  }

  function play(button, status) {
    stopPlayback();
    const kana = button.textContent;
    activeButton = button;
    button.classList.add('is-playing');
    controller.requestPlayback(kana, kana, (state, reason) => {
      switch (state) {
        case 'preparing':
          status.textContent = `準備播放「${kana}」…`;
          break;
        case 'waiting-voice':
          status.textContent = '正在等待裝置載入日文語音…';
          break;
        case 'playing':
          status.textContent = `正在播放「${kana}」…`;
          break;
        case 'ended':
          status.textContent = `「${kana}」播放完畢，可點擊其他假名或再次播放。`;
          clearActiveButton();
          break;
        default:
          status.textContent = reason === 'japanese-voice-unavailable'
            ? '找不到日文語音，請檢查裝置的日文語音設定後再試。'
            : '無法播放日文語音，請檢查裝置語音設定或再試一次。';
          clearActiveButton();
      }
    });
  }

  for (const [view, panel] of japaneseKanaViews) {
    const chart = panel.querySelector('[data-kana-practice-chart]');
    if (!chart) continue;
    const status = panel.querySelector('[role="status"]');
    statuses.set(view, status);
    const category = chart.dataset.kanaPracticeChart;
    const { columns, rows } = charts[category];
    const toScript = view.startsWith('katakana')
      // The kana in these charts share the same offset in the two Unicode blocks.
      ? (text) => text.replace(/[ぁ-ゖ]/g, (kana) => String.fromCharCode(kana.charCodeAt(0) + 0x60))
      : (text) => text;
    const rowClass = category === 'yoon' ? 'hiragana-row kana-yoon-row' : 'hiragana-row';
    const header = document.createElement('div');
    header.className = `${rowClass} hiragana-columns`;
    header.setAttribute('aria-hidden', 'true');
    for (const column of ['', ...columns]) {
      const cell = document.createElement('span');
      cell.textContent = toScript(column);
      header.append(cell);
    }
    chart.append(header);
    for (const group of rows) {
      const characters = group.split(' ').map(toScript);
      const row = document.createElement('div');
      row.className = rowClass;
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', `${characters[0]}行`);
      const label = document.createElement('span');
      label.className = 'hiragana-row-label';
      label.textContent = `${characters[0]}行`;
      row.append(label);
      for (const kana of characters) {
        const button = document.createElement('button');
        button.className = 'hiragana-key';
        button.type = 'button';
        button.lang = 'ja';
        button.textContent = kana;
        button.setAttribute('aria-label', `播放 ${kana} 的日文發音`);
        button.addEventListener('click', () => { if (activeStatus === status) play(button, status); });
        row.append(button);
      }
      chart.append(row);
    }
  }

  window.japaneseKanaPracticePage = {
    onViewChange(view) {
      stopPlayback();
      activeStatus = statuses.get(view) ?? null;
    },
  };
  window.addEventListener('pagehide', stopPlayback);
})();
