# Define private turns and public table information

Parent: [Plan private pass-and-play poker](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by:

## Question

What is the complete private-turn lifecycle, including first access to hole cards, handoffs, automatic street transitions, backgrounding, cancelled gestures, showdown, and ending a hand without showdown? Which information is public at each point?

## Comments

Confirmed in the 2026-11-06 root interview:
- Each turn: “Pass to Alex” → “I’m ready” → face-down cards → hold Peek to reveal. Releasing hides them; submitting an action immediately returns to a handoff screen.
- During play, hide deck order, burn identities, other players' cards, and all hand rankings.
- At showdown automatically reveal only non-folded players. Folded cards stay hidden. Winning because everyone else folds must not reveal hidden hands.

Local code audit found leaks beyond hole-card faces: seat rankings, best-five results, next-card preview, deck list and card titles, burns, deal log, face-up card flights, card-specific status announcements, and accessible labels. Simulation replay/walkthrough controls also expose known decks. Backgrounding currently pauses animation but does not conceal cards. The multiplayer plan must cover all these paths, including assistive technology; visual card backs alone are insufficient.

Round two, confirmed on 2026-11-06: after a completed betting round, automatically deal the next street one card at a time with all hole cards hidden. Pause on the public board; “Next turn” starts the next private handoff. Multiplayer does not use the simulator's manual per-card controls. Local save/resume was also confirmed; see [Define opening, setup, and session recovery](04-opening-and-recovery.md).

Privacy implications of these choices: losing focus, backgrounding, cancelling a Peek gesture, leaving the turn, or restoring the app must conceal cards. Releasing Peek must work even if the pointer moves away from the control. Hidden card identities must not remain in accessible labels or announcements. A run-it-twice decision, when eligible, must happen before automatic dealing consumes a new street. The existing decision to keep cards hidden until showdown also applies to an all-in runout unless the user later changes it.

Equivalent private access for users unable to hold Peek belongs in [the layout and acceptance decision](05-clockwise-layout-and-acceptance.md); it must preserve the same conceal-on-action, conceal-on-interruption, and fresh-handoff guarantees. This is privacy for normal shared-device play, not protection against a player inspecting runtime state.

## Answer

Resolved from the user's answers through round three on 2026-11-06. The private-turn and public-information contract above is agreed. A submitted action conceals cards before any next screen appears. The following state then determines the destination:

1. Another betting decision is due: show the next player's handoff; acknowledging it never reveals cards automatically.
2. At least two non-folded players remain, betting is finished with undealt streets, and no further bets are possible: ask those players for runout consent before dealing. Hole cards remain private. The whole-hand choice is owned by [the game-session decision](03-game-session.md).
3. Normal betting round finished: deal the next street face down for burns and face up for community cards, then pause on the public board. “Next turn” begins the next private handoff.
4. An agreed all-in runout is in progress: public street pauses use “Continue runout”; no private betting turn exists. Complete Board A before Board B when running twice, preserving the already-shared prefix.
5. All selected boards are complete: reveal non-folded hands and show eligible winners and payouts. A hand ended by folds instead shows its winner and payout without revealing any hole cards.

The public board remains available during handoffs. Autosave and resumption must preserve the agreed privacy contract. Detailed accessibility controls and phone fit still require the acceptance discussion; this resolution does not authorize code changes.
