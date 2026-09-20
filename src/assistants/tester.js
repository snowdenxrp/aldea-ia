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
  test("needs remain finite and bounded", () => simulation?.agents?.every(a =>
    ["hunger","thirst","energy","social","safety","health"].every(k => Number.isFinite(Number(a.needs?.[k])) && Number(a.needs[k]) >= 0 && Number(a.needs[k]) <= 100)
  ));
  test("dead inhabitants stay dead", () => simulation?.agents?.every(a => a.alive !== false || a.currentActivity === "dead"));
  test("tick advances time", () => {
    if (!simulation || typeof tick !== "function") return false;
    const before = Number(simulation.hour);
    tick(simulation, 0.01);
    return Number(simulation.hour) >= before;
  });
  test("movement reaches a nearby target", () => {
    if (typeof moveAgent !== "function" || typeof setMovementTarget !== "function") return false;
    const probe = { id: "movement-probe", alive: true, position: { x: 0, z: 0 } };
    setMovementTarget(probe, { x: 1, z: 0 }, simulation?.world?.bounds);
    for (let i = 0; i < 20; i++) moveAgent(probe, 0.1);
    return Math.hypot(probe.position.x - 1, probe.position.z) < 0.15;
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
