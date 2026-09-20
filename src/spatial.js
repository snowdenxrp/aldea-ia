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
  world.spatial.knownRegions ??= [];
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
