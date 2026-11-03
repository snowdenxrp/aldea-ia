# NCS M0 — Propuesta de cierre contractual P-03/P-04
Fecha: 2026-11-03
Rama: `ncs-lumina-decoupling-2026-10-29`
Base documental/código: HEAD `a84ce145fd162861afd725ba2b5d70e9a3265a73`
Estado: **PROPUESTA PARA DECISIÓN DEL PROPIETARIO — NO RATIFICADA — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y límites

Este documento cruza la especificación P-03/P-04 del 2026-10-25 con el rastreo estático independiente de los tres flujos realizado sobre la rama indicada, incluido el informe técnico de revisión Claude recibido el 2026-11-03.

Su alcance se limita a:
- precisar el propietario de la admisión de instancia por caso de uso;
- fijar el intervalo protegido;
- resolver provisionalmente el modo de admisión de lecturas para M0;
- precisar el presupuesto de espera;
- separar el contrato de admisión de P-05 (release incierto/readmisión), P-07 (filesystem/alias) y P-08 (gramática CLI).

No modifica runtime, tests, workflows, configuración, dispositivo ni datos. No ejecuta pruebas/CI. No ratifica decisiones reservadas al propietario y no autoriza bootstrap, publicación, commissioning ni efectos protegidos.

## 2. Base normativa ya ratificada y propuestas previas

La especificación P-03/P-04 del 2026-10-25 identifica como decisiones ya ratificadas:
- O-08: raíz explícita única `--root`, sin override ambiental ni fallback legacy; operación normal sin bootstrap implícito; canonicalización antes de derivar rutas.
- O-10: consultas, previews y Chronicle dentro del alcance deben pasar por admisión antes de leer datos persistentes; read-only no es excepción.
- O-11: release incierto implica `UNKNOWN/BLOCKED`; no retry automático de negocio ni readmisión hasta resolver la incertidumbre.
- La raíz/lock de instancia no equivalen a autoridad constitucional ni autorización de efectos protegidos.

La misma especificación deja propuestas abiertas:
- P-03 §3.1: secuencia de validación, admisión, lectura, uso de snapshot, escrituras y release.
- P-04 §4/§4.1: propietario por flujo y no adquisición por el padre mientras espera al hijo.

Este documento no eleva automáticamente esas propuestas a decisiones ratificadas.

## 3. Evidencia estática cruzada

Base revisada: HEAD `a84ce145fd162861afd725ba2b5d70e9a3265a73`. El informe Claude declara que `src/`, `scripts/` y `tests/` no difieren de `99dabcb33be1efef5c4f5e368dc95140e45ff672`. El rastreo previo independiente en esta rama es concordante en los puntos estructurales siguientes.

### 3.1 Ausencia de admisión de instancia

**CONFIRMED (estático):** no se encuentra una primitiva/lease de admisión de instancia que cubra los casos de uso descritos. Los locks existentes son locks per-store/per-operación; no equivalen a una admisión de instancia cuyo ciclo de vida abarque el caso de uso.

La presencia de `--root` en el entrypoint de bootstrap no demuestra una gramática `--root` común ni admisión para la operación normal.

### 3.2 Chronicle directo y delegado

- `scripts/nexo-chronicle-session.mjs` ejecuta el caso de uso Chronicle.
- `scripts/nexo.mjs` delega la ruta Chronicle mediante `spawnSync`; el padre no adquiere una admisión ni abre los stores para esa ejecución.
- El hijo ejecuta el mismo flujo funcional cuando se invoca directamente.
- `src/nexo/application/chronicle-append.mjs` realiza una lectura de Chronicle mediante `chronicleStore.loadCurrent()` antes de la lectura/operación posterior de Continuity.
- `src/nexo/core/chronicle-store.mjs` implementa `loadCurrent()` como lectura directa, sin adquirir el lock per-store usado por las rutas de mutación.
- El runtime owner-backed continúa usando/reconciliando estado de Continuity después de PREPARED; el owner semántico no mantiene una admisión de instancia a través de toda la operación.

