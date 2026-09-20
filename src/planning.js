// Planificación adaptativa profunda de Lúmina.
// Los objetivos se construyen desde el estado real y pueden pausarse, fallar y replantearse.

export function inferPlan(agent, world) {
  normalizePlanState(agent);
  const plans = [];
  const food = (agent.inventory ?? []).reduce((s, i) => s + ((i.type === "fish" || i.type === "farm_food") ? Number(i.amount) || 0 : 0), 0);

  if (agent.needs.hunger < 45 && food <= 0 && !goalCoolingDown(agent, "food", world.day)) {
    plans.push({ goal: "food", steps: ["catch_fish", "eat_fish"] });
  }
  if (agent.needs.hunger < 45 && Number(agent.inventory?.find(i => i.type === "farm_food")?.amount || 0) > 0 && !goalCoolingDown(agent, "food", world.day)) {
    plans.push({ goal: "food", steps: ["eat_farm_food"] });
  }

  if (!agent.home && !agent.farm && !goalCoolingDown(agent, "shelter", world.day)) {
    const wood = Number(agent.inventory?.find(i => i.type === "wood")?.amount || 0);
    const stone = Number(agent.inventory?.find(i => i.type === "stone")?.amount || 0);
    if (wood >= 12 && stone >= 6) plans.push({ goal: "shelter", steps: ["build_shelter"] });
    else if (wood < 12) plans.push({ goal: "shelter", steps: ["gather_wood", "build_shelter"] });
    else if (stone < 6) plans.push({ goal: "shelter", steps: ["gather_stone", "build_shelter"] });
  }

  if (!agent.farm && Number(agent.inventory?.find(i => i.type === "wood")?.amount || 0) >= 4 && !goalCoolingDown(agent, "food_production", world.day)) {
    plans.push({ goal: "food_production", steps: ["farm", "harvest", "eat_farm_food"] });
  }

  return plans
    .sort((a, b) => goalPressure(agent, b.goal) - goalPressure(agent, a.goal))
    .map(plan => ({ ...plan, priority: goalPressure(agent, plan.goal) }));
}

export function maintainPlan(agent, world) {
  normalizePlanState(agent);
  const plans = inferPlan(agent, world);
  const current = agent.plan;

  if (!current || !plans.some(p => p.goal === current.goal)) {
    agent.plan = plans[0] ? {
      ...plans[0],
      createdDay: world.day,
      progress: 0,
      replans: current?.replans || 0,
      stalledSteps: 0,
      lastProgressDay: world.day,
      status: "active"
    } : null;
    return agent.plan;
  }

  current.steps = current.steps.filter(step => !isSatisfied(agent, world, step));
  if (!current.steps.length) {
    completePlan(agent, world.day);
    return null;
  }

  current.priority = goalPressure(agent, current.goal);
  current.status = "active";
  return current;
}

export function notePlanResult(agent, actionName, result, day) {
  normalizePlanState(agent);
  if (!agent.plan || !agent.plan.steps?.length) return;

  const plan = agent.plan;
  if (result?.success && plan.steps[0] === actionName) {
    plan.steps.shift();
    plan.progress = (plan.progress || 0) + 1;
    plan.stalledSteps = 0;
    plan.lastProgressDay = day;
    plan.lastAction = actionName;
    if (!plan.steps.length) completePlan(agent, day);
    return;
  }

  if (!result?.success) {
    plan.stalledSteps = (plan.stalledSteps || 0) + 1;
    plan.lastFailure = result.reason || "unknown";
    plan.lastAction = actionName;
    if (plan.stalledSteps >= 3) {
      agent.goalCooldowns[plan.goal] = Math.max(Number(agent.goalCooldowns[plan.goal] || 0), day + 2);
      plan.replans = (plan.replans || 0) + 1;
      plan.status = "replanned";
      agent.plan = null;
    }
  }
}

export function autonomySummary(agent) {
  normalizePlanState(agent);
  return {
    goal: agent.plan?.goal ?? null,
    step: agent.plan?.steps?.[0] ?? null,
    progress: agent.plan?.progress ?? 0,
    replans: agent.plan?.replans ?? 0,
    stalledSteps: agent.plan?.stalledSteps ?? 0,
    completedGoals: agent.goalHistory.length
  };
}

function normalizePlanState(agent) {
  agent.goalHistory ??= [];
  agent.goalCooldowns ??= {};
  if (agent.plan) {
    agent.plan.progress = Number(agent.plan.progress || 0);
    agent.plan.replans = Number(agent.plan.replans || 0);
    agent.plan.stalledSteps = Number(agent.plan.stalledSteps || 0);
    agent.plan.steps ??= [];
  }
}

function completePlan(agent, day) {
  if (!agent.plan) return;
  agent.goalHistory.push({
    goal: agent.plan.goal,
    completedDay: day,
    progress: agent.plan.progress || 0,
    replans: agent.plan.replans || 0
  });
  agent.goalHistory = agent.goalHistory.slice(-100);
  agent.plan = null;
}

function goalCoolingDown(agent, goal, day) {
  return Number(agent.goalCooldowns?.[goal] || 0) > Number(day || 0);
}

function isSatisfied(agent, world, step) {
  if (step === "build_shelter") return Boolean(agent.home);
  if (step === "farm") return Boolean(agent.farm);
  if (step === "eat_fish") return Number(agent.inventory?.find(i => i.type === "fish")?.amount || 0) <= 0;
  if (step === "eat_farm_food") return Number(agent.inventory?.find(i => i.type === "farm_food")?.amount || 0) <= 0;
  if (step === "gather_wood") return Number(agent.inventory?.find(i => i.type === "wood")?.amount || 0) >= 12;
  if (step === "gather_stone") return Number(agent.inventory?.find(i => i.type === "stone")?.amount || 0) >= 6;
  return false;
}

function goalPressure(agent, goal) {
  if (goal === "food") return Math.max(0, 50 - agent.needs.hunger);
  if (goal === "shelter") return Math.max(0, 60 - agent.needs.safety);
  if (goal === "food_production") return Math.max(0, 45 - agent.needs.hunger);
  return 0;
}
