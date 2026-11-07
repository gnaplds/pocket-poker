# Validate compact Simulation controls and Hand equity

Parent: [Align Simulation with Pass & Play](../map.md)
Label: wayfinder:prototype
Type: prototype
Status: awaiting user review
Assignee: Codex with project owner
Blocked by: 01

## Question

Does the approved compact, visible-card Simulation flow work as intended when controlling bets, stepping through two runouts, and comparing Hand equity?

## Comments

The user requested prototype development with TDD after approving the plan. They explicitly approved the visible-cards-to-equity boundary and the Simulation-controls-to-visible-state boundary. This authorizes local development and prototype capture, not publishing.

Context pointer: local branch `codex/simulation-refresh`, based on `codex/equity-prototype`. Artifact: [self-contained demo](../../../prototypes/dealing-prototype.html). Run with `python -m http.server 8765 --bind 127.0.0.1 --directory prototypes` from the repository root.

Implemented the approved controls, compact table, visible cards, street pauses, Study Tools, replay confirmation, automatic completion, board winners, grouped history, and cancellable per-board Hand equity. Shared ranking and history logic are reused. Existing manual Equity behavior and saved multiplayer state remain separate.

Validation: all 78 tests passed. Real browser worker calculations and eight-player two-board payouts completed. Browser bounds showed no seat overlaps for 2/6/7/8 players at an observed 401 CSS-pixel viewport. The eight-player two-board table measured about 604 pixels with categories and equity; height follows content rather than the former fixed 700 pixels. Scroll testing caught and fixed the sticky-target issue. See the [play guide](../../../prototypes/README.md) for details.

Pending: user verdict, physical Android performance/touch testing, and screen-reader testing. No claim of user acceptance or production readiness. No push or deployment.
