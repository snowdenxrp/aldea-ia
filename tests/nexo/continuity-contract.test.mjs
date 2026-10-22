import assert from "node:assert/strict";
import { assertNexoContinuityMemoryShape } from "../../src/nexo/core/continuity-contract.mjs";
import { assertNexoContinuitySnapshot, projectNexoContinuitySnapshot, NEXO_CONTINUITY_SCHEMA } from "../../src/nexo/core/continuity-snapshot.mjs";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { createNexoContinuityOwner } from "../../src/nexo/core/continuity-owner.mjs";
import { recordNexoMissionInSnapshot, recordNexoExecutionInSnapshot, recordNexoOutcomeInSnapshot, reconstructNexoMissionFromSnapshot } from "../../src/nexo/core/continuity-operations.mjs";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
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

// Persisted snapshot validation must enforce the same per-mission admission ceiling
// as new mission admission. Otherwise direct store initialize/commit paths could
// bypass the 256-step limit by supplying a prebuilt snapshot.
const overLimitPersistedMissionSnapshot = {
  schema: NEXO_CONTINUITY_SCHEMA,
  schemaVersion: 1,
  missions: [{
    missionId: "mission-over-limit",
    steps: Array.from({ length: 257 }, (_, index) => ({
      id: `step-${index}`, action: "inspect_input", dependsOn: []
    }))
  }],
  attempts: [],
  doNotRepeat: [],
  executions: [],
  effectJournal: []
};
assert.throws(
  () => assertNexoContinuitySnapshot(overLimitPersistedMissionSnapshot),
  error => error?.code === "NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED",
  "persisted snapshots must not bypass the shared per-mission step ceiling"
);

function nestedRecord(depth) {
  let value = { leaf: true };
  for (let index = 0; index < depth; index += 1) value = { nested: value };
  return value;
}
const overDepthSnapshot = {
  schema: NEXO_CONTINUITY_SCHEMA,
  schemaVersion: 1,
  missions: [],
  attempts: [{ payload: nestedRecord(40) }],
  doNotRepeat: [],
  executions: [],
  effectJournal: []
};
assert.throws(
  () => assertNexoContinuitySnapshot(overDepthSnapshot),
  error => error?.code === "NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED",
  "snapshot nesting must be bounded iteratively before recursive contract validation"
);

const overDepthLegacyMemory = structuredClone(validMemory);
overDepthLegacyMemory.nexo.attempts = [{ payload: nestedRecord(40) }];
assert.throws(
  () => assertNexoContinuityMemoryShape(overDepthLegacyMemory),
  error => error?.code === "NEXO_CONTINUITY_MEMORY_RESOURCE_LIMIT_EXCEEDED",
  "legacy-memory projection must bound nesting before recursive contract validation"
);
assert.throws(
  () => projectNexoContinuitySnapshot(overDepthLegacyMemory),
  error => error?.code === "NEXO_CONTINUITY_MEMORY_RESOURCE_LIMIT_EXCEEDED",
  "legacy-memory projection must reject excessive nesting before cloning a snapshot"
);

