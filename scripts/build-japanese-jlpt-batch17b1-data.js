#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'japaneseJlptVocabularyGrammarQuestions.json');
const POLICY_VERSION = '17b1-internal-v1';

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
}

function stable(a, b) {
  return String(a.id).localeCompare(String(b.id), 'en', { numeric: true });
}

function hasKanji(value) {
  return /\p{Script=Han}/u.test(String(value || ''));
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function firstUniqueSafeByDisplay(items, count, displayFn) {
  const picked = [];
  const seenDisplay = new Set();
  for (const item of items) {
    const display = displayFn(item);
    if (!display || hasKanji(display) || seenDisplay.has(display)) continue;
    seenDisplay.add(display);
    picked.push(item);
    if (picked.length === count) break;
  }
  return picked;
}

function placeOptions(answer, distractors, answerIndex) {
  const options = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    options.push(index === answerIndex ? answer : distractors[distractorIndex++]);
  }
  return options;
}

const groupPatterns = {
  vocabN5: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
  vocabN4: [0, 1, 2, 3, 0, 1, 2, 3, 2, 3],
  grammarMeaningN5: [0, 1, 2, 3, 0],
  grammarClozeN5: [0, 1, 2, 3, 1],
  grammarMeaningN4: [0, 1, 2, 3, 2],
  grammarClozeN4: [0, 1, 2, 3, 3]
};

