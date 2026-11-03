# NCS M0 — Matriz técnica de aceptación E1–E9 para P-05/P-07
Fecha: 2026-11-03
Rama: ncs-lumina-decoupling-2026-10-29
Base: P-03/P-04 D1–D6 ratificadas; P-05 y P-07 abiertas.
Estado: **DISEÑO DE ACEPTACIÓN — NO IMPLEMENTADO — NO AUTORIZA TESTS NI CAMBIOS EJECUTABLES**

## 1. Propósito y límites

Esta matriz convierte E1–E9 en criterios observables. Evita que un test local de resultado se interprete como prueba de identidad de objeto, quiescencia o exclusión interproceso.

No selecciona primitiva filesystem, no ratifica P-05-C, no define recuperación y no cierra P-07/P-09. No modifica runtime, tests, workflows, configuración o dispositivo. No se ejecutaron tests/CI/Actions.

### 1.1 Dimensiones de resultado

Conservar por separado:
- Operación: NOT_DISPATCHED, COMPLETED, FAILED o UNKNOWN.
- Persistencia: NOT_ATTEMPTED, CONFIRMED, NOT_COMMITTED o UNKNOWN.
- Admisión/release: NOT_ACQUIRED, HELD, RELEASE_CONFIRMED o UNKNOWN/BLOCKED.

Son etiquetas conceptuales, no un esquema implementado. Persistencia confirmada no implica release confirmado. Un fallo de cleanup posterior a una escritura confirmada no convierte esa escritura en fallida ni habilita retry del negocio.

### 1.2 Evidencia mínima

Cada ejecución futura deberá identificar SHA, runtime, escenario, raíz aislada, secuencia ordenada de eventos, barreras deterministas, estado antes/después, resultados separados, procesos participantes, código de salida/señal y resultado padre/hijo cuando aplique. Sleeps no deben ser la sincronización primaria. Logs narrativos sin estado observable no cierran un caso.

## 2. Matriz de clasificación

| Caso | Aceptación exigida | Dependencia | No demuestra por sí solo |
|---|---|---|---|
| E1 | Persistencia confirmada se conserva con release incierto; sin retry/readmisión | Contrato de resultados; harness | Exclusión tras crash |
| E2 | Persistencia no demostrable queda UNKNOWN; sin retry/readmisión | Contrato; inyección de fallo | Que el efecto no ocurrió |
| E3 | Cleanup no elimina un objeto sustituto | P-07: identidad y operación replacement-safe | Quiescencia global |
| E4 | Fallo al escribir owner no autoriza cleanup destructivo de sustituto | P-07 | Seguridad ante todo writer |
| E5 | Owner ilegible/metadata inesperada es incertidumbre, no ausencia/token ajeno | Contrato; fixtures | Recuperación/readmisión |
| E6 | Path ausente no basta para readmitir con actor previo no resuelto | P-05 + enforcement durable | Identidad del último owner |
| E7 | Competidor no entra durante admisión activa ni UNKNOWN/BLOCKED | P-05/P-07; multiproceso | Exclusión fuera de R1 |
| E8 | Solo procedimiento aprobado y predicados demostrados pueden resolver incertidumbre | P-05 + decisión del propietario | Que recovery exista hoy |
| E9 | Fallo pre-write probado se separa de release incierto; sin retry | Contrato; inyección de fallo | Que actor previo terminó |

E1/E2/E5/E9 permiten diseñar pruebas de contrato sin elegir primitiva filesystem. E3/E4 dependen de P-07. E6/E7 requieren enforcement interproceso. E8 no debe implementarse como recovery implícito.

## 3. Criterios por escenario

### E1 — Persistencia confirmada + release incierto
**Setup:** fixture aislada; operación admitida; escritura observable confirmada; inyectar pérdida de evidencia/fallo durante release después del commit.

**Intercalación:** confirmar persistencia; impedir confirmación verificable del release; intentar una segunda invocación normal mientras siga la incertidumbre.

**Observables:** dato persistido; resultado de negocio; persistencia; release; contador de dispatch; store I/O y admisión de la segunda invocación.

**Esperado:** persistencia CONFIRMED; release UNKNOWN/BLOCKED; no reejecutar negocio; segunda invocación bloqueada antes de store I/O.

**Evidencia:** lectura independiente del fixture; contador/journal de dispatch; resultados separados; prueba de bloqueo anterior al store I/O.

**No concluye:** supervivencia del bloqueo tras crash ni cierre de E6/E7.

### E2 — Persistencia UNKNOWN + release incierto
**Setup:** operación admitida; inyección en punto donde la escritura pudo ocurrir pero la confirmación no puede determinarse; release también incierto.

**Intercalación:** provocar ambigüedad de persistencia; perder/cancelar confirmación; observar sin repetir operación.

