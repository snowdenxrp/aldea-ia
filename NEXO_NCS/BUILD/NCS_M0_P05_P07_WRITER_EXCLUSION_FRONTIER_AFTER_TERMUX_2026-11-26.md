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
