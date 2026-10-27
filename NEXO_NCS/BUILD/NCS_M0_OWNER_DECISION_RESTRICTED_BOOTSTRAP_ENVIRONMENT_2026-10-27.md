# NCS M0 — decisión del propietario sobre el alcance operativo de exclusión en el bootstrap de Continuity

**Fecha:** 2026-10-27  
**Rama:** `ncs-clean-architecture`  
**Tipo:** decisión normativa del propietario — pendiente de incorporación canónica completa  
**Estado:** DISEÑO DOCUMENTAL — ENTORNO AÚN NO DEFINIDO NI DEMOSTRADO — NO IMPLEMENTADO — NO EJECUTADO

## 1. Decisión explícita del propietario

El propietario decide permitir que la primera publicación de Continuity en M0 opere bajo un **entorno operativo restringido**, siempre que sus precondiciones sean **explícitas y verificables**.

Texto de la decisión recibida:

> Decisión del propietario para NCS M0: elijo permitir un entorno operativo restringido para la primera publicación de Continuity, con precondiciones explícitas y verificables. Aún debe definirse y demostrarse ese entorno; registrar como decisión normativa pendiente de incorporación canónica. No implica implementación, pruebas ni autorización de efectos protegidos.

Esta decisión elige el alcance de garantía permitido; **no declara que el entorno ya exista, que sus precondiciones estén definidas o que se hayan demostrado**.

## 2. Efecto normativo limitado

- La garantía de exclusión de la primera publicación puede formularse para un entorno operativo restringido, en vez de prometer cobertura universal frente a cualquier proceso local no cooperativo.
- El entorno concreto, las clases de escritores cubiertas, las precondiciones operativas y el método para comprobarlas siguen pendientes de especificación y evidencia.
- Si no se puede demostrar que las precondiciones se cumplen en el entorno objetivo, la primera publicación permanece en `STOP / UNKNOWN`; no se presume exclusión ni se permite continuar por descarte.
- La regla previamente documentada de no sobrescribir el estado creado o cambiado por otro escritor sigue siendo un requisito de comportamiento pertinente; no sustituye la definición del alcance ni demuestra implementación.
- No se elige una primitiva de filesystem, estrategia de lock, procedimiento de quiescencia ni opción técnica de bootstrap por esta decisión.

## 3. Lo que esta decisión NO autoriza ni resuelve

- No autoriza implementación, cambios de runtime/tests/workflows/configuración ejecutable ni cambios del dispositivo.
- No autoriza ejecutar tests, CI o GitHub Actions.
- No autoriza la primera creación real de Continuity ni efectos protegidos.
- No establece autoridad raíz legítima, `ROOT_READY`, commissioning ni autorización de dispatch.
- No ratifica como aprobado el protocolo D3 de quiescencia legacy; su alcance sigue siendo distinto y su estado sigue siendo propuesta no aprobada/no ejecutada.
- No cierra por sí sola P-01 ni los criterios P01-C/D/E/F/H.

## 4. Trabajo documental pendiente, acotado

Antes de considerar cerrado el diseño de exclusión/bootstrap, registrar y poder verificar:

1. El límite operativo exacto del entorno admitido para la primera publicación.
2. Qué clases de escritores/procesos quedan dentro de ese límite y cuáles quedan fuera por precondición explícita.
3. Las precondiciones que impiden que escritores fuera del alcance puedan escribir en el objeto/ruta objetivo durante la inicialización.
4. La evidencia observable necesaria para confirmar esas precondiciones antes de publicar; si la evidencia falta, es ambigua o no se puede mantener, resultado `STOP / UNKNOWN`.
5. Cómo se enlaza esa evidencia con el objeto/ruta efectivos y con la revisión exacta del código/contrato, sin convertir análisis estático en prueba dinámica.

No duplicar los inventarios, análisis de callers, propuesta de bootstrap ni protocolo D3 ya existentes. Reconciliar y actualizar los artefactos canónicos existentes cuando corresponda.

## 5. Estado que permanece vigente

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`; P01-C/D/E/F/H no se consideran cerrados por esta decisión.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos: `STOP`.
- Runtime/tests/workflows/configuración ejecutable/dispositivo: sin cambios.
- Tests/CI/Actions: no ejecutados.

## 6. Continuidad exacta

Siguiente paso: convertir la decisión de alcance en un contrato documental verificable para el entorno restringido, reutilizando los artefactos M0/P-01 existentes. No elegir mecanismo técnico ni declarar cumplidas las precondiciones sin evidencia. Mantener `STOP / UNKNOWN` hasta que el entorno se defina y se demuestre. Cualquier implementación o ejecución futura requiere autorización separada y explícita.
