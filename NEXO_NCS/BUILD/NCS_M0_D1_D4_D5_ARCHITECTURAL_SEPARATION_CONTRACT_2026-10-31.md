# NCS M0 — Contrato de separación arquitectónica D1 / D4 / D5

**Fecha:** 2026-10-31  
**Base de código inspeccionada:** `ncs-clean-architecture`; blobs indicados en §8.  
**Tipo:** decisión técnica propuesta y criterios de aceptación; documental, no implementada.  
**Alcance:** separación entre apertura/bootstrap/migración, encapsulación de persistencia y aislamiento Nexo/Lúmina.

## 1. Dictamen

Los tres hallazgos están relacionados, pero no son el mismo defecto:

- **D1 — ciclo de vida:** `openNexoContinuityOwner()` puede crear Continuity si el archivo falta, importando `legacyMemory` o aceptando `allowEmptyInitialization`. Por tanto, “abrir” no es una operación exclusivamente de lectura/apertura.
- **D4 — capacidad de escritura:** `openNexoContinuityOwner()` devuelve tanto `owner` como `store`; el store expone `commitIfCurrent()`. Existe al menos un consumidor de settlement que construye y persiste un snapshot directamente, fuera de las invariantes semánticas del owner.
- **D5 — propiedad del dominio y ruta:** `assistants.mjs` y `simulate.mjs` abren el almacén Nexo desde procesos de Lúmina. El primero respeta `NEXO_CONTINUITY_PATH`; el segundo usa siempre una ruta derivada del archivo. No hay un único destino efectivo compartido.

**Recomendación de arquitectura:** Lúmina no debe abrir, inicializar ni escribir Nexo Continuity en sus entrypoints ordinarios. El ciclo de vida de Continuity pertenece a entrypoints Nexo explícitos. El acceso de escritura debe quedar encapsulado en el owner. La migración histórica se conserva como operación independiente y explícita; no se activa por ausencia del almacén ni por ejecución de Lúmina.

Esta recomendación es coherente con la separación Nexo ≠ Lúmina y evita “resolver” D5 simplemente haciendo que dos entrypoints de Lúmina compartan la misma ruta: compartir ruta no corrige la mezcla de dominios.

## 2. D1 — separar apertura, bootstrap y migración

### 2.1 Hecho actual

En `src/nexo/core/continuity-service.mjs`:

- `bootstrapNexoContinuityStore({root, relativePath, ...})` es una operación dedicada: deriva el destino, inicializa snapshot vacío, no acepta `legacyMemory`, no devuelve owner.
- `openNexoContinuityOwner(options)` carga el store; si recibe NOT_FOUND, puede llamar `projectNexoContinuitySnapshot(legacyMemory)` o inicializar vacío con `allowEmptyInitialization === true`; después devuelve owner y store.
- Por ello, el nombre “open” no describe el efecto completo. La creación está mezclada con la apertura ordinaria.

### 2.2 Contrato objetivo

| Operación | Responsabilidad permitida | Prohibiciones |
|---|---|---|
| `openExistingNexoContinuityOwner` | Abrir y validar un store ya existente; construir owner sobre ese store | No `initialize`; no legacy projection; no crear; no fallback vacío |
| `bootstrapNexoContinuityStore` | Primera publicación M0 de snapshot vacío, con root y ruta relativa explícitos y gates separados | No owner; no legacy; no admission/PREPARED/dispatch/reconcile/domain mutation |
| `migrateLegacyNexoContinuity` | Operación futura explícita para importar la fuente histórica conforme a contrato propio | No se invoca desde open, bootstrap, assistants ni simulate; no sobreescribe destino; no descarta PREPARED |

