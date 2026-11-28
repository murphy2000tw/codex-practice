// Run with Node.js and Playwright installed. The iPhone profile still uses Chromium.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const root = path.resolve(__dirname, '..');
const words = require('../japanese/shoSenseiVocabulary.json');
const pictureQuestionCount = 130;
const roundSize = 20;
const pictureStorageKey = 'japanese-sho-sensei-picture-quiz-v1';
const wordsByQuizImage = Object.fromEntries(words.map(word => [word.pictureQuizImagePath || word.imagePath, word]));
const numberReadings = ['れい', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + pathname.replace(/^\/project\//, '/'));
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  const target = pathname.endsWith('/') ? path.join(file, 'index.html') : file;
  fs.readFile(target, (error, data) => {
    if (error) return response.writeHead(404).end();
    const type = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.webp': 'image/webp',
    }[path.extname(target)];
    response.writeHead(200, { 'Content-Type': type || 'application/octet-stream' }).end(data);
  });
});

function installSpeechProbe() {
  const voice = { lang: 'ja-JP', name: 'Japanese test voice' };
  const probe = window.shoSpeechProbe = { calls: [], cancelled: [], active: null, error: null, hasVoice: true, voiceChecks: 0 };
  const synthesis = new EventTarget();
  Object.assign(synthesis, {
    getVoices() {
      probe.voiceChecks += 1;
      return probe.hasVoice ? [{ lang: 'en-US' }, voice] : [{ lang: 'en-US' }];
    },
    speak(utterance) {
      probe.calls.push({
        text: utterance.text,
        lang: utterance.lang,
        voiceLang: utterance.voice?.lang,
        volume: utterance.volume,
        gesture: navigator.userActivation.isActive,
      });
      if (!utterance.text) return;
      if (probe.error) {
        utterance.onerror({ error: probe.error });
        return;
      }
      probe.active = utterance;
      utterance.onstart();
    },
    cancel() {
      const previous = probe.active;
      probe.active = null;
      if (previous) probe.cancelled.push(previous.text);
      queueMicrotask(() => previous?.onerror({ error: 'canceled' }));
    },
  });
  Object.defineProperty(window, 'speechSynthesis', { value: synthesis });
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
}

async function checkPictureQuizQuestions(page) {
  const eligibleWords = words.filter(word => word.pictureQuizEligible);
  const wordById = new Map(words.map(word => [word.id, word]));
  assert.equal(eligibleWords.length, pictureQuestionCount);
  for (const word of eligibleWords) {
    assert.equal(new Set(word.pictureQuizDistractorIds).size, word.pictureQuizDistractorIds.length, word.id);
    for (const id of word.pictureQuizDistractorIds) {
      const candidate = wordById.get(id);
      assert.ok(candidate && candidate.category !== word.category && candidate.kana !== word.kana, `${word.id}/${id}`);
    }
  }
  for (const id of [
    'name', 'written-character', 'monday', 'number-100', 'stay-home', 'you', 'age-suffix',
    'bank-employee', 'taipei', 'thank-you-polite', ...words.filter(word => /^\d+月$/.test(word.word)).map(word => word.id),
  ]) {
    assert.equal(wordById.get(id).pictureQuizEligible, false, id);
  }

  const { bankIds, baselineIds, rounds, labels, fallback, skipped } = await page.evaluate((words) => {
    const shuffle = shuffleJapaneseJlptArray;
    const bank = createShoSenseiPictureQuestionBank(words, shuffle);
    const wordsById = new Map(words.map(word => [word.id, { ...word, pictureQuizEligible: false }]));
    const testRain = ids => createShoSenseiPictureQuestionBank([...wordsById.values(), {
      ...wordsById.get('rain'), pictureQuizEligible: true, pictureQuizDistractorIds: ids,
    }], shuffle);
    return {
      bankIds: bank.map(({ answer }) => answer.id).sort(),
      baselineIds: SHO_SENSEI_PICTURE_BASELINE_IDS,
      rounds: Array.from({ length: 20 }, () => {
        const state = { cycleOrder: shuffle(bank.map(({ answer }) => answer.id)), practicedIds: [], priorityIds: [], lastCategory: null };
        return selectShoSenseiPictureRound(bank, state, shuffle).questions.map(({ answer, options, correctPosition }) => ({
          answer: answer.id, options: options.map(word => word.id), correctPosition,
        }));
      }),
      labels: Object.fromEntries(['rain', 'candy', 'persimmon', 'oyster', 'number-10'].map(id =>
        [id, getShoSenseiPictureOptionLabel(wordsById.get(id))])),
      fallback: testRain(['candy', 'dog', 'cat']).map(({ answer, distractors }) => [answer, ...distractors].map(word => word.id)),
      skipped: testRain(['candy', 'snow', 'paper', 'paper', 'missing']).length,
    };
  }, words);
  assert.deepEqual(bankIds, eligibleWords.map(word => word.id).sort());
  assert.deepEqual(baselineIds, bankIds);
  assert.deepEqual(labels, { rain: '雨（あめ）', candy: '飴（あめ）', persimmon: '柿（かき）', oyster: '牡蠣（かき）', 'number-10': 'じゅう' });
  assert.deepEqual(fallback.map(options => options.sort()), [['cat', 'dog', 'rain']]);
  assert.equal(skipped, 0);
  assert.ok(rounds.some(round => round[0].correctPosition !== rounds[0][0].correctPosition));
  assert.ok(rounds.some(round => round[0].answer !== rounds[0][0].answer));
  for (const round of rounds) {
    assert.equal(round.length, roundSize);
    assert.equal(new Set(round.map(question => question.answer)).size, roundSize);
    assert.equal(new Set(round.slice(0, 4).map(({ answer }) => wordById.get(answer).category)).size, 4);
    for (const [index, { answer, options, correctPosition }] of round.entries()) {
      assert.equal(options.length, 3);
      assert.equal(options[correctPosition], answer);
      assert.equal(new Set(options.map(id => wordById.get(id).category)).size, 3);
      assert.equal(new Set(options.map(id => wordById.get(id).kana)).size, 3);
      assert.ok(options.filter(id => id !== answer).every(id => wordById.get(answer).pictureQuizDistractorIds.includes(id)));
      if (index % 3 !== 0) continue;
      const positions = round.slice(index, index + 3).map(question => question.correctPosition);
      assert.equal(new Set(positions).size, positions.length);
      if (index) assert.notEqual(correctPosition, round[index - 1].correctPosition);
    }
  }
}

