# NCS M0 — P-05: definición técnica candidata de política C
Fecha: 2026-11-03
Rama: `ncs-lumina-decoupling-2026-10-29`
Estado: **ANÁLISIS TÉCNICO — C NO RATIFICADA — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y límites

Precisar las consecuencias técnicas de C: conservar `UNKNOWN/BLOCKED` sin recuperación automática. No selecciona C por el propietario, no introduce una primitiva de cuarentena y no modifica runtime/tests/workflows/configuración/dispositivo.

## 2. Política no equivale a mecanismo

**C es una política de decisión:** cuando no hay evidencia suficiente para atribuir el release a la instancia correcta y demostrar que el actor anterior no puede continuar, no se concede readmisión.

**C no es por sí sola un mecanismo de coordinación.** No define cómo una invocación futura descubre una incertidumbre anterior después de que el proceso termina, su estado local desaparece, el lock path está ausente/sustituido/ilegible o un actor previo puede reanudarse.

No se puede afirmar que “dejar UNKNOWN en memoria” garantice bloqueo interproceso tras crash. Tampoco se puede inventar un marcador persistente, lock hermano, tombstone, epoch, daemon o journal para resolverlo: sería una decisión adicional, sujeta a P-07 y autorización aplicable.

## 3. Semántica candidata de C

Si el propietario ratifica C:
1. Toda incertidumbre de release/cleanup se clasifica `UNKNOWN/BLOCKED`.
2. Se conserva por separado el resultado de negocio/persistencia ya demostrado.
3. No se repite la operación de negocio para compensar la incertidumbre.
4. No se realiza una segunda limpieza destructiva por path sin identidad demostrada.
5. Ausencia, antigüedad, PID, timeout, error de parseo o variable local no prueban release ni quiescencia.
6. No se concede readmisión normal mientras la incertidumbre no se resuelva mediante procedimiento aprobado expresamente.
7. Diagnóstico D2 solo observa evidencia externa y metadata del protocolo; no abre stores canónicos, no modifica locks ni concede readmisión.
8. Sin evidencia concluyente, el estado permanece UNKNOWN/BLOCKED.

C no afirma que exista recuperación automática ni que haya un procedimiento manual ya disponible.

## 4. Matriz de transición candidata

| Evento | Negocio/persistencia | Release | Readmisión normal |
|---|---|---|---|
| Adquisición falla antes de obtener admisión, sin store I/O | Sin dispatch/mutación | No adquirida | Bloqueada para ese intento |
| Operación termina y release atribuible se confirma | Resultado observado | Confirmado | Según contrato normal |
| Persistencia confirmada; release incierto | Confirmada | UNKNOWN | BLOCKED |
| Persistencia pudo ocurrir; estado final no demostrable | UNKNOWN | UNKNOWN | BLOCKED |
| Fallo pre-write demostrado; release incierto | Fallo pre-write | UNKNOWN | BLOCKED |
| Owner ilegible, JSON inválido, permisos/tipo inesperados | Sin inferencia adicional | UNKNOWN | BLOCKED |
| Path ausente sin prueba de fin del actor previo | Sin inferencia adicional | UNKNOWN | BLOCKED |
| Señal/crash/cancelación/hijo sin resultado estructurado | Solo lo demostrable | UNKNOWN salvo evidencia independiente | BLOCKED |
| Diagnóstico D2 no concluyente | Sin cambio | UNKNOWN | BLOCKED |

La resolución futura no se describe aquí ni autoriza readmisión: sus predicados requieren contrato y aprobación específicos.

## 5. Qué puede afirmarse sobre cuarentena

- Un Set/variable local puede impedir reentrada en el proceso vivo, pero no coordina procesos distintos ni sobrevive por sí solo al crash.
- Un lock file presente puede hacer que el protocolo rechace una adquisición, pero su presencia no demuestra quién lo posee ni si es seguro retirarlo.
- La ausencia del lock file no demuestra que el actor anterior terminó o no pueda reanudarse.
- Dejar un path intacto evita una limpieza adicional desde ese camino, pero no prueba que otro actor no pueda sustituirlo o eliminarlo.
- La inspección de metadata informa observaciones; no prueba quiescencia si el modelo de actores no lo respalda.

**Conclusión crítica:** C puede definir correctamente el resultado de incertidumbre, pero la garantía de no readmisión entre procesos requiere un medio verificable de hacer cumplir BLOCKED. Si ese medio no está demostrado, el gate debe seguir UNKNOWN/STOP. No se declara C implementada ni P-05 cerrada.

## 6. Efecto sobre E1–E9

| Caso | Exigencia bajo C | Estado heredado |
|---|---|---|
| E1 persistencia confirmada + release incierto | Conservar persistencia; bloquear readmisión/retry | Parcial |
| E2 persistencia UNKNOWN + release incierto | Conservar UNKNOWN; bloquear readmisión/retry | No demostrado |
| E3 sustitución durante cleanup | No borrar sustituto mediante segundo cleanup por path | Riesgo estático confirmado |
| E4 fallo owner + sustitución durante limpieza | No afectar sustituto; si no se prueba, UNKNOWN/BLOCKED | Riesgo estático confirmado |
| E5 owner ilegible/permisos/tipo inesperado | UNKNOWN, nunca ausencia/stale implícito | Parcial/ambiguo |
| E6 path ausente, actor no resuelto | No readmisión por ausencia | No demostrado |
| E7 competidor durante incertidumbre | Competidor no debe entrar | No cubierto |
| E8 evidencia de resolución | No hay recuperación automática | No implementado/no demostrado |
| E9 fallo pre-write + release incierto | Separar negocio y release; sin retry | Parcial |

