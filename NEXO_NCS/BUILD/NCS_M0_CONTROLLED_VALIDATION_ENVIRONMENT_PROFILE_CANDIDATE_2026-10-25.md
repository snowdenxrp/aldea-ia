# NCS M0 — perfil candidato de entorno de validación controlada

Fecha: 2026-10-25  
Estado: **DISEÑO DOCUMENTAL — CANDIDATO — NO EJECUTADO**  
Autoridad: ratificación del propietario para diseño documental únicamente.  
Ámbito: separar la validación de desarrollo del POCO X7 Pro y de cualquier despliegue productivo.

## 1. Decisión de alcance

Este documento define un perfil candidato y sus incógnitas; no declara que el entorno ya exista ni selecciona una opción de bootstrap. La elección del sistema operativo, supervisor, aislamiento, filesystem o mecanismo de quiescencia queda pendiente de evidencia y de una decisión específica cuando sea necesaria.

**Regla de seguridad:** el entorno no se considera apto para ejecutar pruebas hasta que el propietario otorgue autorización separada para ejecución y se haya confirmado documentalmente el perfil real. Esta especificación no autoriza esa ejecución.

## 2. Perfil propuesto, con campos no inventados

| Campo | Valor actual | Evidencia requerida antes de cualquier ejecución futura |
|---|---|---|
| Identidad del entorno | UNKNOWN | Identificador reproducible del host/VM/entorno aislado, sin secretos |
| Sistema operativo y versión | UNKNOWN | Nombre y versión observados directamente en ese entorno |
| Método de provisión | UNKNOWN | Registro de cómo se crea y restaura el entorno |
| Modo de lanzamiento | UNKNOWN | Entry point y comando exactos, aún solo documentados |
| Supervisor/CI | UNKNOWN | Declarar si existe; no asumir systemd, contenedor, CI o servicio Android |
| Raíz de validación | Propuesta: directorio temporal/dedicado, vacío y exclusivo para el ejercicio | Ruta canónica resuelta y evidencia de que no contiene stores ni datos productivos |
| Datos permitidos | Fixtures sintéticos y desechables únicamente, si una ejecución futura se autoriza | Inventario de fixtures y verificación de que no incluyen secretos/estado real |
| Clave raíz Nexo | Prohibida en el perfil | Confirmación documental de que no se requiere ni se incorpora ninguna clave raíz real |
| Stores productivas | Prohibidas | Confirmación de rutas de entrada/salida y ausencia de referencias productivas |
| Red y servicios externos | UNKNOWN; reducir a mínimo necesario cuando se diseñe el perfil final | Lista explícita de dependencias de red, si las hay, y alcance que queda fuera |
| Writers/launchers externos | UNKNOWN | Inventario del entorno y delimitación de lo que el proceso de validación no controla |
| Límites de acceso a rutas | UNKNOWN | Modelo de permisos y evidencia futura de rutas permitidas/denegadas |
| Filesystem/volumen | UNKNOWN | Identidad del filesystem/volumen y semánticas relevantes para publicación/rename |
| Captura de evidencia | Diseñar formato; aún no hay ejecución ni artefactos de prueba | Comandos observacionales autorizados, salida íntegra, timestamps y vínculo al commit/versión |
| Limpieza/restauración | Diseño pendiente | Procedimiento de descarte de fixtures y entorno sin afectar datos externos |

No se debe completar ningún campo con valores típicos o inferidos.

## 3. Aislamiento y exclusiones

El perfil futuro debe separar tres capas que no deben confundirse:

1. **Aislamiento del área de prueba:** impedir que el caso documentado use accidentalmente la raíz, stores o archivos de producción.
2. **Control de concurrencia dentro del entorno:** describir qué procesos de prueba pueden competir y qué garantía se pretende evaluar.
3. **Quiescencia del despliegue real:** demostrar que ningún writer o launcher real puede operar durante una migración. Un laboratorio aislado no demuestra esta tercera capa.

El entorno controlado no demuestra por sí mismo:
- ausencia de writers externos o relanzamientos en producción;
- seguridad frente a symlink, alias, mount, TOCTOU o escritores que no cooperen;
- atomicidad entre Continuity y Chronicle;
- durabilidad ante corte de energía o fallo de almacenamiento;
- legitimidad constitucional de la raíz, autorización de efectos o integración del CLI con Android/POCO;
- seguridad de un sistema operativo/dispositivo distinto del observado.

## 4. Secuencia documental propuesta (sin ejecutar)

1. Identificar las afirmaciones concretas que se quiere evaluar y clasificarlas como evaluables en laboratorio, solo evaluables en el despliegue real, o no cubiertas.
2. Seleccionar y describir un perfil reproducible sin escoger por anticipado una primitiva de bootstrap.
3. Mapear los entrypoints existentes contra el contrato de raíz ya ratificado: raíz única explícita mediante --root <directory>, sin fallback ambiental/legacy, bootstrap separado, canonicalización antes de derivar rutas y admisión antes de lecturas persistentes.
4. Especificar casos conceptuales de éxito, fallo antes de escritura, fallo parcial, resultado incierto de release y readmisión bloqueada.
5. Definir qué artefactos futuros serían necesarios y cómo distinguirían resultado observado de inferencia.
6. Revisar la cobertura de cada claim y registrar cualquier hueco como UNKNOWN/BLOCKED.
7. Detenerse aquí hasta una autorización separada para ejecución; no generar comandos de ejecución en este documento.

## 5. Relación con las alternativas A/B/C/D

Este perfil no elige:
- A — bootstrap offline + quiescencia externa;
- B — staging directory + publicación atómica;
- C — marcador persistente de inicialización;
- D — coordinación externa fuera de la raíz.

La evaluación de una opción exige resolver sus precondiciones en el entorno real pertinente. El entorno de laboratorio puede ayudar a explorar claims de comportamiento, pero no sustituye la evidencia operacional exigida por la matriz de aceptación.

## 6. Gates y límites vigentes

- M0 INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN.
- D1-IMPLEMENTATION NO AUTORIZADA.
- authorization: NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
- ROOT_READY no habilitado.
- Tests/CI no ejecutados; runtime/tests/workflows/dispositivo sin cambios autorizados.

## 7. Fuentes documentales reutilizadas

- NEXO_NCS/BUILD/NCS_M0_OWNER_RATIFICATION_CONTROLLED_VALIDATION_DOCUMENTARY_ONLY_2026-10-25.md
- NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md
- NEXO_NCS/BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md
- NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md
- NEXO_NCS/BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md
- NEXO_NCS/BUILD/NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md
- NEXO_NCS/BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md

Este perfil es diseño documental, no prueba, implementación, aprobación de bootstrap ni evidencia de despliegue.
