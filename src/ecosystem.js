// Ecosistema dinámico de Lúmina.
// El estado ambiental resume presión, recuperación y resiliencia sin imponer una historia.

export function normalizeEcosystemWorld(world) {
  world.ecosystem ??= {};
  const ecosystem = world.ecosystem;
  ecosystem.biodiversity = clamp(Number(ecosystem.biodiversity ?? 1), 0, 1);
  ecosystem.soilQuality = clamp(Number(ecosystem.soilQuality ?? 1), 0, 1);
  ecosystem.waterQuality = clamp(Number(ecosystem.waterQuality ?? 1), 0, 1);
  ecosystem.humanPressure = clamp(Number(ecosystem.humanPressure ?? 0), 0, 1);
  ecosystem.lastUpdateDay ??= Number(world.day ?? 1);
  return ecosystem;
}

export function advanceEcosystemDay(world, population = 0) {
  const e = normalizeEcosystemWorld(world);
  const resources = world.resources ?? {};
  const plantRatio = ratio(resources.wild_plants, 80);
  const fishRatio = ratio(resources.fish, 60);
  const waterRatio = ratio(resources.water, 1000);
  const stoneRatio = ratio(resources.stone, 180);
  const farms = world.structures?.farms?.length ?? 0;

  const depletion = (
    (1 - plantRatio) * 0.28 +
    (1 - fishRatio) * 0.18 +
    (1 - waterRatio) * 0.24 +
    (1 - stoneRatio) * 0.10
  );
  const pressure = clamp(depletion + Math.min(0.3, farms * 0.025) + Math.min(0.2, Math.max(0, population - 4) * 0.01), 0, 1);
  e.humanPressure = clamp(e.humanPressure * 0.92 + pressure * 0.08, 0, 1);

  const recovery = (1 - e.humanPressure) * 0.025;
  const plantStress = plantRatio < 0.2 ? 0.035 : 0;
  const waterStress = waterRatio < 0.2 ? 0.04 : 0;
  const soilStress = farms > 0 && (resources.fertile_land?.quality ?? 1) < 0.5 ? 0.03 : 0;

  e.biodiversity = clamp(e.biodiversity + recovery - plantStress - waterStress * 0.35, 0, 1);
  e.waterQuality = clamp(e.waterQuality + recovery * 0.8 - waterStress, 0, 1);
  e.soilQuality = clamp(e.soilQuality + recovery * 0.7 - soilStress, 0, 1);

  if (plantRatio > 0.7 && fishRatio > 0.7 && waterRatio > 0.7) {
    e.biodiversity = clamp(e.biodiversity + 0.01, 0, 1);
    e.waterQuality = clamp(e.waterQuality + 0.006, 0, 1);
  }

  e.lastUpdateDay = Number(world.day ?? e.lastUpdateDay);
  return e;
}

export function ecosystemModifiers(world) {
  const e = normalizeEcosystemWorld(world);
  return {
    plantRegeneration: e.biodiversity >= 0.85 ? 1 : Math.max(0.55, e.biodiversity),
    fishRegeneration: e.waterQuality >= 0.85 ? 1 : Math.max(0.55, e.waterQuality),
    farmYield: e.soilQuality >= 0.85 ? 1 : Math.max(0.6, e.soilQuality),
    biodiversity: e.biodiversity,
    waterQuality: e.waterQuality,
    soilQuality: e.soilQuality,
    humanPressure: e.humanPressure
  };
}

function ratio(resource, max) {
  return clamp((Number(resource?.amount) || 0) / max, 0, 1);
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
