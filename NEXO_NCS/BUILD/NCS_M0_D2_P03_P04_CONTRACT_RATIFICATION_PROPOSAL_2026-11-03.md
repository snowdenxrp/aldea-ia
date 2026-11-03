# NCS M0 — Propuesta de cierre contractual P-03/P-04
Fecha: 2026-11-03
Rama: `ncs-lumina-decoupling-2026-10-29`
Base documental/código: HEAD `a84ce145fd162861afd725ba2b5d70e9a3265a73`
Estado: **DIRECCIÓN CONTRACTUAL D1–D6 RATIFICADA POR EL PROPIETARIO — CIERRE TÉCNICO PENDIENTE — NO AUTORIZA IMPLEMENTACIÓN**

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

**Recomendación contractual (no ratificada):** la adquisición debe pertenecer a la frontera pública de aplicación `runNexoChronicleAppend`, no al `main` del script. Esa frontera debe adquirir antes de la primera lectura persistente (actualmente `chronicle-append.mjs:319`) y mantener la admisión hasta completar la última escritura/reconciliación y formar el resultado, antes del release. El entrypoint hijo invoca esa API; el padre espera y propaga el resultado, pero no adquiere ni retiene la admisión. La API exportada debe ser segura cuando se llama directamente; no puede depender de que el CLI la haya admitido previamente.

### 3.3 Consultas y previews

- Las funciones públicas de `continuity-queries.mjs` cargan snapshots mediante stores construidos por path.
- `continuity-store.loadCurrent()` adquiere y libera su lock dentro de la propia lectura.
- El snapshot clonado se consume después de que ese lock per-store fue liberado.
- El clonado evita que el consumidor siga leyendo el documento mutable, pero no asegura por sí mismo que la revisión usada siga siendo actual frente a una escritura concurrente.
- `previewNexoMissionRequest` delega en `previewNexoMissionDraft`; el contexto de admisión debe fluir por la cadena sin una segunda adquisición.
- El CLI enruta a las funciones de aplicación; no debe ser un segundo dueño de la misma admisión.

**Recomendación contractual (no ratificada):** cada API pública de consulta/preview es una frontera segura por sí misma. Para `previewNexoMissionRequest` → `previewNexoMissionDraft`, la función superior adquiere una sola vez y llama a una implementación interna no pública de draft; la API pública `previewNexoMissionDraft`, cuando se invoca directamente, adquiere por sí misma y llama a esa misma implementación interna. No debe resolverse con un objeto plano falsificable ni con una bandera `alreadyAdmitted` aceptada desde callers arbitrarios. La capacidad debe ser no falsificable fuera del módulo (por ejemplo, marca privada/WeakSet o closure privada) y no reentrante. La admisión empieza antes de la primera lectura persistente y termina tras construir el retorno.

### 3.4 Doble adquisición y límites de la evidencia

**CONFIRMED:** no hay evidencia de doble adquisición de una admisión P-03, porque esa primitiva no está implementada. Los ciclos de lock per-store no deben etiquetarse como reentrada de admisión de instancia.

**GAP:** no se ha demostrado cobertura de todos los consumidores directos, dinámicos o externos de APIs exportadas de stores/owner. Los guards de imports conocidos no prueban ausencia universal de callers ni de escrituras directas al filesystem.

**GAP:** el presupuesto compartido de locks per-store observado en el flujo Chronicle no es un presupuesto de admisión de instancia. La futura primitiva necesita un contrato de espera propio, sin reutilizar silenciosamente semánticas distintas.

## 4. Contrato mínimo recomendado para ratificación

### 4.1 Unidad, frontera pública y propietario

Una admisión corresponde a **un caso de uso público**, no a cada helper ni a cada store. La adquisición debe estar en la API pública de aplicación que garantiza cobertura para todos sus callers, no únicamente en el CLI.

