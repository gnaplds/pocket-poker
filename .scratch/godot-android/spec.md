# Pocket Poker: Godot Android build plan

Status: approved by the user on 2026-11-08. Implementation authorized on 2026-11-08.
Date: 2026-11-08.

The user separately authorized implementation after approving this plan. See [implementation evidence](implementation.md) for current status. The [planning map](map.md) points to the [decision record](issues/01-godot-contract.md).

## Destination and separation

Build a native, offline Godot app for direct installation on the user's reported Redmi Note 14 running Android 12. Verify the actual device, OS, ABI, usable screen area, and graphics support during device setup; do not infer them from the model name.

The first complete APK supports Pass & Play. Simulation and manual Equity appear as Coming later; they are later milestones, not unfinished requirements of the first APK.

Use branch `codex/godot-android` and project folder `pocket-poker/` (user-specified at implementation start). Keep the web app and Netlify configuration untouched as reference material. Do not merge this branch into web `main` or deploy it to Netlify without a later request. Development approval does not imply publication approval.

## Reference and implementation approach

Use the current web behavior at commit `b6980ea` and its 83 tests as the starting reference. Older planning files contain superseded rules; this draft and the latest accepted behavior take precedence. Reuse the existing domain vocabulary in GLOSSARY.md.

Use GDScript, native Godot Control-based screens, and Compatibility rendering. Do not embed the website. Port the poker/session rules and test cases; rebuild UI and lifecycle handling for Android. Keep these responsibilities separate:

- Poker rules and evaluator: cards, legal betting, ranking, pots, blinds, and payouts; no dependency on scene nodes.
- Session controller: confirmed actions, dealing transitions, votes, public/private views, and game progression.
- Save storage: versioned validated state, last-valid recovery copy, and write-failure handling.
- Equity worker: an immutable public-card snapshot, cancellable work, progress and result messages tagged with the request identity.
- Scenes: opening, modes, setup, table, result dialogs, and reusable cards/seats/buttons. Scenes present the controller's visible state rather than reading the private deck directly.

Use one pinned engine version with matching export templates. The installed executable reports 4.7.2; before implementation, verify that release's official matching templates and Android requirements. Do not silently mix versions. If it cannot be reproduced, present the supported alternative before changing the agreed stack.

## Screens and navigation

Opening → Play → Modes → Pass & Play setup → Table → Hand result → Next hand → Game winner.

Retain Pocket Poker branding, colors, card styling, compact clockwise seating, current action colors, and winner effects. Use native containers and touch controls; pixel-identical reproduction is not required.

- The top header uses the small card logo and non-clickable app name, with comfortable side padding.
- Modes, setup, and later non-game screens have Back. Back from Modes returns to Opening; setup returns to Modes.
- A started Pass & Play session uses Save & Leave. Ask for confirmation, conceal private information, save, then return to Opening. Native navigation replaces the website's page reload; do not restart the Android process.
- Android Back dismisses the active dialog first; otherwise it follows the screen's Back or Save & Leave action. On Opening, use normal Android background/exit behavior.
- Cancelling a betting dialog changes no chips or rules state. Cancelling Save & Leave keeps the game available with private cards concealed.
- Setup replacement confirmation remains when starting over would replace a saved game.

Portrait only. Respect display cutouts and navigation insets. Keep the pot and community board above a scrollable table/actions/history area. Stack Board A and B. Retain clear card sizes and touch targets; eight seats need not fit in one screen. Deal animations first bring the table into view and never scroll a player away during an active private decision.

## Pass & Play behavior

