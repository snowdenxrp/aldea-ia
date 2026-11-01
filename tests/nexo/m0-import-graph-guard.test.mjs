import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptsDir = path.join(root, "scripts");

// Every executable/product root and every internal Nexo script module must be
// classified. A newly added scripts/nexo*.mjs file fails until a policy is chosen.
const productRoots = [
  { file: "scripts/nexo.mjs", domain: "nexo" },
  { file: "scripts/nexo-chronicle-session.mjs", domain: "nexo" },
  { file: "scripts/nexo-continuity.mjs", domain: "nexo" },
  { file: "scripts/nexo-runtime-session.mjs", domain: "nexo" },
  { file: "scripts/assistants.mjs", domain: "lumina" },
  { file: "scripts/simulate.mjs", domain: "lumina" }
];
const gatedRepairWrappers = [
  "scripts/nexo-repair-session.mjs",
  "scripts/nexo-repair-entrypoint.mjs",
  "scripts/nexo-repair-dispatch.mjs"
];
const repairInternals = [
  "scripts/nexo-repair-protocol.mjs",
  "scripts/nexo-repair-preparation.mjs",
  "scripts/nexo-repair-settlement.mjs",
  "scripts/nexo-repair-mission-verification.mjs"
];
const gateUtilities = ["scripts/nexo-m0-gate.mjs"];

const discoveredNexoScripts = (await fs.readdir(scriptsDir))
  .filter(name => name.startsWith("nexo") && name.endsWith(".mjs"))
  .map(name => `scripts/${name}`)
  .sort();
const classifiedNexoScripts = [
  ...productRoots.filter(item => item.file.startsWith("scripts/nexo")).map(item => item.file),
  ...gatedRepairWrappers,
  ...repairInternals,
  ...gateUtilities
].sort();
assert.deepEqual(
  discoveredNexoScripts,
  classifiedNexoScripts,
  "every scripts/nexo*.mjs module must have exactly one explicit product/internal classification"
);
const allClassified = [
  ...productRoots.map(item => item.file),
  ...gatedRepairWrappers,
  ...repairInternals,
  ...gateUtilities
];
assert.equal(new Set(allClassified).size, allClassified.length, "classification entries must be unique");

function importsOf(source) {
  const found = new Set();
  const patterns = [
    /(?:^|\n)\s*(?:import|export)\s+(?:[\s\S]*?\s+from\s*)?["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) found.add(match[1]);
  }
  return [...found];
}
async function resolveLocal(from, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(from), specifier);
  const candidates = [base, base + ".mjs", base + ".js", path.join(base, "index.mjs"), path.join(base, "index.js")];
  for (const candidate of candidates) {
    try {
      if ((await fs.stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}
function forbidden(file, domain) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (domain === "nexo") {
    return relative.startsWith("scripts/nexo-repair-") ||
      relative === "scripts/nexo-m0-gate.mjs" ||
      relative.startsWith("src/lumina/") ||
      relative === "src/nexo/simulation-adapter.js";
  }
  return relative.startsWith("src/nexo/") || relative.startsWith("scripts/nexo");
}
for (const entry of productRoots) {
  const visited = new Set();
  const pending = [path.join(root, entry.file)];
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    assert.equal(forbidden(file, entry.domain), false,
      `${entry.file} reaches forbidden ${path.relative(root, file)}`);
    const source = await fs.readFile(file, "utf8");
    for (const specifier of importsOf(source)) {
      const dependency = await resolveLocal(file, specifier);
      if (dependency) pending.push(dependency);
    }
  }
}

// Public repair APIs are intentionally retained only as gated wrappers.
// Their imports are restricted to the gate and the private protocol module;
// behavioral tests prove the gate executes before arguments/dependencies.
for (const file of gatedRepairWrappers) {
  const source = await fs.readFile(path.join(root, file), "utf8");
  const imports = importsOf(source).sort();
  assert.deepEqual(imports, ["./nexo-m0-gate.mjs", "./nexo-repair-protocol.mjs"].sort(), file);
}

async function collectSourceFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSourceFiles(full));
    else if (entry.isFile() && /\.(mjs|js|cjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

// Every Lúmina source module is independently checked as a graph root.
for (const entry of await collectSourceFiles(path.join(root, "src/lumina"))) {
  const visited = new Set();
  const pending = [entry];
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    assert.equal(forbidden(file, "lumina"), false,
      `Lúmina source reaches forbidden ${path.relative(root, file)}`);
    const source = await fs.readFile(file, "utf8");
    for (const specifier of importsOf(source)) {
      const dependency = await resolveLocal(file, specifier);
      if (dependency) pending.push(dependency);
    }
  }
}

const runtimeSource = await fs.readFile(path.join(root, "src/nexo/runtime.js"), "utf8");
assert.equal(runtimeSource.includes("executeLuminaNexoStep"), false);
assert.equal(runtimeSource.includes("simulation-adapter"), false);
console.log("NCS M0: all Nexo scripts are classified; product roots satisfy their domain import policies.");
