#!/usr/bin/env node
"use strict";

const fs=require("fs"), path=require("path"), cp=require("child_process");
const ROOT=path.resolve(__dirname,"..");
const {buildData,serialize,stableId,PATHS}=require("./build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const clone=value=>JSON.parse(JSON.stringify(value));
const assert=(condition,message)=>{if(!condition)throw new Error(`Batch 17C-7C check: ${message}`);};
const run=(command,options={})=>cp.execFileSync(command[0],command.slice(1),{cwd:ROOT,encoding:"utf8",stdio:options.stdio||"pipe"});

function expectFailure(name,vocabulary,paraphrase,usage,pattern){
  let error=null; try{buildData(vocabulary,paraphrase,usage);}catch(caught){error=caught;}
  assert(error,`${name} fixture was accepted`); if(pattern)assert(pattern.test(error.message),`${name} failed for the wrong reason: ${error.message}`);
}
function main(){
  const vocabulary=read(PATHS.source), paraphrase=read(PATHS.paraphrase), usage=read(PATHS.usage), committed=fs.readFileSync(PATHS.output,"utf8");
  const bytes1=serialize(buildData(vocabulary,paraphrase,usage)), bytes2=serialize(buildData(clone(vocabulary),clone(paraphrase),clone(usage)));
  assert(bytes1===bytes2,"two builds differ"); assert(bytes1===committed,"committed derived bank is stale");
  const fixture=(name,edit,pattern)=>{const v=clone(vocabulary),p=clone(paraphrase),u=clone(usage);edit(v,p,u);expectFailure(name,v,p,u,pattern);};
  fixture("missing source",(_v,p)=>p.records[0].sourceId=999999,/missing source/i);
  fixture("source snapshot drift",(_v,p)=>p.records[0].sourceSnapshot.word+="x",/snapshot/i);
  fixture("level mismatch",(_v,p)=>p.records[0].level="N4",/level mismatch/i);
  fixture("N5 usage",(_v,_p,u)=>u.records[0].level="N5",/N5 usage/i);
  fixture("unsupported questionType",(_v,p)=>p.records[0].questionType="synonym",/unsupported questionType/i);
  fixture("unapproved review metadata",(_v,p)=>p.records[0].reviewStatus="draft",/unapproved review metadata/i);
  fixture("missing interchangeabilityScope",(_v,p)=>delete p.records[0].interchangeabilityScope,/interchangeabilityScope/i);
  fixture("missing semanticReviewId",(_v,p)=>delete p.records[0].semanticReviewId,/semanticReviewId/i);
  fixture("missing usageReviewId",(_v,_p,u)=>delete u.records[0].usageReviewId,/usageReviewId/i);
  fixture("duplicate review ID",(_v,p)=>p.records[1].semanticReviewId=p.records[0].semanticReviewId,/duplicate review ID/i);
  fixture("duplicate options",(_v,p)=>p.records[0].options[1].expression=p.records[0].options[0].expression,/duplicate options/i);
  fixture("duplicate sentences",(_v,_p,u)=>u.records[0].usageSentences[1].sentence=u.records[0].usageSentences[0].sentence,/duplicate sentences/i);
  fixture("two accepted paraphrase answers",(_v,p)=>p.records[0].options[0].acceptedAsCorrect=true,/exactly one accepted/i);
  fixture("correctUsageIndex out of bounds",(_v,_p,u)=>u.records[0].correctUsageIndex=4,/out of bounds/i);
  fixture("missing incorrect reason",(_v,_p,u)=>delete u.records[0].incorrectUsageReasons[0].reason,/reason/i);
  fixture("sentenceKana missing",(_v,_p,u)=>u.records[0].usageSentences[0].sentenceKana="",/sentenceKana/i);
  fixture("target occurrence index wrong",(_v,_p,u)=>u.records[0].usageSentences[0].targetOccurrence.start++,/occurrence index/i);
  fixture("cross-level fallback",(_v,p)=>p.records[0].sourceIds.push(1001),/cross-level fallback/i);
  fixture("cross-type fallback",(_v,p,_u)=>p.records[12].questionType="usage",/targetWord|usage target mismatch/i);
  const identity=paraphrase.records[0]; assert(stableId(identity)===stableId({...identity,irrelevantArrayPosition:999}),"ID depends on array-position data");
  assert(!/\bMath\.random\b/.test(fs.readFileSync(path.join(ROOT,"scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js"),"utf8")),"builder uses Math.random");

  const protectedFiles=[PATHS.source,PATHS.paraphrase,PATHS.usage]; const before=protectedFiles.map(file=>fs.readFileSync(file)); run([process.execPath,"scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","--check"]);
  protectedFiles.forEach((file,index)=>assert(fs.readFileSync(file).equals(before[index]),`${path.basename(file)} was modified by build/check`));

  const driftOriginal=fs.readFileSync(PATHS.output); try{
    fs.writeFileSync(PATHS.output,Buffer.concat([driftOriginal,Buffer.from(" \n")]));
    let detected=false; try{run([process.execPath,"scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","--check"]);}catch(error){detected=/committed output drift/i.test(`${error.stderr||""}${error.stdout||""}${error.message}`);}
    assert(detected,"--check did not detect actual committed output drift");
  } finally {fs.writeFileSync(PATHS.output,driftOriginal);}

  const loadedText=["script.js","index.html","japanese/index.html"].map(file=>fs.readFileSync(path.join(ROOT,file),"utf8")).join("\n");
  assert(!loadedText.includes("japaneseJlptVocabularySemanticQuestions.json"),"derived bank is loaded by production runtime/HTML");
  const runtime=fs.readFileSync(path.join(ROOT,"script.js"),"utf8");
  assert(runtime.includes('"17c6-compat-v1": {')&&runtime.includes('N5: { total: 20')&&runtime.includes('N4: { total: 34'),"17c6 compatibility totals changed");
  assert((runtime.match(/vocabulary: \{ included: true, status: "available", total: 10, questionTypes: \{ meaning: 10 \} \}/g)||[]).length===2,"compatibility vocabulary is no longer meaning-only");
  const forbiddenStorage=/\b(localStorage|sessionStorage|indexedDB)\b/g; const base=run(["git","show","main:script.js"]); assert((runtime.match(forbiddenStorage)||[]).length===(base.match(forbiddenStorage)||[]).length,"storage API inventory changed");
  const allowed=new Set(["japaneseJlptVocabularyParaphraseReviewManifest.json","japaneseJlptVocabularyUsageReviewManifest.json","japaneseJlptVocabularySemanticQuestions.json","scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","scripts/check-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","docs/japanese-jlpt-batch17c7c-vocabulary-semantic-data.md"]);
  const changed=run(["git","diff","--name-only","main...HEAD"]).trim().split("\n").filter(Boolean); const working=run(["git","status","--porcelain"]).trim().split("\n").filter(Boolean).map(line=>line.slice(3));
  [...new Set([...changed,...working])].forEach(file=>assert(allowed.has(file),`scope guard rejects ${file}`));
  console.log("PASS: Batch 17C-7C dynamic data, 20 negative fixtures, deterministic bytes, drift restoration, isolation, compatibility, storage and merge-base/main scope guards.");
}
if(require.main===module){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
