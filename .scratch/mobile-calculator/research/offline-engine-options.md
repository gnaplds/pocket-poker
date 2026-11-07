# Offline calculation options for Android

Research date: 2026-11-05. Scope: 2–6 known Texas Hold’em hands, no unknown hole cards, no network at runtime. These findings support a decision; they do not select the app stack.

## Recommendation for discussion

Use Kotlin with Jetpack Compose for the Android interface. Start by evaluating exact enumeration at every valid stage, using an existing seven-card evaluator. The strongest researched engine candidate is the upstream C/C++ PH Evaluator, called through a small JNI boundary. Benchmark it on the target phone before promising a latency target or adding Monte Carlo sampling.

This recommendation is an engineering judgment: the user only needs Android, and upstream evaluator reuse avoids owning a new hand-ranking algorithm. Compose is Android’s current recommended UI direction. Native engine integration adds a build toolchain and cancellation work, so it should remain a conscious trade-off. [Android Compose guidance](https://developer.android.com/develop/ui/compose/first), [Android native-code integration](https://developer.android.com/studio/projects/add-native-code)

## Two credible engine paths

| Path | Verified facts | Remaining work and trade-off |
|---|---|---|
| Kotlin/Compose + PH Evaluator C/C++ | Upstream supports seven-card evaluation and publishes algorithm documentation. Its license is Apache-2.0. Its CMake configuration has a standalone `pheval7` target and optional Omaha targets. | Package only the needed evaluator and tables. Add enumeration and result accumulation; the evaluator alone is not an equity calculator. Integrate with NDK/CMake/JNI, preserve upstream notices, pin a revision, and verify an Android build. |
| Kotlin/Compose + Java evaluator from Joker-calc | Its author identifies it as a Java port of PH Evaluator, and its calculator enumerates remaining cards. The repository declares MIT. The Maven configuration targets Java 21 and includes Picocli and Guava. | Kotlin can call Java, but Android compatibility is not established here. Inspect the evaluator separately from the command-line app, its APIs and derived-source notices before reuse. Avoid importing a whole CLI merely to rank cards. |

Sources: [PH Evaluator README](https://github.com/HenryRLee/PokerHandEvaluator), [PH Evaluator license](https://github.com/HenryRLee/PokerHandEvaluator/blob/develop/LICENSE), [PH Evaluator CMake configuration](https://github.com/HenryRLee/PokerHandEvaluator/blob/develop/cpp/CMakeLists.txt), [Joker-calc README](https://github.com/davidruda/joker-calc), [Joker-calc Maven configuration](https://github.com/davidruda/joker-calc/blob/main/pom.xml), [Kotlin Java interoperability](https://kotlinlang.org/docs/android-overview.html).

Android documents packaging compiled C/C++ libraries through Gradle and calling them from Kotlin or Java through JNI. This establishes a supported integration route, not proof that PH Evaluator already builds unchanged on Android. [Android native-code integration](https://developer.android.com/studio/projects/add-native-code)

No cross-platform framework is justified by the current Android-only scope. That is a scope judgment, not a claim that alternatives cannot work.

## Exact enumeration workload

Derived calculation, not a benchmark: with `p` players and `b` board cards, remove all `2p + b` known cards. The number of possible final boards is `C(52 − 2p − b, 5 − b)`. Board order does not affect final showdown strength. This assumes an ordinary 52-card deck and no additional known dead cards.

| Players | Preflop boards | Flop boards | Turn boards | River boards | Preflop evaluator calls |
|---:|---:|---:|---:|---:|---:|
| 2 | 1,712,304 | 990 | 44 | 1 | 3,424,608 |
| 3 | 1,370,754 | 903 | 42 | 1 | 4,112,262 |
| 4 | 1,086,008 | 820 | 40 | 1 | 4,344,032 |
| 5 | 850,668 | 741 | 38 | 1 | 4,253,340 |
| 6 | 658,008 | 666 | 36 | 1 | 3,948,048 |

The last column assumes one seven-card evaluation per player per final board, without caching. Counts were checked with Python’s `math.comb`. More players remove more cards but require more evaluations per board; six-player preflop is not automatically the largest workload.

Exact enumeration gives reproducible results without sampling error. Monte Carlo samples legal board completions and produces estimates; it needs a sampling budget, uncertainty reporting, and tests for unbiased sampling. Recommend considering it only if measured exact preflop latency is unacceptable. A partially completed exhaustive loop must not be presented as an unbiased estimate: its early boards may be systematically unrepresentative.

## Correct result accounting

For each completed board, identify all players with the best hand. For a single equal-eligibility pot:

- A sole winner receives one win and one unit of pot share.
- Each of `k > 1` tied winners receives one tie and `1/k` unit of pot share.
- Divide each player’s accumulated wins, ties, and pot shares by the number of evaluated boards to obtain win probability, tie probability, and equity.

This is a direct derivation from equally sharing the pot among winners. In multiway play, `win + tie / 2` is incorrect whenever a three-way or larger tie is possible. Tie percentages across players need not sum to 100%; equities should sum to 100%, apart from display rounding. Pot sizes, side pots, and unequal eligibility remain a separate scope decision.

## Correctness and responsiveness checks for the later specification

PH Evaluator’s test source compares its ranking against a separate Kev evaluator across all five-, six-, and seven-card combinations. That is useful evidence of upstream test design; this research did not run the suite. The application still needs tests of card encoding, legal boards, enumeration, and result accumulation. [Upstream evaluation tests](https://github.com/HenryRLee/PokerHandEvaluator/blob/develop/cpp/test/evaluation.cc)

Proposed app checks:

1. River: one outright winner; two winners sharing while another loses; and a royal flush on the board shared by all six players.
2. Ranking: ace-low straight, flush kickers, two triplets forming a full house, and board-only best hands.
3. Enumeration: total boards match the table; swapping player order or consistently renaming suits preserves corresponding probabilities; equities sum to one before formatting.
4. Boundary validation: reject duplicate cards and incomplete player hands. Calculate only for valid stage sizes (0, 3, 4, 5 board cards); intermediate card entry should remain editable without reporting a completed-stage result. This is a proposed input contract, not a settled UI decision.
5. Run CPU work off the UI thread. Cancel or supersede calculations when inputs change and prevent stale results from replacing current ones. Android recommends main-safe long-running work and cooperative cancellation; a native loop needs its own cancellation mechanism or bounded chunks. [Android coroutine guidance](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)

## What still needs measurement or a decision

- Target phone, minimum Android version, and acceptable completion time.
- Cold and warm preflop latency for all player counts, especially four players; postflop latency; rapid-edit cancellation; memory use and repeated-run thermal effects.
- Whether the user accepts an exact-result wait or wants estimated results sooner.
- Engine revision, successful Android build, dependency notice review, and the size of any Java adaptation if that route is preferred.

No engine was installed or benchmarked, no app was built, and no license-compliance audit was performed. Upstream desktop benchmarks do not establish Android performance.
