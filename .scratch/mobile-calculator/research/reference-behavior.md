# Reference calculator behavior

Inspected on 2026-11-05. Source: [PokerCoaching odds calculator](https://pokercoaching.com/odds-calculator/), live browser UI and its explanatory article. This was a short interaction check, not exhaustive validation.

## Observed in the live UI

- The desktop view has a table, five board slots, player hands, a four-suit card grid, and Reset.
- Initial guidance requests two cards. Selecting A♠ K♠ changes the prompt to request another player.
- Entering Q♠ J♠ for the second player starts calculation automatically. The sampled result displays Hero Win 65.6%, opponent Win 33.8%, and Tie 0.6% for each. These are observations, not correctness fixtures.
- Selected cards become dimmed in the picker. Clicking an already-used A♠ did not visibly duplicate it.
- Entering one community card clears displayed results to 0% while the prompt still requests community cards.
- Reset clears hands and board and restores the initial prompt.
- Results appear beside individual hands and in a Hero/Others summary.

## Website claims, not verified implementation facts

The article says results update with added players and community cards. It describes both evaluation of every remaining possibility and thousands of simulations. The actual algorithm remains unknown. [Source](https://pokercoaching.com/odds-calculator/)

## Implications for the Android discussion

These are recommendations, not accepted product decisions:

- Show an explicit incomplete-input state instead of 0% when a hand or flop is unfinished. Zero is a valid probability and should not double as “cannot calculate.”
- Make duplicate cards unavailable and explain where an unavailable card is already used.
- Keep win probability, tie probability, and equity distinct. The observed result labels are Win and Tie; they do not establish a separate equity display.
- A list of player hands may fit a phone better than the reference’s table illustration. Validate this with a rough prototype.

## Limits and follow-up

The browser used a desktop-sized viewport. Mobile layout, player removal, maximum player count, multiway aggregation, full flop/turn/river progression, partial-hole-card editing, calculation cancellation, and latency were not reliably tested. Coordinate-based board entry was inconsistent; no further behavior is inferred from those attempts. No code internals or offline operation were inspected.

Research stayed local because the enclosing repository’s remote is for an unrelated game. No research branch was published.
