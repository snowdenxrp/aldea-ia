# NCS M0 — evaluación independiente de la revisión Gemini sobre D1-DESIGN
Fecha: 2026-10-25
Rama objetivo: `ncs-clean-architecture`
Estado: **REVISIÓN DOCUMENTAL — PROPUESTA, NO RATIFICACIÓN DEL PROPIETARIO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y límite

Registrar la evaluación de la respuesta de revisión independiente recibida el 2026-10-25. Este documento no cambia decisiones del propietario, no cierra D1-DESIGN, no autoriza implementación y no afirma ejecución de pruebas o CI.

## 2. Resultado ejecutivo

La matriz de entrypoints y la preferencia por una separación lógica/modular son útiles como dirección de diseño, pero no bastan para declarar cerrado D1-DESIGN. La opción 2 se conserva como **candidata de diseño**, no como decisión ratificada ni como garantía de aislamiento. La frontera debe definirse primero y el refactor mínimo elegirse después, conforme a O-09.

## 3. Aportes aprovechables

- Distinguir los entrypoints Lúmina heredados (`scripts/assistants.mjs`, `scripts/simulate.mjs`) de la CLI independiente de Nexo y del proceso hijo Chronicle.
- Documentar dependencias permitidas/prohibidas, propiedad de stores, APIs exportadas, rutas de reparación y aristas de procesos.
- Preservar la memoria de aprendizaje de Lúmina y la persistencia canónica del estado del mundo; la separación no debe desactivar ni borrar esas funciones legítimas.
- Mantener como `UNKNOWN/BLOCKED` los consumidores externos, cargadores dinámicos y aristas semánticas que no puedan resolverse con la evidencia disponible.
- Separar cierre documental, enforcement en runtime, pruebas, CI y autorización de efectos protegidos.

## 4. Correcciones obligatorias antes de considerar el diseño cerrado

### 4.1 Contratos modulares no equivalen a enforcement

La opción 2 no garantiza por sí sola separación de dominios. Los contratos de importación, interfaces y guards son objetivos de diseño hasta que exista una implementación autorizada y evidencia reproducible. D1 puede definir el contrato sin modificar runtime; D2/implementación deberá demostrar su cumplimiento.

### 4.2 Las lecturas persistentes dentro del alcance también están sujetas a admisión

O-10 ya fue ratificada por el propietario: ninguna lectura persistente de consultas, previews o Chronicle dentro del alcance acordado puede eludir la admisión. No se debe reabrir como si la excepción de solo lectura estuviera libre para decidirse desde cero. Sigue pendiente precisar el comienzo y final de la sección protegida, las lecturas cubiertas y la interacción con el proceso hijo.

### 4.3 La relación padre/hijo no se resuelve con “heredar el contexto”

El hijo Chronicle es ejecutable independientemente y actualmente acepta rutas de stores; el padre usa `spawnSync`. El contrato debe especificar el paso y validación de una única raíz explícita, el rechazo de argumentos/rutas contradictorios, y quién posee la admisión. No se debe asumir que la herencia de contexto constituye autoridad o protección. El padre no debe mantener un lock no reentrante mientras espera a un hijo que necesite adquirirlo.

### 4.4 Las incógnitas no se convierten en riesgo aceptado por conveniencia

La revisión no autoriza a aceptar globalmente las aristas dinámicas no resueltas. Deben permanecer clasificadas individualmente como `UNKNOWN/BLOCKED`; cualquier criterio que dependa de ellas no puede darse por satisfecho. El barrido de 188 blobs JavaScript es una búsqueda reproducible de identificadores nombrados, no un grafo semántico completo.

### 4.5 Concurrencia: principios en D1; implementación y pruebas en etapas posteriores

D1 debe fijar semántica y responsabilidades: alcance de admisión, propietario del lock, interacción padre/hijo y conducta ante liberación incierta. La implementación de esos contratos, las pruebas de concurrencia y la evidencia CI pertenecen a etapas posteriores y requieren autorización separada. La regla ratificada para liberación incierta sigue siendo `UNKNOWN/BLOCKED`, sin reintento automático de negocio ni readmisión hasta resolver la incertidumbre.

## 5. Matriz de estado de las afirmaciones de Gemini

| Afirmación | Clasificación | Tratamiento |
|---|---|---|
| Separar responsabilidades de Nexo y Lúmina | Compatible con decisión ratificada | Mantener como objetivo de diseño; preservar la persistencia propia de Lúmina. |
| Elegir opción 2, aislamiento lógico/modular | Recomendación no ratificada | Conservar como candidata; comparar con el contrato y los callers conocidos antes de seleccionar el refactor mínimo. |
| Las consultas de solo lectura podrían tener una excepción de admisión | No compatible con O-10 si la lectura está dentro del alcance acordado | No introducir excepción por ser lectura; concretar el alcance. |
| Dejar aristas dinámicas sin resolver como UNKNOWN/BLOCKED | Compatible con disciplina de evidencia | Mantener clasificación; no presentarla como aceptación del riesgo ni como cierre de cobertura. |
| Dejar todo el contrato de concurrencia para D2 | Incompleto | D1 debe especificar semántica y ownership; D2/implementación verifica comportamiento. |
| Cerrar D1 mediante consolidación documental | Condicional | Solo si las fronteras, callers y contratos aplicables están resueltos y las incógnitas restantes se delimitan sin depender de ellas para afirmar cierre. |

## 6. Condiciones mínimas para una posible propuesta de cierre D1-DESIGN

1. Contrato Nexo/Lúmina con responsabilidades exclusivas, dependencias permitidas/prohibidas, stores propios y preservación explícita de la persistencia legítima de Lúmina.
2. Clasificación por entrypoint que separe comportamiento observado, objetivo de diseño, exclusiones explícitas y evidencia pendiente.
3. Ledger de APIs/callers conocidos que incluya fábricas de stores, owners, queries/previews, reparación, entrypoints directos y proceso hijo; sin afirmar exhaustividad semántica no demostrada.
4. Contrato padre/hijo Chronicle: raíz explícita, validación de rutas, rechazo de combinaciones contradictorias, admisión y ownership sin deadlock.
5. Alcance de lecturas persistentes sujetas a admisión y sus fallos de parada.
6. Matriz de fallos con `UNKNOWN/BLOCKED` para raíz ausente/ambigua, estado inconsistente, edge no resuelta y liberación incierta; sin recuperación ni retry implícitos.
7. Lista explícita de aristas dinámicas/externas no resueltas y criterios que bloquean.
8. Reconciliación con la línea de meta M0 A–E, distinguiendo contrato documentado de implementación y verificación.

Estos puntos son criterios de trabajo propuestos para la siguiente reconciliación; no son una declaración de que ya se cumplan.

## 7. Estado canónico tras esta evaluación

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Esta evaluación no modificó runtime, tests, workflows ni datos operativos. No se ejecutaron pruebas ni CI.
