const SOURCES = [
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "https://unpkg.com/three@0.180.0/build/three.module.js",
  "https://esm.sh/three@0.180.0"
];

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Three.js CDN timeout (${ms} ms)`)), ms))
  ]);
}

let three = null;
let lastError = null;
for (const url of SOURCES) {
  try {
    three = await withTimeout(import(url), 7000);
    break;
  } catch (error) {
    lastError = error;
    console.warn("Lúmina: fallo cargando Three.js desde", url, error);
  }
}

if (!three) {
  throw new Error(`No se pudo cargar Three.js desde ningún CDN. Último error: ${lastError?.message ?? lastError}`);
}

export default three;
