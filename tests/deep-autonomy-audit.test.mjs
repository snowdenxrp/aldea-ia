import assert from "node:assert/strict";
import { maintainPlan, notePlanResult, autonomySummary } from "../src/planning.js";

const world = { day: 1 };
const agent = {
  needs: { hunger: 30, safety: 100 },
  inventory: [{ type: "wood", amount: 2 }],
  home: null,
  farm: null
};

const plan = maintainPlan(agent, world);
assert(plan);
assert.equal(plan.goal, "food");
assert.equal(plan.steps[0], "catch_fish");

notePlanResult(agent, "catch_fish", { success: false, reason: "fish_escaped" }, 1);
notePlanResult(agent, "catch_fish", { success: false, reason: "fish_escaped" }, 1);
notePlanResult(agent, "catch_fish", { success: false, reason: "fish_escaped" }, 1);
assert.equal(agent.plan, null);
assert(agent.goalCooldowns.food >= 3);
assert.equal(autonomySummary(agent).replans, 0);

agent.needs.hunger = 30;
agent.plan = { goal: "food", steps: ["catch_fish", "eat_fish"], progress: 0, replans: 1, stalledSteps: 0 };
const replanned = agent.plan;
assert(replanned);
assert.equal(replanned.goal, "food");
notePlanResult(agent, "catch_fish", { success: true }, 3);
agent.inventory.push({ type: "fish", amount: 1 });
assert.equal(agent.plan.steps[0], "eat_fish");
notePlanResult(agent, "eat_fish", { success: true }, 3);
assert.equal(agent.plan, null);
assert.equal(agent.goalHistory.length, 1);
assert.equal(agent.goalHistory[0].goal, "food");

console.log("Lúmina deep autonomy audit: objetivos, progreso, fallos, cooldown y finalización verificados.");
