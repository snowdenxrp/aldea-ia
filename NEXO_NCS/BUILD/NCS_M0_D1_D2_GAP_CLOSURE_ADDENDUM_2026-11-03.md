# NCS M0 — addendum de cierre de brechas D1/D2
**Fecha:** 2026-11-03  
**Rama documental:** `ncs-m0-documentary-reconciliation-2026-11-02`  
**HEAD de la rama antes de este addendum:** `c88ae1ed0758f97af6089e90b2ebfa220edba3bf`  
**Base de código examinada por los contratos D1/D2:** `99dabcb33be1efef5c4f5e368dc95140e45ff672`  
**Naturaleza:** aclaración técnica propuesta; no ratifica P03/P04/P05 ni autoriza implementación.

## 1. Fuentes exactas y precedencia

Este addendum complementa, sin sustituir ni reescribir:
- `NCS_M0_D1_TARGET_CONTRACT_AND_ENTRYPOINT_CLASSIFICATION_2026-11-02.md`, blob `fb7ce6a6a2c9a3ccd0a2f5e5a157c3da5d2c3782`.
- `NCS_M0_D2_ADMISSION_RELEASE_TARGET_CONTRACT_2026-11-02.md`, blob `c7eda831607cc660d03c3de740c1819a93a467a0`.
- `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`.
- `NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.
- `NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md`, blob `99e9fe8a57639e96f5f114b6ef722bfb4652a33b`.
- Decisiones ratificadas O-07, O-08, O-09, O-10 y O-11; no se modifican.

Cuando una formulación anterior sea ambigua, este addendum fija la interpretación técnica recomendada para revisión. No convierte una propuesta en una decisión ratificada ni en comportamiento implementado.

## 2. Resultado de la comparación independiente

| Observación | Dictamen |
|---|---|
| Padre → child Chronicle: falta explicitar qué hace el padre antes de delegar | Brecha real de composición; se aclara en §3 |
| Reentrada: falta resultado observable | El contrato D2 ya incluía rechazo/STOP en su tabla de aceptación; faltaba asignar con precisión la responsabilidad y la prohibición de que helpers intenten readquirir. Se aclara en §4 |
| Metadatos de `--root` antes de admisión | Brecha real de delimitación entre D1 y D2; se cierra como lista limitada en §5 |
| Criterios de aceptación | Las condiciones estaban enumeradas, pero faltaba una matriz binaria y una separación clara entre evidencia de diseño e implementación. Se añade en §7 |
| Separación Nexo/Lúmina | La intención ya estaba documentada; se precisa la consecuencia de mantener ownership histórico UNKNOWN en §6 |
| P05 y readmisión | No queda resuelto por una aclaración textual. Permanece OPEN; no se inventa un protocolo ni una garantía imposible (§8) |

Qwen no pudo acceder a los documentos y su resultado se considera marco de revisión, no evidencia de contradicción. Gemini usó una referencia documental anterior; sus observaciones históricas ya reconciliadas no se reabren. DeepSeek sí aportó las brechas concretas anteriores; se corrige además su lectura de reentrada: D2 §7 ya exige rechazo/STOP, pero no asignaba claramente la responsabilidad de evitar el segundo intento de adquisición.

## 3. Composición inequívoca del flujo padre → child Chronicle

### 3.1 Delegación pura — caso normal recomendado

Cuando el CLI padre delega a `scripts/nexo-chronicle-session.mjs` la operación Chronicle completa:

1. El padre puede parsear y validar la gramática de sus argumentos, resolver/canonicalizar la raíz explícita y preparar la invocación del proceso hijo.
2. El padre **no adquiere admisión de instancia** para esa operación delegada.
3. Antes de delegar, el padre no abre, inspecciona ni lee Continuity/Chronicle, ni construye un owner/store que pueda hacerlo.
4. El padre no transmite un token, contexto o lock heredado como sustituto de admisión del hijo.
5. El child valida independientemente sus argumentos y la raíz, canonicaliza según O-08, adquiere una admisión propia y solo entonces realiza la primera lectura persistente.
6. El child conserva esa admisión durante toda la vida útil del snapshot y las escrituras que dependan de él; libera conforme a D2.
7. El padre espera el resultado del child sin retener admisión de instancia.

El child es el único owner de admisión de la operación Chronicle delegada. Su invocación directa debe recorrer exactamente el mismo contrato de validación, admisión y lectura.

### 3.2 Si el padre necesita leer el snapshot

Si el padre necesita leer Continuity/Chronicle para decidir qué debe hacer, ya no está realizando una delegación pura. Esa lectura constituye una operación protegida propia y exige admisión previa.

No se permite que el padre:
- lea bajo su admisión y mantenga esa admisión mientras espera al child;
- libere la admisión y luego permita que el child use como vigente el snapshot anterior para una decisión que depende de él;
- transfiera al child la admisión del padre.

En ese caso, el diseño debe mover la lectura y la decisión dependiente al child para que el child sea owner de la operación completa, o mantener la operación en el mismo proceso bajo una única admisión. No se prescribe una implementación concreta. Si la composición necesaria no puede mantenerse sin doble adquisición, snapshot obsoleto o lock retenido durante `spawnSync`, el camino queda UNKNOWN/BLOCKED.

### 3.3 Regla de no herencia

La admisión es propiedad de una operación ejecutada por un proceso, no una propiedad implícita del árbol de procesos. PID padre, argumentos heredados, variables de entorno o la mera invocación desde el CLI padre no prueban admisión del child.

## 4. Reentrada y responsabilidad de rechazo

1. Una operación protegida tiene un solo owner de admisión de instancia y realiza una sola adquisición de esa admisión.
2. El owner es el límite de operación admitida identificado en el manifest D1; no lo son los helpers ni las factories de store.
3. Los helpers que necesitan estado reciben el snapshot ya cargado dentro de la operación admitida. No vuelven a abrir/releer stores ni llaman a la adquisición de instancia.
4. Una segunda adquisición anidada/reentrante dentro de la misma operación debe rechazarse de forma determinista con resultado semántico **REJECTED / STOP**, antes de cualquier lectura persistente adicional. No debe esperar por su propio lock ni entrar en deadlock.
5. La responsabilidad contractual de impedir la reentrada corresponde a la frontera de adquisición/composición de la operación: solo el owner puede invocar la adquisición; los helpers carecen de una ruta de adquisición independiente.
6. Si el runtime no puede distinguir con evidencia una reentrada de una contención legítima, no debe adivinar: el caso queda UNKNOWN/BLOCKED y no se leen stores.
7. No se prescribe un token, closure, context object, código de error ni primitiva concreta. La implementación deberá hacer observable el rechazo y demostrarlo con prueba negativa autorizada.

La tabla de aceptación D2 §7 ya contiene el resultado esperado para “Intento de reentrada”; esta sección lo convierte en regla de composición y asigna la responsabilidad sin crear otro lock.

## 5. Lista cerrada de I/O permitida antes de admisión

O-10 prohíbe la primera lectura persistente del snapshot canónico antes de una admisión válida. Para evitar que “metadatos de root” se convierta en una excepción abierta, la preparación previa queda limitada a:

### 5.1 Permitido antes de admisión

- Parseo/validación sintáctica de argumentos y normalización puramente léxica de la ruta explícita `--root`.
- Resolución/canonicalización de esa raíz existente mediante la operación equivalente a `realpath`.
- Lectura de metadatos de filesystem estrictamente necesarios para resolver y validar **la propia ruta raíz** y comprobar que el destino existe y es un directorio. La política exacta para symlinks/aliases/mounts sigue sujeta a P07; una ambigüedad no resuelta produce STOP/UNKNOWN.
- I/O del propio objeto de admisión (por ejemplo, comprobar/crear el objeto lock y leer/escribir su owner record), exclusivamente dentro de la rutina que implementa la adquisición. Ese I/O forma parte del protocolo de admisión; no concede permiso a ningún caller para abrir stores.
- Entradas externas del operador, como stdin o archivos draft/request, solo según la gramática del comando y como datos no confiables. Su lectura no es lectura del snapshot canónico, no demuestra admisión y nunca puede disparar efectos por sí sola.

### 5.2 Prohibido antes de admisión

Antes de que la adquisición de instancia haya concluido satisfactoriamente, ningún caller de aplicación puede:
- abrir, leer, parsear o materializar el contenido de Continuity o Chronicle;
- consultar su existencia, tipo, tamaño, timestamps, permisos, hash o metadata para decidir el flujo;
- enumerar directorios para descubrir stores;
- construir un owner/store que efectúe cualquiera de esas operaciones;
- usar una lectura previa, snapshot cacheado o resultado de un helper para eludir O-10.

La lista de §5.1 es exhaustiva para el contrato propuesto. No se interpreta como autorización general para cualquier I/O persistente. Las rutas exactas de stores siguen sin decidirse: el layout root→store permanece OPEN bajo O-08. No se asume `<root>/continuity.json`, `<root>/chronicle.json` ni otro nombre.

## 6. Frontera Nexo/Lúmina y consecuencia de UNKNOWN

- Continuity/Chronicle canónicos permanecen en el dominio operacional Nexo.
- World simulation y learning memory permanecen en el dominio Lúmina.
- `state.nexoMemory`, ramas legacy y cualquier caller cuyo ownership no esté demostrado permanecen UNKNOWN.
- La exclusión de `assistants.mjs`/`simulate.mjs` del flujo ordinario Nexo no demuestra por sí sola aislamiento completo ni ownership de los datos legacy.
- Mientras una ruta tenga ownership UNKNOWN, queda prohibido usarla como fuente de Continuity Nexo, migrarla, fusionarla, dual-write, borrarla o atribuirle autoridad por inferencia.
- Una ruta UNKNOWN que pueda alcanzar el snapshot canónico dentro del alcance M0 bloquea su cierre hasta clasificarla o excluirla expresamente con capacidad/riesgo documentados y aceptación del propietario. Una ruta fuera del alcance no se declara técnicamente inaccesible por el mero hecho de excluirla.

Esto preserva O-09: primero fronteras y dependencias; después refactor mínimo.

## 7. Criterios binarios y evidencia exigida

Los criterios siguientes son condiciones de aceptación futuras, no resultados PASS actuales. Se separan dos niveles:

- **Cierre de diseño:** contrato completo, coherente, trazable, con owners, límites y UNKNOWN finitos.
- **Cierre de implementación:** enforcement demostrado en un SHA exacto mediante inspección de fuente, pruebas autorizadas y CI cuando aplique.

### 7.1 D1 — criterios de diseño

| ID | Condición binaria | Evidencia mínima para evaluar |
|---|---|---|
| D1-C1 Manifest | Cada entrypoint/API dentro del alcance tiene caller conocido o UNKNOWN explícito, dominio, capacidad de leer/escribir, invocación directa y owner de admisión | Manifest versionado y fuente fijada por SHA |
| D1-C2 First-read | Cada camino que puede leer snapshot canónico adquiere admisión antes de la primera lectura o delega antes de leer a un owner único | Grafo de llamadas + clasificación de cada frontera de I/O |
| D1-C3 Chronicle | Delegación pura: padre no lee ni adquiere; child directo/delegado valida y adquiere por sí mismo | Matriz padre/child + grafo de procesos + pruebas de composición posteriores |
| D1-C4 Root pre-I/O | Solo se ejecuta el allowlist de §5 antes de admisión; ningún metadata/content access a stores antes del gate | Contrato root + análisis de I/O y pruebas negativas posteriores |
| D1-C5 Domain cut | Continuity/Chronicle Nexo, world/learning Lúmina y legacy UNKNOWN están separados sin migración implícita | Matriz de ownership/dependencias y lista de edges UNKNOWN |
| D1-C6 Unknown scope | Toda arista desconocida está enumerada y tiene consecuencia de alcance; ninguna se cuenta como PASS | Registro finito UNKNOWN/BLOCKED, con owner y resolución requerida |
| D1-C7 Evidence map | Cada criterio identifica fuente/SHA, método de verificación y evidencia pendiente/obtenida | Matriz requisito→fuente→test/CI/evidencia; no se acepta SHA de otro commit |
| D1-C8 Epistemic status | Propuesta, ratificación, implementación, test ejecutado y CI verificado se reportan por separado | STATUS y acta de aceptación sin estados mezclados |

### 7.2 D2 — criterios de diseño y aceptación futura

| ID | Condición binaria | Evidencia mínima para evaluar |
|---|---|---|
| D2-C1 Single owner | Cada operación protegida tiene exactamente un owner; helper/factory no adquiere por su cuenta | Tabla de flujos y grafo de composición |
| D2-C2 Order | Orden instance admission → per-store lock; nunca inverso ni anidado | Diseño de secuencia y prueba de orden posterior |
| D2-C3 Reentry | Segunda adquisición dentro de la misma operación se rechaza/STOP antes de lectura adicional y sin deadlock | Prueba negativa determinista posterior |
| D2-C4 Parent/child | Padre de delegación pura no retiene lock ni lee stores; child adquiere propia admisión | Pruebas directas y delegadas, después de autorización |
| D2-C5 Pre-admission I/O | Solo allowlist §5; cero acceso a stores antes de admisión | Instrumentación de I/O/pruebas negativas autorizadas |
| D2-C6 Release identity | Ninguna retirada puede alcanzar un lock sustituto; identidad incierta no se resuelve borrando por path | Pruebas de intercalación/reemplazo sobre la implementación exacta |
| D2-C7 Uncertainty | Release incierto conserva resultado de negocio/persistencia por separado y bloquea readmisión/retry automático | Pruebas de fallo en cada fase y procesos competidores |
| D2-C8 Readmission | Readmisión solo tras cumplir todos los predicados P05 ratificados; ausencia de path no basta | Política ratificada + evidencia de actor quiescence, identidad y adquisición atómica |
| D2-C9 Threat boundary | La garantía declara procesos cooperativos incluidos y actores no clasificados/hostiles excluidos o bloqueados; no promete seguridad universal del filesystem | Modelo de amenaza explícito y pruebas dentro del alcance |
| D2-C10 Status | Ningún criterio de diseño se etiqueta como implementación o PASS sin evidencia ligada al SHA | Matriz de trazabilidad y STATUS |

### 7.3 Reglas de evidencia

- Un criterio de diseño puede estar DOCUMENTED sin estar IMPLEMENTED.
- Una prueba PASS en SHA anterior no acredita el SHA posterior.
- Una prueba unitaria de store no prueba admisión de instancia ni composición padre/child.
- Una inspección estática no demuestra comportamiento concurrente real.
- Un test que solo observa un error no demuestra que no hubo lectura/escritura previa; debe verificar el límite de I/O.
- Los criterios de implementación no pueden marcarse PASS hasta recibir autorización específica y evidencia del SHA exacto.

## 8. P05 — release incierto y readmisión permanecen OPEN

Este addendum no elige un mecanismo de release/recovery ni altera O-11.

Regla conservadora vigente:
- Release incierto → UNKNOWN/BLOCKED.
- No retry automático de negocio.
- No readmisión automática.
- No stale deletion por edad/PID/timeout.
- Path ausente, variable local, token textual o proceso aparentemente terminado no son por sí solos evidencia suficiente.
- Si no se demuestra identidad del objeto y que el actor anterior ya no puede escribir, la instancia permanece bloqueada.

P05 deberá comparar explícitamente, dentro del modelo de procesos/filesystem acordado:
1. recuperación externa/offline con quiescencia demostrable de todos los writers cooperativos relevantes; y
2. cualquier mecanismo de filesystem que pueda demostrar identidad y retirada atómica del objeto correcto.

No se adopta por defecto lock hermano, marcador persistente, cola, ID, retry, transacción ni otra infraestructura. Tampoco se promete protección contra procesos hostiles bajo el mismo UID ni contra un OS comprometido. Los actores no cooperativos o no clasificados con capacidad de alcanzar el store producen UNKNOWN/BLOCKED.

**Decisión técnica recomendada para P05:** no ofrecer recuperación/readmisión automática en runtime. Si el protocolo no puede probar release seguro, mantener el bloqueo y requerir una recuperación externa explícita cuya evidencia satisfaga los predicados P05. Esta recomendación no queda ratificada por el addendum; el gate P05 permanece OPEN hasta decisión y prueba.

## 9. Gates y autorizaciones sin cambio

| Gate | Estado |
|---|---|
| O-07 / O-08 / O-09 / O-10 / O-11 | Ratificados; no reabiertos |
| P03 | OPEN — alcance aclarado en propuesta; falta ratificación/enforcement |
| P04 | OPEN — composición aclarada en propuesta; falta ratificación/enforcement |
| P05 | OPEN — política de recuperación/readmisión no seleccionada |
| P06 / P07 / P08 / P09 | OPEN |
| D1 | OPEN |
| D2 | OPEN |
| D3 | OPEN |
| D1-IMPLEMENTATION | NO AUTORIZADA |
| D2-IMPLEMENTATION | NO AUTORIZADA |
| Tests / CI | No autorizados por este addendum |
| Root legítima | PENDING / UNKNOWN |
| authorization | NOT_EVALUATED |
| ROOT_READY | NOT ESTABLISHED |
| M0_BUILD_COMPLETE | NOT ACHIEVED |
| Efectos protegidos | STOP |

## 10. Estado de esta revisión

- Solo se reconcilia documentación.
- No se modifica runtime, tests, workflows, package scripts, configuración Android/Termux ni la instancia real de Continuity.
- No se ejecutan tests, CI, bootstrap, recovery ni efectos.
- No se modifica PR #110 ni la rama de producto.
- No se repite el inventario general ni auditorías ya cerradas.
- Este addendum no ratifica P03/P04/P05, no cierra D1/D2 y no constituye autorización de implementación.

**Siguiente paso:** integrar estas aclaraciones como referencia normativa de lectura en D1/D2 y preparar una única propuesta de ratificación P03/P04; mantener P05 separado hasta que su evidencia y trade-offs estén definidos.

## 11. Evaluación puntual de la frontera de factories y stores (2026-11-03)

### 11.1 Evidencia estática inspeccionada

Sobre el SHA de producto `99dabcb33be1efef5c4f5e368dc95140e45ff672`, se inspeccionaron el árbol `src/nexo/**` y `scripts/**` y los siguientes puntos concretos:
- `src/nexo/application/index.mjs` reexporta queries y Chronicle append.
- `src/nexo/application/continuity-queries.mjs` crea Continuity stores y llama `loadCurrent()` en las queries de estado/plan/preview/open loops.
- `src/nexo/application/chronicle-append.mjs` crea Continuity y Chronicle stores y ejecuta lecturas dentro del append.
- `src/nexo/core/continuity-service.mjs` crea Continuity store y ejecuta `loadCurrent()` al abrir el owner.
- `src/nexo/core/continuity-store.mjs` exporta `createNexoContinuityStore()`; el objeto expone operaciones de lectura/escritura.
- `src/nexo/core/chronicle-store.mjs` exporta `createNexoChronicleStore()`; el objeto expone `loadCurrent`, `initialize` y `append`.
- `scripts/nexo-repair-mission-verification.mjs` y `scripts/nexo-repair-settlement.mjs` contienen lecturas directas de store; `scripts/nexo-repair-protocol.mjs` usa `owner.loadCurrent()`.
- `scripts/nexo.mjs` llama las queries de aplicación y delega Chronicle mediante `spawnSync`; `scripts/nexo-chronicle-session.mjs` ejecuta el append en el child.

Esta inspección es estática y puntual; no constituye manifest exhaustivo de todos los callers, imports dinámicos, consumers externos o caminos alcanzables. Las rutas de repair permanecen sujetas a las exclusiones M0 ya registradas; su existencia no acredita que sean inaccesibles.

### 11.2 Conclusión de frontera

Proteger únicamente `src/nexo/application/index.mjs` o los comandos CLI no es suficiente: las factories de store están exportadas desde módulos internos y los callers de aplicación/servicio/repair alcanzan `loadCurrent()` por caminos distintos.

El candidato estructural mínimo, todavía no seleccionado, es:
1. Definir una única frontera de adquisición de admisión por operación, compatible con owners múltiples y Chronicle child independiente.
2. Hacer que cada store opere bajo una capacidad/contexto de operación admitida; los métodos `loadCurrent` y cualquier método que vuelva a leer el snapshot no deben quedar disponibles por una ruta ordinaria sin owner.
3. El owner carga el snapshot una vez y pasa datos/contexto a helpers; los helpers no crean factories, no reabren stores y no recargan snapshots.
4. El manifest de imports/callers y un guard estático de arquitectura deben limitar quién puede importar la implementación interna de factories/admission. Un nombre privado, símbolo o convención ESM no es por sí mismo una frontera contra código arbitrario con acceso al filesystem del repo.
5. La capacidad JavaScript solo propaga ownership dentro del proceso. La exclusión entre procesos y el release continúan dependiendo del mecanismo D2/P05, aún OPEN.
6. Chronicle child recibe argumentos/root validados como datos, no una capacidad heredada ni snapshot prestado; valida y adquiere su propia admisión antes de su primera lectura.

### 11.3 Límites y decisión pendiente

- No se recomienda todavía unificar las dos factories ni cambiar sus semánticas de persistencia.
- No se recomienda introducir un broker, addon nativo o helper hasta resolver P03/P04/P05 y demostrar que una frontera de owner + stores no puede satisfacer el contrato dentro del alcance R1.
- Las rutas repair con lecturas directas no se declaran PASS ni automáticamente dentro del camino M0; requieren clasificación explícita y consecuencia de exclusión.
- La inspección no acredita ausencia de imports dinámicos/consumidores externos ni enforcement de la frontera.
- Esta propuesta no ratifica P03/P04, no cierra D1/D2 y no autoriza implementación, tests o CI.
## 12. Hallazgo D1 concreto: lecturas persistentes anteriores al owner (2026-11-03)

### 12.1 Chronicle append — orden observado

En SHA de producto `99dabcb33be1efef5c4f5e368dc95140e45ff672`, `src/nexo/application/chronicle-append.mjs`, función `runNexoChronicleAppend()`:
1. Valida argumentos, contenido e IDs.
2. Crea `chronicleStore` y `continuityStore`.
3. Ejecuta `await chronicleStore.loadCurrent()`.
4. Ejecuta `await continuityStore.loadCurrent()`.
5. Solo después llama `openNexoContinuityOwner()`.

El owner no se obtiene hasta después de las dos lecturas persistentes de preflight. Los locks per-store de esas lecturas no son la admisión de instancia requerida por O-10. Por tanto, el orden del código inspeccionado contradice el contrato D1 propuesto para Chronicle append: **preflight de ambos stores ocurre antes de la admisión del owner**.

### 12.2 Queries read-only — orden observado

`src/nexo/application/continuity-queries.mjs` crea una factory y llama `loadCurrent()` directamente en `loadNexoContinuityStatus`, `loadNexoMissionStatus`, `loadNexoMissionPlan`, `previewNexoMissionDraft` y `loadNexoOpenLoops`. En el código inspeccionado no aparece adquisición de admisión de instancia antes de esas lecturas. Su carácter read-only no las exime de O-10.

### 12.3 Continuity service — orden observado

`src/nexo/core/continuity-service.mjs`, `openNexoContinuityOwner()`, crea el store y llama `store.loadCurrent()` antes de devolver el owner. El servicio no muestra una adquisición de admisión de instancia anterior a esa lectura. En consecuencia, envolver únicamente al caller con una capacidad que se obtiene después de llamar este servicio no corregiría la primera lectura.

### 12.4 Efecto sobre el diseño

- Esto ya no es solo una preocupación hipotética de imports/callers: en el SHA examinado hay rutas de aplicación concretas cuya primera lectura persistente precede al owner/operación admitida.
- El diseño no puede resolverlo moviendo el lock al interior de `openNexoContinuityOwner()` sin revisar Chronicle append: ese flujo ya leyó ambos stores antes de llamar al servicio.
- Las queries deben adquirir admisión propia antes de crear/leer el store, incluso si son read-only.
- Chronicle append debe establecer ownership/admisión antes de ambas lecturas de preflight; su delegación child debe seguir siendo owner independiente. El orden exacto de validación de stores e inicialización debe rediseñarse sin reintroducir bootstrap + operación en una misma invocación.
- El cambio debe tratarse como corrección D1-IMPLEMENTATION, no como ajuste cosmético de factories. Requiere autorización específica; no se ha implementado.

### 12.5 Estado y límites de evidencia

Hallazgo = **STATIC ORDERING VIOLATION IDENTIFIED** contra O-10 en el SHA inspeccionado. No es prueba de carrera concurrente ni evidencia de ejecución actual en Termux. No generalizarlo a otros SHAs sin revalidar. D1 sigue OPEN; D1-IMPLEMENTATION NO AUTORIZADA; tests/CI no autorizados; D2/P05 siguen OPEN.