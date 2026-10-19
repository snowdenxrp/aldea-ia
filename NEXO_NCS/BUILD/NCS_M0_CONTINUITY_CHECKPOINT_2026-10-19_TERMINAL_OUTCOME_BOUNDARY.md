# NCS M0 — checkpoint de continuidad verificada y siguiente frontera (2026-10-19)

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama de trabajo:** `ncs-clean-architecture`  
**Palabra para abrir el siguiente chat:** `NCS`  
**Misión:** M0. No cambiar a M1 ni reiniciar STEP 7.

> Este checkpoint se escribió antes de disponer de la consulta directa del ref de rama. La verificación posterior confirmó el HEAD y la sección 9 registra la suite completa. Las comprobaciones de SHA y CI de esta sección reflejan el estado al redactarse originalmente y quedan supersedidas por las secciones posteriores cuando indiquen un estado más reciente.

## 1. Fuentes que se leyeron en la rama

- `NEXO_NCS/STATUS.md` — blob observado `f1dcffee3501f38b2c102826478fd6d34d5c9e0f`.
- `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19_LINEAGE_GUARD.md` — blob observado `955f0b174320d035492ca69aac1286a84d05c77c`.
- `NEXO_NCS/BUILD/NCS_M0_PREPARED_REVISION_FIX_CHECKPOINT_2026-10-19.md` — blob observado `a972f7bd67fe3311bcaf866414890b67c290fad6`.
- `src/nexo/core/owner-backed-runtime.mjs` — blob observado `13637c85e167f39302efcf05a36085968abc6d44`.
- `src/nexo/core/continuity-owner.mjs` — blob observado `07f3df47d33da08c38b1f6ebee9b782a68f85847`.
- `src/nexo/core/chronicle-settlement-contract.mjs` — blob observado `4d04930cbf67b5943916cc497dd44b14c87e27bd`.
- `src/nexo/core/continuity-store.mjs` — blob observado `3278a06abf34de5b4648b03d1c574237565326c9`.
- `tests/nexo/chronicle-runtime.test.mjs` — blob observado `a805db507849994ca7db3f44ecd5ba4d6ecd5344`.
- `package.json` — blob observado `4dc20952fdf027299c57b765a254ab389cd28e4e`.

Estos son SHA de blobs, no SHA de commit ni prueba de CI.

## 2. Evidencia CI conservada

Código + regresiones de lineage probados en SHA exacto:

`48114cd275b98cbbf3142bb242f90d0c5c543d0a`

Los cinco workflows fueron observados completados con éxito:

- M0 integrado: [39335842717](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842717)
- Chronicle vertical: [39335842965](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842965)
- Admisión / continuidad tras reinicio: [39335842749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842749)
- STEP 4: [39335842689](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842689)
- STEP 5: [39335842743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842743)

El handoff documental anterior es commit `10a03faea974160025f907302467277647ba2e8c`. La comparación GitHub confirmó que ese commit está 2 commits por delante de `48114cd...`, sin commits detrás; el diff incluye el handoff nuevo y una modificación del checkpoint. No etiquetar esos commits documentales como código probado. El ref exacto de la rama todavía debe verificarse de forma directa en el siguiente chat.

**Estado histórico al redactar esta sección:** la suite completa `npm test` aún no se había demostrado. La ejecución posterior está registrada en la sección 9: PASS en SHA exacto `fd87dfdb2eccd6d356fd970cfa24544568b72833`.

## 3. Estado que no puede cambiarse por inferencia

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- No se ha implementado ni probado la raíz criptográfica legítima del propietario.
- Una llave criptográfica y un dispositivo inicial son el alcance de primera fase decidido; modelo físico, protocolo y configuración siguen sin seleccionarse/validarse. La llave no autoriza automáticamente cada efecto.
- `chronicle_append` es la única acción no-repair con contrato integrado descrito; las acciones de reparación siguen bloqueadas.
- Ante incertidumbre posterior a un posible efecto: `UNKNOWN`, nunca redispatch automático.
- Nexo y Lúmina permanecen separados.
- No repetir auditorías cerradas ni instalar/reabrir M1 o STEP 7 sin evidencia nueva concreta.

## 4. Brechas estáticas que ya están registradas y no deben perderse

