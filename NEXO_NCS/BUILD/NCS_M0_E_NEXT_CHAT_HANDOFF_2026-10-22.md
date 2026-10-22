# CHECKPOINT MÁS RECIENTE — 2026-10-22 — LOCK OWNER READS ACOTADAS Y CI VERDE

Inventario de los stores encontró que los documentos principales tenían lecturas acotadas, pero los archivos auxiliares `*.lock/owner.json` se leían sin límite explícito.

- Añadido `NEXO_RESOURCE_LIMITS.lockOwnerBytes = 4096`.
- `continuity-store.mjs` y `chronicle-store.mjs` usan `readUtf8FileBounded` para leer los owner records, tanto en la inspección normal como en el fallback de adquisición.
- Owner record mayor de 4096 bytes, malformado o no inspeccionable => `LOCK_STATE_UNKNOWN`; no borrar lock ni empezar escritura.
- Tests escriben un owner record de 4097 bytes y verifican el bloqueo fail-closed, preservación del lock y ausencia de documento canónico.
- Los tests que simulan pérdida de propiedad del lock se adaptaron para simular el handle `open/read`, sin debilitar la lectura acotada en producción.
- Se conserva el requisito explícito: rutas y directorios son configuración local confiable; no se declara defensa frente a procesos hostiles con control del directorio, symlinks ni durabilidad ante pérdida de energía.

HEAD de código/pruebas: `1d822786d972616ffbb03e25abd43084076f10e4`.
CI SUCCESS en ese SHA:
- STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027492
- STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027483
- bounded mission admission/restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027449
- Chronicle native vertical: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027473
- integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027551
- deterministic persistence suite: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027546

Siguiente: verificar CI para HEAD documental nuevo y continuar el inventario de fronteras auxiliares de almacenamiento sin crear nuevas abstracciones salvo que exista una omisión demostrable. No reabrir formas de misión ya cubiertas. No cambiar autoridad ni activar efectos protegidos.

Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — PREFLIGHT COMPARTIDO, CI VERDE Y OPTION A

La validación de continuidad ahora comparte un preflight iterativo antes de entrar en validadores recursivos:

- Nuevo módulo `src/nexo/core/continuity-data-guard.mjs`.
- `continuity-snapshot.mjs` lo usa antes de validar snapshots.
- `continuity-contract.mjs` lo usa antes de validar/proyectar memoria legacy.
- Profundidad global del grafo de continuidad: 35, para preservar los 32 niveles de admisión por misión después de los contenedores que añaden niveles. Esto es un límite de profundidad estructural, no un presupuesto de heap.
- Regresiones: snapshots profundos, memoria legacy profunda y proyección legacy profunda deben fallar antes de alcanzar validación/clonación recursiva.

Option A fue reconciliada en el test CLI, no en el runtime:
- Commit de test `3850889d7f127c7415d429bc3512d78171573291`.
- La ruta opt-in exige `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`, journal de efectos vacío y revisión del entorno sin incremento adicional por reparación.
- La misión de planificación puede persistir, pero la operación de reparación protegida no se despacha. `scripts/nexo-runtime-session.mjs` permanece como gate bloqueado.

CI para el SHA de código/pruebas `3e98103aa6ea65a4de4d74b68300ee89a1321e36`:
- deterministic persistence tests SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246643
- integrated acceptance regression SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246786
- STEP 4 semantic validation SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246618
- STEP 5 outcome classification SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246778
- repair settlement crash cuts SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246635
- El workflow bounded mission admission/restart continuity disponible en la lista anterior corresponde a SHA `d63cf5b`, no debe atribuirse al SHA `3e98103`.

Siguiente trabajo: confirmar HEAD después de los commits de documentación; revisar si los perfiles de admisión por misión y el preflight común de continuidad están descritos como un solo contrato versionado; continuar con el inventario de rutas de store sólo si aparece un camino que no aplique ambos límites. No ampliar cuotas ni modificar runtime por especulación.

Estado canónico sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — PROFUNDIDAD DE SNAPSHOT Y REGRESIÓN VERIFICADA

Se cerró una brecha de orden de validación: la validación genérica recursiva corría antes de los guardas iterativos de admisión de misión. Un snapshot podía contener datos muy profundamente anidados fuera de `missions` y alcanzar la recursión genérica antes de que se aplicaran los límites del documento.

