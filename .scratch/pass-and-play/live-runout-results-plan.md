# Live runout rankings and winner celebration

Status: Q1–Q4 approved and implemented on 2026-11-07. Automated and desktop-browser checks complete; physical-device checks remain.

## Requested changes

- Add an animated winner popup alongside the existing celebration.
- During public all-in runouts, show each remaining player's current hand category after the flop, turn, and river.
- Show board-specific winners near each community board.
- Automatically finish public all-in hands without a Showdown button.
- Group betting history by preflop, flop, turn, and river.

## Approved decision tree

1. **Approved (Q1).** Completion timing: the existing all-in reveal boundary remains (all owed decisions complete, no further side-pot betting). Once the last required river lands, automatically settle. For two runs, settle together after Board B finishes. Normal private hands keep manual Showdown; fold wins remain immediate. Preserve runout votes and pre-street readiness pauses.
2. Live categories: show a compact category at each non-folded seat after each complete street, calculated from both hole cards and that board. Label A/B separately for two boards. Show these basic categories even if optional guidance is off; do not add public draw explanations. Before the flop there is no five-card category.
3. Board winners: mark each all-in board's winners as soon as its river lands; Board A can show a result while Board B is pending. Ordinary hands show board winners only after Showdown. Distinguish main-pot and side-pot winners and ties; do not suggest everyone listed won the same pot. Payment waits for final hand completion.
4. Popup and history: one animated popup per completed hand, naming every chip recipient and amount, including ties/side pots/fold wins. Keep confetti, use a Continue button to dismiss, and do not auto-start the next hand. Reduced motion uses a static popup. Do not replay the popup when resuming an already-completed hand. History gets ordered street sections, with blinds under Preflop and reached streets with no bets labelled “No betting.” All-in runout streets can use A/B labels.

## Scope and checks after alignment

Extend the existing engine/session view, completion/replay rules, multiplayer board/seat rendering, celebration, and history. Keep Simulation's completion flow. Reuse the rank evaluator, pot rules, dialog pattern, and CSS animations. Preserve saved games and avoid duplicate payouts on recovery.

Use the agreed public command and UI event boundaries: category updates only at complete streets; folded-card privacy; two-board winners and unequal-stack pots; automatic all-in completion versus manual normal Showdown; single payout/recovery; popup dismissal/reduced motion; ordered street history. Live browser checks depend on browser availability, and physical phone checks remain separate.

## Delivery and validation

Implemented in the existing self-contained browser prototype, with no added dependencies. Automatic all-in settlement records the same Showdown command in replay, preserving completed saves and migrating older pending public all-in hands without duplicate payments. A shared pot-results function supplies board verdicts and final payouts. Live category labels are separate from optional hand guidance. The history is rebuilt from tagged actions and completed street events.

57 tests pass: 46 command/ranking/session tests and eleven DOM-boundary tests. Four inline scripts parse. The live six-seat test completed both runouts, displayed Board A's winner before payout, automatically settled after Board B's river, opened/dismissed the popup, grouped street history, and resumed without replaying the celebration. No logged browser errors; no seat overlap or horizontal overflow at an observed 375-pixel page width. Screenshots: [popup](winner-popup-preview.png), [boards](live-runout-preview.png).

Physical phone touch, real screen-reader use, and live reduced-motion appearance remain untested. The test used localhost; the user's 127.0.0.1 saved game was not modified.
