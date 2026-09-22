import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const required = [
  "nexo/README.md",
  "nexo/MASTER_SPEC.md",
  "nexo/CONSTITUTION.md",
  "nexo/architecture/README.md",
  "nexo/core/README.md",
  "nexo/memory/README.md",
  "nexo/agents/README.md",
  "nexo/models/README.md",
  "nexo/tools/README.md",
  "nexo/security/README.md",
  "nexo/governance/README.md",
  "nexo/runtime/README.md",
  "nexo/recovery/README.md",
  "nexo/vault/README.md",
  "nexo/chronicle/README.md",
  "nexo/offline/README.md",
  "nexo/education/README.md",
  "nexo/cyber/README.md",
  "nexo/ui/README.md",
  "nexo/tests/README.md"
];

for (const path of required) {
  const content = await readFile(path, "utf8");
  assert.ok(content.trim().length > 0, `foundation file is empty: ${path}`);
}

const spec = await readFile("nexo/MASTER_SPEC.md", "utf8");
assert.match(spec, /Autonomy is not authority/);
assert.match(spec, /Emergency cyber policy/);
assert.match(spec, /Detect -> diagnose -> isolate -> backup -> sandbox repair -> test -> verify -> integrate -> monitor -> rollback on failure/);

const constitution = await readFile("nexo/CONSTITUTION.md", "utf8");
assert.match(constitution, /Do not fabricate memories/);
assert.match(constitution, /Respect authorization boundaries/);

console.log("Nexo foundation audit: PASS");
