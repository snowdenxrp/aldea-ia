# NCS M0 — frontera entre observación y verificación de objetivo

Fecha: 2026-10-19  
Estado: AUDITORÍA READ-ONLY; diseño de contrato pendiente. No habilita efectos.

## 1. Pregunta que se está resolviendo

¿Qué evidencia puede convertir una observación del estado persistido en una verificación suficiente de un objetivo, sin confundir la condición observada con la ejecución, causalidad, autorización o atomicidad de una operación de Nexo?

La respuesta actual es: los componentes existentes permiten registrar observaciones acotadas, pero no aportan un verificador independiente que pruebe esas afirmaciones adicionales.

## 2. Código inspeccionado

### A. `scripts/nexo-repair-settlement.mjs`

- `settlePreparedRepairFromPersistedState()` carga el store de continuidad, exige una única entrada de journal, exige una acción de reparación permitida y valida la revisión persistida del entorno.
- Solo acepta el entorno en la revisión de PREPARED o en la revisión inmediatamente posterior.
- Si la condición deseada está presente, escribe `settled_observed` con `causalAttribution: "not_claimed"`.
- El comentario del propio módulo declara que no hay atomicidad entre el archivo de entorno y el store de continuidad.
- La ruta de recuperación de una observación ya registrada comprueba su forma y vínculo de revisión; no vuelve a ejecutar el efecto ni establece causalidad.

### B. `src/nexo/adapters/persisted-repair-observation.mjs`

- `observePersistedRepairInvariant()` inspecciona invariantes de estado para tres acciones: normalización de posición de agente, necesidades de agente y cantidad de recurso.
- La salida se limita a `desired_state_present`, `desired_state_absent` o `unknown`, con razón y metadatos de la observación.
- El contrato documentado dice expresamente que esto no prueba que la operación haya causado el estado, no autoriza reintentos y no es settlement terminal.
- `comparePersistedRepairRevision()` es también diagnóstico: una coincidencia de revisión no establece identidad de la operación ni exclusión mutua entre los dos archivos.

### C. `scripts/simulate.mjs`

- `loadStateStrict()` falla ante archivo ausente, JSON inválido, esquema base inválido o revisión desconocida; a diferencia de `loadState()`, no crea un estado simulado por defecto.
- Tras validar el archivo, el loader aplica normalizaciones de compatibilidad a campos de simulación. Por ello, su resultado es una vista cargada/normalizada del estado persistido, no una prueba criptográfica del contenido original ni de quién lo escribió.
- `persistState()` mantiene su propia revisión y su propio lock para el archivo de simulación. Ese mecanismo no constituye una transacción conjunta con el store de continuidad Nexo.

## 3. Límite arquitectónico

El archivo `world-state.json` pertenece al ciclo de estado de la simulación, mientras que Continuity y Chronicle son stores propios de Nexo. Que un adaptador Nexo lea un archivo de simulación no transfiere su propiedad a Nexo ni convierte esa fuente en autoridad para todos los efectos.

La ruta de settlement es diagnóstica y no debe ser conectada a un runtime que despache reparaciones como atajo. No se deben trasladar agentes, recursos, memoria operativa ni estado de simulación al snapshot de continuidad de Nexo. Nexo y Lúmina deben permanecer separados.

## 4. Qué afirma cada clase de evidencia

| Evidencia | Permite afirmar | No permite afirmar |
|---|---|---|
| Snapshot estricto legible con revisión válida | Se pudo leer una representación persistida conforme al esquema base | Quién originó cada campo, autenticidad del escritor, atomicidad con otro store |
| Invariante deseada presente | La condición observada está presente en esa revisión | Que la acción pendiente la causó o que se ejecutó una sola vez |
| Revisión igual a PREPARED | El contador observado coincide con el contador registrado | Que el estado no fue reemplazado por otro escritor que reutilizó/alteró el archivo fuera del contrato |
| Revisión PREPARED + 1 | El contador avanzó una unidad | Que ese incremento corresponde causalmente a esta operación |
| Journal Nexo con `settled_observed` | Nexo registró de forma condicional la observación y su revisión | Que el efecto externo y el journal se confirmaron en una transacción común |
| Etiqueta `verified: true` o evidencia declarada por caller | El caller entregó esa afirmación | Verificación independiente, identidad del verificador o prueba de autoridad |

## 5. Contrato mínimo antes de considerar un goal verifier

Un verificador futuro solo puede incorporarse tras especificar y demostrar todos los puntos pertinentes:

1. **Propietario del objetivo:** entidad y componente que definen el estado canónico para la acción, sin inferirlo del nombre de la acción.
2. **Fuente de evidencia:** interfaz documentada para obtener la observación y límites de confianza de esa fuente.
3. **Vinculación de identidad:** misión, paso, acción, target, idempotency key y revisión PREPARED deben quedar vinculados sin ambigüedad.
4. **Semántica de resultado:** distinguir observación presente/ausente/desconocida, efecto aplicado/no aplicado/desconocido y causalidad probada/no probada. No colapsar estas dimensiones en un booleano.
5. **Concurrencia y cambio de estado:** definir cómo se excluyen o detectan escritores concurrentes durante observación y settlement, y qué sucede si la fuente cambia entre ambos.
6. **Crash cuts:** demostrar comportamiento antes/después del efecto, después de persistir el estado externo, antes/después del journal y cuando la respuesta se pierde.
7. **Idempotencia:** definir cómo un replay descubre un efecto ya aplicado sin duplicarlo y cómo se bloquea el replay si la evidencia es ambigua.
8. **Autoridad y efectos:** la verificación de un objetivo no sustituye la autorización constitucional ni el límite de ejecución protegida.
9. **Pruebas de rechazo:** fuentes ausentes/corruptas, revisiones no relacionadas, identidad duplicada, objetivo ya satisfecho en PREPARED, estado que cambia después de observar y evidencia provista por el caller sin respaldo.
10. **Integración independiente:** la implementación debe poder probarse sin importar el ciclo de simulación de Lúmina ni conceder a esa simulación autoridad sobre Nexo.

No se afirma que todos los puntos se puedan resolver dentro de un store de archivos local. Si la plataforma no puede demostrar el contrato requerido, el resultado debe permanecer UNKNOWN/HOLD y no se habilita el efecto.

## 6. Decisión actual

- Mantener `persisted-repair-observation` como observador diagnóstico.
- Mantener `settlePreparedRepairFromPersistedState` fuera de la ruta de dispatch y no tratar `settled_observed` como prueba de causalidad o autorización.
- No crear un goal verifier genérico basado en un campo `verified`, un contador de revisión o una función suministrada por el caller.
- No modificar código de runtime en esta auditoría: no se demostró una corrección segura que justifique hacerlo.
- El siguiente trabajo, si se continúa esta frontera, es especificar la interfaz de propiedad/lectura de estado y la matriz de crash cuts para un dominio propio de Nexo, sin reutilizar el estado de simulación como autoridad. La implementación queda pendiente hasta que exista un propietario canónico adecuado.

## 7. Estado de misión

Auditoría read-only completada; no se ejecutaron pruebas nuevas y no se atribuye un CI nuevo. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.
