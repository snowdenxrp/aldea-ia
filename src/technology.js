// Tecnología acumulativa de Lúmina.
// Una mejora solo queda en el mundo después de suficiente experiencia colectiva.
// Las mejoras no reemplazan el aprendizaje individual: convierten experiencia acumulada en capacidad material.

export function normalizeTechnologyWorld(world) {
  world.technology ??= {
    levels: { tools: 0, construction: 0, agriculture: 0 },
    discoveries: [],
    researchLog: []
  };
  world.technology.levels ??= { tools: 0, construction: 0, agriculture: 0 };
  for (const key of ["tools", "construction", "agriculture"]) {
    world.technology.levels[key] = Math.max(0, Math.min(2, Number(world.technology.levels[key] ?? 0)));
  }
  world.technology.discoveries ??= [];
  world.technology.researchLog ??= [];
  return world.technology;
}

export function advanceTechnologyDay(simulation) {
  const technology = normalizeTechnologyWorld(simulation.world);
  const alive = simulation.agents.filter(agent => agent?.alive);
  const thresholds = [
    ["tools", "toolmaking", "Herramientas mejoradas"],
    ["construction", "build_shelter", "Construcción reforzada"],
    ["agriculture", "farm", "Agricultura mejorada"]
  ];

  for (const [domain, skillName, label] of thresholds) {
    const skilled = alive.filter(agent =>
      (agent.skills?.find(skill => skill.name === skillName)?.level ?? 0) >= 0.45
    );
    const average = alive.length
      ? alive.reduce((sum, agent) => sum + (agent.skills?.find(skill => skill.name === skillName)?.level ?? 0), 0) / alive.length
      : 0;
    const targetLevel = average >= 0.75 || skilled.length >= 3 ? 2 : average >= 0.45 || skilled.length >= 2 ? 1 : 0;
    if (targetLevel <= technology.levels[domain]) continue;

    for (let level = technology.levels[domain] + 1; level <= targetLevel; level++) {
      technology.levels[domain] = level;
      const discovery = { day: simulation.day, domain, level, label };
      technology.discoveries.push(discovery);
      technology.researchLog.push({
        ...discovery,
        evidence: skilled.map(agent => agent.id).slice(0, 12)
      });
      if (technology.discoveries.length > 120) technology.discoveries = technology.discoveries.slice(-120);
      if (technology.researchLog.length > 500) technology.researchLog = technology.researchLog.slice(-500);
      simulation.events.push({
        id: "technology-event-" + simulation.events.length,
        day: simulation.day,
        hour: 0,
        type: "technology_discovered",
        description: "La experiencia acumulada produjo una mejora tecnológica: " + label + " (nivel " + level + ").",
        participants: skilled.map(agent => agent.id).slice(0, 12)
      });
    }
  }
}

export function technologyModifiers(world) {
  const levels = normalizeTechnologyWorld(world).levels;
  return {
    toolEfficiency: levels.tools * 0.08,
    toolDurability: levels.tools * 0.2,
    shelterDurability: levels.construction * 0.2,
    farmYield: levels.agriculture * 0.12
  };
}
