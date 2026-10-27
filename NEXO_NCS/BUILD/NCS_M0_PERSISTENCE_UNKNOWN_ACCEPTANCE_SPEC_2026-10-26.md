# NCS M0 — Especificación de aceptación para persistencia y UNKNOWN

**Fecha:** 2026-10-26  
**Tipo:** propuesta documental; no ratificada como cierre de M0  
**Base de revisión:** rama `ncs-clean-architecture`; referencia de las revisiones externas `35adfa64a5192f79e284788e0a1d7e69ce85d6d3`.  
**Alcance de este documento:** definir aceptación verificable para persistencia condicional y clasificación de resultados inciertos. No implementa cambios ni afirma que las pruebas se hayan ejecutado.

## Estado canónico que no cambia

- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Autorización: `NOT_EVALUATED` hasta que exista evidencia válida.
- Efectos protegidos: `STOP`.
- Reconciliación general: no integrada.
- `COMMIT.UNKNOWN`: contrato de producto opción A ratificado por el owner; conservar incertidumbre hasta intervención explícita. No convertirla automáticamente en éxito o fracaso definitivo.
- Esta propuesta no autoriza cambios de runtime, tests, workflows, configuración de dispositivo ni efectos protegidos.

## Principios de aceptación

1. La lectura de estado autoritativo no puede fabricar un snapshot inicial cuando el archivo persistido existe pero es ilegible, corrupto o carece de una revisión válida.
2. `COMMITTED` solo significa aquello que la primitiva puede demostrar. El retorno exitoso de `rename` no demuestra por sí solo durabilidad ante pérdida de energía.
3. `UNKNOWN` significa que el resultado no se puede determinar con la evidencia disponible; no implica que no se escribió.
4. El conflicto de revisión debe distinguirse de un error de persistencia indeterminado.
5. No se permite reintento automático de un efecto externo solo porque el resultado de persistencia sea incierto.
6. La evidencia de pruebas locales, sondas de revisión o CI debe etiquetarse por separado. Ninguna sonda externa sustituye una prueba reproducible del repositorio en el SHA probado.

## R1 — Estado persistido inválido

### Escenarios mínimos

- R1.1: el archivo no existe.
- R1.2: el archivo existe y contiene JSON inválido o vacío.
- R1.3: JSON válido, pero esquema incompatible.
- R1.4: snapshot válido, pero `stateRevision` ausente, negativa o fuera del rango seguro.
- R1.5: snapshot válido con revisión esperada coincidente.
- R1.6: snapshot válido con revisión distinta de la esperada.

### Criterios de aceptación

- R1.1–R1.4 no se interpretan como revisión cero ni se sobrescriben silenciosamente en una operación de commit condicional.
- R1.2–R1.4 preservan los bytes del archivo original, salvo que exista un procedimiento de recuperación explícito y autorizado separado.
- R1.5 puede avanzar exactamente una revisión si la escritura concluye según el contrato documentado.
- R1.6 produce conflicto condicional sin mutación del snapshot.
- Cada resultado incluye un código estable suficiente para distinguir estado ausente, estado inválido, revisión desconocida y conflicto; no debe revelar como cierto lo que no se verificó.

**Evidencia requerida:** pruebas automatizadas que usen el adaptador real y un archivo temporal real, y que comprueben resultado, revisión y contenido final en disco. Las pruebas con stubs no cubren este criterio.

## R2 — Clasificación de errores y objetos no confiables

### Escenarios mínimos

- R2.1: persistencia lanza un error ordinario con `code` estable.
- R2.2: persistencia lanza un objeto sin `code`.
- R2.3: acceder a `error.code` lanza una excepción (getter hostil).
- R2.4: `error.code` es una función u otro tipo no válido.
- R2.5: conflicto `STATE_REVISION_CONFLICT` conocido.
- R2.6: la persistencia muta el archivo y luego informa de un error.

### Criterios de aceptación

- R2.1–R2.4 no hacen que una excepción cruda escape del clasificador de resultados por el mero hecho de leer el código de error.
- El código de error solo se propaga si puede leerse de forma segura y cumple el tipo acordado; de lo contrario se utiliza un código genérico estable de incertidumbre.
- R2.5 sigue siendo `CONDITIONAL_CONFLICT`, no `UNKNOWN`, cuando la primitiva demuestra el conflicto.
- R2.6 produce `UNKNOWN` si no puede determinarse el resultado final. No afirmar que el archivo no cambió.
- Los tests verifican también la forma completa del resultado, no solo `outcome.kind`.

## R3 — Semántica observable de COMMITTED, UNKNOWN y persisted

### Contrato que debe documentarse antes de implementar

