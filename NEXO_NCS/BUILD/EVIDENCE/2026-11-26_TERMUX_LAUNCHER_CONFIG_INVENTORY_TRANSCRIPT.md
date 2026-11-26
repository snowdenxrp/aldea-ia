# NCS M0 — Evidencia Termux: inventario de configuración de launchers

Fecha: 2026-11-26
Origen: transcripción pegada por el propietario en la conversación.
Estado: **TRANSCRIPCIÓN ORIGINAL PROPORCIONADA EN CHAT — PRESERVADA TEXTUALMENTE**
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`

## Transcripción exacta proporcionada

```text
$
~ $ echo "=== NCS M0 / LAUNCHER CONFIG INVENTORY ==="
=== NCS M0 / LAUNCHER CONFIG INVENTORY ===
~ $
~ $ TARGETS=(

> "$HOME/.bashrc"
"$HOME/.bash_profile"
"$HOME/.profile"
"$HOME/.zshrc"
"$HOME/.termux"
"$HOME/.shortcuts"
"$HOME/bin"
"$PREFIX/etc/profile"
"$PREFIX/etc/profile.d"
"$HOME/ncs-m0/scripts"
)
~ $
~ $ for target in "${TARGETS[@]}"; do
[ -e "$target" ] || continue
echo "--- $target ---"
grep -RInE \
--exclude-dir=.git \
--exclude-dir=node_modules \
--exclude='.log' \
--exclude='.lock' \
'NEXO_STATE_PATH|NEXO_LUMINA_MEMORY_PATH' \
"$target" 2>/dev/null || true
done
--- /data/data/com.termux/files/home/.termux ---
--- /data/data/com.termux/files/usr/etc/profile ---
--- /data/data/com.termux/files/usr/etc/profile.d ---
--- /data/data/com.termux/files/home/ncs-m0/scripts ---
/data/data/com.termux/files/home/ncs-m0/scripts/assistants.mjs:14:const STATE_PATH = process.env.NEXO_STATE_PATH
/data/data/com.termux/files/home/ncs-m0/scripts/assistants.mjs:15:  ? pathToFileURL(resolve(process.env.NEXO_STATE_PATH))
/data/data/com.termux/files/home/ncs-m0/scripts/assistants.mjs:17:const MEMORY_PATH = process.env.NEXO_LUMINA_MEMORY_PATH
/data/data/com.termux/files/home/ncs-m0/scripts/assistants.mjs:18:  ? pathToFileURL(resolve(process.env.NEXO_LUMINA_MEMORY_PATH))
~ $
~ $ echo "=== END INVENTORY ==="
=== END INVENTORY ===
~ $
~ $
```

## Resultado observable

La búsqueda recursiva encontró referencias a ambas variables únicamente en:
`/data/data/com.termux/files/home/ncs-m0/scripts/assistants.mjs`

Líneas:
- 14–15: lectura de `process.env.NEXO_STATE_PATH` para resolver `STATE_PATH`.
- 17–18: lectura de `process.env.NEXO_LUMINA_MEMORY_PATH` para resolver `MEMORY_PATH`.

Los encabezados sin coincidencias para `.termux`, `$PREFIX/etc/profile` y `$PREFIX/etc/profile.d` indican que grep no imprimió referencias en esos targets. Los targets ausentes se omitieron por `[ -e "$target" ] || continue`. No se imprimieron encabezados para los demás targets, por lo que no se debe inferir su existencia o contenido a partir de esta transcripción.

## Alcance y límites

- Inventario limitado a los targets listados y existentes al momento de ejecución.
- Exclusiones explícitas: directorios `.git`, `node_modules`, archivos `.log` y `.lock`.
- La búsqueda es textual y no detecta necesariamente nombres construidos dinámicamente, variables indirectas, configuración externa, servicios/addons fuera de los targets ni otros mecanismos de arranque.
- `|| true` impide recuperar el código de salida original de grep.
- La presencia de referencias en `assistants.mjs` demuestra que el script lee esas variables; no demuestra que estuvieran definidas en el entorno (la evidencia separada RAW PATH CHECK las mostró UNSET en ese shell).
- Esta evidencia no cierra O7, P05 ni P07-C.

## Clasificación

**OBSERVED / OWNER-SUPPLIED TERMUX OUTPUT.** Inventario parcial de configuración textual; no equivale a cobertura exhaustiva ni a TESTED/CI-VERIFIED.
