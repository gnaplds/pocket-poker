# Pocket Poker prototype

Open [dealing-prototype.html](dealing-prototype.html) in a browser. It is one self-contained file, with no dependencies or outgoing network requests. It now includes the accepted Simulation and the approved Pass & Play extension. Android packaging is deferred. This local branch adds Equity mode and refreshes Simulation; these changes have not been published.

For a stable browser origin and local saves, run from the repository root:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory prototypes
```

Then open `http://127.0.0.1:8765/dealing-prototype.html` on that computer. A phone cannot reach another computer through `127.0.0.1`; opening the standalone HTML on the phone works without a server, but saved-game support for local files depends on the browser. The eventual Android app remains separate work.

## Pass & Play

1. Choose **Play → Pass & Play**. Enter 2–8 names in clockwise order, starting at the bottom seat. Choose hold-to-peek or the optional tap reveal method. Hand guidance defaults to On for everyone; turn it off in setup for an unassisted game.
2. Each player starts with 20 play chips. Blinds are 1/2, and the first button is random. The app shuffles and deals hole cards face down.
3. At **Pass to…**, hand the phone to that player. **I'm ready** leaves the cards face down. Hold Peek to view them, or use Reveal/Hide in tap mode. With guidance on, Peek also explains your current hand, highlights the cards that make it, and shows one-card straight/flush draws with their missing ranks or suit. Everything private hides together.
4. Check, call, bet/raise, go all-in, or fold. The Min–Max slider moves one chip at a time. Its amount includes chips already committed on the current street. The wide action says All-in and turns gold at Max. Every action—including Check—opens a confirmation dialog with the exact chip amount or action. Cards and guidance hide immediately; Go back changes nothing, while Confirm commits once. Leaving the app cancels a pending confirmation and requires a fresh handoff.
5. After betting, the table pauses before dealing. When everyone is ready, tap **Deal the flop**, **Deal the turn**, or **Deal the river**. Cards then move one at a time at 850 ms each. Pause on the shared board, then use **Next turn**. Once all owed decisions finish and no further betting is possible against all-in opponents, non-folded hole cards become public at their fixed seats. This includes a covering player with chips left, but excludes situations where other players can still bet a side pot. Each remaining player gets a named runout vote; public cards remain visible, while Peek guidance stays private. One Run once ends the vote; unanimous Run twice uses two boards and applies to every pot. After voting, there is another shared readiness pause before dealing.
6. For normal private hands, tap **Showdown** after river betting when everyone is ready. Public all-in hands show each player’s current category at completed streets and the winners beside each completed board. They finish automatically after the last required river, paying all pots together; there is no all-in Showdown pause. At showdown, see non-folded hands, best-five rankings, main/side-pot winners, ties, and returned excess. Guidance adds made-hand explanations for each revealed hand and board. Folded cards remain private. A fold win pays immediately and reveals no hands. Each revealed player has an independently collapsible result section containing their board results. An animated winner popup lists all chip recipients and amounts once per completed hand, including ties and fold wins. Continue closes it without starting the next hand. Confetti accompanies it. Reduced motion keeps the popup static and disables confetti. Completed-hand recovery does not replay the popup.
7. **Next hand** carries stacks forward and advances tournament-style blinds. Eliminated seats stay in place. The game ends when one player has all the chips.

Betting history is always visible in Preflop, Flop, Turn, and River sections. Blinds appear under Preflop. Reached streets with no actions say No betting; separate runout streets have A/B labels.

Seats show the last confirmed decision: blue Bet/Raise, green Call while it matches the current bet, faded red Fold, gold All-in, and neutral Check. A later raise removes earlier callers’ green until they match again. Ordinary action labels/colors reset as the next street starts; Fold and All-in remain. A separate purple outline marks the acting player.

There is one local saved game. **Save & leave** keeps it; **Resume game** restores it with private cards hidden; cards already exposed by an all-in reveal remain public. Normal pending Showdown remains unpaid, and completed older saves remain completed. Old public all-in hands waiting for Showdown now settle automatically on recovery, once only. Starting another game asks before replacing the save. Clearing browser storage removes it; nothing is backed up to a server. Use one active tab for the game.

