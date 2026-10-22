# NCS — HANDOFF DE ARRANQUE DEL SIGUIENTE CHAT
Fecha: 2026-10-22
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Propósito: retomar desde el checkpoint vigente sin volver a investigaciones históricas.

## INSTRUCCIÓN DE ARRANQUE — LEER ANTES DE ACTUAR

El usuario abrirá el chat nuevo escribiendo exactamente: `NCS`.

**No empezar investigando auditorías antiguas ni repitiendo antecedentes.** Primero:
1. Abrir `NEXO_NCS/STATUS.md`; es la puerta canónica.
2. Leer este handoff completo.
3. Verificar el HEAD actual de `ncs-clean-architecture` y los SHA de los archivos que se vayan a editar. Los SHA de este documento son referencias de checkpoint, no sustituyen la comprobación actual.
4. Continuar con la sección **Siguiente tarea concreta** de este documento.
5. Investigar documentos históricos solo si la tarea actual revela una contradicción concreta que no pueda resolverse con STATUS, este handoff y el código/tests relevantes.

No reiniciar M0.15–M0.44, Step 7, M1 ni auditorías AB/P cerradas. No buscar otra vez si el usuario aceptó los límites: la aceptación quedó expresada explícitamente en la conversación del 2026-10-22 y se registró en el repositorio.

## Decisión registrada

El propietario acepta como base de implementación el perfil numérico inicial del presupuesto de recursos. Registro:
`NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md`

Valores aceptados como base (no son mediciones de capacidad ni garantías de rendimiento):
- Entrada cruda de `--content-stdin`: 256 KiB.
- Campo `content` de una entrada Chronicle: 256 KiB UTF-8.
- Entradas Chronicle: 10.000.
- Documento Chronicle serializado: 32 MiB.
- Continuity: `missions` 10.000; `attempts` 20.000; `doNotRepeat` 20.000; `executions` 10.000; `effectJournal` 20.000.
- Snapshot/documento Continuity serializado: 16 MiB.
- KiB/MiB binarios (1 KiB = 1.024 bytes; 1 MiB = 1.048.576 bytes).
- No se aprobó un límite agregado de disco/heap; permanece OPEN. No inventar un número agregado.

La aceptación de estos límites no aprueba Constitución completa, autoridad raíz, commissioning ni efectos protegidos.

## Qué se implementó

Archivos runtime relevantes:
- `src/nexo/core/resource-limits.mjs`: límites y validadores de recursos.
- `src/nexo/core/continuity-store.mjs`: límites para el documento/snapshot Continuity y cardinalidades.
- `src/nexo/core/chronicle-store.mjs`: lectura acotada, cardinalidad y tamaño serializado de Chronicle, rechazo de capacidad conocido diferenciado de persistencia ambigua.
- `src/nexo/application/chronicle-append.mjs`: validación del contenido antes de admitir la operación.
- `scripts/nexo-chronicle-session.mjs`: admisión de stdin con tope de bytes crudos.

La intención del contrato es leer bytes crudos con límite antes de decodificar/JSON.parse, rechazar exceso sin truncar, sin purga automática y sin mutar el documento existente; comprobar límites antes de escribir. No declarar cerrada una propiedad que no esté probada.

## Pruebas ya añadidas y evidencia

Se añadieron pruebas para:
- stdin bajo/en/exceso del máximo;
- contenido Chronicle UTF-8 en frontera, incluido un caso que excede por exactamente un byte;
- documentos Chronicle y Continuity existentes que exceden el tamaño permitido;
- cardinalidades inclusivas y exceso de una unidad;
- tamaño serializado Chronicle/Continuity en el helper de límites;
- dos appends Chronicle concurrentes cerca del tope serializado: solo uno se confirma, el otro se bloquea, y bytes/revisión no avanzan por el rechazo.

