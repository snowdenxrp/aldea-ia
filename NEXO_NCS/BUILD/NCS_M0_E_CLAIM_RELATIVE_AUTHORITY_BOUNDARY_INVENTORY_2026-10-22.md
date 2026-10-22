# NCS M0-E — inventario claim-relative de autoridad y límite de efecto

Fecha: 2026-10-22  
Rama: `ncs-clean-architecture`  
Estado: **INVENTARIO DE EVIDENCIA EXISTENTE; NO IMPLEMENTACIÓN; NO APROBACIÓN CONSTITUCIONAL**

## Propósito y límite

Este inventario continúa la siguiente puerta ya definida en `NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`: relacionar cada claim/clase de efecto en alcance con el último límite de mutación, procedencia de raíz, Constitución/Policy, vigencia/revocación, dominios de fallo y evidencia realmente disponible.

No crea otro contrato genérico de raíz, no selecciona mecanismo físico, no añade identificadores/estados/abstracciones y no modifica runtime. Reutiliza los contratos existentes de Genesis y Constitución→Policy. No infiere aprobación constitucional completa ni permiso para efectos protegidos.

## Estado canónico

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Constitución: puntos 1–7 aceptados únicamente como base del borrador; no aprobada en su totalidad, no congelada y no commissioned.
- Opción A: alcance inicial provisional aceptado; no concede autoridad raíz ni convierte Chronicle en efecto constitucionalmente autorizado.

## Contratos existentes que gobiernan esta frontera

1. `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` (blob observado `e65df41ff98f7e53a8574ca5295a947023cb8b30`): la composición inicial requiere base de confianza reconocida independientemente; resultados `ESTABLISHED / UNKNOWN / INVALID`; una firma, hash, snapshot o salida del modelo no se autoeleva a raíz.
2. `STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md` (blob observado `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`): enlaza identidad exacta de Constitución y Policy, dominio, aplicabilidad, validez, dependencias y procedencia protegida; por sí solo no autoriza una acción concreta.
3. `NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`: indica explícitamente inventariar claims y efectos reales antes de implementar una fuente de autoridad o un trust registry.
4. `NCS_M0_E_OWNER_BACKED_RUNTIME_AUTHORITY_BOUNDARY_FINDING_2026-10-21.md`: evidencia las diferencias entre owner técnico de continuidad, puerto AuthorityGate y límite de mutación real. No demuestra un bypass activo de producción.

## Inventario claim-relative

