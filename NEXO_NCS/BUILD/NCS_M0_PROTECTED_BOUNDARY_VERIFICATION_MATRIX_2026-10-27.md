# NCS M0 — matriz documental de verificación de la frontera protegida

Fecha: 2026-10-27  
Rama: `ncs-clean-architecture`  
Estado: **DISEÑO DOCUMENTAL — NO IMPLEMENTADO — NO EJECUTADO — NO AUTORIZA CAMBIOS**

## 1. Propósito acotado

Definir qué evidencia tendrá que demostrar que la frontera de efectos protegidos se mantiene cerrada mientras M0 sigue siendo un núcleo no autoritativo. Esta matriz prepara la futura revisión de contrato y, si se autoriza por separado, las pruebas ligadas a un SHA exacto.

No vuelve a investigar hardware, canal humano, ceremonia de raíz ni alternativas A/B/C/D. Tampoco resuelve la legitimidad de la primera creación de Continuity. Esas cuestiones permanecen en sus registros canónicos y no se sustituyen por esta matriz.

## 2. Estado canónico preservado

- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Primera creación: `STOP`.
- Efectos protegidos: `STOP`.
- Tests/CI: no ejecutados como parte de este trabajo.
- Runtime, tests, workflows, configuración ejecutable y dispositivo: sin cambios por este documento.

## 3. Regla de lectura

Cada claim se clasifica por separado:

- **Principio/contrato:** lo que los documentos dicen que debe ocurrir.
- **Hecho estático:** lo que el código fuente inspeccionado muestra en un SHA concreto.
- **Verificación dinámica:** comportamiento observado en una ejecución identificada y autorizada.
- **UNKNOWN:** falta el SHA, la ruta completa, la evidencia, la cobertura o una condición relevante.

Un caller que se declara bloqueado no prueba por sí solo que todas las APIs estén bloqueadas. Una API existente no demuestra por sí sola que sea alcanzable desde un entrypoint de producción. Un test futuro que pase tampoco prueba más que sus precondiciones, SHA y cobertura declarados.

## 4. Matriz de frontera protegida

| ID | Claim a demostrar | Evidencia documental mínima antes de proponer prueba | Evidencia dinámica futura, solo con autorización separada | Fallo que obliga a STOP |
|---|---|---|---|---|
| PB-01 | El arranque normal no crea Continuity ni Chronicle implícitamente. | Grafo entrypoint → factory → escritura inicial, con SHA/blob y condiciones de cada branch. | Caso de destino ausente y arranque normal; demostrar que no aparece store ni se ejecuta bootstrap. | Store creado por ruta normal, o evidencia insuficiente sobre una ruta de escritura. |
| PB-02 | La primera creación no continúa hacia admisión, PREPARED, dispatch, reconciliación ni efectos. | Trazado desde la función de creación y sus callers hasta cada consumidor protegido; enumerar retornos y excepciones. | Instrumentación/artefacto sintético que muestre el orden de eventos y que el flujo termina antes de cualquier consumidor protegido. | Cualquier continuación a efectos, o imposibilidad de demostrar que el flujo termina. |
| PB-03 | La frontera protegida comprueba una precondición independiente del store y del caller. | Identificar el punto exacto donde se evalúa la precondición; probar por inspección que no deriva autoridad del snapshot, flags, ruta, revisión, lock ni afirmación del caller. | Casos con store ausente, corrupto, manipulado y caller que declara éxito; el resultado esperado es rechazo/UNKNOWN. | El store o caller puede autoautorizarse, o no existe un consumidor identificable de la precondición. |
| PB-04 | Las APIs directas no eluden el límite aplicado por wrappers/CLI. | Inventario acotado de APIs que pueden preparar, despachar, reconciliar o reparar; relaciones import/call y accesibilidad pública documentadas. | Intentos sintéticos por cada ruta directa dentro del alcance acordado; demostrar rechazo antes del efecto. | El wrapper se bloquea pero una ruta directa sigue habilitando el efecto, o cobertura desconocida. |
| PB-05 | La separación padre/hijo Chronicle no pierde la precondición de admisión. | Trazado de padre, hijo, flags, root y primer acceso persistente; no asumir que pasar `--root` transfiere admisión. | Ejecución sintética de cada entrypoint permitido con eventos de admisión y primera lectura. | El hijo lee/escribe antes de su propia admisión efectiva o se supone una herencia no demostrada. |
| PB-06 | Los estados ausente, inválido/corrupto, error de lectura, conflicto y UNKNOWN no se colapsan en éxito. | Tabla de errores/retornos por factory y callers; distinguir ausencia real de cualquier error. | Casos sintéticos por cada clase, preservando los bytes existentes cuando el estado no sea ausencia confirmada. | Error interpretado como ausencia, sobrescritura de objeto existente o readmisión por inferencia. |
| PB-07 | Un fallo parcial o release incierto no habilita readmisión ni reintento de negocio. | Reutilizar el contrato P-05 vigente; trazar persistencia, release y readmisión como resultados separados. | Casos de release fallido/ambiguo y actor previo potencialmente activo; sin retry automático. | Ausencia de ruta/PID usado como prueba suficiente, retry automático o estado incierto tratado como éxito. |
| PB-08 | Repair, dispatch y reconciliación quedan cerrados por el mismo límite aplicable, no por una etiqueta del CLI. | Para cada operación, identificar el punto de entrada real, precondición consumida y efecto alcanzable; separar repair de lectura y de commit. | Casos sintéticos de acceso directo y composición; evidencia del rechazo antes de mutar datos o iniciar acción externa. | Una operación protegida se ejecuta sin precondición reconocida o la ruta no fue cubierta. |
| PB-09 | El resultado no afirma más que la evidencia capturada. | Plantilla de registro con commit SHA, blobs, alcance, comando/trigger, cobertura, límites y UNKNOWN. | Para cada run futuro: trigger → run → job → SHA/pin → artefacto/log → interpretación. | Logs ausentes, SHA ambiguo, ejecución no autorizada o resultado interpretado más allá de su cobertura. |

