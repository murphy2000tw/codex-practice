const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const script = read('script.js');
const html = read('japanese/index.html');
const vocabulary = JSON.parse(read('vocabulary.json'));
const grammar = JSON.parse(read('grammar.json'));
const readingSource = read('japaneseReadingQuestions.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readingSource, sandbox);
const readingSets = sandbox.window.JAPANESE_READING_SETS || [];

function uniqueCount(items) { return new Set(items.filter(Boolean).map(String)).size; }
function count(regex, source = script) { return (source.match(regex) || []).length; }

const storageKeys = [...script.matchAll(/const\s+(JAPANESE_[A-Z_]+KEY)\s*=\s*"([^"]+)"/g)].map(([, name, key]) => ({ name, key }));
const views = [...script.matchAll(/\[([^\]]+)\]\.includes\(view\)/g)]
  .flatMap(([, list]) => [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
const listeningIds = [...script.matchAll(/id:"(jl-\d+)"/g)].map((m) => m[1]);
const readingQuestionIds = readingSets.flatMap((set) => (set.questions || []).map((q) => q.id));
const readingSetIds = readingSets.map((set) => set.id);

const audit = {
  storageKeys,
  storageFormats: storageKeys.map(({ key }) => ({ key, format: 'JSON object map: stable item key -> positive seen count number; corrupt/unavailable storage returns {}.' })),
  japaneseViews: Array.from(new Set(['home', 'vocabulary', 'grammar', 'reading', 'listening', 'listeningMenu', 'listeningPractice', 'listeningQuiz', ...views])),
  answerHandlers: {
    vocabularyQuiz: 'handleQuizAnswer via renderQuizQuestion option buttons; currentQuizQuestion.word.id is stable.',
    grammarMeaningQuiz: 'handleQuizAnswer when activeMode is grammar-quiz and activeGrammarQuizType is meaning; grammar.id is stable.',
    grammarClozeQuiz: 'handleQuizAnswer when activeGrammarQuizType is cloze; grammar.id plus questionType distinguishes cloze.',
    readingPractice: 'handleReadingPracticeAnswer is practice-only and must not record mistakes.',
    readingQuiz: 'renderReadingQuizSet inline option click stores readingQuizAnswers; question.id and set.id are stable.',
    listeningQuiz: 'renderJapaneseListeningQuizQuestion inline option click updates listeningQuizSelectedIndex; item.id is stable.',
  },
  stableIds: {
    vocabulary: { total: vocabulary.length, stableIds: uniqueCount(vocabulary.map((x) => x.id)), usableMistakeItems: vocabulary.length },
    grammarMeaning: { total: grammar.length, stableIds: uniqueCount(grammar.map((x) => x.id)), usableMistakeItems: grammar.length },
    grammarCloze: { total: grammar.filter((g) => g.quiz && g.quiz.answer && Array.isArray(g.quiz.choices)).length, stableIds: uniqueCount(grammar.filter((g) => g.quiz && g.quiz.answer && Array.isArray(g.quiz.choices)).map((x) => x.id)) },
    reading: { sets: readingSets.length, setIds: uniqueCount(readingSetIds), questions: readingQuestionIds.length, questionIds: uniqueCount(readingQuestionIds) },
    listening: { total: listeningIds.length, stableIds: uniqueCount(listeningIds) },
  },
  missingStableIdOrUnsafe: [],
  vocabularyBookSources: [
    'createCard(word, index): add button on Japanese vocabulary practice card using word.id.',
    'showReadingLookupCard(card, lookup): add button after lookup resolves lookup.id from vocabulary.json; inflected forms save base vocabulary id; compound fragments save clicked fragment id.',
  ],
  proposedStorage: {
    japanese_vocabulary_book_v1: { schemaVersion: 1, itemsById: { '<vocabularyId>': { vocabularyId: 'string', source: 'vocabulary-card|reading-lookup', createdAt: 'ISO', updatedAt: 'ISO' } } },
    japanese_mistake_book_v1: { schemaVersion: 1, itemsById: { '<module>:<questionType>:<id>': { module: 'vocabulary|grammar|reading|listening', questionType: 'string', itemId: 'string', relatedId: 'string', wrongCount: 'number', lastWrongAt: 'ISO', userAnswer: 'string', correctAnswer: 'string', updatedAt: 'ISO' } } },
  },
  recommendedFiles: ['script.js', 'style.css', 'japanese/index.html', 'scripts/check-japanese-review-center-batch15a-implementation.js'],
  batch15a2: ['15A-2A storage utilities and vocabulary book', '15A-2B mistake recording hooks', '15A-2C review center UI and view isolation', '15A-2D regression and browser smoke test'],
  baselines: {
    vocabularyTotal: vocabulary.length,
    n5: vocabulary.filter((x) => x.level === 'N5').length,
    n4: vocabulary.filter((x) => x.level === 'N4').length,
    duplicateId: vocabulary.length - uniqueCount(vocabulary.map((x) => x.id)),
    duplicateWord: vocabulary.length - uniqueCount(vocabulary.map((x) => x.word)),
    missingRequiredFields: vocabulary.filter((x) => ['id', 'word', 'kana', 'meaning', 'partOfSpeech', 'level'].some((field) => !String(x[field] ?? '').trim())).length,
  },
  implementationTouched: ['scripts/audit-japanese-review-center-batch15a.js', 'scripts/check-japanese-review-center-batch15a-plan.js', 'docs/japanese-review-center-batch15a-plan.md'],
  sourceSignals: {
    hasReadingLookupCard: script.includes('showReadingLookupCard'),
    hasViewIsolation: script.includes('normalizeJapaneseView') && script.includes('getJapaneseViewElement') && script.includes('renderJapaneseView'),
    hasResetProgress: script.includes('confirmResetJapaneseQuizProgress'),
    japaneseEntryCount: count(/data-japanese-entry=/g, html),
  },
};

if (audit.stableIds.reading.questions !== audit.stableIds.reading.questionIds) audit.missingStableIdOrUnsafe.push('reading duplicate question id');
if (audit.stableIds.listening.total !== audit.stableIds.listening.stableIds) audit.missingStableIdOrUnsafe.push('listening duplicate id');
if (audit.stableIds.vocabulary.total !== audit.stableIds.vocabulary.stableIds) audit.missingStableIdOrUnsafe.push('vocabulary duplicate id');
if (audit.stableIds.grammarMeaning.total !== audit.stableIds.grammarMeaning.stableIds) audit.missingStableIdOrUnsafe.push('grammar duplicate id');

console.log(JSON.stringify(audit, null, 2));
