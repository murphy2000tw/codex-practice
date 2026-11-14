const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'japanese/hiraganaAudio.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'japanese/audio/hiragana/manifest.json')));
const vowels = ['あ', 'い', 'う', 'え', 'お'];
assert.deepEqual(manifest.segments.slice(0, 5).map((segment) => segment.kana), vowels);
// The legacy helper remains unchanged; the drill now uses the chart recording controller.
assert.deepEqual(manifest.segments.slice(0, 5).map((segment) => segment.file).sort(),
  ['a.wav', 'e.wav', 'i.wav', 'o.wav', 'u.wav']);

// Parse RIFF chunks rather than assuming a fixed WAV header length.
for (const segment of manifest.segments) {
  const wav = fs.readFileSync(path.join(root, 'japanese/audio/hiragana', segment.file));
  assert.equal(createHash('sha256').update(wav).digest('hex'), segment.sha256);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  let format, samples;
  for (let offset = 12; offset + 8 <= wav.length;) {
    const size = wav.readUInt32LE(offset + 4);
    const data = wav.subarray(offset + 8, offset + 8 + size);
    if (wav.toString('ascii', offset, offset + 4) === 'fmt ') format = data;
    if (wav.toString('ascii', offset, offset + 4) === 'data') samples = data;
    offset += 8 + size + (size % 2);
  }
  assert.ok(format && samples);
  assert.equal(format.readUInt16LE(0), 1, 'PCM');
  assert.equal(format.readUInt16LE(2), 1, 'mono');
  assert.equal(format.readUInt32LE(4), 48000);
  assert.equal(format.readUInt16LE(14), 16);
  const count = samples.length / 2;
  assert.ok(Math.abs(count / 48000 - segment.durationSeconds) < 1 / 48000);
  assert.ok(Math.abs(segment.endSeconds - segment.startSeconds - segment.durationSeconds) < 1e-9);
  const rms = (from, to) => {
    let sum = 0;
    for (let index = from; index < to; index++) sum += (samples.readInt16LE(index * 2) / 32768) ** 2;
    return Math.sqrt(sum / (to - from));
  };
  assert.ok(rms(0, 2400) < 0.005, `${segment.kana}: quiet first 50 ms`);
  assert.ok(rms(count - 2400, count) < 0.005, `${segment.kana}: quiet last 50 ms`);
  assert.ok(rms(0, count) > 0.01, `${segment.kana}: audible content`);
}

function fixture({ failure = null } = {}) {
  const audios = [], statuses = [], speechCalls = [], timers = new Map();
  let timerId = 0, speechOptions, speechCancels = 0, reject;
  class Audio {
    constructor(src) { this.src = src; this.paused = false; audios.push(this); }
    play() {
      this.played = true;
      if (failure === 'throw') throw new Error('play failed');
      return failure === 'reject' ? new Promise((_, fail) => { reject = fail; }) : Promise.resolve();
    }
    pause() { this.paused = true; }
  }
  const provider = {
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  const context = vm.createContext({
    URL, Audio,
    document: { currentScript: { src: 'https://example.test/nested/japanese/hiraganaAudio.js?v=1.0' } },
    createJapaneseListeningModeSpeechController(receivedProvider, options) {
      assert.equal(receivedProvider, provider);
      speechOptions = options;
      return { cancel() { speechCancels++; }, requestPlayback(...args) { speechCalls.push(args); return true; } };
    },
  });
  vm.runInContext(source, context);
  const options = { unlockOnGesture: true, startTimeoutMs: 5000 };
  const controller = context.createHiraganaPlaybackController(provider, options);
  assert.equal(speechOptions, options, 'preserve TTS iOS options');
  return { context, controller, audios, statuses, speechCalls, timers,
    play: (kana) => controller.requestPlayback('question-id', kana, (state) => statuses.push(state)),
    reject: () => reject(new Error('play rejected')), speechCancels: () => speechCancels };
}

(async () => {
  const f = fixture();
  const allKana = [...html.matchAll(/data-hiragana="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(allKana.length, 46);
  for (const kana of [...allKana, 'が', 'ぱ', 'きゃ', 'ア', 'toString']) {
    assert.equal(Boolean(f.context.getHiraganaRecordingUrl(kana)), vowels.includes(kana));
  }
  for (const [index, kana] of vowels.entries()) {
    assert.equal(f.play(kana), true);
    const audio = f.audios.at(-1);
    assert.equal(audio.src, `https://example.test/nested/japanese/audio/hiragana/${manifest.segments[index].file}?v=${manifest.segments[index].assetVersion}`);
    assert.ok(audio.played, 'play runs synchronously inside the gesture');
    assert.equal(f.statuses.at(-1), 'preparing');
    audio.onplaying();
    assert.equal(f.statuses.at(-1), 'playing');
    assert.equal(f.timers.size, 0);
    audio.onended();
    assert.equal(f.statuses.at(-1), 'ended');
    assert.ok(audio.paused);
  }
  assert.equal(f.speechCalls.length, 0, 'recordings never invoke TTS');
  for (const kana of allKana.filter((kana) => !vowels.includes(kana))) f.play(kana);
  assert.equal(f.speechCalls.length, 41);
  assert.deepEqual(f.speechCalls.map((call) => call[1]), allKana.slice(5));

  f.play('あ');
  const old = f.audios.at(-1), lateEnd = old.onended, latePlay = old.onplaying;
  f.play('い');
  assert.ok(old.paused);
  const statusCount = f.statuses.length;
  lateEnd(); latePlay();
  assert.equal(f.statuses.length, statusCount, 'old events cannot change a newer playback');
  f.controller.cancel();
  assert.ok(f.audios.at(-1).paused);
  assert.equal(f.timers.size, 0);
  f.play('う'); f.audios.at(-1).onerror();
  assert.equal(f.statuses.at(-1), 'error');
  assert.equal(f.timers.size, 0);
  f.play('え'); [...f.timers.values()][0]();
  assert.equal(f.statuses.at(-1), 'timeout');
  assert.ok(f.audios.at(-1).paused);
  assert.equal(f.timers.size, 0);
  f.play('お'); f.play('か');
  assert.ok(f.audios.at(-1).paused, 'switching to TTS stops the recording');

  const throwing = fixture({ failure: 'throw' });
  assert.equal(throwing.play('あ'), false);
  assert.equal(throwing.statuses.at(-1), 'error');
  assert.equal(throwing.timers.size, 0);
  const rejected = fixture({ failure: 'reject' });
  rejected.play('い'); rejected.reject(); await Promise.resolve();
  assert.equal(rejected.statuses.at(-1), 'error');
  const stale = fixture({ failure: 'reject' });
  stale.play('あ'); stale.controller.cancel(); stale.reject(); await Promise.resolve();
  assert.deepEqual(stale.statuses, ['preparing'], 'cancelled rejection is ignored');

  const sharedIndex = html.indexOf('src="hiraganaAudio.js?v=1.1"');
  assert.ok(sharedIndex > 0);
  assert.ok(html.indexOf('src="hiragana.js?v=1.3"') > sharedIndex);
  assert.ok(html.indexOf('src="hiraganaListening.js?v=1.7"') > sharedIndex);
  console.log('Legacy hiragana helper checks passed: 46 PCM assets validated; unused legacy five-vowel map and 41 TTS routes, synchronous gesture play, replay/cancellation, stale events, errors and startup timeout.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
