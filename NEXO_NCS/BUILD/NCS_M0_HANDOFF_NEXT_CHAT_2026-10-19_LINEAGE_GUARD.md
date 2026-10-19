# NCS — handoff de continuidad para el siguiente chat (M0)

> **Checkpoint de continuidad más reciente (2026-10-19):** leer también [NCS_M0_CONTINUITY_CHECKPOINT_2026-10-19_TERMINAL_OUTCOME_BOUNDARY.md](./NCS_M0_CONTINUITY_CHECKPOINT_2026-10-19_TERMINAL_OUTCOME_BOUNDARY.md). El siguiente contrato acotado de recibo terminal ya tiene un cambio de runtime y cuatro regresiones publicados: runtime commit `85b47f11d82ffbdca70b3a5e327ae97b63ada6e8`, tests commit `e38556bc78487aae117b1c11085aca1731dfbb2e`. **La evidencia de CI de estos commits aún no está observada**; no declarar PASS. Verificar el HEAD real de la rama y el resultado de Actions antes de seguir. Mantener M0 INCOMPLETO, `authorization: NOT_EVALUATED`, efectos protegidos STOP y `npm test` completo pendiente.

**Fecha:** 2026-10-19  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**HEAD verificado al preparar este handoff:** `7df24747188f9a93c8adb96b3e723e04ea65f9bc`  
**Misión obligatoria:** continuar M0. No reiniciar auditorías cerradas, no volver a M1 ni convertir esto en una nueva investigación de STEP 7.

## Instrucción inicial para el siguiente chat
1. Leer `NEXO_NCS/STATUS.md` como puerta de entrada y luego este handoff y el checkpoint citado abajo. Verificar el HEAD actual de la rama y el estado real de CI antes de hacer cambios.
2. Continuar desde el siguiente contrato verificable del runtime owner-backed M0. No repetir análisis ya cerrados de PREPARED ni volver a introducir parches defensivos sin demostrar una ruta real que los necesite.
3. Distinguir siempre SHA probado de SHA que solo contiene documentación. El SHA con evidencia de CI de esta ronda es `48114cd275b98cbbf3142bb242f90d0c5c543d0a`; el HEAD posterior `7df24747188f9a93c8adb96b3e723e04ea65f9bc` incorpora documentación y debe tratarse como distinto.
4. No afirmar que `npm test` completo pasó. No afirmar que existe autoridad legítima ni habilitar efectos protegidos.

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
3. Completar una auditoría acotada de la frontera de reconciliación y resultado terminal: comprobar qué garantiza el contrato real de store/owner, qué respuestas malformadas son alcanzables y si existe algún falso `completed`/settled. No duplicar checks ya cubiertos sin un caso concreto.
4. Ejecutar la suite completa `npm test` mediante CI si existe workflow/forma soportada; registrar resultado exacto y SHA. Hasta entonces, suite completa pendiente.
5. Corregir documentación obsoleta con una actualización pequeña y segura, si se puede, para que STATUS y checkpoint no contradigan la evidencia actual. No reemplazar el STATUS enorme ni intentar evadir controles de herramienta.
6. Después de probar el contrato real, continuar con la siguiente capacidad M0 que pueda tener observación, settlement y resultado terminal verificables a través de interrupción/reinicio.

## Reglas de continuidad
- No reabrir AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 ni las auditorías previas cerradas salvo evidencia nueva concreta.
- No repetir M1, instalaciones Android, ni volver a pedir al usuario datos que ya constan en el repo/contexto.
- No añadir colas, reintentos, tombstones, IDs, wrappers transaccionales ni otra infraestructura especulativa.
- Antes de cambiar código, identificar contrato, fallo concreto, test de regresión y prueba CI. Después, registrar SHA y logs.
- Si una operación de documentación falla, decirlo; no afirmar que quedó actualizada.

## Estado al cambiar de chat
**M0 sigue incompleto.** Las regresiones focales y cinco workflows pasaron en SHA `48114cd...`; HEAD actual verificado al crear este handoff es `7df2474...`, un commit documental posterior. Suite completa `npm test` pendiente. Autoridad del propietario `NOT_EVALUATED`; efectos protegidos `STOP`.
