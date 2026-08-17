/**
 * Root navigation model: raw useState screen switch, validated by the nav-spike
 * (rn-slice/NAVIGATION_SPIKE_REPORT.md — PASS, zero app/architecture bugs; kill/
 * relaunch, back-nav, shared state, rapid nav all correct against the existing
 * AsyncStorage write-queue pattern). react-navigation deferred, not rejected —
 * see DECISIONS.md. This is the first place that pattern is used in the current
 * (post-consolidation) App.tsx, not a new architectural decision.
 */
export type ScreenName = 'profile' | 'scanner' | 'plan' | 'crisis' | 'ending';
