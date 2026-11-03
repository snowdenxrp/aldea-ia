# NCS M0 — P01-G: reconciliación con contratos canónicos Core y delimitación RE-01/RE-02

Fecha: 2026-11-02
Rama: `ncs-lumina-decoupling-2026-10-29`
Base documental: HEAD `6976a11d4d7a85c3700b595aa14e9ce1866d3638`
Tipo: análisis documental y especificación candidata; sin implementación
Ejecución: no runtime, tests, CI, bootstrap, publicación real ni cambios del dispositivo.

## 1. Decisión ratificada que se está aplicando

El propietario ratificó P01-G para la primera creación de Continuity M0 como persistencia operacional local no autoritativa (P01-A=L). La fuente normativa de esa operación puede ser una autorización operacional humana explícita, única y acotada, separada de la autoridad constitucional.

La ratificación cubre la regla de autorización para una futura operación concreta. No es todavía la aprobación de una instancia/destino/SHA/snapshot reales y no constituye autorización de ejecución.

## 2. Contratos canónicos inspeccionados

- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_ATTACK_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` y su ataque
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md` y su ataque
- `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md`

## 3. Hallazgos y compatibilidad

### 3.1 No reutilizar Constitution Authority Context para P01-G

El contrato define ese contexto como el mínimo contexto protegido mediante el cual Core reconoce el régimen constitucional para una vinculación posterior de Policy. Debe establecerse desde una base de confianza ya reconocida; no puede construirse desde declaraciones del caller.

La auditoría de reutilización está cerrada con el resultado: no se encontró un mecanismo Core actual que establezca ese contexto. El gate de efectos futuros ordena detener implementación hasta definir la base de confianza reconocida.

**Conclusión:** el contexto constitucional no es el mecanismo de autorización de esta escritura L. Reutilizarlo aquí ampliaría su semántica y fingiría que existe una raíz constitucional implementada. No se crea ni se invoca un Constitution Authority Context para el bootstrap L.

### 3.2 La regla P01-G no establece una Genesis Trust Foundation

Los contratos Genesis/Bootstrap separan explícitamente trust foundation, Constitución, identidad, policy, autoridad de misión y ejecución. El repositorio no declara implementada una base genesis externa/reconocida. Un store protegido, hash, snapshot, firma o resultado local no puede autoestablecer esa raíz.

**Conclusión:** la autorización operacional humana ratificada no puede promoverse a Genesis Trust Foundation, raíz legítima, ROOT_READY ni autoridad constitucional. El bootstrap L no debe escribir ni presentar esos estados.

### 3.3 Compatibilidad limitada con la arquitectura MASTER

MASTER separa PROPOSAL → DELIBERATION → AUTHORIZATION → EXECUTION → VERIFICATION y exige que la aprobación humana se vincule a la operación exacta, parámetros normalizados, target, scope, evidencia, policy, epoch, riesgo, expiración, nonce y versión de UI. También prohíbe que cognición/memoria/modelo se auto-concedan autoridad.

La ratificación P01-G establece la regla de clase; no sustituye la aprobación concreta de la operación. La compatibilidad requiere una confirmación humana separada, antes de escribir, después de mostrar el tuple exacto de la operación. Esta confirmación es una ceremonia operacional bajo R1, no un claim criptográfico ni un campo que el caller pueda auto-certificar.

El riesgo de suplantación por proceso malicioso del mismo UID está excluido por el modelo R1 aceptado; no se presenta como mitigado criptográficamente por el CLI. Si el modelo ambiental R1 deja de cumplirse, STOP.

## 4. Regla de diseño resultante — sin autoridad paralela

Para una futura invocación concreta, la frontera operacional debe:

