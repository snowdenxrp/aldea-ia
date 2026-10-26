# NCS — handoff para siguiente chat: reconciliación Claude y saneamiento D1
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Propósito: continuar desde los cambios documentales recientes sin rehacer auditorías ni abrir implementación.

## Ruta canónica obligatoria
1. `NEXO_NCS/STATUS.md`
2. `NEXO_NCS/MASTER/README.md` y visión maestra enlazada
3. `NEXO_NCS/CORE/README.md`
4. Este handoff y los artefactos BUILD indicados abajo
5. Trabajo actual únicamente sobre bloqueos concretos restantes

## Estado canónico — no modificar por inferencia
- M0: `INCOMPLETO`
- D0 técnico/evidencia: `OPEN`
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- No tests/CI ejecutados en esta pasada documental.
- No cambios de runtime, tests, workflows o datos operativos.

## Trabajo realizado en este ciclo
1. Revisada la respuesta de Claude sobre cierre D1. Su veredicto de D1 no cerrable coincide con el estado canónico. La revisión fue parcial en STATUS, D0/D2 y caller ledger; no tratarla como auditoría completa.
2. Creado [informe de reconciliación Claude](NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md), commit `b6e71ba9ffa14ebd724d204977bb344cd719a242`, luego leído de vuelta.
3. Actualizado el registro de decisiones para resolver colisión de identificadores históricos y distinguir grupos de evidencia G1–G5 de criterios normativos A–E de la línea de meta. Commit `fc1a174dd607f895bcfbfcce8a0aaec28787bb8d`, blob `d5d62906b365dcfbefa4b5606dcafbce842a75b6`.
4. Actualizada la matriz de corte mínimo: propuesta explícita del invariante de admisión previa a lectura, tabla provisional de estado propietario Nexo/Lúmina y condición de salida de la excepción, más gramática Chronicle/root v0 marcada PROPUESTA. Commit `368fd7f3f2ef9af4b75d708f358173e7711b7523`, blob `4d062f738e9aa050bc24d4d0a7c257ea6f24e3c9`.
5. Actualizado el manifiesto: el “Next step” refleja los bloqueos actuales y se registra que el grep comunicado por Claude no incluye el comando completo ni el SHA/tree completo, así que aún no es evidencia reproducible para reclasificar aristas. Commit `23e21958ae3752821ca570713d71509f28012e0d`, blob `d49996d00ed46e71d6acf777dc8134ac55571570`.
6. Los tres archivos actualizados se volvieron a leer desde GitHub y los cambios clave se confirmaron.

## Enlaces de trabajo
- [Registro de decisiones](NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md)
- [Matriz D1 de corte mínimo y cierre](NCS_M0_D1_MINIMUM_RESPONSIBILITY_CUT_AND_CLOSURE_MATRIX_2026-10-25.md)
- [Manifiesto de entrypoints y edges](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md)
- [Reconciliación Claude](NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md)
- [Reconciliación D0/D1 del contrato de raíz](NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md), commit `2866565231b8aaa365029a1819b239d595faea9f`.
- [Restricciones D2 ratificadas y puertas abiertas](NCS_M0_D2_RATIFIED_CONSTRAINTS_AND_OPEN_DESIGN_GATES_2026-10-25.md), commit `f019fe5eb8cc77d13d4ff654d06e2ab2f7480b91`.
- Matriz D1 reconciliada con O-08/O-10: raíz explícita y admisión previa a lecturas persistentes están ratificadas como diseño, no implementadas; commit `6d581ece054db88a22d6912e9121e11fb502966e`.
- Corrección adicional de la sección Chronicle v0: separa la raíz explícita ratificada de layout/flags/compatibilidad aún abiertos; commit `eec4e415443557572f49f1ea2996042be5fdce3b`.
- Nueva especificación D2 P-03/P-04: [alcance de admisión y propiedad de locks](NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md), commit `ccba5401e0730ab24460fec4851d1e1d8aec1aaf`. Documental/no ratificada como contrato completo; caracteriza diferencias actuales de release en blobs de Continuity/Chronicle y define requisitos de tests futuros sin ejecutarlos.
- `STATUS.md` actualizado para apuntar a esta especificación; commit `8ced8e6e50a755814dd51d1fc16975977b65f29d`.
- `STATUS.md` actualizado para apuntar a este avance; commit `23388d18bb4f34009aea8eaf577a0920b4d45a19`.
- [Línea de meta M0](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md)

