# Pocket Poker

A browser prototype for a Texas Hold’em simulator and shared-device multiplayer game, with Android packaging planned. Initially inspired by the [poker.net demo](https://poker-calculator.johnbelthoff.com/).

## Run locally

From this repository's root:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory prototypes
```

Open [Pocket Poker](http://127.0.0.1:8765/dealing-prototype.html). No installation or account is needed. Supports 2–8 players, local saves, private turns, betting, side pots, and running it twice.

## Test

With Node.js 26 or later:

```sh
node --test --test-isolation=none prototypes/dealing-prototype.test.cjs prototypes/dealing-prototype.ui.test.cjs
```

59 tests cover dealing, ranking, betting, recovery, and UI behavior. Physical Android testing and packaging remain pending.

## Project documents

- [Active multiplayer decision map](.scratch/pass-and-play/map.md): private turns, continuing games, clockwise seats, and the opening flow.
- [Approved multiplayer specification](.scratch/pass-and-play/spec.md): agreed behavior, defaults, and acceptance checks for the implemented browser prototype.
- [Simulator decision map](.scratch/mobile-simulator/map.md): accepted simulation baseline and earlier investigations.
- [Glossary](GLOSSARY.md): poker terms used throughout the plan.
- [Working dealing prototype](prototypes/dealing-prototype.html): open directly in a browser; [instructions and test results](prototypes/README.md).
- [Superseded calculator plan](.scratch/mobile-calculator/map.md): retained for historical context and evaluator research.

This workspace contains planning documents and a working browser prototype. The multiplayer specification is approved; hands-on review and Android packaging remain separate steps.
