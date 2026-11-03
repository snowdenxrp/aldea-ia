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
### 12.6 Secuencia correctiva de referencia — propuesta, no ratificada

Para hacer verificable O-10 sin imponer todavía una primitiva concreta, la secuencia objetivo por operación queda expresada así:

**Query read-only Continuity**
1. Parsear y validar argumentos sin abrir stores.
2. Resolver/canonicalizar root según O-08 y el mapping que P08 aún debe cerrar.
3. Adquirir admisión de instancia válida.
4. Crear/obtener el store interno y hacer una única lectura persistente.
5. Proyectar el resultado desde ese snapshot; helpers puros no reabren stores.
6. Liberar admisión según protocolo D2/P05; release incierto => UNKNOWN/BLOCKED.

**Chronicle append**
1. Parsear/validar argumentos y contenido sin abrir stores.
2. Resolver/canonicalizar root y mapping.
3. Adquirir admisión propia del proceso Chronicle child antes de cualquier lectura persistente.
4. Crear stores internos y leer Continuity/Chronicle bajo esa admisión.
5. Evaluar precondiciones; inicializar Chronicle solo si la autorización específica de inicialización está presente y el estado lo permite.
6. Construir el owner de continuidad a partir del snapshot ya cargado/admitido, sin una recarga pre-owner.
7. Ejecutar el flujo de append manteniendo la misma admisión durante todo el intervalo de uso del snapshot.
8. Resolver persistencia y release por separado; release incierto => UNKNOWN/BLOCKED, sin redispatch/readmisión.

**Servicio/factory**
- `openNexoContinuityOwner()` no debe ser una API pública que realice la primera lectura por sí sola sin recibir una admisión válida; alternativamente, debe convertirse en helper interno que solo opere con contexto ya admitido.
- Las factories no deben ofrecer métodos de lectura ordinaria que puedan invocarse sin la capacidad/contexto del owner. La capacidad no es el lock cross-process: solo evita composición accidental dentro del grafo de módulos.
- El bootstrap de primera creación permanece como flujo separado, de una sola operación y sin devolver owner ni continuar a Chronicle.

**Delegación**
- El padre que solo delega Chronicle no lee stores ni adquiere la admisión de la operación child.
- El child valida root/args, adquiere admisión propia y realiza su primera lectura persistente.
- Si el padre necesita datos persistidos, constituye otra operación admitida; no retiene lock mientras espera child ni transfiere un snapshot después de liberar.

Esta secuencia es una referencia para cerrar el contrato D1, no una elección de API, lock, layout, token, contexto, addon o helper. El mapping root→stores depende de P08; la semántica de adquisición/release depende de P03/P04/P05. No autoriza implementación ni pruebas.
## 13. P08 — contraste de root única con rutas reales (2026-11-03)

### 13.1 Evidencia estática en SHA producto

Inspección de blobs del SHA `99dabcb33be1efef5c4f5e368dc95140e45ff672`:

| Superficie | Evidencia | Consecuencia |
|---|---|---|
| `scripts/nexo.mjs` (`e471eb4…`) | Parser de status/mission-status/mission-plan/draft-preview/request-preview acepta `--continuity`; no aparece `--root`. | El CLI padre no implementa O-08. |
| `scripts/nexo-chronicle-session.mjs` (`30a53de…`) | Parser admite `--continuity`, `--chronicle`, `--initialize-continuity`, `--initialize-chronicle`. | El child puede recibir dos rutas independientes y flags de inicialización separados; no implementa root única. |
| `src/nexo/application/chronicle-append.mjs` (`c196446…`) | Input exige `continuityPath` y `chroniclePath`; crea ambas factories con esos paths. | La operación de aplicación acepta dos destinos configurados por caller. |
| `src/nexo/application/continuity-queries.mjs` (`e1915e9…`) | Queries reciben `continuityPath` y lo pasan a la factory. | Query path-oriented; no deriva destino desde root. |
| `src/nexo/core/continuity-store.mjs` (`c1eb81b…`) | Factory exige `filePath`; comentario explícito indica trusted configuration, no sandbox boundary. | No impone root ni confinamiento. |
| `src/nexo/core/chronicle-store.mjs` (`59d2fde…`) | Factory exige `filePath`; comentario equivalente de trusted configuration. `loadCurrent()` lee directamente el documento. | No impone root ni confinamiento; lectura Chronicle no adquiere su lock per-store. |
| `src/nexo/core/continuity-service.mjs` (`53fd704…`) | API ordinaria recibe `filePath`; bootstrap usa `root` + `relativePath` y valida destino por separado. | El contrato de bootstrap no equivale a mapping común de operación normal Continuity+Chronicle. |

