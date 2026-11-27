# NCS M0 — Criterios probatorios B2/B3: cleanup replacement-safe y BLOCKED durable

**Fecha:** 2026-11-26  
**Rama:** `ncs-m0-raw1-r1-evidence-criteria-2026-11-26`  
**Base:** HEAD anterior `8890d47b47199052407a726dfe8b4084e6674d2e`  
**Snapshot de producto de referencia:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Tipo:** matriz documental de aceptación/evidencia no normativa. No selecciona mecanismo, no modifica contratos ratificados, no autoriza implementación ni ejecución de pruebas.

## 1. Propósito y precedencia

Este documento convierte los gaps B2 y B3 ya identificados en preguntas de aceptación falsables, para evitar que una futura solución se declare suficiente por usar un lock, un token, un PID, una ruta o un marcador process-local.

Precedencia conservada:
- P05-C es política ratificada: ante incertidumbre, conservar UNKNOWN/BLOCKED; no permitir recuperación automática ni cleanup/readmisión no atribuibles.
- El perímetro protegido O7/P07 fue ratificado por el propietario: Continuity principal; locks/objetos de coordinación; temporales/archivos de publicación; root/namespace relevante; Chronicle separado pero protegido contra interferencias y colisiones.
- C3/G2: clasificar primero el rol del inode; cualquier delta de `nlink` del objeto protegido cuenta como afectación.
- P07 V2.3 y el contrato A/B continúan NO RATIFICADOS. Esta matriz no los eleva a norma.

## 2. B2 — Identidad replacement-safe del objeto limpiado

### 2.1 Claim que debe probarse

Si un actor valida la propiedad/identidad de un objeto de coordinación y después intenta liberarlo o limpiarlo, la operación solo puede afectar al objeto cuya identidad fue efectivamente validada y adquirido por esa operación. Una sustitución concurrente del nombre no debe hacer que el cleanup elimine, trunque, renombre o altere el objeto sustituto ni otro objeto protegido.

La identidad del objeto validado y la identidad del objeto afectado deben quedar vinculadas por evidencia suficiente para el contrato. Una lectura de token seguida de una operación posterior por path no demuestra por sí sola ese vínculo.

### 2.2 Matriz mínima de escenarios

| Escenario adversarial | Oráculo de aceptación | Fallo que mantiene B2 abierto |
|---|---|---|
| El nombre sigue apuntando al objeto original entre validación y cleanup | Solo se afecta el objeto original autorizado; el resultado se atribuye a ese objeto | No puede demostrarse qué objeto fue afectado |
| El nombre se sustituye después de validar y antes de cleanup | El sustituto permanece intacto; cleanup no se redirige al nuevo objeto | Se elimina o modifica el sustituto, o la identidad afectada queda UNKNOWN |
| El objeto original desaparece antes del cleanup | No se infiere que la operación terminó correctamente ni se borra otro objeto por el mismo nombre | Ausencia/ENOENT se interpreta como permiso para limpiar/readmitir sin atribución |
| El objeto original cambia de tipo, identidad o namespace | STOP/UNKNOWN; no se opera sobre el objeto nuevo por semejanza de nombre/token | Se continúa por path sin resolver la discrepancia |
| El token/metadata es ilegible, parcial, contradictorio o cambia | Retener el estado y bloquear cualquier cleanup no atribuible | Se recurre a PID, edad, nombre o token aislado como autoridad suficiente |
| El cleanup falla a mitad de operación | El residuo y el estado quedan atribuibles; no hay readmisión ambigua | Se pierde la evidencia o se permite un nuevo dueño sin resolver el residuo |

### 2.3 Evidencia necesaria

Para considerar B2 satisfecho en un candidato futuro, el expediente debe contener:

1. Definición explícita de qué identidad se valida y qué objeto/namespace se pretende afectar.
2. Evidencia de la relación entre objeto adquirido, objeto validado y objeto afectado, no solo igualdad de ruta o contenido de token.
3. Interleaving adversarial reproducible que sustituya el objeto en la ventana crítica entre validación y cleanup.
4. Observación posterior del objeto sustituto y del objeto original, con fingerprints antes/después y atribución inequívoca.
5. Casos de ausencia, ilegibilidad, cambio de tipo, error parcial y cleanup fallido, todos fail-closed.
6. Evidencia de que ningún otro activo del perímetro protegido fue alterado como efecto colateral.
7. Repetición bajo el contexto de filesystem/entorno que el gate exija, ligada a SHA exacto y a los artefactos del harness.

