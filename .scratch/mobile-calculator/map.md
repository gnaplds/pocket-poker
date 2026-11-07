# Plan the Android poker calculator

Label: wayfinder:map
Status: superseded

Superseded on 2026-11-05 by [Plan the animated Android poker simulator](../mobile-simulator/map.md). The user removed odds/equity calculation and requested animated dealing with hand rankings. The content below records the earlier plan, not current requirements.

## Destination

A build-ready specification for a small Android Texas Hold’em calculator for personal study and hand review. The plan must settle scope, mobile interaction, calculation requirements, and acceptance criteria before implementation begins.

## Notes

- Confirmed with the user on 2026-11-05: Android first; fully offline; 2–6 players; two known hole cards per player; preflop, flop, turn, and river; one editable scenario at a time; no saved-hand library.
- Reproduce the reference calculator’s core behavior with a phone-focused design. Exact visual copying is not a requirement.
- Reference: https://pokercoaching.com/odds-calculator/
- User-proposed evaluator and additional interaction reference (2026-11-05): https://github.com/JBelthoff/poker.net and https://poker-calculator.johnbelthoff.com/. Reuse and simulation scope are under investigation; the Android framework is not yet selected.
- Consult `grilling` and `domain-modeling` during decision sessions, `research` for evidence, and `prototype` for interaction exploration.
- Use plain English and the project [glossary](../../GLOSSARY.md). Record ADRs only for consequential, hard-to-reverse trade-offs.
- This is a new planning folder. The enclosing workspace’s Git remote belongs to an unrelated game. Keep poker research local; do not publish it to that remote. A dedicated remote has not been selected.
- Use the local Markdown tracker. Child issues live in `issues/`; `Blocked by` lists ticket numbers. An issue is available when its status is `open`, it has no assignee, and every blocker is `resolved`. Claim it before work.
- User decisions from the opening interview are recorded above. Research findings support later decisions; they do not silently approve a framework or design.
- Final specification location: `spec.md`, written once the remaining decisions are settled. No implementation is authorized by this planning effort.

## Decisions so far

- [Assess poker.net for the offline Android app](issues/06-pokernet-fit.md): its C# ranking core is a reuse candidate; mobile integration, variable-player odds calculation, and validation are still needed.
- [Decide whether random-deal practice belongs in version one](issues/07-practice-scope.md): include generated known hands and staged board reveal with updated odds, alongside manual entry.
- [Establish the reference calculator’s behavior](issues/01-reference-behavior.md): observed card entry, automatic recalculation, Win/Tie results, and reset; incomplete-board handling needs a clearer mobile design.
- [Identify a viable offline calculation approach](issues/02-offline-engine-options.md): reusable evaluator options and exact-enumeration workloads are documented; Android integration and latency remain unmeasured.

## Not yet specified

- Any further decisions exposed by engine evidence or the mobile interaction review.

## Out of scope

- [Choose the calculation contract and Android stack](issues/03-calculation-contract.md): closed because the user removed probability calculation; evaluator/framework selection continues under the simulator map.
- [Validate card entry and result reading on a phone](issues/04-mobile-interaction.md): closed because animated dealing replaces the manual calculator flow.
- [Agree first-release acceptance and the build handoff](issues/05-release-acceptance.md): closed because acceptance must target the new simulator destination.
- Building or publishing the app during this planning effort.
- iOS support in the first release.
- Unknown opponent hands, random hands, and editable hand ranges in the first release.
- Saved-hand libraries, accounts, servers, and online synchronization in the first release.
- Exact reproduction of the reference website’s appearance.
