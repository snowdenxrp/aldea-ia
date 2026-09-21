// Arquitectura espacial escalable de Lúmina.
// Divide el territorio lógico en regiones sin obligar al motor a recorrer todo el mapa.
// La simulación física y la representación 3D pueden usar esta partición de forma independiente.

export const DEFAULT_REGION_SIZE = 8;

export function normalizeSpatialWorld(world) {
  world.bounds ??= { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
  world.spatial ??= {};
  world.spatial.regionSize = Math.max(1, Number(world.spatial.regionSize ?? DEFAULT_REGION_SIZE));
  world.spatial.version ??= 1;
  world.spatial.activeRegionPadding = Math.max(0, Number(world.spatial.activeRegionPadding ?? 1));
  world.spatial.activeRegions ??= [];
  world.spatial.knownRegions ??= [];
  world.spatial.regions ??= {};
  world.spatial.biomes ??= {};
  world.spatial.regionVersion ??= 1;
  world.spatial.settlementDefaults ??= { activity: 0, structures: 0, population: 0 };

  return world.spatial;
}

export function getRegionKey(position, world) {
  const spatial = normalizeSpatialWorld(world);
  const size = spatial.regionSize;
  const x = Math.floor((Number(position?.x ?? 0) - world.bounds.minX) / size);
  const z = Math.floor((Number(position?.z ?? 0) - world.bounds.minZ) / size);
  return x + ":" + z;
}

export function getRegionForPosition(position, world) {
  const spatial = normalizeSpatialWorld(world);
  const size = spatial.regionSize;
  const key = getRegionKey(position, world);
  const [ix, iz] = key.split(":").map(Number);
  return {
    key,
    x: ix,
    z: iz,
    minX: world.bounds.minX + ix * size,
    maxX: Math.min(world.bounds.maxX, world.bounds.minX + (ix + 1) * size),
    minZ: world.bounds.minZ + iz * size,
    maxZ: Math.min(world.bounds.maxZ, world.bounds.minZ + (iz + 1) * size)
  };
}

export function getActiveRegionKeys(agents, world, padding = null) {
  const spatial = normalizeSpatialWorld(world);
  const radius = padding == null ? spatial.activeRegionPadding : Math.max(0, Number(padding));
  const active = new Set();

  for (const agent of agents ?? []) {
    if (!agent?.alive) continue;
    const region = getRegionForPosition(agent.position, world);
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dz = -radius; dz <= radius; dz += 1) {
        active.add((region.x + dx) + ":" + (region.z + dz));
      }
    }
  }

  return [...active];
}

export function spatialSummary(world, agents = []) {
  normalizeSpatialWorld(world);
  const width = world.bounds.maxX - world.bounds.minX;
  const depth = world.bounds.maxZ - world.bounds.minZ;
  const columns = Math.ceil(width / world.spatial.regionSize);
  const rows = Math.ceil(depth / world.spatial.regionSize);
  const active = getActiveRegionKeys(agents, world);
  return {
    bounds: { ...world.bounds },
    width,
    depth,
    regionSize: world.spatial.regionSize,
    totalRegions: columns * rows,
    activeRegions: active.length,
    coverageRatio: columns * rows ? active.length / (columns * rows) : 0
  };
}


export const BIOME_DEFINITIONS = Object.freeze({
  forest: { food: 1.15, wood: 1.35, stone: 0.9, water: 1.0, movement: 0.95 },
  plains: { food: 1.25, wood: 0.8, stone: 0.9, water: 1.0, movement: 1.05 },
  mountain: { food: 0.65, wood: 0.7, stone: 1.45, water: 0.85, movement: 0.8 },
  wetland: { food: 1.3, wood: 0.95, stone: 0.7, water: 1.4, movement: 0.85 },
  arid: { food: 0.55, wood: 0.45, stone: 1.0, water: 0.35, movement: 1.0 }
});

