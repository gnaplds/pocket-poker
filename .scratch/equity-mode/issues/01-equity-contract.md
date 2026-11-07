# Agree the Equity mode contract

Parent: [Plan Pocket Poker Equity mode](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: Codex with project owner
Blocked by:

## Question

Which entry, probability, performance, cancellation, and presentation rules define the first Equity release?

## Comments

User decisions on 2026-11-08:

1. Build-ready plan for a separate browser Equity mode; no application changes or pushes until final approval.
2. 2–8 players, each with two known cards; one board at 0, 3, 4, or 5 cards. No unknown hands, ranges, dead-card input, or two-board equity.
3. Show Equity as the main percentage, plus outright Win and Tie. All players remain eligible for one equal pot, without bets or side pots.
4. Estimated preflop; exact enumeration from the flop onward.
5. Calculate automatically for complete valid inputs. Invalidate old percentages immediately after card edits and cancel superseded work.
6. Shared slot-based card picker with grouped suits, used cards disabled, Clear, stage buttons, and advance within the current hand or board stage.
7. Keep one scenario when switching modes during a visit; reload starts fresh. Multiplayer persistence is separate.
8. Preflop samples 20,000 boards, shows progress and intermediate estimates, then stops. Cancel hides unfinished results. No guaranteed completion time before measurement.
9. Earlier stage clears later cards; fewer players removes final seats. Confirm when entered cards would be removed. Reset keeps names and player count.
10. Sticky board and compact player rows with names, holes, Equity/Win/Tie, and current category from flop onward. River marks winner(s). No long draw guidance.

Final review: [specification draft](../spec.md).
Evidence: [current evaluator and workload](../research/evaluator-facts.md).

## Answer

The user approved the [complete specification](../spec.md) on 2026-11-08, including the proposed defaults. This resolves the entry, calculation, result, cancellation, and validation contract. Approval covers the plan only; no coding or pushing is authorized.
