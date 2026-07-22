#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const script = read('script.js');
const html = read('japanese/index.html');
const questions = JSON.parse(read('japaneseSentenceCompositionQuestions.json'));
const required = ['id','level','before','after','chunks','correctOrder','starSlot','completeSentence','kana','meaning','explanation'];
const grammarEntries = [...html.matchAll(/<button[\s\S]*?data-japanese-grammar-entry="([^"]+)"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g)].map((m)=>({name:m[2], dataAttribute:`data-japanese-grammar-entry="${m[1]}"`}));
const mainEntries = [...html.matchAll(/data-japanese-entry="([^"]+)"/g)].map((m)=>m[1]);
const ids = new Map();
const duplicates = [];
const missingRequiredFields = [];
const starSlotDistribution = {};
const correctStarOptionPositionDistribution = {};
for (const q of questions) {
  if (ids.has(q.id)) duplicates.push(q.id); else ids.set(q.id, true);
  const missing = required.filter((key)=>!(key in q));
  if (!Array.isArray(q.chunks) || q.chunks.length !== 4) missing.push('chunks[4]');
  if (!Array.isArray(q.correctOrder) || q.correctOrder.length !== 4) missing.push('correctOrder[4]');
  if (!Number.isInteger(q.starSlot) || q.starSlot < 0 || q.starSlot > 3) missing.push('starSlot 0..3');
  if (missing.length) missingRequiredFields.push({id:q.id, missing});
  starSlotDistribution[q.starSlot] = (starSlotDistribution[q.starSlot] || 0) + 1;
  const correctStarChunkId = q.correctOrder?.[q.starSlot];
  const optionPosition = Array.isArray(q.chunks) ? q.chunks.findIndex((chunk)=>chunk.id === correctStarChunkId) + 1 : 0;
  correctStarOptionPositionDistribution[optionPosition] = (correctStarOptionPositionDistribution[optionPosition] || 0) + 1;
}
const questionTypesMatch = script.match(/const JAPANESE_MISTAKE_QUESTION_TYPES = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
const questionTypes = questionTypesMatch ? [...questionTypesMatch[1].matchAll(/^\s*([A-Za-z0-9_]+):\s*\{\s*module:\s*"([^"]+)"/gm)].map((m)=>({questionType:m[1], module:m[2]})) : [];
const stateVariables = [
  'sentenceCompositionQuestions','sentenceCompositionHasLoaded','sentenceCompositionIsLoading','activeSentenceCompositionLevel','currentSentenceCompositionQuestion','currentSentenceCompositionAnswer','currentSentenceCompositionLocked','previousSentenceCompositionQuestionId'
].filter((name)=>new RegExp(`let\\s+${name}\\b`).test(script));
const report = {
  confirmedMainContainsPrs: ['#263 Add Japanese sentence composition practice', '#264 Fix selected sentence composition option styling / star choice', '#265 Fix JLPT sentence composition layout', '#266 Add Batch 16C sentence composition plan audit'],
  grammarMenuEntries: { count: grammarEntries.length, entries: grammarEntries },
  japaneseMainEntries: { count: mainEntries.length, entries: mainEntries },
  sentenceCompositionView: {
    view: 'japaneseSentenceCompositionView / practice and quiz setup routed by data-japanese-grammar-entry',
    contentRoot: 'sentenceCompositionContent',
    backButtonFlow: 'feature header [data-japanese-back-home] plus grammar menu rendering; sentence composition state reset when leaving grammar or hiding this view',
    isolationMarkers: ['resetJapaneseSentenceCompositionState()', 'renderJapaneseGrammarView("sentence-composition-practice")', 'renderJapaneseGrammarView("sentence-composition-quiz")', 'panelView !== "grammar" reset']
  },
  stateVariables,
  starAnswerCalculation: {
    starSlot: 'question.starSlot controls which of four slots renders （★）',
    correctStarChunkId: 'question.correctOrder[question.starSlot]',
    optionNumber: 'question.chunks.findIndex(chunk.id === correctStarChunkId) + 1',
    chunksDisplayOrder: 'question.chunks order is displayed as options 1..4'
  },
  practiceFeedback: ['答對了/再看看正確順序','★格正確答案','完整正確順序','completeSentence','kana','meaning','explanation'],
  questionBaseline: {
    total: questions.length,
    N5: questions.filter((q)=>q.level === 'N5').length,
    N4: questions.filter((q)=>q.level === 'N4').length,
    duplicateQuestionIds: duplicates,
    missingRequiredFields,
    starSlotDistribution,
    correctStarOptionPositionDistribution
  },
  mistakeBook: {
    storageKey: /const JAPANESE_MISTAKE_BOOK_KEY = "japanese_mistake_book_v1"/.test(script) ? 'japanese_mistake_book_v1' : 'missing',
    questionTypes,
    hooks: ['recordJapaneseMistake in submitAnswer for vocabulary/grammar', 'recordJapaneseMistake in reading answer handler', 'recordJapaneseMistake in listening quiz handler'],
    dedupeKey: 'createJapaneseMistakeDedupeKey joins configured keyParts; current grammar types use grammar:<questionType>:<itemId>',
    schemaFields: ['module','questionType','itemId','relatedId','wrongCount','lastWrongAt','userAnswer','correctAnswer','createdAt','updatedAt'],
    fallbacks: ['invalid JSON/schema normalizes to empty book','localStorage exceptions use in-memory fallback','missing stable ID warns once and skips write'],
    clearIsolation: /function clearJapaneseMistakeBook\(\)\s*\{\s*return\s+writeJapaneseMistakeBook\(createEmptyJapaneseMistakeBook\(\)\);\s*\}/.test(script)
  },
  sentenceCompositionIntegrationFeasibility: {
    questionType: 'sentenceComposition',
    dedupeKey: 'grammar:sentenceComposition:<questionId>',
    needsChanges: ['JAPANESE_MISTAKE_QUESTION_TYPES','normalizeJapaneseMistakeBookData schema preservation','record payload from quiz only','review labels/module order display','appendMistakeResolvedFields sentenceComposition branch'],
    newLocalStorageKeyNeeded: false
  }
};
console.log(JSON.stringify(report, null, 2));
if (questions.length !== 60 || report.questionBaseline.N5 !== 30 || report.questionBaseline.N4 !== 30) process.exitCode = 1;
if (JSON.stringify(starSlotDistribution) !== JSON.stringify({0:15,1:15,2:15,3:15})) process.exitCode = 1;
if (JSON.stringify(correctStarOptionPositionDistribution) !== JSON.stringify({1:15,2:15,3:15,4:15})) process.exitCode = 1;
if (duplicates.length || missingRequiredFields.length) process.exitCode = 1;
if (grammarEntries.length !== 4 || mainEntries.length !== 5) process.exitCode = 1;