| Flujo | Frontera pública que adquiere | Implementación interna | No adquieren |
|---|---|---|---|
| Chronicle directo | `runNexoChronicleAppend` | Cuerpo interno del append después de adquirir | Script, stores y helpers |
| Chronicle delegado desde `nexo.mjs` | `runNexoChronicleAppend`, invocado por el hijo | Igual que la invocación directa | Padre `nexo.mjs`, hijo como wrapper adicional, stores y helpers |
| Query/status/mission/plan/Open Loops | Cada API pública de query correspondiente | Proyección sobre snapshot/contexto admitido | CLI, stores y helpers |
| Preview request→draft | API pública superior `previewNexoMissionRequest` | Helper interno de draft que no adquiere | API pública draft delegada en ese camino, CLI, stores y helpers |
| Preview draft directo | API pública `previewNexoMissionDraft` | El mismo helper interno de draft | CLI, stores y helpers |

El contexto/capacidad admitido no puede ser un objeto plano o una bandera booleana aceptada de callers arbitrarios. Debe ser no falsificable fuera del módulo que lo crea (por ejemplo, marca privada/WeakSet o closure privada), y las funciones internas que lo reciben no deben reentrar. La API pública draft conserva su propia garantía cuando se invoca directamente; la API request usa una ruta interna para evitar una segunda adquisición. La API pública Chronicle también debe adquirir aunque sea llamada sin CLI.

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

### 4.3 Modo de admisión de lecturas y diagnóstico — decisión abierta crítica

O-10 exige admisión para queries/previews; no determina por sí solo si esa admisión debe ser exclusiva o compartida. **No se recomienda ratificar todavía exclusividad para todas las lecturas.** La propuesta anterior sobrestimó la actualidad que aportaría: una admisión exclusiva solo coordina callers que realmente la respetan; no cubre bootstrap, callers directos/dinámicos ni escritores fuera del protocolo. Tampoco elimina por sí sola el riesgo de release incierto.

Hay dos alternativas que requieren decisión explícita del propietario:

- **R1 — Exclusiva para todo:** todas las queries/previews compiten por la misma admisión exclusiva. Contrato simple, pero tras `UNKNOWN/BLOCKED` puede impedir incluso inspeccionar el estado que permitiría diagnosticar la incertidumbre. No existe excepción implícita para `status`/`open-loops`; cualquier vía de diagnóstico tendría que definirse y autorizarse expresamente.
- **R2 — Lectura compartida / escritura exclusiva:** queries y previews pueden adquirir admisión compartida; Chronicle/mutaciones adquieren exclusiva. Requiere una primitiva reader/writer demostrablemente correcta, orden justo o política anti-starvation, tratamiento de upgrade/downgrade y compatibilidad con P-05. No resuelve por sí sola el diagnóstico después de release incierto: O-11 sigue bloqueando readmisión mientras el estado esté incierto, salvo política de inspección expresamente ratificada.

Una tercera posibilidad —operación de inspección diagnóstica limitada bajo `UNKNOWN/BLOCKED`— también requiere contrato del propietario: qué datos puede leer, si puede observar un lock incierto sin alterarlo y cómo garantiza que no se convierte en readmisión encubierta.

**Recomendación:** dejar el modo de lectura OPEN. No afirmar que exclusiva sea intrínsecamente más segura ni que compartida sea necesaria. Resolver primero el requisito de diagnóstico bajo O-11/P-05 y seleccionar el modo junto con esa política. La admisión sigue siendo obligatoria para toda lectura cubierta, sin excepción read-only.

### 4.4 Presupuestos: adquisición de admisión, locks per-store y ejecución

**Recomendación (no ratificada):** distinguir tres relojes, no reutilizar un único deadline opaco:

1. **Espera de admisión:** deadline monotónico por intento de adquisición de instancia. Empieza antes del primer intento e incluye reintentos/esperas de esa adquisición. Si vence antes de adquirir, no hay store I/O ni dispatch.
2. **Espera de lock per-store:** cada adquisición de lock de store recibe un presupuesto/deadline explícito propio, o un presupuesto de operación con semántica igualmente explícita. No se debe decir simultáneamente que el deadline único no se reinicia en stores y que los locks per-store conservan su contrato actual sin definir cuál de esas reglas prevalece. Recomendación provisional: presupuesto acotado por intento de lock per-store, sin compartir silenciosamente el deadline de admisión. Si se prefiere un presupuesto total de operación, debe especificarse cómo se reparte entre múltiples ciclos y stores.
3. **Duración de operación ya admitida:** no usar el deadline de adquisición como TTL ni caducidad automática de una admisión activa. Una admisión no se libera por el mero vencimiento de un reloj.

