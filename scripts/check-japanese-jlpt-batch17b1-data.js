#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = '81dffd2e72667f05d411df73c7b9db372386dff0';
const ALLOWED = [
  'docs/japanese-jlpt-batch17b1-data-policy.md',
  'japaneseJlptKanjiPolicy.json',
  'japaneseJlptVocabularyGrammarQuestions.json',
  'scripts/build-japanese-jlpt-batch17b1-data.js',
  'scripts/check-japanese-jlpt-batch17b1-data.js'
].sort();
const REQUIRED_FIELDS = {
  id: 'string',
  level: 'string',
  section: 'string',
  questionType: 'string',
  sourceIds: 'array',
  originalText: 'string',
  displayText: 'string',
  kana: 'string',
  rubyTerms: 'array',
  kanjiPolicy: 'string',
  options: 'array',
  answerIndex: 'number',
  answerDisplay: 'object',
  explanation: 'string',
  timeLimit: 'null',
  scoreWeight: 'number',
  reviewTags: 'array'
};

function run(command) {
  return cp.execSync(command, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function hasHan(value) {
  return /\p{Script=Han}/u.test(String(value || ''));
}

function assertType(question, field, expected) {
  if (!(field in question)) fail(`${question.id || '<missing id>'} missing required field ${field}`);
  const value = question[field];
  if (expected === 'array') {
    if (!Array.isArray(value)) fail(`${question.id} field ${field} must be an array`);
    return;
  }
  if (expected === 'null') {
    if (value !== null) fail(`${question.id} field ${field} must be null`);
    return;
  }
  if (expected === 'object') {
    if (!value || Array.isArray(value) || typeof value !== 'object') fail(`${question.id} field ${field} must be an object`);
    return;
  }
  if (typeof value !== expected) fail(`${question.id} field ${field} must be ${expected}`);
}

function assertNonEmptyObject(question, field) {
  const value = question[field];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length === 0) fail(`${question.id} ${field} must be a non-empty object`);
  for (const [key, nested] of Object.entries(value)) {
    if (nested === null || nested === undefined || nested === '') fail(`${question.id} ${field}.${key} must be non-empty`);
  }
}

function assertQuestionShape(question) {
  for (const [field, expected] of Object.entries(REQUIRED_FIELDS)) assertType(question, field, expected);
  if (!['N5', 'N4'].includes(question.level)) fail(`${question.id} has invalid level`);
  if (!['vocabulary', 'grammar'].includes(question.section)) fail(`${question.id} has invalid section`);
  if (!['meaning', 'cloze'].includes(question.questionType)) fail(`${question.id} has invalid questionType`);
  if (!question.sourceIds.length || question.sourceIds.some((id) => typeof id !== 'string' || id.length === 0)) fail(`${question.id} sourceIds must be a non-empty string array`);
  if (!question.originalText || !question.displayText || !question.kana) fail(`${question.id} text fields must be non-empty`);
  if (question.rubyTerms.length !== 0) fail(`${question.id} rubyTerms must be empty in Batch 17B-1`);
  if (question.kanjiPolicy !== 'kana-replacement') fail(`${question.id} must use kana-replacement`);
  if (question.options.length !== 4 || new Set(question.options).size !== 4 || question.options.some((option) => typeof option !== 'string' || option.length === 0)) fail(`${question.id} must have four distinct non-empty string options`);
  if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex > 3) fail(`${question.id} answerIndex must be an integer from 0 to 3`);
  assertNonEmptyObject(question, 'answerDisplay');
  if (!question.explanation) fail(`${question.id} explanation must be non-empty`);
  if (question.timeLimit !== null) fail(`${question.id} timeLimit must be null`);
  if (question.scoreWeight !== 1) fail(`${question.id} scoreWeight must be 1`);
  if (!question.reviewTags.length || question.reviewTags.some((tag) => typeof tag !== 'string' || tag.length === 0)) fail(`${question.id} reviewTags must be a non-empty string array`);
}

try {
  cp.execFileSync('git', ['merge-base', '--is-ancestor', BASE, 'HEAD'], { cwd: ROOT });
  ok('HEAD contains required Batch 17A-2 merge commit');
} catch {
  fail('HEAD does not contain required Batch 17A-2 merge commit');
}

const baseChanges = run(`git diff --name-status ${BASE}...HEAD`).split('\n').filter(Boolean).map((line) => line.split(/\s+/));
const workingChanges = cp.execSync('git status --porcelain=v1', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).map((line) => [line.slice(0, 2).trim() || '??', line.slice(3)]);
const allChangedFiles = new Set([...baseChanges, ...workingChanges].map(([, file]) => file));
if (allChangedFiles.size !== 5 || [...allChangedFiles].some((file) => !ALLOWED.includes(file))) fail(`only Batch 17B-1 five files may change; saw ${[...allChangedFiles].join(', ')}`);
if (baseChanges.some(([status, file]) => status !== 'A' || !ALLOWED.includes(file))) fail('relative to the Batch 17A-2 base, the Batch 17B-1 files must only be additions');
ok('only the original five Batch 17B-1 files are changed');

