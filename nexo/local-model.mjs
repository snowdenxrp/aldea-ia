const DEFAULT_TIMEOUT_MS = 120000;

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function joinUrl(base, path) {
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}

async function fetchJson(fetchImpl, url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const { timeoutMs, ...fetchOptions } = options;
    const response = await fetchImpl(url, { ...fetchOptions, signal: controller.signal });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
    if (!response.ok) {
      throw new Error("Local model HTTP " + response.status + ": " + (body?.error?.message || body?.error || text || "request failed"));
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * OpenAI-compatible local inference adapter.
 * Talks only to a local endpoint. No cloud fallback is performed here.
 */
export function createLocalModel({
  baseUrl = "http://127.0.0.1:8080/v1",
  model = "nexo-local",
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== "function") throw new Error("Local model requires fetch()");

  const chat = async ({ messages, tools, temperature = 0.2, maxTokens = 4096, responseFormat } = {}) => {
    const payload = {
      model,
      messages: clone(messages || []),
      temperature,
      max_tokens: maxTokens
    };
    if (tools?.length) payload.tools = clone(tools);
    if (responseFormat) payload.response_format = clone(responseFormat);
    return fetchJson(fetchImpl, joinUrl(baseUrl, "chat/completions"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      timeoutMs
    });
  };

  const health = async () => {
    try {
      await fetchJson(fetchImpl, joinUrl(baseUrl, "models"), { method: "GET", timeoutMs: Math.min(timeoutMs, 10000) });
      return { online: true, provider: "local", model };
    } catch (error) {
      return { online: false, provider: "local", model, error: String(error?.message || error) };
    }
  };

  return Object.freeze({ chat, health, provider: "local", model, baseUrl });
}

export function createLocalModelPolicy({ flagship, balanced, compact, allowRemote = false } = {}) {
  const profiles = [flagship, balanced, compact].filter(Boolean);

  return Object.freeze({
    allowRemote,
    profiles: clone(profiles),
    select({ task = "general", availableModels = [] } = {}) {
      const available = new Set(availableModels);
      const ordered = profiles
        .filter(profile => !available.size || available.has(profile.id))
        .sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0));
      const selected = ordered[0] || profiles[0] || null;
      return selected ? clone(selected) : { id: null, task, offlineCapable: true };
    }
  });
}
