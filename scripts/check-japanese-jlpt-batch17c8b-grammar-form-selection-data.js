#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cp = require("child_process");
const { buildData, serialize, stableId, digestSource, VERSIONS, PATHS } = require("./build-japanese-jlpt-batch17c8b-grammar-form-selection-data.js");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = "b5c5745e6050df102908f6c434431c2c61a06360";
const ALLOWED = new Set([
  "japaneseJlptGrammarFormSelectionReviewManifest.json", "japaneseJlptGrammarFormSelectionQuestions.json",
  "scripts/build-japanese-jlpt-batch17c8b-grammar-form-selection-data.js", "scripts/check-japanese-jlpt-batch17c8b-grammar-form-selection-data.js",
  "docs/japanese-jlpt-batch17c8b-grammar-form-selection-data.md"
]);
const read = file => fs.readFileSync(file, "utf8");
const json = file => JSON.parse(read(file));
const assert = (condition, message) => { if (!condition) throw new Error(`Batch 17C-8B check: ${message}`); };
const clone = value => JSON.parse(JSON.stringify(value));
const runGit = args => cp.execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trimEnd();
const reject = (name, grammar, manifest, mutate) => {
  const g = clone(grammar), m = clone(manifest); mutate(g, m);
  let rejected = false; try { buildData(g, m); } catch (_) { rejected = true; }
  assert(rejected, `negative fixture was accepted: ${name}`);
};

function checkScopeAndProduction() {
  cp.execFileSync("git", ["merge-base", "--is-ancestor", BASELINE, "HEAD"], { cwd: ROOT });
  const requestedBase = process.env.JLPT_17C8B_BASE_REF || BASELINE;
  cp.execFileSync("git", ["rev-parse", "--verify", requestedBase], { cwd: ROOT, stdio: "ignore" });
  const changed = new Set();
  for (const base of new Set([requestedBase, BASELINE])) {
    const output = runGit(["diff", "--name-only", `${base}...HEAD`]);
    if (output) output.split("\n").forEach(file => changed.add(file));
  }
  const porcelain = runGit(["status", "--porcelain"]);
  if (porcelain) porcelain.split("\n").forEach(line => changed.add(line.slice(3)));
  [...changed].forEach(file => assert(ALLOWED.has(file), `scope guard rejects ${file}`));
  const baselineFiles = runGit(["ls-tree", "-r", "--name-only", BASELINE]).split("\n");
  for (const file of baselineFiles) {
    const current = path.join(ROOT, file); if (!fs.existsSync(current) || !fs.statSync(current).isFile()) continue;
    const oldHash = runGit(["rev-parse", `${BASELINE}:${file}`]);
    const nowHash = crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${fs.statSync(current).size}\0`), fs.readFileSync(current)])).digest("hex");
    assert(oldHash === nowHash, `existing repository file changed: ${file}`);
  }
  const script = read(path.join(ROOT, "script.js"));
  const html = read(path.join(ROOT, "japanese/index.html"));
  assert(!script.includes("japaneseJlptGrammarFormSelectionQuestions") && !html.includes("japaneseJlptGrammarFormSelectionQuestions"), "production loads derived bank");
  assert(!script.includes('questionType: "form-selection"') && !script.includes("questionType:'form-selection'"), "production profile enables form-selection");
  assert(script.includes('"17c6-compat-v1"') || script.includes("'17c6-compat-v1'"), "compatibility profile missing");
  assert(/N5[\s\S]{0,500}(?:total|questionCount)[^\d]{0,20}20/.test(script) || script.includes("n5: 20") || script.includes("N5: 20"), "could not verify N5 compatibility count 20");
  assert(/N4[\s\S]{0,500}(?:total|questionCount)[^\d]{0,20}34/.test(script) || script.includes("n4: 34") || script.includes("N4: 34"), "could not verify N4 compatibility count 34");
}

function checkDerived(grammar, manifest, bank) {
  const expected = buildData(grammar, manifest);
  assert(serialize(expected) === read(PATHS.output), "dynamic build differs from committed JSON");
  assert(serialize(buildData(grammar, manifest)) === serialize(buildData(grammar, manifest)), "two pure builds differ");
  assert(bank.schemaVersion === VERSIONS.schema && bank.derivationVersion === VERSIONS.derivation && bank.manifestVersion === VERSIONS.manifest && bank.sourcePolicyVersion === VERSIONS.sourcePolicy, "derived metadata mismatch");
  assert(bank.inventory.seedCapacity === true && bank.inventory.productQuota === false && bank.inventory.total === 24, "inventory is not seed capacity");
  assert(bank.questions.length === 24 && bank.questions.filter(q => q.level === "N5").length === 12 && bank.questions.filter(q => q.level === "N4").length === 12, "derived level inventory mismatch");
  assert(new Set(bank.questions.map(q => q.id)).size === 24 && new Set(bank.questions.map(q => q.sourceQuestionId)).size === 24, "derived identity is not unique");
  const sources = new Map(grammar.map(x => [x.id, x]));
  bank.questions.forEach(q => {
    const source = sources.get(q.grammarId); assert(source && source.level === q.level, `${q.id} source/level fallback`);
    assert(q.id === stableId({ level: q.level, sourceId: source.id }), `${q.id} unstable ID`);
    assert(q.sourceQuestionId === `grammar.json#${source.id}` && q.questionType === "form-selection" && q.section === "grammar", `${q.id} routing mismatch`);
    assert(q.prompt === source.quiz.clozePrompt && q.promptKana === source.quiz.clozePromptKana && q.promptMeaning === source.quiz.clozeMeaning, `${q.id} prompt drift`);
    assert(JSON.stringify(q.options) === JSON.stringify(source.quiz.choices), `${q.id} options drift`);
    const index = q.options.indexOf(source.quiz.answer); assert(index >= 0 && q.options.filter(x => x === source.quiz.answer).length === 1 && q.answerIndex === index && q.answerDisplay === q.options[index], `${q.id} answer mismatch`);
    assert(q.optionReviews.length === 4 && q.optionReviews.filter(x => x.acceptedAsCorrect).length === 1, `${q.id} option review count mismatch`);
    q.optionReviews.forEach((review, i) => { assert(review.choiceIndex === i && review.value === q.options[i], `${q.id} option review alignment`); if (i !== index) assert(typeof review.incorrectReason === "string" && review.incorrectReason.trim().length > 15, `${q.id} vague/missing incorrect reason`); });
    assert(q.sourceDigest === digestSource(source) && q.reviewStatus === "approved-for-derived-bank" && q.reviewMethod === "site-internal-editorial" && q.uniqueAnswerReviewed === true, `${q.id} review metadata mismatch`);
  });
}

