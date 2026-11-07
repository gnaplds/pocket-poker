# Pass-and-play poker: review draft

Status: approved by the user on 2026-11-06; browser prototype implementation explicitly authorized.
Updated: 2026-11-06.

## Purpose and boundary

Extend the accepted browser prototype into a game for 2–6 people sharing one phone. Use small play-chip stacks and real betting rules. Validate the phone handoff and full game before packaging an offline Android app.

The starting prototype dealt cards, ranked hands, and supported equal-stack demo betting. The approved extension adds private turns, continuing games, rotating blinds, side pots, and saved-game recovery. Current delivery and verification details are in the [prototype README](../../prototypes/README.md).

The [decision map](map.md) indexes the work. Detailed interview answers remain in the linked decision tickets; this draft is the reviewable build handoff, not a separate decision log.

## Agreed screen flow

Opening → Play → Choose mode → Setup → Multiplayer table → Hand result → Next hand → Game winner.

The opening screen centers a temporary logo and game name above Play. Mode selection offers:

- **Simulation:** the existing visible-card study tool, including its deck inspection and dealing controls.
- **Pass & Play:** the private shared-phone game described here.
- **Equity — Coming later:** a clearly unavailable future mode for choosing cards and calculating odds. No equity logic is part of this build.

Setup chooses 2–6 seats, names in clockwise order, and the card reveal method. Players start with 20 chips each; blinds stay at 1/2. The first dealer is random. The group stays fixed: no joining or rebuys during the game.

## Table and seating

Design for portrait use first. Keep community cards at the top; when running twice, stack Board A above Board B. Place compact player seats around an oval below them, with the current player's private cards and actions in a separate area at the bottom.

Seat order is clockwise and stays fixed while the device moves between people. Highlight the player who must act. Show names, position labels, stacks, public bets, folded/all-in status, the button, and pot amounts. A player's position label changes with the button; their seat does not move. Busting does not rearrange the other seats.

Use this clockwise arrangement in Simulation too, retaining its existing controls and information access. Do not expose those information controls inside an active multiplayer game.

## One private turn

1. The board stays public. The phone displays **Pass to Alex** with all hole cards concealed.
2. Alex taps **I'm ready**. Alex's two cards remain face down.
3. With the default method, Alex holds **Peek** to see those cards and, when enabled, private [hand guidance](peek-guidance-plan.md); release conceals both. The setup alternative uses **Reveal cards** and **Hide cards**.
4. Alex checks, calls, bets/raises, goes all-in, or folds. Offer only legal actions and show the amount owed. “Raise to” means the total commitment for the current street.
5. Committing the action conceals private cards before moving to the next state. A later turn always requires a new handoff and reveal.

Conceal on pointer cancellation, leaving the turn, focus loss, app backgrounding, or resumption. An action is committed once even if the control receives a repeated tap. Keyboard and assistive activation must support the chosen reveal method. Hidden identities must not remain in accessible labels, status announcements, tooltips, or a visually hidden results panel.

This is a game between people sharing a device, without identity verification. The handoff prevents ordinary accidental exposure; it does not stop someone claiming another player's turn or inspecting the application's internal data.

## Public dealing and results

Deal hole cards and burns face down. Keep deck order, burn identities, other players' cards, and all hand rankings private during play. Preserve the one-deck, one-card-at-a-time animation and existing burn/deal convention.

After a normal betting round, automatically deal the next street, then pause on the public board. **Next turn** starts the next private handoff. Multiplayer has no simulator-style per-card stepping.

If no more betting is possible, settle runout consent before dealing another street. Public pauses during this sequence use **Continue runout**, since there is no next betting player. Complete A before B, retaining the already-shared board prefix.

At showdown, after all selected boards are complete, reveal only non-folded hands. Show each revealed player's hand category and best five cards for each board, tied winners where applicable, and who receives each pot. Folded hands remain hidden. If everyone but one player folds, award the pot without revealing any hole cards.

## Continuing chips and betting

Carry stacks to the next hand. Use standard no-limit betting with fixed 1/2 blinds: correct action order, minimum bets/raises, calls, folds, and short all-ins. A player who already acted cannot raise again after a short all-in unless the applicable full-raise threshold has been met. Several short all-ins can cumulatively reopen action. Do not discard an outstanding call just because only one player still has chips behind.