- `COMMITTED`: la primitiva terminó según su contrato de escritura y confirmó el cambio visible. No debe implicar durabilidad frente a pérdida de energía salvo que se implemente y pruebe una garantía de sincronización adecuada para la plataforma.
- `CONDITIONAL_CONFLICT`: el snapshot persistido no tenía la revisión esperada; no se efectuó la escritura condicional.
- `UNKNOWN`: la evidencia disponible no permite saber si la mutación se aplicó.
- `persisted`: si se mantiene como booleano, debe representar una condición demostrada. Si el resultado es indeterminado, no usar `false` como sinónimo de “no hubo escritura”. Considerar un estado explícito de incertidumbre solo tras ratificar el contrato de producto.

### Matriz de observación obligatoria

| Punto de fallo | Resultado esperado | Estado del archivo |
|---|---|---|
| Antes de iniciar escritura, sin mutación posible demostrada | Error confirmado o estado definido por el contrato | Snapshot intacto verificado |
| Conflicto de revisión | `CONDITIONAL_CONFLICT` | Snapshot intacto verificado |
| Escritura/renombrado falla antes de reemplazar el destino | Clasificación sustentada por evidencia del fallo | Snapshot previo verificado |
| El destino pudo reemplazarse, pero la operación informa error después | `UNKNOWN` | Leer e inspeccionar el destino; no inferir desde el error |
| Operación completa normalmente | `COMMITTED` según la semántica limitada documentada | Snapshot nuevo verificado |
| Reinicio tras escritura, sin sync explícito | No declarar garantizada la durabilidad F2/F3 | Resultado específico de la plataforma por medir |

Los tests deben inspeccionar el archivo tras la operación. El valor de retorno por sí solo no prueba el estado final en disco.

## R4 — Integración con transición y consumidor

- Probar la composición real adaptador + transición + consumidor, sin sustituir los componentes centrales por mocks en el único test de aceptación.
- Verificar que `COMMIT.UNKNOWN` no se transforma en éxito ni habilita un nuevo dispatch.
- Verificar la preservación de un código diagnóstico estable cuando exista.
- Verificar que la ruta de excepción y la ruta de retorno normal `COMMIT.UNKNOWN` produzcan resultados coherentes.
- Verificar que una excepción hostil no evita que el sistema retorne al estado conservador definido.
- Documentar qué consumidor ejecutable es responsable de detener, registrar y presentar el resultado; una prueba unitaria aislada de `executeProtectedTransition` no demuestra integración en el runtime.

**No se exige todavía conectar `executeProtectedTransition` al runtime.** Primero debe resolverse si ese motor forma parte del diseño canónico de M0 o si el runtime actual basado en owner/effect journal es el mecanismo canónico. La decisión debe preceder al cambio de arquitectura.

## R5 — Durabilidad y límites de plataforma

Separar explícitamente estas propiedades:

- **Visibilidad atómica:** observadores no ven un archivo parcialmente reemplazado bajo las garantías de la operación de reemplazo y del sistema de archivos.
- **Supervivencia a caída del proceso:** estado recuperable después de terminar abruptamente el proceso.
- **Supervivencia a caída del sistema o pérdida de energía:** estado durable tras fallos F2/F3; no se deduce de `rename` solamente.
- **Causalidad:** evidencia durable que vincula el snapshot con la transición concreta; la similitud del contenido no basta.

Para M0, el owner debe ratificar si F2/F3 y la causalidad durable están dentro o fuera del alcance de salida. Hasta entonces permanecen pendientes; no prometer garantía universal ni asumir que añadir `fsync` sin más resuelve todas las plataformas.

## R6 — Reconciliación y bloqueo seguro

- Un efecto en estado `prepared` o `unknown` no debe redistribuirse ciegamente.
- Debe existir una descripción verificable de cómo se obtiene evidencia y quién puede autorizar una resolución.
- Si no hay mecanismo autorizado, conservar el estado sin resolver es más seguro que inventar una resolución. El bloqueo operativo no debe describirse como una recuperación completada.
- No introducir una API de resolución, firma, identidad, cola, retry o nueva autoridad sin decisión explícita del owner.

## Secuencia de verificación futura

1. Añadir pruebas de regresión que fallen antes de la corrección.
2. Implementar el cambio mínimo aprobado.
3. Ejecutar las pruebas específicas en un entorno reproducible y registrar versión de Node, plataforma y SHA.
4. Ejecutar los workflows pertinentes para el nuevo SHA; no reutilizar resultados de un SHA anterior como prueba del cambio nuevo.
5. Registrar resultados, logs y artefactos reales; si no existen, indicarlo.
6. Actualizar la matriz de aceptación y `NEXO_NCS/STATUS.md` con la distinción `IMPLEMENTADO`, `TEST LOCAL`, `CI VERIFICADO`, `PROPUESTA` y `UNKNOWN`.

## Fuera de alcance de este documento

- No cambia código de producción, tests ni workflows.
- No declara que se hayan ejecutado pruebas.
- No cierra M0.
- No cambia el contrato ratificado `COMMIT.UNKNOWN` de opción A.
- No habilita efectos protegidos ni la reconciliación automática.
- No decide la integración de `executeProtectedTransition`.
