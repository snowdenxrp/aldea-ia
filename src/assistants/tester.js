export function runTester({ simulation, tick, moveAgent, setMovementTarget } = {}) {
  const results = [];
  const test = (name, fn) => {
    try {
      const value = fn();
      results.push({ name, status: value === false ? "fail" : "pass" });
    } catch (error) {
      results.push({ name, status: "fail", error: error?.message ?? String(error) });
    }
  };

  test("simulation exists", () => !!simulation);
  test("has inhabitants", () => Array.isArray(simulation?.agents) && simulation.agents.length >= 2);
  test("core inhabitants exist", () => {
    const ids = new Set(simulation?.agents?.map(a => a.id));
    return ids.has("alex") && ids.has("bruno");
  });
  test("positions are finite", () => simulation?.agents?.every(a =>
    Number.isFinite(Number(a.position?.x)) && Number.isFinite(Number(a.position?.z))
  ));
  test("tick advances time", () => {
    if (!simulation || typeof tick !== "function") return false;
    const before = Number(simulation.hour);
    tick(simulation, 0.01);
    return Number(simulation.hour) >= before;
  });
  test("movement reaches a nearby target", () => {
    if (!simulation || typeof moveAgent !== "function" || typeof setMovementTarget !== "function") return false;
    const agent = simulation.agents[0];
    const original = { ...agent.position };
    setMovementTarget(agent, { x: original.x + 1, z: original.z }, simulation.world?.bounds);
    for (let i = 0; i < 20; i++) moveAgent(agent, 0.1);
    const reached = Math.hypot(agent.position.x - (original.x + 1), agent.position.z - original.z) < 0.15;
    agent.position.x = original.x;
    agent.position.z = original.z;
    return reached;
  });

  const failed = results.filter(r => r.status === "fail").length;
  return {
    assistant: "Tester",
    status: failed ? "fail" : "pass",
    passed: results.filter(r => r.status === "pass").length,
    failed,
    results
  };
}
