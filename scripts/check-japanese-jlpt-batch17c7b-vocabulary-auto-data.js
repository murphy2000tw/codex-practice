#!/usr/bin/env node
"use strict";

const fs=require("fs"), path=require("path"), crypto=require("crypto"), cp=require("child_process");
const ROOT=path.resolve(__dirname,".."); process.chdir(ROOT);
const {buildData,serialize,VERSIONS}=require("./build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js");
const read=name=>fs.readFileSync(name,"utf8"), json=name=>JSON.parse(read(name)), assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const clone=value=>JSON.parse(JSON.stringify(value));
const vocabulary=json("vocabulary.json"), manifest=json("japaneseJlptVocabularyAutoReviewManifest.json"), derived=json("japaneseJlptVocabularyAutoQuestions.json");
const sourceById=new Map(vocabulary.map(x=>[x.id,x])), types=["kanji-reading","orthography","context"];
const expectedId=r=>`jlpt-vocab-17c7b-${r.level.toLowerCase()}-${r.questionType}-src-${r.sourceId}`;
function mustFail(name, mutate){const fixture=clone(manifest); mutate(fixture); let failed=false; try{buildData(vocabulary,fixture);}catch(_){failed=true;} assert(failed,`fixture did not fail: ${name}`);}

assert(manifest.schemaVersion===VERSIONS.schema&&manifest.manifestVersion===VERSIONS.manifest&&manifest.sourcePolicyVersion===VERSIONS.policy,"manifest versions");
assert(derived.schemaVersion===VERSIONS.schema&&derived.manifestVersion===VERSIONS.manifest&&derived.sourcePolicyVersion===VERSIONS.policy&&derived.derivationVersion===VERSIONS.derivation,"derived versions");
assert(serialize(buildData(vocabulary,manifest))===read("japaneseJlptVocabularyAutoQuestions.json"),"derived output differs from dynamic build");
assert(derived.questions.length===72&&derived.inventory.total===72,"total inventory");
for(const level of ["N5","N4"]){const qs=derived.questions.filter(q=>q.level===level);assert(qs.length===36&&new Set(qs.map(q=>q.sourceQuestionId)).size===36,`${level} target uniqueness`);for(const type of types)assert(qs.filter(q=>q.questionType===type).length===12,`${level}/${type} inventory`);}
const ids=new Set(), sourceQuestionIds=new Set(), canonical=new Set();
for(const q of derived.questions){
 const sid=Number(q.sourceQuestionId.split("#")[1]), source=sourceById.get(sid), record=manifest.records.find(r=>r.sourceId===sid&&r.questionType===q.questionType&&r.level===q.level);
 assert(source&&record,"source join"); assert(q.id===expectedId(record),"stable source ID"); assert(!/^.*(?:index|position|array)-\d+$/i.test(q.id),"array-position ID");
 assert(!ids.has(q.id)&&!sourceQuestionIds.has(q.sourceQuestionId)&&!canonical.has(`${q.level}/${q.questionType}/${sid}`),"duplicate identity");ids.add(q.id);sourceQuestionIds.add(q.sourceQuestionId);canonical.add(`${q.level}/${q.questionType}/${sid}`);
 assert(source.level===q.level&&record.sourceSnapshot.word===source.word&&record.sourceSnapshot.kana===source.kana&&record.sourceSnapshot.meaning===source.meaning&&record.sourceSnapshot.partOfSpeech===source.partOfSpeech&&record.sourceSnapshot.example===source.example&&record.sourceSnapshot.exampleKana===source.exampleKana&&record.sourceSnapshot.exampleMeaning===source.exampleMeaning,"source drift");
 assert(q.section==="vocabulary"&&types.includes(q.questionType)&&q.reviewStatus==="approved-for-derived-bank"&&q.uniqueAnswerReviewed===true,"review/routing");
 assert(q.options.length===4&&q.options.every(x=>typeof x==="string"&&x.trim())&&new Set(q.options).size===4&&q.answerIndex>=0&&q.answerIndex<4&&q.options[q.answerIndex]===q.answerDisplay&&q.options.filter(x=>x===q.answerDisplay).length===1,"options/answer");
 assert(q.distractors.length===3&&q.distractors.every(x=>x.incorrectReason&&x.languageReviewStatus&&x.acceptedAsCorrect===false),"distractor reviews");
 assert(q.sourceIds.every(id=>sourceById.get(id)?.level===q.level),"cross-level source");
 if(q.questionType==="kanji-reading"){assert(/[\u3400-\u9fff々]/u.test(q.testedWord)&&q.answerDisplay===source.kana&&!q.displayText.includes(source.kana)&&q.rubyTerms.length===0&&!/<ruby|<rt/i.test(q.displayText),"reading leak/target");assert(q.readingReview.ambiguous===false&&q.readingReview.commonAlternateReadingsReviewed===true&&q.kanjiReview.displayedKanjiReviewed===true&&q.distractorReviews.length===3,"reading reviews");}
 if(q.questionType==="orthography"){const o=q.targetOccurrence;assert(q.correctOrthography===source.word&&q.promptKana.includes(`【${source.kana}】`)&&source.example.slice(o.sourceStart,o.sourceEnd)===source.word&&source.exampleKana.slice(o.kanaStart,o.kanaEnd)===source.kana,"orthography target");assert(q.optionReviews.length===4&&q.optionReviews.every(x=>x.displayKanjiReviewStatus&&x.languageReviewStatus&&(!x.acceptedAsCorrect?x.incorrectReason:true)),"orthography reviews");}
 if(q.questionType==="context"){const o=q.targetOccurrence;assert(source.example.split(source.word).length-1===1&&source.exampleKana.split(source.kana).length-1===1,"context unique occurrence");assert(source.example.slice(o.sourceStart,o.sourceEnd)===source.word&&source.exampleKana.slice(o.kanaStart,o.kanaEnd)===source.kana,"context indices");assert(q.blankedPrompt===source.example.slice(0,o.sourceStart)+"＿＿"+source.example.slice(o.sourceEnd)&&q.blankedPromptKana===source.exampleKana.slice(0,o.kanaStart)+"＿＿"+source.exampleKana.slice(o.kanaEnd)&&q.displayText===q.blankedPromptKana,"context indexed blank");assert(q.substitutionReviews.length===4&&q.substitutionReviews.every(x=>x.substitutedSentence&&x.grammarFormReviewed&&x.semanticFitReviewed&&(!x.acceptedAsCorrect?x.incorrectReason:true)),"substitution reviews");}
}
mustFail("missing source",m=>{m.records[0].sourceId=999999;});
mustFail("level mismatch",m=>{m.records[0].level="N4";});
mustFail("missing distractor review",m=>{delete m.records[0].distractors[0].incorrectReason;});
mustFail("duplicate options",m=>{m.records[0].options[1]=m.records[0].options[0];});
mustFail("two correct options",m=>{m.records[0].options[1]=m.records[0].correctOption;});
mustFail("cross-level fallback",m=>{const n4=m.records.find(r=>r.level==="N4");m.records[0].sourceIds[1]=n4.sourceId;});
mustFail("array-position ID",m=>{m.records[0].authoringId="17c7b-array-position-0";});
const beforeSource=crypto.createHash("sha256").update(read("vocabulary.json")).digest("hex"), beforeManifest=crypto.createHash("sha256").update(read("japaneseJlptVocabularyAutoReviewManifest.json")).digest("hex");
cp.execFileSync(process.execPath,["scripts/build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js"],{stdio:"pipe"});const first=read("japaneseJlptVocabularyAutoQuestions.json");cp.execFileSync(process.execPath,["scripts/build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js"],{stdio:"pipe"});const second=read("japaneseJlptVocabularyAutoQuestions.json");assert(first===second,"consecutive builds differ");cp.execFileSync(process.execPath,["scripts/build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js","--check"],{stdio:"pipe"});
assert(beforeSource===crypto.createHash("sha256").update(read("vocabulary.json")).digest("hex")&&beforeManifest===crypto.createHash("sha256").update(read("japaneseJlptVocabularyAutoReviewManifest.json")).digest("hex"),"builder mutated source/manifest");
const drift="japaneseJlptVocabularyAutoQuestions.json.drift-fixture", original=read("japaneseJlptVocabularyAutoQuestions.json");fs.writeFileSync(drift,original+" ");assert(read(drift)!==serialize(buildData(vocabulary,manifest)),"drift fixture not detected");fs.unlinkSync(drift);
const htmlFiles=cp.execFileSync("find",[".","-name","*.html","-type","f"],{encoding:"utf8"}).trim().split("\n").filter(Boolean);assert(!["script.js",...htmlFiles].some(file=>read(file).includes("japaneseJlptVocabularyAutoQuestions")),"derived bank is runtime-loaded");
const script=read("script.js");assert(script.includes('"17c6-compat-v1"')&&/N5:\s*\{\s*total:\s*20/.test(script)&&/N4:\s*\{\s*total:\s*34/.test(script),"compatibility totals changed");const compatibilityBlock=script.slice(script.indexOf('"17c6-compat-v1"'),script.indexOf("const JAPANESE_JLPT_COMPAT_PROFILE_VERSION"));assert((compatibilityBlock.match(/vocabulary:\s*\{[^}]*questionTypes:\s*\{\s*meaning:\s*10\s*\}/g)||[]).length===2,"vocabulary compatibility type changed");
const changed=cp.execFileSync("git",["diff","--name-only","--diff-filter=ACMRTUXB"],{encoding:"utf8"}).trim().split("\n").filter(Boolean), allowed=new Set(["japaneseJlptVocabularyAutoReviewManifest.json","japaneseJlptVocabularyAutoQuestions.json","scripts/build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js","scripts/check-japanese-jlpt-batch17c7b-vocabulary-auto-data.js","docs/japanese-jlpt-batch17c7b-vocabulary-auto-data.md"]);assert(changed.every(x=>allowed.has(x)),`out-of-scope diff: ${changed.filter(x=>!allowed.has(x))}`);
const additions=changed.filter(x=>fs.existsSync(x)&&x!=="scripts/check-japanese-jlpt-batch17c7b-vocabulary-auto-data.js").map(read).join("\n");assert(!/localStorage|sessionStorage|indexedDB/i.test(additions),"storage API added");assert(!/Math\.random/.test(additions),"Math.random added");
console.log("PASS: Batch 17C-7B manifest, 72-question derived bank, fixtures, isolation, and compatibility invariants verified.");
