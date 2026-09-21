import assert from "node:assert/strict";
import { createNexoModelRouter } from "../nexo/model-router.mjs";

const routes = [];
const local = {
  model: "local-flagship",
  chat: async () => { routes.push("local"); return { source: "local" }; },
  health: async () => ({ online: true, provider: "local", model: "local-flagship" })
};
const remote = {
  model: "remote",
  chat: async () => { routes.push("remote"); return { source: "remote" }; },
  health: async () => ({ online: true, provider: "remote" })
};

let online = false;
const router = createNexoModelRouter({
  local,
  remote,
  connectivity: async () => ({ online }),
  localPolicy: { select: () => ({ id: "local-flagship" }) }
});

assert.deepEqual(await router.chat({ messages: [] }), { source: "local" });
online = true;
assert.deepEqual(await router.chat({ messages: [], requireInternet: true }), { source: "remote" });
online = false;
assert.deepEqual(await router.chat({ messages: [] }), { source: "local" });
assert.deepEqual(routes, ["local", "remote", "local"]);

const status = await router.status();
assert.equal(status.offlineReady, true);

console.log("nexo-model-router: ok");