function negativeFixtures(grammar, manifest, bank) {
  reject("missing source", grammar, manifest, (_, m) => { m.records[0].sourceId = "missing"; m.records[0].sourceIds = ["missing"]; });
  reject("duplicate source ID", grammar, manifest, (g) => { g.push(clone(g[0])); });
  reject("level mismatch", grammar, manifest, (_, m) => { m.records[0].level = "N4"; });
  reject("sourceSnapshot drift", grammar, manifest, (_, m) => { m.records[0].sourceSnapshot.meaning += " drift"; });
  reject("sourceDigest wrong", grammar, manifest, (_, m) => { m.records[0].sourceDigest = "0".repeat(64); });
  reject("missing review version", grammar, manifest, (_, m) => { delete m.records[0].reviewVersion; });
  reject("unique answer false", grammar, manifest, (_, m) => { m.records[0].uniqueAnswerReviewed = false; });
  reject("three choices", grammar, manifest, (g, m) => { const s=g.find(x=>x.id===m.records[0].sourceId); s.quiz.choices.pop(); m.records[0].sourceSnapshot=clone(s); m.records[0].sourceDigest=digestSource(s); });
  reject("blank choice", grammar, manifest, (g,m) => { const s=g.find(x=>x.id===m.records[0].sourceId); s.quiz.choices[1]=" "; m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s); });
  reject("duplicate choices", grammar, manifest, (g,m) => { const s=g.find(x=>x.id===m.records[0].sourceId); s.quiz.choices[1]=s.quiz.choices[2];m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s); });
  reject("answer absent", grammar, manifest, (g,m) => { const s=g.find(x=>x.id===m.records[0].sourceId);s.quiz.answer="不存在";m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s); });
  reject("answer twice", grammar, manifest, (g,m) => { const s=g.find(x=>x.id===m.records[0].sourceId);s.quiz.choices[1]=s.quiz.answer;m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s); });
  const badBank = clone(bank); badBank.questions[0].answerIndex = (badBank.questions[0].answerIndex + 1) % 4; assert(serialize(badBank) !== serialize(buildData(grammar, manifest)), "answerIndex mismatch fixture accepted");
  reject("three optionReviews", grammar, manifest, (_,m)=>m.records[0].optionReviews.pop());
  reject("option review order", grammar, manifest, (_,m)=>{[m.records[0].optionReviews[0],m.records[0].optionReviews[1]]=[m.records[0].optionReviews[1],m.records[0].optionReviews[0]];});
  reject("two accepted", grammar, manifest, (_,m)=>{m.records[0].optionReviews.find(x=>!x.acceptedAsCorrect).acceptedAsCorrect=true;});
  reject("missing incorrect reason", grammar, manifest, (_,m)=>{m.records[0].optionReviews.find(x=>!x.acceptedAsCorrect).incorrectReason="";});
  reject("long generic incorrect reason", grammar, manifest, (_,m)=>{const review=m.records[0].optionReviews.find(x=>!x.acceptedAsCorrect);review.incorrectReason=`「${review.value}」不符合本句所要求的目標文法形式，會使句法連接、時態或題示語意不成立。`;});
  reject("prompt blank count", grammar, manifest, (g,m)=>{const s=g.find(x=>x.id===m.records[0].sourceId);s.quiz.clozePrompt=s.quiz.clozePrompt.replace("＿＿","");m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s);});
  reject("kana blank count", grammar, manifest, (g,m)=>{const s=g.find(x=>x.id===m.records[0].sourceId);s.quiz.clozePromptKana+="＿＿";m.records[0].sourceSnapshot=clone(s);m.records[0].sourceDigest=digestSource(s);});
  reject("missing alignment review", grammar, manifest, (_,m)=>{delete m.records[0].kanaAlignmentReview;});
  reject("unknown questionType", grammar, manifest, (_,m)=>{m.records[0].questionType="cloze";});
  reject("cross-level fallback", grammar, manifest, (_,m)=>{m.records[0].sourceIds=[m.records.find(x=>x.level!==m.records[0].level).sourceId];});
  reject("array-position identity", grammar, manifest, (_,m)=>{m.records[0].authoringId="record-0";});
}

