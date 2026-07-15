const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const planPath = path.join(root, 'docs/japanese-review-center-batch15a-plan.md');
const plan = fs.readFileSync(planPath, 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const vocabulary = JSON.parse(fs.readFileSync(path.join(root, 'vocabulary.json'), 'utf8'));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const lineCount = plan.split(/\r?\n/).length;
assert(lineCount <= 800, `Plan must be 800 lines or fewer; got ${lineCount}.`);

const storageKeys = [...script.matchAll(/const\s+JAPANESE_[A-Z_]+KEY\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
storageKeys.forEach((key) => assert(plan.includes(`\`${key}\``), `Plan must list existing storage key ${key}.`));
assert(storageKeys.length === 3, `Expected 3 existing Japanese storage keys; got ${storageKeys.length}.`);
assert(/不得被生字本／錯題本清除/.test(plan), 'Plan must state seen-count keys are not clearable by review data.');
assert(!/seen-count key[\s\S]{0,80}(清空生字本|清空錯題本)/i.test(plan), 'Plan must not treat seen-count keys as vocabulary/mistake data.');

['日文單字測驗', '日文文法意思測驗', '日文文法填空測驗', '日文閱讀測驗', '日文聽力測驗'].forEach((label) => {
  assert(plan.includes(label), `Plan must audit ${label}.`);
});
assert(plan.includes('核准來源只有兩個'), 'Plan must limit vocabulary book sources to two approved sources.');
assert(plan.includes('日文單字練習卡') && plan.includes('閱讀練習查字卡'), 'Plan must name the two vocabulary book sources.');
['單字測驗選項', '閱讀測驗', '文法頁面', '聽力頁面', '英文網站'].forEach((forbidden) => {
  assert(plan.includes(`暫不從${forbidden}`) || plan.includes(forbidden), `Plan should explicitly exclude ${forbidden}.`);
});
assert(plan.includes('schemaVersion'), 'Recommended schema must include schemaVersion.');
assert(plan.includes('不得保存完整題庫物件'), 'Mistake records must not embed full question bank objects.');
assert(plan.includes('穩定 ID'), 'Plan must prioritize stable IDs.');
assert(plan.includes('損壞 JSON') && plan.includes('localStorage 不可用'), 'Plan must handle corrupt/unavailable localStorage.');
assert(plan.includes('不得碰 `japanese_*_seen_counts`') || plan.includes('不影響 seen-count key'), 'Clear operations must not affect existing progress.');
['間隔重複', '弱點排行', '統計圖表', '熟練度', '自動排程', '每日複習提醒', '雲端同步', '帳號', '匯出'].forEach((advanced) => {
  const onlyDeferred = new RegExp(`${advanced}[\\s\\S]{0,80}(留|不|未來|不得|另做)`).test(plan);
  assert(onlyDeferred, `Batch 15B feature should be deferred, not planned as 15A implementation: ${advanced}.`);
});

const touched = cp.execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
const allowed = new Set([
  'scripts/audit-japanese-review-center-batch15a.js',
  'scripts/check-japanese-review-center-batch15a-plan.js',
  'docs/japanese-review-center-batch15a-plan.md',
]);
touched.forEach((file) => assert(allowed.has(file), `Formal program/question-bank file must not be modified: ${file}`));
assert(!touched.includes('vocabulary.json'), 'vocabulary.json must not be modified.');

const required = ['id', 'word', 'kana', 'meaning', 'partOfSpeech', 'level'];
const duplicate = (items) => items.length - new Set(items).size;
assert(vocabulary.length === 3241, 'vocabulary total must remain 3241.');
assert(vocabulary.filter((item) => item.level === 'N5').length === 1021, 'N5 count must remain 1021.');
assert(vocabulary.filter((item) => item.level === 'N4').length === 2220, 'N4 count must remain 2220.');
assert(duplicate(vocabulary.map((item) => item.id)) === 0, 'duplicate id must remain 0.');
assert(duplicate(vocabulary.map((item) => item.word)) === 0, 'duplicate word must remain 0.');
assert(vocabulary.filter((item) => required.some((field) => !String(item[field] ?? '').trim())).length === 0, 'missing required fields must remain 0.');

if (failures.length) {
  console.error('Batch 15A-1 review center plan check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Batch 15A-1 review center plan check passed: ${lineCount} lines, ${storageKeys.length} storage keys, five quizzes, schemas, safety rules, and vocabulary baseline verified.`);
