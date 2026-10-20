import { performance } from "node:perf_hooks";

export const NEXO_DEFAULT_LOCK_WAIT_MS = 2_000;

/**
 * Creates an absolute deadline in the process-local monotonic clock domain.
 * This bounds cooperative lock-acquisition waiting only; it cannot interrupt a
 * filesystem operation that itself fails to return.
 */
export function createNexoLockDeadline(waitMs = NEXO_DEFAULT_LOCK_WAIT_MS) {
  if (typeof waitMs !== "number" || !Number.isFinite(waitMs) || waitMs <= 0) {
    const error = new Error("NEXO_LOCK_WAIT_BUDGET_INVALID");
    error.code = "NEXO_LOCK_WAIT_BUDGET_INVALID";
    throw error;
  }
  return performance.now() + waitMs;
}

export function resolveNexoLockDeadline(deadline, waitMs = NEXO_DEFAULT_LOCK_WAIT_MS) {
  if (deadline === null || deadline === undefined) return createNexoLockDeadline(waitMs);
  if (typeof deadline !== "number" || !Number.isFinite(deadline)) {
    const error = new Error("NEXO_LOCK_DEADLINE_INVALID");
    error.code = "NEXO_LOCK_DEADLINE_INVALID";
    throw error;
  }
  return deadline;
}

export function remainingNexoLockWaitMs(deadline) {
  return Math.max(0, deadline - performance.now());
}

export function nexoLockDeadlineExpired(deadline) {
  return performance.now() >= deadline;
}