C no convierte ningún caso en PASS. E3/E4 requieren resolver identidad filesystem; E6/E7 requieren demostrar enforcement interproceso.

## 7. Compatibilidad con P-03/P-04

D1–D6 ratificadas aportan frontera pública, admisión exclusiva normal, diagnóstico limitado, tratamiento UNKNOWN/BLOCKED, clasificación de inputs y límite R1. P-05 aún debe precisar cómo se mantiene el bloqueo después de que el proceso dueño ya no puede conservar estado local. La admisión exclusiva no resuelve por sí sola release incierto; D2 no es una ruta de recuperación.

## 8. Decisiones que seguirían abiertas si se ratifica C

C podría ratificarse como política de no recuperación automática sin escoger una primitiva concreta. Antes de implementar, deben quedar expresos:
1. Si se acepta que, cuando no pueda demostrarse enforcement durable/interproceso de BLOCKED, la instancia permanezca operacionalmente inutilizable y M0 siga STOP, sin workaround improvisado.
2. Si cualquier desbloqueo/recovery queda reservado a decisión futura expresa del propietario y evidencia de un procedimiento concreto.
3. Si se prohíbe borrar/reemplazar manualmente el lock como método de recuperación por defecto.
4. Qué evidencia futura podría reclasificar el estado sin convertir D2 en readmisión.

Recomendación técnica: aceptar 1–3. No son decisiones del propietario todavía.

## 9. Trabajo técnico posible sin ratificación

- Preparar matriz de fallos y resultados separados.
- Diseñar tests deterministas E1/E2/E5/E9 sin mecanismo de recuperación.
- Especificar intercalaciones E3/E4 sin seleccionar primitiva filesystem.
- Documentar por qué E6/E7 no se cierran solo con estado local o presencia/ausencia del path.
- Mantener D2 como inspección limitada y no mutante.

No implementar ni ejecutar pruebas sin autorización específica.

## 10. Estado

- C: **RECOMENDACIÓN TÉCNICA — NO RATIFICADA**.
- P-05: **OPEN / NOT RATIFIED**.
- P-03/P-04 D1–D6: **RATIFICADAS**; enforcement pendiente.
- E1–E9: sin cambio; ningún PASS nuevo.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`; raíz constitucional **PENDING/UNKNOWN**.
- Primera publicación, commissioning y efectos protegidos: **STOP**.
- Documento únicamente; sin runtime/tests/workflows/configuración/dispositivo.
- No se ejecutaron tests/CI/Actions.


---

## DELTA — REVALIDACIÓN DE FUENTES EN HEAD DE RAMA (2026-11-03)

Se revalidaron los dos stores contra el HEAD de rama inmediatamente anterior a este delta. Las identidades de blob coinciden con el snapshot estático ya usado por P-05:

| Fuente | Blob actual |
|---|---|
| `src/nexo/core/continuity-store.mjs` | `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` |

### Continuity — observaciones confirmadas

- `readLockOwner()` captura cualquier error y devuelve `null` (líneas 30–38).
- Durante release, `current?.token !== token` devuelve `not_owned` (68–69). Owner ilegible/no concluyente y token distinto no quedan diferenciados en esa salida.
- Tras fallo del primer `rm`, repite `rm(lockPath)` sin nueva comprobación de identidad (74–90).
- Si falla la escritura inicial de owner, limpia recursivamente el path y absorbe el error de limpieza (58–65).
- `lockReleaseFailures` es estado local del proceso. Si detecta ENOENT, elimina la marca local y permite continuar con adquisición (41–51); ENOENT no prueba por sí solo que un actor previo terminó.

### Chronicle — observaciones confirmadas

- `readLockOwner()` también convierte cualquier error en `null` (48–56).
- Durante release, `owner?.token !== token` devuelve `not_owned` (74–76); se conserva la misma ambigüedad owner ilegible/token distinto.
- Si falla la escritura inicial de owner, limpia recursivamente el path y absorbe el error de limpieza (64–72).
- Release intenta un único `rm`, sin segundo intento explícito (74–85), pero eso no resuelve la carrera entre validación por token y borrado por path.
- La recuperación stale ya falla cerrada con `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED` en vez de borrar el lock por path (126–132). Es una protección localizada de adquisición Chronicle, no evidencia de release seguro ni de readmisión P-05.

### Consecuencia

La recomendación C no se puede describir como ya implementada por el comportamiento actual:
- Continuity aún contiene retry destructivo de cleanup y readmisión tras ENOENT de una marca local.
- Ambos stores pueden confundir owner ilegible con token ajeno al reportar `not_owned`.
- Ambos tienen cleanup recursivo por ruta tras fallo al escribir owner, sin prueba de que el objeto no haya sido sustituido.
- Chronicle rechaza stale recovery, pero su release sigue sujeto a validación/borrado por path.

Esto confirma la necesidad de resolver E3/E4/E5/E6 y demostrar enforcement E7. No se ejecutaron pruebas; los hallazgos son estáticos y están ligados a los blobs anteriores. No se modificó código ejecutable.