**Observables:** estado del fixture si puede inspeccionarse sin alterar el caso; resultado estructurado; número de intentos; release.

**Esperado:** persistencia UNKNOWN; release UNKNOWN/BLOCKED; no inferir NOT_COMMITTED; no retry ni readmisión.

**Evidencia:** punto y orden de inyección; resultado sin confirmación; ausencia de segundo dispatch. Una observación posterior del dato no reescribe retrospectivamente el resultado original.

**No concluye:** que la operación no ocurrió ni que D2 pueda leer stores canónicos o autorizar readmisión.

### E3 — Sustitución durante cleanup
**Setup:** lock/objeto original creado; barrera entre última observación de identidad y cleanup.

**Intercalación:** actor de prueba sustituye el objeto por un centinela distinto en el mismo path; el proceso original continúa cleanup.

**Observables:** identidad del original y sustituto; resultado de cleanup; contenido/hash del centinela.

**Esperado:** cleanup no elimina ni altera el sustituto. Si no se demuestra que la operación actúa sobre el mismo objeto cuya identidad se validó, clasificar UNKNOWN y no ejecutar segunda limpieza por path.

**Evidencia:** barrera determinista; identidad antes/después; centinela intacto; resultado estructurado.

**Dependencia P-07:** definir identidad verificable y operación que evite la carrera comprobación/borrado. Esta matriz no elige unlink relativo, handle, inode ni otra primitiva.

**No concluye:** exclusión de otros writers ni quiescencia del actor original.

### E4 — Fallo al escribir owner + sustitución durante cleanup
**Setup:** crear lock path; inyectar fallo al escribir/confirmar metadata owner; pausar antes de cleanup.

**Intercalación:** sustituir path/objeto después del fallo y antes de cleanup; reanudar manejador.

**Observables:** error original; identidad del objeto creado y sustituto; acciones destructivas posteriores; centinela; resultado.

**Esperado:** no eliminar recursivamente objeto que no pueda atribuirse al intento actual. Si identidad no demostrable, conservarlo y clasificar UNKNOWN/BLOCKED; no absorber el fallo como limpieza segura.

**Evidencia:** inyección reproducible; orden de eventos; identidad pre/post; centinela sin cambios.

**Dependencia:** P-07. Simular solo un rm fallido sin sustitución real no cubre la carrera.

**No concluye:** que todas las rutas de error o filesystems compartan semántica.

### E5 — Owner ilegible, metadata inválida o permisos/tipo inesperados
**Setup:** fixtures separadas para JSON malformado/truncado, owner ausente, permiso denegado, path de tipo inesperado y metadata no decodificable.

**Intercalación:** intentar adquisición/release y, por separado, diagnóstico D2; no reparar la fixture durante la observación.

**Observables:** categoría exacta; distinción entre OWNER_UNREADABLE, OWNER_MISMATCH y PATH_ABSENT; store I/O; cleanup; decisión de admisión.

**Esperado:** toda condición que impida atribuir owner permanece incierta. No convertir error de lectura en null equivalente a ausencia; no tratar ilegibilidad como token distinto; no borrar ni readmitir por inferencia. D2 observa solo metadata/evidencia externa permitida y no abre stores ni modifica path.

**Evidencia:** una fixture por clase; matriz de resultados; cero cleanup destructivo y cero store I/O en caminos bloqueados.

**No concluye:** legitimidad del owner, muerte del actor ni recuperación automática.

### E6 — Path ausente, actor previo no resuelto
**Setup:** proceso A obtiene admisión; path desaparece/deja de observarse, pero no hay evidencia aceptada de terminación/quiescencia de A.

**Intercalación:** proceso B intenta admisión; A conserva posibilidad de continuar o reanudarse según el fallo simulado.

**Observables:** estado de A; path; resultado de B; store I/O de B; evidencia independiente de terminación si existe.

**Esperado:** ausencia del path no concede readmisión. B queda UNKNOWN/BLOCKED si no se demuestra que A ya no puede actuar.

**Dependencia:** P-05 define readmisión; P-07 define observación del objeto. Debe incluir proceso separado, no solo borrar variable local.

**No concluye:** que toda ausencia sea insegura; solo que ausencia aislada no satisface quiescencia.

### E7 — Competidor durante admisión activa o UNKNOWN/BLOCKED
**Setup:** dos procesos independientes con misma raíz canónica y barreras coordinadas. Cubrir A activo y A en incertidumbre tras terminación anormal.

**Intercalación:** A adquiere; B intenta simultáneamente. Repetir cuando A entra en incertidumbre de release y B intenta de nuevo. El padre CLI no retiene admisión mientras espera al hijo.

**Observables:** orden de adquisición; store I/O y dispatch de ambos; estado de A; resultado de B; release.