- Fix: commit `2b617e2843a7de0c4b9d900ea4f13dbee0e4f191`; `assertNexoContinuitySnapshot` ahora ejecuta primero un preflight iterativo.
- Regresión: commit `4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`; anidamiento de profundidad 40 en `attempts` se rechaza con `NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED`.
- CI para el SHA `4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`: deterministic persistence tests SUCCESS https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743391; integrated acceptance regression SUCCESS https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743415.
- CI adicional para el SHA `2b617e2`: STEP 4 SUCCESS https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724112; STEP 5 SUCCESS https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724169; bounded mission admission/restart continuity SUCCESS https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724204.
- Límite estructural añadido: profundidad máxima 32 en todo el snapshot, comprobada iterativamente antes del guard recursivo. Esto previene desbordamiento de pila durante validación; no equivale a límite de heap ni prueba capacidad de producción.
- Sigue abierto y separado: `Nexo M0 — repair settlement crash cuts` falló en `tests/nexo/assistants-runtime-cli.test.mjs:74` porque la prueba espera `effectJournal[0]` mientras Option A excluye el efecto. Run https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724226. No habilitar el efecto ni cambiar runtime para forzar verde; requiere reconciliar el contrato de prueba con Option A en tarea propia.
- No se modificó autoridad, dispatch, ni ejecución de efectos protegidos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — REPARACIÓN DE CONCURRENCIA DEL CI DE PERSISTENCIA

Se identificó una causa operativa de la falta de evidencia completa: `.github/workflows/nexo-deterministic-tests.yml` usaba un grupo de concurrencia global y cancelaba la ejecución en curso en cada push (`cancel-in-progress: true`). Por eso las ejecuciones para SHAs anteriores acababan CANCELLED, lo cual no prueba que los tests pasaran o fallaran.

