# NCS M0 — Paquete de implementación D1 / D4

**Fecha:** 2026-10-31  
**Base documental:** rama ncs-clean-architecture, HEAD observado 31ae3e91c749255af153675229dbb64ca06a581c.  
**Tipo:** paquete técnico listo para ejecución; NO implementado, NO probado, NO autorización de runtime.  
**Propósito:** convertir el contrato D1/D4 ya revisado en cambios mínimos, ordenados y verificables, sin reabrir auditorías previas.

## 1. Dictamen ejecutivo

Claude no entregó revisión adicional porque agotó su límite. No es un bloqueo técnico: la evidencia de código inspeccionada y la revisión adversarial de Qwen permiten fijar el alcance mínimo.

- **D1:** el defecto está en openNexoContinuityOwner: el camino de apertura también importa legacy o inicializa vacío. Debe convertirse en open-existing exclusivamente.
- **D4:** el service expone store; nexo-repair-entrypoint recibe esa capacidad; nexo-repair-settlement usa commitIfCurrent directamente. Ese es el bypass real. reconcilePrepared no es bypass: permanece dentro del cierre privado del owner y no debe reescribirse.
- **D5:** PR #110 ya contiene la implementación candidata. No duplicar código. Su integración es una acción separada y requiere reconciliar su base con el HEAD vigente.

Este paquete no cambia estados de autorización, root, entorno, primera publicación ni efectos protegidos.

## 2. D1 — cambio mínimo requerido

### 2.1 Superficie confirmada

Archivo src/nexo/core/continuity-service.mjs, blob inspeccionado 86b33409ca7150e45846c7c97a2d4b28780121e7:

- readContinuityServiceOptions acepta legacyMemory y allowEmptyInitialization.
- openNexoContinuityOwner llama store.loadCurrent(); ante NOT_FOUND proyecta legacy o inicializa snapshot vacío; finalmente devuelve owner y store.
- bootstrapNexoContinuityStore ya es una operación separada, explícita, vacía y sin owner. No rehacerla como parte de D1.

### 2.2 Delta de implementación

1. Convertir openNexoContinuityOwner en apertura de store existente únicamente:
   - aceptar filePath, effectVerifiers y opciones de lock actualmente válidas;
   - eliminar legacyMemory y allowEmptyInitialization de su contrato;
   - propagar NOT_FOUND sin inicializar, proyectar, crear lock/temporal de publicación ni crear directorios;
   - propagar corrupción/incompatibilidad sin fallback.
2. Mantener bootstrapNexoContinuityStore como única ruta de primera creación M0. No devolver owner ni store operativo.
3. Extraer la rama legacy actual a una operación con nombre/intención explícitos (por ejemplo, migrateLegacyNexoContinuityStore), conservando sin reinterpretar la proyección y validación existentes. No invocarla desde open-existing, bootstrap ni Lúmina. La operación queda fuera del camino M0 y no se activa automáticamente; su uso operativo futuro requiere contrato/autorización propios. No borrar projectNexoContinuitySnapshot ni sus validadores.
4. Inventariar todos los callers de openNexoContinuityOwner en el commit objetivo antes de cambiar firmas. Adaptar cada caller a open-existing o bootstrap explícito; no conservar flags de compatibilidad que reintroduzcan creación implícita.
5. Mantener un código único y estable para NOT_FOUND. No capturar NOT_FOUND para crear estado.

### 2.3 Pruebas requeridas (definir/actualizar; no ejecutadas)

- Store existente válido: owner y revisión se leen; bytes y revisión permanecen idénticos.
- Store ausente: NOT_FOUND; el destino y sus padres permanecen sin crear; no aparece lock ni temporal.
- Store corrupto/incompatible: falla sin leer legacy ni sustituir el archivo.
- Opciones con legacyMemory o allowEmptyInitialization: rechazadas como opciones desconocidas/inválidas, no ignoradas.
- Bootstrap vacío: sigue su propio contrato y no devuelve owner/store.
- Tests de migración existentes: separar los casos que prueban importación real (deben llamar únicamente al API explícito de migración) de los numerosos casos que usan legacyMemory solo como fixture de semilla (deben inicializar snapshots de test directamente mediante store.initialize o helper de test). No borrar cobertura ni convertir PREPARED en terminal.
- Búsqueda estática: ninguna apertura ordinaria inicializa ni llama projectNexoContinuitySnapshot.

