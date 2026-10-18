# NCS / M0 — Handoff de recuperación para el siguiente chat
Fecha: 2026-10-18
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
HEAD observado al preparar este handoff: `cb034a5099d84b03d118efd3121f936e7a9996e0`

## 0. Instrucción de entrada y misión

La palabra para iniciar un chat nuevo es exactamente **`NCS`**.

La misión real es **M0: construir una continuidad operativa propia de Nexo, independiente de Lúmina, y conectarla de forma segura al runtime real**. No reiniciar investigación, no volver a ejecutar auditorías cerradas, no desviar a M1 ni reabrir STEP 7 salvo dependencia demostrada.

Ruta de trabajo del repo: `STATUS → MASTER/CORE → BUILD → trabajo`. Leer primero `NEXO_NCS/STATUS.md` y este handoff; después inspeccionar solo el siguiente límite no resuelto. Los resúmenes previos ya contienen el historial extenso.

## 1. Estado real al detenerse

- **M0: INCOMPLETO.** Hay un owner/store canónico de continuidad, admisión PREPARED, lineage, settlement separado y una ruta limitada de reparación con pruebas de reinicio/crash.
- **No se ha completado el cutover del runtime genérico** en `src/nexo/runtime.js`. No afirmar que Nexo ya usa continuidad canónica en todas las ejecuciones.
- `scripts/nexo-runtime-session.mjs` y `scripts/nexo-repair-session.mjs` constituyen una ruta estrecha, opcional y repair-only; no son un dispatcher general de producción.
- **Efectos protegidos: STOP.** STEP 7 sigue OPEN / STOP / UNKNOWN. No confundir tests que inyectan autorización con autoridad legítima demostrada.
- **Nexo y Lúmina deben permanecer separados.** No guardar memoria operativa de Nexo dentro del estado de simulación de Lúmina; no reclamar atomicidad entre stores/archivos.
- `settled_observed` solo indica observación y liquidación según el contrato actual; no demuestra causalidad ni finalización de misión. No añadir `goalObservations` sin requisito arquitectónico explícito.

## 2. Último cambio probado y CI

### Excepción al confirmar PREPARED

Se encontró que `owner.recordPrepared()` podía persistir PREPARED y después lanzar una excepción antes de devolver confirmación. La llamada no debe asumir que el commit falló ni despachar con estado incierto.

- Prueba primero: [run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`, falla como se esperaba.
- Corrección: `scripts/nexo-repair-preparation.mjs` devuelve bloqueo estructurado, preserva el código, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`; `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y establece `dispatched: false`.
- Código + regresión validados: SHA `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.

### Excepción durante commit de settlement

La prueba añadió una excepción de `store.commitIfCurrent()` después de persistir entorno y lineage. El primer CI reprodujo el escape crudo: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d).

La ruta ahora captura la excepción en la frontera concreta de settlement y devuelve `blocked`, el código original, información de dispatch/lineage y una incertidumbre explícita. La implementación del settlement también trata el fallo del commit como resultado no confirmado; no supone si la escritura llegó a almacenamiento durable.

- Código + regresión del entrypoint: SHA `8d37f804901d410ad5e32c0bc842729d53c8593e`; [run 39160463984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160463984) SUCCESS.
- Corrección adicional del settlement y regresión: SHA `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`; [run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445) SUCCESS.
- En el HEAD observado, el código de `scripts/nexo-repair-entrypoint.mjs` contiene el manejo de excepción y la regresión está en `tests/nexo/repair-owner-lifecycle.test.mjs`.

### Otras fronteras ya cubiertas — no repetir auditorías

