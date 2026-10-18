import assert from "node:assert/strict";
import { assertNexoContinuityMemoryShape } from "../../src/nexo/core/continuity-contract.mjs";
import { assertNexoContinuitySnapshot, projectNexoContinuitySnapshot, NEXO_CONTINUITY_SCHEMA } from "../../src/nexo/core/continuity-snapshot.mjs";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { createNexoContinuityOwner } from "../../src/nexo/core/continuity-owner.mjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const plan = {
  missionId: "mission-a",
  steps: [{ id: "step-a", action: "repair_agent_state", target: { agentId: "alex" }, status: "planned", dependsOn: [] }]
};
const prepared = {
  idempotencyKey: "mission-a:step-a",
  missionId: "mission-a",
  stepId: "step-a",
  action: "repair_agent_state",
  target: { agentId: "alex" },
  status: "prepared"
};
const validMemory = {
  version: 4,
  runs: [],
  lessons: [],
  patterns: [],
  nexo: {
    missions: [plan],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: [prepared]
  }
};

assert.equal(assertNexoContinuityMemoryShape(null), true);
assert.equal(assertNexoContinuityMemoryShape(validMemory), true);

let getterCalls = 0;
const accessorMemory = {};
Object.defineProperty(accessorMemory, "nexo", {
  enumerable: true,
  get() { getterCalls += 1; return validMemory.nexo; }
});
assert.throws(
  () => assertNexoContinuityMemoryShape(accessorMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);
assert.equal(getterCalls, 0, "continuity validation must reject accessors without invoking them");

const sparseMemory = structuredClone(validMemory);
sparseMemory.nexo.effectJournal = new Array(1);
assert.throws(
  () => assertNexoContinuityMemoryShape(sparseMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);

assert.throws(
  () => assertNexoContinuityMemoryShape({version:4,nexo:{missions:[]}}),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{status:"prepared",missionId:"mission-a"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MALFORMED"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,missionId:"missing-mission"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISSING"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,action:"repair_agent_needs"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISMATCH"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,target:{agentId:"bruno"}}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISMATCH"
);


const snapshot = projectNexoContinuitySnapshot(validMemory);
assert.equal(snapshot.schema, NEXO_CONTINUITY_SCHEMA);
assert.equal(snapshot.schemaVersion, 1);
assert.equal(assertNexoContinuitySnapshot(snapshot), true);
assert.deepEqual(Object.keys(snapshot).sort(), [
  "attempts", "doNotRepeat", "effectJournal", "executions", "missions", "schema", "schemaVersion"
].sort());
assert.equal("runs" in snapshot, false);
assert.equal("lessons" in snapshot, false);
assert.equal("patterns" in snapshot, false);
snapshot.missions[0].steps[0].target.agentId = "mutated-copy";
assert.equal(validMemory.nexo.missions[0].steps[0].target.agentId, "alex", "projection must detach operational continuity from learning memory");
assert.throws(
  () => assertNexoContinuitySnapshot({...snapshot,schemaVersion:2}),
  error => error?.code === "NEXO_CONTINUITY_SNAPSHOT_SCHEMA_UNKNOWN"
);
assert.throws(
  () => assertNexoContinuitySnapshot({...snapshot,authority:{status:"AUTHORIZED"}}),
  error => error?.code === "NEXO_CONTINUITY_SNAPSHOT_SCHEMA_UNKNOWN"
);
assert.throws(
  () => projectNexoContinuitySnapshot(null),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);
assert.throws(
  () => assertNexoContinuitySnapshot({
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: 1,
    missions: [],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: [{...prepared,missionId:"orphan"}]
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISSING"
);

console.log("Nexo continuity shape, snapshot separation, and prepared-operation context contract OK.");


const storeDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owned-continuity-"));
// The store owns a separate file; the test also validates real JSON round-tripping.
const storePath = path.join(storeDirectory, "nexo-continuity.json");
const store = createNexoContinuityStore({ filePath: storePath });
const emptySnapshot = {
  schema: NEXO_CONTINUITY_SCHEMA,
  schemaVersion: 1,
  missions: [],
  attempts: [],
  doNotRepeat: [],
  executions: [],
  effectJournal: []
};
await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_NOT_FOUND",
  "missing Nexo state must not be normalized into an empty store"
);
const initialized = await store.initialize(emptySnapshot);
assert.equal(initialized.status, "committed");
assert.equal(initialized.storeRevision, 0);
assert.equal((await store.loadCurrent()).storeRevision, 0);
assert.equal((await store.initialize(emptySnapshot)).status, "conflict");

const candidateA = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_state", target: "alex" }] };
const candidateB = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_needs", target: "bruno" }] };
const outcomes = await Promise.all([
  store.commitIfCurrent(0, candidateA),
  store.commitIfCurrent(0, candidateB)
]);
assert.equal(outcomes.filter(result => result.status === "committed").length, 1);
assert.equal(outcomes.filter(result => result.status === "conflict").length, 1);
assert.equal((await store.loadCurrent()).storeRevision, 1);

const stored = (await store.loadCurrent()).snapshot;
assert.equal("world" in stored, false, "Nexo continuity store must not own Lúmina world state");
assert.equal("agents" in stored, false, "Nexo continuity store must not own Lúmina agents");
assert.equal("runs" in stored, false, "Nexo continuity store must not own learning analytics");
assert.equal("authority" in stored, false, "continuity persistence must not mint authority");
assert.deepEqual(
  await store.commitIfCurrent(1, { ...emptySnapshot, authority: { status: "AUTHORIZED" } }),
  { status: "failed", code: "NEXO_CONTINUITY_SNAPSHOT_SCHEMA_UNKNOWN" }
);
await fs.writeFile(storePath, "{broken", "utf8");
await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON",
  "corrupt Nexo continuity must fail closed"
);
await fs.rm(storeDirectory, { recursive: true, force: true });

console.log("Nexo-owned continuity store: independent file boundary, strict load, conditional commit and stale-writer conflict OK.");


const ownerDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-owner-"));
const ownerStore = createNexoContinuityStore({ filePath: path.join(ownerDirectory, "nexo-continuity.json") });
assert.equal((await ownerStore.initialize(emptySnapshot)).status, "committed");
const owner = createNexoContinuityOwner({ store: ownerStore });
const ownerMission = {
  missionId: "owner-mission",
  objective: "repair_agent_state",
  status: "planned",
  steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
};
const recordedMission = await owner.recordMission({ expectedRevision: 0, mission: ownerMission });
assert.equal(recordedMission.status, "committed");
assert.equal(recordedMission.storeRevision, 1);

const operation = {
  idempotencyKey: "owner-mission:step-1",
  missionId: "owner-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex"
};
const preparedCommit = await owner.recordPrepared({ expectedRevision: 1, operation });
assert.equal(preparedCommit.status, "committed");
assert.equal(preparedCommit.prepared, true);
assert.equal(preparedCommit.preparedCommitted, true, "only a confirmed PREPARED commit establishes durable intent");
assert.equal(preparedCommit.authorization, "NOT_EVALUATED", "durable preparation must not be confused with authorization");
assert.equal(preparedCommit.storeRevision, 2);

const persistedPrepared = await owner.loadCurrent();
assert.equal(persistedPrepared.snapshot.effectJournal[0].status, "prepared");
assert.equal(persistedPrepared.snapshot.effectJournal[0].idempotencyKey, "owner-mission:step-1");
const duplicatePrepared = await owner.recordPrepared({ expectedRevision: 2, operation });
assert.equal(duplicatePrepared.status, "prepared_existing");
assert.equal(duplicatePrepared.preparedCommitted, false, "an existing PREPARED record is not a new commit");
assert.equal(duplicatePrepared.authorization, "NOT_EVALUATED");
const wrongOperation = await owner.recordPrepared({
  expectedRevision: 2,
  operation: { ...operation, target: "bruno" }
});
assert.equal(wrongOperation.status, "blocked");
assert.equal(wrongOperation.preparedCommitted, false);
assert.equal(wrongOperation.authorization, "NOT_EVALUATED");
assert.equal((await owner.reconcilePrepared()).code, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
await fs.rm(ownerDirectory, { recursive: true, force: true });

console.log("Nexo continuity owner: mission admission, durable PREPARED-before-dispatch, identity binding and no redispatch OK.");
