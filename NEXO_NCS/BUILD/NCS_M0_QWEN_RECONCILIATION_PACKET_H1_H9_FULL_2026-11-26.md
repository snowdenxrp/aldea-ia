# NCS M0 — Paquete autocontenido para Qwen: reconciliación H1–H9

Fecha: 2026-11-26
Repositorio: `snowdenxrp/aldea-ia`
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot estático de producto: `d8b5ca8720908d926acc18130614cce132a43b5d`

## 0. Instrucción operativa

Este expediente contiene el payload íntegro. No necesitas acceder a GitHub, clonar repositorios ni buscar archivos externos. Basa el análisis exclusivamente en los textos incluidos y en las referencias de blobs que contienen. No inventes evidencia que no esté reproducida aquí.

Tu misión es completar la reconciliación adversarial H1–H9 de Claude contra los contratos reales A1–A5 y B1–B6, las obligaciones O1–O9 y el estado R1/P09/P05/P07-C. No repitas la auditoría general del repositorio ni vuelvas a formular K1–K7/CE-1–CE-9 de forma abstracta: aplícalos solo cuando el texto fuente permita hacerlo.

## 1. Reglas de evidencia y clasificación

Para cada H1–H9:
- Separa (a) hecho textual/estático confirmado en el expediente, (b) reproducción dinámica reportada por Claude pero no repetida aquí, (c) inferencia lógica, (d) supuesto ambiental requerido.
- No eleves una reproducción reportada por Claude a reproducción independiente de Qwen.
- Cita documento, sección, fuente/blob y cláusula contractual concreta.
- Distingue contradicción del contrato, incumplimiento del código, gap de especificación, riesgo condicionado y UNKNOWN.
- Usa CONTRADICTED solo si una ejecución admisible bajo los supuestos declarados viola una obligación contractual realmente aplicable. Si depende de un supuesto ambiental no declarado, clasifica PARCIAL/GAP o UNKNOWN según el caso.
- Una contradicción de una API o propiedad general no demuestra que un actor esté activo en el despliegue R1 si falta el caller/grafo.
- No conviertas UNKNOWN en riesgo probado ni una búsqueda vacía en exclusión positiva.

Usa estas clases explícitas:
- CONFIRMED-STATIC: la capacidad/propiedad se desprende del código citado en el informe, sin reproducción independiente aquí.
- REPORTED-REPRODUCTION: Claude informa una reproducción; no repetida por Qwen.
- CONTRADICTED: contradicción lógica demostrada respecto de una cláusula y alcance aplicables.
- PARTIAL/GAP: riesgo o insuficiencia condicionado a una hipótesis no declarada o una parte no cubierta.
- UNKNOWN: evidencia, alcance o cuantificador insuficiente.
- OUTSIDE-R1: fuera del entorno R1 aceptado; no implica que sea irrelevante para otros claims.

No uses las etiquetas H1–H8 de tu informe previo para los hallazgos de Claude. Son numeraciones independientes.

## 2. Preguntas concretas que debes resolver

A. H1 RAW-1:
1. ¿Qué demuestra exactamente la combinación de alias de `NEXO_LUMINA_MEMORY_PATH` y `fs.writeFile`?
2. ¿Qué condición hace que O7 sea CONTRADICTED y qué condición lo deja UNKNOWN/STOP?
3. ¿Qué demuestra y qué no demuestra el UNSET observado en el shell Termux?
4. ¿P09 está implicado o se trata de actor no-Nexo relevante solo para O7?

B. H2 RAW-2:
1. Separar fail-open en API (`loadState` → revisión 0) de exposición efectiva de producción.
2. ¿Qué cláusula de B3/O5 se contradice a nivel de propiedad general?
3. ¿Qué evidencia falta para convertirlo en escritor incluido en O7 del despliegue?

C. H3 workflow:
1. Clasificarlo como actor que escribe repositorio fuera de R1.
2. ¿Hay evidencia de escritura directa o indirecta del objeto Continuity? No inferirla de git add.
3. ¿Qué exclusión documental mínima debe registrarse sin sobredimensionar el hallazgo?

D. H4 Chronicle:
1. Distinguir entrypoint omitido, rechazo de esquema, colisión potencial de lock/temp y overwrite no demostrado.
2. ¿Qué se puede clasificar como confirmado, parcial o UNKNOWN?
3. ¿Qué parte entra en O7 y qué parte depende de la definición autoritativa del objeto protegido?

E. H5 paths confiables/symlink:
1. ¿Es un defecto contractual, una limitación expresamente no reclamada o un supuesto de confianza?
2. ¿Qué cláusula mínima o declaración de alcance sería necesaria sin imponer resistencia a symlink si no está en el claim?

F. H6 lectura con lock:
1. ¿Qué mutaciones de namespace se describen?
2. ¿Cuándo cuenta como actor que afecta el objeto protegido y cuándo es solo efecto auxiliar?
3. ¿Qué depende de definir si locks/auxiliares forman parte del activo protegido?

G. H7 cleanup por prefijo:
1. Distinguir patrón estático de limpieza del contraejemplo de colisión/sustitución.
2. ¿Qué demuestra B2/O4 y qué permanece condicionado?
3. No declarar explotación efectiva sin evidencia de temporal ajeno alcanzable.

H. H8 inventario env:
1. Tratar el barrido de Claude como reporte pendiente de corroboración, no como verdad universal.
2. No inferir que `NEXO_CONTINUITY_PATH` no existe fuera del rango buscado.
3. Proponer solo la corrección documental mínima del inventario.

I. H9 exclusiones:
1. Determinar el valor probatorio de MainActivity/model.gguf.
2. Mantener la búsqueda vacía de `functions/api/capture.js` como UNKNOWN.
3. Definir el límite de la exclusión positiva.

## 3. Reconciliación conjunta obligatoria

Después de clasificar H1–H9 individualmente:
1. Construye una matriz H1–H9 × O1–O9 / P09 / A1–A5 / B1–B6. Usa “sin impacto demostrado” cuando corresponda; no fuerces vínculos.
2. Comprueba consistencia conjunta: las correcciones documentales propuestas no deben contradecirse entre sí ni alterar cuantificadores o alcance silenciosamente.
3. Identifica qué preguntas necesitan decisión del propietario, cuáles son documentales y cuáles requieren evidencia adicional del snapshot.
4. Recomienda correcciones mínimas documentales, numeradas y trazables. No reescribas ni ratifiques por cuenta propia.
5. No propongas primitiva, implementación, pruebas, comandos Termux, cambios de código/configuración/workflows, CI, bootstrap, commissioning ni efectos protegidos.
6. No reabras C3/G2. Para coherencia, usa únicamente el alcance registrado abajo; si necesitas el texto ratificado íntegro para un juicio más amplio, decláralo UNKNOWN y no lo reconstruyas.

## 4. Alcance y decisiones vigentes que no deben reinterpretarse

