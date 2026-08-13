#!/usr/bin/env node
"use strict";

const fs=require("fs"), path=require("path"), cp=require("child_process");
const ROOT=path.resolve(__dirname,"..");
const {buildData,serialize,stableId,PATHS}=require("./build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const clone=value=>JSON.parse(JSON.stringify(value));
const assert=(condition,message)=>{if(!condition)throw new Error(`Batch 17C-7C check: ${message}`);};
const run=(command,options={})=>cp.execFileSync(command[0],command.slice(1),{cwd:ROOT,encoding:"utf8",stdio:options.stdio||"pipe"});
const FALLBACK_BASE="093b35ff1dbda2f85316d312224ab7a9a2a159f6";
function resolveBaseRef(){
  const configured=process.env.JLPT_SCOPE_BASE_REF||process.env.BASE_REF||process.env.GITHUB_BASE_REF;
  const candidates=[configured,configured&&!configured.includes("/")?`origin/${configured}`:null,"origin/main","main",FALLBACK_BASE].filter(Boolean);
  for(const candidate of candidates){try{run(["git","rev-parse","--verify",`${candidate}^{commit}`]);return candidate;}catch(_error){/* try the next explicit fallback */}}
  throw new Error("Batch 17C-7C check: unable to resolve a scope base ref");
}

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
  fixture("unsupported questionType",(_v,p)=>p.records[0].questionType="synonym",/must have questionType paraphrase|unsupported questionType/i);
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
  fixture("cross-type fallback",(_v,p,_u)=>p.records[12].questionType="usage",/must have questionType paraphrase|targetWord|usage target mismatch/i);
  fixture("paraphrase in usage manifest",(_v,p,u)=>u.records[0]=clone(p.records[0]),/usage manifest record 0 must have questionType usage/i);
  fixture("usage in paraphrase manifest",(_v,p,u)=>p.records[0]=clone(u.records[0]),/paraphrase manifest record 0 must have questionType paraphrase/i);
  for(const invalid of [4,5,6]) fixture(`incorrect reason index ${invalid}`,(_v,_p,u)=>u.records[0].incorrectUsageReasons[0].usageIndex=invalid,/invalid usageIndex/i);
  fixture("incorrect reason missing rejected index",(_v,_p,u)=>u.records[0].incorrectUsageReasons[2].usageIndex=2,/invalid usageIndex|cover exactly/i);
  fixture("incorrect reason points to answer",(_v,_p,u)=>u.records[0].incorrectUsageReasons[0].usageIndex=0,/invalid usageIndex/i);
  fixture("correct option kana mismatch",(_v,p)=>p.records[0].options[p.records[0].answerIndex].expressionKana="ちがう",/invalid correct option review/i);
  fixture("rejected option marked correct",(_v,p)=>p.records[0].options[0].languageReviewStatus="reviewed-correct",/invalid rejected option review/i);
  fixture("correct option marked incorrect",(_v,p)=>p.records[0].options[p.records[0].answerIndex].languageReviewStatus="reviewed-incorrect",/invalid correct option review/i);
  fixture("option kana contains Han",(_v,p)=>p.records[0].options[0].expressionKana="値段がたかい",/without Han/i);
  fixture("prompt kana contains Han",(_v,p)=>p.records[0].promptKana="箱です",/without Han/i);
  fixture("equivalent kana contains Han",(_v,p)=>p.records[0].equivalentExpressionKana="大きい",/without Han/i);
  fixture("usage kana occurrence misaligned",(_v,_p,u)=>u.records[0].usageSentences[0].targetOccurrence.kanaStart++,/occurrence index mismatch/i);
  const identity=paraphrase.records[0]; assert(stableId(identity)===stableId({...identity,irrelevantArrayPosition:999}),"ID depends on array-position data");
  const randomApi="Math"+"."+"random";
  assert(!fs.readFileSync(path.join(ROOT,"scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js"),"utf8").includes(randomApi),"builder uses a random API");

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
  const baseRef=resolveBaseRef(); const mergeBase=run(["git","merge-base",baseRef,"HEAD"]).trim(); assert(mergeBase,"merge-base is empty");
  const storageApis=["local"+"Storage","session"+"Storage","indexed"+"DB"]; const base=run(["git","show",`${baseRef}:script.js`]); storageApis.forEach(api=>assert(runtime.split(api).length===base.split(api).length,"storage API inventory changed"));
  const allowed=new Set(["japaneseJlptVocabularyParaphraseReviewManifest.json","japaneseJlptVocabularyUsageReviewManifest.json","japaneseJlptVocabularySemanticQuestions.json","scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","scripts/check-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js","docs/japanese-jlpt-batch17c7c-vocabulary-semantic-data.md"]);
  const changed=run(["git","diff","--name-only",`${mergeBase}...HEAD`]).trim().split("\n").filter(Boolean); const working=run(["git","status","--porcelain"]).trimEnd().split("\n").filter(Boolean).map(line=>line.slice(3));
  const scoped=[...new Set([...changed,...working])]; scoped.forEach(file=>assert(allowed.has(file),`scope guard rejects ${file}`));
  const forbiddenSource=[...storageApis,randomApi]; scoped.forEach(file=>{const source=fs.readFileSync(path.join(ROOT,file),"utf8");forbiddenSource.forEach(api=>assert(!source.includes(api),`${file} adds a forbidden storage/random API`));});
  if(!process.env.JLPT_SKIP_DETACHED_FIXTURE){
    const temp=fs.mkdtempSync(path.join(require("os").tmpdir(),"17c7c-detached-"));
    try{
      run(["git","clone","--quiet",ROOT,temp]);
      cp.execFileSync("git",["update-ref","refs/remotes/origin/main",FALLBACK_BASE],{cwd:temp});
      cp.execFileSync("git",["checkout","--detach","--quiet","HEAD"],{cwd:temp});
      for(const branch of cp.execFileSync("git",["for-each-ref","--format=%(refname:short)","refs/heads"],{cwd:temp,encoding:"utf8"}).trim().split("\n").filter(Boolean))cp.execFileSync("git",["branch","-D",branch],{cwd:temp,stdio:"ignore"});
      cp.execFileSync(process.execPath,["scripts/check-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js"],{cwd:temp,env:{...process.env,JLPT_SCOPE_BASE_REF:"origin/main",JLPT_SKIP_DETACHED_FIXTURE:"1"},stdio:"pipe"});
    } finally {fs.rmSync(temp,{recursive:true,force:true});}
  }
  console.log("PASS: Batch 17C-7C dynamic data, expanded negative fixtures, deterministic bytes, drift restoration, detached origin/main checkout, isolation, compatibility, storage and merge-base scope guards.");
}
if(require.main===module){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
