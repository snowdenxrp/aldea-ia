import { getRandom } from "./random.js";
import { buildShelter } from "./development.js";
import { craftTool, farm, harvest } from "./production.js";

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
    case "eat_fish":
      return eatFish(agent, action.amount ?? 1);
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

  const properties = plants.foodProperties ?? {
    edible: true,
    nutrition: 0.5,
    toxicity: 0
  };

  let outcome;
  if (!properties.edible) {
    outcome = {
      kind: "harmful",
      hungerGain: 0,
      healthChange: -8 * (1 + properties.toxicity),
      belief: "Esta planta no parece comestible."
    };
  } else if (properties.toxicity > 0.5) {
    outcome = {
      kind: "harmful",
      hungerGain: 0,
      healthChange: -8 * properties.toxicity,
      belief: "Esta planta me hizo sentir mal."
    };
  } else if (properties.nutrition >= 0.6) {
    outcome = {
      kind: "beneficial",
      hungerGain: 12 * properties.nutrition * plants.quality,
      healthChange: 0,
      belief: "Esta planta parece ser un alimento útil."
    };
  } else {
    outcome = {
      kind: "neutral",
      hungerGain: 3 * properties.nutrition * plants.quality,
      healthChange: 0,
      belief: "Comer esta planta no pareció tener mucho efecto."
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

function eatFish(agent, amount) {
  const stack = agent.inventory.find(item => item.type === "fish" && item.amount > 0);
  if (!stack) return { success: false, reason: "no_fish_in_inventory" };

  const eaten = Math.min(amount, stack.amount);
  stack.amount -= eaten;
  agent.needs.hunger = Math.min(100, agent.needs.hunger + eaten * 14);
  agent.currentActivity = "eating";

  if (stack.amount <= 0) {
    agent.inventory = agent.inventory.filter(item => item !== stack);
  }

  return {
    success: true,
    effect: "fish_eaten",
    amount: eaten,
    hungerGain: eaten * 14
  };
}

function catchFish(simulation, agent, amount) {
  const fish = simulation.world.resources.fish;
  if (fish.amount <= 0) return { success: false, reason: "no_fish" };

  const skill = getSkillLevel(agent, "catch_fish");
  const successChance = Math.min(0.95, 0.35 + skill * 0.55);

  if (getRandom(simulation)() > successChance) {
    agent.needs.energy = Math.max(0, agent.needs.energy - 1.5);
    agent.currentActivity = "fishing";
    return { success: false, reason: "fish_escaped", skillLevel: skill };
  }

  const caught = Math.min(amount, fish.amount);
  fish.amount -= caught;
  agent.inventory.push({ type: "fish", amount: caught });
  agent.needs.energy = Math.max(0, agent.needs.energy - caught * 3);
  agent.currentActivity = "fishing";

  return { success: true, effect: "fish_caught", amount: caught, skillLevel: skill };
}

function gatherWood(simulation, agent, amount) {
  const wood = simulation.world.resources.wood;
  const skill = getSkillLevel(agent, "gather_wood");
  const efficiency = 0.6 + skill * 0.8;
  const gathered = Math.min(amount * efficiency, wood.amount);
  if (gathered <= 0) return { success: false, reason: "no_wood" };

  wood.amount -= gathered;
  agent.inventory.push({ type: "wood", amount: gathered });
  agent.needs.energy = Math.max(0, agent.needs.energy - gathered * Math.max(1.2, 2 - skill));
  agent.currentActivity = "gathering";

  return { success: true, effect: "wood_gathered", amount: gathered, skillLevel: skill };
}

function gatherStone(simulation, agent, amount) {
  const stone = simulation.world.resources.stone;
  const skill = getSkillLevel(agent, "gather_stone");
  const efficiency = 0.55 + skill * 0.85;
  const gathered = Math.min(amount * efficiency, stone.amount);
  if (gathered <= 0) return { success: false, reason: "no_stone" };

  stone.amount -= gathered;
  agent.inventory.push({ type: "stone", amount: gathered });
  agent.needs.energy = Math.max(0, agent.needs.energy - gathered * Math.max(1.5, 2.5 - skill));
  agent.currentActivity = "gathering";

  return { success: true, effect: "stone_gathered", amount: gathered, skillLevel: skill };
}

function getSkillLevel(agent, actionName) {
  const skill = agent.skills.find(item => item.name === actionName);
  return Math.max(0, Math.min(1, skill?.level ?? 0));
}