Return unmatched excess to its owner. Track each player's contribution over the whole hand and award main and side pots only to eligible, non-folded players. Folded contributions stay in their pots. A smaller stack cannot win chips it did not cover.

Example: contributions of 5, 12, and 20 return 8 to the last player. The main pot contains 15 for all three players; a separate 14-chip side pot is available only to the two larger contributors. This must work even if different players win the two pots.

Use tournament-style dead-button movement after elimination. The next big blind and button follow that convention, including the special transition to heads-up; do not merely move the button to the next remaining player. Heads-up, the button is the small blind and acts first preflop, while the big blind acts first after the flop. Verify elimination at each relevant seat, including a hand with an empty button or small-blind position.

Zero-chip players sit out. End the game when one player owns all chips. No rake, blind increases, joining, or rebuys are included. The normative rule references and convention differences are in [the rules research](research/continuing-game-rules.md); the user's chosen convention overrides that note's unaccepted forward-moving-button recommendation.

## Run it twice

Offer the choice only when at least two non-folded players remain, every owed decision is complete, no further betting is possible, and at least one community street remains. A player covering a smaller all-in stack may retain chips.

Ask before consuming another street. Every remaining player must agree; one refusal means run once. One choice governs the whole hand and all side pots. Keep cards private until showdown. Use the same hole cards and one deck; cards already on the board are shared between the two runouts.

Evaluate every pot separately on each board. Retain the simulation's whole-chip convention: divide each pot between the two boards first, giving its odd chip to A; divide tied board portions among eligible winners, assigning any odd chips clockwise from the button. Never include returned unmatched chips in a contested pot.

## Save and resume

Save locally after each committed betting action and deal transition. Preserve the current deck, cards, stacks, contributions, folds, turn and raise rights, button/blinds, street, runout selection/consent, and payout state. Save enough state to continue the same game, not generate a replacement hand.

Reopening always starts with cards concealed. Resume the appropriate public state or a fresh private handoff. Do not restore an open Peek, reshuffle, charge a bet again, or pay a pot twice. Interrupted visual animation must not change the committed game state.

Simulation must use a separate game state. It cannot inspect or replay the multiplayer deck. Switching modes cannot silently discard a saved multiplayer game.

## Defaults approved at final confirmation

The user approved these defaults with the full plan and requested implementation:

- Use **Pocket Table** with a simple card symbol as the temporary opening identity.
- Show a public hand summary and **Next hand** after settlement. Do not start the next hand automatically. At the end of the game show the winner and **New game**.
- Store one active multiplayer game on the device. Offer **Resume game**, **Save & leave**, and **New game**. Confirm before a new game replaces an unfinished one. Report a save failure rather than silently claiming the game was saved.
- Collect run-it-twice answers through named handoffs, clockwise from the first non-folded seat left of the button. Permit the voting player to peek at their own cards. Once someone chooses Run once, stop voting and proceed with one runout; unanimous Run twice commits two. Save that choice before dealing.
- Use readable controls and card symbols in narrow portrait viewports. Permit vertical scrolling on shorter screens instead of shrinking touch targets. Use reduced motion when requested by the device. A specific Android phone test follows browser validation.

## Acceptance checks before calling the prototype ready

| Area | Observable check |
| --- | --- |
| Modes | Opening and setup work; Simulation retains its study tools; equity is clearly unavailable. |
| Seats | For 2–6 players, visual clockwise order matches dealing and betting order. Player seats remain fixed after elimination. |
| Handoffs | A newly acknowledged turn still has face-down cards. Only that player's cards can be revealed. Both reveal methods conceal on actions and interruptions. |
| Privacy | Inspect animations, deck controls, results, logs, labels, tooltips, and announcements. None disclose concealed cards. Switching to Simulation cannot access the multiplayer hand. |
| Betting | Cover heads-up and multiway action order, short blinds, normal/short/cumulative all-in raises, legal calls, and folds. Illegal actions cannot advance play. |
| Pots | Cover unequal stacks, returned excess, folded money, main/side pots with different winners, ties, and odd chips. Total chips remain constant. |
| Runouts | Cover branches before flop, after flop, and after turn; unanimous/declined consent; covering stacks; shared prefixes; separate side-pot winners on each board. Conserve 52 unique cards. |
| Results | Do not declare winners before outstanding betting finishes. Show all eligible tied winners. A fold win exposes no hole cards. Pay each pot once. |
| Next hand | Preserve stacks, advance blinds correctly after each elimination case, handle heads-up, and finish when one player holds all chips. |
| Recovery | Reload during a private turn, public pause, consent, animation, and settlement. Resume concealed without changing the deck, repeating an action, or duplicating a payout. |
| Phone use | Inspect portrait layouts with 2 and 6 seats, one and two boards, longer names, keyboard/assistive controls, and reduced motion. Check touch behavior on an actual phone before Android packaging. |