1. Ser iniciada manualmente por el propietario en una sesión interactiva Termux foreground bajo R1.
2. Recibir únicamente los parámetros explícitos necesarios para la API existente: raíz explícita y ruta relativa; no aceptar un campo `authorized`, `ownerApproved`, `authority`, token o equivalente como prueba de autorización.
3. Resolver y validar la raíz y el destino efectivo mediante el contrato/API existente; no aceptar una ruta efectiva declarada por el caller como verdad.
4. Antes de cualquier escritura, mostrar una representación inequívoca del objeto L, raíz canónica, ruta relativa, destino efectivo, SHA de código/contrato y snapshot inicial exacto, además de la ventana y límites terminales.
5. Requerir una acción humana explícita posterior a esa presentación para esa tupla exacta. Si el destino cambia, la presentación se invalida y debe detenerse/reiniciarse la deliberación; no se reutiliza la aprobación.
6. Verificar las precondiciones ya definidas: ausencia real diferenciada de corrupción/lectura fallida/temporal/lock ambiguo; preservar cualquier objeto existente o estado incierto; no sobrescribir ni reintentar ante resultado incierto.
7. Ejecutar únicamente la inicialización exclusiva ya implementada, si todas las condiciones son demostrables; finalizar inmediatamente y no devolver owner operacional ni continuar a Chronicle, admisión, PREPARED, dispatch, reconciliación ni mutaciones de dominio.
8. No escribir autorización, autoridad constitucional, ROOT_READY ni provenance autoafirmada dentro del objeto creado.

La acción interactiva no crea un nuevo rol/credencial/raíz ni demuestra identidad criptográfica. Es el acto operacional del propietario dentro del modelo R1. No usar un flag/argumento del proceso como sustituto de esa acción.

## 5. RE-01 — invocación M0 identificable

Estado actual: UNKNOWN / NOT IMPLEMENTED.

Requisito de cierre:
- Debe existir un único launcher M0 identificable, separado de Chronicle/operación normal.
- Debe invocar solo la API dedicada `bootstrapNexoContinuityStore()` con raíz y ruta relativa explícitas.
- Debe exponer antes de escribir la presentación completa de la operación y solicitar la confirmación humana concreta.
- Debe ser terminal: no owner operacional, no continuación de flujo y no efectos.
- La ruta de ejecución debe ser observable en la sesión Termux prevista; no inferir que un script Node disponible equivale a launcher desplegado.
- No debe aceptar autoridad declarada por caller ni crear una autoridad paralela.

No se propone todavía nombre de comando, nueva API ni interfaz concreta: se debe inspeccionar el entrypoint y contrato existentes al preparar implementación. No implementar bajo esta nota.

## 6. RE-02 — vínculo raíz explícita → destino efectivo

Estado actual: UNKNOWN / NOT CLOSED.

Requisito de cierre:
- La raíz explícita debe ser un input de la invocación, no un default oculto.
- La ruta relativa debe ser fija/permitida por el contrato del objeto; no debe convertirse en path absoluto arbitrario aceptado del caller.
- La frontera debe derivar el destino efectivo desde la raíz canónica y la ruta relativa usando la misma resolución que utiliza la operación de escritura.
- El destino presentado al propietario debe ser exactamente el destino que recibirá la escritura; no mantener dos cálculos divergentes.
- Deben mantenerse las guardas ya existentes de symlink/path/temp y la inicialización exclusiva; no inferir que eliminan TOCTOU o writers no cooperativos.
- Cualquier discrepancia, cambio de raíz, path ambiguo, symlink, estado previo no ausente o error de resolución => STOP/UNKNOWN sin escritura.
- El expediente de instancia debe fijar raíz, ruta relativa, destino efectivo, snapshot inicial, SHA y ventana antes de una aprobación concreta.

No se selecciona en este documento una ruta real del POCO ni se afirma que exista un destino válido ya verificado.

## 7. Límites y estado

