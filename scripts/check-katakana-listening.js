const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('japanese/katakanaListening.js');
const html = read('japanese/index.html');
const kana = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'];
const files = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
const engine = vm.createContext({ japaneseKatakanaListeningPanel: null });
vm.runInContext(source, engine);
const { createKatakanaListeningDeck: createDeck, buildKatakanaListeningQuestion: build } = engine;
const sorted = [...kana].sort();
for (let seed = 1; seed <= 5; seed++) {
  let state = seed;
  const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const deck = createDeck(kana, random);
  let previous = null;
  const orders = new Set();
  for (let round = 0; round < 100; round++) {
    const answers = Array.from({ length: 46 }, () => deck.next());
    assert.deepEqual([...answers].sort(), sorted);
    assert.equal(new Set(answers).size, 46);
    assert.notEqual(answers[0], previous);
    orders.add(answers.join('')); previous = answers.at(-1);
  }
  assert.ok(orders.size > 1);
}
let draws = 0;
const collision = createDeck(kana, () => draws++ === 45 ? 0 : 0.999999);
const first = Array.from({ length: 46 }, () => collision.next());
const second = Array.from({ length: 46 }, () => collision.next());
assert.deepEqual(first, kana);
assert.notEqual(first.at(-1), second[0]); assert.deepEqual([...second].sort(), sorted);
assert.equal(draws, 91, 'collision must trigger an extra random swap');
const reset = createDeck(kana, () => 0.999999);
assert.equal(reset.next(), 'ア'); reset.reset(); assert.equal(reset.next(), 'ア', 'reset clears the previous-answer constraint');
let seed = 313;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const positionCounts = [0, 0, 0, 0];
for (const answer of kana) {
  const positions = new Set(), distractors = new Set(), counts = [0, 0, 0, 0];
  for (let trial = 0; trial < 500; trial++) {
    const question = build(kana, answer, random);
    assert.equal(question.answer, answer);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options.filter((option) => option === answer).length, 1);
    assert.ok(question.options.every((option) => kana.includes(option)));
    if (answer === 'オ') assert.ok(!question.options.includes('ヲ'));
    if (answer === 'ヲ') assert.ok(!question.options.includes('オ'));
    positions.add(question.options.indexOf(answer));
    counts[question.options.indexOf(answer)]++;
    positionCounts[question.options.indexOf(answer)]++;
    question.options.filter((option) => option !== answer).forEach((option) => distractors.add(option));
  }
  assert.equal(positions.size, 4, answer + ' reaches all four positions');
  assert.ok(counts.every((count) => count >= 70 && count <= 180), answer + ' has a spread around 125 per position over 500 seeded trials');
  assert.equal(distractors.size, answer === 'オ' || answer === 'ヲ' ? 44 : 45);
}
assert.ok(positionCounts.every((count) => count >= 5000 && count <= 6500), 'overall answer positions remain distributed around 5750');
assert.equal(kana.join(''), 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン', 'immutable source');
assert.match(html, /data-japanese-kana-entry="katakanaListening"/);
assert.match(html, /data-japanese-kana-back="katakanaListeningMenu"/);
assert.match(html, /id="japaneseKatakanaListeningPanel" hidden/);
assert.match(html, /src="\.\.\/script.js\?v=4\.16"/);
for (const file of ['hiraganaChartAudio.js?v=1.0', 'katakana.js?v=1.0']) {
  assert.ok(html.indexOf(`src="${file}"`) < html.indexOf('src="katakanaListening.js?v=1.0"'));
}
assert.doesNotMatch(source, /speechSynthesis|SpeechSynthesisUtterance|getJapaneseListeningSpeechProvider|createHiraganaPlaybackController/);

class Element {
  constructor() {
    this.textContent = ''; this.children = []; this.listeners = {}; this.disabled = false;
    const classes = new Set();
    this.classList = { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) };
  }
  addEventListener(event, callback) { this.listeners[event] = callback; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  focus() { this.focused = true; }
  replaceChildren() { this.children = []; }
  appendChild(child) { this.children.push(child); }
  querySelectorAll() { return this.children; }
}
function fixture(failure = '') {
  const audio = [], timers = new Map(), rejects = [], frames = [], events = {};
  let id = 0, gesture = false;
  class Audio {
    constructor(src) { this.src = src; this.paused = true; audio.push(this); }
    play() {
      assert.ok(gesture, 'Audio.play must be on the original play-button click stack');
      this.paused = false;
      if (failure === 'throw') throw new Error('native failure');
      return failure === 'reject' ? new Promise((_, reject) => rejects.push(reject)) : Promise.resolve();
    }
    pause() { this.paused = true; }
  }
  const controls = Object.fromEntries(['play', 'status', 'question', 'options', 'feedback', 'next'].map((name) => [name, new Element()]));
  const panel = { querySelector: (selector) => controls[selector.replace('#katakana-listening-', '')] };
  const window = { setTimeout(callback, delay) { timers.set(++id, { callback, delay }); return id; }, clearTimeout(key) { timers.delete(key); },
    addEventListener(event, handler) { events[event] = handler; } };
  const math = Object.create(Math); math.random = () => 0.999999;
  const context = vm.createContext({ window, URL, Audio, Math: math,
    japaneseKatakanaPanel: null, japaneseKatakanaListeningPanel: panel,
    document: { currentScript: { src: 'https://example.test/nested/japanese/hiraganaChartAudio.js?v=1.0' }, createElement: () => new Element() },
    requestAnimationFrame: (callback) => frames.push(callback) });
  // Load the real mapping/controller/page; deliberately provide no TTS APIs.
  vm.runInContext(read('japanese/hiraganaChartAudio.js') + '\n' + read('japanese/katakana.js') + '\n' + source, context);
  const show = (view) => { window.japaneseKatakanaListeningPage.onViewChange(view); frames.splice(0).forEach((callback) => callback()); };
  const click = (element) => { gesture = true; try { element.click(); } finally { gesture = false; } };
  const answer = (character) => click(controls.options.children.find((option) => option.textContent === character));
  return { controls, audio, timers, rejects, events, show, click, answer };
}
(async () => {
  const f = fixture(), c = f.controls;
  f.click(c.play); assert.equal(f.audio.length, 0);
  f.show('katakanaListening'); assert.ok(c.question.focused); assert.equal(f.audio.length, 0, 'entry never autoplays');
  const seen = [];
  for (let index = 0; index < 92; index++) {
    const answer = kana[index % 46];
    assert.match(c.question.textContent, new RegExp(`第 ${index + 1} 題`));
    f.click(c.next); assert.match(c.question.textContent, new RegExp(`第 ${index + 1} 題`), 'cannot skip an unanswered question');
    assert.equal(c.options.children.length, 4); assert.ok(c.next.hidden);
    f.click(c.play);
    const audio = f.audio.at(-1);
    assert.equal(audio.src, `https://example.test/nested/japanese/audio/hiragana/${files[index % 46]}.wav?v=1.0`);
    assert.ok(fs.existsSync(path.join(root, `japanese/audio/hiragana/${files[index % 46]}.wav`)));
    audio.onplaying(); assert.match(c.status.textContent, /正在播放/);
    const oldOptions = [...c.options.children];
    // Wrong and right answers both consume exactly one card.
    const picked = index % 2 ? oldOptions.find((option) => option.textContent !== answer) : oldOptions.find((option) => option.textContent === answer);
    f.click(picked);
    assert.match(c.feedback.textContent, index % 2 ? /答錯了/ : /答對了/);
    assert.ok(c.feedback.textContent.endsWith('正確答案：' + answer));
    assert.ok(c.options.children.every((option) => option.disabled)); assert.equal(c.next.hidden, false);
    const feedback = c.feedback.textContent; oldOptions[0].listeners.click(); assert.equal(c.feedback.textContent, feedback);
    seen.push(answer);
    f.click(c.next); assert.ok(audio.paused); assert.equal(f.timers.size, 0);
    oldOptions[0].listeners.click(); assert.equal(c.feedback.textContent, '', 'old option handlers cannot answer a new question');
  }
  assert.equal(new Set(seen.slice(0, 46)).size, 46); assert.equal(new Set(seen.slice(46)).size, 46);
  f.show('katakanaListeningMenu'); f.show('katakanaListening');
  assert.match(c.question.textContent, /第 1 題/); f.click(c.play);
  assert.ok(f.audio.at(-1).src.includes('/a.wav?'), 're-entry resets partial deck and question number');
  const old = f.audio.at(-1), staleEvents = [old.onplaying, old.onended, old.onerror, ...[...f.timers.values()].map((timer) => timer.callback)];
  old.onplaying(); const oldCompletion = [...f.timers.values()].find((timer) => timer.delay === 15000).callback;
  f.click(c.play); assert.ok(old.paused); const newAudio = f.audio.at(-1); newAudio.onplaying();
  const status = c.status.textContent;
  [...staleEvents, oldCompletion].forEach((callback) => callback());
  assert.equal(c.status.textContent, status); assert.equal(newAudio.paused, false);
  f.answer('ア'); f.click(c.next); assert.ok(newAudio.paused);
  f.click(c.play); const current = c.status.textContent; staleEvents.forEach((callback) => callback()); assert.equal(c.status.textContent, current);
  for (const view of ['katakanaListeningMenu', 'katakana', 'hiraganaListening', 'home']) {
    f.show('katakanaListening'); f.click(c.play); f.audio.at(-1).onplaying();
    f.show(view); assert.ok(f.audio.at(-1).paused); assert.equal(f.timers.size, 0);
    assert.ok(!c.play.classList.contains('is-playing'));
  }
  f.show('katakanaListening'); f.click(c.play);
  [...f.timers.values()].find((timer) => timer.delay === 5000).callback();
  assert.match(c.status.textContent, /載入逾時/); assert.ok(f.audio.at(-1).paused);
  f.click(c.play); f.audio.at(-1).onplaying();
  [...f.timers.values()].find((timer) => timer.delay === 15000).callback();
  assert.match(c.status.textContent, /播放逾時/); assert.ok(f.audio.at(-1).paused); assert.equal(f.timers.size, 0);
  f.click(c.play); f.audio.at(-1).onerror(); assert.match(c.status.textContent, /再次點擊重試/);
  f.click(c.play); f.audio.at(-1).onplaying(); f.audio.at(-1).onended(); assert.match(c.status.textContent, /播放完畢/);
  f.click(c.play); f.events.pagehide(); assert.ok(f.audio.at(-1).paused); assert.equal(f.timers.size, 0);
  const throwing = fixture('throw'); throwing.show('katakanaListening'); throwing.click(throwing.controls.play); assert.match(throwing.controls.status.textContent, /未能播放/);
  const rejected = fixture('reject'); rejected.show('katakanaListening'); rejected.click(rejected.controls.play);
  rejected.rejects[0](new Error('rejected')); await Promise.resolve(); assert.match(rejected.controls.status.textContent, /未能播放/);
  rejected.click(rejected.controls.play); rejected.click(rejected.controls.play); const before = rejected.controls.status.textContent;
  rejected.rejects[1](new Error('stale')); await Promise.resolve(); assert.equal(rejected.controls.status.textContent, before);
  console.log('Katakana listening passed: 5 seeds × 100 complete rounds, forced boundary collision/reset, 23,000 four-option questions, all positions/distractors and オ/ヲ exclusion; real page handlers over 92 mixed right/wrong answers, all 46 WAV URLs, no TTS, synchronous/retry/cancel/timeout/stale-event playback and clean re-entry.');
  console.log('Seeded correct-answer position counts: ' + positionCounts.join('/'));
})().catch((error) => { console.error(error); process.exitCode = 1; });