## 3. D4 — cierre de capacidad de escritura

### 3.1 Superficie confirmada

- continuity-service.mjs devuelve { store, owner, current }.
- scripts/nexo-repair-entrypoint.mjs recibe store y lo pasa a settlement en dos puntos.
- scripts/nexo-repair-settlement.mjs carga snapshot, cambia journal y llama directamente store.commitIfCurrent.
- createNexoContinuityOwner ya captura loadCurrent y commitIfCurrent en cierres privados. reconcilePrepared es owner-owned y bloquea repair con NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED.

### 3.2 Delta de implementación

1. Una vez que D1 esté estable, el resultado público del service será { owner, current }; no incluir store.
2. Eliminar store de la firma/validación de runNexoRepairOnce y retirar sus dos propagaciones a settlePreparedRepairFromPersistedState.
3. La ruta auxiliar de settlement queda bloqueada/inaccesible bajo M0 Option A. No sustituirla por un método owner permisivo ni reubicar su commit directo dentro del owner. No despachar repair.
4. Retirar la exportación/capacidad invocable del settlement externo o convertir la ruta fuera de M0 en un bloqueo explícito sin escritura. La revisión encontró que runNexoRepairSession → runNexoRepairOnce puede despachar si se invoca directamente con owner+store, aunque runNexoRuntimeRepairSession bloquee por Option A. Por tanto, Option A no debe describirse como bloqueo universal mientras esa API auxiliar siga exportada y operativa. Elegir el cambio mínimo compatible con el alcance M0; no borrar historial PREPARED ni alterar su semántica.
5. La composición interna puede seguir creando store y pasándolo al constructor del owner. La meta no es prohibir el módulo físico de store dentro del proceso, sino impedir que capas de aplicación/entrypoints reciban una capacidad genérica de commit.
6. No reescribir continuity-owner.mjs como clase #store: el patrón de cierres actual ya oculta la referencia y no se ha demostrado que sea el defecto.
7. No añadir force, timeout rollback/commit, RepairExecuted, recovery/replay genérico, ni una nueva API de settlement.

### 3.3 Pruebas requeridas (definir/actualizar; no ejecutadas)

- Resultado de apertura no tiene propiedad store ni alias equivalente.
- Owner no expone commitIfCurrent, commit, updateSnapshot ni mutador genérico.
- Entry point repair no acepta store ni lo propaga.
- Settlement externo no puede realizar persistencia bajo M0 Option A.
- Inventario estático de imports/llamadas: ningún script, adapter o aplicación fuera de composición/owner importa el factory del store o llama commitIfCurrent directamente.
- reconcilePrepared conserva ownership, gates y resultado UNKNOWN.
- PREPARED persiste como obligación no resuelta; no se borra ni resuelve por tiempo; no hay redispatch automático.
- Confirmar que el runtime de producto continúa bloqueando repair por Option A.

## 4. D5 — tratamiento de PR #110

PR: https://github.com/snowdenxrp/aldea-ia/pull/110

Último estado consultado en esta sesión: OPEN / DRAFT / no merged; head 572fe085abc11c625d13beb4885a74da2d7ffd95; base reportada 4d6432cd74af7c24c15b5a3c4bd1dbb79f181bc8; CI run 40972888688 successful en el head exacto según el registro existente.

