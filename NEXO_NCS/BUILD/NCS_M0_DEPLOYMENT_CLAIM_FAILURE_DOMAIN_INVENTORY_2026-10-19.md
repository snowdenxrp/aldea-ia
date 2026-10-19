# Nexo M0 — inventario claim-relative de despliegue y dominios de fallo

Fecha: 2026-10-19
Estado: **INVENTARIO DE REQUISITOS Y EVIDENCIA — NO SELECCIONA RAÍZ; NO AUTORIZA IMPLEMENTACIÓN NI DISPATCH**

## Propósito

Cumplir el siguiente paso ya definido por STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md y STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md: convertir los objetivos reales de Nexo en afirmaciones delimitadas, dominios de fallo y obligaciones de evidencia antes de comparar familias de reconocimiento. Este documento no vuelve a derivar el contrato de bootstrap ni crea un segundo modelo de estados.

## Jerarquía de evidencia

- **Observado en código/CI:** sólo lo ligado a artefactos, SHA y ejecución concretos.
- **Invariante/objetivo arquitectónico:** requisito que gobierna el diseño; no es prueba de implementación.
- **Supuesto de entorno:** condición externa que debe declararse y no presentarse como garantizada.
- **UNKNOWN/PENDING:** no existe evidencia suficiente para cerrar la afirmación.

## Inventario de afirmaciones y fronteras

