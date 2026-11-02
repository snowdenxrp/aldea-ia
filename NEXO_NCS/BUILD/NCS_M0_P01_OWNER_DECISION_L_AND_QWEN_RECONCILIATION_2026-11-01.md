# NCS M0 — decisión del propietario P01-A = L y reconciliación adversarial Qwen

Fecha: 2026-11-01
Rama: `ncs-lumina-decoupling-2026-10-29`
Tipo: decisión normativa del propietario + reconciliación de evidencia
Estado: documental; no modifica runtime, no ejecuta tests/CI, no ejecuta bootstrap ni crea Continuity.

## 1. Decisión explícita del propietario

El propietario aprobó P01-A = **L**, con esta definición exacta:

> Continuity M0 es persistencia operacional local, con influencia acotada sobre el flujo de Nexo, que no establece identidad, Constitución ni autoridad constitucional, y que no concede por sí misma permiso para efectos protegidos.

Esta decisión reemplaza la clasificación provisional anterior U para P01-A. No convierte Continuity en dato inerte: su contenido participa en admisión, planificación, PREPARED, linaje y recuperación.

## 2. Alcance de la decisión

La decisión:
- clasifica el objeto Continuity M0 como persistencia operacional local no constitucional;
- reconoce influencia operacional real, pero subordinada y acotada;
- niega que el objeto, su existencia, revisión, lock, snapshot o contenido establezcan identidad/Constitución/autoridad;
- niega que el objeto por sí solo autorice efectos protegidos, liquide PREPARED o habilite redispatch;
- autoriza registrar esta clasificación y desarrollar el contrato técnico necesario para M0.

La decisión NO:
- autoriza bootstrap real, primera creación/publicación ni commissioning;
- establece la raíz legítima ni cambia `authorization: NOT_EVALUATED`;
- autoriza efectos protegidos;
- cierra P01-G, P01-C/D, P01-E/F, P01-H, P-05 ni D0/D1/D2/D3;
- selecciona B2/P01-B del Registro §10.6;
- declara admisible el entorno POCO/Termux.

## 3. Reconciliación del informe adversarial Qwen

El informe de Qwen declara que su sesión no pudo verificar el HEAD ni acceder al árbol. Eso limita sus conclusiones sobre el estado actual, pero no invalida evidencia previa fijada a SHAs concretos y registrada en STATUS/handoff. La evidencia previa tampoco se puede proyectar automáticamente al HEAD actual sin verificar ancestry y cambios.

### C1 — persistencia operacional local
Evidencia previamente inspeccionada: `src/nexo/core/continuity-store.mjs`, `src/nexo/core/continuity-service.mjs`; `bootstrapNexoContinuityStore()` exige raíz/ruta explícitas y calcula el destino efectivo. La inicialización exclusiva está cubierta por pruebas de contrato y por CI en el SHA de código `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`.
Estado admisible: **IMPLEMENTED / TESTED / CI-VERIFIED en el alcance de API y fixtures de ese SHA**. No prueba primera publicación real ni admisibilidad del entorno.

### C2 — influencia acotada sobre el flujo
Evidencia semántica previamente inspeccionada: misiones, intentos, `doNotRepeat`, linaje de ejecuciones y `effectJournal` influyen en admisión, planificación, PREPARED y recuperación. La acotación aprobada por L es de autoridad/capacidad, no una exigencia automática de cuota, allowlist o rate limit.
Estado admisible: **STATICALLY OBSERVED, alcance limitado**. No afirmar exhaustividad de todos los consumidores ni inventar un mecanismo de cuota/scope sin requisito aprobado.

### C3 — sin autoridad constitucional
En los caminos inspeccionados, el store no constituye raíz/credencial constitucional ni evaluador de autoridad. Esta es una conclusión acotada al código y consumidores examinados, no una prueba negativa universal.
Estado admisible: **STATICALLY OBSERVED, alcance limitado**. No declarar CI-VERIFIED como propiedad universal.

