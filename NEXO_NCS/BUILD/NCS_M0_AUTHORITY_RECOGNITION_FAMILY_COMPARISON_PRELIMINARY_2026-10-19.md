# Nexo M0 — comparación preliminar de familias de reconocimiento de raíz

Fecha: 2026-10-19
Estado: **COMPARACIÓN CONDICIONAL — NO ES DECISIÓN DE DESPLIEGUE; ROOT/IMPLEMENTACIÓN STOP**

## Base de comparación

Fuentes canónicas reutilizadas:
- NEXO_NCS/BUILD/NCS_M0_DEPLOYMENT_CLAIM_FAILURE_DOMAIN_INVENTORY_2026-10-19.md
- NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md
- NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md
- NEXO_NCS/BUILD/STEP_7_BOOTSTRAP_COMPOSITION_CONTRACT_ATTACK_2026-10-08.md
- NEXO_NCS/BUILD/STEP_7_INDEPENDENCE_FAILURE_DOMAIN_CONTRACT_2026-10-08.md
- docs/nexo/NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md
- docs/nexo/AB105_077R_authorization_effective_permission_contract_2026-09-30.md
- docs/nexo/AB105_078R_authorization_freshness_revocation_2026-09-30.md

La comparación usa los requisitos reales C1–C6 del inventario: reconocimiento del propietario tras pérdida total de dispositivos; portabilidad; no-autorización desde snapshot restaurado; decisión específica; frescura/revocación; y enforcement en el último límite de efecto. Las familias son alternativas arquitectónicas, no productos ni decisiones aprobadas.

## Contexto operativo que sí se conoce

- El proyecto se trabaja actualmente desde Android; el propietario informó que no dispone de PC ni impresora.
- No hay llave hardware adquirida/seleccionada, ni raíz externa/custodio/autoridad de recuperación seleccionados.
- El teléfono actual es canal candidato, no autoridad raíz.
- Las condiciones de recuperación externa, custodia de cualquier material independiente, capacidad de verificación offline y enforcement final siguen UNKNOWN.
- La ausencia de una solución seleccionada no prueba que ninguna pueda establecerse después; sólo impide contarla como capacidad disponible hoy.

## Matriz comparativa

| Familia candidata | Qué puede aportar si se establece correctamente | Fallos o límites contra los claims C1–C6 | Dependencias que deben probarse | Estado con la evidencia actual |
|---|---|---|---|---|
| Provisión inmutable/externa previamente establecida | Una base de reconocimiento fuera del estado restaurado; puede dar una ruta de recuperación si permanece bajo custodia independiente y está gobernada antes del desastre. | Si el material depende del único teléfono, de la misma copia o de una cuenta/proveedor comprometido, no es independiente. Puede resolver bootstrap y aun así fallar en revocación offline, sucesión o enforcement final. | Quién provisionó y autorizó la base inicialmente; dónde reside/controla el soporte; pérdida/compromiso; revocación/cambio de autoridad; verificación tras pérdida total; fencing de ramas antiguas. | **No disponible como hecho probado**: no se ha identificado ni seleccionado un soporte/custodio real. La impresora no está disponible; no asumir papel impreso. |
| Actualización de raíz mutable previamente protegida | Rotación y cambio gobernado de la raíz después de que ya exista una base reconocida; permite actualizar confianza sin redefinir todo el sistema. | No resuelve por sí sola el primer bootstrap: el mecanismo de actualización necesita una raíz previa que autorice el cambio. Puede aceptar una raíz antigua tras rollback si currentness/orden no está protegido. | Autoridad previa para autorizar actualización; protección del mecanismo de cambio; validación antes de retirar la raíz anterior; recuperación si la actualización falla; anti-rollback y revocación en la frontera final. | **No seleccionable para bootstrap inicial** con la evidencia actual. Podría ser una función futura subordinada a una base independiente ya reconocida. |
| Raíz de plataforma/hardware | Puede respaldar afirmaciones limitadas de posesión de clave, medición, arranque o integridad de plataforma cuando el mecanismo y el alcance se verifican. | Integridad de dispositivo no equivale a identidad legítima del propietario ni a autoridad constitucional. El vínculo a un dispositivo puede fallar justo cuando se pierden todos los teléfonos o se reemplaza la plataforma. No resuelve automáticamente la revocación offline ni un sink de ejecución que pueda evitarse. | Qué propiedad exacta mide/atestigua; cadena de confianza y firmware; quién autoriza el vínculo propietario-clave; recuperación/reemplazo; currentness; independencia respecto del SO/proveedor; último punto de enforcement. | **No seleccionada ni disponible como base de proyecto**: no hay llave hardware elegida; el teléfono actual no se convierte en raíz por estar disponible. |
| Composición multi-raíz/umbral | Puede tolerar pérdida de una fuente o exigir combinación de soportes para una claim concreta, si la regla y las dependencias son previas, explícitas y verificables. | N fuentes no implican N dominios independientes. Puede quedar bloqueada si se pierden todas, si comparten custodio/proveedor/política/recuperación, o si hay ramas válidas incompatibles. Un umbral no crea legitimidad inicial por sí solo. | Regla constitucional de composición; alcance; cierre de dependencias/failure domains; independencia por claim; disponibilidad real; conflicto/sucesión; revocación; recuperación cuando faltan fuentes. | **No seleccionada**: no hay conjunto real de raíces ni evidencia de independencia. No introducir quorum/umbral sólo para cerrar el hueco. |

