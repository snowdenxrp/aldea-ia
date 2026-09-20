// Cooperación colectiva emergente de Lúmina.
// Los proyectos aparecen por necesidades compartidas y recursos reales.
// No se asignan equipos ni resultados de antemano.

import { getInventoryAmount, consumeInventory } from "./development.js";
import { recordInteraction } from "./relationships.js";
import { remember } from "./memory.js";

const PROJECT_COSTS = Object.freeze({
  shared_shelter: Object.freeze({ wood: 12, stone: 6 })
});

export function normalizeCollectiveWorld(world) {
  world.collectiveProjects ??= [];
  world.collectiveProjects = world.collectiveProjects.filter(project =>
    project && typeof project.id === "string" && Array.isArray(project.participants)
  );
  return world;
}

export function getNearbyCooperationTarget(agent, agents, maxDistance = 2.2) {
  return agents
    .filter(other => other?.alive && other.id !== agent.id)
    .map(other => ({ other, distance: Math.hypot(agent.position.x - other.position.x, agent.position.z - other.position.z) }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)[0] ?? null;
}

export function canCooperate(agent, other) {
  if (!agent?.alive || !other?.alive) return false;
  const relationship = agent.relationships?.find(item => item.agentId === other.id);
  return Boolean(relationship && relationship.trust >= 0.15 && relationship.cooperation >= 0.05 && relationship.tension < 0.75);
}

export function findOrCreateProject(simulation, agent, other) {
  normalizeCollectiveWorld(simulation.world);
  const existing = simulation.world.collectiveProjects.find(project =>
    project.status === "active" &&
    project.type === "shared_shelter" &&
    project.participants.includes(agent.id) &&
    project.participants.includes(other.id)
  );
  if (existing) return existing;

  const combinedWood = getInventoryAmount(agent, "wood") + getInventoryAmount(other, "wood");
  const combinedStone = getInventoryAmount(agent, "stone") + getInventoryAmount(other, "stone");
  if (agent.home || other.home || combinedWood <= 0 || combinedStone <= 0) return null;

  const id = "collective-" + (simulation.world.collectiveProjects.length + 1);
  const project = {
    id,
    type: "shared_shelter",
    status: "active",
    participants: [agent.id, other.id],
    contributions: {},
    progress: { wood: 0, stone: 0 },
    createdDay: simulation.day,
    completedDay: null
  };
  simulation.world.collectiveProjects.push(project);
  return project;
}

export function contributeToProject(simulation, agent, project) {
  if (!project || project.status !== "active") return { success: false, reason: "no_active_project" };
  if (!project.participants.includes(agent.id)) return { success: false, reason: "not_project_member" };

  const cost = PROJECT_COSTS[project.type];
  const remainingWood = Math.max(0, cost.wood - project.progress.wood);
  const remainingStone = Math.max(0, cost.stone - project.progress.stone);
  const wood = Math.min(4, remainingWood, getInventoryAmount(agent, "wood"));
  const stone = Math.min(2, remainingStone, getInventoryAmount(agent, "stone"));
  if (wood <= 0 && stone <= 0) return { success: false, reason: "no_project_materials" };

  if (wood > 0) consumeInventory(agent, "wood", wood);
  if (stone > 0) consumeInventory(agent, "stone", stone);
  project.progress.wood += wood;
  project.progress.stone += stone;
  project.contributions[agent.id] ??= { wood: 0, stone: 0 };
  project.contributions[agent.id].wood += wood;
  project.contributions[agent.id].stone += stone;

  const completed = project.progress.wood >= cost.wood && project.progress.stone >= cost.stone;
  if (completed) {
    project.status = "completed";
    project.completedDay = simulation.day;
    simulation.world.structures ??= { shelters: [], farms: [] };
    simulation.world.structures.shelters ??= [];
    const structureId = "shelter-" + (simulation.world.structures.shelters.length + 1);
    const members = project.participants
      .map(id => simulation.agents.find(candidate => candidate.id === id && candidate.alive))
      .filter(Boolean);
    const position = members.length
      ? {
          x: members.reduce((sum, member) => sum + member.position.x, 0) / members.length,
          z: members.reduce((sum, member) => sum + member.position.z, 0) / members.length
        }
      : { ...agent.position };
    simulation.world.structures.shelters.push({
      id: structureId,
      type: "shared_shelter",
      ownerId: agent.id,
      ownerIds: project.participants.slice(),
      position,
      builtOnDay: simulation.day,
      durability: 120
    });
    for (const member of members) {
      member.home = structureId;
      member.needs.safety = Math.min(100, member.needs.safety + 25);
      member.collectiveProjects ??= [];
      if (!member.collectiveProjects.includes(project.id)) member.collectiveProjects.push(project.id);
    }
  }

  const otherId = project.participants.find(id => id !== agent.id);
  const other = simulation.agents.find(candidate => candidate.id === otherId && candidate.alive);
  if (other) {
    recordInteraction(agent, other, {
      day: simulation.day,
      type: completed ? "collective_project_completed" : "collective_contribution",
      description: completed
        ? agent.name + " y " + other.name + " completaron juntos un refugio."
        : agent.name + " contribuyó a un proyecto compartido con " + other.name + ".",
      trust: 0.02,
      cooperation: 0.05,
      affection: 0.01
    });
    recordInteraction(other, agent, {
      day: simulation.day,
      type: completed ? "collective_project_completed" : "collective_contribution",
      description: completed
        ? other.name + " y " + agent.name + " completaron juntos un refugio."
        : other.name + " recibió una contribución de " + agent.name + ".",
      trust: 0.02,
      cooperation: 0.05,
      affection: 0.01
    });
  }

  const event = {
    id: "collective-event-" + simulation.events.length,
    day: simulation.day,
    type: completed ? "collective_project_completed" : "collective_contribution",
    description: completed
      ? agent.name + " completó un refugio colectivo con " + (other?.name ?? "otro habitante") + "."
      : agent.name + " aportó recursos a un proyecto colectivo.",
    participants: project.participants.slice()
  };
  simulation.events.push({ ...event, hour: simulation.hour });
  remember(agent, {
    id: event.id,
    day: simulation.day,
    type: "collective",
    description: event.description,
    participants: event.participants,
    importance: completed ? 0.9 : 0.55,
    emotionalWeight: 0.12
  });

  return {
    success: true,
    effect: completed ? "collective_project_completed" : "collective_contribution",
    projectId: project.id,
    contributed: { wood, stone },
    progress: { ...project.progress },
    completed
  };
}