## Hallazgos que deben mantenerse
- B1: el invariante de admisión antes de primera lectura persistente debe definirse en D1; sección crítica/locks/snapshot quedan en D2.
- B2: los principios D0-C1…C4 (raíz explícita, sin override ambiental/fallback legacy, raíz existente, canonicalización antes de derivar paths y sin migración automática) sí están ratificados. Los detalles de flags bootstrap, compatibilidad CLI, aliases y admisión efectiva siguen abiertos; nada de esto está implementado por inferencia.
- B3: propiedad de `state.nexoMemory`, rama `nexo` de memoria de asistentes y flujos `assistants.mjs`/`simulate.mjs` requieren corte de responsabilidades. Preservar persistencia legítima de Lúmina.
- B4: el resultado de `git grep` que comunica Claude no trae comando literal completo ni SHA/tree completo. No repetir el barrido de 188 archivos salvo que se requiera recuperar exactamente esos datos o haya cambio de fuente.
- B5: los IDs de propuestas históricas ahora usan `P-HIST-01…P-HIST-09`; las decisiones pendientes actuales usan `P-01…P-10`.
- B6: A–E pertenece a la línea de meta; G1–G5 solo agrupa evidencia en el registro.

## Próxima acción recomendada
1. Actualizar el encabezado de `STATUS.md` para apuntar a este handoff.
2. Luego, sin volver a escanear el repo entero, resolver solo las decisiones/ambigüedades documentales restantes:
   - revisar si los nombres de IDs históricos en otras referencias necesitan actualización;
   - confirmar con evidencia exacta el comando y SHA/tree del grep de Claude, solo si Claude los conserva;
   - contrastar gramática root/Chronicle con D0 y la matriz D2, anotando incompatibilidades sin adelantarse a D2.
3. Usar la reconciliación D0/D1 nueva para distinguir principios de root ya ratificados de detalles técnicos aún abiertos; no volver a presentar la raíz explícita básica como decisión pendiente.
4. Si hace falta una decisión de propietario, presentar una pregunta acotada; no escoger A/B/C ni asumir que raíz absoluta/relativa o `--initialize-*` ya está decidido.
4. No pedir otra auditoría general a Gemini. Claude/Gemini pueden ayudar con preguntas puntuales de contradicción, no como sustituto de evidencia fuente.
5. Usar también la consolidación D2 nueva como índice de restricciones ya ratificadas y puertas abiertas; no reabrir O-08…O-11 ni convertir propuestas de recuperación en decisiones.
6. No escribir tests ni modificar runtime/workflows sin autorización explícita separada.

## Reglas permanentes de continuidad
- No reabrir auditorías cerradas ni repetir el censo de 188 archivos.
- No convertir ausencia de resultados en prueba de ausencia.
- No llamar “inalcanzable” a APIs de reparación por el wrapper bloqueado.
- No desactivar memoria de aprendizaje ni persistencia del mundo de Lúmina como atajo de separación.
- No tratar documentación como implementación o CI.
- No crear mecanismos nuevos (IDs/colas/retries/tombstones/locks/transacciones) por iniciativa propia.
- `UNKNOWN/BLOCKED` es resultado válido y detiene cualquier afirmación de éxito.
- Root legítimo/autoridad/efectos protegidos permanecen pendientes/STOP.


## Actualización documental — D2 P-05 (2026-10-25)

- Nueva especificación: [NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md](NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md), commit `6bf41465d5caf04ed68fbfbbb7ea8f498c1cd694`.
- P-05 separa explícitamente resultado de persistencia, resultado de release y readmisión; establece evidencia propuesta E1–E9, sin elegir política A/B ni inventar un mecanismo.
- La política de recuperación/readmisión sigue pendiente del propietario. Si no puede demostrarse quiescencia o identidad según una política futura aprobada, el resultado permanece `UNKNOWN/BLOCKED`; la ausencia del path no basta por sí sola.
- Solo documentación: no runtime/tests/workflows/datos; no tests/CI. P-03/P-04/P-05 no se consideran cerrados.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Actualización documental — bootstrap parcial/recuperación D2 (2026-10-25)

- Nueva revisión: [NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md](NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md), commit `9faad5504dda91e734167d7fe3c3b8b9275dad90`.
- Hallazgo: `BOOTSTRAP_PARTIAL → ROOT_READY` carece de predicados completos ratificados; se deben resolver autoridad operacional, quiescencia, integridad, identidad de objetos durante limpieza, release anterior, resultado de salida y evidencia reproducible.
- Aclaración de nombres: “Opción A” aceptada como dirección en el contrato de raíz no significa que esté ratificada la “Opción A” de D0-C2 (bootstrap offline con quiescencia). La política de bootstrap sigue pendiente del propietario.
- Próxima continuidad: revisar el registro de decisiones actual y las puertas D0-C2/P-05 para detectar si ya hay decisión explícita del propietario; no pedirla de nuevo si está registrada. No crear protocolo/command de recuperación, ni modificar runtime/tests/workflows.
- Estado canónico: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No tests/CI.


