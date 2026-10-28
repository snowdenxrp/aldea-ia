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

Hasta que se especifiquen el esquema y los bytes iniciales concretos, no se afirma que exista un snapshot inicial válido ya definido. No se inventan campos, valores por defecto, IDs ni un objeto Genesis.

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
