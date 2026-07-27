#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = '8aa6dee7dad5b0be19737d09f918c58e53dc54bd';
const ALLOWED = new Set([
  'japanese/index.html',
  'script.js',
  'scripts/check-japanese-jlpt-batch17b2-engine.js',
  'docs/japanese-jlpt-batch17b2-engine.md',
]);
const PROTECTED = [
  'japaneseJlptKanjiPolicy.json',
  'japaneseJlptVocabularyGrammarQuestions.json',
  'scripts/build-japanese-jlpt-batch17b1-data.js',
  'scripts/check-japanese-jlpt-batch17b1-data.js',
  'docs/japanese-jlpt-batch17b1-data-policy.md',
  'vocabulary.json',
  'grammar.json',
  'japaneseReadingQuestions.js',
  'japaneseSentenceCompositionQuestions.json',
  'scripts/check-japanese-jlpt-batch17a2-entry.js',
];

function fail(message) { console.error(`FAIL: ${message}`); process.exit(1); }
function ok(message) { console.log(`OK: ${message}`); }
function git(args) { return cp.execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim(); }
function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function requireText(source, value, message) { if (!source.includes(value)) fail(message); }

try { cp.execFileSync('git', ['merge-base', '--is-ancestor', BASE, 'HEAD'], { cwd: ROOT }); }
catch { fail(`HEAD does not contain ${BASE}`); }
ok('HEAD contains the required Batch 17B-1 merge commit');

const committed = git(['diff', '--name-only', `${BASE}...HEAD`]).split('\n').filter(Boolean);
const working = cp.execFileSync('git', ['status', '--porcelain=v1'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).map((line) => line.slice(3));
const changed = new Set([...committed, ...working]);
if ([...changed].some((file) => !ALLOWED.has(file))) fail(`disallowed file changed: ${[...changed].filter((file) => !ALLOWED.has(file)).join(', ')}`);
for (const file of ALLOWED) if (!changed.has(file)) fail(`required Batch 17B-2 file is not changed: ${file}`);
ok('only the four Batch 17B-2 files are changed');

for (const file of PROTECTED) {
  if (git(['diff', '--name-only', BASE, '--', file])) fail(`protected file changed: ${file}`);
}
const forbiddenDataChanges = committed.concat(working).filter((file) => /(?:listening|reading).*Questions|japaneseSentenceCompositionQuestions/i.test(file));
if (forbiddenDataChanges.length) fail(`reading, listening, or composition data changed: ${forbiddenDataChanges.join(', ')}`);
ok('Batch 17B-1, source banks, and historical checkers are unchanged');

const html = read('japanese/index.html');
const script = read('script.js');
requireText(html, 'japaneseJlptVocabularyGrammarQuestions.json?v=17b1', 'question bank cache URL is missing');
requireText(html, '../script.js?v=3.5', 'script cache token must be 3.5');
requireText(html, '../style.css?v=2.9', 'unchanged stylesheet cache token must remain 2.9');
requireText(html, 'japaneseSentenceCompositionQuestions.json?v=16d3b', 'sentence composition token changed');
for (const id of ['japaneseJlptPanel', 'japaneseJlptStatus', 'startJapaneseJlptMock', 'backToJapaneseHomeFromJlpt', 'japaneseJlptQuestionContent']) requireText(html, `id="${id}"`, `missing ${id}`);
ok('entry markup and cache versions are correct');

const data = JSON.parse(read('japaneseJlptVocabularyGrammarQuestions.json'));
if (data.schemaVersion !== 1 || data.policyVersion !== '17b1-internal-v1' || !Array.isArray(data.questions) || data.questions.length !== 40) fail('question bank header invalid');
for (const level of ['N5', 'N4']) {
  const questions = data.questions.filter((question) => question.level === level);
  if (questions.length !== 20 || questions.some((question) => question.level !== level)) fail(`${level} filtering invalid`);
  const count = (section, type) => questions.filter((question) => question.section === section && question.questionType === type).length;
  if (count('vocabulary', 'meaning') !== 10 || count('grammar', 'meaning') !== 5 || count('grammar', 'cloze') !== 5) fail(`${level} distribution invalid`);
  if (questions.some((question) => question.kanjiPolicy !== 'kana-replacement')) fail(`${level} contains a non-kana-replacement question`);
}
ok('N5 and N4 each contain the required isolated 20-question distribution');

for (const token of ['schemaVersion !== 1', 'JAPANESE_JLPT_POLICY_VERSION', 'data.questions.length !== 40', 'question.level === selectedJapaneseJlptLevel', 'question.displayText', 'question.options', 'question.answerIndex', 'question.answerDisplay', 'question.explanation', 'questionSnapshots', 'currentIndex', 'answers']) requireText(script, token, `runtime evidence missing: ${token}`);
const engineStart = script.indexOf('const JAPANESE_JLPT_LEVELS');
const engineEnd = script.indexOf('window.showJapaneseContentView', engineStart);
if (engineStart < 0 || engineEnd < 0) fail('cannot isolate JLPT engine');
const engine = script.slice(engineStart, engineEnd);
if (/innerHTML/.test(engine)) fail('JLPT engine must not use innerHTML');
if (/localStorage|sessionStorage/.test(engine)) fail('JLPT engine must remain memory-only');
if (/setInterval|countdown|timeLimit|score|mistake|vocabulary.book/i.test(engine)) fail('out-of-scope scoring, timer, or review behavior found');
if (!/button\.disabled = Boolean\(answer\)/.test(engine) || !/next\.disabled = !answer/.test(engine)) fail('answer and next-button locking evidence missing');
const renderStart = engine.indexOf('function renderJapaneseJlptQuestion()');
const renderEnd = engine.indexOf('function renderJapaneseJlptCompletion()', renderStart);
const questionRenderer = engine.slice(renderStart, renderEnd);
if (questionRenderer.indexOf('question.answerDisplay') < questionRenderer.indexOf('if (answer)')) fail('answer detail appears before the answered guard');
requireText(engine, 'replaceChildren()', 'safe DOM clearing is missing');
requireText(engine, 'clearJapaneseJlptSession()', 'session cleanup is missing');
requireText(script, 'if (panelView !== "jlptMock") resetJapaneseJlptState()', 'view isolation cleanup is missing');
requireText(script, 'window.showJapaneseContentView("home")', 'home return is missing');
ok('safe rendering, answer gating, memory session, and view cleanup are present');

cp.execFileSync(process.execPath, ['scripts/build-japanese-jlpt-batch17b1-data.js', '--check'], { cwd: ROOT, stdio: 'inherit' });
ok('Batch 17B-1 generator check passes');
console.log('PASS: Batch 17B-2 JLPT vocabulary and grammar engine checks passed.');