- R1 aceptado por el propietario: Android sandbox + HOME privado de Termux + operación manual en foreground.
- R1 excluye root, sistema operativo y procesos hostiles con el mismo UID. Escritores, servicios, jobs y addons adicionales dentro del alcance deben quedar excluidos expresamente o mantener UNKNOWN/STOP.
- P09: claim sobre callers/consumidores Nexo que atraviesan admisión.
- O7: claim distinto, sobre todos los actores capaces de afectar el objeto protegido, incluidos no-Nexo/RAW.
- P05-C: política ratificada; P05 sigue OPEN.
- P07-C: UNKNOWN/BLOCKING.
- O7/P09: UNKNOWN/OPEN como línea base documental, con la salvedad de que el informe Claude propone CONTRADICTED para el claim amplio que incluye RAW-1 sin enforcement/exclusión.
- O8 UNKNOWN; O9 PARTIAL.
- C3/G2: decisión del propietario resuelta. Regla disponible en los documentos: el oráculo debe clasificar el rol del inode antes de interpretar cambios de `nlink`. No reabrir ni ampliar esta regla.
- `authorization: NOT_EVALUATED`; commissioning y efectos protegidos STOP.
- M0 INCOMPLETO.
- PR #110 no se toca.

## 5. Snapshot y referencias

Todos los documentos siguientes fueron recuperados directamente de la rama documental indicada. SHA de blob:
- Frontera Termux: `864296afb12a10642799a010ef7d7378f0d7c2cd`
- Contratos A/B: `43f83749350705c1e1cfc698032652b27228acf4`
- Informe Claude H1–H9: `fcb9d0e1c816a5a0e5574aae642d00eab9e9aab7`
- Informe Qwen previo (acceso limitado): `a8f9da9e15723cf6c062ee19bed3a76dda832a9d`

La evidencia dinámica H1/H2/H4 es atribuida a Claude. El paquete no incluye scratchpad ni logs de esas reproducciones. El código fuente se identifica por blob SHA dentro del informe Claude; no se debe afirmar que Qwen lo ha inspeccionado directamente.

---

# DOCUMENTO 1 — FRONTERA P05/P07 POST-TERMUX (TEXTO ÍNTEGRO)

# NCS M0 — Frontera de exclusión de escritores tras evidencia Termux

Fecha: 2026-11-26  
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
Snapshot estático de producto: `d8b5ca8720908d926acc18130614cce132a43b5d`  
Tipo: delta de clasificación y siguiente frontera; no implementa, no selecciona mecanismo y no autoriza pruebas.

## 1. Pregunta que resuelve esta unidad

Determinar qué cambia realmente en O7/P09 y en la premisa de exclusión de escritores después de las tres transcripciones Termux del 2026-11-26, sin repetir el inventario ni convertir una captura puntual en una afirmación universal.

## 2. Distinción que debe conservarse: caller Nexo vs. escritor capaz de aliasar el store

No todos los procesos capaces de afectar un archivo de Continuity necesitan importar código Nexo.

En el snapshot `d8b5ca8`:

- `scripts/assistants.mjs` es una raíz Lúmina, no un caller Nexo en el grafo estático de P09.
- Aun así, `NEXO_LUMINA_MEMORY_PATH` puede dirigir su `fs.writeFile()` al path del store de Continuity; no existe una validación que prohíba ese alias.
- `NEXO_STATE_PATH` puede dirigir la persistencia de world-state a un path elegido por entorno; el escritor `persistState()` usa un lock independiente y `rename()`, no la admisión canónica de Continuity.
- `scripts/simulate.mjs` expone `persistState(statePath,...)`, que acepta un path suministrado por caller; su CLI normal usa el path predeterminado de world-state.
- `package.json` declara `assistants`, `simulate` y `nexo:continuity:bootstrap`. La búsqueda Termux de referencias solo incluyó los nombres `assistants.mjs|simulate.mjs`, por lo que no era una enumeración exhaustiva de comandos del paquete. El bootstrap ya está clasificado en el inventario estático como entrypoint dedicado de Continuity.

**Consecuencia:** P09 (grafo de callers Nexo) y O7 (cobertura de todos los escritores que pueden afectar el objeto protegido) son claims relacionados, pero no idénticos. Un proceso Lúmina puede estar fuera del grafo Nexo y aun así ser relevante para O7 si su configuración le permite escribir sobre el mismo objeto/ruta.

## 3. Qué añade la evidencia Termux

### Observaciones limitadas al shell capturado

1. `NEXO_STATE_PATH` y `NEXO_LUMINA_MEMORY_PATH` aparecieron como UNSET.
2. La consulta de procesos no imprimió coincidencias para el patrón Node/Nexo/assistants/simulate empleado.
3. La búsqueda de configuración inspeccionó los targets explícitos del transcript y encontró las lecturas de variables en `assistants.mjs`; no encontró coincidencias en los tres targets cuyos encabezados sin resultados sí se imprimieron.
4. La búsqueda de referencias a `assistants.mjs|simulate.mjs` no mostró coincidencias bajo `$HOME/.shortcuts` ni `$HOME/bin`; sí mostró las dos entradas correspondientes en `package.json`.

Estas observaciones reducen la evidencia de que el alias RAW estuviera configurado o que uno de esos procesos estuviera activo en ese instante. No prueban que las variables estén ausentes de todo contexto de lanzamiento, que no existan otros invocadores ni que no pueda aparecer un escritor durante otra ventana.

### Efecto clasificatorio

| Cuestión | Resultado tras Termux |
|---|---|
| RAW-1 existe como capacidad estática | **CONFIRMADO** |
| RAW-1 estaba configurado en el shell capturado | **NO OBSERVADO; variable UNSET** |
| RAW-2 existe como capacidad estática | **CONFIRMADO** |
| RAW-2 estaba configurado en el shell capturado | **NO OBSERVADO; variable UNSET** |
| Procesos coincidentes activos en la consulta | **NINGUNO OBSERVADO** |
| Ausencia de otros launchers/servicios/consumidores | **NO DEMOSTRADA** |
| Checkout local idéntico al SHA remoto | **UNKNOWN** |
| Exclusividad global de escritores | **UNKNOWN** |

No se elimina RAW-1/RAW-2 del inventario: son rutas condicionales reales en el código. Tampoco se clasifican como alias activo: la evidencia del shell no lo respalda.

## 4. Garantías que no deben confundirse

La exclusión global requiere, como mínimo, tres capas independientes:

1. **Cobertura de actores (O7/P09):** enumerar y acotar quién puede invocar una ruta de escritura, incluidas APIs importables, scripts locales, launchers, tareas y consumidores externos dentro del claim.
2. **Convergencia de rutas (P07-A/B):** demostrar que todos los escritores relevantes apuntan al mismo objeto protegido y que no existe alias/path alternativo no controlado. Las variables UNSET en una captura no sustituyen esta garantía.
3. **Enforcement (P07-C/P05):** demostrar que cada actor cubierto no puede eludir la admisión, que release/cleanup no afecta objetos sustitutos y que UNKNOWN/BLOCKED sobrevive al crash según P05-C.

Un inventario de procesos es observación, no enforcement. Un lock cooperativo solo coordina a quienes lo usan. Un path canónico no obliga a un escritor RAW a usar ese lock. Una cuarentena durable tampoco resuelve por sí sola la cobertura si existen escritores que pueden ignorarla.

## 5. Estado de obligaciones

