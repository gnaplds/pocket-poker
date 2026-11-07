# Private hand guidance during Peek

Status: Q1–Q14 approved on 2026-11-06. Implemented in the browser prototype; awaiting user hands-on feedback.

## Requested outcome

While viewing their own cards, a player can understand their current hand and possible draws. Explain why a hand qualifies, highlight the relevant cards, and explain what a draw still needs. Preserve the shared-phone game's privacy.

The user requested planning and alignment before code changes. The user subsequently approved the full review draft and explicitly authorized the build. This document extends the existing multiplayer specification.

## Decision tree

- Visibility and privacy
  - Agreed Q1: guidance visible only with Peek, for both reveal methods; conceal it on release, Hide Cards, handoff, or interruption.
  - Agreed Q7–Q8: own cards and revealed board only; include voting Peek and eligible showdown hands. Explain each completed board separately at a two-runout showdown.
- Meaning of guidance
  - Agreed Q2: separate “You have” from “You could make.” A completed draw does not guarantee winning.
  - Agreed Q5–Q7: one-card straight and flush draws; starting-hand text preflop; no draws on the river; explicitly explain board-only best hands.
- Availability
  - Agreed Q3: enabled for everyone by default, with one setup switch.
  - Agreed Q8–Q9: leave Simulation unchanged; save the switch, with older saves defaulting to on. Resume conceals guidance until Peek.
- Presentation
  - Agreed Q4: private best-five display, category cards emphasized, short explanation; identify remaining kickers.
  - Agreed Q11–Q12: separate supporting-card rows for draws, labels and borders as well as color, fully expanded readable guidance with scrolling when needed.
  - Agreed Q13: the switch controls all new explanations, including showdown; existing results remain available.
- Acceptance
  - Review examples and acceptance checks below; final user confirmation received in Q14.

## Current terminology

The glossary distinguishes a **hand category** (such as two pair) from a **card rank** (such as queen). Agreed terms **hand guidance** and **draw** are now recorded there.

## Agreed boundaries

- Explanations use only the peeking player's hole cards and the relevant revealed board.
- Guidance does not reveal opponents' cards, burn cards, or deck order.
- A possible improvement is not a promise of winning.
- No odds calculation or betting advice is implied by this request.

## Round two — approved

- Q5: Show all one-card straight and flush draws, including open-ended, gutshot, and double-gutshot straights. Defer backdoor draws and other improvement lists.
- Q6: Give a starting-hand description preflop; evaluate full hands from the flop; no draw guidance on the river.
- Q7: Use only the player's hole cards and the revealed board, without odds or opponent comparisons. Explain board-only best hands explicitly.
- Q8: Include voting Peek and made-hand explanations for eligible showdown hands; leave Simulation unchanged in this pass.
- Q9: Persist the game-wide switch, default older saves to on, and keep all private guidance concealed on resume.

## Round three — approved

- Q10: Only describe a draw toward a stronger, not-yet-made category: straight draws below a straight, flush draws below a flush. Defer higher-straight, higher-flush, and straight-flush upgrade guidance.
- Q11: Separate draw-support cards from the best-five hand display, with missing ranks or suit in text. Use borders and labels as well as color; distinguish hole cards from community cards. Multiple draws may share cards.
- Q12: Use a compact, always-expanded explanation during Peek, without further taps. Preserve readable text and allow scrolling on short screens; the existing tap-to-reveal option supports longer reading.
- Q13: Turning guidance off also hides the new showdown explanations, preserving existing results.

## Implementation

Initial inspection found that the evaluator already returns the category and exact best five cards from the flop onward. The private view currently exposes rankings only at showdown. There is no draw detector or explanatory card grouping. Peek is also available during runout voting, but there are no private turns during the runouts themselves.

## Display contract

- Preflop: identify a pocket pair, or name the two ranks and whether they are suited or offsuit. Do not call this a best-five hand.
- From the flop: “You have” names the category and its defining ranks. Show the best five with hole/board labels. Emphasize matching groups for pairs, trips, full houses, and quads; all five for straights and flushes; the highest card for high card. Identify supporting cards and kickers without implying they form the matching group.
- If the board alone matches the player's best score, show the board combination and explain that the hole cards do not improve it. This does not imply all players tie.
- “You could make” shows each qualifying draw with supporting cards and the missing rank(s) or suit. Show straight and flush draws together when both qualify. For a double gutshot, show the two completion patterns so the gaps are clear.
- Aces may be low in A–2–3–4–5 or high in 10–J–Q–K–A. Do not wrap around the ace. A single-ended ace-boundary draw must not be labeled open-ended; name its completion rank plainly.
- On flop/turn with no qualifying draws, say “No one-card straight or flush draw.” Do not claim that the hand cannot improve. Omit the draw section on the river and at showdown.
- Guidance appears below the table in the private area. Do not mark the public board with private highlights. All explanation text, copied cards, highlights, and accessible labels disappear with Peek.
- Preserve the existing hold, release, keyboard, pointer-cancellation, tap, and interruption behavior. Do not require another tap while holding. Keep the Peek control stable when content appears so a layout change does not interrupt the hold.
- At showdown, show made-hand explanations only for revealed, non-folded hands, separately for Board A and Board B. A fold-only win reveals no private hand or explanation.

