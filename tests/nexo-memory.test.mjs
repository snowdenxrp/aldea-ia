import assert from "node:assert/strict";
import { createNexoMemory } from "../nexo/memory.mjs";

const memory = createNexoMemory({ maxEntries: 3 });
const first = memory.learn({
  namespace: "lumina",
  text: "Lúmina debe seguir funcionando y evolucionando aunque el usuario no esté presente.",
  kind: "project-rule",
  importance: 1,
  tags: ["autonomy"]
});
memory.learn({ namespace: "general", text: "Nexo debe verificar sus resultados.", importance: 0.9 });
memory.learn({ namespace: "lumina", text: "La aldea necesita mejorar su presentación visual.", importance: 0.8 });

const found = memory.recall({ query: "autonomía de Lúmina", namespace: "lumina" });
assert.equal(found[0].id, first.id);
assert.ok(found[0].score > 0);
assert.equal(memory.snapshot().length, 3);

memory.forget(first.id);
assert.equal(memory.snapshot().some(item => item.id === first.id), false);

console.log("nexo-memory: ok");
