# Settings panel

Status: approved and implemented locally; no commit or deployment authorized.

## Access and layout

Replace Save & Leave in the Pass & Play header with a gear labelled Settings for assistive technology. Keep Save & Leave inside the panel with the existing save confirmation and save-failure protection. The app name stays non-clickable.

Add the gear on Home and beside existing navigation on Study, Simulation, Equity, and Hand rankings. Setup also uses the shared header with Back and Settings for consistency. Use one modal panel, a clear Close button, readable labels, and scrolling within the panel on short screens. Block background input and scrolling, trap focus, and restore focus to the gear on close. Outside taps do not dismiss it.

Close, Escape, and in-app browser Back dismiss settings first without leaving the screen. Opening and closing settings must not create duplicate navigation entries or bypass the active-game leave guard. Existing limits for navigation outside the document remain.

## Preferences

| Control | Values | Default | Scope |
| --- | --- | --- | --- |
| Show tens as | 10 / T | 10 | Device |
| Motion | Follow device / Reduced | Follow device | Device |
| Dealing speed | 0.5× / 1× / 2× / 4× | 1× | Device |
| View your cards | Hold to peek / Tap to reveal | Hold to peek | This game or new-game defaults |
| Hand guidance · everyone | On / Off | On | This game or new-game defaults |

Ten notation applies to visible cards, picker choices, compact card notation, and ranking examples across all modes. Spoken names remain ten and written explanations can use ten/tens. Internal card IDs and poker rules stay unchanged.

Motion and speed are shared across both play modes and Simulation Study Tools. Follow device respects the system reduced-motion preference; Reduced always reduces motion. Remove travel, pulses, blur, confetti, and artificial animation waits in reduced motion. Keep readiness pauses. Speed scales card dealing, not unrelated interface feedback. Neither preference changes the prepared deck or game outcomes.

Active Pass & Play shows This game controls for Peek method and guidance, stored with that game and applied immediately while cards remain concealed. Elsewhere show New-game defaults that prefill setup. Changing defaults never alters an existing saved game; setup choices still apply to the game being created, and rematches retain the existing group's settings.

## Privacy and interruption

Opening settings immediately conceals private cards and guidance without changing the active player or forcing a new handoff. Closing normally returns to that same turn, concealed, requiring another Peek. Pending confirmation dialogs and active dealing block opening settings. Settings does not place a bet, progress a street, change cards, or reveal private information.

Losing focus, locking the phone, or leaving the tab closes settings and invokes existing privacy/pause recovery: private turns return through a fresh handoff, public all-in cards stay public, and applied preferences remain. Decorative effects must not replay or advance state because settings opened or closed.

## Persistence and failure

Apply each change immediately; no extra Save button. Store device preferences separately from the multiplayer game and validate stored values, falling back to defaults for invalid fields. Do not replace or rename the existing game-save key.

If device-preference storage fails, retain the choices for this visit and visibly state that they were not saved. This game changes use existing game persistence and failure handling. Never claim a failed write succeeded.

## Implementation scope and checks

Reuse current card rendering, dialogs, motion helpers, save behavior, and route guard. Update shared and Simulation headers, setup defaults, all notation callers, motion/speed callers, tests, and current documentation. No framework or dependency needed.

Check cross-mode 10/T changes, spoken names, invalid preferences, save failures, game/default separation, same-turn concealment, tap and hold viewing, voting/public-card states, in-app Back/Forward, Escape/focus, interruption, motion/speed consistency, and preservation of cards, stacks, and saves. Verify narrow-screen layout and keyboard operation in the browser; physical-phone checks remain separate.

## Excluded and delivery

No themes, sound, chip-stack/blind changes, new poker rules, cloud sync, or Android rewrite changes.

Build and validate locally after approval. No commit, push, merge, or deployment until separately requested.
