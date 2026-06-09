const fs = require("fs");
const path = require("path");
const vm = require("vm");

const questionFilePath = path.join(__dirname, "..", "english", "reading", "readingQuestions.js");
const expectedArticleTotal = 20;
const expectedQuestionsPerArticle = 4;
const expectedQuestionTotal = 80;
const requiredArticleFields = ["id", "title", "level", "category", "passage", "translation", "questions"];
const requiredQuestionFields = ["id", "question", "options", "answer", "explanation", "questionType"];
const requiredQuestionTypes = ["主旨題", "細節題", "單字意思題", "推論題", "時間順序題", "代名詞指代題", "訊息理解題"];

const code = fs.readFileSync(questionFilePath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: questionFilePath });

const articles = sandbox.window.readingQuestions;
const errors = [];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

if (!Array.isArray(articles)) {
  errors.push("window.readingQuestions must be an array.");
} else {
  const seenIds = new Set();
  const questionTypeCounts = Object.fromEntries(requiredQuestionTypes.map((type) => [type, 0]));
  const totalQuestions = articles.reduce((total, article) => total + (Array.isArray(article.questions) ? article.questions.length : 0), 0);

  if (articles.length !== expectedArticleTotal) {
    errors.push(`Expected ${expectedArticleTotal} reading articles, but found ${articles.length}.`);
  }

  if (totalQuestions !== expectedQuestionTotal) {
    errors.push(`Expected ${expectedQuestionTotal} reading questions, but found ${totalQuestions}.`);
  }

  articles.forEach((article, articleIndex) => {
    const articleLabel = article && article.id ? article.id : `article at index ${articleIndex}`;

    if (!article || typeof article !== "object") {
      errors.push(`${articleLabel} is not a valid object.`);
      return;
    }

    requiredArticleFields.forEach((field) => {
      if (field === "questions") {
        if (!Array.isArray(article.questions)) {
          errors.push(`${articleLabel} is missing questions array.`);
        }
        return;
      }

      if (!hasText(article[field])) {
        errors.push(`${articleLabel} is missing ${field}.`);
      }
    });

    if (article.id) {
      if (seenIds.has(article.id)) {
        errors.push(`Duplicate id: ${article.id}.`);
      }
      seenIds.add(article.id);
    }

    if (!Array.isArray(article.questions)) {
      return;
    }

    if (article.questions.length !== expectedQuestionsPerArticle) {
      errors.push(`${articleLabel} should have ${expectedQuestionsPerArticle} questions, but found ${article.questions.length}.`);
    }

    article.questions.forEach((question, questionIndex) => {
      const questionLabel = question && question.id ? question.id : `${articleLabel} question at index ${questionIndex}`;

      if (!question || typeof question !== "object") {
        errors.push(`${questionLabel} is not a valid object.`);
        return;
      }

      requiredQuestionFields.forEach((field) => {
        if (field === "options") {
          if (!Array.isArray(question.options)) {
            errors.push(`${questionLabel} is missing options array.`);
          }
          return;
        }

        if (!hasText(question[field])) {
          errors.push(`${questionLabel} is missing ${field}.`);
        }
      });

      if (question.id) {
        if (seenIds.has(question.id)) {
          errors.push(`Duplicate id: ${question.id}.`);
        }
        seenIds.add(question.id);
      }

      if (Array.isArray(question.options)) {
        const uniqueOptions = new Set(question.options);

        if (question.options.length !== 4) {
          errors.push(`${questionLabel} should have 4 options, but found ${question.options.length}.`);
        }

        if (uniqueOptions.size !== question.options.length) {
          errors.push(`${questionLabel} has duplicate options.`);
        }

        if (!question.options.includes(question.answer)) {
          errors.push(`${questionLabel} answer must be one of the options.`);
        }
      }

      if (question.questionType && Object.hasOwn(questionTypeCounts, question.questionType)) {
        questionTypeCounts[question.questionType] += 1;
      }
    });
  });

  requiredQuestionTypes.forEach((type) => {
    if (questionTypeCounts[type] === 0) {
      errors.push(`Missing required questionType: ${type}.`);
    }
  });

  console.log(`Reading article total: ${articles.length}`);
  console.log(`Reading question total: ${totalQuestions}`);
  console.log(`Question type counts: ${JSON.stringify(questionTypeCounts)}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Reading question validation passed.");
