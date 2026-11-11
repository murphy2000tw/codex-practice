# English listening: 1000ms playback preparation (phase one)

## Inventory before implementation

The repository has two English speech-synthesis controllers. Neither uses the
Japanese controllers in `script.js`. Searching English JS/HTML for speech and
playback calls found the following listening paths:

| Page / URL | Controls and existing rules |
| --- | --- |
| `english/listening/practice.html?type=vocabulary` | Play/replay button, unlimited playback; choose an answer, then next question. |
| `english/listening/practice.html?type=sentence` | Same controls for sentence listening. |
| `english/listening/practice.html?type=qa` | Same controls; currently speaks only `item.question`, not question followed by answer. |
| `english/listening/practice.html?type=geptPicture` | GEPT picture meaning practice, unlimited replay. |
| `english/listening/practice.html?type=geptQuestionResponse` | GEPT question/response practice, unlimited replay. |
| `english/listening/practice.html?type=geptConversation` | GEPT short conversation practice; speaks the existing combined `audioText`. |
| `english/listening/practice.html?type=geptShortTalk` | GEPT short talk practice; speaks the existing combined `audioText`. |
| `english/listening/quiz.html?type=…` for each of the seven types above | Start test button; each question automatically plays once, without a separate per-question play button. Result list has replay buttons. |
| `english/vocabulary/index.html?mode=listening` (alias `listening-practice`) | Legacy vocabulary listening practice; word-audio button, answers, next question. |
| `english/vocabulary/index.html?mode=listening-test` (alias `listening-quiz`) | Legacy vocabulary listening test; manual once-only button, automatic advance after answering, result replay, retry and wrong-answer review. |
| `english/vocabulary/listening-quiz.html` | Standalone entry to the same legacy listening test. |

`english/listening/index.html` is a link-only menu. The actual seven types and
practice/test modes are selected by URL in `listeningPage.js`. Its legacy hash
parser also supports practice/test selections when loaded without a page URL.

## Explicit exclusions

- `english/listening/quiz.html?type=geptFullMock`: full GEPT mock preparation,
  section introductions, automatic question playback, and result replays remain
  immediate. The shared result replay factory explicitly bypasses the delay in
  this mode. Phase two will handle this flow.
- Ordinary vocabulary cards and the non-listening translation quiz have optional
  word pronunciation buttons. These remain immediate; only vocabulary listening
  modes opt into the delay.
- Reading, articles and fill-in-the-blank pages contain no listening playback.
- Japanese pages, `script.js`, hiragana/katakana controls, shared styles, question
  banks and progress schemas are unchanged.

## Implementation and affected files

- `english/listeningPlaybackDelay.js`: English-only single pending request with a
  1000ms timer, generation guard, temporary disabled/busy preparation state, and
  cancellation on navigation intent, hash change, pagehide, beforeunload and
  hidden tabs. A pending request rejects additional clicks, including clicks on
  another result replay button. Cancellation restores the control.
- `english/listening/listeningPage.js`: schedules practice/replay and non-mock
  automatic test playback; cancels on answer, render, reset and activity changes.
  Existing play-count updates and once-only tracking execute on actual speech
  submission, not when the timer is created.
- `english/vocabulary/geptVocabularyPage.js`: opts listening-mode word buttons
  into scheduling; existing stop paths and test-question renders cancel pending
  work. The once-only flag still changes only on successful speech submission.
- `english/listening/{practice,quiz}.html` and
  `english/vocabulary/{index,quiz,listening-quiz}.html`: load the English helper
  before the controller and bump controller cache versions. The vocabulary quiz
  loads the helper because it shares the controller, but does not enable delay.
- `scripts/check-english-listening-delay.js`: browser regression test.
- This document: page/control inventory, scope and manual checks.

The existing utterance text/order, rate, pitch, volume, answer choices, shuffling,
scoring, progress persistence and replay rules are retained. No new delay is
inserted inside utterance text or between question/answer segments. Automatic
non-mock tests retain automatic playback, with a 1000ms preparation period on
each question (including those reached by automatic advance).

## Verification

Run `node scripts/check-english-listening-delay.js` with Playwright and Chromium.
The test runs real page scripts and UI controls with a speech-synthesis observer
and a paused browser clock. It checks silence at 999ms and one speech submission
at 1000ms for all seven types, duplicate clicks, once-only limits, delayed result
replays, answer/next/retry/page lifecycle cancellation, hidden tabs, hash changes,
menu navigation, and progress recording only after playback submission. It also
checks immediate full-mock playback/result replays and ordinary vocabulary cards.
No runtime page errors are expected.

Also run `node scripts/check-english-vocabulary-practice-mode-switch.js`, JavaScript
syntax checks and `git diff --check`.

## Still requires manual confirmation

- Actual audible speech and voice availability on desktop Chrome/Edge/Safari and
  iPhone/iPad Safari. Automated speech observation verifies submission timing,
  not the OS speech engine's audible onset or mobile user-activation policy.
- On real devices, tap repeatedly, answer or navigate during preparation, switch
  tabs, use browser back/forward and verify no stale audio, especially with bfcache.
- Listen to QA/conversation/short-talk samples to confirm pronunciation and existing
  combined text order. QA currently reads only the question; adding answer audio
  would be a separate behavior change.
- Confirm full GEPT mock feels unchanged and Japanese/kana audio still behaves as
  before. Neither controller nor Japanese page assets were changed.
