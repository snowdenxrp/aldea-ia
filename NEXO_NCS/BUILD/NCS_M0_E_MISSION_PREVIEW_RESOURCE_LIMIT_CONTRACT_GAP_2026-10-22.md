# NCS M0-E — brecha del contrato de límites de entrada para vistas previas de misión

Fecha: 2026-10-22
Rama inspeccionada: `ncs-clean-architecture`

## Estado

**HALLAZGO DOCUMENTAL; NO ES UN CAMBIO DE RUNTIME NI UNA PRUEBA.**

El código inspeccionado contiene actualmente `NEXO_RESOURCE_LIMITS.missionPreviewInputBytes = 4 * 1024 * 1024`. Los comandos `mission-draft-preview` y `mission-request-preview` usan `readUtf8FileBounded` antes de decodificar y ejecutar `JSON.parse`. Esta es una mejora real de la frontera de lectura por archivo: se lee como máximo el byte centinela adicional y se rechaza el exceso antes de decodificar el archivo completo.

Sin embargo, la cifra de 4 MiB no queda derivada del contrato de misión inspeccionado y no debe describirse como la capacidad máxima demostrada para toda entrada legítima.

## Evidencia de código

- `src/nexo/core/resource-limits.mjs`: declara `missionPreviewInputBytes: 4 * 1024 * 1024`; `readUtf8FileBounded` lee como máximo `maxBytes + 1` bytes crudos, rechaza al exceder el máximo y después concatena/decodifica el contenido aceptado.
- `scripts/nexo.mjs`: ambas vistas previas leen su archivo mediante `readUtf8FileBounded` antes de `JSON.parse`, con códigos de error específicos. La vista previa de petición aplica el límite al envelope completo, incluida la cadena `intent`.
- `src/nexo/application/continuity-queries.mjs`: `previewNexoMissionDraft` delega la validación a `recordNexoMissionInSnapshot`, reconstruye la misión y ordena sus pasos por dependencias; devuelve `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `persisted: false`.
- `src/nexo/core/continuity-operations.mjs`: `missionRecord` valida la estructura, identidades, dependencias y datos compatibles con JSON, pero el fragmento inspeccionado no establece un máximo explícito de pasos ni longitudes máximas de los campos de misión.
- El store Continuity tiene su propio límite serializado de 16 MiB y límites de cardinalidad. Ese límite no demuestra que 4 MiB sea el tamaño máximo correcto para todos los archivos de preview: el envelope de petición también contiene `intent`, y el presupuesto del store incluye otros registros y envoltura JSON.

## Conclusión técnica

No hay base suficiente en el contrato inspeccionado para llamar a 4 MiB «capacidad necesaria» ni para afirmar que toda misión válida cabe en ese límite. Tampoco se debe elevar automáticamente el límite a 16 MiB: la envoltura de petición, el espacio ya ocupado por Continuity, las copias y el coste de parseo son dimensiones distintas.

La brecha estructural es la ausencia de límites explícitos y coherentes para la forma de misión (cantidad de pasos, dependencias por paso y tamaños de campos/datos) y para la cadena de intención. Mientras esas dimensiones no estén especificadas, un límite en bytes es una defensa de entrada útil, pero no una demostración de que todas las entradas contractualmente válidas se aceptan ni de que el proceso no sufrirá presión de memoria.

## Siguiente paso requerido

1. Especificar límites estructurales de la misión con base en el contrato funcional real: máximo de pasos, dependencias por paso, tamaños máximos de identificadores/cadenas y tamaño de datos por paso. No inventar valores sin relacionarlos con las capacidades que Nexo debe soportar.
2. Especificar por separado el máximo de `intent` para `mission-request-preview`; no permitir que una cadena de intención sin límite consuma todo el presupuesto de un envelope.
3. Derivar el máximo de bytes de cada archivo desde esos límites estructurales y el formato serializado real, incluyendo el envelope de petición.
4. Probar ambos comandos en límite exacto y límite + 1, además de casos válidos cercanos al máximo estructural y entradas inválidas. Confirmar salida sanitizada, sin persistencia ni dispatch.
5. Verificar CI sobre el SHA exacto que contiene la implementación y las pruebas.

No agregar semáforos, colas, locks globales ni otras abstracciones para ocultar la falta de un contrato de admisión. El presupuesto agregado de heap/disco y la concurrencia entre procesos siguen siendo cuestiones separadas y abiertas.

## Invariantes que no cambian

- Vista previa no autoriza efectos.
- `authorization: NOT_EVALUATED`.
- `dispatchAttempted: false`.
- `persisted: false`.
- M0: `INCOMPLETO`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

## Alcance de esta nota

La nota registra una brecha de diseño derivada de la inspección de los archivos listados. No modifica runtime, no añade pruebas y no afirma que CI se haya ejecutado.