#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

const BASE = process.env.JLPT_17C8A_BASE_REF || 'b9af0d27750e0b374b3a32ea31b3c6ef49b712ec';
const REQUIRED_BASE = 'b9af0d27750e0b374b3a32ea31b3c6ef49b712ec';
const DOC = 'docs/japanese-jlpt-batch17c8a-grammar-audit-plan.md';
const SELF = 'scripts/check-japanese-jlpt-batch17c8a-grammar-audit-plan.js';
const ALLOWED = new Set([DOC, SELF]);
const failures = [];
const fail = (message) => failures.push(message);
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const nonempty = (value) => typeof value === 'string' && value.trim() !== '';
const countBy = (items, key) => Object.fromEntries([...new Set(items.map(key))].sort().map((value) => [value, items.filter((item) => key(item) === value).length]));

function grammarInventory(items) {
  const required = ['id', 'level', 'category', 'grammar', 'kana', 'meaning', 'structure', 'usage', 'example', 'exampleKana', 'exampleMeaning'];
  const blockers = Object.fromEntries([
    'missing-required-field', 'duplicate-id', 'level-mismatch', 'missing-quiz', 'invalid-option-count',
    'empty-option', 'duplicate-option', 'invalid-answer-index', 'answer-not-in-options',
    'prompt-kana-mismatch', 'unsafe-distractor', 'unique-answer-unreviewed',
  ].map((key) => [key, 0]));
  const ids = new Map();
  let structurallyEligible = 0;
  for (const item of items) {
    if (required.some((field) => !nonempty(item[field]))) blockers['missing-required-field']++;
    ids.set(item.id, (ids.get(item.id) || 0) + 1);
    if (!['N5', 'N4'].includes(item.level) || !nonempty(item.id) || !item.id.toLowerCase().startsWith(`${String(item.level).toLowerCase()}-`)) blockers['level-mismatch']++;
    const quiz = item.quiz;
    if (!quiz || typeof quiz !== 'object') { blockers['missing-quiz']++; continue; }
    const choices = quiz.choices;
    if (!Array.isArray(choices) || choices.length !== 4) blockers['invalid-option-count']++;
    const safeChoices = Array.isArray(choices) ? choices : [];
    if (safeChoices.some((choice) => !nonempty(choice))) blockers['empty-option']++;
    if (new Set(safeChoices.map((choice) => String(choice).trim())).size !== safeChoices.length) blockers['duplicate-option']++;
    if ('answerIndex' in quiz && (!Number.isInteger(quiz.answerIndex) || quiz.answerIndex < 0 || quiz.answerIndex >= safeChoices.length)) blockers['invalid-answer-index']++;
    if (!nonempty(quiz.answer) || !safeChoices.includes(quiz.answer)) blockers['answer-not-in-options']++;
    const blanks = (text) => (String(text || '').match(/＿+/g) || []).length;
    if (!nonempty(quiz.clozePrompt) || !nonempty(quiz.clozePromptKana) || blanks(quiz.clozePrompt) !== 1 || blanks(quiz.clozePromptKana) !== 1) blockers['prompt-kana-mismatch']++;
    const structural = nonempty(quiz.clozePrompt) && nonempty(quiz.clozePromptKana) && nonempty(quiz.clozeMeaning) &&
      Array.isArray(choices) && choices.length === 4 && safeChoices.every(nonempty) && new Set(safeChoices).size === 4 &&
      nonempty(quiz.answer) && safeChoices.includes(quiz.answer) && blanks(quiz.clozePrompt) === 1 && blanks(quiz.clozePromptKana) === 1;
    if (structural) { structurallyEligible++; blockers['unsafe-distractor']++; blockers['unique-answer-unreviewed']++; }
  }
  blockers['duplicate-id'] = [...ids.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
  return {
    total: items.length,
    byLevel: { N5: items.filter((item) => item.level === 'N5').length, N4: items.filter((item) => item.level === 'N4').length },
    requiredFieldsComplete: items.filter((item) => required.every((field) => nonempty(item[field]))).length,
    quizPresent: items.filter((item) => item.quiz && typeof item.quiz === 'object').length,
    structurallyEligible,
    humanReviewed: 0,
    blockers,
  };
}

function sentenceInventory(questions, evidence) {
  const ids = new Set();
  const blockers = Object.fromEntries([
    'missing-required-field', 'duplicate-id', 'level-mismatch', 'invalid-chunk-count', 'duplicate-chunk-id',
    'invalid-correct-order', 'invalid-star-slot', 'complete-sentence-mismatch', 'missing-permutation-evidence',
    'alternate-valid-order',
  ].map((key) => [key, 0]));
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  if (evidenceById.size !== evidence.length || evidence.length !== questions.length) blockers['missing-permutation-evidence']++;
  let permutationRows = 0;
  let validExpected = 0;
  let validAlternate = 0;
  for (const q of questions) {
    const required = ['id','level','before','after','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed'];
    if (required.some((field) => !(field in q)) || !nonempty(q.kana) || !nonempty(q.meaning) || !nonempty(q.explanation) || !Array.isArray(q.grammarIds) || !q.grammarIds.length) blockers['missing-required-field']++;
    if (ids.has(q.id)) blockers['duplicate-id']++; ids.add(q.id);
    if (!['N5', 'N4'].includes(q.level) || !q.id.startsWith(`sc-${q.level.toLowerCase()}-`)) blockers['level-mismatch']++;
    const chunks = Array.isArray(q.chunks) ? q.chunks : [];
    const chunkIds = chunks.map((chunk) => chunk.id);
    if (chunks.length !== 4 || chunks.some((chunk) => !nonempty(chunk.id) || !nonempty(chunk.text))) blockers['invalid-chunk-count']++;
    if (new Set(chunkIds).size !== chunkIds.length || new Set(chunks.map((chunk) => chunk.text)).size !== chunks.length) blockers['duplicate-chunk-id']++;
    const orderValid = Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && new Set(q.correctOrder).size === 4 && q.correctOrder.every((id) => chunkIds.includes(id));
    if (!orderValid) blockers['invalid-correct-order']++;
    if (!Number.isInteger(q.starSlot) || q.starSlot < 0 || q.starSlot > 3 || !orderValid || !chunkIds.includes(q.correctOrder[q.starSlot])) blockers['invalid-star-slot']++;
    const byId = new Map(chunks.map((chunk) => [chunk.id, chunk.text]));
    if (!orderValid || `${q.before}${q.correctOrder.map((id) => byId.get(id)).join('')}${q.after}` !== q.completeSentence) blockers['complete-sentence-mismatch']++;
    const proof = evidenceById.get(q.id);
    if (!proof || proof.level !== q.level || JSON.stringify(proof.correctOrder) !== JSON.stringify(q.correctOrder) ||
        proof.starSlot !== q.starSlot || !Array.isArray(proof.permutations) || proof.permutations.length !== 24) blockers['missing-permutation-evidence']++;
    else {
      permutationRows += proof.permutations.length;
      const expected = proof.permutations.filter((row) => row.verdict === 'VALID_EXPECTED').length;
      const alternate = proof.permutations.filter((row) => row.verdict === 'VALID_ALTERNATE').length;
      validExpected += expected; validAlternate += alternate;
      if (expected !== 1) blockers['missing-permutation-evidence']++;
      if (alternate) blockers['alternate-valid-order'] += alternate;
    }
  }
  return { total: questions.length, byLevel: { N5: questions.filter((q) => q.level === 'N5').length, N4: questions.filter((q) => q.level === 'N4').length }, humanReviewed: questions.filter((q) => q.uniqueAnswerReviewed === true).length, permutationRows, validExpected, validAlternate, blockers };
}

function legacyInventory(bank) {
  const questions = bank.questions || [];
  return { total: questions.length, byPool: countBy(questions, (q) => `${q.level}/${q.section}/${q.questionType}`) };
}

function inventory() {
  return {
    schemaVersion: 1,
    baseline: REQUIRED_BASE,
    compatibilityProfile: {
      version: '17c6-compat-v1',
      N5: { total: 20, vocabularyMeaning: 10, grammarMeaning: 5, grammarCloze: 5, reading: 0 },
      N4: { total: 34, vocabularyMeaning: 10, grammarMeaning: 5, grammarCloze: 5, reading: 14 },
    },
    legacy: legacyInventory(json('japaneseJlptVocabularyGrammarQuestions.json')),
    grammar: grammarInventory(json('grammar.json')),
    sentenceComposition: sentenceInventory(json('japaneseSentenceCompositionQuestions.json'), json('docs/japanese-sentence-composition-batch16d3-final-permutations.json')),
    textGrammar: { available: 0, blocker: 'missing-text-grammar-source' },
  };
}

function checkScope() {
  let changed = [];
  try { changed = git(['diff', '--name-only', BASE, '--']).split('\n').filter(Boolean); } catch (error) { fail(`Cannot compare scope with ${BASE}: ${error.message}`); }
  let untracked = [];
  try { untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean); } catch (error) { fail(`Cannot inventory untracked files: ${error.message}`); }
  [...new Set([...changed, ...untracked])].filter((file) => !ALLOWED.has(file)).forEach((file) => fail(`Out-of-scope path changed: ${file}`));
  // The explicit PR baseline cannot be bypassed by choosing a newer scope ref.
  try {
    git(['diff', '--name-only', REQUIRED_BASE, '--']).split('\n').filter(Boolean)
      .filter((file) => !ALLOWED.has(file)).forEach((file) => fail(`Protected repository path differs from PR #294: ${file}`));
  } catch (error) { fail(`Cannot verify protected paths against PR #294: ${error.message}`); }
}

