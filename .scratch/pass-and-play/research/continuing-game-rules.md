# Continuing stacks and two runouts

Researched on 2026-11-06 for [Verify rules for continuing stacks and two runouts](../issues/01-continuing-game-rules.md). This note settles source questions, not the user's remaining product choices. It supports a casual, offline game with 2–6 players, 20 starting chips each, and fixed 1/2 blinds.

## Unequal stacks and pots

A short stack can call all-in without matching the full bet, but can win only the amounts it covers. Additional matched contributions form side pots, each with its own eligible players. Folded contributions remain in the pot; the folded player cannot win. [PokerStars, Rules of Poker: All-In and The Pot](https://www.pokerstars.com/poker/games/rules/)

An unmatched excess must return to its owner; it is not a prize contested by other players. TDA explicitly distinguishes returned uncalled amounts from committed called bets. [Poker TDA 2026, rule 16-B](https://www.pokertda.com/view-poker-tda-rules/)

**Derived example:** A contributes 5, B 12, C 20; no other contributions exist. Return 8 to C. The main pot is 15, contested by A/B/C. A separate 14-chip pot is contested only by B/C. The 8-chip return is independent of who wins either pot.

For the future engine, retain each player's total contribution for the whole hand, separately from the current street. Form contribution layers, retain folded money, exclude folded players from eligibility, and return a top layer funded by only one player. This is an implementation inference from the rules, not a required data structure.

## Raises and completed betting

In no-limit play, a full raise must match or exceed the last full raise increment. A short all-in does not reopen a player who already acted unless the total additional amount faced reaches a full raise; several short all-ins can accumulate to that threshold. The minimum raise remains based on the last full raise. [Poker TDA 2026, rules 45 and 49](https://www.pokertda.com/view-poker-tda-rules/)

**Derived example:** A bets 4. B goes all-in for 6. If action returns directly to A, A may call 2 or fold, but cannot raise. If C instead goes all-in for 8 before action returns, A now faces an increase of 4 and may raise to at least 12, provided another opponent can still contest further betting. A player who has not yet acted has different raise rights. [WSOP Live-Action Rules 2026, rules 174–177](https://assets.wsopcdn.com/wsop/853ee602-e1e9-4019-a0cf-381419d805c6.pdf)

A short big blind does not lower the normal preflop bring-in for other players: with 1/2 blinds, a player holding only 1 posts that 1 all-in, while the normal call remains 2. [WSOP Live-Action Rules 2026, rule 154](https://assets.wsopcdn.com/wsop/853ee602-e1e9-4019-a0cf-381419d805c6.pdf)

Do not equate “one player has chips left” with “all action is finished.” A call or fold can still be owed. Showdown follows completed betting, including calls. [PokerStars, Rules of Poker: The Showdown](https://www.pokerstars.com/poker/games/rules/)

**Derived example:** A is all-in for 8; B has contributed 2 and has 18 left. B still owes a decision on 6. After B calls, no opponent can contest another bet; B's remaining 12 does not prevent the runout. The app should distinguish pending decisions from the ability to make further contested bets.

## Button and blinds after elimination

Two documented conventions differ:

- **Forward-moving button:** PokerStars moves the button to the next surviving player clockwise, including heads-up. Both blinds exist each hand. Eliminations can let a player skip a blind. [PokerStars moving-button system](https://www.pokerstars.com/help/articles/fwd-moving-button/), [tournament rules 2.4–2.5](https://www.pokerstars.com/poker/tournaments/rules/)
- **Dead button:** WSOP places the big blind with the player due to pay it and positions the small blind/button accordingly; either can occupy an empty seat. [WSOP Live-Action Rules 2026, rule 155](https://assets.wsopcdn.com/wsop/853ee602-e1e9-4019-a0cf-381419d805c6.pdf) TDA uses this convention and adjusts the first heads-up button if needed to avoid consecutive big blinds. Heads-up, the button posts the small blind, receives the last hole card, acts first preflop, and last afterward. [Poker TDA 2026, rules 34 and 36-C](https://www.pokertda.com/view-poker-tda-rules/)

**Recommendation, awaiting confirmation:** use forward-moving button for this casual app. It keeps the displayed button on a player and matches the simple clockwise concept. State the blind-skip consequence rather than promising dead-button fairness. Do not silently combine this with TDA's heads-up transition adjustment. Choose the first button separately; random selection is a reasonable proposed default.

## Run it twice with unequal stacks

Eligibility is about completed betting, not every stack reaching zero. Crown allows one or more all-ins when no further betting will occur, enough cards remain, and all remaining players agree. [Crown Melbourne Poker Rules v18, rule 12.6.1](https://www.crownmelbourne.com.au/getsydmedia/c58f83a1-8d8a-4e4e-97e0-331fc88657dc/crown-melbourne-casino-poker-rules.pdf?ext=.pdf) Partypoker similarly requires no further betting, an undealt river, and consent from everyone still in the hand. [Partypoker Run It Twice, terms 3–5](https://www.partypoker.com/en/poker/run-it-twice)

RWS applies each board's outcome separately to the main pot and every side pot, respecting each pot's eligible players. A tied result splits only the applicable pot portion. [Singapore GRA, RWS No Limit Hold'em v9, rules 4.6.2–4.7.2](https://www.gra.gov.sg/docs/default-source/game-rules/rws/poker-games/rws-game-rules---no-limit-hold%27em-v9.pdf?sfvrsn=305ad0d2_1)

Consent is a house choice. Partypoker runs once if any active player declines. Christchurch permits consenting side-pot players to run their side pot twice even when the main pot runs once. Its first board receives an odd chip when splitting a pot between two boards. [Christchurch Casino Poker Rules, rule 37(3–5)](https://www.christchurchcasino.co.nz/wp-content/uploads/2023/04/PR-Rules-A0-2023.pdf)

**Recommendation, awaiting confirmation:** one unanimous choice for the whole hand; either every pot runs once or every pot runs twice. Apply the existing Board A then Board B procedure from [the dealing research](../../mobile-simulator/research/dealing-rules.md). Keep the existing prototype's whole-chip convention: split each pot between boards first, give its odd chip to A, then split tied board portions clockwise from the button. Confirm the consent interaction and when it becomes binding before dealing resumes.

## Decisions still needed

- Forward-moving or dead-button convention, and initial button selection.
- Run-it-twice inclusion in multiplayer, unanimous consent mechanism, and its timing relative to revealing all-in hands. TDA reveals live hands once an all-in exists and all betting is complete; adopting that automatic reveal remains a multiplayer privacy decision. [Poker TDA 2026, rule 17](https://www.pokertda.com/view-poker-tda-rules/)
- Confirm the proposed whole-chip split convention and exclude per-pot consent for the first version, or specify the more complex alternative.
- Resolve setup, pauses, leaving, recovery, and public/private result presentation in their own decision tickets. These are product choices, not facts this research can decide for the user.

## Effect on the current prototype

The current HTML engine deliberately resets equal stacks. It has a single pot, fixed button, no session progression, no separate hand-wide contribution totals, and no per-player raise-reopening record. Its round-opening shortcut stops when fewer than two players have chips, and its two-run gate demands all remaining stacks be zero. These are valid prototype boundaries, but cannot simply be retained when stacks carry over. Existing card dealing and ranking behavior can remain the reference.

Future checks should cover a returned excess, multiple side pots with folded money, short and cumulative all-in raises, a pending call against all-in opponents, a short blind, each elimination position, heads-up transition, and separate winners/ties for each pot on both boards. No engine change or test run was part of this research.

## Evidence limits

Primary rules were checked on 2026-11-06. TDA's current page identifies its 2026 rules; Crown's opened PDF is version 18, effective February 2026, although one search excerpt showed the older version 17. The GRA PDF remains behind JavaScript verification; its cited payout sections were available through indexed primary-source text. No single casino procedure is treated as universal. No production app, payout implementation, or mobile privacy behavior was validated.
