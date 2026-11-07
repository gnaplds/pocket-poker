# Simulation refresh specification

Status: approved on 2026-11-08 — planning only; implementation and publishing are not authorized.

## Purpose

Make Simulation feel like Pass & Play while remaining a visible-card study mode. One observer controls all seats. Add useful odds without predicting the actual shuffled runout. This document authorizes no application changes or publishing.

Decision record: [Agree the visible-card Simulation contract](issues/01-simulation-contract.md).

## Mode and deal lifecycle

- Support 2–8 named players in fixed clockwise seats. All dealt hole cards remain visible, including folded hands.
- Each deal starts with 20 chips per player and 1/2 blinds. Keep independent deals rather than carrying stacks or eliminating players across hands.
- Keep optional deal-only mode. There are no handoffs, readiness screens, private Peek controls, or computer decisions.
- New Deal shuffles a new deck. Replay preserves the exact original deck order; its preparation must not reshuffle that order.
- After preparation, wait for Deal Hole Cards. Confirm replacement of an unfinished deal if cards have been dealt or betting actions have occurred. Apply this rule to setup changes that replace the deal too.
- Preserve the current deal across mode changes in the same visit. Stop playback and unfinished calculations on leaving. Retain completed results and offer Calculate Again for interrupted work on return. Reload starts fresh; do not touch multiplayer storage.

## Layout and controls

- Reuse the visual treatment of Pass & Play: sticky edge-to-edge pot/community board, compact clockwise seats, and an active-player action area below the table.
- Remove Simulation's fixed 700-pixel seven/eight-player table. Size rows around their actual content and keep nearby seats close, without collisions when two categories and two equity values appear.
- Keep readable cards and text. On narrow or short screens, scroll rather than shrinking controls or promising the whole eight-player table fits in one viewport.
- Each seat shows name, position, two hole cards, stack/last action, current hand category from the flop, and Hand equity. Use A/B labels for two boards.
- Put Win/Tie, calculation detail, and best-five cards in player sections below the main controls. Do not add long draw guidance in this change.
- Match Pass & Play betting controls: Fold and Check/Call side by side; full-width Bet/Raise; Min–Max slider in one-chip steps; combined maximum All-in action; amount explanation immediately below; Pause at the bottom.
- Confirm every betting action before applying it, including Check. Preserve legal minimum raises, short all-ins, and existing payout rules.
- Match confirmed-action colors: bet/raise blue, matching call green, fold faded red, all-in gold, and check neutral. Keep the acting-seat outline separate. Reset street-specific actions on the next street; retain Fold/All-in.
- Show betting history openly at the bottom, grouped by preflop/flop/turn/river and board where needed.

## Dealing and study tools

- Main flow: completed betting round → pause → Deal Flop/Turn/River → one-card-at-a-time animation → completed-street inspection/betting.
- Scroll the table into view before animation begins, accounting for the sticky board. Scrolling must finish or be applied before the first card moves.
- Use Pass & Play's slower default dealing pace and reduced-motion behavior. Pause must stop automatic playback without losing the current deal.
- Keep Next Card, Play/Pause, speed, replay, actual deck order, burns, card log, and existing walkthroughs in Study Tools. The per-card path must respect betting gates and stop at street boundaries too.
- Starting a new animation invalidates old equity before any new card or burn is exposed. Mid-street per-card pauses show an incomplete/calculating state, not odds from the previous information set.
- Offer Run It Twice directly at preflop/flop/turn pauses. In betting mode, all owed decisions must be complete and no further betting possible. In deal-only mode, no betting gate applies. No player votes.
- Use the same deck and hole cards; share the already-revealed board prefix. Finish A before B, with a pause before every remaining street on either board.

## Hand equity contract

