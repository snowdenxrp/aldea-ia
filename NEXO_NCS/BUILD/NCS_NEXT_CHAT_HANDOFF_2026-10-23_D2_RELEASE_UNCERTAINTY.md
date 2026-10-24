# NCS — HANDOFF PARA NUEVO CHAT — 2026-10-23
## Punto exacto de continuidad tras revisión D2

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**Palabra de entrada para retomar:** `NCS`  
**Estado del documento:** checkpoint de continuidad; no es una decisión constitucional ni autorización de runtime.

## 1. Instrucciones obligatorias para el próximo chat

1. Al recibir exactamente `NCS`, no saltes directamente a investigaciones históricas ni repitas auditorías cerradas.
2. Ruta de entrada: `NEXO_NCS/STATUS.md → MASTER/CORE → BUILD → este handoff / trabajo actual`.
3. Lee primero este handoff y el checkpoint contractual más reciente antes de proponer trabajo:
   - [Cross-contract checkpoint D0/D1/D2/D3](NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md)
   - [D2 matrix de estados/transiciones](NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md)
   - [Opciones de bootstrap D0-C2](NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md)
   - [Nuevo análisis de cuarentena por release incierto](NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md)
4. No repitas el censo de callers, import graph o auditorías anteriores salvo que un SHA/snapshot nuevo muestre un cambio material.
5. No inventes IDs, estados, colas, locks globales, marcadores persistentes, retries, tombstones, wrappers transaccionales ni mecanismos externos para cerrar huecos. Cualquier mecanismo nuevo es una decisión de diseño que debe justificarse y aprobarse.
6. No trates “continúa sin límites” como aprobación de decisiones reservadas al propietario ni como autorización para modificar runtime/tests/workflows.
7. Mantén separado lo implementado y verificado de las propuestas documentales. No declares tests/CI ejecutados si no se ejecutaron, ni éxito por inferencia.
8. No hagas nuevos cambios de runtime ni escribas pruebas antes de cerrar los gates de diseño y obtener autorización separada.
9. No reescribas ciegamente `NEXO_NCS/STATUS.md` (archivo grande, historial de sincronización incompleto). Usa handoffs/addenda específicos y deja referencias verificables.
10. Si una escritura remota se intenta, verifica luego el archivo exacto, blob SHA y commit SHA. No declares persistencia si la herramienta no devolvió éxito y el archivo no puede releerse.

## 2. Estado canónico — no alterar por inferencia

- M0: `INCOMPLETO`.
- D0 / D1 / D2 / D3: `OPEN`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Autorización para efectos protegidos: no demostrada; efectos protegidos `STOP`.
- `RUNTIME_TARGET = NOT_DETERMINED`: no se ha documentado/seleccionado el runtime C objetivo; esto **no** demuestra que no exista un runtime.
- La vía de escritura documental por GitHub connector ha funcionado para varios archivos de BUILD, pero eso no equivale a checkout local, autorización de runtime, prueba CI ni legitimidad de la raíz.
- En esta revisión no se modificó runtime, tests ni workflows; no se ejecutaron tests/CI.

## 3. Trabajo realizado en la sesión más reciente

### 3.1 Lecturas verificadas

Se recuperaron los siguientes archivos de la rama `ncs-clean-architecture`:

- `NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md` — blob devuelto por la última lectura: `824050fc2827bf678514a7acdfe1921f2f2ffe48`.
- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md` — lectura previa identificó estados de root, lock, owner record, operación, persistencia, release y bootstrap parcial. Su SHA debe volver a comprobarse al continuar si se necesita precisión de contenido.
- `NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md` — comparación de cuatro opciones sin decisión del propietario: A) bootstrap offline con quiescencia demostrable; B) staging/publicación atómica; C) marcador persistente (no coordina concurrencia por sí solo); D) coordinación externa (introduce su propio problema de identidad/recuperación).
- `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md` — blob `a1804c3128692abb856f5169be5f8c21729508f3`.
- `NCS_M0_D2_INITIALIZATION_SEMANTICS_VS_TRIGGER_RECONCILIATION_2026-10-23.md` — blob `05599a912492b4ead93c50c0e753a62e6fe9027e`.
- `NCS_M0_D2_ROOT_READY_SEMANTICS_RECONCILIATION_2026-10-23.md` — blob conocido `36bc58655a12e9681fa52a4660dc3971e8467336`.

El checkpoint contractual incluye hallazgos sobre la ambigüedad de la interfaz de raíz D0-C1, alias/canonicalización D0-C3, primer bootstrap antes de existir un lock dentro de la raíz, y carrera check/use al retirar un lock.

### 3.2 Nuevo documento de análisis D2

Se creó y se releyó satisfactoriamente:

`NEXO_NCS/BUILD/NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md`

- Blob SHA verificado: `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- Trata el alcance de la cuarentena cuando el release del lock queda incierto y diferencia tres resultados:
  1. resultado de negocio/persistencia (confirmado, fallido antes de escribir o desconocido);
  2. resultado de liberación (confirmado, fallido o incierto);
  3. posibilidad de admitir operaciones nuevas (bloqueada mientras el lock/actor/estado sea ambiguo).
