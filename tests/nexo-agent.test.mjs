import assert from "node:assert/strict";
import { createNexoCore } from "../nexo/core.mjs";
import { createNexoAgent } from "../nexo/agent.mjs";

const calls = [];
const core = createNexoCore({ clock: () => "2026-01-01T00:00:00.000Z" });
const agent = createNexoAgent({
  core,
  observe: async ({ phase }) => ({ phase, healthy: true }),
  planner: async () => [
    { id: "inspect", title: "Inspect", tool: "inspect" },
    { id: "finish", title: "Finish", tool: "finish" }
  ],
  tools: {
    inspect: async () => { calls.push("inspect"); return { ok: true, inspected: true }; },
    finish: async () => { calls.push("finish"); return { ok: true, finished: true }; }
  }
});

const result = await agent.runMission({ id: "test", title: "Run autonomous loop" });
assert.equal(result.ok, true);
assert.deepEqual(calls, ["inspect", "finish"]);
assert.equal(result.snapshot.metrics.successes, 2);
console.log("nexo-agent: ok");