### 13.2 Lo que sí y lo que no está determinado

- O-08 ya ratificó una única raíz explícita `--root <directory>`, sin fallback ambiental/legacy; no se vuelve a someter a decisión.
- El layout exacto de stores y la semántica de paths relativos siguen abiertos. Los nombres `continuity.json` y `chronicle.json` registrados en documentos anteriores son ilustrativos/candidatos, no decisión ratificada ni implementación existente.
- La publicación real de Continuity del 2026-11-02 usó root canónica `$HOME` y destino `$HOME/.nexo-continuity.json`. Esa operación acredita el objeto publicado y su post-write check; no fija el layout futuro de instancia ni crea/valida un Chronicle canónico.
- No existe evidencia en el SHA inspeccionado de un resolver común que reciba `--root`, canonicalice una vez y derive ambos destinos.
- No se ha demostrado compatibilidad/migración de datos preexistentes a ningún layout canónico. Se mantienen prohibidos fallback, dual-write, merge y migración automática.

### 13.3 Decisiones técnicas mínimas aún necesarias para P08

1. Definir si el layout normal usa nombres fijos derivados de root o un subdirectorio fijo; no admitir rutas independientes caller-supplied en el API normal.
2. Definir si el destino Continuity ya publicado (`.nexo-continuity.json`) se adopta como destino canónico o queda como objeto bootstrap legado/operacional fuera del nuevo mapping. No inferir ninguna de las dos opciones.
3. Definir el destino Chronicle y cómo se trata su ausencia en operación normal; inicialización Chronicle no debe quedar implícita en append.
4. Definir la gramática de `--root`, obligatoriedad de root existente en modo normal y rechazo de flags legacy/conflictivos antes de cualquier store I/O.
5. Definir canonicalización/alias/symlink y colisiones de nombres reservados dentro del límite de amenaza R1, sin prometer resistencia TOCTOU hostil.
6. Definir propagación de root al child como dato explícito; el child vuelve a validar/canonicalizar y adquiere su propia admisión antes de leer.
7. Inventariar archivos/datos existentes antes de decidir adopción/migración; preservar fuente y bloquear si el mapping no es inequívoco.

### 13.4 Dictamen P08

**P08 = OPEN / LAYOUT UNSELECTED.** La brecha es concreta: contrato O-08 ratificado pero no implementado; CLI y APIs del SHA examinado siguen path-oriented; no existe mapping común demostrado. La publicación real de Continuity no cierra el layout. P08 bloquea el cierre D1 porque D1 no puede garantizar que todos los entrypoints admitan sobre los mismos destinos canónicos.

Esta sección es análisis documental de código en SHA fijado y evidencia histórica ya registrada; no cambia decisiones del owner, no elige filenames, no autoriza migración, runtime, tests o CI.
### 13.5 Recomendación técnica de layout para conservar la primera publicación

Recomendación para cerrar la ambigüedad de diseño sin alterar el objeto real:

| Elemento | Candidato recomendado | Estado |
|---|---|---|
| Root | El directorio existente indicado explícitamente por `--root`, canonicalizado una vez por operación. Para la instalación Termux actual, la root histórica observada fue `$HOME`. | Dirección O-08 aceptada; mapping por implementar. |
| Continuity | `<root>/.nexo-continuity.json` | Candidato preferido: conserva exactamente el destino de la primera publicación real. |
| Chronicle | `<root>/.nexo-chronicle.json` | Nombre candidato nuevo; no existe evidencia de archivo real ni de inicialización completada. |
| Admisión | No se fija nombre ni primitiva en esta decisión. | P03/P04/P05 OPEN. |

Justificación:
1. Reutiliza el único objeto Continuity cuya publicación real y post-write check están acreditados; no crea una segunda Continuity ni exige mover bytes.
2. Usa un nombre compañero específico de Nexo para Chronicle, evitando colisionar por defecto con `chronicle.json` genérico de otras herramientas.
3. Mantiene los dos stores directamente bajo una root explícita y común, sin subdirectorio, manifiesto, instanceId ni marcador adicional.
4. Mantiene el mapping determinista para todos los entrypoints: los callers dejan de enviar rutas separadas; el resolver interno deriva ambos nombres exclusivamente desde la root validada.
5. No confunde el objeto ya publicado con un bootstrap de Chronicle. La operación normal requiere stores existentes; la ausencia de Chronicle debe fallar cerrado. Su primera creación, si se autoriza, será una operación explícita separada y no parte de append.

Reglas que acompañan al candidato:
- Root normal: debe existir y ser directorio; canonicalizar antes de derivar cualquier store path. No crear root desde status/query/preview/append.
- Store paths: exactamente los dos nombres anteriores; rechazar `--continuity`, `--chronicle` y combinaciones root+legacy en la interfaz normal. No fallback ambiental.
- Conflictos: antes de adoptar el layout en runtime, inventariar ambos destinos y temporales/locks actuales. Si el path existe como symlink, directorio, tipo inesperado, objeto corrupto o contenido incompatible, UNKNOWN/STOP; no sobrescribir, renombrar, borrar ni seleccionar fuente por heurística.
- Chronicle: `append` no inicializa. La creación inicial exige flujo de bootstrap explícito y separado, con autorización propia; no hereda la autorización histórica de Continuity.
- Child: recibe `--root` explícita como dato; vuelve a validar/canonicalizar; adquiere admisión propia antes de cualquier lectura.
- Persistencia: conservar intactos formatos, revisions, locks per-store y semántica de commit/append. Este mapping no autoriza cambiar protocolos de stores.
- Amenaza: configuración local cooperante dentro de R1; no promete protección contra procesos hostiles del mismo UID ni carreras filesystem adversariales.

Comparación con la propuesta histórica `continuity.json` / `chronicle.json`: aquella pareja era ilustrativa y quedó expresamente OPEN en D0-07. Adoptarla ahora requeriría resolver cómo preservar/adoptar `.nexo-continuity.json` sin crear dos fuentes de verdad. La pareja propuesta aquí evita esa transición para Continuity; Chronicle sigue pendiente de inventario y bootstrap separado.

**Dictamen:** candidato técnico recomendado, no decisión ratificada ni layout implementado. P08 permanece OPEN hasta que el inventario no mutante de colisiones en la root real y la revisión de compatibilidad del formato Chronicle sean completados. No se lee/escribe/modifica la instancia real y no se autoriza implementación, tests o CI.
### 13.6 Consecuencia de basename y sidecars de los stores

Inspección de `chronicle-store.mjs` (blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`), `continuity-store.mjs` (blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`) y `continuity-service.mjs` (blob `53fd7043266635b30a1e01b69bb00d28feda300c`) confirma:
- Ambos stores derivan lock per-store como `${filePath}.lock`.
- Chronicle deriva temporales usando el basename del archivo (`<basename>.tmp` y `<basename>.tmp-*`).
- El bootstrap Continuity recibe `root` + `relativePath`, canonicaliza root, valida destino bajo root y rechaza determinados conflictos de destino/sidecar.
- Las factories normales siguen recibiendo `filePath`; la validación de bootstrap no convierte las factories normales en root-aware.

