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
3. No implementar ni activar migración legacy en este paquete. Conservar projectNexoContinuitySnapshot y sus validadores sin borrarlos; la ruta de migración se mantiene fuera del flujo M0 y no se invoca desde open/bootstrap/Lúmina. Antes de exponer una operación migratoria pública separada se necesita contrato y autorización propios.
4. Inventariar todos los callers de openNexoContinuityOwner en el commit objetivo antes de cambiar firmas. Adaptar cada caller a open-existing o bootstrap explícito; no conservar flags de compatibilidad que reintroduzcan creación implícita.
5. Mantener un código único y estable para NOT_FOUND. No capturar NOT_FOUND para crear estado.

### 2.3 Pruebas requeridas (definir/actualizar; no ejecutadas)

- Store existente válido: owner y revisión se leen; bytes y revisión permanecen idénticos.
- Store ausente: NOT_FOUND; el destino y sus padres permanecen sin crear; no aparece lock ni temporal.
- Store corrupto/incompatible: falla sin leer legacy ni sustituir el archivo.
- Opciones con legacyMemory o allowEmptyInitialization: rechazadas como opciones desconocidas/inválidas, no ignoradas.
- Bootstrap vacío: sigue su propio contrato y no devuelve owner/store.
- Tests de migración existentes: conservar y adaptar al entrypoint explícito correspondiente solo cuando ese entrypoint tenga contrato; no borrarlos ni convertir PREPARED en terminal.
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
4. Retirar la exportación/capacidad invocable del settlement externo o convertir la ruta fuera de M0 en un bloqueo explícito sin escritura. Elegir el cambio mínimo compatible con los callers comprobados; no borrar historial PREPARED ni alterar el runtime de producto ya bloqueado.
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

**Fase 1 — D1:** implementar API open-existing; adaptar callers autorizados; escribir pruebas negativas. No ejecutar tests hasta autorización de ejecución.

**Fase 2 — D4:** retirar store del resultado público; bloquear la ruta auxiliar de settlement; pruebas estáticas/negativas. No activar repair.

**Fase 3 — D5:** reconciliar PR #110 con base vigente; integración solo tras decisión de autoridad específica; verificar CI ligado al SHA integrado.

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
