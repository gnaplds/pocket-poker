# Dealing and two-runout procedure

Researched on 2026-11-05 for the observer-only Android simulator. These findings support a house procedure; they do not approve the interaction design or implement a poker game.

## Source findings

**Normal deal.** PokerStars describes two clockwise passes, giving each player one hole card per pass. Start immediately left of the dealer button; the button receives the last card of each pass. Burn one card before the three-card flop, one before the turn, and one before the river. [PokerStars dealing guide, “The Deal” and “Burn Cards”](https://www.pokerstars.com/poker/learn/news/how-to-deal-a-poker-hand/)

**Heads-up.** The button is the small blind; the other player is the big blind and receives the first card. Thus the hole-card order is big blind, button, big blind, button. Dealing order is separate from betting order. [BetMGM heads-up guide, “Blinds in Heads Up Poker”](https://poker.betmgm.com/en/blog/poker-guides/how-to-play-heads-up-poker/)

**Two runouts.** Resorts World Sentosa’s published rules cover branching before the flop, after the flop, and after the turn. Section 3.19.5 completes the first run before the second and burns before each newly dealt street in both runs. [Singapore GRA, RWS No Limit Hold’em v9, §3.19.5(a–c)](https://www.gra.gov.sg/docs/default-source/game-rules/rws/poker-games/rws-game-rules---no-limit-hold%27em-v9.pdf?sfvrsn=305ad0d2_1)

**Shared cards.** WSOP’s 2026 live-action rules also finish one run before the next. Its example keeps the existing flop for all subsequent turn-and-river runs. The rules allow a second full board, turn-and-river pair, or river. [WSOP Live-Action Rules 2026, rules 208–213](https://assets.wsopcdn.com/wsop/853ee602-e1e9-4019-a0cf-381419d805c6.pdf)

**House differences.** BCLC §21, 11.1 restricts this option to two all-in players after the flop, but 11.2.6 also describes a preflop case. That preflop wording mentions burns before turns and rivers without explicitly specifying the flop burns. This ambiguity is not evidence that all rooms skip those burns. Use one named convention instead of combining fragments. [BCLC Poker Rules, §21, 11.1–11.2.6](https://www.casinosbc.com/content/dam/casinosbc/about-games/how-to-play/poker/Rules-For-Play-Poker.pdf)

## Recommended simulator convention

Use the RWS sequence: one shuffled 52-card deck, unchanged hole cards, complete Board A, then Board B. Burn once before every new street. Continue from the next unused card; never return a dealt or burned card to the deck or reshuffle between runs. This deck-continuity requirement makes the dealing model explicit rather than relying on an unstated implementation assumption.

| Branch point | Shared prefix | Board A’s remaining sequence | Board B’s remaining sequence |
|---|---|---|---|
| Before flop | None | Burn, 3-card flop; burn, turn; burn, river | Burn, 3-card flop; burn, turn; burn, river |
| After flop | The existing 3-card flop | Burn, turn; burn, river | Burn, turn; burn, river |
| After turn | Existing flop and turn | Burn, river | Burn, river |

The shared prefix consists of the same physical cards. If both board rows display it, label those cards as shared; the display must not consume extra deck cards. Each board is evaluated separately with the same hole cards. A player can win one board and lose or tie the other.

Offer branching only at these completed stage boundaries. A partly animated flop is not a new branch point. One-at-a-time card animation can illustrate the deal without treating each flop card as a separate poker street.

This simulator has no betting. Allowing the observer to choose two runs for 2–6 players is a teaching control, not a claim that every casino permits that choice under those conditions.

## Card-count derivation

The following counts are arithmetic derived from the recommended procedure, not measurements or quotations. They count every distinct hole card, board card, and burn drawn since the initial shuffle.

| Completed mode | Unique board cards | Total burns | Total consumed for n players | 2 players | 6 players |
|---|---:|---:|---:|---:|---:|
| Run once | 5 | 3 | 2n + 8 | 12 | 20 |
| Twice before flop | 10 | 6 | 2n + 16 | 20 | 28 |
| Twice after flop | 7 | 5 | 2n + 12 | 16 | 24 |
| Twice after turn | 6 | 4 | 2n + 10 | 14 | 22 |

All supported cases fit one deck. The largest case consumes 28 cards and leaves 24. The arithmetic was checked for every player count from 2 through 6 with a small assert-based calculation.

## Evidence limits

The GRA PDF’s direct URL returned a JavaScript verification page. Its cited sections were available through the search engine’s indexed primary-source text, including the explicit preflop and later-street burn sequences. PokerStars, BetMGM, BCLC, and WSOP content was directly accessible. No casino procedure is presented as universal, and no production dealing code or animation was tested. Research remains local; nothing was pushed to the unrelated game repository.
