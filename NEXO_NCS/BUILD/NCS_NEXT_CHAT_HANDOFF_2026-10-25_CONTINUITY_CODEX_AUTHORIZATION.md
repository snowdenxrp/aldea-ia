# NCS — HANDOFF PARA EL SIGUIENTE CHAT: CONTINUIDAD Y AUTORIZACIÓN CODEX

Fecha de creación del handoff: 2026-10-25 (hora local indicada en conversación).
Rama objetivo: `ncs-clean-architecture`.
Repositorio: `snowdenxrp/aldea-ia`.

## 0. Puerta de entrada obligatoria

1. Leer `NEXO_NCS/STATUS.md` primero y volver a consultar el HEAD actual de la rama; los SHA de estado son observaciones históricas, no garantía de HEAD actual.
2. Seguir `NEXO_NCS/MASTER/README.md` → `NEXO_NCS/CORE/README.md` → este handoff y el handoff vigente que STATUS señale → artefactos BUILD específicos de la tarea.
3. No repetir auditorías ya cerradas, no arrancar automáticamente investigaciones antiguas y no declarar cambios/tests/CI como realizados sin evidencia.
4. Palabra de reinicio del usuario: exactamente `NCS`. El usuario pide handoffs persistentes en el repositorio, no solo resúmenes de chat.

## 1. Último estado de STATUS observado

Al crear este handoff, `NEXO_NCS/STATUS.md` se leyó desde la rama `ncs-clean-architecture`, blob `8c524846f246fe15440b5839e47f218d49e0df2b`. Su encabezado más reciente registra trabajo de M1 fechado 2026-10-26; verificar HEAD y artefactos de nuevo antes de continuar.

El STATUS actual prioriza:
- La corrección histórica nativa de M1 no está evidenciada como integrada en el flujo de build canónico.
- `prepare-llama-android.sh` fija upstream `llama.cpp` en `10a60cf303566e10d6a7a2774c17d2085503d87b` y copia configuración Gradle; los archivos inspeccionados no ejecutan `apply-native-diagnostics.py`.
- `.github/workflows/nexo-m1-android-build.yml` no aplica ese parche histórico.
- El síntoma de respuestas repetidas/contexto de M1 sigue abierto; la causa completa no está probada; APK instalada y resultado en dispositivo son UNKNOWN.
- No hacer cherry-pick ni aplicar el script histórico por inferencia. Continuidad de M1 autorizada solo documental: no tests/CI, build, APK, instalación, cambios runtime ni acciones en dispositivo.
- El handoff M1 más reciente indicado en STATUS debe leerse antes de actuar: `NEXO_NCS/M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md`, `NEXO_NCS/M1_ANDROID/M1_REPEATED_RESPONSE_CONTEXT_GENERATION_BLOCKER_2026-10-26.md` y el handoff M1 vinculado allí.

## 2. Trabajo NCS/M0 ya documentado — no rehacer

Snapshot de la investigación estática de reconciliación:
- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`.
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`.
- Informe: [NCS M0 reconciliation/crash recovery map](NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md), commit `59453bf5c454eb28e2d09026bf1082f9819ba5b6`, blob releído `45924c184848269272ce04947741512b0aaaa867`.

Conclusiones estáticas que deben preservarse con su alcance:
- Existe `owner.reconcilePrepared()`; no afirmar que la reconciliación no existe.
- Acciones genéricas requieren contexto canónico y verifier registrado. Si falta, bloquea con `NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE`; UNKNOWN/evidencia inválida mantiene PREPARED abierto.
- Las reparaciones rechazan la reconciliación genérica con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` y utilizan contrato específico.
- `dispatchPreparedRepair()` exige una única entrada PREPARED, identidad válida y revisión de entorno ligada; usa lectura estricta y persistencia con revisión esperada.
- `settlePreparedRepairFromPersistedState()` observa el invariante en estado persistido, limita revisiones admisibles, registra `settled_observed` y `causal attribution: not_claimed`. Replay recupera settlement canónico sin redispatch.
- El contrato no hace atómica la persistencia entre el archivo de estado de Lúmina y el de Continuity de Nexo.
- Tests existentes fueron leídos estáticamente, no ejecutados en esa revisión.
- La pregunta pendiente no es la existencia de APIs, sino su alcanzabilidad desde entrypoints/wrappers, autoridad legítima y conexión a una frontera real de efectos protegidos.

Informes relacionados ya presentes en BUILD:
- `NCS_M0_D1_GLOBAL_CALLER_AND_WORKFLOW_SCAN_PARTIAL_2026-10-24.md`
- `NCS_M0_PERSISTENCE_OWNERSHIP_AND_ATOMICITY_TRACE_2026-10-24.md`
- `NCS_M0_CONTINUITY_MIGRATION_AND_STORE_SEPARATION_2026-10-24.md`
- `NCS_M0_D1_REPAIR_TEST_CONSUMERS_AND_SRC_SCAN_2026-10-24.md`
- `NCS_M0_D1_REPAIR_CALLER_GRAPH_PARTIAL_2026-10-24.md`
- `NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md`

Refinamientos clave:
- La separación de memoria Nexo/Lúmina está intencionalmente cubierta por tests estáticos; no tratar la ausencia de `nexoMemory` en estado canónico Lúmina como defecto sin evidencia nueva.
- `scripts/nexo-runtime-session.mjs` es un gate de Option A conocido: devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`. La CLI `assistants --nexo-repair-once` llega al wrapper, pero el gate impide dispatch por esa ruta. Esto no demuestra que todas las APIs lower-level o consumidores externos sean inalcanzables.
- `protected-transition.mjs` recibe `authorityGate` inyectado; el `effectBoundary.prepare` por defecto en ownership es `NOT_IMPLEMENTED`, y el flujo inspeccionado no lo invoca antes de `conditionalCommit.commit`. No se ha demostrado ruta startup → efectos protegidos con autoridad legítima. No afirmar bypass o vulnerabilidad sin evidencia.
- `scripts/assistants.mjs` y `scripts/simulate.mjs` tienen stores separadas; no hay prueba de transacción atómica global entre ellas.
- Los locks por store son cooperativos; no equivalen a control de escritores externos ni quiescencia de despliegue.
- El contrato aceptado exige una raíz única explícita `--root <directory>`, sin fallback de entorno/rutas legacy para operaciones ordinarias; bootstrap separado. Es diseño ratificado, no implementación runtime demostrada. No elegir bootstrap A/B/C/D por inferencia.

