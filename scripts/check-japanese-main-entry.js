const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'japanese', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

const singleContentMatch = html.match(/<section id="japaneseContent" class="japanese-content"[\s\S]*?<div id="japaneseHomeContent">[\s\S]*?<div id="japaneseMainContent" hidden>[\s\S]*?<section id="japaneseReadingPanel"/);
const homeContentMatch = html.match(/<div id="japaneseHomeContent">[\s\S]*?<\/div>\s*<div id="japaneseMainContent" hidden>/);
const mainContentMatch = html.match(/<div id="japaneseMainContent" hidden>[\s\S]*?<section id="japaneseReadingPanel"/);
const entrySectionMatch = html.match(/<section class="entry-section japanese-main-entry-section"[\s\S]*?<\/section>/);

const failures = [];

if (!singleContentMatch) {
  failures.push('Japanese views must live under one japaneseContent container before runtime replacement.');
}

if (!homeContentMatch) {
  failures.push('Japanese home content must be isolated from feature panels.');
}

if (!mainContentMatch) {
  failures.push('japaneseMainContent must remain hidden at initial render and wrap legacy vocabulary panels.');
}

if (!html.includes('data-japanese-back-home')) {
  failures.push('Feature pages must provide a return-to-home control.');
}

if (!html.includes('../script.js?v=2.3') || !html.includes('../style.css?v=2.3')) {
  failures.push('Japanese page must bump script/style asset versions so deployed browsers load the view-switching fix.');
}

if (!entrySectionMatch) {
  failures.push('Japanese main entry section is missing.');
} else {
  const entrySection = entrySectionMatch[0];
  const forbiddenMainEntryText = ['日文學習 tab', '分類篩選', '詞性分類', '程度篩選', '3179', '搜尋單字', '單字測驗入口'];
  forbiddenMainEntryText.forEach((text) => {
    if (entrySection.includes(text)) {
      failures.push(`Japanese main entry section unexpectedly contains legacy text: ${text}`);
    }
  });

  const entryTargets = [...entrySection.matchAll(/data-japanese-entry="([^"]+)"/g)].map((match) => match[1]);
  const unexpectedTargets = entryTargets.filter((target) => !['vocabulary', 'grammar', 'reading'].includes(target));
  if (unexpectedTargets.length > 0) {
    failures.push(`Only finished entry cards may navigate; unexpected targets: ${unexpectedTargets.join(', ')}`);
  }

  if (!entrySection.includes('data-japanese-entry="grammar"') || !entrySection.includes('基礎頁（整理中）') || !entrySection.includes('aria-label="聽力準備中"')) {
    failures.push('Grammar must navigate to the foundation page while listening remains coming soon.');
  }
}

const requiredScriptGuards = [
  'let currentJapaneseView = "home"',
  'function normalizeJapaneseView(view)',
  'function getJapaneseViewElement(view)',
  'function renderJapaneseView(view)',
  'japaneseContent.replaceChildren(nextViewElement)',
  'japaneseHomeContent.hidden = nextView !== "home"',
  'japaneseMainContent.hidden = nextView !== "vocabulary" && nextView !== "grammar"',
  'panel.hidden = isJapaneseHomeTab() || panel.dataset.modePanel !== activeModePanelView',
  'if (!isJapaneseHomeTab()) {',
  'renderCategoryFilters();',
  'applyCategory(activeCategoryId);',
];

requiredScriptGuards.forEach((snippet) => {
  if (!script.includes(snippet)) {
    failures.push(`Missing render guard snippet: ${snippet}`);
  }
});

const requiredUnifiedViewGuards = [
  'window.showJapaneseContentView = switchJapaneseTab',
  'button.addEventListener("click", (event) => {',
  'window.showJapaneseContentView(button.dataset.japaneseEntry)',
  'window.showJapaneseContentView("home")',
];

requiredUnifiedViewGuards.forEach((snippet) => {
  if (!script.includes(snippet)) {
    failures.push(`Missing unified script view guard snippet: ${snippet}`);
  }
});

if (html.includes('window.showJapaneseContentView = (view) =>')) {
  failures.push('Japanese page must not keep a second inline view switcher that can query moved view nodes.');
}

if (failures.length > 0) {
  console.error('Japanese main entry audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Japanese main entry audit passed.');
