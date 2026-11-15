# Pocket Poker animation comparison

Status: approved local comparison built; awaiting visual preference feedback. No production changes, push, or deployment. Branch: `codex/animation-study`.

The user rejected tactile card travel. Both current variants retain the website's original card travel and pace. The older tactile experiment is preserved in branch history (`dfe4885`). See [plan.md](plan.md) for the approved scope.

Run from the repository root:

```sh
python -m http.server 8767 --bind 127.0.0.1
```

Open `http://127.0.0.1:8767/.scratch/animation-study/motion-prototype.html?variant=effects`.

Use the bottom bar to switch between Added effects and Current. Collapse it to play. Preview shuffle samples the overlay without changing a hand. Games live in memory; reload clears them. The production save is never accessed. All comparison files are outside Netlify's publish directory.

Added effects: centered card-stack preparation over light blur, 300 ms chip-to-pot feedback after confirmed contributions, brief turn/street cues, and a 180 ms winner lead-in. Preparation can be paused with its button or Escape. Resume retains the prepared deck and skips repeated preparation. New actions and loss of focus cancel stale decoration. System reduced motion skips added decorative effects and preparation delay.

## Validation

Run `node .scratch/animation-study/check.cjs` for the small cancellation/syntax/storage self-check.

Verified in browser: shuffle overlay; Pass & Play preparation interrupted with Escape; Ready to deal with 52 cards; Continue reaches eight concealed hole cards and 44 remaining cards; private handoff; confirmed call changes pot from 3 to 5 and stack from 20 to 18, then conceals and hands off to next player.

Self-check passes: cancelled winner never opens; reduced-motion winner opens immediately; reduced-motion preparation adds no delay; inline scripts parse; no persistent browser storage access.

Still pending: complete Simulation and multiplayer hands with new effects, physical-phone smoothness, browser reduced-motion check, slow-motion scrub, ten-use review, eight-player/two-board effects, real device lock/resume. Code checks are not evidence of visual quality. This is throwaway code, not ready for deployment; implement the chosen effects in production with full behavior checks only after review.

No ADR or glossary changes: these are reversible presentation decisions, not new poker-domain concepts.
