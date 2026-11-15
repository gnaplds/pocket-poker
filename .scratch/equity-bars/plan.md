# Equity bars — planning draft

## Confirmed

- Use the same equity bar in Simulation seats, Equity calculator player rows, and Pass & Play seats when all-in cards are public.
- Private multiplayer turns show no equity.
- Fill represents hand equity on a fixed 0–100% scale, with a readable numeric percentage.
- Color only the fill: low equity red, middle amber, high green. Use a neutral track and a gray empty bar for zero.
- Colors describe absolute equity, not relative player rank. Existing betting-action seat colors remain.
- Two boards have separate compact A/B bars at the bottom of each seat.
- Win/Tie remain text in existing detail areas.
- This is a presentation change; hand equity remains separate from calculation progress and chip payouts.

## Confirmed result states

- Gray empty bars mean a calculated zero, not loading or missing results.
- Preserve one-decimal percentages. Positive percentages below 0.1% display `<0.1%` instead of zero.
- Estimated values keep the ≈ marker, including ≈0.0%; sampled zero does not prove impossibility.
- Incomplete, cancelled, and outdated results show a neutral track and —.
- Folded seats show Folded without an equity bar.
- Show current partial simulation estimates with ≈ and keep calculation progress separate. Postflop exact results appear after enumeration completes.
- Valid updates transition width and color over 200 ms, without loops or pulses.
- Clear stale values immediately on input changes. Reduced motion uses instant updates.

## Proposed implementation defaults for final review

- Use a slim 6 px track spanning the available seat or player-row width, with the percentage above it. Keep compact A/B labels for two boards.
- Apply a continuous red → amber → green scale anchored at 0%, 50%, and 100%. Zero uses the agreed gray exception. These colors are a visual scale, not betting advice.
- Use the same bar styling in existing Simulation player details; keep Win/Tie text alongside the existing cards.
- Keep numeric text high contrast and provide accessible hand-equity labels and values; do not rely on color alone or announce every sampled update.
- Preserve calculation rules, payouts, card privacy, betting controls, and existing save behavior.
- Verify zero/tiny/estimated values, stale-result clearing, folded seats, two boards, and reduced motion. Check narrow-screen layout across all three modes.

## Delivery boundary

Approved and implemented in the main local preview. No GitHub push or deployment as part of this change.

Validation: automated suite passes (95 tests), including zero/tiny/estimated labels and reduced-motion/stale update behavior. Browser smoke checks confirmed calculated Simulation seat/detail bars and unavailable calculator bars. Full multiplayer/two-board visual checks and physical-phone validation remain pending.