- No duplicar su trabajo.
- No fusionar en este paquete.
- Antes de integración, comparar la base actual 31ae3e91c749255af153675229dbb64ca06a581c con la base registrada en el PR, resolver cualquier drift/conflicto y volver a verificar CI sobre el SHA resultante.
- El CI del PR no acredita runtime Android, control de writers ni gates FB-03/FB-04.
- D5 no se cierra en la rama base mientras el PR no esté integrado y el SHA resultante no esté verificado.

## 5. Orden de ejecución

**Fase 0 — preflight de cambios (solo lectura):**
1. Capturar HEAD y blob SHAs del branch objetivo.
2. Enumerar callers/imports de openNexoContinuityOwner, createNexoContinuityStore, commitIfCurrent, runNexoRepairOnce y settlePreparedRepairFromPersistedState.
3. Enumerar tests que dependen de legacy/empty-init y separar los tests de migración histórica.
4. Confirmar que el diff propuesto no toca Chronicle/FB-02, workflows, bootstrap real, root ni entorno.

**Fase 1 — D5:** reconciliar PR #110 con base vigente e integrarlo solo tras decisión de autoridad específica. Es dependencia previa: assistants.mjs y simulate.mjs aún llaman open con legacyMemory/allowEmptyInitialization en la rama base; el PR los retira sin duplicar ese trabajo. Verificar CI ligado al SHA integrado.

**Fase 2 — D1:** con los launchers Lúmina desacoplados, implementar open-existing estricto y extraer la migración legacy a API explícita separada; adaptar fixtures/tests sin perder cobertura. No ejecutar tests hasta autorización de ejecución.

**Fase 3 — D4:** retirar store del resultado público; cerrar/inutilizar la ruta auxiliar de settlement y las APIs de repair de bajo nivel para M0 Option A; pruebas estáticas/negativas. No activar repair.

**Fase 4 — evidencia:** revisar diff, imports, archivos afectados y resultados de tests/CI autorizados. Registrar cada estado como IMPLEMENTED / TESTED / CI / DEVICE, sin mezclarlos.

## 6. Límites invariables

- No modificar semántica de PREPARED ni tratar vencimiento temporal como prueba de resultado.
- No redespachar desde PREPARED desconocido o ambiguo.
- No convertir UNKNOWN en PASS.
- No inferir autoridad de estructura, flags, caller, CI o ausencia de errores.
- No ejecutar bootstrap ni publicar Continuity.
- No seleccionar Android app, Termux, launcher, filesystem ni primitiva no-replace.
- No cerrar FB-01/FB-03/FB-04/FB-05/FB-06/FB-07 con este trabajo.
- No modificar Chronicle ni reabrir FB-02 sin contradicción concreta.
- No ejecutar tests, CI/Actions, scripts del proyecto ni comandos POCO sin autorización de ejecución específica.

## 7. Estado al emitir este paquete

- D1: defecto confirmado; implementación pendiente.
- D4: bypass externo confirmado; implementación pendiente.
- D5: implementación candidata + CI PASS en PR #110; no integrada.
- M0: INCOMPLETO.
- FB-01 OPEN/UNKNOWN; FB-02 PASS/CERRADO solo en alcance/SHA previamente validado; FB-03 OPEN/UNKNOWN; FB-04 OPEN/UNKNOWN; FB-05/P-05 NO RATIFICADA; FB-06/FB-07 OPEN.
- Root PENDING/UNKNOWN; authorization NOT_EVALUATED; First publication STOP; Protected effects STOP.

**Trabajo de este documento:** preparación técnica documental. No modifica runtime, tests, workflows ni configuración. No ejecuta tests, CI/Actions, scripts, bootstrap, comandos POCO ni efectos protegidos.


## 8. Preflight estático adicional (2026-10-31)

Inspección de los 12 módulos .mjs de scripts y de los tests Nexo más directamente relacionados. No se ejecutó ningún test.

### 8.1 Dependencia de orden D5 → D1

