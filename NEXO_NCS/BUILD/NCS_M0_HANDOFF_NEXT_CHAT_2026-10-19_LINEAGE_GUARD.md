# NCS — handoff de continuidad para el siguiente chat (M0)

> **Checkpoint de continuidad más reciente (2026-10-19):** leer [NCS_M0_CONTINUITY_CHECKPOINT_2026-10-19_TERMINAL_OUTCOME_BOUNDARY.md](./NCS_M0_CONTINUITY_CHECKPOINT_2026-10-19_TERMINAL_OUTCOME_BOUNDARY.md). Los cinco workflows focales pasan en runtime SHA `85b47f11d82ffbdca70b3a5e327ae97b63ada6e8` y test SHA `e38556bc78487aae117b1c11085aca1731dfbb2e`. Además, la suite completa `npm test` pasó en SHA exacto `fd87dfdb2eccd6d356fd970cfa24544568b72833`, run [39338294317](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294317). Se corrigieron dos expectativas obsoletas en `tests/nexo/simulation-adapter.test.mjs` para preservar `blocked / EFFECT_OUTCOME_UNKNOWN`; no se relajó el runtime. Las actualizaciones de documentación posteriores no son nuevas pruebas del código. Verificar HEAD al iniciar el siguiente chat. El contrato de proyección de misión y su suite están validados; no reabrirlos sin evidencia nueva. La sección 9 de `NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md` ya define el protocolo mínimo de provisión/verificación de raíz única, sin seleccionar hardware. Próximo paso: identificar una fuente/procedimiento real e independiente para provisionar el fingerprint y verificar posesión; si no existe evidencia, mantener el bloqueo en lugar de simular una raíz. Mantener M0 INCOMPLETO, `authorization: NOT_EVALUATED`, efectos protegidos STOP y raíz legítima PENDING.

**Fecha:** 2026-10-19  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**HEAD histórico de una versión anterior de este handoff:** `7df24747188f9a93c8adb96b3e723e04ea65f9bc` (superado por las verificaciones posteriores de la sección de continuidad)  
**Misión obligatoria:** continuar M0. No reiniciar auditorías cerradas, no volver a M1 ni convertir esto en una nueva investigación de STEP 7.

## Instrucción inicial para el siguiente chat
1. Leer `NEXO_NCS/STATUS.md` como puerta de entrada y luego este handoff y el checkpoint citado abajo. Verificar el HEAD actual de la rama y el estado real de CI antes de hacer cambios.
2. Continuar desde el siguiente contrato verificable del runtime owner-backed M0. No repetir análisis ya cerrados de PREPARED ni volver a introducir parches defensivos sin demostrar una ruta real que los necesite.
3. Distinguir siempre SHA probado de SHA que solo contiene documentación. Para el cambio de resultado terminal, los SHA de código y pruebas `85b47f11d82ffbdca70b3a5e327ae97b63ada6e8` y `e38556bc78487aae117b1c11085aca1731dfbb2e` tienen cinco workflows SUCCESS cada uno; la sección 8 del checkpoint contiene los enlaces. Los HEAD documentales posteriores no son por sí solos SHAs de prueba.
4. `npm test` completo pasó en SHA exacto `fd87dfdb2eccd6d356fd970cfa24544568b72833` (run [39338294317](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294317)). No presentar ese PASS como prueba de autoridad legítima ni habilitar efectos protegidos. La decisión de alcance de raíz única está aceptada, pero su provisión/verificación no está implementada.

## Estado técnico de esta ronda

