export const NEXO_SCHEMA_VERSION = 1;

export const MODES = Object.freeze([
  "normal",
  "resilience",
  "emergency",
  "continuity",
  "recovery",
  "legacy",
]);

export const AUTHORITY_LEVELS = Object.freeze({
  SAFE: 0,
  SCOPED: 1,
  CONFIRMATION: 2,
  OWNER: 3,
});

export function createIdentity({ id = "nexo", name = "Nexo", version = "0.1.0" } = {}) {
  return Object.freeze({
    id,
    name,
    version,
    schemaVersion: NEXO_SCHEMA_VERSION,
  });
}

export function createState({ identity = createIdentity(), mode = "normal" } = {}) {
  if (!MODES.includes(mode)) throw new Error(`Invalid Nexo mode: ${mode}`);
  return {
    schemaVersion: NEXO_SCHEMA_VERSION,
    identity,
    mode,
    availability: "online",
    currentTask: null,
    activeAgents: [],
    model: null,
    memoryStatus: "uninitialized",
    securityStatus: "nominal",
    powerStatus: "unknown",
    systemHealth: "unknown",
  };
}

export function createEvent({ type, payload = {}, source = "core", timestamp = new Date().toISOString() }) {
  if (!type || typeof type !== "string") throw new TypeError("Event type is required");
  return Object.freeze({
    id: crypto.randomUUID(),
    schemaVersion: NEXO_SCHEMA_VERSION,
    type,
    source,
    timestamp,
    payload,
  });
}

export function createTask({ title, risk = AUTHORITY_LEVELS.SAFE, metadata = {} }) {
  if (!title || typeof title !== "string") throw new TypeError("Task title is required");
  if (!Number.isInteger(risk) || risk < 0 || risk > AUTHORITY_LEVELS.OWNER) {
    throw new RangeError("Task risk must be an authority level from 0 to 3");
  }
  return Object.freeze({
    id: crypto.randomUUID(),
    title,
    risk,
    status: "pending",
    metadata,
    createdAt: new Date().toISOString(),
  });
}

export function createResult({ taskId, status = "success", value = null, error = null }) {
  if (!taskId) throw new TypeError("Result taskId is required");
  if (!["success", "failure", "blocked"].includes(status)) {
    throw new Error(`Invalid result status: ${status}`);
  }
  return Object.freeze({
    taskId,
    status,
    value,
    error,
    completedAt: new Date().toISOString(),
  });
}
