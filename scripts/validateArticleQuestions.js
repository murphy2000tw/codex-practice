const fs = require("fs");
const path = require("path");
const vm = require("vm");

const questionFilePath = path.join(__dirname, "..", "english", "articles", "articleQuestions.js");
const allowedAnswers = ["a", "an", "the", "不填"];
const expectedTotal = 200;
const expectedOptions = JSON.stringify(allowedAnswers);

const code = fs.readFileSync(questionFilePath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: questionFilePath });

const questions = sandbox.window.articleQuestions;
const errors = [];

if (!Array.isArray(questions)) {
  errors.push("window.articleQuestions must be an array.");
} else {
  if (questions.length !== expectedTotal) {
    errors.push(`Expected ${expectedTotal} questions, but found ${questions.length}.`);
  }

  const seenIds = new Set();
  const seenBlankSentences = new Set();
  const duplicateBlankSentences = new Set();
  const answerCounts = Object.fromEntries(allowedAnswers.map((answer) => [answer, 0]));

  questions.forEach((question, index) => {
    const label = question.id || `question at index ${index}`;

    if (!question.id) {
      errors.push(`${label} is missing id.`);
    } else if (seenIds.has(question.id)) {
      errors.push(`Duplicate id: ${question.id}.`);
    }
    seenIds.add(question.id);

    if (!question.sentence) {
      errors.push(`${label} is missing sentence.`);
    }

    const expectedId = `article-${String(index + 1).padStart(3, "0")}`;
    if (question.id && question.id !== expectedId) {
      errors.push(`${label} should use sequential id ${expectedId}.`);
    }

    if (!question.blankSentence) {
      errors.push(`${label} is missing blankSentence.`);
    } else if (seenBlankSentences.has(question.blankSentence)) {
      duplicateBlankSentences.add(question.blankSentence);
    }
    seenBlankSentences.add(question.blankSentence);

    if (!Array.isArray(question.options)) {
      errors.push(`${label} is missing options array.`);
    } else if (JSON.stringify(question.options) !== expectedOptions) {
      errors.push(`${label} options must be exactly ${expectedOptions}.`);
    }

    if (!allowedAnswers.includes(question.answer)) {
      errors.push(`${label} has invalid answer: ${question.answer}.`);
    } else {
      answerCounts[question.answer] += 1;
    }

    if (!question.explanation) {
      errors.push(`${label} is missing explanation.`);
    }

    if (!question.category) {
      errors.push(`${label} is missing category.`);
    } else if (question.category !== question.answer) {
      errors.push(`${label} category must match answer.`);
    }

    if (!question.usageType) {
      errors.push(`${label} is missing usageType.`);
    }
  });

  duplicateBlankSentences.forEach((blankSentence) => {
    errors.push(`Duplicate blankSentence: ${blankSentence}`);
  });

  console.log(`Article question total: ${questions.length}`);
  console.log(`Answer counts: ${JSON.stringify(answerCounts)}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Article question validation passed.");
