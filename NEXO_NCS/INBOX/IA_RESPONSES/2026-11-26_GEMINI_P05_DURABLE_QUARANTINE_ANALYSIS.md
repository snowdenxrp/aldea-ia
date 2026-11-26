# Respuesta íntegra de Gémini — análisis P05 / cuarentena durable
- Fecha de recepción: 2026-11-26
- Fuente: Gémini
- Proyecto: Nexo NCS M0
- Tema: separación entre lock efímero y cuarentena durable; desarrollo documental de O1–O6; secuencia adversarial A→G.
- Clasificación: ANÁLISIS DOCUMENTAL / PROPUESTA. No constituye evidencia ejecutada, ratificación adicional ni cierre de P05/P07-C.
- Limitación declarada por la fuente: Gémini no tuvo acceso/verificación del repositorio, de los blobs normativos P07 V2.2/V2.3 ni del texto literal de O1–O6. Sus formulaciones son una estructura analítica propuesta, no sustituyen las obligaciones canónicas.

## Texto original íntegro

Respuesta directa a la pregunta central
Para demostrar que una nueva invocación no puede interpretar la liberación de un lock efímero como autorización para continuar, la arquitectura debe probar de forma verificable que la exclusión efímera y la cuarentena durable habitan dominios de verdad separados y asimétricos:
 * Inexistencia de implicación lógica: La ausencia de un lock de proceso activo (o la liberación de descriptores/locks volátiles por el kernel al morir el proceso) es un hecho sobre el ciclo de vida del proceso, nunca una prueba de completitud segura ni de permiso de reingreso.
 * Prevalencia de incertidumbre no resuelta: Cuando un proceso propietario termina sin emitir un cierre acreditado de transición segura, el estado resultante no es «libre» ni «disponible», sino UNKNOWN/BLOCKED.
 * Autorización explícita externa a la invocación: Una nueva invocación solo puede transicionar fuera de UNKNOWN/BLOCKED mediante un acto de readmisión expresamente autorizado y acreditado, jamás por inferencia de ausencia de contención, reintento implícito ni limpieza por expiración o liberación de recursos del sistema operativo.
 * Distinción entre requisito ratificado y propuesta: El principio de no reingreso automático tras corte de proceso sin cierre acreditado forma parte del marco ya ratificado en P05-C (con P05: OPEN y P07-C: UNKNOWN/BLOCKING); lo que falta por demostrar en la especificación y evidencia son las condiciones de suficiencia probatoria (predicados, observables, oráculos y artefactos de auditoría) para que UNKNOWN/BLOCKED sobreviva a la muerte del proceso y sea vinculante para invocaciones posteriores.
