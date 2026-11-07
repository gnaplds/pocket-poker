# Plan private pass-and-play poker

Label: wayfinder:map

## Destination

A build-ready behavior plan for the next browser prototype of Texas Hold’em multiplayer for 2–6 people sharing one phone, with an opening screen, mode selection, setup, private turns, clockwise seating, and continuing chip stacks. Offline Android remains the eventual target. Confirm shared understanding with the user before changing game code.

## Notes

- Final user approval on 2026-11-06 explicitly authorizes building the complete browser prototype. Delivery and interaction review are tracked in [Validate the complete pass-and-play prototype](issues/06-multiplayer-review.md).

- Scope confirmed by the user on 2026-11-06. Preserve the accepted [simulator](../mobile-simulator/map.md) as a separate mode. Reserve manual card selection and equity as a future mode; implementing it is outside this effort.
- On 2026-11-06 the user chose to validate this extension in the existing browser prototype before Android packaging. Final Android framework and deployment choices do not block the browser behavior specification.
- The initial planning-only stage is complete. The user's later approval authorizes the browser extension; Android packaging remains deferred.
- Root interview answers are recorded in the relevant tickets. The first round settled the direction, not all edge cases or acceptance requirements.
- Consult `grilling`, `domain-modeling`, and the [glossary](../../GLOSSARY.md). Research uses primary sources and the `research` skill. Keep user questions in plain English and distinguish proposed defaults from confirmed choices.
- Local Markdown tracker: one child file per decision; `Blocked by` records dependencies. Claim before work. Resolve at most one non-research ticket per session. The map indexes answers; each ticket owns its detail.
- Keep research and plans local. The enclosing Git remote belongs to an unrelated game; do not push there.
- The approved behavior specification is `spec.md`. Android framework/evaluator selection remains linked to [the earlier technical decision](../mobile-simulator/issues/04-mobile-stack.md); do not claim the HTML prototype is already an Android app.

## Decisions so far

- [Live runout results and celebration](live-runout-results-plan.md): Q1–Q4 approved on 2026-11-07. Supersedes the all-in Showdown pause; adds live categories, early per-board results, the winner popup, and street history.

- [Showdown and public actions](showdown-and-actions-plan.md): Q1–Q7 approved and implemented. Whole-chip slider, deferred settlement, public all-in cards, and seat feedback pass automated tests; updated browser/phone layout checks remain.

- [Set the continuing game and run-it-twice rules](issues/03-game-session.md): continuing chips, correct unequal-stack betting, tournament-style blinds, and unanimous whole-hand runouts are approved.
- [Define opening, setup, and session recovery](issues/04-opening-and-recovery.md): Pocket Table opening, fixed roster, reveal methods, one local save, and concealed resumption are approved.
- [Confirm the clockwise table and build acceptance](issues/05-clockwise-layout-and-acceptance.md): the user approved the portrait-first browser specification and requested implementation.

- [Define private turns and public table information](issues/02-private-turns.md): concealed handoffs, hold-to-peek, public street pauses, private normal turns were agreed initially; the later [Showdown/public actions revision](showdown-and-actions-plan.md) supersedes private all-in runouts.
- [Verify rules for continuing stacks and two runouts](issues/01-continuing-game-rules.md): side pots and raise rights need proper accounting; completed betting determines runout eligibility; button and consent conventions need a product choice.

## Not yet specified

- Changes, if any, revealed by the user’s hands-on review of the delivered prototype.
- [Private hand guidance during Peek](peek-guidance-plan.md): Q1–Q14 approved, implemented and validated; awaiting user hands-on feedback. See the linked plan for test coverage and remaining physical-device checks.

## Out of scope

- Publishing or packaging a production app; the local browser prototype was explicitly authorized.
- Implementing manual card entry, equity, or odds; only its future-mode placement is included.
- Online play, servers, accounts, computer opponents, real-money services, and iOS.
- Final branding and logo artwork; the opening screen uses a temporary identity for planning.
- Android framework selection and packaging during this browser-prototype extension. Revisit after the interaction is validated on a phone.
