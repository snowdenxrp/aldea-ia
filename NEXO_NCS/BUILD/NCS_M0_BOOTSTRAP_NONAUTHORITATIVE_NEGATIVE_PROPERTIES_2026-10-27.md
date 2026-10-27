# NCS M0 — Propiedades negativas exigidas para bootstrap no autoritativo

**Fecha:** 2026-10-27  
**Rama objetivo:** `ncs-clean-architecture`  
**Estado:** análisis de diseño; no es contrato ratificado ni implementación.  
**Base:** Opción A de alcance elegida por el propietario; Opción B de mecanismo sigue siendo bootstrap explícito separado del commit condicional normal. D3/STOP sigue siendo el estado operativo.

## 1. Propósito y límite

Este documento convierte D1 —bootstrap de datos estrictamente no autoritativos— en propiedades negativas verificables: no solo qué puede hacer la inicialización, sino qué **no debe poder causar**.

No decide quién autoriza la creación inicial. No declara que el almacenamiento de continuidad actual sea no autoritativo de extremo a extremo. No habilita runtime, pruebas, workflows, configuración, reparación ni efectos protegidos.

## 2. Propiedades negativas propuestas

| ID | Propiedad que debe mantenerse falsa | Evidencia exigida para aceptar D1 | Estado actual |
|---|---|---|---|
| NBP-01 | La existencia, ausencia o inicialización de un archivo local **no establece** identidad del propietario, raíz de confianza, autoridad constitucional, permiso ni aprobación. | Contratos de todos los consumidores que distingan estado de datos de autoridad; prueba de que ninguna ruta deriva autoridad de la mera presencia del archivo. | No demostrado globalmente. |
| NBP-02 | El resultado “inicializado” **no habilita por sí solo** admisión, PREPARED, dispatch, reconciliación, reparación ni mutación de dominio. | Frontera de invocación independiente y trazado completo desde entrypoints hasta adaptadores/efectos; pruebas de integración con almacenamiento real que comprueben que no se invocan adaptadores. | Contradicho por la ruta estática Chronicle actual: la misma invocación puede continuar a admisión, PREPARED y `chronicle_append`. |
| NBP-03 | El bootstrap no puede combinarse con una misión, acción, contenido de dispatch ni solicitud de reparación para continuar la operación. | Contrato de entrada que rechace payloads mixtos antes de cualquier persistencia/dispatch y pruebas end-to-end. | No implementado ni probado; BA-03 propuesto. |
| NBP-04 | La falta de continuidad no se convierte en permiso para crearla ni continuar una operación normal. | Las rutas normales bloquean antes de admisión/dispatch si falta el store; el bootstrap es una invocación separada. | No satisfecho en la ruta Chronicle cuando se usa `--initialize-continuity`; simulación también liga la inicialización a ausencia del archivo de mundo. |
| NBP-05 | Archivo existente inválido, error de lectura, error de I/O o resultado ambiguo no se interpreta como ausencia ni como prueba de que no hubo escritura. | Contrato IO que distinga ausente/existente/inválido/conflicto/UNKNOWN; bytes existentes preservados; pruebas de fallo real. | Gap histórico documentado en el contrato de persistencia; cobertura real no verificada en esta ronda. |
| NBP-06 | El estado inicial no se consume como señal suficiente para decidir reconciliación o repetir un efecto. | Trazar todos los lectores de `effectJournal` y sus gates; demostrar que UNKNOWN bloquea y no genera reintento automático. | No demostrado de forma exhaustiva; snapshot contiene `effectJournal` y runtime/owner lo consumen. |
| NBP-07 | Un inicializador concurrente no sobrescribe la creación ganadora ni un archivo preexistente. | Creación exclusiva atómica o equivalente que cubra a todos los escritores relevantes, no solo locks cooperativos; prueba concurrente. | No verificado globalmente. |
| NBP-08 | La inicialización de continuidad no habilita indirectamente reparación mientras las reparaciones estén fuera de M0. | Mapa de entrypoints/callers de reparación y evidencia de que no se crea/injecta un owner/PREPARED suficiente para despacharlas. | La integración de reparación del runtime del producto está bloqueada por `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; los módulos dedicados existen y su invocabilidad no está globalmente descartada. |
| NBP-09 | `authorization: NOT_EVALUATED` no se interpreta como aprobación ni como enforcement. | Todos los gates reales identificados; tests que prueben bloqueo cuando la autorización no se evalúa. | La ruta Chronicle puede continuar pese a ese valor; por tanto el valor no es un gate efectivo en esa ruta. |
| NBP-10 | El alcance “local/no autoritativo” no se utiliza para ocultar persistencia con consecuencias operativas. | Inventario de cada destino persistente y clasificación de su consumidor/efecto; estado inicial limitado a almacenamiento acotado definido por contrato. | No demostrado: Chronicle y simulación persisten cambios tras la inicialización. |

## 3. Evaluación frente a la evidencia disponible

### Chronicle

Lectura estática de `scripts/nexo-chronicle-session.mjs`, `src/nexo/application/chronicle-append.mjs`, `src/nexo/core/owner-backed-runtime.mjs` y `src/nexo/adapters/chronicle-effect.mjs` muestra una ruta en la que `--initialize-continuity` permite inicializar el store y continuar dentro de la misma invocación hacia admisión, PREPARED y el handler que llama a `store.append(...)`.

**Resultado:** NBP-02 y NBP-04 no se pueden aceptar para la ruta actual. Esto es una conclusión de código estático; no significa que se haya ejecutado la ruta ni que se haya concedido autoridad constitucional.

### Simulación

Lectura estática de `scripts/simulate.mjs` muestra que la ausencia del archivo de mundo participa en `allowEmptyInitialization: !stateExists`; después el flujo avanza la simulación y persiste el estado del mundo.

**Resultado:** NBP-04 y NBP-10 no están demostradas. La escritura de simulación no se etiqueta como autoridad constitucional, pero sí es trabajo persistente posterior al bootstrap dentro de la misma invocación.

### Continuidad y journal

`continuity-snapshot.mjs` declara el snapshot operacional y no autoritativo, pero el snapshot incluye `effectJournal`; el owner/runtime consumen ese journal en los flujos de ejecución/reconciliación.

**Resultado:** la etiqueta del snapshot no basta para demostrar NBP-01 ni NBP-06. Se necesita trazar consumidores y gates completos; una intención declarada en comentarios no prueba aislamiento end-to-end.

### Qué protege el runtime y qué no demuestra

La lectura de `src/nexo/core/owner-backed-runtime.mjs` también muestra controles reales que deben conservarse en el diagnóstico, sin confundirlos con aislamiento del bootstrap:

- Antes de un dispatch nuevo, el runtime comprueba que el handler y el verificador de reconciliación estén disponibles, y exige que la escritura de `PREPARED` quede confirmada con revisión coherente.
- Si la escritura de `PREPARED` resulta `UNKNOWN` o no queda confirmada, el runtime devuelve sin dispatch. Si el adapter ya pudo ejecutarse y el resultado es incierto, la ruta prohíbe redispatch automático.
- Para una entrada PREPARED existente, el runtime intenta la vía de reconciliación; la incertidumbre mantiene bloqueada la ejecución nueva.

Estos controles reducen riesgos de dispatch duplicado en la ruta de runtime inspeccionada, pero **no demuestran NBP-01–NBP-04**: el caller Chronicle puede crear el owner y luego entrar a ese runtime en la misma invocación; los controles de PREPARED no son una regla canónica de autoridad para crear el primer estado ni una frontera exclusiva de bootstrap.

El handler `chronicle_append` invoca `store.append(...)`. Es una mutación persistente del almacén Chronicle; esta observación no debe ampliarse sin evidencia a “efecto externo irreversible” ni a ejecución de una transición protegida. El punto demostrado es más estrecho: la inicialización y una operación mutante pueden compartir el mismo recorrido de aplicación.

### Resultado de la revisión del límite

- **Existe evidencia de controles locales de ejecución:** confirmación de PREPARED, bloqueo ante resultado incierto y prohibición de redispatch automático en los casos inspeccionados.
- **No existe evidencia suficiente de aislamiento del bootstrap:** falta una frontera que termine la operación tras inicializar, y la ruta Chronicle puede continuar hacia una escritura.
- **No se infiere ausencia global de otros callers:** el inventario sigue siendo dirigido y la búsqueda indexada no es evidencia negativa.

### Reparación: separación entre bloqueo del runtime de producto y módulos dedicados

La lectura estática dirigida de `scripts/nexo-runtime-session.mjs`, `scripts/nexo-repair-entrypoint.mjs`, `scripts/nexo-repair-preparation.mjs` y `scripts/nexo-repair-dispatch.mjs` permite precisar el alcance:

- La sesión de reparación expuesta por el runtime de producto devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, con `dispatchAttempted: false`; esa entrada está bloqueada para M0.
- Los módulos dedicados de reparación siguen presentes. `runNexoRepairOnce({ owner, ... })` recibe un owner como dependencia, inspecciona `effectJournal`, y puede seguir preparación, observación del estado persistido, dispatch y settlement si se cumplen sus contratos. El dispatcher restringe las acciones a las tres acciones de reparación reconocidas y usa carga estricta del estado persistido más `persistState` condicional.
- El código revisado no demuestra que el bootstrap Chronicle invoque directamente esos módulos de reparación. Tampoco demuestra que sean inaccesibles desde cualquier otro caller: el entrypoint dedicado acepta un owner suministrado por el llamador.
- El owner de continuidad no sustituye autoridad constitucional. Para acciones de reparación, la reconciliación genérica devuelve `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` con `authorization: NOT_EVALUATED`; el flujo dedicado usa contratos específicos de reparación.

**Clasificación:** integración de reparación en la sesión de runtime M0 = bloqueada en el código inspeccionado; existencia de módulos dedicados = confirmada; ausencia de todos los callers posibles = UNKNOWN. La política de exclusión M0 sigue vigente. No se ejecutaron esos módulos.

### Cobertura del inventario

Los llamadores directos observados en las rutas revisadas son Chronicle y simulación. El mapa actual es dirigido, no exhaustivo: el índice de búsqueda de GitHub dio resultados vacíos para símbolos conocidos y esos resultados no se consideran evidencia negativa. No se ha descartado toda carga dinámica ni todo consumidor indirecto.

**Resultado:** no se puede certificar globalmente D1 con el inventario actual.

## 4. Regla de decisión propuesta

D1 solo sería aceptable si **todas** las propiedades negativas aplicables se demuestran con contratos y evidencia end-to-end. Una sola propiedad incumplida o UNKNOWN mantiene STOP. La etiqueta “operacional”, la ausencia de archivo, un snapshot vacío, `persisted: false` o `authorization: NOT_EVALUATED` no sustituyen la evidencia.

La siguiente secuencia documental es:

1. Mantener D3/STOP mientras NBP-01–NBP-10 no estén demostradas.
2. Delimitar el grafo de consumidores y destinos persistentes, empezando por las dos rutas confirmadas (Chronicle y simulación), sin declarar exhaustividad prematura.
3. Registrar cada propiedad como **demostrada / refutada / UNKNOWN**, con ruta concreta y evidencia.
4. Si Chronicle sigue combinando bootstrap y dispatch en la misma invocación, D1 falla para esa ruta; no maquillar el fallo con un nombre nuevo ni tratar `NOT_EVALUATED` como gate.
5. Solo después de resolver el alcance y obtener autorización específica podría plantearse una propuesta de cambio ejecutable y sus pruebas. Este documento no la autoriza.

## 5. Evidencia y límites de esta actualización

- Solo análisis documental y lectura estática; no se ejecutó código.
- No se modificaron runtime, tests, workflows ni configuración ejecutable.
- No se ejecutaron tests ni CI.
- No se contactó a otras IAs.
- Gates conservados: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.
