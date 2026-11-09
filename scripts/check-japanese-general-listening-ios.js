const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const baseline = process.argv.includes('--baseline');
const source = baseline ? execFileSync('git', ['show', 'dd66b8c:script.js'], {cwd: root, encoding: 'utf8'})
  : fs.readFileSync(path.join(root, 'script.js'), 'utf8');

class Element {
  constructor() {
    this.children = []; this.listeners = {}; this.disabled = false;
    const classes = new Set();
    this.classList = {toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)};
  }
  set innerHTML(markup) { this.markup = markup; this.children = Array.from({length: 4}, () => new Element()); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  appendChild(child) { this.children.push(child); }
  append(...children) { this.children.push(...children); }
  insertBefore(child, before) { this.children.splice(this.children.indexOf(before), 0, child); }
  replaceChildren(...children) { this.children = children; }
  click() { if (!this.disabled) this.listeners.click?.(); }
}
const find = (node, name) => node.className === name ? node : node.children.map(child => find(child, name)).find(Boolean);

function fixture({ios = true, touchMac = false, ready = true, blockStart = false, missingEnd = false,
  errorCode = null, throwOn = null, noSpeech = false, noUtterance = false, throwVoices = false, voiceEvents = true} = {}) {
  let now = 0, timerId = 0, gesture = false, unlocked = !ios, current = null, voicesThrow = throwVoices;
  const voice = {name: 'Japanese test voice', lang: 'ja-JP'};
  let voices = ready ? [voice] : [];
  const timers = new Map(), savedTimers = [], nativeTimers = new Set(), voiceListeners = new Set(), handlers = {};
  const attempts = [], outputs = [], cancels = [];
  const setTimeout = (callback, delay) => {const id = ++timerId; timers.set(id, {callback, due: now + delay}); savedTimers.push(callback); return id;};
  const clearTimeout = id => timers.delete(id);
  function tick(ms) {
    const target = now + ms;
    for (;;) {
      const next = [...timers].sort((a, b) => a[1].due - b[1].due || a[0] - b[0]).find(([, timer]) => timer.due <= target);
      if (!next) break;
      now = next[1].due; timers.delete(next[0]); next[1].callback();
    }
    now = target;
  }
  const laterNative = (callback, delay) => {const id = setTimeout(() => {nativeTimers.delete(id); callback();}, delay); nativeTimers.add(id);};
  const synth = {
    getVoices() {if (voicesThrow) throw new Error('voices loading'); return voices;},
    addEventListener(_name, callback) {voiceListeners.add(callback);},
    removeEventListener(_name, callback) {voiceListeners.delete(callback);},
    speak(utterance) {
      attempts.push({utterance, at: now, gesture});
      if (gesture) unlocked = true;
      if ((throwOn === 'unlock' && !utterance.text) || (throwOn === 'answer' && utterance.text)) throw new Error('native speak failure');
      if (!unlocked) return; // Fresh iOS document silently refuses speech outside a gesture.
      current = utterance;
      if (!utterance.text) return; // Empty unlock does not emit end/error in this model.
      if (errorCode) {laterNative(() => utterance.onerror?.({error: errorCode}), 0); return;}
      if (blockStart) return;
      utterance.onstart?.(); outputs.push(utterance.text);
      if (!missingEnd) laterNative(() => {if (current === utterance) {current = null; utterance.onend?.();}}, 40);
    },
    cancel() {
      cancels.push(now);
      for (const id of nativeTimers) clearTimeout(id);
      nativeTimers.clear();
      const old = current;
      // An asynchronous native cancel must drain before a new delayed answer.
      setTimeout(() => {current = null; old?.onerror?.({error: 'canceled'});}, 0);
    },
  };
  if (!voiceEvents) {delete synth.addEventListener; delete synth.removeEventListener;}
  const content = new Element(), menu = new Element();
  const math = Object.create(Math); math.random = () => .999999;
  const context = vm.createContext({Math: math, currentJapaneseView: 'listeningMenu',
    navigator: {userAgent: ios ? 'iPhone' : 'Desktop', platform: touchMac ? 'MacIntel' : '', maxTouchPoints: touchMac ? 5 : 0},
    document: {querySelector: selector => selector === '#japaneseListeningContent' ? content : menu, createElement: () => new Element()},
    SpeechSynthesisUtterance: noUtterance ? undefined : function(text) {this.text = text;},
    recordJapaneseMistake() {},
    window: {speechSynthesis: noSpeech ? null : synth, setTimeout, clearTimeout,
      addEventListener: (name, callback) => {handlers[name] = callback;}},
  });
  vm.runInContext(source.slice(source.indexOf('const JAPANESE_LISTENING_QUESTIONS = [')) + `
this.api={enter:renderJapaneseListeningView,leave:resetJapaneseListeningState,
 item(){return currentJapaneseView==='listeningQuiz'?listeningQuizItems[listeningQuizIndex]:listeningPracticeItems[currentListeningIndex];},
 state(){return {view:currentJapaneseView,index:listeningQuizIndex,score:listeningQuizCorrectCount,answered:listeningQuizAnswered};}};`, context);
  const click = button => {gesture = true; try {button.click();} finally {gesture = false;}};
  return {api: context.api, tick, click, voice, timers, savedTimers, voiceListeners, attempts, outputs, cancels, content,
    play: () => find(content, 'answer-button listening-play-button'), status: () => find(content, 'status-message'),
    enter: mode => context.api.enter(mode), back: () => click(content.children[0]), next: () => click(content.children.at(-1)),
    answer: index => click(find(content, 'quiz-options').children[index]),
    voicesLoaded(emit = true) {voicesThrow = false; voices = [voice]; if (emit) [...voiceListeners].forEach(callback => callback());},
    replaceVoice(nextVoice) {voices = [nextVoice];},
    fire: (name, event = {}) => handlers[name]?.(event),
  };
}
let failures = 0, cases = 0;
function test(name, callback) {cases++; try {callback(); console.log('PASS ' + name);} catch (error) {failures++; console.error('FAIL ' + name + ': ' + error.message);}}

