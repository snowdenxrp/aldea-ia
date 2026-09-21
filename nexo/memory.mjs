function clone(value) {
  return value == null ? value : structuredClone(value);
}

function tokenize(text) {
  return String(text || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/).filter(token => token.length > 1);
}

function similarity(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const token of A) if (B.has(token)) shared++;
  return shared / Math.sqrt(A.size * B.size);
}

export function createNexoMemory({ maxEntries = 10000, clock = () => new Date().toISOString() } = {}) {
  const entries = [];

  const learn = ({ namespace = "general", text, kind = "fact", importance = 0.5, source = "local", tags = [] } = {}) => {
    if (!text) throw new Error("Memory text is required");
    const entry = {
      id: "mem-" + Date.now() + "-" + (entries.length + 1),
      namespace, text: String(text), kind,
      importance: Math.max(0, Math.min(1, importance)),
      source, tags: [...new Set(tags.map(String))],
      createdAt: clock(), updatedAt: clock(), uses: 0
    };
    entries.push(entry);
    if (entries.length > maxEntries) entries.splice(0, entries.length - maxEntries);
    return clone(entry);
  };

  const recall = ({ query = "", namespace, limit = 8 } = {}) => {
    const results = entries
      .filter(entry => !namespace || entry.namespace === namespace)
      .map(entry => ({
        ...entry,
        score: similarity(query, entry.text) * 0.7 + entry.importance * 0.3
      }))
      .filter(entry => entry.score > 0 || !query)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    for (const result of results) {
      const original = entries.find(entry => entry.id === result.id);
      if (original) original.uses++;
    }
    return clone(results);
  };

  const forget = (id) => {
    const index = entries.findIndex(entry => entry.id === id);
    if (index < 0) return false;
    entries.splice(index, 1);
    return true;
  };

  const snapshot = () => clone(entries);
  const hydrate = (saved) => {
    if (!Array.isArray(saved)) throw new Error("Invalid Nexo memory");
    entries.length = 0;
    entries.push(...clone(saved));
    return snapshot();
  };

  return Object.freeze({ learn, recall, forget, snapshot, hydrate });
}
