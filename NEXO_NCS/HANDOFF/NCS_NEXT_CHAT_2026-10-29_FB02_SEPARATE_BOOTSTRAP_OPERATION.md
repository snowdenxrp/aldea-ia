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
- Pruebas (casos CLI + API directa): `d154cf257a54c288c55ac2cc5ea49266fba986e5`
- Ajuste de import de fixture para usar el módulo propietario: `0750fe48d7d3df336c09c6a003b806416887ec95`

Archivos:
- `src/nexo/application/chronicle-append.mjs`
- `tests/nexo/entrypoint.test.mjs`

## Lo que NO se ha hecho

- No se ejecutaron pruebas locales ni CI/Actions.
- No se ejecutaron comandos ni instalaciones en el POCO.
- No se ejecutó bootstrap real ni se creó Continuity operacional.
- No se cambió la autorización, la raíz legítima ni los controles de publicación.
- No se afirma que el nuevo código compile o pase las pruebas hasta validarlo en un commit exacto.

## Revisión estática posterior (sin ejecutar pruebas)

- Se inspeccionaron los diffs de los commits de runtime y pruebas; el guard se encuentra al inicio del caso de uso tras extraer opciones, antes de validación de paths y de cualquier apertura/inicialización de stores.
- La consulta de estado de checks de GitHub para `0750fe48d7d3df336c09c6a003b806416887ec95` devolvió una lista vacía. Esto no es PASS ni evidencia de ejecución; no se lanzó CI.
- El cambio aún requiere pruebas ejecutadas y revisión de todos los callers antes de cerrar FB-02.

## Revisión necesaria antes de declarar FB-02 cerrado

- Ejecutar el test dirigido y el conjunto relevante solo con autorización específica.
- Revisar todos los callers públicos de `runNexoChronicleAppend` y confirmar que el guard es ineludible.
- Confirmar que los tests existentes no dependen de inicialización combinada para preparar fixtures.
- Revisar el diff y el SHA probado; no usar resultados de otro commit.
- Mantener FB-02 OPEN/UNKNOWN hasta obtener evidencia PASS.

## Gates

**M0 INCOMPLETO.** FB-02 sigue OPEN/UNKNOWN hasta validación. FB-01 sigue pendiente de validación y raíz legítima PENDING/UNKNOWN. FB-03/FB-04 siguen OPEN/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; `authorization: NOT_EVALUATED`. Primera publicación operacional y efectos protegidos permanecen STOP.


## Actualización de validación — 2026-10-29 (posterior al texto original)

El estado histórico anterior “IMPLEMENTED CANDIDATE — NOT TESTED” queda supersedido por esta validación acotada.

- **SHA probado:** `86e73525f8c63e143b5860d77f0d191e54213976`.
- **PASS:** [workflow integrado M0](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618309), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618133), [bounded mission admission/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618189), [deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618328), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618177) y [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618334), todos con el mismo SHA.
- La CI encontró expectativas de fixtures incompatibles con el nuevo contrato: algunas pruebas todavía esperaban que una sola invocación inicializara Continuity y luego continuara a Chronicle/dispatch. Se corrigieron para probar el rechazo de esa combinación y preparar Continuity por separado en las rutas normales. Los errores de pruebas anteriores quedaron asociados a SHAs previos; no se presentan como fallos del SHA validado.
- Última corrección incluida en el SHA validado: `86e73525f8c63e143b5860d77f0d191e54213976`.
- **Resultado:** FB-02 tiene evidencia de pruebas/CI PASS en ese SHA. Mantener el gate abierto hasta el cierre documental tras revisar el contrato/callers. FB-01 no se considera cerrado por estos resultados; tampoco quedan demostrados TOCTOU, exclusión de escritores, autoridad/raíz legítima ni evidencia E2/E3 del POCO.
- No se ejecutaron bootstrap real, comandos del POCO, instalaciones ni efectos protegidos. Estado global sigue **M0 INCOMPLETO**.

