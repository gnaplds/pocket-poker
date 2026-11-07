# Validate named seats and demo betting

Parent: [Plan the animated Android poker simulator](../map.md)
Label: wayfinder:prototype
Type: prototype
Status: resolved
Assignee: root
Blocked by: 03

## Question

Do editable names, position labels, and small manual betting rounds fit the accepted dealing simulator?

## Comments

User explicitly requested this extension on 2026-11-05, superseding the earlier no-betting boundary. Added to the [same standalone prototype](../../../prototypes/dealing-prototype.html): names, 2–6-player position labels, 20-chip stacks, 1/2 blinds, check/call/bet/raise/all-in/fold, action order, pot awards, and betting history. Each fresh deal resets equal stacks; no carry-over bankroll or unequal-stack side pots. All cards remain visible and the user controls each seat. Run it twice in betting mode requires completed all-in calls. Existing deal-only mode and guided examples remain available.

Twenty behavior tests pass. A stub-DOM smoke check covers startup and wiring, but browser control remains disabled and visual/touch behavior has not been verified. The user has not yet reviewed this extension.

## Answer

2026-11-06: The user reviewed the extension, said “i like it,” and requested a separate pass-and-play multiplayer mode. Names, position labels, and small demo betting are accepted as the simulation baseline. This acceptance does not validate private multiplayer, continuing stacks, or unequal-stack pots; those belong to the [pass-and-play planning effort](../../pass-and-play/map.md).
