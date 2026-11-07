# NCS M0 — P-05: propuesta de cierre técnico y matriz de evidencia

Fecha: 2026-11-03  
Rama objetivo: `ncs-lumina-decoupling-2026-10-29`  
Snapshot de código revisado: `99dabcb33be1efef5c4f5e368dc95140e45ff672`  
Estado: **PROPUESTA TÉCNICA DOCUMENTAL — NO RATIFICADA — NO AUTORIZA CAMBIOS DE RUNTIME NI TESTS**

## 1. Propósito y límites

Completar la evaluación técnica de P-05 sobre release incierto y readmisión, reutilizando los artefactos existentes y sin reiniciar la auditoría.

Este documento:
- no elige una política constitucional en nombre del propietario;
- no declara segura la recuperación externa ni un mecanismo de filesystem;
- no introduce locks, epochs, marcadores, IPC, daemon, retry ni protocolo nuevo;
- no afirma que los escenarios de carrera hayan ocurrido;
- no modifica runtime, tests, workflows ni datos operativos;
- no declara tests o CI ejecutados.

P-05 trata exclusivamente la resolución de incertidumbre de release/readmisión de una operación admitida. No es un protocolo global de shutdown/ACK de todos los componentes ni sustituye el contrato de bootstrap.

## 2. Fuentes y snapshot

Fuentes canónicas inspeccionadas:

| Artefacto | Identidad |
|---|---|
| Especificación P-05 original | `NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c` |
| Reconciliación Gemini/Claude | `NCS_M0_D2_P05_INDEPENDENT_REVIEW_RECONCILIATION_2026-10-25.md`, blob `e718182cb18c4a58de97d4ab1e0523ec8b1ee55c` |
| P-03/P-04 | `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d` |
| Continuity store | `src/nexo/core/continuity-store.mjs`, blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` |
| Chronicle store | `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` |
| Snapshot de revisión | commit `99dabcb33be1efef5c4f5e368dc95140e45ff672` |

La inspección de código y tests es estática. Las menciones de tests existentes describen su contenido, no su ejecución en esta revisión.

## 3. Contrato que ya está fijado

O-11 establece: release incierto implica `UNKNOWN/BLOCKED`; no reintento automático de negocio ni readmisión hasta resolver la incertidumbre.

P-05 debe mantener tres dimensiones separadas:

1. **Resultado de negocio/persistencia:** confirmado, fallo demostrado antes de escritura, o UNKNOWN.
2. **Resultado de release:** confirmado para la instancia correcta, fallo observado, o incierto.
3. **Readmisión:** permitida solo con evidencia suficiente conforme a una política aprobada; de lo contrario BLOCKED/UNKNOWN.

Consecuencias:
- persistencia confirmada + release incierto conserva el hecho de persistencia, pero no concede readmisión;
- persistencia desconocida + release incierto conserva UNKNOWN;
- ausencia del path, PID muerto/aparentemente muerto, antigüedad, timeout o variable local no prueban por sí solos quiescencia;
- un segundo intento destructivo no hereda automáticamente la propiedad validada antes del primer intento;
- no se infiere autoridad constitucional desde lock, raíz o filesystem.

## 4. Hallazgos técnicos confirmados por lectura estática

### 4.1 Continuity

En el snapshot revisado:
- release compara el token del owner y después elimina por path;
- si falla el primer `rm`, intenta un segundo `rm` sobre la misma ruta sin volver a validar identidad;
- si falla la escritura inicial de `owner.json`, intenta limpieza recursiva del path y absorbe el fallo;
- `readLockOwner` convierte errores de lectura/parseo en `null`; en release esto puede confluir en `not_owned`;
- `lockReleaseFailures` es un Set local al proceso, no coordinación interproceso;
- en una adquisición posterior del mismo proceso, la ausencia del path permite borrar la marca local, pero no demuestra que el actor previo haya terminado ni que no pueda reanudar una limpieza.

### 4.2 Chronicle

- No tiene el mismo segundo intento explícito de release de Continuity.
- Su release también compara token y elimina por path; por tanto, la ausencia de retry no demuestra ausencia de TOCTOU.
- Si falla la escritura inicial del owner, intenta borrar recursivamente el path y absorbe el fallo.
- Errores de lectura/parseo del owner también pueden colapsar en `null` y terminar como `not_owned`.
- Su rechazo fail-closed de locks stale no prueba la seguridad de release ni de limpieza tras fallo de owner.

**Conclusión:** ninguno de los dos stores demuestra, solo por su implementación actual, que una retirada o limpieza afecte necesariamente a la misma instancia de lock adquirida. No se debe copiar automáticamente la semántica de uno al otro.

## 5. Matriz E1–E9: evidencia existente frente a requisito

| Caso | Requisito | Evidencia localizada en snapshot | Evaluación |
|---|---|---|---|
| E1 | Persistencia confirmada + release incierto conserva persistencia y bloquea readmisión/retry | Continuity devuelve resultado fallido de handoff con `persistenceStatus: committed` cuando release no se confirma. Test existente inspecciona bytes persistidos. | **PARCIALMENTE CUBIERTO**: test caracteriza release fallido; no demuestra protocolo de readmisión seguro ni cobertura equivalente de Chronicle. |
| E2 | Persistencia UNKNOWN + release incierto permanece UNKNOWN, sin retry | El contrato P-05 lo exige. La evidencia inspeccionada no establece una matriz completa de cortes de escritura ambiguos combinados con release incierto para ambos stores. | **NO DEMOSTRADO**. |
| E3 | Sustitución del path entre fallo del primer release y segundo intento no destruye sustituto | Continuity tiene segundo `rm` sin revalidación; la reconciliación anterior identificó que los mocks existentes no sustituyen el path. | **NO CUBIERTO; RIESGO ESTÁTICO CONFIRMADO**. |
| E4 | Fallo de escritura/validación de owner y sustitución durante limpieza no afecta sustituto | Ambos stores hacen limpieza por ruta después de fallo de escritura del owner, sin prueba de identidad del objeto. | **NO CUBIERTO; RIESGO ESTÁTICO CONFIRMADO**. |
| E5 | Owner ilegible/permisos/tipo/inspección no concluyente no equivale a ausencia/stale recuperable | Errores de lectura de owner pueden convertirse en `null`; la ruta de release puede responder `not_owned` sin distinguir token distinto de owner ilegible. | **PARCIAL / SEMÁNTICA AMBIGUA**. |
| E6 | Path ausente no concede readmisión sin demostrar fin del actor previo | P-05 lo prohíbe; Continuity elimina su marca local al observar ENOENT. No existe evidencia de quiescencia interproceso en esa observación. | **NO DEMOSTRADO; GAP CONTRACTUAL/RUNTIME**. |
| E7 | Competidor no entra durante release/recuperación inciertos | Existe test de espera de otro proceso mientras un lock existe, pero el test elimina el path explícitamente y el competidor continúa. No modela un release incierto con actor previo potencialmente activo. | **NO CUBIERTO PARA P-05**. |
| E8 | Readmisión solo tras cumplir predicados de política elegida y conservar evidencia | No se encontró política A/B ratificada ni protocolo operativo de recuperación demostrable. | **NO IMPLEMENTADO / NO DEMOSTRADO**. |
| E9 | Fallo probado antes de escritura con release incierto conserva resultados separados y no reintenta negocio automáticamente | Existen contratos de fallos de adquisición y de release separados en Continuity; no se localizó evidencia completa de esta combinación en ambos stores. | **PARCIAL / NO CERRADO**. |

Los estados anteriores son de cobertura documental/estática en el snapshot indicado; no son resultados de ejecución.

## 6. Separación de pruebas que suelen confundirse

No equivalen a aceptación P-05:
- un mock que hace fallar `rm` antes de tocar el filesystem;
- comprobar que el lock path existe después de un fallo;
- borrar manualmente el path desde el test y observar que un competidor continúa;
- comprobar token distinto sin sustituir el objeto entre validación y borrado;
- comprobar que el segundo intento limpia un fallo transitorio cuando no hay competidor;
- comprobar un error estructurado sin demostrar la no readmisión de otro proceso.

Para E3/E4 hacen falta intercalaciones deterministas con sustitución real del path/objeto y un competidor, bajo el modelo de filesystem que finalmente se declare. Un test unitario aislado no demuestra límites frente a procesos hostiles del mismo UID.

## 7. Dependencias P-03/P-04

P-05 no puede cerrarse como contrato de instancia si no se determina:

- **P-03:** el intervalo completo de admisión, desde antes de la primera lectura persistente hasta el último uso del snapshot y las escrituras de la operación.
- **P-04:** un único dueño de admisión por flujo, incluidos Chronicle directo y vía padre/hijo, sin doble adquisición ni reentrada.
- La identidad del actor/instancia cuya finalización debe probarse antes de readmitir.

La especificación P-03/P-04 ya propone esos límites, pero su propio estado es propuesta no ratificada y su enforcement no está demostrado en el runtime revisado. P-05 no puede afirmar cobertura global mientras esas fronteras sigan abiertas.

## 8. Evaluación de las políticas P-05

### A. Recuperación externa con quiescencia demostrable

Solo sería aceptable si un procedimiento aprobado demuestra que todos los escritores, supervisores y procesos de release/limpieza anteriores están detenidos y no pueden reanudarse durante la intervención. La ausencia de proceso aparente o de path no basta.

Estado actual: **NO DISPONIBLE COMO GARANTÍA DEMOSTRADA**. E2/E3 no prueban quiescencia global.

### B. Mecanismo ligado a identidad del objeto filesystem

Solo sería aceptable si la operación puede demostrar que release/cleanup afecta la misma instancia de lock que adquirió, bajo un modelo de filesystem y actores explícito. Token-check seguido de unlink/rm por path no cierra por sí solo la ventana check/use.

Estado actual: **NO DEMOSTRADO**. No se recomienda ratificar una implementación B basada únicamente en token + path.

### C. Mantener UNKNOWN/BLOCKED sin recuperación automática

Es una política de seguridad válida contemplada por la especificación original. No afirma que el sistema pueda recuperar ni readmitir; conserva el bloqueo cuando no hay evidencia suficiente.

Estado actual: **RECOMENDACIÓN TÉCNICA** para el comportamiento fail-closed inmediato. La decisión formal de política sigue reservada al propietario. Esta opción no convierte P-05 en PASS ni cierra los requisitos de observabilidad, cobertura y pruebas.

## 9. Propuesta de contrato mínimo para ratificación

Se propone ratificar, si el propietario lo decide, los siguientes invariantes sin seleccionar una primitiva de recuperación:

1. Ningún release se reporta como confirmado si no se puede atribuir a la instancia adquirida.
2. Ninguna limpieza destructiva por path se repite después de un resultado ambiguo sin volver a demostrar identidad y sin cerrar la carrera de sustitución.
3. Error al leer owner, JSON inválido, permisos o estado inesperado se representan como estado desconocido; no se convierten en ausencia ni en token ajeno sin distinción.
4. Fallo de cleanup tras creación parcial del lock se expone como dimensión separada; no se absorbe como si la limpieza hubiese sido segura.
5. Persistencia y release conservan resultados separados.
6. Readmisión permanece bloqueada hasta satisfacer predicados de la política explícitamente aprobada.
7. Ausencia de path, timeout, edad o PID no son evidencia suficiente por sí solos.
8. La cuarentena local de un proceso no se presenta como coordinación global.
9. El contrato no afirma protección frente a procesos hostiles del mismo UID, filesystem remoto, pérdida de energía ni ataques de alias/symlink no cubiertos.

## 10. Trabajo necesario para cerrar P-05

### Diseño
- Resolver P-03/P-04: intervalo de admisión y dueño por flujo.
- Definir el modelo de actores/filesystem de la primera instalación (sin extrapolarlo a seguridad frente a root/hostil).
- Elegir formalmente A, B o C, o mantener la decisión abierta y el gate bloqueado.
- Definir vocabulario observable para negocio, persistencia, release, cuarentena y readmisión.

### Implementación y pruebas, solo tras decisión/autorización aplicable
- Separar error de owner ilegible de owner distinto.
- Eliminar o rediseñar las limpiezas/reintentos por ruta cuya identidad no pueda demostrarse.
- Añadir escenarios deterministas E3a–E3d y E4a–E4b, además de E5–E9 aplicables.
- Probar competidores en procesos separados y comprobar que un lock sustituto sobrevive.
- Cubrir ambos stores sin asumir que sus contratos son idénticos.
- Ejecutar tests/CI y vincular cada resultado a SHA exacto de código y tests.

## 11. Estado y conclusión

- P-05: **OPEN / NOT RATIFIED**.
- O-11: **DECIDED**; UNKNOWN/BLOCKED y no retry/readmission ante release incierto.
- E1: parcial.
- E2: no demostrado.
- E3/E4: no cubiertos; riesgos estáticos confirmados.
- E5/E6/E7/E8/E9: parcial o no demostrado según matriz.
- P-03/P-04: dependencia directa; propuesta no ratificada y enforcement no demostrado en el snapshot.
- M0: **INCOMPLETO**.
- Authorization: **NOT_EVALUATED**.
- Raíz legítima: **PENDING/UNKNOWN**.
- Efectos protegidos: **STOP**.

Este documento completa la evaluación técnica disponible, pero no ratifica P-05, no elige por el propietario la política A/B/C y no autoriza cambios de runtime/tests/workflows ni commissioning.


---

## DELTA — RECONCILIACIÓN DE DEPENDENCIA P-03/P-04 TRAS RATIFICACIÓN (2026-11-03)

La afirmación de §7 y §10 de que P-03/P-04 permanecían como propuesta no ratificada queda superada por la decisión explícita del propietario del 2026-11-03.

- D1–D6 de P-03/P-04 están **RATIFICADAS POR EL PROPIETARIO**.
- Registro: `NCS_M0_D2_P03_P04_CONTRACT_RATIFICATION_PROPOSAL_2026-11-03.md`, sección 10; commit `d0c45a1d7c5d6791b4f8c3d9c2919ad19360abbb`.
- Diseño técnico: `NCS_M0_D2_P03_P04_TECHNICAL_CLOSURE_DESIGN_2026-11-03.md`; commit `038afa393a2e21e74d3384d8a05cc71d07147615`.

### Efecto preciso sobre P-05

1. P-05 ya dispone de límites contractuales ratificados para dueño de admisión, intervalo protegido, admisión exclusiva normal, diagnóstico forense limitado, terminación incierta, inputs externos y alcance R1.
2. La dependencia normativa P-03/P-04 queda resuelta **a nivel de decisión del propietario**.
3. La implementación y evidencia de enforcement de admisión siguen pendientes; no se afirma que los callers estén cubiertos ni que la primitiva exista.
4. P-05 sigue necesitando una política explícita de release/readmisión y evidencia de seguridad. D2 no permite inspeccionar stores canónicos ni sustituye P-05.
5. La elección entre A/B/C de §8–§9 continúa **RESERVADA AL PROPIETARIO**. Este delta no elige una política ni autoriza implementación.
6. Los hallazgos E1–E9 y las limitaciones estáticas de Continuity/Chronicle no cambian por la ratificación de P-03/P-04.

### Estado reconciliado

- P-03/P-04: D1–D6 RATIFICADAS; enforcement/evidencia pendientes.
- P-05: OPEN / NOT RATIFIED; política A/B/C pendiente.
- E1–E9: conservan los estados de la matriz §5; no se convierten en PASS.
- M0: INCOMPLETO.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: PENDING/UNKNOWN.
- Primera publicación, commissioning y efectos protegidos: STOP.
- Solo delta documental; sin runtime/tests/workflows/configuración/dispositivo.
- No se ejecutaron tests/CI/Actions.


---

## DELTA — DECISIÓN DEL PROPIETARIO SOBRE POLÍTICA P-05-C (2026-11-07)

La decisión A/B/C que §8–§9 reservaban al propietario queda resuelta en cuanto a política: el propietario ratificó **C — conservar UNKNOWN/BLOCKED sin recuperación automática** el 2026-11-07.

- Cualquier release/cleanup incierto permanece UNKNOWN/BLOCKED; no retry automático de negocio ni readmisión normal.
- No se borra/reemplaza manualmente el lock como recuperación predeterminada.
- Cualquier desbloqueo o recuperación futura exige una decisión expresa posterior y un procedimiento concreto demostrado.
- Si no se demuestra enforcement durable/interproceso de BLOCKED, la instancia permanece STOP y M0 no se declara completo.
- Esta decisión no escoge una primitiva filesystem, no define por sí sola los predicados de resolución, no implementa cuarentena y no convierte E1–E9 en PASS.
- P-05: **OPEN — C RATIFICADA; MECANISMO/ENFORCEMENT/RESOLUCIÓN/EVIDENCIA PENDIENTES**.
- P-07-C: UNKNOWN/BLOQUEANTE; P-09: OPEN/UNKNOWN; M0: INCOMPLETO.
- No se modificó runtime/tests/workflows/configuración/dispositivo ni se ejecutaron tests/CI/Actions.

Registro autoritativo: [NCS_M0_D2_P05_POLICY_C_TECHNICAL_DEFINITION_2026-11-03.md](NCS_M0_D2_P05_POLICY_C_TECHNICAL_DEFINITION_2026-11-03.md), delta del 2026-11-07.
