# Auditoría visual de Lúmina — DESACTIVADA

## Estado

La función de captura visual y el botón **📸 Capturar + guardar** se retiraron por precaución de seguridad.

- La interfaz ya no genera ni envía capturas.
- `functions/api/capture.js` responde HTTP 410 y no lee el cuerpo de la solicitud, no llama a GitHub y no utiliza `GITHUB_TOKEN`.
- No configures ni agregues un secreto `GITHUB_TOKEN` para esta función.
- Los archivos de auditoría existentes no se borraron; esta medida solo detiene nuevas capturas por esta ruta.

## Alcance y límite

El código fuente actualizado no prueba que un despliegue externo haya terminado de actualizarse ni que se haya eliminado un secreto ya configurado en Cloudflare. Si alguna vez se configuró un token, revócalo desde el proveedor si ya no se necesita; el cambio de código no revoca credenciales.

Para reactivar esta capacidad en el futuro se requiere una revisión de seguridad y autorización explícita. No reactivar solo para recuperar el botón.