for (const file of ['japanese/index.html', 'script.js', 'style.css', 'vocabulary.json', 'grammar.json', 'japaneseSentenceCompositionQuestions.json']) {
  if (run(`git diff --name-only ${BASE}...HEAD -- ${file}`) || run(`git diff --name-only -- ${file}`)) fail(`${file} is modified`);
}
ok('runtime and source data files are unmodified');

for (const file of ['docs/japanese-jlpt-batch17a-plan.md', 'scripts/check-japanese-jlpt-batch17a-plan.js', 'scripts/check-japanese-jlpt-batch17a2-entry.js']) {
  if (fs.existsSync(path.join(ROOT, file)) && (run(`git diff --name-only ${BASE}...HEAD -- ${file}`) || run(`git diff --name-only -- ${file}`))) fail(`${file} is modified`);
}
ok('existing Batch 17A audit files are unmodified');

const vocabulary = readJson('vocabulary.json');
const grammar = readJson('grammar.json');
const vocabularyCounts = { N5: vocabulary.filter((item) => item.level === 'N5').length, N4: vocabulary.filter((item) => item.level === 'N4').length };
const grammarCounts = { N5: grammar.filter((item) => item.level === 'N5').length, N4: grammar.filter((item) => item.level === 'N4').length };
if (vocabulary.length !== 3241 || vocabularyCounts.N5 !== 1021 || vocabularyCounts.N4 !== 2220) fail('vocabulary counts changed');
if (grammar.length !== 290 || grammarCounts.N5 !== 80 || grammarCounts.N4 !== 210) fail('grammar counts changed');
ok('vocabulary and grammar counts match expected baselines');

const policy = readJson('japaneseJlptKanjiPolicy.json');
if (policy.schemaVersion !== 1 || policy.policyVersion !== '17b1-internal-v1' || policy.lastUpdated !== '2026-07-24') fail('policy version fields invalid');
if (!/non-official|not an official/i.test(policy.disclaimer || '')) fail('policy lacks non-official disclaimer');
if (JSON.stringify(policy.allowedPolicies) !== JSON.stringify(['level-native', 'ruby-required', 'kana-replacement', 'excluded'])) fail('allowedPolicies invalid');
if (JSON.stringify(policy.fallbackOrder) !== JSON.stringify(['kana-replacement', 'ruby-required', 'excluded'])) fail('fallbackOrder invalid');
for (const level of ['N5', 'N4']) {
  const levelPolicy = policy.levels && policy.levels[level];
  if (!levelPolicy || !Array.isArray(levelPolicy.kanjiAllowList) || levelPolicy.kanjiAllowList.length !== 0 || levelPolicy.reviewStatus !== 'pending' || !levelPolicy.reviewNote) fail(`${level} policy review fields invalid`);
}
ok('policy schema and pending allow-lists are valid');

const data = readJson('japaneseJlptVocabularyGrammarQuestions.json');
const questions = data.questions;
if (data.schemaVersion !== 1 || data.policyVersion !== policy.policyVersion || !Array.isArray(questions) || questions.length !== 40) fail('question bank header/count invalid');

const specs = [
  ['jlpt-vocab-n5-', 10, 'N5', 'vocabulary', 'meaning'],
  ['jlpt-vocab-n4-', 10, 'N4', 'vocabulary', 'meaning'],
  ['jlpt-grammar-meaning-n5-', 5, 'N5', 'grammar', 'meaning'],
  ['jlpt-grammar-cloze-n5-', 5, 'N5', 'grammar', 'cloze'],
  ['jlpt-grammar-meaning-n4-', 5, 'N4', 'grammar', 'meaning'],
  ['jlpt-grammar-cloze-n4-', 5, 'N4', 'grammar', 'cloze']
];
const ids = new Set();
const answerDistribution = [0, 0, 0, 0];
const correctAnswers = new Set();
const displayKeys = new Set();
const vocabularyById = new Map(vocabulary.map((item) => [String(item.id), item]));
const grammarById = new Map(grammar.map((item) => [item.id, item]));
const vocabularyMeaningsByLevel = new Map(['N5', 'N4'].map((level) => [level, new Set(vocabulary.filter((item) => item.level === level).map((item) => item.meaning))]));

