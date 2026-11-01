import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const productRoots = [
  { file: "scripts/nexo.mjs", domain: "nexo" },
  { file: "scripts/nexo-chronicle-session.mjs", domain: "nexo" },
  { file: "src/nexo/application/index.mjs", domain: "nexo" },
  { file: "scripts/assistants.mjs", domain: "lumina" },
  { file: "scripts/simulate.mjs", domain: "lumina" }
];
const classifiedRoots = new Set(productRoots.map(item => item.file));
assert.equal(classifiedRoots.size, productRoots.length, "each product entrypoint must be classified exactly once");

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
  return relative.startsWith("src/nexo/") || relative.startsWith("scripts/nexo-");
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
const runtimeSource = await fs.readFile(path.join(root, "src/nexo/runtime.js"), "utf8");
assert.equal(runtimeSource.includes("executeLuminaNexoStep"), false);
assert.equal(runtimeSource.includes("simulation-adapter"), false);
console.log("NCS M0: recursive product import graph excludes repair and cross-domain effect modules.");
