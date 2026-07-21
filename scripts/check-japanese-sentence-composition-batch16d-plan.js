#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const planPath = path.join(root, 'docs', 'japanese-sentence-composition-batch16d-expansion-plan.md');
const questionsPath = path.join(root, 'japaneseSentenceCompositionQuestions.json');
const grammarPath = path.join(root, 'grammar.json');
const japaneseIndexPath = path.join(root, 'japanese', 'index.html');

const allowedChangedFiles = new Set([
  'docs/japanese-sentence-composition-batch16d-expansion-plan.md',
  'scripts/check-japanese-sentence-composition-batch16d-plan.js',
]);
const protectedFiles = new Set([
  'japaneseSentenceCompositionQuestions.json',
  'script.js',
  'style.css',
  'japanese/index.html',
  'grammar.json',
  'vocabulary.json',
]);
const requiredFields = [
  'id',
  'level',
  'before',
  'after',
  'slots',
  'chunks',
  'correctOrder',
  'starSlot',
  'completeSentence',
  'kana',
  'meaning',
  'explanation',
  'grammarIds',
  'uniqueAnswerReviewed',
  'reviewNote',
];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function runGit(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function parseStatusFiles(output) {
  if (!output) return [];
  return output.split('\n').flatMap((line) => {
    const file = line.slice(3).trim();
    if (!file) return [];
    if (file.includes(' -> ')) return [file.split(' -> ').pop()];
    return [file];
  });
}

function getChangedFiles() {
  const requiredBaseCommit = 'c78ec40a786ee85696bbde582b26e54aaeb02cb4';
  try {
    runGit(['merge-base', '--is-ancestor', requiredBaseCommit, 'HEAD']);
  } catch (error) {
    throw new Error(`HEAD does not contain required Batch 16D-1 base commit ${requiredBaseCommit}`);
  }

  let mergeBase;
  try {
    mergeBase = runGit(['merge-base', 'HEAD', 'main']);
  } catch (error) {
    throw new Error('Unable to determine merge-base between HEAD and main');
  }

  const committedOutput = runGit(['diff', '--name-only', `${mergeBase}..HEAD`]);
  const committedFiles = committedOutput ? committedOutput.split('\n').filter(Boolean) : [];
  const statusOutput = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trimEnd();
  const statusFiles = parseStatusFiles(statusOutput);
  return [...new Set([...committedFiles, ...statusFiles])].sort();
}

function countBy(items, selector) {
  return items.reduce((counts, item) => {
    const key = selector(item);
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
}

function assertMapEquals(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (actual.get(key) !== value) {
      fail(`${label}: expected ${key}=${value}, got ${actual.get(key) || 0}`);
      return;
    }
  }
  pass(label);
}

const changedFiles = getChangedFiles();
const unexpectedFiles = changedFiles.filter((file) => !allowedChangedFiles.has(file));
const missingExpectedFiles = [...allowedChangedFiles].filter((file) => !changedFiles.includes(file));
if (unexpectedFiles.length > 0) {
  fail(`Batch 16D-1 may only add the plan and checker; unexpected changes: ${unexpectedFiles.join(', ')}`);
} else if (missingExpectedFiles.length > 0) {
  fail(`Batch 16D-1 PR diff must include both expected files; missing: ${missingExpectedFiles.join(', ')}`);
} else {
  pass('PR diff and working tree contain exactly the Batch 16D-1 plan and checker');
}

const protectedChanged = changedFiles.filter((file) => protectedFiles.has(file));
if (protectedChanged.length > 0) {
  fail(`Protected formal data/runtime files changed: ${protectedChanged.join(', ')}`);
} else {
  pass('Formal question bank and runtime files are not modified');
}

const questions = readJson(questionsPath);
const grammar = readJson(grammarPath);
const grammarIds = new Set(grammar.map((entry) => entry.id));

if (questions.length === 20) pass('Existing sentence-composition question bank remains at 20 questions');
else fail(`Expected 20 questions, got ${questions.length}`);

assertMapEquals(countBy(questions, (question) => question.level), { N5: 8, N4: 12 }, 'Existing N5/N4 distribution remains 8/12');

const expectedIds = [
  ...Array.from({ length: 8 }, (_, index) => `sc-n5-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 12 }, (_, index) => `sc-n4-${String(index + 1).padStart(3, '0')}`),
];
const actualIds = questions.map((question) => question.id);
const duplicateIds = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
const missingIds = expectedIds.filter((id) => !actualIds.includes(id));
const extraIds = actualIds.filter((id) => !expectedIds.includes(id));
if (duplicateIds.length || missingIds.length || extraIds.length) {
  fail(`ID baseline mismatch. duplicates=${duplicateIds.join(',') || 'none'} missing=${missingIds.join(',') || 'none'} extra=${extraIds.join(',') || 'none'}`);
} else {
  pass('Existing IDs match the required Batch 16C baseline ranges');
}

const missingFieldErrors = [];
const invalidGrammarErrors = [];
for (const question of questions) {
  for (const field of requiredFields) {
    if (!(field in question)) missingFieldErrors.push(`${question.id}:${field}`);
  }
  for (const grammarId of question.grammarIds || []) {
    if (!grammarIds.has(grammarId)) invalidGrammarErrors.push(`${question.id}:${grammarId}`);
  }
}
if (missingFieldErrors.length) fail(`Missing required fields: ${missingFieldErrors.join(', ')}`);
else pass('Existing questions have all required fields');
if (invalidGrammarErrors.length) fail(`Invalid grammarIds: ${invalidGrammarErrors.join(', ')}`);
else pass('Existing grammarIds all exist in grammar.json');

assertMapEquals(countBy(questions, (question) => String(question.starSlot)), { 0: 5, 1: 5, 2: 5, 3: 5 }, 'Existing starSlot distribution remains 5 each');
assertMapEquals(
  countBy(questions, (question) => String(question.chunks.findIndex((chunk) => chunk.id === question.correctOrder[question.starSlot]) + 1)),
  { 1: 5, 2: 5, 3: 5, 4: 5 },
  'Existing ★ correct option position distribution remains 5 each',
);

const plan = fs.readFileSync(planPath, 'utf8');
for (const phrase of ['Batch 16D-2A', 'Batch 16D-2B', 'Batch 16D-3']) {
  if (plan.includes(phrase)) pass(`Plan contains ${phrase}`);
  else fail(`Plan is missing ${phrase}`);
}
for (const phrase of ['total 60', 'N5 30', 'N4 30', 'starSlot 0／1／2／3 各 15 題']) {
  if (plan.includes(phrase)) pass(`Plan contains final 60-question target detail: ${phrase}`);
  else fail(`Plan is missing final target detail: ${phrase}`);
}
for (const phrase of ['唯一正解', '人工複核', '不得與現有題目的完整句子或主要語序高度重複']) {
  if (plan.includes(phrase)) pass(`Plan contains required review/rule wording: ${phrase}`);
  else fail(`Plan is missing required review/rule wording: ${phrase}`);
}

const japaneseIndex = fs.readFileSync(japaneseIndexPath, 'utf8');
if (japaneseIndex.includes('script.js?v=3.3')) pass('Cache query for script.js remains v=3.3');
else fail('Cache query for script.js?v=3.3 not found');
if (japaneseIndex.includes('style.css?v=2.9')) pass('Cache query for style.css remains v=2.9');
else fail('Cache query for style.css?v=2.9 not found');

if (process.exitCode) process.exit(process.exitCode);
console.log('Batch 16D-1 plan check passed.');
