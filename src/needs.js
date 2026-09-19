// Necesidades y estado físico/social de los habitantes de Lúmina.
// Este archivo NO decide qué hará un habitante.
// Solo representa su estado y cómo cambia con el paso del tiempo.

export function createNeeds() {
  return {
    hunger: 100,      // 100 = satisfecho, 0 = hambre extrema
    thirst: 100,      // 100 = bien hidratado, 0 = sed extrema
    energy: 100,      // 100 = máxima energía, 0 = agotamiento
    social: 100,      // 100 = buena conexión social, 0 = aislamiento prolongado
    safety: 100,      // estado contextual de seguridad
    health: 100       // salud general
  };
}

// Actualiza necesidades durante un intervalo de tiempo simulado.
// 'hours' representa horas del mundo, no horas reales.
export function updateNeeds(needs, hours, activity = "normal") {
  const next = { ...needs };

  next.hunger -= hours * 2.2;
  next.thirst -= hours * 3.2;

  if (activity === "sleeping") {
    next.energy += hours * 12;
  } else if (activity === "resting") {
    next.energy += hours * 7;
  } else if (activity === "heavy") {
    next.energy -= hours * 10;
  } else {
    next.energy -= hours * 5;
  }

  next.social -= hours * 0.5;

  next.hunger = clamp(next.hunger);
  next.thirst = clamp(next.thirst);
  next.energy = clamp(next.energy);
  next.social = clamp(next.social);
  next.safety = clamp(next.safety);
  next.health = clamp(next.health);

  return next;
}

// Consecuencias físicas básicas de necesidades muy bajas.
// No prescribe acciones: solamente modifica el estado del habitante.
export function applyNeedConsequences(needs, hours) {
  const next = { ...needs };

  if (next.thirst < 10) {
    next.health -= hours * 2.5;
  }

  if (next.hunger < 10) {
    next.health -= hours * 1.5;
  }

  if (next.energy < 5) {
    next.health -= hours * 0.03;
  }

  if (next.social < 10) {
    next.health -= hours * 0.02;
  }

  // La recuperación aparece cuando las necesidades básicas vuelven a estar cubiertas.
  // No es instantánea y no puede superar la salud máxima.
  if (
    next.hunger >= 60 &&
    next.thirst >= 60 &&
    next.energy >= 20
  ) {
    next.health += hours * 1.5;
  }

  next.health = clamp(next.health);
  return next;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