| ID descriptivo | Afirmación delimitada | Estado de evidencia | Dominios de fallo que deben analizarse | Obligación para una futura frontera protegida |
|---|---|---|---|---|
| C0 — settlement local Chronicle | La vertical local Chronicle pasa las regresiones registradas en el SHA probado. | **Observado**, limitado a CI integrado [39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA 8d4583d8a8074b2993e77faa3770d7abcfe7b6ae. La salida pública expone authorization: NOT_EVALUATED. | Código/test/CI; store local; integridad de artefactos; separación entre resultado local y autorización. | No convertir settlement, replay o CI PASS en identidad legítima, autorización constitucional ni prueba de efecto externo. |
| C1 — identidad del propietario tras pérdida total | El propietario legítimo puede volver a ser reconocido después de perder todos los teléfonos y reinstalar Nexo. | **Objetivo explícito; no demostrado.** | Pérdida simultánea de dispositivos; pérdida/compromiso de credenciales; copia restaurada; proveedor/modelo; operador de recuperación; estado offline; sustitución de plataforma. | Debe existir una base de reconocimiento preestablecida e independiente del estado restaurado. Si no sobrevive ninguna base verificable, mantener AUTHORITY_UNAVAILABLE/UNKNOWN y no inventar autoridad. |
| C2 — continuidad entre plataformas | La legitimidad y los límites de Nexo no dependen de un modelo, proveedor, teléfono, SO o plataforma concretos. | **Invariante arquitectónico; implementación no probada.** | Dependencia común de proveedor; cuenta/servicio externo; SO/firmware; clave ligada a un dispositivo; datos migrados; cambio de modelo; reinstalación. | Distinguir evidencia de identidad/integridad de autoridad constitucional. La portabilidad no puede ser bypass de reautenticación ni motivo para privilegiar un proveedor. |
| C3 — estado restaurado no se autoautoriza | Un snapshot íntegro puede recuperar datos, pero no reestablece por sí solo autoridad vigente. | **Invariante respaldado por investigación histórica; no hay implementación de raíz demostrada.** | Rollback; clonación; snapshots de ramas incompatibles; recuperación desde estado revocado; restauración sin red; store y autoridad con una misma dependencia. | Requerir evidencia de currentness/orden/sucesión que no derive sólo del snapshot. Si la composición es insuficiente, UNKNOWN/STOP; conflicto de raíces sin orden gobernado queda AUTHORITY_UNRESOLVED. |
| C4 — autorización específica de operación | La autorización aplica a un principal, acción, recurso, contexto y alcance determinados. | **Contrato histórico establecido; runtime Nexo aún no evalúa autoridad.** AB105.077R separa identidad/política/decisión/efecto. | Caller no autenticado; contexto/policy incompletos; decisión histórica; recurso cambiado; permisos implícitos; alcance amplificado. | Reutilizar el contrato de decisión existente; no añadir un enum/campos nuevos desde este inventario. Ausencia de inputs críticos => UNKNOWN/STOP, no ALLOW. |
| C5 — frescura y revocación en el límite final | Una decisión usada para ejecutar sigue vigente en el punto inmediatamente anterior al efecto, y la revocación realmente impide el efecto. | **Normativa histórica establecida; enforcement de Nexo no demostrado.** AB105.078R distingue STALE, REVOKED, solicitud de revocación y revocación efectivamente aplicada. | Ejecución offline; propagación retrasada; caché; carrera STOP/dispatch; proceso en vuelo; frontera final que puede ser evitada. | No colapsar STALE y REVOKED. El estado genérico seguro es UNKNOWN/STOP si no se demuestra frescura/enforcement; no afirmar revocación efectiva sólo porque fue solicitada. |
| C6 — enforcement de efectos protegidos | La última frontera capaz de producir el efecto impide dispatch sin autorización actual y puede dar evidencia de efecto/no efecto. | **No demostrado.** La brecha M0 registra que la raíz/decisión no se consulta en runtime; authorization: NOT_EVALUATED sigue explícito. | Caller/runtime/adapter; rutas de bypass; autoridad y enforcement con la misma dependencia; crash después de dispatch; resultado ambiguo. | Mantener efectos protegidos STOP. PREPARED, settlement local o validación semántica no sustituyen autorización ni enforcement. Reconciliar outcome por separado. |
| C7 — separación de Nexo y Lúmina | La continuidad, memoria, autoridad y ejecución de Nexo no dependen de la simulación/estado de Lúmina. | **Invariante de arquitectura; no se infiere separación total sólo de tests M0.** | Estado compartido; importaciones/puentes heredados; memoria serializada junto a simulación; fuente de autoridad compartida. | No usar Lúmina como raíz ni fuente de verdad de Nexo. Cualquier acoplamiento debe demostrarse y resolverse estructuralmente, no con una marca de estado. |
| C8 — sucesión futura | Cualquier sucesión es una transición constitucional independiente y gobernada; no se activa por cambio de dispositivo o recuperación. | **Requisito futuro; no activado ni demostrado.** | Conflicto de sucesores; autoridad anterior aún activa; recovery usado para ampliar permisos; prueba/credencial válida pero fuera de alcance. | Mantener fuera del alcance actual. Aplicar precedencia/fencing sólo si existe contrato constitucional previo; sin él, conflicto sin resolver y STOP. |

## Separación de dominios y límites

Los roles ya definidos en el mapa canónico permanecen distintos semánticamente: gobierno/Constitución; identidad/credencial; integridad/medición; appraisal de evidencia; actualización; recuperación; sucesión/orden; enforcement final; continuidad/historia; contención de emergencia. Esto no exige una pieza física por rol. Compartir un mecanismo sólo puede aceptarse después de demostrar que la dependencia común no invalida las afirmaciones para el threat model pertinente. La independencia desconocida no cuenta como independencia.

Familias de reconocimiento que STATUS ya mantiene como **alternativas sin decisión**:
- provisión inmutable/externa previamente establecida;
- actualización de raíz mutable previamente protegida;
- raíz de plataforma/hardware, sólo para las propiedades que realmente cubra y si se aplica independientemente;
- composición multi-raíz/umbral sólo con contrato y evidencia de independencia.

No se clasifican ni elige una familia aquí porque el inventario todavía no demuestra qué supuestos de despliegue están disponibles de verdad. Ninguna familia se eleva a decisión por comodidad.

## Contratos canónicos reutilizados — no duplicar

- NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md — propietarios semánticos de los roles y reglas de separación.
- NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md — para el claim de bootstrap, la salida es ESTABLISHED sólo en su alcance exacto; UNKNOWN si independencia/dependencia/actualidad/orden es irresuelta; INVALID si una condición requerida queda refutada.
- NEXO_NCS/BUILD/STEP_7_BOOTSTRAP_COMPOSITION_CONTRACT_ATTACK_2026-10-08.md y STEP_7_INDEPENDENCE_FAILURE_DOMAIN_CONTRACT_2026-10-08.md — ataques y análisis de dominios comunes ya cerrados; no reejecutarlos.
- docs/nexo/NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md — sin raíz independiente, no se fabrica autoridad; recuperación no es currentness ni assurance.
- docs/nexo/AB105_077R_authorization_effective_permission_contract_2026-09-30.md y docs/nexo/AB105_078R_authorization_freshness_revocation_2026-09-30.md — decisión por contexto y frontera de frescura/revocación.
- NEXO_NCS/BUILD/NCS_M0_AUTHORITY_ADMISSION_GAP_2026-10-19.md — gap de runtime M0 observado.

## Corrección de compatibilidad del borrador semántico del 2026-10-19

El borrador NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md separa correctamente las capas, pero su lista ESTABLISHED / UNAVAILABLE / CONFLICT / STALE_OR_REVOKED / UNKNOWN no debe convertirse en un nuevo enum de runtime:
- el contrato mínimo de bootstrap ya define ESTABLISHED / UNKNOWN / INVALID para la afirmación exacta de composición;
- la investigación de recuperación ya contiene AUTHORITY_UNAVAILABLE y AUTHORITY_UNRESOLVED para pérdida de raíz y raíces incompatibles;
- AB105.078R separa STALE de REVOKED porque revocación solicitada no es revocación aplicada.
La combinación STALE_OR_REVOKED borra una distinción contractual existente; CONFLICT como estado agregado duplica AUTHORITY_UNRESOLVED en la frontera de autoridad. Tratar la lista del borrador como **no normativa y pendiente de corrección**. No crear un segundo vocabulario ni cambiar el runtime para materializarla.

## Próximo paso autorizado por la evidencia

Antes de comparar las familias de reconocimiento, completar la matriz de **hechos de despliegue** que siguen desconocidos: qué soporte de recuperación existe realmente fuera del teléfono; qué dependencia puede permanecer disponible sin conexión; quién controla cada material/credencial; qué garantías de plataforma son observables; qué frontera de ejecución está dentro del control de Nexo; y qué pérdida común se acepta como estado no recuperable. Etiquetar cada respuesta como verificada, supuesto de entorno o UNKNOWN.

No asumir que hay un dispositivo externo, una cuenta/servicio de recuperación, material impreso, segundo factor independiente ni raíz hardware disponible. Si no hay evidencia, dejarlo UNKNOWN. Sólo después comparar las familias frente a esos hechos. No seleccionar root ni implementar el evaluator por intuición.

## Estado

- Root mechanism: **NOT SELECTED**.
- Independent recognition in runtime: **NOT IMPLEMENTED / NOT PROVEN**.
- Public Chronicle authorization: **NOT_EVALUATED**.
- Protected effects: **STOP**.
- Nexo/Lúmina: **separados por invariante; no declarar prueba completa sin evidencia**.
- M0 global: **INCOMPLETO**.