- Expone un riesgo contractual: si hay un segundo intento de `rm(path)`, un actor podría haber retirado/reemplazado el path entre intentos; no afirmar que haya ocurrido en runtime. Aplica también a limpieza tras fallo al crear/escribir `owner.json`.
- Propone pruebas deterministas de reemplazo, persistencia confirmada + release incierto, persistencia desconocida + release incierto, proceso competidor y recuperación con path ausente/ilegible/reemplazado.
- Es propuesta documental, no norma aprobada; no cambia runtime/tests/workflows y no ejecuta CI.

### 3.3 Alcance real del trabajo

No se editó el checkpoint existente en esta última operación ni se sincronizó `STATUS.md`. Este handoff es el nuevo punto de entrada y referencia el addendum que sí fue verificado. El checkpoint contractual previo tiene material histórico detallado, incluida la regla de que release incierto no permite retry automático de negocio y debe bloquear nuevas admisiones hasta una resolución segura.

## 4. Hallazgos técnicos que no deben perderse

### A. Primer bootstrap / D0-C2 + D2

El lock candidato está dentro de la raíz: `<root>/.nexo-instance.lock/`. La operación normal rechaza una raíz inexistente y solo bootstrap explícito podría crearla. Por tanto, el lock interior no coordina el intervalo previo a su propia existencia.

Carrera a resolver por contrato: proceso A crea el directorio raíz y pausa; B ve la raíz existente y crea primero el lock. “Root exists” no demuestra bootstrap completo. También hay que resolver caída después de crear raíz, inicialización parcial, dos bootstraps simultáneos, fallo de escritura de `owner.json` y recuperación. No inventar lock hermano/global, marcador persistente ni inicialización implícita. Si no hay protocolo defendible, bootstrap `BLOCKED/UNKNOWN`.

### B. Liberación y recuperación de locks

- Continuity y Chronicle tienen contratos de release distintos.
- Ambas fuentes identificadas usan verificación del token seguida de retirada recursiva por path; eso deja un intervalo check/use ante reemplazo externo del path.
- Continuity ha tenido un segundo intento de retirada; Chronicle devuelve fallo después de un intento. No unificar mecánicamente.
- La limpieza tras fallo de creación de owner también requiere demostrar que no borra un lock reemplazado.
- Decidir si recuperación externa debe ser exclusivamente offline con quiescencia demostrable o elegir y probar un protocolo filesystem que distinga la instancia a retirar. No asumir que releer el token cierra la carrera.
- Persistencia y release son resultados separados. Si persistencia ya está confirmada y release falla, preservar ambos hechos; no reintentar el negocio. Si persistencia es ambigua, mantener `UNKNOWN`; no reintentar el negocio.

### C. D0-C1, D0-C3, D0-C4

- D0-C1: `--root` + objeto API validado y sin variable de entorno es recomendación, no decisión aceptada.
- D0-C3: alias, symlinks, tipos de archivo reservados y canonicalización siguen OPEN. No dar por aprobado el rechazo universal de symlinks ni afirmar que aliases convergen sin contrato y pruebas.
- Canonicalizar raíz no demuestra que Continuity, Chronicle, lock de instancia y `owner.json` sean archivos regulares dentro de esa raíz.
- D0-C4: migración explícita; no auto-merge, no dual-write y no borrado del origen en el mismo paso. Quiescencia requiere control de relanzamientos específico de instalación; una captura de procesos + hashes no elimina por sí sola la carrera. Sin prevención verificable de nuevos writers: `UNKNOWN/BLOCKED`.

