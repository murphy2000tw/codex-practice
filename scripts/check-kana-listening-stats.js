const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
class Element {
  constructor() {
    this.children = []; this.listeners = {}; this.textContent = '';
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(event, fn) { this.listeners[event] = fn; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  replaceChildren() { this.children = []; }
  appendChild(child) { this.children.push(child); }
  querySelectorAll() { return this.children; }
  focus() {}
}
for (const [kind, capital] of [['hiragana', 'Hiragana'], ['katakana', 'Katakana']]) {
  const kana = [...html.matchAll(new RegExp(`data-${kind}="([^"]+)"`, 'g'))].map(match => match[1]);
  assert.equal(kana.length, 46);
  const controls = Object.fromEntries(['play', 'status', 'question', 'options', 'feedback', 'next', 'stats'].map(name => [name, new Element()]));
  const panel = { querySelector: selector => controls[selector.replace(`#${kind}-listening-`, '')] };
  const math = Object.create(Math); math.random = () => 0.999999;
  const window = { addEventListener() {} };
  const context = vm.createContext({
    window, Math: math, requestAnimationFrame: fn => fn(),
    document: { createElement: () => new Element() },
    japaneseHiraganaPanel: { querySelectorAll: () => kana.map(character => ({ dataset: { hiragana: character } })) },
    [`japanese${capital}ListeningPanel`]: panel,
    KATAKANA_TO_HIRAGANA: Object.fromEntries(kana.map(character => [character, character])),
    getJapaneseListeningSpeechProvider: () => ({}),
    createHiraganaChartPlaybackController: () => ({ cancel() {}, requestPlayback() {} }),
    getHiraganaChartRecordingUrl: () => 'recording.wav', getKatakanaChartRecordingUrl: () => 'recording.wav',
  });
  vm.runInContext(fs.readFileSync(path.join(root, `japanese/${kind}Listening.js`), 'utf8'), context);
  const page = window[`japanese${capital}ListeningPage`];
  const stats = (answered, correct, rate) => assert.equal(controls.stats.textContent, `已作答：${answered} 題　答對：${correct} 題　正確率：${rate}`, kind);
  page.onViewChange(`${kind}Listening`); stats(0, 0, '—');
  controls.play.click(); controls.next.click(); stats(0, 0, '—');
  let correct = 0;
  const stale = [];
  for (let index = 0; index < 48; index++) {
    assert.match(controls.question.textContent, new RegExp(`第 ${index + 1} 題`));
    const before = controls.stats.textContent;
    // Directly invoke old handlers, bypassing disabled buttons, even across rounds.
    stale.forEach(callback => callback());
    assert.equal(controls.stats.textContent, before);
    const answer = kana[index % 46];
    const choices = controls.options.children;
    const button = choices.find(option => index % 3 === 0 ? option.textContent !== answer : option.textContent === answer);
    if (index % 3 !== 0) correct++;
    button.click();
    stats(index + 1, correct, `${Math.round(correct / (index + 1) * 100)}%`);
    assert.match(controls.feedback.textContent, index % 3 === 0 ? /答錯了/ : /答對了/);
    assert.ok(choices.every(option => option.disabled));
    assert.equal(controls.next.hidden, false);
    const callback = button.listeners.click;
    callback(); choices.forEach(option => option.listeners.click());
    stats(index + 1, correct, `${Math.round(correct / (index + 1) * 100)}%`);
    stale.push(callback);
    controls.next.click();
  }
  stats(48, 32, '67%'); // Counts survive the first complete round.
  page.onViewChange(`${kind}ListeningMenu`); stats(0, 0, '—');
  stale.forEach(callback => callback()); stats(0, 0, '—');
  page.onViewChange(`${kind}Listening`); stats(0, 0, '—');
  assert.match(controls.question.textContent, /第 1 題/);
  stale.forEach(callback => callback()); stats(0, 0, '—');
  controls.options.children.find(option => option.textContent === kana[0]).click(); stats(1, 1, '100%');
  const markup = html.match(new RegExp(`<p id="${kind}-listening-stats"[^>]*>`))[0];
  for (const attribute of ['role="status"', 'aria-live="polite"', 'aria-atomic="true"']) assert.ok(markup.includes(attribute));
  console.log(`PASS ${kind}: empty state, 48 mixed answers, integer rounding, next round, duplicate/stale callbacks, menu reset/re-entry and live status markup`);
}
