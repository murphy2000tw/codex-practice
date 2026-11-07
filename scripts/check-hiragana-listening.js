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
const positions = new Set();
const answers = new Set();
for (let index = 0; index < 10000; index += 1) {
  const question = build(kana, random);
  assert.ok(kana.includes(question.answer));
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.ok(question.options.every((option) => kana.includes(option)));
  assert.equal(question.options.filter((option) => option === question.answer).length, 1);
  positions.add(question.options.indexOf(question.answer));
  answers.add(question.answer);
}
// Force every kana as the answer, then vary distractors and the final shuffle.
for (const [answerIndex, answer] of kana.entries()) {
  const answerPositions = new Set();
  const seenDistractors = new Set();
  for (let trial = 0; trial < 500; trial += 1) {
    let firstDraw = true;
    const question = build(kana, () => {
      if (firstDraw) {
        firstDraw = false;
        return (answerIndex + 0.5) / kana.length;
      }
      return random();
    });
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
assert.equal(build(kana, () => 0).answer, kana[0]);
assert.equal(build(kana, () => 0.999999).answer, kana[45]);
assert.match(html, /data-japanese-entry="hiraganaListening"/);
assert.match(html, /id="japaneseHiraganaListeningPanel" hidden/);
assert.match(html, /src="hiraganaListening.js\?v=/);
console.log('Hiragana listening checks passed: 33,000 questions, all 46 answers in all four positions, unique eligible distractors, お/を exclusion, immutable source and page entry.');
