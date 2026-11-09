const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'japanese/audio/hiragana');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json')));
const kana = [...html.matchAll(/data-hiragana="([^"]+)"/g)].map(match => match[1]);
const source = fs.readFileSync(path.join(root, 'japanese/hiraganaChartAudio.js'), 'utf8');
const originalHashes = {
  'a.wav': '3cfcfb1b8f6bef6becaa301470ad2f1bed7e6b2a6b96641f1c79679ea5c4fec4',
  'i.wav': '100e7231cd0727aa3137e6835a500d687b0c61b5419dc366f57d165ac2712e70',
  'u.wav': '7c80cd77b40c0a6c29cff8f5a90edf5667eef6a36406b078feb0ce253689da65',
  'e.wav': '158e6b346861a91ccb5cee057af9a3fa6e7bffb6352ad19eb7da0478eb0c3640',
  'o.wav': 'e93c9ca882b63a90686699e3c79d5b0c55451077db4df43c33fca3b9bb83835b',
};
assert.equal(kana.length, 46);
assert.equal(manifest.completedCount, 46);
assert.equal(manifest.newClipCount, 41);
assert.deepEqual(manifest.unconfirmedSegments, []);
assert.deepEqual(manifest.segments.map(segment => segment.kana), kana);
assert.deepEqual(manifest.playbackScope.pronunciation, kana);
assert.deepEqual(manifest.playbackScope.hiraganaListening, kana.slice(0, 5));
assert.deepEqual(fs.readdirSync(folder).filter(name => name.endsWith('.wav')).sort(), manifest.segments.map(segment => segment.file).sort());
assert.equal(new Set(manifest.segments.map(segment => segment.file)).size, 46);
let previousEnd = 0;
for (const [index, segment] of manifest.segments.entries()) {
  assert.equal(segment.index, index + 1);
  assert.ok(segment.startSeconds > previousEnd);
  assert.ok(segment.startSeconds < segment.speechStartSeconds);
  assert.ok(segment.endSeconds > segment.speechEndSeconds);
  assert.ok(segment.durationSeconds >= .6 && segment.durationSeconds <= 1.3);
  assert.ok(Math.abs(segment.endSeconds - segment.startSeconds - segment.durationSeconds) < 1e-8);
  previousEnd = segment.endSeconds;
  const wav = fs.readFileSync(path.join(folder, segment.file));
  const hash = createHash('sha256').update(wav).digest('hex');
  assert.equal(hash, segment.sha256);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.readUInt32LE(4) + 8, wav.length, 'complete RIFF container');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  let format, pcm;
  for (let offset = 12; offset + 8 <= wav.length;) {
    const size = wav.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + size <= wav.length);
    const name = wav.toString('ascii', offset, offset + 4);
    if (name === 'fmt ') format = wav.subarray(offset + 8, offset + 8 + size);
    if (name === 'data') pcm = wav.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  assert.ok(format && pcm);
  assert.deepEqual([format.readUInt16LE(0), format.readUInt16LE(2), format.readUInt32LE(4), format.readUInt16LE(14)], [1, 1, 48000, 16]);
  const count = pcm.length / 2;
  assert.ok(Math.abs(count / 48000 - segment.durationSeconds) < 1 / 48000);
  const rms = (from, to) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += (pcm.readInt16LE(i * 2) / 32768) ** 2;
    return Math.sqrt(sum / (to - from));
  };
  assert.ok(rms(0, 2400) < .005, segment.file + ': quiet first 50ms');
  assert.ok(rms(count - 2400, count) < .005, segment.file + ': quiet last 50ms');
  assert.ok(rms(0, count) > .01, segment.file + ': audible signal');
  for (let i = 0; i < count; i++) assert.ok(Math.abs(pcm.readInt16LE(i * 2)) / 32768 < 10 ** (-3 / 20), segment.file + ': peak ceiling');
  if (index < 5) {
    assert.equal(hash, originalHashes[segment.file], 'retained original vowel bytes');
    assert.equal(segment.gainDb, 0);
    assert.ok(segment.preservedFromPR318);
  } else {
    assert.deepEqual(segment.usedBy, ['pronunciation']);
    assert.ok(Math.abs(segment.outputActiveRmsDbfs + 24) < .001);
    assert.ok(Math.abs(segment.sourceActiveRmsDbfs + segment.gainDb - segment.outputActiveRmsDbfs) < .001);
  }
}

