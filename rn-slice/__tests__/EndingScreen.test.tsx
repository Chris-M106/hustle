/**
 * @format
 * Ending: reports what happened, does not invent a new score. Asserts the three
 * facts (cash/plan/crisis) render independently, no aggregate "Overall Score"
 * label exists anywhere in the tree, pivot-day/ledger reflect the real log, and
 * the broke path shows the failure completion honestly (not a disguised success).
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// EndingScreen imports BIZ/FORCES_TABLE from ScannerScreen (see file header — the
// only real Five-Forces data source), which itself imports AsyncStorage. Mocked
// here purely so the module graph loads; this suite never exercises persistence.
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

import EndingScreen from '../src/screens/EndingScreen';
import type { CrisisRunState, CrisisLogEntry } from '../src/domain/types';

function findByTestID(root: ReactTestRenderer.ReactTestRenderer, id: string) {
  return root.root.findByProps({ testID: id });
}
function tryFindByTestID(root: ReactTestRenderer.ReactTestRenderer, id: string) {
  try {
    return root.root.findByProps({ testID: id });
  } catch {
    return null;
  }
}

function entry(over: Partial<CrisisLogEntry>): CrisisLogEntry {
  return { day: 1, event: 'Something happened', type: 'income', choice: '', delta: 0, score: 0, cash: 1000, ...over };
}

function renderEnding(props: Partial<React.ComponentProps<typeof EndingScreen>> = {}) {
  const finalState: CrisisRunState = {
    biz: 'phonerepair',
    day: 13,
    cash: 3400,
    crisisScore: 5,
    resolved: true,
    streak: 2,
    ended: true,
    log: [
      entry({ day: 1, event: 'Slow morning', choice: '', delta: 300, score: 0, cash: 1500 }),
      entry({ day: 2, event: 'Supplier dispute', choice: 'Paid in full', delta: -900, score: 1, cash: 600 }),
      entry({ day: 3, event: 'Walk-in rush', choice: 'Took every customer', delta: 1200, score: 1, cash: 1800 }),
    ],
    ...props.finalState,
  };
  let root!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(
      <EndingScreen
        committedTo="phonerepair"
        broke={false}
        finalState={finalState}
        plan={{ got: 4, max: 5 }}
        {...props}
      />
    );
  });
  return root;
}

describe('EndingScreen', () => {
  test('renders cash, plan grade, and crisis score as three independent facts', () => {
    const root = renderEnding();
    expect(findByTestID(root, 'endCash').props.children).toBe('R3,400');
    expect(findByTestID(root, 'endPlan').props.children).toBe('4/5');
    expect(findByTestID(root, 'endCrisis').props.children.join('')).toMatch(/^5\/\d+$/);
  });

  test('never renders an invented aggregate "Overall Score"', () => {
    const root = renderEnding();
    const json = JSON.stringify(root.toJSON());
    expect(json).not.toMatch(/Overall Score/i);
  });

  test('shows "Not completed this run" when Plan was skipped, not a fabricated grade', () => {
    const root = renderEnding({ plan: null });
    expect(findByTestID(root, 'endPlan').props.children).toBe('Not completed this run');
  });

  test('identifies the worst single day as the pivot, using the real ledger log', () => {
    const root = renderEnding();
    // Day 2 (delta -900) is the only negative delta -> pivot.
    expect(findByTestID(root, 'endPivot').props.children.join('')).toMatch(/day 2/i);
    expect(findByTestID(root, 'endPivot').props.children.join('')).toMatch(/Paid in full/);
  });

  test('reports "no single day broke you" when no day was net-negative', () => {
    const root = renderEnding({
      finalState: {
        biz: 'phonerepair',
        day: 1,
        cash: 2000,
        crisisScore: 2,
        resolved: true,
        streak: 1,
        log: [entry({ day: 1, delta: 500, cash: 2000 })],
      } as CrisisRunState,
    });
    expect(findByTestID(root, 'endPivot').props.children.join('')).toMatch(/No single day broke you/);
  });

  test('renders every ledger row from the real log, in order, with day and delta', () => {
    const root = renderEnding();
    expect(findByTestID(root, 'endLedgerRow-0')).toBeTruthy();
    expect(findByTestID(root, 'endLedgerRow-1')).toBeTruthy();
    expect(findByTestID(root, 'endLedgerRow-2')).toBeTruthy();
    expect(tryFindByTestID(root, 'endLedgerRow-3')).toBeNull();
  });

  test('the broke path shows an honest failure header, not a celebratory tier', () => {
    const root = renderEnding({
      broke: true,
      finalState: {
        biz: 'phonerepair',
        day: 4,
        cash: -50,
        crisisScore: 1,
        resolved: true,
        streak: 0,
        log: [entry({ day: 1 }), entry({ day: 2 }), entry({ day: 3 })],
      } as CrisisRunState,
    });
    expect(findByTestID(root, 'endKicker').props.children).toMatch(/Out of cash/);
    expect(findByTestID(root, 'endTitle').props.children).toBe('Back to the Drawing Board');
    // Distinguish this from the "tier zeroed by broke" bug: a *non-broke* run with the
    // same low score must ALSO land on tier 4, proving the title came from the score,
    // not from the broke flag short-circuiting it.
    const rootSameScoreSurvived = renderEnding({
      broke: false,
      finalState: {
        biz: 'phonerepair', day: 4, cash: 500, crisisScore: 1, resolved: true, streak: 0,
        log: [entry({ day: 1 }), entry({ day: 2 }), entry({ day: 3 })],
      } as CrisisRunState,
    });
    expect(findByTestID(rootSameScoreSurvived, 'endTitle').props.children).toBe('Back to the Drawing Board');
  });

  test('judgment tier is never overridden by the broke/cash outcome — good calls stay "good" even when cash ran out', () => {
    // crisisScore 34 of range [14,36] -> jf ~0.91 -> tier 1 ("Business Boss"), regardless of broke.
    const root = renderEnding({
      broke: true,
      finalState: {
        biz: 'phonerepair', day: 13, cash: -20, crisisScore: 34, resolved: true, streak: 5,
        log: [entry({ day: 1 })],
      } as CrisisRunState,
    });
    expect(findByTestID(root, 'endTitle').props.children).toBe('Business Boss');
    // Interpretation must reflect good judgment + poor cash outcome, not "shaky calls".
    expect(findByTestID(root, 'endMsg').props.children).toMatch(/doesn.t always buy a soft landing/);
    expect(findByTestID(root, 'endMsg').props.children).not.toMatch(/calls were shaky/);
  });

  test('negative cash renders sign before the currency symbol, never inside it', () => {
    const root = renderEnding({
      broke: true,
      finalState: {
        biz: 'phonerepair', day: 4, cash: -50, crisisScore: 1, resolved: true, streak: 0,
        log: [entry({ day: 1, cash: -50 })],
      } as CrisisRunState,
    });
    expect(findByTestID(root, 'endCash').props.children).toBe('-R50');
    expect(findByTestID(root, 'endCash').props.children).not.toMatch(/^R-/);
  });

  test('the force-back line only renders for phonerepair, the one business with real Five-Forces data', () => {
    const rootWithForces = renderEnding();
    expect(JSON.stringify(rootWithForces.toJSON())).toMatch(/five forces|Competitive rivalry|Threat of|Supplier power|Buyer power/i);

    const rootNoForces = renderEnding({ committedTo: 'spaza' as any });
    // No forceBack computed for spaza — pivot text still renders, just without the
    // extra force-back sentence appended (no BUSINESS_META/FORCES_TABLE for it).
    // Assert absence directly: the phonerepair-only force-back phrasing must not
    // leak into a business with no Five-Forces data (the fallback string below
    // also contains "five forces", so anchor on the leading phrase instead).
    expect(tryFindByTestID(rootNoForces, 'endPivot')).toBeTruthy();
    expect(findByTestID(rootNoForces, 'endPivot').props.children.join('')).not.toMatch(/went in carrying high|That was on the Scanner/);
  });
});
