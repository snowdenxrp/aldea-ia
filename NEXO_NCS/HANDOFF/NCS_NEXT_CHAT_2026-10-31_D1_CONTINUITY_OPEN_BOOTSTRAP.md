# NCS — HANDOFF SIGUIENTE CHAT
Fecha: 2026-10-31
Rama: ncs-clean-architecture
Repositorio: snowdenxrp/aldea-ia
Palabra de reanudación: **NCS**

## 0. Arranque obligatorio; no repetir investigación

Al comenzar el siguiente chat:
1. Leer NEXO_NCS/STATUS.md.
2. Leer NEXO_NCS/MASTER/CORE.md.
3. Leer este handoff.
4. Leer NEXO_NCS/BUILD/NCS_M0_D1_D4_D5_ARCHITECTURAL_SEPARATION_CONTRACT_2026-10-31.md.
5. Continuar directamente con el inventario final de consumidores D1 y el paquete mínimo de implementación.

No volver a auditar D4, D5, U-B06, Qwen ni PR #110 salvo contradicción concreta de SHA/evidencia. No iniciar auditoría general del repositorio. Si el estado remoto difiere, comprobar solo la diferencia concreta y registrar reconciliación.

## 1. Objetivo y reglas invariables

Cerrar **NCS M0**, no ampliar a M1/STEP 7. M0 permanece INCOMPLETO.

- Nexo no es el modelo, sistema operativo, dispositivo ni Lúmina.
- Los procesos ordinarios de Lúmina no deben abrir, crear, migrar ni escribir Nexo Continuity.
- UNKNOWN no es PASS: aplicar UNKNOWN-STOP.
- Distinguir PROPOSAL / IMPLEMENTED / TESTED / CI / DEVICE RUNTIME / DOCUMENTED.
- No afirmar ejecución, pruebas, commits o verificación sin evidencia directa.
- Owner constitucional = usuario. No inferir autoridad desde código, flags, caller, ausencia de archivo o éxito local.
- No seleccionar entorno Android/Termux/app, raíz ni primitiva de publicación por inferencia.
- PREPARED histórico se preserva como obligación no resuelta; nunca se convierte en permiso, se elimina ni se redespacha automáticamente.
- No timeout auto-rollback/commit, retries automáticos, force, validación relajada, replay genérico ni nuevos eventos/logs sin contrato y autoridad.
- authorization: NOT_EVALUATED; Root PENDING/UNKNOWN; primera publicación STOP; efectos protegidos STOP.

“Muy bien, continúa sin límites” autoriza autonomía dentro de límites ya concedidos; no es permiso general para cambiar runtime, pruebas, CI, workflows, dispositivo, bootstrap ni efectos protegidos.

## 2. Estado global de M0 al cierre

- M0: INCOMPLETO.
- D1: defecto confirmado; openNexoContinuityOwner puede inicializar desde legacyMemory o allowEmptyInitialization. Separación objetivo documentada; implementación pendiente.
- D2: exclusividad de first-create no demostrada; access → rename no demuestra no-replace.
- D3: lock mkdir/owner missing puede bloquear; fail-closed, con problema de liveness.
- D4: exposición de store y writer auxiliar de settlement confirmados; corrección pendiente.
- D5: PR #110 contiene implementación candidata y CI PASS, pero sigue OPEN/DRAFT/no merged; no cerrar en rama base.
- FB-01 OPEN/UNKNOWN (aplicabilidad de raíz/destino).
- FB-02 PASS/CERRADO solo en alcance y SHA previamente validados.
- FB-03 OPEN/UNKNOWN; E2/E3 UNKNOWN.
- FB-04 OPEN/UNKNOWN.
- FB-05/P-05 NO RATIFICADA.
- FB-06/FB-07 OPEN.
- Root PENDING/UNKNOWN.
- authorization: NOT_EVALUATED.
- First publication STOP; Protected effects STOP.

En este chat no se ejecutaron tests, CI/Actions, scripts, bootstrap, comandos POCO ni efectos protegidos.

## 3. Trabajo hecho en este chat

### 3.1 Recuperación documental
Se consultó GitHub en snowdenxrp/aldea-ia, rama ncs-clean-architecture.
- STATUS.md blob observado al inicio: 6406dbe856649629c2b57926468c50950de26a75.
- Se consultó el contrato NCS_M0_D1_D4_D5_ARCHITECTURAL_SEPARATION_CONTRACT_2026-10-31.md.
- STATUS ya recoge el dictamen Qwen D4, el estado PR #110 D5 y los estados globales.
- Se releyó tests/nexo/continuity-service-options-input-guard.test.mjs, blob 277cb0d2974609a85693bef27446a2f9f9b3d1da.
- Se releyó src/nexo/application/chronicle-append.mjs, blob c1964467d68043d06e035ad59720f8cec2e52e52.
- Se releyó src/nexo/application/continuity-queries.mjs, blob e1915e94e53e71d37a37952fead37ba62bdae79a.

