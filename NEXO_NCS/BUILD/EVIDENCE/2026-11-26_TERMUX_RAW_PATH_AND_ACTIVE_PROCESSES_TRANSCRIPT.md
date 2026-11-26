# NCS M0 — Evidencia Termux: RAW PATH CHECK y procesos activos

Fecha: 2026-11-26
Origen: transcripción pegada por el propietario en la conversación.
Estado: **TRANSCRIPCIÓN ORIGINAL PROPORCIONADA EN CHAT — PRESERVADA TEXTUALMENTE**
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`

## Transcripción exacta proporcionada

```text
~ $
~ $ echo "=== NCS M0 / RAW PATH CHECK ==="
=== NCS M0 / RAW PATH CHECK ===
~ $
~ $ for name in NEXO_STATE_PATH NEXO_LUMINA_MEMORY_PATH; do

> if printenv "$name" >/dev/null 2>&1; then
printf '%s=%s\n' "$name" "$(printenv "$name")"
else
printf '%s=<UNSET>\n' "$name"
fi
done
NEXO_STATE_PATH=<UNSET>
NEXO_LUMINA_MEMORY_PATH=<UNSET>
~ $
~ $ echo "=== ACTIVE NODE/NEXO PROCESSES ==="
=== ACTIVE NODE/NEXO PROCESSES ===
~ $ ps -A -o pid,ppid,args 2>/dev/null |
grep -E '[n]ode|[n]exo|[a]ssistants|[s]imulate' || true
~ $
~ $
```

## Resultados observables

1. `NEXO_STATE_PATH=<UNSET>`.
2. `NEXO_LUMINA_MEMORY_PATH=<UNSET>`.
3. La tubería de procesos no produjo líneas coincidentes entre el encabezado y el siguiente prompt.
4. El comando termina con `|| true`; por tanto, esta transcripción no conserva el código de salida original de `ps` ni de `grep`.

## Alcance y límites

- Evidencia de variables de entorno del shell donde se ejecutó el comando, en ese momento.
- Evidencia de que la búsqueda mostrada no imprimió procesos coincidentes en ese momento.
- No demuestra que no existan launchers, servicios detenidos, tareas futuras, procesos con nombres/argumentos distintos, procesos de otros usuarios no visibles o rutas configuradas en otros entornos.
- No demuestra cobertura global de escritores RAW ni cierra O7, P05 o P07-C.
- No se ejecutó nada adicional para producir este registro; se preservó el texto proporcionado por el propietario.

## Clasificación

**OBSERVED / OWNER-SUPPLIED TERMINUX OUTPUT.** No equivale a inventario exhaustivo ni a TESTED/CI-VERIFIED.
