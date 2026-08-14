#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
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
const clone = (value) => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const nonempty = (value) => typeof value === 'string' && value.trim() !== '';
const countBy = (items, key) => Object.fromEntries([...new Set(items.map(key))].sort().map((value) => [value, items.filter((item) => key(item) === value).length]));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

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

function permutations(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => permutations(items.slice(0, index).concat(items.slice(index + 1))).map((rest) => [item, ...rest]));
}

function sentenceInventory(questions, evidence) {
  const blockers = Object.fromEntries([
    'missing-required-field', 'duplicate-id', 'level-mismatch', 'invalid-chunk-count', 'duplicate-chunk-id',
    'invalid-correct-order', 'invalid-star-slot', 'complete-sentence-mismatch', 'missing-permutation-evidence',
    'alternate-valid-order',
  ].map((key) => [key, 0]));
  assert(Array.isArray(questions) && questions.length === 60, 'sentence-composition source must contain exactly 60 questions');
  assert(questions.filter((q) => q.level === 'N5').length === 30 && questions.filter((q) => q.level === 'N4').length === 30, 'sentence-composition level inventory must be N5=30/N4=30');
  assert(questions.every((q) => q.uniqueAnswerReviewed === true), 'all sentence-composition questions must be human reviewed');
  assert(Array.isArray(evidence) && evidence.length === 60, 'evidence root must contain exactly 60 entries');
  assert(new Set(evidence.map((item) => item.id)).size === 60, 'evidence IDs must be unique');
  const sourceIds = questions.map((q) => q.id);
  assert(new Set(sourceIds).size === 60, 'source IDs must be globally unique');
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  let permutationRows = 0;
  let validExpected = 0;
  let validAlternate = 0;
  for (const q of questions) {
    const required = ['id','level','before','after','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation','grammarIds','uniqueAnswerReviewed'];
    if (required.some((field) => !(field in q)) || !nonempty(q.kana) || !nonempty(q.meaning) || !nonempty(q.explanation) || !Array.isArray(q.grammarIds) || !q.grammarIds.length) blockers['missing-required-field']++;
    if (!['N5', 'N4'].includes(q.level) || !q.id.startsWith(`sc-${q.level.toLowerCase()}-`)) blockers['level-mismatch']++;
    const chunks = Array.isArray(q.chunks) ? q.chunks : [];
    const chunkIds = chunks.map((chunk) => chunk.id);
    if (chunks.length !== 4 || chunks.some((chunk) => !nonempty(chunk.id) || !nonempty(chunk.text))) blockers['invalid-chunk-count']++;
    if (new Set(chunkIds).size !== chunks.length || new Set(chunks.map((chunk) => chunk.text)).size !== chunks.length) blockers['duplicate-chunk-id']++;
    const orderValid = Array.isArray(q.correctOrder) && q.correctOrder.length === 4 && new Set(q.correctOrder).size === 4 && q.correctOrder.every((id) => chunkIds.includes(id));
    if (!orderValid) blockers['invalid-correct-order']++;
    if (!Number.isInteger(q.starSlot) || q.starSlot < 0 || q.starSlot > 3 || !orderValid || !chunkIds.includes(q.correctOrder[q.starSlot])) blockers['invalid-star-slot']++;
    const byId = new Map(chunks.map((chunk) => [chunk.id, chunk.text]));
    if (!orderValid || `${q.before}${q.correctOrder.map((id) => byId.get(id)).join('')}${q.after}` !== q.completeSentence) blockers['complete-sentence-mismatch']++;
    const proof = evidenceById.get(q.id);
    assert(proof, `missing evidence for ${q.id}`);
    assert(proof.level === q.level && same(proof.correctOrder, q.correctOrder) && proof.starSlot === q.starSlot, `evidence metadata mismatch for ${q.id}`);
    assert(Array.isArray(proof.permutations) && proof.permutations.length === 24, `${q.id} must have exactly 24 permutations`);
    const expectedOrders = new Set(permutations(chunkIds).map((order) => JSON.stringify(order)));
    const seenOrders = new Set();
    let questionExpected = 0;
    let questionAlternate = 0;
    for (const row of proof.permutations) {
      assert(Array.isArray(row.order) && row.order.length === 4 && new Set(row.order).size === 4 && row.order.every((id) => chunkIds.includes(id)), `invalid permutation order for ${q.id}`);
      const orderKey = JSON.stringify(row.order);
      assert(!seenOrders.has(orderKey), `duplicate permutation for ${q.id}`);
      seenOrders.add(orderKey);
      assert(expectedOrders.has(orderKey), `unknown permutation for ${q.id}`);
      assert(row.sentence === `${q.before}${row.order.map((id) => byId.get(id)).join('')}${q.after}`, `permutation sentence mismatch for ${q.id}`);
      assert(['VALID_EXPECTED', 'VALID_ALTERNATE', 'INVALID_GRAMMAR'].includes(row.verdict), `invalid verdict for ${q.id}`);
      assert(nonempty(row.reason) && row.reason.trim().length >= 8, `missing or non-specific reason for ${q.id}`);
      if (row.verdict === 'VALID_EXPECTED') { questionExpected++; assert(same(row.order, q.correctOrder), `VALID_EXPECTED order mismatch for ${q.id}`); }
      if (row.verdict === 'VALID_ALTERNATE') questionAlternate++;
    }
    assert(seenOrders.size === 24 && [...expectedOrders].every((order) => seenOrders.has(order)), `incomplete permutation set for ${q.id}`);
    assert(questionExpected === 1, `${q.id} must have exactly one VALID_EXPECTED`);
    assert(questionAlternate === 0, `${q.id} must have no VALID_ALTERNATE`);
    permutationRows += 24; validExpected += questionExpected; validAlternate += questionAlternate;
  }
  const humanReviewed = questions.filter((q) => q.uniqueAnswerReviewed === true).length;
  assert(permutationRows === 1440 && validExpected === 60 && validAlternate === 0 && humanReviewed === 60, 'sentence-composition aggregate contract mismatch');
  assert(Object.values(blockers).every((count) => count === 0), `sentence-composition blockers must all be zero: ${JSON.stringify(blockers)}`);
  return { total: questions.length, byLevel: { N5: 30, N4: 30 }, humanReviewed, permutationRows, validExpected, validAlternate, blockers };
}

