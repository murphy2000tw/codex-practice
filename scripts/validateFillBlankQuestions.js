const fs = require("fs");
const path = require("path");
const vm = require("vm");

const questionFilePath = path.join(__dirname, "..", "english", "fill-in-the-blank", "fillBlankQuestions.js");
const expectedTotal = 120;
const requiredFields = [
  "id",
  "sentence",
  "blankSentence",
  "answer",
  "acceptableAnswers",
  "translation",
  "explanation",
  "category",
  "hint",
];

const code = fs.readFileSync(questionFilePath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: questionFilePath });

const questions = sandbox.window.fillBlankQuestions;
const errors = [];

if (!Array.isArray(questions)) {
  errors.push("window.fillBlankQuestions must be an array.");
} else {
  if (questions.length !== expectedTotal) {
    errors.push(`Expected ${expectedTotal} questions, but found ${questions.length}.`);
  }

  const seenIds = new Set();
  const seenBlankSentences = new Set();
  const duplicateBlankSentences = new Set();
  const categoryCounts = new Map();

  questions.forEach((question, index) => {
    const label = question.id || `question at index ${index}`;
    const expectedId = `blank-${String(index + 1).padStart(3, "0")}`;

    requiredFields.forEach((field) => {
      if (!(field in question)) {
        errors.push(`${label} is missing ${field}.`);
      }
    });

    if (question.id) {
      if (seenIds.has(question.id)) {
        errors.push(`Duplicate id: ${question.id}.`);
      }
      seenIds.add(question.id);

      if (question.id !== expectedId) {
        errors.push(`${label} should use sequential id ${expectedId}.`);
      }
    }

    if (!question.sentence || !String(question.sentence).trim()) {
      errors.push(`${label} has empty sentence.`);
    }

    if (!question.blankSentence || !String(question.blankSentence).trim()) {
      errors.push(`${label} has empty blankSentence.`);
    } else {
      if (!question.blankSentence.includes("___")) {
        errors.push(`${label} blankSentence must include ___.`);
      }

      if (seenBlankSentences.has(question.blankSentence)) {
        duplicateBlankSentences.add(question.blankSentence);
      }
      seenBlankSentences.add(question.blankSentence);
    }

    if (!question.answer || !String(question.answer).trim()) {
      errors.push(`${label} has empty answer.`);
    }

    if (!Array.isArray(question.acceptableAnswers) || question.acceptableAnswers.length === 0) {
      errors.push(`${label} must have a non-empty acceptableAnswers array.`);
    } else if (!question.acceptableAnswers.some((answer) => String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase())) {
      errors.push(`${label} acceptableAnswers should include the main answer.`);
    }

    ["translation", "explanation", "category", "hint"].forEach((field) => {
      if (!question[field] || !String(question[field]).trim()) {
        errors.push(`${label} has empty ${field}.`);
      }
    });

    if (question.category) {
      categoryCounts.set(question.category, (categoryCounts.get(question.category) || 0) + 1);
    }
  });

  duplicateBlankSentences.forEach((blankSentence) => {
    errors.push(`Duplicate blankSentence: ${blankSentence}`);
  });

  console.log(`Fill-in-the-blank question total: ${questions.length}`);
  console.log(`Category counts: ${JSON.stringify(Object.fromEntries(categoryCounts))}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Fill-in-the-blank question validation passed.");
