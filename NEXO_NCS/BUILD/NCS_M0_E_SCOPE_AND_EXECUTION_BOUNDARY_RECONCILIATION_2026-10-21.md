# NCS M0-E — reconciliación de alcance y fronteras de ejecución
Fecha: 2026-10-21
Rama: `ncs-clean-architecture`
Estado: **ANÁLISIS DOCUMENTAL; NO CAMBIA RUNTIME NI APRUEBA ALCANCE CONSTITUCIONAL**

## Propósito

Resolver la ambigüedad técnica inmediata entre el alcance arquitectónico ya decidido (una llave raíz, un dispositivo inicial) y el alcance de efectos gobernados por la primera Constitución. No convertir la aceptación del punto 2 como base del borrador en aprobación de un scope operativo exacto.

## Decisiones y fuentes que se conservan

- `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`: una llave raíz y un dispositivo inicial; la llave no concede permisos ilimitados; cada operación protegida requiere evaluación de autoridad y enforcement en la última frontera. Selección/provisión de llave y verificación siguen pendientes.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md`: estado DRAFT / NOT FROZEN / NOT COMMISSIONED. Su apartado 8 declara explícitamente que el scope inicial exacto y sus exclusiones no están seleccionados; el lenguaje normativo de las secciones previas no demuestra enforcement actual.
- `NEXO_NCS/BUILD/NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md`: el primer claim que requiere autoridad verificable es el permiso actual del propietario para una transición protegida concreta; no hay conexión demostrada desde raíz legítima hasta el límite final.
- `NEXO_NCS/DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md`: los puntos 1–7 están aceptados únicamente como base del borrador. Esto no equivale a aprobación del texto constitucional exacto, selección del scope, congelación ni commissioning.

## Rutas técnicas observadas

### A. Core transition

`src/nexo/core/protected-transition.mjs` consulta un `authorityGate` inyectado. Los tests pueden inyectar `AUTHORIZED`; eso prueba composición del flujo, no procedencia. La ruta puede llamar `conditionalCommit.commit(candidate)` y no invoca `effectBoundary.prepare`. No se ha demostrado que `conditionalCommit.commit` sea el sink de un efecto externo; no etiquetarlo como tal sin implementación y callers.

### B. Owner-backed runtime

`src/nexo/core/owner-backed-runtime.mjs`:
- valida contratos de owner/adapter y carga la misión actual;
- bloquea las acciones de reparación antes de PREPARED;
- bloquea cualquier acción distinta de `chronicle_append`;
- para `chronicle_append`, implementa dispatch, reconciliación y resultado terminal, pero la ruta pública conserva `authorization: NOT_EVALUATED` (según `tests/nexo/chronicle-runtime.test.mjs`).

Conclusión: la ruta restringe acciones de manera conservadora, pero no reconoce una raíz legítima ni autoriza constitucionalmente ni siquiera el append. El append es persistencia local y no debe confundirse con un efecto externo protegido.

### C. Legacy/simulation effect adapter

`src/nexo/runtime.js` y `src/nexo/simulation-adapter.js` construyen una ruta de simulación cuyos handlers pueden mutar el objeto `simulation`. `src/nexo/effect-adapter.js` ejecuta handlers registrados tras sus controles de precondición/intent y maneja reconciliación. Los verificadores se instalan mediante configuración de bootstrap, pero no se ha demostrado que sean el verificador constitucional de raíz ni que la ruta aplique la Constitución vigente.

No se concluye que todos esos handlers estén habilitados en producción, que cada uno pertenezca al scope constitucional inicial o que exista un exploit. Se requiere rastreo de entry points/callers y decisión explícita del scope.

## Tabla de clasificación actual

| Ruta/capacidad | Hecho comprobado | ¿Autoridad constitucional legítima conectada? | Disposición M0 |
|---|---|---|---|
| Core protected transition | Port de autoridad inyectado; commit condicional; no se usa `effectBoundary.prepare` en la ruta inspeccionada | No demostrado | STOP; no usar fixture AUTHORIZED como aceptación |
| Owner-backed `chronicle_append` | Ruta de persistencia local con journal/reconciliación; resultado público mantiene `NOT_EVALUATED` | No | No llamarlo operación constitucionalmente autorizada; conservar restricción |
| Owner-backed repair actions | Rechazo antes de PREPARED/dispatch | No necesita autorizarse para seguir bloqueado | Mantener bloqueado |
| Owner-backed otras acciones | Rechazo antes de PREPARED/dispatch | No necesita autorizarse para seguir bloqueado | Mantener bloqueado |
| Legacy/simulation handlers | Mutación local de simulación después de controles del adaptador | No demostrado | Scope/reachability pendientes; no habilitar ni declarar bypass de producción |
| Root bootstrap test vector | Verificación de firma sobre vector fijo | No es raíz de Nexo | Primitiva de prueba solamente |

## Dependencia exacta pendiente

La decisión de una llave raíz/un dispositivo no selecciona por sí sola:
1. qué clases de efecto son parte del scope constitucional inicial;
2. qué rutas legacy/simulation deben estar dentro del mismo límite;
3. qué sink se considera final para cada clase de efecto;
4. qué estado establece la Constitución vigente y revocación;
5. qué evidencia independiente reconoce la única llave raíz.

No es seguro elegir esos puntos por inferencia desde módulos existentes. La guía de revisión del propietario los marca como decisiones/prerrequisitos OPEN. La aceptación conversacional de los puntos 1–7 fue sólo como base del borrador, por lo que no autoriza que este informe complete esos huecos.

## Siguiente acción segura

Sin cambiar runtime:
1. mantener todos los efectos protegidos en STOP;
2. conservar la lista owner-backed de acciones habilitadas, que actualmente no declara autoridad y no abre efectos externos;
3. documentar el grafo de callers de las rutas legacy/simulation, distinguiendo entry point exportado, callers encontrados y uso en producción realmente demostrado;
4. preparar una propuesta de scope mínima con inclusión/exclusión explícita para que el propietario la decida; no registrarla como aceptada hasta que el propietario responda;
5. tras resolver scope y aprobación del objeto constitucional exacto, diseñar el contrato de reconocimiento de raíz y pruebas de dispatch cero para casos negativos.

## Estado conservador

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No se modifica código runtime, no se crea una raíz, no se firma ni congela Constitución y no se declara CI PASS por este análisis.