Guidance uses only your hole cards and the revealed board. Preflop describes the starting hand; full-hand explanations start on the flop. Draws appear only on flop/turn and only for stronger, not-yet-made straight or flush categories. No odds, betting advice, backdoor draws, or higher-straight/flush/straight-flush upgrade guidance is included. The setting is saved with the game; older saves default to On. Turning it off preserves the original showdown results.

The public UI omits hidden identities from cards, animations, logs, accessible labels, and rankings. Backgrounding or losing focus conceals private cards and guidance; public all-in cards remain visible. This supports normal play among people sharing a device; it does not authenticate the person holding it or protect against inspecting application data.

## Simulation

Choose **Play → Simulation**, then **Deal Hole Cards**. Control all players directly; their cards remain visible. Use the one-chip Min–Max slider and confirm each betting decision. Once a round ends, choose **Deal Flop/Turn/River**. The table scrolls into view before cards move, and every street pauses, including two-runout hands.

Each seat shows cards, category, action, and Hand equity. Player sections below add Win/Tie and best-five cards. Calculations ignore future deck order, exclude all dealt hands and burns, and remove folded players from competition. A/B odds also exclude revealed non-shared cards on the other board. They compare a hypothetical equal pot, not actual chip returns. Preflop samples 20,000 boards; postflop enumerates all remaining boards. Cancel hides unfinished results; Calculate again retries. Play remains available while calculating.

Every new deal resets to equal 20-chip stacks, 1/2 blinds, and the button at Seat 1. Replay uses the original deck unchanged. Replacing an unfinished deal asks for confirmation. New Deal/Replay prepare the deck and wait for Deal Hole Cards. Simulation persists only across mode changes during the current visit; reload starts fresh.

Study Tools contains Next Card, Play/Pause, speed, Replay, deck order, burns, deal records, and guided examples. Disable Demo betting for deal-only practice. Run It Twice is chosen directly at a legal stage pause; betting mode first requires all owed decisions to finish with no further betting possible. There are no votes or private handoffs.

Normal river betting, final all-in runouts, and fold wins finish automatically. Completed-board winners stay visible beside A/B; all pots pay once when the hand finishes. Winner popup, confetti, and seat glow respect reduced motion. History stays open and groups actions by street and board.

## Validation

Run from the repository root:

```sh
node --test --test-isolation=none prototypes/dealing-prototype.test.cjs prototypes/dealing-prototype.ui.test.cjs prototypes/equity-prototype.test.cjs
```

59 tests pass: 47 public-behavior tests cover dealing/ranking, betting and side pots, continuing games, private views, recovery, and hand guidance. Guidance checks cover all categories, defining cards and kickers, board-only hands, simultaneous draws, ace boundaries, overlapping straight patterns, hidden-card independence, old-save compatibility, voting, folded hands, and two-board showdown. Twelve DOM/animation-boundary tests check Simulation cancellation and Peek event wiring, including pointer release/cancel/lost capture, keyboard release, focus/background/navigation, tap reveal, and guidance off, confirmation/cancellation and single action commits for every betting action, collapsible player results, and one celebration per hand. A state test verifies readiness before flop, turn, and river, including recovery during the pause. These boundary doubles do not establish browser rendering or physical touch behavior. All four inline scripts pass syntax checks.

Browser checks exercised setup, six-seat portrait layout, private tap reveal, concealment on action, reload/resume, unanimous voting, both runouts, payouts, a new heads-up hand after elimination, normal betting through the river, and keyboard release of hold-to-peek. No browser JavaScript errors appeared in those flows. These are desktop browser checks, not physical Android touch or screen-reader validation.

The revised six-seat layout had no overlapping seats or horizontal overflow at an observed 366-pixel viewport width. The in-page replacement dialog was checked for both cancellation and starting a new game. The final Simulation interruption fix was verified with its boundary test. The local preview previously returned HTTP 200 and exactly matched the delivered file.

The guidance extension was checked in the browser on 2026-11-06: default-on setup, tap reveal/hide, concealment on action, saved-game resume with a fresh handoff, preflop descriptions, flop/turn explanations, two-pair highlights and kicker labels, and public showdown explanations. There was no horizontal overflow at an observed 375-pixel viewport width, and the tested flow produced no browser JavaScript errors. Tests ran at the separate `localhost` origin to preserve the user's `127.0.0.1` saved game. Physical Android hold/scroll behavior and a real screen reader remain unchecked. The draw rows and hold/cancellation event paths are covered by boundary tests; they were not all exercised live in this browser pass. See the [portrait screenshot](../.scratch/pass-and-play/peek-guidance-preview.jpg).

