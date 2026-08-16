# HUSTLE

A 14-day financial-literacy simulation game (Profile → Scanner → Plan → Crisis → Ending),
targeting low-end Android devices on prepaid/limited data plans.

## What's in this repository

Two parallel builds, not two versions of the same thing:

- **`prototype/hustle-shell.html`** — single-file vanilla-JS browser prototype. All four
  stages are implemented and the Sunrise visual system is applied. This is the **canonical
  design/content source** — actively maintained, not frozen or superseded.
- **`rn-slice/`** — a React Native (Hermes, New Architecture) vertical slice covering the
  Scanner and Crisis stages, built to validate the RN architecture recommendation. This is
  **not a migration of the full app** and should not be treated as one. Plan and Ending
  stages do not exist in RN. `domain-ts/` at the repository root is an earlier, historical
  port of the Crisis domain logic that predates and differs from `rn-slice/src/domain/` —
  kept for reference, not the current source.

No migration of the full app to React Native has started. That is a deliberate, binding
stop condition recorded in `DECISIONS.md`, not an oversight.

## Status

The RN architecture has a **CONDITIONAL GO**, not a clean GO. What that covers and what it
doesn't:

- Validated on the `hustle_lowend` emulator only (cold start, kill/restart, network
  interruption, input stress, persistence corruption handling) — every result in this
  repository's validation documents is labeled EMULATOR-VERIFIED. **No physical Android
  device has been used at any point.** Real-device behavior (thermal throttling, real touch
  latency, real memory pressure) is an open, unvalidated gap, not a checked box.
  REAL-DEVICE-UNVERIFIED items have not been closed.
- The Playwright smoke harness for the prototype passes 9/9, but an adversary review found
  the assertions aren't HUSTLE-specific enough to distinguish the real app from a 45-byte
  stub page — treat it as "the page loads," not "HUSTLE works." Detail in `TESTING.md`.
- Persistence, Scanner-commit, and recommit-invalidation logic in `rn-slice/` have each gone
  through adversary review with fixes applied and re-verified. Note that recommit invalidation
  is reviewed and tested **logic**, not wired runtime behaviour: `commitSpot()` returns a
  `resetDownstream` flag that the commit handler discards, and
  `invalidateDownstreamOnRecommit` has no production caller. Likewise there is no Plan stage,
  no Crisis screen, and no Crisis resume API in RN — `launchCrisis` is create-only. See
  `rn-slice/HUSTLE_ARCHITECTURE_CURRENT_STATE.md` for the authoritative boundary between what
  is implemented and what is future architecture, plus
  `rn-slice/PERSISTENCE_VALIDATION_REPORT.md`, `rn-slice/SCANNER_SLICE_REPORT.md`, and the
  `KNOWN UNENFORCED INVARIANT` note in `rn-slice/src/domain/recommit.ts` for what remains a
  documented, accepted gap rather than a fixed one.

Start with `MEMORY.md` for the current, fast-to-read state of the project before reading
anything else below.

## Documentation

See `CLAUDE.md` → "Documentation map" for the full index (product definition, architecture,
design system, testing methodology, decision log, development history, Android environment
setup, lessons learned, and the standalone RN validation report).

## Running the prototype

Open `prototype/hustle-shell.html` directly in a browser, or run the Playwright smoke suite
via `npx playwright test` (see `TESTING.md` for what that suite does and does not cover).

## Running the RN slice

See `ANDROID_SETUP.md` for the canonical SDK path, environment variables, and known
build-toolchain gotchas on this machine before attempting a build. There is no physical
device configured for this project — testing runs against the `hustle_lowend` emulator.
