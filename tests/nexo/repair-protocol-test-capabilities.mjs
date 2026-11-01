import { loadStateStrict, persistState } from "../../scripts/simulate.mjs";
import { createLuminaEffectAdapter } from "../../src/lumina/simulation-adapter.mjs";

function createLuminaSimulation(snapshot) {
  return {
    world: snapshot.world,
    agents: snapshot.agents,
    day: Number(snapshot.day) || snapshot.world.day || 1,
    hour: Number.isFinite(Number(snapshot.hour)) ? Number(snapshot.hour) : (snapshot.world.timeOfDay || 8),
    events: Array.isArray(snapshot.events) ? snapshot.events : [],
    luminaSimulationRevision: 0
  };
}

function createRepairPostcondition(simulation, action, target) {
  return ({ effectResult }) => {
    if (effectResult?.status !== "completed") return false;
    const agent = target ? simulation.agents?.find(item => item.id === target) : null;
    switch (action) {
      case "repair_agent_state":
        return !!agent &&
          Number.isFinite(Number(agent.position?.x)) &&
          Number.isFinite(Number(agent.position?.z)) &&
          typeof agent.alive === "boolean";
      case "repair_agent_needs":
        return !!agent && ["hunger", "thirst", "energy", "social", "safety", "health"]
          .every(key => Number.isFinite(Number(agent.needs?.[key])) &&
            Number(agent.needs[key]) >= 0 && Number(agent.needs[key]) <= 100);
      case "repair_resource_state": {
        const resource = simulation.world?.resources?.[target];
        return !!resource && Number.isFinite(Number(resource.amount)) && Number(resource.amount) >= 0;
      }
      default:
        return false;
    }
  };
}

// Explicit test composition only. Production Nexo entrypoints remain gated and
// do not import or construct Lúmina adapters or simulation persistence.
export const repairProtocolTestCapabilities = Object.freeze({
  loadStateStrict,
  persistState,
  createSimulationContext: createLuminaSimulation,
  adapterFactory: createLuminaEffectAdapter,
  postconditionFactory: createRepairPostcondition
});
