const fs = require("fs");
const path = require("path");
const vm = require("vm");

const vocabularyRoot = path.join(__dirname, "..", "english", "vocabulary");
const vocabularyBatchPaths = [
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner001.js"),
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner002.js"),
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner003.js"),
];
const vocabularyEntryPath = path.join(vocabularyRoot, "geptVocabulary.js");
const vocabularyScriptPaths = [...vocabularyBatchPaths, vocabularyEntryPath];
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
const expectedVocabularyCount = 1500;
const batchPattern = /^beginner-\d{3}$/;

function loadVocabulary() {
  const context = {};

  vocabularyScriptPaths.forEach((scriptPath) => {
    const source = fs.readFileSync(scriptPath, "utf8");
    vm.runInNewContext(source, context, {
      filename: scriptPath,
    });
  });

  vm.runInNewContext("this.geptVocabulary = geptVocabulary;", context, {
    filename: vocabularyEntryPath,
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

  if (vocabulary.length !== expectedVocabularyCount) {
    errors.push(`總單字數應為 ${expectedVocabularyCount}，目前為 ${vocabulary.length}。`);
  }

  for (let index = 0; index < vocabulary.length; index += 1) {
    const item = vocabulary[index];

    if (!item || typeof item !== "object") {
      errors.push(`第 ${index + 1} 筆資料不是有效物件。`);
      continue;
    }
    requiredFields.forEach((field) => {
      if (!normalizeValue(item[field])) {
        errors.push(`第 ${index + 1} 筆資料缺少或留空欄位：${field}`);
      }
    });

    if (item.level !== expectedCurrentLevel) {
      errors.push(`第 ${index + 1} 筆資料 level 應為「${expectedCurrentLevel}」，目前為「${item.level}」。`);
    }

    if (!batchPattern.test(normalizeValue(item.batch))) {
      errors.push(`第 ${index + 1} 筆資料 batch 格式不正確，目前為「${item.batch}」。`);
    }
  }

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
