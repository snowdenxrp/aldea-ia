# NCS M0 — D2: especificación de alcance de admisión y propiedad de locks (P-03/P-04)
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: **PROPUESTA DE DISEÑO PARA REVISIÓN — NO RATIFICADA COMO CONTRATO COMPLETO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y límites

Resolver en un solo artefacto la relación entre:
- **P-03:** qué operación debe adquirir admisión antes de la primera lectura persistente y cuánto tiempo debe conservarla;
- **P-04:** quién adquiere la admisión de instancia en cada flujo, cómo se compone con los locks per-store existentes y cómo evitar reentrada/deadlock padre-hijo.

No selecciona una primitiva nueva, no crea marcador persistente, lock hermano, ID, cola, transacción ni retry. No modifica código, tests, workflows o datos. Las propuestas de esta especificación no se consideran ratificadas hasta decisión explícita del propietario.

## 2. Decisiones ya ratificadas que restringen el diseño

1. **O-08:** una raíz explícita única `--root`; sin override ambiental ni fallback legacy; la operación normal no hace bootstrap implícito; canonicalizar la raíz antes de derivar rutas; no migración automática, doble escritura ni merge heurístico.
2. **O-10:** consultas, previews y Chronicle dentro del alcance deben pasar por admisión antes de leer datos persistentes; “read-only” no es una excepción.
3. **O-11:** release incierto implica `UNKNOWN/BLOCKED`; no reintento automático de negocio ni readmisión hasta resolver la incertidumbre.
4. La raíz o el lock de instancia no son autoridad constitucional ni autorización de efectos protegidos.

Estos principios están ratificados como diseño, no implementados ni verificados en runtime.

## 3. P-03 — alcance de admisión propuesto

### 3.1 Regla normativa propuesta

Cada operación pública que pueda leer o mutar los stores canónicos Nexo debe completar la siguiente secuencia:

1. Validar sintaxis/forma de argumentos sin abrir stores.
2. Resolver y validar la raíz explícita de acuerdo con O-08; canonicalizarla antes de derivar paths.
3. Adquirir admisión para esa raíz. Cualquier estado ambiguo resulta en `UNKNOWN/BLOCKED`.
4. Solo después de admitir, abrir/leer los stores cubiertos y materializar el snapshot.
5. Mantener la admisión durante toda la vida útil del snapshot y hasta terminar el consumo que depende de él; no liberar después de `loadCurrent()` si la operación todavía usa ese resultado.
6. Completar la operación y sus escrituras cubiertas, capturar por separado resultado de negocio/persistencia y resultado de release, y liberar la admisión.
7. Si el release es incierto, conservar el resultado de persistencia conocido, no afirmar release limpio, no repetir la operación y bloquear readmisión según O-11 hasta que exista evidencia aceptable de resolución.

La sección protegida empieza antes de la primera lectura de contenido persistente de Continuity/Chronicle y termina después del último uso del snapshot y de las escrituras pertenecientes a la misma operación. No significa mantener el lock durante entrada interactiva o trabajo no relacionado sin necesidad demostrada.

### 3.2 Clasificación provisional de accesos

| Acceso | Clasificación propuesta | Regla / incertidumbre |
|---|---|---|
| `continuity.json`, `chronicle.json` | Store canónico cubierto | No leer ni materializar antes de admisión; conservar admisión mientras se consume el snapshot. |
| Query/status/mission/plan/Open Loops | Lectura persistente cubierta | No excepción read-only. La API de query debe recibir/obtener contexto admitido; no depender de que el CLI sea el único caller. |
| Preview de draft/request | Mixto | El archivo externo `--draft`/`--request` es entrada del operador, no store canónico. El contrato debe fijar si se lee antes o después de admisión; por defecto conservador propuesto: validar forma y límites primero, admitir antes de leer contenido del store Nexo, y no considerar la lectura del archivo externo prueba de admisión. No afirmar atomicidad entre archivo externo y stores. |
| `--content-stdin` | Entrada externa no persistente | Puede leerse/validarse antes de admisión si no abre stores ni produce efectos; el hijo debe rechazar argumentos inválidos antes de cualquier store I/O. No tratar stdin como autorización. |
| `realpath/stat` de raíz y metadata de directorio | Preparación de raíz | Ocurre antes de admisión por necesidad de resolver la raíz; debe limitarse a la validación de configuración. No se considera lectura de contenido de los stores. Límites de symlink/TOCTOU siguen sujetos a P-07. |
| Archivo/directorio de lock y owner record | Protocolo de admisión | Es lectura/escritura del propio protocolo, no del snapshot de negocio. Solo el implementador del protocolo puede acceder antes de que la admisión quede establecida; no autoriza leer stores. |
| Estado del mundo o memoria de aprendizaje de Lúmina | Dominio Lúmina | No introducirlos dentro del lock Nexo ni usarlos para inferir la raíz o autoridad Nexo. Su integración requiere contrato de dominio aparte. |
| APIs exportadas de stores/owner | Superficie de bypass potencial | No declararlas INTERNAL_ONLY solo por intención; cada caller debe quedar clasificado o permanecer UNKNOWN/BLOCKED. La admisión de CLI no prueba cobertura de consumidores directos. |