- En la rama base, scripts/assistants.mjs llama openNexoContinuityOwner con legacyMemory y allowEmptyInitialization.
- scripts/simulate.mjs también llama openNexoContinuityOwner con legacyMemory y allowEmptyInitialization.
- El PR #110 retira esas aperturas de Continuity de ambos launchers. Por ello, **D5 debe integrarse antes de endurecer la firma D1**, o ambas modificaciones deben coordinarse en un único cambio sin duplicar el PR. Si D1 se aplica primero sobre la base actual, rompe los launchers ordinarios.
- scripts/nexo-continuity.mjs solo reexporta open y bootstrap. scripts/nexo-chronicle-session.mjs no contiene llamada directa al service en la inspección dirigida.
- La búsqueda REST de GitHub Code Search devolvió cero resultados para los símbolos consultados y no se toma como inventario exhaustivo. El inventario de scripts es de lectura directa de los 12 módulos listados por el árbol del repositorio.

### 8.2 Impacto sobre tests

- tests/nexo/continuity-migration.test.mjs tiene 38 referencias a openNexoContinuityOwner y 44 referencias a legacyMemory en el archivo inspeccionado. El primer bloque prueba migración real; muchas secciones posteriores usan legacyMemory para sembrar escenarios de owner/Chronicle. No deben tratarse todas como tests de migración.
- tests/nexo/continuity-service-options-input-guard.test.mjs verifica accessors, opciones heredadas y actualmente la creación por legacyMemory; deberá separar el contrato de open-existing del API explícito de migración.
- tests/nexo/chronicle-runtime.test.mjs usa open y también createNexoContinuityStore directamente; parte de los tests deben conservarse con stores de fixture explícitos.
- tests/nexo/repair-owner-lifecycle.test.mjs, repair-session.test.mjs, repair-mission-verification.test.mjs y repair-settlement-crash-cuts.test.mjs importan rutas de repair de bajo nivel y/o pasan store directamente. Esos tests describen un protocolo auxiliar más amplio que el runtime Option A. No prueban que Option A cierre todas las rutas.
- scripts/nexo-repair-session.mjs también exige store.loadCurrent y store.commitIfCurrent y llama runNexoRepairOnce. No limitar D4 a nexo-repair-entrypoint: revisar esta API hermana y los módulos repair relacionados.
- La revisión dirigida encontró que tests/nexo/repair-session.test.mjs invoca directamente runNexoRepairSession con owner+store y espera settlement completado; por ello existe una ruta programática de bajo nivel capaz de despachar fuera de runNexoRuntimeRepairSession. Esto debe reflejarse como superficie auxiliar real, sin afirmar que el launcher de producto la invoque actualmente.
- tests/nexo/repair-settlement-crash-cuts.test.mjs y repair-owner-lifecycle.test.mjs dependen de commitIfCurrent directo para inyectar fallos/cortes. Preservar su valor como pruebas de protocolo solo si el protocolo queda explícitamente fuera de M0 y sin ruta de ejecución M0; de lo contrario, reemplazar por pruebas negativas del bloqueo, no relajar el gate.

### 8.3 Consecuencia para D4

D4 debe cerrar la capacidad en toda la cadena de entrada, no solo ocultar store en el resultado del service:
1. scripts/nexo-repair-entrypoint.mjs;
2. scripts/nexo-repair-session.mjs;
3. scripts/nexo-repair-settlement.mjs;
4. cualquier launcher o adapter que pueda invocar esos módulos;
5. pruebas que actualmente demuestran dispatch/settlement en la ruta auxiliar.

La corrección no es mover commitIfCurrent al owner. Bajo M0 Option A, el resultado correcto es no-dispatch/STOP y ninguna mutación de settlement desde rutas de aplicación. PREPARED y UNKNOWN permanecen preservados.

**Límite:** esta inspección cubrió módulos de scripts y tests Nexo seleccionados desde el árbol actual y lectura dirigida de archivos. No es prueba de inventario de todo el proceso en tiempo de ejecución ni de writers ambientales; FB-03/FB-04 permanecen OPEN/UNKNOWN.
