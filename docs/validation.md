# Validation

Local website cleanup, checked 2026-11-16 on `codex/web-cleanup`. This branch has not been pushed or deployed.

## Automated checks

- JavaScript suite: 100 tests covering existing rules, UI behavior, equity, workers, motion, and new routes.
- Local HTTP server: 3 tests covering route fallback, missing assets, font serving, and the old-entry redirect.
- Route checks include direct screen entry, unknown paths, trailing slashes, concealed saved-game restore, public all-in restore, unreadable-save preservation, cancelled Back, confirmed departure, Forward, save failures, and history indices after reload.
- Worker checks execute the actual external worker and evaluator sources.

## Browser checks completed

- Opening → setup → two-player game updates the URL.
- Browser Back shows Save & Leave; cancellation retains `/play` with cards concealed.
- Confirmed Back leaves, and Forward restores the concealed game.
- Refresh on `/play` restores the saved hand. Back confirmation still works after refresh.
- Direct `/equity` loads. Aces versus kings completed a 20,000-board estimated calculation through the external worker.
- Calculator cards and completed results survive same-visit navigation to Study and back; full reload clears them.
- Unknown paths show Page not found. The old HTML URL redirects to Opening.
- Direct `/simulation/` normalizes to `/simulation`, and refresh loads the mode.
- Styles and locally hosted Inter load in the browser.

## Remaining checks

- Real Android touch, app interruption, screen-reader behavior, and short-screen layouts.
- Full eight-player/two-board visual regression after source extraction.
- Live Netlify rewrite behavior after an approved deployment. Local HTTP tests do not execute Netlify's routing service.
- Multi-tab save conflict handling is not supported; use one active game tab.

The DOM and history test doubles verify behavior boundaries, not actual rendering or every browser timing edge case. Poker evaluation has not been exhaustively compared against all possible hands.

## Settings — 17 November 2026

- 105 JavaScript tests passed, including preference validation, storage failure feedback, current-game/default separation, same-turn Peek concealment, interruption, and Back dismissal.
- Browser checks on a fresh local origin confirmed 10 → T card rendering with the accessible name “ten,” Escape/focus return, in-app Back dismissing settings without leaving, and a scrollable narrow panel without horizontal overflow.
- Existing history and poker tests passed. No server routing changes were made.
- Physical-phone lock/resume, touch controls, and a full multiplayer session at each speed remain manual acceptance checks. No deployment was performed.

## Dark mode — 17 November 2026

- 107 JavaScript tests pass, including startup defaults, saved theme restoration, invalid values, storage failure, and preserving mounted inputs and game saves during toggles.
- Browser checked Home Settings, keyboard Space toggling, reload persistence, Setup, Study, Hand rankings with an open explanation, Equity and its picker, Pass & Play turns/action confirmation/fold winner, and Simulation seats with equity.
- Study and Settings were checked at a browser-reported width of 342 px without horizontal page overflow. Both themes were checked on Study.
- Sampled foreground contrast ratios exceed 4.5:1 for body text, muted text, fold/raise buttons, and red card suits. Control borders were strengthened after a low-contrast sample.
- The existing preview origin served stale scripts. A fresh local preview on port 8771 loaded the complete changes.
- Remaining manual checks include physical-phone behavior, every dialog at narrow widths, public all-in/two-board result styling, and a full contrast audit. Startup preference application precedes the stylesheet; first-paint flashing has not been measured on a slow phone.

## Interface polish — 20 November 2026

- All 110 JavaScript tests pass. Added coverage for explicit betting confirmation labels, current-game setting controls, Simulation turn/street states and collapsed details, and labelled Equity inputs with a separate picker header.
- Local browser checks covered light and dark Settings, keyboard theme changes, preference persistence, the scrollable Equity picker with its Close control visible, and ten-player Simulation dealing and betting. The Simulation board reached the top during dealing; controls were hidden until the pause.
- At a browser-reported width near 390 px, Simulation action buttons measured 46 px high and stayed within the bottom panel. Six-player Pass & Play seats did not overlap. Neither checked layout had horizontal page overflow.
- A short-screen check found the private turn panel crowding the board. Its height is now capped at 48% of the viewport; at 409 × 491 px, the board ended at 198 px and the scrollable turn panel began at 255 px.
- Save & Leave returned to Home. Continue game restored the same player through a fresh handoff with all private cards concealed. No browser warnings or errors were captured in that check.
- Sampled text contrast exceeded 4.5:1 for dark fold, raise and all-in buttons, light folded and inactive seats, and dark inactive seats. This is a targeted check, not a full accessibility audit.
- Preview: `http://127.0.0.1:8772/`. No push or deployment was performed. Real-phone touch and interruption, screen-reader operation, full two-board visual regression, and frame-by-frame animation performance remain unchecked in this polish pass.

## Quieter seats — 21 November 2026

- All 110 JavaScript tests pass. Poker rules and save formats were not changed.
- Browser checked ten-player Simulation at 357 px width in light and dark themes: no seat intersections or horizontal page overflow. Confirmed raise actions retain their label and blue marker.
- Corrected a legacy dark action-fill rule that outranked the neutral seat surface.
- Physical-phone touch, all two-board result combinations, and a full contrast audit remain unchecked.
- The local preview server had stopped, preventing fresh worker loads. Restarted it and verified a completed 20,000-board Simulation calculation. Final dark raised-seat background measured rgb(34, 39, 37), matching the neutral surface.

### Interaction polish — 21 November 2026

- Corrected neutral-seat specificity so action dots/borders and muted finished seats retain their roles.
- Betting confirmations open instantly. Occasional native dialogs use a 150 ms CSS exit where discrete transitions are supported; older browsers close immediately. Closing actions and privacy cleanup are not delayed by timers.
- Both dealing paths share the same easing; card duration and readiness pauses are unchanged.
- Equity fills animate transforms instead of layout width. Existing zero, missing-value, and reduced-motion checks pass.
- Press feedback uses brightness without changing button size or animating theme colors.
- All 110 tests pass; `git diff --check` is clean. Physical-device and frame-by-frame animation checks remain outstanding.

### Strong borders and compact folded seats — 21 November 2026

- Both play modes render a compact name/chips/Folded marker; original seat content is hidden while its layout slot remains reserved. Confirmed folds alone trigger the shared 200 ms effect. New hands omit the marker.
- Added marker assertions to multiplayer fold-win and Simulation fold/cancellation tests. All 110 tests pass; no whitespace errors.
- Browser verified Simulation at phone width in light/dark themes, reduced motion, normal fold action, and immediate next-turn controls. Four-player and ten-player before/after seat coordinates were unchanged. Reserved two equity-label lines after finding percentage wrapping could shift rows.
- Blue/green/gold borders against seat surfaces measure APCA absolute Lc 60.8–66.5 in light mode and 55.6–65.3 in dark mode, above the skill's informative-boundary floor of 30. Action text remains the non-color cue.
- Versioned changed preview assets after cached scripts concealed the new marker. The test page loader accepts script query strings.
- Browser reported no console errors in the checked flow. Physical-phone, every two-board combination, and frame-by-frame interruption validation remain unchecked. Multiplayer marker/privacy behavior was checked through the automated boundary tests, not a new full browser game.