## Contraste adicional — decisión de bootstrap (2026-10-25)

- Documento: [NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md](NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md), commit `280fbfdfedcae89451dcc33ff1c71b2150bbe46a`.
- Registro vigente §8.1 ratifica O-08 (raíz explícita/sin bootstrap implícito), mientras §8.2 conserva P-01 (protocolo bootstrap) y P-05 (release/readmisión) como pendientes. No consta selección explícita de A/B/C/D ni una política permanente de bloqueo; `UNKNOWN/BLOCKED` sigue siendo la conducta conservadora mientras no se resuelva el diseño.
- No confundir recomendación provisional de bootstrap offline con decisión del propietario. No pedir que repita una decisión ratificada: la selección concreta no aparece en el registro revisado.
- Nota de precisión: la revisión de huecos de bootstrap menciona O-01…O-04 en una frase; la referencia canónica vigente para los principios de raíz es O-08 del registro §8.1. Interpretar ese pasaje como referencia a los principios de raíz ratificados, no como un identificador de decisión distinto.
- Sin cambios de runtime/tests/workflows; no tests/CI. Estado canónico no cambia.


## Matriz de aceptación de bootstrap — continuación 2026-10-25

- Nuevo documento: [NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md](NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md), commit `04d8a4255c395a5df0ad1f6292678dc3204ebe58`.
- Compara las cuatro alternativas ya existentes (A offline/quiescencia; B staging/publicación; C marcador; D coordinación externa) con gates verificables y condiciones de descarte. No agrega una opción ni selecciona una por el usuario.
- Los gates comunes cubren autoridad operacional, quiescencia/concurrencia, integridad, identidad de objetos durante limpieza, actores anteriores de release, resultado exacto y pruebas vinculadas al SHA.
- Para avanzar sin adivinar: la cuestión operacional clave es si el primer despliegue puede exigir instalación manual/offline y quiescencia realmente demostrable. Si no, hacen falta datos del filesystem real para evaluar B; C/D no se justifican sin necesidad demostrada. P-05 debe coordinarse con cualquier alternativa.
- STATUS indexado; runtime/tests/workflows sin cambios; no tests/CI. Estado canónico sin cambios.


## Paquete compacto de decisiones del propietario — 2026-10-25

- Documento creado y verificado por lectura posterior: [NCS_M0_OWNER_DECISION_PACKET_P01_P02_P03_P04_P05_2026-10-25.md](NCS_M0_OWNER_DECISION_PACKET_P01_P02_P03_P04_P05_2026-10-25.md).
- Commit de creación: `8bf65b568b88ca805c1592ae9490bb3adff0f624`; blob verificado: `ebbc087da258e3c3cf36192ae876ff3876e873d8`.
- Consolida dependencias de P-01 bootstrap, P-02 frontera Nexo/Lúmina, P-03 alcance de admisión, P-04 propiedad de locks y P-05 release incierto/readmisión. Es paquete para preparar decisiones, no decisión ratificada ni sustituto de especificaciones detalladas.
- Pregunta operacional pendiente para P-01: ¿puede la instalación inicial exigir procedimiento manual/offline con escritores, launchers, supervisores y actores de limpieza detenidos y con capacidad demostrable de no reiniciarlos durante el bootstrap? No inferir respuesta ni seleccionar alternativa.
- Si se confirma que sí, la alternativa offline/quiescencia sigue siendo candidata, no aprobación automática: aún faltan predicados y pruebas. Si no o no se sabe, no elegir B/C/D por descarte; exigir caracterización del filesystem/entorno real. Incertidumbre → `UNKNOWN/BLOCKED`.
- Orden de dependencias: P-01 bootstrap; P-02 mapa de estado/dependencias; P-03 alcance de admisión; P-04 dueño efectivo por flujo; P-05 resolución de release/readmisión. No reabrir el censo de 188 archivos ni repetir revisiones generales.
- **Índice STATUS:** el paquete nuevo y el grafo de dependencias D2 / matriz de evidencia M0 no se han confirmado en STATUS; sí quedan enlazados desde este handoff. No afirmar que estén indexados en STATUS.
- No runtime/tests/workflows modificados; no tests/CI. Estado canónico no cambia: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Actualización de continuidad — reconciliación P-05 de locks (2026-10-25)

