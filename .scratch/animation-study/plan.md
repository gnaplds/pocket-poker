# Animation comparison plan

Status: user approved final alignment; local comparison built for review. No deployment or GitHub push.

## Purpose

Make preparation, betting, turn changes, and results easier to follow while retaining the existing card movement and dealing pace. The tactile card paths were rejected.

## Scope

Pass & Play and Simulation share the effects. Simulation without betting omits chip travel. Equity retains its current progress display. App opening remains immediate.

Keep the comparison outside Netlify's published folder, on the animation-study branch, with in-memory practice games. Preserve an unchanged-current option for comparison. No new animation library.

## Effects and sequence

| Event | Feedback | Starting duration |
| --- | --- | --- |
| Prepare new hand/replay | Centered interleaving card stacks, light background blur, “Preparing hand…” | About 1,200 ms, replacing existing shuffle time |
| Confirm chip contribution | Small chip marker travels from acting seat toward pot; displayed values update immediately | 300 ms |
| Next actor | Active-seat outline pulses once, then remains still | 200 ms |
| Completed street | Emphasize Flop, Turn, or River after the last card lands | 200 ms |
| Hand win | Emphasize winner first, then open result dialog | 180 ms before dialog |

The shuffle adds no second wait or fake loading progress. Existing ready-to-deal pauses remain. Chip feedback begins only after a valid action; Check and Fold do not send chips. If chip feedback and a turn cue follow the same action, show chip travel first. Newer actions cancel stale decoration instead of building an animation queue.

Retain brief hand celebrations and stronger overall-game celebration. Next Hand remains usable while the winner sequence starts; using it cancels any pending result dialog or celebration. Text and amounts do not bounce. Private cards and guidance hide immediately, without an exit animation.

## Interruption and reduced motion

Leaving the tab, losing focus, or locking the phone clears the overlay and transient effects, conceals private cards, and pauses dealing. Resume requires an explicit action. Keep the prepared deck; do not reshuffle or replay the preparation effect. Already-public cards retain their existing visibility rules.

Reduced-motion mode removes shuffle movement, blur, chip travel, pulses, and confetti. Show static preparation feedback only for actual work; no artificial minimum delay. All cards, values, and outcomes remain the same.

## Local review

Compare the unchanged current behavior with the added effects using the same app layout. Provide a simple variant switcher and explain that reload clears practice games. Do not introduce new layouts or tactile card paths.

Check: complete hands in both modes; pauses; confirmed versus cancelled bets; rapid repeated actions; Next Hand during celebration; interruption during shuffle; private concealment; reduced motion; eight seats and two boards. Inspect motion at slow speed and after repeated use. Physical phone smoothness requires device review and must not be inferred from desktop tests.

After the user chooses the result, implement only the validated effects in the website, with checks for privacy, timing cancellation, and unchanged poker outcomes. Publishing is a separate action.

## Decision record

These are reversible presentation decisions, so no ADR is needed. “Shuffle overlay” means the temporary preparation display, not equity calculation or app startup. No poker-domain terminology changes are required.