function getPictureProgress(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), pictureStorageKey);
}

async function setPictureProgress(page, changes) {
  await page.evaluate(({ key, changes }) => {
    const state = JSON.parse(localStorage.getItem(key)) || {};
    localStorage.setItem(key, JSON.stringify({ ...state, ...changes }));
  }, { key: pictureStorageKey, changes });
}

// Answer through the real controls, leaving the final "查看結果" click to the caller.
function solvePictureRound(page, { bank = wordsByQuizImage, wrongAt = [], stopAt, checkNumberImages = false, startAt = 0, limit = roundSize } = {}) {
  return page.evaluate(async ({ bank, wrongAt, stopAt, checkNumberImages, startAt, limit }) => {
    const view = document.querySelector('#japaneseShoSenseiPictureQuizView');
    const panel = view.querySelector('[data-picture-quiz-question]');
    const image = panel.querySelector('img');
    const next = view.querySelector('[data-picture-quiz-next]');
    const solved = [];
    for (let index = startAt; !panel.hidden && solved.length < limit; index += 1) {
      const imagePath = image.getAttribute('src');
      const word = bank[imagePath];
      if (word.id === stopAt) break;
      const choices = [...panel.querySelectorAll('.quiz-option')];
      const right = choices.find(button => button.textContent === getShoSenseiPictureOptionLabel(word));
      if (!right) throw new Error(`Missing answer for ${word.id}`);
      const choose = wrongAt.includes(index) ? choices.find(button => button !== right) : right;
      const question = { id: word.id, imagePath, right: right.textContent, chosen: choose.textContent };
      if (checkNumberImages && word.pictureQuizImagePath) {
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        let dots = 0;
        for (const y of [88, 152]) {
          for (const x of [64, 128, 192, 256, 320]) {
            const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
            if (red === 145 && green === 67 && blue === 34) dots += 1;
          }
        }
        question.number = [Number(word.word), dots, right.textContent];
      }
      choose.click();
      // A second event on a disabled answer must leave the original result intact.
      right.dispatchEvent(new MouseEvent('click'));
      if (!right.classList.contains('is-correct')) throw new Error(`Incorrect answer key for ${word.id}`);
      solved.push(question);
      if (next.textContent === '查看結果') break;
      next.click();
    }
    return solved;
  }, { bank, wrongAt, stopAt, checkNumberImages, startAt, limit });
}