- Label the percentage Hand equity. Explain that it compares all non-folded hands in one hypothetical equal pot; it does not estimate actual chip payouts or side-pot shares.
- Win means sole winner; Tie means sharing the winning hand. Equity credits each tied winner with 1 divided by the number of winners. Use one-decimal percentages, as in standalone Equity mode.
- Include all non-folded players, whether all-in or still holding chips. Folded seats show Folded instead of competing percentages, but their cards remain unavailable to future boards.
- Exclude all dealt hole cards and dealt burns from possible future community cards. Ignore undealt card identities/order even when the deck inspector displays them. Do not look ahead to future burns or the predetermined result.
- For each board, exclude revealed non-shared cards from the other board too. Shared prefix cards are the same physical cards and count once. Never count the other board's cards as this board's hand.
- Show separate A and B percentages; no combined equity or probability of winning both boards. Each number is conditional on information already revealed. Once A reveals new cards, B's possible outcomes change.
- Use 20,000 uniformly sampled remaining boards for a board with no community cards, labelled Estimated with sample count and progress. Use full enumeration for a board with 3, 4, or 5 revealed community cards, labelled Exact only when complete. An undealt B board still uses the preflop sampling rule even if A has finished.
- Begin only after all hole cards are dealt. Recalculate after each completed street, a fold, or a runout choice that changes the board set. Changes in bet amounts alone do not change Hand equity.
- Calculations run off the main UI thread. Keep controls usable, cancel superseded work, and ignore late responses. Edits/new deals/replays/mode exits cannot restore stale percentages.
- Show progress and offer Cancel/Calculate Again. Cancelling hides unfinished estimates; errors leave dealing and betting usable and provide retry. Exact work may show progress but must not label partial odds Exact.
- A fold win has one eligible hand and requires no simulation: show the winner immediately. Do not pass a one-hand case through the current two-player-minimum calculator unchanged.
- Do not promise phone calculation times. The existing eight-player 20,000-sample benchmark was about 8.8 seconds on the development machine.

## Hand completion

- Normal betting hands finish after the last river decision. All-in hands finish after the final runout, including B when running twice. Deal-only hands finish after their final board.
- No manual Showdown pause. Fold wins finish immediately. In Simulation even folded cards stay visible.
- Show board results beside each completed board when its result is final. For two runouts A's board result can appear before B finishes; award chips and trigger the overall result celebration once the entire hand finishes.
- Reuse winner popup, confetti, and winning-seat glow, respecting reduced motion. Do not retrigger celebrations merely because equity updates, the view rerenders, or the user returns from another mode.
- Actual main/side-pot winners and chip awards remain separate from the Hand equity comparison. A player can receive side-pot chips even if their whole-field Hand equity is zero.

## Approved defaults

- Keep current default player count, Player 1–8 names, and fixed starting dealer for independent practice deals.
- Study Tools starts collapsed; betting history remains open. Keep existing player detail sections rather than adding another permanent row of odds to each seat.
- Rename the bottom Pause control to Pause Simulation where needed so it does not suggest a private handoff. Pausing does not change cards, bets, or the active player.
- Keep names and player count when preparing the next independent deal. No automatic saved Simulation or new setup options.

## Validation required during implementation

- Verify legal betting, action confirmations, street pauses, replay order, runout eligibility, and deck conservation through both street-level and per-card paths.
- Check fold/dead-card exclusion, dealt-burn exclusion, no future-order leakage, shared-prefix deduplication, and board A cards constraining B.
- Check exact split equity, a single survivor, eight-player inputs, sample budget/progress, and percentages summing to 100% across eligible players for each completed calculation.
- Verify cancellation during dealing, mode changes, resets/replay, and failures. No stale response may overwrite current results or retrigger winner animations.
- Check normal river completion, fold wins, two-runout completion, side-pot board labels, and distinction between Hand equity and actual payouts.
- Inspect 2, 6, 7, and 8 seats on phone-sized layouts, including two boards and long categories. Check no overlaps or forced vertical gaps, readable cards, sticky board, and pre-animation scroll placement.
- Exercise keyboard controls, focus after confirmation, accessible labels, and reduced motion. Measure actual browser worker behavior and phone speed rather than inferring them from unit tests.
- Run existing Pass & Play and standalone Equity regressions; their user-facing behavior and multiplayer saves must remain unchanged.

## Outside this change

Online play, AI decisions, ongoing Simulation bankrolls, Simulation persistence, actual-pot equity, combined two-board equity, ranges/unknown hands, manual Simulation card editing, Android packaging, and publishing.