### PREPARED / procedencia
`STATUS.md` registra una matriz de respuestas PREPARED malformadas y un modelo de confianza del recibo. La forma del objeto no demuestra que su procedencia sea canónica. La arquitectura actual considera `executePrepared()` una API interna de composición dentro de una misma base de confianza; no se debe afirmar que es sandbox ni frontera de autorización. No resolver con booleanos, callbacks controlados por el mismo consumidor, otro journal o una envoltura transaccional.

### Ruta legacy
La inspección documentada no encontró un caller de producción actual de `executeLuminaNexoStep()`; existe una ruta legacy que puede mutar simulación si se invoca, pero no hay evidencia de que sea una ruta protegida de producción activa. No declarar bypass de producción observado ni migrar todas las acciones.

### Outcome terminal — nueva pista de auditoría acotada, aún no validada dinámicamente
En `src/nexo/core/owner-backed-runtime.mjs`, `recordChronicleTerminalOutcome()` acepta `outcome.status === "committed"` o `"already_recorded"` y luego devuelve `status: "completed"` / `terminalOutcomeRecorded: true`, sin validar en esa capa que la respuesta identifique una revisión segura coherente con `expectedRevision`.

El contrato del almacén real sugiere la distinción esperada:
- `committed`: revisión nueva exacta `expectedRevision + 1`;
- `already_recorded`: misma revisión `expectedRevision`, si el contrato idempotente realmente garantiza que ese outcome idéntico ya existe.

El runtime recibe el owner por inyección; las pruebas ya usan owners simulados. Por eso se debe comprobar si una respuesta de owner malformada (revisión ausente, igual, salto, negativa/no segura) puede producir falsamente un terminal `completed`. Esto es un **candidato de brecha de contrato**, no un fallo dinámico confirmado ni prueba de bypass de producción.

**Próximo paso técnico prioritario:** inspeccionar el contrato exacto de `recordOutcome`, sus resultados idempotentes y el replay tras pérdida de respuesta; añadir solo regresiones de respuestas alcanzables/contrato público. Si se confirma la brecha, ajustar el runtime para preservar UNKNOWN tras efecto potencial, con `terminalOutcomeRecorded: "UNKNOWN"`, `redispatchAuthorized: false`, y sin convertir un recibo ambiguo en completed. Mantener el caso real `already_recorded` válido. Ejecutar prueba focal y CI sobre el SHA exacto; no declarar PASS antes de ver el resultado.

## 5. Orden de continuidad obligatorio

1. Leer primero `NEXO_NCS/STATUS.md`, después este checkpoint y el handoff/checkpoint previos.
2. Verificar el SHA del HEAD real de `ncs-clean-architecture`, comparar con `48114cd...` y `10a03fa...`, e inspeccionar los runs de CI asociados al SHA actual. No inferir el HEAD a partir del nombre de rama ni de un commit documental.
3. Terminar la auditoría acotada del resultado terminal descrita arriba, sin reabrir el análisis general de PREPARED ya cerrado.
4. Identificar contrato, caso concreto, test de regresión y workflow que lo ejecutará antes de modificar código.
5. La prueba focal y los workflows correspondientes ya pasaron; `npm test` completo también pasó en SHA exacto `fd87dfdb...` (sección 9). Si se cambia código después de ese SHA, repetir la suite sobre el nuevo SHA antes de afirmar que sigue PASS.
6. Actualizar `STATUS.md` con una entrada breve al inicio solo si se puede conservar el archivo completo sin truncarlo; no reemplazar un STATUS de cientos de miles de caracteres con una extracción parcial. Mantener este checkpoint y actualizar el handoff para enlazarlo.
7. Mantener `authorization: NOT_EVALUATED`, efectos protegidos `STOP` y M0 `INCOMPLETO` hasta que haya evidencia independiente que justifique cambiar esos estados.

## 6. No hacer

- No volver a investigar AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 sin evidencia nueva concreta.
- No volver a M1 ni STEP 7.
- No inventar queues, retries, tombstones, IDs, transacciones, rollback ni una nueva infraestructura de persistencia.
- No afirmar que un mock prueba la raíz legítima del propietario.
- No equiparar settlement local, resultado terminal, autorización y efecto protegido.
- No declarar la suite completa aprobada sin ejecutar `npm test`.

**Regla final:** el repo es la fuente de continuidad. Cada cambio de código debe tener test focal, CI sobre SHA exacto y una entrada de evidencia. Si una operación de documentación falla, reportarlo claramente.


