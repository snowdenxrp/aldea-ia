# NCS M0 — candidato de entorno restringido POCO/Termux

Fecha: 2026-11-01
Estado: RECOMENDACIÓN TÉCNICA; NO CONFIGURADO; NO VERIFICADO; NO AUTORIZA PUBLICACIÓN.

## Propuesta

Evaluar Termux + Node.js con una invocación manual en primer plano como entorno restringido para el POCO X7 Pro. Esta es una recomendación técnica para concretar la decisión previa del propietario de permitir un entorno restringido; no es una selección ratificada ni demuestra E2/E3.

## Límites exigidos

- El destino debe residir en el almacenamiento privado de Termux, nunca en almacenamiento compartido ni en una ruta accesible desde Nexo M1.
- Una sola sesión manual y un único proceso de bootstrap.
- Sin arranque automático, widgets, servicios, jobs, cron, Tasker ni relanzadores.
- Sin otros procesos Termux que puedan escribir en el destino durante la ventana.
- Android Verified Boot debe estar green, bootloader bloqueado y sin root.
- La operación debe usar un entrypoint dedicado y terminar antes de Chronicle, admisión, owner, PREPARED, dispatch o efectos.

## Evidencia requerida

E2 requiere demostrar que se pueden detener todos los escritores relevantes e impedir su relanzamiento durante la ventana. E3 requiere identificar Termux, Node.js, el entrypoint exacto, el SHA del checkout y todos los procesos/servicios con acceso al destino. Una lista de procesos vacía por sí sola no demuestra exclusión.

## Estado

Termux + Node.js: CANDIDATO, no se afirma instalación. E1: POCO X7 Pro/Android identificado. E2/E3: UNKNOWN. E4: NOT READY. Raíz legítima: PENDING/UNKNOWN. authorization: NOT_EVALUATED. Primera publicación y efectos protegidos: STOP. NCS M0: INCOMPLETO.

Este documento no instala software, no ejecuta comandos, no inicializa Continuity y no autoriza commissioning.