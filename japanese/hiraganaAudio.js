// Resolve from this script so both hiragana views use the same versioned assets.
const HIRAGANA_RECORDING_BASE = new URL('audio/hiragana/', document.currentScript.src);
const HIRAGANA_RECORDINGS = Object.freeze(Object.fromEntries(
  [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']].map(([kana, name]) =>
    [kana, new URL(`${name}.wav?v=1.0`, HIRAGANA_RECORDING_BASE).href]),
));

function getHiraganaRecordingUrl(kana) {
  return Object.prototype.hasOwnProperty.call(HIRAGANA_RECORDINGS, kana)
    ? HIRAGANA_RECORDINGS[kana] : null;
}

function getHiraganaSpeechOptions() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return { unlockOnGesture: isIOS, startTimeoutMs: 5000, completionTimeoutMs: 10000 };
}

function createHiraganaPlaybackController(provider, speechOptions = {}) {
  const speech = createJapaneseListeningModeSpeechController(provider, speechOptions);
  let activeAudio = null;
  let startTimer = null;
  let generation = 0;

  function clearStartTimer() {
    if (startTimer !== null) provider.clearTimeout(startTimer);
    startTimer = null;
  }

  function stopAudio() {
    generation += 1;
    clearStartTimer();
    const audio = activeAudio;
    activeAudio = null;
    if (audio) {
      audio.onplaying = audio.onended = audio.onerror = null;
      audio.pause();
    }
  }

  function cancel() {
    stopAudio();
    speech.cancel();
  }

  return {
    cancel,
    requestPlayback(itemId, kana, onStatus) {
      cancel();
      const source = getHiraganaRecordingUrl(kana);
      if (!source) return speech.requestPlayback(itemId, kana, onStatus);
      const token = generation;
      let audio;
      const isCurrent = () => token === generation && activeAudio === audio;
      const finish = (state) => {
        if (!isCurrent()) return;
        stopAudio();
        onStatus(state);
      };
      onStatus('preparing');
      try {
        audio = new Audio(source);
        activeAudio = audio;
        audio.onplaying = () => {
          if (!isCurrent()) return;
          clearStartTimer();
          onStatus('playing');
        };
        audio.onended = () => finish('ended');
        audio.onerror = () => finish('error');
        startTimer = provider.setTimeout(() => finish('timeout'), 5000);
        // Keep play() on the original click stack for mobile browser gestures.
        const playback = audio.play();
        playback?.catch(() => finish('error'));
      } catch (_error) {
        cancel();
        onStatus('error');
        return false;
      }
      return true;
    },
  };
}
