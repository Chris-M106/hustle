/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Without this, SafeAreaProvider never resolves insets in the jest environment and
// App's children never mount — this test previously passed even if the screen threw
// on render. Found by the 2026-08-12 adversary pass (SCANNER_SLICE_REPORT.md).
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn(() => Promise.resolve()) },
}));

import App from '../App';

test('renders correctly and reaches an interactive state', async () => {
  let root!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
    await new Promise((r) => setTimeout(r, 0));
  });
  // Confirms the screen actually mounted content, not just that create() didn't throw.
  expect(root.root.findByProps({ testID: 'scanBtn' })).toBeTruthy();
});
