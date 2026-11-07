# Equity mode — approved plan

Status: approved by the user on 2026-11-08. Planning complete; application development, commits, and pushes require a separate instruction.

## Purpose and scope

Enable the existing Equity menu entry as a separate manual Texas Hold’em calculator. Enter 2–8 known two-card hands and one board, then compare each player's Equity, Win, and Tie percentages. All players are assumed to stay eligible for the same pot. Leave Pass & Play and Simulation unchanged.

## Agreed interaction

- Default names follow the app's Player 1…Player 8 convention. Names are editable.
- Choose Preflop, Flop, Turn, or River, with 0/3/4/5 required board slots.
- Tap a hole or board slot to open a shared picker. Group cards by suit; disable cards used in other slots. Provide Clear and Close. Move to the next empty slot within the current hand or board stage, and close when that group is full. Do not advance silently to another player.
- Keep suit names/symbols and red/black distinctions. Wrap each suit group into touch-sized rows rather than squeezing 13 tiny targets across a phone. Support keyboard focus and Escape.
- Increasing the stage preserves existing board cards and exposes empty slots. Moving backwards clears later cards. Reducing count removes the last seats. Confirm if either operation would discard entered cards; cancelling leaves the scenario and its results intact.
- Reset clears all hole and board cards but preserves names, player count, and the selected board stage. Confirm if cards have been entered.
- Keep one scenario in memory across mode switches. Reload starts fresh. Do not read or write the multiplayer save for calculator input.

## Input and result states

Calculate automatically after every valid card or structural edit. Every player must have exactly two cards, the selected stage must be complete, and all cards must be distinct and legal. Partial entry never produces percentages. Explain which slots still need cards. Enforce these checks at the calculation boundary as well as in the picker.

Hide stale results as soon as the scenario changes. Name-only edits relabel rows without changing the calculation. Stage or player changes that require confirmation do not mutate input before confirmation.

Show Equity prominently, with Win and Tie underneath or alongside. Use one decimal place; note that displayed totals may differ slightly due to rounding. Sampled results use “Estimated” and an approximate marker; never imply exact zero or certainty from a sampled 0.0% or 100.0%. “Exact” refers to enumeration, although displayed values are rounded.

Keep the community board sticky above compact player rows. Each row includes name, two cards, percentages, and the current made-hand category once the player's hand and the visible flop/turn/river are complete. Category means the hand now, not a projected final hand. At the river, mark the exact winner or tied winners. No winner label on earlier streets, betting advice, or full draw explanations.

## Calculation contract

Remove all entered hole and community cards from the available deck. Do not access simulator deck order, multiplayer cards, or hidden burns.

- Preflop: sample 20,000 complete boards uniformly. No card repeats within a board; separate samples may repeat the same board. Publish batches of provisional estimates and completed/target sample counts. Stop at the budget.
- Flop: enumerate every unordered pair of remaining cards.
- Turn: enumerate every remaining river card.
- River: evaluate the single known board.
- A sole winner gets one Win and equity share 1. Each of k tied winners gets one Tie and equity share 1/k. Losing players get zero. Divide totals by evaluated board count.
- Exact jobs show progress but no partial odds labelled Exact. Publish exact percentages only when enumeration completes.

A three-way board-only tie produces 33.3% equity per player, 0.0% Win, and 100.0% Tie. Tie percentages across players are not expected to sum to 100%.

## Responsiveness and recovery

Run computation in a Web Worker using the existing evaluator as the first candidate, without duplicating poker-ranking rules or adding a server. Keep the UI responsive. Use the existing unbiased random-number approach for legal sampling. If timing measurements show the evaluator is unsuitable, revisit the engine choice before adding a dependency or silently reducing the sample budget.

Cancel hides unfinished percentages and leaves editable inputs. A Calculate again button restarts a cancelled or failed job; unchanged input must not immediately restart by itself after Cancel. Leaving Equity cancels active work, hides unfinished results, and keeps entered cards. Returning to a cancelled scenario offers Calculate again. Preserve completed results for unchanged input during the visit.

Give each job a scenario identifier and ignore late messages from superseded jobs. Cancel promptly on edits. If worker startup fails or an error occurs, show an error with Retry rather than blocking the main thread. Never replace current results with an older scenario's output.

No fixed runtime or confidence guarantee is claimed. Twenty thousand samples is a workload budget, not proof of a particular error bound. Show “Estimates may vary” and the sample count. Do not announce each progress update aggressively to screen readers.

## Approved implementation defaults

- Start with 2 players, empty hands, and Preflop.
- One decimal place, sample count, and explicit Estimated/Exact labels.
- Calculate again after Cancel or failure; no endless auto-retry.
- Reset keeps the selected stage, names, and player count.
- No saved scenarios, automatic page-reload restore, random-deal shortcut, odds ratios, or integration with live multiplayer.

## Acceptance checks for the later build

1. Known river outright wins; two-way and multiway ties; all eight players tied on a board-only hand. Equity sums to 1 before formatting.
2. Flop and turn board counts match the evidence table. Never draw a known card or repeat a card within a sampled board.
3. Compare exact cases with independent expected outcomes; test ace-low straights, kickers, flushes, and full houses. Ranking regressions remain covered by the existing suite.
4. Exact results remain invariant under seat permutation and consistent suit renaming. Sampled tests use controlled randomness and statistical tolerances, not exact equality of independent runs.
5. Reject invalid cards, duplicates, incomplete player hands, and partial stages. Picker replacement and clearing cannot create hidden duplicate input.
6. Editing during a job, rapid consecutive edits, mode switching, cancellation, worker failure, and retry never expose stale percentages or corrupt multiplayer saves.
7. Confirmation preserves input on cancel; shrinking/expanding player count, stage changes, Reset, names, and per-visit retention follow the contract.
8. Verify 2- and 8-player rows, sticky board, all 52 picker choices, keyboard operation, and no horizontal overflow at phone widths. Run representative timing checks before setting expectations, especially eight-player sampling and two-player exact flop.
9. Run existing tests for Pass & Play and Simulation, and check static Netlify hosting works with the worker. Do not claim physical-phone validation from DOM doubles or desktop screenshots.

## Handoff

After the user approves the final plan, implementation is a separate authorized step. GitHub push and deployment must follow the user's explicit next instruction; approval of this planning document alone does not publish anything.
