# Manifiesto SHA-256 — Copias rectificadas para revisión (MISIÓN MUSE-004)

**Misión:** MUSE-004, producción autónoma de la rectificación documental R2.
**Fecha:** 2026-11-08.
**Rama de trabajo:** `muse-autonomy-003-r2-rectification-draft-2026-11-07` (trabajo local; sin push ni merge; la integración de GitHub de Snow está NOT_CONNECTED).
**Estado:** copias de revisión, NO versión oficial. La aplicación sobre los canónicos R2 NO está autorizada.

Todos los hashes se calcularon con `sha256sum` sobre los bytes finales de cada
documento de revisión, después de la última edición. Nunca se calcularon hashes
sobre texto reconstruido, fragmentos o contenido copiado parcialmente. No se
copió ningún hash de versiones anteriores.

## Documentos de revisión

| Archivo | Ruta | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `report-r2-rectified-review.md` | `research_notes/nexo-autonomy-004/review/report-r2-rectified-review.md` | 135.870 | `5dcf73aee71a33e018eb9087361a4c150d4a886d5a4a2beeffa84d2b276f4692` |
| `closure-r2-rectified-review.md` | `research_notes/nexo-autonomy-004/review/closure-r2-rectified-review.md` | 37.652 | `ff3c0d193837cc1f4d71b479d93ec4edd8fcf6e2a88af3bc0cd79f1d83fb1100` |
| `expediente-consolidado-nexo-r2-rectified-review.html` | `research_notes/nexo-autonomy-004/review/expediente-consolidado-nexo-r2-rectified-review.html` | 171.310 | `973c5807ef54ef279bd93c3f0bd2cdd1afa48d91d3e8b9b44abb70d86f37dbd5` |
| `hashes-r2-rectification-review.md` (este manifiesto) | `research_notes/nexo-autonomy-004/review/hashes-r2-rectification-review.md` | — | — (ver nota) |

## Documentos canónicos de referencia (originales intactos, no modificados)

| Archivo | Tamaño (bytes) | SHA-256 |
|---|---|---|
| `report-r2.md` (R2 canónico) | 113.706 | `e41c8f3ba4d86d1daec958ec80ed69ac405a36eeec83ee00a9d20f94915be80a` |
| `closure-r2.md` (cierre R2) | 21.346 | `0d9ed5ff899cead26bdf413a8d753c4766f7fcb7e39136097ce80de66e16cb0f` |
| `hashes-r2.md` (manifiesto R2) | 4.450 | `cde302f068cb2e07a6e5079b2cabcd8296e555a264a4cfa0b24da15a7bb4ace4` |
| `consolidation-method.md` (nota de método R2) | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` |

## Nota sobre la autorreferencia

Este manifiesto no puede contener su propio hash de manera autocontenida: un
archivo no puede contener su propio SHA-256. El hash de
`hashes-r2-rectification-review.md` se registra como evidencia externa en
`MUSE_AUTONOMY_004_HANDOFF.md` y en el informe de entrega de la misión.

## Verificación

- Diff original → rectificado (report): 50 líneas eliminadas / 77 líneas añadidas.
- Diff original → rectificado (closure): 0 líneas eliminadas / 58 líneas añadidas.
- El HTML rectificado se verificó por extracción de texto contra el Markdown
  rectificado (40 pasajes rectificados presentes; 28 enlaces internos resuelven).
- Verificación cruzada (Fase C): 10/10 puntos PASS; §4 del paquete: 17/19 PASS.
- Revisión adversarial propia (Fase D): 0 defectos CRÍTICOS; 4 MAYORES
  (M-01–M-04) y 8 menores pendientes de corrección o decisión en el gate.
