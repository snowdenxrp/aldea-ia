# NCS M0 — brecha de evidencia E2/E3 para POCO X7 Pro

Fecha: 2026-10-29  
Estado: DOCUMENTACIÓN ESTÁTICA; SIN EVIDENCIA OPERACIONAL NUEVA; NO AUTORIZA EJECUCIÓN.

## Hechos ya conocidos

- E1: el primer entorno previsto es POCO X7 Pro / Android.
- El propietario indicó que en el dispositivo está instalada la app local Nexo M1. Esto no demuestra que M1 lance el CLI de NCS M0 ni que contenga la operación dedicada de bootstrap.
- El mecanismo concreto de lanzamiento del bootstrap M0 sigue sin configurarse/verificarse. No se presume que el CLI Node.js del repositorio esté instalado o disponible en el teléfono.
- El historial de inspección observó que no había Termux:Boot, crontab ni procesos coincidentes en esa sesión; la consulta de paquetes falló. Son observaciones parciales y temporales, no prueba de ausencia de launchers, escritores o relanzadores.

## E2 — capacidad de detener y bloquear relanzamientos

**UNKNOWN.** No existe evidencia de un control concreto que detenga todos los writers/launchers relevantes e impida nuevos lanzamientos durante toda la ventana. Cerrar una app o terminal, o ver una lista de procesos vacía, no demuestra esa propiedad.

## E3 — modo real de lanzamiento y writers

**UNKNOWN.** Se conocen entrypoints en el código (CLI Chronicle, assistants, simulate y rutas legacy), pero no está demostrado cuáles están instalados, invocables o conectados en el POCO. No repetir el censo general del repositorio: la brecha pendiente es la relación entre esos entrypoints y el mecanismo de lanzamiento real del dispositivo.

## Información mínima que falta

1. Entorno previsto para ejecutar el bootstrap M0: Termux/Node.js, app Android propia u otro; si no está decidido, declarar UNKNOWN.
2. Mecanismo que iniciará el proceso y si puede relanzarlo automáticamente.
3. Control disponible para detener ese mecanismo e impedir nuevos lanzamientos durante toda la intervención.
4. Evidencia observable que permita comprobar que el control sigue activo durante la ventana.

No volver a solicitar el dispositivo objetivo: ya está identificado. No compartir secretos ni credenciales.

## Siguiente paso permitido

Recibir evidencia concreta de los puntos anteriores o continuar con reconciliación documental de criterios independientes de E2/E3. No ejecutar comandos en el POCO, instalar/configurar software, iniciar el CLI, modificar runtime/tests/workflows ni seleccionar una opción A/B/C/D por inferencia.

## Gates

E2/E3 UNKNOWN; E4 NOT READY; P01-B = C — NO SELECCIONAR TODAVÍA; D3 OPEN; raíz PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos STOP; **M0 INCOMPLETO**.
