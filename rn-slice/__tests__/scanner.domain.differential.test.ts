/**
 * Differential test: rn-slice's actual Scanner domain port
 * (`src/domain/scanner/{logic,types}.ts`, the code the shipped app runs) vs. a hand
 * re-derivation of the prototype's own logic, independently re-typed here from
 * `prototype/hustle-shell.html` (read directly, not copied from any prior report or
 * from `domain-ts/scanner/__diff__/diff_sim.js` in the parent repo — this file lives
 * entirely in rn-slice and tests rn-slice's own compiled code, per the parent-repo
 * hands-off constraint).
 *
 * Two parts:
 *  A) Pure arithmetic (`affordable`/`opening`/`overBy`/`forcesOf`/`forcesTotal`/
 *     `pressureWord`) — hustle-shell.html:1913-2021. 5 businesses x 6 network-stat
 *     values = 30 cases, mirrors the parent repo's own diff_sim.js structure but is
 *     an independent re-derivation, not a copy.
 *  B) State-transition functions (`scanSpot`/`selectSpot`/`commitSpot`) —
 *     hustle-shell.html:2115-2123 (scan tile click handler) and :2845-2867 (commit
 *     button click handler). The prototype has no pure function here (inline
 *     event-handler mutation), so `protoScan`/`protoSelect`/`protoCommit` below are a
 *     hand-derived pure re-expression of that same mutation logic, kept as literal to
 *     the handler's branch order as a pure function allows.
 */
import {
  affordable,
  opening,
  overBy,
  forcesOf,
  forcesTotal,
  pressureWord,
  scanSpot,
  selectSpot,
  commitSpot,
  createInitialScannerState,
} from '../src/domain/scanner/logic';
import type { ForcesTable, ScannerOpportunity, ScannerRunState } from '../src/domain/scanner/types';

const OPPS: ScannerOpportunity[] = [
  { id: 'phonerepair', name: 'Phone Repair Kiosk', short: 'Phone Repair', demand: 'HIGH', comp: 'LOW', cost: 1200 },
  { id: 'spaza', name: 'Spaza Shop', short: 'Spaza Shop', demand: 'HIGH', comp: 'HIGH', cost: 800 },
  { id: 'salon', name: 'Hair Salon', short: 'Hair Salon', demand: 'HIGH', comp: 'MEDIUM', cost: 2200 },
  { id: 'shisanyama', name: 'Shisanyama', short: 'Shisanyama', demand: 'HIGH', comp: 'HIGH', cost: 4500 },
  { id: 'clothing', name: 'Weekend Clothing Stall', short: 'Clothing Stall', demand: 'MEDIUM', comp: 'HIGH', cost: 600 },
];

const FORCES: ForcesTable = {
  phonerepair: { entrants: 1, subs: 1, suppliers: 3 },
  spaza: { entrants: 3, subs: 3, suppliers: 2 },
  salon: { entrants: 2, subs: 3, suppliers: 2 },
  shisanyama: { entrants: 2, subs: 2, suppliers: 3 },
  clothing: { entrants: 3, subs: 3, suppliers: 2 },
};

const CAPITAL = 2500;

function protoLevelOf(w: string) {
  return w === 'HIGH' ? 3 : w === 'MEDIUM' ? 2 : 1;
}
function protoAffordable(o: ScannerOpportunity) {
  return o.cost <= CAPITAL;
}
function protoOpening(o: ScannerOpportunity) {
  return CAPITAL - o.cost;
}
function protoOverBy(o: ScannerOpportunity) {
  return Math.max(0, o.cost - CAPITAL);
}
function protoForcesOf(o: ScannerOpportunity, networkStat: number) {
  const f = FORCES[o.id] || { entrants: 2, subs: 2, suppliers: 2 };
  let suppliers = f.suppliers;
  const eased = networkStat >= 7 && suppliers > 1;
  if (eased) suppliers -= 1;
  return {
    rivalry: protoLevelOf(o.comp),
    entrants: f.entrants,
    subs: f.subs,
    suppliers,
    buyers: 4 - protoLevelOf(o.demand),
    supplierEased: eased,
  };
}
function protoForcesTotal(fv: ReturnType<typeof protoForcesOf>) {
  return fv.rivalry + fv.entrants + fv.subs + fv.suppliers + fv.buyers;
}
function protoPressureWord(total: number) {
  return total <= 8 ? 'Room to breathe' : total <= 11 ? 'Workable pressure' : 'Squeezed from all sides';
}

