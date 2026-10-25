# NCS M0 — paquete compacto de decisiones del propietario P-01 a P-05
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: preparado para decisión; ninguna opción queda seleccionada por este documento.

## Estado canónico preservado
M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Este paquete reduce las decisiones a sus dependencias reales. No sustituye los contratos detallados ni ratifica políticas. No modifica runtime/tests/workflows y no ejecuta pruebas/CI.

## Dependencias

```text
P-01 bootstrap y ROOT_READY
  └─ define cómo se obtiene una raíz inicial íntegra sin bootstrap implícito
       └─ condiciona P-05: cómo resolver un estado parcial/liberación incierta

P-03 alcance de admisión
  └─ define qué lecturas/snapshots quedan protegidos y cuándo empieza la admisión
       └─ P-04 asigna un único dueño efectivo por flujo, incluido Chronicle hijo
            └─ P-05 define cuándo la incertidumbre bloquea y qué evidencia permite readmisión

P-02 Nexo/Lúmina
  └─ fronteras de estado/dependencias deben estar definidas antes del refactor mínimo

P-01/P-02/P-03/P-04/P-05
  └─ contrato de diseño coherente → autorización separada → implementación/tests → CI por SHA
```

## P-01 — bootstrap de raíz

**Pregunta que requiere decisión:** ¿el despliegue inicial puede exigir una instalación manual/offline con todos los escritores, launchers, supervisores y actores de limpieza detenidos y con capacidad demostrable de no relanzarlos durante la operación?

- Si el propietario confirma que sí: la alternativa offline/quiescencia puede seguir evaluándose como candidata; todavía exige predicados de integridad, autoridad operacional, identidad de objeto, resultado/exit y tests. No queda automáticamente aprobada.
- Si confirma que no: no escoger B/C/D por descarte. Primero debe caracterizarse el filesystem y el entorno reales para saber si existe una alternativa demostrable.
- Si el entorno no se conoce o no puede demostrar quiescencia: `UNKNOWN/BLOCKED`; no bootstrap ni readmisión implícitos.

## P-02 — frontera Nexo/Lúmina

**Regla de diseño vigente:** definir primero estado propio, propietario de cada dato y dependencias permitidas/prohibidas; después elegir el refactor mínimo.

Antes de elegir refactor hay que clasificar, al menos, los flujos implicados por `assistants.mjs`, `simulate.mjs` y rutas relacionadas: quién escribe cada estado, quién lo lee, si el estado es de Nexo o de Lúmina, y qué comportamiento existente debe preservarse. No se presume aislamiento físico ni se propone desactivar la persistencia de Lúmina.

## P-03 — admisión antes de lectura persistente

El contrato propuesto debe precisar: (1) primera lectura protegida; (2) admisión efectiva y propietario; (3) duración hasta terminar de consumir el snapshot; (4) escrituras cubiertas; (5) qué APIs/CLI/procesos hijos quedan en el alcance; (6) comportamiento cerrado ante fallo. Las consultas y previews no se excluyen solo por ser de lectura.

## P-04 — propietario y composición de locks

El contrato debe identificar un único dueño efectivo por flujo y prohibir reentrada accidental. En el flujo padre/hijo Chronicle, no debe asumirse que el hijo hereda admisión solo porque recibe `--root`; tampoco debe mantenerse el padre esperando al hijo mientras conserva un lock no reentrante que el hijo necesita. La decisión de primitiva debe seguir a la caracterización, no precederla.

## P-05 — release incierto y readmisión

Separar siempre: (a) resultado de negocio/persistencia, (b) resultado de liberación, (c) autorización de readmisión. Si la liberación es incierta, estado `UNKNOWN/BLOCKED`; no retry automático de negocio. La desaparición de un path no prueba que el actor previo haya terminado ni que el objeto retirado fuera el mismo lock.

Dos familias de recuperación están descritas, sin elegir: (A) quiescencia externa demostrada; (B) mecanismo de filesystem ligado a la identidad del mismo objeto de lock bajo un modelo cooperativo explícito. No elegir una hasta demostrar sus precondiciones en el entorno real.

## Orden recomendado de resolución

1. Confirmar el requisito operativo de instalación inicial que condiciona P-01.
2. Delimitar el mapa de estado/dependencias Nexo/Lúmina para P-02 sin refactor todavía.
3. Cerrar el alcance de admisión y el snapshot de P-03.
4. Asignar dueño efectivo por flujo y documentar composición padre/hijo para P-04.
5. Seleccionar una política verificable para P-05 solo cuando las precondiciones de P-01/P-04 estén claras.
6. Alinear P-08/P-09 y el inventario de callers con esos contratos; reutilizar el snapshot vigente y no repetir el censo completo.
7. Revisar criterios A–E de M0; preparar la autorización separada para implementación y pruebas. No implementar ni ejecutar CI antes de esa autorización.

## Lo que este paquete NO decide

- No selecciona bootstrap A/B/C/D ni recuperación A/B.
- No declara que el entorno permita demostrar quiescencia.
- No decide el refactor Nexo/Lúmina.
- No declara que las lecturas persistentes actuales estén cubiertas por admisión.
- No afirma que los locks actuales eviten deadlock o soporten readmisión segura.
- No autoriza implementación, tests, workflows, commissioning ni efectos protegidos.

## Trazabilidad de fuentes existentes

- Registro canónico de decisiones: `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, sección 8.2 (P-01…P-10).
- Línea de meta: `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`.
- Contrato raíz: `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`.
- Especificación admisión/ownership: `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`.
- Especificación release incierto: `NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`.
- Revisión de brechas bootstrap: `NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`.
- Matriz de opciones bootstrap: `NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md`.
- Grafo de dependencias D2: `NCS_M0_D2_CLOSURE_DEPENDENCY_GRAPH_2026-10-25.md`.
- Matriz de estado de criterios M0: `NCS_M0_ACCEPTANCE_CRITERIA_EVIDENCE_STATUS_2026-10-25.md`.

## Verificación
Documento de preparación de decisiones solamente. No pruebas/CI; no cambios de runtime/tests/workflows. El estado canónico permanece sin cambios.