- Corrección del workflow: commit `3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0`.
- Ahora el grupo incluye `github.ref` y `cancel-in-progress: false`; las ejecuciones de ramas distintas quedan aisladas y las pruebas completas de persistencia se encolan en vez de cancelarse por cada commit.
- Al último chequeo, el run https://github.com/snowdenxrp/aldea-ia/actions/runs/39851124108 (SHA documental previo `0ccffaed`) seguía PENDING sin job asignado. Un run más antiguo continuaba IN_PROGRESS sin conclusión. No declarar CI verde hasta confirmar el resultado de un run relevante.
- En SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac`, los workflows de aceptación integrada, STEP 4, STEP 5 y admisión acotada fueron SUCCESS. La prueba determinista de persistencia fue CANCELLED, no PASS.
- Próximo paso: comprobar que el nuevo grupo de concurrencia se aplique y que la suite completa termine en el HEAD actual. Evitar commits adicionales mientras corre para preservar evidencia.
- No se alteró runtime, límites de admisión, autorización ni ejecución de efectos. Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — LÍMITE PERSISTIDO DE MISIÓN

Este checkpoint registra una brecha estructural confirmada: la admisión de misión nueva imponía 256 pasos, pero la validación común de un snapshot persistido no aplicaba por sí misma ese techo.

- Contrato: commit `df0ea917f38e02afb4dba97c5cec4e13b57a7e72`, en `src/nexo/core/continuity-contract.mjs`, incorpora la admisión compartida a la validación de cada misión persistida.
- Compatibilidad de errores: commit `16406ed67a05a68924289e0c215bd66be84210bc` mantiene los errores históricos de schema para formas inválidas y propaga el código específico sólo ante exceso de recursos.
- Regresión de 257 pasos: commit `17d03d4bab51498dee4293c0d924ab632cf4cf48`.
- Fixture del presupuesto agregado: commit `c105f9098faf5bf45531b5c91731499c319070ac` usa 65 misiones válidas y acotadas individualmente para que la prueba mida el límite de 16 MiB del documento y no choque con el límite por misión.
- CI del SHA `c105f9098faf5bf45531b5c91731499c319070ac`:
  - integrated acceptance regression SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153
  - STEP 4 semantic validation SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210
  - STEP 5 outcome classification SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069
  - bounded mission admission and restart continuity SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071
  - deterministic persistence tests PENDING: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946294
- Estado exacto al documentar: 4 SUCCESS / 1 PENDING. No declarar verde total antes de revisar el workflow pendiente.
- Las ejecuciones intermedias anteriores fallaron en pruebas existentes; el mapeo de errores se ajustó y el fixture de documento grande se reconstruyó para aislar el presupuesto agregado. La aceptación integrada del SHA `c105f90` pasa.
- No se alteró runtime ni se habilitó dispatch/efectos. El nuevo guard refuerza validación persistida; no demuestra autorización ni suficiencia de recursos de producción.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — SEGUNDA FORMA DE MISIÓN ADMITIDA

Este checkpoint amplía el anterior fixture de cadena con un grafo ramificado. No cierra la adecuación general del perfil de recursos.

- Código/prueba: [`ed48932f2479f398b11a6f10af55c8821150cc00`](https://github.com/snowdenxrp/aldea-ia/commit/ed48932f2479f398b11a6f10af55c8821150cc00), `tests/nexo/continuity-contract.test.mjs`.
- Cobertura añadida: cuatro pasos fork/join; destinos de texto; estados predeterminados al omitirlos; campos opcionales `reason`, `source`, `reversible`, `requiresEvidence`; aserciones de conservación de topología y campos.
- CI para ese SHA:
  - deterministic persistence tests SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868669
  - STEP 4 semantic validation SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868908
  - STEP 5 outcome classification IN_PROGRESS al último chequeo: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868876
  - integrated acceptance regression SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837869070
  - bounded mission admission and restart continuity SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868724
- No decir “5/5 PASS” hasta verificar el STEP 5 pendiente. El estado al documentar es 4 SUCCESS / 1 IN_PROGRESS.
- Evidencia disponible: dos formas representativas aceptadas en integración (cadena de 12 pasos con contexto anidado; grafo fork/join con defaults/campos opcionales). No es prueba de producción, capacidad de heap ni suficiencia universal de los límites.
- Próximo paso: verificar el workflow pendiente; luego seleccionar una sola brecha real de recursos. No agregar límites globales/locks/colas por especulación.
- Runtime intacto; no dispatch ni efectos protegidos. Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT MÁS RECIENTE — 2026-10-22 — PRUEBA REPRESENTATIVA DE ADMISIÓN

Este bloque supersede el punto 2 de “Siguiente trabajo exacto” del checkpoint anterior en lo que respecta al primer fixture representativo. No borra ni cierra las brechas de capacidad general.

- Código/prueba: commit `390d3a39faf802c22c3687102ce675b9362e1381`, archivo `tests/nexo/continuity-contract.test.mjs`.
- Prueba añadida: una misión válida de 12 pasos, dependencias en cadena, targets estructurados, contexto anidado y metadatos opcionales atraviesa `recordNexoMissionInSnapshot`; assertions comprueban que no se truncan pasos ni contexto.
- CI exacto de ese SHA: los cinco workflows SUCCESS:
  - deterministic persistence tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342109
  - STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342118
  - STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342204
  - integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342245
  - bounded mission admission and restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342249
- La prueba es un fixture representativo de contrato creado para cubrir integración; no es evidencia de producción ni prueba que el perfil v1 admita toda misión legítima.
- Siguiente trabajo exacto: inspeccionar únicamente las formas válidas de misión existentes en tests/contratos y determinar si hay variedad independiente suficiente. No repetir pruebas de máximo/máximo+1. Si faltan fixtures reales, documentar que la suficiencia funcional no puede concluirse con la evidencia actual. Luego elegir una sola brecha real de recursos.
- Sin cambios runtime; sin dispatch/persistencia/efectos habilitados por este trabajo. Estado canónico permanece M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT ACTUAL — 2026-10-22 — M0-E MISSION PREVIEW ADMISSION

> **Esta sección y el STATUS actualizan/superan las instrucciones de siguiente trabajo más antiguas que aparecen en el resto de este handoff.** El contexto histórico de autoridad/Step 7 se conserva como referencia, pero el siguiente trabajo activo es M0-E; no reiniciar la investigación de autoridad ni Step 7.

## Entrada del siguiente chat

El usuario inicia el chat nuevo escribiendo exactamente `NCS`. Leer primero `NEXO_NCS/STATUS.md`, luego esta sección y el diseño de admission limits. Continuar desde el HEAD actual, no desde un SHA histórico. No repetir auditorías, investigaciones ni pruebas cerradas; no volver a pedir decisiones ya aceptadas.

- Repo: `github.com/snowdenxrp/aldea-ia`
- Rama: `ncs-clean-architecture`
- HEAD verificado: `7ba84fdb0ef0d0330122a5a9d916205c06a132a7`
- Commit HEAD: actualización documental de STATUS.
- CI en HEAD documental: [deterministic persistence tests SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828330129).
- Código/pruebas del contrato de admisión verificados en SHA `9f97f61a5517f0b591a677f91607a9ef05696c9e`; los tres workflows listados abajo son los que validan ese SHA de código/pruebas, no el commit documental posterior.

## Trabajo completado en esta puerta

### Implementación compartida

- Nuevo `src/nexo/core/mission-admission-contract.mjs`: guard estructural iterativo antes de validación/clonado recursivos. Cuenta nodos/profundidad, limita volumen de cadenas/claves y cardinalidad de misión, rechaza formas de objeto no ordinarias y ciclos.
- `src/nexo/core/continuity-operations.mjs`: `missionRecord` aplica el guard antes de la validación canónica.
- `src/nexo/application/mission-request-preview.mjs`: aplica el mismo guard al envelope; mantiene límite específico de `intent`; preserva los códigos de exceso de recursos en vez de degradarlos a error genérico.
- `scripts/nexo.mjs`: ambos comandos de preview usan lectura acotada de bytes crudos antes de decodificación/JSON.parse.
- `tests/nexo/mission-request-preview.test.mjs`: cobertura de límites estructurales y de los dos entrypoints CLI.

### Límites v1 actualmente en el código

| Dimensión | Límite inclusivo |
|---|---:|
| Archivo de entrada de CLI preview | 4 MiB = 4,194,304 bytes |
| Pasos por misión | 256 |
| Dependencias por paso | 64 |
| Nodos JSON visitados | 20,000 |
| Profundidad JSON | 32 |
| Cadena o clave UTF-8 individual | 256 KiB |
| Suma UTF-8 de cadenas y claves | 4 MiB |
| Campo `intent` del envelope de petición | 16 KiB |

Son presupuestos de admisión v1, no mediciones de heap ni capacidades de producción. No afirmar que eliminan todos los fallos de memoria. Buffers, parseado, clones y snapshots pueden coexistir. No subir/bajar los números sin evidencia de fixtures válidos y una razón explícita.

### CI exacto de la implementación

- SHA: `9f97f61a5517f0b591a677f91607a9ef05696c9e`
- [Deterministic persistence tests — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828236600)
- [STEP 4 semantic validation — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909056)
- [STEP 5 outcome classification — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909080)

La cobertura incluye máximo exacto y máximo+1 para pasos, dependencias, profundidad, nodos, cadena individual y suma agregada; exceso de `intent`; ambos CLI en 4 MiB y 4 MiB + 1 byte; preservación de Continuity; ausencia de persistencia/dispatch; rechazo sin revelar el contenido de entrada.

### Documentación que ya existe — no duplicar

- [Diseño de admission limits](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_E_MISSION_PREVIEW_ADMISSION_LIMITS_DESIGN_2026-10-22.md)
- [Evidencia de frontera raw bytes](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_E_MISSION_PREVIEW_BYTE_BOUNDARY_TEST_EVIDENCE_2026-10-22.md)
- [STATUS actual](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)

## Brechas abiertas — no afirmar que están resueltas

1. Heap agregado por operación/proceso: no medido ni acotado con evidencia.
2. Concurrencia multiproceso: no hay enforcement de una cuota global entre invocaciones CLI. Pruebas de revisión/commit de un store no demuestran cuota global.
3. Disco agregado: presupuesto aún abierto.
4. Adecuación del perfil v1: revisar fixtures representativos y verificar que no se rechacen misiones legítimas.
5. Failure de workflow separado para Option A (ver abajo).

No añadir locks, colas, semáforos o contadores globales improvisados. Primero establecer unidad de ejecución y alcance operativo; si el modo es CLI local explícito, documentar con precisión qué queda fuera.

## Workflow FAILURE separado y conocido

[Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827598938) terminó FAILURE en SHA `5485f7d9180918b5dc110dc4d9ed8ffc87569789`. `tests/nexo/assistants-runtime-cli.test.mjs` espera `effectJournal[0]` tras una ruta repair; pero `scripts/nexo-runtime-session.mjs` devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, con `persisted: false` y `dispatchAttempted: false`. No activar el efecto ni cambiar runtime para forzar el verde. En una tarea separada, reconciliar el test/workflow con la decisión de alcance Option A y verificar CI en el SHA exacto. No contar este workflow como SUCCESS.

## Siguiente trabajo exacto

1. Confirmar HEAD y comprobar solo si existe trabajo posterior a este checkpoint.
2. Revisar fixtures de misiones representativas existentes frente al perfil v1; no volver a repetir las pruebas de frontera ya aprobadas. Añadir únicamente casos representativos que cubran una brecha concreta.
3. Documentar si el perfil v1 rechaza una misión legítima; cualquier cambio de límites debe tener fundamento y pruebas de frontera.
4. Luego elegir una sola brecha real: heap/disco agregados o definición de concurrencia en el alcance local. No pretender que la cuota entre procesos está implementada si no lo está.
5. En paralelo o como tarea delimitada aparte, resolver el FAILURE de Option A sin habilitar efectos excluidos.
6. Cada cambio de código debe tener CI para SHA exacto; distinguir CI PASS, fallo, pendiente y documentación únicamente. Actualizar STATUS y este handoff al cerrar el checkpoint.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. `intent` sigue sin interpretación semántica, y las vistas previas no autorizan, despachan ni persisten.

---

# NCS — handoff de continuidad M0-E (2026-10-22)

**Propósito:** continuar el trabajo de Nexo/M0 en un chat nuevo sin repetir auditorías, sin confundir documentos con implementación y sin cambiar el estado constitucional.

## Instrucción de arranque

En el chat nuevo, escribe exactamente `NCS` y pega o referencia este handoff. Lee primero `NEXO_NCS/STATUS.md`, después este handoff y los dos contratos existentes que se enumeran abajo. Continúa desde la siguiente puerta concreta; no vuelvas a empezar STEP 7, M0-A/B/C/D ni las auditorías AB/P ya cerradas salvo evidencia nueva y específica.

Repositorio: `github.com/snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`  
HEAD de base inspeccionado antes de guardar el handoff: `7875878dd41b06c95fee4f8edea3f7d7c0253488`. Después se guardó este handoff y se enlazó desde STATUS; el HEAD final de la sesión debe verificarse en GitHub antes de continuar.  
STATUS blob anterior a este handoff: `7802aeab7e331be4985354f1ebc43b7fa08ff654`

## Estado canónico — no reinterpretar

- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: **PENDING/UNKNOWN**.
- Efectos protegidos: **STOP**.
- Constitución: puntos 1–7 aceptados solo como base del borrador; no aprobación completa, congelación, firma ni commissioning.
- Opción A: alcance inicial provisional; permite evaluar capacidades internas no protegidas, no habilita efectos protegidos.
- `chronicle_append` en la CLI auditada es persistencia local, no evidencia de autoridad constitucional.
- Ningún fixture `AUTHORIZED`, firma/hash, snapshot, dato de caller, proveedor o salida de modelo se debe tratar como prueba de raíz legítima.

## Evidencia persistente recién verificada

1. Inventario M0-E: [NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md](NEXO_NCS/BUILD/NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md)  
   Blob: `8f7f81966663236783f9550c907db1e14fd18392`.  
   Commit documental de inventario: `d6585c6744aa3debd6c6c4dcf9710ba2f72454f7`.

2. STATUS enlaza el inventario y conserva el estado canónico. Commit que actualizó STATUS: `7875878dd41b06c95fee4f8edea3f7d7c0253488`. CI que se había verificado para ese SHA: run `39711860061`, resultado `success`: https://github.com/snowdenxrp/aldea-ia/actions/runs/39711860061. Es éxito de CI para ese commit documental, no prueba de una nueva implementación ni de autoridad real.

3. Contrato de base de confianza inicial:  
   `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`  
   Blob observado: `e65df41ff98f7e53a8574ca5295a947023cb8b30`.  
   Estado: `DESIGN CANDIDATE — ATTACK REQUIRED`. Define reconocimiento independiente, independencia/failure domains, actualidad/revocación/sucesión/recuperación y procedencia protegida; no selecciona proveedor/hardware y prohíbe self-bootstrap.

4. Contrato Constitución→Policy:  
   `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`  
   Blob observado: `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`.  
   Estado: `DESIGN CANDIDATE — ATTACK REQUIRED`. Exige identidad exacta de Constitución y Policy, dominio, aplicabilidad, validez, dependencias y procedencia de establecimiento protegido. No autoriza una acción concreta.

5. Reutilización y siguiente puerta:  
   `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`  
   Blob: `f73fefce4ea27bc848def43155976a82890b6c6c`.  
   La siguiente puerta ya indicada fue inventariar clases de claim/efecto y sus límites reales; ese inventario ya está guardado en el punto 1. No crear otro contrato genérico de raíz, trust registry, GenesisRoot, selector de autoridad ni envoltura para disimular la brecha.

## Hallazgos de runtime y tests comprobados

- `src/nexo/core/ownership.mjs` crea el puerto `effectBoundary.prepare`, cuyo fallback es `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs` llama `authorityGate.check(claim)`; si el resultado tiene `AUTHORIZED`, continúa snapshot → candidate → validación semántica → `conditionalCommit.commit(candidate)`. No invoca `effectBoundary.prepare`.
- `conditionalCommit` es un puerto; no se ha demostrado que sea el sink de efectos externos reales. No afirmar un bypass productivo ni alcance universal de callers.
- `tests/nexo/protected-transition.test.mjs` cubre fail-closed para resultados `STOP`, `UNKNOWN`, forma malformada, candidato inválido y snapshots con alias. Los fixtures `AUTHORIZED` prueban el flujo posterior a un gate inyectado; no prueban raíz, vigencia o Constitución/Policy legítimas.
- `src/nexo/core/contracts.mjs` construye `ClaimEnvelope` y proyecta `policyContext` solo a campos de Policy; campos caller-supplied como `rootProof`, `constitutionRef` o `authorization` no se elevan a contexto confiable.
- Los contratos Genesis y Constitución→Policy siguen sin estar conectados a una fuente de raíz/procedencia real dentro del runtime inspeccionado.

## Siguiente trabajo exacto

### 1. Preparar la puerta de pruebas M0-E, no simular que está cerrada

Antes de escribir pruebas nuevas, revisar el cuerpo completo de:
- `tests/nexo/protected-transition.test.mjs`
- `tests/nexo/root-bootstrap-protocol.test.mjs`
- tests de owner-backed runtime que cubren la exclusión de acciones fuera de `chronicle_append`
- `src/nexo/core/protected-transition.mjs`, `ownership.mjs` y `contracts.mjs`.

Reusar los casos existentes. No añadir otro test que solo repita que el fixture `UNKNOWN` no llega a commit. Tampoco agregar un test cuyo resultado sea tautológicamente el mismo que el código que se acaba de escribir.

### 2. Resolver primero la dependencia arquitectónica real

La brecha pendiente no es de forma de `AuthorityResult`; es que falta una base inicial independiente y un contexto constitucional vigente, vinculado a la Policy, cuya procedencia no provenga del caller. Si los contratos y artefactos existentes no especifican cómo establecer esa base para el entorno real del usuario, **no implementar una raíz ficticia**. Registrar el requisito exacto y conservar STOP para esa clase de efecto.

No tomar como decisión ya aceptada un mecanismo de hardware, dispositivo, operador, proveedor, clave o recovery. No pedir al usuario que apruebe mecánicamente opciones nuevas; avanzar con análisis y evidencias hasta que una decisión del propietario sea genuinamente necesaria.

### 3. Criterios mínimos de la futura prueba integrada

Para la misma operación y claim, la prueba final deberá demostrar:
1. Procedencia de raíz establecida por una base independiente del store/artefacto que pretende autorizar.
2. Identidad exacta de Constitución que gobierna esa operación y su estado de aprobación vigente.
3. Binding Constitución→Policy exacto (hash/version/dominio/aplicabilidad/dependencias/validez), sin metadatos confiados desde el caller.
4. Evaluación de autoridad actual, revocación y conflictos según los contratos existentes.
5. Decisión específica para acción, recurso, target/incarnation y contexto.
6. Enforcement en la última frontera capaz de mutar, no solo en un caller previo; ante STOP/UNKNOWN no se llama al sink y no hay mutación.
7. Evidencia de resultado/reconciliación, sin convertir commit local en prueba de efecto externo.
8. Pruebas adversariales para raíz ausente, root/Policy falsificados por caller, hash/revisión discordantes, dependencia desconocida, revocación/conflicto y cambio de estado entre autorización y efecto; el test debe observar cero llamadas al sink en todos los casos que deben bloquearse.
9. CI reproducible ligado al SHA exacto del candidato.

No crear nuevas IDs/colas/retries/tombstones/epochs/fences/transaction wrappers salvo que un contrato existente y evidencia concreta demuestren que son necesarios; antes, identificar la raíz del problema.

### 4. No mezclar el trabajo de presupuesto de recursos

Los valores de Chronicle/Continuity propuestos el 2026-10-22 (stdin/content 256 KiB; Chronicle document 32 MiB/10,000 entries; snapshot 16 MiB; cardinalidades propuestas) siguen **CANDIDATE / NOT ACCEPTED / NOT IMPLEMENTED**. No codificarlos hasta aceptación explícita. La lectura acotada de archivos existentes antes de decode/parse también está pendiente; medir un Buffer después de leerlo entero no es un límite de memoria. Mantener este trabajo separado de M0-E.

## Restricciones de continuidad del propietario

- Meta actual: **crear Nexo; M0 es el objetivo técnico**, no volver a M1 ni convertir M0 en un chatbot.
- Arquitectura limpia y coherente; si se descubre que la estructura está mal, detenerse y resolver raíz, no acumular parches ocultos.
- El usuario delega la investigación y espera avance autónomo: no preguntar por cada microdecisión. Pero “continúa sin límites” **no** aprueba números, Constitución completa, root provisioning, commissioning ni efectos protegidos.
- No afirmar que código, tests, CI o archivos se modificaron salvo evidencia exacta.
- Guardar resultados en el repositorio y actualizar `NEXO_NCS/STATUS.md`; evitar un nuevo resumen redundante cuando una implementación/prueba real sea el siguiente avance.
- No reiniciar auditorías históricas cerradas AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 salvo evidencia nueva y específica.

## Estado al cerrar este handoff

Esta entrega es **documentación de continuidad**. No contiene cambios de runtime ni afirma que se haya añadido o ejecutado una prueba nueva. El próximo chat debe continuar desde M0-E con el estado canónico conservador arriba indicado, comprobar el HEAD actual antes de escribir y avanzar solo donde exista un enforcement real demostrable.


---

# CONTINUIDAD ADICIONAL — M0-E MISSION PREVIEW ADMISSION (2026-10-22)

## Punto de entrada del siguiente chat

El usuario escribirá exactamente **`NCS`**. Continuar desde `NEXO_NCS/STATUS.md` y este documento. No reiniciar Step 7, M1 ni auditorías históricas AB/P cerradas; no volver a investigar desde cero el límite de entrada de mission preview. La prioridad actual es M0-E, el contrato compartido de admisión.

## Estado canónico — no inferir avances

- M0: `INCOMPLETO`
- Autorización: `NOT_EVALUATED`
- Raíz/autoridad legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

El trabajo de preview no interpreta semánticamente `intent`, no autoriza, no despacha y no persiste. No significa commissioning ni aprobación constitucional.

## Trabajo realizado: admission control estructural compartido

Archivos relevantes en `ncs-clean-architecture`:

- `src/nexo/core/mission-admission-contract.mjs`: contrato de admisión estructural iterativo.
- `src/nexo/core/continuity-operations.mjs`: `missionRecord` aplica la admisión antes de la validación recursiva y la reconstrucción/clonado.
- `src/nexo/application/mission-request-preview.mjs`: aplica el contrato al envelope de solicitud y conserva códigos específicos de exceso de recursos.
- `scripts/nexo.mjs`: ambos comandos de preview conservan lectura limitada a 4 MiB + 1 byte antes de parsear.
- `tests/nexo/mission-request-preview.test.mjs`: pruebas de fronteras de admisión y protección de estado.
- Diseño detallado: [NCS_M0_E_MISSION_PREVIEW_ADMISSION_LIMITS_DESIGN_2026-10-22.md](NCS_M0_E_MISSION_PREVIEW_ADMISSION_LIMITS_DESIGN_2026-10-22.md).
- Evidencia del límite raw-byte: [NCS_M0_E_MISSION_PREVIEW_BYTE_BOUNDARY_TEST_EVIDENCE_2026-10-22.md](NCS_M0_E_MISSION_PREVIEW_BYTE_BOUNDARY_TEST_EVIDENCE_2026-10-22.md).
- Estado canónico: [STATUS.md](../STATUS.md).

### Límites v1 explícitos

| Dimensión | Máximo |
|---|---:|
| Archivo CLI de preview | 4 MiB = 4,194,304 bytes |
| Pasos por misión | 256 |
| Dependencias por paso | 64 |
| Nodos JSON visitados | 20,000 |
| Profundidad JSON | 32 |
| Cadena/clave individual UTF-8 | 256 KiB |
| Suma UTF-8 de cadenas y claves | 4 MiB |
| `intent` del request envelope | 16 KiB |

Estos valores son presupuestos de admisión v1 explícitos, no mediciones de heap ni garantías de capacidad de producción. Buffers, parseo, objetos, clones y snapshots pueden coexistir y multiplicar memoria. Validar con fixtures representativos antes de llamarlos capacidad de producto. Rechazar explícitamente; no truncar silenciosamente.

El límite histórico de ocho pasos de P112 pertenece al diseño heredado acotado. No trasladarlo automáticamente al contrato Core nuevo. La semántica de reclamaciones omitidas permanece abierta.

## CI verificado y alcance de la afirmación

- SHA de código/pruebas de admisión documentado en el diseño: `9f97f61a5517f0b591a677f91607a9ef05696c9e`.
- [Deterministic persistence tests — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828236600).
- [STEP 4 semantic validation — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909056).
- [STEP 5 outcome classification — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909080).
- HEAD documental verificado al checkpoint: `7ba84fdb0ef0d0330122a5a9d916205c06a132a7`; [deterministic persistence tests — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828330129).

La cobertura documentada incluye límites exactos y máximo+1 para pasos, dependencias, profundidad, nodos JSON, cadena individual y suma agregada; intent demasiado grande; ambos entrypoints CLI con 4 MiB y 4 MiB + 1 byte; y comprobaciones de ausencia de persistencia/dispatch y preservación de Continuity. Para afirmaciones posteriores, volver a comprobar la rama y el SHA exacto: no atribuir al HEAD documental pruebas ejecutadas en un SHA de código anterior.

## FAILURE separado pendiente — Option A

Workflow [Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827598938) terminó FAILURE en SHA `5485f7d9180918b5dc110dc4d9ed8ffc87569789`. El test `tests/nexo/assistants-runtime-cli.test.mjs` esperaba `effectJournal[0]` en una ruta repair, pero `scripts/nexo-runtime-session.mjs` devuelve explícitamente `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, sin dispatch ni persistencia. No habilitar el efecto excluido para hacer pasar CI. Resolver por separado si el test/workflow contradice el alcance de Option A y corregir la expectativa solo cuando la evidencia lo justifique. No reportar ese workflow como SUCCESS.