1. Separación de estados y dominios
Es indispensable separar siete conceptos que suelen colapsarse cuando se confunde contención concurrente con cuarentena durable:
| Concepto / Estado | Naturaleza | Qué representa | Qué NO demuestra |
|---|---|---|---|
| Exclusión mientras el proceso está vivo | Contención activa / mutual exclusion | Impide que dos procesos activos compitan simultáneamente sobre el recurso o región protegida mientras el propietario sigue vivo. | No garantiza que el trabajo previo haya concluido en estado consistente si el propietario muere. |
| Terminación normal | Cierre ordenado de ciclo de vida | El proceso finaliza su ejecución tras completar o cerrar limpiamente su operación según las reglas del protocolo. | Solo es válida si va acompañada de la acreditación del estado final correspondiente; una salida con código cero sin cierre acreditado no basta por sí sola. |
| Crash del proceso | Interrupción abrupta no coordinada | El proceso se detiene de forma inesperada (señal fatal, fallo interno, caída de runtime o pérdida de ejecución) antes de completar el cierre. | No implica reversión atómica ni estado limpio del dominio afectado. |
| Liberación de locks por el kernel | Efecto de limpieza del sistema operativo | Al morir el proceso, el kernel recluta/libera recursos efímeros asociados a ese proceso (descriptores, bloqueos volátiles ligados a PID/fd/sesión). | No equivale a liberación lógica ni a autorización de continuidad para otra invocación. |
| Persistencia del estado BLOCKED | Conservación durable de restricción | El registro de bloqueo o cuarentena permanece accesible y vigente más allá de la vida del proceso que lo originó o que estaba activo al caer. | Tener un registro almacenado no prueba por sí solo que sea íntegro, no manipulable ni consultado obligatoriamente antes de actuar. |
| Descubrimiento del estado por invocación independiente | Lectura/verificación pre-operativa | Un nuevo proceso o invocación localiza, lee y valida el estado persistido antes de intentar adquirir admisión o mutar estado. | Descubrir el estado no lo levanta; obliga a detenerse si es UNKNOWN/BLOCKED. |
| Procedimiento autorizado de readmisión | Transición gobernada de salida de cuarentena | Acto explícito, verificable y autorizado que evalúa el estado de cuarentena y habilita una nueva admisión bajo reglas definidas. | No ocurre por defecto, por timeout implícito ni por simple presencia de un nuevo proceso. |
> Regla de separación: La exclusión interproceso gobierna concurrencia presente entre ejecutores vivos; la cuarentena durable gobierna continuidad histórica y seguridad tras incertidumbre entre invocaciones sucesivas.
2. Examen documental de obligaciones O1–O6
Dado que O1–O6 figuran como obligaciones documentales, no resultados acreditados (y que el contenido literal exacto de cada obligación O1 a O6 en el blob 7af04a84748bb1174ca5c361d8d0ed24b8d97a43 y en los documentos normativos referenciados no ha sido cargado/verificado en este entorno sin acceso al repositorio), el análisis siguiente define la estructura obligatoria de demostración que debe satisfacer cada obligación On (n ∈ {1..6}) para cerrar la brecha probatoria de P05:
Obligación O1
 * Predicado que debe cumplirse: Para toda operación protegida iniciada bajo admisión, cualquier salida del proceso propietario sin transición de cierre acreditada implica que el estado del ámbito protegido queda en UNKNOWN/BLOCKED.
 * Estado observable necesario: Estado persistido UNKNOWN/BLOCKED vinculado al ámbito/identidad de admisión, distinguible de un estado operativo normal o vacante.
 * Escenario de fallo que debe cubrirse: El proceso propietario muere bruscamente a mitad de una operación protegida sin dejar constancia de cierre válido.
 * Oráculo de aceptación: Verificación determinista de que el estado observable tras la caída es UNKNOWN/BLOCKED y no un estado habilitante para nuevas operaciones.
 * Evidencia necesaria: Traza/registro de estado persistido posterior a la terminación abrupta y prueba documental de trazabilidad desde la admisión hasta el estado UNKNOWN/BLOCKED.
 * Condición que obliga a UNKNOWN/STOP: Imposibilidad de confirmar un cierre acreditado o inconsistencia entre la admisión activa y el registro de cierre.
Obligación O2
 * Predicado que debe cumplirse: La liberación de cualquier recurso efímero o lock gestionado por el kernel al terminar un proceso no altera ni extingue el estado UNKNOWN/BLOCKED.
 * Estado observable necesario: El estado persistido UNKNOWN/BLOCKED permanece intacto después de que el sistema operativo reclame los recursos del proceso caído.
 * Escenario de fallo que debe cubrirse: Una nueva invocación comprueba únicamente si existe un lock efímero activo, observa que el kernel ya lo liberó tras el crash y asume que el recurso está disponible.
 * Oráculo de aceptación: A pesar de que el lock efímero del kernel ya no exista, la consulta de estado arroja UNKNOWN/BLOCKED y bloquea la continuidad.
 * Evidencia necesaria: Evidencia de desacoplamiento entre la vida del proceso/lock efímero y la conservación del estado UNKNOWN/BLOCKED, junto con criterio de verificación que rechace la ausencia de lock efímero como señal de disponibilidad.
 * Condición que obliga a UNKNOWN/STOP: Cualquier escenario donde la ausencia de lock efímero sea el único criterio evaluado o donde no pueda probarse si hubo crash tras la liberación de recursos efímeros.
