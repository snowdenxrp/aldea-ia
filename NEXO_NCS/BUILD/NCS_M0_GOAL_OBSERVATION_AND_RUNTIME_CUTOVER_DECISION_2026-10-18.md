# NCS M0 — decisión de observación de objetivo y contrato mínimo de cutover

Fecha: 2026-10-18  
Rama: `ncs-clean-architecture`  
Código/pruebas base verificados: `57f3bffb52989a924bdbc5fb4fc626d803e6988f`  
Estado de la rama tras restaurar el test determinista: consultar HEAD y CI al retomar.

## Decisión

**No añadir por ahora una colección durable `goalObservations` al snapshot de continuidad.** El verificador existente es una observación de solo lectura del estado persistido actual; no declara completion ni causalidad. La reconstrucción canónica mantiene una misión con settlement `settled_observed` bloqueada bajo `verify_observed_repair_goal`, evitando que esa observación por sí sola vuelva a habilitar el dispatch.

Persistir una observación separada solo se justifica si un requisito explícito necesita conservar historial auditable de cuándo, con qué fuente y bajo qué contrato se observó el objetivo. En ese caso no basta añadir un campo: hay que diseñar versión/migración, validación de esquema, identidad de misión/paso, fuente y procedencia verificables, CAS/replay, retención y la distinción entre observación, atribución causal y completion. La anterior prueba de una ampliación de una sola línea ya mostró que romper el contrato de snapshot hace fallar el lifecycle; no repetirla.

## Garantía exacta del verificador actual

