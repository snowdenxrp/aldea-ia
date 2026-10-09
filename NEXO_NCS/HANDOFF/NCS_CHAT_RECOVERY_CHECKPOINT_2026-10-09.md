# NCS — Chat recovery checkpoint
Fecha: 2026-10-09
Rama: `ncs-clean-architecture`

## Motivo
El usuario informa que parte de esta conversación desapareció y pide que no queden huecos. Este archivo preserva el estado que se puede verificar ahora. No afirmar que el texto desaparecido se recuperó literalmente si no hay copia comprobable.

## Decisión del usuario sobre parches
El usuario aclaró: siempre quiso evitar que Nexo estuviera lleno de parches, pero si los parches fueran necesarios para avanzar, está de acuerdo con usarlos. No existe una prohibición absoluta. Diagnosticar primero; corregir de raíz si hay defecto estructural; permitir parches justificados, con alcance, riesgo y pruebas; no aceptar parches que oculten violaciones de autoridad/Constitución o conviertan UNKNOWN en permiso. Si el parche es coherente y seguro, avanzar; si oculta una falla estructural peligrosa, detenerse y rediseñar.

## Trabajo de esta continuación
- Releídos el handoff de ciencia/AB104, `NEXO_NCS/STATUS.md` y la nota de recuperación científica.
- Se ampliaron búsquedas en GitHub e inventario de Library para física, leyes físicas, gravedad, mecánica, relatividad, energía, entropía, termodinámica, método científico, experimentos, causalidad y aliases de AB104.
- El Master contiene un Intervention Contract y la distinción `Simulation/counterfactual ≠ world observation`.
- Las ramas de experimentación revisadas pertenecen a la simulación de Lúmina (agricultura/ecología/construcción/economía); no demuestran que se haya encontrado la investigación física que el usuario recuerda.
- La investigación física concreta sigue UNKNOWN. No se probó que no exista en conversaciones no indexadas o contenido transitorio.
- Se registraron los resultados en `NEXO_NCS/RESEARCH/STEP_7_HISTORICAL_AB104_SCIENTIFIC_FOUNDATIONS_RECOVERY_2026-10-08.md` y `NEXO_NCS/STATUS.md`.

## Estado operativo que no cambia
STEP 7 sigue STOP por falta de una Trust Foundation/raíz implementada y reconocida independientemente. No implementar ni activar una raíz ni saltar el STOP por esta búsqueda. No repetir AB68 ni AB104 desde cero. No rerun AB105/TLC/Kafka; AB105.117R no debe crearse y TLC sigue congelado. No repetir P0–P34.

## Próximo paso
Leer este checkpoint, el handoff `NEXO_NCS/HANDOFF/NCS_HANDOFF_NEXT_CHAT_2026-10-08_SCIENCE_AB104_RECOVERY.md` y el `STATUS.md` actual. Continuar por linaje/alias/contenido histórico con identificadores nuevos; no repetir los mismos barridos generales. Si aparece una pista concreta del usuario (frase, ecuación, nombre), usarla para buscar exactamente.

## Prevención de huecos
Antes de cambiar de chat: guardar las decisiones y resultados nuevos en el documento canónico y STATUS, hacer commit y leer de vuelta el archivo para verificarlo. Separar texto recuperado literalmente de resúmenes e inferencias; marcar UNKNOWN donde falte evidencia. Este checkpoint conserva el estado verificable, pero no finge que todo texto desaparecido haya sido recuperado.

## Recordatorio explícito del usuario: preservar AB105 como fuente valiosa (2026-10-09)

AB105 contiene información técnica valiosa y debe mantenerse dentro del corpus histórico de NCS junto con AB104. No descartarlo por tener pruebas congeladas ni confundir “no repetir pruebas” con “no reutilizar conocimiento”. Extraer y preservar sus invariantes, fallos, decisiones, límites, artefactos y evidencia ya obtenida para informar el diseño limpio de Nexo. Clasificar cada afirmación por evidencia y alcance; distinguir investigación/documento de implementación, ejecución y garantía real. Respetar estrictamente las restricciones históricas: no ejecutar de nuevo las pruebas congeladas de AB105/TLC/Kafka, no crear AB105.117R, y no repetir probes prohibidos. Reconciliar AB105 con el ancla corregida AB104.759R y la cadena AB104.999R → AB105.000R, sin duplicar ni migrar silenciosamente conclusiones.
