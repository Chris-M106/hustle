/**
 * @format
 * Crisis slice: the flat 14-day loop (Event -> Decision -> Consequence -> Close Day ->
 * Next Day) plus the "Yesterday: [choice label]" continuity cue. Uses the real
 * phonerepair deck (../src/domain/crisis-decks.json): day 1 is a no-decision income
 * event, day 2 is a 3-option decision event — both exercised below.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn((k: string, v: string) => {
      mockStore.set(k, v);
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      mockStore.delete(k);
      return Promise.resolve();
    }),
  },
}));

import { __resetQueueForTests } from '../src/persistence/queuedWrite';
import CrisisScreen from '../src/screens/CrisisScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

async function renderCrisis(cash = 5000): Promise<ReactTestRenderer.ReactTestRenderer> {
  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<CrisisScreen committedTo="phonerepair" openingCash={cash} />);
    await new Promise<void>((r) => setTimeout(r, 0));
  });
  return root;
}

beforeEach(() => {
  mockStore.clear();
  __resetQueueForTests();
});

describe('CrisisScreen', () => {
  test('launches and renders day 1 of 14 with no numeric score visible', async () => {
    const root = await renderCrisis();
    expect(findByTestID(root, 'crisisDayCount').props.children.join('')).toContain('Day 1');
    expect(findByTestID(root, 'crisisRemain')).toBeTruthy();
    // Momentum is shown as a word (see crisisMomentum below), never the raw
    // crisisScore number — assert against the rendered text, not an absent testID.
    const json = JSON.stringify(root.toJSON());
    expect(json).not.toMatch(/\bcrisisScore\b/);
    expect(findByTestID(root, 'crisisMomentum').props.children.join('')).toBe('Momentum: Starting out');
  });

  test('day 1 has no Yesterday cue', async () => {
    const root = await renderCrisis();
    expect(tryFindByTestID(root, 'crisisYesterday')).toBeNull();
  });

  test('day 1 (no-decision event) resolves via Take the day, then advances and shows Yesterday on day 2', async () => {
    const root = await renderCrisis();
    const takeBtn = findByTestID(root, 'takeDayBtn');
    await act(async () => {
      takeBtn.props.onPress();
    });
    expect(findByTestID(root, 'crisisOutcomeText')).toBeTruthy();

    const nextBtn = findByTestID(root, 'nextDayBtn');
    await act(async () => {
      nextBtn.props.onPress();
    });
    expect(findByTestID(root, 'crisisDayCount').props.children.join('')).toContain('Day 2');
    expect(findByTestID(root, 'crisisYesterday')).toBeTruthy();
  });

  test('a decision day renders 3 options; selecting one resolves and shows its outcome', async () => {
    const root = await renderCrisis();
    await act(async () => {
      findByTestID(root, 'takeDayBtn').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'nextDayBtn').props.onPress();
    });

    expect(findByTestID(root, 'crisisAns-A')).toBeTruthy();
    expect(findByTestID(root, 'crisisAns-B')).toBeTruthy();
    expect(findByTestID(root, 'crisisAns-C')).toBeTruthy();

    await act(async () => {
      findByTestID(root, 'crisisAns-B').props.onPress();
    });
    expect(tryFindByTestID(root, 'crisisAns-A')).toBeNull(); // resolved: decisions replaced by outcome
    expect(findByTestID(root, 'crisisOutcomeText').props.children).toMatch(/7 days/);
  });

  test('a double-tap does not double-apply, even across two different decision buttons pressed before rerender', async () => {
    const root = await renderCrisis();
    await act(async () => {
      findByTestID(root, 'takeDayBtn').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'nextDayBtn').props.onPress();
    });

    // Press two DIFFERENT options in the same batch. If the resolve guard reads a
    // stale (pre-resolve) `state` closure instead of the latest state, the second
    // press's `resolve()` call would still see `resolved: false` and overwrite the
    // first press's result — this is exactly the bug a same-value coincidence (e.g.
    // both presses computing 5,300) would hide, so this test uses options with
    // different cash deltas (A: -R900, C: -R450) so only the guard, not arithmetic
    // identity, can make it pass.
    await act(async () => {
      const btnA = findByTestID(root, 'crisisAns-A');
      const btnC = findByTestID(root, 'crisisAns-C');
      btnA.props.onPress();
      btnC.props.onPress();
    });
    const after = findByTestID(root, 'crisisCash').props.children.join('');
    // Day 1 income (deterministic slot[0], +R1200), then day 2 option A applied
    // exactly once: 5000 + 1200 - 900 = 5300. If the guard failed to block the
    // second (C) press, cash would instead read 4850 (5300 - 450).
    expect(after).toContain('5,300');
    // Confirms the FIRST press (A) won, not the second (C, which would say "R450"/
    // "compromise") — not just that arithmetic happened to land right.
    expect(findByTestID(root, 'crisisOutcomeText').props.children).toBe(
      'Paid R900. Suppliers remember who pays on time.'
    );
  });

  test('reaching the last day and closing it shows the completion screen, not Ending', async () => {
    const root = await renderCrisis(50000);
    for (let day = 0; day < 14; day++) {
      await act(async () => {
        const btn = tryFindByTestID(root, 'takeDayBtn') || findByTestID(root, 'crisisAns-A');
        btn.props.onPress();
      });
      await act(async () => {
        findByTestID(root, 'nextDayBtn').props.onPress();
      });
    }
    expect(findByTestID(root, 'crisisFinished')).toBeTruthy();
    expect(findByTestID(root, 'crisisFinishedHeader').props.children).toBe('Crisis complete');
    expect(findByTestID(root, 'crisisFinishedBody').props.children).toBe('All 14 trading days done.');
  });

  test('cash reaching zero or below ends the run as broke, not as a normal day advance', async () => {
    // Day 1 income (deterministic, +R1200) always resolves first: 0 -> 1200.
    // Day 2 option A: -R900 -> 300. Day 3 option B: -R550 -> -250 (broke).
    const root = await renderCrisis(0);
    await act(async () => {
      findByTestID(root, 'takeDayBtn').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'nextDayBtn').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'crisisAns-A').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'nextDayBtn').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'crisisAns-B').props.onPress();
    });
    await act(async () => {
      findByTestID(root, 'nextDayBtn').props.onPress();
    });
    expect(findByTestID(root, 'crisisFinished')).toBeTruthy();
    expect(findByTestID(root, 'crisisFinishedHeader').props.children).toBe('Out of cash');
  });

  test('the lesson is hidden until "Show the lesson" is tapped', async () => {
    const root = await renderCrisis();
    await act(async () => {
      findByTestID(root, 'takeDayBtn').props.onPress();
    });
    expect(tryFindByTestID(root, 'lessonBox')).toBeNull();
    await act(async () => {
      findByTestID(root, 'showLessonBtn').props.onPress();
    });
    expect(findByTestID(root, 'lessonBox')).toBeTruthy();
  });

  test('persists the run at launch via AsyncStorage under the crisis key', async () => {
    await renderCrisis();
    expect(mockStore.has('hustle.crisis.v1')).toBe(true);
    const saved = JSON.parse(mockStore.get('hustle.crisis.v1') as string);
    expect(saved.biz).toBe('phonerepair');
    expect(saved.day).toBe(0);
  });

  test('a launch-time storage failure still renders a playable day 1, not a stuck spinner', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));
    const root = await renderCrisis(5000);
    expect(tryFindByTestID(root, 'crisisLoading')).toBeNull();
    expect(findByTestID(root, 'crisisDayCount').props.children.join('')).toContain('Day 1');
    expect(findByTestID(root, 'crisisPersistNote').props.children).toBe(
      'Could not start this run — progress will not be saved.'
    );
  });
});
