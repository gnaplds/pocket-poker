# Play guide

## Pass & Play

1. Choose **Play together**, or **New game** if a save exists. Enter 2–10 names in clockwise seat order, starting at the bottom.
2. Choose hold-to-peek or tap-to-reveal, and whether everyone gets hand guidance. Each player starts with 20 chips; blinds stay at 1/2.
3. Start, then pass the phone to the named player. Tap **I'm ready** before viewing cards. Only that player's private cards are available.
4. Check, Fold, Call, Bet/Raise, and All-in require confirmation. The Min–Max slider moves one chip at a time; its maximum uses the remaining stack.
5. After betting closes, wait until everyone is ready, then deal the next street. Cards move one at a time; taps and scrolling are locked during dealing.
6. At a private river finish, tap **Showdown** to reveal eligible hands and pay the pots. If all betting has ended against all-in opponents, cards become public and the hand finishes automatically after the last runout. A sole remaining player wins immediately without revealing private cards.
7. Choose **Next hand** to keep stacks and move the button/blinds. Players with no chips sit out. At game end, **Rematch** confirms a reset for the full original group, including eliminated players.

The pot strip shows the hand number, blinds, and stage. The title scrolls away while the pot and community cards stay visible. When dealing starts, the board moves to the top of the screen. Seat colors show confirmed actions: blue for bets/raises, matching calls green, folded seats faded red, and all-in gold. Betting history is grouped by street.

### Private guidance

Expand **Hand details**, then Peek. Guidance explains the best five cards and one-card straight/flush draws, using only your cards and the revealed board. It hides with private cards. Tap-to-reveal is available for longer reading. The game-wide setting controls new explanations at Peek and showdown.

### Run once, twice, or three times

Once no more betting is possible and all owed calls/folds are resolved, remaining players can vote before the next street. Each eligible player chooses 1, 2, or 3; the lowest choice wins. Choosing 1 ends the vote immediately. All boards use one deck, retaining shared community cards already dealt. Boards finish in A, B, C order, with a pause before each street. Each pot is split across the runs, with remainder chips assigned to earlier boards; ties and side pots are handled separately. All-in equity uses public cards only and does not inspect hidden burns or folded cards.

### Leaving and resuming

**Settings → Save & Leave** returns to Opening after confirmation. Browser Back within the app uses the same confirmation. Cancel stays at the concealed game; a save failure blocks departure. **Continue game** or `/play` restores the local game with a fresh private handoff. Public all-in cards remain public. Reload/close cannot guarantee a custom confirmation, so the app saves completed actions automatically.

## Simulation

Choose **Study → Simulation** and select 2–10 players. Every dealt hole card is visible; one observer controls all seats. Each New Deal starts independent 20-chip stacks with 1/2 blinds and a fixed starting dealer. Replay Same Deck restores the original deck order. Replacing an unfinished deal requires confirmation.

Use **Deal Hole Cards**, then the street buttons. The community board aligns with the top of the screen before each street is dealt. Betting uses the same action confirmations and chip slider as Pass & Play, without handoffs. Disable demo betting for deal-only study. **Study Tools** contains Next Card, Play/Pause, speed, deck/burn inspection, replay, and guided examples. Run once, Run twice, and Run 3 times are observer choices at eligible pauses, without votes.

Seats show hand categories and equity bars; player details show Win/Tie and best-five cards. Equity excludes all dealt hole cards and burns, but ignores future shuffled deck order. A/B/C runouts have separate equity values. Results appear automatically when the hand is finished. Leaving the mode stops playback and unfinished calculations; completed state stays in memory until reload.

## Equity calculator

Choose **Study → Equity calculator**. Select 2–10 players, enter two known cards each, and choose Preflop (no board), Flop (3), Turn (4), or River (5). The picker disables used cards and advances within the current hand or board. Calculations start automatically when the inputs form a valid stage.

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

On Home, open the square gear beside **Study**. The gear is also available in setup and each mode. Toggle **Dark mode** for charcoal-and-green surfaces with cream cards. It defaults to off and saves per browser. Switching keeps your current inputs and place on the screen. Choose **10 / T**, **Motion: Follow device / Reduced**, and **Dealing speed: 0.5× / 1× / 2× / 4×**. Simulation Study Tools uses the same motion and speed choices. Reduced motion skips animation waits; readiness pauses stay.

In Pass & Play, **This game** changes card viewing and guidance for everyone in that saved game. Elsewhere, **New-game defaults** prefills setup and leaves existing saved games unchanged. Rematches retain their game settings.

Changes apply immediately. A warning appears if they cannot be saved. Close, Escape, or browser Back within the app closes settings first. Private cards and guidance hide on opening; closing normally keeps the same turn and requires another Peek. If the app loses focus, the usual handoff and recovery rules apply. Settings is unavailable during dealing and while another dialog is open.

### Reading the table and changing settings

Simulation uses a bottom turn panel. Scroll the table to inspect other players without losing the betting controls; during dealing the controls disappear so the board and card movement have room. Player details start closed and can be opened individually. Folded seats retain their label and readable chip counts.

Confirmations show the exact action, such as **Call 2 chips** or **Fold hand**. In Settings, select **10 / T** or **Hold to peek / Tap to reveal** directly; hand guidance has an on/off switch. Changes still save immediately and preserve the same privacy rules. In Equity, player names have visible labels and the card picker's Close button stays above its scrolling card list.

Settings also lets you hide seat-position labels in both play modes. Dealing speed uses a four-stop slider (0.5×, 1×, 2×, 4×). Reduce motion is a switch; the device’s accessibility preference remains respected when the switch is off. These preferences are saved on this browser. Betting confirmations use blue for bet/raise, gold for all-in, green for call, and red for fold.

Seats use neutral surfaces with colored action dots and borders. The acting player has a neutral outline and a Your turn or Acting label. Dark-mode menus and dialogs use charcoal while the table keeps its green felt.

The acting seat has a 5 px dashed outline, dark in light mode and light in dark mode. Seats use solid 5 px borders for betting status: blue for Bet/Raise, green for a matching Call, and gold for All-in. A confirmed fold leaves a compact gray marker with the player's name, chips, and Folded, at the same clockwise seat. Table cards and equity disappear for that player; Simulation's details remain available. The brief shrink is skipped with reduced motion and does not delay the next turn.

In Pass & Play, players eliminated in a previous hand no longer occupy visible table space. At the next hand, the remaining seats close up in their original clockwise order. All-in players remain visible for the current hand. The game retains original player identities for saves, blind movement, and rematches; an empty dealer-button position is noted at the table center.

Community-board verdicts show winners and right-aligned chip amounts beneath each board. Pot labels appear when side pots need distinguishing; unfinished runouts keep a payment-pending note. Equity labels sit directly above their bars without a reserved blank line.

In Pass & Play, tap a community board’s A/B/C label to hide or show its cards and verdict. Each board starts expanded for a new hand; the receiving board reopens before dealing. Bar labels show only percentages (and A/B/C for multiple boards); screen readers still identify them as hand equity.
