# CHECKPOINT NUEVO — 2026-10-22 — GUARD DE ENTRADA DEL REGISTRO DE VERIFICADORES

- Hallazgo: `createNexoContinuityOwner()` construía el registro con `Object.entries(effectVerifiers)`, que lee valores de propiedades y puede ejecutar un getter configurado por quien llama al constructor.
- Corrección: el constructor ahora inspecciona claves propias y descriptores, rechaza accessors, símbolos, prototipos no permitidos, entradas no enumerables, nombres vacíos y valores que no sean funciones. El registro interno sigue copiado a un objeto de prototipo nulo y congelado.
- Regresión: `tests/nexo/continuity-contract.test.mjs` usa un getter centinela; la construcción debe rechazar el registro sin ejecutar el getter.
- Commits runtime/test: [d65245bdbcc20cdee7ebf315d6a65f162bcb894d](https://github.com/snowdenxrp/aldea-ia/commit/d65245bdbcc20cdee7ebf315d6a65f162bcb894d), [796219c48fda52dd51e9eec4fa696cb48ec88096](https://github.com/snowdenxrp/aldea-ia/commit/796219c48fda52dd51e9eec4fa696cb48ec88096).
- CI en SHA exacto `796219c48fda52dd51e9eec4fa696cb48ec88096`: 5/5 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074402), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074339), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074353), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074344), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074399). No se afirma que todos los workflows del repo hayan corrido.
- Informe: [NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md).
- Alcance: evita la evaluación accidental de getters ordinarios en el registro. No neutraliza todos los Proxy traps, no autentica verificadores ni evidencia, no establece autoridad legítima y no habilita efectos protegidos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE OBSERVACIONES DEL VERIFICADOR

- Continuación tras recuperar la conexión: la revisión detectó que `reconcilePrepared()` inspeccionaba directamente el objeto devuelto por el verificador de reconciliación. Un getter en `observation.status` podía ejecutarse antes del rechazo estructural.
- Corrección: reutiliza `validateCallerRecord()` antes de leer cualquier campo de la observación. Entrada inválida devuelve `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`, mantiene el PREPARED sin liquidar y no avanza la revisión canónica.
- Regresión: observación de verifier con getter en `status`; exige cero ejecución del getter, resultado bloqueado, `journalSettled:false` y revisión intacta.
- Commits: runtime `6937d230b7fff32e04416a47c6a612180ef7c1c7`; primer test `988a3facfab2b6291f9f8d636d32fac7b9c372e0` falló porque el fixture utilizaba la operación equivocada y nunca alcanzaba el verificador; se inspeccionó el log, se corrigió el enlace de operación en `e48e2f9b5f63b63176c7e198bea0a4753e85893d`.
- CI en SHA exacto `e48e2f9b5f63b63176c7e198bea0a4753e85893d`: 5/5 workflows disparados SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091120), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091141), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091130), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091149), [admisión/continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091015). No se afirma que todos los workflows del repo corrieran en este SHA.
- Informe: [NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md).
- Alcance: guard de datos para salida del verifier in-process. No autentica fuente/evidencia, no neutraliza todo código hostil/Proxy en el mismo proceso, no habilita dispatch ni prueba raíz legítima.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARDAS DE ENTRADA OWNER Y OPERACIONES DE CONTINUIDAD

