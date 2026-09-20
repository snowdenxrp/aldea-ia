// Exploración territorial de Lúmina.
// Una exploración revela lugares y recursos; no teletransporta conocimiento al habitante.
import { getRegionKey, normalizeSpatialWorld } from "./spatial.js";

export function normalizeExplorationWorld(world) {
  world.exploration ??= { discoveredAreas: [], nextAreaId: 1 };
  world.exploration.discoveredAreas ??= [];
  world.exploration.nextAreaId ??= 1;
  normalizeSpatialWorld(world);
  world.spatial.knownRegions ??= [];
}

export function discoverArea(simulation, agent) {
  normalizeExplorationWorld(simulation.world);
  const existing = simulation.world.exploration.discoveredAreas.find(area => distance(area.position, agent.position) < 5);
  if (existing) {
    existing.visits = (existing.visits || 0) + 1;
    existing.lastVisitedDay = simulation.day;
    return existing;
  }

  const regionKey = getRegionKey(agent.position, simulation.world);
  if (!simulation.world.spatial.knownRegions.includes(regionKey)) {
    simulation.world.spatial.knownRegions.push(regionKey);
    simulation.world.spatial.knownRegions = simulation.world.spatial.knownRegions.slice(-2000);
  }
  const resources = Object.values(simulation.world.resources || {})
    .filter(resource => resource?.position && distance(resource.position, agent.position) <= (resource.perceptionRadius || 10))
    .map(resource => ({ type: resource.type, quality: resource.quality ?? 1 }));

  const area = {
    id: "area-" + simulation.world.exploration.nextAreaId++,
    position: { x: Number(agent.position.x), z: Number(agent.position.z) },
    discoveredOnDay: simulation.day,
    lastVisitedDay: simulation.day,
    discoveredBy: [agent.id],
    visits: 1,
    resources,
    regionKey
  };

  simulation.world.exploration.discoveredAreas.push(area);
  simulation.world.exploration.discoveredAreas = simulation.world.exploration.discoveredAreas.slice(-500);
  agent.knownResources ??= {};

  for (const resource of resources) {
    const source = simulation.world.resources[resource.type];
    if (source?.position) agent.knownResources[resource.type] = { ...source.position, learnedDay: simulation.day };
  }
  return area;
}

export function rememberAreaVisit(simulation, agent, area) {
  if (!agent.exploredAreas) agent.exploredAreas = [];
  if (!agent.exploredAreas.includes(area.id)) agent.exploredAreas.push(area.id);
  agent.exploredAreas = agent.exploredAreas.slice(-200);
}

function distance(a,b) { return Math.hypot(a.x-b.x,a.z-b.z); }
