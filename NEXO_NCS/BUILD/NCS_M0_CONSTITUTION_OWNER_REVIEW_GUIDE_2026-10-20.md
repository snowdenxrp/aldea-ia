# NCS M0 — guía de revisión del propietario para el borrador constitucional

Fecha: 2026-10-20  
Estado: **GUÍA DE REVISIÓN; no es una Constitución ni registra aprobación**  
Rama: `ncs-clean-architecture`

## Documentos fuente — no reescribirlos durante esta revisión

1. Borrador completo: `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md`.
2. Preparación del artefacto: `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_ARTIFACT_READINESS_AUDIT_2026-10-14.md`.
3. Completitud de la revisión humana: `NEXO_NCS/BUILD/STEP_7_CANONICAL_CONSTITUTION_REVIEW_COMPLETENESS_GATE_M0_23_2026-10-16.md`.
4. Decisión de alcance inicial: `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`.
5. Frontera de autoridad actual: `NEXO_NCS/BUILD/NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md`.

Esta guía sólo organiza decisiones ya registradas. No convierte el borrador en fuente normativa ni altera su estado DRAFT / NOT FROZEN / NOT COMMISSIONED.

## Restricciones ya aceptadas que no deben volver a preguntarse como si estuvieran abiertas

- El alcance inicial contempla una sola llave raíz y un solo dispositivo de ejecución.
- La selección física, provisión y verificación concreta de esa llave siguen pendientes.
- La pérdida irrecuperable de la única llave queda fuera del alcance inicial; no se inventará recuperación desde teléfono, cuenta, modelo o snapshot.
- La llave no da permiso ilimitado: cada operación protegida necesita evaluación de autoridad y enforcement en el último límite.
- La hija no tiene autoridad actual por el borrador; sucesión queda fuera del alcance inicial.
- El POCO/pantalla fue aceptado como supuesto acotado de presentación honesta para la primera ceremonia, no como raíz técnica ni verificador independiente.

## Decisiones que siguen OPEN

La revisión debe registrar cada punto como **ACEPTADO**, **RECHAZADO**, **REFORMULAR** o **OPEN** únicamente después de una decisión explícita del propietario. No inferir aprobación por silencio o por “continúa”.

1. **Identidad canónica y renderizado:** identificador constitucional, revisión/versionado, reglas exactas de bytes/canonicalización y renderizado determinista completo.
2. **Scope inicial de la Constitución:** dominios y transiciones gobernados por la primera revisión; exclusiones explícitas. La decisión de una llave/un dispositivo no define por sí sola este scope.
3. **Enmiendas:** quién propone/revisa/aprueba, cómo se vincula la aprobación al contenido exacto, activación, conflicto y retiro de la revisión anterior. El borrador conserva dual control como invariante; su implementación/umbral sigue OPEN y no debe confundirse con el número de llaves del bootstrap inicial.
4. **Currentness y estado canónico:** quién determina qué revisión está activa, cómo se tratan rollback, revocación, conflictos y desconexión. No hay owner de estado constitucional activo demostrado en Core.
5. **Recuperación y sucesión:** para la primera versión, conservar el límite ya aceptado de no garantizar recuperación si se pierde la única llave y no conceder autoridad actual a sucesores. Las reglas futuras no deben escribirse como si ya estuvieran activas.
6. **Contención de emergencia:** triggers, poderes limitados, duración, auditoría y salida. Si no está definido, no crear una facultad implícita.
7. **Verificador:** identidad/procedencia del verificador que evaluará el reconocimiento de raíz y cómo se demuestra que es el que realmente se ejecuta.
8. **Límite de efecto protegido:** qué sink concreto queda cubierto y cómo se demuestra que otras rutas no lo evitan. Un commissioning no concede permiso general para ejecutar misiones.
9. **Base Genesis:** qué evidencia preexistente permite reconocer la llave como raíz sin que la propia llave, la aplicación o el estado que protege se autentiquen a sí mismos.
10. **Constitución→Policy:** mantener el contrato ya existente; definir cómo Core obtiene el contexto gobernante sin aceptar autoridad desde campos del caller.
11. **Pruebas de aceptación:** ausencia, prueba inválida, contenido sustituido, revisión obsoleta/rollback, revocación, conflicto y fallo del sink ⇒ STOP/UNKNOWN; ninguna prueba se declara existente hasta observarla en código y CI.

## Qué significa una revisión humana

Separar expresamente tres acciones:

- **Revisar/recibir** el contenido completo.
- **Aprobar** una revisión exacta como Constitución gobernante.
- **Autorizar** una transición concreta y acotada.

No son equivalentes. Un hash puede identificar bytes; no prueba por sí mismo qué se presentó, que se presentó completo ni qué quiso autorizar el propietario. No generar digest, firma, commissioning transcript ni activar efectos mientras el artefacto cambie o existan decisiones críticas sin resolver.

## Resultado actual

- Artefacto constitucional canónico congelado: **NO DEMOSTRADO**.
- Borrador aprobado por el propietario: **NO REGISTRADO**.
- Procedimiento de reconocimiento de la llave raíz: **PENDING/UNKNOWN**.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- M0: `INCOMPLETO`.

## Instrucción para la siguiente sesión

