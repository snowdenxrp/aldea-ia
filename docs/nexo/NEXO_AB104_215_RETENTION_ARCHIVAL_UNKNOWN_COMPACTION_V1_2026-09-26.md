# AB104.215 — Retention, archival and unresolved-effect evidence semantics
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR ARQUITECTURA

## Corrección importante de AB104.214
Al inspeccionar directamente el main actual, hay una discrepancia que no debe ocultarse: effect-adapter.js crea `prepared`, pero en la rama de excepción del handler construye EFFECT_OUTCOME_UNKNOWN y retorna sin llamar a persist(). Sin embargo, effect-adapter.test.mjs contiene una aserción que espera que exceptionJournal[0].result.code sea EFFECT_OUTCOME_UNKNOWN. El archivo de código consultado no satisface esa aserción tal como está escrito. Por tanto, no se debe afirmar que UNKNOWN queda durablemente guardado en el journal. Esto requiere verificación mediante ejecución real de tests antes de cualquier conclusión de CI.

## Evidencia externa estudiada
AWS Durable Execution distingue replay/retry y señala que una operación con side effects puede ejecutarse otra vez cuando una ejecución no alcanza su checkpoint; recomienda idempotencia real del destino o semánticas at-most-once apropiadas. También documenta que una historia/checkpoint puede tener una ventana de retención y que el historial no es necesariamente permanente. Transactional Outbox documenta el caso de duplicación cuando un relay publica y falla antes de registrar la publicación. Event Sourcing describe snapshots como copias derivadas mientras el log puede conservar la historia/auditoría.

## Resultado de la investigación de retención
1. La ausencia física de un registro NO significa NOT_COMMITTED.
2. Un registro `archived` tampoco debe desaparecer semánticamente: recovery necesita poder resolver que existió un registro y localizar su evidencia o un certificado de compactación.
3. Los estados PREPARED/UNKNOWN son distintos de terminales ordinarios. No deben ser eliminados solo por antigüedad mientras exista una posibilidad razonable de efecto externo no reconciliado.
4. COMPLETED puede compactarse solamente si queda una referencia estable a evidencia histórica suficiente para impedir replay y para reconstruir el resultado sin ejecutar el efecto.
5. FAILED/BLOCKED también requieren clasificación: un fallo antes del boundary puede compactarse con evidencia de no-commit solo si esa conclusión está respaldada; un BLOCKED por incertidumbre no es un fracaso terminal.
6. La compactación debe preservar al menos identidad de operación, fingerprint de solicitud, target/incarnation, autoridad relevante, estado terminal, referencia de evidencia y vínculo con el registro/segmento archivado.
7. Un snapshot/compaction point no debe sustituir automáticamente la evidencia de side effects externos. Los snapshots sirven para reconstrucción del estado, pero la relación con sistemas externos necesita contratos propios.
8. El horizonte de retención debe ser una propiedad del EffectContract/target, no un simple límite local de memoria.
9. Si vence el horizonte externo y no existe evidencia independiente durable, el resultado correcto puede quedar permanentemente UNKNOWN_EXTERNAL. La expiración no convierte UNKNOWN en NOT_COMMITTED.
10. Si un target ofrece una garantía fuerte de ausencia para todo el intervalo relevante, esa garantía puede cerrar UNKNOWN → NOT_COMMITTED; una consulta vacía sin cobertura temporal/continuidad no lo hace.

## Taxonomía propuesta para investigación
- LIVE_UNRESOLVED: evidencia local activa; no compactar destructivamente.
- ARCHIVED_UNRESOLVED: evidencia movida a almacenamiento histórico verificable; replay sigue bloqueado.
- RESOLVED_COMMITTED: resultado confirmado; conservar identidad + evidencia/referencia.
- RESOLVED_NOT_COMMITTED: resultado negativo autoritativo; conservar la prueba de ausencia y su horizonte.
- RESOLVED_FAILED_PRE_BOUNDARY: fallo demostrado antes de aceptación; conservar la prueba de frontera.
- UNKNOWN_PERMANENT: no existe ya una vía suficiente para resolver el resultado; conservar la incertidumbre como hecho histórico.
- CORRUPT/CONFLICT: evidencia incompatible; quarantine, nunca convertir en inexistencia.

## Regla anti-replay derivada
El derecho a tratar una operación como nueva no puede derivarse de `journal.find(key) == null`. Debe derivarse de una política explícita de identidad + retención + autoridad + evidencia de que la identidad anterior ya no puede producir/representar un efecto conflictivo.

## Hallazgo sobre el prototipo
El límite de 200 entradas es insuficiente como política semántica de retención porque puede mezclar presión de memoria con finalización de la historia. Además, la rama de excepción actualmente parece perder el resultado UNKNOWN en el journal. Ambos puntos deben quedar como defectos/UNKNOWN del prototipo, no como base para diseñar la arquitectura final.

## Próximo AB104.216
Investigar cómo construir un certificado de compactación/archivo que conserve anti-replay: identidad estable, digest de segmento, rango/orden, estados terminales, evidencia de UNKNOWN, autoridad, anchor y recuperación tras restore. Después estudiar ataques de truncation/garbage-collection y reconstrucción desde snapshot + archive.