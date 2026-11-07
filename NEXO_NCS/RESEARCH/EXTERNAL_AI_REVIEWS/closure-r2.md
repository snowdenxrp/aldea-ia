# Cierre de publicación e integridad — MUSE-AUTONOMY-002 R2

## Alcance

Este registro cierra la publicación y la integridad documental de los artefactos R2. No declara cerrada la evaluación sustantiva de la misión ni autoriza implementación.

- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `nexo-mission-02-pdf-2026-11-05`
- Commit de publicación inicial: `96e227eb06134037fa5e01fabc8cfba4c384f476`
- Commit que contiene las tres correcciones documentales: `0ef2f2b837d8472e22c633ba3e2b3029fc47f6e9`.
- Este registro se incorpora después como constancia persistente; su propio commit queda identificado en el historial de la rama.

## Integridad de archivos publicados

SHA-256 recalculado sobre el contenido UTF-8 recuperado de la rama, con tamaño exacto en bytes:

| Archivo | Bytes | SHA-256 | Resultado |
|---|---:|---|---|
| `report-r2.md` | 101.280 | `99719452d35fcec7e1d6187f6ca9c81808fa49d683313f7d1ab0ac10b00790d1` | PASS |
| `expediente-consolidado-nexo-r2.html` | 138.565 | `f0ba66c8709866c0dbc16f80bd7b09f724833f17f83b72a9b005dab182ee5f46` | PASS |
| `hashes-r2.md` | 4.392 | `b6454b8d2a6a5a534ad30e6cb8278d2c93f21e8c7a4c3e55e830c75707046b33` | PASS externo |
| `consolidation-method.md` | 9.720 | `7295fedb65aa2c7462cd894a8ee47ba5fb534425130b6b1ac493f82ec8c24285` | PASS |

El hash del manifiesto se registra aquí, fuera del propio manifiesto, para evitar autorreferencia. Los hashes de los otros tres archivos coinciden con los valores del manifiesto R2.

## Discrepancias documentales resueltas

1. **Ruta de la nota de método:** el archivo publicado está en la raíz de `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/`; el manifiesto se corrigió para reflejar esa ruta. No existe la ruta `notes/consolidation-method.md` en esta rama.
2. **PDF/HTML:** no existe un PDF R2 independiente en el árbol de la rama. El propietario confirmó que HTML y PDF representan el mismo expediente y aceptó el HTML como entrega suficiente. El HTML es el artefacto canónico publicado. No se afirma identidad binaria ni publicación del PDF.
3. **Estado posterior a la subida:** la nota de método y el informe R2 se actualizaron para dejar constancia de la publicación y de la verificación posterior.

## Alcance exacto de los cambios posteriores a la publicación inicial

La comparación entre `96e227eb06134037fa5e01fabc8cfba4c384f476` y `0ef2f2b837d8472e22c633ba3e2b3029fc47f6e9` muestra únicamente tres archivos modificados:

- `consolidation-method.md`
- `hashes-r2.md`
- `report-r2.md`

No se modificaron código, pruebas, CI, workflows, NCS M0, P07 ni decisiones D-01 a D-12.

## Dictamen

- **Publicación e integridad documental R2:** PASS.
- **Cierre sustantivo global de MUSE-AUTONOMY-002:** PARTIAL.
- **UNKNOWN:** U1, U2, U3, U5, U6, U7, U8 y U9 permanecen abiertos; U4 permanece parcial.
- **C14:** parcialmente confirmada.
- **D-01 a D-12:** SIN DECIDIR.
- **Independencia de revisiones:** las tres pasadas fueron subagentes con contexto compartido; no se presentan como revisores externos independientes.
- **Implementación, seguridad operativa y conformidad técnica:** no demostradas por esta auditoría documental.

El PASS se limita estrictamente a la publicación e integridad de los documentos enumerados. No eleva UNKNOWN, no convierte propuestas en decisiones y no produce autorización de implementación.
