# Agree the visible-card Simulation contract

Parent: [Align Simulation with Pass & Play](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: Codex with project owner
Blocked by:

## Question

Which Pass & Play interactions should Simulation adopt, and what do its visible cards, compact table, and per-player equity mean?

## Comments

2026-11-08: The user requested planning before development. Initial questions are pending: the planning destination, directly controlling all seats without private handoffs, and calculating odds independently of the predetermined future deck order. No proposed default is approved yet.

First-round answers received:

1. Approve the planning scope: compact table, sticky board, shared betting controls, visible dealt hole cards, and per-player equity. No code or push during planning.
2. The observer controls all seats directly, without handoffs or Peek. Retain betting-action confirmations.
3. Equity considers hypothetical future boards, ignoring the actual future shuffled deck order. Deck inspection remains separate.

Second-round answers received:

4. Each practice deal starts with 20 chips per player and 1/2 blinds. Retain Replay Same Deck; do not adopt multiplayer's ongoing stacks.
5. Main controls deal the next whole street with animation, pausing before each street. Keep Next Card, Play/Pause, speed, replay, and deck/burn inspection in Study Tools. Retain deal-only mode.
6. Equity excludes every dealt hole card, including folded hands, and burns already dealt. Folded players cannot win. Undealt cards and future deck order do not inform the probabilities.
7. Each seat shows hole cards, category, stack/action, and one main Equity percentage. Win/Tie details belong in player sections below to keep the table compact.

Third-round answers received:

8. Label the percentage Hand equity: compare non-folded hands in one hypothetical equally shared pot, independently of actual contributions or side-pot eligibility. Actual chip payouts retain betting rules.
9. In two runouts, show separate A/B equity with no combined number. Each board uses its revealed cards and excludes exposed non-shared cards on the other board plus all dealt burns; shared cards count once. Finish A before B.
10. Calculate after completed hole-card dealing, each completed street, and folds. Use 20,000 estimated preflop samples and exact postflop enumeration. Show progress without blocking play; clear stale results during dealing, cancel superseded work, and offer Cancel/Calculate Again.
11. Automatically finish after river betting, both all-in runouts, or a fold win. No manual Showdown. Include winner popup, confetti, seat glow, and per-board winner labels.

Fourth-round answers received:

12. The observer chooses Run It Twice directly, with no votes. In betting mode require all decisions finished and no further betting possible. Allow the choice at preflop/flop/turn pauses; in deal-only mode allow the same pauses. Pause before each remaining street on both boards.
13. New Deal and Replay reset stacks to 20, prepare the deck, and wait for Deal Hole Cards. Confirm replacing an unfinished deal when it has dealt cards or betting actions. Scroll the table into view before dealing animation.
14. Keep the current Simulation during the visit; reload starts fresh. Leaving stops playback and unfinished equity calculations; completed results remain. Do not change the multiplayer save.

Final review: [Simulation refresh specification](../spec.md). The user approved the full plan, defaults, and validation requirements on 2026-11-08.

Read-only implementation findings:

- Simulation already supports 2–8 seats, optional betting, per-card playback, deck/burn inspection, and replay. Each deal resets stacks to 20 and uses a fixed button.
- Its seven/eight-seat table is forced to 700 px tall; Pass & Play instead uses a content-sized grid. Shared coordinates alone will not fix the gap.
- Existing Equity accepts eligible hands and one board, without dead cards or side-pot weighting. Folded cards and exposed burns require an explicit information rule.
- Simulation completes Board A before Board B. Per-board equity must account for exposed cards on the other board without treating them as part of this board.
- Stable completed streets avoid repeated 20,000-sample calculations during individual card animations. Existing eight-player preflop measurement was about 8.8 seconds on the development machine, not a phone benchmark.

## Answer

The user approved the complete [Simulation refresh specification](../spec.md) in response to Q15 on 2026-11-08. All interview decisions and proposed defaults are agreed. This resolves the planning contract only; no application development, commit, GitHub push, or deployment is authorized by this approval. Browser and phone checks remain required when implementation is requested.
