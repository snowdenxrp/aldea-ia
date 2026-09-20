// Instituciones emergentes de Lúmina.
// Una institución solo aparece cuando una práctica colectiva sostenida demuestra utilidad.
// No asignamos gobierno ni jerarquías de antemano: las reglas se forman desde la experiencia.

export function normalizeInstitutionWorld(world) {
  world.institutions ??= [];
  world.institutions = world.institutions.filter(item =>
    item && typeof item.id === "string" && typeof item.type === "string"
  );
  world.commons ??= {
    food: 0,
    fish: 0,
    wood: 0,
    stone: 0,
    contributions: [],
    withdrawals: []
  };
  for (const key of ["food", "fish", "wood", "stone"]) {
    world.commons[key] = Math.max(0, Number(world.commons[key] ?? 0));
  }
  world.commons.contributions ??= [];
  world.commons.withdrawals ??= [];
  return world;
}

export function advanceInstitutionDay(simulation) {
  const world = normalizeInstitutionWorld(simulation.world);
  const alive = simulation.agents.filter(agent => agent?.alive);
  const repeatedCooperation = (world.cooperation ?? []).filter(e => Number(e.day) >= simulation.day - 30).length;
  const recentTrades = (world.economy?.trades ?? []).filter(e => Number(e.day) >= simulation.day - 30).length;
  const activeShelters = world.structures?.shelters?.length ?? 0;

  // El umbral evita que una institución aparezca en una comunidad sin interacción suficiente.
  if (!world.institutions.some(item => item.type === "commons") &&
      alive.length >= 3 &&
      (repeatedCooperation >= 4 || recentTrades >= 8 || activeShelters >= 1)) {
    const members = chooseMembers(alive);
    if (members.length >= 3) {
      const institution = {
        id: "institution-commons-1",
        type: "commons",
        name: "Reserva comunitaria",
        createdDay: simulation.day,
        members: members.map(agent => agent.id),
        norms: {
          reserveSharing: 0.25,
          voluntaryContribution: true
        },
        history: []
      };
      world.institutions.push(institution);
      for (const member of members) {
        member.institutions ??= [];
        if (!member.institutions.includes(institution.id)) member.institutions.push(institution.id);
        member.socialRole ??= inferRole(member);
      }
      simulation.events.push({
        id: "institution-event-" + simulation.events.length,
        day: simulation.day,
        hour: 0,
        type: "institution_formed",
        description: "La comunidad estableció una reserva compartida tras repetir prácticas de cooperación.",
        participants: institution.members.slice()
      });
    }
  }

  const commons = world.institutions.find(item => item.type === "commons");
  if (commons) {
    const successful = world.commons.contributions.filter(e => Number(e.day) >= simulation.day - 30).length;
    const requested = world.commons.withdrawals.filter(e => Number(e.day) >= simulation.day - 30).length;
    // La norma se adapta a la experiencia: contribuciones frecuentes fortalecen la reserva;
    // retiros frecuentes sin reposición reducen la confianza en el mecanismo.
    commons.norms.reserveSharing = clamp(
      commons.norms.reserveSharing + (successful > requested ? 0.01 : -0.005),
      0.05,
      0.7
    );
    commons.history.push({ day: simulation.day, contributions: successful, withdrawals: requested });
    commons.history = commons.history.slice(-120);
  }
}

