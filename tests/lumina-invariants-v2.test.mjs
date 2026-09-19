import test from "node:test";
import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { executeAction } from "../src/actions.js";

test("resource absence is classified explicitly", () => {
  const agent = createInitialAgents()[0];
  const simulation = { world: { resources: { water: { amount: 0 } } } };
  const result = executeAction(simulation, agent, { name: "drink", amount: 5 });
  assert.equal(result.success, false);
  assert.equal(result.reason, "no_water");
});

test("resource absence is not a generic action failure", () => {
  const agent = createInitialAgents()[0];
  const simulation = { world: { resources: { water: { amount: 0 } } } };
  const result = executeAction(simulation, agent, { name: "drink", amount: 5 });
  assert.notEqual(result.reason, "action_failed");
});