- **O1:** GAP — no se demuestra BLOCKED durable después de terminar el dueño.
- **O2:** CONTRADICTED-CODE/GAP — el código inspeccionado contiene predicados PID/edad en rutas de lock y no existe cobertura completa del requisito.
- **O3:** escenarios definidos, pero identidad del target real UNKNOWN.
- **O4:** CONTRADICTED-CODE/GAP — validación token y cleanup posterior por nombre no vinculan atómicamente el objeto comprobado con el eliminado.
- **O5:** CONTRADICTED-CODE/GAP — ausencia/ENOENT puede permitir reintento/readmisión en los seams descritos; no hay cuarentena durable probada.
- **O6:** GAP — no existe procedimiento aprobado de reclasificación.
- **O7:** UNKNOWN — la captura acota el estado de un shell, pero no cierra writers externos, launchers futuros ni alias por configuración indirecta.
- **O8:** UNKNOWN — R1 está aceptado como límite, pero no hay fingerprint reproducible del target ligado al SHA ni evidencia completa de actores/permisos.
- **O9:** PARTIAL — separación de persistencia/release observada en rutas concretas; readmisión sigue sin resolver.
- **C3/G2:** DECISIÓN DEL PROPIETARIO RESUELTA; el oráculo debe clasificar el rol del inode antes de interpretar cambios de `nlink`. No reabrir como decisión pendiente.

## 6. Frontera mínima de trabajo siguiente

No se justifica otra ronda genérica de Termux. Tampoco hay base para elegir o implementar una primitiva.

El siguiente trabajo debe permanecer en dos entregables documentales acotados:

**A. Contrato de cobertura O7:** definir explícitamente qué significa “todo escritor cubierto” para el objeto protegido: rutas de código, scripts/entrypoints del despliegue R1, paths/aliases permitidos, procesos concurrentes, consumidores externos y evidencia necesaria para excluirlos. Cuando no sea posible acotar un actor, el claim universal permanece UNKNOWN/STOP.

**B. Contrato de enforcement P07-C/P05:** exigir que cualquier candidato futuro demuestre conjuntamente:
- identidad del objeto coordinador y del objeto protegido;
- operación real de release/cleanup que no pueda afectar un sustituto;
- estado BLOCKED independiente del proceso y observable por nueva invocación;
- no readmisión ante ausencia, sustitución, ilegibilidad o crash;
- procedimiento de reclasificación aprobado;
- cobertura de todos los writers incluidos en el claim.

Estos contratos deben evaluarse contra O1–O9 y C3 ya ratificado. No crear marcadores, locks hermanos, tombstones, epochs, daemons o journals por iniciativa técnica: cualquier mecanismo nuevo sigue sujeto a decisión/autoridad y autorización.

## 7. Estado de salida