- Recarga del owner después de confirmar PREPARED: bloqueo estructurado, obligación conservada y cero dispatch. SHA `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`; [run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS.
- Fallo al persistir execution lineage después de dispatch: incertidumbre explícita; no se intenta settlement/redispatch en esa invocación. SHA `209dde321dbca3bc755e8ee89948ec94db2be2e6`; [run 39154037675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39154037675) SUCCESS.
- Owner rechaza PREPARED nuevo si la misión no está `planned`, el paso no está `planned` o las dependencias no están `completed`. Códigos: `NEXO_PREPARED_MISSION_NOT_RUNNABLE`, `NEXO_PREPARED_STEP_NOT_RUNNABLE`, `NEXO_PREPARED_DEPENDENCIES_UNMET`. SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`, cuatro suites verdes: STEP 4 [39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), STEP 5 [39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), repair crash cuts [39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), bounded admission/restart [39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611).
- Replay contradictorio de outcome bloqueado con `NEXO_OUTCOME_RESULT_MISMATCH`; SHA `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`, cuatro suites verdes documentadas en STATUS/master handoff.

## 3. Próximo trabajo exacto

**No empezar todavía reemplazando imports legacy.** Continuar desde las fronteras de error específicas de la ruta repair-only, con foco inmediato en:

1. Inspeccionar `scripts/nexo-repair-dispatch.mjs`, en particular la llamada a `adapter.execute()`. Confirmar qué pasa si el adapter lanza una excepción antes de `persistState()`; el resultado debe ser estructurado, PREPARED debe permanecer visible y no debe afirmarse si hubo efecto cuando no se sabe.
2. Inspeccionar límites de lectura/commit en `scripts/nexo-repair-settlement.mjs`: errores de lectura, conflicto de revisión CAS y excepciones de commit. Añadir solo una regresión por hueco demostrado; no añadir catch global que borre distinciones de persistencia.
3. Para cada hueco: prueba primero → confirmar que falla por la razón esperada → corregir el límite mínimo → correr el workflow `Nexo M0 — repair settlement crash cuts` y revisar el log real → registrar SHA exacto y resultado en `STATUS.md` y este handoff. No declarar CI verde sin run SUCCESS y SHA coincidente.
4. Después de cerrar los límites repair-only, volver a la meta central: diseñar el seam canónico del **runtime genérico** con selección de misión/paso canónica, admisión owner-backed, PREPARED durable con CAS antes del dispatch, lineage separado, reconciliación del estado persistido, settlement separado de outcome y pruebas de crash/replay/restart/proceso. El primer corte debe ser estrecho y explícito; no convertir el dispatcher de reparación en dispatcher genérico.
5. Solo declarar M0 completo cuando el runtime real use esa continuidad canónica y haya evidencia integrada end-to-end; los tests unitarios del owner y del repair bridge no bastan.

## 4. Guardas de arquitectura

- `src/nexo/runtime.js` usa todavía `src/assistants/memory.js` para outcomes/execution/plans y puede despachar el adapter antes de registrar memoria legacy; también conserva un journal en memoria. **No hacer sustitución mecánica de escrituras legacy por owner writes.**
- `scripts/assistants.mjs` persiste la misión canónica, pero el repair bridge es opt-in con `--nexo-repair-once`; el modo por defecto no es prueba de runtime genérico integrado.
- La ruta actual está acotada a reparaciones conocidas y a conciliación ambiental específica. No inferir que todas las acciones admiten reconciliación.
- Mantener separados: admisión, PREPARED, dispatch, lineage, observación/reconciliación, settlement y outcome.
- No inventar IDs/colas/retries/tombstones/wrappers transaccionales ni revisiones globales; no afirmar atomicidad cross-store.
- No reabrir AB/P cerrados ni repetir M1/STEP 7. Las referencias históricas y decisiones están en `NEXO_NCS/BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md` y `NEXO_NCS/BUILD/NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md`.

## 5. Frase inicial para el nuevo chat

`NCS`

Después: leer `NEXO_NCS/STATUS.md` y este archivo en la rama `ncs-clean-architecture`, verificar HEAD/CI actuales y continuar en el siguiente hueco demostrado de `scripts/nexo-repair-dispatch.mjs`/settlement. No repetir lo ya validado. La meta es M0, no cerrar el trabajo en una colección de parches repair-only.
