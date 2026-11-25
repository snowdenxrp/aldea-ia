# NCS M0 — Reconciliación C3 / P07-21: hardlinks y nlink

**Fecha:** 2026-11-25  
**Rama:** `ncs-p07-c3-reconciliation-2026-11-25`  
**Clase:** reconciliación documental de decisión existente; no es una nueva ratificación ni evidencia de ejecución.

## 1. Resultado

**C3 no está pendiente de decisión.** La regla aplicable ya fue decidida por el propietario el 2026-11-07 y está registrada en el STATUS y en el handoff canónico:

> Cualquier desplazamiento temporal del nombre protegido o modificación de `nlink` cuenta como afectación del objeto protegido, aunque después se restaure el estado original.

Por tanto, si un hardlink propio apunta al mismo inode que el objeto protegido, eliminar ese hardlink modifica `nlink` del objeto protegido y **constituye afectación**, aunque:
- el proceso haya creado el nombre eliminado;
- el proceso conserve otro hardlink al mismo inode;
- el contenido permanezca accesible y sin cambios;
- el estado final parezca equivalente salvo por `nlink`;
- la modificación sea reversible o posteriormente compensada.

No se requiere una nueva decisión del propietario para este caso. La pregunta C3 planteada en la reconciliación local de Claude queda resuelta por la decisión ya vigente.

## 2. Alcance exacto: objeto protegido frente a temporal propio

La regla anterior se aplica cuando el inode está dentro del rol/alcance del objeto protegido. No se debe extender sin clasificación a todo inode del filesystem.

Antes de interpretar P07-21 Caso A, el fixture debe declarar explícitamente el rol del inode:
- **Inode protegido:** cualquier decremento/incremento de `nlink` es afectación; eliminar un hardlink propio no es cleanup permitido.
- **Temporal propio no protegido:** P07-21 Caso A puede caracterizar un cleanup atribuido, siempre que el contrato del fixture autorice ese cambio y no se lo presente como prueba de integridad de un inode protegido.
- **Rol desconocido o ambiguo:** `UNKNOWN/BLOCKED`; no ejecutar cleanup destructivo ni inferir autorización por la propiedad del nombre.

La atribución de un nombre a la operación y la clasificación del inode son predicados distintos. La primera no anula la regla de integridad del segundo.

## 3. Reconciliación con P07 V2.2 / V2.3

V2.2 P07-21 Caso A describe la eliminación de `n1` propio y la observación del decremento esperado de `nlink`. Ese caso no puede interpretarse como autorización general para modificar un inode protegido.

V2.3 P07-21 Caso A exige atribución autorizada y registra `nlink0` / `nlink1`; el delta V2.3 no sustituye la decisión de propietario del 07-11. Se aplica conjuntamente:
1. clasificar el rol del inode;
2. si es protegido, el cambio de `nlink` es afectación y el cleanup no satisface la política;
3. si es un temporal propio no protegido, el decremento solo puede aceptarse como resultado de caracterización/cleanup propio bajo el contrato específico;
4. si el rol no puede establecerse, UNKNOWN/BLOCKED.

P07-21 Caso B sigue prohibiendo que A elimine el nombre ajeno creado/sustituido por B. Que `n2` sobreviva no neutraliza la afectación por decremento de `nlink`.

Esta reconciliación no modifica la normativa V2.2/V2.3 ni declara ratificada V2.3. Establece cómo debe leerse el oráculo a la luz de la decisión ya ratificada.

## 4. Efecto sobre P05/P07 y O1–O9

- **C3:** RESUELTO por decisión existente del propietario (2026-11-07); no pendiente.
- **G2:** la afectación por cambio de `nlink` del inode protegido ya está cubierta por la decisión del 07-11; no es una obligación nueva que requiera ratificación.
- **P07-C:** UNKNOWN / BLOCKING. La regla normativa no demuestra que el mecanismo actual prevenga la afectación.
- **P05:** OPEN. P05-C permanece RATIFICADA; la decisión no demuestra cuarentena durable, recuperación ni readmisión segura.
- **P09:** alcance declarado ratificado; cobertura efectiva dentro del universo declarado continúa OPEN/UNKNOWN.
- **O1–O9:** criterios de verificación, no resultados. Esta nota no marca ninguna fila PASS ni aporta ejecución.
- **CI:** no se afirma CI-VERIFIED para ningún SHA de producto.

La matriz O1–O9 descrita en el informe local de Claude no se considera publicada ni cotejada remotamente hasta que su rama/commit y blob sean recuperables en GitHub. No se reconstruye ni se duplica esa matriz aquí.

## 5. Evidencia documental cotejada en GitHub

| Fuente | Referencia |
|---|---|
| `NEXO_NCS/STATUS.md` — delta de sesión y decisión de afectación reversible | blob `21e971f1f921753219917dcdc8d52866c69cbca0` en `ncs-continuity-handoff-correction-2026-11-07` |
| `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-11-07_M0_CONTINUITY_CORRECTED.md` — §§ 6.1 y 6.1.1 | blob `1c4878f92d4b7b208b4b8a2640b293810ddd45c4` |
| P07 V2.2 normativa | blob `7ce10f7e02516da4438358c3d637a275001c6019` |
| P07 V2.2 escenarios/oráculos | blob `26404e70d39b3fd29ecfe56e0965917d973bac68` |
| P07 V2.3 delta normativa | blob `0289f4e5f8e6412d593515a61078e27ff8e489bb` |
| P07 V2.3 delta de escenarios/oráculos | blob `b6c4cdcfce1b21d8a6bba23d8df056b763cf002b` |
| P07 V2.3 delta de trazabilidad | blob `7a08e13dbda465eec29afd27ddfeb483c71e7232` |

## 6. Límites y siguiente trabajo

Esta reconciliación es documental. No cambia runtime, tests, workflows, configuración, stores, Termux/POCO, PR #110 ni ramas de producto. No autoriza cleanup, readmisión, commissioning ni efectos protegidos.

Siguiente trabajo técnico, sin repetir la decisión C3:
1. cotejar la rama local de Claude y publicar sus cuatro commits originales si la referencia/objetos pueden transferirse íntegros;
2. verificar la matriz O1–O9 contra los blobs canónicos y corregir únicamente contradicciones demostrables;
3. continuar con el mecanismo durable P05 y el seam interno/atribución P07-C, manteniendo UNKNOWN-STOP mientras no haya evidencia;
4. completar cobertura P09 dentro del universo ratificado y obtener fingerprint verificable del target antes de cualquier claim de plataforma.

**Estado NCS M0: INCOMPLETO.**