- P01-G: RULE RATIFIED BY OWNER; reconocimiento operacional de la invocación aún no implementado.
- RE-01/RE-02: UNKNOWN / NOT CLOSED.
- E2/E3: PARTIAL / NOT CLOSED; evidencia puntual no demuestra una ventana futura de publicación.
- E4: NOT READY.
- Raíz legítima constitucional: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`.
- Primera creación/publicación real: STOP hasta que launcher, destino, precondiciones y aprobación concreta estén demostrados.
- Commissioning y efectos protegidos: STOP.
- NCS M0: INCOMPLETO.

## 8. Siguiente acción finita

Preparar un diff de diseño para RE-01/RE-02 contra la API y entrypoints actuales, limitado al launcher terminal y a un único cálculo compartido del destino efectivo. Antes de implementar, presentar la propuesta exacta para autorización técnica separada. No ejecutar tests/CI, bootstrap ni acciones en el dispositivo sin autorización independiente.


## 9. Inspección estática de la implementación existente — RE-01/RE-02

Archivos inspeccionados en la rama del PR:
- `src/nexo/core/continuity-service.mjs`
- `src/nexo/core/continuity-store.mjs`
- `scripts/nexo-continuity.mjs`
- `scripts/nexo.mjs`

Hallazgos:

1. `bootstrapNexoContinuityStore(options)` ya valida una raíz absoluta explícita y una ruta relativa normalizada; canonicaliza la raíz con `realpath`, rechaza symlinks en raíz/componentes padre, verifica contención, examina nombres temporales reservados y llama a `initializeExclusive(emptySnapshot())`.
2. La API ya limita las opciones a `root`, `relativePath`, `lockDeadline` y `lockWaitMs`; no acepta `legacyMemory`, no devuelve owner operacional y termina tras la inicialización.
3. La API devuelve `destination` junto al resultado **después** de ejecutar `initializeExclusive`. Por ello, hoy no puede usarse directamente para presentar el destino efectivo y obtener confirmación humana antes de escribir.
4. `scripts/nexo-continuity.mjs` es solo un re-export. `scripts/nexo.mjs` no tiene comando bootstrap y su router actual expone Chronicle/status/mission previews; no debe ampliarse con una ruta que despache Chronicle.
5. `createNexoContinuityStore.initializeExclusive()` vuelve a comprobar el destino y publica con `COPYFILE_EXCL`, bajo lock cooperativo. La comprobación previa de existencia y la publicación siguen sin constituir exclusión global ni eliminar TOCTOU.
6. La resolución actual vive dentro de `bootstrapNexoContinuityStore`; si un launcher calcula por separado un destino para mostrarlo, existirían dos cálculos susceptibles de divergencia.

### Implicación técnica concreta

Para satisfacer RE-01/RE-02 sin duplicar resolución, el candidato mínimo a evaluar es extraer la resolución/validación actual a una función pura o de preflight compartida, por ejemplo una función interna reutilizada por:
- una operación de inspección que devuelve únicamente la raíz canónica, ruta relativa y destino efectivo, sin escribir; y
- `bootstrapNexoContinuityStore`, que vuelve a resolver/revalidar en el momento de la escritura y usa el mismo contrato de resolución.

El nombre/API anteriores son ilustrativos, no decisión de diseño ni autorización. La previsualización no debe reservar ni crear archivos, locks o directorios; tampoco debe afirmar que el destino permanecerá libre. Después de la confirmación, el bootstrap debe volver a validar estado y destino. Cualquier cambio o ambigüedad produce STOP.

El launcher no debe usar `scripts/nexo.mjs` si ello implica mezclar bootstrap con el router de operación normal. Candidato más acotado: un entrypoint M0 dedicado que importe solo la API bootstrap y el resolver compartido, lea confirmación interactiva, invoque una vez y termine. El nombre y forma exactos quedan pendientes del diff técnico.

### Casos que el diseño debe preservar

- La confirmación es para la tupla mostrada (raíz canónica, ruta relativa, destino, SHA, snapshot inicial y ventana), no para un flag suministrado al proceso.
- El bootstrap debe recalcular y comparar la tupla antes de escribir; una diferencia invalida la confirmación.
- Un destino existente, corrupto, symlink, temporal reservado, lock ambiguo, padre inaccesible o cualquier error de lectura/resolución no se interpreta como ausencia.
- No retry automático ni recuperación automática de un resultado UNKNOWN.
- La previsualización nunca llama a `initializeExclusive`, `openNexoContinuityOwner`, Chronicle, admisión, PREPARED, dispatch ni reconciliación.
- La API de bootstrap conserva su resultado explícito y no transforma un error de cleanup/lock en éxito.

## 10. Siguiente propuesta técnica a preparar

Un diff de diseño, aún no aplicado, con alcance máximo:
1. extraer el cálculo canónico del destino a una función compartida sin cambiar la semántica de validación existente;
2. exponer un preflight estrictamente read-only para mostrar la tupla antes de escritura;
3. crear un launcher aislado, manual/foreground, con confirmación interactiva exacta y una única llamada final a bootstrap;
4. repetir resolución y precondiciones dentro de la operación de escritura para evitar confiar en el preflight como reserva;
5. pruebas de contrato que demuestren separación preflight/bootstrap, no owner, no dispatch, no overwrite y STOP ante cualquier diferencia.

Este documento no autoriza ese diff, cambios runtime, pruebas, CI ni ejecución en POCO. Se requiere autorización técnica separada.


---

## 11. Implementación RE-01/RE-02 — revisión técnica autorizada (2026-11-02)

Autorización del propietario: implementación técnica RE-01/RE-02 con el alcance y límites descritos en esta reconciliación.

### RE-01 — invocación M0 identificable

**IMPLEMENTED** en scripts/nexo-continuity-bootstrap.mjs:
- Entry point dedicado; no se añadió un comando al router scripts/nexo.mjs.
- CLI manual que exige stdin y stdout TTY. Pipe/no-TTY → NEXO_CONTINUITY_BOOTSTRAP_INTERACTIVE_TERMINAL_REQUIRED, sin invocar escritura.
- Solo acepta --root y --relative-path; rechaza opciones duplicadas, ausentes o desconocidas.
- Ejecuta preflight read-only, presenta raíz canónica, ruta relativa, destino efectivo, snapshot inicial, ventana y SHA-256 de la operación.
- Requiere escribir exactamente PUBLICAR <SHA-256>. La ventana de aprobación es una sola invocación foreground, con expiración de cinco minutos.
- Tras la llamada de bootstrap, el proceso termina. No importa Chronicle, admisión, PREPARED, dispatch, reconciliación ni runtime de Lúmina.
- package.json registra nexo:continuity:bootstrap; el lanzador queda clasificado como raíz Nexo en m0-import-graph-guard.test.mjs.

### RE-02 — raíz explícita y destino efectivo

**IMPLEMENTED** en src/nexo/core/continuity-service.mjs:
- Se extrajo resolveBootstrapInputs() como resolución compartida por preflight y bootstrap.
- preflightNexoContinuityBootstrap() es read-only: no crea archivos, directorios, locks ni reservas.
- Conserva las guardas existentes de raíz absoluta explícita, realpath, symlink de raíz/componentes padre, contención, path relativo normalizado y artefactos temporales reservados.
- El preflight bloquea destino existente y lock existente/ambiguo.
- Después de la confirmación, bootstrapNexoContinuityStore() vuelve a resolver y validar; exige que expectedDestination coincida exactamente con el destino canónico presentado. Discrepancia → NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_CHANGED, antes de inicializar.
- La operación sigue usando initializeExclusive(emptySnapshot()); no acepta legacyMemory, no crea ni devuelve owner operacional y conserva el resultado explícito del store.
- El hash de aprobación usa el schema/version canónicos de Continuity y liga root, relativePath, destination, snapshot vacío y ventana temporal.

### Correcciones encontradas durante CI

- Primer CI: el nuevo entrypoint no estaba clasificado en el inventario explícito de scripts Nexo. Se añadió a productRoots del guard de import graph.
- Segundo CI: el test asignaba al parser de argumentos una validación de traversal que corresponde al preflight. Se movió la expectativa a preflightNexoContinuityBootstrap().
- El handler de errores inesperados del launcher no afirma writeAttempted: false; informa writeAttempted: UNKNOWN para no ocultar un posible estado posterior al inicio de escritura.

### Evidencia de validación

- Rama: ncs-lumina-decoupling-2026-10-29.
- SHA validado: a8de84deeeb4e28cf22a5b40c182143d49754293.
- GitHub Actions: NCS Lúmina Decoupling Validation, run 41520427582 — **SUCCESS**.
- El workflow ejecutó regresión focalizada y npm test completo con Node.js 22.
- Evidencia en logs: “NCS M0: all Nexo scripts are classified...” y “Nexo M0 bootstrap preflight and launcher contract tests passed.”; el job terminó success.
- Pruebas incluyen preflight sin escrituras, destino existente, lock existente, traversal rechazado, pipe/no-TTY bloqueado, mismatch de destino fail-closed y una inicialización en directorio temporal de fixture.
- Esta evidencia es CI de software. No es validación del POCO/Termux ni de la ventana operacional real.

### Límites y gates conservados

- La re-resolución y comparación de path no elimina TOCTOU ni protege frente a escritores no cooperativos; no se afirma que el lock sea global.
- El TTY y el launcher no son una frontera criptográfica contra procesos maliciosos con el mismo UID; esa clase continúa excluida por R1. Si R1 deja de cumplirse, STOP.
- No se ha probado el launcher en Termux ni se ha fijado un destino real del POCO.
- El fixture de CI creó un archivo temporal aislado únicamente como prueba contractual. **No** se ejecutó bootstrap real ni se creó/publicó Continuity productiva.
- P01-G sigue siendo regla ratificada, no aprobación de una instancia concreta.
- E2/E3 PARTIAL / NOT CLOSED; E4 NOT READY.
- authorization: NOT_EVALUATED; raíz constitucional PENDING/UNKNOWN.
- Primera creación/publicación real, commissioning y efectos protegidos: STOP.
- NCS M0: INCOMPLETO; PR #110 continúa OPEN / DRAFT / NOT MERGED.

La propuesta de las secciones anteriores queda superada en cuanto a implementación RE-01/RE-02. Sus límites y requisitos normativos no quedan anulados.

---

## 12. Evidencia POCO/Termux posterior — preflight real cancelado (2026-11-02)

Esta sección supersede las frases anteriores que indicaban que el launcher no se había probado en Termux o que el destino real no estaba fijado. No cambia E2/E3 ni autoriza publicación.

El propietario ejecutó manualmente en una sesión interactiva Termux:
`node scripts/nexo-continuity-bootstrap.mjs --root "$HOME" --relative-path .nexo-continuity.json`.

El launcher presentó raíz canónica `/data/data/com.termux/files/home`, ruta relativa `.nexo-continuity.json`, destino efectivo `/data/data/com.termux/files/home/.nexo-continuity.json`, snapshot NEXO_CONTINUITY v1 vacío, ventana `2026-11-02T22:59:14.486Z`–`2026-11-02T23:04:14.494Z` y SHA-256 `b8a44d37b957d6e8b91c38df81dcf288dfaf839bbd582e735ff1110452f0d941`.

El propietario introdujo `CANCELAR`. Respuesta literal: `{"status":"blocked","code":"NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED","writeAttempted":false}`.

### Clasificación
- RE-01: IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX. La invocación manual foreground con TTY llegó a la presentación de confirmación y terminó por cancelación.
- RE-02: IMPLEMENTED / CI-VERIFIED / REAL-DESTINATION PREFLIGHT EXERCISED. Raíz explícita, ruta relativa y destino canónico fueron presentados y vinculados en una ejecución real no publicadora.
- La cancelación confirma que no se intentó escribir en esta ejecución. No prueba inicialización, contenido persistido ni lectura independiente posterior del destino.
- E2/E3 permanecen PARTIAL / NOT CLOSED: la sesión cancelada no constituye ventana de publicación y no demuestra quiescencia sostenida ni prevención de relanzamiento.
- E4 permanece NOT READY hasta completar la evaluación de propiedades del destino y precondiciones aplicables a la instancia.

P01-G continúa RULE RATIFIED BY OWNER; no existe aprobación de esta instancia para publicar. `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; primera publicación, commissioning y efectos protegidos STOP; NCS M0 INCOMPLETO; PR #110 OPEN / DRAFT / NOT MERGED.