Fuente nueva verificada: [NCS_M0_D2_P05_INDEPENDENT_REVIEW_RECONCILIATION_2026-10-25.md](NCS_M0_D2_P05_INDEPENDENT_REVIEW_RECONCILIATION_2026-10-25.md), blob `e718182cb18c4a58de97d4ab1e0523ec8b1ee55c`, commit `1d783db9dba68faacc61692a94b7504583473407`.

### Resultado consolidado
- La revisión estática de Continuity detectó que el release comprueba el token del propietario y después elimina por ruta; si falla el primer `rm`, el segundo intento no vuelve a comprobar la identidad del objeto. También hay limpieza por ruta tras fallo al escribir `owner.json`, con error de limpieza absorbido.
- Chronicle no tiene el mismo segundo intento, pero tampoco queda demostrado seguro: su release inicial sigue siendo comprobar propietario y eliminar por ruta; su limpieza inicial tras fallo de `owner.json` comparte el riesgo conceptual. Su recuperación de lock stale sí falla cerrada.
- En ambas implementaciones, un `readLockOwner()` que devuelve `null` ante ausencia o ciertos errores puede colapsar estados distintos. La ausencia de una ruta y un `force: true` no prueban que se retiró la misma instancia de lock ni que el actor anterior haya terminado.
- Los tests existentes revisados no demuestran los casos de sustitución de ruta E3/E4. **No se ejecutaron tests ni CI**; no se reprodujo una carrera; no se modificaron runtime/tests/workflows. Son hallazgos estáticos, no prueba de explotación ni demostración de ausencia global de seguridad.
- El análisis de Gemini fue conceptual y sin acceso a las fuentes exactas; el de Claude fue más específico a código. Ambos convergen en no afirmar “nunca borra un lock ajeno” sin evidencia de identidad/ownership.

### Decisión del propietario: sigue pendiente
El registro canónico vigente, sección 8.2, mantiene P-01…P-05 abiertos. P-05 permite recuperación externa bajo quiescencia demostrada (A), mecanismo ligado a identidad de objeto bajo un modelo cooperativo explícito (B), o mantener `UNKNOWN/BLOCKED` hasta contar con evidencia suficiente. No se ha elegido A ni B. No confundir esto con O-08/raíz explícita ratificada ni con “Opción A” de otros temas.

### Próximo paso acotado
1. No repetir auditorías generales ni volver a escanear 188 archivos.
2. Resolver primero la precondición operacional de P-01: si la instalación inicial puede exigir procedimiento manual/offline y demostrar quiescencia de todos los escritores, launchers, supervisores y actores de limpieza. Si no se conoce o no puede probarse, mantener `UNKNOWN/BLOCKED`; no seleccionar B/C/D por descarte.
3. Aclarar P-04 (dueño efectivo por flujo y relación padre/hijo) antes de elegir política de readmisión P-05. No basta releer `owner.json` ni reintentar borrar una ruta para cerrar la carrera.
4. Solo después de una decisión explícita y una autorización separada, convertir E3/E4 y los demás casos aplicables en pruebas deterministas. Hasta entonces no tocar runtime/tests/workflows ni ejecutar CI.
5. Mantener los estados canónicos: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Continuidad — P-01 permanece UNKNOWN/BLOCKED; intake mínimo del entorno (2026-10-25)

- El propietario indicó explícitamente que todavía desconoce el entorno real y no puede confirmar quiescencia operacional. Esto no selecciona ninguna opción de bootstrap.
- Se actualizó el perfil [NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md](NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md), commit `8a3495c8b53311b12e681de779fcb40947608ff4`, blob `ef463da2e60a9e08b13f30e8d9d1e62366c0c94e`.
- La adición define un intake escalonado, no una decisión: (1) destino y sistema/versión; (2) modo de lanzamiento y relanzadores conocidos; (3) quién puede detener todos los escritores e impedir reinicios; (4) qué evidencia real permite demostrar esa condición. Solo después se pide el perfil de almacenamiento (E4) si hace falta comparar alternativas.
- No solicitar credenciales, claves, rutas privadas ni datos operativos sensibles. “No sé” es una respuesta válida.
- Si el entorno o el control de relanzamientos no se pueden establecer, P-01/P-05 permanecen `UNKNOWN/BLOCKED`; no elegir B/C/D por descarte. A puede evaluarse si los datos la justifican, pero no queda aprobada por esta nota.
- Solo cambio documental; no runtime/tests/workflows, no tests/CI. Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Continuidad nueva — POCO inicial, PC futura (2026-10-25)

El propietario confirma que el primer prototipo será en su POCO X7 Pro; Nexo también debe poder funcionar en PC y espera tener una PC al ensamblarlo. Tratar esto como objetivo de plataforma/portabilidad, no como prueba de compatibilidad. La PC no está disponible aún y su SO, versión, modo de lanzamiento y control operacional son desconocidos. Mantener la separación núcleo/adaptadores y validar PC cuando exista un entorno concreto.

