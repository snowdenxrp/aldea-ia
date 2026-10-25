# NCS M0 — control de deriva del snapshot Git durante D1
Fecha de observación: 2026-10-24 (zona local del proyecto)
Rama de trabajo: `ncs-clean-architecture`
Estado: CONTROL DE EVIDENCIA — DOCUMENTAL — NO IMPLEMENTADO

## 1. Motivo

Las referencias a archivos por nombre de rama son lecturas del estado actual de esa rama, no una fijación permanente de los bytes revisados. La evidencia D1 debe ligar cada afirmación a un commit/tree exacto y a los blobs concretos; una lista de blobs obtenida en momentos diferentes no equivale automáticamente a un único snapshot coherente.

En el barrido de actividad del repositorio apareció el commit `4135178045434a17af67e104de2e84b94d719154`, titulado “Actualizar estado de Lúmina”, con cambios en `.lumina-assistant-memory.json` y `world-state.json`. El diff corresponde a estado persistente de la simulación, no a implementación NCS. Este registro no presupone que ese commit sea por sí solo el HEAD definitivo de la rama; sí demuestra que hay commits de estado de Lúmina que pueden mover el historial mientras se trabaja.

Referencia observada: https://github.com/snowdenxrp/aldea-ia/commit/4135178045434a17af67e104de2e84b94d719154

## 2. Regla de evidencia para D1

Antes de declarar completo un manifiesto o empezar cambios autorizados:

1. Resolver y registrar el SHA de HEAD de `ncs-clean-architecture` una sola vez para el pase.
2. Registrar el tree SHA recursivo y confirmar `truncated=false`; conservar el número de entradas.
3. Obtener todos los blobs fuente que sustenten el pase desde ese mismo commit, no mezclando respuestas de `ref=branch` tomadas en momentos distintos.
4. Si el HEAD cambia durante el pase, no combinar silenciosamente los resultados. Reiniciar la captura del snapshot o etiquetar explícitamente cada resultado como evidencia de commits distintos.
5. Mantener separados los cambios documentales NCS y los cambios automatizados de datos Lúmina. No revertir, limpiar, reescribir ni modificar los archivos de estado de Lúmina como parte de D1.
6. Los hashes de commit/blob identifican contenido; no demuestran que se ejecutaran pruebas, que se cubriera el grafo completo o que el runtime satisfaga el contrato.

## 3. Consecuencia para los artefactos existentes

El manifiesto D1 y las notas de inventario previas siguen siendo evidencia útil de los archivos y comportamientos que registran. No deben elevarse a una afirmación de “snapshot único completo” si sus fuentes se obtuvieron desde commits distintos o si no se registró el tree exacto que los contiene.

Un barrido de referencias o una búsqueda que no devuelve resultados tampoco demuestra ausencia de callers. El cierre requiere resolver todas las aristas pertinentes o marcarlas `UNKNOWN/BLOCKED`.

## 4. Alcance de seguridad

- No se ejecutó Lúmina ni se modificó su estado en esta revisión.
- No se modificó runtime, tests, workflows ni datos de la simulación.
- No se ejecutaron tests ni CI.
- Este documento no autoriza cambios de implementación.

Estado canónico preservado: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
