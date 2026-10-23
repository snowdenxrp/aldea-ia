# NCS — addendum de continuidad: D0-C2 bootstrap

Fecha: 2026-10-23  
Este addendum complementa el handoff maestro existente; no lo sustituye.

## Estado nuevo
Se creó `NEXO_NCS/BUILD/NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md` (commit `5cbe2e7f2fcc095296d4804dab6c30b59ad19e11`; blob actual `c80b10def7b1151f6f328088e23d9c67742d00c9`). Compara cuatro opciones de primer bootstrap: A) bootstrap offline con quiescencia operacional demostrable; B) staging y publicación atómica con arbitraje; C) marcador persistente que no coordina por sí solo; D) coordinación externa con problemas propios de identidad/recuperación.

Recomendación técnica provisional, no decisión del propietario: no habilitar bootstrap concurrente/autónomo sin protocolo probado. Considerar A solo si la quiescencia se puede imponer y evidenciar; si no, evaluar B según las garantías reales del filesystem. C/D requieren necesidad demostrada. D0-C2/D2 siguen OPEN.

Checkpoint actualizado y verificado: `NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md`, blob `2f4441847dfccfd8778036f0385836ccfefa7233`.

## Instrucciones de continuidad
1. Leer `NEXO_NCS/STATUS.md` → MASTER/CORE → BUILD y este addendum antes de continuar; usar el handoff maestro más reciente y este addendum para cambios posteriores.
2. No repetir el censo general de callers sin un snapshot de código cambiado.
3. Resolver D0-C2: criterio de `ROOT_READY`, prevención de relanzamiento durante bootstrap, tratamiento de raíz parcial y recuperación explícita.
4. Cruzar la opción escogida con D0-C3 (alias/rutas) y D2 (propiedad/release del lock); no dar por aceptada ninguna opción.
5. No modificar runtime/tests/workflows ni declarar CI hasta autorización separada y evidencia del SHA exacto.

## Estado canónico
M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. En esta sesión solo se crearon/actualizaron documentos; no se ejecutaron tests ni CI.