- Evidencia Termux: **PRESERVED / VERIFIED**.
- RAW-1/RAW-2: **STATIC CONDITIONAL WRITERS; NO ALIAS OBSERVED IN CAPTURED SHELL**.
- O7/P09: **UNKNOWN / OPEN**.
- O8: **UNKNOWN**.
- P05-C: **RATIFICADA COMO POLÍTICA**; P05 **OPEN**.
- P07-C: **UNKNOWN / BLOCKING**.
- C3: **RESUELTO**; cobertura del oráculo por rol aún requiere aplicación documental/validación futura.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`; commissioning y efectos protegidos: **STOP**.

No hubo cambios de código, configuración, dispositivo, tests, CI, workflows, bootstrap, publicación ni efectos protegidos. PR #110 y ramas de producto no se modificaron.


---

# DOCUMENTO 2 — CONTRATOS O7/P07-C/P05 A1–A5 Y B1–B6 (TEXTO ÍNTEGRO)

# NCS M0 — Contratos documentales O7 y P07-C/P05: cobertura y enforcement

Fecha: 2026-11-26  
Rama: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
Base documental: `NCS_M0_P05_P07_WRITER_EXCLUSION_FRONTIER_AFTER_TERMUX_2026-11-26.md` (blob `864296afb12a10642799a010ef7d7378f0d7c2cd`; commit reportado `66cc890f2eef2e5f7ab0c103838e6199bd8015a3`).  
Tipo: contrato de aceptación propuesto; no es implementación, decisión de primitiva, ratificación del propietario ni autorización de pruebas.

## 0. Propósito y límites

Convertir la frontera identificada tras Termux en dos contratos verificables y no intercambiables:

- **Contrato A — O7/P09:** cobertura de actores y escritores dentro de un claim de despliegue explícitamente acotado.
- **Contrato B — P07-C/P05:** enforcement, identidad del objeto, cleanup replacement-safe y bloqueo durable ante crash.

Este documento no selecciona `flock`, `fcntl`, OFD locks, marcadores, tombstones, epochs, daemons, journals ni otra primitiva. No autoriza cambios de código, configuración, bootstrap, tests, CI, ejecución en dispositivo, publicación ni efectos protegidos.

## 1. Modelo de claims: separar lo que se demuestra

| Claim | Objeto de prueba | No demuestra por sí solo |
|---|---|---|
| P09 | Todos los callers/consumidores Nexo incluidos en el alcance atraviesan la admisión requerida | Que no existan escritores no-Nexo o escritores RAW |
| O7 | Todos los actores capaces de afectar el objeto protegido están cubiertos o excluidos con evidencia suficiente | Que el mecanismo de exclusión resista crash o cleanup sobre sustitutos |
| P07-A/B | Las rutas cubiertas convergen en el objeto protegido y su identidad se mantiene verificable | Que todos los actores usen esas rutas |
| P07-C | El protocolo de coordinación y su recuperación no permiten readmisión insegura ni cleanup de otro objeto | Que el universo de escritores esté completo |
| P05 | La política de exclusión y estado bloqueado tiene enforcement demostrable | Que una política documental esté implementada |

**Regla:** ninguna evidencia de P09 puede elevar O7 automáticamente. Ninguna evidencia de enforcement puede cerrar O7 si la enumeración de actores sigue incompleta. Ninguna captura puntual del shell prueba ausencia global de actores.

## 2. Contrato A — Cobertura O7/P09

### A1. Declaración obligatoria del alcance

Toda afirmación de cobertura debe declarar antes de evaluarse:

1. **Entorno:** el límite R1 aceptado: Android sandbox, HOME privado de Termux y operación manual en foreground.
2. **Activos:** identidad lógica y ubicación/ruta del store protegido; archivos auxiliares que puedan cambiar admisión, coordinación o recuperación.
3. **Ventana:** cuándo aplica la afirmación (sesión, arranque, ejecución o intervalo definido).
4. **Actores incluidos:** procesos, módulos, APIs, scripts, launchers, tareas, servicios y consumidores que puedan escribir, renombrar, truncar, reemplazar, borrar o alterar permisos/estado relevante.
5. **Exclusiones:** clases fuera del claim, con justificación y evidencia; nunca por mera ausencia en una búsqueda parcial.

El claim R1 no se extiende implícitamente a root, sistema operativo ni procesos hostiles con el mismo UID. Cualquier escritor, servicio, job, addon o actor adicional no excluido expresamente dentro del alcance mantiene el resultado en UNKNOWN/STOP.

### A2. Inventario mínimo de actores y capacidades

El inventario debe mantener filas independientes para:

- Callers Nexo que importan o invocan APIs de Continuity.
- Entry points Nexo dedicados, incluido bootstrap y comandos declarados en package scripts.
- Procesos Lúmina u otros no-Nexo que puedan recibir paths por configuración o argumentos.
- Funciones de persistencia que acepten paths suministrados por caller.
- Launchers de shell, accesos directos, perfiles, scripts locales y comandos de paquete.
- Tareas programadas, servicios, procesos persistentes, jobs y ejecuciones en segundo plano dentro del alcance.
- Addons, plugins, integraciones y consumidores externos habilitados en el despliegue.
- Operaciones indirectas que puedan modificar el objeto: symlink/hardlink cuando aplique, rename, unlink, truncado, reemplazo, cambio de permisos o modificación del directorio padre.

Para cada fila registrar: actor/entrypoint, origen de invocación, capacidad exacta, path/alias de entrada, objeto que puede alcanzar, mecanismo de admisión usado (o ausencia), evidencia, alcance temporal y clasificación.

### A3. Paths y aliases

- Toda variable de entorno, argumento, configuración o API que permita elegir un path debe tratarse como una capacidad de alias hasta que exista una restricción demostrada.
- `UNSET` en un shell capturado significa únicamente “no configurada en ese entorno y momento”.
- No equivale a “imposible de configurar”, “no heredada por otro launcher” ni “ausente de todos los procesos”.
- Un path predeterminado no demuestra que todos los callers usen ese path.
- Una búsqueda por nombres de dos scripts no constituye inventario exhaustivo de launchers ni de scripts de paquete.
- Si un actor puede escribir al mismo objeto por una ruta RAW, debe contarse en O7 aunque no importe código Nexo y no aparezca en P09.

### A4. Evidencia necesaria para incluir o excluir

**Para incluir un actor:** evidencia de la ruta de invocación y de su capacidad de escritura o mutación del objeto protegido, estática o dinámica según el claim.

**Para excluir un actor:** evidencia positiva de que, dentro del alcance declarado, carece de capacidad efectiva para alcanzar o mutar el objeto. La ausencia de coincidencias en una búsqueda, una variable UNSET o la ausencia de un proceso durante una captura no bastan por separado.

**Para afirmar cobertura universal dentro de R1:** inventario reproducible de entrypoints, launchers, configuración heredable, tareas/servicios activos o habilitables y APIs expuestas; límites explícitos del entorno; y demostración de que todo actor incluido converge en enforcement o está efectivamente impedido de alcanzar el objeto.

Si no puede acotarse el universo de actores del despliegue, el claim universal O7 permanece UNKNOWN/STOP. No sustituir “todos los escritores” por “todos los escritores que encontramos”.

### A5. Criterios de salida O7

- **CLOSED:** alcance R1 explícito; inventario de actores reproducible y completo respecto de ese alcance; aliases y rutas RAW controlados o excluidos con evidencia; todo escritor incluido sujeto a enforcement común; ningún actor relevante sin clasificación.
- **PARTIAL:** solo una parte del inventario o de las rutas está demostrada. Debe nombrarse la frontera pendiente; no implica cierre.
- **UNKNOWN/STOP:** alcance o universo de actores no acotado, alias indirecto sin resolver, launcher/servicio/job/addon no clasificado o evidencia insuficiente para excluir.
- **CONTRADICTED:** evidencia positiva de un escritor relevante capaz de afectar el objeto sin enforcement requerido.

P09 se evalúa en paralelo y por separado con su propio grafo de callers. El cierre de P09 no cambia el estado O7 sin satisfacer A1–A5.

## 3. Contrato B — P07-C/P05: enforcement y estado durable

Todo candidato futuro debe demostrar todas las propiedades siguientes, no solo describirlas.

### B1. Identidad del objeto coordinador y del objeto protegido

- Identificar por separado el objeto de coordinación y el objeto de datos protegido.
- Demostrar qué identidad se verifica en adquisición, uso, liberación y recuperación.
- Vincular la verificación con el objeto realmente operado, no solo con un nombre de path o token.
- Definir el comportamiento ante ausencia, sustitución, renombrado, symlink/hardlink, cambio de inode, directorio padre sustituido e ilegibilidad, según los casos aplicables al modelo R1.
- Aplicar el oráculo C3 ya ratificado: clasificar el rol del inode antes de interpretar cambios de `nlink`. C3 no se reabre como decisión pendiente.

### B2. Cleanup/release replacement-safe

- Identificar el objeto exacto sobre el que actúa el cleanup.
- Demostrar que la operación de eliminación/liberación no puede actuar sobre un sustituto creado entre comprobación y operación.
- Definir el resultado ante mismatch de identidad, desaparición, permisos insuficientes, error parcial y crash.
- No aceptar como prueba suficiente una validación previa por nombre seguida de unlink/rename por nombre sin vínculo atómico demostrado entre objeto validado y objeto afectado.
- Si la seguridad depende de cooperación, declarar qué actores cooperan y resolver la cobertura de todos ellos en O7.

### B3. BLOCKED durable e independiente del proceso

- Un fallo que comprometa la integridad de coordinación debe dejar un estado bloqueado que sobreviva a la terminación del proceso dueño.
- Una nueva invocación debe poder observar ese estado y rechazar la readmisión antes de cualquier operación protegida.
- La ausencia/ENOENT, sustitución, corrupción, ilegibilidad o estado ambiguo no pueden interpretarse como autorización para reintentar o readmitir.
- El estado no puede depender exclusivamente de memoria del proceso, PID vivo, antigüedad de archivo o existencia de un lock efímero.
- Deben definirse persistencia, orden de operaciones, crash windows y condiciones exactas de observabilidad; no basta afirmar “durable”.

### B4. Recuperación y reclasificación

- No hay recuperación automática por mera expiración, desaparición del dueño o ausencia de lock.
- Debe existir procedimiento de reclasificación aprobado que determine qué evidencia permite pasar de UNKNOWN/BLOCKED a un estado operativo.
- El procedimiento debe distinguir fallos recuperables, evidencia insuficiente y contradicción de identidad.
- La autoridad para reclasificar no nace de un addon, caller, lock, proceso o mecanismo técnico.
- Hasta que el procedimiento esté definido y autorizado, la salida ante ambigüedad es UNKNOWN/STOP.

### B5. Crash consistency

El candidato debe enumerar las operaciones persistentes y analizar los puntos de crash entre cada par de pasos relevantes, incluyendo como mínimo: creación/adquisición, escritura, sincronización, publicación/rename, release/cleanup, persistencia del estado bloqueado y nueva admisión.

Para cada ventana debe indicar:
- estado durable posible tras reinicio/nueva invocación;
- identidad del objeto que puede observarse;
- si readmisión queda permitida o denegada;
- si cleanup puede afectar un sustituto;
- evidencia que respalda la conclusión.

No se presume atomicidad, durabilidad de directorio, orden de persistencia ni semántica de filesystem sin evidencia específica del entorno y operación.

### B6. Criterio de salida P07-C/P05

- **CLOSED:** B1–B5 demostrados para el entorno y actores cubiertos; crash windows cerradas; cleanup replacement-safe; BLOCKED observable por nueva invocación; procedimiento de reclasificación aprobado; O7 cubierto.
- **PARTIAL:** propiedades concretas demostradas, pero una o más siguen abiertas; enumerar exactamente cuáles.
- **UNKNOWN/BLOCKING:** falta identidad del objeto, análisis de crash, prueba de durabilidad, procedimiento aprobado o cobertura O7.
- **CONTRADICTED:** existe una ruta demostrada de readmisión insegura, cleanup sobre sustituto o pérdida de BLOCKED ante crash.

## 4. Matriz de no-sustitución de evidencia

| Evidencia observada | Puede respaldar | No puede cerrar |
|---|---|---|
| Grafo estático de imports/callers | P09 parcial | O7 |
| Variables UNSET en una captura | Estado de ese shell/instante | Ausencia global de alias |
| Consulta de procesos sin coincidencias | No observación de esos procesos en esa ventana | Ausencia de launchers/servicios futuros |
| Inventario de scripts conocidos | Cobertura de esos scripts | Inventario universal de actores |
| Lock cooperativo | Coordinación entre participantes que lo usan | Escritor RAW que lo ignora |
| Path canónico | Convergencia de rutas que lo respetan | Escritor con path configurable |
| Token/nonce | Correlación lógica definida por su contrato | Identidad del inode realmente eliminado |
| Lock efímero | Exclusión mientras la primitiva y participantes lo sostengan | BLOCKED durable después de crash |
| Tombstone/marker propuesto | Nada hasta demostrar sus propiedades | Cobertura O7 o autorización de mecanismo |
| Test local aislado | Caso concreto probado en ese entorno | CI-VERIFIED, universalidad o cierre M0 |

## 5. Relación con O1–O9 y estado heredado

Este contrato debe evaluarse contra O1–O9 sin reabrir decisiones ya ratificadas:

- O1: GAP — BLOCKED durable tras terminar el dueño no demostrado.
- O2: CONTRADICTED-CODE/GAP — predicados PID/edad observados en rutas inspeccionadas; cobertura completa no demostrada.
- O3: escenarios definidos; identidad del target real UNKNOWN.
- O4: CONTRADICTED-CODE/GAP — validación y cleanup por nombre no vinculan atómicamente el objeto comprobado con el eliminado.
- O5: CONTRADICTED-CODE/GAP — ausencia/ENOENT puede permitir reintento/readmisión en seams descritos.
- O6: GAP — procedimiento aprobado de reclasificación inexistente/no demostrado.
- O7: UNKNOWN — cobertura de todos los escritores no demostrada.
- O8: UNKNOWN — fingerprint reproducible del target ligado al SHA y evidencia completa de actores/permisos pendientes.
- O9: PARTIAL — separación observada en rutas concretas; readmisión sin resolver.
- C3/G2: decisión del propietario resuelta; aplicar el oráculo por rol de inode.

Estado de política heredado: P05-C **RATIFICADA COMO POLÍTICA**; P05 **OPEN**. P07-C **UNKNOWN/BLOCKING**. P09 **OPEN/UNKNOWN**. O7 **UNKNOWN**. M0 **INCOMPLETO**.

Estos estados son la línea base documental de esta unidad, no una reevaluación de los artefactos de implementación ni una afirmación de que el contenido se haya probado en runtime.

## 6. Próxima unidad permitida

La siguiente unidad documental debe ser una evaluación de trazabilidad: mapear cada fila de actores/paths conocida (incluidos RAW-1/RAW-2 y entrypoints declarados) a A1–A5 y mapear cada hallazgo O1–O9/C3 a B1–B6. Cada fila debe citar artefacto y evidencia exacta o permanecer UNKNOWN.

No repetir inventarios ya realizados ni solicitar otra ronda genérica de Termux. Si falta evidencia de un hecho concreto, identificar primero el hecho, la fuente documental que podría probarlo y por qué el dato cambiaría una clasificación. No ejecutar comandos en el dispositivo como sustituto de esta evaluación documental.

## 7. Restricciones y autorización

- `authorization: NOT_EVALUATED`.
- Sin cambios de código, configuración, workflows, bootstrap o runtime.
- Sin tests, CI, commissioning, publicación ni efectos protegidos.
- Sin selección o creación de una primitiva de coordinación.
- Sin cambios a PR #110 ni ramas de producto.
- Este documento es **PROPOSAL / CONTRACT FOR REVIEW**, no DECIDED, IMPLEMENTED, TESTED ni CI-VERIFIED.


---

# DOCUMENTO 3 — INFORME CLAUDE H1–H9 (TEXTO ÍNTEGRO)

# NCS M0 — Claude: auditoría adversarial O7/P09 y delta de escritores

Fecha: 2026-11-26
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot estático auditado por Claude: `d8b5ca8720908d926acc18130614cce132a43b5d`
Base documental: `NCS_M0_P05_P07_WRITER_EXCLUSION_FRONTIER_AFTER_TERMUX_2026-11-26.md`
Contrato evaluado: `NCS_M0_O7_P07C_P05_CONTRACTS_COVERAGE_AND_ENFORCEMENT_2026-11-26.md`
Tipo: informe independiente recibido de Claude; delta documental y clasificación provisional. No es implementación, prueba propia de GPT, ratificación del propietario ni autorización.

## 1. Resultado ejecutivo

Claude concluye que O7 no puede cerrarse con el contrato actual. El hallazgo más severo es RAW-1: Claude informa haber reproducido en una copia de scratchpad que `scripts/assistants.mjs`, configurado con `NEXO_LUMINA_MEMORY_PATH` apuntando al archivo de Continuity, lo sobrescribe mediante `fs.writeFile` y termina con código 0.

La lectura independiente de los archivos fuente en esta rama confirma la ruta estática: `MEMORY_PATH` se resuelve desde `process.env.NEXO_LUMINA_MEMORY_PATH` y el script ejecuta `fs.writeFile(MEMORY_PATH, ...)` sin que en ese tramo aparezca admisión de Continuity, lock, rename ni validación de alias. La reproducción dinámica y sus hashes se atribuyen al informe de Claude; no se repitieron aquí.

**Clasificación provisional:** O7 = CONTRADICTED para cualquier claim que incluya esa configuración y ese archivo como objeto protegido, salvo que una decisión explícita y justificada delimite el entorno de configuración como confiable y demuestre una exclusión efectiva. La evidencia Termux UNSET no elimina la capacidad.

## 2. Hallazgos recibidos y clasificación

### H1 — RAW-1: Lúmina puede sobrescribir Continuity por alias de entorno

- Estado de Claude: CONFIRMED, reproducción dinámica en scratchpad.
- Fuente: `scripts/assistants.mjs`, blob `5d773332acf1f762ea9e2eb48dfcf5a5267470d6`.
- Evidencia estática leída en la rama: `NEXO_LUMINA_MEMORY_PATH` determina `MEMORY_PATH`; posteriormente `fs.writeFile(MEMORY_PATH, JSON.stringify(learned, ...))`.
- Consecuencia: actor no-Nexo en P09 puede ser escritor relevante para O7 por alias.
- Clasificación NCS: **CONTRADICTED** si el claim incluye esta capacidad sin enforcement/exclusión demostrada; de otro modo, **UNKNOWN/STOP** hasta ratificar alcance y demostrar exclusión.
- No se considera suficiente que la variable apareciera UNSET en una captura Termux.

### H2 — RAW-2: persistState trata estado no reconocido como revisión cero

- Estado de Claude: CONFIRMED a nivel API y reproducción dinámica en scratchpad; alcance de producción PARTIAL/UNKNOWN.
- Fuente: `scripts/simulate.mjs`, blob `ec322cdff76392d7c99a4f45bf35f76a8b91b667`.
- Evidencia estática leída: `loadState()` captura errores y devuelve world-state predeterminado con `stateRevision: 0`; `persistState()` usa por defecto `loadCurrentState = loadState` y compara la revisión resultante antes de escribir/renombrar el payload.
- Claude informa que `createPersistStateConditionalCommit` invoca esta ruta; no encontró caller de producción en el snapshot.
- Adapter: `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.
- Clasificación NCS: **CONTRADICTED** para la propiedad general “ilegibilidad no autoriza”; **UNKNOWN/PARTIAL** para exposición efectiva desde callers de producción.
- No se eleva a actor activo del despliegue sin probar el caller/grafo.