Último SHA de código/pruebas cuya CI de seis suites fue verificada: `7ce3e5174e26917ecde9edeafa50b3d64d4fa10b`.
- [STEP 4 semantic validation — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528919)
- [Bounded mission admission and restart continuity — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528889)
- [Integrated acceptance regression — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784529019)
- [Deterministic persistence tests — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528925)
- [STEP 5 outcome classification — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528971)
- [Chronicle native vertical — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784529075)

Importante: esos runs apuntan al SHA `7ce3e517...`, no al HEAD documental posterior. Verificar CI del SHA exacto si se modifica runtime/tests; no atribuir resultados a otro SHA.

## Siguiente tarea concreta — evaluación posterior a la frontera Continuity

Las dos brechas de prueba indicadas en el handoff original ya están cubiertas por `tests/nexo/continuity-store.test.mjs`:
1. Snapshot estructuralmente válido sobre el límite serializado: rechazo explícito antes del lock; archivo previo idéntico byte por byte y revisión sin avance.
2. Dos candidatos de tamaño cercano al límite contra la misma revisión: un commit y un conflicto; resultado de commit cotejado con la revisión/snapshot recargados y bytes crudos exactos del envelope canónico.

La prueba de bytes fue reforzada en commit `20b3e1b51616c93862a2cad2e502c143c35b77ef`. Los cinco workflows disparados para ese SHA pasaron:
- [Integrated acceptance regression — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971051)
- [Deterministic persistence tests — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971089)
- [STEP 5 outcome classification — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971053)
- [STEP 4 semantic validation — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971086)
- [Bounded mission admission and restart continuity — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971113)

No declarar que los seis workflows posibles corrieron en ese SHA: el resultado verificado es cinco de cinco workflows disparados. Tampoco ejecutar de nuevo esas pruebas solo para repetirlas.

Leer `NCS_M0_E_INITIAL_OPERATIONAL_SCOPE_2026-10-22.md` antes de seguir: el alcance inicial es CLI local con límites por entrada/documento/operación; varios procesos simultáneos no están bloqueados globalmente. Siguiente paso: inventariar las rutas de entrada a los stores, confirmar la cobertura real de los validadores y delimitar qué no cubren los topes por-store. No repetir las pruebas Continuity ya verificadas. Mantener el presupuesto agregado de heap/disco OPEN; no inventar cuotas ni añadir semáforos, locks globales o wrappers sin diseñar la unidad de admisión y demostrar que cubre todas las rutas.

## Estado canónico — no modificar por inferencia

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- El presupuesto por-store aceptado no es evidencia de autoridad ni habilita efectos externos.
- `chronicle_append` es persistencia interna; no equivale a autorización raíz ni a un sink externo protegido.

## Reglas de trabajo

- No reabrir investigaciones pasadas sin una contradicción nueva y concreta.
- No repetir decisiones que ya están registradas.
- No afirmar cambios, tests o CI sin evidencia verificable del SHA exacto.
- No esconder fallos transitorios: describirlos y registrar su resolución.
- No crear IDs, colas, retries, tombstones, transacciones ni contratos paralelos por conveniencia.
- No convertir un rechazo de capacidad conocido en `UNKNOWN`; reservar `UNKNOWN` para resultados realmente ambiguos.
- Mantener documentación y tests sincronizados con el runtime.
- Las pruebas de Continuity ya están cubiertas y CI verificada; no repetirlas sin una contradicción nueva. Continuar con la evaluación de suficiencia por capas, sin volver a investigaciones históricas que no sean necesarias para esa tarea.

## Referencias esenciales

- Puerta canónica: [NEXO_NCS/STATUS.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)
- Decisión de presupuesto: [NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md)
- Contrato de presupuesto: [NCS_M0_RESOURCE_BUDGET_CONTRACT_PROPOSAL_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_RESOURCE_BUDGET_CONTRACT_PROPOSAL_2026-10-22.md)
- Perfil numérico: [NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md)


