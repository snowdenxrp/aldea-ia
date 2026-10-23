# NCS M0 — matriz de decisiones de diseño D0/D2/D3

Fecha: 2026-10-23  
Rama objetivo: `ncs-clean-architecture`  
Estado: **PAQUETE DE DECISIÓN; PROPUESTAS NO APROBADAS; SIN IMPLEMENTACIÓN**

## 1. Propósito y regla de evidencia

Este documento reduce las decisiones abiertas a contratos verificables, separando hechos observados, recomendación técnica y decisión que corresponde al propietario. No declara cerradas D0/D1/D2/D3, no autoriza cambios de runtime/tests/workflows y no confiere autoridad ni permite efectos.

Estado constitucional sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## 2. Hechos ya observados (no volver a investigar sin cambio de snapshot)

- `scripts/nexo.mjs` es la CLI principal y hoy acepta rutas legacy; su append inicia `scripts/nexo-chronicle-session.mjs` mediante `spawnSync`.
- La sesión Chronicle puede ejecutarse directamente y acepta rutas legacy propias; no puede depender de que el padre la haya protegido.
- `assistants.mjs` abre Continuity con `legacyMemory`, registra misión y persiste por separado memoria Lúmina y world state. No existe atomicidad demostrada entre los tres almacenes.
- `simulate.mjs` puede abrir/inicializar Continuity y mantiene un lock separado para world state, con semántica distinta.
- `openNexoContinuityOwner({ legacyMemory })` puede migrar memoria legacy; por tanto, abrir el owner no es una operación inocua de solo lectura.
- `continuity-store.mjs` y `chronicle-store.mjs` permiten lecturas `loadCurrent()` sin adquirir el lock de mutación.
- Los locks actuales de Continuity y Chronicle no son equivalentes en owner metadata, recuperación y liberación. No refactorizar ni reemplazar uno por otro sin caracterización.
- Censo y allowlist actuales están preservados en:
  - [Censo de referencias](../RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md)
  - [Allowlist D1 borrador](../RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md)
  - [Reconciliación de callers](NCS_M0_D1_CALLER_RECONCILIATION_AND_LOCK_SCOPE_2026-10-23.md)

Estos hechos describen la fuente revisada; no prueban un grafo transitivo cerrado ni un runtime de admisión funcional.

## 3. Matriz de decisión

