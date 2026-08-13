/**
 * Regression coverage for the 2026-08-12 independent adversary pass on the Scanner
 * slice (SCANNER_SLICE_REPORT.md -> "ADVERSARY (round 2)"). Each test reproduces one
 * CRITICAL/MAJOR finding against the pre-fix behavior it describes, and is expected to
 * pass against the fixed App.tsx. Uses react-test-renderer directly (no
 * @testing-library/react-native in this project) with a manual AsyncStorage mock, same
 * approach the adversary's own throwaway reproduction used.
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
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

const STORAGE_KEY = 'hustle.scanner.v1';
const BACKUP_KEY = 'hustle.scanner.v1.corrupt-backup';

function findByTestID(root: ReactTestRenderer.ReactTestRenderer, id: string) {
  return root.root.findByProps({ testID: id });
}

beforeEach(() => {
  mockStore.clear();
  jest.clearAllMocks();
});

test('CRITICAL: a restore that fails/times out does not overwrite an existing committed save before any user action', async () => {
  const committedSave = JSON.stringify({
    scanned: { phonerepair: true },
    selected: 'phonerepair',
    committedTo: 'phonerepair',
    cash: 1300,
    setupCost: 1200,
  });
  mockStore.set(STORAGE_KEY, committedSave);
  // Force the restore read itself to fail, independent of the timeout path — same
  // "we don't know what's on disk" scenario the timeout branch hits.
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('native read failed')));
  // The bounded backup-retry read inside the catch branch should still succeed and see it.
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => Promise.resolve(committedSave));

  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });

  // The original save must still be intact in storage — not clobbered by the
  // mount-triggered "start fresh" state.
  expect(mockStore.get(STORAGE_KEY)).toBe(committedSave);
  // And it should have been backed up as evidence the failure path ran.
  expect(mockStore.get(BACKUP_KEY)).toBe(committedSave);
  void root;
});

test('MAJOR: select() is a no-op while already committed to a different business (foreign/older save)', async () => {
  mockStore.set(
    STORAGE_KEY,
    JSON.stringify({
      scanned: { foodstall: true },
      selected: 'foodstall',
      committedTo: 'foodstall',
      cash: 1300,
      setupCost: 1200,
    }),
  );

  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
  });

  // phonerepair (BIZ) hasn't been scanned/selected/committed in this restored save,
  // so the scan button should still be offered.
  const scanBtn = findByTestID(root, 'scanBtn');
  await act(async () => {
    scanBtn.props.onPress();
  });

  // Select button must NOT appear while committed elsewhere — this is the fix under
  // test. Before the fix, selecting here would desync selected/committedTo and get
  // the whole save rejected as corrupt on the next restore.
  expect(() => findByTestID(root, 'selectBtn')).toThrow();

  const persisted = JSON.parse(mockStore.get(STORAGE_KEY) as string);
  expect(persisted.committedTo).toBe('foodstall');
  expect(persisted.selected).toBe('foodstall');
});

test('MAJOR: a save with scanned as an array is rejected, not silently accepted', async () => {
  mockStore.set(
    STORAGE_KEY,
    JSON.stringify({ scanned: [], selected: null, committedTo: null, cash: null, setupCost: null }),
  );

  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
  });

  const note = findByTestID(root, 'restoreNote');
  expect(note.props.children).toContain('invalid');
});

test('MAJOR: a save with committedTo set but setupCost null is rejected', async () => {
  mockStore.set(
    STORAGE_KEY,
    JSON.stringify({ scanned: {}, selected: 'phonerepair', committedTo: 'phonerepair', cash: 1300, setupCost: null }),
  );

  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
  });

  const note = findByTestID(root, 'restoreNote');
  expect(note.props.children).toContain('invalid');
});

test('MAJOR: a save with fabricated cash/setupCost that do not reconcile to CAPITAL is rejected', async () => {
  mockStore.set(
    STORAGE_KEY,
    JSON.stringify({
      scanned: { phonerepair: true },
      selected: 'phonerepair',
      committedTo: 'phonerepair',
      cash: 999999,
      setupCost: -5,
    }),
  );

  let root!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
  });

  const note = findByTestID(root, 'restoreNote');
  expect(note.props.children).toContain('invalid');
});
