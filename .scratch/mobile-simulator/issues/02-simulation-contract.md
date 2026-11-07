# Set the simulator scope and playback rules

Parent: [Plan the animated Android poker simulator](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by:

## Question

What does the user control and observe during a deal, and what do shuffle, playback, run it twice, and player results mean in this first release?

## Comments

Confirmed in the live interview on 2026-11-05:

- Observer mode: all players remain in the hand; no betting, folding, chip balances, or computer decision-making.
- Run it twice may start before the flop, after the flop, or after the turn. Both runs use the same hole cards and one deck; previously revealed community cards remain shared.
- Next Card, Play/Pause, and adjustable speed.
- Show each player's current best five-card hand and category from the flop onward. Mark final winner(s) after each board's river; preflop shows only hole cards.

The user also accepted automatic pauses at the end of each stage and a short shuffle animation followed by the actual resulting deck order.

## Answer

Scope amendment: on 2026-11-05 the user requested names, positions, and small demo bets. The no-betting/no-chips parts below describe the original accepted prototype; [the betting extension](06-demo-betting.md) now supersedes them. Other dealing and ranking behavior remains applicable.

Resolved with the user on 2026-11-05:

1. Observer-only simulation. All 2–6 players remain in the deal. No betting, folding, chip balances, or decision-making opponents.
2. Show a short shuffle animation, then the actual order of the shuffled deck. Individual physical cuts/riffles are not a first-release teaching feature. Each card drawn must follow the displayed order.
3. Animate each hole card, burn card, and community card separately. Offer Next Card, Play/Pause, and adjustable speed.
4. In single-run playback, pause after the hole cards, completed flop, and turn. These are the decision points for starting a second run. Once two runs begin, playback may continue through both while manual Pause remains available.
5. Run it twice may begin before the flop, after the completed flop, or after the turn. Keep the same player hands, use one deck without replacement, and share the board prefix already revealed. Run it twice is not a second shuffle or a fresh deck.
6. Display each player's current best five-card hand and category from the completed flop onward, updating after the turn and river. Before the flop, display the hole cards without claiming a five-card hand. Final winner(s) are determined separately for each completed board, including ties.

Implementation-independent consequences: intermediate one- or two-card flop animations are not completed streets; do not show a final street ranking until the stage is complete. Do not merge the two boards into a ten-card hand. A different player may win each board; this scope has no combined chip payout or probability display.

The exact phone layout, restart/replay controls, deck inspection presentation, and pause-in-motion behavior remain for [Validate the animated table and deck inspection](03-animation-prototype.md).
