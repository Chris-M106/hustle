/**
 * Extracted, unmodified, from App.tsx's module-scope write-queue (originally added for
 * the Scanner slice, same pattern as the Crisis slice before it) so it can be imported
 * directly by a test harness without reimplementing it. Pure refactor-for-testability —
 * behavior, comments, and structure preserved exactly. See
 * PERSISTENCE_COEXISTENCE_EXPERIMENT.md for why this extraction happened.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Module scope, not per-instance — same reasoning as the Crisis slice: must survive
// remount so two component instances never issue concurrent setItem calls.
export let writeQueue: Promise<void> = Promise.resolve();

// `Promise.race` alone leaves the loser's timer pending after the race settles — on a
// screen that can remount, that's a real (if small) leak. `finally` clears it either way.
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([p, timeoutPromise]).finally(() => clearTimeout(timer));
}

export function queuedWrite(key: string, payload: string): Promise<void> {
  const p = writeQueue.then(() => AsyncStorage.setItem(key, payload));
  // Swallow so a failed write doesn't leave writeQueue permanently rejected for
  // whichever caller chains onto it next; failure is reported to the caller of
  // queuedWrite via the returned/awaited promise below, not lost.
  writeQueue = p.catch(() => undefined);
  return p;
}

// A stalled AsyncStorage call (device I/O hang, not a rejection) never settles, and
// since writeQueue only ever chains onto p.catch(), a hang here would permanently
// deadlock the shared queue for every future queuedWrite/queuedRemove caller too —
// same reasoning as the withTimeout use on the restore path (App.tsx). Timeout turns
// a hang into a rejection so writeQueue's existing catch(() => undefined) can recover.
const REMOVE_TIMEOUT_MS = 5000;

/** Same queue, delete instead of set — used to invalidate a downstream key (e.g. a
 *  stale Plan/Crisis record after a Scanner recommit). Goes through the same shared
 *  writeQueue as queuedWrite so a remove and a set to a different key are never
 *  reordered relative to each other. */
export function queuedRemove(key: string): Promise<void> {
  const p = writeQueue.then(() => withTimeout(AsyncStorage.removeItem(key), REMOVE_TIMEOUT_MS));
  writeQueue = p.catch(() => undefined);
  return p;
}

/** Test-only: reset the module-scope queue between test cases. Not used by app code —
 *  the app never resets it (module scope survives the app's whole lifetime), but Jest
 *  reuses the module across tests in a file unless isolated, so the harness needs this. */
export function __resetQueueForTests(): void {
  writeQueue = Promise.resolve();
}
