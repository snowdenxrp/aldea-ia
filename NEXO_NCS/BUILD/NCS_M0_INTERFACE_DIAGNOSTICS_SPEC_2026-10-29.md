# NCS M0 — Especificación de interfaz de control y diagnóstico

**Estado:** PROPOSAL — NOT IMPLEMENTED  
**Fecha:** 2026-10-29  
**Alcance:** diseño de presentación, observabilidad y diagnóstico para el entorno NCS M0 candidato en Termux/Node.js.  
**No autoriza:** cambios de runtime, conexión de bootstrap a un CLI, inicialización real de Continuity, ejecución de pruebas/CI, operaciones protegidas ni cierre de gates.

## 1. Objetivo

La interfaz de M0 debe permitir entender el estado del sistema y sus fallos sin adivinar, sin depender de mensajes vagos y sin confundir una maqueta visual con capacidades implementadas. Debe ser una consola de control técnica, visualmente cuidada y distinta de la interfaz M1, sin avatar ni representación antropomórfica de Nexo.

La interfaz presenta resultados; no decide autoridad, no concede permisos y no constituye evidencia por sí misma.

## 2. Principios obligatorios

1. **Estado con procedencia:** cada indicador relevante identifica la fuente, la hora de observación, el commit/versión aplicable y el método de comprobación cuando esos datos estén disponibles.
2. **Separación epistémica:** diferenciar claramente CONFIRMED, INFERRED, UNKNOWN, NOT RUN, NOT AUTHORIZED, PASS, FAIL y STOP. Nunca convertir ausencia de evidencia en éxito.
3. **Diagnóstico seguro:** abrir detalles o exportar un informe no debe inicializar Continuity, escribir estado operativo, reparar archivos, despachar trabajo ni ejecutar efectos protegidos.
4. **Error accionable:** presentar código estable, componente, fase, causa confirmada o hipótesis etiquetada, impacto, evidencia y siguiente paso permitido.
5. **No ocultar incertidumbre:** si no se conoce la causa, indicarlo literalmente; no presentar hipótesis como hechos.
6. **No reintentar operaciones inciertas:** respetar el protocolo de parada, incluido COMMIT.UNKNOWN; sin reintento automático ni efectos derivados.
7. **Privacidad:** excluir claves, tokens, secretos y contenido sensible de registros/exportaciones por defecto. Redactar datos antes de exportar.
8. **Separación UI/core:** la UI consume resultados estructurados del núcleo. No contiene la lógica de autoridad ni puede elevar privilegios.
9. **Evidencia ligada a versión:** los resultados de tests/CI deben incluir el SHA exacto probado; un resultado de otro SHA no se presenta como validación del código actual.
10. **Accesibilidad y legibilidad:** contraste suficiente, etiquetas textuales además de iconos/colores, tipografía legible y diseño usable en pantalla móvil.

## 3. Vistas mínimas

### 3.1 Resumen de sistema

Mostrar como mínimo:
- estado global de M0;
- estado de raíz/autoridad legítima;
- estado de Continuity y publicación;
- estado de integridad;
- estado de autorización;
- estado de validación: tests, CI y comprobaciones ambientales;
- versión/commit cuando se conozca;
- última observación y antigüedad de la evidencia.

Cada tarjeta abre detalles. Los estados de ejemplo o demostración deben marcarse como datos ilustrativos, nunca mezclarse con lecturas reales.

### 3.2 Detalles de un indicador

Cada detalle debe responder:
- ¿Qué significa este estado?
- ¿Qué se comprobó exactamente?
- ¿Qué evidencia sustenta la conclusión?
- ¿Qué no se comprobó?
- ¿Qué requisito sigue abierto?
- ¿Qué acción está permitida y cuál está bloqueada?
- ¿Cuál es el siguiente paso seguro?

### 3.3 Centro de diagnóstico

Para cada fallo, registrar cuando sea posible:
- código estable y versión del esquema de error;
- componente y fase;
- fecha/hora y correlación de la operación;
- resultado observado y causa confirmada;
- hipótesis, separadas explícitamente de la causa confirmada;
- impacto conocido y alcance de incertidumbre;
- evidencia asociada, con rutas/identificadores seguros;
- siguiente paso recomendado y requisitos de autorización;
- indicación de si hubo escrituras o si el resultado de persistencia es incierto.

Si no se conoce un campo, mostrar UNKNOWN/NOT AVAILABLE, no inventarlo.

### 3.4 Registro de actividad y evidencias

Permitir filtrar por componente, código, fecha, commit y severidad. Diferenciar:
- inspección estática;
- prueba ejecutada;
- CI ejecutado;
- observación del dispositivo/entorno;
- operación de runtime;
- evidencia documental.

El registro debe preservar el hecho de que una prueba no se ejecutó (NOT RUN) y no inferir PASS de la existencia de un test.