function buildVocabulary(level) {
  const all = readJson('vocabulary.json').filter((item) => item.level === level).sort(stable);
  const meaningUnique = uniqueBy(all.filter((item) => item.kana && item.meaning), (item) => item.meaning);
  const picked = firstUniqueSafeByDisplay(meaningUnique, 10, (item) => item.kana);
  if (picked.length < 10) throw new Error(`Not enough ${level} vocabulary after kana-display de-duplication`);

  return picked.map((item, index) => {
    const samePartOfSpeech = uniqueBy(
      all.filter((candidate) => candidate.id !== item.id && candidate.partOfSpeech === item.partOfSpeech && candidate.meaning),
      (candidate) => candidate.meaning
    ).map((candidate) => candidate.meaning);
    const sameLevel = uniqueBy(
      all.filter((candidate) => candidate.id !== item.id && candidate.meaning),
      (candidate) => candidate.meaning
    ).map((candidate) => candidate.meaning);
    const distractors = [...samePartOfSpeech, ...sameLevel].filter((meaning) => meaning !== item.meaning).slice(0, 3);
    if (new Set([item.meaning, ...distractors]).size !== 4) throw new Error(`${level} vocabulary option shortage for ${item.id}`);
    const answerIndex = groupPatterns[`vocab${level}`][index];
    return {
      id: `jlpt-vocab-${level.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
      level,
      section: 'vocabulary',
      questionType: 'meaning',
      sourceIds: [String(item.id)],
      originalText: item.word,
      displayText: item.kana,
      kana: item.kana,
      rubyTerms: [],
      kanjiPolicy: 'kana-replacement',
      options: placeOptions(item.meaning, distractors, answerIndex),
      answerIndex,
      answerDisplay: { word: item.word, kana: item.kana, meaning: item.meaning },
      explanation: `「${item.kana}」的中文意思是「${item.meaning}」。`,
      timeLimit: null,
      scoreWeight: 1,
      reviewTags: ['batch17b1', 'derived', 'kana-replacement']
    };
  });
}

function buildGrammarMeaning(level) {
  const all = readJson('grammar.json').filter((item) => item.level === level).sort(stable);
  const meaningUnique = uniqueBy(all.filter((item) => item.kana && item.meaning), (item) => item.meaning);
  const picked = firstUniqueSafeByDisplay(meaningUnique, 5, (item) => item.kana);
  if (picked.length < 5) throw new Error(`Not enough ${level} grammar meaning after kana-display de-duplication`);

  return picked.map((item, index) => {
    const distractors = uniqueBy(
      all.filter((candidate) => candidate.id !== item.id && candidate.meaning),
      (candidate) => candidate.meaning
    ).map((candidate) => candidate.meaning).filter((meaning) => meaning !== item.meaning).slice(0, 3);
    if (new Set([item.meaning, ...distractors]).size !== 4) throw new Error(`${level} grammar meaning option shortage for ${item.id}`);
    const answerIndex = groupPatterns[`grammarMeaning${level}`][index];
    return {
      id: `jlpt-grammar-meaning-${level.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
      level,
      section: 'grammar',
      questionType: 'meaning',
      sourceIds: [item.id],
      originalText: item.grammar,
      displayText: item.kana,
      kana: item.kana,
      rubyTerms: [],
      kanjiPolicy: 'kana-replacement',
      options: placeOptions(item.meaning, distractors, answerIndex),
      answerIndex,
      answerDisplay: { grammar: item.grammar, kana: item.kana, meaning: item.meaning, structure: item.structure },
      explanation: `「${item.kana}」表示「${item.meaning}」。`,
      timeLimit: null,
      scoreWeight: 1,
      reviewTags: ['batch17b1', 'derived', 'kana-replacement']
    };
  });
}

function buildGrammarCloze(level) {
  const all = readJson('grammar.json').filter((item) => item.level === level).sort(stable);
  const picked = uniqueBy(
    all.filter((item) => item.quiz
      && item.quiz.clozePrompt
      && item.quiz.clozePromptKana
      && item.quiz.clozeMeaning
      && item.quiz.answer
      && item.quiz.explanation
      && Array.isArray(item.quiz.choices)
      && new Set(item.quiz.choices).size === 4
      && !hasKanji(item.quiz.clozePromptKana)
      && item.quiz.choices.every((choice) => !hasKanji(choice))),
    (item) => item.quiz.answer
  ).slice(0, 5);
  if (picked.length < 5) throw new Error(`Not enough ${level} grammar cloze`);

  return picked.map((item, index) => {
    if (!item.quiz.choices.includes(item.quiz.answer)) throw new Error(`${level} grammar cloze answer missing for ${item.id}`);
    const answerIndex = groupPatterns[`grammarCloze${level}`][index];
    const distractors = item.quiz.choices.filter((choice) => choice !== item.quiz.answer);
    const options = placeOptions(item.quiz.answer, distractors, answerIndex);
    return {
      id: `jlpt-grammar-cloze-${level.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
      level,
      section: 'grammar',
      questionType: 'cloze',
      sourceIds: [item.id],
      originalText: item.quiz.clozePrompt,
      displayText: item.quiz.clozePromptKana,
      kana: item.quiz.clozePromptKana,
      rubyTerms: [],
      kanjiPolicy: 'kana-replacement',
      options,
      answerIndex,
      answerDisplay: { grammar: item.grammar, kana: item.kana, answer: item.quiz.answer, meaning: item.quiz.clozeMeaning, structure: item.structure },
      explanation: item.quiz.explanation,
      timeLimit: null,
      scoreWeight: 1,
      reviewTags: ['batch17b1', 'derived', 'kana-replacement']
    };
  });
}

function build() {
  const policy = readJson('japaneseJlptKanjiPolicy.json');
  if (policy.policyVersion !== POLICY_VERSION) throw new Error('policy mismatch');
  return {
    schemaVersion: 1,
    policyVersion: POLICY_VERSION,
    disclaimer: 'Site-internal non-official JLPT-style simulated practice data. Not an official JLPT question bank, kanji list, scoring method, or difficulty certification.',
    generatedFrom: ['vocabulary.json', 'grammar.json', 'japaneseJlptKanjiPolicy.json'],
    questions: [
      ...buildVocabulary('N5'),
      ...buildVocabulary('N4'),
      ...buildGrammarMeaning('N5'),
      ...buildGrammarCloze('N5'),
      ...buildGrammarMeaning('N4'),
      ...buildGrammarCloze('N4')
    ]
  };
}

function main() {
  const text = `${JSON.stringify(build(), null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const current = fs.readFileSync(OUT, 'utf8');
    if (current !== text) {
      console.error('Generated JLPT data differs from committed file.');
      process.exit(1);
    }
    console.log('JLPT Batch 17B-1 generated data matches committed file.');
    return;
  }
  fs.writeFileSync(OUT, text);
  console.log('Wrote japaneseJlptVocabularyGrammarQuestions.json');
}

main();
