const fs = require("fs");
const path = require("path");
const vm = require("vm");

const vocabularyPath = path.join(__dirname, "..", "english", "vocabulary", "geptVocabulary.js");
const requiredFields = [
  "id",
  "word",
  "partOfSpeech",
  "meaning",
  "category",
  "level",
  "batch",
  "sourceNote",
  "example",
  "translation",
];
const expectedCurrentLevel = "初級";

function loadVocabulary() {
  const source = fs.readFileSync(vocabularyPath, "utf8");
  const context = {};
  vm.runInNewContext(`${source}\nthis.geptVocabulary = geptVocabulary;`, context, {
    filename: vocabularyPath,
  });

  if (!Array.isArray(context.geptVocabulary)) {
    throw new Error("geptVocabulary must be an array.");
  }

  return context.geptVocabulary;
}

function normalizeValue(value) {
  return String(value ?? "").trim();
}

function findDuplicates(items, field) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    const value = normalizeValue(item[field]).toLocaleLowerCase();
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}

function validateVocabulary(vocabulary) {
  const errors = [];

  vocabulary.forEach((item, index) => {
    requiredFields.forEach((field) => {
      if (!normalizeValue(item[field])) {
        errors.push(`第 ${index + 1} 筆資料缺少或留空欄位：${field}`);
      }
    });

    if (item.level !== expectedCurrentLevel) {
      errors.push(`第 ${index + 1} 筆資料 level 應為「${expectedCurrentLevel}」，目前為「${item.level}」。`);
    }
  });

  const duplicateIds = findDuplicates(vocabulary, "id");
  const duplicateWords = findDuplicates(vocabulary, "word");

  if (duplicateIds.length) {
    errors.push(`id 不可重複：${duplicateIds.join(", ")}`);
  }

  if (duplicateWords.length) {
    errors.push(`word 不可重複：${duplicateWords.join(", ")}`);
  }

  return errors;
}

const vocabulary = loadVocabulary();
const errors = validateVocabulary(vocabulary);

if (errors.length) {
  console.error("GEPT 單字資料驗證失敗：");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`GEPT 單字資料驗證通過：${vocabulary.length} 筆資料。`);