## Actualización posterior — presupuesto agregado (2026-10-22)

La prueba de las fronteras por-store no debe confundirse con una cota agregada. Ver [hallazgo de frontera](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_E_AGGREGATE_RESOURCE_ENVELOPE_FINDING_2026-10-22.md).

- Los topes de JSON no equivalen a heap: la lectura acotada acumula chunks, concatena, decodifica, parsea y puede clonar objetos. Lecturas concurrentes no adquieren el lock de escritura; locks por archivo no limitan la suma entre rutas o procesos.
- El CLI limita stdin por invocación, pero no la cantidad de procesos CLI simultáneos. No hay evidencia de presupuesto total de disco/heap ni de capacidad multiusuario.
- No inventar un número agregado ni añadir una cola/semaforo por reflejo. Primero definir el modo operativo objetivo (CLI aislado, proceso persistente único o servicio concurrente), luego la unidad de admisión y su enforcement.
- Este análisis fue documental: no se cambió runtime ni se ejecutaron tests. El estado M0 permanece INCOMPLETO; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP.

### Siguiente tarea exacta
Decidir y documentar el modo operativo inicial de M0 y el ámbito del presupuesto. Después diseñar una única frontera verificable que cubra las rutas de admisión de ese ámbito; incluir pruebas de concurrencia en esa misma unidad operativa. Mantener el presupuesto agregado OPEN hasta contar con esa evidencia.



## Actualización — cobertura de límites por ruta (2026-10-22)

Leer [NCS_M0_E_RESOURCE_ENTRYPOINT_COVERAGE_2026-10-22.md](NCS_M0_E_RESOURCE_ENTRYPOINT_COVERAGE_2026-10-22.md). El inventario identifica la ruta CLI Chronicle, la capa de aplicación, las consultas Continuity, apertura del propietario, runtime owner-backed y acceso directo al store. Los límites son por entrada/documento/store; no hay cuota compartida de lectores, heap o disco entre procesos.

Resultado ya registrado en [NCS_M0_E_LOCAL_RESOURCE_BOUNDS_GATE_RESULT_2026-10-22.md](NCS_M0_E_LOCAL_RESOURCE_BOUNDS_GATE_RESULT_2026-10-22.md): límites locales por entrada/documento/store y garantías de commit por-store validados dentro del alcance acotado. El presupuesto agregado de heap/disco permanece OPEN; no se garantiza exclusión multiproceso. No repetir pruebas Continuity ya verificadas ni añadir un mecanismo global parcial.


## Reanudación tras inspección de callers — 2026-10-22

La revisión de `continuity-queries.mjs`, `continuity-service.mjs`, `owner-backed-runtime.mjs`, `chronicle-append.mjs`, `continuity-store.mjs`, `chronicle-store.mjs` y `resource-limits.mjs` no reveló una ruta alternativa que justifique repetir las pruebas por-store. Las consultas y el owner-backed runtime cargan Continuity mediante el store; la capa de aplicación Chronicle crea ambos stores y hace preflight; el CLI limita stdin antes de formar el texto. Los stores aplican límites propios al documento, colecciones y escritura.

Esta conclusión está limitada a las rutas revisadas y a directorios locales de confianza. No demuestra un límite de memoria agregada ni bloquea varios procesos CLI. No se hicieron cambios de runtime ni se ejecutaron tests en esta inspección.

### Próximo trabajo de Nexo

Continuar con la frontera entre interpretar una petición y producir una vista previa de borrador de misión, reutilizando `previewNexoMissionDraft` y el contrato de misión existente. Antes de conectar un modelo, definir entradas no confiables, validación del objetivo/evidencia y restricción de acciones admitidas. Mantener la vista previa sin persistencia ni dispatch, y `authorization: NOT_EVALUATED`. No reabrir el presupuesto agregado salvo que se pretenda soportar concurrencia de servicio o exista una contradicción nueva.
