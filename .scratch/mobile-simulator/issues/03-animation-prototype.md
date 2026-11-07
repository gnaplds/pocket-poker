# Validate the animated table and deck inspection

Parent: [Plan the animated Android poker simulator](../map.md)
Label: wayfinder:prototype
Type: prototype
Status: resolved
Assignee: root
Blocked by: 01, 02

Prerequisites: [Establish the dealing and two-runout procedure](01-dealing-rules.md), [Set the simulator scope and playback rules](02-simulation-contract.md).

## Question

Which phone layout and animation sequence clearly show a shuffle, ordered deck, one-card-at-a-time dealing, burns, shared cards, two runouts, and six players' rankings? Review a rough prototype with the user. Set orientation, deck inspection and consumed-card visibility, burn visibility, dealer marker, speed controls, clear ties and best-five highlights, restart/replay behavior, reduced motion, and what Pause does during a moving card. Prove that deck order and visible card movements agree. The prototype is disposable discussion material.

Demonstrate and confirm the researched procedure: finish Board A before Board B and burn before every new street, keeping the already-revealed board prefix shared. This is a consistent teaching convention, not a claim that every poker room uses the same rules.

## Answer

On 2026-11-05, the user said “i like it, this is already good version of the simulation” and asked to add player names, positions, and simple low-chip betting. The original dealing prototype is accepted as the base for further exploration. The added betting behavior is tracked in [Validate named seats and demo betting](06-demo-betting.md). This accepts the demo direction, not a production Android framework.

## Earlier work

2026-11-05: User authorized a working throwaway prototype and confirmed TDD at two public boundaries: dealing commands and observable card state; and visible-card ranking with tied winners. Browser checks cover animation and layout separately. User-requested animation and tests override the prototype skill's default omission of these. Build one self-contained HTML demo; keep all state in memory. User review is still required before resolving this design ticket.

Prototype delivered locally: [Interactive dealing demo](../../../prototypes/dealing-prototype.html), [instructions and limitations](../../../prototypes/README.md), [behavior tests](../../../prototypes/dealing-prototype.test.cjs). Includes one-card movement, shuffled-deck inspection, burns, 2–6 players, stage pauses, two runouts from all three branch points, best-five rankings, tied winners, and four guided walkthroughs.

Validation: 12 behavior tests pass; JavaScript syntax checked; local preview responds HTTP 200. Browser automation is disabled in Work settings, so visual and timing verification remain incomplete. Uses a prototype JavaScript evaluator rather than the C# poker.net engine. The dealer button is fixed at Player 1, pause finishes the current card, and the full deck is visible; these interaction choices await user review. No production code, Android package, or final design verdict exists. Do not resolve this ticket until the user has reviewed it.
