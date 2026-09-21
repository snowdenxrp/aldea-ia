# Auditoría visual automática de Lúmina

El botón **📸 Capturar + guardar** envía el PNG directamente a `functions/api/capture.js`.

## Qué guarda

- `audits/visual/latest.png` — última captura, pensada para auditoría rápida.
- `audits/visual/latest.json` — día/hora, cámara, zoom, posición y actividad de Alex/Bruno.
- `audits/visual/history/<timestamp>.png` — historial.
- `audits/visual/history/<timestamp>.json` — metadatos del historial.

## Seguridad

El navegador **no contiene el token de GitHub**. El token vive únicamente como secreto del servidor.

### Activación una sola vez

El proyecto debe publicarse como **Cloudflare Pages** con Functions habilitadas y conectado al repositorio.

1. Crear un token de GitHub de mínimo privilegio para este repositorio.
2. Darle solamente permiso **Contents: Read and write**.
3. En Cloudflare Pages → Settings → Environment variables, crear `GITHUB_TOKEN` con el token y aplicarlo a Production (y Preview si se desea probar ahí).
4. Volver a desplegar.
5. Abrir Lúmina y pulsar **📸 Capturar + guardar**.

El endpoint es relativo (`/api/capture`), así que no hay que editar el código cuando cambia el dominio.

## Flujo

**Lúmina → PNG → Function segura → GitHub → `latest.png` → auditoría visual.**

Si el endpoint no está disponible, el botón conserva un fallback: genera y descarga `lumina-screenshot.png` para no bloquear la aplicación.