| Clase / claim | Último límite de efecto conocido | Evidencia de raíz y Constitución/Policy | Vigencia, revocación, recuperación | Estado y decisión |
|---|---|---|---|---|
| Persistencia interna `chronicle_append` bajo la CLI Nexo de Opción A | `scripts/nexo-chronicle-session.mjs` → `runNexoChronicleAppend` → owner/adapter Chronicle; el adapter puede ejecutar el append después de PREPARED. El sink observado es escritura local de Chronicle, no un sink externo protegido demostrado. | No hay prueba de raíz legítima ni evaluación de Constitución/Policy en esta ruta. La API pública preserva `authorization: NOT_EVALUATED`; un append local no debe presentarse como autorizado constitucionalmente. | Persistencia/reconciliación tiene tests, pero eso no establece vigencia ni revocación constitucional. La política de presupuesto de recursos sigue propuesta, no implementada. | Puede evaluarse como capacidad interna no protegida dentro del alcance provisional y del CLI auditado. No usar su éxito como evidencia de autoridad; no ampliar el alcance a efectos externos. |
| Reparación de estado de agente/recurso (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) | La sesión de reparación bajo Opción A devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`; el protocolo de bajo nivel no equivale a autorización para usarlo. | No hay raíz/Constitución/Policy legítimas conectadas al sink. | No hay evaluación de autoridad vigente/revocación en el último límite; su ausencia mantiene la exclusión. | EXCLUIDO / STOP. Mantener bloqueo; no conectar ni habilitar. Evidencia de test limitada al gate y ruta comprobados. |
| Otras acciones no- `chronicle_append` por owner-backed runtime | `src/nexo/core/owner-backed-runtime.mjs` bloquea acciones distintas de `chronicle_append` antes de PREPARED/dispatch en esa ruta. | No hay raíz ni binding de Constitución/Policy aplicado al efecto. | No demostrado. | Bloqueadas en la ruta inspeccionada. No extrapolar a APIs/callers distintos. |
| Mutaciones de simulación en la ruta legacy de Lúmina | `src/nexo/runtime.js` / `src/nexo/simulation-adapter.js` conservan handlers que pueden mutar el objeto de simulación; `persistPreparedIntent` es opcional en el adapter inspeccionado. No se demuestra que `conditionalCommit` sea el sink de estas mutaciones. | No hay prueba de gate constitucional en la ruta legacy. No hay evidencia nueva de caller productivo que cambie el análisis previo. | No demostrado; una mutación simulada y una persistencia posterior no se han probado como operación atómica. | Fuera del alcance provisional de Opción A; no cablear ni habilitar. El cierre universal de todos los callers no está demostrado. |
| Transición genérica `executeProtectedTransition` | Tras gate inyectado y validación semántica, llama `ports.conditionalCommit.commit(candidate)`. El puerto `effectBoundary.prepare` existe pero la transición inspeccionada no lo invoca. No se ha demostrado que `conditionalCommit` sea el sink real de efectos externos. | `authorityGate.check` es un puerto inyectado. Los fixtures `AUTHORIZED` solo prueban el flujo posterior al fixture, no la procedencia de raíz ni la identidad exacta de Constitución/Policy/contexto. | No se demuestra evaluación fresca/revocación/fencing en el sink real. | No conectar a efectos protegidos. Brecha de integración M0-E continúa abierta. |

## Condiciones mínimas para cualquier futura clase protegida

Antes de admitir una clase de efecto concreta, la evidencia debe establecer todos los eslabones siguientes para el mismo claim y la misma operación; ningún resultado se infiere de una capa posterior:

1. **Composición de raíz:** base inicial establecida independientemente del store/estado que se valida; procedencia comprobable y dependencias/failure domains explícitos. Si falta, `UNKNOWN/STOP`.
2. **Autoridad actual:** estado actual derivado de esa base, con las reglas existentes para validez, revocación, sucesión/recuperación y conflictos. No introducir heurísticas por timestamp, orden de llegada o “última credencial”.
3. **Constitución exacta:** identidad/revisión/hash del borrador constitucional que realmente gobierna la decisión. La aceptación de un borrador como base no satisface esta condición.
4. **Policy vinculada:** identidad/hash, dominio de autoridad, aplicabilidad al claim, validez, dependencias y procedencia protegida según el contrato existente Constitución→Policy.
5. **Decisión de operación:** principal/autoridad, acción, recurso, contexto y alcance concretos; no basta una etiqueta global `AUTHORIZED`.
6. **Último límite real:** identificar el caller y sink que efectivamente muta/dispatcha; validar la decisión vigente inmediatamente antes de ese límite y demostrar que STOP/UNKNOWN produce cero invocaciones al sink.
7. **Resultado y reconciliación:** resultado del efecto se verifica aparte; éxito de persistencia o journal no prueba autorización previa.
8. **Evidencia reproducible:** pruebas adversariales para raíz ausente/falsa, binding Constitución/Policy incorrecto o cambiado, dependencia común, autoridad obsoleta/revocada, conflicto/rollback, reinicio y bypass por rutas fuera del entrypoint probado; CI vinculado al SHA exacto.

No se debe implementar un “constructor de contexto protegido” que simplemente copie datos del caller en un objeto con forma correcta. Tampoco agregar una raíz, trust registry, token, epoch, queue, retry, wrapper transaccional o nueva abstracción para cubrir la ausencia de una fuente independiente.

## Siguiente paso de ingeniería

El inventario revela que **no existe todavía una clase de efecto protegido para la que estén demostrados todos los eslabones**. Por tanto, no es seguro implementar un gate que devuelva `AUTHORIZED` como si la raíz existiera.

La continuación válida es preparar pruebas de integración adversariales contra los límites ya identificados y mantener cada ruta protegida cerrada. La implementación de un verificador de raíz solo puede comenzar cuando la base independiente de provisión/recognition y el binding constitucional exacto puedan verificarse sin autocertificación. En paralelo, la capacidad no protegida `chronicle_append` puede seguir mejorándose por su contrato de persistencia/recursos, sin presentarla como autorización constitucional.

## No afirmaciones

Este documento no afirma:
- que exista una raíz provisionada o verificada;
- que la Constitución esté ratificada, congelada, firmada o commissioned;
- que todas las rutas del repositorio o de despliegue estén aisladas;
- que exista un bypass de producción confirmado;
- que el presupuesto de recursos esté aceptado o implementado;
- que M0 esté completo o que efectos protegidos estén autorizados.
