# Decide whether random-deal practice belongs in version one

Parent: [Plan the Android poker calculator](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: root
Blocked by:

## Question

Should version one include a Deal action that generates known hands for 2–6 players, lets the user reveal flop, turn, and river, and updates the odds after each stage, inspired by the poker.net demo? Alternatively, should this wait for a later version or serve only as a presentation reference?

## Comments

Asked the user on 2026-11-05. Recommendation: include the small practice flow. This does not mean modelling hidden opponent hands, adding betting, or choosing Monte Carlo estimation.

## Answer

The user accepted: “Yes — include this practice flow.” Version one includes a Deal action to generate known hands for 2–6 players, staged flop/turn/river reveal, and updated odds at each stage, alongside manual scenario entry.

Correctness consequence: calculate odds from visible hole cards and the currently revealed board only. Any pre-shuffled but unrevealed future cards must not condition the displayed probabilities. The exact-versus-estimated calculation contract remains unresolved.

Detailed controls and transitions belong in [Validate card entry and result reading on a phone](04-mobile-interaction.md). Resolved on 2026-11-05.
