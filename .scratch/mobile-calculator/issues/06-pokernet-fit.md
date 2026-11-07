# Assess poker.net for the offline Android app

Parent: [Plan the Android poker calculator](../map.md)
Label: wayfinder:research
Type: research
Status: resolved
Assignee: engine_research
Blocked by:

## Question

Can the user-proposed poker.net evaluator be reused for an offline Android app, and which parts of its demo are relevant to the requested calculator? Verify license, actual project dependencies, evaluator interfaces, separation from the web app, tie handling, and whether its simulation deals hands or estimates equity. Identify reuse options without silently selecting a new stack or expanding scope.

## Context

User proposed https://github.com/JBelthoff/poker.net and likes https://poker-calculator.johnbelthoff.com/ on 2026-11-05. The existing Android, offline, known-hand scope stands unless changed explicitly. Record cited findings in `../research/pokernet-fit.md`.

## Answer

[Is poker.net a suitable starting point?](../research/pokernet-fit.md) inspects a pinned source revision and the live demo. Its MIT-licensed C# numeric evaluator can plausibly be isolated for a .NET Android app, but its existing adapter is fixed to nine-player river evaluation. The demo deals a random hand and reveals the board; it does not show or calculate observed win/tie/equity percentages. The planned app still needs variable-player support and board-completion accounting. Source inspection also contradicts the README’s no-lookup-tables claim, so Android correctness and performance require direct checks.

Research resolved on 2026-11-05. Stack selection remains open. The user separately accepted the random-deal feature in [Decide whether random-deal practice belongs in version one](07-practice-scope.md). No app was built or benchmarked; findings remain local.
