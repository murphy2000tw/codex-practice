#!/usr/bin/env node
const path = require('node:path');
const repoRoot = path.join(__dirname, '..');
global.window = {};
require(path.join(repoRoot, 'japaneseReadingQuestions.js'));

const readingSets = window.JAPANESE_READING_SETS || [];
const kanaReadingPattern = /^[\u3041-\u3096\u30A1-\u30FAー]+$/u;
const kanjiPattern = /[\u3400-\u9FFF々〆ヵヶ]/u;
const importantCompoundTerms = [
  '来週', '急行', '店長', '学校祭', '準備', '予約確認', '前日', '午後', '連絡', '当日',
  '変更', '道路', '中央公園', '開店時間', '平日', '来月', '日曜日', '普通電車', '受付',
  '荷物', '朝食', '地域清掃', '軍手', '飲み物', '写真部', '建物', '授業', '学生', '予定',
  '営業', '時間', '駅前', '教室', '習慣', '文化祭', '放課後',
];
const repeatedOffTopicOptions = ['予定を全部やめます', '何も持って行きません', '別の日に学校で聞きます'];
const errors = [];
const warnings = [];

const commonReadingRubyTerms = [
  { text: "来週", reading: "らいしゅう" }, { text: "急行", reading: "きゅうこう" }, { text: "店長", reading: "てんちょう" },
  { text: "学校祭", reading: "がっこうさい" }, { text: "準備", reading: "じゅんび" }, { text: "予約確認", reading: "よやくかくにん" },
  { text: "前日", reading: "ぜんじつ" }, { text: "午後", reading: "ごご" }, { text: "連絡", reading: "れんらく" },
  { text: "当日", reading: "とうじつ" }, { text: "変更", reading: "へんこう" }, { text: "道路", reading: "どうろ" },
  { text: "中央公園", reading: "ちゅうおうこうえん" }, { text: "開店時間", reading: "かいてんじかん" }, { text: "平日", reading: "へいじつ" },
  { text: "来月", reading: "らいげつ" }, { text: "日曜日", reading: "にちようび" }, { text: "普通電車", reading: "ふつうでんしゃ" },
  { text: "受付", reading: "うけつけ" }, { text: "荷物", reading: "にもつ" }, { text: "朝食", reading: "ちょうしょく" },
  { text: "地域清掃", reading: "ちいきせいそう" }, { text: "軍手", reading: "ぐんて" }, { text: "飲み物", reading: "のみもの" },
  { text: "写真部", reading: "しゃしんぶ" }, { text: "建物", reading: "たてもの" }, { text: "授業", reading: "じゅぎょう" },
  { text: "学生", reading: "がくせい" }, { text: "予定", reading: "よてい" }, { text: "営業", reading: "えいぎょう" },
  { text: "時間", reading: "じかん" }, { text: "駅前", reading: "えきまえ" }, { text: "教室", reading: "きょうしつ" },
  { text: "習慣", reading: "しゅうかん" }, { text: "文化祭", reading: "ぶんかさい" }, { text: "放課後", reading: "ほうかご" },
];

function normalizeRubyTerms(rubyTerms) {
  if (!Array.isArray(rubyTerms)) return [];
  return rubyTerms
    .filter((term) => term && term.text && term.reading)
    .map((term) => ({ text: String(term.text).trim(), reading: String(term.reading).trim() }))
    .filter((term) => term.text && term.reading && kanaReadingPattern.test(term.reading) && kanjiPattern.test(term.text))
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
    if (kana && !kanaReadingPattern.test(kana)) errors.push(`${label}: kana must contain only kana, katakana, or ー: ${kana}`);
    if (kana && kanjiPattern.test(kana)) errors.push(`${label}: kana must not contain kanji: ${kana}`);
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

  const terms = mergeAndDedupeTerms([...commonReadingRubyTerms, ...vocabTerms], manualTerms);

  for (const importantTerm of importantCompoundTerms) {
    if (!sourceText.includes(importantTerm)) continue;
    const term = terms.find((candidate) => candidate.text === importantTerm);
    if (!term) errors.push(`${readingSet.id}: missing whole-compound ruby term: ${importantTerm}`);
    for (const textField of ['title', 'passage']) {
      if (!String(readingSet[textField] ?? '').includes(importantTerm)) continue;
      const parts = createRubyPartsFromTerms(readingSet[textField], terms);
      if (!parts.some((part) => part.base === importantTerm || String(part.base ?? '').includes(importantTerm))) {
        errors.push(`${readingSet.id} ${textField}: important compound is not rendered as one ruby unit: ${importantTerm}`);
      }
    }
  }

  for (const question of readingSet.questions || []) {
    for (const option of question.options || []) {
      if (repeatedOffTopicOptions.includes(option)) errors.push(`${readingSet.id} ${question.id}: off-topic repeated option remains: ${option}`);
    }
  }

  const applicableTermCount = terms.filter((term) => sourceText.includes(term.text)).length;
  if (applicableTermCount < 3) {
    warnings.push(`${readingSet.id} ${readingSet.title}: only ${applicableTermCount} applicable ruby terms in title + passage`);
  }
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