### D. D1 y pruebas de arquitectura

- D1-S0 sigue reservado al propietario: dividir D1-DESIGN y D1-IMPLEMENTATION es propuesta, no decisión aceptada.
- D1-DESIGN no equivale a un test ejecutado.
- El test `tests/nexo/root-bootstrap-protocol.test.mjs` previamente revisado solo prueba un vector de challenge/firma ECDSA con fixture de software; no prueba bootstrap de instancia ni concurrencia de locks.
- El test de grafo estático/allowlist con fixtures negativos se ha propuesto, no implementado ni ejecutado.

### E. Recursos y alcance

- Chronicle 32 MiB y Continuity 16 MiB son límites por documento, no un límite de heap total ni cuota total de disco.
- No se ha demostrado un presupuesto agregado de memoria/disco.
- La admisión de operaciones/snapshots entre todos los entrypoints sigue abierta.
- `RUNTIME_TARGET = NOT_DETERMINED`; no inferir que el POCO X7 Pro/M1 sea el runtime C de Continuity/Chronicle.

## 5. Decisiones reservadas al propietario y gates

No decidir por el usuario:
- D0-C1: interfaz/configuración exacta de raíz.
- D0-C2: protocolo de primer bootstrap.
- D0-C3: política de symlinks/alias/objetos reservados.
- D0-C4: política de migración legacy.
- D1-S0: orden/separación de diseño y prueba/implementación.
- D2: alcance/duración de admisión, contrato de lock/recovery y recuperación de release incierto.
- D3: entorno objetivo, quiescencia, cutover y rollback.

Implementación/tests solo después de decisiones explícitas y autorización separada. Las recomendaciones documentales no son decisiones del propietario.

## 6. Siguiente trabajo recomendado — acotado, sin repetir investigaciones

1. Leer este handoff, luego `STATUS.md`, `MASTER/CORE` y el checkpoint contractual, atendiendo a sus SHAs actuales.
2. Verificar que la matriz D2 y el addendum de release incierto son coherentes en:
   - alcance de cuarentena entre procesos;
   - si/quién puede recuperar mientras un release está vivo;
   - path ausente vs actor todavía vivo;
   - limpieza de owner y segundo intento de retirada;
   - persistencia confirmada/ambigua separada del release.
3. Revisar el contrato de raíz solo en estos puntos; no rehacer la lectura total ni el censo de callers.
4. Si hay contradicción material, escribir un addendum corto con citas a los SHAs exactos y actualizar este handoff/checkpoint con el SHA devuelto; si no la hay, documentar explícitamente que no apareció contradicción nueva.
5. Después, seguir con recuperación de bootstrap parcial y condiciones de `ROOT_READY`, sin introducir nuevos estados persistentes salvo aprobación explícita.
6. No implementar todavía: mantener la actividad en revisión documental hasta resolver los gates.

## 7. Evidencia histórica de CI (no confundir con el estado actual)

Runs conocidos de un SHA anterior de Open Loops:
- npm test/determinism: run `39980113239`, job `120504886619`, SUCCESS.
- STEP 4: `39980113168`, SUCCESS.
- STEP 5: `39980113209`, SUCCESS.

Estos runs acreditan únicamente ese código/SHA y esos jobs. No prueban decisiones D0-D3, legitimidad de la raíz, runtime C ni autorización para efectos protegidos. En esta revisión actual no se ejecutaron tests ni CI.

## 8. Estado final y regla de honestidad

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

No afirmar que el trabajo está implementado cuando solo es documento; no afirmar que el test pasó si no se ejecutó; no interpretar falta de evidencia como ausencia del sistema. Mantener UNKNOWN-STOP.

## Continuidad adicional verificada — contraste estático con fuentes (2026-10-23)

Se contrastaron los contratos D2 ya existentes contra las fuentes actuales de la rama; no se repitió el censo de callers ni se ejecutó runtime/tests/CI.

- `src/nexo/core/continuity-store.mjs`: blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- `src/nexo/core/chronicle-store.mjs`: blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md`: blob `bfa38a057033acf880afe331a47bb383e82e9a97`.
- `NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md`: blob `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- `NCS_M0_D0_C2_D2_PARTIAL_BOOTSTRAP_RECOVERY_BOUNDARY_2026-10-23.md`: blob `ff80a1c66b252db1fd1cabdd6a9e32b0ed8d838e`.
- `NCS_M0_D2_ROOT_READY_SEMANTICS_RECONCILIATION_2026-10-23.md`: blob `36bc58655a12e9681fa52a4660dc3971e8467336`.

