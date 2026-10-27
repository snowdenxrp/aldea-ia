# NCS M0 — objeto candidato exacto y mapa de campos/consumidores (2026-10-27)

**Rama:** `ncs-clean-architecture`  
**Estado:** RECONCILIACIÓN DOCUMENTAL ESTÁTICA — PARCIAL — NO IMPLEMENTACIÓN / NO TEST / NO CI  
**Propósito:** concretar el candidato de primera creación a partir de artefactos ya existentes, sin repetir el censo de entrypoints ni convertir una propuesta de almacenamiento en autorización.

## 1. Conclusión ejecutiva

La evidencia disponible no respalda un único objeto universal llamado «la raíz» que pueda inicializarse sin más. Hay que separar:

1. **Directorio de instancia:** configuración/localizador propuesto para agrupar persistencia. No es un objeto de estado ni una raíz de confianza; el layout sugerido aún no está implementado como contrato común demostrado.
2. **Store Continuity:** candidato primario de primera creación en la ruta `openNexoContinuityOwner`. Su envelope observado es `NEXO_CONTINUITY_STORE`, versión 1, revisión y snapshot. Es operacionalmente significativo porque sus datos participan en reconstrucción/admisión de misión, planificación, intentos, `doNotRepeat`, linaje de ejecuciones y journal de efectos. Por ello no puede etiquetarse como «sin consecuencias» solo por no ser una credencial.
3. **Store Chronicle:** objeto distinto, envelope `NEXO_CHRONICLE`, versión 1, revisión y entradas. Se inicializa por ruta/flag separado y el flujo Chronicle puede continuar después hacia admisión, ejecución y append. No debe agruparse con Continuity en un solo acto lógico sin contrato que lo autorice.
4. **Locks, `owner.json` y temporales:** objetos auxiliares de coordinación/integridad; no son autoridad, identidad ni prueba de legitimidad.
5. **Estado de mundo/Lúmina y `legacyMemory`:** fuentes de datos y persistencia separadas que algunas rutas existentes conectan con Continuity. No son sustitutos de una raíz constitucional ni se deben fusionar automáticamente.

**Resultado:** el candidato más concreto para analizar primero es el **archivo Continuity ausente que `openNexoContinuityOwner` intenta inicializar**, identificado por el `filePath` real de una invocación determinada. Pero el path y los bytes iniciales concretos de una instalación no están fijados por los contratos inspeccionados. Por tanto, la identificación es por clase de objeto y frontera de API, no una afirmación de que exista una ruta canónica universal. P01-A/P01-G siguen OPEN/UNKNOWN; no se crea nada.

## 2. Esquema conocido y límites de la identificación

| Candidato | Forma conocida | ¿Es el objeto de primera creación? | Límite |
|---|---|---|---|
| Directorio `<root>` | Directorio propuesto que agruparía los stores | No equivale al archivo que inicializa `openNexoContinuityOwner` | Layout propuesto; no demuestra que los callers actuales compartan raíz |
| Archivo Continuity en `continuityPath`/`filePath` | Envelope `NEXO_CONTINUITY_STORE`, versión 1, revisión y snapshot | **Sí, candidato primario para P01-A**, cuando el store no existe y el caller permite inicialización | Path real, snapshot inicial exacto y capacidad negativa end-to-end no están fijados/demostrados |
| Archivo Chronicle en `chroniclePath` | Envelope `NEXO_CHRONICLE`, versión 1, revisión y entradas | Candidato separado, no el mismo objeto | Tiene su propia flag/semántica; el flujo compuesto puede continuar tras inicializar |
| `<filePath>.lock/` + `owner.json` | Directorio de lock y registro de propietario/token; detalles varían entre stores | No | Coordinación cooperativa; no autoridad ni exclusión global demostrada |
| Temporales `.tmp` y variantes | Artefactos de escritura/reemplazo/recuperación | No | No son marcadores fiables de bootstrap; no borrar por heurística |
| Estado de mundo / `nexoMemory` / `legacyMemory` | Estado legacy/simulación que puede proyectarse a Continuity | No | Fuente de migración/datos, no owner ni autoridad; frontera Nexo/Lúmina incompleta |

El contrato de raíz propone `<root>/continuity.json` y `<root>/chronicle.json`, pero las factories observadas reciben rutas (`filePath`, `continuityPath`, `chroniclePath`) y no fuerzan esos nombres. No fijar una ruta literal hasta que la configuración de instancia y su precedencia estén decididas y demostradas.

## 3. Campos y consumidores: clasificación conservadora

El envelope y los nombres de las colecciones están documentados; no se asigna una semántica de seguridad a un campo solo por su nombre.