const duplicateStepMemory = structuredClone(validMemory);
duplicateStepMemory.nexo.missions[0].steps.push({
  id: "step-a", action: "repair_agent_needs", target: { agentId: "bravo" }, status: "planned", dependsOn: []
});
assert.throws(
  () => assertNexoContinuityMemoryShape(duplicateStepMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
  "persisted duplicate step identities must fail closed before reconstruction"
);
const duplicateMissionMemory = structuredClone(validMemory);
duplicateMissionMemory.nexo.missions.push(structuredClone(duplicateMissionMemory.nexo.missions[0]));
assert.throws(
  () => assertNexoContinuityMemoryShape(duplicateMissionMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
  "persisted duplicate mission identities must fail closed before reconstruction"
);

function assertPersistedMissionShapeRejected(mission, label) {
  const malformed = structuredClone(validMemory);
  malformed.nexo.missions = [mission];
  assert.throws(
    () => assertNexoContinuityMemoryShape(malformed),
    error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
    label
  );
}
const missionWithoutIdentity = structuredClone(plan);
delete missionWithoutIdentity.missionId;
assertPersistedMissionShapeRejected(
  missionWithoutIdentity,
  "persisted mission records without an identity must be rejected before reconstruction"
);
const missionWithoutSteps = structuredClone(plan);
delete missionWithoutSteps.steps;
assertPersistedMissionShapeRejected(
  missionWithoutSteps,
  "persisted mission records without a steps array must be rejected instead of defaulting to an empty mission"
);
assertPersistedMissionShapeRejected(
  { ...structuredClone(plan), missionId: "mission:ambiguous" },
  "persisted mission IDs must obey the delimiter-safe identity contract used at admission"
);

function assertPersistedMissionGraphRejected(steps, label) {
  const malformed = structuredClone(validMemory);
  malformed.nexo.missions[0].steps = steps;
  assert.throws(
    () => assertNexoContinuityMemoryShape(malformed),
    error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
    label
  );
}
assertPersistedMissionGraphRejected(
  [{ id: "step-a", action: "repair_agent_state", target: { agentId: "alex" }, status: "planned", dependsOn: "step-b" }],
  "persisted non-array dependencies must be rejected before reconstruction"
);
assertPersistedMissionGraphRejected(
  [{ id: "step-a", action: "repair_agent_state", target: { agentId: "alex" }, status: "planned", dependsOn: ["missing-step"] }],
  "persisted dangling dependency references must be rejected before reconstruction"
);
assertPersistedMissionGraphRejected([
  { id: "step-a", action: "repair_agent_state", target: { agentId: "alex" }, status: "planned", dependsOn: ["step-b"] },
  { id: "step-b", action: "local_analysis", target: "alex", status: "planned", dependsOn: ["step-a"] }
], "persisted cyclic dependency graphs must be rejected before reconstruction");


// Additional persisted-graph edge cases: the validator already rejects these
// shapes; keep the fail-closed contract explicit at the reconstruction boundary.
const sparseDependencySteps = [
  { id: "step-a", action: "repair_agent_state", target: "alpha", status: "planned", dependsOn: [] },
  { id: "step-b", action: "local_analysis", target: "beta", status: "planned", dependsOn: new Array(1) }
];
assertPersistedMissionGraphRejected(
  sparseDependencySteps,
  "sparse persisted dependency arrays must be rejected before reconstruction"
);
assertPersistedMissionGraphRejected(
  [
    { id: "step-a", action: "repair_agent_state", target: "alpha", status: "planned", dependsOn: ["step-b", "step-b"] },
    { id: "step-b", action: "local_analysis", target: "beta", status: "planned", dependsOn: [] }
  ],
  "duplicate persisted dependency references must be rejected before reconstruction"
);
assertPersistedMissionGraphRejected(
  [{ id: "step-a", action: "repair_agent_state", target: "alpha", status: "planned", dependsOn: ["step-a"] }],
  "self-referential persisted dependencies must be rejected before reconstruction"
);


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


const emptyOperationalSnapshot = {
  schema: NEXO_CONTINUITY_SCHEMA,
  schemaVersion: 1,
  missions: [],
  attempts: [],
  doNotRepeat: [],
  executions: [],
  effectJournal: []
};


// Representative accepted mission fixture: exercise the shared admission guard
// through the real persistence-contract entrypoint, not only with synthetic
// boundary objects. This is a contract fixture, not a production-capacity claim.
const representativeMission = {
  missionId: "representative-local-analysis",
  status: "planned",
  objective: "local_analysis",
  uncertainty: { level: "bounded", reasons: ["input_requires_review"] },
  steps: Array.from({ length: 12 }, (_, index) => ({
    id: `analysis-step-${index + 1}`,
    action: index === 0 ? "inspect_input" : "local_analysis",
    target: { artifact: `local-artifact-${index + 1}`, scope: "read_only" },
    status: "planned",
    dependsOn: index === 0 ? [] : [`analysis-step-${index}`],
    context: {
      purpose: "bounded_local_review",
      ordinal: index + 1,
      constraints: ["no_dispatch", "no_persistence"],
      evidence: { source: "user_supplied", confidence: "unverified" }
    },
    priority: index < 3 ? "high" : "normal",
    requiresVerification: true
  }))
};
const representativeSnapshot = recordNexoMissionInSnapshot(
  emptyOperationalSnapshot,
  representativeMission
);
assert.equal(representativeSnapshot.missions.length, 1);
assert.equal(representativeSnapshot.missions[0].steps.length, 12);
assert.deepEqual(
  representativeSnapshot.missions[0].steps.map(step => step.id),
  representativeMission.steps.map(step => step.id),
  "admission must preserve all valid steps rather than truncate a mission"
);
assert.deepEqual(
  representativeSnapshot.missions[0].steps[11].context,
  representativeMission.steps[11].context,
  "admission must preserve nested context data"
);

// Independent valid graph shape: a fork followed by a join, with compact
// string targets, omitted defaults, and the other documented optional fields.
// This checks graph topology and accepted-field variety, not resource ceilings.
const branchedMission = {
  missionId: "representative-branched-analysis",
  steps: [
    { id: "root", action: "inspect_input", target: "local-input", dependsOn: [] },
    { id: "left", action: "analyze_structure", target: "local-input", dependsOn: ["root"], reason: "structural pass", source: "user_supplied", reversible: true, requiresEvidence: true },
    { id: "right", action: "analyze_constraints", target: "local-input", dependsOn: ["root"], reason: "constraint pass", source: "user_supplied", reversible: true, requiresEvidence: true },
    { id: "join", action: "summarize_findings", target: "local-report", dependsOn: ["left", "right"] }
  ]
};
const branchedSnapshot = recordNexoMissionInSnapshot(emptyOperationalSnapshot, branchedMission);
assert.equal(branchedSnapshot.missions.length, 1);
assert.deepEqual(
  branchedSnapshot.missions[0].steps.map(step => ({ id: step.id, dependsOn: step.dependsOn })),
  [
    { id: "root", dependsOn: [] },
    { id: "left", dependsOn: ["root"] },
    { id: "right", dependsOn: ["root"] },
    { id: "join", dependsOn: ["left", "right"] }
  ],
  "admission must preserve a valid fork/join dependency graph without rewriting its topology"
);
assert.equal(branchedSnapshot.missions[0].status, "planned", "omitted mission status must use the documented default");
assert.equal(branchedSnapshot.missions[0].steps[0].status, "planned", "omitted step status must use the documented default");
assert.equal(branchedSnapshot.missions[0].steps[1].reason, "structural pass");
assert.equal(branchedSnapshot.missions[0].steps[1].source, "user_supplied");
assert.equal(branchedSnapshot.missions[0].steps[1].reversible, true);
assert.equal(branchedSnapshot.missions[0].steps[1].requiresEvidence, true);

assert.throws(
  () => reconstructNexoMissionFromSnapshot({
    ...emptyOperationalSnapshot,
    missions: [{ steps: [] }]
  }, undefined),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
  "reconstruction must reject malformed persisted records rather than selecting an identity-less mission for undefined"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "mission:with:colon",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must enforce the same delimiter-safe identity contract as PREPARED operations"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "mission-safe",
    status: "planned",
    steps: [{ id: "step:with:colon", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "step admission must enforce the same delimiter-safe identity contract as PREPARED operations"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "duplicate-step-identity",
    status: "planned",
    steps: [
      { id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] },
      { id: "step-1", action: "repair_agent_state", target: "bravo", status: "planned", dependsOn: [] }
    ]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "duplicate step IDs alias the missionId:stepId idempotency identity and must be rejected at admission"
);

assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "non-string-action",
    status: "planned",
    steps: [{ id: "step-1", action: 42, target: "alpha", status: "planned", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject non-string actions before persisting a planned step"
);

assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "non-string-mission-status",
    status: 7,
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject non-string mission status values before persistence"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "non-string-step-status",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: { state: "planned" }, dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject non-string step status values"
);

assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "unknown-mission-status",
    status: "unknown_mission_state",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "new mission admission must reject unknown mission status values"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "unknown-step-status",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "awaiting_verification", dependsOn: [] }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "new mission admission must not persist a runtime-only or unknown step status"
);




assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "malformed-dependency-shape",
    status: "planned",
    steps: [
      { id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: "step-2" },
      { id: "step-2", action: "local_analysis", target: "bravo", status: "planned", dependsOn: [] }
    ]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "a non-array dependsOn value must not be silently treated as no dependencies"
);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "unknown-dependency-reference",
    status: "planned",
    steps: [
      { id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: ["missing-step"] }
    ]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "dependencies must resolve to a step in the same admitted mission"
);

