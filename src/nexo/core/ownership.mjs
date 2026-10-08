const NOT_IMPLEMENTED = (name) => {
  throw new Error(`NEXO_CORE_CONTRACT_NOT_IMPLEMENTED: ${name}`);
};

/**
 * STEP 3 ownership ports.
 * These are intentionally capability-separated. No provider-facing port exposes commit.
 */

export function createCorePorts({
  proposal = {},
  claimBuilder = {},
  authorityGate = {},
  snapshotIsolator = {},
  candidateExecutor = {},
  finalSemanticValidator = {},
  conditionalCommit = {},
  outcomeClassifier = {},
  reconciliation = {},
  effectBoundary = {}
} = {}) {
  return Object.freeze({
    proposal: Object.freeze({
      propose: proposal.propose ?? (() => NOT_IMPLEMENTED("proposal.propose"))
    }),
    claimBuilder: Object.freeze({
      build: claimBuilder.build ?? (() => NOT_IMPLEMENTED("claimBuilder.build"))
    }),
    authorityGate: Object.freeze({
      check: authorityGate.check ?? (() => NOT_IMPLEMENTED("authorityGate.check"))
    }),
    snapshotIsolator: Object.freeze({
      isolate: snapshotIsolator.isolate ?? (() => NOT_IMPLEMENTED("snapshotIsolator.isolate"))
    }),
    candidateExecutor: Object.freeze({
      execute: candidateExecutor.execute ?? (() => NOT_IMPLEMENTED("candidateExecutor.execute"))
    }),
    finalSemanticValidator: Object.freeze({
      validate: finalSemanticValidator.validate ?? (() => NOT_IMPLEMENTED("finalSemanticValidator.validate"))
    }),
    conditionalCommit: Object.freeze({
      commit: conditionalCommit.commit ?? (() => NOT_IMPLEMENTED("conditionalCommit.commit"))
    }),
    outcomeClassifier: Object.freeze({
      classify: outcomeClassifier.classify ?? (() => NOT_IMPLEMENTED("outcomeClassifier.classify"))
    }),
    reconciliation: Object.freeze({
      reconcile: reconciliation.reconcile ?? (() => NOT_IMPLEMENTED("reconciliation.reconcile"))
    }),
    effectBoundary: Object.freeze({
      prepare: effectBoundary.prepare ?? (() => NOT_IMPLEMENTED("effectBoundary.prepare"))
    })
  });
}