export function getInstitutionOptions(agent, world) {
  normalizeInstitutionWorld(world);
  const institution = world.institutions.find(item =>
    item.type === "commons" && item.members?.includes(agent.id)
  );
  if (!institution) return [];

  const options = [];
  const food = inventoryAmount(agent, "farm_food");
  const fish = inventoryAmount(agent, "fish");
  if (food > 1) {
    options.push({
      name: "contribute_commons",
      resourceType: "farm_food",
      amount: 1,
      baseValue: 0.05 + institution.norms.reserveSharing * 0.4,
      effects: { social: 0.2 },
      distance: 0
    });
  }
  if (fish > 1) {
    options.push({
      name: "contribute_commons",
      resourceType: "fish",
      amount: 1,
      baseValue: 0.05 + institution.norms.reserveSharing * 0.35,
      effects: { social: 0.2 },
      distance: 0
    });
  }
  if (agent.needs.hunger < 45 && (world.commons.food > 0 || world.commons.fish > 0)) {
    options.push({
      name: "withdraw_commons",
      resourceType: world.commons.food > 0 ? "farm_food" : "fish",
      amount: 1,
      baseValue: 0.4 + Math.max(0, 45 - agent.needs.hunger) * 0.04,
      effects: { hunger: 1.8 },
      distance: 0
    });
  }
  return options;
}

export function applyInstitutionAction(simulation, agent, action) {
  const world = normalizeInstitutionWorld(simulation.world);
  const institution = world.institutions.find(item =>
    item.type === "commons" && item.members?.includes(agent.id)
  );
  if (!institution) return { success: false, reason: "no_institution_membership" };

  const amount = Math.max(1, Number(action.amount ?? 1));
  const type = action.resourceType ?? "farm_food";
  const key = type === "farm_food" ? "food" : type;
  if (!["food", "fish", "wood", "stone"].includes(key)) return { success: false, reason: "invalid_commons_resource" };

  if (action.name === "contribute_commons") {
    const stack = agent.inventory?.find(item => item.type === type && Number(item.amount) > 0);
    if (!stack || Number(stack.amount) < amount) return { success: false, reason: "insufficient_contribution" };
    stack.amount -= amount;
    agent.inventory = agent.inventory.filter(item => Number(item.amount) > 0);
    world.commons[key] += amount;
    world.commons.contributions.push({ day: simulation.day, agentId: agent.id, type, amount });
    if (world.commons.contributions.length > 5000) world.commons.contributions = world.commons.contributions.slice(-5000);
    agent.currentActivity = "contributing";
    return { success: true, effect: "commons_contribution", type, amount };
  }

  if (action.name === "withdraw_commons") {
    if (world.commons[key] < amount) return { success: false, reason: "commons_empty" };
    world.commons[key] -= amount;
    const inventoryType = key === "food" ? "farm_food" : key;
    const stack = agent.inventory?.find(item => item.type === inventoryType);
    if (stack) stack.amount += amount;
    else agent.inventory.push({ type: inventoryType, amount });
    world.commons.withdrawals.push({ day: simulation.day, agentId: agent.id, type: inventoryType, amount });
    if (world.commons.withdrawals.length > 5000) world.commons.withdrawals = world.commons.withdrawals.slice(-5000);
    agent.needs.hunger = Math.min(100, agent.needs.hunger + (inventoryType === "fish" ? 14 : 10));
    agent.currentActivity = "receiving_commons";
    return { success: true, effect: "commons_withdrawal", type: inventoryType, amount };
  }

  return { success: false, reason: "unknown_institution_action" };
}

function chooseMembers(alive) {
  return alive
    .slice()
    .sort((a, b) => socialStrength(b) - socialStrength(a))
    .slice(0, Math.min(6, alive.length));
}

function socialStrength(agent) {
  const relationships = agent.relationships ?? [];
  return relationships.reduce((sum, rel) =>
    sum + Number(rel.trust ?? 0) + Number(rel.cooperation ?? 0) + Number(rel.familiarity ?? 0) * 0.2, 0
  );
}

function inferRole(agent) {
  const skills = [...(agent.skills ?? [])].sort((a, b) => Number(b.level ?? 0) - Number(a.level ?? 0));
  return skills[0]?.name ?? "generalista";
}

function inventoryAmount(agent, type) {
  return (agent.inventory ?? []).reduce((sum, item) =>
    item.type === type ? sum + (Number(item.amount) || 0) : sum, 0
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
