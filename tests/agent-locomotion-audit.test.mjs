import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createMovementState, setMovementTarget, moveAgent } from "../src/movement.js";

const agents = structuredClone(createInitialAgents());
const bounds = { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };

for (const agent of agents) {
  agent.worldBounds = { ...bounds };
  agent.movement = createMovementState();
  const before = { ...agent.position };
  setMovementTarget(agent, { x: before.x + 6, z: before.z + 4 }, bounds);
  let moved = 0;
  for (let i = 0; i < 30; i++) {
    assert.equal(moveAgent(agent, 0.1), true);
    moved += Math.hypot(agent.position.x - before.x, agent.position.z - before.z);
  }
  assert.ok(moved > 0, agent.id + " debe desplazarse");
  assert.ok(Math.abs(agent.position.x - before.x) > 0.01 || Math.abs(agent.position.z - before.z) > 0.01);
  assert.ok(agent.position.x >= bounds.minX && agent.position.x <= bounds.maxX);
  assert.ok(agent.position.z >= bounds.minZ && agent.position.z <= bounds.maxZ);
}

console.log(JSON.stringify({
  audit: "agent-locomotion",
  agents: agents.map(a => ({ id: a.id, distanceTravelled: a.movement.distanceTravelled })),
  verdict: "PASS"
}, null, 2));