### 3.2 D1: hecho confirmado y diseño recomendado
El servicio src/nexo/core/continuity-service.mjs ya se había inspeccionado en contexto previo (blob citado: 86b33409ca7150e45846c7c97a2d4b28780121e7). Comportamiento:
- bootstrapNexoContinuityStore(): operación dedicada para snapshot vacío; no recibe legacy y no devuelve owner.
- openNexoContinuityOwner(options): abre store, pero ante NOT_FOUND puede proyectar legacyMemory o inicializar vacío con allowEmptyInitialization; después devuelve {store, owner, current}.
- “open” no es apertura pura y puede crear/importar en flujo ordinario.

Diseño objetivo:
1. Apertura ordinaria solo abre y valida store existente. No llama initialize, no proyecta legacy, no crea directorios/locks/temporales y no hace fallback vacío.
2. Bootstrap separado: snapshot vacío, root/ruta relativa explícitos, sin owner operacional, migración, admisión, reconcile ni continuación.
3. Migración legacy separada, explícita y no invocable por open/bootstrap/Lúmina; no activar hasta contrato y autorización propios.
4. Store ausente, corrupto o incompatible => bloqueo; no fallback a legacy ni reemplazo.
5. PREPARED reconocido se preserva como obligación no resuelta; si no se puede validar identidad/significado, STOP sin alterar la fuente.

Recomendación de cambio mínimo: hacer estricta la función existente openNexoContinuityOwner en lugar de renombrarla por estilo, salvo que el contrato vigente del repo exija explícitamente un nombre nuevo. Retirar de sus opciones legacyMemory y allowEmptyInitialization. El retorno público sin store será además parte de D4 y debe coordinarse, sin mezclar commits. No mantener flags de compatibilidad que permitan creación implícita.

### 3.3 Pruebas negativas D1 propuestas; NO ejecutadas
- Store existente válido: devuelve owner/current sin cambiar bytes ni revisión.
- Destino ausente: bloquea y no crea archivo, directorio, lock ni temporal.
- Destino ausente + legacyMemory: rechaza sin leer/importar ni escribir.
- Destino ausente + allowEmptyInitialization: rechaza sin bootstrap.
- Store corrupto/incompatible + legacy presente: bloquea y no reemplaza/importa.
- Opciones con getters/accessors/prototipos no permitidos: rechaza antes de ejecutar getters o tocar filesystem.
- Bootstrap: snapshot vacío y resultado sin owner.
- PREPARED legacy: preservado como obligación; nunca eliminado, autorizado ni redispatch.
- Adaptar fixtures y consumidores que hoy dependan de inicialización implícita. No falsear tests con helper que llame open con flags viejos.

### 3.4 Test de guard existente
tests/nexo/continuity-service-options-input-guard.test.mjs actualmente:
- comprueba rechazo de accessor filePath antes de abrir;
- comprueba rechazo de accessor legacyMemory;
- comprueba rechazo de opciones heredadas;
- comprueba un caso exitoso de openNexoContinuityOwner que suministra legacyMemory a destino nuevo y espera loaded.
Ese último caso evidencia directamente que la API actual admite migración/creación desde apertura. El test no se ejecutó en este chat.

### 3.5 Chronicle
src/nexo/application/chronicle-append.mjs:
- valida opciones antes del guard;
- bloquea initializeContinuity:true con NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED antes de abrir stores/admitir/ejecutar;
- hace preflight de ambos stores antes de inicializar alguno;
- cuando Continuity falta y no se permite inicializar, bloquea con NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN.
No reinterpretar esto como autorización de bootstrap ni como cierre completo de D1. El guard Chronicle ya separa operaciones; el defecto de open ordinario sigue existiendo en el servicio y callers.

### 3.6 Consultas de solo lectura
src/nexo/application/continuity-queries.mjs crea stores y llama loadCurrent() para status/mission/plan/open loops/preview. En los fragmentos consultados no se observó escritura. Incluir estos callers en inventario estático para distinguir lectores legítimos de writers y evitar falsos positivos.

### 3.7 Límite de inventario
Se intentó un barrido programático de todos los archivos fuente para buscar openNexoContinuityOwner, allowEmptyInitialization y legacyMemory, pero la ejecución de herramientas alcanzó el límite de llamadas. **El barrido exhaustivo no se completó.** No afirmar que todos los consumidores están identificados. Esta es la primera tarea pendiente.

## 4. D4 — no repetir dictamen Qwen

Qwen reportó y el código verificó:
- nexo-repair-entrypoint.mjs recibe y propaga store.
- nexo-repair-settlement.mjs llama store.commitIfCurrent directamente: bypass externo real.
- reconcilePrepared NO es bypass externo: función interna del owner, usa cierres privados y bloquea repair con NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED.
- El owner ya es closure-based; no necesita reescritura como clase con #store.

Corrección mínima D4 ya fijada documentalmente:
1. El resultado del service no debe exponer store.
2. Quitar store del repair entrypoint y su propagación.
3. Settlement externo no debe poder escribir; reparación está excluida en M0 Option A.
4. Mantener reconcilePrepared owner-owned y los gates/UNKNOWN actuales.
5. Inventario estático de writers/importaciones directas.
6. Preservar PREPARED; no timeout auto-resolution.