Obligación O3
 * Predicado que debe cumplirse: Toda nueva invocación independiente debe descubrir y evaluar el estado persistido antes de ejecutar cualquier efecto protegido o adquirir nueva admisión.
 * Estado observable necesario: Resultado de evaluación de estado previo a la admisión que clasifica el ámbito como UNKNOWN/BLOCKED e impide avanzar.
 * Escenario de fallo que debe cubrirse: Un nuevo proceso arranca con identidad distinta o en un ciclo nuevo y omite o no encuentra el estado persistido de cuarentena.
 * Oráculo de aceptación: La invocación independiente detecta UNKNOWN/BLOCKED en su fase inicial y detiene la operación protegida antes de producir mutaciones.
 * Evidencia necesaria: Especificación del alcance de descubrimiento entre invocaciones y evidencia de detención preventiva al encontrar UNKNOWN/BLOCKED.
 * Condición que obliga a UNKNOWN/STOP: No poder localizar o verificar el estado persistido del ámbito protegido durante la inicialización de la nueva invocación.
Obligación O4
 * Predicado que debe cumplirse: El estado UNKNOWN/BLOCKED persiste de forma íntegra y vinculada a su identidad/alcance frente a reinicios de invocación y terminaciones sucesivas.
 * Estado observable necesario: Registro de cuarentena durable que conserva su identidad, alcance y marca UNKNOWN/BLOCKED entre ejecuciones.
 * Escenario de fallo que debe cubrirse: El estado queda solo en memoria volátil del proceso o se pierde/corrompe al caer el proceso propietario.
 * Oráculo de aceptación: Tras múltiples invocaciones o caídas consecutivas, el estado UNKNOWN/BLOCKED sigue presente, legible y no degradado a un estado libre.
 * Evidencia necesaria: Demostración de durabilidad del estado frente a la caída del proceso y de integridad del registro frente a escrituras parciales o truncadas.
 * Condición que obliga a UNKNOWN/STOP: Detección de corrupción, truncamiento, ambigüedad de identidad o ausencia de prueba de integridad del registro persistido.
Obligación O5
 * Predicado que debe cumplirse: Ninguna invocación puede salir de UNKNOWN/BLOCKED sin un procedimiento de readmisión expresamente autorizado y verificable.
 * Estado observable necesario: Estado de bloqueo sostenido hasta que exista una autorización explícita de readmisión válida para el ámbito en cuarentena.
 * Escenario de fallo que debe cubrirse: Una invocación reintenta automáticamente, fuerza su entrada o interpreta una nueva sesión/identidad como autorización implícita para continuar.
 * Oráculo de aceptación: Todo intento de continuación sin readmisión expresamente autorizada es rechazado y mantiene el estado UNKNOWN/BLOCKED.
 * Evidencia necesaria: Reglas formales de autorización de readmisión, criterios de validación de dicha autorización y evidencia de bloqueo ante intentos no autorizados.
 * Condición que obliga a UNKNOWN/STOP: Ausencia de autorización explícita, autorización ambigua/no verificable o discrepancia entre el alcance autorizado y el ámbito bloqueado.
Obligación O6
 * Predicado que debe cumplirse: Toda obligación de O1–O5 cuenta con un oráculo verificable y evidencia trazable, sin sustituir resultados acreditados por supuestos documentales.
 * Estado observable necesario: Correspondencia explícita entre cada obligación, su estado observable, su oráculo de decisión y la evidencia acreditada que lo respalda.
 * Escenario de fallo que debe cubrirse: Se da por cerrado o satisfecho P05 basándose únicamente en la redacción de una intención normativa sin oráculo ni evidencia verificada.
 * Oráculo de aceptación: Cada obligación presenta un criterio de pase/fallo inequívoco y un vínculo verificable con la evidencia correspondiente; cualquier vacío mantiene UNKNOWN/BLOCKED o OPEN.
 * Evidencia necesaria: Matriz completa de trazabilidad de obligaciones, oráculos y evidencias acreditadas (no meramente declarativas).
 * Condición que obliga a UNKNOWN/STOP: Cualquier obligación sin oráculo definido, sin evidencia acreditada o con resultado ambiguo/inconcluso.