async function checkPictureQuiz(page, activate, mobile) {
  const entry = page.locator('[data-japanese-vocabulary-entry="picture-quiz"]');
  const view = page.locator('#japaneseShoSenseiPictureQuizView');
  const image = view.locator('[data-picture-quiz-question] img');
  const answers = view.locator('.quiz-option');
  const listens = view.getByRole('button', { name: /^聽發音/ });
  const progress = view.locator('[data-picture-quiz-progress]');
  const feedback = view.locator('[data-picture-quiz-feedback]');
  const speech = view.locator('[data-picture-quiz-speech]');
  const next = view.locator('[data-picture-quiz-next]');
  const restart = view.getByRole('button', { name: '重新開始' });
  const back = view.getByRole('button', { name: '返回單字選單' });
  const openHistory = view.getByRole('button', { name: '歷史成績' });
  const historyBack = view.getByRole('button', { name: '返回上一層' });
  const history = view.locator('[data-picture-quiz-history]');
  const result = view.locator('[data-picture-quiz-result]');
  const calls = () => page.evaluate(() => window.shoSpeechProbe.calls.filter(call => call.text));
  const labelFor = word => page.evaluate(word => getShoSenseiPictureOptionLabel(word), word);
  const waitForSpeech = text => page.waitForFunction(text => window.shoSpeechProbe.active?.text === text, text);
  const assertIdle = () => page.waitForFunction(() => window.shoSpeechProbe.active === null);

  await activate(entry);
  await answers.last().waitFor();
  assert.equal(await progress.textContent(), `第 1 題／共 ${roundSize} 題`);
  assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-picture-quiz-title');
  await activate(openHistory);
  assert.ok(await history.isVisible());
  assert.match(await history.textContent(), /尚無完成紀錄/);
  assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-picture-history-title');
  await activate(historyBack);
  assert.equal(await page.locator(':focus').textContent(), '歷史成績');
  assert.equal(await answers.count(), 3);
  assert.equal(await listens.count(), 3);
  assert.equal(await image.getAttribute('alt'), '本題插圖');
  assert.equal(await image.evaluate(async node => { await node.decode(); return node.naturalWidth; }), 384);
  assert.equal(await view.locator('.quiz-prompt-label').textContent(), '看圖片，選出對應的日文單字。');
  assert.ok(await answers.evaluateAll(nodes => nodes.every(node => {
    const button = node.getBoundingClientRect();
    const audio = node.nextElementSibling.getBoundingClientRect();
    return audio.left - button.right >= 10 && button.width >= 44 && audio.width >= 44 &&
      button.height >= 44 && audio.height >= 44 && audio.right <= innerWidth;
  })));
  assert.equal(new Set(await listens.evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    return [style.backgroundColor, style.color, style.borderRadius, style.height, style.width].join();
  }))).size, 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

  const getOptionWords = async () => {
    const bank = await page.evaluate(words => words.map(word => [getShoSenseiPictureOptionLabel(word), word]), words);
    const byLabel = new Map(bank);
    return (await answers.allTextContents()).map(label => byLabel.get(label));
  };
  let optionWords = await getOptionWords();
  const firstImagePath = await image.getAttribute('src');
  const firstWord = wordsByQuizImage[firstImagePath];
  assert.ok(optionWords.some(word => word.id === firstWord.id));
  const startCalls = (await calls()).length;
  for (const [index, word] of optionWords.entries()) {
    assert.equal(await listens.nth(index).getAttribute('aria-label'), `聽發音：${await labelFor(word)}`);
    await activate(listens.nth(index));
    await waitForSpeech(word.speechText);
    assert.equal(await speech.textContent(), '播放中…');
    assert.equal(await feedback.textContent(), '');
    assert.ok(await next.isHidden());
    assert.equal(await view.locator('.quiz-option:disabled').count(), 0);
    assert.equal(await image.getAttribute('src'), firstImagePath);
  }
  assert.deepEqual((await calls()).slice(startCalls).map(call => [call.text, call.lang, call.voiceLang]),
    optionWords.map(word => [word.speechText, 'ja-JP', 'ja-JP']));
  assert.deepEqual(await page.evaluate(() => window.shoSpeechProbe.cancelled.slice(-2)), optionWords.slice(0, 2).map(word => word.speechText));
  assert.deepEqual((await getPictureProgress(page)).practicedIds, []);

  const wrong = optionWords.findIndex(word => word.id !== firstWord.id);
  await activate(answers.nth(wrong));
  assert.equal(await feedback.textContent(), `答錯了。正確答案是 ${await labelFor(firstWord)}`);
  assert.equal(await answers.nth(wrong).evaluate(node => node.classList.contains('is-wrong')), true);
  assert.equal(await view.locator('.quiz-option:disabled').count(), 3);
  assert.equal(await image.getAttribute('src'), firstImagePath);
  assert.deepEqual((await getPictureProgress(page)).practicedIds, [firstWord.id]);
  const wrongFeedback = await feedback.textContent();
  await activate(listens.nth(wrong));
  await waitForSpeech(optionWords[wrong].speechText);
  assert.equal(await feedback.textContent(), wrongFeedback);
  assert.equal(await image.getAttribute('src'), firstImagePath);
  assert.ok(await next.isVisible());
  await activate(next);
  await assertIdle();
  assert.match(await progress.textContent(), /^第 2 題/);
  assert.equal(await speech.textContent(), '');

  optionWords = await getOptionWords();
  const beforeRapid = (await calls()).length;
  await listens.evaluateAll(nodes => { nodes[0].click(); nodes[2].click(); });
  await waitForSpeech(optionWords[2].speechText);
  assert.deepEqual((await calls()).slice(beforeRapid).map(call => call.text), [optionWords[2].speechText]);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await assertIdle();
  await activate(listens.nth(2));
  await waitForSpeech(optionWords[2].speechText);
  await activate(back);
  await assertIdle();
  assert.ok(await view.isHidden());
  assert.equal(await page.locator(':focus').getAttribute('data-japanese-vocabulary-entry'), 'picture-quiz');
  assert.deepEqual((await getPictureProgress(page)).practicedIds, [firstWord.id]);
  assert.deepEqual((await getPictureProgress(page)).results, []);

  await activate(entry);
  await answers.last().waitFor();
  assert.match(await progress.textContent(), /^第 1 題/);
  assert.notEqual(await image.getAttribute('src'), firstImagePath);
  const beforeWaiting = (await calls()).length;
  await page.evaluate(() => { window.shoSpeechProbe.hasVoice = false; });
  const voiceChecks = await page.evaluate(() => window.shoSpeechProbe.voiceChecks);
  await activate(listens.first());
  await page.waitForFunction(count => window.shoSpeechProbe.voiceChecks >= count + 2, voiceChecks);
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide'));
    window.shoSpeechProbe.hasVoice = true;
    window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));
  });
  await assertIdle();
  assert.equal((await calls()).length, beforeWaiting);
  assert.equal(await speech.textContent(), '');

  await page.evaluate(() => {
    document.querySelector('#japaneseShoSenseiPictureQuizView .sho-picture-quiz-listen').click();
    document.querySelector('#japaneseMainContent [data-japanese-back-home]').click();
  });
  assert.ok(await page.locator('#japaneseHomeContent').isVisible());
  assert.equal((await calls()).length, beforeWaiting);
  await activate(page.locator('[data-japanese-entry="vocabulary"]'));
  await activate(entry);
  await answers.last().waitFor();
  await page.evaluate(() => { window.shoSpeechProbe.error = 'language-unavailable'; });
  await activate(listens.first());
  await page.waitForFunction(() => document.querySelector('[data-picture-quiz-speech]').textContent.includes('無法播放日文語音'));
  assert.equal((await calls()).length, beforeWaiting + 1);
  await page.evaluate(() => { window.shoSpeechProbe.error = null; });
  const currentImagePath = await image.getAttribute('src');
  const current = wordsByQuizImage[currentImagePath];
  const currentOptions = await getOptionWords();
  await activate(answers.nth(currentOptions.findIndex(word => word.id === current.id)));
  assert.equal(await feedback.textContent(), `答對了！正確答案是 ${await labelFor(current)}`);
  const beforeRestart = await getPictureProgress(page);
  await activate(restart);
  await answers.last().waitFor();
  assert.match(await progress.textContent(), /^第 1 題/);
  assert.equal(await feedback.textContent(), '');
  assert.ok(await next.isHidden());
  assert.deepEqual((await getPictureProgress(page)).practicedIds, beforeRestart.practicedIds);
  assert.deepEqual((await getPictureProgress(page)).cycleOrder, beforeRestart.cycleOrder);
  assert.deepEqual((await getPictureProgress(page)).results, []);

  // Put rain and every dot image in this round so their original assets and speech can be checked.
  const practicedIds = words.filter(word => word.pictureQuizEligible && !word.pictureQuizImagePath && word.id !== 'rain')
    .map(word => word.id);
  await setPictureProgress(page, { practicedIds });
  await activate(restart);
  await answers.last().waitFor();
  const wrongAt = [0, 4, 6, 19];
  const solved = await solvePictureRound(page, { wrongAt, stopAt: 'rain', checkNumberImages: true });
  await activate(view.getByRole('button', { name: '聽發音：雨（あめ）', exact: true }));
  await waitForSpeech('あめ。');
  solved.push(...await solvePictureRound(page, { wrongAt, startAt: solved.length, checkNumberImages: true }));
  assert.equal(new Set(solved.map(({ id }) => id)).size, roundSize);
  assert.deepEqual(solved.flatMap(question => question.number ? [question.number] : []).sort(([a], [b]) => a - b),
    numberReadings.map((reading, number) => [number, number, reading]));
  assert.equal(await next.textContent(), '查看結果');
  await activate(next);
  await next.dispatchEvent('click');
  await assertIdle();
  assert.equal(await result.locator('[data-picture-quiz-score]').textContent(), '答對 16／20，正確率 80%');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-picture-result-title');
  const mistakes = result.locator('[data-picture-quiz-mistakes] article');
  assert.deepEqual(await mistakes.evaluateAll(cards => cards.map(card => [
    card.querySelector('h4').textContent,
    card.querySelector('img').getAttribute('src'),
    ...[...card.querySelectorAll('[lang="ja"]')].map(word => word.textContent),
  ])), wrongAt.map(index => [
    `第 ${index + 1} 題`, solved[index].imagePath, solved[index].chosen, solved[index].right,
  ]));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await activate(mistakes.first().getByRole('button'));
  const firstReviewSpeech = wordsByQuizImage[solved[wrongAt[0]].imagePath].speechText;
  await waitForSpeech(firstReviewSpeech);
  await activate(mistakes.nth(1).getByRole('button'));
  await waitForSpeech(wordsByQuizImage[solved[wrongAt[1]].imagePath].speechText);
  assert.equal(await page.evaluate(() => window.shoSpeechProbe.cancelled.at(-1)), firstReviewSpeech);
  await activate(openHistory);
  await assertIdle();
  assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-picture-history-title');
  assert.equal(await history.locator('article').count(), 1);
  assert.match(await history.locator('article').textContent(), /答對 16／20，正確率 80%/);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await activate(historyBack);
  assert.equal(await mistakes.count(), 4);
  const { results } = await getPictureProgress(page);
  assert.equal(results.length, 1);
  assert.deepEqual(Object.keys(results[0]).sort(), ['accuracy', 'completedAt', 'correct', 'id', 'total']);
  await activate(mistakes.first().getByRole('button'));
  await waitForSpeech(firstReviewSpeech);
  await activate(result.getByRole('button', { name: '再練一回' }));
  await assertIdle();
  assert.equal(await progress.textContent(), `第 1 題／共 ${roundSize} 題`);
  assert.equal((await getPictureProgress(page)).results.length, 1);
}