No adoptar sugerencias Qwen de force, validación relajada, timeout auto-rollback/commit, RepairExecuted, recovery/replay genérico. No hay autorización para repair en M0.

## 5. D5 — PR #110; no duplicar

PR: https://github.com/snowdenxrp/aldea-ia/pull/110
- Título: NCS M0: decouple Lúmina launchers from Nexo Continuity.
- Estado último consultado: OPEN / DRAFT / no merged.
- Head: 572fe085abc11c625d13beb4885a74da2d7ffd95.
- CI run 40972888688: completed/success en SHA exacto; cuatro checks visibles success. PR reporta npm test completo.
- Elimina apertura Continuity desde assistants.mjs y simulate.mjs; assistants deja de registrar misión Nexo; memoria heredada nexoMemory queda opaca en round-trip y no se siembra en estado nuevo.
- No hay test e2e de proceso simulate que pruebe ausencia de creación.
- PR no integrado. No duplicar, editar ni mergear sin decisión/autorización del usuario. CI no es evidencia POCO.

## 6. Documentos canónicos y commits conocidos
- NEXO_NCS/STATUS.md: fuente de estado; blob observado en este chat 6406dbe856649629c2b57926468c50950de26a75.
- NEXO_NCS/MASTER/CORE.md.
- Contrato D1/D4/D5: NEXO_NCS/BUILD/NCS_M0_D1_D4_D5_ARCHITECTURAL_SEPARATION_CONTRACT_2026-10-31.md.
- Informe U-B06: NEXO_NCS/BUILD/NCS_M0_UB06_WORKFLOWS_AND_LEGACY_IMPORT_FINDINGS_2026-10-31.md.
- Síntesis entorno restringido: NEXO_NCS/BUILD/NCS_M0_RESTRICTED_ENVIRONMENT_CROSS_REVIEW_SYNTHESIS_2026-10-31.md.
- Commit contrato conocido: a7583d8d91c3e96043af70d24f7963a4e4413c6a (corrección Qwen D4).
- Commit STATUS previo conocido: 31ae3e91c749255af153675229dbb64ca06a581c; blob actual observado aquí cambió a 6406dbe856649629c2b57926468c50950de26a75. Consultar STATUS para HEAD exacto; no asumir que commits previos siguen siendo HEAD.
- PR #110 permanece como unidad separada.

## 7. Plan inmediato — continuar exactamente aquí

**Paso 1 (primero):** completar inventario exhaustivo read-only de consumidores en SHA actual:
- buscar referencias/importaciones de openNexoContinuityOwner, bootstrapNexoContinuityStore, allowEmptyInitialization, legacyMemory, createNexoContinuityStore, commitIfCurrent;
- clasificar por capa: service/composition, Nexo runtime, Chronicle, query/read-only, scripts, tests, Lúmina, workflows;
- anotar archivo + línea + intención (read/open/create/migrate/write).
No repetir D4 ni U-B06; ampliar solo si aparece una ruta no cubierta.

**Paso 2:** convertir inventario en lista exacta de cambios D1: service, callers, tests/fixtures. Mantener la API actual por nombre con semántica estricta como opción mínima; retirar legacy/empty-init de open. No preservar compatibilidad insegura.

**Paso 3:** preparar patch mínimo en rama de trabajo/PR separado solo cuando el usuario haya autorizado explícitamente modificaciones runtime. “Continúa sin límites” no sustituye autorizaciones específicas de código/tests/CI/efectos ya delimitadas.

**Paso 4:** tests D1 dirigidos solo con autorización. No ejecutar CI/Actions ni tests amplios sin autorización específica y SHA definido.

**Paso 5:** D4 después de D1 o en cambio separado, conservando Option A. D5 únicamente revisión/merge PR #110 tras autorización explícita; no duplicar.

## 8. Preguntas que NO se deben volver a abrir sin evidencia nueva
- ¿reconcilePrepared es bypass externo? No: ya verificado que es owner-internal.
- ¿Debe convertirse owner en clase con #store? No: patrón de cierres ya encapsula.
- ¿Agregar force, timeout auto-settlement, RepairExecuted o replay? No.
- ¿Repetir U-B06 / inspección de 28 workflows? No; informe existe y sus límites están documentados.
- ¿Duplicar D5? No; PR #110 ya contiene implementación candidata.
- ¿Cerrar M0 por CI Ubuntu o documentos? No.
- ¿Termux o app Android ya está elegido? No.
- ¿Ejecutar bootstrap/publicación o efectos protegidos? No; STOP.

## 9. Registro de cierre de este chat
Se hizo recuperación documental, relectura dirigida de D1/Chronicle/consultas y definición de paquete técnico D1. No hubo cambios de runtime, tests, workflows, CI, configuración, dispositivo, bootstrap ni efectos protegidos. El barrido exhaustivo de consumidores quedó incompleto por límite de herramientas; no ocultarlo ni darlo por completado.

**Siguiente punto único:** inventario exhaustivo D1, después parche mínimo. Mantener M0 como objetivo y no volver a empezar desde cero.