for (const [prefix, count, level, section, type] of specs) {
  const group = questions.filter((question) => question.id.startsWith(prefix));
  if (group.length !== count) fail(`${prefix} count invalid`);
  const groupAnswerDistribution = [0, 0, 0, 0];
  group.forEach((question, index) => {
    const expectedId = `${prefix}${String(index + 1).padStart(3, '0')}`;
    if (question.id !== expectedId) fail(`expected ${expectedId}`);
    if (question.level !== level || question.section !== section || question.questionType !== type) fail(`${question.id} metadata invalid`);
    groupAnswerDistribution[question.answerIndex] += 1;
  });
  if (count === 10 && Math.max(...groupAnswerDistribution) - Math.min(...groupAnswerDistribution) > 1) fail(`${prefix} answer distribution imbalance`);
}

for (const question of questions) {
  assertQuestionShape(question);
  if (ids.has(question.id)) fail(`duplicate id ${question.id}`);
  ids.add(question.id);
  if (hasHan(question.displayText)) fail(`${question.id} displayText contains unclassified Han characters`);
  answerDistribution[question.answerIndex] += 1;

  const displayKey = `${question.level}|${question.section}|${question.questionType}|${question.displayText}`;
  if (displayKeys.has(displayKey)) fail(`duplicate displayText within level/section/type: ${displayKey}`);
  displayKeys.add(displayKey);

  const correctKey = `${question.level}|${question.section}|${question.questionType}|${question.options[question.answerIndex]}`;
  if (correctAnswers.has(correctKey)) fail(`duplicate correct answer ${correctKey}`);
  correctAnswers.add(correctKey);

  if (question.section === 'vocabulary') {
    const source = vocabularyById.get(question.sourceIds[0]);
    if (!source || source.level !== question.level) fail(`${question.id} vocabulary source missing or cross-level`);
    if (question.originalText !== source.word || question.displayText !== source.kana || question.kana !== source.kana || question.options[question.answerIndex] !== source.meaning) fail(`${question.id} vocabulary snapshot mismatch`);
    for (const option of question.options) {
      if (!vocabularyMeaningsByLevel.get(question.level).has(option)) fail(`${question.id} vocabulary option not traceable to same-level vocabulary.json: ${option}`);
    }
  } else {
    const source = grammarById.get(question.sourceIds[0]);
    if (!source || source.level !== question.level) fail(`${question.id} grammar source missing or cross-level`);
    if (question.questionType === 'meaning') {
      if (question.originalText !== source.grammar || question.displayText !== source.kana || question.kana !== source.kana || question.options[question.answerIndex] !== source.meaning) fail(`${question.id} grammar meaning snapshot mismatch`);
    } else {
      if (!source.quiz || question.originalText !== source.quiz.clozePrompt || question.displayText !== source.quiz.clozePromptKana || question.kana !== source.quiz.clozePromptKana || question.options[question.answerIndex] !== source.quiz.answer || question.explanation !== source.quiz.explanation) fail(`${question.id} grammar cloze snapshot mismatch`);
      if (JSON.stringify([...question.options].sort()) !== JSON.stringify([...source.quiz.choices].sort())) fail(`${question.id} grammar cloze options do not match source quiz choices`);
    }
  }
}

if (answerDistribution.some((count) => count !== 10)) fail(`answer distribution invalid: ${answerDistribution}`);
for (const level of ['N5', 'N4']) {
  const grammarAnswerDistribution = [0, 0, 0, 0];
  questions.filter((question) => question.level === level && question.section === 'grammar').forEach((question) => { grammarAnswerDistribution[question.answerIndex] += 1; });
  if (Math.max(...grammarAnswerDistribution) - Math.min(...grammarAnswerDistribution) > 1) fail(`${level} combined grammar answer distribution imbalance: ${grammarAnswerDistribution}`);
}
ok('question bank fields, display uniqueness, source snapshots, options, and answer distributions are valid');

const claimFiles = ALLOWED.filter((file) => file !== 'scripts/check-japanese-jlpt-batch17b1-data.js');
const claimText = claimFiles.map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
if (/certified official JLPT|official JLPT score implemented|官方JLPT題庫已完成|官方題庫已完成|官方分數已完成/i.test(claimText)) fail('contains forbidden official-completion claim');
ok('no forbidden official JLPT/scoring completion claims found');

const indexHtml = fs.readFileSync(path.join(ROOT, 'japanese/index.html'), 'utf8');
for (const token of ['style.css?v=2.9', 'script.js?v=3.4', 'japaneseSentenceCompositionQuestions.json?v=16d3b']) {
  if (!indexHtml.includes(token)) fail(`cache token missing ${token}`);
}
ok('cache tokens are unchanged');

cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-japanese-jlpt-batch17b1-data.js'), '--check'], { cwd: ROOT, stdio: 'inherit' });
ok('generator --check passed');
ok('Batch 17B-1 data checker completed');