function driftFixture() {
  const sourceBytes = read(PATHS.source), manifestBytes = read(PATHS.manifest), outputBytes = read(PATHS.output);
  try {
    const drifted = JSON.parse(sourceBytes), reviewedSourceId = JSON.parse(manifestBytes).records[0].sourceId;
    drifted.find(x => x.id === reviewedSourceId).meaning += " fixture-drift"; fs.writeFileSync(PATHS.source, `${JSON.stringify(drifted, null, 2)}\n`);
    const result = cp.spawnSync(process.execPath, [path.relative(ROOT, __filename).replace("check-", "build-"), "--check"], { cwd: ROOT, encoding: "utf8" });
    assert(result.status !== 0, "drift fixture did not make --check fail");
  } finally { fs.writeFileSync(PATHS.source, sourceBytes); fs.writeFileSync(PATHS.manifest, manifestBytes); fs.writeFileSync(PATHS.output, outputBytes); }
  assert(read(PATHS.source) === sourceBytes && read(PATHS.manifest) === manifestBytes && read(PATHS.output) === outputBytes, "drift fixture did not restore files");
}

function main() {
  const beforeSource = read(PATHS.source), beforeManifest = read(PATHS.manifest);
  const grammar = JSON.parse(beforeSource), manifest = JSON.parse(beforeManifest), bank = json(PATHS.output);
  assert(grammar.length === 290 && grammar.filter(x=>x.level==="N5").length === 80 && grammar.filter(x=>x.level==="N4").length === 210, "source inventory changed");
  const candidates=grammar.filter(x=>x.quiz); assert(candidates.length===130 && candidates.filter(x=>x.level==="N5").length===80 && candidates.filter(x=>x.level==="N4").length===50,"quiz candidate inventory changed");
  assert(manifest.records.length===24 && manifest.records.filter(x=>x.level==="N5").length===12 && manifest.records.filter(x=>x.level==="N4").length===12,"manifest inventory mismatch");
  assert(new Set(manifest.records.map(x=>x.sourceId)).size===24,"manifest source IDs are not unique");
  checkDerived(grammar, manifest, bank); negativeFixtures(grammar, manifest, bank); driftFixture();
  assert(read(PATHS.source)===beforeSource && read(PATHS.manifest)===beforeManifest,"builder/checker modified source or manifest");
  const check=cp.spawnSync(process.execPath,[path.relative(ROOT,PATHS.output).replace("japaneseJlptGrammarFormSelectionQuestions.json","scripts/build-japanese-jlpt-batch17c8b-grammar-form-selection-data.js"),"--check"],{cwd:ROOT,encoding:"utf8"}); assert(check.status===0,`builder --check failed: ${check.stderr}`);
  checkScopeAndProduction(); console.log("PASS: Batch 17C-8B inventory, 23 negative fixtures, determinism, drift rejection, scope, and production isolation verified.");
}
try { main(); } catch (error) { console.error(error.message); process.exitCode=1; }
