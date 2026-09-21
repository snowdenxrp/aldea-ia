import { createNexoCore } from "./core.mjs";

function normalizeToolResult(value) {
  return value && typeof value === "object" ? value : { value };
}

export function createNexoAgent({ core = createNexoCore(), tools = {}, observe, planner } = {}) {
  if (typeof observe !== "function") throw new Error("Nexo agent requires observe()");
  if (typeof planner !== "function") throw new Error("Nexo agent requires planner()");

  async function runMission(mission, { maxSteps = 25, context = {} } = {}) {
    core.setMission(mission);
    let observations = await observe({ phase: "initial", mission: core.snapshot().mission, context });
    let replans = 0;

    for (let iteration = 0; iteration < maxSteps; iteration++) {
      if (!core.snapshot().plan.length || core.snapshot().phase === "recover") {
        const plan = await planner({
          mission: core.snapshot().mission,
          observations,
          memory: core.snapshot().memory,
          previousPlan: core.snapshot().plan,
          iteration
        });
        core.setPlan(plan);
        if (core.snapshot().phase === "recover") replans++;
      }

      const step = core.nextStep();
      if (!step) break;

      const toolName = step.tool;
      const tool = toolName ? tools[toolName] : null;
      if (toolName && typeof tool !== "function") {
        core.actionFailed(step.id, new Error("Tool unavailable: " + toolName), { replan: false });
        throw new Error("Nexo blocked: missing tool " + toolName);
      }

      core.actionStarted(step.id, toolName);
      try {
        const result = tool ? normalizeToolResult(await tool(step.input ?? step)) : { ok: true };
        const verification = typeof step.verify === "function"
          ? await step.verify({ result, observations, context })
          : result?.ok !== false;

        if (!verification) {
          core.actionFailed(step.id, new Error("Verification failed for " + step.id));
          observations = await observe({ phase: "recovery", mission: core.snapshot().mission, context });
          continue;
        }

        core.actionSucceeded(step.id, result);
        observations = await observe({ phase: core.snapshot().phase, mission: core.snapshot().mission, context, result });

        if (core.snapshot().phase === "done") {
          return { ok: true, snapshot: core.snapshot(), observations, replans };
        }
      } catch (error) {
        core.actionFailed(step.id, error);
        observations = await observe({ phase: "error-recovery", mission: core.snapshot().mission, context, error });
      }
    }

    return {
      ok: core.snapshot().phase === "done",
      snapshot: core.snapshot(),
      observations,
      replans,
      blocked: core.snapshot().phase === "blocked"
    };
  }

  return Object.freeze({ runMission, core });
}
