# NCS M0 — delta de writer scope y path boundary de Continuity

Fecha: 2026-11-01
Rama: `ncs-lumina-decoupling-2026-10-29`
Código analizado: `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`
Estado: análisis estático acotado; no cambia runtime, no ejecuta bootstrap y no autoriza publicación.

## 1. Alcance: delta, no reinicio del inventario

Este documento actualiza únicamente las garantías de la implementación actual de Continuity después de `38990a7a` / `7a7f3ffa`. Reutiliza, sin repetir, el inventario E3/P01 y el protocolo D3 ya registrados en:
- `NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`;
- `NCS_M0_CONTINUITY_BOOTSTRAP_EXCLUSION_MODEL_RECONCILIATION_2026-10-27.md`;
- `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md`.

No se reabre el censo de callers ya realizado. La separación reciente Nexo/Lúmina y su validación CI se conserva como evidencia independiente.

## 2. Frontera de escritura observada en el código actual

La implementación física de persistencia del store está concentrada en `src/nexo/core/continuity-store.mjs`:
- `loadCurrent()`: adquiere el lock por-store, lee y valida el envelope y libera el lock. Los lectores que usan esta API cooperan con la publicación.
- `initialize()` / `initializeExclusive()`: adquieren el mismo lock. La ruta exclusiva crea un temporal único con `open(..., "wx")`, escribe/cierra y publica con `copyFile(..., COPYFILE_EXCL)`.
- `commitIfCurrent()`: adquiere el lock, lee la revisión canónica, comprueba `expectedRevision` y persiste el siguiente envelope mediante temporal + `rename()`.
- `src/nexo/core/continuity-service.mjs` es el punto de composición observado: `bootstrapNexoContinuityStore()` llama a `initializeExclusive()`; `openNexoContinuityOwner()` abre el store y el owner usa las operaciones del store.
- `src/nexo/core/continuity-owner.mjs` consume `loadCurrent` y `commitIfCurrent` a través de la interfaz del store; no implementa una segunda primitiva de filesystem.
- `src/nexo/application/continuity-queries.mjs` usa `createNexoContinuityStore(...).loadCurrent()` para consultas. `scripts/nexo-continuity.mjs` es re-export de servicios; `scripts/nexo.mjs` expone consultas/status y deriva Chronicle, no implementa escritura directa del archivo Continuity.

Conclusión limitada: en las rutas actuales examinadas, la escritura canónica conocida pasa por el store y su lock cooperativo. Esto no equivale a una prueba universal de que ningún proceso externo, script antiguo, checkout paralelo o actor con acceso al filesystem pueda escribir directamente. La cobertura operacional completa sigue dependiendo de E2/E3.

## 3. Qué garantiza y qué no garantiza el lock

### Sí
- Serializa participantes que usan el mismo `filePath` y respetan el lock `${filePath}.lock`.
- Los lectores a través de `loadCurrent()` también toman el lock; no deberían observar la copia parcial de `initializeExclusive()` mientras el lock cooperativo se mantenga.
- `COPYFILE_EXCL` impide que la publicación inicial sustituya un destino que ya exista al ejecutar la copia.
- Un lock stale no se recupera automáticamente: devuelve `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`.

### No
- No impide que otro proceso ignore el lock y escriba directamente al archivo.
- No impide que un writer no cooperativo modifique el destino durante la secuencia temporal + rename de `commitIfCurrent()`; el lock no es un fencing token del filesystem.
- `COPYFILE_EXCL` no es publicación de visibilidad atómica para lectores que no usan el lock.
- El contrato del propio módulo declara `filePath` configuración confiable, no sandbox de seguridad, y no reclama resistencia a ataques de symlink/path.
- La comprobación de token del lock y su eliminación no constituyen una primitiva de exclusión contra un actor hostil que pueda manipular el directorio del lock.
- No se demuestra fsync ni durabilidad ante pérdida de energía.

Por tanto, no debe elevarse el lock cooperativo a “exclusión de todos los escritores” ni a “protección TOCTOU”.

## 4. Path boundary y TOCTOU de bootstrap

`bootstrapNexoContinuityStore()`:
1. exige `root` absoluto y `relativePath` normalizado;
2. calcula `filePath` con `path.resolve` y comprueba contención léxica con `path.relative`;
3. hace `fs.stat(root)`;
4. inspecciona el directorio padre y los temporales antes de crear el store;
5. delega en `initializeExclusive()`, que vuelve a revisar temporales bajo el lock del archivo.

Esto ofrece validación léxica y una segunda comprobación de temporales bajo lock, pero no resuelve alias/symlinks ni cambios concurrentes de componentes del path. No se observa un contrato basado en `realpath` de cada componente, `lstat`/no-follow de toda la cadena, descriptor de directorio estable o primitiva equivalente a `openat2(RESOLVE_BENEATH|NO_SYMLINKS)`.

El chequeo de raíz/directorio padre y la posterior apertura/publicación son operaciones separadas. Un proceso con capacidad de cambiar componentes del path puede crear una carrera entre comprobación y uso. El propio código excluye expresamente esa clase de garantía; por tanto, no es un defecto oculto que pueda declararse resuelto con la prueba CI.

## 5. Interpretación del entorno restringido POCO/Termux

La decisión del propietario de permitir un entorno operativo restringido es un límite de alcance útil, no evidencia de que el entorno ya satisfaga sus precondiciones.

La única vía razonable de cierre técnico sin prometer defensa contra procesos hostiles sería demostrar un entorno de ejecución controlado que excluya, durante la ventana, los launchers y procesos no cooperativos relevantes. La garantía quedaría expresamente limitada a esa instalación/ventana y no a cualquier proceso local hostil con el mismo UID. Si el alcance exigido incluye actores hostiles con acceso al mismo sandbox/UID, el store actual no ofrece esa barrera y la primera publicación debe permanecer STOP hasta que exista otra arquitectura de aislamiento demostrable.

La decisión de aceptar ese límite de amenaza, si no está ya expresamente contenida en la decisión del propietario, no se infiere de los tests ni del hecho de usar Termux.

## 6. Estado y siguiente unidad

- El lock cooperativo y la publicación exclusiva actual están cubiertos por las pruebas locales y CI del SHA indicado.
- E2/E3 continúan UNKNOWN: la instalación de Termux y ejecución de pruebas en él no demuestran exclusión de todos los writers/launchers, prevención de relanzamiento ni control de la ventana.
- P01-C/P01-D permanecen PENDING/UNKNOWN.
- P01-A/P01-G (objeto y legitimidad de primera creación) no se resuelven con este análisis.
- P01-E/P01-F y P-05 mantienen sus estados previos.
- D3 continúa OPEN; no se ejecutó migración/cutover legacy.
- M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz PENDING/UNKNOWN; `ROOT_READY` deshabilitado; primera publicación y efectos protegidos STOP.

Siguiente unidad: actualizar el expediente del perfil Termux con la evidencia ya observada y recoger solo la evidencia faltante de E2/E3 (control de launchers/servicios y prevención de relanzamiento). No repetir el inventario de callers ni ejecutar bootstrap.