Resultado: las fuentes confirman el patrón ya documentado de verificación de token seguida de retirada por ruta; Continuity conserva además un segundo intento de `rm(lockPath)`, mientras Chronicle devuelve fallo tras un intento. La cuarentena `lockReleaseFailures` de Continuity es un `Set` en memoria del proceso y no constituye coordinación entre procesos. La limpieza del owner tras fallo de escritura también retira por ruta. Estos son riesgos de diseño ya registrados en D2, no evidencia de incidente ni hallazgo que justifique abrir otro documento equivalente.

Siguiente avance permitido sin decisión del propietario: comprobar si existe evidencia de pruebas deterministas/cross-process para las intercalaciones ya especificadas y verificar el estado del SHA actual; no reescribir las matrices ni crear tests/código hasta autorización explícita. Si no hay evidencia disponible, registrar PENDING/UNKNOWN y mantener D2 OPEN.

Enlaces directos de continuidad:
- [Frontera de recuperación de bootstrap parcial](NCS_M0_D0_C2_D2_PARTIAL_BOOTSTRAP_RECOVERY_BOUNDARY_2026-10-23.md)
- [Gate D0-C2 y entorno](NCS_M0_D0_C2_DECISION_READINESS_AND_ENVIRONMENT_GATE_2026-10-23.md)
- [Reconciliación ROOT_READY](NCS_M0_D2_ROOT_READY_SEMANTICS_RECONCILIATION_2026-10-23.md)

Estado canónico sin cambios: M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Sin cambios en runtime/tests/workflows; tests/CI no ejecutados.


## Inventario de evidencia de tests D2 — revisión estática, sin ejecución (2026-10-23)

Se localizaron pruebas existentes en la rama; por tanto, el siguiente paso no es crear desde cero pruebas genéricas de locks.

### Continuity Store
- Test file: `tests/nexo/continuity-store.test.mjs`, blob `c3af56077b94c8d641979e0853de7f70fa45d82f`.
- Ya caracteriza: owner inválido/ilegible preservado como UNKNOWN; lock stale falla cerrado; un proceso competidor espera mientras existe un lock y reanuda tras retirada explícita; fallo transitorio de release y segundo intento; fallo persistente conserva `persistenceStatus: committed` y bloquea handoff; quarantine en memoria bloquea nuevas operaciones del mismo proceso tras fallo persistente.
- No demuestra la carrera adversarial central: sustitución del directorio entre comprobación del token y `rm(lockPath)`, ni que el segundo `rm` no retire un lock nuevo. La prueba de retry actual cubre fallo transitorio de limpieza, no reemplazo concurrente del lock.

### Chronicle Store
- Test file: `tests/nexo/chronicle-store.test.mjs`, blob `8e182932ae98ad40c3655f6be3bf5e0585bfac26`.
- Ya caracteriza: append concurrente entre procesos, lock stale fail-closed, token distinto al liberar (no-owned) bloquea handoff sin borrar el lock ajeno, fallo de cleanup conserva commit confirmado y bloquea handoff, y respuesta perdida tras rename puede reconstruirse leyendo el envelope persistido.
- No demuestra la carrera de sustitución entre lectura/validación del owner y retirada del path. La implementación Chronicle no tiene el segundo intento de retirada que sí existe en Continuity, por lo que no se debe trasladar automáticamente el mismo comportamiento de una a otra.

### Límite de la evidencia
Este inventario es inspección estática de archivos en GitHub, no una afirmación de que estos tests pasaron en CI ahora. No se ejecutaron tests/CI en esta revisión. El hueco residual ya está delimitado en la matriz D2 y en el documento de cuarentena: la prueba adversarial de reemplazo durante la liberación, incluyendo el segundo intento de Continuity, y la coordinación segura de recuperación/re-admisión mientras un actor anterior podría seguir vivo.

