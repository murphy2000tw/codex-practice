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

   const key='japanese-kana-listening-results-v1';
   await page.evaluate(()=>window.showJapaneseContentView('kanaMenu'));
   await page.locator('[data-japanese-kana-entry="kanaListeningResults"]').click();
   assert.match(await page.locator('#kana-listening-results-list').textContent(),/尚無完成紀錄/);
   await page.locator('[data-japanese-kana-back="kanaMenu"]').click();
   for (const kind of ['hiragana','katakana']) {
    await page.evaluate(kind=>window.showJapaneseContentView(kind+'Listening'),kind);
    // An abandoned session must not be saved.
    await page.locator('#'+kind+'-listening-options button').first().click();
    await page.evaluate(()=>window.showJapaneseContentView('kanaMenu'));
    assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]').length,key),kind==='hiragana'?0:1);
    await page.evaluate(kind=>window.showJapaneseContentView(kind+'Listening'),kind);
    const kana=await page.evaluate(kind=>Array.from(document.querySelectorAll('[data-'+kind+']'),el=>el.dataset[kind]),kind);
    // Chart panels are detached by the router; get the kana through retained globals.
    const letters=kind==='hiragana'?Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'):Array.from('アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン');
    const seen=[];
    for(let i=0;i<92;i++){
     assert.match(await page.locator('#'+kind+'-listening-question').textContent(),new RegExp('第 '+(i+1)+' 題'));
     const answer=letters[i%46]; seen.push(answer);
     const buttons=page.locator('#'+kind+'-listening-options button');
     await (i%3===0?buttons.filter({hasNotText:answer}).first():buttons.filter({hasText:new RegExp('^'+answer+'$')})).click();
     if(i<91) await page.locator('#'+kind+'-listening-next').click();
    }
    for(const letter of letters) assert.equal(seen.filter(x=>x===letter).length,2);
    assert.match(await page.locator('#'+kind+'-listening-result').textContent(),/總題數：92 題.*答對：61 題.*正確率：66%/);
    assert.equal(await page.locator('#'+kind+'-listening-next').isVisible(),false);
    assert.equal(await page.locator('#'+kind+'-listening-play').isVisible(),false);
    await page.locator('#'+kind+'-listening-next').dispatchEvent('click');
    assert.equal(await page.locator('#'+kind+'-listening-question').textContent(),'練習完成');
    const records=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    assert.equal(records.length,kind==='hiragana'?1:2);
    assert.equal(records[0].kind,kind);
    assert.equal(records[0].correct,61); assert.equal(records[0].accuracy,66);
    assert.ok(Math.abs(Date.now()-Date.parse(records[0].completedAt))<60000);
    await page.locator('#'+kind+'-listening-restart').click();
    assert.match(await page.locator('#'+kind+'-listening-stats').textContent(),/已作答：0 題.*正確率：—/);
    assert.match(await page.locator('#'+kind+'-listening-question').textContent(),/第 1 題/);
   }
   await page.evaluate(()=>{
    for(let i=0;i<25;i++) window.kanaListeningResults.save({kind:i%2?'hiragana':'katakana',completedAt:new Date(2000000000000+i*1000).toISOString(),total:92,correct:i,accuracy:Math.round(i/92*100)});
    window.showJapaneseContentView('kanaListeningResults');
   });
   const cards=page.locator('#kana-listening-results-list article');
   assert.equal(await cards.count(),20);
   const dates=await cards.locator('time').evaluateAll(els=>els.map(el=>Date.parse(el.dateTime)));
   assert.deepEqual(dates,[...dates].sort((a,b)=>b-a));
   assert.match(await cards.first().textContent(),/片假名.*92 題.*答對：24 題.*26%/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('[data-japanese-kana-back="kanaMenu"]').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#kanaMenu').isVisible(),true);
   await page.evaluate(()=>{Math.random=()=>0.25; window.showJapaneseContentView('hiraganaListening');});
   assert.ok(await page.locator('#hiragana-listening-options button').count()===4);
   await page.evaluate(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
   assert.equal(await page.evaluate(()=>window.kanaListeningResults.read().length),0);
   assert.equal(await page.evaluate(()=>window.kanaListeningResults.save({})),false);
   assert.deepEqual(errors,[]); await page.close();
   console.log(`PASS 92-question sessions and results at ${width}px: both pages, correct/wrong, menu reset, live-region markup and no overflow/errors`);
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
