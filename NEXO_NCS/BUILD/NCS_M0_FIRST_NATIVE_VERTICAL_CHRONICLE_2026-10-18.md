# M0 — primera vertical nativa de Nexo: Chronicle

Fecha: 2026-10-18  
Estado: vertical implementada y validada en CI para su ruta explícita; M0 incompleto, runtime default sin cutover.

## Decisión

Usar **una entrada explícita de Chronicle** como primera vertical nativa no-repair para cerrar el ciclo de efecto de M0, sujeto a las pruebas y límites de este documento.

La elección se apoya en la arquitectura maestra preservada en `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`: Chronicle ya está definido como historia durable de Nexo y del usuario cuando corresponda, gobernada por privacidad, distinta de memoria ordinaria y no equivalente a verdad universal. No se introduce un dominio nuevo por conveniencia ni se reutiliza Lúmina.

## Límite de la vertical

Una única operación de escritura de Chronicle, iniciada por Nexo y con contenido explícito y validado, no una memoria autónoma general, un sistema de aprendizaje, ni un gestor de tareas. La capacidad solo queda seleccionada como primer candidato técnico; no se afirma que ya exista ni que esté autorizada para uso general.

- **Estado canónico del dominio:** el registro persistido de Chronicle, separado del snapshot/journal de continuidad operativa.
- **Writer único:** una API estrecha de append/commit de Chronicle. No se permiten escrituras laterales desde runtime, modelo, adapter o tests de integración.
- **Reader de recuperación:** una lectura nueva del almacenamiento persistido, a través de la API de lectura de Chronicle, después de cerrar y reabrir el store en el test. No aceptar el objeto que devolvió el writer ni un resultado del adapter como evidencia.
- **Identidad de operación:** reutilizar la identidad/idempotency key de la operación ya suministrada por el contrato canónico; no inventar un ID paralelo.
- **Invariante observable:** tras reabrir el store, existe como máximo una entrada que corresponde a esa operación y su contenido coincide exactamente con el contenido validado que se preparó. Ausencia, duplicación, corrupción o contenido distinto no equivalen a “no aplicado”: el resultado debe ser UNKNOWN/BLOCKED cuando la evidencia no permita concluir.
- **Separación de responsabilidades:** el continuity owner conserva PREPARED, execution lineage, reconciliación y settlement de la operación. Chronicle guarda el artefacto de historia. Ninguno reemplaza al otro; no se añade un segundo journal de efectos ni se fusionan los dos dominios.
- **Durabilidad declarada con precisión:** el reader post-restart demuestra persistencia visible tras cerrar/reabrir el proceso de prueba; no demuestra por sí solo fsync, supervivencia a pérdida de energía, almacenamiento distribuido ni protección frente a rollback.

## Secuencia que deberá probarse

1. Validar el contenido y admitir la operación mediante el contrato de Nexo.
2. Persistir PREPARED en el continuity owner y exigir confirmación inequívoca.
3. Solo entonces llamar al writer de Chronicle.
4. Registrar lineage contra la PREPARED coincidente; no interpretarlo como settlement.
5. Reabrir Chronicle desde almacenamiento persistido y ejecutar el verificador específico.
6. Liquidar PREPARED mediante CAS solo si la observación independiente demuestra la invariante requerida.
7. Registrar outcome terminal después del settlement confirmado.
8. Reiniciar/cortar el flujo en cada frontera relevante y comprobar que no hay redispatch automático ni finalización inventada.

## Casos de fallo obligatorios

- PREPARED no confirmado o con resultado UNKNOWN: no invocar writer.
- Writer falla antes de confirmar si escribió: mantener PREPARED y clasificar UNKNOWN; no repetir automáticamente.
- Writer confirma, pero lineage o settlement falla: el registro puede existir; recuperación debe releer Chronicle y reconciliar, nunca redispatch por defecto.
- Respuesta perdida después de commit: el replay debe observar la entrada persistida y resolver el resultado sin duplicarla.
- Misma clave con contenido diferente: conflicto, nunca sobrescribir ni tratar como éxito.
- Entrada ausente, inválida, duplicada o reader inaccesible: no concluir `not_applied` salvo que el contrato de almacenamiento y la evidencia permitan demostrarlo; de lo contrario UNKNOWN.
- Dos escritores concurrentes: el contrato debe demostrar exclusión/condicionalidad suficiente para evitar duplicados. No asumir que rename por sí solo proporciona idempotencia.
- Reinicio real del test: destruir las instancias en memoria y construir reader/writer nuevos desde la ruta de almacenamiento.
- No cambiar el runtime legado a default hasta observar CI verde para las pruebas focales y el flujo vertical completo.

## Lo que no queda decidido ni permitido

