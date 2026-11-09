(() => {
  // The existing view router keeps inactive panels detached from the document.
  const panel = japaneseHiraganaPanel;
  if (!panel) return;
  const status = panel.querySelector('#hiragana-status');
  const controller = createHiraganaChartPlaybackController({
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (timer) => window.clearTimeout(timer),
  });
  let activeButton = null;
  let visible = false;

  function clearActive() {
    activeButton?.classList.remove('is-playing');
    activeButton = null;
  }

  function checkRecording(kana = null) {
    if (kana && !getHiraganaChartRecordingUrl(kana)) {
      status.textContent = `「${kana}」錄音尚未確認，暫不播放。`;
      return false;
    }
    status.textContent = '已備妥錄音，請點擊平假名聆聽。';
    return true;
  }

  panel.querySelectorAll('[data-hiragana]').forEach((button) => {
    button.addEventListener('click', () => {
      controller.cancel();
      clearActive();
      const kana = button.dataset.hiragana;
      if (!checkRecording(kana)) return;
      activeButton = button;
      button.classList.add('is-playing');
      controller.requestPlayback(kana, kana, (state) => {
        status.textContent = state === 'preparing' ? `準備播放「${kana}」…`
          : state === 'playing' ? `正在播放「${kana}」…`
          : state === 'ended' ? `「${kana}」播放完畢，可點擊其他字或再次播放。`
          : '錄音未能播放，請確認裝置音量及網路連線後再點擊重試。';
        if (state === 'ended' || state === 'error' || state === 'timeout') clearActive();
      });
    });
  });

  window.japaneseHiraganaPage = {
    onViewChange(view) {
      visible = view === 'hiragana';
      controller.cancel();
      clearActive();
      if (visible) {
        checkRecording();
        // The existing navigation attaches the panel after this callback.
        requestAnimationFrame(() => { if (visible) panel.querySelector('h2').focus(); });
      }
    },
  };
  window.addEventListener('pagehide', () => { controller.cancel(); clearActive(); });
})();