describe('Scanner domain differential — arithmetic (hustle-shell.html:1913-2021)', () => {
  const networkStats = [0, 3, 6, 7, 8, 10];
  let cases = 0;
  test.each(OPPS.flatMap((o) => networkStats.map((net) => [o, net] as const)))(
    '%s @ network=%i',
    (o, net) => {
      cases++;
      expect(affordable(o, CAPITAL)).toBe(protoAffordable(o));
      expect(opening(o, CAPITAL)).toBe(protoOpening(o));
      expect(overBy(o, CAPITAL)).toBe(protoOverBy(o));
      const fv = forcesOf(o, FORCES, net);
      const pv = protoForcesOf(o, net);
      expect(fv).toEqual(pv);
      const t1 = forcesTotal(fv);
      const t2 = protoForcesTotal(pv);
      expect(t1).toBe(t2);
      expect(pressureWord(t1)).toBe(protoPressureWord(t2));
    },
  );
  afterAll(() => {
    // eslint-disable-next-line no-console
    console.log(`[differential-arithmetic] cases=${OPPS.length * networkStats.length}`);
  });
});

// --- Part B: state-transition differential ---------------------------------------

/** Hand re-derivation of hustle-shell.html:2115-2123's scan-tile click handler,
 *  restricted to the scan/select branches (the `say`/`buzz`/`save`/re-render calls
 *  are UI side effects, not modeled — this isolates the state mutation only). */
function protoScanTileClick(state: { scanned: Record<string, boolean>; biz: string | null }, id: string) {
  if (!state.scanned[id]) {
    return { ...state, scanned: { ...state.scanned, [id]: true } };
  } else {
    return { ...state, biz: id };
  }
}

/** Hand re-derivation of hustle-shell.html:2845-2867's commit button click handler,
 *  restricted to the fields `ScannerRunState` also models (`committedTo`/`cash`/
 *  `setupCost`) — `day`/`crisisScore`/`resolved`/`ended`/`log`/`plan` resets on a
 *  different-business recommit are modeled only as the `resetDownstream` boolean,
 *  matching the port's own scope boundary (types.ts). Note: unlike the port's
 *  `commitSpot`, the prototype has NO guard against recommitting to the SAME already-
 *  committed business — it just recomputes cash/setupCost/committedTo to the same
 *  values and proceeds (see divergence note in the test below). */
function protoCommitClick(
  state: { biz: string | null; committedTo: string | null },
  o: ScannerOpportunity,
  capital: number,
) {
  if (!state.biz) return { ok: false as const, state };
  if (!o || !protoAffordable(o)) return { ok: false as const, state };
  const resetDownstream = !!state.committedTo && state.committedTo !== o.id;
  return {
    ok: true as const,
    state: { ...state, committedTo: o.id },
    cash: protoOpening(o),
    setupCost: o.cost,
    resetDownstream,
  };
}