async function openPictureQuiz(page) {
  await page.locator('[data-japanese-entry="vocabulary"]').click();
  await page.locator('[data-japanese-vocabulary-entry="picture-quiz"]').click();
}

async function checkPictureQuizRotation(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await openPictureQuiz(page);
    const answers = page.locator('[data-picture-quiz-options] .quiz-option');
    const next = page.locator('[data-picture-quiz-next]');
    const again = page.locator('[data-picture-quiz-again]');
    const eligible = words.filter(word => word.pictureQuizEligible).map(word => word.id);
    const cycle = new Set();
    const lastRoundIndex = Math.floor(pictureQuestionCount / roundSize);
    await answers.last().waitFor();
    const initialOrder = (await getPictureProgress(page)).cycleOrder;
    for (let index = 0; index <= lastRoundIndex; index += 1) {
      await answers.last().waitFor();
      const remaining = pictureQuestionCount - cycle.size;
      const prefix = await solvePictureRound(page, { limit: Math.min(remaining, roundSize) });
      assert.deepEqual((await getPictureProgress(page)).cycleOrder, initialOrder);
      const fill = remaining < roundSize ? await solvePictureRound(page, { startAt: prefix.length }) : [];
      const round = [...prefix, ...fill].map(({ id }) => id);
      assert.equal(round.length, roundSize);
      assert.equal(new Set(round).size, roundSize);
      for (const id of round.slice(0, remaining)) {
        assert.ok(!cycle.has(id), `Repeated ${id} before the cycle ended`);
        cycle.add(id);
      }
      await next.click();
      assert.equal(await page.locator('[data-picture-quiz-perfect]').textContent(), '全部答對');
      assert.ok(await page.locator('[data-picture-quiz-perfect]').isVisible());
      if (index < lastRoundIndex) await again.click();
      else {
        const saved = await getPictureProgress(page);
        assert.deepEqual(saved.practicedIds, round.slice(remaining));
        assert.notDeepEqual(saved.cycleOrder, initialOrder);
        assert.deepEqual([...saved.cycleOrder].sort(), [...initialOrder].sort());
      }
    }
    assert.deepEqual([...cycle].sort(), eligible.sort());
    assert.equal((await getPictureProgress(page)).results.length, lastRoundIndex + 1);
    console.log('PASS full question-bank rotation across rounds, mixed categories and cross-cycle fill');
  } finally {
    await page.close();
  }
}