### H3 — Workflow de Lúmina con permiso de escritura al repositorio

- Estado de Claude: CONFIRMED por código.
- Fuente: `.github/workflows/lumina-simulation.yml`, blob `e11a11b5101c992396737f3520c427c2c6c4f350`.
- Evidencia leída: cron cada cinco minutos, push a main, `permissions: contents: write`, ejecución de `npm run assistants` y `npm run simulate`, y commit/push de `world-state.json` y `.lumina-assistant-memory.json`.
- Límite importante: el workflow es un actor escritor del repositorio/estado Lúmina, pero la lista de archivos añadidos no demuestra que escriba directamente el archivo de Continuity. Además corre en GitHub Actions, fuera del R1 Android/Termux/foreground aceptado.
- Clasificación NCS: **CONFIRMED** como actor externo que escribe estado del repositorio; **OUTSIDE R1 / EXCLUSION NOT DOCUMENTED** respecto al claim R1; **UNKNOWN** en cuanto a impacto indirecto sobre un objeto Continuity desplegado. No clasificarlo como escritor directo de Continuity sin evidencia adicional.

### H4 — Chronicle omitido del inventario

- Estado de Claude: omisión CONFIRMED; alias destructivo directo no confirmado.
- Fuentes:
  - `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
  - `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
  - `scripts/nexo.mjs`, blob `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- Evidencia estática: Chronicle tiene lock derivado de path, temporales y limpieza por prefijo; su CLI acepta `--continuity` y `--chronicle`. El dispatcher Nexo invoca `nexo-chronicle-session`.
- Reproducción de Claude: al apuntar Chronicle al archivo Continuity, `chronicle.loadCurrent(P)` rechaza el esquema con `NEXO_CHRONICLE_SCHEMA_UNKNOWN`. Esto prueba el rechazo de lectura; no prueba que Chronicle sobrescriba el archivo Continuity.
- Riesgo adicional condicionado: si los paths coinciden, los nombres de lock/temporales pueden colisionar y operaciones de coordinación/limpieza pueden interactuar. Debe analizarse contra el alcance exacto de objeto protegido y las funciones completas de append.
- Clasificación NCS: **CONFIRMED** como actor/entrypoint y omisión del inventario; **PARTIAL/UNKNOWN** para capacidad de mutar el objeto Continuity por alias; **UNKNOWN** para dirección inversa de lectura, no ejecutada.

### H5 — Paths de Continuity suministrados por callers y symlink no reclamado

- Estado de Claude: CONFIRMED por código.
- Fuentes: `continuity-store.mjs` blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`; `chronicle-store.mjs` blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
- Evidencia: ambos módulos declaran que `filePath` es trusted configuration, no sandbox boundary, y que no reclaman resistencia a symlink/path attacks.
- Entry points señalados: `nexo.mjs`, `nexo-chronicle-session.mjs`, `nexo-continuity-bootstrap.mjs`.
- Clasificación NCS: **CONFIRMED** como supuesto explícito del código; el claim de resistencia a symlink/path attack permanece **NOT CLAIMED / UNKNOWN**, no debe inferirse.

