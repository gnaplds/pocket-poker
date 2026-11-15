# Website redesign validation

2026-11-15. Implemented locally on `codex/web-sans-typography`. No push, merge, or deployment.

## Implemented

- Opening leads directly to Play together or Continue game, with New game and Study routes.
- Setup groups optional viewing/guidance settings; replacement of unfinished or unreadable saves still confirms.
- Shared Inter typography, cream/forest palette, static branding, and consistent public dialog styling. Player-facing prototype labels removed; internal filenames and save keys retained.
- Pass & Play keeps the board above a scrollable table, with reachable private controls below. The turn panel can shrink and scroll on short screens.
- Hand details sits below the private cards, only contains guidance while peeking, and resets on handoff. Peek itself is not replaced while held.
- Check acts directly. Fold, Call, Bet/Raise, and All-in still confirm.
- Winner dialog offers Next hand or Rematch, plus Review hand. Rematch confirms the full-group reset, including eliminated players, with preserved names/settings and a fresh random dealer/deck.
- Named interface and dealing timings; bounded hand glow/confetti; stronger overall-game celebration; reduced-motion overrides. No sound.
- Existing Simulation and Equity behavior remains; shared typography and visual treatments apply.

## Automated checks

Command:

```sh
node --test --test-isolation=none prototypes/dealing-prototype.test.cjs prototypes/dealing-prototype.ui.test.cjs prototypes/equity-prototype.test.cjs
```

89 passed, 0 failed: 47 poker/session, 35 UI boundary, 7 equity tests. `git diff --check` also passed.

Added/updated UI coverage includes direct Check and duplicate clicks; confirmation cancellation; direct home routes; unchanged saved game when replacement is cancelled; Next hand exactly once with continuing stacks; confirmed/cancelled Rematch including eliminated seats; collapsed/expanded guidance privacy; eight long-named seats finishing a fold hand. Existing tests retain run-it-twice, public equity, recovery, and study-mode isolation coverage. The DOM double checks events/state, not physical layout or touch quality.

## Browser observations

Used a separate local test origin on port 8766 to keep the existing port-8765 saved game separate.

Verified in the browser:
- Opening and setup, local Inter loading, and no horizontal overflow at the observed 342 × 740 CSS viewport.
- Two-player full hand: concealed handoff, call confirmation, direct Check, flop/turn/river readiness, visible dealing, manual Showdown, tied-winner dialog, and Next hand.
- Expanded tap-to-reveal guidance and immediate hide; reloading returns through a concealed handoff.
- Save & Leave returns to Opening with Continue game.
- Eight-player setup accepts long names and presents saved-game replacement confirmation.

Browser approval review blocked the final eight-player Start new game action because its usage limit was reached. The action was not executed and was not retried through another route. The temporary viewport override was reset.

## Remaining checks

Eight-player and two-board visual playthroughs, narrow/short-screen layout after the final flex-sizing adjustment, physical-phone hold-to-peek ergonomics, keyboard-only full session, and browser reduced-motion checks remain pending. Automated tests cover privacy events and reduced-motion paths, but cannot establish physical usability or animation quality. No ten-use animation review or device performance claim is made.

Inter remains the temporary licensed font. GT Maru has not been embedded. User feedback is still needed to judge enjoyment and replayability.
