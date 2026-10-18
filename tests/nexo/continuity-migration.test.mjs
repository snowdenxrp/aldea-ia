import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-migration-"));
const filePath = path.join(dir, ".nexo-continuity.json");

const legacyMemory = {
  version: 4,
  runs: [{ id: "lumina-run-must-not-migrate" }],
  lessons: [{ id: "lumina-lesson-must-not-migrate" }],
  patterns: [{ id: "lumina-pattern-must-not-migrate" }],
  nexo: {
    missions: [{
      missionId: "mission-legacy-1",
      status: "planned",
      objective: "preserve continuity",
      steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned" }]
    }],
    attempts: [{ missionId: "mission-legacy-1", stepId: "step-1", status: "blocked" }],
    doNotRepeat: [{ action: "repair_agent_needs", target: "bruno" }],
    executions: [{ missionId: "mission-legacy-1", stepId: "step-1", result: { status: "blocked" } }],
    effectJournal: [{
      idempotencyKey: "mission-legacy-1:step-1",
      missionId: "mission-legacy-1",
      stepId: "step-1",
      action: "repair_agent_state",
      target: "alex",
      status: "prepared",
      at: "2026-10-18T00:00:00.000Z"
    }]
  }
};

try {
  const migrated = await openNexoContinuityOwner({ filePath, legacyMemory });
  assert.equal(migrated.current.storeRevision, 0);
  assert.deepEqual(migrated.current.snapshot.missions, legacyMemory.nexo.missions);
  assert.deepEqual(migrated.current.snapshot.attempts, legacyMemory.nexo.attempts);
  assert.deepEqual(migrated.current.snapshot.doNotRepeat, legacyMemory.nexo.doNotRepeat);
  assert.deepEqual(migrated.current.snapshot.executions, legacyMemory.nexo.executions);
  assert.deepEqual(migrated.current.snapshot.effectJournal, legacyMemory.nexo.effectJournal);
  assert.equal("runs" in migrated.current.snapshot, false);
  assert.equal("lessons" in migrated.current.snapshot, false);
  assert.equal("patterns" in migrated.current.snapshot, false);
  assert.equal(migrated.current.snapshot.effectJournal[0].status, "prepared");

  // Reopening prefers the canonical Nexo store and never merges stale legacy data.
  const reopened = await openNexoContinuityOwner({
    filePath,
    legacyMemory: { version: 4, runs: [], lessons: [], patterns: [], nexo: {
      missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
    } }
  });
  assert.deepEqual(reopened.current.snapshot, migrated.current.snapshot);
  assert.equal(reopened.current.storeRevision, migrated.current.storeRevision);

  // Corruption of the canonical store must not silently fall back to legacy data.
  await fs.writeFile(filePath, "{corrupt", "utf8");
  await assert.rejects(
    () => openNexoContinuityOwner({ filePath, legacyMemory }),
    error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON"
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}

const missingDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-missing-"));
try {
  await assert.rejects(
    () => openNexoContinuityOwner({ filePath: path.join(missingDir, "nexo.json") }),
    error => error?.code === "NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN",
    "missing prior continuity must not be fabricated as empty by default"
  );
  const fresh = await openNexoContinuityOwner({
    filePath: path.join(missingDir, "fresh-nexo.json"),
    allowEmptyInitialization: true
  });
  assert.equal(fresh.current.storeRevision, 0);
  assert.deepEqual(fresh.current.snapshot.missions, []);
  assert.deepEqual(fresh.current.snapshot.effectJournal, []);
} finally {
  await fs.rm(missingDir, { recursive: true, force: true });
}

console.log("Nexo continuity migration: legacy transfer, prepared-obligation preservation, canonical reopen, corrupt-store fail-closed and explicit empty bootstrap OK.");