Reglas:
1. La ausencia al abrir devuelve `NEXO_CONTINUITY_STORE_NOT_FOUND` o un error de dominio equivalente; nunca crea.
2. Un store corrupto o incompatible no dispara fallback a legacy ni inicialización vacía.
3. La migración existente no se elimina. Se separa y conserva su comportamiento histórico en una API con nombre/intención explícitos, hasta que el contrato de migración sea autorizado y endurecido.
4. No se mantiene una API genérica de apertura con flags `legacyMemory` / `allowEmptyInitialization` que permita reintroducir accidentalmente creación por caller.
5. PREPARED histórico se preserva como obligación no resuelta; no se elimina, no se convierte en permiso ni se redespacha. Si una futura migración no puede validar su identidad/significado, STOP sin alterar la fuente.
6. La compatibilidad de tests se resuelve adaptando tests/callers a la operación explícita correspondiente, no manteniendo creación implícita en la API de apertura.

### 2.3 Criterios de aceptación D1

- D1-A: abrir archivo existente válido devuelve owner y revisión sin cambiar bytes/revisión.
- D1-B: abrir destino ausente falla sin crear archivo, lock, temporal ni directorio de Continuity.
- D1-C: abrir destino corrupto/incompatible falla; no lee/importa legacy ni reemplaza el archivo.
- D1-D: bootstrap recibe solo root/ruta relativa y devuelve resultado de publicación; no devuelve owner ni ejecuta operación de dominio.
- D1-E: migración solo ocurre mediante llamada explícita separada; su fuente PREPARED queda preservada como obligación no resuelta.
- D1-F: tests demuestran que ninguna llamada de apertura ordinaria crea estado bajo ausencia.

## 3. D4 — encapsular la capacidad de persistencia

### 3.1 Hecho actual

- `createNexoContinuityStore()` devuelve `loadCurrent`, `initialize` y `commitIfCurrent`.
- `openNexoContinuityOwner()` expone el objeto store en su resultado público.
- `scripts/nexo-repair-settlement.mjs` recibe store, construye un snapshot candidate y llama `store.commitIfCurrent()` directamente para pasar PREPARED a `settled_observed`.
- `continuity-owner.mjs` ya centraliza operaciones semánticas como `recordMission`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared`, usando una capacidad interna de commit.
- El runtime de producto M0 actualmente bloquea reparación mediante `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. El writer de settlement es un camino auxiliar/capacidad presente en el repositorio; no afirmar que el runtime M0 actual lo despacha.

### 3.2 Contrato objetivo

1. El resultado público de apertura contiene `owner` y `current`; no expone `store`.
2. El objeto store y `commitIfCurrent` quedan privados al módulo de composición/owner. Ningún script, adapter o aplicación recibe la capacidad genérica de escribir snapshots.
3. Las escrituras se expresan como operaciones semánticas del owner, que valida:
   - identidad de misión/paso/acción/target;
   - revisión esperada y CAS;
   - estado previo permitido;
   - esquema completo del registro;
   - transición de estado admitida;
   - resultado UNKNOWN/STOP si no puede confirmar.
4. El settlement de reparación actual no se “parchea” para recibir otra vez un store por parámetro ni se convierte automáticamente en método permisivo del owner. La reparación está fuera de M0 Option A. Cualquier futuro settlement deberá tener operación owner-owned y verificador de observación confiable, después de autorización específica de alcance.
5. No se añade un método genérico como `owner.commit(candidate)`, `owner.updateSnapshot(callback)` o `owner.mutate(collection)`; eso trasladaría la capacidad sin encapsular invariantes.
6. La capacidad de bootstrap sigue separada y no entrega owner/store operacional al llamador.

### 3.3 Criterios de aceptación D4

- D4-A: `openExistingNexoContinuityOwner` no devuelve propiedad `store` ni referencia equivalente.
- D4-B: ningún módulo de aplicación/script importa o invoca `commitIfCurrent` directamente.
- D4-C: todos los cambios operacionales pasan por métodos owner con validación específica.
- D4-D: no existe API pública genérica de commit/mutación de snapshot.
- D4-E: tests negativos prueban que callers no pueden saltarse invariantes ni alterar journal/collections mediante store crudo.
- D4-F: el camino M0 mantiene `authorization: NOT_EVALUATED` y bloqueos actuales; encapsular persistencia no crea autorización.

