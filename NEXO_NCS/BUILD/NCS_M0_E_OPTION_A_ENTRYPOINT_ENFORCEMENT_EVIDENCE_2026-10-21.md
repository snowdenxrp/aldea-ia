# NCS M0-E — Evidencia de entry points y enforcement bajo opción A

Fecha: 2026-10-21
Estado: inspección de código y pruebas existentes; no se cambió runtime ni se añadieron tests redundantes.

## Resultado ejecutivo

La superficie CLI de Nexo es estrecha en el checkpoint inspeccionado, y hay pruebas ya existentes para sus principales garantías locales. La brecha no es “falta otro test genérico”: es que la persistencia CLI depende de rutas confiables y no existe todavía una autoridad constitucional verificada conectada a sinks protegidos. Se conserva el alcance A y no se amplía la suite sin contraejemplo nuevo.

## Cadena de ejecución observada

1. `package.json` expone `nexo: node scripts/nexo.mjs`; la suite `npm test` incluye `tests/nexo/entrypoint.test.mjs` y `tests/nexo/chronicle-runtime.test.mjs`.
2. `scripts/nexo.mjs` admite `status`, `mission-status` y `chronicle-append`; otras órdenes son bloqueadas. Para append, invoca mediante `spawnSync` el archivo concreto `scripts/nexo-chronicle-session.mjs`, sin un shell de comandos.
3. `scripts/nexo-chronicle-session.mjs` acepta rutas `--continuity` y `--chronicle`, identidad de misión/paso y contenido por stdin. No imprime el contenido ni las rutas en su resumen JSON.
4. `src/nexo/application/chronicle-append.mjs` preflighta ambos stores, requiere inicialización explícita si faltan, registra admisión/obligación/resultado y retorna `authorization: NOT_EVALUATED`. Su `dispatchAttempted: true` en éxito describe la ejecución de la acción Chronicle/local, no prueba un efecto externo autorizado.
5. `src/nexo/core/owner-backed-runtime.mjs` solo habilita la acción específica `chronicle_append` en esta ruta. Reparaciones y acciones genéricas quedan bloqueadas antes de PREPARED/dispatch.

## Evidencia de pruebas ya existente (reutilizar; no duplicar)

### `tests/nexo/entrypoint.test.mjs` — blob `644ddec437606ccd9ed0651ccf631e8b95ac4801`

La suite:
- comprueba que la API pública de aplicación es estrecha y no expone un dispatcher genérico;
- recorre el grafo de imports local desde ambos entry points y prohíbe dependencias al runtime legacy de Lúmina/memoria/simulación;
- comprueba que comandos no admitidos se bloquean;
- ejecuta el CLI en un proceso de sistema operativo, hace append con contenido por stdin y confirma que el contenido no se imprime;
- verifica que el append se persiste en Chronicle/Continuity y que un segundo proceso que repite la misma misión/paso no vuelve a despachar ni modifica los bytes persistidos;
- verifica que `status` y `mission-status` no exponen el payload y no alteran el archivo; comprueba estados preparados y contradicciones reconstruidas como bloqueados.

### `tests/nexo/chronicle-runtime.test.mjs` — blob `82f3f1a4ff4bb29285ff3579f506cd773819bedb`

La suite ya contiene:
- prueba de solo lectura adicional que compara bytes/mtime y demuestra que consultas sobre una ruta ausente no crean archivo;
- un handler genérico y un owner inyectado capaces de operar, y aun así prueba que `generic_write` devuelve `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED`, `dispatchAttempted:false`, cero llamadas a `recordPrepared` y cero dispatches;
- un fallo de lectura antes de PREPARED que conserva `dispatchAttempted:false` y cero commits/dispatches.

No se necesita añadir otra prueba equivalente de “acción genérica bloqueada” ni repetir la prueba de lectura. Hacerlo sin una nueva condición de fallo solo aumenta mantenimiento y ruido.

## Qué prueba y qué no prueba

**Prueba en los casos cubiertos:** el entry point rechaza órdenes desconocidas; el CLI Chronicle realiza persistencia local acotada bajo rutas de test; el replay idéntico no vuelve a ejecutar la acción; las consultas no escriben; el runtime owner-backed bloquea acciones no habilitadas antes de PREPARED/dispatch; el resultado de Chronicle no se presenta como autorización.

**No prueba:** que las rutas de producción estén bajo control de una configuración confiable; que el proceso o directorio resistan a un actor local hostil; que todos los entry points posibles de la aplicación estén inventariados; que exista raíz legítima, Constitución exacta verificada, Policy/contexto confiables o enforcement en todo sink externo; que `conditionalCommit.commit` sea un sink externo real.

## Consecuencia para opción A

- Mantener `status` y `mission-status` como lecturas.
- Permitir `chronicle-append` solo como operación local de persistencia, ejecutada por un operador/configuración de rutas confiables y con contenido no tratado como autoridad.
- No permitir que una misión, claim o contenido no confiable elija rutas de filesystem.
- Mantener reparaciones, Lúmina/simulación y efectos externos bloqueados.
- No cambiar `authorization: NOT_EVALUATED` ni la política de `UNKNOWN/STOP`.

## Siguiente paso

El siguiente paso de mayor valor no es otra prueba duplicada: es determinar cómo se invocará esta CLI en el producto Nexo real y quién controla las rutas. Si el entry point sigue siendo una herramienta local invocada manualmente, documentar ese supuesto de despliegue. Si el runtime o contenido no confiable puede invocarlo, rediseñar el límite antes de habilitarlo. Luego volver a M0-E: raíz legítima → Constitución exacta/Policy/contexto → enforcement en el sink real.

## Estado

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No commissioning ni autorización implícita.