function parseCompatibilityProfile(source) {
  const marker = 'const JAPANESE_JLPT_PROFILE_REGISTRY =';
  const start = source.indexOf(marker);
  assert(start !== -1, 'JAPANESE_JLPT_PROFILE_REGISTRY declaration is missing');
  const expressionStart = start + marker.length;
  const expressionEnd = source.indexOf(';', expressionStart);
  assert(expressionEnd !== -1, 'JAPANESE_JLPT_PROFILE_REGISTRY declaration is unterminated');
  const registry = vm.runInNewContext(`(${source.slice(expressionStart, expressionEnd)})`, { deepFreezeJapaneseJlptValue: (value) => value }, { timeout: 1000 });
  assert(registry && registry.schemaVersion === 1 && registry.profiles, 'invalid JLPT profile registry');
  const profile = registry.profiles['17c6-compat-v1'];
  assert(profile && profile.profileVersion === '17c6-compat-v1', '17c6-compat-v1 profile is missing');
  return validateCompatibilityProfile(profile);
}

function validateCompatibilityProfile(profile) {
  const expected = {
    N5: { total: 20, vocabulary: { meaning: 10 }, grammar: { meaning: 5, cloze: 5 }, readingIncluded: false, readingTotal: null },
    N4: { total: 34, vocabulary: { meaning: 10 }, grammar: { meaning: 5, cloze: 5 }, readingIncluded: true, readingTotal: 14 },
  };
  const output = { version: profile.profileVersion };
  for (const level of ['N5', 'N4']) {
    const current = profile.levels && profile.levels[level];
    const wanted = expected[level];
    assert(current && current.total === wanted.total, `${level} compatibility total changed`);
    const sections = current.sections || {};
    assert(same(sections.vocabulary && sections.vocabulary.questionTypes, wanted.vocabulary), `${level} vocabulary quota changed`);
    assert(same(sections.grammar && sections.grammar.questionTypes, wanted.grammar), `${level} grammar quota changed or unapproved questionType added`);
    assert(!Object.hasOwn(sections.grammar.questionTypes, 'form-selection') && !Object.hasOwn(sections.grammar.questionTypes, 'sentence-composition'), `${level} production grammar contains an unapproved new type`);
    assert(sections.reading && sections.reading.included === wanted.readingIncluded, `${level} reading included state changed`);
    if (wanted.readingIncluded) assert(sections.reading.total === wanted.readingTotal && Object.values(sections.reading.questionTypes || {}).reduce((sum, value) => sum + value, 0) === wanted.readingTotal, `${level} reading quota changed`);
    else assert(sections.reading.total === null && Object.keys(sections.reading.questionTypes || {}).length === 0, `${level} unavailable reading must have no quota`);
    assert(sections.listening && sections.listening.included === false && sections.listening.total === null && Object.keys(sections.listening.questionTypes || {}).length === 0, `${level} listening must remain disabled`);
    const includedTotal = Object.values(sections).filter((section) => section.included).reduce((sum, section) => {
      const quotas = Object.values(section.questionTypes || {});
      assert(quotas.reduce((subtotal, value) => subtotal + value, 0) === section.total, `${level} section quota sum mismatch`);
      return sum + section.total;
    }, 0);
    assert(includedTotal === current.total, `${level} profile quota sum mismatch`);
    output[level] = { total: current.total, vocabularyMeaning: sections.vocabulary.questionTypes.meaning, grammarMeaning: sections.grammar.questionTypes.meaning, grammarCloze: sections.grammar.questionTypes.cloze, reading: wanted.readingIncluded ? sections.reading.total : 0 };
  }
  return output;
}