Los IDs PB-* son etiquetas documentales de esta matriz, no IDs de runtime, estados nuevos ni mecanismos de autorización.

## 5. Orden de evidencia requerido

1. **Fijar la fuente:** rama/HEAD observado y SHA/blob de cada archivo; citar líneas o rangos reproducibles.
2. **Trazar la operación:** entrypoint, callers, factory, primera lectura/escritura, frontera protegida y efecto potencial.
3. **Demostrar el punto de corte:** qué condición se comprueba, quién la produce, qué código la consume y qué pasa en error/UNKNOWN.
4. **Revisar rutas alternativas:** APIs directas, proceso hijo, repair, dispatch y reconciliación dentro del alcance; no repetir el censo global salvo que una arista concreta lo requiera.
5. **Congelar el contrato:** resolver contradicciones y obtener las decisiones del propietario que falten.
6. **Solicitar autorización separada:** solo entonces convertir claims aplicables en pruebas y, posteriormente, CI en el SHA exacto.

## 6. Límites que esta matriz no resuelve

- No legitima la primera creación del archivo Continuity.
- No establece ni reconoce una raíz constitucional.
- No demuestra que el entorno real pueda detener todos los writers/launchers ni impedir su relanzamiento.
- No demuestra seguridad universal frente a TOCTOU, symlinks, actores locales hostiles, pérdida de energía o fallos de filesystem.
- No convierte pruebas sintéticas futuras en evidencia de seguridad del POCO, Android M1 o producción.
- No elige bootstrap A/B/C/D, política de recuperación A/B, mecanismo de lock ni política de migración.
- No concede permiso para commissioning, repair, dispatch, readmisión ni efectos protegidos.

## 7. Próximo paso documental concreto

Tomar PB-01, PB-02 y PB-08 como primera unidad de revisión estática, porque enlazan la creación inicial con el primer punto donde podría continuar hacia una operación protegida. Para cada una, añadir evidencia exacta de fuente (ruta, SHA/blob, líneas y caller), o dejarla `UNKNOWN` si falta el dato. Reutilizar el mapa P-01 y los ledgers D1 existentes; no repetir el barrido general de 188 archivos.

La revisión no debe cambiar el estado canónico por el mero hecho de completar esta matriz. Cualquier brecha de autorización, primera creación, alcance o ruta alternativa conserva `STOP/UNKNOWN`.

## 8. Registro de ejecución

- Tipo de trabajo: documental/estático.
- Runtime/tests/workflows/configuración ejecutable: no modificados por esta nota.
- Tests/CI/Actions: no ejecutados.
- Dispositivo/instalación: no tocados.
- Estado de los claims PB-01…PB-09: pendientes de evidencia específica; ninguno se declara verificado por esta matriz.