El POCO aclara el destino inicial (E1), pero no responde todavía E2–E6: modo de lanzamiento, escritores/relanzadores, quién puede detenerlos e impedir reinicios y evidencia verificable de quiescencia. No seleccionar protocolo P-01/P-05 por inferencia: continúan UNKNOWN/BLOCKED; no A/B/C/D seleccionado. No cambiar runtime/tests/workflows ni ejecutar tests/CI sin autorización separada.


## Continuidad de producto — avatar Android proactivo (2026-10-25)

Especificación nueva, creada y leída de vuelta desde GitHub: [NEXO_ANDROID_PROACTIVE_AVATAR_PRODUCT_SPEC_2026-10-25.md](NEXO_ANDROID_PROACTIVE_AVATAR_PRODUCT_SPEC_2026-10-25.md), blob `258e62ee37056d645cdf00aa1c162ed74d17c289`, commit de creación `b9d9a527d890e0e9ee6c3ef023c53d9e306e48ff`.

### Acuerdos del propietario que debe conservar el siguiente chat
- Nexo debe sentirse como asistente personal persistente, no solo chatbot.
- Avatar pequeño y animado flotante sobre otras aplicaciones; puede tocarse para abrir un panel, conversar por voz/texto, revisar avisos y administrar preferencias. Ocultar/cerrar avatar no debe borrar identidad ni continuidad.
- Frase de activación deseada: “Nexo”. Investigar detección local si es viable; no fingir escucha, no asumir grabación permanente ni transmisión remota.
- Iniciativa proactiva con cinco clases de fuentes autorizadas para diseñar: tareas/recordatorios asignados a Nexo; notificaciones del teléfono; calendario/eventos autorizados; señales operativas/de seguridad observables de Nexo; contexto adicional solo con permiso explícito específico.
- El diseño incluye propuesta P0 crítico / P1 importante / P2 informativo / P3 silencioso; umbrales aún pendientes.
- Principios: mínimo privilegio, transparencia, revocación, retención limitada, separación Nexo/Lúmina, no leer indiscriminadamente contenido privado ni códigos de autenticación, y detección/notificación no equivale a autoridad para ejecutar efectos.
- Destino inicial: POCO X7 Pro / Android 16. PC futura es objetivo de portabilidad, pero su SO/entorno aún no se conoce y compatibilidad no está demostrada.
- El propietario recordó que ya había permitido considerar modificaciones del teléfono/sistema e incluso desbloqueo del bootloader si fuese necesario. Esto es margen de exploración, NO decisión de desbloquear ni autorización para borrar datos, root, flashear o cambiar firmware. Primero demostrar necesidad, evaluar alternativas y riesgos, respaldar datos y obtener confirmación específica antes de cualquier paso irreversible.
- Revisar restricciones reales del Android del POCO: superposición, foreground service/notificación persistente, restricciones en segundo plano, batería, micrófono, pantalla apagada, permisos de notificaciones/calendario y revocación.
- Orden sugerido: preferencias/privacidad/quiet hours/retención; recordatorios deterministas; calendario y notificaciones; avatar/panel; wake word local; fuentes contextuales después, con permisos y contratos separados.
- Todo lo anterior es DISEÑO DOCUMENTADO, no implementación ni pruebas. No se ejecutaron tests/CI ni se modificaron runtime/tests/workflows.
- En el chat siguiente, primero ruta canónica STATUS → MASTER → CORE → handoff; luego leer esta especificación. Mantener este trabajo de producto separado del cierre NCS M0 y de la autoridad inicial/efectos protegidos.


## Continuación documental posterior — actualización STATUS y cierre de H8 (2026-10-25)

### Evidencia de rama
- HEAD observado antes de esta actualización: `02fe6ecbff4a92be3d49881740e8dcb7b2a4cf0f` (la rama puede avanzar; volver a consultarlo al retomar).
- `NEXO_NCS/STATUS.md` fue reordenado para que los pins activos y el siguiente bloqueo aparezcan arriba, antes de la cronología. Blob tras esa edición: `c54aeff01f65ebc786852f5742377328f8df6bb0`.
- Commit de actualización del índice: `02fe6ecbff4a92be3d49881740e8dcb7b2a4cf0f`.
- Los tres encabezados históricos ambiguos se etiquetaron en commit `8932c33241e3c7193257e154b1f19248226f5ec5`; la historia no se borró.

