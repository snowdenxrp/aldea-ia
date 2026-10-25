# NCS M0 — matriz de aceptación para alternativas de bootstrap

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **MATRIZ DE EVALUACIÓN DOCUMENTAL — NINGUNA OPCIÓN SELECCIONADA**

## Propósito

Convertir las opciones ya documentadas en D0-C2 en criterios comparables para una decisión informada del propietario. No vuelve a investigar el repositorio, no añade una quinta alternativa, no ratifica una opción y no autoriza implementación.

Fuentes de diseño:
- `NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md`, blob `c80b10def7b1151f6f328088e23d9c67742d00c9`.
- `NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob `e184a52033e265021ee66d6b020fecab6024ed2a`.
- `NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.
- `NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md`, blob `aa9daecccad1aeed39651b19d1a07d1dc051631c`.

## Regla común de aceptación

Ninguna alternativa puede declarar `ROOT_READY` solo porque existe un directorio, porque faltan ciertos stores, porque un marcador dice `ready`, porque un PID parece muerto o porque una ruta de lock no aparece. Debe definir autoridad operacional, exclusión de escritores, integridad, identidad de objetos durante limpieza, relación con actores de release anteriores, resultados de salida y pruebas reproducibles. El resultado sigue `UNKNOWN/BLOCKED` cuando falta evidencia.

## Comparación de obligaciones y riesgos

| Criterio | A — Offline + quiescencia externa | B — Staging + publicación atómica | C — Marcador persistente | D — Coordinación externa |
|---|---|---|---|---|
| Precondición central | Operador impone y demuestra ausencia de escritores y relanzamientos durante toda la intervención. | El filesystem garantiza la operación de publicación requerida; todos los lectores usan la ruta final y nunca staging. | El marcador se ordena y valida correctamente, pero además requiere exclusión real entre escritores. | Identidad única y estable del recurso de coordinación fuera de la raíz. |
| Riesgo principal | La quiescencia se afirma pero no se puede probar o mantener. | “Atómico” se presume sin confirmar filesystem/volumen/semántica real; dos publicadores compiten. | El marcador puede declarar listo contenido parcial o no coordinar dos inicializadores. | El lock externo queda huérfano, colisiona, diverge de la raíz o necesita su propio protocolo de recuperación. |
| Artefacto nuevo | Ninguno persistente requerido por la opción. | Staging temporal y reglas de limpieza. | Estado persistente con formato, integridad, compatibilidad y recuperación. | Coordinador/lock externo y su contrato de identidad, permisos y limpieza. |
| Competencia de inicializadores | Se evita por precondición operacional, no se admite bootstrap concurrente. | Debe existir un único publicador ganador sin sobrescritura ni mezcla. | No se resuelve sin exclusión adicional. | Puede serializar si la identidad y el release del coordinador están probados. |
| Recuperación tras interrupción | Operador revalida quiescencia e integridad; no se asume que sea una instancia nueva. | Debe definir restos de staging, publicación incompleta y colisiones. | Debe definir estados, corrupción, orden y autoridad para cambiar el marcador. | Debe recuperar el coordinador sin asumir stale por edad/PID. |
| Dependencia de P-05 | Alta: quiescencia debe cubrir también actores anteriores de release/limpieza. | Alta: publicación/limpieza no puede borrar objetos reemplazados y no readmite con actor previo incierto. | Alta: el marcador no sustituye lock ni prueba que release previo terminó. | Crítica: el coordinador añade su propia incertidumbre de release/identidad. |
| Evidencia de salida mínima | Evidencia operacional fechada de procesos/launchers/supervisores detenidos e imposibles de relanzar durante la intervención, más validación de integridad. | Evidencia de filesystem/volumen y competencia del publicador; tests de crash y colisión. | Evidencia de orden durable, contenido completo, integridad del marcador y exclusión de escritores. | Evidencia de identidad del coordinador, exclusión, release seguro y recuperación sin colisión. |
| Límite que no puede prometer | Seguridad si no se puede mantener quiescencia. | Atomicidad universal o resistencia a consumidores que usan staging. | Exclusión concurrente por el marcador solo. | Seguridad universal sin contrato adicional de filesystem y recuperación. |

## Gate de salida común a las cuatro alternativas

Antes de seleccionar una opción, la especificación concreta deberá responder:

1. **Autoridad operacional:** qué actor puede ejecutar la instalación/recuperación y qué lo distingue de una operación normal.
2. **Quiescencia y concurrencia:** cómo se demuestra que no existe un escritor anterior y cómo se impide otro escritor durante el procedimiento.
3. **Integridad:** inventario/layout esperado, validación de stores y tratamiento de contenido preexistente sin sobrescritura ni fusión heurística.
4. **Identidad de objetos:** cómo se evita eliminar o modificar una ruta/lock sustituido entre validación y limpieza.
5. **Release anterior:** cómo se demuestra que ningún actor de release/limpieza puede seguir alterando el estado o reanudarse.
6. **Resultado exacto:** condiciones para `ROOT_READY`, rechazo definitivo de la operación actual o permanencia en `UNKNOWN/BLOCKED`; persistencia, release y readmisión se informan por separado.
7. **Reproducibilidad:** casos deterministas de interrupción/crash y competencia, tests vinculados al SHA de implementación y CI posterior a autorización independiente.

## CV-24 — Contexto real de publicación y semántica de atomicidad

**Estado:** criterio documental incorporado en esta matriz; no implica selección de B ni autorización de implementación.

