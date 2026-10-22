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

## Siguiente tarea concreta — continuar M0-E, sin desviarse

Orden:
1. Inspeccionar únicamente el código/tests actuales de `continuity-store.mjs`, `resource-limits.mjs` y `tests/nexo/continuity-store.test.mjs`.
2. Añadir una prueba de store real que intente persistir un snapshot válido estructuralmente pero cuyo tamaño serializado exceda 16 MiB. Verificar resultado explícito de rechazo y que el archivo anterior se conserva byte por byte y con la misma revisión. No basta con probar el helper aislado.
3. Añadir una prueba de dos escrituras concurrentes de Continuity cerca de su frontera de capacidad. Verificar que no se admitan ambas si juntas exceden el tope, que no haya pérdida/duplicación, y que bytes y revisión observados correspondan al resultado confirmado. Usa los contratos de concurrencia/revisión existentes; no inventes mutex, colas, reintentos ni wrappers nuevos. Si el store no ofrece una frontera atómica que permita garantizarlo, documentar el fallo y parar para corregir la causa raíz.
4. Ejecutar las suites pertinentes; luego comprobar las seis suites principales en el SHA exacto que contiene el código/tests final. Registrar run IDs, SHA y resultados en STATUS.
5. Actualizar STATUS y este handoff al terminar, dejando el siguiente paso concreto. No marcar M0-E cerrado si faltan pruebas o si el CI no corresponde al SHA final.

Después de esas pruebas, revisar si el contrato existente permite declarar límites por-store suficientes para el uso actual. El presupuesto agregado de disco/heap sigue OPEN; no elegir valores por intuición ni convertirlo en una investigación de arquitectura extensa antes de cerrar las dos brechas concretas.

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
- El siguiente chat debe empezar ejecutando la tarea concreta de Continuity, no investigando RATS, Step 7, AB/P, M1 ni noticias externas.

## Referencias esenciales

- Puerta canónica: [NEXO_NCS/STATUS.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)
- Decisión de presupuesto: [NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md)
- Contrato de presupuesto: [NCS_M0_RESOURCE_BUDGET_CONTRACT_PROPOSAL_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_RESOURCE_BUDGET_CONTRACT_PROPOSAL_2026-10-22.md)
- Perfil numérico: [NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md)
