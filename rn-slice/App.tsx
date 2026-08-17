/**
 * HUSTLE — app shell.
 * Root-level useState screen switch — the pattern the nav-spike validated (PASS,
 * zero app/architecture bugs; NAVIGATION_SPIKE_REPORT.md), not react-navigation,
 * per DECISIONS.md. Scanner, Plan, and Crisis have real screens; Profile/Ending
 * remain explicit placeholders (src/screens/Placeholder.tsx) until their own
 * slices land.
 *
 * Stage-aware navigation (see DECISIONS.md nav-UX-gate): no persistent nav chrome.
 * `scannerCommitted` is in-session-only UI state — it does not persist across
 * relaunch and does not duplicate ScannerScreen's own persisted/validated
 * `committedTo` (src/screens/ScannerScreen.tsx isValidScannerState); it is set once,
 * from ScannerScreen's own onContinue callback, which only fires from its existing
 * isCommitted panel. Plan is reachable only after that fires; Crisis is reachable
 * only via Plan's own completion callback (`onContinue`), using the
 * committedTo/cash captured at Scanner's onContinue below.
 *
 * Cross-stage state beyond {committedTo, cash} (e.g. Plan's answers blending into
 * Crisis) is NOT wired here — flagged, not invented. See CLAUDE.md
 * "Architecture boundary" and MEMORY.md "Known Unknowns".
 */
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ScreenName } from './src/navigation/types';
import type { BusinessId } from './src/domain/business';
import ScannerScreen from './src/screens/ScannerScreen';
import PlanScreen, { type PlanResult } from './src/screens/PlanScreen';
import CrisisScreen from './src/screens/CrisisScreen';
import EndingScreen from './src/screens/EndingScreen';
import Placeholder from './src/screens/Placeholder';
import type { CrisisRunState } from './src/domain/types';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('scanner');
  const [scannerCommitted, setScannerCommitted] = useState(false);
  // The Scanner -> Crisis handoff: captured once, at Scanner's own onContinue, from
  // Scanner's own authoritative state.committedTo/state.cash. App only carries it
  // through to Crisis's launch call — it does not re-derive or duplicate Scanner's
  // persisted state, and is not itself persisted (Crisis's own persistence, via
  // launchCrisis, is what makes the run durable).
  const [crisisHandoff, setCrisisHandoff] = useState<{ committedTo: BusinessId; cash: number } | null>(null);
  // Plan's grade, carried through as an independent fact for Ending — never fed
  // into Crisis's judgment score. See PlanScreen.tsx.
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  // The only legitimate Crisis-complete signal: fired from Crisis's own deliberate
  // "See your results" tap (CrisisScreen.tsx onFinish), not an automatic redirect.
  const [endingData, setEndingData] = useState<{ broke: boolean; state: CrisisRunState } | null>(null);

  return (
    <SafeAreaProvider>
      {screen === 'scanner' && (
        <ScannerScreen
          onContinue={(data) => {
            setScannerCommitted(true);
            setCrisisHandoff(data);
            setScreen('plan');
          }}
        />
      )}
      {screen === 'profile' && <Placeholder name="Profile" onNavigate={setScreen} />}
      {/* `scannerCommitted` guards this render, but it is not a reachability gate in
          practice: nothing in this file ever calls setScreen('plan') except the
          onContinue callback above, which sets scannerCommitted in the same call.
          Kept as a defensive check (not a state machine) in case a future screen
          gains its own way to request 'plan' before Scanner has actually committed. */}
      {screen === 'plan' && scannerCommitted && (
        <PlanScreen
          onContinue={(result) => {
            setPlanResult(result);
            setScreen('crisis');
          }}
        />
      )}
      {/* Crisis is reachable only via Plan's own completion callback, using the
          committedTo/cash captured at Scanner's onContinue above. If that handoff is
          somehow missing (e.g. a future direct nav to 'crisis'), fall back to the
          placeholder rather than rendering Crisis with no business/cash to launch. */}
      {screen === 'crisis' && crisisHandoff && (
        <CrisisScreen
          committedTo={crisisHandoff.committedTo}
          openingCash={crisisHandoff.cash}
          onFinish={(result) => {
            setEndingData(result);
            setScreen('ending');
          }}
        />
      )}
      {screen === 'crisis' && !crisisHandoff && <Placeholder name="Crisis" onNavigate={setScreen} />}
      {/* Ending is reachable only via Crisis's own deliberate completion signal
          (endingData). No shortcut/automatic redirect exists — see CrisisScreen.tsx
          onFinish and App.tsx's endingData state above. */}
      {screen === 'ending' && crisisHandoff && endingData && (
        <EndingScreen
          committedTo={crisisHandoff.committedTo}
          broke={endingData.broke}
          finalState={endingData.state}
          plan={planResult}
        />
      )}
      {screen === 'ending' && !(crisisHandoff && endingData) && (
        <Placeholder name="Ending" onNavigate={setScreen} />
      )}
    </SafeAreaProvider>
  );
}
