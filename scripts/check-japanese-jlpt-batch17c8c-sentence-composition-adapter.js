#!/usr/bin/env node
"use strict";

const fs = require("fs");
const vm = require("vm");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const BASE = "049cf214548e7d00fc488d30221c7b626c026cf4";
const SOURCE_PATH = "japaneseSentenceCompositionQuestions.json";
const EVIDENCE_PATH = "docs/japanese-sentence-composition-batch16d3-final-permutations.json";
const ALLOWED = new Set(["script.js", "japanese/index.html", __filename.replace(`${process.cwd()}/`, ""),
  "docs/japanese-jlpt-batch17c8c-sentence-composition-adapter.md"]);
const read = (path) => fs.readFileSync(path, "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const assert = (value, message) => { if (!value) throw new Error(`Batch 17C-8C check: ${message}`); };
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const script = read("script.js");
const html = read("japanese/index.html");
const sourceBytes = read(SOURCE_PATH);
const evidenceBytes = read(EVIDENCE_PATH);
const source = JSON.parse(sourceBytes);
const evidence = JSON.parse(evidenceBytes);
const start = script.indexOf("function deepFreezeJapaneseJlptValue");
const end = script.indexOf("function appendJapaneseJlptDetail");
const context = { console };
vm.createContext(context);
vm.runInContext(`function isNonEmptyString(value){return typeof value === "string" && value.trim().length > 0;}\n${script.slice(start, end)}\nthis.api={adaptJapaneseJlptSentenceCompositionQuestion,createJapaneseJlptSentenceCompositionCandidates,normalizeJapaneseJlptCandidate,getJapaneseJlptCanonicalIdentity,JAPANESE_JLPT_PROFILE_REGISTRY};`, context);
const api = context.api;

function validateEvidence(bank, records) {
  assert(Array.isArray(bank) && bank.length === 60, "source bank 必須恰好 60 題");
  const sourceIds = bank.map((question) => question && question.id);
  assert(sourceIds.every((id) => typeof id === "string" && id.trim()), "source ID 必須非空");
  assert(new Set(sourceIds).size === 60, "source ID 必須唯一");
  assert(Array.isArray(records) && records.length === 60, "evidence 必須恰好 60 題");
  const evidenceIds = records.map((record) => record && record.id);
  assert(evidenceIds.every((id) => typeof id === "string" && id.trim()), "evidence ID 必須非空");
  assert(new Set(evidenceIds).size === 60, "evidence ID 必須唯一");
  assert([...new Set(evidenceIds)].sort().join("\0") === [...new Set(sourceIds)].sort().join("\0"),
    "evidence ID 集合必須與 source ID 集合完全相同");
  const byId = new Map(bank.map((question) => [question.id, question]));
  let permutationCount = 0;
  for (const record of records) {
    const question = byId.get(record.id);
    assert(question, `evidence ${record.id} 沒有 source`);
    for (const key of ["id", "level", "before", "after", "completeSentence", "starSlot"])
      assert(JSON.stringify(record[key]) === JSON.stringify(question[key]), `${record.id} metadata ${key} 不一致`);
    for (const key of ["chunks", "correctOrder", "grammarIds"])
      assert(JSON.stringify(record[key]) === JSON.stringify(question[key]), `${record.id} metadata ${key} 不一致`);
    const correctChunkId = question.correctOrder[question.starSlot];
    const expectedPosition = question.chunks.findIndex((chunk) => chunk.id === correctChunkId) + 1;
    assert(Number.isInteger(record.correctOptionPosition) && record.correctOptionPosition >= 1 &&
      record.correctOptionPosition <= 4 && record.correctOptionPosition === expectedPosition,
    `${record.id} correctOptionPosition 未與 correctOrder/starSlot/chunks 對齊`);
    assert(Array.isArray(record.permutations) && record.permutations.length === 24, `${record.id} 必須有 24 permutations`);
    const chunkIds = question.chunks.map((chunk) => chunk.id).sort().join("\0");
    const keys = new Set(); let expected = 0; let alternate = 0;
    for (const permutation of record.permutations) {
      assert(Array.isArray(permutation.order) && permutation.order.length === 4 &&
        [...permutation.order].sort().join("\0") === chunkIds, `${record.id} order 不是完整 permutation`);
      const key = permutation.order.join("\0"); assert(!keys.has(key), `${record.id} permutation 重複`); keys.add(key);
      assert(["VALID_EXPECTED", "VALID_ALTERNATE", "INVALID_GRAMMAR"].includes(permutation.verdict), `${record.id} verdict 不允許`);
      assert(typeof permutation.reason === "string" && permutation.reason.trim(), `${record.id} reason 空白`);
      const chunks = new Map(question.chunks.map((chunk) => [chunk.id, chunk.text]));
      assert(permutation.sentence === question.before + permutation.order.map((id) => chunks.get(id)).join("") + question.after,
        `${record.id} permutation sentence 無法重建`);
      if (permutation.verdict === "VALID_EXPECTED") { expected += 1; assert(JSON.stringify(permutation.order) === JSON.stringify(question.correctOrder), `${record.id} VALID_EXPECTED order 錯誤`); }
      if (permutation.verdict === "VALID_ALTERNATE") alternate += 1;
    }
    assert(keys.size === 24 && expected === 1 && alternate === 0, `${record.id} unique-answer evidence 無效`);
    assert(question.uniqueAnswerReviewed === true, `${record.id} 未完成 unique answer review`);
    permutationCount += record.permutations.length;
  }
  assert(permutationCount === 1440, "permutation 合計必須為 1440");
  return permutationCount;
}

let rejected = 0;
function rejectSource(name, mutate) {
  const fixture = clone(source); mutate(fixture);
  let failed = false; try { api.createJapaneseJlptSentenceCompositionCandidates(fixture); } catch (_) { failed = true; }
  assert(failed, `negative fixture accepted: ${name}`); rejected += 1;
}
function rejectEvidence(name, mutate) {
  const fixture = clone(evidence); mutate(fixture);
  let failed = false; try { validateEvidence(source, fixture); } catch (_) { failed = true; }
  assert(failed, `negative fixture accepted: ${name}`); rejected += 1;
}

const sourceBefore = JSON.stringify(source);
assert(!Object.isFrozen(source) && source.every((q) => !Object.isFrozen(q) && !Object.isFrozen(q.chunks)), "adapter 前 source 不應 frozen");
const candidates = Array.from(api.createJapaneseJlptSentenceCompositionCandidates(source));
assert(candidates.length === 60 && candidates.filter((q) => q.level === "N5").length === 30 && candidates.filter((q) => q.level === "N4").length === 30, "candidate inventory 不符");
assert(JSON.stringify(source) === sourceBefore && !Object.isFrozen(source) && !Object.isFrozen(source[0].chunks), "建立 candidate 修改或 freeze source");
assert(candidates.every((q) => api.normalizeJapaneseJlptCandidate(q) === q), "candidate 無法 normalize");
assert(new Set(candidates.map(api.getJapaneseJlptCanonicalIdentity)).size === 60, "canonical identities 不唯一");
assert(candidates.every((q) => q.options.length === 4 && q.optionChunkIds.length === 4 && q.chunks.length === 4 &&
  q.options.every((text, i) => text === q.chunks[i].text && q.optionChunkIds[i] === q.chunks[i].id) &&
  q.answerDisplay === q.options[q.answerIndex] && q.correctChunkId === q.correctOrder[q.starSlot]), "candidate chunk/answer alignment 無效");
const deterministic = JSON.stringify(candidates);
const mutatedCandidate = candidates[0];
mutatedCandidate.chunks[0].text = "fixture"; mutatedCandidate.options[0] = "fixture";
mutatedCandidate.optionChunkIds[0] = "fixture"; mutatedCandidate.grammarIds.push("fixture");
mutatedCandidate.slots[0] = "fixture"; mutatedCandidate.rubyTerms.push({ nested: { fixture: true } });
assert(JSON.stringify(source) === sourceBefore, "candidate nested mutation 影響 source");
const sourceMutationFixture = clone(source); const stableCandidates = Array.from(api.createJapaneseJlptSentenceCompositionCandidates(sourceMutationFixture));
const stableBefore = JSON.stringify(stableCandidates); sourceMutationFixture[0].chunks[0].text = "source fixture"; sourceMutationFixture[0].grammarIds.push("source fixture");
assert(JSON.stringify(stableCandidates) === stableBefore, "source mutation 影響既有 candidates");
assert(JSON.stringify(Array.from(api.createJapaneseJlptSentenceCompositionCandidates(source))) === deterministic, "重建 candidates 不 deterministic");

rejectSource("missing required field", (b) => { delete b[0].meaning; });
rejectSource("uniqueAnswerReviewed=false", (b) => { b[0].uniqueAnswerReviewed = false; });
rejectSource("duplicate source id", (b) => { b[1].id = b[0].id; });
rejectSource("invalid level", (b) => { b[0].level = "N3"; });
rejectSource("three chunks", (b) => { b[0].chunks.pop(); });
rejectSource("blank chunk", (b) => { b[0].chunks[0].text = " "; });
rejectSource("duplicate chunk id", (b) => { b[0].chunks[1].id = b[0].chunks[0].id; });
rejectSource("duplicate chunk text", (b) => { b[0].chunks[1].text = b[0].chunks[0].text; });
rejectSource("correctOrder missing chunk", (b) => { b[0].correctOrder.pop(); });
rejectSource("correctOrder unknown chunk", (b) => { b[0].correctOrder[0] = "unknown"; });
rejectSource("starSlot out of range", (b) => { b[0].starSlot = 4; });
rejectSource("star slot mismatch", (b) => { b[0].slots = ["", "★", "", ""]; });
rejectSource("completeSentence reconstruction", (b) => { b[0].completeSentence += "錯"; });
rejectSource("answer not uniquely resolvable", (b) => { b[0].correctOrder[1] = b[0].correctOrder[0]; });
rejectEvidence("missing permutation", (b) => { b[0].permutations.pop(); });
rejectEvidence("duplicate permutation", (b) => { b[0].permutations[1] = clone(b[0].permutations[0]); });
rejectEvidence("wrong VALID_EXPECTED", (b) => { const p=b[0].permutations.find((x)=>x.verdict==="VALID_EXPECTED"); [p.order[0],p.order[1]]=[p.order[1],p.order[0]]; });
rejectEvidence("VALID_ALTERNATE", (b) => { b[0].permutations[0].verdict = "VALID_ALTERNATE"; });
rejectEvidence("duplicate evidence ID (and missing source evidence)", (b) => { b[1] = clone(b[0]); });
rejectEvidence("missing source evidence", (b) => { b[0].id = b[1].id; });
rejectEvidence("unknown evidence ID", (b) => { b[0].id = "unknown-evidence-id"; });
rejectEvidence("incorrect correctOptionPosition", (b) => { b[0].correctOptionPosition = b[0].correctOptionPosition % 4 + 1; });
rejectSource("unknown questionType / cross-level fallback", (b) => { b[0].questionType = "cloze"; });
assert(rejected === 23, "必須執行 23 個真正遭 adapter 或 evidence validator 拒絕的 negative fixtures");
validateEvidence(source, clone(evidence).reverse());
const permutations = validateEvidence(source, evidence);

assert(git("merge-base", "--is-ancestor", BASE, "HEAD") === "", "HEAD 未包含指定 merge commit");
const changed = new Set([...git("diff", "--name-only", BASE).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
for (const file of changed) assert(ALLOWED.has(file), `scope guard rejects ${file}`);
assert(changed.size === ALLOWED.size && [...ALLOWED].every((file) => changed.has(file)), "changed file 集合必須精確等於允許的四個檔案");
for (const file of [SOURCE_PATH, EVIDENCE_PATH])
  assert(git("hash-object", file) === git("rev-parse", `${BASE}:${file}`), `${file} 相對 baseline bytes 改變`);
const baseHtml = execFileSync("git", ["show", `${BASE}:japanese/index.html`], { encoding: "utf8" });
const oldCacheReference = '../script.js?v=3.9';
assert(baseHtml.split(oldCacheReference).length === 2 &&
  html === baseHtml.replace(oldCacheReference, '../script.js?v=4.0'), "japanese/index.html 只能更新 script.js cache token 3.9 → 4.0");
const profile = api.JAPANESE_JLPT_PROFILE_REGISTRY.profiles["17c6-compat-v1"];
assert(profile.levels.N5.total === 20 && profile.levels.N4.total === 34 && !JSON.stringify(profile).includes("sentence-composition"), "production profile 被啟用或 quota 改變");
const buildBlock = script.slice(script.indexOf("function buildJapaneseJlptSession"), script.indexOf("function appendJapaneseJlptDetail"));
assert(!buildBlock.includes("createJapaneseJlptSentenceCompositionCandidates"), "buildJapaneseJlptSession 呼叫新 adapter");
assert(!html.includes("final-permutations") && !script.match(/(?:fetch|import)\s*\([^)]*final-permutations/), "JLPT 入口載入 evidence");
assert(script.includes("let sentenceCompositionQuestions = []") && script.includes("sentenceCompositionQuestions = await response.json()"), "一般句子重組 state 路徑改變");
const baseScript = git("show", `${BASE}:script.js`);
const inventory = (scriptText, htmlText) => ({
  fetch: (scriptText.match(/\bfetch\s*\(/g) || []).length,
  dynamicImport: (scriptText.match(/\bimport\s*\(/g) || []).length,
  scriptTag: (htmlText.match(/<script\b/gi) || []).length,
  localStorage: (scriptText.match(/\blocalStorage\b/g) || []).length,
  sessionStorage: (scriptText.match(/\bsessionStorage\b/g) || []).length,
  indexedDB: (scriptText.match(/\bindexedDB\b/g) || []).length,
  cacheApi: (scriptText.match(/\bcaches\b/g) || []).length,
});
const baselineInventory = inventory(baseScript, baseHtml), currentInventory = inventory(script, html);
for (const key of Object.keys(baselineInventory))
  assert(currentInventory[key] <= baselineInventory[key], `${key} inventory 不得相對 baseline 增加`);
assert(read(SOURCE_PATH) === sourceBytes && read(EVIDENCE_PATH) === evidenceBytes, "checker 修改正式檔案");
console.log(`PASS: 60 candidates (N5 30 / N4 30), ${permutations} permutations, ${rejected} negative fixtures, mutation and production isolation verified.`);
