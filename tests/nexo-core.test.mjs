import assert from "node:assert/strict";
import { createNexoCore } from "../nexo/core.mjs";

let tick = 0;
const core = createNexoCore({ clock: () => new Date(tick++ * 1000).toISOString() });

core.setMission({ id: "lumina", title: "Terminar auditoría visual de Lúmina" });
core.setPlan(["Observar estado", "Aplicar corrección", "Verificar resultado"]);
assert.equal(core.snapshot().phase, "act");
assert.equal(core.nextStep().title, "Observar estado");

core.remember("projects", "lumina", { repository: "snowdenxrp/aldea-ia" });
assert.deepEqual(core.recall("projects", "lumina"), { repository: "snowdenxrp/aldea-ia" });

core.actionStarted("step-1", "github.inspect");
core.actionSucceeded("step-1", { ok: true });
assert.equal(core.snapshot().phase, "verify");

core.actionFailed("step-2", new Error("verification mismatch"));
assert.equal(core.snapshot().phase, "recover");
assert.equal(core.snapshot().metrics.replans, 1);

core.setPhase("done");
assert.equal(core.snapshot().phase, "done");
console.log("nexo-core: ok");