**Conclusión:** el propietario contractual adecuado es la ejecución de aplicación dentro del hijo/entrypoint Chronicle, no el proceso padre. La admisión debe comenzar antes de la primera lectura persistente del caso de uso y mantenerse hasta completar la última escritura/reconciliación y formar el resultado de operación, antes del release. El padre espera y propaga el resultado; no retiene la admisión del hijo.

### 3.3 Consultas y previews

- Las funciones públicas de `continuity-queries.mjs` cargan snapshots mediante stores construidos por path.
- `continuity-store.loadCurrent()` adquiere y libera su lock dentro de la propia lectura.
- El snapshot clonado se consume después de que ese lock per-store fue liberado.
- El clonado evita que el consumidor siga leyendo el documento mutable, pero no asegura por sí mismo que la revisión usada siga siendo actual frente a una escritura concurrente.
- `previewNexoMissionRequest` delega en `previewNexoMissionDraft`; el contexto de admisión debe fluir por la cadena sin una segunda adquisición.
- El CLI enruta a las funciones de aplicación; no debe ser un segundo dueño de la misma admisión.

**Conclusión:** el propietario debe ser la función/caso de uso público de aplicación. La admisión comienza antes de la primera lectura de store y se conserva hasta terminar la construcción del retorno. En request→draft debe existir un solo dueño y una sola admisión.

### 3.4 Doble adquisición y límites de la evidencia

**CONFIRMED:** no hay evidencia de doble adquisición de una admisión P-03, porque esa primitiva no está implementada. Los ciclos de lock per-store no deben etiquetarse como reentrada de admisión de instancia.

**GAP:** no se ha demostrado cobertura de todos los consumidores directos, dinámicos o externos de APIs exportadas de stores/owner. Los guards de imports conocidos no prueban ausencia universal de callers ni de escrituras directas al filesystem.

**GAP:** el presupuesto compartido de locks per-store observado en el flujo Chronicle no es un presupuesto de admisión de instancia. La futura primitiva necesita un contrato de espera propio, sin reutilizar silenciosamente semánticas distintas.

## 4. Contrato mínimo recomendado para ratificación

### 4.1 Unidad y propietario

Una admisión corresponde a **un caso de uso público**, no a cada helper ni a cada store.

| Flujo | Propietario único recomendado | No adquieren |
|---|---|---|
| Chronicle directo | Caso de uso de aplicación ejecutado por `nexo-chronicle-session.mjs` | CLI padre inexistente en esta invocación; helpers/store |
| Chronicle delegado desde `nexo.mjs` | El hijo `nexo-chronicle-session.mjs`, igual que en invocación directa | Proceso padre; helpers/store |
| Query/status/mission/plan/Open Loops | Función pública de aplicación correspondiente | CLI, store y helpers internos |
| Preview request→draft | La función pública superior que inicia la cadena request→draft | La función delegada draft, CLI, store y helpers internos |

Los helpers reciben un contexto de admisión ya establecido. No adquieren ni reentran. Si una API pública se llama directamente, debe establecer su propio contexto en su frontera pública; no puede asumir que un CLI la admitió previamente.

### 4.2 Intervalo protegido

La admisión se adquiere:
1. después de validar forma/sintaxis superficial y resolver/canonicalizar la raíz explícita según O-08;
2. antes de la primera lectura de contenido persistente de cualquier store canónico cubierto.

Se conserva:
- durante todas las lecturas de stores cubiertos;
- durante todo uso del snapshot que sustente el resultado;
- durante las escrituras y reconciliaciones pertenecientes al mismo caso de uso;
- hasta que el resultado de negocio/persistencia esté determinado o clasificado como UNKNOWN y el caso de uso haya alcanzado su límite terminal.

Se libera al final del caso de uso, separando el resultado de negocio/persistencia del resultado de release. No se libera inmediatamente después de `loadCurrent()` si el caso de uso sigue dependiendo del snapshot.

La admisión no se extiende a entrada interactiva ni a trabajo externo no relacionado, salvo necesidad contractual demostrada. La lectura de archivos externos `--draft`/`--request` y stdin se rige por las clasificaciones de P-03 §3.2; no constituye por sí misma lectura de un store canónico ni autorización.