### Conclusión documental que no debe repetirse
- H2: los identificadores reutilizados no demuestran colisión semántica local; las referencias cruzadas deben cualificarse por familia/documento.
- H4: existe el crosswalk intake 1–5 → D3 E1/E3/E2/E2-E5-E6/E4, pero la cobertura es parcial y escalonada. No equivale a completar E1–E6.
- H8: los encabezados ambiguos se normalizaron; preservar bloques históricos, no volver a realizar la misma limpieza salvo evidencia concreta de un nuevo conflicto.
- Gemini no ha aportado, en los comentarios consultados, una revisión nueva con evidencia independiente. No describir el cotejo de ChatGPT como validación independiente de Gemini.

### Próxima acción — raíz/caller y admisión, no nueva auditoría general
El bloqueo de diseño es que el repo inspeccionado no demuestra un caller operativo de provisioning que conecte `--root <directory>` con las stores canónicas y con autoridad operacional suficiente. El CLI inspeccionado todavía admite rutas separadas legacy y bootstrap independiente; esto es una brecha documental de conformidad, no permiso para parchear.

Pedir revisión independiente solo sobre esta afirmación concreta: ¿hay en los artefactos fuente citados evidencia de un caller operativo/deployment que cierre la brecha, o el repo solo contiene entrypoints de CLI sin provisioning operativo seleccionado? La respuesta debe citar archivo, blob/HEAD, líneas y separar hecho observado, inferencia y UNKNOWN. No repetir el censo de callers ya registrado.

Si el repo no puede probar un despliegue real, la pregunta no se resuelve por otra búsqueda interna: se mantiene `UNKNOWN/BLOCKED` y el propietario tendría que aportar la evidencia externa mínima ya listada en el inventario: (1) invocador real, (2) raíz física y derivación de rutas, (3) actores que escriben/lanzan y autoridad para detenerlos, (4) condición observable de admisión cerrada, (5) política de corte parcial/release/readmisión.

### Límites canónicos
- M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`.
- Authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.
- No tests/CI, cambios runtime/tests/workflows, instalación o modificación de dispositivo. No inventar caller, wrapper, flags ni política de fallback.


## Continuación documental — matriz de validación controlada (2026-10-26)

- **Artefacto nuevo:** [NCS M0 controlled validation design and claim/evidence matrix](NCS_M0_CONTROLLED_VALIDATION_DESIGN_AND_CLAIM_EVIDENCE_MATRIX_2026-10-26.md), commit de creación `dfff88c3dbacf09064fd883decff1dbe4b6849ce`.
- Contiene CVM-01…CVM-10 con claim, precondiciones, evidencia futura requerida y límites actuales; añade puerta de admisión previa a cualquier propuesta de ejecución. Ningún claim se considera probado por esta matriz.
- La matriz separa explícitamente POCO X7 Pro/Android M1 (objetivo inicial del prototipo) del CLI Node.js M0 en el repositorio. No se encontró evidencia documental de que Android M1 lance esos scripts; ausencia de integración en las fuentes inspeccionadas no prueba imposibilidad externa.
- Revisión independiente focalizada solicitada en [issue #107, comentario 6406540022](https://github.com/snowdenxrp/aldea-ia/issues/107#issuecomment-6406540022): verificar la frontera M0 Node CLI/M1 Android y especificar únicamente la evidencia mínima faltante. No atribuir respuesta a Gemini hasta comprobar un comentario nuevo.
- La autorización del propietario cubre únicamente diseño documental. La matriz no autoriza tests/CI, runtime, instalación, uso de claves/datos reales ni modificación del dispositivo.

### Siguiente paso
1. Si llega respuesta independiente, contrastar solo los claims concretos y corregir cualquier afirmación no sostenida por los blobs/HEAD que cite.
2. Mientras tanto, no abrir otra auditoría general. Mantener el caller operativo y el modo de lanzamiento como `UNKNOWN/BLOCKED` salvo evidencia externa real.
3. No pedir de nuevo cuál es el dispositivo objetivo: POCO X7 Pro/Android M1 ya está identificado. Lo que falta es determinar qué entorno ejecuta el CLI M0 y, si se pretende validar en él, cuál es su invocador real.


## Continuación documental — recuperación explícita del bloqueo M1 (2026-10-26)

El propietario recordó que M1 tenía un fallo observable importante: **repetía la misma respuesta/frase genérica en preguntas diferentes** (ejemplo histórico: «¿Quieres hablar de algo?»). No permitir que este problema desaparezca de la continuidad ni confundir carga correcta del modelo/compilación con conversación funcional.

- Registro canónico nuevo: [M1 repeated response/context-generation blocker](../M1_ANDROID/M1_REPEATED_RESPONSE_CONTEXT_GENERATION_BLOCKER_2026-10-26.md), commit `9162100a64d1d7ac075a8307dc9420c6e9263da9`.
- Fuente M1 actual inspeccionada estáticamente: `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt`, blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`. `sendPrompt()` pasa el prompt actual a `sendUserPrompt` y agrega el flujo recibido directamente a la UI; la reconstrucción del contexto depende del wrapper nativo. Esto no demuestra por sí solo la causa exacta del síntoma.
- En la rama histórica `ncs/m1-fix-chat-context-generation-limit` existen una auditoría de salida/contexto (blob `1029dce05ad6ef39f6c077ba756e6dfe79d8dba9`) y un plan de regresión (blob `9bb6aa11c9b240f6c47a369e82b9bcb6e769485a`). La revisión histórica señaló dos focos: extracción segura del sufijo del historial (prefijo exacto, BOS/EOS/saltos de línea) y posible doble contabilización del prompt en el límite de generación. No afirmar que estos fixes estén en el HEAD canónico hasta reconciliar blobs/commits.
- Los criterios futuros incluyen: respuesta exacta `VERDE`, aritmética 17×23=391, recuperación mult-turn de `AZUL-27`, tres preguntas distintas consecutivas sin respuesta repetida, medición real del límite de tokens y fallo cerrado ante mismatch de plantilla/contexto.
- **No se ejecutaron** tests/CI ni validación en dispositivo. No generar ni instalar APK, no borrar/reinstalar la app ni volver a descargar/reimportar el modelo sin evidencia de necesidad. La autorización actual sigue siendo documental únicamente.

