# NCS M0 — P01-G: regla restante de primera creación y decisión requerida

Fecha: 2026-11-02
Rama: `ncs-lumina-decoupling-2026-10-29`
Base local/remota sincronizada: `dd7be200737f21a729306494e9387abe6713119e`
Tipo: reconciliación documental + recomendación no ratificada
Ejecución: solo lectura y documentación; no runtime, tests, CI, bootstrap ni cambios del dispositivo.

## 1. Decisiones del propietario ya resueltas — no volver a preguntar

1. **P01-A = L (2026-11-01):** Continuity M0 es persistencia operacional local, con influencia acotada sobre el flujo de Nexo, que no establece identidad, Constitución ni autoridad constitucional, y que no concede por sí misma permiso para efectos protegidos. Reemplaza expresamente la clasificación U anterior.
2. **Regla provisional de primera creación (2026-10-28):** la ausencia del archivo, el código existente o el éxito técnico no implican permiso; deben estar definidos el propósito/clasificación del objeto exacto, la regla legítima aplicable y las precondiciones verificables del entorno restringido; bootstrap separado de admisión, PREPARED, dispatch, reconciliación y mutaciones de dominio; falta/ambigüedad => STOP/UNKNOWN.
3. **Entorno restringido (2026-10-27):** el propietario permite una garantía de alcance restringido con precondiciones explícitas y verificables; no afirma que el entorno esté demostrado.
4. **R1 y aceptación delimitada E2/E3 (2026-11-02):** propietario como único lanzador manual en sesión interactiva Termux durante la ventana; ningún otro escritor autorizado; actor relevante no controlado detectado => STOP; UNKNOWN residuales explícitos; no se exige exclusión universal ni inventario Android exhaustivo. La decisión no cierra la evidencia E2/E3.

## 2. Evidencia técnica ya disponible

- La API dedicada `bootstrapNexoContinuityStore()` existe y valida `root` + `relativePath`, calcula el destino efectivo, rechaza opciones adicionales como `legacyMemory`, usa inicialización exclusiva y no devuelve un owner operacional.
- La ruta Chronicle bloquea la combinación de bootstrap Continuity y operación normal con `NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED`.
- En los entrypoints inspeccionados, no hay subcomando/launcher M0 dedicado: `scripts/nexo.mjs` no reconoce `--root` ni un comando bootstrap; `scripts/nexo-chronicle-session.mjs` no recibe `--root`; `package.json` no define script `nexo`. El re-export `scripts/nexo-continuity.mjs` no constituye un launcher.
- El objeto real se identifica por el `filePath` efectivo de una invocación concreta; no existe una ruta universal que pueda inferirse. La ruta raíz y el destino efectivo para la primera instancia aún no se han seleccionado/verificado.
- El test local completo fue reportado PASS en SHA `5988d9b4c6caa22ec093986a25db80ca842902cc`; incluye los casos de path/temp añadidos. No es CI de ese SHA, no demuestra publicación real, ni elimina TOCTOU o escritores no cooperativos.
- El 2026-11-02 se incorporó evidencia operacional Termux: captura puntual sin Node/Nexo visible, jobs pendientes vacíos, boot directory ausente, perfiles inspeccionados sin referencias y demás límites detallados en `NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md`. E2/E3 siguen PARTIAL / NOT CLOSED.

## 3. Qué resuelve y qué no resuelve la combinación actual

La combinación P01-A=L + regla provisional + R1 permite especificar una primera creación de **persistencia operacional local no constitucional** bajo una garantía operacional delimitada. No permite inferir que el archivo ausente autorice su creación ni que el propietario, el caller, el lock, el path o el snapshot se conviertan en una raíz constitucional.

La aprobación de R1 resuelve el alcance del modelo de amenaza, no la fuente normativa de permiso para una operación específica. La API existente resuelve parte del contrato de filesystem/API, no identifica quién autorizó esa invocación ni la ruta real.

## 4. P01-G — brecha restante exacta

P01-G no necesita reabrir la clasificación del objeto ni la discusión de exclusión universal. Requiere resolver y documentar estos puntos:

1. **Fuente normativa para esta clase de operación:** si la decisión expresa del propietario, actuando fuera del runtime y limitada a una inicialización local no autoritativa, es la regla legítima aplicable; o si el contrato canónico exige que la inicialización local sea reconocida por la frontera constitucional existente. El Constitution Authority Context inspeccionado cubre reconocimiento del régimen constitucional para vinculación posterior de Policy; no se puede ampliar por analogía a este bootstrap.
2. **Reconocimiento sin autoridad paralela:** si se usa autorización operacional directa del propietario, cómo queda vinculada a una invocación concreta sin aceptar un campo/flag autocertificado por el caller ni crear un `BootstrapAuthority`, credential o segunda raíz. El procedimiento manual bajo R1 es una condición ambiental, no prueba técnica ya implementada.
3. **Objeto e invocación concretos:** raíz explícita, ruta relativa, `filePath` efectivo, esquema/snapshot inicial permitido, SHA de contrato/código y límites de inicio/fin. Hoy RE-01/RE-02 siguen UNKNOWN porque no existe launcher M0 dedicado ni destino real fijado.
4. **Separación y estado previo:** conservar el bootstrap como operación terminal separada; ausencia real distinta de corrupción, error de lectura, temporal/lock ambiguo y conflicto; cualquier objeto existente se preserva; resultado incierto => UNKNOWN/STOP, sin retry.
5. **Evidencia operacional:** vincular E2/E3 al destino e invocación concretos. La evidencia actual es parcial; no equivale a una ventana de publicación demostrada.

## 5. Recomendación técnica para decisión del propietario — NO RATIFICADA

Recomiendo que M0 trate la primera creación como una **autorización operacional humana, explícita, única y acotada**, distinta de la autoridad constitucional:

- La fuente normativa sería una decisión expresa del propietario para inicializar una instancia concreta de Continuity clasificada L.
- La autorización no se almacenaría dentro del archivo que se está creando, no se derivaría de su ausencia ni se presentaría como credencial/raíz.
- La invocación sería manual, foreground y terminal: valida las entradas explícitas, deriva y muestra el destino efectivo antes de cualquier escritura, verifica las precondiciones del contrato y termina tras la inicialización; no entrega owner ni continúa a admisión/Chronicle/dispatch.
- La aprobación humana tendría alcance solo sobre objeto, destino, SHA, ventana y snapshot inicial definidos; cualquier diferencia o UNKNOWN => STOP.
- Esta regla no establecería ROOT_READY, autoridad constitucional, commissioning ni permiso para efectos protegidos.

**Condición crítica:** esta recomendación solo es viable si el owner canónico de Core permite que la decisión humana externa sea base normativa suficiente para una operación local no autoritativa y si la frontera operacional puede reconocer la invocación sin autoafirmación del caller. No se debe codificar un flag como sustituto de esa demostración. Si el contrato canónico no permite esa ruta, se mantiene STOP y no se crea una autoridad paralela.

La recomendación no es una decisión del propietario, no ratifica el contrato candidato, no cierra P01-G y no autoriza implementación, pruebas, CI ni bootstrap.

## 6. Estado

- P01-A: L — ACCEPTED BY OWNER.
- P01-G: PENDING / UNKNOWN.
- R1: ACCEPTED BY OWNER.
- Criterio operacional E2/E3: APPROVED; evidencia E2/E3: PARTIAL / NOT CLOSED.
- RE-01/RE-02: UNKNOWN.
- P01-B/B2: C — NO SELECCIONAR TODAVÍA.
- P01-C/D: OPEN / UNKNOWN.
- P01-E/F: requieren reconciliación de estado previo/resultado indeterminado contra contrato y evidencia actuales.
- P01-H: la suite local reportada PASS en SHA `5988d9b4...`; CI y evidencia operacional end-to-end no se declaran PASS.
- E4: NOT READY.
- Raíz legítima: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`; primera creación/publicación, commissioning y efectos protegidos: STOP.
- NCS M0: INCOMPLETO.

## 7. Siguiente acción finita

Obtener una decisión del propietario únicamente sobre la fuente normativa del permiso operacional de primera creación (punto 1 de §4). No volver a preguntar P01-A, R1, E1 ni la regla provisional. Después, si la decisión lo permite, congelar el contrato y trabajar RE-01/RE-02 con el launcher y destino concretos. No ejecutar bootstrap ni tests sin autorización separada.
