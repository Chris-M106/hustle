# Android QA Environment Setup

Verified working end-to-end 2026-08-11: license accept → SDK component install → AVD
create → headless boot → `adb` verify → screenshot capture → clean shutdown. Emulator-only
— no physical device was available this pass (see caveat at bottom).

## Versions

- JDK: Eclipse Adoptium 17.0.20+8 (`C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`)
- Android cmdline-tools: latest, laid out at `C:\Android\Sdk\cmdline-tools\latest` (source
  copy) and mirrored into the canonical SDK root below
- Platform: android-33
- System image: `system-images;android-33;google_apis;x86_64`
- Emulator: 37.1.11
- AVD: `hustle_lowend`, device profile `pixel`

## Canonical project path (Windows)

**`C:\claude-projects\<project>\`** — always use this shallow root for any Claude Code
project on Windows, not `C:\Users\<user>\Documents\...`. For HUSTLE: `C:\claude-projects\hustle\`.

React Native Android builds run Gradle, CMake, and Ninja, which generate deep intermediate
paths (native codegen under `node_modules\...\android\...\build\...`). Combined with a long
`Documents\...` prefix, these exceed Windows' 260-character MAX_PATH limit and fail with
errors like `ninja: error: Stat(...): Filename longer than 260 characters`. A shallow root
avoids this regardless of how deep the build tooling nests its own paths. This is a permanent
environment constraint, not specific to any one migration — new RN (or other native-build)
projects on this machine should be created directly under `C:\claude-projects\` from the start.

## Canonical SDK root

**`C:\Android\FinalSdk`** — always use this, and always set it via env var (see bug #2
below), never via `--sdk_root=`.

```
C:\Android\FinalSdk\
  cmdline-tools\latest\
  licenses\
  platform-tools\   (adb.exe, fastboot.exe, ...)
  platforms\android-33\
  emulator\         (emulator.exe, ...)
  system-images\android-33\google_apis\x86_64\
```

## Two real bugs found this session — read before automating sdkmanager again

**Bug 1 — `cmd.exe /c "sdkmanager.bat ... < file"` silently no-ops.** Wrapping the batch
file in `cmd.exe /c "..."` (even with absolute paths and a real `<` file redirect, not a
pipe) produces only the cmd.exe startup banner and does nothing — no java process runs, no
error, exit code 0. Burned 4+ attempts across a session before this was caught; previously
misdiagnosed as a session rate-limit killing background jobs. It is not — it's a real,
reproducible dead end on this machine.

**Fix: call the `.bat` directly, no `cmd.exe /c` wrapper.** Export `JAVA_HOME` first, `cd`
into a real directory, then invoke the batch file path directly from bash. This actually
launches java and produces real output.

**Bug 2 — `sdkmanager.bat --sdk_root=<path>` does not use the path you give it.** Every
single invocation with `--sdk_root=X` installs to `<cwd>\Android<basename of X>`, not to
`X` — i.e. it compounds a literal extra `"Android"` prefix onto the target each time you
call it: passing `C:\Android\Sdk` installed to `C:\Android\AndroidSdk`; passing that
corrected path back in installed to `C:\Android\AndroidAndroidSdk`; passing that back
installed to `C:\Android\AndroidAndroidAndroidSdk`. Confirmed by direct `find`/`ls` after
each call — `sdkmanager`'s own `--list_installed` output is not sufficient evidence, it once
claimed packages were installed when the files were not actually on disk (metadata/reality
mismatch after an interrupted install).

**Fix: never use `--sdk_root=`. Export `ANDROID_SDK_ROOT` and `ANDROID_HOME` as environment
variables instead** — every tool (`sdkmanager`, `avdmanager`, `emulator`, `adb`) respects
these directly and correctly, with no path-mangling bug.

## Working command sequence

All commands assume bash (git-bash on Windows). Export once per session:

```bash
export JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
export ANDROID_SDK_ROOT="C:\Android\FinalSdk"
export ANDROID_HOME="C:\Android\FinalSdk"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$PATH"
```

**Bug 3 (found 2026-08-12, RN slice build/run) — none of the above persists across a fresh
bash shell.** Every new shell needs all four exports above re-run — `adb` is not on PATH by
default, and `JAVA_HOME` unset makes `gradlew.bat` fail immediately with `ERROR: JAVA_HOME is
not set`. A wrong guessed path for `JAVA_HOME` (e.g. `/c/Android/jdk-...` instead of the real
`C:\Program Files\Eclipse Adoptium\...`) fails with a *different*, misleading message
("invalid directory") rather than "not found" — don't assume a different error means a
different root cause; verify the real path with `ls` before re-guessing. Also:
`gradlew.bat` must be invoked directly from bash (not via `npx react-native run-android`) to
get reliable output. First cold build took 44m and auto-installed NDK 27.1.12297006, SDK
Platform 37, Build-Tools 36, CMake 3.22.1 — expect a long first build regardless of the SDK
already being "set up." A fresh app's first launch takes ~18-25s to Activity-display plus
more time for Metro to finish serving the bundle — a screenshot taken during either window
looks identical to a blank/crashed screen; check logcat's "Displayed" line and
metro.log/file-mtime freshness before trusting a screenshot. Gradle 9.4.1's incubating
"Problems report" writer can itself throw `TimeoutException` and make gradle report `BUILD
FAILED` even after `:app:installDebug` already succeeded — cross-check
`adb shell dumpsys package <pkg> | grep lastUpdateTime` against the run window rather than
trusting gradle's exit status alone; `--no-configuration-cache` avoided recurrence on retry.

**Accept licenses** (`yes.txt` = 20 lines of `y`, one per possible license prompt):

```bash
cd "C:\Android"
/c/Android/FinalSdk/cmdline-tools/latest/bin/sdkmanager.bat --licenses \
  < /c/Android/yes.txt