- Two to eight fixed, named clockwise seats. Default names Player 1 through Player 8. First dealer random; 20 play chips each and fixed 1/2 blinds.
- Carry stacks between hands. Bust players sit out; seats do not rearrange. Use existing tournament-style blind/button movement and heads-up rules. End when one player owns all chips. No rebuys, joining, AI opponents, rake, or blind increases.
- Handoff → I'm ready → hidden cards → hold Peek. Release/cancel hides cards and guidance. Retain the optional tap-to-reveal setup method and game-wide guidance switch.
- Guidance covers starting-hand text, current best five/category, defining-card highlights/kickers, and the approved one-card straight/flush draws. No hidden opponent information or betting advice. The switch is saved with the game.
- Check, Call, Fold, Bet/Raise/All-in require confirmation; disable duplicate submission. Use the one-chip Min–Max slider and combined action button. Explain total commitment and additional chips. Fold red, Bet/Raise royal blue, All-in gold, Pause turn gray.
- Seat actions: blue bets/raises, green callers matching the current bet, faded red folds, gold all-ins, neutral checks; turn outline remains distinct. Reset ordinary action colors each street; retain folds/all-ins.
- Keep public readiness pauses before dealing each street and after each completed street. Animate cards individually, including face-down burns. Use the current approximate 850 ms/card pacing as the initial setting; support reduced motion.
- Normal private hands await Showdown after river betting. Fold-only wins pay immediately without exposing hole cards. Public all-in runouts finish automatically after the last required board.
- Result screen includes per-board winners, main/side pots, expandable eligible player results, Next Hand, one winner popup, confetti, winner glow, and subdued losing seats. Folded cards stay private. Do not replay payout or celebration on resume.
- Betting history is always available below, grouped by Preflop, Flop, Turn, River and A/B where needed.

## Poker correctness and two runouts

Preserve minimum raises, short calls/all-ins, cumulative reopening rules, outstanding decisions, unmatched refunds, and pot eligibility. Calculate with integer chips and conserve the total.

Offer Run It Twice only after all owed decisions finish and no more betting is possible, before the next street. A covering player may still have chips. Use named clockwise votes among non-folded players; one No means one run. One decision applies to all pots.

Use one shuffled 52-card deck and the same hole cards. Share the existing board prefix, complete A before B, and burn before each new street. Pause before each remaining street. Divide each pot between boards first, assigning its odd chip to A; split tied board portions with odd chips clockwise from the button, matching the current rules. Pay once after both boards finish.

Expose non-folded hole cards when all-in betting is finished. Keep them public through voting, dealing, and resume. Show categories after each completed street and board winners when known. Private hands follow the normal Showdown boundary.

## Equity

Only calculate multiplayer equity after the all-in public reveal. Use public eligible hole cards and exposed board cards. Do not consult hidden folded cards, hidden burns, future deck order, or private game state to refine the percentages.

Compare eligible hands in one hypothetical equal pot. Label this Hand equity; it is not a prediction of side-pot payouts. Show one-decimal seat percentages, an Estimated indication for preflop, and separate A/B results. Shared board cards count once; exposed non-shared cards from the other board are unavailable to the board being calculated.

Use 20,000 sampled preflop boards, exact postflop enumeration, and a final exact result on the river. Run work off the UI thread. Publish bounded progress updates on the main thread, never access scene nodes from the calculation worker, and reject stale messages after changes or navigation. Hide stale odds during dealing; recalculate at completed streets and when the runout selection changes.

Controls and dealing remain usable throughout. Provide Cancel and Calculate Again; calculation errors must not prevent completing the hand. Report elapsed calculation times for two/eight-player preflop, flop, turn, and two-board cases on the actual device. Accuracy changes or a move away from GDScript require a new decision rather than an unreviewed workaround.

## Privacy and interruptions

Conceal Peek content, guidance, accessible labels, and unconfirmed choices on focus loss, lock, backgrounding, navigation, and input cancellation. Pause card animations without changing the already-committed deal. Resume at the correct public pause or a fresh handoff for a private turn, never an open Peek.

The app handles accidental disclosure between people sharing a phone; it does not authenticate players or protect against a modified app or inspection of stored game data. Test the Android app-switcher preview while peeking; if a private frame remains visible, fix that before acceptance using platform-level capture protection if needed. This is a privacy check, not a claim that screenshots are already prevented.

## Persistence and recovery

Use app-private local storage with one current save and one previous valid recovery copy. No browser import. Include schema version, full deck/order and dealt position, stacks/contributions, folds, raise rights, actor, blind/button state, voting/runout selection, stage, settled payouts, settings, and history needed for resume.

