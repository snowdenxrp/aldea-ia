# NCS M0 — D2/P-05: reconciliación de revisiones independientes sobre ownership/release

Fecha: 2026-10-25  
Rama objetivo: `ncs-clean-architecture`  
Estado: **NOTA DE EVIDENCIA DOCUMENTAL — NO RATIFICA CONTRATO — NO IMPLEMENTADA**

## 1. Propósito y límites

Registrar la comparación de las revisiones aportadas por Gemini y Claude sobre la propiedad del lock, liberación, limpieza de `owner.json` y readmisión tras incertidumbre.

- No se modificó runtime, tests, workflows ni datos operativos.
- No se ejecutaron tests ni CI.
- Los escenarios de carrera descritos aquí son hipótesis derivadas de lectura estática, no incidentes reproducidos.
- La revisión de Claude declara haber leído Continuity y P-05; la revisión de Gemini se limita explícitamente al análisis conceptual porque no pudo verificar esas fuentes.
- Esta nota no elige la política A/B de P-05 ni autoriza una reparación.

## 2. Fuentes contrastadas en la rama

- `src/nexo/core/continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- `tests/nexo/continuity-store.test.mjs`, blob `c3af56077b94c8d641979e0853de7f70fa45d82f`.
- `NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.
- Node.js `fs.rm()` documentation: https://nodejs.org/api/fs.html (the `force: true` option ignores errors if the path does not exist; this API description does not establish lock-object identity).

## 3. Hallazgos reconciliados

### H1 — El segundo intento de release no revalida ownership

En `continuity-store.mjs`, `acquireLock` crea una función de release que lee el owner y compara el token antes del primer `fsModule.rm(lockPath, { recursive: true, force: true })`. Si ese intento lanza, el segundo `rm` usa la misma ruta sin volver a leer el owner ni demostrar que el objeto de la ruta sea el mismo.

**Estado:** confirmado por lectura estática.  
**Riesgo:** si la ruta es sustituida durante la ventana, el segundo borrado podría afectar un lock ajeno.  
**Límite:** no reproducido; no se afirma que haya ocurrido.

### H2 — La limpieza tras fallo de escritura de owner tampoco verifica identidad

Si falla la escritura inicial de `owner.json`, el código intenta borrar recursivamente `lockPath` y absorbe el error de esa limpieza. No hay comprobación adicional de identidad antes del borrado.

**Estado:** confirmado por lectura estática.  
**Riesgo:** un cambio concurrente de la ruta podría hacer que la limpieza actúe sobre un objeto sustituto; además, si la limpieza falla, ese fallo no queda expuesto como resultado separado.  
**Límite:** escenario plausible no reproducido.

### H3 — `force: true` no prueba que se haya eliminado la instancia correcta

Node.js documenta que `force: true` ignora errores cuando la ruta no existe. Por ello, un retorno satisfactorio de `rm` no demuestra por sí solo que el proceso haya eliminado el lock que adquirió, ni distingue de forma general entre ausencia y borrado de una instancia concreta.

**Estado:** semántica de API documentada; consecuencia para la afirmación de ownership derivada de esa semántica y del código.  
**Límite:** no es una demostración de carrera real.

### H4 — La readmisión basada solo en ausencia de ruta no es evidencia suficiente

La ruta de adquisición borra el indicador local `lockReleaseFailures` cuando `access(lockPath)` da `ENOENT`, con el comentario de que una limpieza externa explícita retiró el lock previo. La ausencia observada no demuestra por sí sola que el actor previo haya terminado ni coordina procesos distintos. P-05 ya establece que la ausencia de ruta no debe bastar para readmitir.

**Estado:** confirmado por lectura estática y alineado con el requisito propuesto en P-05.  
**Límite:** no se ha establecido aquí un protocolo de recuperación alternativo.

### H5 — Las pruebas existentes caracterizan fallos, pero no demuestran E3/E4

La prueba `continuity-store.test.mjs` cubre:
- fallo de escritura de owner con limpieza en el caso esperado (aprox. líneas 122–141);
- fallo transitorio de `rm` que permite el segundo intento, usando un mock que falla antes de tocar el filesystem (aprox. líneas 399–459);
- fallo persistente de release y preservación separada del resultado de persistencia (aprox. líneas 461–493);
- owner con token distinto y resultado `not_owned` (aprox. líneas 663–699).

Esos casos no fuerzan el reemplazo de `lockPath` entre comprobación y borrado, ni prueban que una limpieza no pueda eliminar un lock sustituto.

**Estado:** cobertura actual inspeccionada estáticamente; las pruebas no se ejecutaron. E3/E4 no están demostrados por los casos identificados.

## 4. Reconciliación Gemini / Claude

Coincidencias:
- Una relectura de `owner.json` antes de borrar no cierra por sí sola TOCTOU.
- La limpieza por ruta sin demostrar identidad es un riesgo.
- Se necesitan pruebas deterministas con reemplazo de ruta, no solo mocks que arrojen un error antes de modificar el filesystem.
- No debe declararse resuelto sin evidencia.

