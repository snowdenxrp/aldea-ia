# NCS M0 — Decisión de diseño: inicialización explícita de estado ausente

**Fecha:** 2026-10-26  
**Estado:** Decisión de diseño aceptada por el propietario; pendiente de incorporación/verificación en el estado canónico.  
**Alcance:** Diseño de persistencia para NCS M0. Este documento no modifica el runtime ni demuestra que el comportamiento esté implementado.

## Decisión

Adoptar la **opción B: inicialización explícita, separada del commit condicional normal**.

La ausencia de un archivo de estado no constituye autorización para inicializarlo. El commit condicional normal no debe convertir silenciosamente un estado ausente o inválido en un estado inicial.

## Reglas normativas

1. **Estado ausente:** el commit condicional normal no inicializa automáticamente. Solo una operación de inicialización explícita puede crear el estado inicial.
2. **Precondiciones de inicialización:** antes de implementar, deben definirse y verificarse la autoridad requerida, el esquema inicial válido, las condiciones de exclusión de escritores concurrentes y el resultado observable.
3. **Estado existente corrupto o inválido:** rechazar la operación y preservar los bytes existentes. No reinterpretar el archivo como estado vacío ni sobrescribirlo.
4. **Escritor concurrente:** si otro escritor crea o cambia el estado durante la inicialización, detectar el conflicto y no sobrescribir su resultado.
5. **Persistencia indeterminada:** devolver/conservar UNKNOWN cuando no pueda establecerse el resultado. No reintentar automáticamente ni afirmar persisted:false sin evidencia suficiente.
6. **Separación de evidencia:** una decisión de diseño no equivale a implementación, pruebas aprobadas ni CI verificado.

## Matriz de comportamiento esperada

| Condición | Comportamiento esperado |
|---|---|
| Archivo ausente y se invoca un commit normal | Detenerse; no auto-inicializar |
| Archivo ausente y se solicita inicialización explícita | Evaluar precondiciones y autoridad definidas; si no pueden probarse, STOP/UNKNOWN |
| Archivo existente corrupto o con esquema inválido | Rechazar y preservar el contenido existente |
| Otro escritor gana la carrera de inicialización | Informar conflicto; no sobrescribir |
| Resultado de persistencia incierto | UNKNOWN; sin reintento automático |

## Trabajo pendiente antes de implementación

- Definir el contrato exacto de la operación explícita de inicialización.
- Definir cómo se demuestra autoridad legítima y cómo se excluyen/detectan escritores concurrentes.
- Implementar y probar los casos G1–G4 del diseño de regresión existente, solo tras autorización específica para cambios de runtime/pruebas.
- Resolver por separado la integración del consumidor canónico y la semántica de durabilidad F2/F3.
- Actualizar NEXO_NCS/STATUS.md únicamente cuando el cambio documental pueda hacerse y verificarse; mantener M0 incompleto hasta que se cumplan los criterios de salida.

## Límites

Este documento no autoriza cambios de runtime, pruebas, workflows ni ejecución de CI. No demuestra que la inicialización explícita exista en el código. Los gates canónicos permanecen: M0 INCOMPLETO; autoridad raíz PENDING/UNKNOWN; autorización NOT_EVALUATED; efectos protegidos STOP; reconciliación general no integrada.
