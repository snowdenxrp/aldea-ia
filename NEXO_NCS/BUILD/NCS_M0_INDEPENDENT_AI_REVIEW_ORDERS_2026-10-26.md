# NCS M0 — Paquete de revisión independiente para IAs (2026-10-26)

## Propósito
Aprovechar revisiones independientes de Claude, Perplexity y Qwen sin repetir auditorías cerradas ni permitir que una revisión externa se convierta automáticamente en autoridad de diseño o en cambio de código.

## Estado y límites
- Este archivo es una orden de trabajo documental para copiar en cada IA; no afirma que ninguna IA haya sido contactada ni que haya respondido.
- Rama de referencia: `ncs-clean-architecture`.
- Entrada obligatoria: `NEXO_NCS/STATUS.md`, luego criterios de salida M0 y el gate de `COMMIT.UNKNOWN`.
- Decisión vigente: opción A ratificada para M0. `COMMIT.UNKNOWN` permanece sin resolver; no reintento automático ni efectos protegidos derivados del intento incierto.
- No modificar runtime, tests, workflows, PRs ni configuración. No fusionar nada. No reabrir auditorías previas salvo que una evidencia nueva y concreta contradiga una decisión canónica.
- Distinguir siempre: hallazgo, inferencia, propuesta, evidencia ejecutada y CI real. Si no hay evidencia, marcar `UNKNOWN/PENDING`.
- M0 sigue `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación automática futura `PENDIENTE`.

## Orden A — Claude: crítica adversarial de la línea de meta
**Objetivo:** encontrar ambigüedades o criterios imposibles de verificar en `NEXO_NCS/BUILD/NCS_M0_EXIT_CRITERIA_PROPOSAL_2026-10-26.md`.

Entregables:
1. Tabla de cada criterio: verificable/no verificable, evidencia necesaria y posible falso positivo.
2. Hasta cinco bloqueos reales que impidan declarar M0 completo.
3. Separar los bloqueos que corresponden a M0 de los que pertenecen explícitamente a una fase posterior.
4. Proponer cambios solo como texto; no reescribir el alcance ni exigir reconciliación automática en M0.
5. No volver a hacer el censo de rutas ni repetir revisiones cerradas sin señalar un nuevo artefacto o contradicción.

## Orden B — Perplexity: fuentes primarias sobre durabilidad y límites de plataforma
**Objetivo:** reunir fuentes primarias, actuales y citables sobre garantías de escritura atómica/durabilidad, sincronización de archivos/directorios y límites de `rename()` en los sistemas operativos pertinentes.

Entregables:
1. Tabla `afirmación → fuente primaria → plataforma/condiciones → límite`.
2. Separar garantías documentadas de conclusiones inferidas.
3. Cubrir F1 (fallo/excepción de proceso), F2 (caída del sistema operativo) y F3 (pérdida de energía/almacenamiento), sin afirmar que el runtime actual los satisface.
4. Recomendar qué preguntas deben quedar pendientes si la plataforma exacta o sus garantías no están especificadas.
5. No convertir esta investigación en una recomendación para añadir journal, IDs, retries, colas, fencing o tombstones sin una necesidad de producto explícita.

## Orden C — Qwen: revisión de cobertura de pruebas y contrato UNKNOWN
**Objetivo:** comparar la matriz `NCS_M0_UNKNOWN_OUTCOME_ACCEPTANCE_TEST_MATRIX_2026-10-26.md` con el gate ratificado y detectar huecos concretos de aceptación.

Entregables:
1. Matriz por escenario: ya cubierto / parcialmente cubierto / no cubierto, con archivo/test exacto si se puede verificar.
2. Distinguir pruebas unitarias existentes de pruebas end-to-end aún ausentes.
3. Revisar en particular: no reintento automático, bloqueo de efectos protegidos, salida no terminal al consumidor y preservación de diagnóstico.
4. No afirmar que una prueba pasa sin identificar un run de CI y su HEAD.
5. No editar código ni sugerir que una coincidencia de snapshot/revisión demuestra causalidad.

## Formato de respuesta obligatorio para las tres IAs
- Resumen ejecutivo (máximo 10 líneas).
- Hallazgos con rutas/links y evidencia exacta.
- `CONFIRMADO`, `INFERENCIA`, `PROPUESTA` o `UNKNOWN` en cada afirmación relevante.
- Contradicciones con documentos canónicos, si las hay.
- No ejecutar cambios ni reclamar acciones que no se realizaron.

## Consolidación posterior
No combinar las tres respuestas en una decisión automática. Primero comparar coincidencias y desacuerdos; después registrar solo hallazgos verificables en un documento nuevo o en el STATUS. Cualquier cambio de runtime/tests/workflows requiere autorización acotada y evidencia específica.
