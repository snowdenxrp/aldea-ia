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

  // La primera vez no asumimos que el alimento sea perfecto:
  // su calidad influye en el beneficio obtenido.
  const nutrition = 14 * plants.quality;
  agent.needs.hunger = Math.min(100, agent.needs.hunger + nutrition * eaten);
  agent.currentActivity = "eating";

  return {
    success: true,
    effect: "hunger_recovered",
    amount: eaten,
    quality: plants.quality
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
