import assert from "node:assert/strict";
import { NEXO_PERSONALITY, buildNexoSystemPrompt } from "../nexo/personality.mjs";

assert.equal(NEXO_PERSONALITY.identity, "Nexo");
assert.equal(NEXO_PERSONALITY.style.language, "natural conversational Spanish when the user speaks Spanish");
const prompt = buildNexoSystemPrompt({
  mission: { title: "finish Lúmina" },
  memory: [{ text: "The project is local-first." }],
  capabilities: ["local files", "local model"]
});
assert.match(prompt, /You are Nexo/);
assert.match(prompt, /finish Lúmina/);
assert.match(prompt, /local-first/);

console.log("nexo-personality: ok");
