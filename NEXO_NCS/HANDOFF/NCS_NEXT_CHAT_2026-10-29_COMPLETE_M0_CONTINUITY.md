# Handoff de continuidad — NCS M0 (2026-10-29)

**Palabra de arranque para el siguiente chat:** `NCS`  
**Meta única:** cerrar NCS M0. No desviarse a M1, STEP 7, YubiKey ni rediseños paralelos.  
**Estado global:** **M0 INCOMPLETO**. No declarar gates cerrados sin evidencia vinculada al SHA exacto.

## 0. Instrucción inmediata para el siguiente chat

1. Leer `NEXO_NCS/STATUS.md` primero y luego este handoff.
2. Reutilizar la ruta mínima ya documentada; NO repetir auditorías, mapas estáticos ni censos ya completados salvo contradicción concreta.
3. La tarea más reciente fue la separación FB-02 entre bootstrap de Continuity y operación Chronicle. El cambio candidato está en GitHub, pero **no ha sido probado ni ejecutado**.
4. Próximo paso: revisión acotada del diff y del fixture de pruebas; después solicitar/confirmar autorización específica para ejecutar las pruebas dirigidas y CI. La autorización dada para modificar runtime y añadir tests **no incluía ejecutarlos**.
5. No ejecutar comandos en POCO, instalar/configurar Termux/Node.js, crear Continuity real ni ejecutar efectos protegidos sin autorización específica adicional.

## 1. Repo y fuente canónica

- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `ncs-clean-architecture`
- Estado canónico: `NEXO_NCS/STATUS.md`
- Ruta mínima: `NEXO_NCS/BUILD/NCS_M0_MINIMAL_CLOSURE_ROUTE_2026-10-29.md`
- Criterios y trazabilidad: `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md`
- FB-01: `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-29_FB01_BOOTSTRAP_DEDICATED.md`
- Brecha ambiental: `NEXO_NCS/BUILD/NCS_M0_POCO_E2_E3_EVIDENCE_GAP_2026-10-29.md`
- Este handoff: `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-29_FB02_SEPARATE_BOOTSTRAP_OPERATION.md`

## 2. Gates actuales — preservar exactamente

- `M0 INCOMPLETO`
- FB-01: implementación candidata; validación pendiente.
- FB-02: `OPEN / UNKNOWN` hasta pruebas PASS y revisión de callers.
- FB-03/FB-04: `OPEN / UNKNOWN`; aislamiento de writers y publicación segura no demostrados.
- FB-05 pendiente según STATUS/ruta mínima.
- FB-06/FB-07: validación/pruebas/CI pendientes.
- P-01 `OPEN / UNKNOWN`; raíz legítima `PENDING / UNKNOWN`.
- P01-B `C — NO SELECCIONAR TODAVÍA`.
- P-05 `NO RATIFICADA`.
- D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION no autorizada fuera de alcance expresamente autorizado.
- E2/E3 `UNKNOWN`; E4 `NOT READY`.
- `authorization: NOT_EVALUATED`.
- Primera publicación real de Continuity y efectos protegidos: `STOP`.

La implementación y documentación no equivalen a PASS. Los resultados de CI históricos de otros SHAs no validan estos cambios.

## 3. Trabajo de FB-02 realizado en esta sesión

El usuario autorizó: “modificar el runtime y añadir pruebas para cerrar FB-02, preservando la migración legacy existente”, sin autorización para ejecutar tests/CI, comandos del POCO, bootstrap real ni efectos protegidos.

### Runtime

Archivo: `src/nexo/application/chronicle-append.mjs`  
Commit de runtime: `96f2095b76499eea5457443887ad4288380a51f3`  
Blob resultante observado: `b070991f66c20c66627c37413c68e1efab6394c1`

Cambio: `runNexoChronicleAppend` rechaza `initializeContinuity: true` con código `NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED` antes de abrir/inicializar stores, admitir misión o ejecutar el paso. La regla se puso en el caso de uso, no solo en el wrapper CLI, para impedir que un caller directo eluda el bloqueo.

### Tests

Archivo: `tests/nexo/entrypoint.test.mjs`  
Último commit de test/import: `0750fe48d7d3df336c09c6a003b806416887ec95`  
Blob observado: `5bd53340301acdf2887371772f22a3730da4cd1f`

Se cambiaron los fixtures normales para preparar Continuity y Chronicle por separado y se añadieron casos que exigen bloqueo desde CLI y API directa, además de comprobar que no se crean los archivos destino. El test importa `createNexoChronicleStore` directamente desde `src/nexo/core/chronicle-store.mjs`.

