import assert from "node:assert/strict";
import { previewNexoMissionDraft } from "../../src/nexo/application/continuity-queries.mjs";

let getterCalls = 0;
const draft = {};
Object.defineProperty(draft, "missionId", {
  enumerable: true,
  get() { getterCalls += 1; throw new Error("missionId getter must not run"); }
});
const result = await previewNexoMissionDraft("/unused/nexo-continuity.json", draft);
assert.equal(result.status, "blocked");
assert.equal(result.code, "NEXO_MISSION_CONTEXT_INVALID");
assert.equal(result.authorization, "NOT_EVALUATED");
assert.equal(result.dispatchAttempted, false);
assert.equal(result.persisted, false);
assert.equal(getterCalls, 0, "mission draft accessors must be rejected before reading fields or loading storage");

console.log("Nexo mission draft preview input guard tests passed");
