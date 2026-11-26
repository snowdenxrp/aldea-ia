# NCS M0 — Instrucción para Qwen: reconciliación lógica del delta Claude

Fecha: 2026-11-26
Repositorio: `snowdenxrp/aldea-ia`
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot de producto: `d8b5ca8720908d926acc18130614cce132a43b5d`

## Documentos obligatorios

1. `NEXO_NCS/BUILD/NCS_M0_P05_P07_WRITER_EXCLUSION_FRONTIER_AFTER_TERMUX_2026-11-26.md`
2. `NEXO_NCS/BUILD/NCS_M0_O7_P07C_P05_CONTRACTS_COVERAGE_AND_ENFORCEMENT_2026-11-26.md`
3. `NEXO_NCS/BUILD/NCS_M0_CLAUDE_ADVERSARIAL_O7_P09_DELTA_2026-11-26.md`

Verifica el código en el snapshot indicado cuando sea necesario. No tomes el informe Claude como autoridad automática: separa evidencia fuente, reproducciones reportadas y conclusiones inferidas.

## Misión acotada

Realiza una auditoría lógica independiente del delta Claude. No repitas la auditoría general O7 ni la investigación histórica de locks. Tu trabajo es determinar qué hallazgos realmente contradicen los contratos, cuáles son omisiones de inventario y cuáles siguen siendo hipótesis condicionadas.

### A. Reconciliación H1–H9

Para cada hallazgo H1–H9 entrega:
- afirmación exacta;
- evidencia fuente directa y su alcance;
- reproducción reportada por Claude vs. evidencia que tú verificaste;
- si afecta directamente Continuity, un auxiliar de coordinación, otro activo o solo el repositorio;
- relación con O7, P09, P07-A/B, P07-C y P05;
- clasificación: CONFIRMED / CONTRADICTED / PARTIAL / UNKNOWN;
- qué evidencia mínima cambiaría esa clasificación.

### B. Preguntas críticas

1. ¿H1 obliga a clasificar O7 como CONTRADICTED dentro del alcance actual, o el alcance R1 permite excluir configuración por entorno? No decidas la política del propietario: presenta las alternativas y sus consecuencias.
2. ¿H2 es una contradicción general de B3 o una capacidad latente sin caller de producción demostrado? Distingue API pública/importable, adapter y grafo real de callers.
3. ¿H3 es relevante para el claim R1? Distingue actor CI que escribe archivos del repositorio de un escritor directo del store Continuity. No infieras impacto indirecto sin ruta demostrada.
4. ¿H4 prueba escritura sobre Continuity o solo rechazo de esquema al leer? Analiza por separado colisión de lock, temporal, limpieza y append. No conviertas el intento fallido de lectura en prueba de sobrescritura.
5. ¿H5 exige cambiar el claim o solo declarar el límite de confianza de paths/symlinks?
6. ¿H6 convierte loadCurrent en escritor O7 si muta únicamente lock/metadata? Depende de la definición del objeto protegido: explicita la bifurcación.
7. ¿H7 demuestra un ataque o una condición de riesgo por colisión de nombres? Determina qué contraejemplo falta.
8. ¿H8 está suficientemente sustentado por un barrido global reproducible? Distingue “únicos encontrados” de “únicos existentes”.
9. ¿H9 aporta exclusión positiva válida solo para el archivo/actor inspeccionado?

### C. Contratos y obligaciones

- Propón cambios mínimos a A1–A5 y B1–B6.
- Indica si se requiere un O10 separado para el fail-open de persistState, o si debe integrarse en una obligación existente. No ratifiques O10.
- Actualiza la relación de hallazgos con O1–O9 sin reabrir C3/G2.
- Conserva C3/G2 como DECISIÓN DEL PROPIETARIO RESUELTA: el oráculo clasifica el rol del inode antes de interpretar cambios de nlink.
- Mantén P05-C como política ratificada, P05 OPEN, P07-C UNKNOWN/BLOCKING y M0 INCOMPLETO salvo que exista evidencia válida de cambio.

## Formato de salida

1. Veredicto ejecutivo.
2. Tabla H1–H9 con estado, activo afectado y alcance de evidencia.
3. Contradicciones reales vs. riesgos condicionados vs. omisiones.
4. Correcciones mínimas de contrato.
5. Matriz H1–H9 → O1–O9 / A1–A5 / B1–B6.
6. Datos fuente que aún faltan.
7. Recomendación sobre el siguiente paso documental.

## Restricciones

- No modificar código, configuración, workflows, tests, CI, dispositivo ni bootstrap.
- No tocar PR #110 ni ramas de producto.
- No elegir primitivas ni diseñar una implementación.
- No repetir auditorías P07 ya realizadas salvo delta nuevo indispensable.
- No declarar PASS por documentación.
- No convertir ausencia de evidencia en evidencia de ausencia.
- No declarar M0 completo.
- No ejecutar pruebas nuevas que escriban en archivos protegidos.

Entrega un informe técnico breve, preciso y adversarial.