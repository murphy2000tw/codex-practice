#!/usr/bin/env node
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));

const readingSets = window.JAPANESE_READING_SETS || [];
const kanaReadingPattern = /^[\u3041-\u3096\u30A1-\u30FAー]+$/u;
const kanjiPattern = /[\u3400-\u9FFF々〆ヵヶ]/u;

function normalizeRubyTerms(rubyTerms) {
  if (!Array.isArray(rubyTerms)) return [];
  return rubyTerms
    .filter((term) => term && term.text && term.reading)
    .map((term) => ({ text: String(term.text), reading: String(term.reading) }))
    .sort((a, b) => b.text.length - a.text.length || a.text.localeCompare(b.text, 'ja'));
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

const errors = [];
let setsWithRubyTerms = 0;

for (const [readingSetIndex, readingSet] of readingSets.entries()) {
  const rubyTerms = Array.isArray(readingSet.rubyTerms) ? readingSet.rubyTerms : [];
  if (!rubyTerms.length) continue;
  setsWithRubyTerms += 1;

  const seenTerms = new Set();
  const sourceText = `${readingSet.title ?? ''}\n${readingSet.passage ?? ''}`;

  for (const [termIndex, term] of rubyTerms.entries()) {
    const label = `${readingSet.id} rubyTerms[${termIndex}]`;
    const text = String(term?.text ?? '');
    const reading = String(term?.reading ?? '');
    const key = `${text}\u0000${reading}`;

    if (!text.trim()) errors.push(`${label}: text must not be empty`);
    if (!reading.trim()) errors.push(`${label}: reading must not be empty`);
    if (reading && !kanaReadingPattern.test(reading)) errors.push(`${label}: reading must contain only kana or ー: ${reading}`);
    if (kanjiPattern.test(reading)) errors.push(`${label}: reading must not contain kanji: ${reading}`);
    if (text && !sourceText.includes(text)) errors.push(`${label}: text does not appear in title or passage: ${text}`);
    if (seenTerms.has(key)) errors.push(`${label}: duplicate rubyTerm: ${text}（${reading}）`);
    seenTerms.add(key);
  }

  const sorted = normalizeRubyTerms(rubyTerms).map((term) => term.text);
  const unsorted = rubyTerms.filter((term) => term?.text && term?.reading).map((term) => String(term.text));
  for (let i = 1; i < unsorted.length; i += 1) {
    if (unsorted[i - 1].length < unsorted[i].length) {
      errors.push(`${readingSet.id}: rubyTerms should be listed longest-to-shortest near "${unsorted[i]}"`);
      break;
    }
  }

  for (const textField of ['title', 'passage']) {
    const parts = createRubyPartsFromTerms(readingSet[textField], rubyTerms);
    const renderedBase = parts.map((part) => part.base ?? part.text ?? '').join('');
    if (renderedBase !== String(readingSet[textField] ?? '')) {
      errors.push(`${readingSet.id} ${textField}: rendered base text mismatch`);
    }
    for (const part of parts) {
      if (part.ruby && kanjiPattern.test(part.ruby)) errors.push(`${readingSet.id} ${textField}: generated rt contains kanji: ${part.ruby}`);
    }
  }

  for (const longer of sorted) {
    for (const shorter of sorted) {
      if (longer !== shorter && longer.includes(shorter) && longer.length > shorter.length) {
        const longerIndex = sorted.indexOf(longer);
        const shorterIndex = sorted.indexOf(shorter);
        if (longerIndex > shorterIndex) errors.push(`${readingSet.id}: overlapping term order should prefer longer text: ${longer} before ${shorter}`);
      }
    }
  }

  if (readingSetIndex >= 30) errors.push(`${readingSet.id}: rubyTerms should only be added to the first 30 reading sets in this batch`);
}

if (errors.length) {
  console.error('Reading rubyTerms check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Checked ${readingSets.length} reading sets. ${setsWithRubyTerms} sets have safe rubyTerms; all terms are present in source text, kana-only, non-empty, unique, and render without base text mismatch.`);