### Cambios de código publicados
- `src/nexo/core/owner-backed-runtime.mjs`: se exige confirmación PREPARED válida con `status: committed`, `preparedCommitted: true` y `storeRevision` entero seguro exactamente igual a la revisión anterior + 1.
- Nueva frontera detectada después del despacho: la respuesta de `recordExecutionLineage()` no debe usarse como base de reconciliación sin validar su revisión. Commit runtime: `3aa59cbfeadc7928a7592b7f0fe479b86206ccf7`.
- Ahora, después del efecto potencial, lineage debe confirmar `status: committed` y una revisión segura exactamente igual a `prepared.storeRevision + 1`. Si falta la revisión, se repite la revisión PREPARED o se salta una unidad, el runtime devuelve `UNKNOWN / NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED`, no llama a reconciliación, no registra resultado terminal y mantiene `redispatchAuthorized: false`.
- Pruebas añadidas en `tests/nexo/chronicle-runtime.test.mjs` para tres respuestas malformadas de lineage: revisión ausente, igual a PREPARED y con salto. Comprueban despacho inicial único, cero reconciliaciones, resultado UNKNOWN y sin redispatch.
- SHA que contiene el código + regresiones: `48114cd275b98cbbf3142bb242f90d0c5c543d0a`.

### CI verificado en SHA `48114cd275b98cbbf3142bb242f90d0c5c543d0a`
Todos los runs de abajo terminaron SUCCESS:
- M0 aceptación integrada: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842717
- Chronicle native vertical: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842965
- Bounded mission admission / restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842749
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842689
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842743

Los runs prueban los contratos cubiertos por esos workflows en ese SHA. No equivalen a una ejecución completa de `npm test`.

