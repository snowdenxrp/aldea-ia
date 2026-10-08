import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { loadState, applyState, persistState } from "../../scripts/simulate.mjs";
import {
  AUTHORITY,
  COMMIT,
  OUTCOMES,
  VALIDATION,
  createAuthorityResult,
  createCandidate,
  createClaimEnvelope,
  createOutcome,
  createValidationResult
} from "../../src/nexo/core/contracts.mjs";
import { createCorePorts } from "../../src/nexo/core/ownership.mjs";
import { executeProtectedTransition } from "../../src/nexo/core/protected-transition.mjs";
import { createPersistStateConditionalCommit } from "../../src/nexo/adapters/conditional-commit-persist-state.mjs";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-3c-"));
const statePath = pathToFileURL(path.join(tempDir, "world-state.json"));

try {
  const initial = await loadState(statePath);
  const claim = createClaimEnvelope({
    claimId: "step-3c-real-persist",
    action: "advance-snapshot"
  });

  const conditionalCommit = createPersistStateConditionalCommit({
    persistState,
    statePath,
    clock: () => 1234567890000
  });

  const ports = createCorePorts({
    claimBuilder: { build: () => claim },
    authorityGate: {
      check: () => createAuthorityResult(AUTHORITY.AUTHORIZED)
    },
    snapshotIsolator: {
      isolate: ({ state }) => structuredClone(state)
    },
    candidateExecutor: {
      execute: ({ claim: candidateClaim, state, expectedRevision }) => {
        state.hour = Number(state.hour) + 1;
        return createCandidate({
          claim: candidateClaim,
          state,
          expectedRevision
        });
      }
    },
    finalSemanticValidator: {
      validate: candidate => createValidationResult(VALIDATION.PASS, {
        evidence: ["final-persist-gate-pass"]
      })
    },
    conditionalCommit,
    outcomeClassifier: {
      classify: ({ kind, reasons = [], evidence = [] }) =>
        createOutcome(kind, { reasons, evidence })
    }
  });

  const simulation = applyState(initial);
  const outcome = await executeProtectedTransition({
    ports,
    proposal: { action: "advance-snapshot" },
    state: simulation,
    expectedRevision: initial.stateRevision
  });

  assert.equal(outcome.kind, OUTCOMES.SAFE_COMMIT);

  const persisted = await loadState(statePath);
  assert.equal(persisted.stateRevision, initial.stateRevision + 1);
  assert.equal(persisted.hour, simulation.hour);

  const staleConditionalCommit = createPersistStateConditionalCommit({
    persistState,
    statePath,
    clock: () => 1234567891000
  });
  const stale = await staleConditionalCommit.commit({
    state: applyState(initial),
    expectedRevision: initial.stateRevision
  });

  assert.equal(stale.status, COMMIT.CONDITIONAL_CONFLICT);
  assert.equal(stale.errorCode, "STATE_REVISION_CONFLICT");

  const afterConflict = await loadState(statePath);
  assert.equal(afterConflict.stateRevision, initial.stateRevision + 1);

  console.log("NEXO STEP 3C real persistState integration tests: PASS");
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}
