#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
function fail(msg) { console.error(`FAIL: ${msg}`); process.exitCode = 1; }
function ok(msg) { console.log(`OK: ${msg}`); }
function sh(cmd) { return cp.execSync(cmd, { encoding: 'utf8' }); }
const auditScript = fs.readFileSync('scripts/audit-japanese-cross-module-vocabulary.js', 'utf8');
const plan = fs.readFileSync('docs/japanese-vocabulary-batch13b-audit-rule-plan.md', 'utf8');
const manual = ['お客', '曜日', '位置', '手段', '状態', '存在', '通過', '目的地'];
const reclassify = ['おう', 'べつ', '祈願', '起點', '逆接', '所屬', '但是', '範圍', '並列', '命令', '傳聞', '對象', '對比', '數量'];
const alias = ['パン＿＿', 'クラス＿＿', 'けしゴム'];
const grammar = ['何時', 'ごろ', 'のに', '何月何日', 'ずに', 'た形', 'やら', 'いた', 'えて', 'える', 'おく', 'きゃ', 'くて', 'けど', 'ける', 'こう', 'ずつ', 'って', 'てき', 'てみ', 'でも', 'など', 'のが', 'のは', 'はず', 'まま', 'める', 'やる', '何月', '何枚'];
const safe = [...alias, ...grammar];
for (const word of [...safe, ...manual, ...reclassify]) {
  if (!plan.includes(`- ${word}`) && !plan.includes(`| ${word} |`)) fail(`plan does not mention ${word}`);
}
if (new Set(safe).size !== 33) fail('safe list has duplicates or wrong size'); else ok('safe-auto-resolve list total is 33');
if (alias.length !== 3) fail('alias list count is not 3'); else ok('orthographic-alias-match list total is 3');
if (grammar.length !== 30) fail('grammar list count is not 30'); else ok('grammar-element-source-bound list total is 30');
for (const word of manual) if (safe.includes(word)) fail(`manual-only item included in safe list: ${word}`);
for (const word of reclassify) if (safe.includes(word)) fail(`reclassify-needed item included in safe list: ${word}`);
if (/new Set\([^)]*(safe|grammar|alias)/.test(auditScript)) fail('possible generated global blacklist found'); else ok('no generated global blacklist pattern');
if (/grammar\.some|grammar\.find\([^)]*surface/.test(auditScript)) fail('possible grammar.json-wide exclusion found'); else ok('no grammar.json-wide exclusion pattern');
for (const word of safe) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`surface: '${escaped}'`).test(auditScript)) fail(`missing implemented rule for ${word}`);
}
for (const word of manual) if (new RegExp(`surface: '${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`).test(auditScript)) fail(`manual-only implemented: ${word}`);
for (const word of reclassify) if (new RegExp(`surface: '${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`).test(auditScript)) fail(`reclassify-needed implemented: ${word}`);
const output = sh('node scripts/audit-japanese-cross-module-vocabulary.js');
if (!/missing=84\b/.test(output)) fail(`audit missing count is not 84: ${output}`); else ok('missing-candidate is 84');
if (!/unsegmented=0\b/.test(output)) fail(`audit unsegmented is not 0: ${output}`); else ok('unsegmented span is 0');
const report = fs.readFileSync('docs/japanese-cross-module-vocabulary-audit.md', 'utf8');
if (!report.includes('orthographic-alias-match 去重數：3')) fail('report alias count is not 3'); else ok('positive alias rules hit');
if (!report.includes('grammar-element-source-bound 去重數：30')) fail('report grammar count is not 30'); else ok('positive grammar rules hit');
for (const word of safe) if (report.includes(`| ${word} | 待人工確認 |`)) fail(`safe item still appears as missing-candidate: ${word}`);
for (const word of ['お客', '曜日', '位置', '祈願', '起點']) if (!report.includes(`| ${word} |`)) fail(`negative/manual item unexpectedly disappeared: ${word}`);
for (const file of ['vocabulary.json', 'grammar.json', 'japaneseReadingQuestions.js', 'script.js']) {
  try { sh(`git diff --quiet -- ${file}`); ok(`${file} unchanged`); } catch { fail(`${file} has modifications`); }
}
const vocab = JSON.parse(fs.readFileSync('vocabulary.json', 'utf8'));
const n5 = vocab.filter((v) => v.level === 'N5').length;
const n4 = vocab.filter((v) => v.level === 'N4').length;
if (vocab.length !== 3241 || n5 !== 1021 || n4 !== 2220) fail(`vocabulary baseline changed: ${vocab.length}/${n5}/${n4}`); else ok('vocabulary baseline unchanged');
if (process.exitCode) process.exit(process.exitCode);
