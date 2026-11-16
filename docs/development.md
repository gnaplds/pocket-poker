# Development and deployment

## Local preview

Requirements: Python 3 for serving files, Node.js 26+ for tests. No npm packages or build step.

```sh
python tools/serve.py
# Or choose another port:
python tools/serve.py --port 8768
```

Open `http://127.0.0.1:8765/`. The server supports direct links and refresh on every app route. Do not use `file://` or a basic static server without fallback routing: external workers and nested URLs need HTTP handling.

For phone testing on a trusted local network, use `--bind 0.0.0.0` and open the computer's LAN address on the phone. That exposes this development server to the local network. A phone's `127.0.0.1` points to the phone itself. Different hosts or ports have separate browser saves.

## Source map

| File | Responsibility |
| --- | --- |
| `web/scripts/poker.js` | Dealing, ranking, guidance, betting, pots |
| `web/scripts/session.js` | Multiplayer commands, private views, serialization |
| `web/scripts/random.js` | Shared secure random integer selection |
| `web/scripts/equity.js` | Exact enumeration and sampled equity |
| `web/scripts/equity-worker.js` | Background jobs for all equity displays |
| `web/scripts/equity-bars.js` | Shared bar labels, rendering, update motion |
| `web/scripts/simulation.js` | Shared card helpers and Simulation UI |
| `web/scripts/app.js` | Opening, setup, Pass & Play, and calculator UI |
| `web/scripts/routes.js` | URLs, history traversal, guarded departure |
| `web/scripts/preferences.js` | Validated device settings and shared motion preference |
| `web/scripts/motion.js` | Cancellable decorative effects and dealing lock |
| `web/styles/app.css` | Existing styles in original cascade order |

Scripts remain classic scripts loaded in document order. Shared globals are intentional for this extraction; no framework or bundler migration is included. The worker imports the same evaluator and random helper as the page. UI tests load actual external sources in HTML order rather than a duplicate implementation.

## Routes and saves

Routes select screens: `/`, `/new-game`, `/play`, `/study`, `/simulation`, `/equity`, and `/hand-rankings`. Trailing slashes normalize in the client. Browser history stores a route index, not cards or player data. Back/Forward runs the same cleanup as screen navigation: hide private cards, stop dealing, close dialogs, and cancel obsolete workers.

Within this document, leaving Pass & Play requires Save & Leave confirmation. Cancelling Back restores the current history entry without creating a new one. Browser navigation out of the document, reload, and closing a tab rely on automatic saving and lifecycle cleanup rather than a guaranteed custom dialog.

**Do not rename `pocket-table-prototype-v1` for cosmetic cleanup.** It is the existing local-storage key. Keep the saved-game schema compatible or provide a tested migration. An unreadable save is not overwritten by a direct `/play` visit; setup still requires confirmation before replacing it. One active tab owns the save; multi-tab conflict resolution is not implemented.

## Tests

```sh
node --test --test-isolation=none tests/*.test.cjs
python -m unittest discover -s tests -p '*_test.py'
```

The JavaScript suite covers rules, UI event wiring, actual worker evaluation, privacy, equity bars, motion cancellation, direct links, and Back/Forward. Its DOM/history doubles do not establish layout, native touch behavior, or actual browser-history timing. Use the [validation checklist](validation.md) for browser and phone checks.

## Deploy on Netlify

1. Import `gnaplds/pocket-poker` with production branch `main`.
2. Leave base directory and build command empty. Publish **web**; this is also set in `netlify.toml`.
3. Review a branch locally before an approved push/merge to `main`.
4. After deployment, verify `/`, a refreshed `/simulation`, `/equity`, `/play`, the old entry redirect, and missing asset behavior.

The legacy `/dealing-prototype.html` redirects to `/`. Missing files under `/scripts/`, `/styles/`, and `/fonts/` receive a 404 instead of app HTML. Other unknown paths load the app's Page not found view through the SPA fallback (HTTP 200). Existing static files take priority. These rules follow Netlify's [rewrite guidance](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/) and [redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

Only `web/` is published. Tests, current guides, historical `.scratch` files, and Godot work stay outside the public directory. No server-side environment variables or credentials are required. The separate Godot branch is not part of this deployment.

## Settings storage and privacy

`pocket-poker-preferences-v1` stores device notation, motion, speed, and new-game defaults separately from the existing multiplayer key. Invalid fields fall back to defaults. Failed writes retain in-memory choices with visible feedback. Current-game Peek and guidance still belong to the match save.

Opening the native settings dialog calls Peek concealment only, not save/restore, so it does not convert the current turn to a handoff. Lifecycle interruption still uses normal conceal/recovery. The navigation guard dismisses an open settings panel before a guarded route change; no extra history entry is created. Navigation outside this document retains the existing browser limitation.