## Concrete review examples

| Hole cards | Revealed board | Expected guidance |
|---|---|---|
| Q♠ Q♥ | None | “Pocket queens.” No five-card claim or draw section. |
| 7♠ 7♥ | 7♦ K♣ 2♠ | “Three of a kind — three sevens.” Emphasize the three sevens; king and two are kickers. |
| Q♠ Q♥ | Q♦ 8♣ 8♠ | “Full house — queens full of eights.” Emphasize and label the three queens and pair of eights. |
| A♥ Q♥ | Q♣ 7♥ 2♥ | “One pair — queens.” Separately show the four hearts: “Flush draw — one more heart completes a flush.” |
| 6♠ 7♦ | 8♣ 9♥ K♠ | “King high.” Straight-draw row shows 6–7–8–9: “A five or ten completes a straight.” |
| 5♠ J♦ | 7♣ 8♥ 9♠ | “Jack high.” Double-gutshot explanation: six completes 5–6–7–8–9; ten completes 7–8–9–10–J. |
| 6♥ 7♥ | 8♥ 9♣ K♥ | “King high.” Show both the straight draw (five or ten) and flush draw (one more heart), in separate rows. |
| 2♣ 3♦ | A♠ K♥ Q♦ J♣ 10♠ | “Ace-high straight.” Show the five board cards and explain the hole cards do not improve them. No river draw section. |

These examples describe completion patterns, not winning chances or the contents of the remaining deck. PokerStars' [draw explanation](https://www.pokerstars.com/poker/learn/lesson/calculating-outs/) distinguishes possible completions from cards that actually win; its [straight rules](https://www.pokerstars.com/poker/games/rules/hand-rankings/straight/) cover ace-low straights. The examples above are project acceptance cases.

## Build scope and acceptance checks

Extend the existing evaluator output with explanations and draw patterns; reuse current ranking and private-view boundaries. Update setup, saved-game compatibility, Peek rendering, and eligible showdown rendering. No new dependency, odds engine, or change to dealing/betting rules is needed.

Focused behavior checks must cover:

1. Every current hand category, correct defining cards and kickers, and board-only hands. Verify the displayed best five still match the evaluator's score.
2. Open-ended, gutshot, double-gutshot, and flush draws; simultaneous draws; duplicate ranks; ace boundaries; no backdoor or weaker-category suggestions; no river draws.
3. Guidance depends only on own cards and the revealed board: changing hidden opponents, burns, or future cards cannot change it.
4. Concealment on release, Hide Cards, cancellation, action, vote, handoff, interruption, navigation, and resume. No private explanation remains in display or accessible labels.
5. Switch on/off, saved setting restoration, older-save compatibility, folded-hand privacy, fold-only wins, and per-board showdown explanations.
6. Browser interaction for hold/tap/keyboard behavior, stable Peek control, small-screen readability, scrolling, and border/text cues that do not rely on color. Report any unavailable browser or physical-phone checks explicitly.

Run existing dealing, betting, recovery, and UI regression checks after implementation. The final suite passes 42 tests, including the existing regressions and the new guidance/privacy checks.

## Final alignment

Approved Q14: “Yes — approve the plan and build it (Recommended).” Implementation is complete in the current browser prototype.

## Delivery verification

The 42 tests and all four inline-script syntax checks pass. Desktop browser checks verified setup, private tap reveal/hide, concealment on action and resume, preflop text, made-hand highlights, and eligible showdown explanations. Portrait layout had no horizontal overflow at an observed 375-pixel width. Pointer/keyboard cancellation and draw rows are covered by DOM-boundary checks; physical Android touch/hold/scroll and real screen-reader checks remain outstanding. See the [prototype README](../../prototypes/README.md) for the precise validation scope and [screenshot](peek-guidance-preview.jpg).
