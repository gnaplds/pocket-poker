# Choose the calculation contract and Android stack

Parent: [Plan the Android poker calculator](../map.md)
Label: wayfinder:grilling
Type: grilling
Status: resolved
Assignee:
Blocked by: 02, 06

Prerequisite: [Identify a viable offline calculation approach](02-offline-engine-options.md).

Additional prerequisite: [Assess poker.net for the offline Android app](06-pokernet-fit.md), following the user's evaluator suggestion.

## Question

Scope closure on 2026-11-05: superseded by [the simulator map](../../mobile-simulator/map.md). The user removed odds/equity calculations. This ticket is closed without selecting a calculation contract or stack. The original question follows for historical context.

Which Android stack and evaluator should the first release use, and what accuracy, latency, cancellation, and result-label requirements will it guarantee? Decide whether results must be exact at every stage or may use clearly labelled estimates. Set correctness checks for outright wins and two-way or multiway ties, and agree how incomplete inputs and stale calculations behave.

Evaluate the user's poker.net suggestion first: preserving its C# core makes .NET for Android a practical candidate. Compare that reuse cost with the earlier PH Evaluator approach; the framework remains undecided. The accepted practice-deal feature does not itself imply Monte Carlo estimates. Odds must depend only on revealed information, even if a full deck has already been shuffled.
