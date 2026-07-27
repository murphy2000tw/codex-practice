# Batch 17B-1 JLPT-style Data Policy and Derived Question Bank

## Purpose and positioning

Batch 17B-1 creates only the data layer, deterministic generator, documentation, and checker needed before a future JLPT-style vocabulary and grammar engine is connected. The data is site-internal simulated practice content. It is not an official JLPT question bank, official kanji list, official scoring method, or certification of JLPT difficulty.

## Added files

1. `japaneseJlptKanjiPolicy.json` records the versioned display policy, allowed display modes, fallback order, and pending N5/N4 kanji allow-list review status.
2. `japaneseJlptVocabularyGrammarQuestions.json` stores the generated 40-question derived practice bank.
3. `scripts/build-japanese-jlpt-batch17b1-data.js` deterministically rebuilds the derived JSON and supports `--check` for byte-for-byte verification.
4. `scripts/check-japanese-jlpt-batch17b1-data.js` audits repository scope, source counts, policy fields, generated question integrity, cache tokens, and reproducibility.
5. `docs/japanese-jlpt-batch17b1-data-policy.md` documents this batch and the handoff to the next batch.

## Question schema

The question bank has `schemaVersion: 1`, `policyVersion: 17b1-internal-v1`, a non-official disclaimer, source file names, and a `questions` array. Each question includes:

- `id`: stable sequential Batch 17B-1 identifier.
- `level`: `N5` or `N4`.
- `section`: `vocabulary` or `grammar`.
- `questionType`: `meaning` or `cloze`.
- `sourceIds`: IDs from `vocabulary.json` or `grammar.json`.
- `originalText`: original source word, grammar, or cloze prompt snapshot.
- `displayText`: kana-safe prompt shown under this batch policy.
- `kana`: kana snapshot used for conservative display.
- `rubyTerms`: empty in this batch.
- `kanjiPolicy`: always `kana-replacement` in this batch.
- `options`: four distinct choices.
- `answerIndex`: zero-based correct option position.
- `answerDisplay`: source snapshot needed by a future answer review UI.
- `explanation`: source-derived or source-preserving explanation.
- `timeLimit`: `null`; no timer is implemented.
- `scoreWeight`: `1`; no scoring engine is implemented.
- `reviewTags`: audit tags for this derived data batch.

## Counts and distribution

The generated bank contains exactly 40 questions:

- N5 vocabulary meaning: 10.
- N4 vocabulary meaning: 10.
- N5 grammar meaning: 5.
- N5 grammar cloze: 5.
- N4 grammar meaning: 5.
- N4 grammar cloze: 5.

Correct answer positions are balanced globally: positions `0`, `1`, `2`, and `3` each appear 10 times. Each 10-question vocabulary group is also balanced so the difference between answer positions is no more than one.

## Source selection rules

Vocabulary meaning questions are selected only from same-level `vocabulary.json` entries. The prompt uses the existing `kana` field, answer options use Chinese `meaning`, and distractors prefer entries from the same level and part of speech before falling back to other same-level meanings.

Grammar meaning questions are selected only from same-level `grammar.json` entries. The prompt uses `grammar.kana`, answer options use Chinese `meaning`, and `answerDisplay` preserves grammar, kana, meaning, and structure.

Grammar cloze questions are selected only from same-level `grammar.json` entries that already have complete quiz data: `clozePrompt`, `clozePromptKana`, `clozeMeaning`, `answer`, `explanation`, and four distinct `choices`. This batch does not rewrite, invent, or fill missing cloze prompts. Choices are reordered only to satisfy deterministic answer-position balancing; their text remains sourced from the existing quiz choices.

## Kanji policy limitation

The N5 and N4 kanji allow-lists are intentionally empty and marked `pending` because Batch 17B-1 has not completed trusted per-kanji human review. The generator and runtime must not guess kanji levels. Initial derived questions therefore never use `level-native`.

## Conservative kana replacement fallback

All included prompts use `kana-replacement`. `displayText` is copied from existing kana fields such as `kana` or `clozePromptKana`, and the checker rejects display text containing unclassified kanji. Items that cannot be safely represented under this conservative policy are excluded rather than forced into the bank.

## Reproducible generation

Run the generator with:

```bash
node scripts/build-japanese-jlpt-batch17b1-data.js
```

Run byte-for-byte verification without writing files with:

```bash
node scripts/build-japanese-jlpt-batch17b1-data.js --check
```

The generator uses fixed sorting, fixed selection rules, and fixed answer-position patterns. It does not use `Math.random`, `Date.now`, or unstable ordering.

## Out of scope for this batch

Batch 17B-1 does not modify `japanese/index.html`, `script.js`, `style.css`, `vocabulary.json`, `grammar.json`, reading data, listening data, sentence composition data, existing regression checkers, or existing audit documents. It does not expose a start button, implement answer handling, scoring, timing, results, retake flow, LocalStorage keys, LocalStorage schema, or runtime state.

## Batch 17B-2 handoff

Batch 17B-2 can connect this question bank to a JLPT-style practice entry point and answer engine. That future work should load `japaneseJlptVocabularyGrammarQuestions.json`, enforce the recorded `policyVersion`, render `displayText` under the kana fallback policy, implement answer-state isolation without changing existing modules, and add any scoring or timing only as a clearly site-internal simulated practice feature.