Con el layout candidato, los nombres derivados previsibles serían:
- Continuity: `.nexo-continuity.json`, sidecar `.nexo-continuity.json.lock` y temporales con prefijo `.nexo-continuity.json.tmp`.
- Chronicle: `.nexo-chronicle.json`, sidecar `.nexo-chronicle.json.lock` y temporales con prefijo `.nexo-chronicle.json.tmp`.

Esto vuelve parte del inventario de colisiones obligatorio: revisar no solo los dos documentos sino también sus sidecars, temporales estables/únicos, directorios/symlinks con esos nombres y cualquier lock residual. No se deben borrar locks ni temporales durante el inventario. Los nombres anteriores son derivados del código inspeccionado, no afirmación de que existan en el dispositivo.

El contrato de bootstrap actual solo valida una ruta relativa por invocación y está orientado a Continuity; no es un resolver conjunto de dos stores. No debe reutilizarse como si ya resolviera ambos destinos. La implementación futura necesitará un único resolver de root/layout que entregue ambos paths validados antes de la admisión, sin leer stores antes de O-10.

Esta observación no cierra P08 ni P03/P04/P05; no ejecuta inspección del filesystem del dispositivo y no modifica ningún objeto real.
### 13.7 Inventario no mutante de la root Termux — evidencia observada por owner

El owner ejecutó en Termux un `realpath "$HOME"` y un `find` de primer nivel limitado a los basenames candidatos y sidecars enumerados. Salida recibida:

```text
/data/data/com.termux/files/home
-rw-------. 1 u0_a378 u0_a378 283 Nov  2 17:26 /data/data/com.termux/files/home/.nexo-continuity.json
```

No hubo otras coincidencias en ese `find` para:
- `.nexo-continuity.json.lock`, `.nexo-continuity.json.tmp`, `.nexo-continuity.json.tmp-*`
- `.nexo-chronicle.json`, `.nexo-chronicle.json.lock`, `.nexo-chronicle.json.tmp`, `.nexo-chronicle.json.tmp-*`
- `continuity.json`, `chronicle.json`

Alcance exacto de la observación:
- Root canonical reportada: `/data/data/com.termux/files/home`.
- El objeto Continuity publicado está presente en primer nivel; la salida indica archivo regular, modo `0600`, UID/GID `u0_a378`, tamaño 283 bytes y mtime mostrado `Nov 2 17:26`.
- No se observaron coincidencias de los sidecars/temporales candidatos ni de los nombres genéricos en el primer nivel al momento de la consulta.
- No se inspeccionó contenido, no se abrió el archivo, no se recorrieron subdirectorios, no se verificó ausencia de aliases/mounts ni se hizo un segundo muestreo temporal. La salida no demuestra ausencia global de colisiones ni que ningún proceso pueda crear un sidecar después.
- Esta evidencia no modifica ni vuelve a verificar el hash/contenido del objeto; el post-write check histórico sigue siendo la evidencia correspondiente.

### 13.8 Compatibilidad del candidato Chronicle con el store actual