### 3.5 Exportación de diagnóstico

Generar un informe legible y estructurado con:
- estado general y gates relevantes;
- commit/version;
- comprobaciones ejecutadas y no ejecutadas;
- errores y evidencias vinculadas;
- incertidumbres y límites de la observación;
- pasos siguientes recomendados;
- lista de datos omitidos/redactados.

La exportación no debe contener secretos ni efectuar cambios en el estado operativo.

### 3.6 Acciones controladas

Las acciones visibles deben derivarse de capacidades realmente disponibles y autorizadas. Antes de una acción sensible, mostrar su alcance, efectos esperados, precondiciones y autorización requerida. Las acciones no implementadas deben mostrarse como no disponibles, no como botones funcionales.

## 4. Contrato de diagnóstico

Modelo conceptual mínimo para cada resultado:

- code: identificador estable del resultado/error;
- status: estado enumerado y explícito;
- component: componente responsable;
- phase: fase en que se observó;
- message: resumen breve;
- confirmed_cause: causa demostrada, o UNKNOWN;
- hypotheses[]: hipótesis etiquetadas como no confirmadas;
- evidence[]: referencias a evidencia disponible;
- commit: SHA asociado, si aplica;
- observed_at: hora de observación, si está disponible;
- side_effects: NO_OBSERVED, CONFIRMED, UNKNOWN o NOT_APPLICABLE;
- next_safe_step: siguiente paso permitido o NONE_APPROVED;
- authorization: estado de autorización, sin elevarlo desde la UI.

Este contrato es una propuesta de diseño, no una API implementada.

## 5. Estados y semántica

- **PASS:** la comprobación especificada se ejecutó y satisfizo su criterio, para el SHA/entorno indicado.
- **FAIL:** la comprobación se ejecutó y falló su criterio.
- **UNKNOWN:** evidencia insuficiente o ambigua; no equivale a PASS.
- **NOT RUN:** no se ejecutó.
- **NOT AUTHORIZED:** no existe autorización para realizar la operación.
- **STOP:** no continuar por la ruta afectada.
- **PENDING:** requisito aún no resuelto.
- **NOT APPLICABLE:** requisito explícitamente no aplicable, con justificación.

No se deben reducir estos estados a un único semáforo que oculte las diferencias.

## 6. Presentación visual

Dirección recomendada:
- tema oscuro grafito;
- acentos azul/cian discretos;
- paneles compactos y legibles;
- iconos acompañados por texto;
- ausencia de avatar/personaje;
- sin animaciones que sugieran actividad no real;
- etiquetas de estado consistentes;
- diseño móvil primero, con expansión de detalles bajo demanda.

La calidad visual no debe ocultar gates abiertos ni hacer parecer operativo un componente que todavía es documental o una maqueta.

## 7. Criterios de aceptación de la interfaz

La interfaz solo se considerará aceptada cuando se demuestre que:
1. todo estado crítico identifica su significado y procedencia;
2. UNKNOWN, NOT RUN y NOT AUTHORIZED no aparecen como PASS;
3. cada error muestra código, evidencia disponible, incertidumbre y siguiente paso seguro;
4. la UI no puede autorizar ni ejecutar por sí sola operaciones protegidas;
5. abrir detalles y exportar no produce escrituras operativas;
6. el informe exportado excluye secretos y deja claras las limitaciones;
7. los resultados de pruebas/CI se vinculan al SHA exacto;
8. los controles deshabilitados explican la precondición o autorización que falta;
9. los estados de demostración se distinguen inequívocamente de datos reales;
10. la interfaz se valida en el entorno objetivo antes de declararla disponible.

## 8. Límites actuales y relación con M0

Esta especificación no cierra ningún gate y no demuestra que exista una interfaz implementada. El estado global continúa siendo **M0 INCOMPLETO**. Raíz legítima, autorización, aislamiento de escritores, publicación segura, bypasses, pruebas y CI conservan sus estados registrados en NEXO_NCS/STATUS.md.

El entorno candidato elegido por el usuario es **Termux + Node.js**, sujeto a confirmar su disponibilidad y a demostrar los controles requeridos. Esta elección no autoriza instalación, configuración, comandos en el dispositivo ni bootstrap real.

## 9. Orden de trabajo recomendado

1. Mantener esta especificación como propuesta documental.
2. Cerrar los bloqueos de seguridad y de entrada/salida de M0 según la ruta mínima existente, sin repetir auditorías concluidas.
3. Obtener autorización específica antes de cambios de runtime fuera del alcance FB-01 ya autorizado, pruebas/CI o comandos del dispositivo.
4. Implementar UI solo cuando exista una fuente de estados estructurada y segura.
5. Validar que la interfaz no altera la autoridad ni los efectos del núcleo.
6. Declarar por separado estado visual, estado funcional y estado de seguridad.