3. Análisis documental de la secuencia adversarial (A → G)
| Paso de la secuencia | Qué ocurre | Cobertura en el estado actual (P05-C ratificada, P05: OPEN, P07-C: UNKNOWN/BLOCKING, O1–O6 documentales) | Brecha probatoria / Qué falta demostrar |
|---|---|---|---|
| A. Proceso A adquiere admisión | Se establece una admisión válida para que el proceso A opere sobre un ámbito protegido. | Parcial / documental: Existe marco normativo de admisión/P05-C, pero las obligaciones O1–O6 son documentales y no resultados acreditados. | Falta demostrar cómo queda ligada de forma verificable la admisión otorgada a A con el ámbito protegido y el registro de estado. |
| B. A comienza una operación protegida | A inicia trabajo que afecta o depende del estado protegido. | Parcial / documental: Se asume la existencia de operaciones protegidas bajo admisión. | Falta demostrar qué constancia o frontera separa una operación en curso no cerrada de una operación cerrada con seguridad. |
| C. A termina abruptamente en un punto de incertidumbre | A sufre un crash o salida abrupta sin completar su cierre acreditado. | Principio cubierto en P05-C; evidencia pendiente en O1–O6. | Falta demostrar con evidencia acreditada que el corte abrupto produce indefectiblemente un estado UNKNOWN/BLOCKED y no un estado tácitamente abierto. |
| D. El kernel libera los recursos asociados al proceso | El sistema operativo libera locks efímeros / recursos ligados al proceso muerto de A. | Crítico / brecha central: Es el punto donde la confusión entre lock efímero y estado lógico es más probable. | Falta demostrar de forma concluyente que la liberación por el kernel no limpia ni revoca UNKNOWN/BLOCKED y no habilita reingreso. |
| E. Proceso B inicia una nueva invocación | Un nuevo proceso o ejecución B arranca de forma independiente. | Parcial / documental: Se contempla continuidad entre invocaciones bajo el marco P05/P07. | Falta demostrar que B no puede eludir la verificación previa ni asumir estado limpio por ser una invocación nueva o distinta. |
| F. B encuentra el estado anterior | B consulta/descubre el estado persistido dejado por la historia previa de A. | Insuficiente / no acreditado: Depende de O1–O6 aún no acreditados como resultados. | Falta demostrar el descubrimiento fiable del estado UNKNOWN/BLOCKED por B y qué ocurre si el estado no se encuentra o es ambiguo (debe forzar UNKNOWN/STOP). |
| G. B debe permanecer bloqueado hasta readmisión expresamente autorizada | B queda detenido en cuarentena hasta que exista un procedimiento de readmisión expresamente autorizado. | Núcleo de P05-C y P07-C (UNKNOWN/BLOCKING), pero P05: OPEN. | Falta demostrar el cumplimiento acreditado de las condiciones de bloqueo y readmisión explícita sin atajos ni recuperación implícita. |
4. Resultado esperado para P05
Diagrama de estados (modelo lógico de cuarentena y readmisión)
 * NO_ADMITIDO / INICIAL: Sin admisión activa ni cuarentena vigente para el ámbito.
 * ADMITIDO_OPERANDO: El proceso propietario tiene admisión vigente y ejecuta la operación protegida.
 * CERRADO_ACREDITADO: La operación concluye con cierre acreditado; puede retornar a disponibilidad según reglas del sistema (nunca por crash).
 * UNKNOWN/BLOCKED (Cuarentena durable): Estado obligatorio cuando ocurre terminación abrupta sin cierre acreditado, pérdida de certeza del estado previo, o fallo/ambigüedad en la verificación. El kernel puede haber liberado locks efímeros, pero el estado lógico sigue bloqueado.
 * READMISION_AUTORIZADA: Estado transitorio/condicional alcanzado únicamente mediante un procedimiento de readmisión expresamente autorizado y verificado, desde el cual puede evaluarse una nueva admisión controlada (o volver a UNKNOWN/BLOCKED si la validación falla).