function legacyInventory(bank) {
  const questions = bank.questions || [];
  return { total: questions.length, byPool: countBy(questions, (q) => `${q.level}/${q.section}/${q.questionType}`) };
}

function inventory() {
  return {
    schemaVersion: 1,
    baseline: REQUIRED_BASE,
    compatibilityProfile: parseCompatibilityProfile(read('script.js')),
    legacy: legacyInventory(json('japaneseJlptVocabularyGrammarQuestions.json')),
    grammar: grammarInventory(json('grammar.json')),
    sentenceComposition: sentenceInventory(json('japaneseSentenceCompositionQuestions.json'), json('docs/japanese-sentence-composition-batch16d3-final-permutations.json')),
    textGrammar: { available: 0, blocker: 'missing-text-grammar-source' },
  };
}

function assertExpectedInventory(actual) {
  assert(actual.compatibilityProfile.N5.total === 20 && actual.compatibilityProfile.N4.total === 34, 'compatibility baseline totals changed');
  assert(actual.legacy.total === 40, 'legacy bank must contain 40 questions');
  assert(actual.grammar.total === 290 && actual.grammar.byLevel.N5 === 80 && actual.grammar.byLevel.N4 === 210, 'grammar source baseline changed');
  assert(actual.grammar.quizPresent === 130 && actual.grammar.structurallyEligible === 130 && actual.grammar.humanReviewed === 0 && actual.grammar.blockers['missing-quiz'] === 160, 'grammar candidate baseline changed');
  const sentence = actual.sentenceComposition;
  assert(sentence.total === 60 && sentence.byLevel.N5 === 30 && sentence.byLevel.N4 === 30 && sentence.humanReviewed === 60, 'sentence-composition baseline changed');
  assert(sentence.permutationRows === 1440 && sentence.validExpected === 60 && sentence.validAlternate === 0, 'permutation evidence baseline changed');
  assert(Object.values(sentence.blockers).every((count) => count === 0), 'sentence-composition blockers are nonzero');
  assert(actual.textGrammar.available === 0, 'text-grammar must remain unavailable');
}

function expectReject(label, operation) {
  try { operation(); } catch { return; }
  throw new Error(`negative fixture was not rejected: ${label}`);
}

function runNegativeFixtures(questions, evidence, profile) {
  const cases = [];
  const test = (label, mutate, validate = (fixture) => sentenceInventory(fixture.questions, fixture.evidence)) => {
    const fixture = { questions: clone(questions), evidence: clone(evidence), profile: clone(profile) };
    mutate(fixture);
    expectReject(label, () => validate(fixture));
    cases.push(label);
  };
  test('uniqueAnswerReviewed=false', (f) => { f.questions[0].uniqueAnswerReviewed = false; });
  test('duplicate permutation', (f) => { f.evidence[0].permutations[1] = clone(f.evidence[0].permutations[0]); });
  test('missing permutation', (f) => { f.evidence[0].permutations.pop(); });
  test('VALID_EXPECTED differs from correctOrder', (f) => { const rows = f.evidence[0].permutations; const expected = rows.find((row) => row.verdict === 'VALID_EXPECTED'); expected.order = clone(rows.find((row) => row.verdict === 'INVALID_GRAMMAR').order); });
  test('permutation sentence mismatch', (f) => { f.evidence[0].permutations[0].sentence += '壊'; });
  test('VALID_ALTERNATE present', (f) => { f.evidence[0].permutations.find((row) => row.verdict === 'INVALID_GRAMMAR').verdict = 'VALID_ALTERNATE'; });
  test('compatibility quota or type changed', (f) => { f.profile.levels.N5.sections.grammar.questionTypes['form-selection'] = 1; }, (f) => validateCompatibilityProfile(f.profile));
  return cases;
}

