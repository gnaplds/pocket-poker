# Identify a viable offline calculation approach

Parent: [Plan the Android poker calculator](../map.md)
Label: wayfinder:research
Type: research
Status: resolved
Assignee: engine_research
Blocked by:

## Question

Which small, maintainable implementation approaches can calculate win probability, tie probability, and equity offline on Android for 2–6 known Texas Hold’em hands at each stage? Investigate exact enumeration versus sampling, existing evaluators, licenses, integration requirements, tie handling, correctness references, and what performance still needs measurement.

## Context

No app framework has been selected. Prefer established platform capabilities or a reusable evaluator over a new poker evaluation algorithm. Compare only a few credible options using primary sources. A historical Android 12 Redmi Note 9 is a possible test device, not a confirmed requirement.

Write cited findings to `../research/offline-engine-options.md`. Recommend an approach for discussion; do not decide the stack or promise unmeasured latency.

## Answer

[Offline calculation options for Android](../research/offline-engine-options.md) identifies two credible paths: upstream C/C++ PH Evaluator through Android JNI, or a Java port requiring Android compatibility and source-provenance checks. It recommends Kotlin/Compose and evaluating exact enumeration first, subject to target-device measurements. Exact preflop requires roughly 3.4–4.35 million seven-card evaluator calls across the supported player counts; postflop workloads are much smaller. Results must accumulate each tied winner’s actual fractional share rather than treating every tie as two-way.

Research resolved on 2026-11-05. No stack, accuracy contract, or latency promise has been approved. Research remains local under the map’s repository exception; no branch was pushed to the unrelated game remote.