No se repitió launcher. No se creó ni leyó el archivo productivo. Sin cambios de runtime, tests, CI, workflows ni configuración del POCO.


---

## DELTA — RECONCILIACIÓN POSTERIOR A LA PRIMERA PUBLICACIÓN RESTRINGIDA (2026-11-02)

Esta delta es posterior a la sección 12. Conserva el registro histórico de la ejecución cancelada, pero actualiza el estado vigente tras una operación posterior autorizada y completada.

### Evidencia posterior que supersede el estado operativo de la sección 12

- El propietario autorizó una única inicialización vacía de Continuity M0 en el destino ratificado `$HOME/.nexo-continuity.json`. La autorización fue específica para esa instancia; no incluyó ROOT_READY, autoridad constitucional, commissioning, migración, admisión, PREPARED, dispatch, reconciliación ni efectos protegidos.
- El launcher dedicado se ejecutó desde una sesión Termux interactiva manual. Presentó raíz canónica `/data/data/com.termux/files/home`, ruta relativa `.nexo-continuity.json`, destino efectivo `/data/data/com.termux/files/home/.nexo-continuity.json`, snapshot vacío, ventana `2026-11-02T23:25:28.960Z`–`2026-11-02T23:30:28.968Z` y SHA de operación `2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`.
- El propietario introdujo la confirmación exacta `PUBLICAR 2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`. Resultado: `status=committed`, `storeRevision=0`, `authorization=NOT_EVALUATED`, `continuation=STOPPED`.
- Verificación independiente posterior, desde un proceso Node separado: ruta canónica exacta; archivo regular y no symlink; UID coincidente con Termux; modo `0600`; tamaño 283 bytes; SHA-256 del archivo `3a1d5f25f00c7ba0e030fe8b99dda074b48f9b7950bd80d8a86f46de36236a81`. El envelope `NEXO_CONTINUITY_STORE` v1 contiene `snapshot` `NEXO_OPERATIONAL_CONTINUITY` v1 con los cinco arrays vacíos.
- La delta vigente y evidencia detallada están registradas en `NEXO_NCS/STATUS.md` y `NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md`.