describe('Scanner domain differential — state transitions (hustle-shell.html:2115-2867)', () => {
  const biz = OPPS[0]; // phonerepair, cost 1200, always affordable at CAPITAL=2500

  test('first scan tap: port scanSpot matches prototype scan branch', () => {
    const init = createInitialScannerState();
    const portNext = scanSpot(init, biz.id);
    const protoNext = protoScanTileClick({ scanned: init.scanned, biz: null }, biz.id);
    expect(portNext.scanned).toEqual(protoNext.scanned);
  });

  test('second tap (select): port selectSpot matches prototype select branch', () => {
    const scanned = scanSpot(createInitialScannerState(), biz.id);
    const portResult = selectSpot(scanned, biz.id);
    const protoNext = protoScanTileClick({ scanned: scanned.scanned, biz: null }, biz.id);
    expect(portResult.ok).toBe(true);
    expect(portResult.state.selected).toBe(protoNext.biz);
  });

  test('select on unscanned spot: port no-ops (ok:false); prototype has no such guard at all — DIVERGENCE (documented, not a bug)', () => {
    const init = createInitialScannerState();
    const portResult = selectSpot(init, biz.id);
    // The prototype's click handler is only ever attached to a rendered tile whose
    // "select" branch is only reachable once `state.scanned[o.id]` is already true
    // (the two branches are mutually exclusive on the SAME click handler) — so this
    // exact scenario (select-before-scan) is structurally unreachable in the
    // prototype's own UI, not merely unguarded. The port's explicit `ok:false` guard
    // is defense-in-depth for a state a differently-shaped caller (or corrupted
    // restore) could otherwise reach; it does not contradict prototype behavior
    // because the prototype never exercises this input at all.
    expect(portResult.ok).toBe(false);
    expect(portResult.state).toBe(init);
  });

  test('commit: port commitSpot matches prototype commit branch (first commit)', () => {
    let state = scanSpot(createInitialScannerState(), biz.id);
    state = selectSpot(state, biz.id).state;
    const portResult = commitSpot(state, biz, CAPITAL);
    const protoResult = protoCommitClick({ biz: state.selected, committedTo: state.committedTo }, biz, CAPITAL);
    expect(portResult.ok).toBe(protoResult.ok);
    expect(portResult.state.committedTo).toBe(protoResult.state.committedTo);
    expect(portResult.state.cash).toBe(protoResult.ok ? protoResult.cash : null);
    expect(portResult.state.setupCost).toBe(protoResult.ok ? protoResult.setupCost : null);
    expect(portResult.resetDownstream).toBe(protoResult.ok ? protoResult.resetDownstream : false);
  });

  test('recommit to the SAME already-committed business: port rejects (ok:false, no-op); prototype allows and recomputes identical values — DIVERGENCE (documented, intentional hardening, not a bug)', () => {
    let state = scanSpot(createInitialScannerState(), biz.id);
    state = selectSpot(state, biz.id).state;
    const committed = commitSpot(state, biz, CAPITAL).state;
    // Port: explicit reject (round-2 adversary fix, MAJOR #4).
    const portRecommit = commitSpot(committed, biz, CAPITAL);
    expect(portRecommit.ok).toBe(false);
    expect(portRecommit.reason).toBe('already-committed');
    expect(portRecommit.state).toBe(committed); // unchanged, true no-op
    // Prototype: no such guard — `state.biz` (selected) still equals `committedTo`'s id
    // after a first commit (the prototype never clears `state.biz` on commit), so a
    // second click on the commit button (if reachable — the UI in the prototype does
    // navigate away on success, but the state mutation itself has no guard) would
    // recompute committedTo/cash/setupCost to the SAME values, a value-level no-op
    // even though the port and prototype disagree on whether the call itself is
    // "allowed". End state (committedTo/cash/setupCost) is identical either way.
    const protoRecommit = protoCommitClick({ biz: biz.id, committedTo: biz.id }, biz, CAPITAL);
    expect(protoRecommit.ok).toBe(true);
    expect(protoRecommit.cash).toBe(committed.cash);
    expect(protoRecommit.setupCost).toBe(committed.setupCost);
    expect(protoRecommit.resetDownstream).toBe(false); // same business, no downstream reset
  });

  test('recommit to a DIFFERENT business: port and prototype agree on resetDownstream:true and new committed values', () => {
    const other: ScannerOpportunity = OPPS[1]; // spaza, cost 800
    let state = scanSpot(createInitialScannerState(), biz.id);
    state = selectSpot(state, biz.id).state;
    const firstCommit = commitSpot(state, biz, CAPITAL).state;
    let state2 = scanSpot(firstCommit, other.id);
    state2 = selectSpot(state2, other.id).state;
    const portResult = commitSpot(state2, other, CAPITAL);
    const protoResult = protoCommitClick({ biz: other.id, committedTo: biz.id }, other, CAPITAL);
    expect(portResult.ok).toBe(true);
    expect(portResult.resetDownstream).toBe(true);
    expect(protoResult.resetDownstream).toBe(true);
    expect(portResult.state.committedTo).toBe(protoResult.state.committedTo);
    expect(portResult.state.cash).toBe(protoResult.cash);
    expect(portResult.state.setupCost).toBe(protoResult.setupCost);
  });

  test('commit while over budget: port and prototype both reject', () => {
    const expensive = OPPS[3]; // shisanyama, cost 4500 > CAPITAL
    let state = scanSpot(createInitialScannerState(), expensive.id);
    state = selectSpot(state, expensive.id).state;
    const portResult = commitSpot(state, expensive, CAPITAL);
    const protoResult = protoCommitClick({ biz: expensive.id, committedTo: null }, expensive, CAPITAL);
    expect(portResult.ok).toBe(false);
    expect(protoResult.ok).toBe(false);
  });
});
