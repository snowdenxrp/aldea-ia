# NCS M0 — entrypoints versionados que abren Continuity: hallazgo de E3
**Fecha:** 2026-10-28  
**Rama:** `ncs-clean-architecture`  
**Tipo:** inspección estática acotada de entrypoints; no ejecución, no inventario exhaustivo, no autorización.

## 1. Hallazgo principal
La revisión de los scripts de paquete y de dos entrypoints versionados encontró dos rutas de ejecución que llaman explícitamente a `openNexoContinuityOwner`:
- `npm run assistants` → `scripts/assistants.mjs`
- `npm run simulate` → `scripts/simulate.mjs`

Por tanto, E3 no puede resumirse como “no existe launcher de Continuity”: sí hay entrypoints versionados que abren el store durante sus flujos. Eso no prueba que estén instalados, configurados o activos en el POCO. La invocación concreta del dispositivo sigue sin identificarse.

## 2. Evidencia estática por entrypoint
### A. `package.json`
Blob SHA: `e45dc6d215db53ea2758009cd501f565634e3610`.
- `assistants`: `node scripts/assistants.mjs`
- `simulate`: `node scripts/simulate.mjs`
- `nexo`: `node scripts/nexo.mjs`

### B. `scripts/assistants.mjs`
Blob SHA: `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.
- Importa `openNexoContinuityOwner` desde `./nexo-continuity.mjs`.
- Resuelve `NEXO_CONTINUITY_PATH` desde la variable de entorno; si no existe, usa `.nexo-continuity.json` en la raíz del repositorio.
- Llama al servicio con `filePath`, `legacyMemory: persisted.nexoMemory ?? null` y opciones adicionales visibles en el script.
- Después de abrir Continuity, crea/ejecuta la simulación y usa `createLearningMemory` desde `src/assistants/memory.js`; también crea `nexoMemory` incluyendo `continuity.current.snapshot`, registra una misión en Continuity y llama a `persistState` para el estado de simulación.
- Tiene una rama opcional `--nexo-repair-once`; la sesión de reparación está bloqueada en el gate de runtime actual, pero este documento no afirma que el resto del flujo sea inocuo.

### C. `scripts/simulate.mjs`
Blob SHA: `1b5e39b681486f583c1779770c52dd913227dfa1`.
- Importa `openNexoContinuityOwner`.
- Define `NEXO_CONTINUITY_PATH` como `.nexo-continuity.json` junto al script, sin observarse en el fragmento consultado una variable de entorno para cambiar esa ruta.
- En su flujo principal abre Continuity con `filePath` y `legacyMemory: state.nexoMemory ?? null`, después ejecuta/avanza la simulación y persiste el estado de simulación.

### D. `scripts/nexo-continuity.mjs`
Blob SHA previamente verificado: `f08969f2d77a2e90f74d01c96242e29de89e3f22`.
- Solo reexporta la API de Continuity; la decisión de abrir el store la toman los callers anteriores.

### E. `scripts/nexo.mjs`
Blob SHA: `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- Define un router de CLI estrecho; el parser consultado ofrece `status`, `mission-status` y `chronicle-append`, y no expone un comando dedicado de primera creación de Continuity en ese parser.
- Este router no elimina los otros dos entrypoints.

## 3. Consecuencia para el modelo operativo
1. **No seleccionar `npm run assistants` ni `npm run simulate` como mecanismo de primera creación de Continuity M0** sin una decisión y contrato específicos: ambos mezclan la apertura de Continuity con flujos de simulación/estado de aplicación, incompatibles con tratar la primera creación como una operación aislada por defecto.
2. `npm run assistants` puede recibir un path alternativo mediante `NEXO_CONTINUITY_PATH`; eso selecciona una ruta, pero no prueba exclusividad ni aislamiento de writers.
3. `npm run simulate` parece fijar el path por defecto a `.nexo-continuity.json` en el árbol del proyecto. No usarlo para bootstrap M0 en el dispositivo sin una decisión explícita y verificación adicional.
4. El CLI `npm run nexo` es el entrypoint más estrecho de los tres, pero el parser consultado no ofrece primera creación de Continuity. No debe forzarse para hacer bootstrap mediante un comando inexistente.
5. Esta evidencia cambia el mapa documental de E3: existen dos entrypoints candidatos que deben clasificarse/excluirse explícitamente en el contrato de alcance; no identifica el launcher real del POCO ni prueba que no haya más writers.

## 4. Estado de gates
- E1: IDENTIFICADO (POCO X7 Pro / Android).
- E3: PARCIALMENTE ACOTADO; dos entrypoints versionados abren Continuity, pero launcher real y cobertura completa siguen UNKNOWN.
- E2: UNKNOWN; ningún hallazgo estático prueba exclusión/no reanudación.
- E4: NOT READY; falta ruta efectiva del uso previsto y su ámbito de almacenamiento.
- P01-B: C — NO SELECCIONAR TODAVÍA.
- P-01: OPEN / UNKNOWN; P-05: NO RATIFICADA.
- M0: INCOMPLETO; primera creación y efectos protegidos: STOP.

## 5. Qué hacer ahora y qué no hacer
Siguiente paso documental: registrar en la matriz de entrypoints que `assistants` y `simulate` son callers de Continuity que no se seleccionan para primera creación M0 por mezclar flujos; confirmar esa exclusión en el contrato de alcance antes de implementar nada. La decisión del propietario de permitir un entorno restringido autoriza a definir precondiciones, no a escoger silenciosamente estos entrypoints.

No ejecutar ninguno de los scripts, no crear Continuity, no modificar código, no cambiar rutas, no tocar el POCO, no ejecutar tests/CI/Actions. La observación estática no demuestra actividad ni ausencia de procesos en el dispositivo.

## 6. Fuentes consultadas
- `package.json` — `e45dc6d215db53ea2758009cd501f565634e3610`
- `scripts/assistants.mjs` — `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`
- `scripts/simulate.mjs` — `1b5e39b681486f583c1779770c52dd913227dfa1`
- `scripts/nexo-continuity.mjs` — `f08969f2d77a2e90f74d01c96242e29de89e3f22`
- `scripts/nexo.mjs` — `e471eb478a09aa8a9a8323795583e198cdf0a127`

No se ejecutó código ni se cambió ningún archivo ejecutable.