La opción B no se acepta por la mera presencia de `rename`, por una prueba de laboratorio ni por asumir que dos rutas comparten un filesystem. La evaluación documental debe exigir evidencia específica del entorno para:

1. Las rutas efectivas de staging y destino, incluida su resolución.
2. El filesystem, volumen o montaje relevante y la semántica de publicación aplicable.
3. El cumplimiento de los requisitos de la operación elegida (incluido mismo filesystem cuando sea requisito).
4. El tratamiento de errores, interrupciones y colisiones, sin inferir durabilidad a partir de atomicidad.
5. La garantía de que los lectores autorizados consumen la ruta publicada y no staging.
6. La versión, configuración y alcance exacto de la evidencia.

FBE, FUSE, montajes separados y capas de abstracción se evalúan cuando sean pertinentes; su presencia por sí sola no prueba fallo, y su ausencia no prueba seguridad. Si faltan evidencias necesarias, la opción B queda `UNKNOWN/BLOCKED` para ese entorno. No se declara `ROOT_READY`.

## CV-25 — Límite de extrapolación entre entornos

**Estado:** regla transversal referenciada desde esta matriz.

Toda evidencia debe identificar el entorno al que se limita. Un resultado favorable en análisis estático, simulación, laboratorio o un dispositivo distinto no demuestra automáticamente el mismo comportamiento en el POCO X7 Pro. Si una afirmación depende de propiedades específicas del entorno objetivo, debe contar con evidencia operacional pertinente de ese entorno. La equivalencia de condiciones debe justificarse; cuando no pueda demostrarse, el resultado para el entorno objetivo permanece `UNKNOWN/BLOCKED`.

## CV-26 — Separación entre preparación local, autoridad y efectos protegidos

Ninguna prueba aislada, script, marcador persistente, ausencia momentánea de procesos o resultado de CI produce por sí solo la transición a `ROOT_READY`. Los predicados locales ratificados para preparar y validar la raíz deben satisfacerse con evidencia verificable; si falta alguno, el estado local permanece `UNKNOWN/BLOCKED`.

**Límite semántico:** `ROOT_READY` describe únicamente la preparación local y acotada de la raíz conforme a su contrato; no demuestra identidad del propietario, legitimidad constitucional ni autorización para efectos protegidos. La autoridad legítima y la autorización de efectos son gates separados y deben permanecer `PENDING/UNKNOWN` o `NOT_EVALUATED` hasta contar con sus propias pruebas.

**Orden no circular:** el contrato de transición debe identificar qué condiciones preceden a la admisión y cuáles son condiciones posteriores para permitir operaciones protegidas. No puede exigir como precondición de `ROOT_READY` que la admisión ya esté adquirida si la propia transición es la que permite adquirirla. Esta aclaración no ratifica por sí sola un orden completo de ejecución ni autoriza implementación; la secuencia concreta de admisión sigue abierta hasta que se reconcilie con las especificaciones P-03/P-04 y el contrato de transición.

Si una condición necesaria para el uso solicitado no está satisfecha, no se eleva el estado por heurística: se mantiene `UNKNOWN/BLOCKED` y los efectos protegidos permanecen `STOP`.

## Criterios de descarte inmediato

- Descartar A para una ejecución concreta si no puede demostrarse la quiescencia operacional.
- Descartar B si no se prueban las garantías de publicación del filesystem real, el control de lectores de staging y el comportamiento de dos publicadores.
- Descartar C si el marcador se usa como sustituto de exclusión, integridad o autoridad.
- Descartar D si no puede establecerse una identidad inequívoca del coordinador y un protocolo completo de su propio release/recuperación.
- En cualquier alternativa, no compensar una evidencia ausente con retry automático, borrado por edad/PID, marcador improvisado o lectura de stores fuera de la frontera de admisión.

Descartar una alternativa para un entorno no significa que otra esté automáticamente aprobada. Si ninguna supera sus gates, no hay bootstrap ni readmisión y se conserva `UNKNOWN/BLOCKED`.

## Preguntas del propietario que realmente permanecen

1. ¿Puede el producto exigir una instalación inicial manual/offline con quiescencia verificable, sin bootstrap concurrente? Si sí, A puede evaluarse como candidato; aún necesita contrato y pruebas.
2. Si no, ¿cuál es el filesystem/entorno real y qué garantías de publicación atómica ofrece? Sin esos datos, B no se puede aprobar.
3. ¿Existe una necesidad concreta que justifique un marcador persistente (C) o coordinación externa (D), pese a su nueva superficie de recuperación? No se asume que exista.
4. ¿Qué evidencia operacional puede producir el dispositivo/entorno real para demostrar quiescencia y evitar relanzamientos? Sin evidencia real, la opción A no pasa el gate.

No se requiere reabrir O-08. La decisión pendiente es P-01; la política de release/readmisión P-05 debe quedar compatible con la alternativa elegida.

## Estado canónico

M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Solo documentación. No se modifican runtime/tests/workflows/datos operativos. No se ejecutaron tests ni CI.


## Nota de reconciliación semántica — revisión Claude 2026-10-25

Esta aclaración resuelve la ambigüedad de redacción entre el estado local `ROOT_READY` y la legitimidad constitucional: no son equivalentes y no deben codificarse como un único predicado. No cierra los gates de P-01/P-05 ni prueba que el runtime actual implemente esta separación. El contrato de admisión debe evitar circularidad y conservar la autoridad legítima como gate independiente para efectos protegidos.

Estado tras la revisión: solo cambio documental; no tests/CI, runtime, workflow, configuración ejecutable ni dispositivo. M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; opciones A/B/C/D sin seleccionar.
