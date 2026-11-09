// Chart-only recording map. The listening drill keeps hiraganaAudio.js unchanged.
const HIRAGANA_CHART_AUDIO_BASE = new URL('audio/hiragana/', document.currentScript.src);
const HIRAGANA_CHART_AUDIO_FILES = Object.freeze({
  'あ': 'a.wav',
  'い': 'i.wav',
  'う': 'u.wav',
  'え': 'e.wav',
  'お': 'o.wav',
  'か': 'ka.wav',
  'き': 'ki.wav',
  'く': 'ku.wav',
  'け': 'ke.wav',
  'こ': 'ko.wav',
  'さ': 'sa.wav',
  'し': 'shi.wav',
  'す': 'su.wav',
  'せ': 'se.wav',
  'そ': 'so.wav',
  'た': 'ta.wav',
  'ち': 'chi.wav',
  'つ': 'tsu.wav',
  'て': 'te.wav',
  'と': 'to.wav',
  'な': 'na.wav',
  'に': 'ni.wav',
  'ぬ': 'nu.wav',
  'ね': 'ne.wav',
  'の': 'no.wav',
  'は': 'ha.wav',
  'ひ': 'hi.wav',
  'ふ': 'fu.wav',
  'へ': 'he.wav',
  'ほ': 'ho.wav',
  'ま': 'ma.wav',
  'み': 'mi.wav',
  'む': 'mu.wav',
  'め': 'me.wav',
  'も': 'mo.wav',
  'や': 'ya.wav',
  'ゆ': 'yu.wav',
  'よ': 'yo.wav',
  'ら': 'ra.wav',
  'り': 'ri.wav',
  'る': 'ru.wav',
  'れ': 're.wav',
  'ろ': 'ro.wav',
  'わ': 'wa.wav',
  'を': 'wo.wav',
  'ん': 'n.wav',
});

function getHiraganaChartRecordingUrl(kana) {
  return Object.prototype.hasOwnProperty.call(HIRAGANA_CHART_AUDIO_FILES, kana)
    ? new URL(`${HIRAGANA_CHART_AUDIO_FILES[kana]}?v=1.0`, HIRAGANA_CHART_AUDIO_BASE).href : null;
}

function createHiraganaChartPlaybackController(provider) {
  let activeAudio = null;
  let timer = null;
  let generation = 0;
  function clearTimer() {
    if (timer !== null) provider.clearTimeout(timer);
    timer = null;
  }
  function cancel() {
    generation += 1;
    clearTimer();
    const audio = activeAudio;
    activeAudio = null;
    if (audio) {
      audio.onplaying = audio.onended = audio.onerror = null;
      audio.pause();
    }
  }
  return {
    cancel,
    requestPlayback(_itemId, kana, onStatus) {
      cancel();
      const source = getHiraganaChartRecordingUrl(kana);
      if (!source) { onStatus('error'); return false; }
      const token = generation;
      let audio;
      const isCurrent = () => token === generation && activeAudio === audio;
      const finish = (state) => {
        if (!isCurrent()) return;
        cancel();
        onStatus(state);
      };
      onStatus('preparing');
      try {
        audio = new Audio(source);
        activeAudio = audio;
        audio.onplaying = () => {
          if (!isCurrent()) return;
          clearTimer();
          onStatus('playing');
        };
        audio.onended = () => finish('ended');
        audio.onerror = () => finish('error');
        timer = provider.setTimeout(() => finish('timeout'), 5000);
        // Preserve the click gesture for iOS HTML Audio playback.
        audio.play()?.catch(() => finish('error'));
      } catch (_error) {
        cancel();
        onStatus('error');
        return false;
      }
      return true;
    },
  };
}
