# Plan the animated Android poker simulator

Label: wayfinder:map

## Destination

A build-ready specification for an offline Android Texas Hold’em dealing simulator for 2–6 players. Show shuffling, deck order, individual card movements, burns, one or two board runouts, each player’s hand category and best five cards, and the winner or tied winners.

## Notes

- On 2026-11-06 the user accepted demo betting and opened a separate [pass-and-play planning effort](../pass-and-play/map.md). This map remains the simulation baseline; its exclusions are not exclusions for the new multiplayer effort. Production framework selection should consider both modes after multiplayer alignment.
- Replaces the [odds-calculator plan](../mobile-calculator/map.md) following the user's scope change on 2026-11-05. Earlier research is historical evidence, not the active product specification.
- The user explicitly removed equity and odds calculations. Preserve the previously agreed Android-first, fully offline, personal-use, 2–6-player scope.
- Scope update on 2026-11-05: the user accepted the dealing prototype and requested names, position labels, and small demo betting. This supersedes the earlier observer-only/no-betting boundary; the user controls each seat and all cards remain visible.
- The user explicitly requested shuffle visibility, deck order, one-at-a-time dealing, burns, flop/turn/river, and run it twice. Detailed interaction requirements live in the child tickets.
- Preferred evaluator candidate: https://github.com/JBelthoff/poker.net. Interaction reference: https://poker-calculator.johnbelthoff.com/. The [existing evaluator assessment](../mobile-calculator/issues/06-pokernet-fit.md) remains relevant to hand ranking; its odds-loop requirement is obsolete.
- Consult `grilling` and `domain-modeling` for decision sessions, `research` for external evidence, and `prototype` for interaction review. Use the [glossary](../../GLOSSARY.md) and plain English.
- Use the local Markdown tracker: child issues in `issues/`, `Blocked by` for dependencies, `Status: open/claimed/resolved`. Claim an open, unblocked issue before work. A resolved issue may have a scope-closure answer rather than an implemented deliverable.
- Keep research local. The enclosing workspace remote belongs to an unrelated game; no dedicated poker remote is configured.
- Write `spec.md` after decisions are settled. This effort authorizes planning and discussion prototypes, not production implementation.

## Decisions so far

- [Validate named seats and demo betting](issues/06-demo-betting.md): the user accepted the betting extension as the simulation baseline and requested separate private multiplayer planning.
- [Validate the animated table and deck inspection](issues/03-animation-prototype.md): user accepted the original simulation as the basis for the names and demo-betting extension.
- [Establish the dealing and two-runout procedure](issues/01-dealing-rules.md): documented a consistent burn/runout convention and verified that all supported deals fit one deck; confirm its presentation in the prototype.
- [Set the simulator scope and playback rules](issues/02-simulation-contract.md): observer mode, actual deck-order display, per-card playback, stage pauses, two-runout branching, and per-board rankings are agreed.

## Not yet specified

- Further interaction questions revealed by reviewing the animated table and two-board layout.

## Out of scope

- Equity, win probabilities, Monte Carlo estimation, and exhaustive future-board calculations.
- Computer opponents' decisions, persistent bankrolls, unequal starting stacks, and side pots. Simple per-deal betting and payouts are now included by explicit user request.
- Step-by-step physical shuffle instruction; the agreed scope uses a short animation and displays the actual resulting deck order.
- Manual calculator-style card entry in this simulator effort.
- Building or publishing the production app during this planning effort.
- iOS, accounts, servers, and saved-hand libraries in the first release.