### Siguiente paso combinado
1. Primero conservar el bloqueo M1 y reconciliar documentalmente la corrección histórica contra el HEAD actual (identificar qué commits/blobs de la rama de corrección están o no integrados); no hacer cherry-pick ni modificar runtime.
2. Después continuar el bloqueo M0 de caller/root y esperar la revisión independiente del issue #107. No repetir auditorías cerradas ni cambiar gates.


## Continuación documental — reconciliación de M1 histórico (2026-10-26)

**Nuevo artefacto:** [M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md](../M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md), commit `86db80ff52566c48e774888b02a93ac387255ec1`. El registro de bloqueo M1 fue actualizado en commit `2c88171962b59d90dd75fa28eb856f5e2712279a`.

### Resultado de la comparación exacta

- HEAD canónico observado: `d6d08c086c55a6f297bf73d8d23d4f4266f23d04`.
- La rama `ncs/m1-fix-chat-context-generation-limit` está divergida de `ncs-clean-architecture`; GitHub compare reportó `diverged`, `ahead_by=3518`, `behind_by=41`, merge-base `0a8b5a0d8bde2d91b78e3eb1ea5a1d563dbdc852`. No tratar la rama como un parche limpio ni hacer cherry-pick por inferencia.
- `MainActivity.kt` canónico blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0` y el histórico blob `9cff99daaf48a91eb1076236ad1aae1733834f59` mantienen el mismo flujo de prompt→motor→stream visible. Las diferencias de UI observadas no acreditan la corrección del contexto.
- El script histórico `NEXO_NCS/M1_ANDROID/apply-native-diagnostics.py`, blob `7ea0f3e56dac32680d8bcaee69eafc90b4419ef3`, propone cambios nativos de plantilla Qwen3/Jinja, prefijo exacto del contexto, BOS y contabilidad de tokens. El script no está en el árbol canónico inspeccionado y no se ejecutó.
- La auditoría histórica blob `1029dce05ad6ef39f6c077ba756e6dfe79d8dba9` y plan de regresión blob `9bb6aa11c9b240f6c47a369e82b9bcb6e769485a` tampoco están en el árbol canónico inspeccionado.

### Conclusión y siguiente acción

La integración de la corrección es **NO EVIDENCIADA / UNKNOWN**. La identidad y comportamiento de la APK instalada siguen **UNKNOWN**. Mantener el problema de respuestas repetidas abierto. Si se continúa, rastrear documentalmente los commits exactos que introdujeron el script y los cambios de fuente upstream; no aplicar el script ni copiar código a la rama canónica sin revisión y autorización separada.

La autorización actual no cambia: solo diseño documental/lectura estática. No tests, CI, build, APK, instalación, cambios de runtime ni dispositivo. M0 sigue INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; authorization NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


### Resultado adicional — commits históricos de M1

Se identificaron los commits históricos concretos:
- `f2c33093cf9e08e777f3041832ff14c76acb545f` — Qwen3 thinking/template.
- `83ad5f40a1a7ff4add68c61b301ebfb39e54fe65` — tokenización/límite.
- `695ff1249cffc3560db4e971dd07a3bab2320ff0` — rechazo fail-closed de historial inconsistente.
- `e5fd005495d03d0e937c9b200adee447e3de8a28` — BOS/EOS/newline.
- `4789f74289aac92140f9ee39ae2d4bff35635d6b` — anchors del script.
- `b5bad536ea5ba928f750dd9d9116301d18bcddbb` — aserciones de invariantes.
- `a7d1076f32891c5044a2e7a12369853f4b9df347` — plan de regresión.

Comparados contra `ncs-clean-architecture`, los commits representativos siguen divergidos y comparten el merge-base `0a8b5a0d8bde2d91b78e3eb1ea5a1d563dbdc852`; no son ancestros directos del HEAD canónico. Esto refuerza que la integración no puede asumirse. No excluye un port manual equivalente, pero ese port tampoco está demostrado; no ejecutar builds/tests ni aplicar cambios.


## Continuación M1 — fuente upstream fijada y parche no aplicado (2026-10-26)

**Hallazgo nuevo y más fuerte que la reconciliación de ramas:** el flujo de build canónico inspeccionado descarga el upstream de `llama.cpp` en `10a60cf303566e10d6a7a2774c17d2085503d87b`, verifica ese SHA y solo copia la configuración Gradle. No ejecuta el script histórico `apply-native-diagnostics.py`.

Evidencia:
- Preparador canónico `NEXO_NCS/M1_ANDROID/prepare-llama-android.sh`, blob `1981bf23223f5ac580ed604c7c67efbcd54e86c8`.
- Workflow `.github/workflows/nexo-m1-android-build.yml`, blob `b21eb080d9024c7cf580b7f06729bbe65a89cb59`: invoca el preparador, verifica el source y define `assembleDebug`, sin paso para aplicar el parche histórico.
- Fuente upstream fijada `ai_chat.cpp`, blob `ca6f7172d910da06a26be0eaaa3da1ff01834639`: líneas 289–297 usa `use_jinja=false`; líneas 432–448 calcula el tamaño de prompt antes del truncamiento y lo vuelve a sumar al límite.
- Wrapper Kotlin upstream `InferenceEngineImpl.kt`, blob `a293796f9017326531021c9be38bdd33fcb9667e`, líneas 217–244 pasa la pregunta/límite a la función nativa y emite tokens.
- Informe completo actualizado: [M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md](../M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md), commit `7af4d686e06bc093624a622846c60166e842c402`.
- Registro de bloqueo M1 actualizado: commit `fe0736296a486c4a37f371bcca32bbc64d6ec20c`.

### Interpretación y límites

La inclusión del parche histórico en el flujo de build definido está **CONTRADICHA por los archivos de build inspeccionados**; ya no es solo un caso de “no encontramos el script en el árbol”. Sin embargo, no se ejecutó el workflow, no se produjo APK en esta revisión y no se conoce la identidad de la APK instalada en el POCO. Los defectos de plantilla y contabilidad son observados, pero no demuestran por sí solos la causa completa de la frase genérica repetida.

### Próxima acción documental

1. Inspeccionar solo evidencia de builds ya existentes (si existe), vinculando run → commit → artifact → SHA-256, sin disparar workflow.
2. No reescribir ni aplicar el parche histórico todavía. La corrección debe convertirse primero en un cambio acotado y revisado cuando haya autorización separada para tocar runtime.
3. No repetir una auditoría general ni instalar/desinstalar APK o reimportar el GGUF.

Autorización vigente: solo lectura estática y documentación. No tests/CI, build, APK, runtime, instalación ni dispositivo. M0 y los gates constitucionales no cambian.


### Encargo Gemini #107 — adenda de evidencia publicada (2026-10-26)

Se publicó una adenda estática en [issue #107, comentario 6406887004](https://github.com/snowdenxrp/aldea-ia/issues/107#issuecomment-6406887004). Añade evidencia exacta de la frontera M0/M1:
- README Android declara aislamiento del runtime Node.js/Lúmina;
- Gradle Android solo incluye `:app` y `:llama-lib`;
- `MainActivity.kt` invoca el motor nativo `com.arm.aichat`;
- `prepare-llama-android.sh` descarga el upstream fijado, no invoca los scripts CLI de M0.
La conclusión se limita al diseño fuente inspeccionado; no prueba imposibilidad de una invocación externa ni identifica un caller operativo del CLI M0.

La adenda solicita a Gemini responder solo sobre evidencia de invocación, evidencia externa mínima del caller y separación observado/inferencia/UNKNOWN. **Aún no se debe atribuir una respuesta a Gemini** hasta volver a leer comentarios y encontrar una respuesta nueva distinta de la adenda de ChatGPT.
