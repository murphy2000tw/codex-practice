const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'japanese/hiraganaListening.js'), 'utf8');
const kana = [...html.matchAll(/data-hiragana="([^"]+)"/g)].map((match) => match[1]);
const original = kana.join('');
assert.equal(kana.length, 46);
const context = vm.createContext({ japaneseHiraganaListeningPanel: null });
vm.runInContext(source, context);
const build = context.buildHiraganaListeningQuestion;
let seed = 313;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const deck = context.createHiraganaListeningDeck(kana, random);
const positions = new Set();
const answers = new Set();
for (let index = 0; index < 10000; index += 1) {
  const question = build(kana, deck.next(), random);
  assert.ok(kana.includes(question.answer));
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.ok(question.options.every((option) => kana.includes(option)));
  assert.equal(question.options.filter((option) => option === question.answer).length, 1);
  positions.add(question.options.indexOf(question.answer));
  answers.add(question.answer);
}
// Force every kana as the answer, then vary distractors and the final shuffle.
for (const answer of kana) {
  const answerPositions = new Set();
  const seenDistractors = new Set();
  for (let trial = 0; trial < 500; trial += 1) {
    const question = build(kana, answer, random);
    assert.equal(question.answer, answer);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options.filter((option) => option === answer).length, 1);
    assert.ok(question.options.every((option) => kana.includes(option)));
    if (answer === 'お') assert.ok(!question.options.includes('を'), 'お must not have を as a distractor');
    if (answer === 'を') assert.ok(!question.options.includes('お'), 'を must not have お as a distractor');
    answerPositions.add(question.options.indexOf(answer));
    question.options.filter((option) => option !== answer).forEach((option) => seenDistractors.add(option));
  }
  assert.equal(answerPositions.size, 4, `${answer} must reach all four positions`);
  assert.equal(seenDistractors.size, answer === 'お' || answer === 'を' ? 44 : 45,
    `${answer} must retain all eligible distractors`);
}

assert.equal(positions.size, 4, 'Correct answers must reach all four option positions');
assert.equal(answers.size, 46, 'All basic kana must be available as answers');
assert.equal(kana.join(''), original, 'Question generation must not mutate the kana source');
// Every consecutive round contains exactly the original 46 kana, without replacement.
const roundDeck = context.createHiraganaListeningDeck(kana, random);
let last = null;
const orders = new Set();
for (let round = 0; round < 100; round += 1) {
  const cards = Array.from({ length: 46 }, () => roundDeck.next());
  assert.equal(new Set(cards).size, 46);
  assert.deepEqual([...cards].sort(), [...kana].sort());
  assert.notEqual(cards[0], last, 'Adjacent rounds must not repeat the boundary answer');
  orders.add(cards.join(''));
  last = cards[45];
}
assert.ok(orders.size > 1, 'Rounds must be reshuffled');

// Deliberately shuffle round two so its first card would match round one's last.
let draws = 0;
const boundaryDeck = context.createHiraganaListeningDeck(kana, () => draws++ === 45 ? 0 : 0.999999);
const firstRound = Array.from({ length: 46 }, () => boundaryDeck.next());
assert.deepEqual(firstRound, kana);
const secondRound = Array.from({ length: 46 }, () => boundaryDeck.next());
assert.notEqual(secondRound[0], firstRound[45], 'Colliding boundary must be adjusted');
assert.equal(new Set(secondRound).size, 46);
assert.deepEqual([...secondRound].sort(), [...kana].sort());
assert.equal(draws, 91, 'Boundary collision must perform an extra random swap');

// Ending a session discards its remaining cards and previous-answer constraint.
const resetDeck = context.createHiraganaListeningDeck(kana, () => 0.999999);
assert.equal(resetDeck.next(), kana[0]);
assert.equal(resetDeck.next(), kana[1]);
resetDeck.reset();
assert.deepEqual(Array.from({ length: 46 }, () => resetDeck.next()), kana);
resetDeck.reset();
assert.equal(resetDeck.next(), kana[0]);
assert.match(html, /data-japanese-entry="hiraganaListening"/);
assert.match(html, /id="japaneseHiraganaListeningPanel" hidden/);
assert.match(html, /src="hiraganaListening.js\?v=/);
console.log('Hiragana listening checks passed: 100 complete rounds, boundary collision repair, session reset, 33,000 questions, all 46 answers in all four positions, unique eligible distractors, お/を exclusion, immutable source and page entry.');
