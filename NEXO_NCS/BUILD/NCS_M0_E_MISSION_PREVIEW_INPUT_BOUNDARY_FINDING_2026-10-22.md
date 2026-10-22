# NCS M0-E — entrada JSON de vista previa de misión sin límite de bytes

Fecha: 2026-10-22  
Rama: `ncs-clean-architecture`  
Tipo: hallazgo de código durante la revisión de callers; no modifica runtime ni afirma tests nuevos.

## Hallazgo

`scripts/nexo.mjs` lee los archivos de las órdenes `mission-draft-preview` y `mission-request-preview` mediante `fs.readFile(path, "utf8")` y solo después ejecuta `JSON.parse`. Estas dos entradas no usan `readUtf8FileBounded` ni tienen un máximo explícito de bytes previo al parseo.

Rutas concretas:
- `mission-draft-preview --continuity <ruta> --draft <archivo.json>`
- `mission-request-preview --continuity <ruta> --request <archivo.json>`

La ruta de solicitud contiene tanto `intent` como `missionDraft`; la ruta de borrador puede incluir datos de misión como `target` y `context`. Aunque las vistas previas no persisten ni despachan, el proceso materializa y parsea el documento completo y la validación puede clonar estructuras antes de devolver el resultado.

## Por qué importa

El perfil aceptado limita `--content-stdin` de Chronicle a 256 KiB, pero esa decisión no define automáticamente el tamaño máximo de un archivo de borrador/solicitud. Aplicar el máximo por-store de Continuity tampoco limita el tamaño del archivo de entrada ni las copias temporales creadas por su validación.

Por tanto, el hallazgo previo de suficiencia por-store sigue siendo válido para los stores, pero **no equivale a que todas las entradas locales de Nexo estén acotadas**. Debe corregirse cualquier resumen que sugiera cobertura total de entradas.

## Siguiente decisión técnica

1. Definir explícitamente si borradores y solicitudes JSON quedan dentro del perfil operativo local de M0.
2. Si quedan dentro, aceptar un máximo de bytes adecuado antes de implementar; no inferir que deba ser 256 KiB solo porque ese número se aceptó para stdin de Chronicle.
3. Reutilizar el helper de lectura acotada existente y los resultados/códigos coherentes de la capa CLI, sin crear una segunda implementación de lectura ni una familia paralela de outcomes.
4. Añadir pruebas de frontera bajo/exacto/sobre el máximo para ambas rutas, incluida entrada JSON válida sobredimensionada, sin parseo/admisión ni mutación de Continuity. Asociar CI al SHA exacto antes de declarar el caso cerrado.

No implementar todavía un número o un nuevo contrato de recursos hasta resolver el máximo aplicable. No es necesario cambiar el contrato de autoridad ni conectar un modelo para cerrar esta brecha.

## Estado

- Límites de bytes por-store: implementados; evidencia de CI previa permanece acotada a sus SHA.
- Entradas JSON de vista previa: **PENDING — lectura sin límite previo identificada**.
- Presupuesto agregado heap/disco y exclusión multiproceso: **OPEN**.
- M0: `INCOMPLETO`; autorización: `NOT_EVALUATED`; raíz legítima: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.