async function checkPictureQuizBankUpdates(browser, url) {
  const page = await browser.newPage();
  try {
    const additions = words.filter(word => word.pictureQuizEligible && word.category === '動物與昆蟲').slice(0, 6)
      .map(word => ({ ...word, id: `new-${word.id}`, pictureQuizImagePath: `${word.imagePath}?new` }));
    const addedIds = additions.map(word => word.id);
    const bank = { ...wordsByQuizImage, ...Object.fromEntries(additions.map(word => [word.pictureQuizImagePath, word])) };
    let availableAdditions = [];
    let includeApple = true;
    await page.route('**/shoSenseiVocabulary.json*', route => route.fulfill({
      json: [...words.map(word => word.id === 'apple' && !includeApple ? { ...word, pictureQuizEligible: false } : word),
        ...availableAdditions],
    }));
    await page.goto(url);
    await openPictureQuiz(page);
    const answers = page.locator('[data-picture-quiz-options] .quiz-option');
    await answers.last().waitFor();
    assert.deepEqual((await getPictureProgress(page)).priorityIds, []);
    await setPictureProgress(page, { practicedIds: ['apple', 'rain'] });
    availableAdditions = additions;
    includeApple = false;
    await page.reload();
    await openPictureQuiz(page);
    await answers.last().waitFor();
    const initial = await getPictureProgress(page);
    assert.deepEqual(initial.practicedIds, ['rain']);
    assert.deepEqual(initial.priorityIds, addedIds);
    assert.ok(!initial.cycleOrder.includes('apple'));

    const [answered] = await solvePictureRound(page, { bank, limit: 1 });
    assert.ok(addedIds.includes(answered.id));
    const removed = addedIds.find(id => id !== answered.id);
    const pending = addedIds.filter(id => id !== answered.id && id !== removed);
    availableAdditions = additions.filter(({ id }) => id !== removed);
    await page.reload();
    await openPictureQuiz(page);
    await answers.last().waitFor();
    const afterRemoval = await getPictureProgress(page);
    assert.deepEqual(afterRemoval.practicedIds, ['rain', answered.id]);
    assert.deepEqual(afterRemoval.priorityIds, pending);
    assert.deepEqual(afterRemoval.results, []);

    availableAdditions = additions;
    includeApple = true;
    await page.reload();
    await openPictureQuiz(page);
    await answers.last().waitFor();
    assert.deepEqual((await getPictureProgress(page)).priorityIds, pending);
    const firstFive = (await solvePictureRound(page, { bank, limit: 5 })).map(({ id }) => id);
    assert.deepEqual(firstFive.slice(0, 4).sort(), pending.sort());
    assert.ok(!addedIds.includes(firstFive[4]));
    assert.deepEqual((await getPictureProgress(page)).priorityIds, []);
    assert.deepEqual((await getPictureProgress(page)).results, []);
    console.log('PASS additions get up to four priority slots, retain priority until answered, and remove stale progress by ID');
  } finally {
    await page.close();
  }
}

