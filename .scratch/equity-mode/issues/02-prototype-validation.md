# Review the working Equity prototype

Parent: [Plan Pocket Poker Equity mode](../map.md)
Label: wayfinder:prototype
Type: prototype
Status: awaiting user review
Assignee: Codex with project owner
Blocked by: 01

## Question

Does manual card entry with automatic, cancellable Equity/Win/Tie calculation match the approved interaction?

## Comments

2026-11-08: The user authorized starting the prototype with TDD, and explicitly approved two test seams: calculation input/progress/results and calculator actions/visible results/cancellation. User instructions authorize tests despite the prototype skill's default to skip them. No push or deployment was requested.

Local capture branch: `codex/equity-prototype`. Artifact: [single-file prototype](../../../prototypes/dealing-prototype.html). Main remains unchanged. Walkthroughs and validation are in the [play guide](../../../prototypes/README.md#equity-prototype--2026-11-08).

Implemented and tested: known hands, card entry, duplicates, exact enumeration, 20,000-sample preflop, multiway split shares, stale-job rejection, cancellation/retry, mode retention, reload reset, confirmation and multiplayer isolation. 70 tests pass. User-experience verdict remains pending because browser control is disabled; no physical-phone or deployed-browser verification is claimed.
