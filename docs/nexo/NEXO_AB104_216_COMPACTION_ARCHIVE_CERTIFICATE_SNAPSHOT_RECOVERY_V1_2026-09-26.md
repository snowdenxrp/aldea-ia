# AB104.216 — Compaction/archive certificate and snapshot+archive recovery
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR ARQUITECTURA

## Objetivo
Determinar cómo compactar/archivar evidencia de efectos sin convertir la desaparición física del registro en permiso para repetir.

## Evidencia externa
Certificate Transparency demuestra un patrón útil: un log append-only puede comprometer cada versión mediante una raíz Merkle y usar consistency proofs para demostrar que una versión posterior contiene la historia previa. Esto permite compactar representación sin perder la propiedad verificable de continuidad, aunque CT no sea automáticamente una solución para Nexo. citeturn0search3turn0search14
TUF separa snapshot metadata, hashes/versiones y mecanismos contra rollback/freeze. Su snapshot ata un conjunto coherente de metadatos; esto es una referencia útil para que Nexo no combine arbitrariamente snapshot y archive de épocas distintas. citeturn0search0turn0search1
SQLite muestra que snapshot/WAL recovery puede reconstruir un punto histórico y que el WAL forma parte del estado persistente relevante. Pero atomic commit/WAL no resuelve por sí mismo anti-rollback ni autoridad: un estado antiguo puede seguir siendo internamente consistente. citeturn0search2turn0search6turn0search7

## Resultado principal
La compactación segura no debe ser `delete old records`. Debe ser una transición verificable:
`LIVE SEGMENT → SEALED SEGMENT → ARCHIVED/COMPACTED CERTIFICATE → LIVE NEXT SEGMENT`.

El certificado de compactación propuesto conceptualmente debe comprometer:
- scope/Nexo identity
- target/resource scope si aplica
- target incarnation
- authority epoch/root
- first sequence y last sequence del segmento
- previous segment/archive digest
- digest raíz del segmento (hash-chain/Merkle u otra construcción a seleccionar)
- estado terminal o unresolved de cada operación, o un commitment que permita demostrar su inclusión
- operation_id/effect_identity
- payload fingerprint cuando sea necesario para detectar collision
- evidencia/referencia para reconciliación
- retention horizon
- archive location/identifier
- compaction policy/version
- anchor/commit identity
- autenticidad del certificado.

## Propiedad crítica
Un certificado de archivo NO significa que el contenido fue borrado de forma semántica. Significa que la historia anterior quedó comprometida por un anchor verificable y que existe una ruta para recuperar la evidencia necesaria.

## Qué puede compactarse
1. COMPLETED: candidato a compactación si su identidad y prueba de commit quedan comprometidas y la política permite reconstrucción sin ejecutar.
2. RESOLVED_NOT_COMMITTED: candidato si se conserva la prueba negativa, su horizonte y autoridad.
3. RESOLVED_FAILED_PRE_BOUNDARY: candidato solo si la prueba demuestra no aceptación en el boundary relevante.
4. PREPARED/UNKNOWN: no debe convertirse en simple ausencia mientras exista una posibilidad de reconciliación. Puede moverse a ARCHIVED_UNRESOLVED, pero su identidad debe seguir bloqueando replay.
5. CORRUPT/CONFLICT: no compactar como estado normal; preservar evidencia conflictiva y quarantine.

## Snapshot + archive
Recovery no debe cargar un snapshot y asumir que todo lo anterior desapareció. Debe verificar:
`snapshot identity → snapshot sequence/epoch → archive certificate → continuity proof → current segment`.
Si falta un segmento entre snapshot y current, el resultado es HISTORY_GAP/UNVERIFIED_HISTORY, no reconstrucción inventada.
Si snapshot es anterior a un anchor de freshness ya aceptado, no puede convertirse silenciosamente en current state. Esto conecta AB104.199–203.

## Ataques estudiados
- Truncation: quitar el final del archive → digest/range/anchor detecta incompletitud.
- Middle deletion: quitar un segmento → predecessor digest/sequence/range detecta gap.
- Replacement with alternate valid segment: requiere anchor/autenticidad; una cadena internamente consistente no basta.
- Replay old archive: freshness/authority epoch debe rechazar rollback.
- Archive certificate without contents: puede verificar existencia/commitment pero no necesariamente reconstruir detalles; por eso debe existir política explícita de availability.
- Snapshot from different branch + valid archive: scope/root/previous-digest binding debe detectar mezcla.
- Garbage collection of unresolved UNKNOWN: debe ser prohibido o transformarse en UNKNOWN_PERMANENT con evidencia de que la resolución ya no es posible; nunca en NOT_COMMITTED.
- Archive restored after device clone: local certificate puede ser auténtico históricamente pero stale; necesita anchor externo/protegido.

## Distinción importante
INTEGRITY OF ARCHIVE ≠ AVAILABILITY OF ARCHIVE ≠ AUTHORITY OF ARCHIVE ≠ FRESHNESS OF ARCHIVE.
Un certificado puede demostrar que un segmento existió y aun así no permitir recuperar su contenido; puede ser auténtico y estar superseded; puede estar completo y ser una rama no autorizada.

## Regla anti-replay derivada
Recovery debe considerar una operación como 'known historical identity' aunque su registro operativo no esté en el segmento vivo. `NOT_FOUND` solo puede significar 'new identity candidate' después de verificar el archive index/anchor/retention policy y la ausencia de una identidad conflictiva.

## Estado de diseño
Esto es investigación de mecanismos, no selección final. Aún no se decide hash-chain vs Merkle, almacenamiento local/remoto, firma vs MAC, frecuencia de checkpoints, ni arquitectura de quorum.

## Próximo AB104.217
Atacar específicamente el certificado de compactación: falsificación, sustitución de archive, certificados firmados pero de rama equivocada, pérdida del archive index, key rotation, rollback del anchor, dos certificados para el mismo rango, crash durante seal/compact y recuperación concurrente.