## Brechas todavía abiertas

1. **Heap agregado:** no existe medición o cota demostrada del heap por operación.
2. **Concurrencia multiproceso:** no hay presupuesto global aplicado entre procesos CLI.
3. **Disco agregado:** presupuesto agregado no definido/probado.
4. **Adecuación de límites v1:** comprobar fixtures reales válidos y evitar subir límites sin evidencia.
5. **Failure Option A:** reconciliar test/workflow con la decisión de alcance sin activar efectos.

No añadir locks, colas, semáforos ni wrappers globales improvisados. Antes de diseñar enforcement de recursos agregados, definir unidad de ejecución y alcance operativo real.

## Orden de continuidad

1. Leer `NEXO_NCS/STATUS.md`, el diseño de admission limits y este handoff; comprobar HEAD para detectar cambios posteriores, no para reiniciar la investigación.
2. Revisar fixtures existentes y añadir pruebas únicamente para casos válidos/límites que sigan sin cubrirse. No repetir pruebas de frontera que ya tienen CI verde.
3. Priorizar una sola brecha concreta: adecuación de los límites con fixtures representativos, o investigar el fallo Option A en una tarea separada.
4. Mantener explícita la distinción entre implementado, probado, documentado, pendiente y no evaluado. Si solo se editaron archivos vía API, no afirmar que hubo ejecución local.
5. Cada cambio de código debe tener CI verificado en SHA exacto; registrar run ID, resultado y cualquier workflow fallido.
6. Actualizar `STATUS.md` y el handoff al cerrar el checkpoint, sin repetir documentos innecesarios.

## Instrucciones para trabajar con el usuario

“Continúa sin límites” significa autonomía para avanzar técnicamente dentro de las restricciones del proyecto; no autoriza cambios constitucionales, commissioning ni activación de efectos protegidos. No pedir que el usuario repita el contexto ya recuperado. No inventar cifras ni ocultar fallos. Si aparece una brecha estructural, investigar causa raíz antes de añadir mecanismos.