const functionTargetMission = {
  missionId: "function-target",
  status: "planned",
  steps: [{ id: "step-1", action: "local_analysis", target: () => "not-persistable", status: "planned", dependsOn: [] }]
};
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, functionTargetMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject function values before persistence"
);

const symbolTargetMission = {
  missionId: "symbol-target",
  status: "planned",
  steps: [{ id: "step-1", action: "local_analysis", target: Symbol("not-persistable"), status: "planned", dependsOn: [] }]
};
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, symbolTargetMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject symbol values before persistence"
);

const cyclicTarget = {};
cyclicTarget.self = cyclicTarget;
const cyclicTargetMission = {
  missionId: "cyclic-target",
  status: "planned",
  steps: [{ id: "step-1", action: "local_analysis", target: cyclicTarget, status: "planned", dependsOn: [] }]
};
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, cyclicTargetMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject cyclic target data before persistence"
);

const nonFiniteTargetMission = {
  missionId: "non-finite-target",
  status: "planned",
  steps: [{ id: "step-1", action: "local_analysis", target: { value: Number.POSITIVE_INFINITY }, status: "planned", dependsOn: [] }]
};
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, nonFiniteTargetMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "mission admission must reject non-finite numbers that cannot round-trip through JSON"
);

const functionContextMission = {
  missionId: "function-context",
  status: "planned",
  steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [], context: { callback: () => "not-persistable" } }]
};
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, functionContextMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "uncloneable values in persisted mission context must return the structured admission error"
);



