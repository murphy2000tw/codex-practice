// Run with Node.js and Playwright installed; uses the local Chromium if available.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const menus = {
  kanaMenu: ['平片假名', 'home', ['平片假名練習', '平片假名聽音練習', '平片假名聽音成績']],
  kanaPracticeMenu: ['平片假名練習', 'kanaMenu', ['平假名練習', '片假名練習']],
  kanaListeningMenu: ['平片假名聽音練習', 'kanaMenu', ['平假名聽音練習', '片假名聽音練習']],
  hiraganaPracticeMenu: ['平假名練習', 'kanaPracticeMenu', ['平假名練習', '平假名濁音練習', '平假名半濁音練習', '平假名拗音練習']],
  katakanaPracticeMenu: ['片假名練習', 'kanaPracticeMenu', ['片假名練習', '片假名濁音練習', '片假名半濁音練習', '片假名拗音練習']],
  hiraganaListeningMenu: ['平假名聽音練習', 'kanaListeningMenu', ['平假名聽音練習', '平假名濁音聽音練習', '平假名半濁音聽音練習', '平假名拗音聽音練習']],
  katakanaListeningMenu: ['片假名聽音練習', 'kanaListeningMenu', ['片假名聽音練習', '片假名濁音聽音練習', '片假名半濁音聽音練習', '片假名拗音聽音練習']],
};
const extendedCharts = {
  hiraganaDakuten: 'が ぎ ぐ げ ご ざ じ ず ぜ ぞ だ ぢ づ で ど ば び ぶ べ ぼ',
  hiraganaHandakuten: 'ぱ ぴ ぷ ぺ ぽ',
  hiraganaYoon: 'きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ',
  katakanaDakuten: 'ガ ギ グ ゲ ゴ ザ ジ ズ ゼ ゾ ダ ヂ ヅ デ ド バ ビ ブ ベ ボ',
  katakanaHandakuten: 'パ ピ プ ペ ポ',
  katakanaYoon: 'キャ キュ キョ シャ シュ ショ チャ チュ チョ ニャ ニュ ニョ ヒャ ヒュ ヒョ ミャ ミュ ミョ リャ リュ リョ ギャ ギュ ギョ ジャ ジュ ジョ ビャ ビュ ビョ ピャ ピュ ピョ',
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

function mockKanaSpeech(ios) {
  const speech = { calls: [], unlocks: [], mode: 'normal', hasJapaneseVoice: true };
  window.kanaTestSpeech = speech;
  let active, inClick, unlocked;
  window.addEventListener('click', (event) => { inClick = event.isTrusted; }, true);
  window.addEventListener('click', () => { inClick = false; });
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  Object.defineProperty(window, 'speechSynthesis', {
    value: Object.assign(new EventTarget(), {
      getVoices() {
        const voices = [{ lang: 'en-US' }];
        if (speech.hasJapaneseVoice) voices.push({ lang: 'ja-JP' });
        return voices;
      },
      speak(utterance) {
        active = utterance;
        if (!utterance.text) {
          speech.unlocks.push({ inClick, lang: utterance.lang, volume: utterance.volume });
          unlocked = inClick;
          return;
        }
        speech.calls.push(utterance);
        if (ios && !unlocked) throw new Error('missing user gesture unlock');
        if (speech.mode === 'error') utterance.onerror({ error: 'synthesis-failed' });
        if (speech.mode === 'normal') utterance.onstart();
      },
      cancel() { if (active) active.cancelled = true; active = null; },
    }),
  });
  const nativeTimeout = window.setTimeout;
  window.setTimeout = (callback, delay, ...args) => {
    if (delay === 1000) delay = 40;
    if (speech.fastFailure && delay === 5000) delay = 200;
    return nativeTimeout(callback, delay, ...args);
  };
}

async function exerciseExtendedChart({ page, panel, activate, target, title, parent, round, ios }) {
  const keys = panel.locator('.hiragana-key');
  const status = panel.getByRole('status');
  const expected = extendedCharts[target].split(' ');
  const columns = target.endsWith('Yoon') ? 3 : 5;
  assert.equal(await panel.getAttribute('id'), target);
  assert.equal(await page.locator(':focus').getAttribute('id'), `${target}-title`);
  assert.equal(await panel.locator('h2').innerText(), title);
  assert.deepEqual(await keys.allTextContents(), expected);
  assert.equal(await panel.locator('.hiragana-columns > span').count(), columns + 1);
  assert.equal(await status.innerText(), '');
  assert.equal(await panel.locator('.is-playing').count(), 0);
  assert.ok(await panel.locator('.hiragana-row[role="group"]').evaluateAll((rows, size) => rows.every((row) => {
    const buttons = Array.from(row.querySelectorAll('button'));
    return buttons.length === size && buttons.every((button) => {
      const { left, right, height, top } = button.getBoundingClientRect();
      const label = document.createRange();
      label.selectNodeContents(button);
      const text = label.getBoundingClientRect();
      return left >= 0 && right <= innerWidth && height >= 44
        && top === buttons[0].getBoundingClientRect().top
        && text.left >= left && text.right <= right && label.getClientRects().length === 1;
    });
  }), columns), `${target} keys must align, fit their labels and remain inside the viewport`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-back'), parent);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), expected[0]);

  const counts = () => page.evaluate(() => ({
    audio: window.kanaTestAudio.length,
    speech: window.kanaTestSpeech.calls.length,
    unlocks: window.kanaTestSpeech.unlocks.length,
  }));
  const initial = await counts();
  for (const [index, kana] of (round === 0 ? expected : expected.slice(0, 1)).entries()) {
    const key = keys.nth(index);
    assert.equal(await key.getAttribute('lang'), 'ja');
    assert.equal(await key.getAttribute('aria-label'), `播放 ${kana} 的日文發音`);
    await activate(key, index % 2 ? 'Space' : 'Enter');
    await page.waitForFunction((count) => window.kanaTestSpeech.calls.length === count, initial.speech + index + 1);
    const spoken = await page.evaluate(() => {
      const { text, lang, voice } = window.kanaTestSpeech.calls.at(-1);
      return { text, lang, voice: voice?.lang };
    });
    assert.deepEqual(spoken, { text: kana, lang: 'ja-JP', voice: 'ja-JP' });
    assert.equal(await status.innerText(), `正在播放「${kana}」…`);
    assert.equal(await panel.locator('.is-playing').count(), 1);
    await page.evaluate(() => window.kanaTestSpeech.calls.at(-1).onend());
    assert.match(await status.innerText(), /播放完畢/);
    assert.equal(await panel.locator('.is-playing').count(), 0);
  }

  await activate(keys.first());
  await page.waitForFunction((view) => document.querySelector(`#${view} [role="status"]`).textContent.includes('正在播放'), target);
  await page.evaluate(() => { window.kanaTestSpeech.previous = window.kanaTestSpeech.calls.at(-1); });
  await activate(keys.first(), 'Space');
  await page.waitForFunction(() => window.kanaTestSpeech.calls.at(-1) !== window.kanaTestSpeech.previous);
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.previous.cancelled), true, 'replay cancels the previous request');
  await page.evaluate(() => window.kanaTestSpeech.previous.onend());
  assert.match(await status.innerText(), /正在播放/, 'stale callback leaves current playback intact');
  await activate(panel.locator('[data-japanese-kana-back]'), 'Space');
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.calls.at(-1).cancelled), true, 'return stops speech');
  const final = await counts();
  assert.equal(final.audio, initial.audio, 'extended charts use speech synthesis');
  assert.equal(final.unlocks - initial.unlocks, ios ? final.speech - initial.speech : 0);
  if (ios) {
    assert.ok(await page.evaluate(() => window.kanaTestSpeech.unlocks.every(
      ({ inClick, lang, volume }) => inClick && lang === 'ja-JP' && volume === 0)));
  }
}

