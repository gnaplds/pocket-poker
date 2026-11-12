# Godot Android implementation evidence

Updated: 2026-11-12. Status: native test APK built; physical-phone acceptance pending.

The user authorized implementation after approving the plan, specified `pocket-poker/`, and accepted the Android SDK license and installation. Work is on `codex/godot-android` from web main `b6980ea`. No web files changed, and no push, merge, or Netlify deployment was performed.

## Delivered locally

Native GDScript/Control screens for opening, modes, setup, private turns, betting, public runouts, history, and results. The port includes continuing 2–8 player games, recoverable saves, guidance, two-runout votes, and background public Hand equity. Burn and dealt cards animate; interrupted dealing resumes from the committed card position. Reduced motion is saved with the game. Simulation and manual Equity remain Coming later as planned.

The [project README](../../../pocket-poker/README.md) covers local run, Android export, installation, updates, source boundaries, and tests. The APK is at `pocket-poker/builds/pocket-poker-debug.apk` and is deliberately excluded from Git.

## Build checks

- Godot 4.7.2 stable and matching official Android templates.
- Java 21, Android platform 36/build-tools 36.0.0/platform-tools installed. The owner accepted Google's terms before SDK package installation.
- Standard debug export completed and APK signatures v2/v3 verified with `apksigner`. APK size: 29,853,129 bytes.
- APK SHA-256: `2855cdf268a4de93224793ad46e94402e84bab37b08e5d9374fecc648a383045`.
- Package `com.gnaplds.pocketpoker`, code 1, version 0.1.0-dev, ARM64, minimum API 24, target/compile API 36, OpenGL ES 3.
- Manifest contains the exported launcher alias, portrait orientation, and no requested Internet permission. APK contains no test fixtures, README, or signing credentials.
- Export used an isolated temporary Godot settings copy with the Java path configured. An open editor had reset its Java setting to empty; export did not overwrite that editor's settings.
- `adb devices` returned no connected device. APK install, launch, update compatibility, and device ABI/OS remain unverified.

## Automated evidence

All seven native test scripts pass:

| Script | Evidence |
| --- | --- |
| `run.gd` | 7,267 checks, zero failures; ranking examples and 21 web-reference dealing/betting traces across 2–8 players |
| `betting.gd` | Short and cumulative raises, one-chip opening all-in, refunds, separate side pots, two-board odd chips, dead button |
| `session.gd` | Private views, runout votes, automatic public finish, save replay, concealed resume, interrupted deck position, next hand |
| `storage.gd` | Valid saves, damaged-file preservation, explicit backup recovery, failed-write reporting; one expected directory-error log |
| `equity.gd` | 100 deterministic evaluator comparisons, tied shares, exact enumeration, shared two-board exclusions, invalid input, cancellation |
| `guidance.gd` | Ace-low endpoint, gutshot/open-ended/double-gutshot labels, full-house defining cards, board-only hand |
| `ui.gd` | Native scene navigation, private hold/release, confirmed action, Save & Leave, interrupted playback, eight-player public runout, cancelled equity, automatic result popup, no popup replay on resume |

These are public rule/session/calculation and scene checks. Signal-driven native tests do not establish physical touch, frame timing, or Android lifecycle delivery.

## Desktop equity measurements

One seeded run on the development computer, Godot debug/headless. Values are elapsed wall time, not phone promises. Sampling retains all 20,000 preflop boards.

| Players | Preflop | Flop | Turn | River |
| --- | ---: | ---: | ---: | ---: |
| 2 | 623 ms | 24 ms / 990 boards | 1 ms / 44 boards | <1 ms / 1 board |
| 8 | 2,118 ms | 45 ms / 528 boards | 3 ms / 32 boards | 1 ms / 1 board |

Two-player, two-board preflop: 1,201 ms. Workers report progress and cancel when the public snapshot changes; the UI does not await complete equity before allowing play.

## Visual evidence

Rendered native Control scenes at 432×900 and inspected opening, eight-player/two-board table, private controls, and winner dialog. These are desktop-rendered artifacts, not Android screenshots.

- [Opening](validation/pocket-godot-opening.png)
- [Public table](validation/pocket-godot-table.png)
- [Winner dialog](validation/pocket-godot-winner.png)

## Remaining acceptance work

Install on the actual phone and verify its model, Android version, ARM64 ABI, safe areas, and renderer. Test held/tap Peek and touch cancellation, lock/background/app-switcher previews, device Back, interrupted card movement, complete multi-hand games, damaged/failed saves, and an update retaining saved progress. Measure two/eight-player and two-board equity plus interaction responsiveness on that device.

Private content is removed on focus loss/background notifications. App-switcher frame capture is not yet proven safe on Android. Godot's [capture-exclusion flag](https://docs.godotengine.org/en/latest/classes/class_displayserver.html#enum-displayserver-windowflags) is documented for Windows/macOS, so this build does not claim Android screenshot protection. If the device retains a private frame in recents, add and verify platform capture protection before acceptance.

No Play Store release, online play, browser-save migration, Simulation port, or manual Equity port was attempted. Those are outside this milestone.
