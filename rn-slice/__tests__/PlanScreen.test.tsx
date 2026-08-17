/**
 * @format
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

import PlanScreen from '../src/screens/PlanScreen';

const SECTION_IDS = ['vision', 'customers', 'money', 'operations', 'edge'];

function renderPlan(props: { onContinue?: () => void } = {}): ReactTestRenderer.ReactTestRenderer {
  let root!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(<PlanScreen {...props} />);
  });
  return root;
}

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

function answerCurrent(root: ReactTestRenderer.ReactTestRenderer, sectionId: string, answerId: 'A' | 'B' | 'C') {
  const btn = findByTestID(root, `ans-${sectionId}-${answerId}`);
  act(() => {
    btn.props.onPress();
  });
}

function goNext(root: ReactTestRenderer.ReactTestRenderer) {
  const btn = findByTestID(root, 'planNextBtn');
  act(() => {
    btn.props.onPress();
  });
}

describe('PlanScreen', () => {
  test('renders the header and intro', () => {
    const root = renderPlan();
    expect(findByTestID(root, 'planHeader')).toBeTruthy();
    expect(findByTestID(root, 'planIntro')).toBeTruthy();
  });

  test('all 5 questions exist across the flow, each with 3 choices', () => {
    const root = renderPlan();
    SECTION_IDS.forEach((id, i) => {
      expect(findByTestID(root, `section-${id}`)).toBeTruthy();
      ['A', 'B', 'C'].forEach((a) => {
        expect(findByTestID(root, `ans-${id}-${a}`)).toBeTruthy();
      });
      if (i < SECTION_IDS.length - 1) goNext(root);
    });
  });

  test('the Operations question is present', () => {
    const root = renderPlan();
    goNext(root);
    goNext(root);
    goNext(root);
    expect(findByTestID(root, 'section-operations')).toBeTruthy();
  });

  test('nothing is selected initially', () => {
    const root = renderPlan();
    const btn = findByTestID(root, 'ans-vision-A');
    expect(btn.props.accessibilityState.selected).toBe(false);
  });

  test('selecting an answer shows it as selected, and selection is changeable', () => {
    const root = renderPlan();
    answerCurrent(root, 'vision', 'A');
    expect(findByTestID(root, 'ans-vision-A').props.accessibilityState.selected).toBe(true);
    expect(findByTestID(root, 'ans-vision-B').props.accessibilityState.selected).toBe(false);

    answerCurrent(root, 'vision', 'B');
    expect(findByTestID(root, 'ans-vision-A').props.accessibilityState.selected).toBe(false);
    expect(findByTestID(root, 'ans-vision-B').props.accessibilityState.selected).toBe(true);
  });

  test('progress indicator updates as questions are answered and navigated', () => {
    const root = renderPlan();
    expect(findByTestID(root, 'planProgress').props.children).toBeTruthy();
    expect(findByTestID(root, 'planStepIndicator').props.children.join('')).toContain('1');

    answerCurrent(root, 'vision', 'A');
    goNext(root);
    expect(findByTestID(root, 'planStepIndicator').props.children.join('')).toContain('2');
  });

  test('qualitative strength feedback appears after the first answer and updates, with no numeric score', () => {
    const root = renderPlan();
    expect(tryFindByTestID(root, 'planStrength')).toBeNull();

    answerCurrent(root, 'vision', 'A');
    const word = findByTestID(root, 'planStrengthWord');
    expect(['Shaky', 'Building', 'Solid', 'Strong']).toContain(word.props.children);
  });

  test('Continue is disabled before all 5 answered, enabled once all 5 answered', () => {
    const root = renderPlan();
    expect(findByTestID(root, 'planContinueBtn').props.disabled).toBe(true);

    const answerIds: Array<'A' | 'B' | 'C'> = ['A', 'A', 'A', 'A', 'A'];
    SECTION_IDS.forEach((id, i) => {
      answerCurrent(root, id, answerIds[i]);
      const isLast = i === SECTION_IDS.length - 1;
      expect(findByTestID(root, 'planContinueBtn').props.disabled).toBe(!isLast);
      if (!isLast) goNext(root);
    });
  });

  test('Continue calls onContinue only once all 5 are answered', () => {
    const onContinue = jest.fn();
    const root = renderPlan({ onContinue });
    const btn = () => findByTestID(root, 'planContinueBtn');

    act(() => {
      btn().props.onPress && btn().props.onPress();
    });
    expect(onContinue).not.toHaveBeenCalled();

    const answerIds: Array<'A' | 'B' | 'C'> = ['A', 'A', 'A', 'A', 'A'];
    SECTION_IDS.forEach((id, i) => {
      answerCurrent(root, id, answerIds[i]);
      if (i < SECTION_IDS.length - 1) goNext(root);
    });

    act(() => {
      btn().props.onPress && btn().props.onPress();
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('renders no numeric score, fraction, percentage, or grade text anywhere', () => {
    const root = renderPlan();
    answerCurrent(root, 'vision', 'A');
    const json = JSON.stringify(root.toJSON());
    expect(json).not.toMatch(/\d+\s*%/);
    expect(json).not.toMatch(/\d+\s*\/\s*\d+(?!\d)/); // guard against "x/y" fractions; step indicator uses " of "
    expect(json).not.toMatch(/score/i);
    expect(json).not.toMatch(/\bgrade\b/i);
  });

  test('renders no funder framing text', () => {
    const root = renderPlan();
    const json = JSON.stringify(root.toJSON());
    expect(json.toLowerCase()).not.toContain('funder');
    expect(json.toLowerCase()).not.toContain('investor');
    expect(json.toLowerCase()).not.toContain('pitch');
  });

  test('does not expose any Crisis or Ending navigation from within Plan', () => {
    const root = renderPlan();
    const json = JSON.stringify(root.toJSON());
    expect(json.toLowerCase()).not.toContain('crisis');
    expect(json.toLowerCase()).not.toContain('ending');
  });
});
