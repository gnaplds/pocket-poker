# Play guide

## Pass & Play

1. Choose **Play together**, or **New game** if a save exists. Enter 2–8 names in clockwise seat order, starting at the bottom.
2. Choose hold-to-peek or tap-to-reveal, and whether everyone gets hand guidance. Each player starts with 20 chips; blinds stay at 1/2.
3. Start, then pass the phone to the named player. Tap **I'm ready** before viewing cards. Only that player's private cards are available.
4. Check acts immediately. Fold, Call, Bet/Raise, and All-in require confirmation. The Min–Max slider moves one chip at a time; its maximum uses the remaining stack.
5. After betting closes, wait until everyone is ready, then deal the next street. Cards move one at a time; taps and scrolling are locked during dealing.
6. At a private river finish, tap **Showdown** to reveal eligible hands and pay the pots. If all betting has ended against all-in opponents, cards become public and the hand finishes automatically after the last runout. A sole remaining player wins immediately without revealing private cards.
7. Choose **Next hand** to keep stacks and move the button/blinds. Players with no chips sit out. At game end, **Rematch** confirms a reset for the full original group, including eliminated players.

The pot strip shows the hand number, blinds, and stage. Community cards stay visible while the table scrolls. Seat colors show confirmed actions: blue for bets/raises, matching calls green, folded seats faded red, and all-in gold. Betting history is grouped by street.

### Private guidance

Expand **Hand details**, then Peek. Guidance explains the best five cards and one-card straight/flush draws, using only your cards and the revealed board. It hides with private cards. Tap-to-reveal is available for longer reading. The game-wide setting controls new explanations at Peek and showdown.

### Run it twice

Once no more betting is possible and all owed calls/folds are resolved, remaining players can vote before the next street. Every eligible player must agree. Both boards use one deck, retaining shared community cards already dealt. Each pot is split across the runs; ties and side pots are handled separately. All-in equity uses public cards only and does not inspect hidden burns or folded cards.

### Leaving and resuming

**Settings → Save & Leave** returns to Opening after confirmation. Browser Back within the app uses the same confirmation. Cancel stays at the concealed game; a save failure blocks departure. **Continue game** or `/play` restores the local game with a fresh private handoff. Public all-in cards remain public. Reload/close cannot guarantee a custom confirmation, so the app saves completed actions automatically.

## Simulation

Choose **Study → Simulation**. Every dealt hole card is visible; one observer controls all seats. Each New Deal starts independent 20-chip stacks with 1/2 blinds and a fixed starting dealer. Replay Same Deck restores the original deck order. Replacing an unfinished deal requires confirmation.

Use **Deal Hole Cards**, then the street buttons. Betting uses the same action confirmations and chip slider as Pass & Play, without handoffs. Disable demo betting for deal-only study. **Study Tools** contains Next Card, Play/Pause, speed, deck/burn inspection, replay, and guided examples. Run It Twice is an observer choice at the eligible pauses, without votes.

Seats show hand categories and equity bars; player details show Win/Tie and best-five cards. Equity excludes all dealt hole cards and burns, but ignores future shuffled deck order. A/B runouts have separate equity values. Results appear automatically when the hand is finished. Leaving the mode stops playback and unfinished calculations; completed state stays in memory until reload.

## Equity calculator

Choose **Study → Equity calculator**. Select 2–8 players, enter two known cards each, and choose Preflop (no board), Flop (3), Turn (4), or River (5). The picker disables used cards and advances within the current hand or board. Calculations start automatically when the inputs form a valid stage.

Removing entered cards through Reset, a lower player count, or an earlier street requires confirmation. Reset keeps names, player count, and selected stage. Edits discard outdated results. Cancel hides incomplete results; **Calculate again** restarts. Entries stay during same-visit navigation but reset on reload.

### Reading equity

- **Equity:** expected share of one equal pot, including ties. The fill uses a fixed 0–100% scale, not relative rank among players.
- **Win:** chance of winning alone. **Tie:** chance of sharing a win.
- Preflop uses 20,000 samples and shows ≈. Postflop results are exact after all remaining boards are enumerated.
- Gray empty bars show calculated zero; — means unavailable. A tiny positive value reads <0.1%. Estimated zero is not proof that winning is impossible.
- Two-runout play modes show A/B bars separately. The standalone calculator supports one board only.

Hand equity does not predict actual chip awards from unequal stacks or side pots. Unknown hands, ranges, and manual dead-card entry are not supported in the calculator.

## Motion and accessibility

Dealing defaults to the deliberate 1× pace; changing speed keeps readiness pauses. Newly public eligible cards flip once; private Peek stays instant. Winning-card outlines, chip collection, and the result dialog do not determine payouts. Starting another hand cancels unfinished decorative effects. Reduced motion uses static feedback and skips decorative travel, pulses, and confetti.

Use the game among trusted players, one tab at a time. Interface privacy does not hide game data from browser storage or developer tools.

## Hand rankings

Choose Hand rankings from Study for ten examples, strongest first. Card examples stay visible. Open any entries to compare explanations and tie rules. Back returns to Study.

## Settings

Open the gear on Home, setup, or any mode. Choose **10 / T**, **Motion: Follow device / Reduced**, and **Dealing speed: 0.5× / 1× / 2× / 4×**. Simulation Study Tools uses the same motion and speed choices. Reduced motion skips animation waits; readiness pauses stay.

In Pass & Play, **This game** changes card viewing and guidance for everyone in that saved game. Elsewhere, **New-game defaults** prefills setup and leaves existing saved games unchanged. Rematches retain their game settings.

Changes apply immediately. A warning appears if they cannot be saved. Close, Escape, or browser Back within the app closes settings first. Private cards and guidance hide on opening; closing normally keeps the same turn and requires another Peek. If the app loses focus, the usual handoff and recovery rules apply. Settings is unavailable during dealing and while another dialog is open.