- No se decide aquí el formato final de Chronicle (JSONL, archivo de registros u otro) sin revisar primero convenciones de persistencia y necesidades de lectura/concurrencia.
- No se afirma atomicidad entre Chronicle y el store de continuidad.
- No se añaden colas, retries, tombstones, IDs paralelos, transaction wrappers ni otro ledger.
- No se transforma Chronicle en memoria ordinaria, truth store universal, misión ni journal de efectos.
- No se usa estado de simulación de Lúmina como writer, reader o verificador.
- No se habilitan efectos protegidos ni se modifica STEP 7.
- No se declara M0 completo.

## Siguiente acción de implementación

Inspeccionar el estilo de persistencia y las convenciones de pruebas ya presentes; implementar únicamente el writer/reader mínimo de Chronicle con operaciones idempotentes/conflicto explícito, pruebas de reapertura y concurrencia; después implementar el verificador específico y conectar esta única vertical a la ruta owner-backed. Cada cambio debe incluir crash-cut tests y CI observable. Si la revisión demuestra que Chronicle no puede satisfacer el contrato sin infraestructura especulativa, detenerse y registrar el bloqueo antes de ampliar el diseño.


## Resultado de implementación — Chronicle vertical (actualización 2026-10-18)

La primera vertical ya pasó de diseño a código y tiene una entrada propia explícita:

- Store: `src/nexo/core/chronicle-store.mjs`; reader/verifier: `src/nexo/adapters/chronicle-observation.mjs`; contrato de acción: `src/nexo/adapters/chronicle-effect.mjs`.
- Owner: settlement específico de `chronicle_append` únicamente desde observación persistida `applied` del source registrado `nexo-chronicle-store`; outcome completed bloqueado si no existe settlement exacto ligado a la misma clave/acción/target.
- Runtime: recuperación de PREPARED y replay de outcome por lectura/reconciliación; nunca redispatch automático. La única acción admitida por esta vertical es `chronicle_append`.
- Entrada: `scripts/nexo-chronicle-session.mjs`, sin imports de Lúmina. Los IDs/rutas los suministra el caller y la inicialización de stores es opt-in. Reusar la misma identidad con contenido distinto se bloquea.
- Tests: `tests/nexo/chronicle-store.test.mjs` y `tests/nexo/chronicle-runtime.test.mjs`, incluidos en `package.json` y workflow focal.
- Evidencia: [CI 39174162150 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174162150), SHA `1ef9a4745d31d324b56733e43e250d36bb3908b7`.

## Siguiente corte M0

1. Auditar el CLI y el path de almacenamiento bajo estados existentes, faltantes y corruptos; no regenerar datos automáticamente.
2. Ejecutar/observar las suites amplias aplicables tras los cambios de owner/runtime; conservar SHA + runs exactos.
3. Decidir de forma explícita si el entrypoint Chronicle debe ser llamado por la aplicación principal o mantenerse como CLI de validación. No modificar `scripts/assistants.mjs` si eso vuelve a introducir dependencia de Lúmina.
4. No habilitar otras acciones, no cambiar runtime default y no declarar M0 completo todavía.


## Validación amplia adicional

En SHA `4626afbb1220feb0784c020288de697608b9276b` quedaron verdes dos workflows:
- Chronicle native vertical: [39174272574 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272574).
- Bounded mission admission and restart continuity: [39174272526 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272526), incluyendo suites Chronicle, runtime y continuidad existentes.

Esto valida la vertical en la ruta explícita y las suites de regresión afectadas; no es validación de todo el producto ni permiso para cambiar el runtime por defecto. El siguiente corte sigue siendo auditar bootstrap y almacenamiento del CLI y decidir una integración principal sin dependencia de Lúmina.


## Auditoría de identidad — colisión de claves resuelta en la frontera Chronicle

La clave canónica actual de continuidad concatena `missionId` y `stepId` con `:`. Cambiar globalmente esa representación sin migración sería riesgoso; por tanto, la entrada Chronicle restringe esos IDs (sin `:`, sin espacios periféricos). Pruebas en ambos campos evitan que pares distintos aliasen la misma clave. No se cambió el contrato global ni se migró el journal.

Validación CI en SHA `de89e228ca5b46becd17ef2e3159ab2e47c25f8e`: [39174610849 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610849) y [39174610848 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610848).

Siguiente corte: endurecer el parser de argumentos del CLI (argumentos desconocidos, repetidos y valores ausentes) y probar que no filtre el contenido del Chronicle por salida de error. No hacer cutover ni ampliar acciones.


## Parser CLI y superficie de error

El entrypoint ahora valida estrictamente la gramática de argumentos y captura excepciones en modo CLI para no imprimir contenido Chronicle, stack ni rutas. Se registró un fallo intermedio de test por expectativa obsoleta del código de error y se corrigió antes de considerar la iteración verde.

