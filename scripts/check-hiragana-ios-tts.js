const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const baseline = process.argv.includes('--baseline');
const read = (name) => baseline
  ? execFileSync('git', ['show', `origin/main:${name}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, name), 'utf8');
const main = read('script.js');
const controllerSource = main.slice(main.indexOf('function createJapaneseListeningModeSpeechController('),
  main.indexOf('function getJapaneseListeningSpeechProvider('));
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
    play() { this.paused = false; this.onplaying?.(); setTimeout(() => { if (!this.paused) this.onended?.(); }, 30); return Promise.resolve(); }
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
  vm.runInContext(controllerSource + read('japanese/hiraganaAudio.js') + read('japanese/hiragana.js') + read('japanese/hiraganaListening.js'), context);
  const click = (button) => { gesture = true; try { button.click(); } finally { gesture = false; } };
  const show = (view) => { window.japaneseHiraganaPage.onViewChange(view); window.japaneseHiraganaListeningPage.onViewChange(view); };
  const advance = (answer) => { click(controls.options.children.find((button) => button.textContent === answer)); click(controls.next); };
  return { context, provider, tick, show, click, advance, keys, controls, chartStatus, spoken, audible, cancels, timers, savedCallbacks, audio,
    pagehide: () => events.filter((event) => event.name === 'pagehide').forEach((event) => event.handler()),
    key: (character) => keys.find((key) => key.dataset.hiragana === character),
  };
}

let failures = 0;
function test(name, run) {
  try { run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}

test('iPhone chart: all 41 TTS kana unlock on the gesture stack, wait 1000ms, produce simulated audio and end', () => {
  const f = fixture(); f.show('hiragana');
  for (const character of kana.slice(5)) {
    const count = f.audible.length;
    f.click(f.key(character));
    const unlock = f.spoken.at(-1);
    assert.ok(unlock && unlock.gesture && unlock.u.text === '', `${character}: missing synchronous unlock`);
    assert.equal(unlock.u.volume, 0);
    f.tick(999); assert.equal(f.audible.length, count);
    f.tick(1); assert.equal(f.spoken.at(-1).u.text, character);
    assert.equal(f.spoken.at(-1).u.volume, 1);
    f.tick(40); assert.equal(f.audible.at(-1), character);
    assert.match(f.chartStatus.textContent, /播放完畢/);
    assert.ok(!f.key(character).classList.contains('is-playing'));
    assert.equal(f.timers.size, 0);
  }
});

test('iPhone listening: asynchronous unlock cancellation drains before the answer; no phantom playing state', () => {
  const f = fixture(); f.show('hiraganaListening');
  kana.slice(0, 5).forEach((character) => f.advance(character));
  f.click(f.controls.play); f.tick(1040);
  assert.equal(f.audible.at(-1), 'か', `audible=${f.audible}; status=${f.controls.status.textContent}; cancel times=${f.cancels}`);
  assert.equal(f.controls.status.textContent, '播放完畢，可再次播放。');
  assert.ok(!f.controls.play.classList.contains('is-playing'));
  assert.deepEqual(f.cancels, [0], 'unlock cancel must occur at the click, not at 1000ms');
  assert.equal(f.timers.size, 0);
});

test('both views preserve the five WAVs; replay, WAV/TTS transitions and stale callbacks cannot cancel new TTS', () => {
  const f = fixture(); f.show('hiragana');
  for (const character of kana.slice(0, 5)) { f.click(f.key(character)); f.tick(30); }
  assert.equal(f.spoken.length, 0);
  assert.deepEqual(f.audio.map((entry) => entry.src.split('/').at(-1)), ['a.wav?v=1.0', 'i.wav?v=1.0', 'u.wav?v=1.0', 'e.wav?v=1.0', 'o.wav?v=1.0']);
  f.click(f.key('あ')); const oldEnd = f.audio.at(-1).onended;
  f.click(f.key('か')); oldEnd(); f.tick(1040);
  assert.equal(f.audible.at(-1), 'か');
  f.click(f.key('か')); f.tick(1000); const oldSpeech = f.spoken.at(-1).u;
  f.click(f.key('い')); assert.ok(f.audio.at(-1)); f.tick(30);
  f.click(f.key('き')); oldSpeech.onend(); oldSpeech.onerror(); oldSpeech.onstart(); f.tick(1040);
  assert.equal(f.audible.at(-1), 'き');
  assert.match(f.chartStatus.textContent, /「き」播放完畢/);
  f.click(f.key('か')); f.click(f.key('き')); f.tick(1040);
  assert.equal(f.audible.at(-1), 'き', 'rapid preparation replay lost the newer request');
  f.click(f.key('か')); f.tick(1000); f.click(f.key('き')); f.tick(1040);
  assert.equal(f.audible.at(-1), 'き', 'native cancellation of playing speech lost the newer request');
  f.show('hiraganaListening');
  for (const character of kana.slice(0, 5)) { f.click(f.controls.play); f.tick(30); f.advance(character); }
  f.click(f.controls.play); f.tick(1040);
  assert.equal(f.audible.at(-1), 'か');
});

test('preparation/playing cancellation, question changes, home/re-entry and pagehide invalidate old callbacks', () => {
  const f = fixture(); f.show('hiraganaListening'); kana.slice(0, 5).forEach((character) => f.advance(character));
  f.click(f.controls.play); f.tick(999); f.advance('か'); f.tick(41);
  assert.equal(f.audible.length, 0, 'old question spoke after next');
  f.click(f.controls.play); f.tick(1000); const old = f.spoken.at(-1).u;
  f.show('home'); f.tick(40); old.onend(); old.onerror();
  assert.equal(f.audible.length, 0);
  f.show('hiragana'); f.click(f.key('く')); f.pagehide(); f.tick(1040);
  assert.equal(f.audible.length, 0);
  f.show('hiragana'); f.click(f.key('け')); f.tick(1040);
  assert.equal(f.audible.at(-1), 'け');
  assert.equal(f.timers.size, 0);
});

test('native error, missing start, and missing end clear UI/timers; normal completion uses no recovery timeout', () => {
  for (const failure of ['fail', 'silentDrop', 'missingEnd']) {
    const f = fixture({ [failure]: true }); f.show('hiragana'); f.click(f.key('か')); f.tick(11001);
    assert.ok(!f.key('か').classList.contains('is-playing'), failure);
    assert.doesNotMatch(f.chartStatus.textContent, /正在播放/, failure);
    assert.equal(f.timers.size, 0, failure);
  }
});

test('synchronous native cancellation and touch-enabled Mac/iPad detection', () => {
  const f = fixture({ ios: false, touchMac: true, synchronousCancel: true }); f.show('hiragana');
  f.click(f.key('か')); assert.equal(f.spoken[0].u.text, ''); f.tick(1040);
  assert.equal(f.audible.at(-1), 'か');
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
else console.log('Hiragana iOS TTS regression passed (native ordering model; not an iPhone audio engine).');
