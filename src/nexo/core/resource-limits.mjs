import fs from "node:fs/promises";

export const NEXO_RESOURCE_LIMITS = Object.freeze({
  chronicleEntryBytes: 256 * 1024,
  chronicleEntries: 10_000,
  chronicleDocumentBytes: 32 * 1024 * 1024,
  continuityCollections: Object.freeze({
    missions: 10_000,
    attempts: 20_000,
    doNotRepeat: 20_000,
    executions: 10_000,
    effectJournal: 20_000
  }),
  continuityDocumentBytes: 16 * 1024 * 1024,
  stdinBytes: 256 * 1024
});

function limitError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Read at most maxBytes + 1 raw bytes before UTF-8 decoding. The extra byte
 * distinguishes an exact-limit file from an oversized one without loading the
 * rest of an untrusted file into memory.
 */
export async function readUtf8FileBounded(fsModule = fs, filePath, maxBytes, limitCode) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw limitError("NEXO_RESOURCE_LIMIT_CONFIGURATION_INVALID");
  }
  const chunks = [];
  let total = 0;
  let handle;
  try {
    handle = await fsModule.open(filePath, "r");
    while (true) {
      const remainingWithSentinel = maxBytes + 1 - total;
      const buffer = Buffer.alloc(Math.min(64 * 1024, remainingWithSentinel));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > maxBytes) throw limitError(limitCode);
      chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
    }
  } finally {
    if (handle) await handle.close();
  }
  return Buffer.concat(chunks, total).toString("utf8");
}

export function serializedUtf8Bytes(value) {
  return Buffer.byteLength(JSON.stringify(value, null, 2) + "\n", "utf8");
}

export function assertUtf8ByteLimit(value, maxBytes, code) {
  if (Buffer.byteLength(value, "utf8") > maxBytes) throw limitError(code);
}

export function assertContinuityResourceLimits(snapshot) {
  for (const [key, max] of Object.entries(NEXO_RESOURCE_LIMITS.continuityCollections)) {
    if (!Array.isArray(snapshot?.[key]) || snapshot[key].length > max) {
      throw limitError("NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED");
    }
  }
  if (serializedUtf8Bytes({
    schema: "NEXO_CONTINUITY_STORE",
    schemaVersion: 1,
    storeRevision: 0,
    snapshot
  }) > NEXO_RESOURCE_LIMITS.continuityDocumentBytes) {
    throw limitError("NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED");
  }
}

export function assertChronicleResourceLimits(document) {
  if (!Array.isArray(document?.entries) ||
      document.entries.length > NEXO_RESOURCE_LIMITS.chronicleEntries ||
      serializedUtf8Bytes(document) > NEXO_RESOURCE_LIMITS.chronicleDocumentBytes) {
    throw limitError("NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED");
  }
}
