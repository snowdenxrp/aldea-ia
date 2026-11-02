import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { preflightNexoContinuityBootstrap, bootstrapNexoContinuityStore } from "../../src/nexo/core/continuity-service.mjs";
import { parseNexoContinuityBootstrapArguments } from "../../scripts/nexo-continuity-bootstrap.mjs";

assert.deepEqual(parseNexoContinuityBootstrapArguments(["--root", "/tmp/root", "--relative-path", "continuity/store.json"]), {
  status: "ready", root: "/tmp/root", relativePath: "continuity/store.json"
});
for (const argv of [[], ["--root", "/tmp/root"], ["--root", "/tmp/root", "--relative-path", "../escape"],
  ["--root", "/tmp/root", "--root", "/tmp/other", "--relative-path", "continuity.json"],
  ["--root", "/tmp/root", "--relative-path", "continuity.json", "--unexpected"]]) {
  assert.equal(parseNexoContinuityBootstrapArguments(argv).status, "blocked");
}
const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-m0-bootstrap-preflight-"));
try {
  const options = { root, relativePath: "continuity-v1.json" };
  const prepared = await preflightNexoContinuityBootstrap(options);
  assert.equal(prepared.status, "prepared");
  assert.equal(prepared.destination.root, await fs.realpath(root));
  assert.equal(prepared.destination.relativePath, "continuity-v1.json");
  assert.equal(prepared.destination.filePath, path.join(await fs.realpath(root), "continuity-v1.json"));
  await assert.rejects(fs.access(prepared.destination.filePath), { code: "ENOENT" });
  await assert.rejects(fs.access(prepared.destination.filePath + ".lock"), { code: "ENOENT" });
  await fs.mkdir(prepared.destination.filePath + ".lock");
  await assert.rejects(preflightNexoContinuityBootstrap(options), error => error && error.code === "NEXO_CONTINUITY_BOOTSTRAP_LOCK_STATE_UNKNOWN");
  await fs.rm(prepared.destination.filePath + ".lock", { recursive: true, force: true });
  await fs.writeFile(prepared.destination.filePath, "existing", "utf8");
  await assert.rejects(preflightNexoContinuityBootstrap(options), error => error && error.code === "NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_EXISTS");
  await fs.rm(prepared.destination.filePath);
  const launcher = new URL("../../scripts/nexo-continuity-bootstrap.mjs", import.meta.url);
  const nonInteractive = spawnSync(process.execPath, [launcher.pathname, "--root", root, "--relative-path", "not-created.json"], { input: "PUBLICAR\n", encoding: "utf8" });
  assert.equal(nonInteractive.status, 1);
  assert.deepEqual(JSON.parse(nonInteractive.stdout), {
    status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_INTERACTIVE_TERMINAL_REQUIRED", writeAttempted: false
  });
  await assert.rejects(fs.access(path.join(root, "not-created.json")), { code: "ENOENT" });
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-m0-bootstrap-fixture-"));
  try {
    const result = await bootstrapNexoContinuityStore({ root: fixtureRoot, relativePath: "fixture-continuity.json" });
    assert.equal(result.status, "committed");
    assert.equal(result.destination.filePath, path.join(await fs.realpath(fixtureRoot), "fixture-continuity.json"));
    assert.equal(Object.hasOwn(result, "owner"), false);
  } finally { await fs.rm(fixtureRoot, { recursive: true, force: true }); }
} finally { await fs.rm(root, { recursive: true, force: true }); }
console.log("Nexo M0 bootstrap preflight and launcher contract tests passed.");
