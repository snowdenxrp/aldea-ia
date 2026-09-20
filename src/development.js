// Desarrollo emergente de Lúmina: los habitantes convierten recursos en infraestructura.
// No se crean estructuras por guion; solo cuando un habitante dispone de materiales y descubre la posibilidad.
export const BUILD_COSTS = Object.freeze({ shelter: { wood: 12, stone: 6 } });

export function getInventoryAmount(agent, type) {
  return (agent.inventory ?? []).reduce((sum, item) => item.type === type ? sum + (Number(item.amount) || 0) : sum, 0);
}

export function consumeInventory(agent, type, amount) {
  let remaining = amount;
  for (const item of agent.inventory ?? []) {
    if (item.type !== type || remaining <= 0) continue;
    const used = Math.min(Number(item.amount) || 0, remaining);
    item.amount -= used;
    remaining -= used;
  }
  agent.inventory = (agent.inventory ?? []).filter(item => (Number(item.amount) || 0) > 0);
  return remaining <= 1e-9;
}

export function canBuildShelter(agent) {
  const cost = BUILD_COSTS.shelter;
  return getInventoryAmount(agent, "wood") >= cost.wood && getInventoryAmount(agent, "stone") >= cost.stone;
}

export function buildShelter(simulation, agent) {
  if (!canBuildShelter(agent)) return { success: false, reason: "insufficient_materials" };
  const cost = BUILD_COSTS.shelter;
  consumeInventory(agent, "wood", cost.wood);
  consumeInventory(agent, "stone", cost.stone);
  simulation.world.structures ??= { shelters: [], farms: [] };
  const id = `shelter-${simulation.world.structures.shelters.length + 1}`;
  const structure = { id, type: "shelter", ownerId: agent.id, position: { ...agent.position }, builtOnDay: simulation.day, durability: 100 };
  simulation.world.structures.shelters.push(structure);
  agent.home = id;
  agent.needs.safety = Math.min(100, agent.needs.safety + 25);
  return { success: true, effect: "shelter_built", structureId: id, cost };
}

export function normalizeDevelopmentWorld(targetWorld) {
  targetWorld.structures ??= { shelters: [], farms: [] };
  targetWorld.structures.shelters ??= [];
  targetWorld.structures.farms ??= [];
  return targetWorld;
}
