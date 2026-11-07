(() => {
  // The existing view router keeps inactive panels detached from the document.
  const panel = japaneseHiraganaPanel;
  if (!panel) return;
  const status = panel.querySelector('#hiragana-status');
  const provider = getJapaneseListeningSpeechProvider();
  const controller = createJapaneseListeningModeSpeechController(provider);
  let activeButton = null;
  let visible = false;

  function clearActive() {
    activeButton?.classList.remove('is-playing');
    activeButton = null;
  }

  function checkVoice() {
    const capability = validateJapaneseJlptListeningCapability(provider);
    if (!capability.ok) {
      status.textContent = capability.code === 'speech-unavailable'
        ? '此瀏覽器不支援語音合成，請改用支援語音功能的瀏覽器或裝置。'
        : '目前沒有可用的日文語音。請在裝置的語音設定安裝或啟用日文語音後重新載入；若語音仍在載入，請稍候再點擊。';
      return false;
    }
    status.textContent = '已備妥日文語音，請點擊平假名聆聽。';
    return true;
  }

  panel.querySelectorAll('[data-hiragana]').forEach((button) => {
    button.addEventListener('click', () => {
      controller.cancel();
      clearActive();
      if (!checkVoice()) return;
      const kana = button.dataset.hiragana;
      activeButton = button;
      button.classList.add('is-playing');
      controller.requestPlayback(kana, kana, (state) => {
        status.textContent = state === 'preparing' ? `準備播放「${kana}」…`
          : state === 'playing' ? `正在播放「${kana}」…`
          : state === 'ended' ? `「${kana}」播放完畢，可點擊其他字或再次播放。`
          : '日文語音播放失敗，請確認裝置音量、語音設定及網路連線後再試。';
        if (state === 'ended' || state === 'error') clearActive();
      });
    });
  });

  window.japaneseHiraganaPage = {
    onViewChange(view) {
      visible = view === 'hiragana';
      controller.cancel();
      clearActive();
      if (visible) {
        checkVoice();
        // The existing navigation attaches the panel after this callback.
        requestAnimationFrame(() => { if (visible) panel.querySelector('h2').focus(); });
      }
    },
  };
  provider.speechSynthesis?.addEventListener('voiceschanged', () => {
    if (visible && !activeButton) checkVoice();
  });
  window.addEventListener('pagehide', () => { controller.cancel(); clearActive(); });
})();