- El primer cambio del owner detectó una regresión de contrato en CI: los rechazos de misión perdían storeRevision. Se corrigió leyendo la revisión actual solo en la ruta de rechazo y sin tocar el estado canónico.
- La auditoría posterior extendió la misma frontera a las funciones exportadas recordNexoExecutionInSnapshot() y recordNexoOutcomeInSnapshot(): el destructuring de parámetros y structuredClone() podían ejecutar getters caller-supplied antes de rechazar los records. Ahora se hace preflight iterativo del record completo y comprobación de persistibilidad antes de leer campos o clonar.
- Regresiones: getter en missionId de recordMission; getter en result de recordNexoExecutionInSnapshot; getter en evidence de recordNexoOutcomeInSnapshot. Se exige que no se ejecuten y que no cambie la continuidad canónica.
- Commits: owner guard [5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); preservación de revisión [e11327c73a83ffa1ae5af4dafcc9cf46da648440](https://github.com/snowdenxrp/aldea-ia/commit/e11327c73a83ffa1ae5af4dafcc9cf46da648440); tests de operaciones [89ba6387068b2c303680b2774b752dca213b77e7](https://github.com/snowdenxrp/aldea-ia/commit/89ba6387068b2c303680b2774b752dca213b77e7); fix de operaciones [b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6](https://github.com/snowdenxrp/aldea-ia/commit/b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6).
- CI exacto del HEAD de código b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6: 7 workflows SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781227), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781258), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781259), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781165), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781247), [proyección de estado de misión](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781235), [crash cuts de settlement](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781246). El commit posterior solo documental no se cuenta como un nuevo SHA de código validado.
- Informe: [NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- Alcance: hardening de contratos de entrada in-process. No convierte Proxy traps en inocuos, no crea cuota global de heap, no autentica evidencia ni autoriza efectos protegidos.
- Estado canónico sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE INPUT DEL OWNER ANTES DE LEER CAMPOS

- Hallazgo reproducible de contrato: `createNexoContinuityOwner().recordMission()` inspeccionaba `mission.missionId/steps` antes de ejecutar la admisión compartida. Un getter caller-supplied podía ejecutarse antes de que el guard de misión lo rechazara. Patrones equivalentes de orden existían en las entradas de `recordOutcome`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared`.
- Regresión añadida en `tests/nexo/continuity-contract.test.mjs`: misión con getter en `missionId`; se exige que el getter no se ejecute y que la revisión canónica no cambie.
- Corrección en `src/nexo/core/continuity-owner.mjs`: `recordMission` llama primero a `assertNexoMissionAdmission`; las demás entradas de records usan preflight iterativo de continuidad seguido de `assertContractInput` antes de leer campos.
- Commits: regresión [`d05519c5ddea931d83dc691064efb012c85ff848`](https://github.com/snowdenxrp/aldea-ia/commit/d05519c5ddea931d83dc691064efb012c85ff848); fix [`5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037`](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); informe [`137f60e93e47d72de53dcd2c898074bb69b0f7f7`](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- CI: ocho workflows estaban en cola al registrar el fix. No se declara PASS hasta verificar resultados para el SHA exacto de la rama tras el commit documental.
- Alcance: endurecimiento de entrada in-process; no protege contra código hostil ya ejecutándose en el proceso ni contra todos los traps de Proxy. No es autoridad, autenticación de evidencia ni habilitación de efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — LÍMITE DE LECTURA PARA LOCK OWNER

- Hallazgo de inventario: los stores de continuidad y Chronicle limitaban los documentos canónicos a 16 MiB/32 MiB, pero sus archivos auxiliares `*.lock/owner.json` se leían mediante `readFile()` sin límite explícito. Esos metadatos participan en decisiones de propiedad del lock; una entrada local corrupta o excesiva podía consumir memoria fuera del presupuesto de documento.
- Cambio: `NEXO_RESOURCE_LIMITS.lockOwnerBytes = 4096`. Ambos stores leen owner records con `readUtf8FileBounded`; si superan el límite o no pueden validarse, la adquisición queda `LOCK_STATE_UNKNOWN` y no se elimina el lock ni se inicia la escritura. Esto no reclama resistencia frente a procesos hostiles que controlen el directorio; la configuración de ruta local confiable sigue siendo un requisito documentado.
- Regresiones: `tests/nexo/continuity-store.test.mjs` y `tests/nexo/chronicle-store.test.mjs` ahora comprueban que un owner record de 4097 bytes bloquea de forma fail-closed, preserva el lock y no crea el documento canónico. Las simulaciones de pérdida de propiedad del lock se adaptaron para interceptar `open/read`, conservando la cobertura después de pasar a lecturas acotadas.
- Código y pruebas en HEAD [`1d822786d972616ffbb03e25abd43084076f10e4`](https://github.com/snowdenxrp/aldea-ia/commit/1d822786d972616ffbb03e25abd43084076f10e4).
- CI SUCCESS en ese SHA:
  - STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027492
  - STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027483
  - bounded mission admission/restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027449
  - Chronicle native vertical: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027473
  - integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027551
  - deterministic persistence suite: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027546
- Scope: límite auxiliar de lectura y tests. No se añadieron locks nuevos, colas, retries de negocio ni cuotas de memoria global; no se cambió el runtime de efectos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT COMPARTIDO Y OPTION A ALINEADA CON SUS PRUEBAS

- Se extrajo el preflight iterativo común a `src/nexo/core/continuity-data-guard.mjs`. Lo usa `continuity-snapshot.mjs` antes de validación recursiva de snapshots y `continuity-contract.mjs` antes de validar memoria legacy. Así la ruta de proyección legacy ya no depende de entrar por un snapshot para tener límite de profundidad.
- Límite global del grafo de continuidad: profundidad 35. Se eligió 35 para conservar el presupuesto existente de profundidad 32 por misión después de los contenedores de snapshot/memoria (snapshot + colección + misión; legacy root + nexo + colección + misión). Esto limita profundidad antes de recursión; no es una cuota de heap ni una medición de producción.
- Regresiones en `tests/nexo/continuity-contract.test.mjs`: snapshot profundo en `attempts`, memoria legacy profunda y `projectNexoContinuitySnapshot()` deben fallar con códigos de límite explícitos antes de la validación/clonación recursiva.
- Option A reconciliada en la prueba CLI, sin tocar runtime: commit [`3850889d7f127c7415d429bc3512d78171573291`](https://github.com/snowdenxrp/aldea-ia/commit/3850889d7f127c7415d429bc3512d78171573291). `tests/nexo/assistants-runtime-cli.test.mjs` ahora exige que la ruta opt-in permanezca bloqueada con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`, sin crear obligaciones en `effectJournal` ni reescribir el entorno. La misión puede quedar registrada; el efecto protegido sigue excluido.
- CI para el SHA `3e98103aa6ea65a4de4d74b68300ee89a1321e36`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246643
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246786
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246618
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246778
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852030397 (SHA anterior `d63cf5b`; no atribuir ese run al SHA `3e98103`)
  - repair settlement crash cuts — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246635
- El workflow de crash cuts pasa ahora porque la prueba representa Option A con exactitud; esto NO autoriza ejecución de efectos y NO convierte M0 en completo.
- No se habilitó dispatch ni se modificó `scripts/nexo-runtime-session.mjs`. No se cambió el estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT ITERATIVO DE PROFUNDIDAD EN SNAPSHOTS

- Hallazgo: `assertNexoContinuitySnapshot()` invocaba el guard recursivo genérico (`assertContractInput`) antes de que la admisión iterativa por misión pudiera limitar profundidad. En snapshots persistidos, un objeto profundamente anidado en colecciones como `attempts` podía agotar la pila durante validación antes de que se aplicaran los límites del documento.
- Corrección: commit [`2b617e2843a7de0c4b9d900ea4f13dbee0e4f191`](https://github.com/snowdenxrp/aldea-ia/commit/2b617e2843a7de0c4b9d900ea4f13dbee0e4f191), `src/nexo/core/continuity-snapshot.mjs`, añade un preflight iterativo antes del guard recursivo. Profundidad máxima del snapshot: 32; los ciclos, propiedades no-dato, claves símbolo, arrays dispersos/extendidos y prototipos no permitidos se rechazan antes de la validación recursiva.
- Regresión: commit [`4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`](https://github.com/snowdenxrp/aldea-ia/commit/4c8763a52cea5c481e1291d6d1aaafd1a5aac79c), prueba un objeto de profundidad 40 en `attempts` y exige `NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED`.
- CI para el SHA de código/pruebas `4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743391
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743415
- En el SHA inmediatamente anterior `2b617e2`, STEP 4, STEP 5 y bounded mission admission/restart continuity también pasaron: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724112 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724169 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724204.
- Separado y aún abierto: el workflow `Nexo M0 — repair settlement crash cuts` falló en `tests/nexo/assistants-runtime-cli.test.mjs:74`, donde se esperaba `continuity.snapshot.effectJournal[0]` aunque el runtime excluyó el efecto (Option A). Las pruebas previas del mismo workflow pasaron; no se cambia runtime ni se altera la exclusión para forzar verde. Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724226.
- Alcance: se endureció validación estructural de snapshot; no se cambió despacho, persistencia de efectos ni autoridad. El techo de profundidad 32 se aplica a todo el snapshot, no sólo al subárbol de misión, y queda registrado como límite estructural v1.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CI DE PERSISTENCIA: CONCURRENCIA Y EVIDENCIA

- Cambio de workflow: [`3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0`](https://github.com/snowdenxrp/aldea-ia/commit/3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0), `.github/workflows/nexo-deterministic-tests.yml`.
- Causa observada: el workflow usaba un grupo de concurrencia fijo (`nexo-deterministic-tests`) y `cancel-in-progress: true`; sucesivos commits cancelaban pruebas de persistencia de SHAs anteriores. Para el SHA `c105f9098faf5bf45531b5c91731499c319070ac`, la ejecución quedó CANCELLED, no FAILED ni SUCCESS.
- Cambio aplicado: grupo por referencia (`nexo-deterministic-tests-${{ github.ref }}`) y `cancel-in-progress: false`, para aislar ramas y encolar ejecuciones en lugar de cancelar el test completo de persistencia con cada push.
- Estado del CI de persistencia antes del ajuste: ejecución para HEAD documental anterior `0ccffaedb981250119f126ab7c351ba3e9c41d18`, run https://github.com/snowdenxrp/aldea-ia/actions/runs/39851124108, seguía `PENDING` sin job asignado al último chequeo; una ejecución previa seguía `IN_PROGRESS` desde antes y sin conclusión. No presentar como verde.
- Los cuatro workflows del SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` permanecen en SUCCESS: integrated acceptance regression https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153; STEP 4 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210; STEP 5 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069; bounded mission admission https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071.
- Próxima verificación: confirmar que el nuevo grupo de concurrencia permita que el workflow de persistencia se ejecute y termine en el HEAD actual. No hacer nuevos commits de código mientras se espera, salvo que aparezca un fallo real que requiera corrección.
- No se cambió runtime de Nexo, los límites de admisión, la política de efectos ni la autorización.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — UNIFICACIÓN DEL LÍMITE DE ADMISIÓN PERSISTIDA

- Cambio de contrato: [`df0ea917f38e02afb4dba97c5cec4e13b57a7e72`](https://github.com/snowdenxrp/aldea-ia/commit/df0ea917f38e02afb4dba97c5cec4e13b57a7e72) añade comprobación de admisión al validar misiones persistidas en `src/nexo/core/continuity-contract.mjs`. Un límite de 256 pasos no debe depender de haber llegado por `recordNexoMissionInSnapshot`: los snapshots entregados directamente al store también deben respetarlo.
- Corrección de contrato: [`16406ed67a05a68924289e0c215bd66be84210bc`](https://github.com/snowdenxrp/aldea-ia/commit/16406ed67a05a68924289e0c215bd66be84210bc) conserva los códigos de error de schema ya establecidos para formas persistidas inválidas; sólo propaga el código específico cuando se excede el límite de recursos de misión.
- Regresión: [`17d03d4bab51498dee4293c0d924ab632cf4cf48`](https://github.com/snowdenxrp/aldea-ia/commit/17d03d4bab51498dee4293c0d924ab632cf4cf48) comprueba que un snapshot con 257 pasos se rechaza en la frontera de validación persistida.
- Ajuste de prueba de store: [`c105f9098faf5bf45531b5c91731499c319070ac`](https://github.com/snowdenxrp/aldea-ia/commit/c105f9098faf5bf45531b5c91731499c319070ac) separa el límite del documento de Continuity (16 MiB) del límite de admisión de cada misión. El fixture ahora combina 65 misiones individualmente acotadas para exceder el presupuesto agregado del documento sin que una sola misión viole su propio contrato.
- CI para SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` al momento de este checkpoint:
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071
  - deterministic persistence tests — PENDING, sin job asignado aún: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946294
- Resultado: 4 SUCCESS, 1 PENDING. No declarar CI completo hasta que termine la prueba de persistencia.
- Nota de reparación durante esta ronda: las ejecuciones intermedias `df0ea91`/`16406ed` mostraron regresiones en tests existentes; la causa se acotó a mezclar los errores estructurales previos y el límite de documento con el nuevo límite de admisión. Se corrigió el mapeo y se ajustó el fixture de presupuesto agregado. El SHA `c105f90` ya pasa el workflow de aceptación integrada, que incluye la regresión de continuidad y recuperación.
- No se modificó el runtime de ejecución ni se autorizó ningún efecto. Los límites de admisión existentes no se han elevado.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — MISIÓN RAMIFICADA Y VARIEDAD DE ADMISIÓN

- Código/prueba: [commit `ed48932f2479f398b11a6f10af55c8821150cc00`](https://github.com/snowdenxrp/aldea-ia/commit/ed48932f2479f398b11a6f10af55c8821150cc00), archivo `tests/nexo/continuity-contract.test.mjs`.
- Añade un segundo fixture independiente: grafo fork/join de cuatro pasos, destinos textuales, estados omitidos con valores predeterminados y campos opcionales `reason`, `source`, `reversible`, `requiresEvidence`. Comprueba que se conserva la topología y los campos admitidos.
- CI observado para el SHA exacto:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868669
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868908
  - STEP 5 outcome classification — IN_PROGRESS al último chequeo: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868876
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837869070
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868724
- Estado de CI al guardar este checkpoint: 4 SUCCESS, 1 IN_PROGRESS; no declarar el conjunto completo aprobado hasta que termine el workflow STEP 5.
- Conclusión acotada: ya hay dos formas de misión aceptada en pruebas de integración (cadena con contexto anidado y grafo ramificado con valores por defecto/campos opcionales). Sigue sin ser evidencia de producción, medición de heap ni garantía de que se admitan todas las misiones legítimas.
- No se modificó runtime, no hubo dispatch ni se habilitaron efectos. Siguiente paso: confirmar el workflow pendiente y después abordar una sola brecha de recursos con evidencia; no inventar cuota de memoria global ni concurrencia multiproceso.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — ADMISIÓN REPRESENTATIVA DE MISIÓN

- Commit de código/prueba: [390d3a39faf802c22c3687102ce675b9362e1381](https://github.com/snowdenxrp/aldea-ia/commit/390d3a39faf802c22c3687102ce675b9362e1381).
- Cambio limitado a `tests/nexo/continuity-contract.test.mjs`: prueba de integración que pasa una misión de 12 pasos con dependencias, targets estructurados y contexto anidado por `recordNexoMissionInSnapshot`; comprueba que los 12 pasos y el contexto sobreviven íntegros.
- CI exacto para SHA `390d3a39faf802c22c3687102ce675b9362e1381`: deterministic persistence tests SUCCESS (https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342109); STEP 4 semantic validation SUCCESS (https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342118); STEP 5 outcome classification SUCCESS (https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342204); integrated acceptance regression SUCCESS (https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342245); bounded mission admission and restart continuity SUCCESS (https://github.com/snowdenxrp/aldea-ia/actions/runs/39837342249).
- Alcance de la evidencia: es una prueba de contrato representativa, no un fixture de producción ni una medición de capacidad de heap. La adecuación general del perfil v1 sigue abierta.
- Siguiente paso: revisar otras formas legítimas de misión ya presentes en los contratos/tests, sin repetir pruebas de frontera. Si no existen fixtures independientes, registrar esa limitación y no inventar una conclusión de capacidad. Después escoger una sola brecha de recursos con alcance claro.
- No se modificó runtime ni se habilitaron efectos. Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# PUERTA DE ENTRADA PARA EL SIGUIENTE CHAT NCS — 2026-10-22

El usuario iniciará el chat escribiendo exactamente `NCS`.

**Instrucción prioritaria:** continuar M0-E desde el contrato compartido de admisión implementado y probado. No reiniciar Step 7/M1 ni reauditar AB/P cerrados. Leer este checkpoint y el diseño enlazado antes de modificar código.

## Último checkpoint — contrato de admisión de misión v1

- Código Core: `src/nexo/core/mission-admission-contract.mjs`; se ejecuta antes de la validación recursiva/clonación en `missionRecord` y en `mission-request-preview`.
- Límites v1: 256 pasos; 64 dependencias por paso; 20,000 nodos; profundidad 32; 256 KiB por cadena/clave; 4 MiB acumulados de cadenas/claves; `intent` de petición 16 KiB; archivos CLI 4 MiB raw bytes.
- Pruebas de frontera en SHA exacto `9f97f61a5517f0b591a677f91607a9ef05696c9e`: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828236600) SUCCESS; [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909056) SUCCESS; [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909080) SUCCESS. Las pruebas cubren exacto y +1 para pasos, dependencias, profundidad, nodos, cadena individual y volumen agregado, además de límites raw bytes de ambos CLI y preservación de estado/no-dispatch.
- Diseño/evidencia: [contrato de admisión](BUILD/NCS_M0_E_MISSION_PREVIEW_ADMISSION_LIMITS_DESIGN_2026-10-22.md); [evidencia de frontera raw bytes](BUILD/NCS_M0_E_MISSION_PREVIEW_BYTE_BOUNDARY_TEST_EVIDENCE_2026-10-22.md).
- Los valores v1 son presupuestos de admisión explícitos, no mediciones de heap ni capacidades de producto validadas. Próximo paso: probar fixtures representativos y revisar que no se rechace trabajo legítimo antes de tratar los valores como estables.
- Heap agregado, concurrencia multiproceso y disco agregado siguen OPEN. No inventar locks/colas. No trasladar el límite histórico de ocho pasos de P112.
- **Workflow separado en FAILURE** en SHA `5485f7d9180918b5dc110dc4d9ed8ffc87569789`: [repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827598938). La prueba `assistants-runtime-cli.test.mjs` espera un efecto persistido mientras `scripts/nexo-runtime-session.mjs` devuelve explícitamente `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. No cambiar el runtime para hacer pasar la prueba; reconciliar test/workflow con la decisión Option A en trabajo separado. Este workflow no se declara PASS.

**Estado canónico:** M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — alcance operativo inicial de recursos (2026-10-22)

- Alcance técnico documentado: invocaciones locales explícitas del CLI bajo directorios de confianza, con límites por entrada/documento/operación; no declarar un servicio persistente ni capacidad multiusuario.
- La restricción de concurrencia multi-proceso es alcance declarado, **no enforcement**: no se ha probado un guardián global que impida varios CLI simultáneos ni un presupuesto compartido entre procesos.
- Se mantienen OPEN el presupuesto agregado de heap/disco y la capacidad multi-proceso. No introducir un lock, contador, semáforo o wrapper global improvisado.
- Nota: [NCS_M0_E_INITIAL_OPERATIONAL_SCOPE_2026-10-22.md](BUILD/NCS_M0_E_INITIAL_OPERATIONAL_SCOPE_2026-10-22.md).
- **SUPERADO por el checkpoint posterior de admission control v1 más abajo:** la decisión de perfil ya fue aceptada y el contrato compartido/lectura de 4 MiB están implementados y probados. No volver a solicitar esa decisión ni tratar este paso histórico como pendiente. Ver handoff actual: [NCS_M0_E_NEXT_CHAT_HANDOFF_2026-10-22.md](BUILD/NCS_M0_E_NEXT_CHAT_HANDOFF_2026-10-22.md).
- Estado canónico sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---
---

# M0-E — presupuesto de recursos: perfil aceptado, enforcement inicial verificado (2026-10-22)

- **Decisión del propietario registrada:** acepta el perfil numérico inicial como base de implementación. Ver `NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md`.
- **Implementación inicial presente:** `src/nexo/core/resource-limits.mjs`, `src/nexo/core/continuity-store.mjs`, `src/nexo/core/chronicle-store.mjs`, `src/nexo/application/chronicle-append.mjs` y `scripts/nexo-chronicle-session.mjs`.
- **Enforcement:** lectura acotada de bytes crudos antes de decodificar/parsear; límite UTF-8 de entrada antes de admisión de misión; límites de cardinalidad y tamaño serializado antes de escribir; rechazo sin truncamiento ni purga. El rechazo por capacidad conocida se mantiene distinto de un resultado ambiguo de persistencia.
- **Regresión de fronteras:** stdin exacto/sobre límite; contenido Chronicle UTF-8 bajo/exacto/sobre límite incluyendo exceso de exactamente un byte; archivos preexistentes Chronicle/Continuity sobre límite; máximos inclusivos por colección; documentos serializados por debajo/encima de los topes; dos appends Chronicle concurrentes en la frontera del tamaño serializado.
- **Evidencia CI del SHA de código/pruebas `7ce3e5174e26917ecde9edeafa50b3d64d4fa10b`:** [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528919) SUCCESS; [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528889) SUCCESS; [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784529019) SUCCESS; [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528925) SUCCESS; [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784528971) SUCCESS; [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39784529075) SUCCESS. Todos apuntan al mismo SHA.
- **Pruebas de store real presentes:** `tests/nexo/continuity-store.test.mjs` rechaza un snapshot estructuralmente válido cuyo envelope supera 16 MiB antes de crear el lock y conserva el archivo anterior byte por byte con revisión 0. La prueba de dos candidatos cercanos al límite contra la misma revisión confirma un solo commit y un conflicto; ahora también compara el resultado confirmado con la revisión/snapshot recargados y verifica que los bytes crudos persistidos sean exactamente el envelope canónico.
- **CI exacta para el cambio de prueba** `20b3e1b51616c93862a2cad2e502c143c35b77ef`: [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971051) SUCCESS; [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971089) SUCCESS; [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971053) SUCCESS; [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971086) SUCCESS; [bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971113) SUCCESS. Son cinco workflows disparados por este cambio, todos con el mismo SHA; no afirmar que los seis workflows posibles corrieron en este SHA.
- El presupuesto agregado de disco/heap no se ha definido ni probado y sigue OPEN. Las pruebas de concurrencia actuales prueban el contrato de revisión/commit de un store, no una cuota global entre procesos o stores.
- Estado canónico sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## M0-E — planificación de misión y validación de borradores (2026-10-22)

- Capacidad previa conservada: `loadNexoMissionPlan` y CLI `mission-plan --continuity <ruta> --mission <id>` proyectan dependencias desde una sola revisión canónica, sin payloads privados, escritura ni dispatch.
- Capacidad nueva: `previewNexoMissionDraft(continuityPath, missionDraft)`, expuesta en la API pública y por el CLI `mission-draft-preview --continuity <ruta> --draft <archivo.json>`. El archivo usa la forma de misión ya existente; no se introdujo un segundo esquema de misión.
- La vista previa valida la propuesta reutilizando `recordNexoMissionInSnapshot` y las invariantes canónicas. Construye un snapshot candidato en memoria, rechaza un `missionId` ya ligado, y produce un orden topológico determinista según `dependsOn`. No persiste la propuesta ni despacha pasos.
- La salida solo contiene `stepId`, `action` y `dependsOn`; omite `target/context`. Mantiene `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `persisted: false`. JSON inválido/archivo ausente y propuestas inválidas fallan cerrados.
- Casos de prueba: borrador válido con pasos fuera de orden (se ordena según dependencias), ciclo inválido, colisión con ID existente, ocultación de payloads privados y bytes de Continuity idénticos antes/después.
- CI para el HEAD de código `539fe0b1c8145eb63680a4fa944cfdf960b38af1`: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857071) SUCCESS; [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857067) SUCCESS; [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857092) SUCCESS; [canonical mission status projection](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857208) SUCCESS. Cada ejecución apunta al mismo SHA.
- En el primer commit de integración, el test de API pública falló porque la nueva exportación todavía no se había añadido a la lista esperada del test; se corrigió el test y el siguiente SHA pasó los workflows anteriores. No se ocultó ni se suprimió el fallo.
- Opción A sigue aceptada como alcance inicial de M0-E. Esto añade capacidad de planificación/validación, no un planner autónomo ni generación semántica desde lenguaje natural, ni raíz constitucional ni efectos protegidos.
- Siguiente paso: definir una frontera explícita entre la interpretación de una petición y la producción de un borrador de misión. Antes de conectar un modelo, fijar qué entradas son datos no confiables, cómo se valida objetivo/evidencia y cómo se evita que el modelo elija acciones no admitidas. Reutilizar el contrato actual y mantener esta capacidad como vista previa sin persistencia.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — frontera de autoridad del owner-backed runtime (2026-10-21)

- Nuevo análisis de código: [NCS_M0_E_OWNER_BACKED_RUNTIME_AUTHORITY_BOUNDARY_FINDING_2026-10-21.md](BUILD/NCS_M0_E_OWNER_BACKED_RUNTIME_AUTHORITY_BOUNDARY_FINDING_2026-10-21.md), commit `db08ac35f2bb31b071da8c3dca550dd67ae579b0`.
- Hallazgo principal: el owner-backed runtime restringe acciones por allowlist y rechaza reparaciones/acciones no admitidas antes de dispatch; esto no demuestra que evalúe raíz constitucional, Constitución vigente y Policy/contexto. Su `owner` es el propietario técnico de persistencia/continuidad, no prueba de legitimidad humana.
- `executeProtectedTransition` sí consulta un `authorityGate` inyectado, pero su resultado `AUTHORIZED` no tiene procedencia legítima demostrada; además, `conditionalCommit.commit` no se ha probado como sink real ni se ha demostrado que gobierne Lúmina.
- La ruta legacy de simulación puede mutar el objeto de simulación; se reutilizan AB104.150/P112 para el caller de producción no encontrado, sin repetir la auditoría ni declarar inalcanzabilidad total.
- No se declara vulnerabilidad de producción ni se cambia runtime. Siguiente: decidir scope, trazar entradas → sink por cada efecto incluido, y probar dispatch cero para todos los estados negativos.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — reconciliación de decisiones y opciones de scope (2026-10-21)

- Corrección documental: el registro canónico ahora es coherente con la decisión del propietario: puntos 1–7 **ACEPTADOS COMO BASE DEL BORRADOR**, no aprobación constitucional completa. Commit del registro: `54f7c69fbc740882d19b9c66dce7003118e6b6df`; la guía de revisión se sincronizó en `f3582f3090b2e1042b698d88892a8f2d744b27e4`.
- Propuesta nueva, aún no aceptada: [NCS_M0_E_INITIAL_SCOPE_OPTIONS_FOR_OWNER_2026-10-21.md](BUILD/NCS_M0_E_INITIAL_SCOPE_OPTIONS_FOR_OWNER_2026-10-21.md), commit `2584958a6de3e2d50026019ac4f44f5a17b2a600`. Compara (A) arranque sin efectos protegidos, (B) un efecto local acotado y (C) efectos de simulación Lúmina; recomienda A solo como postura provisional fail-closed, no como decisión constitucional inferida.
- Reutilizar los informes históricos AB104.150/P112: no se encontró caller de producción que invoque `executeLuminaNexoStep()` y proporcione callback de persistencia canónica. No repetir esa auditoría sin cambio de código; la ausencia de caller hallado no prueba que todas las rutas alternativas sean inalcanzables.
- Scope exacto sigue OPEN. No implementar raíz/verificador ni habilitar handlers antes de la decisión explícita y el enforcement verificable.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — reconciliación de scope y fronteras (2026-10-21)

- Informe nuevo: [NCS_M0_E_SCOPE_AND_EXECUTION_BOUNDARY_RECONCILIATION_2026-10-21.md](BUILD/NCS_M0_E_SCOPE_AND_EXECUTION_BOUNDARY_RECONCILIATION_2026-10-21.md), commit `dcc35c1c3e9a04af753b54c466be9f471ad9504a`.
- Aclara una dependencia que no debe resolverse por inferencia: la decisión arquitectónica de una raíz/un dispositivo no selecciona el scope de efectos protegidos. El borrador sigue marcando el scope exacto como OPEN; aceptar los puntos 1–7 como base no lo aprueba definitivamente.
- Owner-backed runtime: bloquea repair y otras acciones antes de PREPARED/dispatch; `chronicle_append` es persistencia local y la respuesta conserva `authorization: NOT_EVALUATED`. No equivale a efecto externo autorizado.
- Core protected-transition usa `authorityGate` inyectado y puede llamar `conditionalCommit.commit`; no se demostró que ese commit sea el sink externo, y el camino no llama `effectBoundary.prepare`.
- Legacy/simulation adapter contiene handlers que mutan la simulación; no se demuestra alcance constitucional ni reachability de producción. Próximo paso: mapear callers y proponer scope mínimo explícito para decisión del propietario; sin esa definición, no crear tests que asuman un sink arbitrario.
- No se cambió runtime ni se ha declarado CI para el informe nuevo. Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — CI del checkpoint de documentación y plan (2026-10-21)

- HEAD del checkpoint verificado antes de este registro: `a53fc8801f2558d63d0ef7b8af50e162b91ad70b`.
- Workflow determinista [39684885160](https://github.com/snowdenxrp/aldea-ia/actions/runs/39684885160), job [tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39684885160/job/119516324277): `completed / success`; paso `Run tests`: SUCCESS. Ejecutó el `npm test` configurado en ese SHA, incluidos los tests Nexo enumerados en `package.json`.
- Alcance: valida el checkpoint citado, no demuestra raíz legítima, aprobación constitucional exacta, ausencia de todas las rutas alternativas ni cierre M0-E. Los commits posteriores requieren verificación por su propio SHA.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---
