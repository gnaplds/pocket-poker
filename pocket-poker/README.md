# Pocket Poker — Godot Android

Native offline Pass & Play test build. This project is on `codex/godot-android`; the web app and Netlify files remain unchanged. The accepted web rules at `b6980ea` are the port's reference.

The APK is a **device-test build**, not a completed mobile release. Android installation, touch behavior, app-switcher privacy, safe areas, and equity speed still need validation on the target phone.

## Play

Open → Play → Pass & Play. Choose 2–8 names, hold or tap to reveal, hand guidance, and optional reduced motion. Everyone starts with 20 chips and blinds of 1/2.

Pass the phone only with cards hidden. Each player taps **I'm ready**, peeks, then confirms a betting action. The table pauses before each street. Normal hands wait for **Showdown**; fold wins pay immediately. When betting ends against all-in players, eligible cards become public, players vote on one or two runouts, and background Hand equity appears. Public runouts finish automatically.

Stacks carry between hands. The game handles short all-ins, side pots, unmatched refunds, ties, odd chips, dead-button movement, and heads-up play. Simulation and the manual Equity calculator are reserved for later milestones.

**Save & Leave** confirms and returns to Opening. Resume conceals private cards. Saving happens after committed actions and cards. A previous valid save supports recovery. A failed write pauses play until Retry or an explicit choice to continue without saving; Save & Leave cannot report success while saving fails.

## Open and run

Use **Godot 4.7.2 stable**, GDScript, and the Compatibility renderer. Import `project.godot` in Godot, then run the project. No external game libraries or plugins are required.

From the repository root:

```sh
godot --path pocket-poker
```

## Android build

Verified local build tools:

- Godot `4.7.2.stable.arch_linux.ed1daf0bf`, with official **4.7.2 stable** Android templates.
- OpenJDK 21; set Godot's Android Java SDK Path to the installed JDK.
- Android SDK platform 36, build-tools 36.0.0, platform-tools; SDK licenses accepted by the project owner.
- Standard APK export, no Gradle source build or NDK required.
- Package `com.gnaplds.pocketpoker`, version `0.1.0-dev` / code `1`, ARM64 only, minimum Android API 24, target API 36.
- Portrait, offline; no Internet permission, no Android cloud backup of game saves.

Install matching templates in Godot's export-template manager and configure the Android SDK path in Editor Settings. Export with the checked-in Android preset:

```sh
mkdir -p pocket-poker/builds
godot --headless --path pocket-poker --export-debug Android builds/pocket-poker-debug.apk
```

The output is `builds/pocket-poker-debug.apk`. Build outputs, `.godot/`, credentials, and signing keys are ignored by Git. Reuse the same local Godot debug key for test updates; replacing the key prevents an in-place update. Keep a private backup of that key outside the repository. This key is for development, not a future store release.

Copy the APK to the phone and open it with the phone's file manager. Allow installation from that source when Android asks. For an update, install over the existing app; **do not uninstall**, since uninstalling removes its local saves. If Android reports a signature mismatch, resolve the signing key instead of deleting the app's data.

With USB debugging enabled and this computer approved on the phone:

```sh
adb devices
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.product.cpu.abilist
adb install -r pocket-poker/builds/pocket-poker-debug.apk
```

Verify the actual device and ARM64 support first. No phone was connected during local validation.

## Tests

From the repository root, run the public rules, session, storage, equity, guidance, and native UI checks:

```sh
for test in run betting session storage equity guidance ui; do
  XDG_DATA_HOME=/tmp/pocket-poker-tests timeout 30 godot --headless --path pocket-poker --script "tests/$test.gd" || exit 1
done
```

A failed GDScript assertion stops that test's function; the timeout makes it fail the shell command rather than hang indefinitely. The storage test deliberately attempts an unwritable path and expects an error message.

`tests/reference.json` holds deterministic input/output traces from the accepted web engine, including 21 deals across 2–8 players. `tests/reference.cjs` regenerates those traces from the retained web source; review any regeneration instead of treating changed results as automatically correct. Additional worked cases cover short-raise reopening, refunds, separate side-pot winners, odd chips, and blind movement.

```sh
XDG_DATA_HOME=/tmp/pocket-poker-tests godot --headless --path pocket-poker --script tests/benchmark.gd
```

`tests/capture.gd` renders 432×900 native screens to `/tmp/pocket-godot-*.png`; it needs a graphical display. It is a visual inspection aid, not physical-phone evidence. Tests and fixtures are excluded from the APK.

## Source boundaries

- `core/poker.gd`: dealing, legal betting, evaluation, pots, positions, guidance.
- `core/session.gd`: confirmed commands, private/public views, voting, replay-validated save format.
- `core/save_store.gd`: checked temporary writes, recovery copy, preservation of damaged files.
- `core/equity.gd`: background sampling/enumeration, progress, cancellation. It receives only public eligible hands and exposed boards.
- `ui/main.gd`, `ui/card.gd`, `main.tscn`: native screens and card animation.

Preflop equity samples 20,000 possible boards; postflop enumerates all remaining boards. Hand equity assumes an equal pot and does not predict side-pot payouts. Hidden folds, burns, and undealt deck order do not enter multiplayer calculations.

## Before accepting the phone build

Check two and eight players, long names, two boards, scrolling and camera/navigation insets. Try hold and tap Peek, cancelled touches, every action confirmation, Android Back, Save & Leave, and a complete multi-hand game. Background and lock the phone while peeking and while a card is moving; resume must conceal private content and preserve the deck position. Inspect the app-switcher thumbnail for private frames. Test an APK update with a saved game retained, recovery from damage, and a failed-save path.

Measure equity runtime and input responsiveness for two/eight players and both runouts. Desktop speed is not a phone performance claim. The standard Godot capture-exclusion flag is not implemented for Android; lifecycle concealment is present, but app-switcher capture behavior has not yet been verified. If a private frame remains visible, platform capture protection is required before acceptance.

See [build evidence and remaining checks](../.scratch/godot-android/implementation.md) and the [approved plan](../.scratch/godot-android/spec.md). The repository's MIT license applies.