### 4.3 Modo de lectura: recomendación exclusiva para M0

**Recomendación técnica:** usar admisión exclusiva para todos los casos de uso M0 incluidos, también consultas y previews.

Razones:
- O-10 incluye expresamente las operaciones read-only.
- El snapshot clonado protege la memoria local frente a mutación del objeto persistido, pero no garantiza actualidad respecto de escritores concurrentes.
- La admisión compartida exigiría demostrar una primitiva reader/writer correcta, compatibilidad con todos los escritores y una política de release/readmisión bajo P-05.
- Serializar las operaciones M0 ofrece un contrato más pequeño y conservador, sin añadir modos ni reglas de promoción/downgrade.

Esto no afirma que una primitiva exclusiva ya exista. No se propone implementar lectores compartidos en M0. La posibilidad de concurrencia compartida puede revisarse fuera del cierre mínimo, con evidencia y decisión separadas.

**Decisión reservada al propietario:** ratificar exclusividad para todas las operaciones cubiertas o rechazarla explícitamente. La inclinación de Claude por admisión compartida para consultas se registra como alternativa no seleccionada, no como requisito.

### 4.4 Presupuesto de espera

Se recomienda un único presupuesto monotónico por intento de adquisición de admisión:
- comienza inmediatamente antes del primer intento de adquirir la admisión de instancia;
- incluye todos los reintentos y esperas internas de esa adquisición;
- termina al adquirirla o al devolver un resultado de espera agotada/bloqueada;
- no se reinicia en helpers ni en stores;
- no se consume como TTL de la operación una vez adquirida la admisión.

**No caduca automáticamente una admisión ya adquirida.** Una vez admitido el caso de uso, la admisión permanece bajo su propietario hasta el límite terminal definido en §4.2. Un timeout de ejecución, señal, crash o imposibilidad de release no autoriza liberar a ciegas ni readmitir: se clasifica conforme a P-05 como resultado conocido o UNKNOWN y release confirmado o incierto.

El valor numérico del presupuesto es una decisión de implementación/configuración pendiente; no se ratifica aquí el valor actual de 2 segundos observado en otra capa.

### 4.5 Composición con locks per-store

La admisión de instancia y los locks per-store tienen propósitos y ciclos de vida distintos:
- admisión: serializa el caso de uso sobre la raíz canónica;
- lock per-store: protege la operación local del store conforme a su contrato existente.

No se deben unificar ni retirar locks per-store por analogía. Antes de implementación se debe fijar orden de adquisición y release para evitar inversión de locks, deadlock y reentrada. Las lecturas Chronicle sin lock per-store deben quedar cubiertas por la admisión de instancia o recibir un contrato específico; esta propuesta no decide por sí sola modificar `chronicle-store.loadCurrent()`.

## 5. Contrato padre/hijo

1. El padre valida argumentos superficiales y transmite la raíz/opciones permitidas.
2. El hijo valida independientemente la raíz, flags contradictorios y la prohibición de bootstrap implícito antes de abrir stores.
3. El hijo adquiere la admisión para la operación que ejecuta, tanto si fue lanzado por el padre como si se invocó directamente.
4. El padre no adquiere ni retiene la misma admisión mientras espera mediante `spawnSync`.
5. Los helpers del hijo reciben el contexto y no reentran.
6. El padre propaga un resultado estructurado solo cuando el hijo lo produjo; un hijo terminado por señal, sin resultado o con estado de salida ambiguo debe permanecer UNKNOWN para los campos no demostrables.

La falta actual de timeout/señal explícita en `spawnSync` es una brecha de manejo del resultado del proceso, no una razón para que el padre adquiera la admisión del hijo. La política exacta de timeout, señal y serialización de resultados pertenece a la implementación/contrato de entrypoint y debe mantenerse compatible con O-11.

## 6. Dependencias y límites

