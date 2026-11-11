# Full GEPT elementary listening mock: preparation and iOS unlock

This phase covers only `english/listening/quiz.html?type=geptFullMock`.
The exclusions recorded for PRs #325 and #326 in
`english-listening-playback-delay.md` are historical; full mock playback now
joins the existing English-only preparation helper. The helper itself and the
general English listening controllers' behavior are unchanged.

## Playback entry inventory

| Entry | Existing behavior retained | Preparation |
| --- | --- | --- |
| Overall Start test | Opens first section instructions; no question audio | No unlock or audio on this informational step |
| Start this section (all four sections) | Starts the first unanswered question of that section | Synchronous silent unlock, then 1000ms before speech submission |
| Answer within a section | 450ms answer feedback, then automatic next question | Unlock on the answer click; next question keeps a 1000ms preparation interval |
| Answer at section end | Opens next section instructions | No autoplay; next section's start click unlocks |
| Final answer | Shows score, section results, history and result replay buttons | No automatic result audio |
| Result replay (each question) | Unlimited replay of the existing transcript; no progress/play-count updates | Silent unlock on replay click; button disabled with preparing label until 1000ms |
| Retry / return menu | Resets test or navigates | Cancels old pending and submitted speech |

All four sections are covered: picture meaning, question/response, conversation,
and short talk. The question/response section still speaks its existing
`audioText` only, with no added answer speech. Question selection/order, options,
answer feedback, correctness, once-only question tracking, history and scoring
are unchanged. Once-only tracking and play counts update when the actual question
is submitted, so silent unlock and cancelled preparation consume no play slot.

## iOS and cancellation

Use PR #326's unmodified `EnglishListeningPlayback` helper: submit an empty
`SpeechSynthesisUtterance("")` with `volume = 0` synchronously on the click stack,
retire it on that same stack, then wait. Prepared content bypasses a cancel call
immediately before speech submission. No asynchronous timer performs an unlock.
The 450ms feedback plus 1000ms next-question preparation retain the existing
feedback flow while adding the requested preparation interval.

Mock answers cancel pending and current audio before preparing the next question.
The feedback callback uses the existing generation guard, so navigation, hidden
tabs or reset during feedback cannot schedule an old question. Existing helper
listeners handle pending playback on navigation intent, hash, hidden tab,
pagehide and beforeunload. Additional mock-only navigation/pagehide listeners
retire already submitted speech too, including bfcache entry. General English
listening types do not opt into these additional listeners.

## Files and checks

- `english/listening/listeningPage.js`: mock start, answer, delayed playback,
  result replay and scoped cancellation.
- `english/listening/quiz.html`: controller cache version update.
- `scripts/check-english-listening-delay.js`: complete mock UI regression plus
  the existing seven general types and legacy vocabulary regressions.
- This document: scope, inventory and manual checks.

Run:

```
node scripts/check-english-listening-delay.js
node scripts/check-english-vocabulary-practice-mode-switch.js
node --check english/listening/listeningPage.js
node --check scripts/check-english-listening-delay.js
git diff --check
```

The browser test separates silent unlocks from question speech, rejects unlocks
outside synchronous click handlers, models an unfinished silent utterance and
native cancellation, and requires fresh unlock before each delayed content
submission. It checks 999/1000ms boundaries, all selected questions in order,
all section boundaries, unchanged scoring/history, once-only limits, no unlock
play counts, repeatable result replay without progress mutation, and cancellation
in preparation, feedback and active playback. Existing non-mock regressions run
in the same script.

## Required real-device follow-up

Automated Chromium speech stubs cannot replace physical iPhone Safari testing.
On the phone, confirm:

- Fresh load: overall Start test remains silent; Start this section waits about
  one second and speaks, with no audible unlock.
- Each of the four sections: first and automatic subsequent questions speak;
  question/response never adds answer audio; section instructions remain silent.
- Answer during preparation, restart, return menu, navigate away/back, switch
  tabs, and restore via bfcache: no stale audio, including after answering but
  before the feedback timer advances.
- Results: replay several different questions repeatedly, double-tap while
  preparing, then retry/navigate during preparation. No duplicate or stale speech.
- Scores, history and once-only question rules remain as before. General English
  listening and Japanese/kana behavior remain unchanged.
