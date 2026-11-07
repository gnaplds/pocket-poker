# Define opening, setup, and session recovery

Parent: [Plan private pass-and-play poker](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by:

## Question

What is the exact route from the opening screen to a playable game and back? Define setup, starting seat/button selection, leaving a live game, refreshing/reopening, interruption recovery, and what the future equity-mode entry does.

## Comments

Confirmed in the 2026-11-06 root interview: centered temporary game name/logo and Play on an opening screen; Play leads to mode selection and then setup. Keep Simulation available, include Pass-and-play, and mark manual-card equity as “Coming later.” Android-first, fully offline, 2–6 players remain the inherited scope. No final brand choice is needed for this plan.

Round two, confirmed on 2026-11-06: save the game locally after every completed action; reopening can resume the same hand and chip stacks. Resume starts with cards concealed and requires a fresh handoff. This expands the current prototype, which has no persistent session state.

Derived recovery requirements: preserve the deck, committed cards, betting state, chip stacks, button, and any outstanding runout choice. A reload cannot reshuffle the active hand, repeat a bet, or pay a pot twice. Persist committed deal transitions as well as betting actions. Temporary Peek visibility is never restored. A partial animation is presentation, not permission to replay an already committed deal.

Round three, confirmed on 2026-11-06: choose 2–6 seats and enter names in clockwise order before starting. Randomly choose the first button. Keep that player group fixed until the game ends; no joining midway or rebuys. Starting a new game is the way to change the group.

Round four, confirmed on 2026-11-06: setup offers a reveal-method choice, with Hold to peek as default and Tap to reveal as the alternative. The next implementation target is the existing browser prototype, followed by Android packaging after interaction review.

## Answer

2026-11-06: The user approved the complete opening/setup flow and local save/resume contract, including a temporary Pocket Table identity, one saved game, confirmation before replacement, both reveal methods, and private resumption. The next build is the browser prototype, followed by Android packaging after review. See the [approved specification](../spec.md).
