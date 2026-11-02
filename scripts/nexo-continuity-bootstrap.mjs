import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { bootstrapNexoContinuityStore, preflightNexoContinuityBootstrap } from "./nexo-continuity.mjs";
import { NEXO_CONTINUITY_SCHEMA, NEXO_CONTINUITY_SCHEMA_VERSION } from "../src/nexo/core/continuity-snapshot.mjs";

export function parseNexoContinuityBootstrapArguments(argv) {
  if (!Array.isArray(argv) || argv.some(value => typeof value !== "string")) return { status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_ARGUMENTS_INVALID" };
  let root;
  let relativePath;
  for (let i = 0; i < argv.length; i += 1) {
    const option = argv[i];
    const value = argv[i + 1];
    if ((option !== "--root" && option !== "--relative-path") || typeof value !== "string" || !value.trim() || value.startsWith("--")) return { status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_ARGUMENTS_INVALID" };
    if (option === "--root") {
      if (root !== undefined) return { status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_ARGUMENTS_INVALID" };
      root = value;
    } else {
      if (relativePath !== undefined) return { status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_ARGUMENTS_INVALID" };
      relativePath = value;
    }
    i += 1;
  }
  if (typeof root !== "string" || typeof relativePath !== "string") return { status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_ARGUMENTS_INVALID" };
  return { status: "ready", root, relativePath };
}

function operationDigest(destination) {
  const operation = {
    operation: "NEXO_M0_CONTINUITY_FIRST_PUBLICATION",
    root: destination.root,
    relativePath: destination.relativePath,
    destination: destination.filePath,
    snapshot: { schema: NEXO_CONTINUITY_SCHEMA, schemaVersion: NEXO_CONTINUITY_SCHEMA_VERSION, missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: [] },
    window: "single-foreground-invocation"
  };
  return createHash("sha256").update(JSON.stringify(operation), "utf8").digest("hex");
}

export async function runNexoContinuityBootstrapCli(argv, io = process) {
  const parsed = parseNexoContinuityBootstrapArguments(argv);
  if (parsed.status !== "ready") {
    io.stdout.write(JSON.stringify(parsed) + "\n");
    return 1;
  }
  if (!io.stdin.isTTY || !io.stdout.isTTY) {
    io.stdout.write(JSON.stringify({ status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_INTERACTIVE_TERMINAL_REQUIRED", writeAttempted: false }) + "\n");
    return 1;
  }
  try {
    const preflight = await preflightNexoContinuityBootstrap({ root: parsed.root, relativePath: parsed.relativePath });
    const destination = preflight.destination;
    const digest = operationDigest(destination);
    io.stdout.write([
      "NCS M0 — primera publicación restringida de Continuity",
      "No establece ROOT_READY, autoridad constitucional, commissioning ni efectos protegidos.",
      "La operación termina inmediatamente después de la inicialización.",
      "",
      "Raíz canónica: " + destination.root,
      "Ruta relativa: " + destination.relativePath,
      "Destino efectivo: " + destination.filePath,
      "Snapshot: NEXO_CONTINUITY v1 vacío (todos los arrays vacíos)",
      "Ventana: esta única invocación foreground; sin continuación automática.",
      "SHA-256 de la operación exacta: " + digest,
      "",
      "Para confirmar esta única operación, escribe exactamente: PUBLICAR " + digest
    ].join("\n") + "\n");
    const prompt = createInterface({ input: io.stdin, output: io.stdout });
    let answer;
    try { answer = await prompt.question("> "); } finally { prompt.close(); }
    if (answer !== "PUBLICAR " + digest) {
      io.stdout.write(JSON.stringify({ status: "blocked", code: "NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED", writeAttempted: false }) + "\n");
      return 1;
    }
    const result = await bootstrapNexoContinuityStore({ root: parsed.root, relativePath: parsed.relativePath });
    io.stdout.write(JSON.stringify({ ...result, authorization: "NOT_EVALUATED", continuation: "STOPPED" }) + "\n");
    return result.status === "committed" ? 0 : 1;
  } catch (error) {
    io.stdout.write(JSON.stringify({ status: "blocked", code: error && error.code ? error.code : "NEXO_CONTINUITY_BOOTSTRAP_FAILED", writeAttempted: false }) + "\n");
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runNexoContinuityBootstrapCli(process.argv.slice(2));
}
