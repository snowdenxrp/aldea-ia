import assert from "node:assert/strict";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";

const journal = [];
const order = [];
const adapter = createEffectAdapter({
  executionJournal: journal,
  handlers: {
    external_effect: async () => {
      order.push("execute");
      return { status: "completed", details: "ok" };
    }
  },
  persistPreparedIntent: async ({ journalEntry }) => {
    assert.equal(journalEntry.status, "prepared");
    order.push("persist-prepared");
  }
});

const result = await adapter.execute({
  missionId: "m1",
  stepId: "s1",
  action: "external_effect",
  target: "remote",
  idempotencyKey: "m1:s1",
  postcondition: async () => true
});

assert.equal(result.status, "completed");
assert.deepEqual(order, ["persist-prepared", "execute"]);
assert.equal(journal[0].status, "completed");
assert.equal(journal[0].result.status, "completed");

const blockedJournal = [];
const blocked = createEffectAdapter({
  executionJournal: blockedJournal,
  handlers: { external_effect: async () => { throw new Error("provider timeout"); } },
  persistPreparedIntent: async () => { throw new Error("checkpoint unavailable"); }
});
const blockedResult = await blocked.execute({
  missionId: "m2", stepId: "s1", action: "external_effect", idempotencyKey: "m2:s1"
});
assert.equal(blockedResult.code, "EFFECT_INTENT_PERSISTENCE_FAILED");
assert.equal(blockedJournal[0].status, "prepared");

console.log("prepared-intent persistence ordering verified");
