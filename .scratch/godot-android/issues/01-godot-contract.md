# Agree the Godot Android product and implementation contract

Parent: [Plan Pocket Poker for Godot Android](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: Codex with project owner
Blocked by:

## Question

What behavior, UI, architecture constraints, storage rules, and acceptance checks define the first native Godot APK and keep it separate from the web app?

## Comments

2026-11-08 — User accepted Q1–Q4:

1. Produce a build-ready plan before coding.
2. First APK: current Pass & Play, including private turns, betting, saves, run-it-twice, and public all-in equity. Simulation and manual Equity follow later.
3. Native Godot screens and poker logic, using the web app as the behavior and visual reference.
4. Offline APK installed directly; no accounts, ads, online multiplayer, or Play Store release in the first milestone.

Technical observations are in [Godot Android environment findings](../research/environment.md). Remaining recommendations are pending user answers; none are implicit approvals.

Q5–Q9 accepted:

5. GDScript, native Control-based 2D UI, Compatibility renderer; pin one Godot release with matching templates. Background equity must be measured on the phone.
6. Use godot/ on codex/godot-android, retaining web files as reference. No merge into web main unless separately requested.
7. Retain colors, logo, compact clockwise table, board, and button meanings; adapt touch targets, scrolling, layout, and Android navigation.
8. Android owns its local game save; no browser import. Save confirmed actions and resume with private cards concealed.
9. On focus loss, lock, or backgrounding: conceal private cards and pause dealing. Resume via a fresh handoff when a private turn is pending; retain public all-in visibility. Android Back follows the screen's Back or Save & Leave action.

Q10–Q14 accepted:

10. Full current Pass & Play parity for the first complete APK; implement in smaller steps. Simulation and manual Equity remain unavailable, labelled Coming later.
11. Keep 20,000 preflop samples and exact postflop enumeration. Run equity in the background with progress and cancellation; play never waits for percentages. Measure eight-player and two-board cases on the phone. Changes to accuracy or implementation language need a new decision.
12. Portrait only for the first APK; fixed community/pot area over scrollable content, safe areas, readable controls. Do not squeeze all eight seats into one viewport.
13. One current save and a last-valid recovery copy. Preserve damaged saves pending user choice. On save failure, pause betting and offer Retry or explicit continue-without-saving.
14. Deliver a debug APK and installation/update instructions. Keep package identity and signing key consistent across test builds. Phone tests are required before marking the milestone complete.

Review artifact: [Godot Android build plan](../spec.md). The operational defaults in that draft were accepted in the final review.

## Answer

2026-11-08 — The user approved the complete [Godot Android build plan](../spec.md) in Q15, including its final operational defaults. The contract is resolved. Approval covers planning only; no application development, installation, GitHub push, or merge is authorized by this answer.
