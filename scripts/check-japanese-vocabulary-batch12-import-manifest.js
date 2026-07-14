const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'docs', 'japanese-vocabulary-batch12-import-manifest.json');
const vocabularyPath = path.join(root, 'vocabulary.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));
const errors = [];
const required = ['id', 'level', 'word', 'kana', 'meaning', 'partOfSpeech', 'example', 'exampleKana', 'exampleMeaning'];
const placeholders = ['Xを使います', 'を使います', '使います。', 'TODO', '待確認', '使用＋單字意思'];
const kanjiPattern = /[一-龯々〆ヵヶ]/;
const levels = new Set(vocabulary.map((entry) => entry.level));
const existingWords = new Set(vocabulary.map((entry) => entry.word));
const vocabularyIds = vocabulary.map((entry) => entry.id);
const duplicateVocabularyIds = vocabularyIds.length - new Set(vocabularyIds).size;
const duplicateVocabularyWords = vocabulary.length - new Set(vocabulary.map((entry) => entry.word)).size;
const levelCounts = vocabulary.reduce((counts, entry) => {
  counts[entry.level] = (counts[entry.level] || 0) + 1;
  return counts;
}, {});

function addError(message) { errors.push(message); }
function isEmpty(value) { return value === undefined || value === null || value === ''; }

if (!Array.isArray(manifest.entries)) addError('manifest.entries must be an array.');
const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
const approveAdd = entries.filter((entry) => entry.decision === 'approve-add').length;
const approveAddCompound = entries.filter((entry) => entry.decision === 'approve-add-compound').length;

if (entries.length !== 62) addError(`entries count expected 62, got ${entries.length}.`);
if (approveAdd !== 48) addError(`approve-add expected 48, got ${approveAdd}.`);
if (approveAddCompound !== 14) addError(`approve-add-compound expected 14, got ${approveAddCompound}.`);
if (manifest.summary?.total !== entries.length) addError('summary.total does not match entries length.');
if (manifest.summary?.approveAdd !== approveAdd) addError('summary.approveAdd does not match entries.');
if (manifest.summary?.approveAddCompound !== approveAddCompound) addError('summary.approveAddCompound does not match entries.');
if (manifest.baseline?.vocabularyCount !== vocabulary.length) addError('baseline vocabularyCount does not match vocabulary.json.');
if (manifest.baseline?.n5Count !== levelCounts.N5) addError('baseline n5Count does not match vocabulary.json.');
if (manifest.baseline?.n4Count !== levelCounts.N4) addError('baseline n4Count does not match vocabulary.json.');
if (vocabulary.length !== 3179) addError(`vocabulary.json expected to remain 3179 entries, got ${vocabulary.length}.`);

const ids = [];
const words = [];
let missingRequiredFields = 0;
let kanjiInExampleKana = 0;
let placeholderCount = 0;
let existingVocabularyCollision = 0;

entries.forEach((entry, index) => {
  const expectedSequence = index + 1;
  const proposed = entry.proposedEntry || {};
  if (entry.sequence !== expectedSequence) addError(`sequence at index ${index} expected ${expectedSequence}, got ${entry.sequence}.`);
  if (proposed.id !== 3180 + index) addError(`id for sequence ${expectedSequence} expected ${3180 + index}, got ${proposed.id}.`);
  ids.push(proposed.id);
  words.push(proposed.word);
  if (!levels.has(proposed.level)) addError(`invalid level for sequence ${expectedSequence}: ${proposed.level}.`);
  for (const field of required) {
    if (isEmpty(proposed[field])) {
      missingRequiredFields += 1;
      addError(`missing proposedEntry.${field} at sequence ${expectedSequence}.`);
    }
  }
  if (existingWords.has(proposed.word)) {
    existingVocabularyCollision += 1;
    addError(`word already exists in vocabulary.json at sequence ${expectedSequence}: ${proposed.word}.`);
  }
  if (kanjiPattern.test(proposed.exampleKana || '')) {
    kanjiInExampleKana += 1;
    addError(`exampleKana contains kanji at sequence ${expectedSequence}: ${proposed.exampleKana}.`);
  }
  const searchable = [entry.originalCandidate, proposed.example, proposed.exampleKana, proposed.exampleMeaning].filter(Boolean).join('\n');
  for (const placeholder of placeholders) {
    if (searchable.includes(placeholder)) placeholderCount += 1;
  }
});

const duplicateManifestIds = ids.length - new Set(ids).size;
const duplicateManifestWords = words.length - new Set(words).size;
if (duplicateManifestIds) addError(`duplicate proposedEntry id count: ${duplicateManifestIds}.`);
if (duplicateManifestWords) addError(`duplicate proposedEntry word count: ${duplicateManifestWords}.`);
if (placeholderCount) addError(`placeholder/template count: ${placeholderCount}.`);

console.log('Batch 12B import manifest check summary');
console.log(`manifest entries: ${entries.length}`);
console.log(`approve-add: ${approveAdd}`);
console.log(`approve-add-compound: ${approveAddCompound}`);
console.log(`id range: ${Math.min(...ids)}-${Math.max(...ids)}`);
console.log(`N5 count: ${levelCounts.N5}`);
console.log(`N4 count: ${levelCounts.N4}`);
console.log(`duplicate id: ${duplicateManifestIds + duplicateVocabularyIds}`);
console.log(`duplicate word: ${duplicateManifestWords + duplicateVocabularyWords}`);
console.log(`existing vocabulary collision: ${existingVocabularyCollision}`);
console.log(`missing required fields: ${missingRequiredFields}`);
console.log(`exampleKana containing kanji: ${kanjiInExampleKana}`);
console.log(`placeholder/template count: ${placeholderCount}`);

if (errors.length) {
  console.error('\nErrors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
