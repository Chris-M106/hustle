/**
 * Domain-level tests for the recommit-invalidation contract (src/domain/recommit.ts).
 * Pure functions, no I/O, no AsyncStorage — the safety mechanism itself: given a
 * committed business and a downstream record, is that record valid FOR that business.
 */
import { isIdentityChange, isPlanValidFor, isCrisisValidFor } from '../src/domain/recommit';

describe('isIdentityChange', () => {
  test('A -> B: real identity change', () => {
    expect(isIdentityChange('phonerepair', 'spaza')).toBe(true);
  });
  test('A -> A: same business re-commit is NOT an identity change', () => {
    expect(isIdentityChange('phonerepair', 'phonerepair')).toBe(false);
  });
  test('no prior business -> B: first-ever commit is NOT an identity change', () => {
    expect(isIdentityChange(null, 'phonerepair')).toBe(false);
  });
});

describe('isPlanValidFor', () => {
  const planFor = (biz: string) => ({ businessId: biz, planConfirmedAt: 1000 });

  test('A with Plan state -> B: old Plan record is invalid for B', () => {
    expect(isPlanValidFor(planFor('phonerepair'), 'spaza')).toBe(false);
  });
  test('Plan record valid for the business it actually names', () => {
    expect(isPlanValidFor(planFor('phonerepair'), 'phonerepair')).toBe(true);
  });
  test('no committed business: nothing is valid, even a well-formed record', () => {
    expect(isPlanValidFor(planFor('phonerepair'), null)).toBe(false);
  });
  test('missing record: not valid', () => {
    expect(isPlanValidFor(null, 'phonerepair')).toBe(false);
    expect(isPlanValidFor(undefined, 'phonerepair')).toBe(false);
  });
  test('wrong-state control: malformed record (missing businessId) must fail, not pass by accident', () => {
    expect(isPlanValidFor({ planConfirmedAt: 1000 }, 'phonerepair')).toBe(false);
  });
  test('wrong-state control: businessId of the wrong type must fail', () => {
    expect(isPlanValidFor({ businessId: 42, planConfirmedAt: 1000 }, 'phonerepair')).toBe(false);
  });
});

describe('isCrisisValidFor', () => {
  const crisisFor = (biz: string) => ({ biz, day: 3, cash: 1000 });

  test('A with Crisis state -> B: old Crisis record is invalid for B', () => {
    expect(isCrisisValidFor(crisisFor('phonerepair'), 'spaza')).toBe(false);
  });
  test('Crisis record valid for the business it actually names', () => {
    expect(isCrisisValidFor(crisisFor('spaza'), 'spaza')).toBe(true);
  });
  test('no committed business: nothing is valid', () => {
    expect(isCrisisValidFor(crisisFor('spaza'), null)).toBe(false);
  });
  test('missing record: not valid', () => {
    expect(isCrisisValidFor(null, 'spaza')).toBe(false);
  });
  test('wrong-state control: record with no biz field must fail', () => {
    expect(isCrisisValidFor({ day: 3, cash: 1000 }, 'spaza')).toBe(false);
  });
});

describe('combined transition matrix (required by experiment spec)', () => {
  test('A -> B with both Plan and Crisis state present: both invalidated', () => {
    const plan = { businessId: 'phonerepair', planConfirmedAt: 1000 };
    const crisis = { biz: 'phonerepair', day: 5 };
    expect(isIdentityChange('phonerepair', 'spaza')).toBe(true);
    expect(isPlanValidFor(plan, 'spaza')).toBe(false);
    expect(isCrisisValidFor(crisis, 'spaza')).toBe(false);
    // unrelated state (the record's own content) is not mutated/erased by the guard —
    // it simply stops being trusted as authoritative for the new business.
    expect(plan).toEqual({ businessId: 'phonerepair', planConfirmedAt: 1000 });
    expect(crisis).toEqual({ biz: 'phonerepair', day: 5 });
  });

  test('A -> A: Plan/Crisis for A remain valid (no invalidation should occur)', () => {
    const plan = { businessId: 'phonerepair', planConfirmedAt: 1000 };
    const crisis = { biz: 'phonerepair', day: 5 };
    expect(isIdentityChange('phonerepair', 'phonerepair')).toBe(false);
    expect(isPlanValidFor(plan, 'phonerepair')).toBe(true);
    expect(isCrisisValidFor(crisis, 'phonerepair')).toBe(true);
  });
});
