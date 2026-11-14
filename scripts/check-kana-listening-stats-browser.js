// Run with Node.js and Playwright installed; uses the local Chromium if available.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
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
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const browser = await chromium.launch({headless:true, executablePath:'/usr/bin/chromium'});
 try {
  for (const width of [320,390,1280]) {
   const page = await browser.newPage({viewport:{width,height:900}});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{Math.random=()=>0.999999;});
   await page.goto(`http://127.0.0.1:${server.address().port}/japanese/`);
   for (const kind of ['hiragana','katakana']) {
    await page.evaluate(kind=>window.showJapaneseContentView(kind+'Listening'),kind);
    const stats=page.locator(`#${kind}-listening-stats`);
    assert.match(await stats.textContent(),/已作答：0 題.*正確率：—/);
    const first=kind==='hiragana'?'あ':'ア';
    await page.locator(`#${kind}-listening-options button`).filter({hasText:new RegExp('^'+first+'$')}).click();
    assert.match(await stats.textContent(),/已作答：1 題.*答對：1 題.*正確率：100%/);
    await page.locator(`#${kind}-listening-next`).click();
    const second=kind==='hiragana'?'い':'イ';
    await page.locator(`#${kind}-listening-options button`).filter({hasNotText:second}).first().click();
    assert.match(await stats.textContent(),/已作答：2 題.*答對：1 題.*正確率：50%/);
    assert.equal(await stats.getAttribute('aria-atomic'),'true');
    assert.ok(await stats.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&el.scrollWidth<=el.clientWidth;}));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator(`[data-japanese-kana-back="${kind}ListeningMenu"]`).click();
    await page.locator(`[data-japanese-kana-entry="${kind}Listening"]`).click();
    assert.match(await stats.textContent(),/已作答：0 題.*正確率：—/);
   }
   assert.deepEqual(errors,[]); await page.close();
   console.log(`PASS browser stats at ${width}px: both pages, correct/wrong, menu reset, live-region markup and no overflow/errors`);
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
