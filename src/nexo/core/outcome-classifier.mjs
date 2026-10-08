import { OUTCOMES, createOutcome } from "./contracts.mjs";

export function createOutcomeClassifier() {
  return Object.freeze({
    classify({ kind, reasons = [], evidence = [] } = {}) {
      if (!Object.values(OUTCOMES).includes(kind)) {
        throw new TypeError(`invalid terminal outcome: ${kind}`);
      }
      return createOutcome(kind, { reasons, evidence });
    }
  });
}
