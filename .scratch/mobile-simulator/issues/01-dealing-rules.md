# Establish the dealing and two-runout procedure

Parent: [Plan the animated Android poker simulator](../map.md)
Label: wayfinder:research
Type: research
Status: resolved
Assignee: reference_research
Blocked by:

## Question

Which documented Texas Hold’em procedure should this teaching simulator follow for hole-card order, heads-up dealing, burns, and running the remaining board twice before the flop, after the flop, or after the turn? Use primary operator or regulatory sources. Identify house-rule variations rather than claiming a universal burn procedure. Recommend one consistent convention, confirm card counts for 2–6 players, and distinguish shared board cards from newly drawn cards.

## Context

This is observer-only dealing, without betting. One 52-card deck and the same player hands serve both runs. Record cited findings in `../research/dealing-rules.md`. Source candidates include PokerStars' dealing guide and Singapore GRA's Resorts World Sentosa No Limit Hold'em rules. Do not implement code or publish to the unrelated workspace remote.

## Answer

See [Dealing and two-runout procedure](../research/dealing-rules.md) for source facts, house-rule differences, a proposed consistent convention, and checked card counts.

Recommend two clockwise hole-card passes starting left of the button, including big-blind-first heads-up dealing. Use one deck continuously, complete Board A before Board B, and burn before each newly dealt flop, turn, and river. Keep the already-dealt flop or flop-and-turn as a shared prefix. With six players, total consumption is 28 cards for two preflop runs, 24 when branching after the flop, and 22 after the turn.

Resolved the research question on 2026-11-05. User acceptance of this procedure remains a decision for the interaction ticket. The GRA source was checked through indexed primary-source text because direct PDF access returned a verification page; this limitation and BCLC’s ambiguous preflop wording are recorded in the findings.