## Contrato y misión que siguen vigentes
- Estado constitucional: `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- M0: `INCOMPLETO`.
- Decisión de arquitectura en discusión/continuidad: una raíz criptográfica de propietario y un dispositivo inicial como canal, no autoridad independiente. La llave aún no está configurada ni probada como raíz legítima. No presentar la idea como implementada.
- La identidad/autoridad no debe depender de un teléfono concreto, un modelo de IA, reinstalación o dispositivo. Dispositivo/biometría son evidencia, no autoridad.
- `chronicle_append` es la única acción no-repair actualmente habilitada en este runtime porque es la que tiene un contrato integrado demostrado. Las acciones de reparación requieren contrato específico de settlement ligado a revisión del entorno; permanecen bloqueadas. No habilitar una acción por agregar un handler o mock.
- En resultados posteriores al posible efecto, incertidumbre significa `UNKNOWN`, sin redispatch automático. No convertir incertidumbre en fallo limpio o éxito supuesto.

## Próximos pasos recomendados
1. Verificar el estado de HEAD y CI en el nuevo chat.
2. Leer el checkpoint actual:  
   `NEXO_NCS/BUILD/NCS_M0_PREPARED_REVISION_FIX_CHECKPOINT_2026-10-19.md`
3. La auditoría acotada del recibo de resultado terminal y las cuatro regresiones de revisión ya están implementadas y pasan en los workflows indicados en el checkpoint. No repetirla salvo evidencia nueva concreta; elegir el siguiente contrato M0 a partir del código y sus garantías de persistencia.
4. La suite completa `npm test` ya pasó en CI sobre `fd87dfdb2eccd6d356fd970cfa24544568b72833`; no repetirla sin cambios nuevos de código. Si hay cambios nuevos, ejecutar el workflow existente y registrar el SHA exacto.
5. Corregir documentación obsoleta con una actualización pequeña y segura, si se puede, para que STATUS y checkpoint no contradigan la evidencia actual. No reemplazar el STATUS enorme ni intentar evadir controles de herramienta.
6. Después de probar el contrato real, continuar con la siguiente capacidad M0 que pueda tener observación, settlement y resultado terminal verificables a través de interrupción/reinicio.

## Reglas de continuidad
- No reabrir AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 ni las auditorías previas cerradas salvo evidencia nueva concreta.
- No repetir M1, instalaciones Android, ni volver a pedir al usuario datos que ya constan en el repo/contexto.
- No añadir colas, reintentos, tombstones, IDs, wrappers transaccionales ni otra infraestructura especulativa.
- Antes de cambiar código, identificar contrato, fallo concreto, test de regresión y prueba CI. Después, registrar SHA y logs.
- Si una operación de documentación falla, decirlo; no afirmar que quedó actualizada.

## Estado al cambiar de chat
**M0 sigue incompleto.** Los cambios de resultado terminal y sus regresiones pasan cinco workflows en cada SHA de código/pruebas, según el checkpoint actualizado. El HEAD documental debe verificarse de nuevo al iniciar el siguiente chat. Suite completa `npm test` PASS en `fd87dfdb...` (no es una ejecución del HEAD documental posterior). Autoridad del propietario `NOT_EVALUATED`; efectos protegidos `STOP`.


## Próximo contrato M0: provisión/verificación de raíz única

- Alcance decidido: una llave criptográfica raíz y un dispositivo inicial; pérdida irrecuperable de la única llave, multi-dispositivo y sucesión quedan fuera de la primera fase.
- No hay modelo físico/protocolo elegido ni llave adquirida/configurada. No inventar un procedimiento ni usar el teléfono, el store o un constructor como raíz autoautenticada.
- Reutilizar NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md y el gate actualizado; especificar cómo la provisión se establece fuera del estado que pretende autenticar, qué firma/prueba verifica Nexo y cómo el resultado llega al límite de dispatch sin convertir NOT_EVALUATED en ALLOW.
- Si el mecanismo independiente no se puede especificar con evidencia, dejar la implementación bloqueada y mantener STOP. No reiniciar STEP 7/M1 ni repetir investigación general de familias.


## Validación posterior de proyección de misión (2026-10-19)

- HEAD de código/pruebas validado: `f0fcf181778a61c8ad094b315289f5f43c1abe8f`.
- `npm test`: [39339904741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904741) SUCCESS; suite de admisión/restart [39339904645](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904645) SUCCESS; integración M0 [39339904658](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904658) SUCCESS; STEP 4 [39339904656](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904656) y STEP 5 [39339904735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904735) SUCCESS.
- La hipótesis de rechazar claims terminales al admitir misión fue revertida porque el test `continuity-migration.test.mjs:801` exige aceptar la claim para probar que la reconstrucción la bloquea sin outcome canónico. No repetir esa propuesta.
- M0 sigue INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING.


## Borrador de protocolo de raíz única añadido (2026-10-19)

- Documento: [contrato semántico de composición de autoridad](../NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md), sección 9.
- `npm test` pasó en SHA `174097b9b1afe8448a1761f5b5e3c2d8c5c620a2`, [run 39340297296](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340297296).
- No hay modelo físico, llave adquirida/configurada, fuente de provisión independiente ni verificador de runtime demostrados.
- Estado: M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING.


## Validación posterior del resultado terminal (2026-10-19)

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

- Documento de bloqueo: [NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md](BUILD/NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md).
- **Conclusión limitada a la evidencia actual:** no está demostrado un canal/procedimiento independiente para provisionar el fingerprint real de la única llave raíz. Esto no afirma que sea imposible; significa que no existe evidencia suficiente para implementarlo como si estuviera resuelto.
- No hay llave física seleccionada/adquirida/configurada ni pin real con procedencia independiente verificada. El teléfono, OS, modelo, cuenta/repositorio, snapshot y store de continuidad no se aceptan como raíz por defecto.
- No implementar verificador ni escoger hardware por inferencia. La puerta de salida exige fuente independiente disponible, procedimiento de pin reproducible, vector criptográfico, desafío fresco/replay tests, revocación vigente y enforcement en la frontera real.
- La suite completa `npm test` pasó en SHA `846f1ca5ff5b194ecd22e097f303964873184bce`, [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744). El HEAD documental posterior sólo añade documentación; la validación de software no demuestra autoridad del propietario.

**Estado:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. Siguiente paso: conseguir evidencia de una fuente independiente real o mantener este bloqueo explícito. No volver a M1/STEP 7.

---