Aporte específico de Claude:
- `readLockOwner` devuelve `null` ante errores de lectura/validación, por lo que ausencia, ilegibilidad y otros fallos pueden confluir en la ruta de decisión que produce `not_owned`.
- El `Set` de fallos es local al proceso y no constituye coordinación entre procesos.
- Las pruebas actuales de fallo de release no modelan sustitución del path.

Limitación de Gemini:
- Su respuesta reconoce que no verificó los archivos fuente ni la especificación; sus conclusiones son conceptuales y no una segunda verificación independiente del código.

## 5. Contrato mínimo que queda pendiente

Antes de elegir una solución, el propietario debe ratificar un modelo de procesos/filesystem y una política P-05. Como mínimo, el contrato debe exigir:

1. Una acción destructiva no se considera segura si no puede demostrarse que actúa sobre la instancia de lock autorizada bajo el modelo declarado.
2. Un reintento destructivo no hereda automáticamente la propiedad validada antes del primer intento.
3. Un resultado `released` requiere evidencia suficiente para esa afirmación; `ENOENT`, owner ilegible o path ausente no equivalen automáticamente a release confirmado.
4. Fallos de limpieza tras creación parcial de owner deben quedar visibles; si no puede probarse identidad, la salida debe permanecer incierta/bloqueada.
5. El estado local de fallo no se trata como coordinación interproceso ni se borra basándose en una suposición de que la ausencia del path demuestra quiescencia.
6. La decisión entre recuperación externa con quiescencia demostrable (P-05 A), mecanismo ligado a identidad del objeto (P-05 B) o mantener `UNKNOWN/BLOCKED` queda reservada al propietario. No se elige aquí un mecanismo concreto.

## 6. Pruebas propuestas para cuando exista autorización

- E3a: primer `rm` falla; una barrera reemplaza la ruta antes del segundo intento; el sustituto debe permanecer intacto.
- E3b: el primer `rm` altera/elimina parcialmente el lock y luego lanza error; un competidor adquiere la ruta; el segundo intento no debe destruir su lock.
- E3c: barrera entre lectura de owner y primer `rm`, para demostrar que releer antes del borrado no elimina por sí solo TOCTOU.
- E3d: `rm` parcial deja un directorio sin `owner.json`; no debe haber bucle de contención sin una política definida.
- E4a: falla escritura de owner y la ruta se sustituye antes de la limpieza.
- E4b: fallan tanto escritura como limpieza; el resultado debe exponer la incertidumbre.
- E5: owner ilegible por EACCES/EIO, JSON inválido o límites de tamaño; no colapsar sin más esos estados en “ausente”.
- E6: release falla, después desaparece el path; no conceder readmisión solo por la ausencia.
- E7: competidor real en proceso hijo durante release/recuperación, con rendezvous determinista.
- Cada ejecución futura debe asociarse al SHA exacto de runtime/tests y a su resultado CI. Esta lista es propuesta, no autorización para ejecutar.

## 7. Estado canónico

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/P-05: `OPEN`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

**Siguiente paso permitido:** decisión del propietario sobre la política P-05/modelo de filesystem, o revisión documental adicional de los contratos relacionados. No parchear runtime ni cambiar las pruebas sin autorización separada.


## 8. Contraste complementario con Chronicle (lectura estática)

Fuente: `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`; no se ejecutaron pruebas.

- Chronicle no contiene el mismo reintento explícito de release de Continuity: tras el fallo de su primer `rm`, devuelve `status: "failed"`.
- Sin embargo, su release también lee el owner, compara el token y luego elimina por ruta. Por tanto, la ausencia del segundo intento no demuestra por sí sola que la liberación inicial esté libre de TOCTOU.
- Si falla la escritura inicial de `owner.json`, Chronicle también intenta `rm(lock, { recursive: true, force: true })` y absorbe el error de limpieza. Esa ruta comparte el riesgo conceptual de la limpieza de Continuity.
- Chronicle sí falla cerrado ante recuperación de un lock que parece stale: su código comenta que el check-then-remove es racy y exige recuperación explícita. Esto es una salvaguarda relevante para reclamación de locks stale, pero no demuestra seguridad de sus rutas de release ni de limpieza tras fallo de owner.
- En ambos stores, `readLockOwner` devuelve `null` ante errores de lectura/parseo. En el camino de release, esto conduce a `not_owned`; por ello, la salida no distingue necesariamente “token distinto” de “owner ilegible”. La clasificación precisa de errores requiere un contrato de estado más rico o una decisión explícita sobre la semántica del resultado.

### Consecuencia

No se debe copiar automáticamente el comportamiento de Chronicle como “solución” de Continuity. Las dos implementaciones tienen semánticas diferentes, y ninguna queda demostrada como segura frente a sustitución de la ruta durante release solo por no tener un retry ciego. La comparación refuerza la necesidad de definir el modelo de filesystem/procesos y los predicados de propiedad antes de modificar cualquiera de los stores.

## 9. Estado y límites después del contraste

- Contraste Continuity/Chronicle: inspección estática de ambos blobs; sin ejecución.
- E3/E4 para ambos stores: no demostrados por las fuentes/pruebas identificadas.
- No se declara que una carrera haya ocurrido en producción.
- No se modifica el estado canónico: M0 `INCOMPLETO`; D2/P-05 `OPEN`; implementación `NO AUTORIZADA`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