### C4 — sin capacidad propia para autorizar efectos protegidos
Evidencia previamente inspeccionada: resultados relevantes conservan `authorization: NOT_EVALUATED`; reconciliación conserva `causalAttribution: NOT_ESTABLISHED` y `redispatchAuthorized: false`; `recordOutcome()` no liquida por sí solo `effectJournal`. La evidencia CI del SHA citado cubre contratos de separación y regresiones indicadas en STATUS/handoff, no debe presentarse como una prueba universal de ausencia de toda ruta de autorización.
Estado admisible: **STATICALLY OBSERVED** en los caminos revisados; cobertura específica de tests negativos de autorización debe verificarse antes de atribuirle CI-VERIFIED.

## 4. Requisitos de Qwen que no se convierten automáticamente en gates

- `allowlist`, cuota o scope explícito: no se desprenden necesariamente de L; primero debe probarse una ruta de influencia no acotada.
- Hash chain, firma/attestation del propietario: propuestas, no decisiones aprobadas ni requisitos inherentes a una persistencia local no autoritativa.
- CI que falle ante cualquier capacidad constitucional: puede ser útil si existe un contrato/test concreto; no se exige un workflow redundante por sí mismo. La evidencia debe ligar test, workflow, run y SHA cuando se declare CI-VERIFIED.
- Un único writer legítimo: la exigencia real debe formularse como cobertura de escritores dentro del entorno/ventana aceptados. El lock cooperativo actual no excluye writers no cooperativos.

No añadir estos mecanismos como trabajo M0 sin una brecha concreta, requisito aprobado y test falsable.

## 5. P01-G permanece abierto: contenido mínimo aún pendiente

La clasificación L resuelve el tipo semántico del objeto, pero no basta por sí sola para legitimar una primera escritura. P01-G debe reconciliar, para la instancia M0 concreta:

1. Objeto: ruta raíz explícita, ruta relativa, destino efectivo y snapshot/esquema inicial permitidos.
2. Estado previo: ausencia comprobada frente a corrupción, conflicto, temporal/lock ambiguo o estado preexistente; UNKNOWN debe detener, no convertirse en ausencia.
3. Operación: bootstrap dedicado y separado de admisión, PREPARED, dispatch, reconciliación y efectos.
4. Entorno/ventana: escritores y launchers relevantes que deben quedar excluidos o detenidos; mecanismo verificable que impida relanzamiento durante la publicación.
5. Límites: garantía acotada al entorno/ventana y a participantes cubiertos; no prometer defensa contra procesos hostiles con acceso al mismo UID/filesystem.
6. Evidencia: tests/CI ligados al SHA para las propiedades de contrato; evidencia separada del dispositivo/entorno real.

El lock cooperativo, `COPYFILE_EXCL` y las pruebas de Termux no resuelven por sí solos writers no cooperativos, path/symlink TOCTOU ni control sostenido del entorno. E2/E3 siguen UNKNOWN; E4 NOT READY.

## 6. Estado canónico

- P01-A: **L — DECIDIDO POR EL PROPIETARIO**.
- P01-G: **PENDING / UNKNOWN**.
- P01-B separación operacional de la matriz: IMPLEMENTED / CI-VERIFIED en fixtures y rutas probadas en el SHA citado; no es PASS end-to-end.
- B2/P01-B del Registro §10.6: C — NO SELECCIONAR TODAVÍA.
- P01-C/D: OPEN / UNKNOWN.
- P01-E/F/P01-H: estados previos; no se cierran por esta decisión.
- E2/E3: UNKNOWN; E4: NOT READY.
- Raíz legítima: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`; primera creación y efectos protegidos: STOP.
- NCS M0: INCOMPLETO.

No se ejecutó bootstrap, no se creó Continuity y no se ejecutaron tests/CI como parte de esta reconciliación.
