// Explicit basic-katakana mapping; recordings and playback belong to the existing chart helper.
const KATAKANA_TO_HIRAGANA = Object.freeze({
  'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
  'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
  'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
  'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
  'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
  'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
  'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
  'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
  'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
  'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
});

function getKatakanaChartRecordingUrl(kana) {
  return Object.prototype.hasOwnProperty.call(KATAKANA_TO_HIRAGANA, kana)
    ? getHiraganaChartRecordingUrl(KATAKANA_TO_HIRAGANA[kana]) : null;
}

(() => {
  // Inactive panels are retained by the router outside the document.
  const panel = japaneseKatakanaPanel;
  if (!panel) return;
  const status = panel.querySelector('#katakana-status');
  const controller = createHiraganaChartPlaybackController({
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (timer) => window.clearTimeout(timer),
  });
  let activeButton = null;
  let visible = false;

  function stopPlayback() {
    controller.cancel();
    activeButton?.classList.remove('is-playing');
    activeButton = null;
  }

  panel.querySelectorAll('[data-katakana]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!visible) return;
      stopPlayback();
      const kana = button.dataset.katakana;
      if (!getKatakanaChartRecordingUrl(kana)) {
        status.textContent = `「${kana}」錄音尚未確認，暫不播放。`;
        return;
      }
      activeButton = button;
      button.classList.add('is-playing');
      controller.requestPlayback(kana, KATAKANA_TO_HIRAGANA[kana], (state) => {
        status.textContent = state === 'preparing' ? `準備播放「${kana}」…`
          : state === 'playing' ? `正在播放「${kana}」…`
          : state === 'ended' ? `「${kana}」播放完畢，可點擊其他字或再次播放。`
          : '錄音未能播放，請確認裝置音量及網路連線後再點擊重試。';
        if (state === 'ended' || state === 'error' || state === 'timeout') {
          activeButton?.classList.remove('is-playing');
          activeButton = null;
        }
      });
    });
  });

  window.japaneseKatakanaPage = {
    onViewChange(view) {
      visible = view === 'katakana';
      stopPlayback();
      if (visible) {
        status.textContent = '已備妥錄音，請點擊片假名聆聽。';
        requestAnimationFrame(() => { if (visible) panel.querySelector('h2').focus(); });
      }
    },
  };
  window.addEventListener('pagehide', stopPlayback);
})();