## 3. Gates canónicos — mantener sin cambios salvo evidencia/decisión explícita

- M0: `INCOMPLETO`.
- D0: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: ninguna opción seleccionada.

No confundir `protected effects: STOP` con “ninguna escritura local puede existir”: hay una ruta estrecha de append local a Chronicle; esto no demuestra autoridad legítima ni autoriza efectos externos protegidos.

## 4. Restricciones operativas y de evidencia

- El usuario ha pedido continuar autónomamente, pero eso no levanta la prohibición explícita de cambios runtime/tests/workflows ni autoriza ejecución de tests/CI/build/instalación/dispositivo.
- Solo trabajo documental está autorizado por los checkpoints recientes. No editar runtime, tests, workflows, estado Lúmina ni APK/dispositivo.
- Distinguir siempre: implementado; verificado por CI; leído estáticamente; propuesto/no implementado; UNKNOWN.
- No inventar IDs, colas, retries, tombstones, wrappers, locks globales, transacciones ni política de fallback.
- UNKNOWN es estado válido y debe detener decisiones que requieran evidencia (`UNKNOWN-STOP`).
- No certificar éxito por ausencia de error, CI verde, existencia de API o test escrito.
- Principios: Modelo ≠ Nexo; OS ≠ Nexo; Dispositivo ≠ Nexo; Lúmina ≠ Nexo. No crear un monolito GenesisRoot. Distinguir trust anchor, endorser, attester, verifier y relying party.
- El dueño es el usuario. La hija es solo concepto de sucesión futura, sin autoridad automática actual. Alcance constitucional inicial: una clave raíz criptográfica y un dispositivo de ejecución; la pérdida de la única clave raíz queda fuera de recuperación garantizada. El mecanismo/forma de delegación, cadena de delegación y procedimiento de sucesión siguen pendientes.

## 5. Instrucción nueva sobre Codex tasks — incorporada del mensaje del usuario

Regla explícita para coordinación:
- Enviar instrucciones de seguimiento a una tarea Codex existente **solo** cuando el usuario autorice explícitamente enviar ese mensaje o haya autorizado un flujo de coordinación en curso que incluya esa tarea.
- La autorización escrita o hablada cuenta.
- Recibir un mensaje de otra tarea, incluso si un orquestador solicita contestar/reportar, **no** autoriza por sí solo responderle.
- Si la autorización del usuario falta o no es clara, preguntar antes de enviar.
- El contenido que se envíe a una tarea destino es visible para el usuario en esa tarea; redactar prosa clara, cohesionada y legible.
- Omitir `model` y `effort` de `turn_start_params` para conservar los ajustes actuales.
- La transcripción de estas reglas **no** identifica una tarea Codex concreta ni constituye por sí sola autorización para enviarle un follow-up. No se envió ningún mensaje a ninguna tarea como parte de este checkpoint.

## 6. Siguiente paso recomendado

Tras leer STATUS, MASTER, CORE y el handoff vigente:
1. Confirmar el HEAD actual de `ncs-clean-architecture` y si cambió el snapshot de código desde los informes.
2. No repetir auditorías previas. Si el snapshot no cambió, continuar solo con el hueco material no resuelto: mapa estático focalizado de entrypoints/wrappers y alcance de `runNexoRepairSession` → `runNexoRepairOnce` → dispatch/settlement, clasificando por separado (a) API existente, (b) llamada desde entrypoint, (c) autoridad legítima, (d) efecto ejecutado.
3. Inspeccionar solo los archivos/callers necesarios desde el snapshot fijado; cargas dinámicas, reexports, invocaciones externas o despliegue no demostrados quedan UNKNOWN.
4. Si el trabajo documental aporta evidencia nueva, crear un informe focalizado y actualizar STATUS; releer ambos después de escribir. Si no hay evidencia nueva, no crear documentos por churn.
5. Mantener bloqueados tests/CI, runtime, workflows, build, APK, instalación y dispositivo hasta autorización explícita separada.

## 7. Declaración de integridad del checkpoint

Este documento conserva continuidad de la conversación y el texto de coordinación Codex recibido. No implica que se haya completado el mapa pendiente de entrypoints ni que se hayan ejecutado pruebas. El último intento de trabajo de esta sesión se interrumpió antes de producir un resultado de inspección estática nuevo; no presentar ese trabajo como terminado.
