// Run with Node, Playwright and Chromium. Speech is observed via a stub; real
// Safari/iOS speech activation still needs the manual checks in the inventory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end();
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.spoken = [];
      window.unlocks = [];
      let inClick = false;
      let cancelPending = false;
      let unlocked = false;
      let silentPending = false;
      window.addEventListener('click', () => { inClick = true; }, true);
      window.addEventListener('click', () => { inClick = false; });
      Object.defineProperty(window, 'speechSynthesis', { value: {
        cancel() { silentPending = false; cancelPending = true; queueMicrotask(() => { cancelPending = false; }); },
        speak(utterance) {
          if (utterance.volume === 0) {
            if (!inClick) throw new Error('unlock outside click event');
            if (utterance.text !== '') throw new Error('unlock must have empty text');
            unlocked = true;
            silentPending = true;
            window.unlocks.push({ text: utterance.text, volume: utterance.volume, at: Date.now() });
            return; // Deliberately never ends: the controller must retire it.
          }
          const scoped = /listening/.test(location.pathname + location.search) && !location.search.includes('geptFullMock');
          if (scoped && !unlocked) throw new Error('delayed speech without gesture unlock');
          if (scoped && cancelPending) throw new Error('cancel and delayed speak on the same stack');
          if (scoped && silentPending) throw new Error('unfinished unlock blocks speech queue');
          if (scoped) unlocked = false;
          window.spoken.push({ text: utterance.text, at: Date.now() });
        },
      } });
    });
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    const go = url => page.goto(`http://127.0.0.1:${server.address().port}/${url}`);
    const count = () => page.evaluate(() => window.spoken.length);
    const click = selector => page.locator(selector).first().evaluate(button => button.click());
    const tick = ms => page.clock.runFor(ms);
    const types = ['vocabulary', 'sentence', 'qa', 'geptPicture', 'geptQuestionResponse', 'geptConversation', 'geptShortTalk'];
    for (const type of types) {
      await go(`english/listening/practice.html?type=${type}`);
      await click('#listeningContent .answer-button');
      const expected = await page.evaluate(() => getItemText(practiceQuestions[0]));
      const playCount = () => page.evaluate(() => loadListeningProgress().items[getListeningItemId(practiceQuestions[0])].practicePlayCount);
      const priorPlays = await playCount();
      await click('.listening-play-button');
      assert.equal(await page.evaluate(() => window.unlocks.length), 1, 'unlock synchronous with play click');
      assert.equal(await playCount(), priorPlays, 'pending playback does not record progress');
      assert(await page.locator('.listening-play-button').isDisabled());
      await click('.listening-play-button');
      assert.equal(await page.evaluate(() => window.unlocks.length), 1, 'duplicate click cannot unlock again');
      await tick(999); assert.equal(await count(), 0, `${type}: silent before 1000ms`);
      await tick(1); assert.equal(await count(), 1);
      assert.equal(await page.evaluate(() => window.spoken[0].text), expected);
      assert.equal(await playCount(), priorPlays + 1);
      await click('.listening-play-button');
      await click('.gept-quiz-option');
      await tick(1000); assert.equal(await count(), 1, `${type}: answer cancels pending replay`);
      await click('.listening-play-button');
      await click('#nextListeningPracticeQuestion');
      await tick(1000); assert.equal(await count(), 1, `${type}: next cancels`);
      await click('.listening-play-button');
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      await tick(1000); assert.equal(await count(), 1, `${type}: pagehide cancels`);

      await go(`english/listening/quiz.html?type=${type}`);
      await click('#listeningContent .answer-button');
      assert.equal(await page.evaluate(() => window.unlocks.length), 1, 'start test unlocks before timer');
      assert.equal(await page.evaluate(() => testPlayedQuestionIds.size), 0, 'silent unlock does not consume play limit');
      await tick(999); assert.equal(await count(), 0);
      await tick(1); assert.equal(await count(), 1, `${type}: automatic test delayed`);
      await page.evaluate(() => playTestItemOnce(testQuestions[0]));
      assert.equal(await count(), 1, `${type}: test remains once-only`);
      await click('.gept-quiz-option');
      assert.equal(await page.evaluate(() => window.unlocks.length), 2, 'answer unlocks next question synchronously');
      await tick(450);
      assert.equal(await page.evaluate(() => window.unlocks.length), 2, 'advance timer must not unlock');
      await tick(999); assert.equal(await count(), 1);
      await tick(1); assert.equal(await count(), 2, 'automatic next plays after preparation');
      await click('.gept-quiz-option'); await tick(450);
      await click('.gept-quiz-option'); await tick(1000);
      assert.equal(await count(), 2, `${type}: answering during automatic wait cancels old question`);
      // Complete through the UI and verify result replay and restart cancellation.
      await page.evaluate(() => EnglishListeningPlayback.cancel());
      while (await page.locator('.gept-quiz-option').count()) {
        await click('.gept-quiz-option'); await tick(450);
      }
      const before = await count();
      await click('.listening-replay-button'); await click('.listening-replay-button');
      await tick(999); assert.equal(await count(), before);
      await tick(1); assert.equal(await count(), before + 1);
      await click('.listening-replay-button');
      await click('#listeningContent .answer-button');
      await tick(1000); assert.equal(await count(), before + 1, `${type}: restart cancels result replay`);
      console.log(`PASS ${type}: practice, automatic test, once-only, results, answer/next/restart/leave`);
    }
    await go('english/vocabulary/index.html?mode=listening');
    await click('.gept-listening-audio-button'); await click('.gept-listening-audio-button');
    await tick(999); assert.equal(await count(), 0);
    await tick(1); assert.equal(await count(), 1);
    await click('.gept-listening-audio-button'); await click('.gept-listening-option');
    await tick(1000); assert.equal(await count(), 1);
    await click('.gept-listening-audio-button'); await click('#nextGeptListeningQuestion');
    await tick(1000); assert.equal(await count(), 1);

    await go('english/vocabulary/listening-quiz.html');
    await click('.quiz-start-button');
    await click('.gept-listening-audio-button'); await tick(999); assert.equal(await count(), 0);
    await tick(1); assert.equal(await count(), 1);
    assert(await page.locator('.gept-listening-audio-button').isDisabled());
    await click('.gept-listening-option'); await tick(1100);
    await click('.gept-listening-audio-button'); await click('.gept-listening-option');
    await tick(1100); assert.equal(await count(), 1, 'vocabulary test answer cancels');
    while (await page.locator('.gept-listening-option').count()) {
      await click('.gept-listening-option'); await tick(1100);
    }
    await click('#geptListeningContent .word-audio-button'); await tick(999); assert.equal(await count(), 1);
    await tick(1); assert.equal(await count(), 2);
    await click('#geptListeningContent .word-audio-button');
    await page.getByRole('button', { name: '再測一次', exact: true }).evaluate(button => button.click());
    await tick(1000); assert.equal(await count(), 2);
    console.log('PASS vocabulary legacy practice/test/result/restart');
    for (const event of ['pagehide', 'beforeunload', 'hashchange', 'visibilitychange', 'navigation']) {
      await go('english/vocabulary/index.html?mode=listening');
      await click('.gept-listening-audio-button');
      await page.evaluate(event => {
        if (event === 'visibilitychange') {
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          document.dispatchEvent(new Event(event));
        } else if (event === 'navigation') {
          const link = document.querySelector('a[href]');
          link.addEventListener('click', e => e.preventDefault());
          link.click();
        } else window.dispatchEvent(new Event(event));
      }, event);
      await tick(1000); assert.equal(await count(), 0, event + ' cancels pending audio');
    }
    console.log('PASS page lifecycle, hidden tab, hash and menu navigation cancellation');

    // Leaving during the 450ms answer feedback must not schedule old audio later.
    await go('english/listening/quiz.html?type=sentence');
    await click('#listeningContent .answer-button'); await tick(1000);
    await click('.gept-quiz-option');
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await tick(2000); assert.equal(await count(), 1, 'leave cancels deferred next-question playback');

    // Full mock remains immediate, including shared result replay factory.
    await go('english/listening/quiz.html?type=geptFullMock');
    await page.evaluate(() => {
      resetMockState(); mockQuestions = selectMockQuestions();
      const entry = mockQuestions[0];
      playMockItemOnce(entry);
      const button = createListeningResultReplayButton({ ...entry, order: 1 });
      document.body.append(button); button.click();
    });
    assert.equal(await count(), 2);
    await tick(1000); assert.equal(await count(), 2);
    // Ordinary vocabulary cards are outside listening scope.
    await go('english/vocabulary/index.html?mode=practice');
    await click('#vocabularyCard .word-audio-button'); assert.equal(await count(), 1);
    assert.deepEqual(errors, []);
    console.log('PASS full mock and vocabulary cards unchanged; no browser errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
