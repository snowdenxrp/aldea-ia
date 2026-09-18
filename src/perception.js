// Percepción de Lúmina.
// Los habitantes solo reciben información que podrían obtener mediante sus sentidos
// y su posición. No tienen acceso directo al estado interno del mundo.

export function perceiveWorld(agent, world, agents = []) {
  const visibleAgents = agents
    .filter(other => other.id !== agent.id && other.alive)
    .map(other => ({
      id: other.id,
      name: other.name,
      distance: distance(agent.position, other.position)
    }))
    .filter(other => other.distance <= 15);

  const nearbyResources = Object.entries(world.resources)
    .filter(([, resource]) => resource.location)
    .map(([type, resource]) => ({
      type,
      location: resource.location
    }));

  return {
    position: { ...agent.position },
    visibleAgents,
    nearbyResources,
    currentActivity: agent.currentActivity,
    needs: { ...agent.needs }
  };
}

export function canPerceiveAgent(agent, otherAgent, maxDistance = 15) {
  if (!otherAgent.alive) return false;
  return distance(agent.position, otherAgent.position) <= maxDistance;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}
