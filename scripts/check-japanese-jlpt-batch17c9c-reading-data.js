#!/usr/bin/env node
"use strict";

const assert = require("assert");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const builder = require("./build-japanese-jlpt-batch17c9c-reading-data.js");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = "fec97bb7c301da796479b0c0efa6741c1b4f7f86";
const ALLOWED = new Set(["japaneseJlptReadingN5Questions.json","scripts/build-japanese-jlpt-batch17c9c-reading-data.js","scripts/check-japanese-jlpt-batch17c9c-reading-data.js","docs/japanese-jlpt-batch17c9c-reading-data.md"]);
const clone = (value) => structuredClone(value);
const read = (file) => fs.readFileSync(file);
const parse = (file) => JSON.parse(read(file));
const exec = (command, args, options={}) => cp.execFileSync(command, args, {cwd:ROOT,encoding:"utf8",...options});

function verifyOrder(source, derived) {
  for (const set of derived.readingSets) {
    const original = source.sets.find((item) => item.id === set.sourceSetId);
    assert(original, "derived set has no source");
    assert.deepStrictEqual(set.questions.map((q) => q.sourceQuestionId), original.questions.map((q) => q.sourceQuestionId), "question order changed");
    set.questions.forEach((question,index) => {
      const sourceQuestion = original.questions[index];
      assert.deepStrictEqual(question.options,sourceQuestion.options,"option order changed");
      assert.deepStrictEqual(question.passageEvidence,sourceQuestion.passageEvidence,"passage evidence order changed");
      assert.deepStrictEqual(question.informationEvidence,sourceQuestion.informationEvidence,"information evidence order changed");
    });
    assert.deepStrictEqual(set.material,original.material,"material rows/cells changed");
  }
}
function negativeFixtures(source, manifest, n4, valid) {
  const fixtures=[];
  const input=(name,mutate)=>fixtures.push({name,kind:"input",mutate});
  const output=(name,mutate)=>fixtures.push({name,kind:"output",mutate});
  input("source version",s=>s.sourceVersion="bad"); input("manifest version",(s,m)=>m.manifestVersion="bad");
  input("missing source set",s=>s.sets.pop()); input("extra source set",s=>s.sets.push(clone(s.sets[0])));
  input("missing manifest record",(s,m)=>m.records.pop()); input("extra manifest record",(s,m)=>m.records.push(clone(m.records[0])));
  input("duplicate set ID",s=>s.sets[1].id=s.sets[0].id); input("duplicate question ID",s=>s.sets[1].questions[0].id=s.sets[0].questions[0].id);
  input("duplicate sourceQuestion ID",s=>s.sets[1].questions[0].sourceQuestionId=s.sets[0].questions[0].sourceQuestionId);
  input("unknown section",s=>s.sets[0].section="unknown"); input("N4 level",s=>s.sets[0].level="N4"); input("section distribution",s=>s.sets[0].section="medium-passage");
  input("source snapshot drift",(s,m)=>m.records[0].sourceSnapshot.title="drift"); input("source digest drift",s=>s.sets[0].sourceDigest="0".repeat(64));
  input("review status",s=>s.sets[0].reviewStatus="draft"); input("review version",s=>s.sets[0].reviewVersion="bad"); input("review method",s=>s.sets[0].reviewMethod="automated");
  input("manifest question IDs",(s,m)=>m.records.find(x=>x.questionIds.length>1).questionIds.reverse()); input("array-position identity",s=>s.sets[0].id="jlpt-reading-17c9b-n5-set-0");
  input("passage too short",s=>s.sets[0].passage="みじかい"); input("passage too long",s=>s.sets[0].passage="あ".repeat(81)); input("passageKana missing",s=>s.sets[0].passageKana="");
  input("ruby reading has Han",s=>s.sets[0].rubyTerms=[{text:"日",reading:"日本"}]); input("three options",s=>s.sets[0].questions[0].options.pop());
  input("blank option",s=>s.sets[0].questions[0].options[0]=" "); input("duplicate option",s=>s.sets[0].questions[0].options[0]=s.sets[0].questions[0].options[1]);
  input("answerIndex bounds",s=>s.sets[0].questions[0].answerIndex=4); input("answerDisplay mismatch",s=>s.sets[0].questions[0].answerDisplay="drift");
  input("unique answer false",s=>s.sets[0].questions[0].uniqueAnswerReviewed=false); input("option reviews count",s=>s.sets[0].questions[0].optionReviews.pop());
  input("option reviews order",s=>s.sets[0].questions[0].optionReviews[0].optionIndex=3); input("supported count",s=>s.sets[0].questions[0].optionReviews[0].verdict="supported");
  input("blank distractor reason",s=>s.sets[0].questions[0].optionReviews[0].reason=""); input("duplicate distractor reason",s=>s.sets[0].questions[0].optionReviews[0].reason=s.sets[0].questions[0].optionReviews[2].reason);
  input("generic distractor reason",s=>s.sets[0].questions[0].optionReviews[0].reason="不正確"); input("passage evidence missing",s=>s.sets[0].questions[0].passageEvidence=[]);
  input("passage evidence out of bounds",s=>s.sets[0].questions[0].passageEvidence[0].endCodePoint=999); input("passage evidence text mismatch",s=>s.sets[0].questions[0].passageEvidence[0].text="drift");
  input("information material missing",s=>delete s.sets.find(x=>x.section==="information-search").material);
  input("plain projection missing",s=>s.sets.find(x=>x.section==="information-search").material.plainTextProjection="");
  input("information scope",s=>s.sets.find(x=>x.section==="information-search").questions[0].informationEvidenceScope="unknown");
  input("cross-row cell",s=>{const x=s.sets.find(x=>x.section==="information-search");x.questions[0].informationEvidence[0].cellIds[0]=x.material.rows[1].cells[0].id});
  input("comparison row missing",s=>{const x=s.sets.find(x=>x.section==="information-search"&&x.questions.some(q=>q.informationEvidenceScope==="all-material-rows"));x.questions.find(q=>q.informationEvidenceScope==="all-material-rows").informationEvidence.pop()});
  input("duplicate evidence row",s=>{const x=s.sets.find(x=>x.section==="information-search");x.questions[0].informationEvidence.push(clone(x.questions[0].informationEvidence[0]))});
  input("HTML",s=>s.sets[0].passage+="<script>"); input("event handler",s=>s.sets[0].provenance='<img onerror="x">'); input("javascript URL",s=>s.sets[0].questions[0].explanation="javascript:alert(1)");
  input("N4 set identity",s=>s.sets[0].id=n4.readingSets[0].id); input("N4 content reuse",s=>s.sets[0].passage=n4.readingSets[0].displayPassage);
  input("product quota",(s,m)=>{s.productQuota=true;m.productQuota=true});
  output("derived ID tamper",d=>d.readingSets[0].id="drift"); output("derived answer tamper",d=>d.readingSets[0].questions[0].answerIndex=0);
  output("derived text tamper",d=>d.readingSets[0].displayPassage="drift"); output("derived evidence tamper",d=>d.readingSets[0].questions[0].passageEvidence[0].text="drift");
  output("derived inventory tamper",d=>d.inventory.productQuota=true); output("selection profile",d=>d.selectionProfile={});
  let rejected=0;
  for(const fixture of fixtures){try{if(fixture.kind==="input"){const s=clone(source),m=clone(manifest);fixture.mutate(s,m);builder.buildData(s,m,n4)}else{const d=clone(valid);fixture.mutate(d);builder.validateDerived(d,source)}}catch{rejected++;continue}throw new Error(`negative fixture accepted: ${fixture.name}`)}
  assert(fixtures.length>=40); return {rejected,total:fixtures.length};
}
function scopeAndProduction() {
  exec("git",["merge-base","--is-ancestor",BASELINE,"HEAD"]);
  const changed=exec("git",["diff","--name-only",BASELINE,"--"]).trim().split("\n").filter(Boolean);
  const untracked=exec("git",["ls-files","--others","--exclude-standard"]).trim().split("\n").filter(Boolean);
  [...changed,...untracked].forEach((file)=>assert(ALLOWED.has(file),`scope guard rejected ${file}`));
  const script=read(path.join(ROOT,"script.js")).toString();
  assert(!script.includes("japaneseJlptReadingN5Questions.json"),"production loads N5 derived bank");
  for(const file of exec("git",["ls-files","*.html","*.css"]).trim().split("\n").filter(Boolean)) assert(!read(path.join(ROOT,file)).toString().includes("japaneseJlptReadingN5Questions.json"),`${file} loads N5 bank`);
  assert(script.includes('total: 20')&&script.includes('total: 34')&&script.includes('status: "unavailable"'),"production totals/availability drift");
}
function driftFixture(before) {
  try {fs.appendFileSync(builder.OUTPUT_PATH," \n"); const result=cp.spawnSync(process.execPath,[path.relative(ROOT,path.join(__dirname,"build-japanese-jlpt-batch17c9c-reading-data.js")),"--check"],{cwd:ROOT,encoding:"utf8"}); assert.notStrictEqual(result.status,0,"builder --check accepted drift");}
  finally {fs.writeFileSync(builder.OUTPUT_PATH,before[2]);}
  [builder.SOURCE_PATH,builder.MANIFEST_PATH,builder.OUTPUT_PATH].forEach((file,index)=>assert(read(file).equals(before[index]),`${path.basename(file)} not restored byte-for-byte`));
}
function main(){
  const files=[builder.SOURCE_PATH,builder.MANIFEST_PATH,builder.OUTPUT_PATH],before=files.map(read);
  const source=parse(builder.SOURCE_PATH),manifest=parse(builder.MANIFEST_PATH),n4=parse(builder.N4_PATH),committed=parse(builder.OUTPUT_PATH);
  const first=builder.serialize(builder.buildData(source,manifest,n4)),second=builder.serialize(builder.buildData(source,manifest,n4));
  assert.strictEqual(first,second,"two pure builds differ"); assert.strictEqual(first,before[2].toString(),"committed bytes drift");
  const shuffledSource=clone(source),shuffledManifest=clone(manifest); shuffledSource.sets.reverse(); shuffledManifest.records.reverse();
  assert.strictEqual(builder.serialize(builder.buildData(shuffledSource,shuffledManifest,n4)),first,"top-level source/manifest order affects output");
  builder.validateDerived(committed,source); verifyOrder(source,committed);
  const checkBefore=files.map(read); exec(process.execPath,["scripts/build-japanese-jlpt-batch17c9c-reading-data.js","--check"]); files.forEach((file,index)=>assert(read(file).equals(checkBefore[index]),"builder --check wrote a file"));
  const fixtures=negativeFixtures(source,manifest,n4,committed); driftFixture(before); scopeAndProduction();
  files.forEach((file,index)=>assert(read(file).equals(before[index]),`${path.basename(file)} changed during checker`));
  console.log("PASS Batch 17C-9C deterministic N5 derived bank: 8 sets / 12 questions");
  console.log(`Rejected negative fixtures: ${fixtures.rejected}/${fixtures.total}`);
  console.log("Drift, byte preservation, baseline scope, and production isolation: PASS");
}
try{main()}catch(error){console.error(`FAIL ${error.stack||error.message}`);process.exitCode=1}
