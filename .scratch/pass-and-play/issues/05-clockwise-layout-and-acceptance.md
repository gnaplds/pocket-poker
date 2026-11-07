# Confirm the clockwise table and build acceptance

Parent: [Plan private pass-and-play poker](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by: 02, 03, 04

## Question

How should public table information, private cards, actions, two boards, and results fit on the target phone? Specify a readable clockwise layout and the observable checks that establish alignment, then write and review the build-ready plan before implementation.

## Comments

Confirmed in the 2026-11-06 root interview: board at the top, stable clockwise seats around an oval below it, highlighted acting seat, and that player's private cards/actions in a separate area at the bottom. Do not rotate the table each turn or arrange seats as a row-by-row grid. Preserve seat identity as position labels and the button move.

The acceptance plan must include privacy across visible content and accessible labels, interrupted Peek gestures, betting and card conservation, unequal-stack payouts, elimination and heads-up order, two-runout eligibility/consent, and recovery according to the chosen policy. Target phone dimensions, orientation behavior, and the role of animation are still to be agreed.

Round four, confirmed on 2026-11-06:
- Design for portrait use first. Compact player seats surround an oval below the board; the current player's cards and actions are below the table. Stack two boards vertically. Use the clockwise arrangement in Simulation too.
- Extend the existing browser prototype first, so the user can validate the interaction before Android packaging. This is a scope decision, not authorization to code before alignment.
- Hold-to-peek stays the default. Setup also offers tap-to-reveal for people who cannot comfortably hold the control. That method has an explicit Hide Cards button and must conceal cards on an action, handoff, or interruption.

The [review draft](../spec.md) collects the user-facing flow and acceptance checks. Its proposed defaults still need the user's final confirmation. Validate against narrow portrait browser viewports first; the actual Android phone remains a later device check, not a claimed result.

Prerequisites: [Define private turns and public table information](02-private-turns.md), [Set the continuing game and run-it-twice rules](03-game-session.md), [Define opening, setup, and session recovery](04-opening-and-recovery.md).

## Answer

2026-11-06: The user approved the full specification and all proposed defaults, then explicitly requested: “Yes — approve the plan and build the prototype.” Portrait-first clockwise seating in both modes, private controls, public street pauses, and the acceptance checks are agreed. Implementation is authorized; validation of the delivered interaction is tracked separately. See the [approved specification](../spec.md).