### H6 — Lecturas que adquieren y modifican lock

- Estado de Claude: CONFIRMED por lectura estática; no reproducción dinámica.
- Fuente: `continuity-store.mjs`, blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`.
- Evidencia: `loadCurrent()` adquiere lock antes de leer; adquisición crea entradas del lock y puede observar/requerir recuperación ante lock stale.
- Consecuencia: “solo lectura” no significa ausencia de mutación en el namespace de coordinación.
- Clasificación NCS: **CONFIRMED** como comportamiento estático; su efecto exacto en O7 depende de si el contrato incluye lock/auxiliares en el objeto protegido.

### H7 — Limpieza de temporales por nombre/prefijo

- Estado de Claude: CONFIRMED por código; impacto condicionado a colisión de nombres.
- Fuentes: `continuity-store.mjs` blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`; `chronicle-store.mjs` blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`; `simulate.mjs` blob `ec322cdff76392d7c99a4f45bf35f76a8b91b667`.
- Evidencia: barridos de directorio que seleccionan nombres `.tmp` / `.tmp-*` y luego ejecutan `rm`.
- Consecuencia: incluirlo en análisis B2/O4 solo cuando se demuestre que el namespace compartido permite afectar un temporal ajeno o sustituto. No afirmar explotación efectiva sin contraejemplo.

### H8 — Corrección del inventario de variables de entorno

- Estado de Claude: CONFIRMED según barrido del snapshot.
- `NEXO_STATE_PATH` y `NEXO_LUMINA_MEMORY_PATH` aparecen en `assistants.mjs`; `NEXO_CONTINUITY_PATH` solo aparece en tests según el barrido de Claude.
- `simulate.mjs` no lee directamente `NEXO_STATE_PATH`; el CLI normal usa su ruta predeterminada.
- Pendiente de corroboración exhaustiva independiente: búsqueda global de referencias en el snapshot completo. No convertir el resultado del barrido de Claude en afirmación universal sin reproducir método/rango.

### H9 — Exclusiones positivas limitadas

- Estado de Claude: hallazgo de alcance bajo.
- La inspección de `MainActivity.kt` indicaría escritura a `model.gguf` en `filesDir`, sin referencia a Continuity/Chronicle. Esto puede excluir ese actor/archivo concreto si se confirma el alcance.
- Una búsqueda sin primitivas en `functions/api/capture.js` es UNKNOWN, no exclusión positiva.

## 3. Efecto sobre obligaciones

| Obligación | Estado heredado | Efecto del informe Claude |
|---|---|---|
| O1 | GAP | Sin cambio; exige análisis de BLOCKED durable. |
| O2 | CONTRADICTED-CODE/GAP | Sin cambio; los nuevos hallazgos no resuelven el lifecycle del lock. |
| O3 | UNKNOWN | Añadir alias/path y objetos Chronicle a escenarios de identidad; target real sigue UNKNOWN. |
| O4 | CONTRADICTED-CODE/GAP | H7 añade rutas de limpieza por prefijo que requieren análisis de sustitutos. |
| O5 | CONTRADICTED-CODE/GAP | H1/H2 refuerzan que ausencia/ilegibilidad no deben tratarse como autorización. |
| O6 | GAP | Sin cambio; procedimiento de reclasificación sigue sin aprobarse. |
| O7 | UNKNOWN heredado | **CONTRADICTED para el claim amplio que incluye RAW-1 sin enforcement/exclusión**; de otro modo UNKNOWN/STOP hasta delimitar el alcance. |
| O8 | UNKNOWN | Sin cambio; fingerprint/actores/permisos no quedan cerrados. |
| O9 | PARTIAL | Sin cambio; no resuelve readmisión. |
| P09 | UNKNOWN/OPEN | No se cierra; H1 es no-Nexo y muestra por qué P09 no sustituye O7. |
| P07-C/P05 | UNKNOWN/BLOCKING; P05-C política ratificada, P05 OPEN | Sin cambio de cierre; H2/H5/H6/H7 añaden requisitos de evaluación B1–B5. |
| C3/G2 | DECISIÓN DEL PROPIETARIO RESUELTA | No reabrir. Aplicar el oráculo ya ratificado por rol del inode. |

## 4. Correcciones documentales que se desprenden

1. Corregir la clasificación de RAW-1: capacidad no solo estática; Claude informa reproducción dinámica y el código fuente confirma la escritura por path configurable.
2. Mantener separado “alias no observado en shell capturado” de “capacidad inexistente”.
3. Incorporar Chronicle y sus entrypoints al inventario O7/P09 sin afirmar todavía que el alias Chronicle sobrescribe Continuity.
4. Añadir workflow CI como actor externo de escritura del repositorio, fuera de R1; documentar explícitamente la exclusión de ese entorno y no atribuirle escritura directa de Continuity sin evidencia.
5. Añadir a B1/B2 la confianza declarada en `filePath`, los límites de symlink/path attacks, namespace de locks y temporales, y la limpieza por prefijo.
6. Añadir a B3 la ruta `persistState`/revisión cero como contraejemplo de API, con estado de caller de producción aún UNKNOWN.
7. Añadir una clase “lectura con mutación de coordinación” para que loadCurrent no se clasifique como actor sin efectos.
8. No ratificar O10 todavía. La propuesta de Claude para O10 (fail-open de persistState) queda como candidato de obligación adicional, pendiente de reconciliar con O1–O9 y el modelo de alcance.

## 5. Trabajo documental pendiente antes de una nueva clasificación

- Definir con autoridad qué integra el “objeto protegido”: solo archivo Continuity, o también lock, temporales, Chronicle, world-state, directorio padre y metadatos relevantes.
- Resolver si la configuración por entorno/argv forma parte del perímetro confiable R1 o si debe tratarse como input no confiable. No asumir ninguna respuesta.
- Determinar si Chronicle está incluido como activo protegido o solo como actor/namespace auxiliar.
- Completar el grafo de callers de `persistState`, incluyendo el adapter conditional-commit, sin inferir caller de producción.
- Verificar si el workflow CI puede influir indirectamente en el objeto protegido del despliegue R1; por ahora solo se demuestra escritura del repositorio.
- Evaluar la dirección inversa de alias Chronicle/Continuity y los efectos de colisión lock/temp solo si aportan evidencia nueva y acotada.
- Incorporar evidencia positiva para exclusiones de actores individuales; búsquedas vacías permanecen UNKNOWN.

## 6. Límites y estado

- Este informe preserva lo reportado por Claude y la lectura estática de los archivos fuente citados.
- No se repitieron las reproducciones dinámicas de Claude.
- No hubo cambios de código, configuración, dispositivo, tests, CI, workflows ni bootstrap.
- No se eligió ninguna primitiva.
- No se modificó PR #110 ni ramas de producto.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos y commissioning: **STOP**.
- M0: **INCOMPLETO**.


---

# DOCUMENTO 4 — INFORME QWEN PREVIO, PARA EVITAR REPETICIONES (TEXTO ÍNTEGRO)

# NCS M0 — Informe Qwen: suficiencia lógica condicionada de O7/P07-C/P05

Fecha: 2026-11-26
Repositorio: `snowdenxrp/aldea-ia`
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot declarado en la misión: `d8b5ca8720908d926acc18130614cce132a43b5d`

## 0. Validez y alcance del informe

Qwen declara expresamente que en su sesión no tuvo acceso al repositorio ni a los documentos fuente. No pudo leer íntegramente la frontera, los contratos, O1–O9, B1–B6, R1, P09 ni el texto ratificado C3/G2.

Por ello:
- No emite veredicto sobre la suficiencia real de los contratos.
- Todas las conclusiones sobre el Plano D (documentos NCS) permanecen **UNKNOWN**.
- El informe aporta criterios de suficiencia lógica, patrones de contradicción y contraejemplos abstractos del Plano M (modelo lógico), no hallazgos verificados contra el snapshot.
- No modifica código, configuración, ramas ni PR #110.
- No reabre C3/G2.

**Regla de atribución:** no presentar los contraejemplos abstractos de Qwen como reproducciones del código NCS ni como contradicciones confirmadas de los documentos.

## 1. Resultado ejecutivo

Qwen sostiene que el inventario de escritores, por sí solo, no demuestra cobertura universal de O7. Para probar cobertura hace falta justificar un universo cerrado de efectuadores o mediación completa: toda transición que pueda afectar el objeto protegido o el namespace relevante debe pasar por el contrato o quedar excluida mediante un supuesto ambiental explícito y defendible.

También identifica requisitos lógicos para identidad de objeto, cleanup replacement-safe, bloqueo durable, recuperación serializada y modelo de crash. Su aplicabilidad al contrato NCS queda **UNKNOWN** hasta cotejar el texto real.

## 2. Patrones de contradicción candidatos K1–K7

Son patrones condicionales: solo constituyen contradicción documental si el texto real contiene las cláusulas en conflicto.

- **K1 — Cuantificadores incompatibles:** O cuantifica todos los escritores, pero enforcement cubre solo cooperativos mientras se declara cobertura universal.
- **K2 — Identidad confundida con integridad:** B1 garantiza identidad continua, pero se deriva integridad del contenido sin excluir escritores no mediados.
- **K3 — Fail-open:** B3 exige no-readmisión, pero ausencia/vacío/corrupción se interpreta como permiso.
- **K4 — Cleanup por nombre:** B2 exige replacement-safe, pero eliminación se direcciona por nombre tras comprobar identidad previamente.
- **K5 — Recovery no serializado:** B3 exige bloqueo monotónico y B4 permite readmisión concurrente sin precedencia frente a un nuevo bloqueo.
- **K6 — Orden de durabilidad incompatible:** cleanup ocurre antes de hacer durable la decisión que lo justifica.
- **K7 — Path sin control del namespace:** una garantía se indexa por path sin declarar control exclusivo o supuestos equivalentes del namespace.

Aplicabilidad a los documentos NCS: **UNKNOWN**.

## 3. Criterios lógicos de suficiencia

### 3.1 O7 / P09

Qwen propone mantener la distinción:
- O7: propiedad sobre ejecuciones/efectos de escritores.
- P09: contrato sobre participantes/callers Nexo.

La derivación de O7 requiere que ambos contratos y el enforcement cubran universos compatibles, sin circularidad. Un inventario de escritores sirve como evidencia sobre un snapshot, pero no cierra por sí mismo el universo de ejecuciones futuras, dinámicas o externas.

La cobertura universal exigiría justificar:
1. clausura del universo de efectuadores;
2. mediación completa o exclusión demostrada;
3. frontera de procesos/host/permisos;
4. supuestos explícitos sobre cooperatividad, namespace, identidad y modelo de crash.

### 3.2 Identidad del objeto (B1)

La identidad debe ser estable e independiente del nombre, con reutilización detectable o acotada. Además, la identidad comprobada debe estar vinculada al objeto afectado en el instante del efecto, no solo al instante de una comprobación previa.

Escenarios abstractos que propone cotejar:
- unlink y recreación del mismo nombre;
- rename-over;
- retarget de symlink;
- sustitución del directorio padre;
- aliasing de varios nombres a un objeto;
- reutilización de identificadores;
- vistas de namespace divergentes;
- mutación in-place conservando identidad.

### 3.3 Cleanup replacement-safe (B2)

Criterios necesarios:
- efecto de eliminación condicionado a identidad en el instante del efecto, o control exclusivo del namespace que excluya sustitución;
- idempotencia;
- seguridad ante cleanups concurrentes;
- orden durable decisión → efecto.

Una secuencia check-then-act por nombre no satisface por sí sola esos criterios.

### 3.4 BLOCKED durable (B3)

Criterios necesarios:
- transición monotónica;
- salida únicamente mediante autoridad B4;
- default-deny ante ausencia, vacío, parcialidad, corrupción, versión desconocida o estado stale;
- durabilidad del registro y de su entrada de directorio antes de ack o efecto dependiente;
- clave por identidad, no solo por nombre;
- independencia de señales de liveness no durables.

### 3.5 Recuperación y crash consistency (B4/B5)

B4 debería definir autoridad única, revalidación de invariantes, transición durable y precedencia/serialización frente a nuevas decisiones BLOCKED.

B5 debería declarar modelo de crash y tabla de órdenes de durabilidad para decisión, efecto, registro y ack, con resultado default-deny en cada ventana ambigua.

### 3.6 C3/G2

No se reabre. Qwen no tuvo el texto ratificado, por lo que su aplicación documental es UNKNOWN. El cotejo futuro debe verificar que el alcance ratificado se cita correctamente y que ningún otro contrato reclama cobertura sobre una zona exceptuada sin justificación independiente.

## 4. Contraejemplos abstractos del Plano M

Estos ejemplos son demostraciones lógicas genéricas, no reproducciones de NCS:

- **CE-1:** tras comprobar que el nombre apunta a objeto i1, otro actor sustituye el vínculo y la operación por nombre elimina i2.
- **CE-2:** mantener abierto un handle a i1 no obliga a que una operación posterior sobre el nombre afecte a i1.
- **CE-3:** ABA por recreación y reutilización de identificador observable.
- **CE-4:** crash después de decidir BLOCKED en memoria pero antes de persistirlo.
- **CE-5:** registro creado vacío o contenido durable sin entrada de directorio durable.
- **CE-6:** recuperación que persiste readmisión concurrentemente con un nuevo bloqueo.
- **CE-7:** cleanup anterior a la durabilidad de la decisión que lo justifica.
- **CE-8:** mutación in-place conserva identidad, pero cambia contenido.
- **CE-9:** aliasing o sustitución del prefijo del path evade una garantía indexada solo por nombre.

Su aplicabilidad a B1–B6/O1–O9 queda **UNKNOWN** hasta cotejar el contrato fuente.

## 5. Requisitos adicionales candidatos R-A–R-G

- **R-A (O7/R1):** universo de efectuadores cerrado y argumento de mediación completa, con frontera y exclusiones explícitas.
- **R-B (B1):** identidad independiente del nombre, estabilidad/no-reutilización detectable y vínculo entre identidad comprobada y efecto.
- **R-C (B2):** efecto condicionado a identidad, idempotencia, concurrencia segura y orden durable.
- **R-D (B3):** monotonicidad, default-deny ante ambigüedad, durabilidad del registro y namespace antes de ack/efecto.
- **R-E (B4):** autoridad única, revalidación, serialización contra nuevos bloqueos, transición durable y auditabilidad.
- **R-F (B5):** modelo de crash explícito, tabla de órdenes de durabilidad y supuestos del sustrato declarados.
- **R-G (C3/G2):** referencia exacta al alcance ratificado y prohibición de reclamar cobertura fuera de ese alcance sin justificación.

Son requisitos candidatos de Qwen, no decisiones NCS ratificadas.

## 6. Matriz y regla de evaluación propuestas

Qwen no llenó O1–O9 × B1–B6 porque no tuvo los enunciados. Propuso que una celda solo cuente como soporte si el contrato B, bajo supuestos A explícitos, implica la parte correspondiente de O. Un O solo estaría demostrado si la conjunción de soportes cubre íntegramente su propiedad; parcial si depende de supuestos no declarados; contradicho si se admite una ejecución que lo viola; UNKNOWN en otro caso.

La fila O7 requeriría, como mínimo, argumento de cobertura R-A junto con identidad, cleanup, bloqueo durable y crash consistency.

## 7. Recomendación y próximos datos

Qwen pidió acceso íntegro a:
1. frontera P05/P07 posterior a Termux;
2. contratos O7/P07-C/P05;
3. definiciones de O1–O9, B1–B6, R1 y P09;
4. texto ratificado C3/G2, si está en otro artefacto.

La vía correcta para continuar es facilitarle el contenido íntegro o habilitarle acceso verificable. No se debe pedirle que convierta los criterios abstractos en un veredicto sobre textos que no ha leído.

## 8. Estado NCS preservado

- O7: sin cierre; el informe Qwen no lo verifica.
- P09: UNKNOWN/OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: política ratificada; P05 OPEN.
- C3/G2: decisión del propietario resuelta; no reabrir.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos y commissioning: **STOP**.
- M0: **INCOMPLETO**.

No se eligió primitiva ni se autorizó implementación, configuración, tests, CI, ejecución de dispositivo, publicación o cambios en PR #110.


---

## 6. Formato de salida requerido

1. Estado de recepción: confirma que este paquete contiene los cuatro textos íntegros.
2. Tabla H1–H9: clasificación, evidencia, cláusula afectada, alcance, confianza y condición pendiente.
3. Matriz de impacto H1–H9 × O1–O9/P09/A1–A5/B1–B6.
4. Correcciones documentales mínimas y consistencia conjunta.
5. Decisiones del propietario pendientes, si las hay; no inventar decisiones.
6. Evidencia adicional estrictamente necesaria, indicando qué clasificación cambiaría.
7. Veredicto final sobre O7/P09/P07-C/P05 y M0, sin declarar cierre.

Si el tamaño del expediente excede el contexto disponible, detente e identifica el último documento/sección recibido; no simules haber leído el resto. No solicites nuevamente documentos que ya estén incluidos.