El vencimiento de un lock per-store debe clasificarse según el punto de ejecución: antes de cualquier escritura/dispatch demostrable puede ser fallo bloqueado; después de dispatch o de una escritura posible, el resultado puede ser `UNKNOWN` y requiere reconciliación conforme al contrato aplicable. No se reintenta automáticamente la operación de negocio para compensar un timeout.

Timeout, señal, crash o cancelación del proceso pueden dejar al actor sin capacidad de ejecutar el release. No son meros detalles de configuración: su resultado, la evidencia de release y cualquier readmisión están sujetos a O-11/P-05 y requieren política del propietario. El valor numérico de cada presupuesto es posterior al cierre semántico.

### 4.5 Composición con locks per-store

La admisión de instancia y los locks per-store tienen propósitos y ciclos de vida distintos:
- admisión: serializa el caso de uso sobre la raíz canónica;
- lock per-store: protege la operación local del store conforme a su contrato existente.

No se deben unificar ni retirar locks per-store por analogía. Antes de implementación se debe fijar orden de adquisición y release para evitar inversión de locks, deadlock y reentrada. Las lecturas Chronicle sin lock per-store deben quedar cubiertas por la admisión de instancia o recibir un contrato específico; esta propuesta no decide por sí sola modificar `chronicle-store.loadCurrent()`.

## 5. Contrato padre/hijo y timeout/señal

1. El padre valida argumentos superficiales y transmite la raíz/opciones permitidas.
2. El hijo valida independientemente la raíz, flags contradictorios y la prohibición de bootstrap implícito antes de abrir stores.
3. La API pública `runNexoChronicleAppend` adquiere la admisión en su propia frontera, antes de `chronicle-append.mjs:319`; no se limita a confiar en que el script hijo ya la adquirió.
4. El padre no adquiere ni retiene la admisión mientras espera mediante `spawnSync`.
5. Los helpers reciben capacidad no falsificable y no reentran.
6. El padre propaga un resultado estructurado solo cuando el hijo lo produjo; terminación por señal, ausencia de resultado o estado ambiguo deja UNKNOWN los campos no demostrables.

**Decisión del propietario pendiente:** política de timeout, señal, cancelación y terminación del hijo. Matar un hijo que puede tener una admisión o una operación en vuelo puede convertir el release en incierto y activar O-11/P-05. No se puede clasificar como mero detalle de implementación ni añadir un timeout sin definir las consecuencias y la evidencia de recuperación. La ausencia actual de timeout en `spawnSync` (`scripts/nexo.mjs:189`) es una brecha observada; esta propuesta no la resuelve.

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
| Padre con `spawnSync` | No adquiere; delega al caso de uso público del hijo | PROPUESTO; consistente con propuesta no ratificada P-04 §4.1 |
| Intervalo | Antes de primera lectura persistente hasta último uso/escritura y límite terminal | PROPUESTO; consistente con propuesta no ratificada P-03 §3.1 |
| Lecturas | Resolver exclusividad, compartida o inspección diagnóstica limitada | DECISIÓN DEL PROPIETARIO PENDIENTE |
| Capacidad interna | No falsificable; APIs públicas seguras para callers directos; helpers internos no reentran | RECOMENDACIÓN; REQUIERE DISEÑO |
| Presupuesto de admisión | Deadline monotónico de espera; no TTL tras adquirir | RECOMENDACIÓN; REQUIERE RATIFICACIÓN |
| Locks per-store | Definir presupuesto por adquisición o total de operación; no mezclar con admisión | GAP CONTRACTUAL |
| Timeout/señal/cancelación | Consecuencias sobre release y resultado bajo O-11/P-05 | DECISIÓN DEL PROPIETARIO PENDIENTE |
| Inputs externos/metadata | Clasificación P-03 §3.2 provisional; requiere ratificación | OPEN |
| Callers directos/dinámicos/externos | Cobertura no demostrada; P-09 | UNKNOWN / OPEN |
| Bypass bootstrap/direct-store | Exclusión de cobertura debe probarse o permanecer UNKNOWN | OPEN |

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

