import assert from "node:assert/strict";
import { createLocalModel, createLocalModelPolicy } from "../nexo/local-model.mjs";

const calls = [];
const fakeFetch = async (url, options = {}) => {
  calls.push({ url, options });
  if (url.endsWith("/models")) {
    return { ok: true, status: 200, text: async () => JSON.stringify({ data: [{ id: "flagship-local" }] }) };
  }
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ choices: [{ message: { role: "assistant", content: "offline response" } }] })
  };
};

const model = createLocalModel({
  baseUrl: "http://127.0.0.1:8080/v1",
  model: "flagship-local",
  fetchImpl: fakeFetch
});

const result = await model.chat({
  messages: [{ role: "user", content: "hello" }],
  tools: [{ type: "function", function: { name: "inspect" } }]
});

assert.equal(result.choices[0].message.content, "offline response");
assert.match(calls[0].url, /chat\/completions$/);

const health = await model.health();
assert.equal(health.online, true);

const policy = createLocalModelPolicy({
  flagship: { id: "70b", quality: 100, offlineCapable: true },
  balanced: { id: "32b", quality: 80, offlineCapable: true },
  compact: { id: "8b", quality: 50, offlineCapable: true }
});

assert.equal(policy.select({ availableModels: ["70b", "32b"] }).id, "70b");
assert.equal(policy.select({ availableModels: ["32b"] }).id, "32b");

console.log("nexo-local-model: ok");
