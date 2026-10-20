# NCS — HANDOFF PARA EL SIGUIENTE CHAT
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Objetivo permanente: **avanzar M0 con cambios concretos, evidencia y CI exacto; no reiniciar la misión.**

## Instrucción inicial para el próximo chat
Retoma este documento y `NEXO_NCS/STATUS.md` como puertas de entrada. Lee primero la sección “Prioridad inmediata”. No vuelvas a investigar desde cero AuthorityGate, raíz bootstrap, locks, Chronicle persistence ni los contratos de STEP 7 ya cerrados. No afirmes pruebas ni estado de CI sin consultar el SHA/run aplicable. No cambies runtime sin un contraejemplo concreto y una regresión dirigida.

## Prioridad inmediata — coherencia de mission-status y consumidores
La decisión aceptada el 2026-10-19 `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md` (blob `dfb647d07cb28178b3c8a3a8289d8209943db8fd`) manda explícitamente:
- M0 continúa sin reinicio.
- El alcance inicial es una llave raíz y un solo dispositivo.
- El tipo/modelo, provisión y verificación física de la llave están pendientes.
- No se investiga de nuevo en general la familia de raíces ni se implementa bootstrap por ahora.
- El siguiente trabajo inmediato es coherencia entre misión persistida, estados de pasos y reconstrucción/proyección.

La revisión `NEXO_NCS/BUILD/NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md` (blob `4531fc68c0d2ccf28c6b063675ad6cad9cd90d18`) documenta el cierre de la regresión selectiva de mission-status en SHA `f07840b2222f55124e200c2866789834fa6904dd`:
- Mission status projection: [run 39429700787](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700787) SUCCESS.
- Deterministic persistence: [run 39429700840](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700840) SUCCESS.
- M0 integrated acceptance: [run 39429700796](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700796) SUCCESS.
- Chronicle native vertical: [run 39429700814](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700814) SUCCESS.
- El intento anterior que bloqueaba cualquier discrepancia falló en [run 39429434598](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429434598), SHA `b2e446fbba0ca4291dc0fdc3a9a1e008d56f0352`; no contar ese run como PASS. La regla correcta distingue `planned → awaiting_verification` legítimo del sobreclaim persistido `completed` que la reconstrucción no respalda.
- La consulta es read-only; no “arregla” el snapshot. La discrepancia terminal se presenta como bloqueada con diagnóstico acotado y sin payload/pasos privados.

### Próxima tarea exacta
Revisar los consumidores actuales de `loadNexoMissionStatus` y la CLI `scripts/nexo.mjs` con evidencia de fuente:
1. Identificar cada consumidor directo/indirecto y qué campos lee.
2. Comprobar si todos respetan `statusDiscrepancy` y el resultado `blocked`, o si algún consumidor convierte una proyección discrepante en estado utilizable.
3. Inspeccionar estados persistidos de pasos y resultados/attempts sólo si hay un contraejemplo concreto; no hacer una auditoría genérica sin hipótesis.
4. Si hay un camino que ignora la discrepancia, formular el mínimo cambio y una regresión de API/CLI que reproduzca el fallo. Mantener consultas read-only; no convertirlas en reparación implícita.
5. Ejecutar workflow dedicado y regresiones M0 relevantes tras los cambios y registrar SHA exacto + URLs de run. Si no hay defecto, documentar evidencia y pasar al siguiente bloqueo M0 concreto.

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
- Esta nota quedó expresamente subordinada a la prioridad inmediata de coherencia mission-status. No continuar ahora una búsqueda general de raíces ni inspeccionar el objeto constitucional como sustituto de M0.

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
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima en runtime: `PENDING/UNKNOWN`.
- No se cambió runtime ni se ejecutó CI durante esta sesión documental.
- `NEXO_NCS/STATUS.md` se consultó (blob en lectura `59a4f9778c56f237f45cad8927758171aa989665`, longitud 390,174) pero no se actualizó en este checkpoint. No afirmar que está sincronizado con los documentos recientes.

## Primera instrucción para continuar
Empieza por inspeccionar `src/nexo/application/continuity-queries.mjs`, `scripts/nexo.mjs`, pruebas de entrypoint y todos los consumidores encontrados por búsqueda de símbolo `loadNexoMissionStatus`. Produce primero una tabla corta consumidor → campo leído → tratamiento de `blocked/statusDiscrepancy` → prueba. Cambia código sólo si aparece un camino real que ignore el bloqueo; después añade regresión y verifica CI en el SHA nuevo.
