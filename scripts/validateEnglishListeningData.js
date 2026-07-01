const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const listeningPath = path.join(repoRoot, "english", "listening", "listeningPage.js");
const vocabularyRoot = path.join(repoRoot, "english", "vocabulary");
const vocabularyFiles = [
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner001.js"),
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner002.js"),
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner003.js"),
  path.join(vocabularyRoot, "data", "geptVocabularyBeginner004.js"),
  path.join(vocabularyRoot, "geptVocabulary.js"),
];

function extractArraySource(source, name) {
  const marker = `const ${name} = [`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Cannot find ${name}.`);
  const arrayStart = source.indexOf("[", start);
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) return source.slice(arrayStart, i + 1);
  }
  throw new Error(`Cannot parse ${name}.`);
}

function parseArray(source, name) {
  return vm.runInNewContext(extractArraySource(source, name), {}, { filename: listeningPath });
}

function loadVocabulary() {
  const context = {};
  for (const file of vocabularyFiles) {
    vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  vm.runInNewContext("this.geptVocabulary = geptVocabulary;", context);
  if (!Array.isArray(context.geptVocabulary)) throw new Error("geptVocabulary must be an array.");
  return context.geptVocabulary;
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function addDuplicateIdErrors(items, label, errors) {
  const seen = new Set();
  for (const item of items) {
    if (isBlank(item.id)) {
      errors.push(`${label}: item is missing id.`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}.`);
    seen.add(item.id);
  }
}

function validateOptionAnswer(item, label, errors, answerField = "answer") {
  if (isBlank(item[answerField])) errors.push(`${label} ${item.id}: missing ${answerField}.`);
  if (!Array.isArray(item.options) || item.options.length === 0) {
    errors.push(`${label} ${item.id}: missing options.`);
    return;
  }
  const optionValues = item.options.map((option) => (typeof option === "string" ? option : option.id));
  if (!optionValues.includes(item[answerField])) {
    errors.push(`${label} ${item.id}: ${answerField} is not present in options.`);
  }
}

function main() {
  const source = fs.readFileSync(listeningPath, "utf8");
  const listeningSentences = parseArray(source, "listeningSentences");
  const listeningQuestionAnswers = parseArray(source, "listeningQuestionAnswers");
  const geptPictureListeningItems = parseArray(source, "geptPictureListeningItems");
  const geptConversationListeningItems = parseArray(source, "geptConversationListeningItems");
  const geptShortTalkListeningItems = parseArray(source, "geptShortTalkListeningItems");
  const vocabulary = loadVocabulary();
  const errors = [];

  addDuplicateIdErrors(listeningSentences, "sentence listening", errors);
  addDuplicateIdErrors(listeningQuestionAnswers, "question-answer listening", errors);
  addDuplicateIdErrors(geptPictureListeningItems, "GEPT picture listening", errors);
  addDuplicateIdErrors(geptConversationListeningItems, "GEPT conversation listening", errors);
  addDuplicateIdErrors(geptShortTalkListeningItems, "GEPT short talk listening", errors);
  addDuplicateIdErrors(vocabulary, "GEPT vocabulary", errors);

  for (const item of listeningSentences) {
    if (isBlank(item.text)) errors.push(`sentence listening ${item.id}: missing sentence text.`);
  }
  for (const item of listeningQuestionAnswers) {
    if (isBlank(item.question)) errors.push(`question-answer listening ${item.id}: missing question.`);
    validateOptionAnswer(item, "question-answer listening", errors);
  }
  for (const item of geptPictureListeningItems) {
    if (isBlank(item.audioText)) errors.push(`GEPT picture listening ${item.id}: missing audioText.`);
    validateOptionAnswer(item, "GEPT picture listening", errors, "answerId");
    for (const option of item.options || []) {
      if (isBlank(option.label) || isBlank(option.alt)) {
        errors.push(`GEPT picture listening ${item.id}: option ${option.id || "(missing id)"} is missing image/emoji label or alt text.`);
      }
    }
  }
  for (const item of [...geptConversationListeningItems, ...geptShortTalkListeningItems]) {
    if (isBlank(item.audioText)) errors.push(`${item.type} ${item.id}: missing audioText.`);
    validateOptionAnswer(item, item.type, errors);
  }
  for (const item of vocabulary) {
    if (isBlank(item.word)) errors.push(`GEPT vocabulary ${item.id}: missing word.`);
    if (isBlank(item.example)) errors.push(`GEPT vocabulary ${item.id}: missing listening example sentence.`);
    if (isBlank(item.translation)) errors.push(`GEPT vocabulary ${item.id}: missing Chinese translation.`);
  }

  if (errors.length > 0) {
    console.error("English listening data validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`English listening data validation passed: ${listeningSentences.length} sentence, ${listeningQuestionAnswers.length} Q&A, ${geptPictureListeningItems.length} picture, ${geptConversationListeningItems.length} conversation, ${geptShortTalkListeningItems.length} short talk, ${vocabulary.length} vocabulary items checked.`);
}

main();