Validate structure and poker invariants before restoring. Save committed actions and deal transitions using a temporary write and safe replacement; keep the last validated recovery copy. Do not save transient Peek visibility or an unconfirmed bet as an action.

On a damaged save, offer recovery from a valid copy with an explicit notice that the latest action may be absent. Preserve damaged data until the user chooses recovery or replacement. If neither copy is valid, explain and ask before starting over.

If writing fails, stop further betting/dealing and offer Retry or Continue without saving. Continuing requires an explicit warning acknowledgement and a persistent unsaved indicator; Save & Leave must not report success or exit on a failed save. A later successful save clears the warning. Never silently charge twice, reshuffle, replay payouts, or resume an interrupted animation by dealing a second card.

## Build and delivery

At planning time the local Android toolchain was not ready; see [environment findings](research/environment.md). After development authorization, install/configure the chosen engine's matching templates, Android SDK packages, Java path, and device tools. Tool installation is execution work, not part of this planning approval.

Proposed package identity: `com.gnaplds.pocketpoker`, display name Pocket Poker. Verify no conflicting installed app before first installation. Keep package ID and debug signing identity consistent across test updates; record version codes and protect the signing key outside Git. Build an APK for the verified phone ABI. No Play Store/AAB delivery in this milestone.

Deliver the APK, version/commit information, and short install/update instructions. Use user-assisted file installation or USB device installation once the phone is available and connection approval is given. Do not ask the user to expose credentials or share their signing key in chat.

## Implementation sequence after approval

1. Create the separate branch/project and reproduce a minimal portrait Android export on the target phone. This is an internal checkpoint, not the complete milestone.
2. Port rules, evaluator, session/privacy views, and deterministic test fixtures. Compare outputs with the web baseline; add checks for discovered gaps rather than copying defects.
3. Build native opening/setup/table/private turns, legal betting confirmations, street pauses, rankings, runout votes, and results.
4. Add saves/recovery, interruption handling, safe areas, Android Back, accessible reveal, reduced motion, and background public equity.
5. Complete automated parity checks, desktop/native visual checks, and the phone acceptance list. Deliver the first complete Pass & Play APK.
6. Later milestone: native Simulation, reusing the verified engine but retaining independent deals, visible cards, study tools, replay, and its distinct known-dead-card equity rules.
7. Later milestone: native manual Equity, reusing the worker/evaluator with its own entry flow and scenario state. Detailed design review precedes each later mode.

## Acceptance evidence

- Reproducible engine/template/toolchain versions and successful debug APK install/update with saved game retained.
- Automated rule tests: categories/kickers/ties/wheel, all legal action boundaries, short raises and reopening, side-pot eligibility/refunds, odd chips, heads-up/bust transitions, shared runouts, deck uniqueness, and chip conservation.
- Automated privacy/session/save tests: only permitted cards in views; no double actions/payouts; hidden Peek after restore; voting progress retained; corrupt/failed writes recover safely; stale equity work cannot update another hand.
- Equity tests against known exact cases, split-pot shares, dead-card boundaries, A/B sharing, cancellation, and deterministic sample fixtures. The current 83 web tests are a reference set, not a claim that 83 native tests will provide sufficient coverage.
- Real phone: two and eight seats, long names, two boards, safe areas, slider/confirmation, held and tap Peek, interrupted touches, background/lock/app switcher, device Back, mid-animation resume, replacement/recovery, and complete multi-hand games.
- Measure equity runtime and interaction responsiveness under load. No frozen inputs, unintended action, private flash, or incorrect payout is acceptable. Report phone measurements and remaining limitations; do not call emulator/desktop results phone validation.

## Final review defaults

The user approved native return-to-Opening instead of browser reload, Back dismissing dialogs first, package ID `com.gnaplds.pocketpoker`, existing deal pacing as the initial baseline, and the acceptance-driven implementation sequence above. This completes planning only; coding starts on a separate instruction.