- **P-05:** define release incierto, cuarentena y evidencia de readmisión. Este documento no escoge A/B ni altera O-11.
- **P-07:** define límites filesystem, alias, identidad del objeto y TOCTOU. La admisión no resuelve por sí sola las carreras de filesystem.
- **P-08:** define gramática CLI y compatibilidad de rutas. La recomendación de dueño no ratifica por sí misma el formato final de flags.
- **P-09:** cobertura de callers dinámicos/externos y superficies de bypass permanece UNKNOWN hasta evidencia.
- **Autoridad constitucional:** no es parte de la admisión. `authorization: NOT_EVALUATED`, raíz PENDING/UNKNOWN y efectos protegidos STOP no cambian.

## 7. Matriz de decisiones para el propietario

| Punto | Recomendación | Estado |
|---|---|---|
| Dueño Chronicle | Hijo/caso de uso de aplicación | PROPUESTO |
| Dueño queries/previews | Función pública de aplicación | PROPUESTO |
| Request→draft | Un solo dueño en la función superior | PROPUESTO |
| Padre con `spawnSync` | No adquiere; delega al hijo | PROPUESTO, alineado con P-04 §4.1 |
| Intervalo | Antes de primera lectura persistente hasta último uso/escritura y límite terminal | PROPUESTO, alineado con P-03 §3.1 |
| Lecturas | Exclusiva también para queries/previews en M0 | RECOMENDACIÓN; REQUIERE RATIFICACIÓN |
| Presupuesto | Un deadline monotónico de adquisición; no TTL tras adquirir | RECOMENDACIÓN; REQUIERE RATIFICACIÓN |
| Lock per-store | Mantener semántica separada; no unificar sin pruebas | PROPUESTO |
| Timeout/señal hijo | Resultado indeterminado se clasifica UNKNOWN; política concreta pendiente | GAP |
| Callers dinámicos/externos | UNKNOWN hasta cobertura específica | OPEN |

## 8. Criterios mínimos de aceptación futuros

Solo después de ratificación y autorización de implementación:
- cada caso de uso público adquiere exactamente una admisión antes de la primera lectura persistente;
- ninguna lectura de store cubierta ocurre antes de admisión;
- la admisión vive hasta el último uso del snapshot y última escritura/reconciliación;
- consultas/previews y Chronicle respetan el mismo límite de raíz;
- request→draft no produce adquisición anidada;
- Chronicle directo y delegado usan el mismo contrato y el padre nunca retiene la admisión;
- una operación sin admisión falla cerrada sin store I/O ni dispatch;
- agotamiento del presupuesto antes de adquirir produce bloqueo sin acceso a stores;
- el deadline de adquisición no expira una admisión activa;
- terminación por señal/crash y release incierto preservan UNKNOWN conforme a P-05;
- locks per-store conservan sus contratos y se prueban separadamente;
- consumidores directos/dinámicos conocidos quedan clasificados; los desconocidos no se declaran cubiertos por inferencia.

Estos criterios no han sido implementados ni ejecutados.

## 9. Estado y siguiente paso

**Resultado del cruce:** el informe Claude es concordante con la lectura estática independiente y con la intención normativa de P-03/P-04 §§3.1, 4 y 4.1. La propuesta concreta la elección de dueño que la especificación original dejó abierta y recomienda exclusividad M0 para evitar introducir concurrencia compartida sin evidencia.

**No es cierre ni ratificación.** Para cerrar el diseño faltan únicamente las decisiones explícitas del propietario sobre:
1. dueño por flujo y no reentrada, según §4.1 y §5;
2. admisión exclusiva para consultas/previews, según §4.3;
3. semántica del presupuesto de adquisición, según §4.4.

El valor numérico del presupuesto y el manejo detallado de timeout/señal pueden concretarse en la especificación de implementación sin convertirlos en decisiones de autoridad.

Estado conservado:
- P-03/P-04: OPEN / propuesta de ratificación pendiente.
- P-05: OPEN / NO RATIFICADA.
- M0: INCOMPLETO.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: PENDING/UNKNOWN.
- Commissioning y efectos protegidos: STOP.
- Sin cambios de runtime, tests, workflows, configuración o dispositivo.
- No se ejecutaron tests, CI ni Actions.
