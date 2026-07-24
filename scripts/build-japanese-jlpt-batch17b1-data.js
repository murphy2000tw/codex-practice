#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'japaneseJlptVocabularyGrammarQuestions.json');
const POLICY_VERSION = '17b1-internal-v1';
function readJson(name){ return JSON.parse(fs.readFileSync(path.join(ROOT,name),'utf8')); }
function stable(a,b){ return String(a.id).localeCompare(String(b.id), 'en', {numeric:true}); }
function hasKanji(s){ return /[一-龯々〆ヵヶ]/u.test(String(s||'')); }
function uniqueBy(arr, key){ const seen=new Set(); return arr.filter(x=>{const k=key(x); if(seen.has(k)) return false; seen.add(k); return true;}); }
function placeOptions(answer, distractors, answerIndex){ const opts=[]; let d=0; for(let i=0;i<4;i++) opts.push(i===answerIndex?answer:distractors[d++]); return opts; }
const groupPatterns = {
  vocabN5: [0,1,2,3,0,1,2,3,0,1],
  vocabN4: [0,1,2,3,0,1,2,3,2,3],
  grammarMeaningN5: [0,1,2,3,0],
  grammarClozeN5: [0,1,2,3,1],
  grammarMeaningN4: [0,1,2,3,2],
  grammarClozeN4: [0,1,2,3,3]
};
function vocab(level){
 const all=readJson('vocabulary.json').filter(x=>x.level===level).sort(stable);
 const picked=uniqueBy(all.filter(x=>x.kana && x.meaning && !hasKanji(x.kana)), x=>x.meaning).slice(0,10);
 if(picked.length<10) throw new Error(`Not enough ${level} vocabulary`);
 return picked.map((item,idx)=>{
  const same=uniqueBy(all.filter(x=>x.id!==item.id && x.partOfSpeech===item.partOfSpeech && x.meaning), x=>x.meaning).map(x=>x.meaning);
  const rest=uniqueBy(all.filter(x=>x.id!==item.id && x.meaning), x=>x.meaning).map(x=>x.meaning);
  const distractors=[...same,...rest].filter(m=>m!==item.meaning).slice(0,3);
  if(new Set([item.meaning,...distractors]).size!==4) throw new Error('vocab option shortage');
  const answerIndex=groupPatterns[`vocab${level}`][idx];
  return {id:`jlpt-vocab-${level.toLowerCase()}-${String(idx+1).padStart(3,'0')}`,level,section:'vocabulary',questionType:'meaning',sourceIds:[String(item.id)],originalText:item.word,displayText:item.kana,kana:item.kana,rubyTerms:[],kanjiPolicy:'kana-replacement',options:placeOptions(item.meaning,distractors,answerIndex),answerIndex,answerDisplay:{word:item.word,kana:item.kana,meaning:item.meaning},explanation:`「${item.kana}」的中文意思是「${item.meaning}」。`,timeLimit:null,scoreWeight:1,reviewTags:['batch17b1','derived','kana-replacement']};
 });
}
function grammarMeaning(level){
 const all=readJson('grammar.json').filter(x=>x.level===level).sort(stable);
 const picked=uniqueBy(all.filter(x=>x.kana && x.meaning && !hasKanji(x.kana)), x=>x.meaning).slice(0,5);
 if(picked.length<5) throw new Error(`Not enough ${level} grammar meaning`);
 return picked.map((item,idx)=>{
  const distractors=uniqueBy(all.filter(x=>x.id!==item.id && x.meaning), x=>x.meaning).map(x=>x.meaning).filter(m=>m!==item.meaning).slice(0,3);
  const answerIndex=groupPatterns[`grammarMeaning${level}`][idx];
  return {id:`jlpt-grammar-meaning-${level.toLowerCase()}-${String(idx+1).padStart(3,'0')}`,level,section:'grammar',questionType:'meaning',sourceIds:[item.id],originalText:item.grammar,displayText:item.kana,kana:item.kana,rubyTerms:[],kanjiPolicy:'kana-replacement',options:placeOptions(item.meaning,distractors,answerIndex),answerIndex,answerDisplay:{grammar:item.grammar,kana:item.kana,meaning:item.meaning,structure:item.structure},explanation:`「${item.kana}」表示「${item.meaning}」。`,timeLimit:null,scoreWeight:1,reviewTags:['batch17b1','derived','kana-replacement']};
 });
}
function grammarCloze(level){
 const all=readJson('grammar.json').filter(x=>x.level===level).sort(stable);
 const picked=uniqueBy(all.filter(x=>x.quiz && x.quiz.clozePrompt && x.quiz.clozePromptKana && x.quiz.clozeMeaning && x.quiz.answer && x.quiz.explanation && Array.isArray(x.quiz.choices) && new Set(x.quiz.choices).size===4 && !hasKanji(x.quiz.clozePromptKana) && x.quiz.choices.every(c=>!hasKanji(c))), x=>x.quiz.answer).slice(0,5);
 if(picked.length<5) throw new Error(`Not enough ${level} grammar cloze`);
 return picked.map((item,idx)=>{ const originalIndex=item.quiz.choices.indexOf(item.quiz.answer); if(originalIndex<0) throw new Error('answer missing'); const answerIndex=groupPatterns[`grammarCloze${level}`][idx]; const distractors=item.quiz.choices.filter(c=>c!==item.quiz.answer); const options=placeOptions(item.quiz.answer,distractors,answerIndex); return {id:`jlpt-grammar-cloze-${level.toLowerCase()}-${String(idx+1).padStart(3,'0')}`,level,section:'grammar',questionType:'cloze',sourceIds:[item.id],originalText:item.quiz.clozePrompt,displayText:item.quiz.clozePromptKana,kana:item.quiz.clozePromptKana,rubyTerms:[],kanjiPolicy:'kana-replacement',options,answerIndex,answerDisplay:{grammar:item.grammar,kana:item.kana,answer:item.quiz.answer,meaning:item.quiz.clozeMeaning,structure:item.structure},explanation:item.quiz.explanation,timeLimit:null,scoreWeight:1,reviewTags:['batch17b1','derived','kana-replacement']}; });
}
function build(){
 const policy=readJson('japaneseJlptKanjiPolicy.json'); if(policy.policyVersion!==POLICY_VERSION) throw new Error('policy mismatch');
 return {schemaVersion:1,policyVersion:POLICY_VERSION,disclaimer:'Site-internal non-official JLPT-style simulated practice data. Not an official JLPT question bank, kanji list, scoring method, or difficulty certification.',generatedFrom:['vocabulary.json','grammar.json','japaneseJlptKanjiPolicy.json'],questions:[...vocab('N5'),...vocab('N4'),...grammarMeaning('N5'),...grammarCloze('N5'),...grammarMeaning('N4'),...grammarCloze('N4')]};
}
function main(){ const text=JSON.stringify(build(), null, 2)+'\n'; if(process.argv.includes('--check')){ const cur=fs.readFileSync(OUT,'utf8'); if(cur!==text){ console.error('Generated JLPT data differs from committed file.'); process.exit(1);} console.log('JLPT Batch 17B-1 generated data matches committed file.'); return;} fs.writeFileSync(OUT,text); console.log('Wrote japaneseJlptVocabularyGrammarQuestions.json'); }
main();
