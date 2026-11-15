# Pocket Poker website UI/UX refresh

Status: implemented locally; extended visual acceptance remains pending. 2026-11-15.

## Outcome and scope

Make casual shared-phone play easier to start, follow, and repeat. Implement Opening → Setup → Pass & Play → Results first, with one shared visual style across the site. Simulation and Equity stay accessible through Study; their detailed layout redesign is a later pass.

Keep Pocket Poker as the name. Keep the Godot branch separate. Work on the website branch `codex/web-sans-typography`. No GitHub push, merge, or live deployment is included in this approval.

Use the existing HTML/CSS/JavaScript and animation APIs. No framework or animation library migration. Preserve poker rules, chip accounting, equity accuracy, card privacy, saved-game compatibility, and the existing save-failure/recovery behavior.

## Visual language

Warm cream background, forest-green board, rounded sans-serif headings, fewer decorative containers, and clear spacing between unrelated groups. Preserve Fold red, Bet/Raise royal blue, All-in gold, Pause gray, and current seat-action meanings. Labels and outlines must carry meaning as well as color.

Inter remains the locally hosted working font. GT Maru is the target personality, but the downloaded archive is outside the repository and will not be embedded or published without suitable rights. Avoid claiming Inter is GT Maru. Use readable weights for small text and stable-width numeric displays where supported.

Player-facing prototype wording has already been removed. Keep internal filenames and storage keys stable; they are not player-facing branding.

## Opening, setup, and navigation

- No saved game: Play together opens setup directly; Study opens the Simulation/Equity choices.
- With an unfinished save: Continue game is primary, New game and Study remain visible secondary routes. Continue restores through the existing concealed handoff/public state.
- A completed saved game opens its results rather than starting an extra hand. Its Rematch option follows the reset rules below.
- Setup preserves 2–8 players, clockwise names, reveal method, guidance, 20-chip starts, and 1/2 blinds. Group names separately from optional settings.
- Do not discard an unfinished saved game merely by opening setup. Confirm replacement when the user submits Start game. Cancelling keeps the existing game intact.
- Header branding stays non-clickable. Back returns to the relevant parent; Save & Leave keeps its confirmation inside a started game.

## Phone layout and private information

Keep the pot and community board visible at the top; two boards remain stacked. Place the compact clockwise table in a scrollable middle region. During a private turn, place cards, Peek, and betting controls in a bottom panel within thumb reach, respecting device safe areas. Fixed seats never reorder as turns change.

The compact panel shows current player, chips/call amount, two cards, Peek, Fold, Check/Call, the one-chip Min–Max slider with Bet/Raise/All-in, and Pause. Keep controls stable while pressing; never shift Peek under a held finger. At short heights, the panel itself may scroll rather than overlap the board or shrink touch targets. Give table and panel clear scroll boundaries; no horizontal scrolling at phone widths.

Hand details expands a readable, scrollable explanation area. It can be expanded before peeking, but private content only exists while the player peeks. Release, pointer cancellation, focus loss, handoff, or interruption immediately conceals cards and explanations. No fade-out of private information. Tap reveal/Hide remains available for reading. Reset expansion on handoff so one player's UI state does not surprise the next.

During shared readiness and dealing, the private panel yields space to the table and the shared action. Bring the relevant dealing region into view before animation; do not scroll during an active private decision. History and detailed results remain available below the main play area.

## Turns, pacing, and feedback

Check commits immediately, hides cards, and advances the turn. All other betting actions still confirm the exact action and amount. Cancel changes no chips. Disable duplicate submissions; no undo once the action has committed.

Preserve deliberate one-by-one dealing, approximately the current 850 ms/card cadence, and shared readiness pauses before streets. UI feedback is faster than game pacing. Do not skip votes, reveal cards early, or change showdown boundaries to fit an animation.

Only public all-in hands receive public rankings/equity. Normal private hands still require Showdown; fold wins remain immediate and concealed. Failed saves and calculations retain their existing recovery paths.

## Results and repeating play

Each hand has one result dialog with winners and clear payout information. If the game continues, Next hand is the main action and Review hand is secondary. Next hand carries stacks and rotates positions using the current rules. Review closes the dialog and shows per-board pots, eligible hand details, and history; Next hand remains accessible there.

At game completion, use Rematch instead of Next hand. Review remains available. Rematch first shows a reset summary: same full group, same names and settings, 20 chips each, fresh deck, random first dealer. Confirm starts a new game and saves it once; Cancel leaves final results and the saved game unchanged. Include eliminated players in their original seats.

Keep New game available for changing the group through setup. No achievements, daily streaks, new challenges, progression economy, or accounts in this pass.

## Motion contract

Apply the requested charles-ux-animation skill in the existing stack. Proposed implementation defaults:

| Interaction | Trigger/frequency | Feedback and motion |
| --- | --- | --- |
| Buttons and slider | Touch/keyboard, frequent | Immediate state response; 100–150 ms press feedback; exact one-chip slider movement |
| Peek/hide | Hold/release or tap, every turn | Immediate visibility changes; hide never waits for motion |
| Navigation and dialogs | Explicit action, occasional | Short 200–250 ms transition; no decorative first-load sequence |
| Cards dealt or burned | Readiness plus automatic sequence, every street | Readable one-by-one travel; named timings and storyboard; preserve committed card position through interruption |
| Turn change | Confirmed action | Actor indication and labels update promptly; no moving targets |
| Hand result | Completed payout, every hand | Brief winner glow and small confetti burst; next action enabled immediately |
| Game winner | End of game | Stronger bounded celebration, still dismissible without waiting |

Use named durations/curves, primarily transform/opacity, and existing CSS/WAAPI. Avoid simultaneous competing effects and continuously pulsing controls. Keep familiar action colors despite generic skill advice about a single accent. Do not add generic optimistic updates, delayed private-card exits, or slider snapping that conflicts with poker requirements.

Reduced motion removes decorative animation while retaining all state, winner, and progress information. No sound in this pass. Confirmed betting/dealing transitions remain valid and single-use even when effects are interrupted.

## Validation and acceptance

Extend existing public behavior/UI tests for direct Check, unchanged confirmations for other actions, home resume/new-game routes, Next hand, and confirmed/cancelled Rematch. Verify full-group stacks/settings, saved-game compatibility, single payouts/deals, and no stale private content in collapsed/expanded details.

Browser-check the complete play flow at narrow and typical portrait sizes, including eight long names and two boards. Test keyboard focus, touch-sized targets, nested scrolling, open guidance, reduced motion, cancelled/rapid presses, and navigation mid-animation. Check fonts load locally and no player-facing prototype labels remain.

Play a short two-person and eight-seat test session. Verify that acting does not require scrolling past all seats, the board remains readable, hand endings provide the next useful action, and repeated effects do not force delays. These checks support usability; they do not prove enjoyment or retention without player feedback.

Approval of this draft authorizes implementing and locally validating this first website redesign pass. GitHub publication and GT Maru embedding remain separate.

Implementation and check results: [validation notes](validation.md).