## 4. D5 — separar entrypoints Nexo de procesos Lúmina

### 4.1 Hecho actual

- `scripts/assistants.mjs` resuelve `NEXO_CONTINUITY_PATH` si existe; si no, usa `.nexo-continuity.json` junto al repositorio.
- `scripts/simulate.mjs` define su ruta de Continuity directamente junto a `world-state.json` e ignora `NEXO_CONTINUITY_PATH`.
- Ambos llaman `openNexoContinuityOwner` y, por tanto, pueden crear/importar Continuity al faltar el destino.
- `assistants.mjs` también crea misión Nexo y la persiste en Continuity mientras ejecuta análisis/aprendizaje de Lúmina.
- `simulate.mjs` abre Continuity aunque su responsabilidad principal sea avanzar/persistir el mundo de Lúmina.
- La divergencia de ruta es real; igualar las dos constantes no resolvería la dependencia indebida de Lúmina sobre Nexo.

### 4.2 Contrato objetivo recomendado

**Entry points Lúmina (`simulate`, `assistants`):**
- Solo leen/escriben el estado de Lúmina y sus propios datos.
- No importan `openNexoContinuityOwner`.
- No crean, migran, leen ni escriben `.nexo-continuity.json`.
- No usan `state.nexoMemory` como mecanismo automático de importación de Continuity.
- El análisis de Lúmina puede producir hallazgos/datos; la admisión y persistencia de misiones Nexo se hacen en una sesión Nexo explícita, no como efecto lateral de `assistants`.

**Entry points Nexo:**
- Resuelven una sola configuración efectiva de Continuity mediante helper compartido.
- El destino se recibe explícitamente desde el launcher/composición Nexo. Para rutas de entorno restringido, no se infiere desde el CWD ni desde un default de Lúmina.
- La ruta relativa/absoluta se valida una sola vez y se pasa como valor resuelto a todas las capas; no se recalcula en módulos hijos.
- Si falta configuración obligatoria o hay discrepancia, UNKNOWN/STOP; no fallback a otra ubicación.
- La migración legacy es una acción explícita independiente, nunca una consecuencia de ejecutar assistants/simulate.

No se propone seleccionar Termux, app Android, launcher ni filesystem aquí. El helper de ruta no demuestra E2/E3, aislamiento del entorno ni estabilidad física del destino.

### 4.3 Criterios de aceptación D5

- D5-A: ejecutar `simulate` con Continuity ausente no crea archivo, lock ni temporal de Continuity.
- D5-B: ejecutar `assistants` con Continuity ausente no crea ni migra Continuity ni registra misión Nexo.
- D5-C: `NEXO_CONTINUITY_PATH` definido/no definido no cambia el comportamiento Nexo de los entrypoints Lúmina: no deben acceder al store.
- D5-D: una sesión Nexo explícita recibe un único `filePath` efectivo y lo propaga sin recomputarlo en el hijo.
- D5-E: la misma invocación desde distintos CWD resuelve idéntico destino solo cuando el launcher suministra el mismo destino explícito.
- D5-F: ausencia, ruta relativa ambigua o discrepancia produce STOP; no fallback silencioso.
- D5-G: no hay importaciones cruzadas que hagan que una simulación ordinaria escriba Continuity.

## 5. Orden de implementación recomendado

No implementar los tres cambios como un parche monolítico. Secuencia:

1. **D1 API split:** introducir open-existing sin creación y separar migración explícita. Actualizar callers/tests solo en ramas autorizadas.
2. **D5 boundary:** retirar acceso Continuity de assistants/simulate; mover admisión de misión a entrypoint Nexo explícito. Esto elimina el caller ordinario que dependía de la API ambigua.
3. **D4 capability closure:** retirar store del resultado público y eliminar el writer directo de settlement. Cualquier ruta de reparación queda bloqueada/excluida hasta que exista autorización propia.
4. Ejecutar tests unitarios dirigidos; después suites de regresión autorizadas. CI solo con autorización y SHA identificado.
5. Verificar diff y búsqueda estática para probar que no quedan callers directos ni importaciones accidentales.
6. No ejecutar bootstrap real ni efectos protegidos. No marcar FB-03/FB-04 cerrados por tests de código.

