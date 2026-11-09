const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('japanese/index.html');
const source = read('japanese/katakana.js');
const helper = read('japanese/hiraganaChartAudio.js');
const katakana = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'];
const hiragana = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const files = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
const pageKana = [...html.matchAll(/data-katakana="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(pageKana, katakana, '46 basic katakana in gojuon order');
assert.equal(new Set(pageKana).size, 46);
assert.match(html, /id="japaneseKatakanaPanel" hidden aria-labelledby="katakana-title"/);
assert.match(html, /data-japanese-kana-back="katakanaPracticeMenu"/);
assert.match(html, /data-japanese-kana-entry="katakana"/);
assert.ok(html.indexOf('src="hiraganaChartAudio.js?v=1.0"') < html.indexOf('src="katakana.js?v=1.0"'));
assert.match(html, /src="\.\.\/script.js\?v=4\.15"/);
assert.doesNotMatch(source, /speechSynthesis|SpeechSynthesisUtterance|createHiraganaPlaybackController|new Audio/);

function element(character = '') {
  const classes = new Set();
  return { dataset: { katakana: character }, textContent: '', focused: false,
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    addEventListener(_event, handler) { this.click = handler; }, focus() { this.focused = true; } };
}
function fixture(failure = '') {
  const audio = [], timers = new Map(), frames = [], listeners = {}, rejects = [];
  let id = 0, gesture = false;
  class Audio {
    constructor(src) { this.src = src; this.paused = true; audio.push(this); }
    play() {
      assert.ok(gesture, 'play must run on the original click stack');
      this.paused = false;
      if (failure === 'throw') throw new Error('native failure');
      return failure === 'reject' ? new Promise((_, reject) => rejects.push(reject)) : Promise.resolve();
    }
    pause() { this.paused = true; }
  }
  const keys = katakana.map(element), status = element(), heading = element();
  const panel = { querySelector: (selector) => selector === 'h2' ? heading : status, querySelectorAll: () => keys };
  const window = { setTimeout(callback) { timers.set(++id, callback); return id; }, clearTimeout(key) { timers.delete(key); },
    addEventListener: (event, callback) => { listeners[event] = callback; } };
  // Intentionally no TTS APIs or speech-controller globals: the real shared WAV controller must suffice.
  const context = vm.createContext({ window, URL, Audio, japaneseKatakanaPanel: panel,
    requestAnimationFrame: (callback) => frames.push(callback),
    document: { currentScript: { src: 'https://example.test/nested/japanese/hiraganaChartAudio.js?v=1.0' } } });
  vm.runInContext(helper + '\n' + source, context);
  const show = (view) => { window.japaneseKatakanaPage.onViewChange(view); frames.splice(0).forEach((callback) => callback()); };
  const click = (kana) => { gesture = true; try { keys[katakana.indexOf(kana)].click(); } finally { gesture = false; } };
  return { context, keys, audio, timers, status, heading, rejects, listeners, show, click };
}

(async () => {
  const f = fixture();
  const mapping = vm.runInContext('KATAKANA_TO_HIRAGANA', f.context);
  assert.ok(Object.isFrozen(mapping));
  assert.deepEqual(Object.keys(mapping), katakana);
  assert.deepEqual(Object.values(mapping), hiragana);
  assert.equal(new Set(Object.values(mapping)).size, 46);
  f.click('ア'); assert.equal(f.audio.length, 0, 'inactive page cannot start playback');
  f.show('katakana'); assert.ok(f.heading.focused);
  for (const [index, kana] of katakana.entries()) {
    const expected = `https://example.test/nested/japanese/audio/hiragana/${files[index]}.wav?v=1.0`;
    assert.ok(fs.existsSync(path.join(root, `japanese/audio/hiragana/${files[index]}.wav`)));
    assert.equal(f.context.getKatakanaChartRecordingUrl(kana), expected);
    f.click(kana);
    const audio = f.audio.at(-1);
    assert.equal(audio.src, expected);
    assert.ok(f.keys[index].classList.contains('is-playing'));
    audio.onplaying(); assert.match(f.status.textContent, new RegExp(`正在播放「${kana}」`));
    audio.onended(); assert.match(f.status.textContent, /播放完畢/);
    assert.ok(audio.paused); assert.equal(f.timers.size, 0);
    assert.ok(!f.keys[index].classList.contains('is-playing'));
  }
  for (const unknown of ['ガ', 'パ', 'キャ', 'ヵ', 'あ', 'toString', '__proto__', '']) {
    assert.equal(f.context.getKatakanaChartRecordingUrl(unknown), null);
  }
  f.click('ヲ'); const old = f.audio.at(-1), callbacks = [old.onplaying, old.onended, old.onerror, ...f.timers.values()];
  old.onplaying();
  f.click('ヲ'); assert.ok(old.paused, 'same-character replay stops previous audio');
  f.click('ン'); assert.ok(f.audio.at(-2).paused, 'rapid switch stops replay');
  const latest = f.audio.at(-1), before = f.status.textContent;
  callbacks.forEach((callback) => callback());
  assert.equal(f.status.textContent, before); assert.equal(latest.paused, false);
  assert.ok(f.keys.at(-1).classList.contains('is-playing'));
  latest.onplaying();
  const latestEvents = [latest.onplaying, latest.onended, latest.onerror];
  f.show('katakanaPracticeMenu'); assert.ok(latest.paused); assert.equal(f.timers.size, 0);
  assert.ok(f.keys.every((key) => !key.classList.contains('is-playing')));
  f.show('katakana'); f.click('ア'); const newState = f.status.textContent;
  latestEvents.forEach((callback) => callback()); assert.equal(f.status.textContent, newState);
  for (const target of ['hiragana', 'hiraganaListening', 'home']) {
    f.show('katakana'); f.click('イ'); f.show(target);
    assert.ok(f.audio.at(-1).paused); assert.equal(f.timers.size, 0);
  }
  f.show('katakana'); f.click('ウ'); f.listeners.pagehide();
  assert.ok(f.audio.at(-1).paused); assert.equal(f.timers.size, 0);
  f.click('エ'); f.audio.at(-1).onerror(); assert.match(f.status.textContent, /未能播放/);
  f.click('エ'); f.audio.at(-1).onplaying(); assert.match(f.status.textContent, /正在播放/);
  f.click('オ'); [...f.timers.values()][0](); assert.match(f.status.textContent, /未能播放/); assert.equal(f.timers.size, 0);
  const throwing = fixture('throw'); throwing.show('katakana'); throwing.click('カ'); assert.match(throwing.status.textContent, /未能播放/);
  const rejected = fixture('reject'); rejected.show('katakana'); rejected.click('キ');
  rejected.rejects[0](new Error('rejected')); await Promise.resolve(); assert.match(rejected.status.textContent, /未能播放/);
  rejected.click('ク'); rejected.click('ケ'); const current = rejected.status.textContent;
  rejected.rejects[1](new Error('stale rejection')); await Promise.resolve(); assert.equal(rejected.status.textContent, current);
  console.log('Katakana chart passed: 46 ordered unique kana and explicit hiragana/WAV mappings (ヲ/ン included), no TTS APIs, synchronous playback, replay, rapid switch, return/other-view/pagehide cancellation, stale events/timers/rejections, errors and retry.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
