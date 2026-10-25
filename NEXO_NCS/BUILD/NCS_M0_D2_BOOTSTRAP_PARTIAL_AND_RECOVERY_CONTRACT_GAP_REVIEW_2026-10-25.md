# NCS M0 — D2: revisión acotada de bootstrap parcial y recuperación

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL — HUECOS ABIERTOS — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Alcance de esta revisión

Contraste dirigido entre:
- `NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md`, blob `c80b10def7b1151f6f328088e23d9c67742d00c9`;
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`, blob `bac9493af98c3f86001e323dab153bdee78b5f31`;
- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md`, blob `bfa38a057033acf880afe331a47bb383e82e9a97`;
- `NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md`, blob `2bdfb593c04bd52ecdeb052934525eba006f6c16`;
- `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`;
- `NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.

Es una comparación documental de blobs identificados; no es una ejecución, una prueba de carrera ni un examen completo del HEAD actual de código.

## 2. Hallazgo principal: el estado parcial no tiene todavía una condición verificable de salida

Los documentos coinciden en que una raíz ausente no autoriza bootstrap implícito; una raíz parcialmente creada no puede tratarse como instancia lista; y los fallos ambiguos quedan `UNKNOWN/BLOCKED`. Sin embargo, no existe aún un protocolo ratificado que especifique todos los predicados necesarios para convertir `BOOTSTRAP_PARTIAL` en `ROOT_READY`.

La matriz de estados dice que la transición solo puede ocurrir mediante recuperación explícita con protocolo aprobado y evidencia de integridad. La matriz de opciones C2, a su vez, enumera A/B/C/D sin seleccionar ninguna. P-05 añade el requisito de no readmitir mientras pueda seguir vivo un actor de release/limpieza, pero no resuelve quién demuestra quiescencia ni cómo se prueba integridad del bootstrap.

**Conclusión:** las especificaciones son compatibles como restricciones conservadoras, pero incompletas como procedimiento ejecutable de recuperación. No debe redactarse un comando de recuperación ni declararse lista una raíz hasta que el propietario seleccione la política y se definan sus pruebas.

## 3. Ambigüedad de nomenclatura: “Opción A” no es una sola decisión

El contrato de raíz de 2026-10-23 se titula “Opción A aceptada como dirección”, mientras que el documento D0-C2 también llama “Opción A” al bootstrap offline con quiescencia operativa.

Estos rótulos describen decisiones de alcance diferente y no deben interpretarse como si la aceptación de una ratificara automáticamente la otra. El registro de decisiones confirma los principios O-01…O-04 de raíz, pero mantiene pendiente el protocolo concreto de bootstrap.

Regla de continuidad: citar el nombre completo del artefacto y la decisión, no escribir solamente “Opción A aceptada”. La política de bootstrap offline/quiescence continúa sin ratificar en esta revisión.

## 4. Predicados que siguen sin contrato

Antes de permitir `BOOTSTRAP_PARTIAL → ROOT_READY`, el protocolo elegido debe definir explícitamente:

1. **Autoridad operacional:** quién puede iniciar recuperación y qué permiso la distingue de una operación normal. Esto no sustituye la autoridad constitucional ni crea legitimidad de raíz.
2. **Quiescencia:** si se elige recuperación offline, qué procesos, launchers, supervisores y jobs deben detenerse; cómo se comprueba que no pueden reanudarse durante la intervención; y qué evidencia se conserva. Si no puede demostrarse, permanece `UNKNOWN/BLOCKED`.
3. **Integridad:** qué archivos/layout son esperados, qué combinaciones se consideran parciales o ambiguas, y cómo validar los stores sin sobrescribir ni fusionar contenido existente.
4. **Identidad de objetos durante limpieza:** la recuperación no puede borrar un path solo porque el proceso actual lo creó antes; debe probar que sigue actuando sobre el objeto previsto. Si no puede demostrarlo, no limpia y no declara éxito.
5. **Release anterior:** si pudo quedar vivo un actor de release/limpieza, la ausencia del path no basta para readmitir. P-05 sigue gobernando este caso.
6. **Resultado de salida:** condiciones exactas para declarar `ROOT_READY`, rechazar recuperación o permanecer `UNKNOWN/BLOCKED`; los resultados de persistencia previa y release deben conservarse por separado.
7. **Reproducibilidad:** cada predicado de salida debe vincularse a pruebas deterministas, escenarios de crash y competencia entre procesos, con ejecución y SHA exactos una vez autorizada la implementación.

Esta lista no introduce nuevos campos persistentes, IDs, marcadores, locks externos, retries ni transacciones. Define las preguntas que el protocolo existente aún debe responder.

## 5. Intersección con P-03/P-04

- P-03 exige admisión antes de la primera lectura de contenido persistente cubierto y durante el uso del snapshot. La recuperación de bootstrap no puede asumir que leer los stores para decidir si están listos equivale a una operación normal admitida.
- P-04 debe asignar un único propietario efectivo de admisión por flujo y evitar reentrada/deadlock padre-hijo. No se ha probado que la política de recuperación de bootstrap tenga ese dueño.
- La inspección de raíz/configuración necesaria antes de admitir debe distinguirse de leer contenido de stores. Los límites de metadata, symlinks y filesystem siguen sujetos a la política de raíz.
- Los archivos externos de entrada no prueban que la instancia haya sido admitida ni que el bootstrap sea legítimo.

No se ratifica aquí el detalle propuesto en P-03/P-04 ni se presume implementación.

## 6. Criterio de cierre documental y técnico

Para cerrar el diseño, hace falta una decisión explícita del propietario sobre la política de bootstrap (incluido si se exige operador/quiescencia o si se requiere otro protocolo), más un contrato que cubra los siete predicados de §4. Para cerrar implementación, por separado, se necesita autorización explícita, tests de crash/competencia y CI contra el SHA de implementación.

La existencia de documentación o de una raíz/directorio no es evidencia suficiente. No inferir “instancia nueva” por ausencia de stores, “stale” por edad/PID, “release seguro” por ausencia del path ni “autoridad” por lock.

## 7. Estado canónico

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Solo revisión y documentación. No se modifican runtime, tests, workflows ni datos operativos; no se ejecutan tests ni CI. Esta revisión no selecciona protocolo ni autoriza recuperación.
