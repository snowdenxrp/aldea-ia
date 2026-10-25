# NCS M0 — contraste de bootstrap contra el registro de decisiones

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **CONTRASTE DOCUMENTAL — NO ES RATIFICACIÓN NI AUTORIZACIÓN**

## Fuentes revisadas

- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `d5d62906b365dcfbefa4b5606dcafbce842a75b6`.
- `NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md`, blob `c80b10def7b1151f6f328088e23d9c67742d00c9`.
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`, blob `bac9493af98c3f86001e323dab153bdee78b5f31`.
- `NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob revisado `e184a52033e265021ee66d6b020fecab6024ed2a`.

## Resultado exacto del contraste

El registro §8.1 ratifica **O-08**: raíz explícita única `--root`, sin bootstrap implícito, canonicalización antes de derivar rutas y sin fallback/migración automática en el alcance acordado. El propio O-08 declara expresamente que no selecciona el protocolo concreto de bootstrap.

El registro §8.2 mantiene **P-01** como pendiente: seleccionar el protocolo explícito de bootstrap y demostrar cómo se garantiza la quiescencia; publicación atómica solo si el filesystem ofrece garantías verificables.

Por tanto:
- La aceptación de los principios de raíz no ratifica la Opción A de D0-C2.
- La recomendación provisional de D0-C2 (bootstrap offline con quiescencia demostrable si es operacionalmente viable) sigue siendo recomendación, no decisión.
- No existe en los documentos revisados una ratificación explícita de A, B, C o D para el bootstrap.
- Tampoco existe una decisión explícita de mantener permanentemente `UNKNOWN/BLOCKED` como política definitiva; ese estado es la conducta conservadora mientras el diseño siga abierto, no una elección permanente inferida.

## Dependencia con P-05

El registro §8.2 mantiene P-05 pendiente. La especificación P-05 define requisitos de evidencia, pero no elige recuperación externa, mecanismo de filesystem ni bloqueo indefinido. Para que una recuperación de bootstrap sea admisible, su política debe coordinarse con el tratamiento de release/limpieza inciertos: no basta con declarar quiescencia para un instante si no se demuestra que ningún actor anterior puede continuar o reanudarse durante la intervención.

## Próxima acción documental

No se debe pedir al usuario que elija de nuevo una decisión que ya conste ratificada. En las fuentes revisadas no consta la selección de política de bootstrap; por ello el siguiente trabajo válido es precisar las obligaciones y evidencia de cada alternativa sin convertir la recomendación en ratificación. No se debe crear un comando/protocolo ejecutable ni editar runtime/tests/workflows sin autorización explícita.

## Estado canónico

M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Solo documentación; no tests ni CI.