| ID | Pregunta que debe quedar resuelta | Recomendación técnica | Alternativa/riesgo que debe aceptarse explícitamente | Criterio de cierre |
|---|---|---|---|---|
| D1-S0 | ¿Cómo resolver el ciclo “D1 exige test” vs “no tocar tests hasta cerrar diseño”? | Separar `D1-DESIGN` (inventario, allowlist, algoritmo y fixtures especificados) de `D1-IMPLEMENTATION` (test codificado y ejecutado después de cerrar D1/D2/D3 de diseño). | Mantener un único D1 exige cambiar la regla de secuencia; de lo contrario el proceso queda bloqueado lógicamente. | La secuencia queda registrada como decisión del propietario. Hasta entonces D1 permanece OPEN. |
| D0-C1 | ¿Qué interfaz determina la raíz? | Un único argumento explícito `--root` en los entrypoints de instancia; primera versión sin fallback de entorno. Rechazar las rutas legacy `--continuity`/`--chronicle` en modo instancia. | Permitir env como transporte requiere precedencia fija, prueba de conflicto y definición de si el env sirve a procesos hijos. No aceptar combinación silenciosa de root + rutas sueltas. | Tabla de precedencia y códigos de error aprobados; entradas ambiguas se rechazan antes de I/O de stores. |
| D0-C2 | ¿Se crea la raíz durante operación normal? | No. La raíz debe existir y ser directorio; bootstrap explícito y separado. | Auto-crear durante consulta hace indistinguibles typo, ruta equivocada y bootstrap autorizado. | Tests de raíz inexistente, archivo en lugar de directorio y bootstrap explícito; cero escrituras en modo consulta. |
| D0-C3 | ¿Qué alias y symlinks se admiten? | Canonicalizar la raíz existente y rechazar symlinks en nombres reservados de stores/lock; declarar el límite frente a TOCTOU hostil. No afirmar que `realpath` resuelve hard links/bind mounts. | Aceptar alias puede producir dos locks para una misma persistencia; rechazar todo symlink puede limitar layouts válidos. | Política concreta para raíz symlink, store symlink, symlink roto, destino externo, conflicto archivo/directorio y temporales ambiguos; pruebas de cada caso. |
| D0-C4 | ¿Se permite migración automática de memoria legacy? | No. Migración/bootstrap solo por comando/modo explícito, con plan previo verificable, sin dual-write ni merge heurístico. | La migración automática mantiene compatibilidad superficial pero puede mutar al ejecutar `assistants`, `simulate` o una consulta. | Dry-run manifiesta fuentes/destinos; copia/verificación, cutover y rollback definidos; fuente original preservada. |
| D1-C1 | ¿Qué pasa con `simulate`? | Separar simulación/world state de la persistencia Nexo ordinaria; no abrir owner ni migrar Continuity incidentalmente. | Mantener integración exige definir una operación de instancia explícita y el contrato de concurrencia entre world state y Nexo; no se puede prometer atomicidad multi-store existente. | Caller clasificado y tests negativos que prueban ausencia de apertura/migración incidental o integración admitida explícita. |
| D1-C2 | ¿Qué pasa con `assistants`? | Análisis Lúmina fuera de la sección crítica; leer snapshot/revisión mediante API admitida y escribir misión con commit condicional contra esa revisión. Conflicto = error explícito, sin retry silencioso. | Mantener escritura directa permite bypass; retener lock durante análisis externo alarga sección crítica y no hace atómicas Lúmina/world state/Continuity. | Contrato de revisión, conflicto y errores; pruebas de revisión cambiada y de cero writes antes de admisión. |
| D1-C3 | ¿Cómo tratar APIs path-based y factories? | Una única API pública de instancia; factories/owner path-based internos o TEST_ONLY. Queries y previews también pasan admisión antes de cargar snapshots. | Mantener API pública path-based hace imposible afirmar que todo caller productivo se admite. | Allowlist transitivo ejecutable; todos los edges clasificados; import no resuelto/dinámico no clasificado = UNKNOWN/BLOCKED. |
| D2-C1 | ¿Cuál es el alcance del lock de instancia? | Adquirir antes de la primera lectura cubierta y mantenerlo durante el uso del snapshot y los writes derivados; todos los procesos cooperantes usan la misma raíz. | Liberar antes de análisis externo reduce latencia, pero acepta snapshots retenidos concurrentes y necesita commit condicional por revisión. No ocultar esta degradación de garantía. | Semántica de sección crítica elegida y pruebas multiproceso de lecturas, writes y conflicto de revisión. |
| D2-C2 | ¿Lock de raíz nuevo o unificar locks existentes? | Caracterizar primero ambos protocolos; preservar locks per-store. Preferir una primitiva común solo si mantiene equivalencia de errores, metadata, stale, release y persistencia. | Tercera implementación duplicada añade divergencia; reemplazo prematuro puede borrar invariantes existentes. | Matriz de caracterización de ambos stores y decisión basada en tests; no refactor antes. |
| D2-C3 | ¿Qué pasa ante lock corrupto/stale/release incierto? | Fail-closed; timeout acotado; token para release; no borrar stale automáticamente; recuperación explícita. | Borrar automáticamente puede robar una sección crítica; bloquear permanentemente requiere una ruta operativa de recuperación documentada. | Estados/códigos, presupuesto de lectura del owner, timeout, stale y recuperación probados en multiproceso; valores numéricos aún no aprobados. |
| D2-C4 | ¿Puede el hijo Chronicle compartir el lock del padre? | No mantener el lock del padre mientras espera un hijo que debe adquirir el mismo lock. El hijo valida root y adquiere por sí mismo; el padre no conserva lock durante `spawnSync`. | Si se necesita una operación padre+hijo atómica, cambiar la arquitectura a una sola frontera de proceso o diseñar transferencia explícita de lease; no introducir reentrada implícita. | Test directo del hijo, test de padre/hijo sin deadlock y rechazo de rutas contradictorias. |
| D3-C1 | ¿Cómo hacer cutover/rollback? | Dry-run → manifiesto de fuentes y hashes → copia sin mutar origen → validación → cutover explícito → rollback documentado. Sin merge/dual-write automáticos. | Cutover manual es más lento; auto-merge puede perder procedencia o mezclar snapshots incompatibles. | Procedimiento reproducible y pruebas de interrupción antes/después de cada fase; origen conservado hasta aceptación. |
| D3-C2 | ¿Qué promete el lock? | Solo exclusión entre procesos cooperantes que usan la API; no identidad, autoridad, sandbox, cuota exacta de heap/disco ni durabilidad frente a pérdida de energía. | Afirmaciones más fuertes requieren mecanismos y evidencia adicionales que no existen en este contrato. | Las garantías públicas/documentales coinciden con los límites demostrados. |

## 4. Recomendación de secuencia (no es una decisión ya tomada)

1. Registrar la decisión del propietario sobre `D1-DESIGN` frente a `D1-IMPLEMENTATION`.
2. Congelar las subdecisiones D0-C1…C4 y D1-C1…C3 como contrato de entrada.
3. Caracterizar locks actuales antes de escoger D2-C2; definir alcance D2-C1 y errores D2-C3/C4.
4. Definir migración/rollback D3-C1 y límites de garantía D3-C2.
5. Con contratos documentales completos, revisar el grafo/allowlist y cerrar solo la puerta de diseño con evidencia trazable.
6. Implementar después, por cambio separado y autorización explícita; ejecutar pruebas locales/CI y registrar el SHA exacto. La existencia del diseño no equivale a implementación ni a autorización de efectos.

## 5. No-go invariants

- La raíz/lock no demuestra identidad, propiedad legítima, autorización ni commissioning.
- No habilitar repair, dispatch, settlement ni efectos protegidos por adquirir admisión.
- No abrir/migrar stores durante parseo, validación de configuración o previews.
- No mezclar Lúmina/world state dentro de la raíz Nexo ni declarar atomicidad multi-store no demostrada.
- No ocultar UNKNOWN, lock corrupto, módulo no resuelto, conflicto de revisión ni fallo de release como PASS.
- No cambiar runtime/tests/workflows hasta resolver la secuencia de diseño y cerrar los contratos D0/D1/D2/D3.

## 6. Estado al crear este documento

Documento de análisis únicamente. No se modificó runtime, tests ni workflows; no se ejecutaron tests ni CI. D0/D1/D2/D3 siguen OPEN. El documento no sustituye el contrato principal ni el STATUS canónico.
