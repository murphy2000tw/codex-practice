const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'japanese/index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const questions = JSON.parse(fs.readFileSync(path.join(root, 'japaneseSentenceCompositionQuestions.json'), 'utf8'));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const grammarMenu = html.match(/<section id="japaneseGrammarMenuView"[\s\S]*?<\/section>/)?.[0] || '';
const homeGrid = html.match(/<div class="entry-grid japanese-main-entry-grid">[\s\S]*?<\/div>/)?.[0] || '';
const sentenceFns = script.match(/function resetJapaneseSentenceCompositionState\([\s\S]*?function openJapaneseSentenceCompositionPractice\([\s\S]*?\n}/)?.[0] || '';
const renderFn = script.match(/function renderJapaneseSentenceCompositionPractice\([\s\S]*?function createSentenceCompositionFeedback/)?.[0] || '';
const sentenceLineRule = css.match(/\.sentence-composition-line\s*{[\s\S]*?}/)?.[0] || '';
const slotsRule = css.match(/\.sentence-composition-slots\s*{[\s\S]*?}/)?.[0] || '';
const slotRule = css.match(/\.sentence-composition-slot\s*{[\s\S]*?}/)?.[0] || '';

assert(/data-japanese-grammar-entry="sentence-composition-practice"/.test(grammarMenu), 'grammar menu must include sentence composition practice entry');
assert(/句子重組練習/.test(grammarMenu) && /選出應放入 ★ 格的片段/.test(grammarMenu) && /開始句子重組練習/.test(grammarMenu), 'entry title/description/action mismatch');
assert((homeGrid.match(/data-japanese-entry=/g) || []).length === 5, 'Japanese home must not gain a sixth main entry');
assert(/id="japaneseSentenceCompositionView"/.test(html), 'sentence composition view must exist');
assert(/返回文法選單/.test(html), 'back to grammar menu button must exist');
assert(/JAPANESE_SENTENCE_COMPOSITION_URL/.test(html) && /japaneseSentenceCompositionQuestions\.json\?v=16b/.test(html) && /script\.js\?v=3\.0/.test(html), 'cache/query URLs must be updated');

assert(/const SENTENCE_COMPOSITION_URL/.test(script), 'sentence composition URL constant missing');
assert(/fetch\(SENTENCE_COMPOSITION_URL\)/.test(script), 'must fetch sentence composition JSON');
assert(/ensureSentenceCompositionLoaded/.test(script) && /重試/.test(script), 'load failure retry flow missing');
assert(/activeSentenceCompositionLevel/.test(script) && /\["all", "全部"\]/.test(script) && /\["N5", "N5"\]/.test(script) && /\["N4", "N4"\]/.test(script), 'all/N5/N4 filters missing');
assert(/question\.before/.test(script) && /question\.after/.test(script) && /question\.chunks/.test(script) && /question\.starSlot/.test(script), 'before/dynamic star slots/chunks/after rendering missing');
assert(/"（　）"/.test(script) && /"（★）"/.test(script) && /index === question\.starSlot/.test(script), 'must render full-width JLPT parenthesized slots with dynamic star slot');
assert(!/★＿＿＿＿/.test(script) && !/slot\.textContent[\s\S]{0,80}＿＿＿＿/.test(script), 'must not render star underline or long underline slots');
assert(!/第1格|第2格|第3格|第4格/.test(script + html), 'must not show visible per-slot labels');
assert(/questionLine\.append\(before, answerSlots, after\)/.test(script), 'before, slots, and after must share one sentence container');
assert(!/sentence-composition-line[\s\S]{0,120}display:\s*(flex|grid)/.test(css), 'sentence line must not use flex/grid to split four slots into rows');
assert(/display:\s*inline/.test(slotsRule) && /display:\s*inline-block/.test(slotRule), 'slots must be inline/inline-block');
assert(/white-space:\s*nowrap/.test(slotRule) && /word-break:\s*keep-all/.test(slotRule), 'parenthesized slots must not break internally on mobile');
const mobileRule = css.match(/@media \(max-width: 640px\) \{[\s\S]*?\n\}/)?.[0] || '';
assert(!/sentence-composition-slot[\s\S]{0,120}width:\s*100%/.test(mobileRule), 'mobile CSS must not force each slot to full width');
assert((script.match(/★ に入るものはどれですか。/g) || []).length === 2 && /aria-label", "★ に入るものはどれですか。"/.test(script), 'visible prompt should exist once and aria-label may reuse it once');
assert(/function renderJapaneseSentenceCompositionPractice\(statusText = ""\)/.test(script), 'initial aria-live status must be empty');
assert(/已選擇選項，可改選或確認。/.test(script), 'selection status message mismatch');
assert(/question\.chunks\.forEach\(\(chunk, index\)/.test(script) && /`\$\{index \+ 1\}\. \$\{chunk\.text\}`/.test(script), 'chunks must render as numbered answer options in data order');
assert(/createElement\("button"\)/.test(script) && /aria-pressed/.test(script) && /addEventListener\("click"/.test(script), 'keyboard-operable buttons/aria-pressed missing');
assert(/:focus-visible/.test(css), 'focus-visible CSS missing');
assert(/\.sentence-composition-chunks\s*{[\s\S]*display:\s*flex[\s\S]*flex-direction:\s*column/.test(css), 'answer options must be a simple numbered vertical list');
assert(!/\.sentence-composition-chunks\s*{[\s\S]*grid-template-columns/.test(css), 'answer options must not be oversized grid cards');
assert(/currentSentenceCompositionAnswer = \[chunkId\]/.test(script) && !/currentSentenceCompositionAnswer\.push/.test(script), 'single-choice star slot selection flow missing');
assert(/清除選擇/.test(script) && /確認答案/.test(script) && /下一題/.test(script), 'required action buttons missing');
assert(/confirmButton\.disabled = currentSentenceCompositionLocked \|\| !currentSentenceCompositionAnswer\.length/.test(script) && /請選擇 ★ 格的答案/.test(script) && !/alert\(/.test(sentenceFns), 'unselected answer must disable confirm and show status without alert');
assert(/currentSentenceCompositionLocked = true/.test(script) && /button\.disabled = currentSentenceCompositionLocked/.test(script), 'locking after submit missing');
assert(/correctOrder\[question\.starSlot\]/.test(script) && /getSentenceCompositionCorrectStarChunkId\(q\)/.test(script), 'answer judgment must dynamically use correctOrder[starSlot]');
assert(/答對了/.test(script) && /再看看正確順序/.test(script), 'correct/wrong feedback missing');
assert(/★格正確答案/.test(script) && /完整正確順序/.test(script) && /completeSentence/.test(script) && /kana/.test(script) && /meaning/.test(script) && /explanation/.test(script), 'complete feedback with star option/order/sentence/kana/meaning/explanation missing');
assert(/previousSentenceCompositionQuestionId/.test(script) && /!== previousSentenceCompositionQuestionId/.test(script), 'next question must avoid immediate repeat');
assert(/resetJapaneseSentenceCompositionState\(\);[\s\S]*renderJapaneseGrammarView\("menu"\)/.test(script) && /panelView !== "grammar"\) resetJapaneseSentenceCompositionState/.test(script), 'view isolation reset missing');
assert(!/japanese_mistake_book_v1[\s\S]{0,300}sentence/i.test(script) && !/questionType[\s\S]{0,200}sentence/i.test(script), 'must not add mistake-book sentence question type/write');
assert(!/JLPT|測驗結果|倒數計時/.test(sentenceFns), 'must not add JLPT/test result/countdown flow');
assert(!/innerHTML\s*=/.test(sentenceFns), 'sentence composition must not insert question content via innerHTML');
assert(!/localStorage[\s\S]{0,120}SentenceComposition|SentenceComposition[\s\S]{0,120}localStorage/.test(script), 'temporary sentence composition state must not use localStorage');
assert(/role", "status"/.test(script) && /aria-live", "polite"/.test(script), 'aria-live status missing');
assert(/env\(safe-area-inset-bottom/.test(css) && /@media \(max-width: 640px\)/.test(css), 'safe-area/mobile CSS missing');

const selectedRuleIndex = css.indexOf('.sentence-composition-chunk.is-selected');
const enabledRuleIndex = css.indexOf('.sentence-composition-chunk:not(:disabled)');
assert(selectedRuleIndex > enabledRuleIndex, 'selected option background rule must appear after general enabled option background rule');
assert(/\.sentence-composition-chunk\.is-selected:disabled/.test(css), 'locked selected option must remain visually identifiable');
assert(questions.length === 20, 'question bank must contain 20 questions');
assert(questions.filter((q) => q.level === 'N5').length === 8, 'N5 count must be 8');
assert(questions.filter((q) => q.level === 'N4').length === 12, 'N4 count must be 12');
assert(questions.every((q) => Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && q.chunks.length === 4 && Object.prototype.hasOwnProperty.call(q, 'starSlot') && Object.prototype.hasOwnProperty.call(q, 'uniqueAnswerReviewed')), 'question schema baseline missing');

const scN5003 = questions.find((q) => q.id === 'sc-n5-003');
assert(scN5003, 'sc-n5-003 must exist');
if (scN5003) {
  const starAnswerId = scN5003.correctOrder[scN5003.starSlot];
  const starAnswer = scN5003.chunks.find((chunk) => chunk.id === starAnswerId);
  const starOptionNumber = scN5003.chunks.findIndex((chunk) => chunk.id === starAnswerId) + 1;
  const renderedSkeleton = `${scN5003.before}${Array.from({ length: 4 }, (_, index) => index === scN5003.starSlot ? '（★）' : '（　）').join('')}${scN5003.after}`;
  assert(renderedSkeleton === '机の上に（　）（　）（★）（　）。', `sc-n5-003 rendered skeleton mismatch: ${renderedSkeleton}`);
  assert(scN5003.starSlot === 2, 'sc-n5-003 starSlot must remain third slot');
  assert(starAnswer?.text === '辞書が', 'sc-n5-003 star answer must remain 辞書が');
  assert(starOptionNumber === 3, 'sc-n5-003 star answer must remain option 3');
}

if (failures.length) {
  console.error('Batch 16B sentence composition practice checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16B sentence composition practice checks passed.');
