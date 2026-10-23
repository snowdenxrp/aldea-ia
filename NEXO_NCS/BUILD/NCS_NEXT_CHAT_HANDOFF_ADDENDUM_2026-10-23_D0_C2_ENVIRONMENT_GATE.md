# NCS — addendum de continuidad: gate de entorno D0-C2

Fecha: 2026-10-23. Este addendum complementa, no sustituye, el handoff maestro y el addendum D0-C2 anterior.

## Nuevo documento
Se creó NEXO_NCS/BUILD/NCS_M0_D0_C2_DECISION_READINESS_AND_ENVIRONMENT_GATE_2026-10-23.md, commit bc387fbda827f7e8bf637fc103f99b8cc6247ef8. El checkpoint contractual fue actualizado a blob 77cf2d09a59ef52e00c1487bea6944acdacda0ec.

## Hallazgo clave
El perfil de entorno aún declara runtime C y host/operador D como no determinados. Por ello, no se puede afirmar que bootstrap offline/quiescencia (opción A) sea viable hasta saber dónde se ejecutará la primera instancia que leerá/escribirá Continuity/Chronicle. La opción B depende de garantías del filesystem real; C no coordina por sí sola; D añade un lock externo y su propio problema de identidad/recuperación. Ninguna está aceptada.

## Próximo paso preciso
La única entrada factual inicial necesaria es: ¿ya existe un entorno elegido para la primera instancia Nexo que usará Continuity/Chronicle?
- Si no existe: registrar RUNTIME_TARGET = NOT_SELECTED; mantener D3 OPEN y seguir con consistencia documental portable.
- Si existe: identificar solo tipo de entorno y modo de inicio; después evaluar control verificable de writers/relanzamientos y garantías del filesystem. No pedir secretos ni datos privados.

No repetir censo de callers salvo cambio verificable de fuente. No modificar runtime/tests/workflows ni declarar CI sin decisión y autorización separada.

## Estado canónico
M0 INCOMPLETO; D0/D1/D2/D3 OPEN; runtime C / host D NOT DETERMINED; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. No tests/CI ejecutados.


## Revisión adicional recuperada
Se revisaron conversaciones anteriores, el handoff maestro disponible, el perfil D3, el gate D0-C2 y la matriz D2. No aparece una decisión de que POCO X7 Pro/M1 sea el runtime C de Continuity/Chronicle ni una selección explícita de host/operador D. Interpretar como RUNTIME_TARGET = NOT_DETERMINED (sin selección documentada), no como prueba de que ningún entorno exista. No volver a preguntar al usuario que reconstruya la investigación ni repetir el censo de callers.

También se detectó una ambigüedad documental: la matriz D2 usa ROOT_READY para la raíz existente y validada, antes de adquirir lock/validar stores; el gate D0-C2 parece usarlo para la instancia completa lista para operar. Checkpoint actualizado con la ambigüedad, commit 88b2ac292b916c5b7107cf75147274fb7cff6154, blob d1b2837a90d67e1695c1a8b41cc368faa1d6deb9. Resolver semántica documental antes de implementar; no renombrar estados ni añadir persistencia por inferencia.
