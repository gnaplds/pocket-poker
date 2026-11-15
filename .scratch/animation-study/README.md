# Pocket Poker motion comparison

Question: does tactile card travel and brief winner feedback feel better during repeated hands, and is 850 ms or 650 ms per card preferable?

Status: local throwaway comparison; awaiting user feedback. No production decision or deployment. Branch: `codex/animation-study`. Based on main `ed46edc`.

Run from the repository root:

```sh
python -m http.server 8767 --bind 127.0.0.1
```

Open `http://127.0.0.1:8767/.scratch/animation-study/motion-prototype.html?variant=tactile`.

## Compare

Use the bottom bar's arrows (or arrow keys while focused inside the bar). Collapse it while playing. Variants switch without resetting the current hand; a card already in flight finishes with its previous settings.

- `current`: original travel and winner treatment, 850 ms/card.
- `tactile`: curved diagonal travel with a small lift, 850 ms/card; short halo; reversible dialog transitions; compact-button press feedback.
- `quick`: same tactile treatment, 650 ms/card.

The same layout is intentional: this study isolates motion, not information hierarchy. Use Study → Simulation to see cards, then Replay Same Deck under Study Tools to compare an identical deal. Pass & Play is also available. Preview winner opens a sample dialog; real hands exercise the full winner effects.

All practice saves stay in memory. Reload (including Save & Leave's existing reload) clears the practice game. This copy never reads or writes browser storage. It sits outside Netlify's `prototypes/` publish directory. The font loads from the existing licensed Inter file.

## Interaction inventory

| Interaction | Trigger / frequency | Purpose / treatment |
| --- | --- | --- |
| Deal | Street button / repeated | Show deck-to-destination travel; one card at a time, preserve pauses |
| Shuffle | New deal / repeated | Existing shuffle retained as comparison baseline |
| Buttons | Pointer or touch / frequent | Immediate feedback; small scale only on compact buttons |
| Dialog | Action / repeated | Short entry and quieter exit in tactile variants; no extra steps |
| Winner | Completed hand / repeated | Brief halo; existing small confetti and actionable result |
| Peek concealment | Release, hide, interruption / frequent | Immediate; no motion or exit delay |

No new library. Existing CSS and Web Animations API. No private-card flip. Existing rules and game actions are copied, not redesigned. Reduced motion disables added decorative effects; existing reduced-motion deal paths remain.

## Checks and limits

- All seven inline scripts parse.
- Static check finds no localStorage/sessionStorage access.
- Browser: opening, style switching/URL update, sample dialog open/close, Simulation hole-card deal reaching Preflop with eight visible cards and equity.
- No automated test suite added to throwaway code. Production files unchanged.
- Still needed: physical phone performance, 10% speed scrub, mid-flight interruption, keyboard flow, reduced-motion browser check, ten-use review, actual winner halo, eight-player/two-board cases.
- The sample dialog previews dialog motion only. Judge actual glow/confetti by completing a hand.
- The copy is not a production patch. After a style is chosen, implement only validated changes in the real app and test its privacy and interruption behavior before deployment.

Feedback to collect: preferred pace; whether curved travel feels natural; whether the winner effect feels satisfying after ten hands. No final verdict yet.
