# NCS M0 — hallazgos estáticos acotados para E3 y objeto Continuity
**Fecha:** 2026-10-28  
**Rama evaluada:** `ncs-clean-architecture`  
**Tipo:** lectura estática puntual de fuentes en la revisión indicada; no prueba operacional, no ejecución y no autorización.

## 1. Propósito
Resolver únicamente dos incertidumbres documentales que sí pueden acotarse desde el código ya versionado: qué exige la API para identificar el objeto Continuity y qué expone el entrypoint de producto como comandos. No se repite el censo transitivo de callers ni se declara exhaustividad del inventario de writers.

## 2. Fuentes exactas consultadas
- `src/nexo/core/continuity-service.mjs` — blob SHA `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`.
- `src/nexo/core/continuity-store.mjs` — blob SHA `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- `scripts/nexo-continuity.mjs` — blob SHA `f08969f2d77a2e90f74d01c96242e29de89e3f22`.
- `scripts/nexo.mjs` — blob SHA `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- `src/nexo/core/continuity-owner.mjs` — blob SHA `6d1fa37745ca57e5ab5093b9cdcabf1ff5495261`.

Estas revisiones corresponden al árbol de la rama evaluada en el commit `cedf455bd3cfa7d4f1eacb37636aa6a312e99434`. No se ejecutó código.

## 3. Hechos estáticos observables
1. `openNexoContinuityOwner(options)` recibe `filePath` por opciones; la fuente no define en esta función una ruta universal predeterminada. La configuración efectiva de una invocación real todavía debe obtenerse de esa invocación concreta.
2. Cuando `loadCurrent()` devuelve exactamente `NEXO_CONTINUITY_STORE_NOT_FOUND`, el servicio solo prepara un snapshot inicial si recibe `legacyMemory` o `allowEmptyInitialization === true`. Sin esos datos/opción, devuelve `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`. Esto describe una rama del código, no autoriza a usarla en el dispositivo.
3. Tras decidir el snapshot, el servicio llama a `store.initialize(snapshot)`; si el resultado no es `committed` ni `conflict`, bloquea con el error correspondiente. Esta secuencia no demuestra por sí sola exclusión contra escritores fuera del protocolo.
4. El store usa `filePath` como configuración de confianza suministrada por caller. El propio comentario del store indica que el path no es una frontera de sandbox.
5. El lock del store se representa como `<filePath>.lock`; la implementación crea el directorio del lock y escribe `owner.json`. Es un protocolo cooperativo entre participantes que lo respetan; el mero lock no prueba que otros escritores no puedan acceder al archivo.
6. `scripts/nexo-continuity.mjs` solo reexporta `openNexoContinuityOwner`; no define por sí mismo un comando CLI ni fija el path.
7. El router `scripts/nexo.mjs` describe un entrypoint estrecho. El fragmento de parser consultado expone `status --continuity <path>`, `mission-status --continuity <path> --mission <id>` y `chronicle-append`; no se observó en ese parser un subcomando de primera creación de Continuity. No se afirma aquí que no exista otro caller o launcher en el repositorio.
8. Los nombres de comandos y los parámetros anteriores no prueban qué comando, si alguno, se usa en el POCO, ni quién tiene acceso al archivo en Android.

## 4. Efecto en E2/E3/E4
- **E3:** queda acotado que la API de servicio requiere que un caller proporcione el path y que el wrapper `scripts/nexo-continuity.mjs` no selecciona un launcher. El launcher operacional del POCO sigue UNKNOWN/no configurado. La ausencia de un subcomando de bootstrap en el parser consultado no prueba ausencia de otros callers.
- **E2:** sigue UNKNOWN. El lock es cooperativo; las fuentes estáticas no muestran una barrera del sistema operativo que impida a todos los escritores relevantes acceder o reanudarse.
- **E4:** sigue NOT READY. No hay `filePath` efectivo de una invocación real ni evidencia de su ámbito de almacenamiento/permisos.
- **P01-B:** permanece C — NO SELECCIONAR TODAVÍA. Estos hechos no eligen una política de aislamiento.
- **P01-A/P01-G:** siguen OPEN/UNKNOWN. La rama de inicialización técnica no establece la regla legítima de primera creación.

## 5. Próximo paso válido
No hacer más búsquedas generales de callers a partir de estos hallazgos. Para continuar se requiere identificar la invocación que se pretende utilizar en el POCO y, por separado, autorización explícita para una inspección operacional estrictamente no mutante. Esa inspección podría documentar la configuración y ruta reales, pero no debe ejecutar `openNexoContinuityOwner`, crear el archivo, cambiar permisos, instalar automatizadores, detener procesos ni correr tests/CI. Si no puede observarse el path o la cobertura de escritores, conservar UNKNOWN/STOP.

## 6. Estado no alterado
M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P-05 `NO RATIFICADA`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos `STOP`. Solo lectura de fuentes GitHub y documentación; sin cambios ejecutables, comandos en el POCO, tests, CI o Actions.
