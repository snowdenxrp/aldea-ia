// Fuente de aleatoriedad inyectable para Lúmina.
// Sin semilla usa Math.random(); con semilla produce una secuencia reproducible.

export function createRandom(seed = null) {
  if (seed === null || seed === undefined) return Math.random;

  let state = normalizeSeed(seed);
  return () => {
    // Mulberry32: simple, rápido y determinista para simulaciones/tests.
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed | 0;
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash | 0;
}
