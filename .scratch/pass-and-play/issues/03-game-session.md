# Set the continuing game and run-it-twice rules

Parent: [Plan private pass-and-play poker](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by: 01

## Question

Which supported betting conventions, elimination rules, next-hand transitions, and run-it-twice consent rules define the first multiplayer game? Translate the research into a clear user-facing contract, including short all-ins, side-pot payouts, and whether players can join or rebuy during a session.

## Comments

Confirmed in the 2026-11-06 root interview: start at 20 chips each, fixed blinds of 1/2, carry chips between hands, rotate the dealer button, sit out at zero chips, and finish when one player holds all chips. Side pots are required. The existing demo cannot simply carry stacks forward: it assumes equal stacks, a fixed button, one combined pot, and every surviving player having zero chips before two runouts.

Prerequisite: [Verify rules for continuing stacks and two runouts](01-continuing-game-rules.md).

Round three, confirmed on 2026-11-06:
- Offer run it twice only after all outstanding calls are finished, no further betting is possible, and at least one community street remains. Ask before consuming any new street. A covering player may retain chips.
- Every non-folded player must agree. One refusal means one run. The choice applies to the whole hand, including every side pot; no per-pot consent.
- Keep hole cards private through the runout; reveal eligible hands at showdown after all selected boards are complete.
- Randomly choose the first button. Thereafter use tournament-style dead-button movement, including elimination handling and the heads-up transition, rather than the research note's proposed forward-moving alternative. An empty seat can temporarily hold the button; heads-up the button posts the small blind.
- Fix the player group for the entire game. No mid-game joining or rebuys. Start a new game to change the group.

Retain the accepted simulation's whole-chip payout convention: split each pot between boards first, assigning an odd chip to Board A; split tied board portions among eligible winners, with any odd chips awarded clockwise starting left of the button. Apply this separately to every pot. Return unmatched excess before forming contested pots. The final plan must include side-pot and blind-transition examples for verification.

## Answer

2026-11-06: The user confirmed unanimous whole-hand runouts, tournament-style dead-button movement, a random first button, fixed 20-chip starts and 1/2 blinds, continuing stacks, and no joins/rebuys. Their final approval of the complete specification authorizes this contract for the browser prototype. The rules and user choices above remain the decision record. See the [approved specification](../spec.md).