**Siguiente acción recomendada:** antes de editar runtime o añadir tests, verificar si existe un run de CI reciente asociado al HEAD que incluya ambos archivos y examinar su resultado/artifacts. Si no existe evidencia directa, mantener resultado `PENDING/UNKNOWN`; después, preparar únicamente el test adversarial mínimo requerido por la matriz, sujeto a autorización de implementación. No rehacer las pruebas existentes ni declarar cerrado D2.

Estado canónico sin cambios: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Sin cambios en runtime/tests/workflows; CI no ejecutado en esta revisión.


## Addendum de continuidad — CI automático sobre HEAD (2026-10-24T00:56Z)

Tras el commit documental `cca6b5fe664ee5c6b9585d785cb7c0c6d3bc8678`, GitHub Actions ejecutó automáticamente el workflow `.github/workflows/nexo-deterministic-tests.yml`.

- Run: [40047404511](https://github.com/snowdenxrp/aldea-ia/actions/runs/40047404511), evento `push`, branch `ncs-clean-architecture`, `head_sha=cca6b5fe664ee5c6b9585d785cb7c0c6d3bc8678`.
- Job `tests`: `success`; pasos `Install`, `Run tests` (`npm test`) y `Bounded temporary cleanup regression` finalizaron `success`.
- El workflow en el mismo HEAD tiene blob SHA `3ebd313baecccaa42d89c995dfe8cdbd7f95400a`; ejecuta `npm test` y luego `node tests/nexo/temporary-cleanup-bounds.test.mjs`.
- El diff del commit de HEAD solo modificó este handoff; no cambió runtime, tests ni workflow. Por eso el run acredita la suite ejecutada sobre ese HEAD y los archivos fuente/tests que contiene, pero **no** demuestra que la prueba adversarial pendiente de sustitución del lock exista o haya sido cubierta. Los gaps de intercalación documentados arriba siguen abiertos.
- Esta evidencia es CI automático real y posterior al inventario estático. No significa que el asistente ejecutara tests localmente, ni valida las decisiones D0-D3, la raíz legítima o efectos protegidos.

**Inspección estática completada después del run:** se releen los archivos de tests actuales: Continuity blob `c3af56077b94c8d641979e0853de7f70fa45d82f` (47,481 caracteres) y Chronicle blob `8e182932ae98ad40c3655f6be3bf5e0585bfac26` (35,835 caracteres). Sus casos de release existentes inyectan fallo de `rm`, token no propio, persistencia/rename y cleanup; no se encontró una intercalación que sustituya el directorio lock entre validación del owner/token y la retirada por path, ni la variante en el segundo intento de Continuity. Esto confirma el gap de cobertura por inspección estática, no un fallo de ejecución. No se editaron tests ni runtime. El próximo paso es preparar únicamente el contrato mínimo del test adversarial y sus criterios de aceptación, sujeto a autorización separada.

Estado canónico sin cambios: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Contrato mínimo propuesto — pruebas adversariales de identidad del lock (2026-10-24)

**Estado: especificación de prueba solamente; no autorizada su implementación.** Esta sección convierte el gap ya registrado en criterios falsables sin seleccionar aún un mecanismo de producción para retirar locks.

### A. Continuity — reemplazo entre el primer fallo de retirada y el retry

1. Crear un store temporal y ejecutar una operación normal para que el release use un lock propio A con token A.
2. En el adaptador `fsModule.rm` de la prueba, interceptar la primera llamada dirigida exactamente al path del lock: mover el directorio A fuera del path, crear en ese path un directorio B y escribir `owner.json` con token B; entonces lanzar un error de cleanup simulado sin eliminar B.
3. Dejar que el código actual continúe al segundo intento. Registrar cada llamada de retirada sin hacer afirmaciones sobre el resultado por adelantado.
4. Aceptación: B sigue existiendo después de la operación; su `owner.json` conserva token B; la operación no declara una liberación limpia del lock A. El resultado de persistencia se conserva por separado y no provoca reejecución de negocio.
5. El test debe fallar contra una implementación que haga un segundo `rm(lockPath)` ciego sobre la ruta reemplazada. No usar sleeps como sincronización; el adaptador es la barrera determinista.

### B. Chronicle — reemplazo después de validar token y antes de la retirada

1. Crear e inicializar Chronicle, y preparar una operación que llegue al release del lock A.
2. El adaptador de `rm` intercepta la retirada del lock: sustituye determinísticamente el path por B con token distinto antes de delegar cualquier eliminación por path.
3. Aceptación: la operación nunca elimina B ni informa que liberó A. Si la implementación no puede probar la identidad de la instancia a retirar bajo el modelo elegido, el resultado debe ser release no confirmado y el test debe fallar si B desaparece.
4. No copiar la lógica de retry de Continuity: Chronicle no tiene el mismo segundo intento.

### C. Continuity y Chronicle — limpieza tras fallo de escritura de owner

Caso adicional requerido por la matriz, separado de A/B: provocar que `mkdir(lockPath)` tenga éxito, hacer fallar la escritura de `owner.json` y reemplazar el path antes de la limpieza compensatoria. Aceptación: la limpieza no elimina el reemplazo B y el resultado no permite entrar en sección crítica. Esta ruta no debe confundirse con release normal: el owner pudo no haberse escrito y el proceso todavía no demostró ownership mediante token.

### D. Invariantes transversales de cada caso

- Afirmar por separado: identidad y supervivencia de B; resultado de persistencia; resultado de release; posibilidad de nueva admisión.
- No exigir un nuevo estado persistente, sidecar, lock hermano, ID, cola ni wrapper transaccional como parte del test.
- No simular que la cuarentena local coordina otros procesos. Un test de proceso competidor/recovery es otra prueba y necesita su propio contrato.
- Mantener separados los resultados `committed`/fallido/`unknown` de persistencia y `released`/`not_owned`/`failed` de release. Un resultado de negocio ya persistido o ambiguo nunca se repite automáticamente por un problema de release.
- Los tests son deterministas, sin depender de tiempos arbitrarios, y limpian sus artefactos temporales únicamente después de que las aserciones hayan observado la supervivencia del lock B.
- La prueba debe ejecutarse contra el SHA exacto que la contiene y el resultado de CI debe inspeccionarse por separado. Un test que pase no cierra por sí solo la política D2 de re-admisión/recovery.

### E. Qué no decide esta especificación

No elige entre recuperación externa offline con quiescencia demostrada y un mecanismo de retirada ligado a la identidad del objeto verificado. No afirma resistencia a procesos locales hostiles ni a cualquier filesystem. No autoriza modificar runtime/tests/workflows. Primero se requiere autorización explícita de implementación y, si el mecanismo necesita una decisión de diseño de propietario, registrar esa decisión antes del cambio.

**Próxima acción segura:** revisión documental de que A/B/C no contradicen los contratos existentes; después esperar autorización antes de editar tests o runtime. Estado canónico sin cambios.


## Revisión documental de consistencia — matriz D2 y bootstrap parcial (2026-10-24)

Se contrastó el contrato de pruebas A/B/C de este handoff con estos documentos vigentes de la misma rama:

- Matriz de estados/transiciones D2, blob `bfa38a057033acf880afe331a47bb383e82e9a97`.
- Alcance de cuarentena por release incierto, blob `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- Frontera de recuperación de bootstrap parcial, blob `ff80a1c66b252db1fd1cabdd6a9e32b0ed8d838e`.
- Reconciliación semántica de `ROOT_READY`, blob `36bc58655a12e9681fa52a4660dc3971e8467336`.
- Checkpoint contractual cruzado, blob `824050fc2827bf678514a7acdfe1921f2f2ffe48`.

**Resultado:** no se encontró contradicción material entre los casos propuestos y las reglas documentales vigentes. A/B ejercitan la exigencia de no retirar una instancia distinta del lock; C ejercita la regla de que el creador no puede limpiar por inferencia un path que quizá ya no sea suyo. La separación entre resultado de persistencia, release y nueva admisión se conserva. La frontera de bootstrap también sigue separando detección, autorización explícita, integridad de datos y autoridad constitucional.

**Límites que siguen abiertos:** esta consistencia editorial no selecciona la política de release/recovery, no prueba quiescencia de actores vivos, no resuelve el primer bootstrap ni el alcance de admisión de snapshots, y no autoriza mutaciones. `ROOT_READY` continúa limitado a la raíz validada, no a la instancia completa ni a la autoridad. La recuperación parcial sigue `UNKNOWN/BLOCKED` sin protocolo aprobado.

No se editaron esos documentos de contrato ni se cambió runtime/tests/workflows. El único cambio de esta fase es este handoff. No se declara cerrado D2 ni M0.
