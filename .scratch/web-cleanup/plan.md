# Website structure and routes — planning draft

## Confirmed

- Keep one entry page, named index.html, and split shared poker logic, screen code, and CSS into focused files.
- Use client-side routes: / (Opening), /new-game (setup), /play (Pass & Play), /study (study menu), /simulation, and /equity.
- Routes identify screens, not shared game sessions.
- Rename the active website directory to web/ and move tests outside the published site.
- Rewrite the root README and focused play/development guides for the current application.
- Keep historical .scratch plans and branch names as history.
- Keep Pocket Poker and the GitHub repository name unchanged.

## Confirmed navigation behavior

- Opening or refreshing /play restores a valid local game with private cards concealed and a fresh handoff. Already-public cards remain public. If no valid save exists, replace the route with /new-game and explain why; do not overwrite an unreadable save merely by opening the route.
- Retain the internal storage key pocket-table-prototype-v1 to preserve existing saves on the same origin.
- Browser Back within the app uses Save & Leave confirmation when leaving a started Pass & Play game. Cancel restores the game route and concealed turn; confirm saves and leaves. Other screens need no confirmation.
- Reload and tab close rely on automatic saves and privacy cleanup. Custom confirmation cannot be guaranteed when leaving the document.
- Simulation and Equity keep in-memory state during same-visit navigation, but reset after full reload or in a new tab. URLs contain no cards, names, or scenario state.
- Redirect /dealing-prototype.html to /. Unknown application paths show Page not found with a Home action.

## Proposed implementation and delivery defaults

- Keep plain HTML, CSS, and JavaScript without a framework or bundler.
- Use web/index.html, web/scripts/, web/styles/, and web/fonts/; place tests in tests/ and current guides in docs/.
- Extract existing logic without redesigning poker rules or visuals. Preserve CSS order, worker cancellation, privacy cleanup, and saved-game format.
- Update all worker loading and test entry points to use extracted files instead of reading inline script bodies.
- Provide a small local development server with route fallback and documented startup command; use HTTP rather than direct file opening.
- Update Netlify publish paths, legacy redirect, and route fallback. Missing assets must remain missing assets rather than receiving the app shell.
- Keep browser Forward consistent with route entry and concealment rules. Normalize trailing slashes to canonical routes.
- Rewrite root README, play guide, development/test/deployment guide, and current file references. Record architecture decisions separately from historical research.
- Validate existing behavior plus direct links, reload, Back/Forward confirmation and cancellation, save preservation, worker loading, old links, unknown routes, and font loading.
- Work on a separate codex/ branch and deliver a local preview first. Commit/push/merge and production deployment require a later user request.

## Approval status

Approved for local implementation and validation. Implemented on codex/web-cleanup; see docs/validation.md for checks and remaining device/deployment validation. No push or deployment authorized.
