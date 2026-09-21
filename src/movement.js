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

export function setMovementTarget(agent, target, bounds = null) {
  agent.movement ??= createMovementState();
  const limits = bounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
  const x=Number(target?.x), z=Number(target?.z);
  if(!Number.isFinite(x)||!Number.isFinite(z)){
    stopMovement(agent);
    return false;
  }
  if(!agent.position||!Number.isFinite(Number(agent.position.x))||!Number.isFinite(Number(agent.position.z))){
    agent.position={x:0,z:0};
  }
  agent.movement.target = {
    x: Math.max(limits.minX, Math.min(limits.maxX, x)),
    z: Math.max(limits.minZ, Math.min(limits.maxZ, z))
  };
  agent.movement.moving = true;
  return true;
}

export function stopMovement(agent) {
  agent.movement ??= createMovementState();
  agent.movement.target = null;
  agent.movement.moving = false;
}

export function moveAgent(agent, deltaSeconds) {
  agent.movement ??= createMovementState();
  const movement = agent.movement;

  if (!agent.position||!Number.isFinite(Number(agent.position.x))||!Number.isFinite(Number(agent.position.z))) {
    agent.position={x:0,z:0};
  }
  if (!movement.target || !Number.isFinite(Number(movement.target.x)) || !Number.isFinite(Number(movement.target.z)) || !agent.alive) {
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
  let nextX = agent.position.x + (dx / distance) * step;
  let nextZ = agent.position.z + (dz / distance) * step;

  const bounds = agent.worldBounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
  nextX = Math.max(bounds.minX, Math.min(bounds.maxX, nextX));
  nextZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, nextZ));

  const actualStep = Math.hypot(nextX - agent.position.x, nextZ - agent.position.z);
  agent.position.x = nextX;
  agent.position.z = nextZ;
  movement.distanceTravelled += actualStep;
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