export function getBiomeForRegion(region, world) {
  normalizeSpatialWorld(world);
  const key = region.key ?? getRegionKey(region, world);
  if (world.spatial.biomes[key]) return world.spatial.biomes[key];

  const hash = stableHash(key);
  const edge = Math.min(region.x, region.z);
  const maxEdge = Math.max(region.x, region.z);
  let type = "plains";
  if ((hash + edge * 3) % 17 === 0) type = "mountain";
  else if ((hash + maxEdge * 5) % 13 === 0) type = "wetland";
  else if ((hash + region.x * 7 + region.z * 11) % 11 === 0) type = "forest";
  else if ((hash + region.x * 5 + region.z * 3) % 19 === 0) type = "arid";

  const definition = BIOME_DEFINITIONS[type];
  const biome = { key, type, ...definition };
  world.spatial.biomes[key] = biome;
  world.spatial.regions[key] ??= { key, x: region.x, z: region.z, visits: 0, discovered: false, biome: type };
  return biome;
}

export function discoverRegion(world, position) {
  normalizeSpatialWorld(world);
  const region = getRegionForPosition(position, world);
  const biome = getBiomeForRegion(region, world);
  const state = world.spatial.regions[region.key] ??= { key: region.key, x: region.x, z: region.z, visits: 0, discovered: false, biome: biome.type };
  state.x ??= region.x;
  state.z ??= region.z;
  state.discovered = true;
  state.lastDiscoveryDay = world.day ?? 0;
  return { ...region, biome };
}

export function recordRegionVisit(world, position, day = world.day ?? 0) {
  const result = discoverRegion(world, position);
  const state = world.spatial.regions[result.key];
  state.visits = Number(state.visits ?? 0) + 1;
  state.lastVisitDay = day;
  return result;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return Math.abs(hash >>> 0);
}

export function updateSettlementState(world, agents = []) {
  normalizeSpatialWorld(world);
  const byRegion = new Map();
  const structures = [
    ...(world.structures?.shelters ?? []),
    ...(world.structures?.farms ?? [])
  ];
  for (const agent of agents ?? []) {
    if (!agent?.alive) continue;
    const key = getRegionKey(agent.position, world);
    const entry = byRegion.get(key) ?? { population: 0, structures: 0 };
    entry.population += 1;
    byRegion.set(key, entry);
  }
  for (const structure of structures) {
    const position = structure.position;
    if (!position) continue;
    const key = getRegionKey(position, world);
    const entry = byRegion.get(key) ?? { population: 0, structures: 0 };
    entry.structures += 1;
    byRegion.set(key, entry);
  }
  for (const [key, state] of Object.entries(world.spatial.regions)) {
    const live = byRegion.get(key) ?? { population: 0, structures: 0 };
    state.population = live.population;
    state.structures = live.structures;
    state.settlementLevel = Math.min(5, Math.floor((live.population + live.structures) / 2));
    state.activity = Math.min(1, live.population * 0.12 + live.structures * 0.08);
  }
  for (const [key, live] of byRegion) {
    const region = world.spatial.regions[key] ??= { key, visits: 0, discovered: true };
    const regionPosition = region.x != null && region.z != null
      ? { x: world.bounds.minX + Number(region.x) * world.spatial.regionSize + world.spatial.regionSize / 2, z: world.bounds.minZ + Number(region.z) * world.spatial.regionSize + world.spatial.regionSize / 2 }
      : null;
    const biome = getBiomeForRegion(regionPosition ? getRegionForPosition(regionPosition, world) : getRegionForPosition({x:0,z:0}, world), world);
    region.biome ??= biome.type;
    region.population = live.population;
    region.structures = live.structures;
    region.settlementLevel = Math.min(5, Math.floor((live.population + live.structures) / 2));
    region.activity = Math.min(1, live.population * 0.12 + live.structures * 0.08);
  }
  return world.spatial.regions;
}