The evaluator remains the small JavaScript reference implementation, not poker.net. Shuffling uses browser crypto randomness. Tests do not exhaustively enumerate every hand or betting sequence. This is a local behavior prototype, not a production or real-money app.

## Design record

The user approved the [Pass & Play specification](../.scratch/pass-and-play/spec.md) and explicitly requested implementation on 2026-11-06. The [decision map](../.scratch/pass-and-play/map.md) retains the interview and rules research. The new multiplayer interaction still needs the user's hands-on review.

Betting rules: [Poker TDA](https://www.pokertda.com/view-poker-tda-rules/), [short opening all-ins](https://www.pokertda.com/forum/index.php?topic=842.0), and the [local rules research](../.scratch/pass-and-play/research/continuing-game-rules.md).

The user approved the [private hand guidance plan](../.scratch/pass-and-play/peek-guidance-plan.md), including all thirteen decisions, and authorized implementation on 2026-11-06. It is implemented in this prototype; hands-on feedback remains welcome.

## Interface update — 2026-11-06

The app is now named **Pocket Poker**. Fold is red, Bet/Raise royal blue, All-in gold, and Pause turn gray. Simulation keeps its speed selector with a slower 850 ms base card flight. Pass & Play adds the pre-deal readiness pauses, collapsible results, confetti, and confirmation for all betting actions requested in this update. The local-save key is unchanged so existing games remain available.

Browser checks verified old-save recovery, collapsing each player independently, the slower deal, Call cancellation with unchanged stacks, Check confirmation, the preflop-to-flop readiness pause, All-in confirmation, and a confirmed fold win with 48 confetti elements. No browser animation timing or physical-device calibration is claimed from the DOM checks. The action panel and confirmation fit an observed 389-pixel viewport without horizontal overflow. See the [confirmation preview](../.scratch/pass-and-play/action-confirmation-preview.jpg).

## Whole-chip slider, Showdown, and public actions — 2026-11-06

The user approved the [complete revision plan](../.scratch/pass-and-play/showdown-and-actions-plan.md). This replaces the previous five pot presets with Min–Max whole-chip selection. New turns start at Min; cancellation preserves selection. A short stack can have one legal all-in amount, with the slider disabled and the action available. If raising is forbidden, Call remains available when owed.

Tests cover exact selection and confirmation, single-amount raises, unavailable raises, manual Showdown and repeat-action rejection, both runouts, side-pot reveal boundaries, covering stacks, fold wins, public-card recovery, private voting guidance, old completed saves, and seat action transitions. Public cards use larger card faces and extra table height. No dependencies were added. Simulation retains its existing completion behavior.

All 52 tests and all four inline-script syntax checks pass. Local browser control is disabled in Work settings, so live layout, keyboard slider operation, six-seat public-card readability, and physical-phone touch behavior for this revision remain unchecked. Earlier screenshots show earlier controls. The DOM tests verify event wiring and generated content, not rendering.

The local preview HTTP check was blocked by the execution sandbox (`Operation not permitted`), so this pass does not confirm the running server response. The updated HTML file and automated tests are saved locally.

## Live runout results and winner popup — 2026-11-07

The user approved the [live runout plan](../.scratch/pass-and-play/live-runout-results-plan.md). This supersedes the previous all-in Showdown pause and hidden public categories. Once cards are public, seats show current best-five categories after each complete street, labelled A/B for two boards. Basic categories remain visible with optional guidance off; public draw explanations are not added. A completed board shows main/side-pot winners and ties beside its cards while the other board can remain pending. All pots are paid together when the final river lands. Normal private hands keep manual Showdown; fold wins remain immediate.

The winner popup uses a native dialog, Continue to dismiss, and a short CSS entrance animation. Reduced motion disables that animation. Every recipient is named, including tied or different side-pot winners. It does not automatically deal a new hand, and does not replay when resuming a completed hand. Betting history groups confirmed actions by street and labels reached no-action streets No betting. Save replay rebuilds history and results, including old saves. The shared pot calculation supplies both board results and final awards; early board results do not mutate stacks.

All 57 automated tests pass, and all four inline scripts parse. New checks cover automatic all-in completion/recovery, old pending all-in saves, side-pot winners before final payment, complete-street categories with guidance off, normal-hand result privacy, street history, popup dismissal, ties, fold wins, and completed-hand recovery.

Live browser checks on 2026-11-07 exercised a six-player, 120-chip all-in hand with unanimous two-run voting, per-street categories, Board A's early winner with unpaid stacks, automatic final settlement, the popup, grouped history, and reload/resume without a repeated popup. No browser errors were logged. At the observed 375-pixel page width there was no horizontal overflow or seat overlap with both category labels. Keyboard End selected the slider maximum correctly. Tests used localhost so the user's 127.0.0.1 save was untouched. The local preview server was restarted on port 8765.

See the [winner popup](../.scratch/pass-and-play/winner-popup-preview.png) and [board results](../.scratch/pass-and-play/live-runout-preview.png). Physical Android touch, screen-reader behavior, and live reduced-motion rendering remain unchecked. Reduced motion is handled by CSS; event tests do not validate its appearance.

### Eight-player tables

Simulation and Pass & Play support 2–8 players. Seven- and eight-player tables use fixed clockwise seats with extra vertical space for public cards and two-board rankings. Existing saved games remain compatible.

## Equity prototype — 2026-11-08

Local branch: `codex/equity-prototype`. This implements the [approved plan](../.scratch/equity-mode/spec.md). Choose Play → Equity to enter 2–8 known hands and a 0/3/4/5-card board. Results appear beside the cards; current categories appear from the flop and exact winner labels on the river.

Preflop uses 20,000 unbiased samples, with provisional percentages marked Estimated. Postflop results are Exact and appear only after enumeration finishes. Equity includes fractional pot shares for multiway ties; Win is an outright win, while Tie means sharing a win. A 100% tie rate is not 100% equity. Percentages use one decimal place and estimated values carry an approximate marker.

Try these manual review cases:

1. Choose River, enter Player 1 A♠ A♦ and Player 2 K♠ K♦, then board 2♣ 3♥ 7♦ 9♠ J♣. Player 1 has 100% exact equity.
2. Replace the board with A♣ K♣ Q♣ J♣ 10♣. Each player has 50% equity, 0% Win, 100% Tie, and a tied-winner label.
3. Choose Preflop and confirm removal of board cards. Watch estimated results and sample progress. Cancel, then Calculate again. Edit a hole card while work runs: old results must disappear.
4. Switch modes and return: entered cards remain. Reload: calculator inputs reset, while the separate multiplayer save remains intact.

Validation: all 70 tests pass (47 engine/session, 18 UI boundary, 5 equity calculation). The generated worker source also executes against the real evaluator in a VM boundary test. All five inline scripts parse. A local HTTP check returns 200 and the served HTML matches the working file. Measured on this machine: roughly 2.3 seconds for two-player preflop sampling, 8.8 seconds for eight players, and 0.18 seconds for the exact two-player flop test including other assertions. These are Node measurements, not browser or phone benchmarks.

Browser control was disabled in Work settings for this pass. Live worker startup, card-picker focus/scroll, phone layout, physical touch speed, screen-reader behavior, and Netlify deployment remain unverified. There are no new runtime dependencies or server requests. The branch is local and has not been pushed.


## Simulation refresh validation — 2026-11-08

Local branch: `codex/simulation-refresh`. All 82 tests pass: 47 engine/session, 28 UI-boundary, and 7 equity tests. Added checks cover dead cards, shared-prefix boards, fold wins, street pauses, slider confirmations, cancellation/error recovery, replay, partial-flop controls, and multiplayer-save isolation.

The in-app browser completed real worker calculations, preflop betting, and an eight-player two-board all-in hand with automatic payouts. At an observed 401 CSS-pixel viewport, 2/6/7/8-player layouts had no seat overlaps; the measured two-board eight-seat table was about 604 pixels high with both categories visible. Two/six-seat preflop tables were about 396 pixels and seven-seat preflop about 479 pixels. These are content-dependent observations, not fixed heights or phone performance guarantees. A sticky-scroll defect found in the browser was fixed by scrolling to an anchor above the board.

Physical Android speed/touch use and screen-reader behavior still require testing. No GitHub push or deployment was made. Earlier validation sections above describe earlier passes.
