// Requires Playwright and Chromium. Mobile Chromium is not an iPhone Safari engine.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const kana = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'];
const files = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(url.pathname.endsWith('/') ? path.join(file, 'index.html') : file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wav': 'audio/wav' }[path.extname(file)];
    res.writeHead(200, { 'Content-Type': url.pathname.endsWith('/') ? 'text/html' : type || 'application/octet-stream' }).end(data);
  });
});
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}) });
  try {
    for (const mobile of [false, true]) {
      for (const real of [false, true]) {
        const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, isMobile: mobile, hasTouch: mobile });
        const page = await context.newPage(); page.setDefaultTimeout(10000);
        const errors = []; page.on('pageerror', (error) => errors.push(error.message));
        await page.addInitScript(({ real }) => {
          let seed = 463;
          Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
          window.kanaAudio = []; window.kanaTTS = 0; window.kanaMode = 'normal'; window.kanaFastTimers = false;
          window.addEventListener('click', () => { window.kanaInClick = true; }, true);
          window.addEventListener('click', () => { window.kanaInClick = false; });
          Object.defineProperty(window, 'speechSynthesis', { value: {
            getVoices: () => [], addEventListener() {}, cancel() {}, speak() { window.kanaTTS++; throw new Error('unexpected TTS'); },
          } });
          const nativeTimeout = window.setTimeout;
          window.setTimeout = (callback, delay, ...args) => nativeTimeout(callback,
            window.kanaFastTimers && (delay === 5000 || delay === 15000) ? 80 : delay, ...args);
          const NativeAudio = window.Audio;
          window.Audio = real ? class extends NativeAudio {
            constructor(src) { super(src); window.kanaAudio.push(this); }
            play() { this.inClick = window.kanaInClick; return super.play(); }
          } : class {
            constructor(src) { this.src = src; this.paused = true; window.kanaAudio.push(this); }
            play() {
              this.inClick = window.kanaInClick; this.paused = false;
              if (!this.inClick) throw new Error('play outside click stack');
              if (window.kanaMode === 'reject') return Promise.reject(new Error('native rejection'));
              if (window.kanaMode !== 'silent') this.onplaying?.();
              return Promise.resolve();
            }
            pause() { this.paused = true; }
          };
        }, { real });
        await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
        const activate = async (locator) => {
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
          if (mobile) await locator.tap(); else { await locator.focus(); await locator.press('Enter'); }
        };
        await activate(page.locator('[data-japanese-entry="kanaMenu"]'));
        for (const target of ['kanaListeningMenu', 'katakanaListeningMenu', 'katakanaListening']) await activate(page.locator(`[data-japanese-kana-entry="${target}"]`));
        await page.waitForFunction(() => document.activeElement?.id === 'katakana-listening-question');
        const play = page.locator('#katakana-listening-play'), next = page.locator('#katakana-listening-next');
        const options = page.locator('#katakana-listening-options button');
        assert.equal(await page.evaluate(() => window.kanaAudio.length), 0, 'no autoplay on entry');
        if (real) {
          const answers = [], positions = new Set();
          for (let index = 0; index < 46; index++) {
            assert.match(await page.locator('#katakana-listening-question').innerText(), new RegExp(`第 ${index + 1} 題`));
            await activate(play);
            await page.waitForFunction(() => document.querySelector('#katakana-listening-status').textContent.includes('播放完畢'));
            const audio = await page.evaluate(() => { const audio = window.kanaAudio.at(-1); return { src: audio.src, duration: audio.duration, inClick: audio.inClick }; });
            const url = new URL(audio.src), fileIndex = files.indexOf(path.basename(url.pathname, '.wav'));
            assert.ok(fileIndex >= 0); assert.equal(url.pathname, `/japanese/audio/hiragana/${files[fileIndex]}.wav`);
            assert.equal(url.search, '?v=1.0'); assert.ok(audio.duration > 0); assert.equal(audio.inClick, true);
            const answer = kana[fileIndex], labels = await options.allTextContents();
            answers.push(answer); assert.equal(new Set(labels).size, 4); assert.equal(labels.filter((label) => label === answer).length, 1);
            if (answer === 'オ') assert.ok(!labels.includes('ヲ'));
            if (answer === 'ヲ') assert.ok(!labels.includes('オ'));
            positions.add(labels.indexOf(answer));
            const picked = index % 2 ? labels.findIndex((label) => label !== answer) : labels.indexOf(answer);
            await activate(options.nth(picked));
            assert.match(await page.locator('#katakana-listening-feedback').innerText(), index % 2 ? /答錯了/ : /答對了/);
            assert.ok((await page.locator('#katakana-listening-feedback').innerText()).endsWith('正確答案：' + answer));
            assert.equal(await page.locator('#katakana-listening-options button:disabled').count(), 4);
            await activate(next);
          }
          assert.equal(new Set(answers).size, 46); assert.equal(positions.size, 4);
          await activate(play);
          const boundary = await page.evaluate(() => window.kanaAudio.at(-1).src);
          assert.notEqual(path.basename(new URL(boundary).pathname, '.wav'), files[kana.indexOf(answers.at(-1))]);
          await activate(page.locator('[data-japanese-kana-back="katakanaListeningMenu"]'));
          assert.equal(await page.evaluate(() => window.kanaAudio.every((audio) => audio.paused)), true);
          assert.equal(await page.locator(':focus').getAttribute('data-japanese-kana-entry'), 'katakanaListening');
          await activate(page.locator('[data-japanese-kana-entry="katakanaListening"]'));
          assert.match(await page.locator('#katakana-listening-question').innerText(), /第 1 題/);
          assert.equal(await page.locator('#katakana-listening-feedback').innerText(), '');
        } else {
          await activate(play);
          assert.equal(await page.evaluate(() => window.kanaAudio.at(-1).inClick), true);
          await page.evaluate(() => { const audio = window.kanaAudio.at(-1); window.kanaOld = audio; window.kanaStale = [audio.onplaying, audio.onended, audio.onerror]; });
          await activate(play); assert.equal(await page.evaluate(() => window.kanaOld.paused), true);
          await activate(options.first()); await activate(next);
          assert.equal(await page.evaluate(() => window.kanaAudio.every((audio) => audio.paused)), true);
          await activate(play);
          assert.equal(await page.evaluate(() => { const before = document.querySelector('#katakana-listening-status').textContent; window.kanaStale.forEach((event) => event?.()); return document.querySelector('#katakana-listening-status').textContent === before; }), true);
          await activate(page.locator('[data-japanese-kana-back="katakanaListeningMenu"]'));
          assert.equal(await page.evaluate(() => window.kanaAudio.every((audio) => audio.paused)), true);
          await activate(page.locator('[data-japanese-kana-entry="katakanaListening"]'));
          await page.evaluate(() => { window.kanaMode = 'reject'; }); await activate(play);
          await page.waitForFunction(() => document.querySelector('#katakana-listening-status').textContent.includes('未能播放'));
          assert.equal(await play.isEnabled(), true); assert.equal(await page.locator('#katakana-listening-play.is-playing').count(), 0);
          await page.evaluate(() => { window.kanaMode = 'normal'; }); await activate(play);
          assert.match(await page.locator('#katakana-listening-status').innerText(), /正在播放/);
          await page.evaluate(() => { window.kanaFastTimers = true; window.kanaMode = 'silent'; }); await activate(play);
          await page.waitForFunction(() => document.querySelector('#katakana-listening-status').textContent.includes('載入逾時'));
          await page.evaluate(() => { window.kanaMode = 'normal'; }); await activate(play);
          await page.waitForFunction(() => document.querySelector('#katakana-listening-status').textContent.includes('播放逾時'));
          await page.evaluate(() => { window.kanaFastTimers = false; }); await activate(play);
          await page.evaluate(() => window.kanaAudio.at(-1).onended());
          assert.match(await page.locator('#katakana-listening-status').innerText(), /播放完畢/);
          await activate(play);
          await page.evaluate(() => { const audio = window.kanaAudio.at(-1); window.kanaStale = [audio.onplaying, audio.onended, audio.onerror]; window.showJapaneseContentView('katakana'); });
          await activate(page.locator('[data-katakana="ア"]'));
          assert.equal(await page.evaluate(() => { const before = document.querySelector('#katakana-status').textContent; window.kanaStale.forEach((event) => event?.()); return document.querySelector('#katakana-status').textContent === before && window.kanaAudio.slice(0, -1).every((audio) => audio.paused); }), true);
          await page.evaluate(() => window.showJapaneseContentView('katakanaListening'));
          await activate(play); await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
          assert.equal(await page.evaluate(() => window.kanaAudio.every((audio) => audio.paused)), true);
          assert.equal(await page.locator('#katakana-listening-play.is-playing').count(), 0);
        }
        assert.equal(await page.evaluate(() => window.kanaTTS), 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
        console.log(`PASS katakana listening ${mobile ? '390px touch' : 'desktop keyboard'}: ${real ? '46 real WAVs, mixed right/wrong round, all positions, URL/gesture/ended, boundary and re-entry' : 'recording model, replay/retry, startup/completion timeouts, next/return/pagehide cancellation and stale-event isolation'}; no TTS or page errors`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
