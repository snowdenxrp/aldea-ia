# NCS — HANDOFF PARA EL SIGUIENTE CHAT
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Objetivo permanente: **avanzar M0 con cambios concretos, evidencia y CI exacto; no reiniciar la misión.**

## Instrucción inicial para el próximo chat
Retoma este documento y `NEXO_NCS/STATUS.md` como puertas de entrada. Lee primero la sección “Prioridad inmediata”. No vuelvas a investigar desde cero AuthorityGate, raíz bootstrap, locks, Chronicle persistence ni los contratos de STEP 7 ya cerrados. No afirmes pruebas ni estado de CI sin consultar el SHA/run aplicable. No cambies runtime sin un contraejemplo concreto y una regresión dirigida.

## Estado de continuidad actualizado — 2026-10-20

### Cerrado: revisión de consumidores de mission-status
El informe nuevo `NEXO_NCS/BUILD/NCS_M0_MISSION_STATUS_CONSUMER_REVIEW_2026-10-20.md` está en la rama y documenta la revisión estática. La CLI `scripts/nexo.mjs` trata sólo `status === "reconstructed"` como éxito; el resto sale con código 1. `src/nexo/application/index.mjs` sólo reexporta la API. No se encontró un consumidor que ignore el bloqueo en el alcance inspeccionado. No cambiar runtime por esta hipótesis sin evidencia nueva.