function checkScope() {
  let changed = [];
  try { changed = git(['diff', '--name-only', BASE, '--']).split('\n').filter(Boolean); } catch (error) { fail(`Cannot compare scope with ${BASE}: ${error.message}`); }
  let untracked = [];
  try { untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean); } catch (error) { fail(`Cannot inventory untracked files: ${error.message}`); }
  [...new Set([...changed, ...untracked])].filter((file) => !ALLOWED.has(file)).forEach((file) => fail(`Out-of-scope path changed: ${file}`));
  try { git(['diff', '--name-only', REQUIRED_BASE, '--']).split('\n').filter(Boolean).filter((file) => !ALLOWED.has(file)).forEach((file) => fail(`Protected repository path differs from PR #294: ${file}`)); }
  catch (error) { fail(`Cannot verify protected paths against PR #294: ${error.message}`); }
}

console.log('Batch 17C-8A JLPT grammar audit-plan checker');
try { execFileSync('git', ['merge-base', '--is-ancestor', REQUIRED_BASE, 'HEAD']); } catch { fail(`HEAD does not contain PR #294 merge commit ${REQUIRED_BASE}`); }
try { execFileSync('git', ['cat-file', '-e', `${BASE}^{commit}`]); } catch { fail(`Invalid scope base ${BASE}`); }
checkScope();
let actual;
let negativeFixtures = [];
try {
  actual = inventory();
  assertExpectedInventory(actual);
  const source = read('script.js');
  const marker = 'const JAPANESE_JLPT_PROFILE_REGISTRY =';
  const start = source.indexOf(marker) + marker.length;
  const profileRegistry = vm.runInNewContext(`(${source.slice(start, source.indexOf(';', start))})`, { deepFreezeJapaneseJlptValue: (value) => value });
  negativeFixtures = runNegativeFixtures(json('japaneseSentenceCompositionQuestions.json'), json('docs/japanese-sentence-composition-batch16d3-final-permutations.json'), profileRegistry.profiles['17c6-compat-v1']);
} catch (error) { fail(`Dynamic validation failed: ${error.stack || error.message}`); }
const document = fs.existsSync(DOC) ? read(DOC) : '';
const match = document.match(/<!-- INVENTORY_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- INVENTORY_JSON_END -->/);
if (!match) fail('Document machine-readable inventory block is missing');
else { try { if (!same(JSON.parse(match[1]), actual)) fail('Document inventory JSON differs from dynamic inventory'); } catch (error) { fail(`Document inventory JSON is invalid: ${error.message}`); } }
const requiredPhrases = ['Question Type Matrix', 'form-selection', 'text-grammar', 'source layer', 'review manifest layer', 'committed derived bank layer', 'runtime candidate layer', 'immutable pre-randomization snapshot', 'fail-closed', '(level, "grammar", "sentence-composition")', 'Batch 17C-10', 'selection → immutable pre-randomization snapshot → balanced answer positions → option randomization'];
for (const phrase of requiredPhrases) if (!document.includes(phrase)) fail(`Document contract phrase missing: ${phrase}`);
for (const key of ['missing-required-field','duplicate-id','level-mismatch','missing-quiz','invalid-option-count','empty-option','duplicate-option','invalid-answer-index','answer-not-in-options','prompt-kana-mismatch','unsafe-distractor','unique-answer-unreviewed','invalid-chunk-count','duplicate-chunk-id','invalid-correct-order','invalid-star-slot','complete-sentence-mismatch','missing-permutation-evidence','alternate-valid-order','missing-text-grammar-source']) if (!document.includes(`\`${key}\``)) fail(`Document blocker key missing: ${key}`);
if (failures.length) {
  console.error(`FAIL (${failures.length})`); failures.forEach((message) => console.error(`- ${message}`));
  if (actual) console.error(`Dynamic inventory at failure:\n${JSON.stringify(actual, null, 2)}`);
  process.exit(1);
}
console.log(`Negative fixtures rejected: PASS (${negativeFixtures.length}: ${negativeFixtures.join('; ')})`);
console.log('PASS: dynamic profile, fixed inventory assertions, source/evidence integrity, exact scope, and document contract');
console.log(JSON.stringify(actual, null, 2));