async function checkSmallPictureQuizBank(browser, url) {
  const page = await browser.newPage({ viewport: { width: 320, height: 720 } });
  try {
    let eligible = [];
    await page.route('**/shoSenseiVocabulary.json*', route => route.fulfill({
      json: words.map(word => ({ ...word, pictureQuizEligible: eligible.includes(word.id) })),
    }));
    await page.goto(url);
    await openPictureQuiz(page);
    const progress = page.locator('[data-picture-quiz-progress]');
    await progress.getByText('目前沒有可出題的圖片。').waitFor();
    assert.equal(await page.locator('[data-picture-quiz-next]').isVisible(), false);
    assert.deepEqual((await getPictureProgress(page)).results, []);

    eligible = ['dog', 'apple', 'car'];
    await page.reload();
    await openPictureQuiz(page);
    const view = page.locator('#japaneseShoSenseiPictureQuizView');
    const answers = view.locator('[data-picture-quiz-options] .quiz-option');
    const next = view.locator('[data-picture-quiz-next]');
    const again = view.locator('[data-picture-quiz-again]');
    const history = view.locator('[data-picture-quiz-history]');
    const openHistory = view.getByRole('button', { name: '歷史成績' });
    const historyBack = history.getByRole('button', { name: '返回上一層' });
    const completed = [];
    for (let index = 0; index < 22; index += 1) {
      await answers.last().waitFor();
      assert.equal(await progress.textContent(), '第 1 題／共 3 題');
      const solved = await solvePictureRound(page, { wrongAt: index === 0 ? [0] : [] });
      assert.deepEqual(solved.map(({ id }) => id).sort(), [...eligible].sort());
      await next.click();
      assert.equal(await view.locator('[data-picture-quiz-score]').textContent(),
        index === 0 ? '答對 2／3，正確率 67%' : '答對 3／3，正確率 100%');
      completed.push((await getPictureProgress(page)).results[0].id);
      if (index < 21) await again.click();
    }
    const { results } = await getPictureProgress(page);
    assert.deepEqual(results.map(({ id }) => id), completed.slice(-20).reverse());
    await page.reload();
    await openPictureQuiz(page);
    await openHistory.click();
    const cards = history.locator('article');
    assert.equal(await cards.count(), 20);
    assert.deepEqual(await cards.locator('time').evaluateAll(times => times.map(time => time.dateTime)),
      results.map(({ completedAt }) => completedAt));
    const formatted = await page.evaluate(date => new Date(date).toLocaleString('zh-TW', { hour12: false }), results[0].completedAt);
    assert.equal(await cards.first().locator('time').textContent(), formatted);
    assert.match(await cards.first().textContent(), /答對 3／3，正確率 100%/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.evaluate(() => localStorage.getItem('japanese-kana-listening-results-v1')), null);

    await historyBack.click();
    await page.evaluate(key => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (storageKey, value) {
        if (storageKey === key) throw new DOMException('Storage blocked', 'QuotaExceededError');
        setItem.call(this, storageKey, value);
      };
    }, pictureStorageKey);
    await answers.last().waitFor();
    await solvePictureRound(page);
    await next.click();
    assert.equal(await view.locator('[data-picture-quiz-score]').textContent(), '答對 3／3，正確率 100%');
    assert.match(await view.locator('[data-picture-quiz-storage]').textContent(), /紀錄.*未儲存/);
    assert.deepEqual((await getPictureProgress(page)).results, results);
    console.log('PASS empty bank, actual 3-question scores, history persistence/20-record limit and blocked storage at 320px');
  } finally {
    await page.close();
  }
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}),
    });
    const url = `http://127.0.0.1:${server.address().port}/project/japanese/`;
    assert.equal(words.length, 295);
    assert.equal(new Set(words.map(word => word.imagePath)).size, words.length);
    assert.ok(words.every(word => word.imagePath && typeof word.pictureQuizEligible === 'boolean'));

    for (const mobile of [false, true]) {
      const context = await browser.newContext(mobile ? devices['iPhone 13'] : {
        viewport: { width: 1280, height: 900 },
      });
      await context.addInitScript(installSpeechProbe);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const activate = locator => mobile ? locator.tap() : locator.click();
      await page.goto(url);

      const entry = page.locator('[data-japanese-vocabulary-entry="sho-sensei"]');
      const view = page.locator('#japaneseShoSenseiVocabularyView');
      const cards = view.locator('.sho-sensei-card');
      const card = id => view.locator(`[data-word-id="${id}"]`);
      const controls = id => card(id).getByRole('button');
      const back = view.getByRole('button', { name: '返回單字選單' });

      await activate(page.locator('[data-japanese-entry="vocabulary"]'));
      const menuCards = page.locator('#japaneseVocabularyMenuView button');
      assert.deepEqual(await menuCards.locator('h3').allTextContents(),
        ['勝老師單字', '看圖選字練習', '單字練習', '單字測驗']);
      assert.ok(await menuCards.nth(1).isEnabled());
      await activate(entry);
      await cards.last().waitFor({ state: 'attached' });
      assert.ok(await view.isVisible());
      assert.ok(!(await page.locator('#japaneseVocabularyMenuView').isVisible()));
      assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-vocabulary-title');
      assert.equal(await view.locator('.sho-sensei-category').count(), 11);
      assert.equal(await cards.count(), words.length);
      assert.equal(await card('sushi').locator('h4').textContent(), 'すし／おすし');
      assert.equal(await card('age-suffix').locator('h4').textContent(), '～歳／～才');
      assert.match(await card('age-suffix').locator('.sho-sensei-meaning').textContent(), /五歳（ごさい）/);

      const rendered = await cards.evaluateAll(nodes => nodes.map(node => ({
        id: node.dataset.wordId,
        imagePath: node.querySelector('img').getAttribute('src'),
        kana: node.querySelector('.sho-sensei-kana').textContent,
        meaning: node.querySelector('.sho-sensei-meaning').textContent,
      })));
      assert.deepEqual(rendered, words.map(({ id, imagePath, kana, meaning }) =>
        ({ id, imagePath, kana, meaning })));
      assert.deepEqual(rendered.filter(({ id }) => /^number-(?:[0-9]|10)$/.test(id)).map(({ imagePath }) => imagePath),
        numberReadings.map((_, number) => `images/sho-sensei/number-${number}.webp`));
      const renderedExamples = await cards.evaluateAll(nodes => nodes.flatMap(node =>
        [...node.querySelectorAll('.sho-sensei-examples li')].map(item =>
          [node.dataset.wordId, item.querySelector('[lang="ja"]').textContent, item.lastElementChild.textContent])));
      assert.deepEqual(renderedExamples, words.flatMap(word =>
        (word.examples || []).map(({ sentence, meaning }) => [word.id, sentence, meaning])));
      assert.equal(new Set(renderedExamples.map(([, sentence]) => sentence)).size, 10);
      assert.equal(new Set(renderedExamples.map(([id, sentence]) => `${id}:${sentence}`)).size, renderedExamples.length);
      assert.deepEqual(await card('ride').locator('.sho-sensei-examples [lang="ja"]').allTextContents(),
        ['ヨットに乗ります。', 'カヌーに乗ります。']);
      assert.ok(await card('dog').locator('.sho-sensei-examples').isHidden());
      assert.ok(await card('wash').locator('.sho-sensei-examples').isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (!mobile) {
        const images = await cards.locator('img').evaluateAll(async nodes => Promise.all(nodes.map(async image => {
          image.loading = 'eager';
          await image.decode();
          return [image.naturalWidth, image.naturalHeight];
        })));
        assert.ok(images.every(([width, height]) => width === 384 && height === 240));
      }

      // These short words need an explicit kana reading and a sentence boundary for TTS.
      const correctedReadings = {
        "elephant": "ぞう",
        "fish": "さかな",
        "egg": "たまご",
        "paper": "かみ",
        "car": "くるま",
        "boat": "ふね",
        "rain": "あめ",
        "summer": "なつ",
        "away-from-home": "るす"
      };
      for (const [id, reading] of Object.entries(correctedReadings)) {
        assert.equal(words.find(word => word.id === id)?.speechText, reading + '。', id);
      }

      const homophones = [['rain', 'あめ。'], ['candy', '飴'], ['persimmon', '柿'], ['oyster', '牡蠣']];
      for (const [id, speechText] of homophones) {
        await activate(controls(id));
        await page.waitForFunction(text => window.shoSpeechProbe.active?.text === text, speechText);
        assert.equal(await card(id).getByRole('status').textContent(), '播放中…');
      }
      const calls = await page.evaluate(() => window.shoSpeechProbe.calls);
      assert.deepEqual(calls.filter(call => call.text).map(call =>
        [call.text, call.lang, call.voiceLang]), homophones.map(([, speechText]) => [speechText, 'ja-JP', 'ja-JP']));
      const unlocks = calls.filter(call => !call.text);
      assert.equal(unlocks.length, mobile ? homophones.length : 0);
      assert.ok(unlocks.every(call => call.gesture && call.volume === 0 && call.lang === 'ja-JP'));
      assert.equal(await card('persimmon').getByRole('status').textContent(), '');

      const batchReadings = {
        japan: 'にほん', taipei: 'たいぺい', taichung: 'たいちゅう', tainan: 'たいなん',
        hsinchu: 'しんちく', kaohsiung: 'たかお',
        'month-4': 'しがつ', 'month-7': 'しちがつ', 'month-9': 'くがつ',
        'honorific-san': 'さん', 'nationality-suffix': 'じん', 'age-suffix': 'さい',
        hello: 'こんにちわ。', 'good-evening': 'こんばんわ。', 'excuse-me': 'すみません。',
        'i-am-well': 'はい、元気です。', 'thank-you-polite': 'ありがとうございます。',
        'happy-birthday': 'お誕生日おめでとうございます。',
      };
      for (const [id, speechText] of Object.entries(batchReadings)) {
        await activate(controls(id));
        await page.waitForFunction(text => window.shoSpeechProbe.active?.text === text, speechText);
      }

      await activate(back);
      assert.ok(!(await view.isVisible()));
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-vocabulary-entry'), 'sho-sensei');
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.active), null);
      assert.equal(await card('happy-birthday').locator('[role="status"]').textContent(), '');

      await activate(entry);
      await activate(controls('number-0'));
      await page.waitForFunction(() => window.shoSpeechProbe.active?.text === 'れい');
      await activate(page.locator('#japaneseMainContent [data-japanese-back-home]'));
      assert.ok(await page.locator('#japaneseHomeContent').isVisible());
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.active), null);

      await activate(page.locator('[data-japanese-entry="vocabulary"]'));
      await activate(entry);
      await page.evaluate(() => { window.shoSpeechProbe.error = 'language-unavailable'; });
      await activate(controls('dog'));
      await page.waitForFunction(() => document.querySelector('[data-word-id="dog"] [role="status"]')
        .textContent.includes('無法播放日文語音'));
      await page.evaluate(() => { window.shoSpeechProbe.error = null; });
      await activate(controls('dog'));
      await page.waitForFunction(() => window.shoSpeechProbe.active?.text === '犬');
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.active), null);

      // Leave within the same task as the click, before the prepared word enters the speech queue.
      const cancelledAt = await page.evaluate(() => {
        document.querySelector('[data-word-id="dog"] button').click();
        document.querySelector('#backToVocabularyMenuFromShoSensei').click();
        return performance.now();
      });
      await activate(page.locator('[data-japanese-vocabulary-entry="practice"]'));
      await page.locator('#vocabularyCards .word-card').first().waitFor();
      await activate(page.locator('#backToVocabularyMenuFromPractice'));
      await activate(page.locator('[data-japanese-vocabulary-entry="quiz"]'));
      await page.locator('#quizContent .quiz-option').first().waitFor();
      await activate(page.locator('#backToVocabularyStudy'));
      await page.waitForFunction(when => performance.now() - when >= 1100, cancelledAt);
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.active), null);
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.calls.filter(call => call.text).length),
        7 + Object.keys(batchReadings).length);
      if (!mobile) await checkPictureQuizQuestions(page);
      await checkPictureQuiz(page, activate, mobile);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS ${mobile ? 'iPhone-sized Chromium' : 'desktop Chromium'}: vocabulary menu, cards, picture quiz, layout and speech lifecycle (simulated speech)`);
    }
    await checkPictureQuizRotation(browser, url);
    await checkPictureQuizBankUpdates(browser, url);
    await checkSmallPictureQuizBank(browser, url);
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