**Resultado del cruce:** el informe Claude confirma que la dirección general es compatible con la intención de O-08/O-10/O-11 y con las propuestas P-03/P-04 §§3.1, 4 y 4.1. No se encontró contradicción normativa directa; sí se encontraron sobreafirmaciones y decisiones abiertas que la versión anterior presentó incorrectamente como si fueran las únicas pendientes.

**No es cierre ni ratificación.** La lista completa de cuestiones abiertas incluye:
1. propietario y frontera pública de adquisición por flujo, incluida cobertura de llamadas directas a APIs exportadas;
2. capacidad no falsificable y patrón interno/no reentrante para request→draft;
3. modo de lectura y diagnóstico bajo `UNKNOWN/BLOCKED` (exclusiva, compartida o inspección limitada);
4. presupuesto de espera de admisión;
5. presupuesto y semántica de locks per-store a lo largo de una operación con múltiples ciclos;
6. política del propietario para timeout, señal, cancelación y crash del hijo, por su relación con release incierto/O-11/P-05;
7. ratificación de las clasificaciones provisionales de stdin, archivos externos y metadata de raíz en P-03 §3.2;
8. cobertura de callers directos, dinámicos, externos y bypasses (P-09);
9. orden de adquisición/release entre admisión y locks per-store y sus garantías frente a deadlock;
10. tratamiento de inspección/diagnóstico sin convertirla en readmisión encubierta.

Los valores numéricos de espera solo pueden fijarse después de resolver su semántica. No se afirma que timeout/señal sean detalles no sujetos a autoridad: cuando puedan dejar un actor en vuelo o release incierto, deben respetar la política ratificada por el propietario bajo O-11/P-05.

Estado conservado:
- P-03/P-04: OPEN / propuesta de ratificación pendiente.
- P-05: OPEN / NO RATIFICADA.
- M0: INCOMPLETO.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: PENDING/UNKNOWN.
- Commissioning y efectos protegidos: STOP.
- Sin cambios de runtime, tests, workflows, configuración o dispositivo.
- No se ejecutaron tests, CI ni Actions.

### Correcciones incorporadas tras revisión adversarial Claude (2026-11-03)

- Se retiró la afirmación de que solo faltaban tres decisiones; §9 ahora enumera también inputs externos/metadata, cobertura de callers, timeout/señal/cancelación, presupuestos per-store, capacidad interna y diagnóstico.
- Se retiró la recomendación de exclusividad general como si fuera una opción ya preferida. El modo de lectura queda OPEN porque debe resolverse junto con la inspección diagnóstica bajo UNKNOWN/BLOCKED.
- Se precisó que la adquisición Chronicle debe pertenecer a la API pública `runNexoChronicleAppend`, no solo al script hijo, para cubrir callers directos.
- Se especificó el patrón request→draft de wrapper público + helper interno no reentrante con capacidad no falsificable; es propuesta de diseño, no implementación.
- Se separaron los presupuestos de adquisición de admisión, adquisición de locks per-store y duración de la operación; no se fija valor numérico.
- Se reclasificaron timeout/señal/cancelación como decisión pendiente del propietario cuando puedan producir release incierto conforme a O-11/P-05.
- Se sustituyeron afirmaciones de alineación ratificada por “consistente con propuesta no ratificada”.
- Estas correcciones son documentales. No cambian gates ni autorizan implementación.


## 10. DELTA — RATIFICACIÓN DEL PROPIETARIO D1–D6 (2026-11-03)

El propietario ratificó explícitamente el paquete consolidado D1–D6 presentado en la conversación del 2026-11-03. Esta sección prevalece sobre las recomendaciones/propuestas anteriores de este documento cuando exista diferencia.

### 10.1 Decisiones ratificadas

