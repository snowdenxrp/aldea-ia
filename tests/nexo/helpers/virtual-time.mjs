// TEST-ONLY virtual clock for deterministic Nexo lock-deadline tests.
// Never import this helper from product/runtime code. A real watchdog bounds the
// test even if a code path stops using the patched timer or leaves work pending.
import { performance as perf } from "node:perf_hooks";
import { setTimeout as realSetTimeout, clearTimeout as realClearTimeout } from "node:timers";

let active = false;

function virtualTimeError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

export async function withVirtualTime(fn, {
  startMs = 1_000,
  watchdogMs = 2_000
} = {}) {
  if (typeof fn !== "function") throw new TypeError("withVirtualTime requires a function");
  if (active) throw virtualTimeError("VIRTUAL_TIME_ALREADY_ACTIVE");
  if (!Number.isFinite(startMs) || !Number.isFinite(watchdogMs) || watchdogMs <= 0) {
    throw virtualTimeError("VIRTUAL_TIME_OPTIONS_INVALID");
  }

  const previousNow = Object.getOwnPropertyDescriptor(perf, "now");
  const previousSetTimeout = Object.getOwnPropertyDescriptor(globalThis, "setTimeout");
  if (!previousSetTimeout || !("value" in previousSetTimeout)) {
    throw virtualTimeError("VIRTUAL_TIME_SETTIMEOUT_NOT_A_DATA_PROPERTY");
  }

  const realSetImmediate = globalThis.setImmediate;
  active = true;
  const clock = {
    startMs,
    current: startMs,
    sleeps: [],
    nowCalls: 0,
    active: true,
    virtualSetTimeout: null,
    elapsed() { return clock.current - clock.startMs; }
  };

  const virtualNow = () => {
    clock.nowCalls += 1;
    return clock.current;
  };
  const virtualSetTimeout = (callback, delay, ...args) => {
    if (typeof callback !== "function") {
      const error = new TypeError('The "callback" argument must be of type function.');
      error.code = "ERR_INVALID_ARG_TYPE";
      throw error;
    }
    let ms = Number(delay);
    if (!(ms >= 1 && ms <= 2 ** 31 - 1)) ms = 1;
    clock.sleeps.push(ms);
    return realSetImmediate(() => {
      if (!clock.active) return;
      clock.current += ms;
      callback(...args);
    });
  };
  clock.virtualSetTimeout = virtualSetTimeout;

  let watchdogHandle;
  try {
    Object.defineProperty(perf, "now", {
      configurable: true,
      writable: true,
      enumerable: previousNow ? previousNow.enumerable : false,
      value: virtualNow
    });
    Object.defineProperty(globalThis, "setTimeout", {
      ...previousSetTimeout,
      value: virtualSetTimeout
    });

    const operation = Promise.resolve().then(() => fn(clock));
    const watchdog = new Promise((_, reject) => {
      watchdogHandle = realSetTimeout(() => {
        reject(virtualTimeError("VIRTUAL_TIME_WATCHDOG_TIMEOUT"));
      }, watchdogMs);
    });
    return await Promise.race([operation, watchdog]);
  } finally {
    clock.active = false;
    if (watchdogHandle !== undefined) realClearTimeout(watchdogHandle);
    try {
      if (previousNow) Object.defineProperty(perf, "now", previousNow);
      else delete perf.now;
    } finally {
      try {
        Object.defineProperty(globalThis, "setTimeout", previousSetTimeout);
      } finally {
        active = false;
      }
    }
  }
}

// Prove that the production deadline factory and bare global timer calls observe
// the patched hooks. This also detects a module that cached performance.now.
export function assertVirtualTimeEffective(clock, createDeadline) {
  if (!clock || typeof createDeadline !== "function" ||
      createDeadline(1) !== clock.current + 1 ||
      globalThis.setTimeout !== clock.virtualSetTimeout) {
    throw virtualTimeError("VIRTUAL_TIME_NOT_EFFECTIVE");
  }
}