## 7. Implementación posterior a la auditoría estática — CI todavía pendiente

La pista de resultado terminal se convirtió en un cambio acotado y en regresiones. **No declarar todavía que la corrección pasó pruebas ni CI.**

- Runtime actualizado en commit [`85b47f11d82ffbdca70b3a5e327ae97b63ada6e8`](https://github.com/snowdenxrp/aldea-ia/commit/85b47f11d82ffbdca70b3a5e327ae97b63ada6e8), archivo `src/nexo/core/owner-backed-runtime.mjs`. El recibo de `recordOutcome` ahora exige revisión exacta: `committed` debe ser `expectedRevision + 1`; `already_recorded` debe permanecer en `expectedRevision`. Respuesta de revisión ausente, repetida, saltada, inválida o no segura debe quedar UNKNOWN y no terminal-completed.
- Regresiones añadidas en commit [`e38556bc78487aae117b1c11085aca1731dfbb2e`](https://github.com/snowdenxrp/aldea-ia/commit/e38556bc78487aae117b1c11085aca1731dfbb2e), archivo `tests/nexo/chronicle-runtime.test.mjs`. Cubren revisión ausente, revisión que no avanza, salto de revisión y `already_recorded` con revisión incorrectamente avanzada. Verifican UNKNOWN, `terminalOutcomeRecorded: "UNKNOWN"`, `journalSettled: true`, sin redispatch, y que no se persista un intento terminal falso.
- Blob runtime tras el cambio: `e5b956ea5394387708535106c2dcee8de70bf2fe`.
- Blob test tras el cambio: `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`.
- Estado histórico al escribir esta sección: el wrapper inicial no devolvió runs y el entorno local no pudo resolver `github.com`. La consulta directa posterior sí recuperó Actions y confirmó los cinco workflows por SHA; véase sección 8. La suite completa fue ejecutada después en CI y pasó; véase sección 9.
- Próxima acción obligatoria: revisar que los workflows hayan arrancado sobre el SHA que incluye ambos commits, leer logs de la prueba focal, corregir cualquier fallo real y volver a verificar. Si el conector no expone runs push, obtener evidencia desde la interfaz pública de Actions o el método soportado del repo; no convertir una lista vacía en PASS.
- SHA de código y pruebas esperado en esta secuencia: el commit de pruebas `e38556bc78487aae117b1c11085aca1731dfbb2e` ya incluye el cambio de runtime como antecesor, pero el HEAD directo de la rama debe verificarse explícitamente antes de declarar que es el actual.

El estado constitucional no cambia: M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP. La suite completa `npm test` está PASS en el SHA registrado en la sección 9.


## 8. Evidencia posterior: CI del recibo terminal confirmado (2026-10-19)

La consulta directa a GitHub Actions corrigió el estado PENDING anterior. Los dos commits de código/prueba tienen cinco workflows cada uno, todos `completed / success`.

**Runtime commit** `85b47f11d82ffbdca70b3a5e327ae97b63ada6e8`:
- [STEP 4 semantic validation — 39337360652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337360652) — SUCCESS.
- [Chronicle native vertical — 39337360673](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337360673) — SUCCESS.
- [M0 integrated acceptance — 39337360680](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337360680) — SUCCESS.
- [Repair settlement crash cuts — 39337360720](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337360720) — SUCCESS.
- [STEP 5 outcome classification — 39337360679](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337360679) — SUCCESS.

**Test commit** `e38556bc78487aae117b1c11085aca1731dfbb2e`:
- [STEP 5 outcome classification — 39337387545](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387545) — SUCCESS.
- [Chronicle native vertical — 39337387569](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387569) — SUCCESS.
- [Bounded mission admission / restart continuity — 39337387520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387520) — SUCCESS. Job steps explicitly include `node tests/nexo/chronicle-runtime.test.mjs`; this is the direct execution evidence for the four new terminal-outcome regression cases at the test commit.
- [STEP 4 semantic validation — 39337387598](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387598) — SUCCESS.
- [M0 integrated acceptance — 39337387526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387526) — SUCCESS.

**Branch tip verified directly:** `ncs-clean-architecture` points to `e8be8f664a7ad7982686010439282d3f3474850d`. GitHub compare reports the branch is 3 commits ahead of `e38556bc...`, 0 behind; the compare diff lists only this checkpoint and the handoff as changed files. Thus the terminal-outcome code and tests are ancestors of the verified branch tip; the three later commits are documentation-only in that comparison.

**Historical scope note:** the targeted workflows passed on the exact runtime and test SHAs, including `chronicle-runtime.test.mjs` on the test SHA. At the time this paragraph was first written, full-suite evidence was unavailable; section 9 supersedes that earlier PENDING state with a verified full `npm test` PASS.

Current constitutional state remains unchanged: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; protected effects `STOP`; legitimate owner root PENDING.


## 9. Suite completa aprobada y test de contrato corregido (2026-10-19)

- **PASS de `npm test` completo:** [GitHub Actions run 39338294317](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294317), SHA exacto `fd87dfdb2eccd6d356fd970cfa24544568b72833`. El workflow ejecutó el comando literal `npm test`; el paso `Run tests` terminó SUCCESS.
- La primera ejecución [39338128405](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338128405) falló en `tests/nexo/simulation-adapter.test.mjs:126`: la prueba esperaba `failed`, pero el contrato genérico devolvió `blocked`. La segunda [39338238697](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338238697) detectó otra expectativa antigua del mismo tipo en la rama de acción no permitida.
- Inspección del contrato en `src/nexo/effect-adapter.js`: después de invocar un handler, cualquier resultado distinto de `completed` se normaliza a `blocked` y `EFFECT_OUTCOME_UNKNOWN` (o `PARTIAL_EFFECT_DETECTED` si la revisión local cambia). La razón explícita es que una respuesta `failed` del handler no demuestra por sí sola que no ocurrió un efecto parcial/externo; sin un verificador específico, el adaptador mantiene la operación sin resolver.
- Se corrigieron solo las expectativas de `tests/nexo/simulation-adapter.test.mjs` para la acción no permitida y la acción `drink` fallida: ambas esperan ahora `blocked / EFFECT_OUTCOME_UNKNOWN` y `uncertainty: effect_may_or_may_not_have_occurred`. No se cambió el comportamiento del runtime para satisfacer una prueba obsoleta.
- Test de expectativa corregida: commit `40c3571c449e0c64b6dc2740d09ed0d09e9d953c`; segunda corrección: `fd87dfdb2eccd6d356fd970cfa24544568b72833`. El run de suite completa sobre el segundo SHA terminó SUCCESS.
- Se habilitó el workflow existente `.github/workflows/nexo-deterministic-tests.yml` para pushes a `ncs-clean-architecture` además de `main`, commit `69829e9db06f9edab8776f61916db9e34b1133e5`; esto evita depender de la red local para obtener evidencia del conjunto completo.
- El SHA `fd87dfdb...` es el SHA de código/pruebas que aprobó `npm test`; los commits de documentación posteriores no son nuevas ejecuciones del test completo.

**Estado global no promovido:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima del propietario PENDING. Suite completa PASS no equivale a prueba de autoridad ni a permiso para efectos protegidos.


## 10. Siguiente bloque arquitectónico M0 tras el PASS completo

El contrato de resultado terminal y el npm test completo ya están validados en los SHAs indicados en las secciones 8–9. No reabrir ese trabajo sin cambio nuevo de código.

La continuidad existente ya contiene la decisión NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md: **una llave criptográfica raíz y un dispositivo inicial** para la primera fase. La nota posterior de alcance supera la indecisión anterior sobre el número de raíces, pero no selecciona un modelo físico/protocolo ni demuestra provisión independiente o verificación de autoridad. Se reconciliaron las notas de gate y contrato semántico para que no parezca que la cantidad de raíces sigue abierta.

**Siguiente tarea acotada:** convertir la decisión existente en un contrato de provisión y verificación implementable, reutilizando NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md; especificar fuente de verdad externa al estado que se valida, qué afirmación prueba la llave, cómo se valida el desafío/firmado y qué queda fuera del permiso. No seleccionar hardware por intuición ni crear un root ficticio. Si la provisión independiente no se puede demostrar con la configuración actual, registrar el bloqueo y no conectar la verificación a dispatch.

El estado constitucional sigue: M0 INCOMPLETO; authorization: NOT_EVALUATED; efectos protegidos STOP; raíz implementada/probada PENDING.


## 11. M0 — cierre de validación de proyección de misión y reversión de guard no válido (2026-10-19)

**SHA de código/pruebas verificado:** `f0fcf181778a61c8ad094b315289f5f43c1abe8f`.

- Suite completa `npm test`: [run 39339904741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904741), SUCCESS.
- Bounded mission admission/restart continuity: [run 39339904645](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904645), SUCCESS; incluye `continuity-contract.test.mjs` y `continuity-migration.test.mjs`.
- Integrated acceptance: [run 39339904658](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904658), SUCCESS. STEP 4 [39339904656](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904656) y STEP 5 [39339904735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904735), SUCCESS.
- Se ensayó la regla de exigir que toda nueva misión y todos sus pasos empezaran como `planned`. Falló el workflow bounded en [run 39339816995](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339816995), `continuity-migration.test.mjs:801`, porque una prueba existente admite intencionalmente una claim de paso `completed` sin outcome canónico para verificar que la reconstrucción la bloquea. La regla se revirtió; no se debilitó el test de protección. Los cambios temporales se eliminaron y la suite volvió a SUCCESS en el SHA indicado.
- Conclusión: **admisión del plan ≠ verificación de resultado**. No rechazar de forma global claims terminales en los datos heredados/plan; no tratarlas como verdad. La reconstrucción debe resolverlas con outcome canónico y bloquear si falta evidencia. `statusDiscrepancy` de la consulta pública indica diferencia literal entre status guardado y derivado; por sí sola no es diagnóstico de corrupción.
- La ejecución fallida anterior de mission-status [39323179028](https://github.com/snowdenxrp/aldea-ia/actions/runs/39323179028) corresponde a SHA antiguo `b97b72d...`. La suite completa e integrada del HEAD actual ejecutó la regresión CLI y pasó.
- **Próximo paso:** continuar al siguiente contrato M0 de continuidad solo después de identificar ruta real, invariantes y prueba. No reabrir esta consulta ni el arreglo de resultado terminal sin evidencia nueva.

**No cambia:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima PENDING.


## 12. Contrato mínimo de bootstrap para llave raíz única (borrador, 2026-10-19)

Se añadió la sección 9 a [NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md](./NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md), con la forma mínima del protocolo sin elegir hardware ni simular una raíz:

- La clave pública/fingerprint debe provisionarse mediante una fuente independiente del store de continuidad; si no se demuestra esa independencia, composición = UNKNOWN.
- La prueba de posesión usa desafío fresco y firma separada por dominio; sólo demuestra control de la clave correspondiente al pin provisionado.
- La prueba de bootstrap no equivale a autoridad vigente, autorización de una acción ni enforcement en el límite final.
- Mientras no exista fuente implementada de provisión/pin, verificación de vigencia/revocación y enforcement antes del efecto, `authorization: NOT_EVALUATED` y `STOP` permanecen obligatorios.
- No hay llave física elegida/adquirida/configurada. El texto es contrato de diseño, no implementación ni evidencia de runtime.

El borrador quedó en el HEAD de documentación `174097b9b1afe8448a1761f5b5e3c2d8c5c620a2`; `npm test` terminó SUCCESS en [run 39340297296](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340297296), SHA exacto. La siguiente pregunta no es repetir comparación general de familias: es determinar qué fuente/procedimiento real de provisión independiente está disponible y si permite cumplir este contrato. Si no hay evidencia, registrar bloqueo y no implementar un verificador ficticio.


## 13. Validación actualizada del recibo terminal en el HEAD de rama

## M0 — validación actualizada del recibo de resultado terminal (2026-10-19)

- **HEAD de la rama verificado directamente antes de esta actualización documental:** `846f1ca5ff5b194ecd22e097f303964873184bce`. La comparación GitHub de `846f1ca5...` contra `ncs-clean-architecture` devolvió `identical`, cero commits de diferencia.
- **Suite completa `npm test`: SUCCESS** en ese SHA exacto: [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744), job `tests`, pasos `Install` y `Run tests` SUCCESS.
- La suite incluye los cuatro casos añadidos en `e38556bc78487aae117b1c11085aca1731dfbb2e` para recibos terminales malformados: `committed` sin revisión, revisión sin avanzar, salto de revisión y `already_recorded` con revisión avanzada incorrectamente. El test exige `UNKNOWN`, journal asentado, cero outcome terminal falso y cero redispatch.
- El contrato del runtime en `src/nexo/core/owner-backed-runtime.mjs` valida que `committed` sea exactamente `expectedRevision + 1` y que `already_recorded` conserve exactamente `expectedRevision`. La revisión ausente, insegura o incoherente no puede convertirse en `completed`.
- El SHA `846f1ca5...` está 34 commits por delante del test SHA `e38556bc...`; la comparación no muestra cambios de código runtime entre ellos. Las diferencias de ese tramo incluyen documentación y expectativas de tests del adaptador de simulación. El PASS completo del HEAD exacto es la evidencia principal; el run `39337387520` es evidencia focal adicional porque ejecutó explícitamente `node tests/nexo/chronicle-runtime.test.mjs`.
- **Alcance de la evidencia:** esto verifica contratos de settlement y regresiones, no autoridad constitucional del propietario ni autorización para efectos protegidos.

**Estado invariable:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima PENDING.

**Siguiente paso M0:** continuar desde la frontera real de provisión independiente de la llave raíz, sin elegir hardware ni implementar un verificador hasta que exista un procedimiento independiente demostrable. Si no existe, registrar el bloqueo concreto. No volver a M1/STEP 7 ni repetir auditorías cerradas.

---


## Bloqueo de provisión raíz — siguiente frontera M0

## M0 — bloqueo explícito de provisión independiente de la raíz (2026-10-19)

- Documento de bloqueo: [NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md](./NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md).
- **Conclusión limitada a la evidencia actual:** no está demostrado un canal/procedimiento independiente para provisionar el fingerprint real de la única llave raíz. Esto no afirma que sea imposible; significa que no existe evidencia suficiente para implementarlo como si estuviera resuelto.
- No hay llave física seleccionada/adquirida/configurada ni pin real con procedencia independiente verificada. El teléfono, OS, modelo, cuenta/repositorio, snapshot y store de continuidad no se aceptan como raíz por defecto.
- No implementar verificador ni escoger hardware por inferencia. La puerta de salida exige fuente independiente disponible, procedimiento de pin reproducible, vector criptográfico, desafío fresco/replay tests, revocación vigente y enforcement en la frontera real.
- La suite completa `npm test` pasó en SHA `846f1ca5ff5b194ecd22e097f303964873184bce`, [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744). El HEAD documental posterior sólo añade documentación; la validación de software no demuestra autoridad del propietario.

**Estado:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. Siguiente paso: conseguir evidencia de una fuente independiente real o mantener este bloqueo explícito. No volver a M1/STEP 7.

---


## M0 — decisión de alcance PREPARED receipt (2026-10-19)

- Decisión registrada: [NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md](../DECISIONS/NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md).
- El adaptador genérico y su `executePrepared()` son interfaces internas de la misma base de confianza; no son una sandbox contra JavaScript arbitrario en el mismo proceso. Bloquear sólo un recibo fabricado no arreglaría ese modelo: el consumidor con acceso al adaptador también puede registrar handlers o llamar a `execute()`.
- Se cierra la ambigüedad documental como decisión de alcance, no como PASS de seguridad ni como cambio de runtime. La composición owner-backed mantiene sus regresiones de PREPARED/settlement/no-redispatch. No se añade segundo journal, booleano de autenticidad ni callback auto-verificador.
- No hay evidencia de un caller de producción actual para el runtime legacy de Lúmina; no describirlo como ruta protegida activa.
- **Sin cambio constitucional:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`. La provisión independiente de la raíz sigue siendo un bloqueo separado.

---


## Addendum — candidato técnico identificado, sin disponibilidad ni prueba (2026-10-19)

La revisión de fuentes oficiales identifica una ruta candidata concreta: **llave física con PIV/NFC usando YubiKit para Android**, con YubiKey 5 NFC como ejemplo compatible según documentación de Yubico. Esto reduce la incertidumbre técnica, pero **no cierra el bloqueo**: no hay evidencia de adquisición, integración en Nexo ni prueba en el POCO X7 Pro. Tampoco existe aún un fingerprint provisionado independientemente del store de continuidad.

Evaluación y fuentes: [NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md](./NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md).

No seleccionar automáticamente el hardware, no instalar dependencias ni generar código de integración antes de confirmar disponibilidad y compatibilidad real. Android Keystore/StrongBox tampoco se presume disponible: requiere verificar attestation/nivel de seguridad en el dispositivo concreto. M0 sigue INCOMPLETO, autoridad NOT_EVALUATED y efectos protegidos STOP.

