import test from "node:test";
import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";

test("a core agent with zero health is not considered alive", () => {
  const agent = createInitialAgents()[0];
  agent.needs.health = 0;
  agent.alive = false;
  assert.equal(agent.needs.health, 0);
  assert.equal(agent.alive, false);
});
