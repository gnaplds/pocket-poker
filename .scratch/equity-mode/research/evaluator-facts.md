# Existing evaluator and equity workload

Read-only source inspection, 2026-11-08. No performance benchmark was run.

`Poker.rank` ranks 5–7 cards by comparing five-card subsets: 21 evaluations for a seven-card hand. `Poker.results` accepts 2–8 known hands and a 3/4/5-card board, and returns tied winners. These are ranking functions, not equity calculations. The menu already has a disabled Equity entry. There is no existing worker, equity loop, or manual calculator picker.

With p known hands and b board cards, complete legal boards number C(52 − 2p − b, 5 − b).

| Players | Preflop | Flop | Turn | River |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 1,712,304 | 990 | 44 | 1 |
| 3 | 1,370,754 | 903 | 42 | 1 |
| 4 | 1,086,008 | 820 | 40 | 1 |
| 5 | 850,668 | 741 | 38 | 1 |
| 6 | 658,008 | 666 | 36 | 1 |
| 7 | 501,942 | 595 | 34 | 1 |
| 8 | 376,992 | 528 | 32 | 1 |

Exact preflop with the current ranker requires roughly 63–91 million five-card evaluations. Counts are not timings. The previous poker.net investigation concerned a C# evaluator; it is not used by the current browser app.

For each board, a sole winner gets one win and a pot share of 1. Each of k tied winners gets one tie and a pot share of 1/k. Divide accumulated wins, ties, and shares by the board count. Equity totals 100% before rounding; tie percentages need not. Win + Tie/2 is incorrect for ties among three or more players.

Still unmeasured: phone throughput, worker startup, sample completion time, exact-flop latency, and responsiveness under rapid editing. Tests are not an exhaustive proof of evaluator correctness.
