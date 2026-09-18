// Acciones físicas y sus consecuencias en el mundo.
// Una acción no decide si debe ejecutarse: solo define qué ocurre si el habitante la realiza.

export function executeAction(simulation, agent, action) {
  switch (action.name) {
    case "rest":
      return rest(agent, action.duration ?? 1);
    case "drink":
      return drink(simulation, agent, action.amount ?? 5);
    case "eat_plant":
      return eatPlant(simulation, agent, action.amount ?? 1);
    case "catch_fish":
      return catchFish(simulation, agent, action.amount ?? 1);
    case "gather_wood":
      return gatherWood(simulation, agent, action.amount ?? 1);
    case "gather_stone":
      return gatherStone(simulation, agent, action.amount ?? 1);
    default:
      return { success: false, reason: "unknown_action" };
  }
}

function rest(agent, hours) {
  agent.currentActivity = "resting";
  agent.needs.energy = Math.min(100, agent.needs.energy + hours * 7);
  return { success: true, effect: "energy_recovered" };
}

function drink(simulation, agent, amount) {
  const water = simulation.world.resources.water;
  if (water.amount <= 0) return { success: false, reason: "no_water" };

  const used = Math.min(amount, water.amount);
  water.amount -= used;
  agent.needs.thirst = Math.min(100, agent.needs.thirst + used * 4);
  agent.currentActivity = "drinking";

  return { success: true, effect: "thirst_recovered", amount: used };
}

function eatPlant(simulation, agent, amount) {
  const plants = simulation.world.resources.wild_plants;
  if (plants.amount <= 0) return { success: false, reason: "no_plants" };

  const eaten = Math.min(amount, plants.amount);
  plants.amount -= eaten;

  // La planta tiene una propiedad real en el mundo que el agente desconoce.
  // El resultado de la experiencia puede ser bueno, neutro o malo.
  const roll = Math.random();

  let outcome;
  if (roll < 0.60) {
    outcome = {
      kind: "beneficial",
      hungerGain: 12 * plants.quality,
      healthChange: 0,
      belief: "Esta planta parece ser un alimento útil."
    };
  } else if (roll < 0.85) {
    outcome = {
      kind: "neutral",
      hungerGain: 3 * plants.quality,
      healthChange: 0,
      belief: "Comer esta planta no pareció tener mucho efecto."
    };
  } else {
    outcome = {
      kind: "harmful",
      hungerGain: 0,
      healthChange: -8,
      belief: "Esta planta me hizo sentir mal."
    };
  }

  agent.needs.hunger = Math.min(100, agent.needs.hunger + outcome.hungerGain * eaten);
  agent.needs.health = Math.max(0, Math.min(100, agent.needs.health + outcome.healthChange * eaten));
  agent.currentActivity = "eating";

  return {
    success: true,
    effect: "plant_experiment",
    amount: eaten,
    outcome: outcome.kind,
    hungerGain: outcome.hungerGain * eaten,
    healthChange: outcome.healthChange * eaten,
    belief: outcome.belief
  };
}

function catchFish(simulation, agent, amount) {
  const fish = simulation.world.resources.fish;
  if (fish.amount <= 0) return { success: false, reason: "no_fish" };

  const caught = Math.min(amount, fish.amount);
  fish.amount -= caught;
  agent.inventory.push({ type: "fish", amount: caught });
  agent.needs.energy = Math.max(0, agent.needs.energy - caught * 3);
  agent.currentActivity = "fishing";

  return { success: true, effect: "fish_caught", amount: caught };
}

function gatherWood(simulation, agent, amount) {
  const wood = simulation.world.resources.wood;
  const gathered = Math.min(amount, wood.amount);
  if (gathered <= 0) return { success: false, reason: "no_wood" };

  wood.amount -= gathered;
  agent.inventory.push({ type: "wood", amount: gathered });
  agent.needs.energy = Math.max(0, agent.needs.energy - gathered * 2);
  agent.currentActivity = "gathering";

  return { success: true, effect: "wood_gathered", amount: gathered };
}

function gatherStone(simulation, agent, amount) {
  const stone = simulation.world.resources.stone;
  const gathered = Math.min(amount, stone.amount);
  if (gathered <= 0) return { success: false, reason: "no_stone" };

  stone.amount -= gathered;
  agent.inventory.push({ type: "stone", amount: gathered });
  agent.needs.energy = Math.max(0, agent.needs.energy - gathered * 2.5);
  agent.currentActivity = "gathering";

  return { success: true, effect: "stone_gathered", amount: gathered };
}
