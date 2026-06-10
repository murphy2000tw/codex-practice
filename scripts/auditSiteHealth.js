const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");

const expectedQuestionBanks = {
  "GEPT beginner vocabulary": 2000,
  "article questions": 200,
  "reading articles": 50,
  "reading questions": 200,
  "fill-in-the-blank questions": 200,
  "Japanese vocabulary cards": 3100,
  "Japanese grammar cards": 290,
};

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function walkFiles(directory, predicate, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "build"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, files);
    } else if (predicate(fullPath)) {
      files.push(path.relative(rootDir, fullPath));
    }
  }

  return files.sort();
}

function resolveSitePath(fromFile, target) {
  const cleanTarget = target.split("#")[0].split("?")[0];

  if (!cleanTarget || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(cleanTarget)) {
    return null;
  }

  return path.normalize(path.join(path.dirname(path.join(rootDir, fromFile)), cleanTarget));
}

function targetExists(fullPath) {
  if (fs.existsSync(fullPath)) {
    return true;
  }

  return fs.existsSync(path.join(fullPath, "index.html"));
}

function auditLinks() {
  const htmlFiles = walkFiles(rootDir, (file) => file.endsWith(".html"));
  const brokenLinks = [];
  const missingHomeLinks = [];

  for (const htmlFile of htmlFiles) {
    const html = read(htmlFile);
    const linkPattern = /(?:href|src)=["']([^"']+)["']/gi;
    let match;

    while ((match = linkPattern.exec(html))) {
      const fullPath = resolveSitePath(htmlFile, match[1]);

      if (fullPath && !targetExists(fullPath)) {
        brokenLinks.push(`${htmlFile} -> ${match[1]}`);
      }
    }

    if (htmlFile !== "index.html") {
      const hasRootHomeLink = /<a\b[^>]*href=["'](?:\.\.\/|\.\.\/\.\.\/)["'][^>]*>\s*首頁\s*<\/a>/u.test(html);
      const isEnglishSubpage = htmlFile.startsWith("english/") && htmlFile !== "english/index.html";
      const hasEnglishHomeLink = /<a\b[^>]*href=["']\.\.\/["'][^>]*>\s*返回英文學習首頁\s*<\/a>/u.test(html);

      if (!hasRootHomeLink && !(isEnglishSubpage && hasEnglishHomeLink)) {
        missingHomeLinks.push(htmlFile);
      }
    }
  }

  return { htmlFiles, brokenLinks, missingHomeLinks };
}

function createScriptContext() {
  const context = {
    console,
    window: {},
  };
  context.globalThis = context;
  return vm.createContext(context);
}

function runScript(context, relativePath) {
  vm.runInContext(read(relativePath), context, { filename: relativePath });
}

function loadGeptVocabulary() {
  const context = createScriptContext();

  for (const file of [
    "english/vocabulary/data/geptVocabularyBeginner001.js",
    "english/vocabulary/data/geptVocabularyBeginner002.js",
    "english/vocabulary/data/geptVocabularyBeginner003.js",
    "english/vocabulary/data/geptVocabularyBeginner004.js",
    "english/vocabulary/geptVocabulary.js",
  ]) {
    runScript(context, file);
  }

  return vm.runInContext("geptVocabulary", context);
}

function loadWindowArray(relativePath, name) {
  const context = createScriptContext();
  runScript(context, relativePath);
  return context.window[name];
}

function auditQuestionCounts() {
  const geptVocabulary = loadGeptVocabulary();
  const articleQuestions = loadWindowArray("english/articles/articleQuestions.js", "articleQuestions");
  const readingQuestions = loadWindowArray("english/reading/readingQuestions.js", "readingQuestions");
  const fillBlankQuestions = loadWindowArray("english/fill-in-the-blank/fillBlankQuestions.js", "fillBlankQuestions");
  const japaneseVocabulary = JSON.parse(read("vocabulary.json"));
  const japaneseGrammar = JSON.parse(read("grammar.json"));
  const readingQuestionTotal = readingQuestions.reduce((sum, article) => sum + article.questions.length, 0);

  const actualCounts = {
    "GEPT beginner vocabulary": geptVocabulary.length,
    "article questions": articleQuestions.length,
    "reading articles": readingQuestions.length,
    "reading questions": readingQuestionTotal,
    "fill-in-the-blank questions": fillBlankQuestions.length,
    "Japanese vocabulary cards": japaneseVocabulary.length,
    "Japanese grammar cards": japaneseGrammar.length,
  };

  const mismatches = Object.entries(expectedQuestionBanks)
    .filter(([name, expected]) => actualCounts[name] !== expected)
    .map(([name, expected]) => `${name}: expected ${expected}, found ${actualCounts[name]}`);

  return { actualCounts, mismatches };
}

function auditManifest() {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const iconErrors = [];

  if (!manifest.name || !manifest.short_name || manifest.display !== "standalone" || !manifest.start_url) {
    iconErrors.push("manifest is missing required PWA display metadata");
  }

  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    iconErrors.push("manifest has no icons");
  } else {
    for (const icon of manifest.icons) {
      const iconPath = path.join(rootDir, icon.src || "");

      if (!icon.src || !fs.existsSync(iconPath)) {
        iconErrors.push(`missing manifest icon: ${icon.src}`);
        continue;
      }

      const signature = fs.readFileSync(iconPath).subarray(0, 8).toString("hex");
      if (signature !== "89504e470d0a1a0a") {
        iconErrors.push(`${icon.src} is not a valid PNG file`);
      }
    }
  }

  return { manifest, iconErrors };
}

function auditHardcodedQuestionTotals() {
  const sourceFiles = walkFiles(rootDir, (file) => /\.(?:html|js)$/.test(file))
    .filter((file) => !file.startsWith("scripts/"));
  const suspiciousMatches = [];
  const pattern = /(?:2000|3100|\b290\b|\b200\b|\b50\b)\s*(?:個|筆|題|篇|questions?|articles?|cards?)/giu;

  for (const file of sourceFiles) {
    const source = read(file);
    let match;

    while ((match = pattern.exec(source))) {
      suspiciousMatches.push(`${file}: ${match[0]}`);
    }
  }

  return suspiciousMatches;
}

function auditMobileTouchStyles() {
  const css = read("style.css");
  const hasMobileMedia = /@media\s*\(max-width:\s*640px\)/.test(css);
  const hasFullWidthMobileButtons = /\.answer-button,\s*\n\s*\.secondary-button\s*{\s*\n\s*width:\s*100%/m.test(css);
  const hasTouchTargetRule = /min-height:\s*44px/.test(css);

  return {
    hasMobileMedia,
    hasFullWidthMobileButtons,
    hasTouchTargetRule,
    errors: [
      !hasMobileMedia && "missing 640px mobile media query",
      !hasFullWidthMobileButtons && "mobile primary/secondary buttons are not full width",
      !hasTouchTargetRule && "interactive controls do not enforce a 44px touch target",
    ].filter(Boolean),
  };
}

function main() {
  const { htmlFiles, brokenLinks, missingHomeLinks } = auditLinks();
  const { actualCounts, mismatches } = auditQuestionCounts();
  const { iconErrors } = auditManifest();
  const hardcodedQuestionTotals = auditHardcodedQuestionTotals();
  const mobileTouchStyles = auditMobileTouchStyles();
  const errors = [
    ...brokenLinks.map((error) => `Broken link: ${error}`),
    ...missingHomeLinks.map((error) => `Missing home link: ${error}`),
    ...mismatches.map((error) => `Question bank count mismatch: ${error}`),
    ...iconErrors.map((error) => `Manifest/icon issue: ${error}`),
    ...hardcodedQuestionTotals.map((error) => `Hardcoded question-bank total in app source: ${error}`),
    ...mobileTouchStyles.errors.map((error) => `Mobile touch style issue: ${error}`),
  ];

  console.log(`HTML pages checked: ${htmlFiles.length}`);
  console.log(`Question-bank counts: ${JSON.stringify(actualCounts)}`);
  console.log("Manifest/icon audit completed.");
  console.log("Mobile touch-target CSS audit completed.");

  if (errors.length) {
    console.error("Site health audit failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Site health audit passed.");
}

main();
