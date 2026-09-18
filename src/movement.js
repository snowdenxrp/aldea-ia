// Locomoción básica de los habitantes.
// El movimiento es una capacidad; el sistema de decisión decide cuándo usarla.

export function createMovementState() {
  return {
    target: null,
    speed: 1.8,
    moving: false,
    distanceTravelled: 0
  };
}

export function setMovementTarget(agent, target) {
  agent.movement ??= createMovementState();
  agent.movement.target = { x: target.x, z: target.z };
  agent.movement.moving = true;
}

export function stopMovement(agent) {
  agent.movement ??= createMovementState();
  agent.movement.target = null;
  agent.movement.moving = false;
}

export function moveAgent(agent, deltaSeconds) {
  agent.movement ??= createMovementState();
  const movement = agent.movement;

  if (!movement.target || !agent.alive) {
    movement.moving = false;
    return false;
  }

  const dx = movement.target.x - agent.position.x;
  const dz = movement.target.z - agent.position.z;
  const distance = Math.hypot(dx, dz);

  if (distance < 0.1) {
    agent.position.x = movement.target.x;
    agent.position.z = movement.target.z;
    stopMovement(agent);
    return true;
  }

  const step = Math.min(distance, movement.speed * deltaSeconds);
  agent.position.x += (dx / distance) * step;
  agent.position.z += (dz / distance) * step;
  movement.distanceTravelled += step;
  movement.moving = true;

  return true;
}

export function createBasicAction(name, target = null) {
  return {
    name,
    target,
    startedAt: null,
    completedAt: null
  };
}
