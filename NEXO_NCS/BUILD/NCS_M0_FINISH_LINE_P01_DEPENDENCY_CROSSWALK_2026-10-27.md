# NCS M0 — cruce de dependencias de línea de meta y P-01 (2026-10-27)

## Propósito

Determinar, a partir de los criterios ya existentes, qué partes de P-01 bloquean realmente M0_BUILD_COMPLETE y qué gate permanece independiente. Este documento no cambia la línea de meta, no excluye criterios por inferencia y no ratifica decisiones nuevas.

## Conclusión principal

La legitimidad de la primera creación **no puede clasificarse como un asunto externo a M0 en el alcance actual**: la línea de meta exige un protocolo aprobado para el primer bootstrap y exige que las decisiones necesarias para el alcance estén resueltas. P01-A/G y las dimensiones operacionales relacionadas siguen siendo dependencias de cierre de M0 mientras el almacenamiento local inicial permanezca dentro del alcance aceptado.

En cambio, **la autorización para efectos protegidos sí es un gate separado**. M0_BUILD_COMPLETE no implica commissioning, autoridad constitucional ni permiso de dispatch/efectos. Mantener ese gate en STOP no impide por sí solo completar un M0 genuinamente no autoritativo; sí impide afirmar que el sistema está autorizado para efectos protegidos.

No hay base documental para convertir esta distinción en una exclusión automática del bootstrap de M0: la opción A limita el alcance a almacenamiento no autoritativo, pero no demuestra que el almacenamiento real cumpla esa condición ni elimina los criterios de bootstrap de la línea de meta.

## Trazabilidad criterio → dimensión P-01 → efecto sobre el cierre

| Línea de meta M0 | Dimensión relacionada | Estado/evidencia actual | Efecto |
|---|---|---|---|
| §3.A.2–3: decisiones necesarias aceptadas y contratos D0–D3 coherentes | P01-A/C/D/G; D0/D1/D2 | La matriz y los contratos candidatos existen, pero objeto, legitimidad, procedimiento, quiescencia y exclusión siguen abiertos | Bloquea M0_BUILD_COMPLETE |
| §3.B.5–7: inventario/no-bypass y separación de autoridad | P01-B/G; D1 | Mapa estático identifica rutas compuestas; no es prueba exhaustiva de runtime ni autoridad constitucional | Bloquea cualquier PASS global no demostrado |
| §3.C.9: protocolo aprobado para primer bootstrap, concurrencia, interrupción y estado parcial | P01-A/C/D/E/F/G | No hay protocolo final aprobado ni base de legitimidad local demostrada | Bloqueo directo de cierre |
| §3.C.10–13: UNKNOWN/BLOCKED, recuperación y resultados separados | P01-E/F y D2 | Contratos propuestos; comportamiento end-to-end y pruebas ligadas al SHA no verificados aquí | Bloquea cierre hasta contrato y evidencia aplicables |
| §3.D.17 y §3.E.18–20: sin brechas UNKNOWN críticas dentro del alcance; evidencia reproducible y acta final | Todas las dimensiones aplicables; P01-H | P-01 sigue OPEN/UNKNOWN; CI no se ejecutó/verificó en este trabajo | Bloquea cierre |
| §3.B.8 y §5.8: reparación/dispatch/efectos protegidos excluidos o bloqueados; gate independiente | Gate PROTECTED_EFFECTS_AUTHORIZED | Autoridad raíz y enforcement siguen PENDING/UNKNOWN / STOP | Gate de efectos continúa STOP; no se confunde con el cierre M0 |

## Consecuencia de alcance

Para quitar la primera creación de los bloqueos de M0 no basta con decir que M0 es “solo no autoritativo”. Se necesitaría una decisión explícita de alcance que excluya esa capacidad de M0 y describa qué producto/capacidad queda incompleto, junto con aceptación del riesgo y coherencia con la línea de meta. No se encontró una decisión aceptada que haga esa exclusión. No se debe redactar una exclusión como si el propietario ya la hubiera aprobado.

La ruta conservadora vigente es continuar resolviendo P01-A/G primero, luego P01-B, P01-C/D, P01-E/F y finalmente preparar P01-H después de contrato congelado y autorización independiente para pruebas. Si una dependencia no puede resolverse, M0 permanece INCOMPLETO; no se cambia su gate por una reclasificación editorial.

## Separación de evidencia

- Los documentos y mapas actuales prueban que el problema está identificado y trazado, no que el protocolo esté implementado.
- La lectura estática de consumidores no demuestra que todos los entrypoints o escritores estén controlados en el entorno real.
- No se ejecutaron tests, CI ni Actions en este trabajo. Cualquier futura afirmación de PASS necesita el SHA exacto, run/job, pasos y resultado aplicables.

## Estado canónico sin cambios

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-A/P01-G `OPEN / UNKNOWN`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz legítima `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

Documento de reconciliación analítica únicamente. No autoriza cambios ejecutables, pruebas, workflows, configuración ni CI.
