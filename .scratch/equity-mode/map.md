# Plan Pocket Poker Equity mode

Label: wayfinder:map
Status: complete

## Destination

A build-ready specification for a separate Equity mode in the current browser prototype: manual community-card and 2–8-player hole-card entry, with odds beside each hand. Agree the plan before application development or any GitHub push.

## Notes

- Use the local Markdown tracker; child tickets live in `issues/`. Claim through Status and Assignee; record resolutions under Answer. Do not post issues or push research branches during this effort.
- Consult wayfinder, grilling, and domain-modeling. Existing game and Simulation behavior are outside this change.
- The old mobile-calculator plan is historical context, not a current specification.
- The user approved the complete contract and defaults. Planning is complete.
- No prototype code or performance benchmark is authorized during this planning pass.

## Decisions so far

- [Agree the Equity mode contract](issues/01-equity-contract.md): approved manual known-hand Equity mode with estimated preflop, exact postflop, automatic cancellable calculations, and compact player rows.

## Not yet specified

None blocking the build plan. Actual phone timing remains a required implementation check, not a promised performance result.

## Out of scope

- Coding, committing, pushing, or deployment during planning.
- Unknown hands, ranges, known dead-card entry, two-board equity, side-pot calculations, betting advice, and online opponents.
- Saved-scenario libraries, automatic restore, changes to the multiplayer save, and Android packaging.