```

**Install components** (license prompts can reappear per-package on first install of a
package whose license wasn't pre-seen — pipe `yes.txt` again just in case):

```bash
/c/Android/FinalSdk/cmdline-tools/latest/bin/sdkmanager.bat \
  "platform-tools" "platforms;android-33" \
  "emulator" "system-images;android-33;google_apis;x86_64" \
  < /c/Android/yes.txt
```

Large packages (the system image is the big one) can exceed a single command's timeout
mid-unzip — that's fine, `sdkmanager` resumes/completes on the next identical invocation
rather than corrupting state, but always verify with `find`/`ls` afterward (bug 2's
metadata/reality mismatch means don't trust the log or exit code alone).

**Create the AVD:**

```bash
echo "no" | /c/Android/FinalSdk/cmdline-tools/latest/bin/avdmanager.bat create avd \
  -n hustle_lowend \
  -k "system-images;android-33;google_apis;x86_64" \
  -d "pixel"
```

(`echo "no"` answers the "create a custom hardware profile?" prompt.)

**Boot headless:**

```bash
nohup /c/Android/FinalSdk/emulator/emulator.exe -avd hustle_lowend \
  -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect \
  > /c/Android/emulator_boot.log 2>&1 &
```

**Wait for boot and verify:**

```bash
/c/Android/FinalSdk/platform-tools/adb.exe wait-for-device
until [ "$(/c/Android/FinalSdk/platform-tools/adb.exe shell getprop sys.boot_completed \
  2>/dev/null | tr -d '\r\n')" = "1" ]; do sleep 5; done
/c/Android/FinalSdk/platform-tools/adb.exe devices
```

Cold boot took a little over 4 minutes on this machine (first poll timed out at 240s,
completed on the retry).

**Screenshot** (do not use `adb shell screencap` + `adb pull` with a `/sdcard/...` remote
path — git-bash's automatic POSIX-path conversion mangles the leading `/`, and
`MSYS_NO_PATHCONV=1` then breaks the *local* destination path instead. Use `exec-out`,
which pipes the PNG straight to a local file with no remote path involved):

```bash
/c/Android/FinalSdk/platform-tools/adb.exe exec-out screencap -p > /c/Android/screenshot.png
```

**Clean shutdown:**

```bash
/c/Android/FinalSdk/platform-tools/adb.exe emu kill
```

## Caveats

- **Emulator-only — no real-device testing was performed or is available in this
  environment.** The RN architecture validation spec (§7) explicitly calls out real-device
  testing as part of the evidence bar; this setup does not meet that bar. Any GO/NO-GO
  decision drawn from work run only against this emulator should say so plainly, not treat
  emulator behavior as equivalent to device behavior (especially for anything touching
  storage/permissions/performance).
- `google_apis` system images ship with real Google apps (Gmail, Play Store, etc.) that
  throw first-boot "keeps stopping" dialogs with no network/account configured — cosmetic,
  not a sign the image is broken.