### Cerrado: corrección de expectativa en prueba de lock
El runtime normaliza errores de adquisición en `initialize()` a `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`. El test commit inicial `9fad44406e3c19bac2a20ecb830cf29f6758dae7` falló porque esperaba todavía `EACCES`; el log mostró una expectativa de test obsoleta, no evidencia de que el runtime estuviera devolviendo el código equivocado.
- La expectativa se corrigió en `b133c8c392739a0912f7b0466650a25962ead267`; sus cinco checks publicados (tests, semantic-validation, outcome-classification, M0 contracts y mission-admission-continuity) fueron SUCCESS.
- Se añadieron pruebas de adquisición tardía/timeout en `844afaac8e5c15138a3a4bf70fb417954923e770` y `d65aaffb6f90e73aea23ff4e9bab8abd8c2cbec5`; en `d65aaff` los checks focales pasaron, pero el job amplio `tests` fue CANCELLED. No llamar a ese job PASS.
- La suite de persistencia determinista terminó SUCCESS en SHA exacto `cd9c02f1596225a419a1512a7ea9b55a4953e71e`, run [39431631088](https://github.com/snowdenxrp/aldea-ia/actions/runs/39431631088). `NEXO_NCS/STATUS.md` fue sincronizado con esta evidencia en commit `a0e47fbd6728dfcb312a9de425dbe064217c88d0`.

### Prioridad inmediata — revisar callers contra el deadline que ya está implementado
Usar `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md` junto con su addendum 2026-10-20. La recomendación histórica de espera ilimitada quedó supersedida por commits `52d200b`, `04a8c5f` y `df28b22`: el store ya tiene deadline monotónico predeterminado de 2.000 ms; Chronicle comparte un único deadline a través de ambos stores y mutaciones anidadas. No repetir la auditoría de stale-lock ni rediseñar timeout.
1. Completar una inspección dirigida de la API/callers actuales: método llamado, tratamiento de `failed / *_LOCK_ACQUISITION_TIMEOUT`, captura de excepciones OS no-path, resultado UNKNOWN y cualquier condición para dispatch/redispatch.
2. Reutilizar `src/nexo/application/chronicle-append.mjs` y sus pruebas existentes; `recordNexoMissionSafely()` captura excepciones y devuelve UNKNOWN con `dispatchAttempted: false` y `redispatchAuthorized: false`. Verificar el resto de métodos de owner/orquestación antes de generalizar esta garantía.
3. La API de store sigue siendo asimétrica: `initialize()` normaliza errores OS de adquisición a resultado `failed`; `commitIfCurrent()` normaliza timeout y errores de ruta, pero puede propagar otros errores OS. No uniformar sin caller real y regresión dirigida.
4. La prueba de contención cross-process ahora describe correctamente que el lock se libera antes del presupuesto por defecto; comentario corregido en commit `9bd69669208db5bbb7d4d06bce3d304590cd7d44`. El CI de ese cambio debe verificarse en el SHA correspondiente. La suite determinista previa SUCCESS [run 39431631088](https://github.com/snowdenxrp/aldea-ia/actions/runs/39431631088) corresponde a ancestro `cd9c02f`, no al test editado.
5. Si el inventario no demuestra una violación de M0, documentar el resultado y mantener runtime. Si aparece un contraejemplo concreto, especificar el contrato y la regresión antes de tocar runtime. Después volver a la frontera M0 de autorización sin reabrir investigación general de raíces.

## Trabajo documental hecho en esta sesión
### A. Inventario del claim Chronicle append
Archivo `NEXO_NCS/BUILD/NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md`, blob actual `591d5bfbd4a218adb4501afa9c9570298998b547`.
- Sigue `runNexoChronicleAppend` desde API pública a handler local, observación/reconciliación y asentamiento terminal.
- Distingue garantías locales de persistencia de autorización constitucional.
- Lista pruebas negativas necesarias sin afirmar que ya existan.
- No encontró un AuthorityGate conectado a una raíz legítima en la ruta inspeccionada; no declara bypass confirmado.

### B. Frontera AuthorityGate
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_IMPLEMENTATION_BOUNDARY_2026-10-20.md`, blob `a83c72be44a3f42e83068fd7e700eac831335f9a`.
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`, blob `f73fefce4ea27bc848def43155976a82890b6c6c`.
Archivo `NEXO_NCS/BUILD/NCS_M0_CURRENT_AUTHORITY_BOUNDARIES_2026-10-20.md`, blob `8d9e42c580acd020d770bbf8287a2830f0e86b91`.
- `createAuthorityResult()` valida forma, no establece raíz.
- `authorityGate.check` es un puerto inyectado; no se probó implementación legítima end-to-end.
- Fixtures que inyectan `AUTHORIZED` verifican composición, no reconocimiento del propietario.
- No hay evidencia de bypass confirmado; sí falta prueba de conexión a una fuente raíz reconocida y actual en el límite del efecto.

### C. Fuente normativa vs reconocimiento técnico
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md`, blob `d346e809985c0337f3f68d9262e673c9f56a7185`.
- La fuente normativa conceptual es el propietario humano expresado en la Constitución.
- La decisión aceptada limita primera fase a llave raíz única/dispositivo único; selección y provisión física no están implementadas.
- La prioridad inmediata de coherencia mission-status quedó revisada y documentada. No continuar ahora una búsqueda general de raíces ni inspeccionar el objeto constitucional como sustituto de M0.

### D. Handoff anterior ampliado
`NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_OUTCOME_RECONSTRUCTION.md`, blob verificado `a7184ad39e2ce62b6d49aa267bd3e037519c0507`. Contiene historial anterior de M0, evidencia de CI y los documentos AuthorityGate/Chronicle.

## Hallazgos y fuentes estáticas de autoridad
- `src/nexo/core/contracts.mjs`, blob `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`: `createAuthorityResult()` acepta estados, valida forma/evidence shape; no valida legitimidad de raíz.
- `src/nexo/core/ownership.mjs`, blob `3b66d07e67df09b058b37716716573f6c17a2099`: `authorityGate.check` es puerto inyectado; default falla con `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs`, blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`: sigue el pipeline si recibe `AUTHORIZED`; esto delega semántica al port.
- `tests/nexo/protected-transition.test.mjs`, blob `19e30c957100b41bd65222a46335a7f7b1748824`: fixtures sintéticas `AUTHORIZED` no prueban autoridad real.
- `src/nexo/application/index.mjs`, blob `7871645de355bc37ae074f4372ea960b887145be`: API estable exporta `runNexoChronicleAppend` y consultas read-only.
- `src/nexo/application/chronicle-append.mjs`, blob `ccb09c6874b9173963811073150c87b75f53bf2f`: `authorization: NOT_EVALUATED`; deadline monotónico compartido.
- `src/nexo/core/owner-backed-runtime.mjs`, blob `8c697ea2944e19cce90bf7833f4ba392fee83818`: reparación bloqueada antes de PREPARED por falta del contrato settlement; no afirmar que toda función de reparación esté globalmente deshabilitada.

## Restricciones de trabajo
- Misión: **M0**, no M1, no STEP 7 como investigación principal, no Lúmina.
- No reabrir auditorías de locks/deadlines, persistencia determinista o settlement ya cerradas salvo regresión concreta.
- No añadir raíces, trust registry, wrapper, quórum, colas, retries, tombstones ni transaction wrappers por intuición.
- No inventar evidencias; los documentos de diseño no equivalen a runtime, y runtime no equivale a CI.
- Evidencia de CI sólo aplica al SHA/archivos correspondientes.
- No habilitar efectos protegidos con base en fixtures, hash, firma histórica, snapshot, dispositivo o éxito de escritura local.
- No convertir consulta read-only en mutación/reparación.
- Mantener la decisión de una llave/dispositivo inicial; no escoger hardware/proveedor sin diseño técnico comprobable.

## Estado global al checkpoint
- Últimos commits documentales/test: `9bd69669208db5bbb7d4d06bce3d304590cd7d44` corrige la caracterización cross-process; `313c7c70e79da3e69eb67015eb20d6c34425b129` actualiza STATUS con el deadline real; `da05e50da0c73e65daf8d66266318aeaec298440` agrega addendum a la revisión de contención. `ef9978b44a1b83f0fa1c03b29a9ad7be33580b90` actualiza este handoff. Confirmar HEAD y CI antes de asumir que no hay commits posteriores.
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima en runtime: `PENDING/UNKNOWN`.
- No se cambió runtime ni se ejecutó CI durante esta sesión documental.
- `NEXO_NCS/STATUS.md` sí fue actualizado en commit `a0e47fbd6728dfcb312a9de425dbe064217c88d0` para registrar los logs fallidos por expectativa obsoleta, el arreglo y la suite de persistencia determinista SUCCESS en SHA `cd9c02f1596225a419a1512a7ea9b55a4953e71e`.

## Primera instrucción para continuar
No repetir la revisión de `mission-status`. Sigue la prioridad de contención actualizada: inventario dirigido de la API pública/callers frente al deadline monotónico ya implementado. Antes de modificar código, producir una tabla caller → método → tratamiento de timeout/excepción/UNKNOWN → deadline compartido o independiente → riesgo de dispatch/redispatch. No cambiar runtime sin contraejemplo y contrato explícito.
