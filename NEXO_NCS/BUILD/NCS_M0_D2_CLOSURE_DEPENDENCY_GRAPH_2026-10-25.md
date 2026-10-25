# NCS M0 — grafo de dependencias para cierre D2
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Tipo: consolidación documental; no ratifica decisiones ni autoriza implementación.

## Estado de control
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; D2/D3 `OPEN`; Authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

No se modifican runtime, tests, workflows ni datos operativos. No se ejecutaron tests/CI.

## Grafo resumido

```text
O-08 raíz explícita (ratificado como principio)
  ├─> P-01 bootstrap/root readiness (pendiente de decisión + contrato)
  │     ├─> predicados BOOTSTRAP_PARTIAL → ROOT_READY
  │     └─> evidencia de autoridad, integridad, quiescencia y resultado
  ├─> P-08 gramática CLI/compatibilidad (detalles abiertos)
  └─> P-09 cobertura de callers/entrypoints (evidencia exacta pendiente)

O-10 admisión antes de lectura persistente (ratificado como principio)
  └─> P-03 alcance de admisión (especificación propuesta, no cerrada)
        ├─> P-04 propietario único de admisión por flujo (propuesta, no cerrada)
        │     └─> padre/hijo Chronicle sin reentrada ni deadlock
        └─> pruebas de aceptación vinculadas a fuentes/SHA

P-05 release incierto/readmisión (pendiente)
  ├─> requiere política explícita de recuperación/quiescencia o identidad
  ├─> debe coordinar con P-01 y P-04
  └─> si la evidencia no basta: UNKNOWN/BLOCKED; no reintentar operación de negocio

D1 caller/owner boundaries + D2 admission/release contracts
  └─> pruebas de composición y evidencia reproducible
        └─> solo después de decisiones/puertas aprobadas se puede plantear
            autorización separada para implementación y tests
```

## Clasificación de lo que bloquea el cierre

| Elemento | Situación actual | Qué puede cerrarlo | Qué NO cuenta como cierre |
|---|---|---|---|
| O-08 raíz explícita | Principio ratificado | Preservarlo y alinear contratos derivados | Volver a preguntar si la raíz debe ser explícita |
| P-01 bootstrap | Política concreta abierta | Decisión del propietario + contrato verificable de estados y salidas | Elegir A/B/C/D por recomendación del asistente |
| P-03 admisión | Especificación propuesta | Ratificación de alcance y criterios de lectura/snapshot/escritura | Tratar el documento como implementación |
| P-04 ownership | Especificación propuesta | Ratificar dueño por flujo, incluida sesión hija Chronicle y recuperación | Asumir que el lock actual ya cumple |
| P-05 release/readmisión | Propuesta E1–E9; A/B sin elegir | Política aprobada y evidencia verificable para cada transición | Inferir release a partir de que el path no existe |
| P-08 CLI/root | Detalles abiertos | Gramática exacta, compatibilidad y reglas de resolución aprobadas | Confundir `--root` en una propuesta con contrato implementado |
| P-09 callers/entrypoints | Cobertura reproducible no cerrada | Snapshot/árbol exactos, grafo trazable y pruebas negativas autorizadas posteriormente | Repetir el barrido de 188 archivos sin nueva causa |
| D3 entorno/migración | Entorno objetivo y control de launchers no demostrados | Perfil real del despliegue y evidencia de quiescencia/rollback | Presuponer un sistema operativo o supervisor |

## Dependencias críticas y orden seguro

1. Mantener O-08/O-10 como principios ya ratificados; no reabrirlos.
2. Resolver P-01 a nivel de decisión de propietario. La matriz existente compara alternativas, pero no elige ninguna. La pregunta operacional relevante es si el despliegue inicial puede exigir instalación manual/offline y quiescencia realmente demostrable. Si esto no puede afirmarse con conocimiento del entorno, registrar UNKNOWN; no inferir.
3. Cerrar la especificación P-03/P-04 en diseño: primera lectura persistente bajo admisión efectiva, alcance del snapshot, único propietario por flujo, y comportamiento padre/hijo Chronicle.
4. Resolver P-05 junto con P-01/P-04: separar resultado de negocio, release y readmisión; cualquier incertidumbre bloquea nuevas operaciones hasta evidencia suficiente.
5. Alinear gramática CLI y caller coverage (P-08/P-09) con los contratos aprobados. Mantener referencias de fuente fijadas; no declarar cobertura total a partir de un grep incompleto.
6. Solo después: preparar el paquete de aceptación que conecte requisitos, casos negativos, fuente/SHA, comandos exactos y resultados CI. La implementación sigue prohibida hasta autorización explícita separada.

## Límites de conclusión

- Este grafo es una síntesis de dependencias documentales, no una nueva decisión normativa ni una auditoría completa del repositorio.
- Las especificaciones P-03/P-04/P-05 y la matriz bootstrap son propuestas; sus nombres/IDs no implican ratificación.
- No se declara que el sistema actual aplique admisión previa a todas las lecturas ni que la recuperación sea segura.
- UNKNOWN/BLOCKED es un estado válido. La ausencia de evidencia no demuestra ausencia de actores, writers o bypasses.
- No se selecciona bootstrap A/B/C/D ni recuperación A/B. No se crea un mecanismo nuevo.
- No se ejecutaron pruebas ni CI; no se modificaron runtime/tests/workflows.