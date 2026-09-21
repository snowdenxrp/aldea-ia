const VALID_PHASES = new Set(["observe", "plan", "act", "verify", "recover", "done", "blocked"]);

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function defaultClock() { return new Date().toISOString(); }

export function createNexoCore({ id = "nexo-local", clock = defaultClock, maxEvents = 2000 } = {}) {
  const state = {
    id,
    createdAt: clock(),
    updatedAt: clock(),
    phase: "observe",
    mission: null,
    plan: [],
    cursor: 0,
    memory: {},
    events: [],
    metrics: { actions: 0, successes: 0, failures: 0, replans: 0 }
  };

  const record = (type, data = {}) => {
    state.events.push({ at: clock(), type, ...clone(data) });
    if (state.events.length > maxEvents) state.events.splice(0, state.events.length - maxEvents);
    state.updatedAt = clock();
  };

  const setPhase = (phase) => {
    if (!VALID_PHASES.has(phase)) throw new Error("Invalid Nexo phase: " + phase);
    state.phase = phase;
    record("phase", { phase });
  };

  const setMission = (mission) => {
    state.mission = typeof mission === "string" ? { id: "mission-" + Date.now(), title: mission } : clone(mission);
    state.plan = [];
    state.cursor = 0;
    setPhase("plan");
    record("mission", { mission: state.mission });
  };

  const setPlan = (steps) => {
    if (!Array.isArray(steps) || !steps.length) throw new Error("Nexo plan requires at least one step");
    state.plan = steps.map((step, index) => typeof step === "string" ? { id: "step-" + (index + 1), title: step } : clone(step));
    state.cursor = 0;
    setPhase("act");
    record("plan", { count: state.plan.length });
  };

  const remember = (namespace, key, value) => {
    if (!namespace || !key) throw new Error("Memory namespace and key are required");
    state.memory[namespace] ??= {};
    state.memory[namespace][key] = { value: clone(value), updatedAt: clock() };
    record("memory.write", { namespace, key });
  };

  const recall = (namespace, key) => clone(state.memory[namespace]?.[key]?.value);
  const nextStep = () => state.plan[state.cursor] ? clone(state.plan[state.cursor]) : null;

  const actionStarted = (stepId, tool = null) => {
    state.metrics.actions += 1;
    setPhase("act");
    record("action.start", { stepId, tool });
  };

  const actionSucceeded = (stepId, result = null) => {
    state.metrics.successes += 1;
    state.cursor += 1;
    record("action.success", { stepId, result });
    if (state.cursor >= state.plan.length) setPhase("done");
    else setPhase("verify");
  };

  const actionFailed = (stepId, error, { replan = true } = {}) => {
    state.metrics.failures += 1;
    record("action.failure", { stepId, error: String(error?.message || error) });
    if (replan) { state.metrics.replans += 1; setPhase("recover"); }
    else setPhase("blocked");
  };

  const snapshot = () => clone(state);

  const hydrate = (saved) => {
    if (!saved || typeof saved !== "object") throw new Error("Invalid Nexo state");
    Object.assign(state, clone(saved));
    if (!VALID_PHASES.has(state.phase)) state.phase = "observe";
    return snapshot();
  };

  return Object.freeze({
    snapshot, hydrate, setMission, setPlan, nextStep, setPhase,
    remember, recall, actionStarted, actionSucceeded, actionFailed
  });
}
