import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { executeAction } from "../src/actions.js";
import { createSimulation } from "../src/simulation.js";
import { world } from "../src/world.js";
import { evaluateOptions } from "../src/decision.js";
import { updateActionBelief } from "../src/discovery.js";
import { remember } from "../src/memory.js";

function agent() {
  return createInitialAgents()[0];
}

{
  const a = agent();
  a.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.2, evidence: [] }];
  updateActionBelief(a, "catch_fish", 1, 1, "capturé un pez");
  assert(a.knowledge[0].confidence > 0.2);
  const before = a.knowledge[0].confidence;
  updateActionBelief(a, "catch_fish", -1, 2, "el pez escapó");
  assert(a.knowledge[0].confidence < before);
}

{
  const a = agent();
  a.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.2, evidence: [] }];
  remember(a, { id: "m1", day: 1, type: "experience", topic: "action:catch_fish", description: "capturé un pez", importance: 1 });
  const context = { agentId: a.id, needs: { ...a.needs }, perception: { visibleAgents: [], nearbyResources: [] }, knowledge: a.knowledge, relationships: [], memories: a.memories, recentAction: null, recentActionResult: null };
  const low = evaluateOptions(context, [{ name: "catch_fish", baseValue: 0, effects: { hunger: 1 }, distance: 0 }])[0].score;
  a.knowledge[0].confidence = 0.8;
  const high = evaluateOptions({ ...context, knowledge: a.knowledge }, [{ name: "catch_fish", baseValue: 0, effects: { hunger: 1 }, distance: 0 }])[0].score;
  assert(high > low, "La confianza aprendida debe cambiar la valoración.");
}

{
  const sim = createSimulation(structuredClone(world), [agent()], { random: () => 0.8 });
  const a = sim.agents[0];
  const first = executeAction(sim, a, { name: "catch_fish", amount: 1 });
  assert.equal(first.success, false, "Con habilidad 0, 0.8 debe superar la probabilidad inicial.");
  a.skills.push({ name: "catch_fish", level: 1, learnedOnDay: 1 });
  const second = executeAction(sim, a, { name: "catch_fish", amount: 1 });
  assert.equal(second.success, true, "La habilidad adquirida debe aumentar causalmente la probabilidad de éxito.");
}

{
  const a = agent();
  for (let i = 0; i < 700; i += 1) {
    a.knowledge.push({ topic: "action:test-" + i, belief: "x", confidence: 0.5, evidence: [] });
    updateActionBelief(a, "test-" + i, 1, i, "evidencia");
  }
  assert(a.knowledge.every(item => item.evidence.length <= 500));
}

console.log("Lúmina cognition audit: aprendizaje, memoria y habilidades verificadas.");
