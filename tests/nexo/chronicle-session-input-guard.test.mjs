import assert from "node:assert/strict";
import { runNexoChronicleAppend } from "../../src/nexo/application/chronicle-append.mjs";

let getterCalls = 0;
const options = {};
Object.defineProperty(options, "continuityPath", {
  enumerable: true,
  get() { getterCalls += 1; throw new Error("must not execute"); }
});
const result = await runNexoChronicleAppend(options);
assert.equal(result.status, "blocked");
assert.equal(result.code, "NEXO_CHRONICLE_SESSION_INPUT_INVALID");
assert.equal(result.authorization, "NOT_EVALUATED");
assert.equal(result.dispatchAttempted, false);
assert.equal(getterCalls, 0, "public session option accessors must not execute");

console.log("Nexo Chronicle session input guard tests passed");
