import { OUTCOMES, createOutcome } from "./contracts.mjs";

export function createOutcomeClassifier() {
  return Object.freeze({
    classify({ kind, reasons = [], evidence = [] } = {}) {
      if (!Object.values(OUTCOMES).includes(kind)) {
        throw new TypeError(`invalid terminal outcome: ${kind}`);
      }
      if (!Array.isArray(reasons)) {
        throw new TypeError("outcome reasons must be an array");
      }
      if (!Array.isArray(evidence)) {
        throw new TypeError("outcome evidence must be an array");
      }
      return createOutcome(kind, { reasons, evidence });
    }
  });
}