Matriz de transición
| Estado origen | Evento / Condición | Estado destino | ¿Permitido sin readmisión explícita? | Regla de seguridad / Observación |
|---|---|---|---|---|
| NO_ADMITIDO / INICIAL | Se otorga admisión válida y se verifica ausencia de UNKNOWN/BLOCKED | ADMITIDO_OPERANDO | Sí (admisión inicial) | Si existe UNKNOWN/BLOCKED previo, la admisión directa queda prohibida. |
| ADMITIDO_OPERANDO | Terminación normal con cierre acreditado verificado | CERRADO_ACREDITADO / NO_ADMITIDO | Sí (cierre normal acreditado) | Sin cierre acreditado, nunca pasa a estado libre. |
| ADMITIDO_OPERANDO | Crash / terminación abrupta / pérdida de certeza | UNKNOWN/BLOCKED | — (transición forzada de bloqueo) | Ocurre aun cuando el kernel libere todos los locks efímeros del proceso. |
| UNKNOWN/BLOCKED | Nueva invocación B descubre el estado y no hay readmisión autorizada | UNKNOWN/BLOCKED | NO | B debe permanecer bloqueada; la ausencia de lock efímero no desbloquea. |
| UNKNOWN/BLOCKED | Invocación B no puede confirmar estado limpio o hay ambigüedad/fallo | UNKNOWN/BLOCKED (UNKNOWN/STOP) | NO | Ante duda o falta de evidencia, prevalece UNKNOWN/STOP. |
| UNKNOWN/BLOCKED | Procedimiento de readmisión expresamente autorizado y validado | READMISION_AUTORIZADA | NO (requiere autorización expresa) | Habilita reevaluar admisión bajo reglas explícitas; no es automático. |
Fallos que pueden causar readmisión indebida
 * Confusión de lock efímero con estado lógico: Tratar la liberación de un lock de proceso por el kernel al morir el propietario como señal de que el recurso quedó libre.
 * Asunción de estado limpio por crash: Suponer que un proceso caído no dejó efectos parciales o incertidumbre en la operación protegida.
 * Reintento implícito de una nueva invocación: Permitir que un proceso B recién iniciado continúe automáticamente tras detectar que el proceso A ya no existe.
 * Falla en el descubrimiento del estado: Que una invocación independiente consulte un alcance incompleto, no lea el estado persistido o interprete la no lectura como «sin bloqueo» en vez de UNKNOWN/STOP.
 * Degradación silenciosa ante corrupción o ambigüedad: Convertir un registro dañado, incompleto o inconsistente en «libre» en lugar de sostener UNKNOWN/BLOCKED / UNKNOWN/STOP.
 * Autorización tácita o no acotada: Aceptar una readmisión sin verificación expresa, sin correspondencia con el ámbito bloqueado o basada en mera expiración temporal implícita.
Requisitos de persistencia (qué debe demostrarse)
 * Durabilidad más allá del proceso: El estado UNKNOWN/BLOCKED debe sobrevivir a la muerte del proceso propietario y a la liberación de sus recursos efímeros por parte del sistema operativo.
 * Integridad y atomicidad observable: Debe poder demostrarse que el estado persistido no se corrompe de forma silenciosa ante caídas abruptas ni se interpreta como válido si está incompleto.
 * No sobrescritura indebida: Una nueva invocación no puede sobrescribir ni borrar el estado UNKNOWN/BLOCKED por el mero hecho de iniciar o adquirir un lock de ejecución local.
 * Aislamiento frente a limpieza efímera: Los mecanismos de limpieza de recursos volátiles del proceso o del kernel no deben tocar ni invalidar la persistencia de UNKNOWN/BLOCKED.
