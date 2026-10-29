# NCS M0 — FB-02: separación de bootstrap y operación Chronicle

**Estado:** IMPLEMENTED CANDIDATE — NOT TESTED  
**Fecha:** 2026-10-29  
**Autorización:** el propietario autorizó modificar runtime y añadir pruebas para cerrar FB-02, preservando la migración legacy. Expresamente no autorizó ejecutar pruebas, CI/Actions, comandos del POCO, bootstrap real ni efectos protegidos.

## Cambios realizados

1. En `src/nexo/application/chronicle-append.mjs`, `runNexoChronicleAppend` ahora bloquea `initializeContinuity: true` antes de validar paths, abrir stores, inicializar archivos, admitir misiones o ejecutar pasos. Código estable:
   `NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED`.
2. La regla está en el límite del caso de uso, no solo en el CLI; una llamada directa a la API pública no puede saltarse el guard.
3. `tests/nexo/entrypoint.test.mjs` fue actualizado para preparar los stores de los casos normales por separado y añadir comprobaciones del bloqueo tanto desde CLI como desde la API pública, incluida la ausencia de creación de archivos.
4. No se cambió `openNexoContinuityOwner`, la precedencia de migración legacy, `assistants.mjs` ni `simulate.mjs`. La API dedicada `bootstrapNexoContinuityStore` sigue sin conectarse a un launcher.

## Commits

- Runtime: `96f2095b76499eea5457443887ad4288380a51f3`
- Pruebas: `0750fe48d7d3df336c09c6a003b806416887ec95`

Archivos:
- `src/nexo/application/chronicle-append.mjs`
- `tests/nexo/entrypoint.test.mjs`

## Lo que NO se ha hecho

- No se ejecutaron pruebas locales ni CI/Actions.
- No se ejecutaron comandos ni instalaciones en el POCO.
- No se ejecutó bootstrap real ni se creó Continuity operacional.
- No se cambió la autorización, la raíz legítima ni los controles de publicación.
- No se afirma que el nuevo código compile o pase las pruebas hasta validarlo en un commit exacto.

## Revisión necesaria antes de declarar FB-02 cerrado

- Ejecutar el test dirigido y el conjunto relevante solo con autorización específica.
- Revisar todos los callers públicos de `runNexoChronicleAppend` y confirmar que el guard es ineludible.
- Confirmar que los tests existentes no dependen de inicialización combinada para preparar fixtures.
- Revisar el diff y el SHA probado; no usar resultados de otro commit.
- Mantener FB-02 OPEN/UNKNOWN hasta obtener evidencia PASS.

## Gates

**M0 INCOMPLETO.** FB-02 sigue OPEN/UNKNOWN hasta validación. FB-01 sigue pendiente de validación y raíz legítima PENDING/UNKNOWN. FB-03/FB-04 siguen OPEN/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; `authorization: NOT_EVALUATED`. Primera publicación operacional y efectos protegidos permanecen STOP.