console.log('Batch 17C-8A JLPT grammar audit-plan checker');
try { execFileSync('git', ['merge-base', '--is-ancestor', REQUIRED_BASE, 'HEAD']); } catch { fail(`HEAD does not contain PR #294 merge commit ${REQUIRED_BASE}`); }
try { execFileSync('git', ['cat-file', '-e', `${BASE}^{commit}`]); } catch { fail(`Invalid scope base ${BASE}`); }
checkScope();

let actual;
try { actual = inventory(); } catch (error) { fail(`Dynamic inventory failed: ${error.stack || error.message}`); }
const script = read('script.js');
for (const token of ['"17c6-compat-v1"', 'N5: { total: 20', 'N4: { total: 34', 'meaning: 5, cloze: 5']) if (!script.includes(token)) fail(`Compatibility profile token missing: ${token}`);
const document = fs.existsSync(DOC) ? read(DOC) : '';
const finalAudit = read('docs/japanese-sentence-composition-batch16d3-final-audit-v2.md');
for (const phrase of ['60', '1440', 'VALID_EXPECTED', 'VALID_ALTERNATE']) if (!finalAudit.includes(phrase)) fail(`Batch 16D-3 final audit report token missing: ${phrase}`);
const match = document.match(/<!-- INVENTORY_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- INVENTORY_JSON_END -->/);
if (!match) fail('Document machine-readable inventory block is missing');
else { try { if (JSON.stringify(JSON.parse(match[1])) !== JSON.stringify(actual)) fail('Document inventory JSON differs from dynamic inventory'); } catch (error) { fail(`Document inventory JSON is invalid: ${error.message}`); } }
const requiredPhrases = ['Question Type Matrix', 'form-selection', 'text-grammar', 'source layer', 'review manifest layer', 'committed derived bank layer', 'runtime candidate layer', 'immutable pre-randomization snapshot', 'fail-closed', '(level, "grammar", "sentence-composition")', 'Batch 17C-10', 'selection → immutable pre-randomization snapshot → balanced answer positions → option randomization'];
for (const phrase of requiredPhrases) if (!document.includes(phrase)) fail(`Document contract phrase missing: ${phrase}`);
for (const key of ['missing-required-field','duplicate-id','level-mismatch','missing-quiz','invalid-option-count','empty-option','duplicate-option','invalid-answer-index','answer-not-in-options','prompt-kana-mismatch','unsafe-distractor','unique-answer-unreviewed','invalid-chunk-count','duplicate-chunk-id','invalid-correct-order','invalid-star-slot','complete-sentence-mismatch','missing-permutation-evidence','alternate-valid-order','missing-text-grammar-source']) if (!document.includes(`\`${key}\``)) fail(`Document blocker key missing: ${key}`);

// Scope comparison protects runtime, markup, CSS, data, cache tokens, storage APIs,
// profiles, and historical checkers: none is in ALLOWED, so any change fails closed.
if (failures.length) {
  console.error(`FAIL (${failures.length})`); failures.forEach((message) => console.error(`- ${message}`));
  if (actual) console.error(`Dynamic inventory at failure:\n${JSON.stringify(actual, null, 2)}`);
  process.exit(1);
}
console.log('PASS: baseline ancestor, exact two-file scope, compatibility profile, source banks, evidence, and document contract');
console.log(JSON.stringify(actual, null, 2));