for (const mode of ['practice', 'quiz']) {
  test(mode + ': fresh iOS gesture unlock, exactly 1s preparation, start/end and replay budget', () => {
    const f = fixture(); f.enter(mode); const item = f.api.item();
    f.click(f.play());
    if (!f.attempts.length) f.tick(10000);
    assert.equal(f.attempts[0]?.utterance.text, '', 'missing click-stack unlock; UI=' + f.status().textContent);
    assert.ok(f.attempts[0].gesture); assert.equal(f.attempts[0].utterance.volume, 0);
    assert.equal(f.status().textContent, '準備播放，請稍候…');
    f.click(f.play()); assert.equal(f.attempts.length, 1, 'rapid double click must not submit twice');
    f.tick(999); assert.equal(f.outputs.length, 0);
    f.tick(1); assert.equal(f.outputs[0], item.japanese);
    assert.equal(f.attempts.at(-1).at, 1000); assert.equal(f.attempts.at(-1).utterance.voice, f.voice);
    assert.equal(f.status().textContent, '正在播放日文音訊…');
    f.tick(40); assert.equal(f.play().disabled, mode === 'quiz'); assert.equal(f.timers.size, 0);
    f.click(f.play()); f.tick(1040); assert.equal(f.outputs.length, mode === 'quiz' ? 1 : 2);
  });
  test(mode + ': voice list loads within preparation, selected fresh only after 1s', () => {
    const f = fixture({ready: false}); f.enter(mode); f.click(f.play()); f.tick(400); f.voicesLoaded();
    f.tick(599); assert.equal(f.outputs.length, 0); f.tick(1);
    assert.equal(f.outputs.length, 1); assert.equal(f.attempts.at(-1).utterance.voice, f.voice);
    f.tick(40); assert.equal(f.voiceListeners.size, 0); assert.equal(f.timers.size, 0);
  });
  for (const emit of [true, false]) test(mode + ': late voice readiness via ' + (emit ? 'voiceschanged' : 'poll fallback'), () => {
    const f = fixture({ready: false, voiceEvents: emit}); f.enter(mode); f.click(f.play()); f.tick(1000);
    assert.match(f.status().textContent, /等待日文語音載入/); assert.equal(f.outputs.length, 0);
    f.tick(700); f.voicesLoaded(emit); f.tick(140);
    assert.equal(f.outputs.length, 1); assert.equal(f.attempts.at(-1).utterance.voice, f.voice);
    assert.equal(f.play().disabled, mode === 'quiz'); assert.equal(f.voiceListeners.size, 0); assert.equal(f.timers.size, 0);
  });
  test(mode + ': getVoices initially throws, then becomes ready', () => {
    const f = fixture({ready: false, throwVoices: true}); f.enter(mode); f.click(f.play()); f.tick(1200); f.voicesLoaded(); f.tick(40);
    assert.equal(f.outputs.length, 1); assert.equal(f.timers.size, 0);
  });
  test(mode + ': voice never loads; clear wait, actionable error, no answer and no quiz refund', () => {
    const f = fixture({ready: false}); f.enter(mode); f.click(f.play()); f.tick(5999);
    assert.match(f.status().textContent, /等待日文語音/); f.tick(1);
    assert.match(f.status().textContent, /尚未取得可用的日文語音/); assert.equal(f.outputs.length, 0);
    assert.equal(f.play().disabled, mode === 'quiz'); assert.equal(f.voiceListeners.size, 0); assert.equal(f.timers.size, 0);
    const message = f.status().textContent; f.voicesLoaded(); f.tick(1000); assert.equal(f.status().textContent, message);
  });
  test(mode + ': no start after submission times out, ignores late native events and keeps budget', () => {
    const f = fixture({blockStart: true}); f.enter(mode); f.click(f.play()); f.tick(1000);
    const old = f.attempts.at(-1).utterance; f.tick(4999); assert.match(f.status().textContent, /準備播放/);
    f.tick(1); f.tick(0); assert.match(f.status().textContent, /未能開始播放/);
    assert.equal(f.play().disabled, mode === 'quiz'); const message = f.status().textContent;
    old.onstart(); old.onend(); old.onerror({error: 'network'}); assert.equal(f.status().textContent, message); assert.equal(f.timers.size, 0);
  });
  test(mode + ': native errors and thrown speaks settle without refunding quiz', () => {
    for (const config of [{errorCode: 'not-allowed'}, {errorCode: 'voice-unavailable'}, {throwOn: 'unlock'}, {throwOn: 'answer'}]) {
      const f = fixture(config); f.enter(mode); f.click(f.play()); f.tick(1040);
      assert.doesNotMatch(f.status().textContent, /準備播放|正在播放|等待日文語音/);
      assert.equal(f.play().disabled, mode === 'quiz'); assert.equal(f.timers.size, 0);
    }
  });
  test(mode + ': cancellation during preparation, voice wait and playback removes timers/listeners/stale events', () => {
    for (const phase of ['preparing', 'waiting', 'playing']) {
      const f = fixture({ready: phase !== 'waiting'}); f.enter(mode); f.click(f.play());
      f.tick(phase === 'preparing' ? 500 : 1000);
      const old = f.attempts.at(-1)?.utterance;
      const callbacks = f.savedTimers.slice(); const listeners = [...f.voiceListeners];
      f.back(); f.tick(0); assert.equal(f.content.children.length, 0);
      f.voicesLoaded(); callbacks.forEach(callback => callback()); listeners.forEach(callback => callback());
      old.onstart?.(); old.onend?.(); old.onerror?.({error: 'network'}); f.tick(10000);
      assert.equal(f.content.children.length, 0); assert.equal(f.voiceListeners.size, 0); assert.equal(f.timers.size, 0);
      f.enter(mode); f.click(f.play()); f.tick(1040); assert.equal(f.outputs.at(-1), f.api.item().japanese);
    }
  });
  test(mode + ': pagehide cancels; bfcache pageshow retains question and spent quiz budget', () => {
    const f = fixture(); f.enter(mode); const id = f.api.item().id; f.click(f.play()); f.tick(1000);
    const old = f.attempts.at(-1).utterance; f.fire('pagehide'); f.tick(0);
    const count = f.outputs.length; old.onstart(); old.onend(); f.tick(1000); assert.equal(f.outputs.length, count);
    f.fire('pageshow', {persisted: true}); assert.equal(f.api.item().id, id);
    assert.equal(f.play().disabled, mode === 'quiz'); if (mode === 'quiz') assert.match(f.status().textContent, /額度已使用/);
    else {f.click(f.play()); f.tick(1040); assert.equal(f.outputs.length, count + 1);}
  });
}

