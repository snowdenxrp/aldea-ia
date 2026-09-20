// Especialización emergente: los roles aparecen a partir de experiencia real y necesidades del entorno.
const ROLE_DEFS = Object.freeze({
  gatherer: { label: "Recolector", skills: ["gather_wood", "gather_stone", "catch_fish"] },
  farmer: { label: "Agricultor", skills: ["farm", "harvest"] },
  builder: { label: "Constructor", skills: ["build_shelter"] },
  craftsperson: { label: "Artesano", skills: ["craft_tool", "toolmaking"] },
  trader: { label: "Comerciante", skills: ["trade"] },
  teacher: { label: "Mentor", skills: ["share_knowledge"] },
  organizer: { label: "Organizador", skills: ["cooperate", "contribute_commons", "withdraw_commons"] }
});

export function normalizeSpecializationWorld(world) {
  world.specialization ??= { roles: {}, history: [] };
  world.specialization.roles ??= {};
  world.specialization.history ??= [];
}

export function normalizeSpecializationAgent(agent) {
  agent.specialization ??= { role: null, confidence: 0, history: [], mentorship: { taught: 0, learned: 0 } };
  agent.specialization.history ??= [];
  agent.specialization.mentorship ??= { taught: 0, learned: 0 };
}

export function advanceSpecializationDay(simulation) {
  normalizeSpecializationWorld(simulation.world);
  const alive = simulation.agents.filter(a => a.alive);
  for (const agent of alive) {
    normalizeSpecializationAgent(agent);
    const scores = roleScores(agent);
    const best = Object.entries(scores).sort((a,b) => b[1] - a[1])[0];
    if (!best || best[1] < 0.08) continue;
    const [role, score] = best;
    const previous = agent.specialization.role;
    agent.specialization.confidence = Math.min(1, score);
    if (!previous) {
      agent.specialization.role = role;
      recordRole(simulation, agent, role, "emergence");
    } else if (previous !== role && score > roleScore(agent, previous) + 0.18) {
      agent.specialization.role = role;
      recordRole(simulation, agent, role, "adaptation");
    }
    agent.socialRole = ROLE_DEFS[agent.specialization.role]?.label ?? agent.socialRole ?? null;
    simulation.world.specialization.roles[agent.specialization.role] = (simulation.world.specialization.roles[agent.specialization.role] || 0) + 1;
  }
  simulation.world.specialization.history = simulation.world.specialization.history.slice(-1000);
}

export function specializationBonus(context, actionName) {
  const specialization = context.specialization ?? context;
  const role = ROLE_DEFS[specialization?.role];
  if (!role || !role.skills.includes(actionName)) return 0;
  return Math.min(2, 0.35 + Number(specialization.confidence || 0) * 0.8);
}

export function getSpecializationSummary(agent) {
  normalizeSpecializationAgent(agent);
  return { role: agent.specialization.role, label: ROLE_DEFS[agent.specialization.role]?.label ?? null, confidence: agent.specialization.confidence, taught: agent.specialization.mentorship.taught, learned: agent.specialization.mentorship.learned };
}

function roleScores(agent) {
  const scores = {};
  for (const [role, def] of Object.entries(ROLE_DEFS)) scores[role] = def.skills.reduce((sum, skill) => sum + skillLevel(agent, skill), 0) / def.skills.length;
  return scores;
}
function roleScore(agent, role) { return ROLE_DEFS[role] ? ROLE_DEFS[role].skills.reduce((sum, skill) => sum + skillLevel(agent, skill), 0) / ROLE_DEFS[role].skills.length : 0; }
function skillLevel(agent, name) { return Number(agent.skills?.find(s => s.name === name)?.level || 0); }
function recordRole(simulation, agent, role, reason) {
  const event = { day: simulation.day, agentId: agent.id, role, reason };
  agent.specialization.history.push(event);
  simulation.world.specialization.history.push(event);
  simulation.events.push({ id: `event-${simulation.events.length + 1}`, day: simulation.day, hour: 0, type: "role_emerged", description: agent.name + " desarrolló el rol de " + ROLE_DEFS[role].label + ".", participants: [agent.id] });
}
