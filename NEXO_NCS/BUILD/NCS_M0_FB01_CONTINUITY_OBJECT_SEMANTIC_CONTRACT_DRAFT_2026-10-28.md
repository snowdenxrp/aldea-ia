# NCS M0 — borrador de contrato semántico del objeto Continuity para FB-01

**Fecha:** 2026-10-28  
**Rama:** `ncs-clean-architecture`  
**Estado:** BORRADOR TÉCNICO — NO RATIFICADO — NO IMPLEMENTACIÓN / NO TEST / NO CI  
**Propósito:** avanzar FB-01 usando decisiones ya tomadas y el mapa estático existente, sin reabrir decisiones del propietario ni convertir una clasificación documental en permiso de escritura.

## 1. Decisiones previas que este borrador conserva

- Clasificación del objeto: **U**. No se declara estrictamente local/no autoritativo (L) ni constitucional (C).
- Regla provisional de primera creación: **OWNER_APPROVED_LIMITED**. La aprobación no autoriza una escritura real ni cierra la aplicabilidad al objeto concreto.
- Aislamiento de bootstrap P01-B: **C — NO SELECCIONAR TODAVÍA**.
- Raíz legítima: **PENDING / UNKNOWN**.
- Primera creación y efectos protegidos: **STOP**.
- M0: **INCOMPLETO**; D0/D1/D2/D3 siguen OPEN; D1-IMPLEMENTATION NO AUTORIZADA; P-05 NO RATIFICADA.

Este documento no vuelve a preguntar estas decisiones ni las amplía.

## 2. Objeto cubierto y exclusiones de identidad

El candidato de FB-01 es únicamente el archivo Continuity que una invocación concreta de `openNexoContinuityOwner` intentaría inicializar si está ausente. Debe identificarse por la configuración y el `filePath` efectivos de esa invocación cuando exista evidencia disponible.

No se presupone una ruta universal como `<root>/continuity.json`. No se agrupan en el mismo acto lógico:

- el directorio de instancia;
- el store Chronicle;
- locks, `owner.json` ni temporales;
- `world-state.json`, `nexoMemory`, `legacyMemory` u otro estado de Lúmina/simulación.

Esos objetos pueden ser dependencias o fuentes de datos, pero cada uno requiere su propio alcance contractual. Este borrador no autoriza migración ni proyección automática de datos legacy.

## 3. Semántica permitida propuesta para el snapshot inicial

**Propuesta pendiente de ratificación:** el snapshot inicial, si algún día se autoriza su creación, solo podría representar un estado operacional M0 explícitamente definido por un contrato versionado. No puede introducir implícitamente hechos de autoridad o permisos.