Presentar al propietario el borrador y esta lista en su orden. No convertir ninguna opción en decisión automáticamente. Si el propietario sólo resuelve algunos puntos, registrar el resto OPEN y continuar únicamente con trabajo que no dependa de esas decisiones. Una vez que el contenido constitucional esté estable y revisado, retomar el contrato de reconocimiento de la llave raíz dentro del scope inicial ya aceptado.


## Cruce directo con el borrador — guía de lectura sin decisiones inferidas (2026-10-20)

Este cruce se añade para evitar que el propietario tenga que buscar cada decisión a lo largo del documento. No introduce reglas nuevas ni sustituye la revisión íntegra.

| Punto de revisión | Sección del borrador | Qué ya expresa el texto | Qué sigue sin decidirse |
|---|---|---|---|
| Identidad canónica/renderizado | Encabezado; §7.1; §8.1; §10 | El texto declara que no está congelado y que canonicalización/renderizado deben ser exactos | ID/revisión canónica, bytes y renderizador deterministas, vínculo contenido-presentación |
| Scope inicial | §2.4; §4.3; §8.2 | La revisión debe declarar scope; el scope no puede ampliarse por el caller | Dominios/transiciones iniciales exactos y exclusiones explícitas |
| Enmiendas/dual control | §7.1; §8.3 | Dual control para cambios constitucionales se conserva como invariante de diseño | Roles, independencia real, umbral, activación y retiro de la revisión anterior |
| Currentness/revocación/rollback | §3.4; §8.4 | La validez histórica o la recencia no determinan la Constitución vigente | Dueño del estado canónico y mecanismo exigible de currentness |
| Recuperación/sucesión | §6.2–§6.3; §8.5–§8.6 | No hay recuperación autoautorizada ni sucesión inferida; la hija no tiene autoridad actual | Mantener fuera del scope inicial la pérdida irrecuperable de la llave única; cualquier régimen futuro requiere decisión propia |
| Contención de emergencia | §6.4; §8.7 | La contención no puede convertirse en gobierno general | Triggers, poderes permitidos, duración, auditoría y salida |
| Verificador | §5.3; §8.8 | Deben declararse identidad, dependencias, independencia y limitaciones | Fuente externa de confianza del verificador y evidencia de que el verificador esperado se ejecuta |
| Sink protegido | §5.1–§5.2; §8.9 | Cada efecto necesita enforcement en el último límite y las ambigüedades no son éxito | Target real, rutas de efecto en scope y evidencia de bypass closure |
| Base Genesis | §2.1–§2.3; §8.10 | La llave/Constitución no pueden legitimarse a sí mismas | Base preexistente de legitimidad y camino protegido de reconocimiento |
| Constitución→Policy | §4.1–§4.3; §8.11 | Policy no puede autoautorizarse ni venir legitimada por campos del caller | Integración Core desde un contexto constitucional ya reconocido |
| Aceptación adversarial | §7.2; §8.12 | PASS requiere evidencia trazable; los ausentes permanecen UNKNOWN | Matriz ligada a la implementación/sink real y CI observado; no declarar tests por estar enumerados |

### Orden recomendado para leer y decidir

1. Leer §§1–6 como principios propuestos para el primer régimen, sin interpretarlos como controles ya implementados.
2. Leer §7 para entender qué garantías de cambio y evidencia aún faltan.
3. Leer §8 completa: cada entrada OPEN es una decisión o dependencia, no una autorización implícita.
4. Leer §9 y distinguir extensiones propuestas de principios recuperados.
5. Sólo entonces decidir si el texto debe reformularse. La aprobación de una revisión exacta y la autorización de una transición concreta siguen siendo actos separados.

**Nota de sincronización (2026-10-21):** la frase histórica anterior describía el estado antes de la revisión conversacional. El registro canónico `NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md` ahora registra los puntos 1–7 como **ACEPTADOS COMO BASE DEL BORRADOR**. Esto no equivale a aprobación constitucional completa ni resuelve los mecanismos/scope que el registro mantiene pendientes. La tabla sigue siendo un índice de revisión; no canoniza el texto, no crea digest/firma y no autoriza commissioning.


---

## Registro de decisiones del propietario — 2026-10-21

El registro explícito del propietario está en [NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md](../DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md). Ese registro prevalece sobre las tablas de trabajo anteriores cuando éstas muestran los puntos 1–6 como OPEN: el propietario **aceptó los puntos 1–6 como base del borrador**, sin observaciones adicionales. Esta aceptación no equivale a aprobación constitucional completa ni congela o activa el borrador.

- Puntos 1–6: **ACEPTADOS COMO BASE DEL BORRADOR**; los mecanismos concretos que el registro identifica expresamente como pendientes permanecen pendientes.
- Punto 7 (Policy, contexto y evaluación de operaciones): **OPEN / NO ACEPTADO**.
- No inferir firma, congelación, commissioning ni autorización de efectos protegidos.
- Estado: borrador DRAFT / NOT FROZEN / NOT COMMISSIONED; M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Este añadido corrige el estado de las decisiones humanas; no modifica el borrador constitucional fuente ni demuestra implementación/runtime.


### Actualización de decisión — punto 7 (2026-10-21)

El propietario aceptó el punto 7, Policy, contexto y evaluación de operaciones, **como base del borrador**, sin observaciones adicionales especificadas. El registro canónico de esta decisión está en [NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md](../DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md).

La aceptación no equivale a aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos. La implementación y su conexión al sink real siguen sin demostrarse. No editar automáticamente el borrador constitucional fuente.