## 6. No objetivos / límites

- No cambiar semántica ni borrar migración legacy histórica.
- No eliminar PREPARED ni convertirlo en terminal.
- No introducir nueva autorización, owner constitucional, raíz legítima o estado ROOT_READY.
- No modificar Chronicle, su gate FB-02 cerrado o la matriz de efectos protegidos.
- No seleccionar Android app, Termux, Keystore/KeyMint, hard-link, rename u otra primitiva de publicación.
- No afirmar aislamiento frente a root/kernel/administrador hostil.
- No confundir encapsulación de persistencia con control ambiental E2/E3.
- No tratar el lock cooperativo como exclusión global.

## 7. Estado y autorización

Este documento es una propuesta técnica de separación; no autoriza por sí mismo cambios de runtime, tests, workflows, CI, launcher ni dispositivo.

- M0: INCOMPLETO.
- D1/D4/D5: defectos arquitectónicos confirmados; contrato objetivo documentado, implementación pendiente.
- FB-01: OPEN/UNKNOWN en aplicabilidad de raíz/destino.
- FB-02: PASS/CERRADO únicamente en su alcance/SHA previamente validado.
- FB-03: OPEN/UNKNOWN; E2/E3 UNKNOWN.
- FB-04: OPEN/UNKNOWN.
- FB-05/P-05: NO RATIFICADA.
- FB-06/FB-07: OPEN.
- Root: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`.
- First publication: STOP.
- Protected effects: STOP.

**No se modificaron runtime, tests, workflows, configuración ni dispositivo. No se ejecutaron tests, CI/Actions, scripts, bootstrap ni efectos protegidos.**

## 8. Evidencia de código inspeccionada

| Archivo | Blob | Evidencia relevante |
|---|---|---|
| `src/nexo/core/continuity-service.mjs` | `86b33409ca7150e45846c7c97a2d4b28780121e7` | bootstrap dedicado; open con legacy/empty-init; retorno {store, owner, current} |
| `src/nexo/core/continuity-store.mjs` | `9ffd28930abdbe29f5b041711cc29b74dc99fbae` | API pública del store: loadCurrent/initialize/commitIfCurrent |
| `src/nexo/core/continuity-owner.mjs` | `6d1fa37745ca57e5ab5093b9cdcabf1ff5495261` | operaciones semánticas y commits internos del owner |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | resuelve env path, abre Continuity, registra misión Nexo y guarda Lúmina |
| `scripts/simulate.mjs` | `1b5e39b681486f583c1779770c52dd913227dfa1` | ruta fija; abre Continuity antes de simular/persistir mundo |
| `scripts/nexo-continuity.mjs` | `ecd4bfb999ed67f88229d40e009daaa3d1b61380` | re-export de service |
| `scripts/nexo-repair-settlement.mjs` | `2f6e91d494b4edb012c2b2db5a077b875c5b0348` | settlement muta snapshot y llama commitIfCurrent directamente |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` | acepta store como dependencia para settlement |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` | runtime M0 bloquea repair por Option A; no dispatch |
| `tests/nexo/continuity-migration.test.mjs` | `0bef1b93c6268042f14830c97e084d0a543e05f4` | pruebas existentes preservan PREPARED y bloquean lineage sin condiciones; test legacy usa open actual |

**Límite de revisión:** lectura estática dirigida de estos archivos. No se ejecutó búsqueda exhaustiva de todos los consumidores externos al alcance inspeccionado ni se ejecutó ningún test. Los criterios de aceptación anteriores son propuestos y no deben describirse como implementados o verificados.