| Campo/colección o dato | Consumidor/uso conocido en la inspección | Efecto de clasificación |
|---|---|---|
| Envelope/tipo y versión del store | Carga/validación del store | Determina si el documento se reconoce como formato esperado; no autentica a su creador |
| Revisión del store | Commit condicional, control de concurrencia y reconciliación | Ayuda a coordinar escritores cooperantes; no es autoridad ni prueba anti-rollback global |
| Snapshot Continuity | `openNexoContinuityOwner` y owner-backed runtime | Entrada de estado operativo que puede influir en reconstrucción/admisión de misiones y pasos; no demostrar no autoridad solo por ser snapshot |
| `missions` | Registro y recuperación de misiones | Estado operacional con influencia en decisiones posteriores |
| `attempts` | Historial/recuperación de intentos | Evidencia operacional; no concede permiso por sí misma |
| `doNotRepeat` | El orquestador lo consulta al planificar pasos | Influye en planificación; por tanto tiene consecuencia de control de flujo |
| `executions` | Linaje/idempotencia y reconstrucción | No equivale a verdad del mundo ni a autoridad; sí puede afectar si se vuelve a ejecutar una operación |
| `effectJournal` | Recuperación/reconciliación y seguimiento de efectos | No autoriza por sí solo efectos; puede afectar el camino de recuperación y la decisión de redispatch |
| Entradas Chronicle | Append y comprobación de invariantes/settlement en rutas relacionadas | Persistencia operacional; no raíz de autoridad |
| PID/token/`createdAt` del lock | Identificar/liberar lock cooperativo | Coordinación; no credencial constitucional |
| `legacyMemory`/estado `nexoMemory` | Proyección inicial si Continuity no existe y la ruta la proporciona | Datos de origen; su presencia no prueba autorización de migración ni separación Nexo/Lúmina |

La tabla describe relaciones estáticas conocidas, no garantiza exhaustividad de todos los consumidores ni prueba ejecución real.

## 4. Rutas que impiden asumir aislamiento por diseño

- `src/nexo/application/chronicle-append.mjs`: puede abrir/inicializar Continuity y luego continuar hacia admisión/ejecución Chronicle en la misma invocación. La flag de inicialización no equivale a un gate de autoridad.
- `scripts/simulate.mjs`: puede pasar `state.nexoMemory ?? null` como `legacyMemory`, permitir inicialización vacía cuando falta el archivo de mundo y después persistir el estado de simulación.
- `scripts/assistants.mjs`: puede proyectar `persisted.nexoMemory`, registrar una misión Continuity y persistir estado/learning de Lúmina en un flujo compuesto.
- `continuity-service.mjs`: `allowEmptyInitialization` es falso por defecto; si existe `legacyMemory`, puede proyectarla aunque no se permita snapshot vacío. La política local del servicio no garantiza aislamiento de la invocación completa.

Estos son caminos ya conocidos, no un nuevo censo. No se afirma que todos hayan sido ejecutados ni se reabre la auditoría general. Su existencia estática basta para impedir la afirmación no probada de que la primera creación de Continuity carece de consecuencias operativas.

## 5. Propiedades negativas requeridas para clasificar el candidato como A

Para aceptar que el archivo Continuity inicial es almacenamiento M0 estrictamente no autoritativo, una revisión futura tendría que demostrar con contrato y evidencia:

1. El snapshot inicial no contiene ni puede establecer credenciales, raíz de confianza, Constitución, Policy, permisos ni estado protegido.
2. Ningún consumidor interpreta la mera existencia, forma válida, revisión, hash, lock, linaje o journal como autorización.
3. La ausencia/corrupción/UNKNOWN del store bloquea las rutas normales; una operación explícita de bootstrap no continúa hacia admisión, PREPARED, dispatch, reconciliación ni mutaciones de dominio en la misma invocación.
4. La ruta de bootstrap se distingue del commit condicional normal y no convierte la ausencia en permiso.
5. La proyección desde `legacyMemory` y las excepciones `assistants`/`simulate` tienen un alcance explícito; no se afirma separación Nexo/Lúmina sin evidencia.
6. La creación/persistencia no se declara exclusiva ni estable frente a todos los escritores hasta resolver el protocolo, el entorno, la quiescencia y los resultados ambiguos.
7. La regla legítima que permite la primera creación del objeto exacto está identificada y se reconoce fuera de la afirmación del caller; no se inventa un owner paralelo.

La lista define obligaciones de evidencia; no afirma que ya se cumplan.

## 6. Decisión pendiente, estrechada

La siguiente decisión del propietario —solo si los contratos aceptados no la cubren— debe referirse a esta formulación precisa:

> ¿Se permite que una operación de bootstrap cree por primera vez el archivo Continuity identificado por la configuración de instancia, con un snapshot inicial explícito y acotado, exclusivamente como persistencia operacional M0, bajo qué regla legítima de creación y con qué exclusiones verificables de consumidores?

No mezclar en esa decisión la inicialización de Chronicle, la creación del directorio raíz, los locks, la migración legacy, la quiescencia, el protocolo de UNKNOWN ni la autorización de efectos; son dependencias separadas y pueden bloquear aunque el alcance de datos se acepte.

Si el path real, el esquema inicial o la regla de primera creación no pueden identificarse sin inventar datos, registrar UNKNOWN y detener la inferencia dependiente. No elegir mecanismo por descarte.

## 7. Estado y continuidad

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`; P01-A/B/G: `OPEN / UNKNOWN`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autoridad raíz: `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos: `STOP`.
- Solo documentación. No se modificaron runtime, tests, workflows ni configuración ejecutable; no se ejecutaron tests, CI o Actions.

Siguiente paso: indexar este mapa en el inventario y STATUS; después, si procede, resolver solo la decisión de alcance/primera creación que siga sin cubrirse por los contratos aceptados. No repetir el censo de callers ni ejecutar pruebas/implementación.
