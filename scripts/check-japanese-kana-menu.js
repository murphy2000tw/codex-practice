// Run with Node.js and Playwright installed; uses the local Chromium if available.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const menus = {
  kanaMenu: ['平片假名', 'home', ['平片假名練習', '平片假名聽音練習']],
  kanaPracticeMenu: ['平片假名練習', 'kanaMenu', ['平假名練習', '片假名練習']],
  kanaListeningMenu: ['平片假名聽音練習', 'kanaMenu', ['平假名聽音練習', '片假名聽音練習']],
  hiraganaPracticeMenu: ['平假名練習', 'kanaPracticeMenu', ['平假名練習', '平假名濁音練習', '平假名半濁音練習', '平假名拗音練習']],
  katakanaPracticeMenu: ['片假名練習', 'kanaPracticeMenu', ['片假名練習', '片假名濁音練習', '片假名半濁音練習', '片假名拗音練習']],
  hiraganaListeningMenu: ['平假名聽音練習', 'kanaListeningMenu', ['平假名聽音練習', '平假名濁音聽音練習', '平假名半濁音聽音練習', '平假名拗音聽音練習']],
  katakanaListeningMenu: ['片假名聽音練習', 'kanaListeningMenu', ['片假名聽音練習', '片假名濁音聽音練習', '片假名半濁音聽音練習', '片假名拗音聽音練習']],
};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const target = url.pathname.endsWith('/') ? path.join(file, 'index.html') : file;
  fs.readFile(target, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wav': 'audio/wav' }[path.extname(target)];
    res.writeHead(200, { 'Content-Type': type || 'application/octet-stream' }).end(data);
  });
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true,
    ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}) });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript(() => {
        // Deterministic deck and observable playback; native iOS audio needs a device.
        Math.random = () => 0.999999;
        window.kanaTestAudio = [];
        window.Audio = class {
          constructor(src) { this.src = src; this.paused = true; window.kanaTestAudio.push(this); }
          play() { this.paused = false; this.onplaying?.(); return Promise.resolve(); }
          pause() { this.paused = true; }
        };
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
      await page.waitForFunction(() => typeof window.showJapaneseContentView === 'function');
      const mainEntries = await page.locator('#japaneseHomeContent [data-japanese-entry]').evaluateAll((buttons) => buttons.map((button) => button.dataset.japaneseEntry));
      assert.deepEqual(mainEntries, ['vocabulary', 'reading', 'grammar', 'listening', 'reviewMenu', 'jlptMock', 'kanaMenu']);
      assert.deepEqual(await page.locator('#japaneseHomeContent .entry-card-title').allTextContents(), ['單字', '閱讀', '文法', '聽力', '複習中心', 'JLPT 模擬測驗', '平片假名']);
      const activate = async (locator, key = 'Enter') => {
        if (mobile) await locator.tap();
        else { await locator.focus(); await page.keyboard.press(key); }
      };
      const activeView = () => page.locator('#japaneseContent > :not([hidden])');
      async function visit(view) {
        assert.equal(await activeView().count(), 1);
        assert.equal(await activeView().getAttribute('id'), view);
        const [title, parent, labels] = menus[view];
        assert.equal(await activeView().locator('h2').innerText(), title);
        assert.equal(await page.locator(':focus').getAttribute('id'), `${view}-title`);
        assert.deepEqual(await activeView().locator('.entry-card-title').allTextContents(), labels);
        assert.equal(await activeView().locator('[data-japanese-kana-back]').getAttribute('data-japanese-kana-back'), parent);
        assert.equal(await activeView().locator('button[disabled]').count(), /^(hiragana|katakana)/.test(view) ? 3 : 0);
        for (const disabled of await activeView().locator('button[disabled]').all()) {
          assert.match(await disabled.innerText(), /準備中/);
          assert.equal(await disabled.getAttribute('data-japanese-kana-entry'), null);
          await disabled.evaluate((button) => button.click());
          assert.equal(await activeView().getAttribute('id'), view);
        }
        for (const entry of await activeView().locator('[data-japanese-kana-entry]').all()) {
          const target = await entry.getAttribute('data-japanese-kana-entry');
          await activate(entry);
          if (menus[target]) await visit(target);
          else {
            const chart = target === 'hiragana' || target === 'katakana';
            const prefix = target === 'katakanaListening' ? 'katakana' : 'hiragana';
            const headingId = chart ? `${target}-title` : `${prefix}-listening-question`;
            await page.waitForFunction((id) => document.activeElement?.id === id, headingId);
            // Let the page lifecycle's queued heading focus settle before keyboard activation.
            await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
            assert.equal(await activeView().getAttribute('id'), { hiragana: 'japaneseHiraganaPanel', katakana: 'japaneseKatakanaPanel', hiraganaListening: 'japaneseHiraganaListeningPanel', katakanaListening: 'japaneseKatakanaListeningPanel' }[target]);
            if (chart) {
              assert.equal(await page.locator(`[data-${target}]`).count(), 46);
              await activate(page.locator(`[data-${target}="${target === 'hiragana' ? 'あ' : 'ア'}"]`));
            } else {
              assert.match(await page.locator(`#${prefix}-listening-question`).innerText(), /第 1 題/);
              await activate(page.locator(`#${prefix}-listening-play`));
              await activate(page.locator(`#${prefix}-listening-options button`).first());
              assert.match(await page.locator(`#${prefix}-listening-feedback`).innerText(), /答對了/);
              assert.equal(await page.locator(`#${prefix}-listening-options button:disabled`).count(), 4);
              await activate(page.locator(`#${prefix}-listening-next`));
              assert.match(await page.locator(`#${prefix}-listening-question`).innerText(), /第 2 題/);
              assert.equal(await page.locator(`#${prefix}-listening-feedback`).innerText(), '');
              await activate(page.locator(`#${prefix}-listening-play`));
            }
            assert.equal(await page.evaluate(() => window.kanaTestAudio.at(-1).paused), false,
              `${target} must start playback; page errors: ${errors.join('; ')}`);
            await activate(activeView().locator('[data-japanese-kana-back]'), 'Space');
            assert.equal(await page.evaluate(() => window.kanaTestAudio.every((audio) => audio.paused)), true, 'return must stop active playback');
          }
          assert.equal(await activeView().getAttribute('id'), view);
          assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-entry'), target, 'return must restore entry focus');
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
        await activate(activeView().locator('[data-japanese-kana-back]'), 'Space');
      }
      // Repeat sessions to exercise re-entry, clean questions and detached menu nodes.
      for (let round = 0; round < 2; round++) {
        await activate(page.locator('[data-japanese-entry="kanaMenu"]'));
        await visit('kanaMenu');
        assert.equal(await activeView().getAttribute('id'), 'japaneseHomeContent');
        assert.equal(await page.locator(':focus').getAttribute('data-japanese-entry'), 'kanaMenu');
      }
      // Tab order skips unavailable options and remains usable after menu replacement.
      await activate(page.locator('[data-japanese-entry="kanaMenu"]'));
      await activate(page.locator('[data-japanese-kana-entry="kanaPracticeMenu"]'));
      await activate(page.locator('[data-japanese-kana-entry="hiraganaPracticeMenu"]'));
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-back'), 'kanaPracticeMenu');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-entry'), 'hiragana');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('#hiraganaPracticeMenu'))), false);
      assert.deepEqual(errors, [], 'page must have no runtime errors');
      console.log(`PASS kana navigation: ${mobile ? 'mobile touch 390px' : 'desktop keyboard'}, all 7 menus, 12 disabled leaves, four practice pages, return focus, stop playback, re-entry and Tab order`);
      await context.close();
    }
    // Decode and play the existing WAVs through the real browser Audio API.
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      Math.random = () => 0.999999;
      window.kanaTestAudio = [];
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio {
        constructor(src) { super(src); window.kanaTestAudio.push(this); }
      };
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
    for (const [branch, group, leaf, play, status] of [
      ['kanaPracticeMenu', 'hiraganaPracticeMenu', 'hiragana', '[data-hiragana="か"]', '#hiragana-status'],
      ['kanaListeningMenu', 'hiraganaListeningMenu', 'hiraganaListening', '#hiragana-listening-play', '#hiragana-listening-status'],
    ]) {
      await page.locator('[data-japanese-entry="kanaMenu"]').click();
      for (const target of [branch, group, leaf]) await page.locator(`[data-japanese-kana-entry="${target}"]`).click();
      await page.locator(play).click();
      await page.waitForFunction((selector) => document.querySelector(selector).textContent.includes('播放完畢'), status);
      assert.equal(await page.evaluate(() => window.kanaTestAudio.at(-1).duration > 0), true);
      await page.locator(play).click();
      await page.locator('[data-japanese-kana-back]').click();
      assert.equal(await page.evaluate(() => window.kanaTestAudio.every((audio) => audio.paused)), true);
      await page.evaluate(() => window.showJapaneseContentView('home'));
    }
    console.log('PASS real Chromium HTML Audio: existing か chart recording and あ listening recording decode, end, replay and stop on parent return');
    await context.close();
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript(() => {
        window.kanaTestAudio = [];
        window.kanaTestTTSCalls = 0;
        const NativeAudio = window.Audio;
        window.Audio = class extends NativeAudio {
          constructor(src) { super(src); window.kanaTestAudio.push(this); }
        };
        Object.defineProperty(window, 'speechSynthesis', { value: {
          getVoices: () => [], addEventListener() {}, cancel() {},
          speak() { window.kanaTestTTSCalls++; throw new Error('Katakana must not use TTS'); },
        } });
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
      const activate = async (locator) => {
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        if (mobile) await locator.tap();
        else { await locator.focus(); await locator.press('Enter'); }
      };
      await activate(page.locator('[data-japanese-entry="kanaMenu"]'));
      for (const target of ['kanaPracticeMenu', 'katakanaPracticeMenu', 'katakana']) await activate(page.locator(`[data-japanese-kana-entry="${target}"]`));
      await page.waitForFunction(() => document.activeElement?.id === 'katakana-title');
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      const kana = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'];
      const files = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
      for (const [index, character] of kana.entries()) {
        await activate(page.locator(`[data-katakana="${character}"]`));
        await page.waitForFunction((kana) => document.querySelector('#katakana-status').textContent.includes(`「${kana}」播放完畢`), character);
        const audio = await page.evaluate(() => { const audio = window.kanaTestAudio.at(-1); return { src: audio.src, duration: audio.duration, paused: audio.paused }; });
        assert.equal(new URL(audio.src).pathname, `/japanese/audio/hiragana/${files[index]}.wav`);
        assert.ok(audio.duration > 0); assert.ok(audio.paused);
      }
      await activate(page.locator('[data-katakana="ア"]'));
      await page.evaluate(() => {
        window.kanaOldAudio = window.kanaTestAudio.at(-1);
        window.kanaStaleEvents = [window.kanaOldAudio.onplaying, window.kanaOldAudio.onended, window.kanaOldAudio.onerror];
      });
      await activate(page.locator('[data-katakana="ア"]'));
      assert.equal(await page.evaluate(() => window.kanaOldAudio.paused), true, 'replay stops old recording');
      await activate(page.locator('[data-katakana="ン"]'));
      assert.equal(await page.evaluate(() => {
        const before = document.querySelector('#katakana-status').textContent;
        window.kanaStaleEvents.forEach((event) => event?.());
        return before === document.querySelector('#katakana-status').textContent;
      }), true, 'stale events must not overwrite the new katakana state');
      await activate(page.locator('[data-japanese-kana-back="katakanaPracticeMenu"]'));
      assert.equal(await page.evaluate(() => window.kanaTestAudio.every((audio) => audio.paused)), true);
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-entry'), 'katakana');
      await activate(page.locator('[data-japanese-kana-entry="katakana"]'));
      await activate(page.locator('[data-katakana="イ"]'));
      await page.evaluate(() => {
        const audio = window.kanaTestAudio.at(-1);
        window.kanaStaleEvents = [audio.onplaying, audio.onended, audio.onerror];
        window.showJapaneseContentView('hiragana');
      });
      await page.locator('[data-hiragana="あ"]').click();
      assert.equal(await page.evaluate(() => {
        const before = document.querySelector('#hiragana-status').textContent;
        window.kanaStaleEvents.forEach((event) => event?.());
        return before === document.querySelector('#hiragana-status').textContent && window.kanaTestAudio.slice(0, -1).every((audio) => audio.paused);
      }), true, 'old katakana events cannot affect hiragana playback');
      await page.evaluate(() => window.showJapaneseContentView('katakana'));
      await page.route('**/audio/hiragana/ka.wav*', (route) => route.fulfill({ status: 404, body: 'missing' }));
      await activate(page.locator('[data-katakana="カ"]'));
      await page.waitForFunction(() => document.querySelector('#katakana-status').textContent.includes('未能播放'));
      assert.equal(await page.locator('[data-katakana].is-playing').count(), 0);
      await page.unroute('**/audio/hiragana/ka.wav*');
      await activate(page.locator('[data-katakana="カ"]'));
      await page.waitForFunction(() => document.querySelector('#katakana-status').textContent.includes('播放完畢'));
      await activate(page.locator('[data-katakana="ヲ"]'));
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      assert.equal(await page.evaluate(() => window.kanaTestAudio.every((audio) => audio.paused)), true);
      assert.equal(await page.locator('[data-katakana].is-playing').count(), 0);
      assert.equal(await page.evaluate(() => window.kanaTestTTSCalls), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(errors, []);
      console.log(`PASS katakana real HTML Audio: ${mobile ? '390px touch' : 'desktop keyboard'}, all 46 existing WAVs ended, no TTS, replay/rapid switch/return/pagehide stop, stale-event isolation across pages, HTTP 404 and retry`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
