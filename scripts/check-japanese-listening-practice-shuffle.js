#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.resolve(__dirname, "..", "script.js"), "utf8");

class Element {
  constructor() { this.children = []; this.listeners = {}; this.hidden = false; }
  set innerHTML(value) { this.markup = value; this.children = Array.from({ length: 4 }, () => new Element()); }
  appendChild(child) { this.children.push(child); }
  append(...nodes) { this.children.push(...nodes); }
  insertBefore(child, before) { this.children.splice(this.children.indexOf(before), 0, child); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(event, callback) { this.listeners[event] = callback; }
  click() { if (!this.disabled) this.listeners.click?.(); }
}

function harness(random) {
  const content = new Element();
  const menu = new Element();
  let now = 0;
  let timerId = 0;
  const timers = new Map();
  const staleTimers = [];
  const utterances = [];
  let cancels = 0;
  const math = Object.create(Math);
  math.random = random;
  const context = vm.createContext({
    Math: math, currentJapaneseView: "listeningMenu",
    document: {
      querySelector: selector => selector === "#japaneseListeningContent" ? content : menu,
      createElement: () => new Element(),
    },
    SpeechSynthesisUtterance: function(text) { this.text = text; },
    window: {
      speechSynthesis: {
        getVoices: () => [{ lang: "ja-JP" }],
        speak: utterance => utterances.push(utterance),
        cancel: () => { cancels += 1; },
      },
      setTimeout: (callback, delay) => {
        staleTimers.push(callback);
        timers.set(++timerId, { callback, due: now + delay });
        return timerId;
      },
      clearTimeout: id => timers.delete(id),
    },
  });
  vm.runInContext(source.slice(source.indexOf("const JAPANESE_LISTENING_QUESTIONS = [")) + `
    function freeze(value) { Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); Object.freeze(value); }
    freeze(JAPANESE_LISTENING_QUESTIONS);
    this.api = {
      enter: () => renderJapaneseListeningView('practice'),
      leave: resetJapaneseListeningState,
      quiz: () => renderJapaneseListeningView('quiz'),
      rerender: renderJapaneseListeningPractice,
      state: () => ({ index: currentListeningIndex, ids: listeningPracticeItems.map(q => q.id), item: listeningPracticeItems[currentListeningIndex] }),
      bank: () => JSON.stringify(JAPANESE_LISTENING_QUESTIONS),
    };
  `, context);
  return {
    api: context.api, content, utterances, staleTimers, timers,
    cancels: () => cancels,
    next: () => content.children.at(-1).click(),
    play: () => content.children[2].children.find(node => node.className === "answer-button listening-play-button"),
    tick: ms => {
      now += ms;
      for (const [id, timer] of timers) if (timer.due <= now) { timers.delete(id); timer.callback(); }
    },
  };
}

for (const initialSeed of [0, 1, 42, 316, 20261107]) {
  let seed = initialSeed;
  const h = harness(() => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32));
  const original = h.api.bank();
  const expected = JSON.parse(original).map(item => item.id).sort();
  assert.equal(expected.length, 100);
  h.api.enter();
  let last = null;
  const orders = new Set();
  for (let round = 0; round < 100; round += 1) {
    const ids = [];
    for (let index = 0; index < 100; index += 1) {
      const state = h.api.state();
      assert.equal(state.index, index);
      assert.equal(state.item.id, state.ids[index]);
      if (index === 0) assert.notEqual(state.item.id, last);
      const markup = h.content.children[2].markup;
      for (const text of [state.item.japanese, state.item.kana, state.item.zh]) assert.ok(markup.includes(text));
      ids.push(state.item.id);
      last = state.item.id;
      h.next();
    }
    assert.deepEqual([...ids].sort(), expected);
    assert.equal(new Set(ids).size, 100);
    orders.add(ids.join());
  }
  assert.equal(orders.size, 100, `seed ${initialSeed}: reshuffle each round`);

  // Actual play/next/back handlers and the real speech controller share this fixture.
  const beforeReplay = JSON.stringify(h.api.state());
  const play = h.play();
  for (let replay = 0; replay < 2; replay += 1) {
    play.click();
    play.click();
    assert.equal(play.disabled, true);
    h.tick(999);
    assert.equal(h.utterances.length, replay);
    h.tick(1);
    assert.equal(h.utterances.length, replay + 1);
    const utterance = h.utterances.at(-1);
    assert.equal(utterance.text, h.api.state().item.japanese);
    assert.equal(utterance.lang, "ja-JP");
    utterance.onstart(); utterance.onend();
    assert.equal(play.disabled, false);
    assert.equal(JSON.stringify(h.api.state()), beforeReplay);
  }
  h.api.rerender();
  assert.equal(JSON.stringify(h.api.state()), beforeReplay, "rendering alone must not draw");
  h.play().click();
  const stale = h.staleTimers.at(-1);
  h.next(); h.tick(1000); stale();
  assert.equal(h.utterances.length, 2, "next cancels pending playback, including stale callbacks");
  h.play().click(); h.tick(1000);
  const old = h.utterances.at(-1);
  h.next();
  assert.equal(h.cancels(), 1, "next cancels submitted speech");
  old.onstart(); old.onend(); old.onerror();

  const oldOrder = h.api.state().ids.join();
  h.play().click();
  h.content.children[0].click(); // Return to listening menu.
  assert.equal(h.api.state().ids.length, 0);
  assert.equal(h.api.state().index, 0);
  h.tick(1000); h.staleTimers.at(-1)();
  assert.equal(h.utterances.length, 3, "return cancels preparation");
  h.api.enter();
  assert.equal(h.api.state().index, 0);
  assert.notEqual(h.api.state().ids.join(), oldOrder, "re-entry uses a fresh shuffle");
  h.next(); h.api.leave();
  assert.equal(h.api.state().ids.length, 0);
  h.api.enter(); h.next(); h.api.enter();
  assert.equal(h.api.state().index, 0, "explicit entry starts a new round");
  h.api.quiz();
  assert.equal(h.api.state().ids.length, 0, "switching to quiz discards practice state");
  assert.equal(h.api.bank(), original, "source bank remains unchanged");
}

// Force a collision: no swaps in round one; move its last item to first in round two.
let draws = 0;
const forced = harness(() => draws++ === 99 ? 0 : 0.999999);
forced.api.enter();
const first = [...forced.api.state().ids];
for (let index = 0; index < 100; index += 1) forced.next();
const second = [...forced.api.state().ids];
assert.notEqual(second[0], first.at(-1));
assert.equal(new Set(second).size, 100);
assert.deepEqual([...second].sort(), [...first].sort());
assert.equal(draws, 199, "99 Fisher–Yates draws per round plus one boundary swap");
forced.api.leave(); forced.api.enter();
assert.deepEqual([...forced.api.state().ids], first, "reset also drops the previous-round boundary constraint");

console.log("Sentence listening practice passed: 5 seeds × 100 rounds × 100 items, forced boundary collision, replay, 1000ms preparation, cancellation, reset, displays and immutable bank.");
