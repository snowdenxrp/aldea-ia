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