Un test que solo comprueba que el token ya era distinto antes de entrar al cleanup no cubre la sustitución **después** de la validación. Un test que inspecciona únicamente el path final tampoco basta si no permite atribuir el objeto que fue afectado.

### 2.4 Estado actual

La inspección existente identificó validación de owner token seguida de `rm(lockPath, { recursive: true })` por nombre en seams de Continuity y Chronicle, sin vínculo atómico demostrado entre el objeto validado y el eliminado. Los tests existentes cubren algunos casos de owner/token distinto y fallos de release, pero no la sustitución en la ventana validación→cleanup.

**B2 permanece CONTRADICTED-CODE/GAP en los seams inspeccionados. P07-C permanece UNKNOWN/BLOCKING.** No se selecciona ni recomienda aquí una primitiva o estrategia de cleanup.

## 3. B3 — BLOCKED durable e interproceso

### 3.1 Claim que debe probarse

Cuando una operación deja el estado de coordinación incierto —por ejemplo, crash, release fallido, residuo no atribuible, identidad sustituida o evidencia ilegible— el sistema debe conservar un estado BLOCKED que una invocación posterior, incluso desde otro proceso y después de terminar el proceso anterior, pueda descubrir antes de cualquier readmisión o efecto protegido.

Un lock vivo puede coordinar participantes mientras existe; por sí solo no demuestra cuarentena durable después de que el proceso dueño termina. Un `Set` o variable en memoria no demuestra persistencia interproceso.

### 3.2 Matriz mínima de escenarios

| Escenario | Oráculo de aceptación | Fallo que mantiene B3 abierto |
|---|---|---|
| Release/cleanup devuelve error y el proceso termina | Nueva invocación independiente descubre BLOCKED antes de adquirir o afectar stores | El nuevo proceso desconoce el fallo y readmite |
| Proceso muere en ventana crítica | Estado durable permite detectar operación incompleta y bloquea readmisión | Desaparición del lock equivale a liberación válida |
| Lock/path está ausente, pero el resultado anterior no puede atribuirse | Ausencia no borra el estado de incertidumbre | ENOENT limpia la marca y habilita adquisición |
| Estado durable está ausente, truncado, ilegible o contradictorio | Fail-closed: UNKNOWN/BLOCKED; no se interpreta como limpio | Estado inválido se trata como ausencia de bloqueo |
| Dos procesos intentan continuar tras el incidente | Ambos observan una decisión coherente; ninguno puede adelantarse a la clasificación | Un proceso readmite mientras otro considera el estado bloqueado |
| Reinicio del proceso dueño o nueva sesión Termux | BLOCKED sigue siendo observable conforme al límite de durabilidad declarado | El bloqueo solo existe en memoria del proceso anterior |
| Se solicita recuperación/reclasificación | Requiere autoridad y evidencia atribuible conforme a P05-C; el sistema no se auto-rehabilita | PID, antigüedad, token, lock ausente o éxito parcial autorizan recuperación automática |

### 3.3 Evidencia necesaria

Un expediente B3 futuro debe incluir:

1. Definición del estado incierto que dispara BLOCKED y de qué operaciones quedan impedidas.
2. Demostración de que la representación de BLOCKED sobrevive al fin del proceso que detectó el incidente.
3. Nueva invocación desde un proceso independiente que descubre BLOCKED **antes** de cualquier readmisión, lectura/escritura protegida o cleanup.
4. Casos de estado durable ausente, corrupto, ilegible, sustituido y parcialmente persistido, con resultado fail-closed.
5. Interleavings de dos o más procesos para demostrar que ninguno puede saltarse la decisión.
6. Evidencia de orden entre registrar el bloqueo y permitir cualquier efecto posterior, sin asumir atomicidad/durabilidad no demostrada.
7. Procedimiento explícito de resolución: actor autorizado, evidencia requerida, clasificación, registro de decisión y transición controlada. Ninguna recuperación automática.
8. SHA exacto de producto, harness, entorno y resultados.

