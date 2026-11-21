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
  const probe = window.shoSpeechProbe = { calls: [], active: null, error: null };
  const synthesis = new EventTarget();
  Object.assign(synthesis, {
    getVoices: () => [{ lang: 'en-US' }, voice],
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
      queueMicrotask(() => previous?.onerror({ error: 'canceled' }));
    },
  });
  Object.defineProperty(window, 'speechSynthesis', { value: synthesis });
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
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
    assert.ok(words.every(word => word.imagePath && word.pictureQuizEligible === false));

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
      assert.ok(await menuCards.nth(1).isDisabled());
      assert.match(await menuCards.nth(1).innerText(), /準備中/);
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
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS ${mobile ? 'iPhone-sized Chromium' : 'desktop Chromium'}: cards, menu, layout and speech lifecycle with a test speech provider`);
    }
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
