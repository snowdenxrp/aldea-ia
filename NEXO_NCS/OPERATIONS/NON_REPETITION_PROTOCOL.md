# NCS — PROTOCOLO PERMANENTE DE CONTINUIDAD Y NO REPETICIÓN

**Estado:** propuesta documental en PR #111; vigente operativamente solo después de integrar este cambio en la rama canónica.  
**Ámbito:** NCS M0. No amplía autorizaciones ni cambia gates.

## 1. Propósito

Evitar que una conversación nueva vuelva a descubrir, investigar o corregir un asunto ya identificado. La continuidad no depende de la memoria implícita del modelo: depende de referencias físicas, evidencia ligada a versiones y un registro explícito de trabajo conocido.

## 2. Secuencia obligatoria antes de actuar

Al recibir la palabra de continuidad NCS, antes de buscar, auditar, editar o proponer trabajo:

1. Leer NEXO_NCS/STATUS.md y seguir únicamente el handoff que allí esté señalado como vigente.
2. Leer NEXO_NCS/README.md, MASTER/README.md, la directiva estratégica y CORE/README.md usando sus rutas físicas verificadas.
3. Leer este protocolo y la sección **Trabajo conocido — NO REPETIR** del handoff vigente.
4. Abrir solo el documento BUILD de la tarea activa y sus referencias citadas.
5. Comprobar si el asunto ya aparece como resuelto, abierto, bloqueado, histórico o sustituido por evidencia posterior.
6. Si ya está documentado, reutilizar la evidencia existente. No volver a ejecutar la investigación para “confirmarla”.

Si falta una fuente obligatoria o hay contradicción entre ramas/snapshots, detener la conclusión afectada y marcar UNKNOWN-STOP; no reconstruirla por memoria ni por inferencia.

## 3. Registro mínimo para cada asunto

Todo asunto que consuma trabajo debe quedar identificado en el handoff vigente o en el documento BUILD de su tarea con:

- **ID estable:** identificador único; no crear otro ID para la misma causa.
- **Asunto y alcance:** qué se examinó y qué no.
- **Clasificación:** RESUELTO, ABIERTO, BLOQUEADO, HISTÓRICO/SUPERADO o UNKNOWN.
- **Evidencia:** ruta física, rama/ref, commit SHA y blob SHA cuando estén disponibles.
- **Conclusión reutilizable:** qué se puede afirmar y qué no.
- **No repetir:** pasos, auditorías, comandos o inventarios ya ejecutados.
- **Condición de reapertura:** evidencia concreta que justificaría volver a trabajar.
- **Siguiente acción:** una sola acción ejecutable, o NINGUNA si está cerrado/bloqueado.

No declarar RESUELTO por haber redactado una propuesta, creado una rama o abierto un PR. La integración y verificación requeridas deben constar por separado.

## 4. Regla de reapertura — evidencia nueva obligatoria

Un asunto conocido solo puede reabrirse si aparece al menos uno de estos cambios verificables:

- cambia el commit/blob SHA del código o documento relevante;
- aparece una ruta, caller, loader, consumidor o superficie no cubierta previamente, con referencia concreta;
- un test, CI o experimento nuevo contradice la conclusión anterior y está ligado a SHA, comando y entorno;
- el propietario modifica/ratifica una decisión o autorización;
- aparece evidencia nueva del entorno dentro del alcance y ventana definidos.

La curiosidad, una conversación nueva, un resumen de otra IA o la ausencia de memoria del chat no son evidencia nueva. Si no hay delta verificable, reutilizar el registro y avanzar al siguiente gap.

## 5. Clasificación para evitar falsos descubrimientos

- RESUELTO: criterio satisfecho y evidencia suficiente; no repetir.
- ABIERTO: brecha concreta conocida; continuar desde la siguiente acción registrada, no desde cero.
- BLOQUEADO: falta autoridad, decisión, dependencia o evidencia; no improvisar un mecanismo.
- HISTÓRICO/SUPERADO: válido para su snapshot/fecha, no vigente para el snapshot actual.
- UNKNOWN: no se ha demostrado; conservar el límite y aplicar UNKNOWN-STOP cuando afecte un gate.

Un hallazgo repetido no se convierte en hallazgo nuevo por cambiar de conversación, agente o redacción.

## 6. Incidente de recurrencia ya identificado

**ID:** NCS-CONT-001  
**Asunto:** navegación física incorrecta y repetición de su diagnóstico (MASTER/CORE.md, CORE.md, NCS/STATUS).  
**Recurrencia registrada:** conversaciones del 29-10, 31-10, 01-11 y 07-11-2026.  
**Conclusión reutilizable:** las rutas canónicas verificadas en la rama documental de PR #111 son:
- estado: NEXO_NCS/STATUS.md;
- índice MASTER: NEXO_NCS/MASTER/README.md;
- visión: NEXO_NCS/MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md;
- Core: NEXO_NCS/CORE/README.md;
- handoff vigente de esta propuesta: NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-11-07_M0_CONTINUITY_CORRECTED.md.

**Estado real:** CORRECCIÓN DOCUMENTAL PROPUESTA / PR #111 OPEN-DRAFT-NOT-MERGED. No afirmar que quedó integrada en la rama base.  
**No repetir:** volver a buscar si existe MASTER/CORE.md, repetir el diagnóstico de rutas o crear otro handoff para corregir el mismo puntero.  
**Reapertura permitida:** solo si un fetch de la rama/ref que se esté usando demuestra un cambio real de estructura, un conflicto de rutas o un nuevo puntero incorrecto.  
**Siguiente acción:** integrar/rechazar PR #111 mediante decisión explícita; mientras siga abierto, trabajar desde la rama/ref documentada sin fingir que la corrección ya está en la base.

## 7. Disciplina de cambios y evidencia

- Actualizar el registro existente; no crear informes paralelos para la misma pregunta.
- Antes de crear un archivo, buscar si ya existe un documento canónico que deba actualizarse.
- Mantener separados los snapshots: nunca mezclar evidencia de ramas o SHAs diferentes sin declararlo.
- Toda afirmación PASS debe citar test/experimento, comando, entorno y SHA exactos.
- Los documentos de continuidad no autorizan tests, CI, comandos Termux/POCO, bootstrap, escrituras, commissioning, efectos protegidos ni merges.
- Si una conversación no puede recuperar las fuentes canónicas, pedir el enlace/ref exacto o detenerse; no sustituir la fuente por memoria parcial.

## 8. Prioridad

Este protocolo reduce trabajo repetido; no es una nueva fase de M0 ni un gate técnico adicional. La misión permanece cerrar NCS M0. El trabajo siguiente siempre se toma del gap técnico abierto ya registrado, no de volver a auditar el historial.
