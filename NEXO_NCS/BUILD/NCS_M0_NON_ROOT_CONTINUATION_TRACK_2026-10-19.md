# NCS M0 — continuación independiente de la llave física (2026-10-19)

**Misión:** M0. La ausencia de llave física NO suspende el trabajo de arquitectura, pruebas ni continuidad.
**Rama:** `ncs-clean-architecture`
**HEAD observado al escribir:** `e795a79ed7faaae6f7218a6bd3f67aacafcb6698`
**Estado constitucional invariable:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

## 1. Corrección de evidencia CI

El checkpoint anterior decía que no se había observado CI para el test de bootstrap. Esa afirmación quedó supersedida por las ejecuciones reales de GitHub Actions asociadas al commit exacto `4c0cec1833842103f21194b1f4a3ebdfe168181d`:

- Suite completa `npm test`: [run 39342543741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543741), job `tests`, paso `Run tests` = SUCCESS.
- Aceptación integrada M0: [run 39342543894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543894), job `Nexo M0 contracts on one SHA`; los cinco grupos de prueba = SUCCESS.
- Chronicle vertical: [run 39342543925](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543925), job `Chronicle persisted writer and independent reader` = SUCCESS.
- Admisión/continuidad tras reinicio: [run 39342543933](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543933), job `mission-admission-continuity` = SUCCESS.

El test `tests/nexo/root-bootstrap-protocol.test.mjs` está conectado a `npm test` en el SHA probado. La ejecución completa aprobada ejecutó ese script. No es prueba de hardware, provisión independiente del fingerprint ni legitimidad de la raíz.

La rama está actualmente en `e795a79ed7faaae6f7218a6bd3f67aacafcb6698`. La comparación GitHub desde `4c0cec1833842103f21194b1f4a3ebdfe168181d` reporta 15 commits posteriores y **solo cinco archivos Markdown de documentación modificados**; no hay cambios de runtime/test posteriores en ese intervalo. La suite completa está probada en el SHA del commit de test, no se debe renombrar como ejecución literal del SHA documental HEAD.

## 2. Decisión operativa: la llave no es un bloqueo general de M0

Se mantienen separados estos carriles:

1. **Trabajo ejecutable ahora:** contratos de continuidad, recuperación, no-redispatch, resultados terminales, límites de acciones y evidencia de CI. Se puede seguir diseñando, probando y documentando sin llave física.
2. **Trabajo que sí requiere llave/hardware:** aprovisionar el fingerprint real por una fuente independiente, verificar el desafío firmado con el dispositivo elegido y probar la integración física en el POCO. Sigue pendiente; no simularlo ni dejar que detenga el carril 1.
3. **Enforcement de autoridad:** no conectar la firma de prueba al despacho ni aceptar fixtures `AUTHORIZED` como prueba del propietario. La llave será prueba de posesión de clave; la autoridad vigente, la autorización específica y el enforcement antes del efecto requieren contratos/evidencia separados.

## 3. Revisión acotada sin cambios de runtime

### Gate de acciones owner-backed

En `src/nexo/core/owner-backed-runtime.mjs`, el runtime permite el camino local `chronicle_append` bajo sus contratos de verificación/settlement; rechaza otras acciones con `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED` antes de PREPARED y dispatch. Las acciones de reparación tienen contrato de settlement separado y se bloquean antes de PREPARED hasta que ese contrato esté conectado.

La regresión de `tests/nexo/chronicle-runtime.test.mjs` contiene el caso de acción no soportada aunque el adaptador declare capacidad: verifica `blocked`, `dispatchAttempted: false`, cero PREPARED y cero dispatch. La suite completa del SHA `4c0cec...` pasó. No hace falta duplicar esa prueba sin una nueva condición/fallo.

**Límite:** el gate por acción no prueba identidad legítima ni autorización del propietario. El camino local Chronicle no debe describirse como una acción constitucionalmente autorizada; los resultados públicos mantienen `authorization: NOT_EVALUATED`.

### Store de continuidad y límites de despliegue

`src/nexo/core/continuity-store.mjs` declara explícitamente que:

- `storeRevision` coordina escritores locales cooperantes; no es autoridad, fencing global ni protección contra rollback.
- La escritura usa archivo temporal y rename, pero no afirma `fsync` ni durabilidad ante pérdida de energía.
- No se promete soporte de filesystem distribuido/red.
- `filePath` es configuración confiable, no sandbox; no se reclama resistencia a symlinks ni a procesos hostiles que muten rutas/locks.
- Un store ausente o corrupto no se regenera silenciosamente.

La prueba `tests/nexo/continuity-store.test.mjs` ya cubre, entre otros, ausencia de estado, concurrencia por revisión, fallos de creación del lock, pérdida de respuesta tras rename, agotamiento de revisión y lock stale fail-closed. No convertir esos tests en afirmación de resistencia a rollback, manipulación del filesystem o corte eléctrico real.

## 4. Siguiente trabajo M0 sin llave

Prioridad propuesta: preparar una matriz de aceptación de despliegue del store que distinga de manera verificable:

1. Invariantes ya cubiertos por tests de software (lectura/escritura, revisión condicional, recuperación de respuesta perdida, JSON corrupto/ausente, lock stale).
2. Propiedades que el diseño actual **no reclama** (fsync/power-loss durability, rollback/tampering del filesystem, symlink/path attacks, procesos locales hostiles, network filesystems).
3. Qué propiedad es requisito de la primera versión y cuál queda fuera del alcance inicial.
4. Qué prueba automatizada es viable en CI y qué prueba requeriría hardware/OS real.
5. Qué brecha exige rediseño arquitectónico antes de implementar, en lugar de agregar un parche local.

No añadir por anticipado journals, hashes encadenados, nuevas revisiones, copias, rollback ni wrappers transaccionales. Primero fijar la propiedad de seguridad y el modelo de amenaza; si el requisito exige un ancla externa o física, registrar la dependencia sin bloquear los demás trabajos M0.

## 5. Estado de cierre

- Test de bootstrap en `npm test`: **CI PASS en SHA exacto `4c0cec...`**.
- HEAD actual: `e795a79...`, documentación posterior sin cambios de código/test según comparación GitHub.
- Llave/fingerprint real: PENDING; no adquirido ni provisionado.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: **STOP**.
- No volver a M1 ni reiniciar STEP 7. Continuar desde `NEXO_NCS/STATUS.md` y este documento.