Requisitos de identidad (qué debe demostrarse)
 * Vinculación inequívoca de ámbito y admisión: Debe quedar claro a qué ámbito protegido, operación o admisión pertenece el estado UNKNOWN/BLOCKED, evitando colisiones o confusiones entre invocaciones distintas.
 * Independencia frente al PID o sesión efímera: Como los identificadores de proceso o locks ligados a un proceso mueren con él, la identidad del estado en cuarentena no puede depender exclusivamente de un lock efímero del kernel.
 * Separación entre identidad del ejecutor caído y la nueva invocación: Que el proceso B tenga una identidad de invocación nueva o distinta no le otorga inmunidad ni derecho a ignorar el estado UNKNOWN/BLOCKED del ámbito.
 * Correspondencia en la readmisión: Cualquier autorización de readmisión debe corresponder inequívocamente con la identidad y el alcance del estado bloqueado que se pretende levantar.
Requisitos de autorización para desbloqueo (qué debe demostrarse)
 * Carácter expreso y no automático: El desbloqueo exige un procedimiento de readmisión expresamente autorizado; nunca puede ser consecuencia automática de un crash, de un reinicio ni de la desaparición del proceso anterior.
 * Verificabilidad: Debe existir forma objetiva de comprobar que la autorización de readmisión es válida, íntegra y aplicable al caso concreto antes de permitir que una invocación continúe.
 * Fallo seguro (UNKNOWN/STOP) ante ausencia o duda: Si no existe autorización expresa verificable, si está incompleta o si no puede validarse su correspondencia, el estado debe mantenerse bloqueado (UNKNOWN/BLOCKED / UNKNOWN/STOP).
 * Trazabilidad del acto de readmisión: Debe quedar constancia verificable de que el tránsito desde UNKNOWN/BLOCKED ocurrió mediante el procedimiento autorizado y no por elusión.
Evidencia que falta para cerrar P05
Acreditación de O1–O6: Pasar de obligaciones documentales a resultados acreditados con oráculos ejecutables/verificables y evidencias asociadas a cada obligación.
Evidencia de la secuencia completa A → G: Demostrar con registros y pruebas verificables que tras la caída de A y la liberación de locks por el kernel, la invocación B detecta UNKNOWN/BLOCKED y permanece bloqueada hasta una readmisión expresamente autorizada.
Evidencia de casos límite / UNKNOWN/STOP: Demostrar el comportamiento obligatorio de detención (UNKNOWN/STOP) cuando el estado es ambiguo, incompleto, no verificable o carece de autorización válida de readmisión.
Reconciliación documental: Alinear y cerrar formalmente la trazabilidad entre el estado P05: OPEN, P07-C: UNKNOWN/BLOCKING y las evidencias exigidas en la normativa P07 V2.2 / V2.3 y en el documento de obligaciones de P05–P07 sin debilitar P05-C.
Distinción: requisitos ya ratificados vs. propuestas de especificación
Ya ratificado (no se cuestiona): La ratificación de P05-C por el propietario y la posición de bloqueo/incertidumbre en P07-C (UNKNOWN/BLOCKING), así como el principio de que una terminación abrupta no habilita continuidad automática sin readmisión expresamente autorizada.
Propuestas / precisiones analíticas de esta misión (aún no ratificadas ni acreditadas): La desagregación en siete estados/conceptos, la formulación detallada de predicados, estados observables, escenarios, oráculos y condiciones UNKNOWN/STOP para O1–O6, el mapeo de brechas de la secuencia A–G y la sistematización de requisitos de persistencia, identidad y autorización para cerrar P05 (actualmente OPEN).
