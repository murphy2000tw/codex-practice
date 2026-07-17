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

assert(/data-japanese-grammar-entry="sentence-composition"/.test(grammarMenu), 'grammar menu must include sentence composition entry');
assert(/句子重組/.test(grammarMenu) && /選出應放入 ★ 格的片段/.test(grammarMenu) && /開始 ★ 格練習/.test(grammarMenu), 'entry title/description/action mismatch');
assert((homeGrid.match(/data-japanese-entry=/g) || []).length === 5, 'Japanese home must not gain a sixth main entry');
assert(/id="japaneseSentenceCompositionView"/.test(html), 'sentence composition view must exist');
assert(/返回文法選單/.test(html), 'back to grammar menu button must exist');
assert(/JAPANESE_SENTENCE_COMPOSITION_URL/.test(html) && /japaneseSentenceCompositionQuestions\.json\?v=16b/.test(html) && /script\.js\?v=2\.9/.test(html), 'cache/query URLs must be updated');

assert(/const SENTENCE_COMPOSITION_URL/.test(script), 'sentence composition URL constant missing');
assert(/fetch\(SENTENCE_COMPOSITION_URL\)/.test(script), 'must fetch sentence composition JSON');
assert(/ensureSentenceCompositionLoaded/.test(script) && /重試/.test(script), 'load failure retry flow missing');
assert(/activeSentenceCompositionLevel/.test(script) && /\["all", "全部"\]/.test(script) && /\["N5", "N5"\]/.test(script) && /\["N4", "N4"\]/.test(script), 'all/N5/N4 filters missing');
assert(/question\.before/.test(script) && /question\.after/.test(script) && /question\.chunks/.test(script) && /question\.starSlot/.test(script), 'before/dynamic star slots/chunks/after rendering missing');
assert(/★＿＿＿＿/.test(script) && /＿＿＿＿/.test(script) && /index === question\.starSlot/.test(script), 'must render four underline slots with dynamic star slot');
assert(!/第 \${index \+ 1} 格`, `sentence-composition-slot/.test(script), 'must not render four large per-slot input buttons');
assert(/question\.chunks\.forEach\(\(chunk, index\)/.test(script) && /`\$\{index \+ 1\}\. \$\{chunk\.text\}`/.test(script), 'chunks must render as numbered answer options in data order');
assert(/currentSentenceCompositionAnswer = \[chunkId\]/.test(script) && !/currentSentenceCompositionAnswer\.push/.test(script) && /aria-pressed/.test(script), 'single-choice star slot selection flow missing');
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
assert(/createElement\("button"\)/.test(script) && /addEventListener\("click"/.test(script), 'keyboard-operable buttons must use real button elements');
assert(/sentence-composition/.test(css) && /overflow-wrap: anywhere/.test(css) && /grid-template-columns: repeat\(auto-fit/.test(css) && /env\(safe-area-inset-bottom/.test(css) && /:focus-visible/.test(css) && /@media \(max-width: 640px\)/.test(css), 'mobile/focus/safe-area CSS missing');

const selectedRuleIndex = css.indexOf('.sentence-composition-chunk.is-selected');
const enabledRuleIndex = css.indexOf('.sentence-composition-chunk:not(:disabled)');
assert(selectedRuleIndex > enabledRuleIndex, 'selected option background rule must appear after general enabled option background rule');
assert(/\.sentence-composition-chunk\.is-selected:disabled/.test(css), 'locked selected option must remain visually identifiable');
assert(questions.length === 20, 'question bank must contain 20 questions');
assert(questions.filter((q) => q.level === 'N5').length === 8, 'N5 count must be 8');
assert(questions.filter((q) => q.level === 'N4').length === 12, 'N4 count must be 12');
assert(questions.every((q) => Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && q.chunks.length === 4 && Object.prototype.hasOwnProperty.call(q, 'starSlot') && Object.prototype.hasOwnProperty.call(q, 'uniqueAnswerReviewed')), 'question schema baseline missing');

if (failures.length) {
  console.error('Batch 16B sentence composition practice checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Batch 16B sentence composition practice checks passed.');