### Reconciliación de estados

- La sección 12 sigue siendo válida como registro histórico de la ejecución anterior que terminó en `CANCELAR`; no debe borrarse ni reinterpretarse como si describiera la operación posterior.
- Quedan supersedidas como afirmaciones del estado actual las frases de la sección 12 que indican que no existe aprobación de instancia, que no hubo publicación real o que E4 sigue NOT READY.
- RE-01 y RE-02: IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX; RE-02 fue usado con el destino real.
- Primera publicación restringida: COMPLETED, una sola vez. No repetir bootstrap, no reinicializar, no modificar, no borrar ni cambiar permisos del archivo real.
- E4: REAL-DESTINATION POST-WRITE OBJECT CHECK VERIFIED dentro del alcance observado. No se afirma fsync/durabilidad ante pérdida de energía, exclusión de escritores no cooperativos ni protección frente a procesos hostiles del mismo UID.
- E2 y E3: PARTIAL / NOT CLOSED. La publicación completada no demuestra retrospectivamente exclusividad sostenida de escritores ni prevención de relanzamiento durante toda la ventana. No elevar a PASS por inferencia.
- `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; `ROOT_READY` no establecido; commissioning STOP; efectos protegidos STOP; NCS M0 INCOMPLETO; PR #110 OPEN / DRAFT / NOT MERGED.

Esta actualización es documental. No modifica runtime, tests, workflows, configuración del POCO ni la instancia real de Continuity. No inicia una nueva ventana R1 ni autoriza operación posterior.
