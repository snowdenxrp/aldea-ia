# NCS M0-E — propuesta de máximo para archivos JSON de vista previa

Fecha: 2026-10-22  
Estado: **PROPUESTA TÉCNICA; REQUIERE DECISIÓN DEL PROPIETARIO ANTES DE IMPLEMENTAR**

## Problema que resuelve

`scripts/nexo.mjs` lee los archivos `--draft` y `--request` completos mediante `fs.readFile(..., "utf8")` antes de `JSON.parse`. No hay límite de bytes crudos en esas dos rutas.

## Recomendación

Aplicar un máximo de **256 KiB (262.144 bytes, binario) por archivo de entrada** tanto a `mission-draft-preview --draft` como a `mission-request-preview --request`.

Razones:
- Mantiene el alcance de preview local y de una sola operación; no se trata como importación masiva ni como servicio persistente.
- Es coherente con el orden de magnitud del límite de entrada de 256 KiB ya aceptado para la entrada de Chronicle, pero se propone como un límite separado y explícito para estos archivos, no como extensión automática de la decisión anterior.
- Es suficientemente amplio para una solicitud textual y un borrador de misión local normal, y permite rechazar temprano un archivo desproporcionado antes de UTF-8 decoding, `JSON.parse` y las copias de la validación.
- No sustituye límites de cardinalidad/forma de misión ni implica un límite de heap agregado.

Este valor es una recomendación de diseño, no una medición de capacidad ni una decisión ya aceptada. Si se esperan borradores mayores de 256 KiB, debe elegirse otro máximo con ejemplos representativos antes de implementar.

## Semántica propuesta

1. Leer bytes crudos con el helper existente `readUtf8FileBounded`, antes de decodificar y parsear.
2. Límite inclusivo: 262.144 bytes se acepta; 262.145 bytes se rechaza.
3. Mantener las salidas públicas como `blocked`, `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false`; nunca imprimir el contenido de entrada ni rutas privadas.
4. Reutilizar el contrato de resultado existente. Antes de introducir códigos específicos nuevos, inspeccionar y reutilizar el código existente si tiene semántica exacta; si no, registrar el código mínimo necesario en el mismo contrato, sin crear una familia paralela de outcomes.
5. Las dos vistas previas deben seguir siendo de solo lectura: ninguna admisión, persistencia o dispatch como consecuencia de la validación del archivo.
6. No cambiar el límite de `--content-stdin` ni declarar cerrado el presupuesto agregado de heap/disco o la concurrencia multiproceso.

## Pruebas requeridas tras la decisión

- Para ambas rutas: archivo válido bajo el máximo, archivo válido exactamente en el máximo y archivo que excede por un byte.
- Un archivo JSON sobredimensionado debe rechazarse antes de parsearlo; no debe mutar bytes/revisión de Continuity ni emitir payloads privados.
- Archivo ausente, JSON inválido y exceso de bytes deben seguir siendo resultados diferenciables.
- Ejecutar las suites pertinentes y asociar los resultados CI al SHA exacto que contiene el cambio.

## Decisión pendiente

Aceptar o cambiar el máximo de 256 KiB antes de editar runtime. No declarar implementado ni probado este límite mientras sea propuesta.