### 3.3 Regla para helpers y snapshots

Las funciones puras que reciben un valor ya cargado y no acceden a stores pueden ejecutarse fuera de la sección protegida si el snapshot sigue inmutable y la decisión se basa en ese snapshot. Si una función vuelve a consultar un store, recarga estado, inicializa o persiste, pertenece al flujo admitido. No se permite que una API de aplicación haga un `loadCurrent()` path-oriented por fuera de contexto y después intente “validarlo” retroactivamente.

## 4. P-04 — ownership de admisión por flujo propuesto

| Flujo | Propietario propuesto de admisión de instancia | Reglas para locks per-store | Estado actual |
|---|---|---|---|
| Query/preview por `scripts/nexo.mjs` | Operación pública admitida que abarca lectura y uso del snapshot; decidir si el CLI o la API pública posee el contexto, pero no ambos | Locks de store conservan semántica propia; la query no debe asumir que el lock de mutación ya protege `loadCurrent()` | OPEN; la query actual carga por path y no demuestra admisión de instancia |
| Chronicle append vía CLI padre | El proceso hijo `scripts/nexo-chronicle-session.mjs` que ejecuta append adquiere y libera admisión | El padre no debe adquirir y retener el mismo lock mientras espera con `spawnSync`; no transferir una “admisión heredada” como prueba | OPEN; padre/hijo actuales no exigen la raíz contractual |
| Chronicle append ejecutado directamente | El propio proceso hijo/entrypoint adquiere admisión, con la misma validación que en ejecución delegada | Mismo contrato que ejecución delegada; no bypass por invocación directa | OPEN; entrypoint directamente ejecutable |
| Helpers de aplicación llamados por la operación admitida | Reciben contexto de admisión ya establecido; no reentran al lock de raíz | Pueden usar locks per-store existentes conforme a sus contratos actuales; orden y límites deben caracterizarse antes de modificar | OPEN; contexto explícito no está demostrado universalmente |
| Pruebas de bajo nivel de stores | Las pruebas pueden ejercitar primitivas per-store aisladas | Preservar las pruebas de semántica de store; no confundir test de store con test de admisión de instancia | TEST_ONLY; no prueba de frontera productiva |
| `assistants.mjs` / `simulate.mjs` | No entran al flujo ordinario Nexo hasta definir y verificar el corte de dominio | No convertir el lock de instancia en una falsa transacción entre estado Lúmina, memoria de aprendizaje y Continuity | EXPLICIT_EXCEPTION de diseño, no bloqueo runtime demostrado |
| Repair/dispatch/settlement | Fuera del flujo operativo M0 según O-07; su exclusión de alcance no demuestra inalcanzabilidad | No deducir autorización de tener un lock; mantener los gates constitucionales y UNKNOWN donde falten callers | Excluido de alcance; inalcanzabilidad técnica no demostrada |

### 4.1 Invariante padre/hijo

Se propone una sola propiedad de admisión por operación:
- El padre valida argumentos superficiales y transmite la raíz explícita y opciones permitidas.
- El hijo valida de forma independiente la raíz, opciones contradictorias y la prohibición de bootstrap en operación normal antes de abrir stores.
- El padre no adquiere el lock de instancia si el hijo será el dueño de la operación protegida.
- Si el hijo se invoca directamente, ejecuta el mismo camino de validación y admisión.
- Los helpers dentro del hijo reciben contexto ya admitido y no reentran al lock de instancia.

Esto evita el deadlock de “padre retiene lock → espera al hijo → hijo espera el mismo lock”. La gramática CLI exacta, los flags de bootstrap, el layout canónico y la compatibilidad con rutas heredadas siguen abiertos; esta sección no los decide.

## 5. Caracterización de locks existentes — no unificar a ciegas

Fuentes verificadas en la rama `ncs-clean-architecture`:

| Archivo | Blob SHA | Hecho de fuente observado | Implicación |
|---|---|---|---|
| `src/nexo/core/continuity-store.mjs` | `9ffd28930abdbe29f5b041711cc29b74dc99fbae` | Lock path `<file>.lock`; owner con pid/token/createdAt; tras un error de release puede hacer un segundo `rm(..., recursive:true, force:true)`; mantiene un `Set` local de paths con fallos de release. | La reintento de retirada y la cuarentena son locales al proceso; el segundo `rm` por ruta requiere prueba de que no alcanza un lock reemplazado. |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | Lock path `<file>.lock`; owner con pid/token; comprueba token antes de release; un fallo de release devuelve error, sin el mismo retry explícito de Continuity. | Semántica distinta de release; preservar diferencia hasta que haya pruebas que justifiquen un cambio. |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` | Las rutas públicas de query llaman `loadCurrent()` mediante factory path-oriented. | La query no demuestra admisión de instancia ni una sección crítica que cubra el uso del snapshot. |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | Construye stores y abre Continuity owner; expone resultado de lock release en resultados bloqueados. | Debe ubicarse bajo un dueño único de admisión y preservar resultado de persistencia separado de release. |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | Lanza Chronicle mediante `spawnSync`; parser de CLI observado usa rutas legacy `--continuity`. | No hay evidencia de raíz única/admisión efectiva. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Entry point directamente ejecutable; acepta `--continuity`, `--chronicle` y flags `--initialize-*`. | Debe validar de forma independiente; hoy la fuente no implementa el contrato ratificado de raíz. |

Esta tabla es caracterización de fuente, no una prueba dinámica de concurrencia ni garantía contra carreras del filesystem.

## 6. Release incierto y readmisión — condiciones mínimas

1. Separar tres resultados: operación/negocio, persistencia observada y liberación de lock.
2. Persistencia confirmada + release incierto significa: conservar “persistencia confirmada”, declarar release incierto y bloquear reejecución de negocio.
3. Persistencia desconocida + release incierto significa: resultado UNKNOWN; no retry automático.
4. No deducir que el lock está libre por timeout, PID aparentemente muerto, edad, fallo de lectura, variable local ni una observación aislada de path ausente.
5. No borrar un lock de reemplazo. La comparación token-antes-de-borrar no demuestra por sí sola identidad del objeto a través de una carrera.
6. No habilitar readmisión hasta que el protocolo aprobado demuestre que el actor anterior ya no puede alterar el estado protegido y que no se está retirando el lock de otro actor.
7. El mecanismo exacto de recuperación/readmisión queda abierto en P-05; no se propone aquí recuperación automática ni infraestructura persistente nueva.

## 7. Casos de aceptación para el futuro test de arquitectura/concurrencia

Estos son requisitos de diseño para cuando la implementación sea autorizada; no se ejecutaron ni implementaron:

- Query/status/plan/preview sin `--root`: rechazo antes de abrir stores.
- Query con raíz válida: admisión antes del primer `loadCurrent()`; el contexto sigue vivo hasta terminar el uso del snapshot.
- Fallo de admisión: cero lecturas de stores, cero mutaciones, cero dispatch; autorización no evaluada cuando aplique.
- Query que intenta recargar estado fuera de contexto: test de arquitectura debe detectarlo o bloquearlo.
- Chronicle vía padre y directo: mismo contrato de raíz; hijo valida en ambos casos; no doble adquisición ni deadlock padre/hijo.
- Hijo con rutas legacy contradictorias o flags de bootstrap en operación normal: rechazo antes de store I/O, según la gramática CLI que se ratifique.
- Helper invocado directamente por una API de producción: no puede leer store fuera de admisión; caller desconocido permanece UNKNOWN/BLOCKED.
- Reemplazo del lock entre comprobación y retirada/retry: el lock reemplazado sobrevive.
- Persistencia confirmada + release incierto: se conserva el resultado de persistencia, sin retry de negocio y sin readmisión.
- Persistencia desconocida + release incierto: UNKNOWN, sin retry de negocio ni readmisión.
- Proceso competidor durante release incierto: no entra hasta que se resuelva conforme al protocolo aprobado.
- Fallo al escribir owner y sustitución del path durante limpieza: la limpieza no elimina el lock de reemplazo.
- Los tests de store existentes siguen verificando sus contratos per-store; la prueba de admisión es separada y cubre entrypoints/callers.

## 8. Puertas abiertas exactas

- **P-03:** ratificar el límite de sección crítica y las clasificaciones de stdin/archivos externos/metadata; cerrar caller coverage para queries y previews.
- **P-04:** elegir explícitamente el propietario de admisión por flujo; fijar el contrato de contexto para helpers y la relación con locks per-store; confirmar la ruta de Chronicle padre/hijo.
- **P-05:** definir evidencia segura de release/readmisión sin inventar mecanismo por conveniencia.
- **P-07/P-08:** cerrar límites de alias/filesystem y gramática/compatibilidad CLI.
- **P-09:** aristas dinámicas, indirectas y consumidores externos siguen UNKNOWN/BLOCKED hasta evidencia específica.
- La raíz explícita y admisión antes de lectura están ratificadas como diseño; su enforcement sigue ausente/no verificado.

## 9. Orden de trabajo siguiente

1. Revisar esta especificación contra el registro de decisiones y confirmar que no eleva una propuesta a ratificación.
2. Resolver explícitamente P-03: sección crítica y tratamiento de inputs externos/metadata.
3. Resolver explícitamente P-04: dueño por flujo y no reentrada.
4. Resolver P-05 en un artefacto separado sin añadir protocolo de recuperación automáticamente.
5. Solo después de cierre de diseño, solicitar autorización de implementación. No editar runtime/tests/workflows ni ejecutar CI sin esa autorización.

## 10. Estado canónico al emitir este documento

- M0: `INCOMPLETO`
- D1-DESIGN: `OPEN`
- D2: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- Autorización: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

Sin cambios de runtime, tests, workflows o datos. No se ejecutaron tests/CI. Esta especificación es documental y no cierra M0.
