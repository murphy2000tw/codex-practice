const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "english", "vocabulary", "index.html");
const scriptPath = path.join(root, "english", "vocabulary", "geptVocabularyPage.js");
const html = fs.readFileSync(htmlPath, "utf8");
const script = fs.readFileSync(scriptPath, "utf8");
const failures = [];

function requireIncludes(source, snippet, label) {
  if (!source.includes(snippet)) {
    failures.push(`Missing ${label}: ${snippet}`);
  }
}

function requireNotIncludes(source, snippet, label) {
  if (source.includes(snippet)) {
    failures.push(`Unexpected ${label}: ${snippet}`);
  }
}

const appPanelMatch = html.match(/<section id="vocabularyAppPanel"[\s\S]*?<\/section>\s*<\/main>/);
if (!appPanelMatch) {
  failures.push("Unable to locate the English vocabulary practice app panel.");
} else {
  const appPanel = appPanelMatch[0];
  [
    "模式切換",
    "單字卡模式",
    "測驗模式",
    "geptCardModeButton",
    "geptQuizModeButton",
    "geptListeningModeButton",
    "geptListeningTestModeButton",
    "gept-mode-panel",
  ].forEach((forbidden) => {
    requireNotIncludes(appPanel, forbidden, "practice page mode-switch render text or control");
  });

  requireIncludes(appPanel, "返回單字選單", "practice page back-to-menu button");
  requireIncludes(appPanel, "id=\"vocabularyCard\"", "practice vocabulary card");
  requireIncludes(appPanel, "id=\"geptVocabularyControls\"", "practice previous/next controls");
  requireIncludes(appPanel, "分類篩選", "practice category filter");
  requireIncludes(appPanel, "單字搜尋", "practice search control");
}

[
  "geptCardModeButton",
  "geptQuizModeButton",
  "geptListeningModeButton",
  "geptListeningTestModeButton",
].forEach((staleId) => {
  requireNotIncludes(script, `${staleId}?.addEventListener`, "stale practice page mode-switch binding");
});

requireIncludes(script, "removeVocabularyModeSwitchBlock", "forced stale mode-switch removal guard");
requireIncludes(script, "element.remove();", "actual DOM removal for stale mode-switch block");

if (failures.length) {
  console.error("English vocabulary practice mode-switch check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("English vocabulary practice page does not render the mode-switch block.");