function fixture(failure = null) {
  const audios = [], states = [], timers = new Map();
  let id = 0, reject;
  class Audio {
    constructor(src) { this.src = src; this.paused = false; audios.push(this); }
    play() {
      this.played = true;
      if (failure === 'throw') throw new Error('native play failed');
      return failure === 'reject' ? new Promise((_, fail) => { reject = fail; }) : Promise.resolve();
    }
    pause() { this.paused = true; }
  }
  const provider = {setTimeout(callback) {timers.set(++id, callback); return id;}, clearTimeout(key) {timers.delete(key);}};
  const context = vm.createContext({URL, Audio, document: {currentScript: {src: 'https://example.test/nested/japanese/hiraganaChartAudio.js?v=1.0'}}});
  // No SpeechSynthesis or speech-controller globals exist in this fixture.
  vm.runInContext(source, context);
  const controller = context.createHiraganaChartPlaybackController(provider);
  return {context, controller, audios, states, timers, reject: () => reject(new Error('rejected')),
    play: character => controller.requestPlayback(character, character, state => states.push(state))};
}

(async () => {
  const f = fixture();
  for (const [index, character] of kana.entries()) {
    assert.ok(f.play(character));
    const audio = f.audios.at(-1);
    assert.equal(audio.src, `https://example.test/nested/japanese/audio/hiragana/${manifest.segments[index].file}?v=1.0`);
    assert.ok(audio.played, 'play must be synchronous in the click stack');
    audio.onplaying(); audio.onended();
    assert.deepEqual(f.states.slice(-3), ['preparing', 'playing', 'ended']);
    assert.ok(audio.paused); assert.equal(f.timers.size, 0);
  }
  for (const unknown of ['が', 'ぱ', 'きゃ', 'ア', 'toString']) {
    assert.equal(f.context.getHiraganaChartRecordingUrl(unknown), null);
    const before = f.audios.length;
    assert.equal(f.play(unknown), false); assert.equal(f.states.at(-1), 'error');
    assert.equal(f.audios.length, before);
  }
  f.play('か'); const old = f.audios.at(-1), oldEnd = old.onended, oldStart = old.onplaying, oldError = old.onerror;
  f.play('き'); const before = f.states.length;
  assert.ok(old.paused); oldEnd(); oldStart(); oldError(); assert.equal(f.states.length, before);
  f.controller.cancel(); assert.ok(f.audios.at(-1).paused); assert.equal(f.timers.size, 0);
  f.play('く'); f.audios.at(-1).onerror(); assert.equal(f.states.at(-1), 'error');
  f.play('け'); [...f.timers.values()][0](); assert.equal(f.states.at(-1), 'timeout');
  assert.ok(f.audios.at(-1).paused); assert.equal(f.timers.size, 0);
  const throwing = fixture('throw'); assert.equal(throwing.play('こ'), false); assert.equal(throwing.states.at(-1), 'error');
  const rejected = fixture('reject'); rejected.play('さ'); rejected.reject(); await Promise.resolve(); assert.equal(rejected.states.at(-1), 'error');
  const stale = fixture('reject'); stale.play('し'); stale.controller.cancel(); stale.reject(); await Promise.resolve(); assert.deepEqual(stale.states, ['preparing']);
  assert.ok(html.indexOf('src="hiraganaChartAudio.js?v=1.0"') < html.indexOf('src="hiragana.js?v=1.3"'));
  console.log('Hiragana chart checks passed: all 46 WAV mappings, source intervals, format/duration/hash/boundaries/levels, five original byte hashes, synchronous HTML Audio only, replay/cancel/stale events/errors; no extra kana.');
})().catch(error => {console.error(error); process.exitCode = 1;});