El verificador:
- Lee el snapshot canónico de continuidad y exige cobertura uno-a-uno entre los pasos de reparación admitidos y sus entradas de journal.
- Bloquea si queda cualquier obligación `prepared`.
- Exige `settled_observed` concordante con acción, objetivo y revisión ambiental de settlement.
- Comprueba las invariantes requeridas en un estado cargado estrictamente y comprueba que la revisión ambiental actual no sea anterior a la revisión registrada en settlement.
- Vuelve a leer continuidad antes del resultado positivo; si `storeRevision` cambió durante la verificación, devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`.
- Devuelve `goal_observed`, `missionCompleted: false`, `causalAttribution: not_claimed`; no escribe continuidad.

No garantiza una transacción atómica entre el archivo de continuidad y el archivo ambiental, no autentica la procedencia de datos externos y no garantiza que el objetivo siga presente después de la lectura final. El resultado describe una observación de punto en el tiempo, no una promesa futura.

## Contrato mínimo para un primer cutover de runtime

El cutover no es reemplazar imports de `src/assistants/memory.js` por imports del owner. La ruta genérica legacy puede ejecutar el adapter antes de persistir PREPARED durable y registrar después un outcome desde memoria en proceso. La primera integración no debe usarla como dispatcher general.

Una ruta candidata solo puede salir de `STOP` cuando satisface, en este orden:

1. **Selección canónica:** obtener misión y paso desde el owner persistido; nunca aceptar acción/objetivo como autoridad del llamador.
2. **Admisión:** comprobar identidad, estado `planned`, dependencias `completed` y compatibilidad con la clase de acción admitida.
3. **PREPARED durable:** escribir la obligación con identidad de operación y revisión base del entorno mediante CAS. Si el commit no está confirmado, no despachar.
4. **Dispatch acotado:** despachar exclusivamente el tipo de efecto aprobado por la ruta; no generalizar el bridge de tres reparaciones a efectos de Lúmina o protegidos.
5. **Lineage separado:** guardar resultado del adapter solo después del PREPARED concordante. El resultado del adapter no liquida el journal.
6. **Reconciliación independiente:** volver a cargar el estado persistido y comprobar la invariante de la operación. Si la evidencia es insuficiente, el entorno cambió de forma incompatible o queda ambigüedad, conservar el bloqueo; no redispatch.
7. **Settlement diferenciado:** la observación del estado deseado se registra como `settled_observed`, sin atribución causal y sin declarar la misión completa. Outcome y settlement son hechos diferentes.
8. **Replay y reinicio:** demostrar que un segundo proceso no vuelve a ejecutar la operación; probar los cortes después de PREPARED, después del efecto, después de lineage y antes del settlement.
9. **Aislamiento:** la continuidad de Nexo sigue en su store propio; el estado de Lúmina no vuelve a persistir `nexoMemory`. No afirmar atomicidad cross-store.

## Evidencia ya existente que se reutiliza

- `scripts/nexo-repair-entrypoint.mjs`, `scripts/nexo-repair-session.mjs` y `scripts/nexo-runtime-session.mjs` componen una ruta acotada para las tres acciones de reparación convergente.
- `tests/nexo/repair-owner-lifecycle.test.mjs`, `tests/nexo/repair-session.test.mjs`, `tests/nexo/repair-settlement-crash-cuts.test.mjs`, `tests/nexo/assistants-runtime-cli.test.mjs` y `tests/nexo/repair-mission-verification.test.mjs` son la base de regresión; no volver a recrear las mismas pruebas sin un hueco nuevo demostrado.
- La verificación del objetivo es de solo lectura y las pruebas cubren objetivo observado, pérdida de invariante, revisión ambiental anterior/replay, PREPARED pendiente, y cambio de continuidad durante la verificación.
- CI verde exacto de la regresión de cambio de continuidad: [repair M0 39146959705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959705), [STEP 4 39146959738](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959738), [STEP 5 39146959691](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959691). Una posterior prueba experimental de carrera ambiental no reprodujo de forma determinista el cambio en el orden esperado; se retiró esa prueba y el guard adicional asociado, en vez de aceptar un test rojo o afirmar cobertura inexistente.

## Siguiente trabajo

Las fronteras de recuperación identificadas después de la decisión original ya tienen regresiones y cambios independientes:
- Recarga de continuidad tras PREPARED: resultado bloqueado explícito; sin dispatch.
- Commit de execution lineage que lanza excepción: resultado bloqueado; se informa si el entorno quedó persistido; PREPARED permanece.
- Commit de settlement que lanza excepción: resultado bloqueado con incertidumbre de commit; se preservan los códigos concretos y no se afirma si la escritura llegó a disco.
- Admisión PREPARED valida estado del paso, dependencias y estado canónico de la misión.

Prueba exacta del último cambio de settlement:
- Test-first falló en el punto esperado: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d`.
- Código y regresión pasan: [run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445), SHA `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`.

### Siguiente tarea de arquitectura: seam del runtime genérico

1. No repetir la auditoría ya cerrada de que `scripts/assistants.mjs` persiste planes pero no invoca `executeNexoStep()` / `executeLuminaNexoStep()`; tampoco mover `nexoMemory` a estado de Lúmina.
2. Definir el primer punto de ejecución real desde una misión recuperada por el owner canónico. La misión y el paso deben volver a leerse desde continuidad; los argumentos del caller no autorizan acción ni objetivo.
3. Antes de ejecutar cualquier adapter genérico, la ruta debe validar el tipo de acción y preparar una obligación durable con revisión ambiental vinculada. Si la acción no pertenece al conjunto repair-only aprobado, debe seguir bloqueada.
4. No reutilizar `dispatchPreparedRepair()` como dispatcher genérico ni convertir `recordExecutionLineage()` en settlement. La primera integración debe conservar separado PREPARED, dispatch, lineage, observación del estado persistido y settlement.
5. Crear un test de proceso/reinicio para la nueva ruta y comprobar que un replay no vuelve a ejecutar el efecto. No afirmar cutover completo hasta que el caller real use la ruta canónica y se pruebe end-to-end.

## No cambiar de estado

- M0: **INCOMPLETO**.
- Runtime genérico legacy: **NO MIGRADO**.
- Efectos protegidos: **STOP**.
- Nexo/Lúmina: **separados**.
- `goal_observed` no equivale a `mission_completed`.
