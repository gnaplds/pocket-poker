# Choose the animation framework and hand evaluator

Parent: [Plan the animated Android poker simulator](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: open
Assignee:
Blocked by: 03, 06

Prerequisite: [Validate the animated table and deck inspection](03-animation-prototype.md).

Additional prerequisite after the scope expansion: [Validate named seats and demo betting](06-demo-betting.md). Include the accepted betting state when choosing the final implementation boundary.

## Question

Which Android framework best supports the agreed card animations and reuses poker.net's C# hand-ranking core with the least adaptation? Define evaluator inputs for flop, turn, and river; category, best-five and tied-winner outputs; validation; and a small independent correctness check. Do not let obsolete equity throughput requirements drive this choice.

## Context

[The existing poker.net assessment](../../mobile-calculator/research/pokernet-fit.md) identified a reusable five-card evaluator and a nine-player river adapter requiring replacement. It did not verify an Android build or correctness.
