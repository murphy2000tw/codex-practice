// Run with Node.js and Playwright installed. The iPhone profile still uses Chromium.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const root = path.resolve(__dirname, '..');
const words = require('../japanese/shoSenseiVocabulary.json');
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
  assert.equal(eligibleWords.length, 118);
  for (const word of eligibleWords) {
    assert.equal(new Set(word.pictureQuizDistractorIds).size, word.pictureQuizDistractorIds.length, word.id);
    for (const id of word.pictureQuizDistractorIds) {
      const candidate = wordById.get(id);
      assert.ok(candidate && candidate.category !== word.category && candidate.kana !== word.kana, `${word.id}/${id}`);
    }
  }
  for (const id of ['name', 'written-character', 'monday', 'number-100', 'stay-home']) {
    assert.equal(wordById.get(id).pictureQuizEligible, false, id);
  }

  const { rounds, labels, fallback, skipped } = await page.evaluate((bank) => {
    const makeRound = words => createShoSenseiPictureQuestions(words, shuffleJapaneseJlptArray);
    const wordsById = new Map(bank.map(word => [word.id, { ...word, pictureQuizEligible: false }]));
    const testRain = ids => makeRound([...wordsById.values(), {
      ...wordsById.get('rain'), pictureQuizEligible: true, pictureQuizDistractorIds: ids,
    }]);
    return {
      rounds: Array.from({ length: 20 }, () => makeRound(bank).map(({ answer, options, correctPosition }) => ({
        answer: answer.id, options: options.map(word => word.id), correctPosition,
      }))),
      labels: Object.fromEntries(['rain', 'candy', 'persimmon', 'oyster', 'number-10'].map(id =>
        [id, getShoSenseiPictureOptionLabel(wordsById.get(id))])),
      fallback: testRain(['candy', 'dog', 'cat']).map(({ options }) => options.map(word => word.id)),
      skipped: testRain(['candy', 'snow', 'paper', 'paper', 'missing']).length,
    };
  }, words);
  assert.deepEqual(labels, { rain: '雨（あめ）', candy: '飴（あめ）', persimmon: '柿（かき）', oyster: '牡蠣（かき）', 'number-10': 'じゅう' });
  assert.deepEqual(fallback.map(options => options.sort()), [['cat', 'dog', 'rain']]);
  assert.equal(skipped, 0);
  assert.ok(rounds.some(round => round[0].correctPosition !== rounds[0][0].correctPosition));
  assert.ok(rounds.some(round => round[0].answer !== rounds[0][0].answer));
  for (const round of rounds) {
    assert.deepEqual(round.map(question => question.answer).sort(), eligibleWords.map(word => word.id).sort());
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
  const calls = () => page.evaluate(() => window.shoSpeechProbe.calls.filter(call => call.text));
  const labelFor = word => page.evaluate(word => getShoSenseiPictureOptionLabel(word), word);
  const waitForSpeech = text => page.waitForFunction(text => window.shoSpeechProbe.active?.text === text, text);
  const assertIdle = () => page.waitForFunction(() => window.shoSpeechProbe.active === null);

  await activate(entry);
  await answers.last().waitFor();
  assert.match(await progress.textContent(), /^第 1 題／共 118 題$/);
  assert.equal(await page.locator(':focus').getAttribute('id'), 'sho-sensei-picture-quiz-title');
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
  const firstWord = words.find(word => word.imagePath === firstImagePath);
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

  const wrong = optionWords.findIndex(word => word.id !== firstWord.id);
  await activate(answers.nth(wrong));
  assert.equal(await feedback.textContent(), `答錯了。正確答案是 ${await labelFor(firstWord)}`);
  assert.equal(await answers.nth(wrong).evaluate(node => node.classList.contains('is-wrong')), true);
  assert.equal(await view.locator('.quiz-option:disabled').count(), 3);
  assert.equal(await image.getAttribute('src'), firstImagePath);
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

  await activate(entry);
  await answers.last().waitFor();
  assert.match(await progress.textContent(), /^第 1 題/);
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
  const current = words.find(word => word.imagePath === currentImagePath);
  const currentOptions = await getOptionWords();
  await activate(answers.nth(currentOptions.findIndex(word => word.id === current.id)));
  assert.equal(await feedback.textContent(), `答對了！正確答案是 ${await labelFor(current)}`);
  await activate(restart);
  await answers.last().waitFor();
  assert.match(await progress.textContent(), /^第 1 題/);
  assert.equal(await feedback.textContent(), '');
  assert.ok(await next.isHidden());

  if (!mobile) {
    // Walk this round at the actual UI entry so the fixed PR #334 reading and the final score are exercised.
    const solveUntil = stopAt => page.evaluate(({ words, stopAt }) => {
      const view = document.querySelector('#japaneseShoSenseiPictureQuizView');
      const panel = view.querySelector('[data-picture-quiz-question]');
      const image = panel.querySelector('img');
      const next = view.querySelector('[data-picture-quiz-next]');
      const byImage = new Map(words.map(word => [word.imagePath, word]));
      while (!panel.hidden) {
        const word = byImage.get(image.getAttribute('src'));
        if (word.id === stopAt) return;
        const right = [...panel.querySelectorAll('.quiz-option')].find(button =>
          button.textContent === getShoSenseiPictureOptionLabel(word));
        if (!right) throw new Error(`Missing answer for ${word.id}`);
        right.click();
        if (!right.classList.contains('is-correct')) throw new Error(`Incorrect answer key for ${word.id}`);
        next.click();
      }
    }, { words, stopAt });
    await solveUntil('rain');
    await activate(view.getByRole('button', { name: '聽發音：雨（あめ）', exact: true }));
    await waitForSpeech('あめ。');
    await solveUntil(null);
    await assertIdle();
    assert.equal(await progress.textContent(), '完成練習！答對 118 題，共 118 題。');
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
    assert.equal(words.length, 221);
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
      assert.equal(await view.locator('.sho-sensei-category').count(), 9);
      assert.equal(await cards.count(), words.length);
      assert.equal(await card('sushi').locator('h4').textContent(), 'すし／おすし');

      const rendered = await cards.evaluateAll(nodes => nodes.map(node => ({
        id: node.dataset.wordId,
        imagePath: node.querySelector('img').getAttribute('src'),
        kana: node.querySelector('.sho-sensei-kana').textContent,
        meaning: node.querySelector('.sho-sensei-meaning').textContent,
      })));
      assert.deepEqual(rendered, words.map(({ id, imagePath, kana, meaning }) =>
        ({ id, imagePath, kana, meaning })));
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

      await activate(back);
      assert.ok(!(await view.isVisible()));
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-vocabulary-entry'), 'sho-sensei');
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.active), null);
      assert.equal(await card('oyster').locator('[role="status"]').textContent(), '');

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
      assert.equal(await page.evaluate(() => window.shoSpeechProbe.calls.filter(call => call.text).length), 7);
      if (!mobile) await checkPictureQuizQuestions(page);
      await checkPictureQuiz(page, activate, mobile);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS ${mobile ? 'iPhone-sized Chromium' : 'desktop Chromium'}: vocabulary menu, cards, picture quiz, layout and speech lifecycle (simulated speech)`);
    }
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