**IMPORTANTE:** no se ejecutaron tests. No asumir que compila/pasa. El siguiente chat debe revisar el diff y el test fixture por posible impacto de la preparación inicial en otros asserts. No rehacer el análisis histórico del bypass: está documentado en STATUS.

### Documentación

Handoff FB-02 commit: `2e0287b8e2fafc9a3644ed636fb1af9f52e95307`.  
STATUS actualizado commit: `f045efbc126a40facc595a75c48be3cd4226bbe1`; blob `50fa15a70e80c8d545cedad91a0f223702ac71dd`.

## 4. Límites de FB-02

- El guard separa bootstrap y operación Chronicle en este caso de uso; aún requiere validación y revisión de todos los callers.
- No conecta `bootstrapNexoContinuityStore` a un launcher.
- No cambia `openNexoContinuityOwner` ni la migración legacy.
- No modifica `assistants.mjs` ni `simulate.mjs`.
- No resuelve TOCTOU, exclusión global de escritores, legitimidad de la raíz ni seguridad de la publicación.
- No demuestra qué está instalado o ejecutable en el POCO.

## 5. Entorno y UX

El usuario eligió **Termux + Node.js** como entorno candidato para el POCO X7 Pro. Aún falta confirmar disponibilidad y demostrar el control de launchers/writers; no instalar ni ejecutar nada en el dispositivo sin autorización.

El usuario también estableció requisito de interfaz M0: consola de control técnica premium, sin avatar ni personaje, con resumen de estado, detalles por indicador, centro de diagnóstico, registros/evidencias, exportación segura y códigos estables. Debe distinguir CONFIRMED/INFERRED/UNKNOWN/NOT RUN/NOT AUTHORIZED/PASS/FAIL/STOP; jamás inventar causa ni mostrar prueba no ejecutada como PASS. Especificación documental:
`NEXO_NCS/BUILD/NCS_M0_INTERFACE_DIAGNOSTICS_SPEC_2026-10-29.md`
Commit reportado: `31bced812efdd937ab62c1480d2be1a0084017c0`.
Estado: PROPOSAL — NOT IMPLEMENTED. No permitir que UX se convierta en un proyecto paralelo que bloquee M0.

## 6. Hechos técnicos previos que no se deben volver a auditar

- El bypass histórico está en la ruta `scripts/nexo.mjs` → `scripts/nexo-chronicle-session.mjs` → `runNexoChronicleAppend`; el flag `--initialize-continuity` llegaba a la aplicación, donde la ruta anterior podía crear owner y continuar a admisión/ejecución en la misma invocación.
- API dedicada `bootstrapNexoContinuityStore({root, relativePath,...})` en `src/nexo/core/continuity-service.mjs`: rechaza opciones extra como `legacyMemory`, deriva el destino de raíz explícita + ruta relativa, inicializa snapshot vacío y no devuelve owner. No hay caller operacional conocido; no se conectó a launcher.
- La API legacy `openNexoContinuityOwner` prioriza la migración legacy antes de `allowEmptyInitialization`; preservar esa conducta.
- Persiste riesgo TOCTOU y falta de evidencia sobre writers no cooperativos/relanzamientos.
- Los procesos observados anteriormente en el POCO fueron una observación parcial y temporal; no prueba ausencia de todos los launchers/writers.
- CI histórico sobre otros SHAs no prueba este cambio.

## 7. Secuencia de cierre recomendada

1. Revisión puntual de diff de los dos archivos y fixture de pruebas; corregir solo fallos concretos, sin ampliar alcance.
2. Confirmar autorización antes de ejecutar pruebas dirigidas y CI. Si se autoriza, registrar SHA exacto probado y resultados; no ejecutar bootstrap real.
3. Mantener FB-02 OPEN hasta evidencia PASS vinculada al SHA.
4. Avanzar FB-03/FB-04 usando el protocolo ambiental D3 existente, sin volver a censar código: definir evidencia real para Termux/Node.js, control de stop/relaunch y ventana de publicación.
5. Continuar FB-05, FB-06/FB-07 por la ruta mínima.
6. No cambiar gates por documentación ni por tests escritos.

## 8. Mensaje de arranque sugerido

“`NCS`. Lee `NEXO_NCS/STATUS.md` y `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-29_FB02_SEPARATE_BOOTSTRAP_OPERATION.md`. Continúa exactamente desde la revisión acotada del cambio FB-02 y sus fixtures; no repitas el mapa estático del bypass ni auditorías legacy. No ejecutes tests/CI ni comandos del POCO hasta autorización específica. La meta es cerrar NCS M0.”
