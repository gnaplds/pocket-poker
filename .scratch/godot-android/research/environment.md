# Godot Android environment findings

Read-only investigation, 2026-11-08. No installs or settings changed.

- Current app: Poker, Equity, and Match JavaScript modules embedded in one HTML file, with 83 Node tests. Port behavior and test cases; rewrite DOM/CSS UI as native controls.
- Installed Godot: /usr/bin/godot, version 4.7.2.stable.arch_linux.ed1daf0bf.
- Java and javac are installed; OpenJDK 21.0.12.1.
- adb, sdkmanager, gradle absent from PATH. Configured SDK /home/apldsgn/Android/Sdk is absent; Godot Java path blank; export templates folder empty.
- Android export is not ready. Other installations outside the inspected paths were not ruled out.
- Device model/OS remain user-reported. No phone connection or benchmark performed.

## Official references

- [Android export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html): SDK and Java paths required; JDK 17 recommended, higher versions allowed. Pin packages and templates to the chosen engine release before installing. Signing identity matters for APK updates.
- [Renderers](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html): Compatibility is appropriate for simple 2D and broad hardware support. Recommendation for this app is an inference, pending real-device validation.
- [C# support](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html): requires .NET Godot; Android support remains experimental. GDScript avoids this extra export path.
