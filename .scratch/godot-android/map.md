# Plan Pocket Poker for Godot Android

Label: wayfinder:map
Status: complete

## Destination

An approved, build-ready plan for a native Godot rewrite of Pocket Poker, starting with an offline Pass & Play APK for direct installation on the user's phone. Cover behavior, touch layout, saves, equity, Android export, and device validation; retain Simulation and manual Equity as later milestones.

## Notes

- Use wayfinder, grilling, and domain-modeling; local Markdown tracker.
- Planning only: no application code, tool installation, publishing, or deployment until approved.
- Approved separation: pocket-poker/ (user-specified when implementation started) on codex/godot-android; web files retained as reference. No merge into web main without a later request.
- Current reference: web main commit b6980ea; 83 Node tests. Existing GLOSSARY.md defines poker terms.
- Reported target: Redmi Note 14 running Android 12; actual device/OS not yet verified.
- Q1–Q9 accepted; details are recorded in the open contract ticket. Initial scope: build-ready plan, Pass & Play first including existing rules/private play/saves/two runouts/public equity, native Godot screens and logic, offline direct-install APK. Store release is deferred.

## Decisions so far

- [Agree the Godot Android product and implementation contract](issues/01-godot-contract.md): approved native GDScript/Compatibility rewrite, isolated branch, full Pass & Play first APK, independent recoverable saves, background equity, and real-device acceptance. Full build plan linked from the resolved ticket.

## Not yet specified

None blocking the first APK implementation plan. Toolchain verification and physical-device measurements are required execution checks, not completed evidence. Detailed design of Simulation and manual Equity belongs to later milestones already outlined in the approved plan.

## Out of scope

- Application implementation during planning.
- WebView packaging, online multiplayer, accounts, ads, and Play Store release for the first APK.

## Implementation follow-through

Implementation was separately authorized after plan approval. The user accepted the Android SDK license and required package installation. Work is isolated on `codex/godot-android`; see [build evidence](implementation.md). Phone acceptance is pending.