**Esperado:** como máximo un caso normal dentro del intervalo protegido; B no accede a stores durante admisión activa ni UNKNOWN/BLOCKED. Si el bloqueo no se mantiene tras crash/incertidumbre, E7 sigue no demostrado.

**Evidencia:** procesos OS distintos; barreras interproceso; eventos correlacionados; contadores de store I/O; repetición de intercalaciones; SHA exacto.

**Dependencia:** P-05/P-07 y cobertura R1. Dos promesas en un proceso o mutex en memoria no bastan.

**No concluye:** protección universal frente a root, OS comprometido o procesos maliciosos del mismo UID excluidos de R1.

### E8 — Evidencia de resolución y readmisión
**Setup:** estado UNKNOWN/BLOCKED; presentar evidencia candidata insuficiente, contradictoria y —solo cuando exista— evidencia definida por un procedimiento aprobado.

**Intercalación:** invocar D2; después intentar operación normal sin procedimiento/autoridad aplicables.

**Observables:** evidencia examinada; clasificación; mutaciones; transición; store I/O; procedimiento/autorización referenciado.

**Esperado hoy:** no existe ruta automática de recovery/readmisión definida aquí. D2 no cambia estado ni autoriza operación normal. Evidencia insuficiente/contradictoria conserva UNKNOWN/BLOCKED. El caso positivo no se implementa hasta que P-05 y el propietario definan el procedimiento.

**Evidencia futura:** decisión ratificada; predicados verificables; artefacto del procedimiento; trazabilidad; prueba negativa de que D2 por sí solo no desbloquea.

**No concluye:** permiso para borrar/reemplazar manualmente lock ni aprobación de recovery futuro.

### E9 — Fallo pre-write demostrado + release incierto
**Setup:** operación admitida; inyección antes de cualquier write/dispatch durable, con evidencia suficiente de que el write no comenzó; después hacer incierto release.

**Intercalación:** confirmar punto pre-write; inducir fallo de release; intentar retry/readmisión.

**Observables:** contador de writes/dispatch; marcador de entrada al write; operación; persistencia; release; segundo intento.

**Esperado:** FAILED o NOT_DISPATCHED solo si el punto pre-write está probado; NOT_COMMITTED solo si el contrato lo permite; release UNKNOWN/BLOCKED; no retry ni readmisión automática.

**Evidencia:** instrumentación del límite write/dispatch; cero writes; inyección posterior separada; resultados por dimensión.

**No concluye:** que error genérico antes de una respuesta sea pre-write ni que la instancia esté segura para otra operación.

## 4. Secuencia de cierre y dependencias

1. **Sin primitiva filesystem:** congelar contrato de resultados y negativos E1/E2/E5/E9. Diseñar harness es posible; implementarlo/ejecutarlo requiere autorización específica.
2. **P-05:** resolver política de readmisión/release incierto. C sigue sin ratificar; esta matriz no la presupone.
3. **P-07:** especificar identidad de objeto, sustitución, permisos, tipos inesperados y semántica de cleanup. Después convertir E3/E4 en aceptación ejecutable.
4. **Interproceso:** demostrar bloqueo tras crash/path ausente y competencia real dentro de R1. Después evaluar E6/E7.
5. **P-09:** delimitar callers externos/dinámicos. Mapa estático de imports no demuestra cobertura de todos los writers.
6. **E8:** no implementar recovery hasta decisión expresa y procedimiento verificable.

## 5. Clasificación de evidencia

- **DESIGNED:** escenario y resultado esperado descritos.
- **IMPLEMENTED:** existe código/harness.
- **TESTED:** ejecución observada en SHA y entorno identificados.
- **PASS:** observables exigidos coinciden con esperado y ninguna limitación invalida el claim.
- **NOT DEMONSTRATED / UNKNOWN:** falta evidencia o la intercalación no está cubierta.
- **BLOCKED BY DECISION:** requiere decisión de autoridad abierta.

Un PASS individual no cierra E1–E9 ni amplía el modelo de amenaza. No declarar seguro, atómico, exclusivo o recuperable fuera de la propiedad demostrada.

## 6. Estado al emitir este documento

- P-03/P-04 D1–D6: **RATIFICADAS**; implementación/enforcement pendiente.
- P-05: **OPEN / NOT RATIFIED**; C sigue recomendación técnica.
- P-07: **OPEN**; identidad filesystem/TOCTOU no resueltos.
- P-09: **OPEN / UNKNOWN** para callers externos/dinámicos no demostrados.
- E1–E9: matriz **DISEÑADA**; ningún caso nuevo implementado, ejecutado ni PASS.
- M0: **INCOMPLETO**.
- authorization: NOT_EVALUATED; raíz constitucional PENDING/UNKNOWN.
- Primera publicación, commissioning y efectos protegidos: **STOP**.
- Sin cambios runtime/tests/workflows/configuración/dispositivo; tests/CI/Actions no ejecutados.
