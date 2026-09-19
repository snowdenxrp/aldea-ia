import test from "node:test";
import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { executeAction } from "../src/actions.js";

test("resource absence is not an action failure", () => {
  const agent = createInitialAgents()[0];
  const simulation = { world: { resources: { water: { amount: 0 } } } };
  const result = executeAction(simulation, agent, { name: "drink", amount: 5 });

  assert.equal(result.success, false);
  assert.equal(result.reason, "no_water");
  assert.notEqual(result.reason, "action_failed");
});

test("a failed attempt because a resource is unavailable must not imply the action is bad", () => {
  const agent = createInitialAgents()[0];
  const simulation = { world: { resources: { water: { amount: 0 } } } };
  const result = executeAction(simulation, agent, { name: "drink", amount: 5 });

  assert.equal(result.success, false);
  assert.ok(["no_water", "resource_unavailable"].includes(result.reason));
});
