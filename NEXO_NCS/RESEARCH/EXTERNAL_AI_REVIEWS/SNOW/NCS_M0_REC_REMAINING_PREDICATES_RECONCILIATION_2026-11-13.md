# NCS M0 — Matriz de predicados REC restantes tras A-04 (2026-11-13)

**Estado:** RECONCILIACIÓN DOCUMENTAL / NO ES AUTORIZACIÓN OPERATIVA.  
**Base:** REC V4 (blob d7c96c5243e170f2b4c694ff9101dc9992b1e879), A-04 Owner Decision Brief (blob 0cd7dc5460f08f213f49439e1d65fbfc68eb0762), P07-A identity specification (blob d66ef010ccbab2160ae75452f5f09bb7344284c0), G-08 decision brief (blob fffbd43bfd0c09db582a334d1089a96461292be8).  
**Límite:** análisis documental únicamente. No código, pruebas, CI, runtime, dispositivo, commissioning, rollback ni efectos protegidos.

## 1. Cambios válidos después de la ratificación A-04

- A-04 opción A: **RATIFICADA**. La atestación del propietario es requisito de REC, explícita, fuera de banda, específica del incidente y registrada externamente.
- A-06 / P07-A opción A: **RATIFICADA**. R-OBJ y R-NAME se verifican por separado; atributos descriptivos no prueban identidad post-restore; sin identidad verificable, UNKNOWN/STOP.
- D-RB-09 A: **RATIFICADA**. Registro externo obligatorio.
- G-08: **UNKNOWN**. A-04 no elige canal, formato ni custodio.
- D-RB-04 A: **RATIFICADA, NO SATISFECHA**. El registro humano no se presume ancla monotónica.
- REC: **BLOQUEADO**. A-04 y A-06 no autorizan su ejecución.

La sección §5 de REC V4 debe leerse con la actualización de A-04 y A-06: las referencias que dicen “no decidida” están supersedidas en cuanto al estado de esas decisiones, pero sus límites y dependencias técnicas permanecen.

## 2. Matriz de P-R1.1…P-R1.8

| Predicado | Regla documental disponible | Estado residual real | Qué falta para poder evaluarlo | Tipo de cierre |
|---|---|---|---|---|
| **P-R1.1 — admisión cerrada; MED detenido o diagnóstico** | ACA-1 §2.6 define congelar admisión, mutaciones y limpieza; MED detenido/diagnóstico | Regla definida; cumplimiento técnico UNKNOWN | Evidencia de que todas las entradas de admisión están cerradas y MED no puede mutar ni ejecutar trabajo de negocio durante REC | Técnico; no se cierra con documentos |
| **P-R1.2 — inventario de evidencia** | REC V4 enumera GEN por copia, identidad, leases, procesos y registro del ejecutor | Lista conocida; completitud y umbral de suficiencia UNKNOWN | Matriz fuente→dato→cobertura→frescura→independencia→limitación; definición de qué ausencia/inconsistencia obliga a UNKNOWN | Mixto: criterios documentales preparables; cobertura real requiere evidencia |
| **P-R1.3 — QRT con diagnóstico; nada activado** | C09/D-RB-08 A exigen cuarentena antes de activar; ACA-1 define QRT | Obligación definida; verificación técnica UNKNOWN | Evidencia de que el estado sospechoso y diagnóstico quedan retenidos y que ningún consumidor puede activarlos fuera de REC | Técnico |
| **P-R1.4 — ningún poseedor vivo con capacidad sobre RES** | REC V4 lo vincula a SUP y enumeración de procesos/poseedores | UNKNOWN; disponibilidad y cobertura de /proc en Termux no demostradas | Definir universo de poseedores y vías de transferencia/herencia; demostrar enumeración completa y revocación; T-04 debe aportar evidencia específica autorizada | Mixto; el criterio puede precisarse, la capacidad requiere evidencia de plataforma/dispositivo |
| **P-R1.5 — R-OBJ y R-NAME vigentes** | A-06/P07-A ratificada: identidad de objeto y nombre separados; P7A-1/P7A-2 | Norma ratificada; validez post-restore y umbrales técnicos UNKNOWN | Umbral para R-NAME; verificación de dev/ino/GEN/hash/nlink; demostrar qué propiedades sobreviven y cuáles no tras crash/restore; no usar atributos descriptivos como sustituto | Mixto; política definida, demostración técnica pendiente |
| **P-R1.6 — atestación externa del propietario** | A-04 opción A ratificada; REC V4 define contenido mínimo de la atestación | Decisión cerrada; satisfacción por incidente imposible mientras G-08 siga UNKNOWN | Ratificación de canal/formato/custodio en G-08; después, atestación concreta del incidente y referencia al QRT/disposición | Decisión de propietario + evidencia por incidente |
| **P-R1.7 — GEN fresca invalida leases anteriores** | ACA-1 §2.6 define nueva GEN tras pasos 4–6; REC V4 aclara que GEN la emite el sistema, no es testigo externo | Semántica propuesta; emisión, persistencia, unicidad e invalidación técnica UNKNOWN | Definir dominio/alcance de GEN y demostrar que todos los leases previos quedan rechazados tras reinicio/restore; no atribuirle detección externa de RB-3/RB-4 | Mixto; semántica y evidencia técnica |
| **P-R1.8 — transición a NORMAL** | REC V4 restringe REC a E-A y exige P-R1.1…P-R1.7; primera operación = verificación, no negocio | Condición documental propuesta; enforcement UNKNOWN | Demostrar que la transición solo puede ocurrir con todos los predicados satisfechos, que E-B/E-C quedan excluidos y que E-D no se reclasifica automáticamente como E-A | Técnico, dependiente de todos los anteriores |