Use the existing dealing/ranking tests as regressions, and add focused behavior tests for unequal stacks, session progression, privacy projection, and recovery as those features are built. Browser interaction and visual inspection are separate checks; passing engine tests does not establish handoff privacy or readable layout.

## Implementation order after approval

1. Extend and test the existing game rules for continuing stacks, side pots, button/blind movement, and saved state.
2. Add opening/setup and the public/private turn flow, including both reveal methods and interruption handling.
3. Apply the clockwise layout to both modes and connect animation, runout consent, results, and next-hand controls.
4. Validate the complete browser experience against the acceptance checks, then review it with the user before Android packaging.

Keep the existing evaluator and dealing behavior where they remain correct. Do not add a server, account system, AI opponents, equity engine, or new Android framework to this prototype extension.

## Approved interface revision — 2026-11-06

The user renamed the app **Pocket Poker** and requested red Fold, royal-blue Bet/Raise, gold All-in, and gray Pause turn controls. All betting actions, including Check, now require confirmation with cards concealed before a decision commits. Cancelling preserves the hand and stacks; interruptions discard the unconfirmed choice.

This revision supersedes automatic dealing immediately after a betting round: the table first waits for shared readiness, then deals the requested flop, turn, or river at 850 ms per card. Runout voting also ends in a readiness pause. Existing public pauses after each street remain. Results group each revealed player in an expandable section, with both boards inside that section when needed. A brief confetti celebration runs once on hand completion and respects reduced motion.

## Approved preset slider revision — 2026-11-06

The user chose five preset stops (Min, ½ pot, ¾ pot, Pot, All-in) and pot sizing after covering the call. Replace the multiplayer number spinner and separate All-in action with a range input and a full-width combined Bet/Raise/All-in button. Preserve confirmation for every action. The button becomes gold whenever the selected target equals the full stack; otherwise it is royal blue. Round fractions to the nearest whole chip, clamp to legal limits, and display the actual amount even where stops coincide. Start each private turn at Min. Existing saved games need no migration because slider selection is temporary UI state.

## Approved Showdown and public actions revision — 2026-11-06

The user approved [the full revision](showdown-and-actions-plan.md) and requested implementation. It supersedes the preset slider and private all-in runout rules above. Use a Min–Max slider in one-chip steps, with the existing combined action and confirmation. After river betting or both runouts, wait for Showdown before revealing normal hands, publishing rankings, paying pots, or celebrating. Fold-only wins remain immediate and concealed.

Expose non-folded hole cards once all owed decisions finish and no further betting is possible against all-in players, including a covering stack. Keep them visible through named votes, readiness pauses, dealing, and recovery. Public explanations still wait for Showdown. Show confirmed actions at fixed seats: blue bets/raises, green matched calls, faded red folds, gold all-ins, and neutral checks. Reset ordinary actions on the next street; retain folds/all-ins.

Implemented and covered by automated tests. Live browser control is unavailable; physical-device and updated layout checks remain. Simulation completion and existing saved games are preserved.

## Approved live runout revision — 2026-11-07

The user accepted all recommendations in [the live runout plan](live-runout-results-plan.md) and authorized implementation. This supersedes the previous all-in Showdown pause and hidden public categories. Public all-in hands display categories at each completed street, with A/B labels. Completed boards display main/side-pot winners and ties immediately; all pots are paid together after the final board. Normal private hands keep manual Showdown and fold wins remain immediate.

One animated popup lists every chip recipient at hand completion, with Continue to dismiss and reduced-motion support. It does not start the next hand or replay after completed-hand recovery. Betting history is grouped by street, with blinds under Preflop and reached no-action streets labelled No betting. Two-run streets use A/B where they differ.
