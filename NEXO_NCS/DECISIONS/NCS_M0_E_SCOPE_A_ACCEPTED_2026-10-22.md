# NCS — Decisión de alcance inicial M0-E: opción A

Fecha: 2026-10-22  
Estado: **ACEPTADA por el propietario para delimitar el alcance de implementación**

## Decisión

El propietario acepta la opción A como alcance inicial de M0-E. Esta decisión permite construir el núcleo inicial de Nexo alrededor de planificación, lectura, diagnóstico y persistencia interna bajo los contratos ya existentes. No amplía la autoridad del runtime.

Esta decisión **no** significa aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos.

## Límites operativos

- Mantener estrecha la superficie pública de Nexo y no exponer un dispatcher genérico.
- Mantener bloqueadas reparación, acciones de simulación/Lúmina, ejecución de comandos, red y otros efectos externos mientras no exista autoridad verificable y enforcement en el sink real.
- El caso de uso `chronicle_append` sigue siendo persistencia interna; no prueba autoridad constitucional ni habilita efectos protegidos.
- No conectar `effectBoundary.prepare` a la persistencia interna como arreglo cosmético.
- No fabricar una raíz, ni usar fixtures `AUTHORIZED` como prueba de procedencia legítima.

## Cambio de prueba de frontera

Se actualizó `tests/nexo/entrypoint.test.mjs` para:
1. Rechazar comandos genéricos o potencialmente efectuales (`execute`, `run`, `simulate`, `shell`, `http`, `effect`, `repair`) antes de dispatch, con `NEXO_COMMAND_UNSUPPORTED` y `dispatchAttempted: false`.
2. Excluir `effect-adapter.js` del grafo de importaciones alcanzable desde los entrypoints públicos de Nexo, junto con las rutas legacy previamente excluidas.

Commit del cambio de prueba: `39ee2f5996fd0586ce4c666a448a290371601de4`. El resultado CI del SHA final que incluya esta decisión debe comprobarse por separado antes de declarar PASS.

## Siguiente trabajo

1. Verificar el workflow determinista del HEAD final, incluyendo el job y el paso `Run tests`.
2. Si pasa, construir una capacidad real del alcance A en la aplicación pública, reutilizando contratos y consultas existentes.
3. Mantener efectos protegidos en `STOP` hasta demostrar la cadena completa: procedencia de raíz legítima → Constitución exacta aprobada → Policy/contexto verificables → decisión específica por claim → enforcement en el sink real.
4. Si falla, corregir únicamente el fallo observado; no reabrir investigaciones AB/P cerradas sin evidencia nueva.

## Estado canónico

- M0: `INCOMPLETO`
- autorización: `NOT_EVALUATED`
- raíz legítima: `PENDING/UNKNOWN`
- efectos protegidos: `STOP`
