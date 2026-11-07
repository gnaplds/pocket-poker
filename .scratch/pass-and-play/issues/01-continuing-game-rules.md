# Verify rules for continuing stacks and two runouts

Parent: [Plan private pass-and-play poker](../map.md)
Label: wayfinder:research
Type: research
Status: resolved
Assignee: pass_play_audit
Blocked by:

## Question

Which rules must replace the equal-stack demo assumptions when chips carry between hands? Verify side pots, uncalled chips, short all-ins and reopening, pending calls when only one player retains chips, button/blind movement after elimination and transition to heads-up, and run-it-twice eligibility with unequal stacks. Identify conventions that require a product choice rather than pretending all rule sets agree.

## Comments

Confirmed scope: 2–6 players start at 20 chips, fixed 1/2 blinds, stacks carry over, button rotates, zero-chip players sit out, game ends with one player holding all chips. Use primary poker rules and existing local research; cite findings in one local research note. Do not implement an engine or publish to the unrelated remote.

## Answer

Research completed on 2026-11-06 in [Continuing stacks and two runouts](../research/continuing-game-rules.md), with primary-source citations and explicit evidence limits.

Continuing stacks require hand-wide contribution accounting, side pots, uncalled-chip returns, and per-player raise-reopening rights. An opponent with chips remaining may still owe a call; a covering stack does not itself prevent two runouts once betting is finished. Each pot must be evaluated separately on each board.

Forward-moving and dead-button procedures are both documented conventions with different elimination behavior. Run-it-twice consent can apply to the whole hand or individual side pots depending on the house. The note recommends simple forward-moving button and unanimous whole-hand consent, but leaves these choices, initial button selection, reveal timing, and odd-chip policy for user confirmation. Resolving this research ticket does not approve those recommendations or authorize implementation.
