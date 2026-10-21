# NCS M0-E — Matriz inicial de operaciones, efectos y enforcement (Opción A)

Fecha: 2026-10-21
Estado: análisis documental basado en código inspeccionado; no equivale a certificación exhaustiva.

## Regla de clasificación

La clasificación depende del efecto final observable, no del nombre de una acción, de su etiqueta “local” ni de que una prueba use un adapter simulado. Cualquier operación cuyo efecto real no pueda clasificarse queda fuera del alcance y debe terminar en UNKNOWN/STOP.

## Matriz

| Operación / entry point | Efecto observado o esperado | Frontera/enforcement actual | Decisión bajo A |
|---|---|---|---|
| scripts/nexo.mjs status --continuity | Lee estado de Continuity y emite estado | Parser limita el comando; loader de estado. No debe mutar store | Permitido como lectura, sujeto a prueba de no escritura y ruta confiable |
| scripts/nexo.mjs mission-status --continuity --mission | Reconstruye/lee estado de misión | Loader/reconstructor; confirmar que no escribe | Permitido si se verifica no mutación; ante side effect, STOP |
| scripts/nexo.mjs chronicle-append → scripts/nexo-chronicle-session.mjs → runNexoChronicleAppend | Inicializa opcionalmente stores, admite misión, registra PREPARED/lineage/outcome y añade entrada Chronicle | authorization: NOT_EVALUATED; el append alcanza persistencia local. Inicialización explícita; las rutas se reciben del caller | No clasificar como “lectura”. Permitido solo como persistencia interna explícitamente acotada y después de revisar ruta/archivo; no constituye autorización ni ancla de autoridad |
| executeNexoStepWithContinuityOwner con chronicle_append | Adapter de Chronicle detrás de Continuity owner; persistencia de intención y resultado | Requiere owner/adapter y contratos de reconciliación; aún no hay evaluator constitucional | No usar para efectos protegidos. Mantener autorización no evaluada |
| executeNexoStepWithContinuityOwner con repair actions | Puede mutar estado de agente/necesidades/recursos | El runtime owner-backed bloquea repair_agent_state, repair_agent_needs, repair_resource_state con NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED y dispatchAttempted:false | Excluido; probar que bloqueo ocurre antes de cualquier handler |
| executeNexoStepWithContinuityOwner con cualquier acción no-chronicle_append | Posible dispatch a adapter de acción | Runtime owner-backed bloquea con NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED antes de PREPARED/dispatch | Excluido; conservar gate y prueba negativa |
| executeProtectedTransition | Construye claim, consulta authority gate, aísla snapshot y prepara/commitea candidato | AUTHORIZED de fixture no demuestra root legítima; effectBoundary.prepare no se observó invocado; conditionalCommit.commit no está demostrado como sink externo | No declarar frontera de efectos protegidos completa; mantener STOP |
| executeLuminaNexoStep / createLuminaEffectAdapter | Mutaciones directas en objeto simulation (agentes/world); puede cambiar recursos/estado | La evidencia histórica AB104/P112 indica que no se encontró caller productivo que conecte esta ruta a un owner canónico con callback durable. No se infiere inalcanzabilidad total | Excluido bajo A; no cablear ni reabrir auditorías históricas sin evidencia nueva |
| Handlers de createEffectAdapter / adaptadores de simulación | Ejecutan handlers registrados; pueden mutar estado local o simulado | Registro de handlers/verificadores se inyecta por bootstrap; journal en memoria no es por sí mismo persistencia durable | Excluido salvo operación que se demuestre estrictamente dentro del alcance A y con frontera compartida |
| Cualquier ruta a red, archivo externo, reparación, world-state o mutación de terceros | Efecto externo/protegido o frontera no clasificada | No hay evidencia de una autoridad legítima conectada y aplicada en todos los sinks | STOP |

## Criterios de aceptación mínimos para opción A

1. **Lectura:** comprobar que status/mission-status no crean, inicializan ni modifican stores. Prueba basada en snapshot/hash/mtime o store instrumentado; no basta con resultado loaded.
2. **Persistencia interna:** identificar rutas absolutas efectivas, política de symlink/path, propiedad/permisos del directorio y semántica de crash/recovery. Mientras eso no esté especificado, la ruta de almacenamiento debe considerarse configuración confiable, no límite de seguridad.
3. **Exclusiones:** tests negativos prueban dispatchAttempted:false y cero llamadas al handler/sink real para repair, acciones no permitidas, falta de autoridad, autoridad UNKNOWN/STOP, Policy/contexto inválidos y rutas alternativas.
4. **No inferencia:** el resultado de Chronicle puede ser completed como escritura, pero authorization permanece NOT_EVALUATED.
5. **Sink real:** no usar conditionalCommit.commit, un adapter de test o un objeto simulado como sinónimo de sink externo sin inspección de implementación y caller.
6. **Evidencia:** asociar cada prueba a SHA, run, job, resultado y artifact/log cuando exista. Sin cadena completa, estado PENDING/UNKNOWN.

## Gaps que esta matriz no cierra

- Raíz legítima independiente, procedencia y vinculación a la Constitución exacta.
- Estado canónico actual, revocación, rollback y conflictos.
- Evaluación runtime de autoridad/Policy/contexto conectada a los sinks reales.
- Exhaustividad de todos los entry points de producción y ausencia de bypasses.
- Durabilidad y seguridad de filesystem fuera de los límites ya documentados.

## Próxima acción técnica

Añadir o ajustar pruebas negativas solo para las entradas permitidas y excluidas que esta matriz identifica, sin cambiar runtime por ahora. La primera prueba de valor es confirmar que los comandos de lectura no escriben. Después, inspeccionar las pruebas ya existentes del owner-backed runtime para verificar el bloqueo previo a dispatch y reutilizarlas. No duplicar AB104/P112 ni convertir ausencia de caller encontrado en prueba de inalcanzabilidad.

## Estado

M0 INCOMPLETO; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP. La opción A es alcance inicial provisional, no commissioning ni autorización de efectos protegidos.