## 3. Escenarios y límites ya suficientemente definidos

| Escenario | Disposición vigente | ¿REC puede cerrarlo? |
|---|---|---|
| **E-A — crash ambiguo sin rollback** | Único candidato a REC, condicionado a evidencia suficiente y P-R1.1…P-R1.8 | Solo cuando todos los predicados estén demostrados |
| **E-B — rollback detectado** | STOP/UNKNOWN + BLOCKED; no existe vía de salida aprobada | No; excluido de REC |
| **E-C — rollback sospechado**, incluido RB-3/RB-4 indetectable desde dentro | STOP/UNKNOWN + obligación normativa BLOCKED; enforcement técnico UNKNOWN | No; excluido de REC |
| **E-D — evidencia insuficiente** | BLOCKED/QRT; no se convierte automáticamente en E-A al aparecer más datos | No, hasta que la evidencia establezca que el caso subyacente es E-A |

No se necesita una nueva decisión para mantener E-B/E-C fuera de REC: esa exclusión conserva D-RB-01 y D-RB-05. Cualquier futura vía de salida para E-B/E-C exigiría una decisión nueva y no forma parte del cierre documental actual.

## 4. Subpredicados de cuarentena aún UNKNOWN

- **Q-1 integridad:** algoritmo, alcance y criterio de aceptación no definidos.
- **Q-2 coherencia RES↔COORD↔AUTH:** la detectabilidad varía por alcance; umbral de coherencia no definido.
- **Q-3 vigencia/currentness:** no existe definición suficiente de vigencia para los datos restaurados.

Estos subpredicados impiden declarar P-R1.3/P-R1.8 satisfechos. No se deben rellenar con “hash válido”, “GEN coincide” o “datos legibles” sin una regla que demuestre que esa propiedad responde al claim concreto.

## 5. Orden de trabajo restante, sin repetir tareas cerradas

1. **G-08:** obtener decisión del propietario sobre canal, formato y custodio; después documentar el canal concreto y verificar que está fuera del dominio restaurable.
2. **P-R1.2 / Q-1…Q-3:** preparar una matriz de evidencia y criterios de suficiencia sin declarar evidencia existente ni inventar umbrales.
3. **P-R1.4:** delimitar formalmente el universo de poseedores y las vías de herencia/transferencia; la prueba de cobertura depende de T-04 y autorización técnica.
4. **P-R1.5:** consolidar A-06/P07-A con los umbrales R-OBJ/R-NAME y separar regla ratificada de demostración técnica.
5. **P-R1.7:** especificar alcance de GEN y su relación con leases; mantener explícito que GEN local no es ancla externa.
6. **P-R1.1/P-R1.3/P-R1.8:** conservarlos como condiciones de enforcement verificables, no como casillas satisfechas por diseño documental.
7. Solo después de autorización expresa para las tareas técnicas se podrá evaluar cumplimiento real. La documentación no puede convertir UNKNOWN en PASS.

## 6. Estado final de esta reconciliación

- A-04: RATIFICADA — opción A.
- A-06/P07-A: RATIFICADA — opción A.
- D-RB-09 A: RATIFICADA.
- D-RB-04 A: RATIFICADA, NO SATISFECHA.
- G-08: UNKNOWN — decisión del propietario pendiente.
- P-R1.1…P-R1.8: reglas parcialmente definidas; cumplimiento técnico no demostrado.
- Q-1/Q-2/Q-3: UNKNOWN.
- E-B/E-C: excluidos de REC; STOP/UNKNOWN/BLOCKED.
- REC/readmisión: BLOQUEADO.
- P05: OPEN.
- P07-C: UNKNOWN/BLOCKING.
- M0: INCOMPLETO.

**Esta matriz no autoriza ni ejecuta REC y no altera ningún estado operativo.**


## 7. Delta de decisión G-08 — 2026-11-13

El propietario ratificó la Opción A: repositorio remoto GitHub privado y dedicado; un Markdown estructurado por incidente; custodia del propietario. Por tanto, la decisión de patrón ya no está pendiente. **La instancia concreta del canal no existe aún/no está verificada**, por lo que P-R1.6 no queda satisfecho: falta materializar y verificar el repositorio, y cada incidente futuro requerirá su propia atestación externa específica y referencia QRT.

Estado actualizado:
- G-08: DECIDED (Opción A ratificada); materialización y verificación pendientes.
- P-R1.6: requisito de atestación decidido; satisfacción por incidente pendiente; no PASS.
- D-RB-09 A: RATIFICADA; registro externo obligatorio.
- D-RB-04 A: RATIFICADA, NO SATISFECHA; el registro no es ancla monotónica.
- REC/readmisión: BLOQUEADO; P05 OPEN; P07-C UNKNOWN/BLOCKING; M0 INCOMPLETO.

No se crea ni configura un repositorio en esta actualización documental. La integración GitHub disponible no expone creación de repositorios. No se autoriza REC, readmisión, rollback, implementación, pruebas, CI, dispositivo, commissioning ni efectos protegidos.