1. **D1 — Frontera y propietario:** una admisión por caso de uso público, adquirida en la API pública de aplicación antes de la primera lectura persistente y conservada hasta el último uso del snapshot y la última escritura/reconciliación. Chronicle pertenece a `runNexoChronicleAppend`, también en llamada directa. Queries/previews pertenecen a sus APIs públicas. Request→draft adquiere una sola vez en la API superior y usa helper interno no reentrante; draft directo mantiene su propia garantía. El padre `nexo.mjs` no adquiere la admisión del hijo.
2. **D2 — Diagnóstico en UNKNOWN/BLOCKED:** se permite únicamente inspección forense limitada de evidencia externa y metadata del protocolo. No puede leer ni alterar Continuity/Chronicle ni readmitir la instancia. No es una excepción read-only a O-10 ni una query normal. Si una inspección no puede garantizar esos límites, queda prohibida.
3. **D3 — Modo normal de lectura:** admisión exclusiva para las operaciones normales cubiertas por M0. La inspección forense limitada de D2 es un carril separado, no una admisión compartida ni una lectura de stores. No se adopta reader/writer compartido en M0.
4. **D4 — Timeout, señal, cancelación y crash:** terminación, ausencia de resultado estructurado o release no demostrable se clasifican UNKNOWN/BLOCKED para los campos afectados. No hay retry automático de negocio ni readmisión hasta resolución demostrable conforme a O-11/P-05. Un timeout no equivale a release confirmado.
5. **D5 — Inputs externos y metadata:** se ratifican las clasificaciones provisionales de P-03 §3.2: validar forma/límites superficiales antes de admisión sin abrir stores; stdin y archivos externos request/draft son entradas del operador, no stores ni autorización; su lectura no prueba admisión ni atomicidad con stores; metadata mínima para resolver/canonicalizar raíz es preparación de raíz, sujeta a P-07; metadata del protocolo pertenece a la primitiva de admisión y no autoriza acceso a stores de negocio.
6. **D6 — Límite de cobertura:** se mantiene el límite de confianza R1 ya aceptado para la sesión manual interactiva Termux: no se afirma protección universal; no se extiende la garantía a root/OS comprometido ni a procesos maliciosos con el mismo UID fuera del límite aceptado. Los actores/callers que no se demuestren dentro de la cobertura permanecen UNKNOWN/BLOCKED; no se infiere cobertura de guards parciales.

### 10.2 Resoluciones técnicas delegadas a ingeniería

Sin nueva decisión de autoridad, ingeniería puede diseñar y justificar:
- capacidad de admisión no falsificable y helpers internos no reentrantes;
- orden de locks y prevención de deadlock;
- presupuestos separados para espera de admisión, locks per-store y duración de operación;
- estructura de resultados padre/hijo y propagación de UNKNOWN;
- cobertura de APIs públicas, tests, guards y workflows.

La implementación debe preservar D1–D6, O-08/O-10/O-11 y la separación entre admisión técnica y autoridad constitucional.

### 10.3 Pendientes y límites

- **P-05 permanece OPEN / NOT RATIFIED.** Debe definir evidencia segura de release, cuarentena y readmisión; D2 no lo resuelve ni crea una vía de recuperación.
- P-07 conserva el tratamiento de filesystem, alias y TOCTOU.
- P-08 conserva la gramática/compatibilidad CLI.
- P-09 conserva la evidencia de callers dinámicos/externos y superficies de bypass.
- No se ratifica ningún mecanismo concreto de filesystem, protocolo de recuperación ni valor numérico de timeout.
- No se autoriza modificación de runtime, tests, workflows, configuración ni dispositivo por esta ratificación documental.
- No se ejecutaron tests, CI ni Actions.

### 10.4 Estado tras la ratificación

- P-03/P-04: **DIRECCIÓN CONTRACTUAL D1–D6 RATIFICADA; CIERRE TÉCNICO Y EVIDENCIA DE COBERTURA PENDIENTES**.
- P-05: **OPEN / NOT RATIFIED**.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: **PENDING/UNKNOWN**.
- Commissioning y efectos protegidos: **STOP**.
- Primera publicación real: **STOP**.