async function exerciseSpeechRecovery(page, activate) {
  const entry = page.locator('[data-japanese-kana-entry="hiraganaYoon"]');
  const panel = page.locator('#hiraganaYoon');
  const status = panel.getByRole('status');
  const keys = panel.locator('.hiragana-key');
  const back = panel.locator('[data-japanese-kana-back]');
  const speechState = (state) => page.evaluate((props) => Object.assign(window.kanaTestSpeech, props), state);
  const waitForStatus = (message) => page.waitForFunction((expected) =>
    document.querySelector('#hiraganaYoon [role="status"]').textContent.includes(expected), message);
  await activate(entry);

  await speechState({ hasJapaneseVoice: false });
  await activate(keys.first());
  await waitForStatus('正在等待裝置載入日文語音');
  await speechState({ hasJapaneseVoice: true });
  await page.evaluate(() => window.speechSynthesis.dispatchEvent(new Event('voiceschanged')));
  await waitForStatus('正在播放「きゃ」');
  await page.evaluate(() => { window.kanaTestSpeech.previous = window.kanaTestSpeech.calls.at(-1); });
  await activate(keys.nth(1));
  await waitForStatus('正在播放「きゅ」');
  await page.evaluate(() => window.kanaTestSpeech.previous.onerror({ error: 'canceled' }));
  assert.match(await status.innerText(), /正在播放「きゅ」/);
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.previous.cancelled), true);
  assert.deepEqual(await panel.locator('.is-playing').allTextContents(), ['きゅ']);

  await speechState({ hasJapaneseVoice: false, fastFailure: true });
  await activate(keys.first());
  await waitForStatus('找不到日文語音');
  assert.equal(await panel.locator('.is-playing').count(), 0);
  await speechState({ hasJapaneseVoice: true, mode: 'error' });
  await activate(keys.first());
  await waitForStatus('無法播放日文語音');
  assert.equal(await panel.locator('.is-playing').count(), 0);
  await speechState({ mode: 'silent' });
  await activate(keys.first());
  await waitForStatus('無法播放日文語音');
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.calls.at(-1).cancelled), true);
  assert.equal(await panel.locator('.is-playing').count(), 0);

  await speechState({ mode: 'normal', fastFailure: false, hasJapaneseVoice: false });
  await activate(keys.first());
  await waitForStatus('正在等待裝置載入日文語音');
  const calls = await page.evaluate(() => window.kanaTestSpeech.calls.length);
  await activate(back);
  await speechState({ hasJapaneseVoice: true });
  await page.evaluate(() => window.speechSynthesis.dispatchEvent(new Event('voiceschanged')));
  await activate(entry);
  assert.equal(await status.innerText(), '');
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.calls.length), calls, 'return cancels voice wait');

  await activate(keys.first());
  await waitForStatus('正在播放「きゃ」');
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  assert.equal(await page.evaluate(() => window.kanaTestSpeech.calls.at(-1).cancelled), true);
  assert.equal(await panel.locator('.is-playing').count(), 0);
  assert.equal(await status.innerText(), '');
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true,
    ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}) });
  try {
    for (const width of [1280, 390, 320]) {
      const mobile = width < 1280;
      const ios = width === 390;
      const context = await browser.newContext({
        viewport: { width, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile,
        ...(ios ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' } : {}),
      });
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
      await page.addInitScript(mockKanaSpeech, ios);
      await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
      await page.waitForFunction(() => typeof window.showJapaneseContentView === 'function');
      const mainEntries = await page.locator('#japaneseHomeContent [data-japanese-entry]').evaluateAll((buttons) => buttons.map((button) => button.dataset.japaneseEntry));
      assert.deepEqual(mainEntries, ['vocabulary', 'reading', 'grammar', 'listening', 'reviewMenu', 'jlptMock', 'kanaMenu']);
      assert.deepEqual(await page.locator('#japaneseHomeContent .entry-card-title').allTextContents(), ['單字', '閱讀', '文法', '聽力', '複習中心', 'JLPT 模擬測驗', '平片假名']);
      const activate = async (locator, key = 'Enter') => {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
        if (mobile) await locator.tap();
        else { await locator.focus(); await page.keyboard.press(key); }
      };
      const activeView = () => page.locator('#japaneseContent > :not([hidden])');
      async function visit(view, round) {
        assert.equal(await activeView().count(), 1);
        assert.equal(await activeView().getAttribute('id'), view);
        const [title, parent, labels] = menus[view];
        assert.equal(await activeView().locator('h2').innerText(), title);
        assert.equal(await page.locator(':focus').getAttribute('id'), `${view}-title`);
        assert.deepEqual(await activeView().locator('.entry-card-title').allTextContents(), labels);
        assert.equal(await activeView().locator('[data-japanese-kana-back]').getAttribute('data-japanese-kana-back'), parent);
        assert.equal(await activeView().locator('button[disabled]').count(), /^(hiragana|katakana)ListeningMenu$/.test(view) ? 3 : 0);
        for (const disabled of await activeView().locator('button[disabled]').all()) {
          assert.match(await disabled.innerText(), /準備中/);
          assert.equal(await disabled.getAttribute('data-japanese-kana-entry'), null);
          await disabled.evaluate((button) => button.click());
          assert.equal(await activeView().getAttribute('id'), view);
        }
        for (const entry of await activeView().locator('[data-japanese-kana-entry]').all()) {
          const target = await entry.getAttribute('data-japanese-kana-entry');
          const title = await entry.locator('h3').innerText();
          const speechBeforeEntry = await page.evaluate(() => window.kanaTestSpeech.calls.length + window.kanaTestSpeech.unlocks.length);
          await activate(entry);
          if (menus[target]) await visit(target, round);
          else if (extendedCharts[target]) {
            assert.equal(await page.evaluate(() => window.kanaTestSpeech.calls.length + window.kanaTestSpeech.unlocks.length),
              speechBeforeEntry, 'entering a chart does not play speech');
            await exerciseExtendedChart({ page, panel: activeView(), activate, target, title, parent: view, round, ios });
          }
          else if (target === 'kanaListeningResults') {
            assert.match(await activeView().innerText(), /尚無完成紀錄/);
            await activate(activeView().locator('[data-japanese-kana-back]'));
          } else {
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
        await visit('kanaMenu', round);
        assert.equal(await activeView().getAttribute('id'), 'japaneseHomeContent');
        assert.equal(await page.locator(':focus').getAttribute('data-japanese-entry'), 'kanaMenu');
      }
      // Tab order includes all four pronunciation categories after menu replacement.
      await activate(page.locator('[data-japanese-entry="kanaMenu"]'));
      await activate(page.locator('[data-japanese-kana-entry="kanaPracticeMenu"]'));
      await activate(page.locator('[data-japanese-kana-entry="hiraganaPracticeMenu"]'));
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-back'), 'kanaPracticeMenu');
      for (const entry of ['hiragana', 'hiraganaDakuten', 'hiraganaHandakuten', 'hiraganaYoon']) {
        await page.keyboard.press('Tab');
        assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-entry'), entry);
      }
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('#hiraganaPracticeMenu'))), false);
      await exerciseSpeechRecovery(page, activate);
      assert.deepEqual(errors, [], 'page must have no runtime errors');
      console.log(`PASS kana navigation: ${width}px ${mobile ? 'touch' : 'keyboard'}, all 7 menus, 6 disabled listening entries, 116 extended kana with ja-JP speech, chart layout, return focus, replay, re-entry and Tab order${ios ? ', iOS gesture unlock simulation' : ''}`);
      console.log(`PASS kana speech recovery: ${width}px, voice loading, missing voice, playback error, start timeout, rapid switch, stale callbacks, retry and cancellation on return/pagehide`);
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
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
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
