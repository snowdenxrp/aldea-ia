# NCS M0 — evaluación documental de Termux como candidato de lanzamiento/exclusión
**Fecha:** 2026-10-28  
**Rama:** `ncs-clean-architecture`  
**Tipo:** evaluación documental; no ratifica contrato ni selecciona mecanismo; no ejecución.

## 1. Pregunta evaluada
Determinar si Termux, en el POCO X7 Pro con Android 16, puede considerarse por sí solo mecanismo suficiente para lanzar la primera creación de Continuity M0 y demostrar E2 (exclusión/control) y E3 (inventario de launchers/writers).

## 2. Evidencia previa reutilizada
Se reutilizan los resultados ya registrados en esta continuidad; no se repite el inventario:
- No se encontró `~/.termux/boot` ni configuración de `crontab`.
- No se observaron procesos con nombres coincidentes con Nexo/Continuity durante la comprobación previa.
- La consulta de inventario Android mediante `pm` falló; por tanto, esa vía no acredita ausencia de aplicaciones/servicios.
- En la comprobación previa no se encontraron Termux:Boot, Tasker, MacroDroid, Automate ni Shizuku instalados/identificados. Esto es un resultado limitado a la observación disponible, no un censo completo del dispositivo.
- Se observaron directorios de servicio `sshd`/`ssh-agent`; su presencia no demuestra que estén activos ni que puedan escribir el objeto Continuity.
- No se encontraron referencias de configuración Nexo/Continuity en las ubicaciones inspeccionadas.
- El mecanismo efectivo de lanzamiento sigue sin configurarse/verificarse. El objeto exacto depende del `filePath` efectivo de la invocación; ese path aún no está fijado por contrato.

Los datos anteriores no se reejecutaron en esta evaluación. No se inspeccionó el dispositivo en vivo ni se ejecutó código.

## 3. Evaluación de capacidades
| Requisito | Lo que Termux podría aportar como candidato | Lo que no demuestra la evidencia actual | Resultado |
|---|---|---|---|
| E1 — entorno objetivo | Es el entorno de trabajo disponible dentro del POCO; el POCO/Android ya está identificado como destino previsto. | No prueba que Termux sea el launcher elegido ni que el entorno esté configurado. | E1 identificado; mecanismo pendiente |
| E3 — launcher real | Una invocación manual desde una sesión de Termux podría ser un punto de entrada explícito si se decide y configura más adelante. | No hay operación configurada, comando/entrypoint ratificado ni evidencia de todos los wrappers, servicios, automatizadores o consumidores que puedan escribir o relanzar. | UNKNOWN |
| E2 — detener/controlar escritores | Termux puede controlar procesos iniciados y permisos bajo su propio alcance, sujeto a las capacidades reales del sistema. | No prueba que pueda detener o impedir la reanudación de escritores de otras aplicaciones, servicios Android, procesos privilegiados, procesos cooperativos/no cooperativos o accesos al mismo almacenamiento. Una instantánea de procesos no impide un lanzamiento posterior. | UNKNOWN |
| Exclusividad del objeto | Un directorio privado de la aplicación podría reducir la superficie de acceso, si el path real estuviera dentro de él y esa propiedad se demostrara. | El path efectivo no está fijado; no se ha demostrado almacenamiento privado, permisos efectivos ni ausencia de consumidores externos. | No evaluable aún; E4 NOT READY |
| Resultado ambiguo y recuperación | Un procedimiento manual podría detenerse ante un resultado incierto. | No existe un protocolo aprobado y autorizado de reconciliación para la primera creación. | P01-F OPEN / UNKNOWN |

## 4. Conclusión de la evaluación
**Termux no queda aceptado como mecanismo suficiente de exclusión ni como prueba de E2/E3.** La evidencia disponible solo permite mantenerlo como candidato posible para una futura invocación explícita/manual; no permite seleccionarlo todavía ni inferir aislamiento.

La distinción es importante:
- **Launcher manual** describe cómo se solicita una operación.
- **Exclusión/quiescencia** demuestra que ningún escritor relevante puede competir o reanudarse durante la ventana.
- **Creación exclusiva** demuestra una propiedad de publicación del objeto.
Una sesión manual de Termux no demuestra por sí sola las dos últimas propiedades.

No se recomienda instalar Termux:Boot ni otro supervisor para intentar resolver la brecha: añadir automatización ampliaría la superficie de launchers antes de que el alcance y el control estén definidos.

## 5. Brecha concreta que permanece
Antes de elegir Termux como mecanismo real, la documentación debe identificar, sin inventar valores:
1. el `filePath` efectivo del archivo Continuity candidato y el ámbito de almacenamiento al que pertenece;
2. el entrypoint concreto que se pretende invocar y si existe alguna ruta automática, supervisor o consumidor que pueda escribir o relanzar;
3. qué clase de actores debe cubrir la garantía de exclusión aceptada (no asumir que solo incluye escritores cooperativos);
4. qué evidencia verificable demostraría que esos actores están detenidos y no pueden reanudarse durante toda la ventana;
5. qué resultado bloqueante se aplica si el inventario o el control no pueden demostrarse.

Esta lista no autoriza a obtener esos datos mediante comandos ahora; es el conjunto mínimo de preguntas documentales para resolver la candidatura.

## 6. Decisión y gates
- Termux como launcher manual: **CANDIDATO NO SELECCIONADO**.
- Termux como mecanismo autónomo de exclusión E2: **NO DEMOSTRADO / INSUFICIENTE**.
- E2: `UNKNOWN`.
- E3: `UNKNOWN`.
- E4: `NOT READY`.
- P-01: `OPEN / UNKNOWN`; P01-A…P01-H no se cierran con esta evaluación.
- P-05: `NO RATIFICADA`.
- M0: `INCOMPLETO`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- `authorization: NOT_EVALUATED`; primera creación y efectos protegidos: `STOP`.

## 7. No realizado
No se ejecutaron comandos en el POCO, no se instalaron/configuraron herramientas, no se ejecutó bootstrap, runtime, tests, CI ni GitHub Actions. No se modificó el árbol local de Termux ni archivos de Lúmina. Este documento no modifica el contrato candidato ni `NEXO_NCS/STATUS.md`.