En el blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`, `createNexoChronicleStore().initialize()` crea, bajo el lock per-store, un documento vacío con `schema: NEXO_CHRONICLE`, `schemaVersion: 1`, `storeRevision: 0` y `entries: []`. El código comenta que read/append no inicializan estado ausente silenciosamente. La API `initialize()` es una operación de inicialización explícita distinta del `loadCurrent()`/`append()`.

El use case `runNexoChronicleAppend()` del blob `c1964467d68043d06e035ad59720f8cec2e52e52` todavía contiene una opción `initializeChronicle` y puede invocar `chronicleStore.initialize()` dentro del flujo de append cuando se activa. Eso contradice el objetivo de mantener inicialización separada y debe eliminarse/aislarse al implementar D1; el contrato futuro debe rechazar la bandera en append, no reinterpretarla como autorización implícita.

El candidato `.nexo-chronicle.json` es compatible a nivel de basename/path con la factory, que acepta un `filePath` arbitrario, pero esto no equivale a validación del mapping, compatibilidad operacional integral ni existencia de un Chronicle real. La inicialización separada debe preservar el schema v1 existente, estar protegida por admisión D1 y tener autorización propia; no debe compartir la invocación con append.

**Resultado P08 tras esta evidencia:** el candidato Continuity preserva el objeto real y el inventario superficial no detectó sidecars/collisions de primer nivel. Chronicle candidate es libre según ese mismo inventario, pero todavía no creado. P08 permanece OPEN hasta ampliar el inventario requerido por el alcance acordado y ratificar mapping/compatibilidad; no se autoriza implementación, inicialización Chronicle, tests ni CI.
### 13.9 Separación obligatoria: Chronicle initialization ≠ append

Hallazgo estático en `chronicle-append.mjs` blob `c1964467d68043d06e035ad59720f8cec2e52e52`: `runNexoChronicleAppend()` conserva `initializeChronicle`; cuando Chronicle falta y la bandera es verdadera, el flujo llama `chronicleStore.initialize()` dentro de la operación de append. Esto mezcla creación de store con append y contradice la separación de bootstrap/operación normal.

Regla objetivo propuesta (desarrollada en §11 del contrato D1):
- El caso de uso append no inicializa nunca ningún store. Chronicle ausente implica BLOCKED/UNAVAILABLE antes de admission de misión, dispatch, ejecución o escritura.
- El flag `--initialize-chronicle` no pertenece al CLI normal de append y debe rechazarse antes de I/O persistente. La API normal de append no expone `initializeChronicle`; cualquier compatibilidad transitoria debe distinguir presencia explícita del flag antes de normalización y rechazarla, sin ignorarla silenciosamente.
- La inicialización Chronicle es una operación independiente, con root/mapping O-08/P08, admisión propia antes de la primera lectura persistente O-10, lock per-store, autorización humana explícita para el destino efectivo y terminación sin append. La autorización de la publicación Continuity del 2026-11-02 no cubre Chronicle.
- Query/status/preview tampoco inicializan. Si Chronicle no existe, informan unavailable/blocked sin crear archivo ni sidecars.
- No se permite combinar inicialización y append en una invocación. La inicialización debe conservar el formato soportado `NEXO_CHRONICLE` v1, revision 0, entries vacías; objetos existentes o ambiguos no se reemplazan.

Casos de aceptación futuros: append con Chronicle ausente no crea; flag explícito `--initialize-chronicle` rechaza antes de store I/O; inicialización separada sin autorización STOP; inicialización autorizada adquiere admisión propia y termina sin append. Son criterios propuestos, no pruebas ejecutadas.

Esta separación no cierra D1/P08 ni selecciona CLI/API/mecanismo de admisión. D1-IMPLEMENTATION sigue NO AUTORIZADA; P03/P04/P05/P08 OPEN; no runtime, tests, CI, bootstrap Chronicle ni efectos protegidos.
### 13.10 Confirmación de la ruta CLI del flag de inicialización

En `scripts/nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`, `--initialize-chronicle` está incluido en el conjunto de flags aceptados y se transforma en `initializeChronicle: true` al llamar `runNexoChronicleAppend()`. La brecha queda localizada en dos fronteras del SHA examinado: parser CLI (acepta y transmite el flag) y caso de uso (puede inicializar el store dentro de append).

Corrección objetivo: retirar `--initialize-chronicle` del parser normal; si se recibe, rechazarlo explícitamente antes de abrir/leer stores. El contrato normal de append no debe exponer `initializeChronicle`. Cambiar solo el default a `false` no corrige el camino explícito.