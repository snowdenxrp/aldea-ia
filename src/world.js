// Estado físico y recursos de Lúmina.
// Describe posibilidades del mundo, no conocimientos de los habitantes.
// "possibleUses" pertenece al mundo; los agentes deben descubrir sus usos.

export const world = {
  day: 1,
  timeOfDay: 8,
  speed: 1,

  resources: {
    water: {
      type: "renewable",
      amount: 1000,
      quality: 1,
      location: "river",
      position: { x: -18, z: 0 },
      radius: 6,
      possibleUses: ["drink", "irrigate"]
    },

    wood: {
      type: "renewable",
      amount: 240,
      quality: 1,
      location: "forest",
      position: { x: 20, z: 8 },
      radius: 18,
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
      possibleUses: ["construction", "tools"]
    },

    fertile_land: {
      type: "renewable",
      amount: 100,
      quality: 0.9,
      location: "fertile_zone",
      position: { x: 2, z: -22 },
      radius: 16,
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
      regenerationPerDay: 0.7,
      possibleUses: ["food", "medicine", "fiber"]
    },

    fish: {
      type: "renewable",
      amount: 60,
      quality: 0.9,
      location: "river",
      position: { x: -18, z: 8 },
      radius: 7,
      regenerationPerDay: 0.25,
      possibleUses: ["food"]
    },

    clay: {
      type: "renewable",
      amount: 90,
      quality: 0.8,
      location: "riverbank",
      position: { x: -12, z: -16 },
      radius: 8,
      regenerationPerDay: 0.05,
      possibleUses: ["containers", "construction"]
    }
  }
};

export function advanceWorldDay() {
  const wood = world.resources.wood;
  wood.amount = Math.min(240, wood.amount + wood.regenerationPerDay);

  const land = world.resources.fertile_land;
  land.quality = Math.min(1, land.quality + land.regenerationPerDay / 100);

  const plants = world.resources.wild_plants;
  plants.amount = Math.min(80, plants.amount + plants.regenerationPerDay);

  const fish = world.resources.fish;
  fish.amount = Math.min(60, fish.amount + fish.regenerationPerDay);

  const clay = world.resources.clay;
  clay.amount = Math.min(90, clay.amount + clay.regenerationPerDay);
}
