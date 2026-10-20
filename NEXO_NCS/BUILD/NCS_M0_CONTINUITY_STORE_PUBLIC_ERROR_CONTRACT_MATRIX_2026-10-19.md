# NCS M0 — contrato público de errores del continuity store y matriz de callers (2026-10-19)

**Estado:** diseño de contrato basado en revisión estática; no cambia runtime ni tests.  
**Rama:** `ncs-clean-architecture`  
**Estado constitucional invariable:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

## 1. Propósito y alcance

Cerrar la pregunta previa a cualquier cambio del store: ¿qué puede observar un caller cuando una operación de continuidad no se completa normalmente y qué debe hacer con esa información?

Este documento no declara que la API actual sea uniforme. Registra la asimetría observada y define las invariantes que debe satisfacer una decisión futura. No propone cambiar excepciones por resultados estructurados hasta completar el inventario de callers y sus contratos públicos.

## 2. Evidencia base

- Store: `src/nexo/core/continuity-store.mjs`, blob `c5d8151a97a9d97315671d109f0e6e73a7e0d38e`.
- Owner: `src/nexo/core/continuity-owner.mjs`, blob `07f3df47d33da08c38b1f6ebee9b782a68f85847`.
- Servicio de apertura: `src/nexo/core/continuity-service.mjs`, blob `9f19377f67103bf0d22f68cab9266c2accacc768`.
- Runtime owner-backed: `src/nexo/core/owner-backed-runtime.mjs`, blob `e5b956ea5394387708535106c2dcee8de70bf2fe`.
- Revisión de callers: [NCS_M0_CONTINUITY_STORE_CALLER_ERROR_PROPAGATION_REVIEW_2026-10-19.md](NCS_M0_CONTINUITY_STORE_CALLER_ERROR_PROPAGATION_REVIEW_2026-10-19.md).
- Revisión de contención: [NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md](NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md).

Los SHAs anteriores identifican los blobs examinados, no una afirmación de que la rama HEAD sea ese commit ni que se haya ejecutado CI nuevo para este documento.

## 3. Asimetría concreta del contrato actual

| Operación | Error de adquisición observado | Observación de caller |
|---|---|---|
| `initialize()` | Convierte errores de adquisición en `{status: "failed", code}`; normaliza errores de ruta padre | `openNexoContinuityOwner()` espera un resultado y convierte cualquier estado que no sea `committed` o `conflict` en error de apertura; excepciones también se propagan |
| `commitIfCurrent()` | Normaliza `ENOENT/ENOTDIR`; otras excepciones de adquisición pueden propagarse | Los callers del owner no comparten una única envoltura de excepción en todos los métodos |
| Lectura de continuidad | `loadCurrent()` lanza errores con códigos de store | Rutas superiores inspeccionadas convierten errores de lectura en `blocked` o `unknown` según el momento/operación |
| Persistencia posterior al dispatch | Puede haber respuesta desconocida aun cuando la operación de filesystem pudo persistir | Las rutas owner-backed inspeccionadas evitan convertir incertidumbre en redispatch autorizado |

La asimetría no demuestra por sí sola un bypass ni una pérdida de datos. Sí significa que cualquier nueva clase de resultado o normalización cambia una interfaz observable y exige pruebas en las capas superiores.

## 4. Matriz semántica mínima propuesta para la futura decisión

La matriz define significado, no nombres obligatorios de implementación:

| Hecho observado | Semántica que debe preservarse | ¿Puede permitir dispatch? |
|---|---|---|
| Commit confirmado y revisión coherente | Persistencia confirmada para esa revisión | Sólo si la operación concreta y sus demás gates lo permiten |
| Conflicto de revisión | Otro escritor cambió el estado canónico; candidato no admitido por esa revisión | No por sí solo |
| Fallo demostrado antes de comenzar la escritura | La operación no se confirmó; conservar código de causa | No por sí solo |
| Error después de intentar escribir, sin lectura canónica concluyente | Resultado de persistencia `UNKNOWN` | No |
| Lock ocupado / espera sin progreso | Contención, no resultado de persistencia | No |
| Lock stale que requiere recuperación explícita | Recuperación pendiente; no se presume propiedad del lock | No |
| Persistencia confirmada pero liberación del lock fallida | Conservar ambos hechos: persistencia y fallo de liberación; bloquear handoff exitoso | No |
| Error de lectura, snapshot inválido o envelope corrupto | Estado canónico no confiable/disponible para esta operación | No |

**Regla de no equivalencia:** `failed`, `blocked`, `conflict`, `BUSY` (si alguna vez se adopta) y `UNKNOWN` no son sinónimos. No deben mapearse a un único estado sin preservar la causa y la certeza sobre la persistencia.

## 5. Reglas obligatorias para todos los callers

1. Ningún caller infiere que la escritura no ocurrió sólo porque se lanzó una excepción después de iniciar persistencia.
2. Ningún caller promueve `UNKNOWN` a `committed` sin observar el envelope canónico y verificar identidad/revisión/contenido bajo el contrato de la operación.
3. Ningún error de adquisición o liberación del lock se interpreta como autorización.
4. Ninguna contención, timeout futuro o cancelación puede autorizar el redispatch de un efecto externo cuyo resultado anterior sea incierto.
5. La admisión de misión, PREPARED, lineage, reconciliación y outcome terminal son operaciones semánticamente distintas; no deben recibir una política única por comodidad si sus consecuencias difieren.
6. Las consultas permanecen sin mutación.
7. El estado constitucional no cambia por éxito de persistencia: `authorization` sigue `NOT_EVALUATED` hasta que exista evidencia independiente de autoridad vigente y enforcement en la frontera protegida.

## 6. Qué no decidir todavía

- No añadir `BUSY`, timeout, deadline, cancelación, lease, heartbeat ni recuperación automática.
- No convertir todas las excepciones en objetos de resultado ni viceversa.
- No ampliar la API pública con un segundo journal, un identificador/cola adicional o wrappers transaccionales sin necesidad demostrada.
- No modificar la semántica de `Promise.all` del test de concurrencia: dos commits con la misma revisión esperada deben conservar como máximo un `committed`; el resultado del contendor depende de la política de adquisición elegida.
- No afirmar que la inspección estática parcial sea un inventario exhaustivo de callers.

## 7. Siguiente paso ejecutable

Completar una tabla de callers en código/tests, no sólo por nombre de método, con estas columnas:

- entrypoint y operación de store invocada;
- si la excepción se propaga, se captura o se convierte en estado;
- estado/código exacto que cada caller reconoce;
- si puede ocurrir antes o después de dispatch;
- qué evidencia permite afirmar persistencia;
- prueba existente que cubre la rama y SHA/run de CI;
- prueba ausente necesaria para cualquier nuevo resultado.

Después de ese inventario, decidir entre mantener una API mixta con excepciones documentadas o adoptar resultados estructurados uniformes. La decisión debe basarse en contratos reales y no en preferencia estética. Sólo entonces editar runtime y añadir regresiones dirigidas.

## 8. Estado

- Revisión documental únicamente; no se modificaron archivos runtime ni tests.
- No se ejecutó CI nuevo; este documento no es evidencia de ejecución.
- No se observó bypass de redispatch en las rutas inspeccionadas hasta ahora; la revisión sigue siendo estática y parcial.
- M0: `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`.