test('desktop and iPad desktop-mode detection select the intended gesture path', () => {
  for (const touchMac of [false, true]) {
    const f = fixture({ios: false, touchMac}); f.enter('practice'); f.click(f.play());
    assert.equal(f.attempts.length, touchMac ? 1 : 0); f.tick(1040); assert.equal(f.outputs.length, 1);
  }
});
test('practice voice replacement, pending-next race, replay, and stale poll cannot affect newer request', () => {
  const f = fixture({ready: false}); f.enter('practice'); f.click(f.play()); f.tick(1000);
  const oldPoll = f.savedTimers.at(-1), oldListener = [...f.voiceListeners][0], oldText = f.api.item().japanese;
  f.next(); f.click(f.play()); f.tick(1000); oldPoll(); oldListener();
  f.voicesLoaded(); f.tick(40);
  assert.equal(f.outputs.length, 1); assert.notEqual(f.outputs[0], oldText); assert.equal(f.voiceListeners.size, 0); assert.equal(f.timers.size, 0);
  const replacement = {lang: 'ja-JP', name: 'new voice'};
  f.click(f.play()); f.replaceVoice(replacement); f.tick(1040);
  assert.equal(f.attempts.at(-1).utterance.voice, replacement);
});
test('missing browser APIs fail clearly; practice retry and quiz budget remain correct', () => {
  for (const mode of ['practice', 'quiz']) for (const config of [{noSpeech: true}, {noUtterance: true}]) {
    const f = fixture(config); f.enter(mode); f.click(f.play()); assert.match(f.status().textContent, /未提供語音合成/);
    assert.equal(f.play().disabled, mode === 'quiz'); assert.equal(f.timers.size, 0);
  }
});
test('cleared voice/start deadlines cannot cancel speech after the same request starts', () => {
  const f = fixture({ready: false, missingEnd: true}); f.enter('practice'); f.click(f.play()); f.tick(1000);
  const waitingCallbacks = f.savedTimers.slice(); f.voicesLoaded();
  const startDeadline = f.savedTimers.at(-2); // start deadline then completion deadline, armed by synchronous onstart.
  assert.match(f.status().textContent, /正在播放/);
  waitingCallbacks.forEach(callback => callback()); startDeadline();
  assert.match(f.status().textContent, /正在播放/); assert.equal(f.outputs.length, 1);
  f.back(); f.tick(0); assert.equal(f.timers.size, 0);
});
test('started speech with missing end has a separate completion guard', () => {
  const f = fixture({missingEnd: true}); f.enter('practice'); f.click(f.play()); f.tick(1000);
  assert.match(f.status().textContent, /正在播放/); f.tick(59999); assert.match(f.status().textContent, /正在播放/);
  f.tick(1); f.tick(0); assert.match(f.status().textContent, /播放未能完成/); assert.equal(f.play().disabled, false); assert.equal(f.timers.size, 0);
});
test('all ten quiz answers, rerendered play budget, next question and scoring stay intact', () => {
  const f = fixture(); f.enter('quiz');
  for (let i = 0; i < 10; i++) {
    const item = f.api.item(); f.click(f.play()); f.tick(1040);
    assert.equal(f.outputs.length, i + 1); assert.ok(f.play().disabled);
    f.answer(item.answerIndex); assert.equal(f.api.state().score, i + 1); assert.ok(f.play().disabled, 'answer rerender must not refund');
    f.next();
  }
  assert.equal(f.api.state().score, 10); assert.ok(f.content.children.some(child => child.markup?.includes('答對題數：10')));
});

if (failures) process.exitCode = 1;
else console.log(`General listening iOS regression passed: ${cases} cases using real practice/quiz handlers and a gesture/native-event model, not an iPhone engine.`);