## Cambio de alcance posterior (2026-10-19)

La decisión `NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md` limita la primera versión a una llave raíz y un dispositivo. Por tanto, esta comparación **ya no es una puerta previa para continuar M0** ni una invitación a seguir investigando familias de raíz. Se conserva como registro de límites/riesgos y como referencia para el diseño concreto de bootstrap cuando el flujo de arranque esté listo para especificarse.

Para la fase inicial se acepta el riesgo explícito de que la pérdida irrecuperable de la única llave pueda dejar Nexo inaccesible. No se acepta, en cambio, fingir recuperación desde estado restaurado ni omitir la evaluación de cada operación protegida. La selección concreta de la llave y la prueba de arranque se decidirán en la implementación, con evidencia y pruebas; no se declara que el hardware exista hoy.

La prioridad inmediata vuelve a M0: revisar la validación real del cambio de consulta de misión y continuar la coherencia entre estado persistido, pasos y reconstrucción. Multi-dispositivo, sucesión y recuperación avanzada quedan pospuestos.

## Resultado por requisito

1. **Pérdida de todos los teléfonos:** ninguna familia satisface C1 automáticamente. Debe existir una base preestablecida que sobreviva a esa pérdida o la autoridad queda no disponible; la copia restaurada no puede reemplazarla.
2. **Cambio de modelo/proveedor/dispositivo:** es un requisito semántico transversal, no evidencia a favor de una familia concreta. La raíz no debe residir exclusivamente en el modelo ni equiparar identidad de dispositivo con autoridad.
3. **Currentness y revocación offline:** ninguna familia por nombre garantiza enforcement fresco. Se necesita un contrato de autoridad y una frontera que pueda demostrar vigencia/revocación para el efecto concreto. Si no puede demostrarlo offline, el efecto protegido queda STOP.
4. **Enforcement:** la selección de raíz no resuelve por sí misma el límite final. El runtime M0 actual marca authorization NOT_EVALUATED; no hay base para habilitar dispatch protegido.
5. **No amplificación:** bootstrap sólo establece los claims cubiertos por su composición; no concede automáticamente política, capacidad, misión, ejecución, sucesión ni verdad del mundo.

## Conclusión acotada

No hay evidencia para promover una familia. La conclusión no es “usar hardware”, “usar varias raíces” ni “usar un servicio externo”. La conclusión verificable es más limitada: **ninguna familia puede seleccionarse con los hechos de despliegue que hoy constan en el proyecto**.

La dependencia decisiva aún UNKNOWN es qué soporte de reconocimiento/recuperación puede permanecer bajo control legítimo e independiente tras la pérdida de todos los teléfonos, y qué evidencia permite verificarlo sin que el estado restaurado se autentique a sí mismo. También permanece UNKNOWN la frontera final de ejecución que puede hacer cumplir una decisión vigente.

## Próximo paso concreto

Antes de convertir cualquier familia en decisión, registrar evidencia concreta (no una preferencia teórica) para:
- material/soporte de recuperación que realmente exista fuera del teléfono, si existe;
- quién controla ese soporte y bajo qué autorización previa;
- qué puede verificarse sin conectividad y cómo se conoce revocación/currentness;
- qué componente de Nexo controla el último dispatch y qué rutas pueden evitarlo.

Si no hay un soporte independiente hoy, documentar explícitamente **NO EXISTE / UNKNOWN** según la evidencia; no crear una credencial ficticia ni instalar hardware/software sólo para aparentar avance. Mantener M0 INCOMPLETO y efectos protegidos STOP.
