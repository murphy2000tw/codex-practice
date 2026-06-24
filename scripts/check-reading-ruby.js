#!/usr/bin/env node
const path = require('node:path');
const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));

const readingSets = window.JAPANESE_READING_SETS || [];
const kanaReadingPattern = /^[\u3041-\u3096\u30A1-\u30FAー]+$/u;
const kanjiPattern = /[\u3400-\u9FFF々〆ヵヶ]/u;
const errors = [];
const warnings = [];

function normalizeRubyTerms(rubyTerms) {
  if (!Array.isArray(rubyTerms)) return [];
  return rubyTerms
    .filter((term) => term && term.text && term.reading)
    .map((term) => ({ text: String(term.text).trim(), reading: String(term.reading).trim() }))
    .filter((term) => term.text && term.reading && kanaReadingPattern.test(term.reading))
    .sort((a, b) => b.text.length - a.text.length || a.text.localeCompare(b.text, 'ja'));
}

function mergeAndDedupeTerms(vocabTerms = [], manualTerms = []) {
  const merged = new Map();
  normalizeRubyTerms(vocabTerms).forEach((term) => merged.set(term.text, term));
  normalizeRubyTerms(manualTerms).forEach((term) => merged.set(term.text, term));
  return normalizeRubyTerms([...merged.values()]);
}

function createRubyPartsFromTerms(text, rubyTerms) {
  const source = String(text ?? '');
  const terms = normalizeRubyTerms(rubyTerms);
  const parts = [];
  let index = 0;
  while (index < source.length) {
    const match = terms.find((term) => source.startsWith(term.text, index));
    if (match) {
      parts.push({ base: match.text, ruby: match.reading });
      index += match.text.length;
    } else {
      parts.push({ text: source[index] });
      index += 1;
    }
  }
  return parts;
}

for (const readingSet of readingSets) {
  const sourceText = `${readingSet.title ?? ''}\n${readingSet.passage ?? ''}`;
  const vocabTerms = [];

  for (const [index, item] of (readingSet.vocabulary || []).entries()) {
    const label = `${readingSet.id} vocabulary[${index}]`;
    const word = String(item?.word ?? '').trim();
    const kana = String(item?.kana ?? '').trim();
    if (!word) errors.push(`${label}: word must not be empty`);
    if (!kana) errors.push(`${label}: kana must not be empty`);
    if (kana && !kanaReadingPattern.test(kana)) warnings.push(`${label}: kana is not safe for ruby and will be skipped: ${kana}`);
    if (kana && kanjiPattern.test(kana)) warnings.push(`${label}: kana contains kanji and will be skipped: ${kana}`);
    if (word && !sourceText.includes(word)) warnings.push(`${label}: word does not appear in title or passage: ${word}`);
    vocabTerms.push({ text: word, reading: kana });
  }

  const manualTerms = Array.isArray(readingSet.rubyTerms) ? readingSet.rubyTerms : [];
  const seenManualTexts = new Set();
  for (const [index, term] of manualTerms.entries()) {
    const label = `${readingSet.id} rubyTerms[${index}]`;
    const text = String(term?.text ?? '').trim();
    const reading = String(term?.reading ?? '').trim();
    if (!text) errors.push(`${label}: text must not be empty`);
    if (!reading) errors.push(`${label}: reading must not be empty`);
    if (reading && !kanaReadingPattern.test(reading)) errors.push(`${label}: reading must contain only kana, katakana, or ー: ${reading}`);
    if (reading && kanjiPattern.test(reading)) errors.push(`${label}: reading must not contain kanji: ${reading}`);
    if (text && !sourceText.includes(text)) warnings.push(`${label}: text does not appear in title or passage: ${text}`);
    if (seenManualTexts.has(text)) warnings.push(`${label}: duplicate rubyTerms text; later duplicate is ignored by rendering priority: ${text}`);
    seenManualTexts.add(text);
  }

  const terms = mergeAndDedupeTerms(vocabTerms, manualTerms);
  for (const textField of ['title', 'passage']) {
    const parts = createRubyPartsFromTerms(readingSet[textField], terms);
    const renderedBase = parts.map((part) => part.base ?? part.text ?? '').join('');
    if (renderedBase !== String(readingSet[textField] ?? '')) errors.push(`${readingSet.id} ${textField}: rendered base text mismatch`);
    for (const part of parts) if (part.ruby && kanjiPattern.test(part.ruby)) errors.push(`${readingSet.id} ${textField}: generated rt contains kanji: ${part.ruby}`);
  }
}

if (warnings.length) {
  console.warn('Reading rubyTerms warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}
if (errors.length) {
  console.error('Reading rubyTerms check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Checked ${readingSets.length} reading sets. Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.`);
