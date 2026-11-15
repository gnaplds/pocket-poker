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