const sparseDependencies = new Array(1);
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "sparse-dependency-reference",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: sparseDependencies }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "sparse dependency arrays must be rejected as malformed mission data, not traversed as an undefined step"
);

const sparseDependenciesWithExtraKey = new Array(1);
sparseDependenciesWithExtraKey.extra = "not a dependency index";
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
    missionId: "sparse-dependency-with-extra-key",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: sparseDependenciesWithExtraKey }]
  }),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
  "extra array properties must not mask holes in the dependency index sequence"
);
for (const invalidGraph of [
  {
    missionId: "self-dependent-step",
    steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: ["step-1"] }]
  },
  {
    missionId: "duplicate-dependency-reference",
    steps: [
      { id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] },
      { id: "step-2", action: "local_analysis", target: "bravo", status: "planned", dependsOn: ["step-1", "step-1"] }
    ]
  },
  {
    missionId: "cyclic-dependencies",
    steps: [
      { id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: ["step-2"] },
      { id: "step-2", action: "local_analysis", target: "bravo", status: "planned", dependsOn: ["step-1"] }
    ]
  }
]) {
  assert.throws(
    () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, {
      ...invalidGraph, status: "planned"
    }),
    error => error?.code === "NEXO_MISSION_CONTEXT_INVALID",
    `invalid dependency graph ${invalidGraph.missionId} must not be persisted`
  );
}

let missionGetterCalls = 0;
const accessorMission = {
  steps: [{ id: "step-1", action: "local_analysis", target: "alpha", status: "planned", dependsOn: [] }]
};
Object.defineProperty(accessorMission, "missionId", {
  enumerable: true,
  get() { missionGetterCalls += 1; return "getter-mission"; }
});
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, accessorMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID"
);
assert.equal(missionGetterCalls, 0,
  "mission admission must reject accessors before evaluating caller-provided getters");

let nestedMissionGetterCalls = 0;
const nestedAccessorStep = {
  id: "step-1", action: "local_analysis", status: "planned", dependsOn: []
};
Object.defineProperty(nestedAccessorStep, "target", {
  enumerable: true,
  get() { nestedMissionGetterCalls += 1; return "alpha"; }
});
const nestedAccessorMission = { missionId: "nested-accessor-mission", steps: [nestedAccessorStep] };
assert.throws(
  () => recordNexoMissionInSnapshot(emptyOperationalSnapshot, nestedAccessorMission),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID"
);
assert.equal(nestedMissionGetterCalls, 0,
  "mission admission must reject nested step accessors before traversing targets or dependencies");

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

// The public owner boundary must reject accessor-backed mission fields before reading them.
let ownerMissionGetterInvoked = false;
const accessorOwnerMission = {
  get missionId() {
    ownerMissionGetterInvoked = true;
    return "owner-accessor-mission";
  },
  objective: "repair_agent_state",
  status: "planned",
  steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
};
const accessorOwnerResult = await owner.recordMission({
  expectedRevision: 1,
  mission: accessorOwnerMission
});
assert.equal(ownerMissionGetterInvoked, false, "owner admission must not execute caller-owned mission getters");
assert.notEqual(accessorOwnerResult.status, "committed");
assert.equal((await owner.loadCurrent()).storeRevision, 1, "accessor-backed mission must not mutate canonical continuity");

const invalidOwnerMission = {
  missionId: "owner-invalid-function-target",
  objective: "repair_agent_state",
  status: "planned",
  steps: [{ id: "step-1", action: "repair_agent_state", target: () => "not-persistable", status: "planned", dependsOn: [] }]
};
const invalidOwnerResult = await owner.recordMission({
  expectedRevision: 1,
  mission: invalidOwnerMission
});
assert.equal(invalidOwnerResult.status, "conflict");
assert.equal(invalidOwnerResult.code, "NEXO_MISSION_CONTEXT_INVALID");
assert.equal(invalidOwnerResult.storeRevision, 1);
assert.equal(
  (await owner.loadCurrent()).storeRevision,
  1,
  "invalid mission admission must stop before commitIfCurrent changes the canonical revision"
);