### 3.4 Límites de las pruebas de crash

Deben distinguirse tres clases de evidencia:

- **Terminación de proceso:** demuestra comportamiento tras matar/terminar un proceso y arrancar otro.
- **Reinicio del entorno/dispositivo:** demuestra persistencia bajo el tipo de reinicio realmente ejecutado.
- **Power-loss / durabilidad física:** requiere evidencia específica del comportamiento durable del filesystem y del hardware bajo pérdida de energía.

Una prueba de proceso nuevo no prueba power-loss. Una prueba de CI en runner Linux tampoco prueba por sí sola semántica de Android/Termux R1. No afirmar fsync, orden durable, atomicidad ni resistencia a pérdida de energía sin evidencia correspondiente.

## 4. Oráculo conjunto B2+B3

| Pregunta | B2 | B3 |
|---|---|---|
| ¿Qué objeto exacto se validó? | Obligatorio | Puede ser parte del incidente |
| ¿Qué objeto exacto se afectó? | Debe coincidir con el autorizado | Debe quedar atribuible en el estado de bloqueo |
| ¿Qué ocurre si el nombre desaparece o se sustituye? | No tocar el sustituto; UNKNOWN si no se atribuye | No usar ausencia como autorización de readmisión |
| ¿Qué ocurre tras terminar el proceso? | No asumir que cleanup quedó completo | Nueva invocación debe descubrir BLOCKED |
| ¿Quién puede resolver el estado? | No lo decide cleanup por sí mismo | Autoridad explícita y evidencia; nunca auto-recovery |
| ¿Qué se permite declarar? | Solo alcance cubierto por el interleaving y fingerprints | Solo durabilidad demostrada para el tipo de fallo probado |

B2 y B3 son obligaciones distintas: demostrar cleanup replacement-safe no prueba BLOCKED durable; demostrar BLOCKED durable tampoco demuestra que cleanup no afecte un sustituto. Ambas deben satisfacerse por separado.

## 5. Reglas contra falsos PASS

No aceptar como evidencia suficiente:

- Token correcto en una lectura separada de la operación de cleanup.
- PID vivo/muerto, antigüedad de lock, nombre de archivo o ausencia de path como prueba de propiedad/seguridad.
- Un test de sustitución que no intercale la sustitución en la ventana crítica.
- Un marcador process-local para afirmar BLOCKED durable.
- Una prueba interproceso que retira manualmente el lock y luego observa que el contender continúa.
- Una prueba de terminación de proceso presentada como power-loss durability.
- Un PASS de tests sin SHA exacto, entorno y cobertura del escenario que se afirma.
- Documentación, diseño o matriz de aceptación presentados como implementación o prueba ejecutada.

Los tests actuales sí tienen cobertura parcial de locks, owners, stale locks, espera interproceso y fallos de release; esta matriz no debe describirlos como inexistentes. El gap es que la cobertura observada no satisface los oráculos adversariales específicos anteriores.

## 6. Límites de autorización y estado

Esta matriz no autoriza:
- escoger flock, F_SETLK, F_OFD_SETLK, dirfd/openat2, marker, lock hermano, tombstone, epoch, daemon, journal ni otra primitiva;
- implementar, modificar source/tests/workflows o ejecutar pruebas;
- tocar stores reales, locks, temporales, archivos de publicación o cualquier objeto protegido;
- cleanup, readmisión, recovery, commissioning o efectos protegidos.

Estado conservado:
- B2: **CONTRADICTED-CODE/GAP** en seams inspeccionados.
- B3: **CONTRADICTED-CODE/GAP** en seams inspeccionados.
- P07-C: **UNKNOWN / BLOCKING**.
- P05-C: **RATIFICADA**; P05: **OPEN**.
- O7: **UNKNOWN / OPEN**; P09: **OPEN / UNKNOWN**.
- E2/E3: **PARTIAL / NOT CLOSED**.
- `authorization: NOT_EVALUATED`.
- Commissioning / protected effects: **STOP**.
- NCS M0: **INCOMPLETO**.

La siguiente etapa solo puede convertir estos criterios en trabajo técnico después de resolver la autoridad normativa aplicable y los límites de ejecución. Este documento no altera dichos gates.
