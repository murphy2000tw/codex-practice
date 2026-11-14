const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const main = read('script.js');
const controllerSource = main.slice(main.indexOf('function createJapaneseListeningModeSpeechController('),
  main.indexOf('function getJapaneseListeningSpeechProvider('));
const html = read('japanese/index.html');
assert.ok(html.indexOf('hiraganaChartAudio.js?v=1.0') < html.indexOf('hiraganaListening.js?v=1.6'));
const kana = [...read('japanese/index.html').matchAll(/data-hiragana="([^"]+)"/g)].map((match) => match[1]);

class Element {
  constructor(text = '') {
    this.textContent = text; this.children = []; this.listeners = {}; this.dataset = {};
    const classes = new Set();
    this.classList = { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) };
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  focus() {}
  appendChild(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  querySelectorAll() { return this.children; }
}

function fixture({ ios = true, touchMac = false, silentDrop = false, missingEnd = false, fail = false, synchronousCancel = false } = {}) {
  let now = 0, id = 0, gesture = false, unlocked = !ios, current = null;
  const timers = new Map(), savedCallbacks = [], spoken = [], audible = [], cancels = [], audio = [], events = [];
  const setTimeout = (callback, delay) => { timers.set(++id, { callback, due: now + delay }); savedCallbacks.push(callback); return id; };
  const clearTimeout = (key) => timers.delete(key);
  function tick(ms) {
    const target = now + ms;
    for (;;) {
      const next = [...timers].sort((a, b) => a[1].due - b[1].due || a[0] - b[0]).find(([, task]) => task.due <= target);
      if (!next) break;
      now = next[1].due; timers.delete(next[0]); next[1].callback();
    }
    now = target;
  }
  const voice = { lang: 'ja-JP', name: 'test Japanese' };
  class Utterance { constructor(text) { this.text = text; this.volume = 1; } }
  const synthesis = {
    getVoices: () => [voice], addEventListener() {},
    speak(u) {
      if (gesture) unlocked = true;
      spoken.push({ u, at: now, gesture });
      if (!unlocked || silentDrop) return;
      current = u;
      if (u.text === '') return; // A native empty unlock may omit all completion events.
      if (fail) { setTimeout(() => u.onerror?.(), 1); return; }
      u.onstart?.();
      setTimeout(() => { if (current === u) audible.push(u.text); }, 10);
      if (!missingEnd) setTimeout(() => { if (current === u) { current = null; u.onend?.(); } }, 40);
    },
    cancel() {
      const cancelled = current;
      cancels.push(now);
      // Model the WebKit/native cancellation hazard: cleanup is asynchronous and
      // can clear the new current native utterance if speak follows in the same task.
      const complete = () => { current = null; cancelled?.onerror?.(); };
      if (synchronousCancel) complete(); else setTimeout(complete, 0);
    },
  };
  class Audio {
    constructor(src) { this.src = src; this.paused = true; audio.push(this); }
    play() { assert.ok(gesture, 'HTML Audio must play on the click stack'); this.paused = false; if (fail) { this.onerror?.(); return Promise.resolve(); } if (silentDrop) return Promise.resolve(); this.onplaying?.(); if (!missingEnd) setTimeout(() => { if (!this.paused) this.onended?.(); }, 30); return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const keys = kana.map((character) => { const key = new Element(character); key.dataset.hiragana = character; return key; });
  const chartStatus = new Element(), title = new Element();
  const chart = { querySelector: (selector) => selector === 'h2' ? title : chartStatus, querySelectorAll: () => keys };
  const controls = Object.fromEntries(['play', 'status', 'question', 'options', 'feedback', 'next'].map((name) => [name, new Element()]));
  const listening = { querySelector: (selector) => controls[selector.replace('#hiragana-listening-', '')] };
  const provider = { speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance, setTimeout, clearTimeout };
  const window = { setTimeout, clearTimeout, addEventListener: (name, handler) => events.push({ name, handler }) };
  const math = Object.create(Math); math.random = () => 0.999999;
  const context = vm.createContext({ window, provider, navigator: { userAgent: ios ? 'iPhone' : 'Desktop', platform: touchMac ? 'MacIntel' : '', maxTouchPoints: touchMac ? 5 : 0 },
    URL, Audio, Math: math, requestAnimationFrame: (callback) => callback(),
    document: { currentScript: { src: 'https://example.test/japanese/hiraganaAudio.js' }, createElement: () => new Element() },
    japaneseHiraganaPanel: chart, japaneseHiraganaListeningPanel: listening,
    getJapaneseListeningSpeechProvider: () => provider, validateJapaneseJlptListeningCapability: () => ({ ok: true }),
  });
  const chartAudio = read('japanese/hiraganaChartAudio.js');
  vm.runInContext(controllerSource + read('japanese/hiraganaAudio.js') + chartAudio + read('japanese/hiragana.js') + read('japanese/hiraganaListening.js'), context);
  const click = (button) => { gesture = true; try { button.click(); } finally { gesture = false; } };
  const show = (view) => { window.japaneseHiraganaPage.onViewChange(view); window.japaneseHiraganaListeningPage.onViewChange(view); };
  const advance = (answer) => { click(controls.options.children.find((button) => button.textContent === answer)); click(controls.next); };
  return { context, provider, tick, show, click, advance, keys, controls, chartStatus, spoken, audible, cancels, timers, savedCallbacks, audio,
    recover: () => { fail = false; silentDrop = false; },
    pagehide: () => events.filter((event) => event.name === 'pagehide').forEach((event) => event.handler()),
    key: (character) => keys.find((key) => key.dataset.hiragana === character),
  };
}

let failures = 0;
function test(name, run) {
  try { run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}

const manifest = JSON.parse(read('japanese/audio/hiragana/manifest.json'));

test('all 46 listening questions use confirmed URLs synchronously, replay, feedback and next; zero TTS', () => {
  for (const ios of [true, false]) {
    const f = fixture({ ios }); f.show('hiraganaListening');
    for (const [index, character] of kana.entries()) {
      for (let replay = 0; replay < 2; replay++) {
        f.click(f.controls.play);
        assert.equal(f.audio.at(-1).src, `https://example.test/japanese/audio/hiragana/${manifest.segments[index].file}?v=${manifest.segments[index].assetVersion}`);
        f.tick(30);
        assert.match(f.controls.status.textContent, /播放完畢/);
        assert.ok(!f.controls.play.classList.contains('is-playing'));
      }
      const choices = f.controls.options.children;
      assert.equal(choices.length, 4);
      // Exercise incorrect feedback as well as correct feedback.
      f.click(choices.find(button => index % 2 ? button.textContent !== character : button.textContent === character));
      assert.match(f.controls.feedback.textContent, index % 2 ? /答錯了/ : /答對了/);
      assert.ok(choices.every(button => button.disabled));
      assert.equal(f.controls.next.hidden, false);
      f.click(f.controls.next);
    }
    assert.equal(f.spoken.length, 0);
    assert.equal(f.timers.size, 0);
  }
});

test('rapid replay, next question, feature switch, home and pagehide isolate old audio events', () => {
  for (const action of ['replay', 'next', 'chart', 'home', 'pagehide']) {
    const f = fixture(); f.show('hiraganaListening'); f.click(f.controls.play);
    const old = f.audio.at(-1), callbacks = [old.onplaying, old.onended, old.onerror];
    if (action === 'replay') f.click(f.controls.play);
    if (action === 'next') { f.advance('あ'); f.click(f.controls.play); }
    if (action === 'chart') { f.show('hiragana'); f.click(f.key('か')); }
    if (action === 'home') f.show('home');
    if (action === 'pagehide') f.pagehide();
    assert.ok(old.paused, action);
    assert.equal(old.onended, null);
    const status = f.controls.status.textContent;
    callbacks.forEach(callback => callback());
    assert.equal(f.controls.status.textContent, status, action);
    f.tick(30);
    assert.ok(!f.controls.play.classList.contains('is-playing'));
    assert.equal(f.spoken.length, 0);
    f.show('hiraganaListening'); f.click(f.controls.play); f.tick(30);
    assert.match(f.controls.status.textContent, /播放完畢/);
  }
});

test('load error and missing start show understandable retry feedback and clear playback state', () => {
  for (const failure of ['fail', 'silentDrop']) {
    const f = fixture({ [failure]: true }); f.show('hiraganaListening');
    for (let attempt = 0; attempt < 2; attempt++) {
      f.click(f.controls.play); f.tick(5001);
      assert.match(f.controls.status.textContent, /錄音未能播放.*重試/);
      assert.ok(!f.controls.play.classList.contains('is-playing'));
      assert.ok(f.audio.at(-1).paused);
      assert.equal(f.timers.size, 0);
    }
    assert.equal(f.audio.length, 2, 'retry creates a fresh audio request');
    f.recover(); f.click(f.controls.play); f.tick(30);
    assert.match(f.controls.status.textContent, /播放完畢/);
    assert.equal(f.audio.length, 3);
    assert.equal(f.spoken.length, 0, 'errors never fall back to TTS');
  }
});

test('general listening defaults: 1000ms preparation, no unlock, no completion limit, no unowned cancellation', () => {
  const f = fixture({ ios: false, missingEnd: true });
  const controller = f.context.createJapaneseListeningModeSpeechController(f.provider);
  const status = [];
  controller.requestPlayback('sentence', '今日は雨です。', (state) => status.push(state));
  f.tick(999); assert.equal(f.spoken.length, 0);
  f.tick(1); assert.deepEqual(status, ['preparing', 'playing']);
  assert.equal(f.spoken.length, 1);
  f.tick(30000); assert.equal(f.cancels.length, 0, 'hiragana completion deadline leaked into sentences');
  f.spoken.at(-1).u.onend(); assert.equal(status.at(-1), 'ended');
  controller.cancel(); assert.equal(f.cancels.length, 0);
});

if (failures) process.exitCode = 1;
else console.log('Hiragana listening recording integration and general TTS regression passed (simulation cannot replace physical iPhone Safari listening).');