CI final en SHA `d7af2db2150ab6be57683ad1e15977f29c613081`: [39174722540 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722540) y [39174722491 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722491).

Próximo corte: probar el CLI como subproceso real, con stores centinela, asegurando que entradas inválidas no los modifiquen y que la salida no filtre el cuerpo. No ampliar la vertical ni cambiar runtime default.


## CLI real: no-mutación y no filtración

La prueba de integración inicia el ejecutable Node real con argumentos inválidos y contenido centinela. Verifica salida de error estructurada, stderr vacío, ausencia del centinela en stdout/stderr y ausencia de ambos archivos de store. No depende solo de una prueba unitaria del parser.

CI en SHA `429fc980427c04f8db286e28ee9887333941acb8`: [39174861087 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861087) y [39174861039 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861039).

Próximo: auditar y declarar los límites reales de filesystem/concurrencia/durabilidad; no afirmar resistencia a power loss ni activar el runtime predeterminado.


## Auditoría de identidad y bootstrap — validada en CI (2026-10-18)

- Se detectó y cerró la colisión posible en la identidad `missionId:stepId`: los IDs con `:` se rechazan en la entrada, handler y verificador. El verificador no clasifica una consulta ambigua como aplicada. No se cambió el contrato global de identidad.
- El entrypoint ahora preflighta continuidad y Chronicle antes de inicializar ninguno. Los tests prueban que un almacén compañero corrupto no deja creado el otro archivo cuando ambos stores están marcados para inicialización.
- La preflight reduce efectos laterales conocidos, pero no crea una transacción cross-store. Una carrera o fallo de E/S posterior al preflight puede producir inicialización parcial; no se reclama atomicidad entre archivos.
- Pruebas: `tests/nexo/chronicle-store.test.mjs` y `tests/nexo/chronicle-runtime.test.mjs`.
- SHA validado: `43827382ed27821182727c12a4ed6d03cc51ad36`. CI SUCCESS: [Chronicle run 39174839208](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839208), [continuidad/runtime run 39174839267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839267), [STEP 4 run 39174839176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839176), [STEP 5 run 39174839133](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839133).
- Siguiente: revisar el contrato de la entrada CLI y su integración posible con la aplicación principal sin usar `scripts/assistants.mjs` como puente, porque esa ruta está vinculada al estado/simulación de Lúmina. No ampliar acciones ni cambiar runtime default sin una decisión arquitectónica explícita y pruebas del cutover.


## Auditoría de privacidad CLI y límites del almacenamiento (2026-10-18)

### Cambio validado

El CLI ya no acepta el cuerpo Chronicle como argumento de proceso. La opción `--content` fue retirada y sustituida por `--content-stdin`; el ejecutable lee el stream stdin y rechaza stdin TTY. Las pruebas reales de proceso verifican que los argumentos no incluyen el cuerpo, que stdout/stderr no lo imprimen, que los argumentos inválidos no crean stores y que la ruta válida persiste el contenido en Chronicle.

CI en SHA `0ea0b8bcbd68a2e2062e359b11247cd6a04a2457`: [39176108822 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108822), [39176108833 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108833).

### Límites descubiertos — no se consideran resueltos

- Temp + rename ofrece sustitución atómica observable en el entorno probado, pero no prueba fsync ni supervivencia a pérdida de energía.
- Las rutas suministradas por caller no se canonicalizan ni se aíslan de symlinks; la frontera de confianza del filesystem no está cerrada.
- La recuperación de locks obsoletos se basa en edad/PID y luego borra el directorio; el patrón check-then-remove no prueba exclusión segura frente a carreras entre procesos. No afirmar robustez adversarial multiproceso ni soporte de filesystem distribuido.

### Próximo corte

Definir si esta vertical se restringe a un único proceso cooperante en filesystem local, o diseñar una reclamación de lock segura con pruebas multiproceso; además, especificar el contrato de rutas y symlinks. No ampliar acciones, no cambiar runtime default, no declarar M0 completo.


## Prueba adicional de concurrencia real

La prueba del store ejecuta dos procesos Node independientes, concurrentes, sobre el mismo Chronicle local y verifica ambas entradas desde una nueva instancia lectora. CI pasó en SHA `6940f9524773b36a97d8c6eb44d7c2bd81146d62`: [39176214934](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214934), [39176214965](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214965), [STEP 4 39176214931](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214931), [STEP 5 39176214932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214932), todos SUCCESS.

La prueba respalda solo concurrencia cooperante local normal. No cierra la carrera check-then-remove en recuperación de lock obsoleto, la confianza de rutas/symlinks ni durabilidad ante pérdida de energía. Estos siguen siendo límites abiertos antes de producción.
