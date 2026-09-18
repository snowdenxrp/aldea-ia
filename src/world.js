// Estado físico y recursos de Lúmina.
// Este archivo no decide qué harán los habitantes.
// Solo describe el mundo y sus recursos disponibles.

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
      knownUses: ["beber", "regar"]
    },
    wood: {
      type: "renewable",
      amount: 240,
      quality: 1,
      location: "forest",
      regenerationPerDay: 0.4,
      knownUses: ["unknown"]
    },
    stone: {
      type: "finite",
      amount: 180,
      quality: 1,
      location: "rocky_zone",
      knownUses: ["unknown"]
    },
    fertile_land: {
      type: "renewable",
      amount: 100,
      quality: 0.9,
      location: "fertile_zone",
      regenerationPerDay: 0.1,
      knownUses: ["unknown"]
    }
  }
};

export function advanceWorldDay() {
  world.day += 1;

  const wood = world.resources.wood;
  wood.amount = Math.min(240, wood.amount + wood.regenerationPerDay);

  const land = world.resources.fertile_land;
  land.quality = Math.min(1, land.quality + land.regenerationPerDay / 100);
}
