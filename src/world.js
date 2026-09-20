import { advanceEcosystemDay, ecosystemModifiers, normalizeEcosystemWorld } from "./ecosystem.js";
// Estado físico y recursos de Lúmina.
// Describe posibilidades del mundo, no conocimientos de los habitantes.
// "possibleUses" pertenece al mundo; los agentes deben descubrir sus usos.

export const world = {
  day: 1,
  timeOfDay: 8,
  speed: 1,
  climate: { season: "spring", weather: "clear", temperature: 22, dayLength: 12 },
  exploration: { discoveredAreas: [], nextAreaId: 1 },

  // Territorio jugable de Lúmina. La exploración no puede sacar a los habitantes
  // de la zona física representada por el terreno.
  bounds: {
    minX: -34,
    maxX: 34,
    minZ: -34,
    maxZ: 34
  },

  structures: {
    shelters: [],
    farms: []
  },

  resources: {
    water: {
      type: "renewable",
      amount: 1000,
      quality: 1,
      regenerationPerDay: 1000,
      location: "river",
      position: { x: -18, z: 0 },
      radius: 6,
      perceptionRadius: 30,
      possibleUses: ["drink", "irrigate"]
    },

    wood: {
      type: "renewable",
      amount: 240,
      quality: 1,
      location: "forest",
      position: { x: 20, z: 8 },
      radius: 18,
      perceptionRadius: 24,
      regenerationPerDay: 0.4,
      possibleUses: ["fuel", "construction", "tools"]
    },

    stone: {
      type: "finite",
      amount: 180,
      quality: 1,
      location: "rocky_zone",
      position: { x: 24, z: 15 },
      radius: 12,
      perceptionRadius: 18,
      possibleUses: ["construction", "tools"]
    },

    fertile_land: {
      type: "renewable",
      amount: 100,
      quality: 0.9,
      location: "fertile_zone",
      position: { x: 2, z: -22 },
      radius: 16,
      perceptionRadius: 22,
      regenerationPerDay: 0.1,
      possibleUses: ["farming"]
    },

    wild_plants: {
      type: "renewable",
      amount: 80,
      quality: 0.85,
      location: "meadow",
      position: { x: -2, z: -8 },
      radius: 10,
      perceptionRadius: 14,
      regenerationPerDay: 60,
      possibleUses: ["food", "medicine", "fiber"],
      // Propiedades reales del recurso; los habitantes no las conocen de antemano.
      foodProperties: {
        edible: true,
        nutrition: 0.85,
        toxicity: 0
      }
    },

    fish: {
      type: "renewable",
      amount: 60,
      quality: 0.9,
      location: "river",
      position: { x: -18, z: 8 },
      radius: 7,
      perceptionRadius: 11,
      regenerationPerDay: 20,
      possibleUses: ["food"]
    },

    clay: {
      type: "renewable",
      amount: 90,
      quality: 0.8,
      location: "riverbank",
      position: { x: -12, z: -16 },
      radius: 8,
      perceptionRadius: 12,
      regenerationPerDay: 0.05,
      possibleUses: ["containers", "construction"]
    }
  }
};

export function advanceWorldDay(targetWorld = world) {
  targetWorld.climate ??= { season: "spring", weather: "clear", temperature: 22, dayLength: 12 };
  targetWorld.exploration ??= { discoveredAreas: [], nextAreaId: 1 };
  normalizeEcosystemWorld(targetWorld);
  const cycle = ["spring", "summer", "autumn", "winter"];
  const seasonIndex = Math.floor(((Number(targetWorld.day) - 1) % 120) / 30);
  targetWorld.climate.season = cycle[seasonIndex];
  const weatherRoll = ((Number(targetWorld.day || 1) * 9301 + 49297) % 233280) / 233280;
  targetWorld.climate.weather = weatherRoll < 0.08 ? "storm" : weatherRoll < 0.2 ? "rain" : weatherRoll < 0.25 ? "drought" : "clear";
  const seasonal = { spring: 1.05, summer: 1.15, autumn: 0.9, winter: 0.65 }[targetWorld.climate.season] ?? 1;
  targetWorld.climate.temperature = { spring: 20, summer: 28, autumn: 18, winter: 10 }[targetWorld.climate.season];
  advanceEcosystemDay(targetWorld, targetWorld.population ?? targetWorld.agents?.length ?? 0);
  const updatedModifiers = ecosystemModifiers(targetWorld);
  const water = targetWorld.resources.water;
  water.amount = Math.min(1000, water.amount + (water.regenerationPerDay ?? 1000));

  const wood = targetWorld.resources.wood;
  wood.amount = Math.min(240, wood.amount + wood.regenerationPerDay);

  const land = targetWorld.resources.fertile_land;
  land.quality = Math.min(1, land.quality + land.regenerationPerDay / 100);

  const plants = targetWorld.resources.wild_plants;
  plants.amount = Math.min(80, plants.amount + plants.regenerationPerDay * seasonal * updatedModifiers.plantRegeneration * (targetWorld.climate.weather === "drought" ? 0.35 : targetWorld.climate.weather === "rain" ? 1.25 : 1));

  const fish = targetWorld.resources.fish;
  fish.amount = Math.min(60, fish.amount + fish.regenerationPerDay * seasonal * updatedModifiers.fishRegeneration);

  const clay = targetWorld.resources.clay;
  if (targetWorld.structures?.farms?.length) { for (const farm of targetWorld.structures.farms) farm.food = Math.min(100, (farm.food ?? 0) + 1.5 * targetWorld.resources.fertile_land.quality * updatedModifiers.farmYield); }
  clay.amount = Math.min(90, clay.amount + clay.regenerationPerDay * (targetWorld.climate.weather === "rain" ? 1.3 : 1));
  if (targetWorld.climate.weather === "storm") targetWorld.resources.wood.amount = Math.max(0, targetWorld.resources.wood.amount - 1);
  if (targetWorld.climate.weather === "drought") targetWorld.resources.water.amount = Math.max(0, targetWorld.resources.water.amount - 40);
}