const invalidActionResult = await owner.recordMission({
  expectedRevision: 1,
  mission: {
    missionId: "owner-invalid-action",
    objective: "repair_agent_state",
    status: "planned",
    steps: [{ id: "step-1", action: 42, target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(invalidActionResult.status, "conflict");
assert.equal(invalidActionResult.code, "NEXO_MISSION_CONTEXT_INVALID");
assert.equal(invalidActionResult.storeRevision, 1);
assert.equal(
  (await owner.loadCurrent()).storeRevision,
  1,
  "a mission with a non-string action must not advance the canonical store revision"
);

const invalidStatusResult = await owner.recordMission({
  expectedRevision: 1,
  mission: {
    missionId: "owner-invalid-status",
    objective: "repair_agent_state",
    status: 7,
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(invalidStatusResult.status, "conflict");
assert.equal(invalidStatusResult.code, "NEXO_MISSION_CONTEXT_INVALID");
assert.equal(invalidStatusResult.storeRevision, 1);
assert.equal(
  (await owner.loadCurrent()).storeRevision,
  1,
  "a mission with malformed status must not advance the canonical store revision"
);

const invalidStatusVocabularyResult = await owner.recordMission({
  expectedRevision: 1,
  mission: {
    missionId: "owner-unknown-step-status",
    objective: "repair_agent_state",
    status: "planned",
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "awaiting_verification", dependsOn: [] }]
  }
});
assert.equal(invalidStatusVocabularyResult.status, "conflict");
assert.equal(invalidStatusVocabularyResult.code, "NEXO_MISSION_CONTEXT_INVALID");
assert.equal(invalidStatusVocabularyResult.storeRevision, 1);
assert.equal(
  (await owner.loadCurrent()).storeRevision,
  1,
  "a mission with unknown status vocabulary must not advance the canonical store revision"
);


const operation = {
  idempotencyKey: "owner-mission:step-1",
  missionId: "owner-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex",
  environmentStateRevision: 0
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

const recoveredMission = await owner.reconstructMission("owner-mission");
assert.equal(recoveredMission.status, "reconstructed");
assert.equal(recoveredMission.storeRevision, 2);
assert.equal(recoveredMission.mission.missionId, "owner-mission");
assert.equal(recoveredMission.mission.steps[0].action, "repair_agent_state");
assert.equal(recoveredMission.mission.steps[0].target, "alex");
assert.equal(recoveredMission.mission.status, "blocked", "a mission with unresolved PREPARED must not reconstruct as executable");
assert.equal(recoveredMission.mission.steps[0].status, "blocked");
assert.equal(recoveredMission.mission.steps[0].blockReason.code, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
assert.equal(recoveredMission.mission.steps[0].blockReason.idempotencyKey, "owner-mission:step-1");
assert.equal((await owner.reconstructMission("missing-mission")).status, "not_found");
assert.equal((await owner.reconstructMission("")).code, "NEXO_MISSION_ID_INVALID");
assert.equal(
  Object.keys(owner).includes("reconstructMission"),
  true,
  "restart reconstruction must be exposed by the Nexo-owned continuity boundary"
);
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

// Verifier output is data too: reject accessors before inspecting observation fields.
const verifierDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-verifier-"));
const verifierStore = createNexoContinuityStore({ filePath: path.join(verifierDirectory, "nexo-continuity.json") });
assert.equal((await verifierStore.initialize(emptySnapshot)).status, "committed");
let verifierObservationGetterInvoked = false;
const verifierOwner = createNexoContinuityOwner({
  store: verifierStore,
  effectVerifiers: {
    local_analysis: async () => ({
      get status() {
        verifierObservationGetterInvoked = true;
        return "applied";
      },
      idempotencyKey: "verifier-mission:step-1",
      action: "local_analysis",
      target: "alex",
      observedRevision: 1,
      source: "test-verifier",
      evidence: { checked: true }
    })
  }
});
const verifierMissionResult = await verifierOwner.recordMission({
  expectedRevision: 0,
  mission: {
    missionId: "verifier-mission",
    objective: "local_analysis",
    status: "planned",
    steps: [{ id: "step-1", action: "local_analysis", target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(verifierMissionResult.status, "committed");
const verifierOperation = {
  idempotencyKey: "verifier-mission:step-1",
  missionId: "verifier-mission",
  stepId: "step-1",
  action: "local_analysis",
  target: "alex"
};
assert.equal((await verifierOwner.recordPrepared({ expectedRevision: 1, operation: verifierOperation })).status, "committed");
const invalidVerifierObservation = await verifierOwner.reconcilePrepared({
  expectedRevision: 2,
  operation: verifierOperation
});
assert.equal(verifierObservationGetterInvoked, false, "verifier output accessors must be rejected without invocation");
assert.equal(invalidVerifierObservation.status, "blocked");
assert.equal(invalidVerifierObservation.code, "NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID");
assert.equal(invalidVerifierObservation.journalSettled, false);
assert.equal((await verifierOwner.loadCurrent()).storeRevision, 2, "invalid verifier output must not mutate continuity");
await fs.rm(verifierDirectory, { recursive: true, force: true });

console.log("Nexo continuity owner: mission admission, durable PREPARED-before-dispatch, identity binding and no redispatch OK.");


const coreMission = {
  missionId: "core-mission",
  version: 4,
  status: "planned",
  objective: "local_analysis",
  generatedAt: "2026-10-18T00:00:00.000Z",
  steps: [{ id: "step-1", action: "local_analysis", target: "alex", status: "planned", dependsOn: [] }]
};
let operationalSnapshot = recordNexoMissionInSnapshot(emptySnapshot, coreMission);
assert.equal(operationalSnapshot.missions.length, 1);
assert.throws(
  () => recordNexoOutcomeInSnapshot(operationalSnapshot, {
    missionId: "core-mission", stepId: "step-1", action: "local_analysis",
    target: "alex", status: "completed", evidence: { verified: false, kind: "effect-postcondition" }
  }),
  error => error?.code === "NEXO_COMPLETION_EVIDENCE_UNVERIFIED"
);
operationalSnapshot = recordNexoOutcomeInSnapshot(operationalSnapshot, {
  missionId: "core-mission", stepId: "step-1", action: "local_analysis",
  target: "alex", status: "completed", evidence: { verified: true, kind: "effect-postcondition", source: "test-postcondition" }
});
operationalSnapshot = recordNexoOutcomeInSnapshot(operationalSnapshot, {
  missionId: "core-mission", stepId: "step-1", action: "local_analysis",
  target: "alex", status: "failed", evidence: { verified: false, kind: "late-replay", source: "test-replay" }
});
assert.throws(
  () => recordNexoOutcomeInSnapshot(operationalSnapshot, {
    missionId: "core-mission", stepId: "step-1", action: "local_analysis",
    target: "alex", status: "completed", evidence: { verified: true, kind: "effect-postcondition" }
  }),
  error => error?.code === "NEXO_COMPLETION_EVIDENCE_UNVERIFIED",
  "completion claims must name their evidence source; the label itself is not authentication"
);
const reconstructedCoreMission = reconstructNexoMissionFromSnapshot(operationalSnapshot, "core-mission");
assert.equal(reconstructedCoreMission.steps[0].status, "completed", "late replay must not regress a verified completed step");

// Terminal journal records can outlive their mission plan under bounded retention.
// A known terminal record for a pruned historical mission must not block an unrelated retained mission.
const prunedMissionTerminalSnapshot = structuredClone(operationalSnapshot);
prunedMissionTerminalSnapshot.effectJournal.push({
  idempotencyKey: "pruned-old-mission:step-1",
  missionId: "pruned-old-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "old-agent",
  status: "settled_observed"
});
const reconstructedWithPrunedTerminal = reconstructNexoMissionFromSnapshot(
  prunedMissionTerminalSnapshot, "core-mission"
);
assert.equal(reconstructedWithPrunedTerminal.steps[0].status, "completed",
  "a terminal journal record for a pruned historical mission must not block an unrelated retained mission");
assert.equal(reconstructedWithPrunedTerminal.status, "awaiting_verification");

// An unrecognized effect-journal state may represent an effect with unknown outcome.
// It must not reconstruct a planned step as executable or be treated as terminal history.
const unknownEffectStateSnapshot = recordNexoMissionInSnapshot(emptySnapshot, {
  missionId: "unknown-effect-state",
  status: "planned",
  steps: [{
    id: "step-1", action: "repair_agent_state", target: "alex",
    status: "planned", dependsOn: []
  }]
});
unknownEffectStateSnapshot.effectJournal.push({
  idempotencyKey: "unknown-effect-state:step-1",
  missionId: "unknown-effect-state",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex",
  status: "future_state_v9"
});
const reconstructedUnknownEffectState = reconstructNexoMissionFromSnapshot(
  unknownEffectStateSnapshot, "unknown-effect-state"
);
assert.equal(reconstructedUnknownEffectState.status, "blocked",
  "an unrecognized effect state must block reconstruction instead of leaving the step runnable");
assert.equal(reconstructedUnknownEffectState.steps[0].status, "blocked");
assert.equal(reconstructedUnknownEffectState.steps[0].blockReason.code, "NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN");
assert.equal(reconstructedUnknownEffectState.uncertainty, "effect_journal_state_unknown");

const orphanUnknownEffectSnapshot = recordNexoMissionInSnapshot(emptySnapshot, {
  missionId: "unrelated-retained-mission",
  status: "planned",
  steps: [{
    id: "step-1", action: "local_analysis", target: "bravo",
    status: "planned", dependsOn: []
  }]
});
orphanUnknownEffectSnapshot.effectJournal.push({
  idempotencyKey: "pruned-mission:step-1",
  missionId: "pruned-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "old-agent",
  status: "future_state_v9"
});
const reconstructedWithOrphanUnknownEffect = reconstructNexoMissionFromSnapshot(
  orphanUnknownEffectSnapshot, "unrelated-retained-mission"
);
assert.equal(reconstructedWithOrphanUnknownEffect.status, "blocked",
  "an unknown unresolved effect without a retained owner plan must fail closed globally");
assert.equal(reconstructedWithOrphanUnknownEffect.uncertainty, "effect_journal_status_unknown");

const conflictingOutcomeSnapshot = structuredClone(operationalSnapshot);
conflictingOutcomeSnapshot.attempts.push({
  missionId: "core-mission", stepId: "step-1", action: "local_analysis",
  target: "alex", status: "completed",
  evidence: { verified: true, kind: "effect-postcondition", source: "different-postcondition" }
});
const conflictingOutcomeMission = reconstructNexoMissionFromSnapshot(conflictingOutcomeSnapshot, "core-mission");
assert.equal(conflictingOutcomeMission.status, "blocked",
  "conflicting verified terminal evidence must block reconstruction instead of selecting by array order");
assert.equal(conflictingOutcomeMission.steps[0].status, "blocked");
assert.equal(conflictingOutcomeMission.steps[0].blockReason.code, "NEXO_OUTCOME_EVIDENCE_CONFLICT");
assert.equal(conflictingOutcomeMission.uncertainty, "outcome_evidence_conflict");
const mismatchedOutcomeSnapshot = structuredClone(operationalSnapshot);
mismatchedOutcomeSnapshot.attempts.push({
  missionId: "core-mission", stepId: "step-1", action: "repair_agent_needs",
  target: "different-target", status: "completed",
  evidence: { verified: true, kind: "effect-postcondition", source: "mismatched-operation" }
});
const mismatchedOutcomeMission = reconstructNexoMissionFromSnapshot(mismatchedOutcomeSnapshot, "core-mission");
assert.equal(mismatchedOutcomeMission.status, "blocked",
  "a verified completion must not mask another completed claim with a different operation identity");
assert.equal(mismatchedOutcomeMission.steps[0].status, "blocked");
assert.equal(mismatchedOutcomeMission.steps[0].blockReason.code, "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH");
assert.equal(mismatchedOutcomeMission.uncertainty, "outcome_operation_context_mismatch");
assert.equal(reconstructedCoreMission.objective, "verify_mission_outcome");
assert.equal("patterns" in reconstructedCoreMission.operationalSignals, false);
assert.equal(reconstructNexoMissionFromSnapshot(operationalSnapshot, "missing-mission"), null);

// Low-level continuity operations must validate the entire caller record before destructuring fields.
let executionResultGetterInvoked = false;
const accessorExecutionInput = {
  idempotencyKey: "core-mission:accessor-result",
  missionId: "core-mission",
  stepId: "step-1",
  action: "local_analysis",
  target: "alex",
  get result() {
    executionResultGetterInvoked = true;
    return { status: "completed", verified: true };
  }
};
assert.throws(
  () => recordNexoExecutionInSnapshot(operationalSnapshot, accessorExecutionInput),
  error => error?.code === "NEXO_EXECUTION_CONTEXT_INVALID",
  "execution lineage must reject accessor-backed input records before field access"
);
assert.equal(executionResultGetterInvoked, false, "execution lineage must not execute caller getters");

let outcomeEvidenceGetterInvoked = false;
const accessorOutcomeInput = {
  missionId: "core-mission",
  stepId: "step-1",
  action: "local_analysis",
  target: "alex",
  status: "failed",
  get evidence() {
    outcomeEvidenceGetterInvoked = true;
    return { source: "untrusted" };
  }
};
assert.throws(
  () => recordNexoOutcomeInSnapshot(operationalSnapshot, accessorOutcomeInput),
  error => error?.code === "NEXO_OUTCOME_CONTEXT_INVALID",
  "outcome records must reject accessor-backed fields before field access"
);
assert.equal(outcomeEvidenceGetterInvoked, false, "outcome recording must not execute caller getters");

let executionSnapshot = recordNexoExecutionInSnapshot(operationalSnapshot, {
  idempotencyKey: "core-mission:step-1",
  missionId: "core-mission",
  stepId: "step-1",
  action: "local_analysis",
  target: "alex",
  result: { status: "completed", verified: true }
});
const replayedExecutionSnapshot = recordNexoExecutionInSnapshot(executionSnapshot, {
  idempotencyKey: "core-mission:step-1",
  missionId: "core-mission",
  stepId: "step-1",
  action: "local_analysis",
  target: "alex",
  result: { status: "failed", code: "late-replay" }
});
assert.deepEqual(replayedExecutionSnapshot.executions[0].result, { status: "completed", verified: true },
  "same-identity replay must preserve the first execution result");
assert.throws(() => recordNexoExecutionInSnapshot(executionSnapshot, {
  idempotencyKey: "core-mission:step-1",
  missionId: "core-mission",
  stepId: "step-1",
  action: "repair_agent_needs",
  target: "alex",
  result: { status: "completed", verified: true }
}), error => error?.code === "NEXO_EXECUTION_IDENTITY_MISMATCH",
"an idempotency key must not be silently rebound to a different operation");

console.log("Nexo core continuity operations: detached mission/outcome records, reconstruction, and idempotency identity binding OK.");

const migrationDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-migration-"));
const migrationPath = path.join(migrationDirectory, "nexo-continuity.json");
const legacyForMigration = {
  version: 4, runs: [{ id: "learning-only" }], lessons: [], patterns: [],
  nexo: {
    missions: [plan], attempts: [], doNotRepeat: [], executions: [], effectJournal: [prepared]
  }
};
const migrated = await openNexoContinuityOwner({ filePath: migrationPath, legacyMemory: legacyForMigration });
assert.equal(migrated.current.snapshot.missions[0].missionId, "mission-a");
assert.equal("runs" in migrated.current.snapshot, false, "legacy learning analytics must not cross into Nexo operational continuity");
const legacyDiverged = {
  version: 4, runs: [], lessons: [], patterns: [],
  nexo: { missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: [] }
};
const reopened = await openNexoContinuityOwner({ filePath: migrationPath, legacyMemory: legacyDiverged });
assert.equal(reopened.current.snapshot.missions[0].missionId, "mission-a", "once initialized, the Nexo store remains canonical; do not merge legacy duplicates");
await fs.rm(migrationDirectory, { recursive: true, force: true });

const uninitializedDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-no-bootstrap-"));
await assert.rejects(
  () => openNexoContinuityOwner({ filePath: path.join(uninitializedDirectory, "nexo-continuity.json") }),
  error => error?.code === "NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN",
  "missing store and missing legacy state must not silently fabricate continuity"
);
await fs.rm(uninitializedDirectory, { recursive: true, force: true });


const readFailure = Object.assign(new Error("simulated continuity read failure"), {
  code: "TEST_CONTINUITY_READ_FAILED"
});
let failedStoreWrites = 0;
const readFailingStore = {
  loadCurrent: async () => { throw readFailure; },
  commitIfCurrent: async () => { failedStoreWrites++; return { status: "committed" }; }
};
const readFailingOwner = createNexoContinuityOwner({ store: readFailingStore });
const failedOperation = {
  idempotencyKey: "read-failure-mission:step-1",
  missionId: "read-failure-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex",
  environmentStateRevision: 0
};
const preparedReadFailure = await readFailingOwner.recordPrepared({
  expectedRevision: 0, operation: failedOperation
});
assert.equal(preparedReadFailure.status, "blocked");
assert.equal(preparedReadFailure.code, "TEST_CONTINUITY_READ_FAILED");
assert.equal(preparedReadFailure.uncertainty, "continuity_read_failed");
assert.equal(preparedReadFailure.preparedCommitted, false);
const lineageReadFailure = await readFailingOwner.recordExecutionLineage({
  expectedRevision: 0,
  operation: failedOperation,
  result: { status: "completed", verified: true }
});
assert.equal(lineageReadFailure.status, "blocked");
assert.equal(lineageReadFailure.code, "TEST_CONTINUITY_READ_FAILED");
assert.equal(lineageReadFailure.lineageCommitted, false);
const outcomeReadFailure = await readFailingOwner.recordOutcome({
  expectedRevision: 0,
  outcome: {
    missionId: "read-failure-mission",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "failed"
  }
});
assert.equal(outcomeReadFailure.status, "blocked");
assert.equal(outcomeReadFailure.code, "TEST_CONTINUITY_READ_FAILED");
assert.equal(outcomeReadFailure.journalSettled, false);
assert.equal(failedStoreWrites, 0, "read failure must not proceed to conditional commit");