La lectura estática posterior del código fuente precisa esta frase: **el esquema del snapshot sí está definido en el código**, aunque la legitimidad de usarlo en una invocación concreta no está resuelta. `src/nexo/core/continuity-snapshot.mjs` (blob `56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3`) define `NEXO_OPERATIONAL_CONTINUITY`, `schemaVersion: 1` y exactamente los campos `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`; `continuity-service.mjs` (blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`) construye el snapshot vacío con esas cinco colecciones vacías. El store envuelve el snapshot en `NEXO_CONTINUITY_STORE`, `schemaVersion: 1`, `storeRevision` y `snapshot` (`continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`). Esto distingue el **envelope de persistencia** del **payload operacional** y corrige cualquier lectura que los confunda.

Lo que sigue sin estar fijado por el contrato aprobado es que esos bytes sean el estado inicial legítimo para un destino concreto, que la ruta efectiva provenga de la raíz explícita ratificada y que el caller esté autorizado a invocar la creación. No se inventan campos, IDs ni un objeto Genesis.

El contrato de contenido deberá identificar, campo por campo:

1. datos iniciales permitidos y sus valores/origen;
2. datos excluidos y motivo;
3. consumidores que pueden leer cada campo;
4. decisiones operacionales que esos consumidores pueden derivar;
5. comportamiento de rechazo si falta un campo, hay contradicción o el formato no se reconoce.

## 4. Invariantes negativos propuestos

Para poder demostrar que el objeto no establece autoridad, el diseño y la evidencia futura deberán satisfacer todos estos invariantes:

1. El archivo, su existencia, su formato válido, revisión, hash, journal, linaje, lock o token no autentican a su creador ni establecen raíz, identidad, Constitución, Policy, credenciales, autorización o permiso de efectos.
2. Ningún caller puede obtener permiso de escritura solo por pasar un flag, suministrar `legacyMemory`, observar ausencia o lograr que la operación técnica tenga éxito.
3. La validez estructural del snapshot no equivale a legitimidad normativa, admisión de una misión ni autorización de dispatch.
4. Un bootstrap explícito no puede continuar en la misma invocación hacia admisión, PREPARED, dispatch, reconciliación o mutaciones de dominio. Esta propiedad es requisito propuesto, no comportamiento verificado.
5. La inicialización de Continuity no inicializa implícitamente Chronicle ni ningún otro store.
6. La incertidumbre sobre ruta, objeto previo, corrupción, permisos, concurrencia o resultado de publicación se conserva como UNKNOWN/STOP; no se convierte en ausencia ni habilita reintento automático.
7. El objeto existente —incluido uno inválido o contradictorio— no se sobrescribe ni se elimina por heurística como parte de bootstrap.
8. Las fuentes legacy/Lúmina no se tratan como autoridad ni se proyectan sin un contrato explícito que determine su procedencia y alcance.

Estos son requisitos de diseño propuestos. No son afirmaciones de que el runtime actual los cumpla.

## 5. Separación de preguntas que no resuelve este contrato semántico

Este borrador no selecciona ni cierra:

- **P01-A / P01-G:** clasificación final del objeto y regla legítima aplicable a la invocación exacta;
- **P01-B:** aislamiento operacional, cuya decisión vigente sigue siendo C;
- **P01-C/D, E2/E3:** cobertura de escritores, launcher, exclusión y no reanudación;
- **P01-E/F:** protocolo para ausencia, objeto inválido, concurrencia, publicación parcial o resultado ambiguo;
- **P-05:** política de release incierto, recuperación y readmisión;
- D0/D1/D2/D3, raíz legítima o autorización de efectos protegidos.

La aprobación limitada de la regla provisional no sustituye ninguno de estos requisitos.

## 6. Evidencia mínima para revisar el borrador

Antes de considerar el contrato ratificable, se requiere:

1. vincularlo a una invocación concreta y a su configuración/ruta efectiva, sin inferir una ruta universal;
2. fijar el esquema y el contenido inicial exactos o mantenerlos UNKNOWN;
3. reconciliar cada consumidor conocido del snapshot con los invariantes de §4;
4. resolver explícitamente la frontera de bootstrap respecto de admisión/ejecución, sin afirmar que las rutas actuales estén aisladas;
5. identificar qué evidencia demostraría las propiedades negativas y cuáles seguirán fuera de alcance;
6. mantener trazabilidad a los criterios de aceptación M0 y al SHA exacto que eventualmente se evalúe.

No ejecutar tests, CI, código de Nexo, bootstrap ni comandos del dispositivo como parte de esta revisión documental. Cualquier autorización posterior debe ser separada y específica.

## 7. Recomendación técnica

Usar este borrador como lista de obligaciones para reconciliar FB-01, no como contrato congelado. Si no se puede demostrar que el objeto y sus consumidores respetan las propiedades negativas, mantener U/UNKNOWN/STOP; no rebajar la clasificación a L por conveniencia. No crear una autoridad paralela ni usar el objeto persistido para legitimarse a sí mismo.

## 8. Estado final de esta nota

- FB-01: **trabajo semántico de diseño avanzado; NO CERRADO**.
- P01-A: OPEN / UNKNOWN.
- P01-G / regla aplicable a la invocación concreta: PENDING / UNKNOWN.
- P01-B: C — NO SELECCIONAR TODAVÍA.
- P-05: NO RATIFICADA.
- M0: INCOMPLETO.
- D1-IMPLEMENTATION: NO AUTORIZADA.
- `authorization: NOT_EVALUATED`; primera creación y efectos protegidos: STOP.

No se modificaron runtime, tests, workflows, configuración ejecutable ni dispositivo. No se ejecutaron tests, CI/Actions ni bootstrap.


## 9. Reconciliación estática con contrato de raíz y servicio existente (2026-10-28)

Esta sección precisa el borrador con fuentes de código leídas en la rama objetivo. Es análisis estático; no se ejecutaron pruebas ni runtime.

### 9.1 Contrato de raíz vs. ruta real

El principio ratificado en `NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md` es una raíz explícita `--root <directory>`, sin fallback ambiental/legacy, con raíz existente/válida para operación normal y bootstrap separado. El contrato de instancia describe como layout propuesto `<root>/continuity.json` y `<root>/chronicle.json`, pero también advierte que los nombres del lock/layout no equivalen a implementación.

El código actual de `openNexoContinuityOwner` recibe `filePath` directamente y crea `createNexoContinuityStore({ filePath, ... })`; no deriva ni valida por sí mismo un `--root`. Por tanto, **no está demostrado que el archivo evaluado sea el hijo canónico de una raíz explícita validada**. El borrador no puede afirmar que la ruta efectiva satisfaga el contrato de raíz, ni que `<root>/continuity.json` sea la ruta real universal.

### 9.2 Condición de primera creación observada

En `continuity-service.mjs`, la ausencia reconocida del store lleva a dos ramas: si `legacyMemory` es distinto de null/undefined, proyecta ese valor mediante `projectNexoContinuitySnapshot`; solo si no hay `legacyMemory` y `allowEmptyInitialization === true`, construye el snapshot vacío; de otro modo devuelve `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`. Luego llama `store.initialize(snapshot)`; para resultados `committed` o `conflict` vuelve a cargar el estado actual.

Consecuencia: `allowEmptyInitialization: false` **no bloquea por sí solo toda inicialización**, porque la rama `legacyMemory` tiene precedencia y no requiere que ese flag sea true. El servicio implementa una protección contra la inicialización vacía por defecto, pero la legitimidad/procedencia de `legacyMemory` debe establecerse en el caller y no se prueba dentro de este servicio. Los callers legacy ya identificados hacen que no se pueda afirmar separación end-to-end ni aislamiento del bootstrap.

### 9.3 Compatibilidad del borrador con la evidencia

| Punto | Evidencia estática | Conclusión correcta |
|---|---|---|
| Forma del snapshot | Schema versionado y cinco colecciones exactas en `continuity-snapshot.mjs` | El esquema de payload está definido en código; no equivale a aprobación de la semántica inicial. |
| Forma del envelope | `NEXO_CONTINUITY_STORE`, versión 1, revisión local y snapshot | Envelope y payload son capas distintas; la revisión es local al store, no autoridad. |
| Ruta | Servicio recibe `filePath`; el contrato raíz ratificado exige raíz explícita, pero el wiring no lo demuestra | Ruta efectiva / vinculación a raíz siguen UNKNOWN. |
| Origen inicial | `legacyMemory` se proyecta cuando el store está ausente; snapshot vacío requiere flag explícito | Procedencia y autorización del dato legado no quedan resueltas por la validación de esquema. |
| Frontera de operación | El servicio devuelve owner después de inicializar y cargar; los callers compuestos siguen existiendo | No está demostrada la terminación del bootstrap antes de admisión/Chronicle/otras mutaciones. |
| Autoridad | Código y contrato del store dicen que revisión/lock/snapshot no son autoridad | El principio es consistente; su enforcement global sigue sin probar. |

### 9.4 Estado actualizado de los invariantes

- El requisito de no autoridad del snapshot sigue siendo un **objetivo contractual**, no una propiedad global probada.
- La separación entre envelope y snapshot queda aclarada documentalmente.
- El esquema vacío del código es conocido; el destino, origen autorizado, caller legítimo y aislamiento end-to-end no están demostrados.
- No se propone cambiar el código ni retirar el puente legacy en esta ronda. Cualquier cambio ejecutable requiere autorización separada.


### 9.5 Implicación de alcance ratificado: legacy migration no pertenece al bootstrap M0

La reconciliación D0/D1 de raíz y el contrato de separación Nexo/Lúmina ya dicen que no habrá migración automática, dual-write ni merge heurístico y que el cutover/migración se mantiene fuera de M0 hasta identificar y verificar el destino. Por tanto, el camino de `openNexoContinuityOwner` que acepta `legacyMemory` y lo proyecta cuando falta el store es una capacidad de código existente, pero **no puede tratarse como ruta aprobada para el bootstrap M0**. Su presencia no demuestra autorización de migración ni modifica el alcance aceptado.

Consecuencia de diseño recomendada, pendiente de implementación autorizada: el camino de bootstrap M0 debe definirse para el snapshot vacío explícito y exacto, y no debe importar `legacyMemory`; la migración legacy, si se retoma más adelante, necesita operación separada y aprobación/criterios propios. Esto no resuelve por sí solo la regla legítima de primera creación, la raíz efectiva ni la separación del caller. No se modifica el runtime en esta ronda.


## 10. Frontera propuesta de bootstrap M0 y evidencia de no continuación (2026-10-28)

Esta sección convierte los hallazgos previos en un contrato de frontera verificable. Es una propuesta documental, no ratificada; no describe comportamiento implementado ni autoriza cambios ejecutables.

### 10.1 Flujo permitido propuesto

El bootstrap M0, si recibe autorización específica en el futuro, deberá ser una operación separada y de propósito único:

1. Recibir una raíz explícita y validar el contrato de raíz antes de resolver cualquier ruta hija. No aceptar una ruta de archivo arbitraria como sustituto de la raíz.
2. Resolver la ubicación de Continuity mediante una regla versionada y única para esa instancia. La vinculación efectiva entre la raíz validada y el filePath debe poder demostrarse en la misma cadena de llamada.
3. Confirmar que el destino está realmente ausente. Error de lectura, permiso denegado, corrupción, formato desconocido, tipo de archivo inesperado o estado contradictorio no equivalen a ausencia.
4. Construir únicamente el snapshot vacío versionado ya identificado: payload NEXO_OPERATIONAL_CONTINUITY, schemaVersion: 1, con missions, attempts, doNotRepeat, executions y effectJournal vacíos. El envelope del store se mantiene como capa de persistencia separada.
5. Rechazar la ruta legacyMemory como fuente para este flujo. La proyección/migración legacy queda fuera de M0 y no puede ser una alternativa implícita cuando falta el store.
6. Intentar una sola publicación conforme al protocolo de concurrencia/atomicidad que se apruebe. Un conflicto, error o resultado ambiguo no autoriza sobrescritura, eliminación ni reintento automático.
7. Terminar la operación y devolver un resultado de bootstrap limitado. No devolver un owner habilitado ni continuar dentro de la misma invocación hacia Chronicle, admisión, reconstrucción de misión, PREPARED, dispatch, reconciliación o mutaciones de dominio.

Los pasos 1–7 son requisitos propuestos. No se afirma que el runtime actual los cumpla.

### 10.2 Tabla de cierre: requisito, evidencia exigible y estado actual

| Requisito | Evidencia que permitiría evaluarlo | Estado actual |
|---|---|---|
| Raíz explícita y validada | Cadena de llamada desde parsing/validación de --root hasta el filePath efectivo; prueba de rechazo de fallback ambiental/legacy | UNKNOWN: el servicio recibe filePath directamente |
| Ausencia inequívoca | Distinción explícita entre ENOENT y otros errores; casos adversariales de permiso, corrupción y tipo inesperado | No demostrado por el análisis actual |
| Snapshot inicial limitado | Contrato/schema versionado y prueba de igualdad exacta de las cinco colecciones vacías; rechazo de campos/formato no reconocidos | Esquema conocido; enforcement M0 no verificado |
| Sin migración implícita | Bootstrap sin dependencia ni argumento legacyMemory; prueba de que su presencia no activa proyección/migración | Contradicción de alcance conocida en capacidad existente |
| Publicación segura | Evidencia de concurrencia, destino preexistente, interrupción y resultado ambiguo; sin overwrite/retry automático | Pendiente de contrato y pruebas autorizadas |
| Terminación antes de admisión | Resultado/tipo de API separado que no entregue owner operacional; prueba de que el flujo termina y no alcanza Chronicle/admisión/dispatch/mutaciones | UNKNOWN: existe una ruta de servicio que retorna owner y callers compuestos |
| No bypass por otras entradas | Inventario ya existente ligado a SHA y pruebas negativas por cada ruta de entrada en alcance | El inventario documental existe; no es evidencia de no-bypass ejecutada |
| Reproducibilidad de cierre | SHA exacto de código, pruebas autorizadas, logs CI de ese SHA y acta de aceptación M0 | No satisfecho |

### 10.3 Criterio de aceptación para la frontera

La frontera solo podrá considerarse demostrada cuando una revisión sobre un SHA exacto identifique el flujo autorizado de bootstrap y la evidencia ejecutada demuestre tanto el resultado permitido como la imposibilidad de continuar hacia las operaciones excluidas. La existencia de una función, un flag, un test aislado o documentación no basta por sí sola.

Hasta entonces:
- FB-01 permanece OPEN/UNKNOWN.
- P01-A/P01-G, raíz y aplicabilidad de la regla de primera creación permanecen OPEN/PENDING/UNKNOWN según su estado registrado.
- E2/E3 permanecen UNKNOWN.
- D0–D3 permanecen OPEN; D1-IMPLEMENTATION NO AUTORIZADA.
- M0 permanece INCOMPLETO; authorization: NOT_EVALUATED; primera creación y efectos protegidos STOP.

No se ejecutaron código, tests, CI/Actions, bootstrap ni comandos del dispositivo. No se modificaron archivos de runtime.
