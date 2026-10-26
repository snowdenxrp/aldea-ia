# M1 — reconciliación documental de la rama histórica de corrección

Fecha: 2026-10-26  
Estado: **SOLO LECTURA / SOLO DOCUMENTACIÓN — SIN VALIDACIÓN DE RUNTIME**  
Rama canónica inspeccionada: `ncs-clean-architecture`  
HEAD canónico observado: `d6d08c086c55a6f297bf73d8d23d4f4266f23d04`

## Conclusión ejecutiva

**La corrección histórica no puede declararse integrada en el HEAD canónico.** La comparación de refs muestra ramas divergentes; la fuente Kotlin actual y la histórica conservan el mismo flujo central de envío de prompt y presentación directa del stream, mientras que el script histórico que pretendía parchear el wrapper nativo no existe en el árbol canónico inspeccionado. No se encontró evidencia documental suficiente para certificar que los cambios nativos propuestos estén presentes en el código/build canónico o en la APK instalada.

Esto no demuestra que cada cambio histórico esté ausente de todos los artefactos o del dispositivo; significa que la integración y el estado instalado permanecen **UNKNOWN/PENDING**. No hacer cherry-pick ni reimplementar por inferencia.

## 1. Comparación de ramas y alcance

- Rama canónica: `ncs-clean-architecture`, HEAD observado `d6d08c086c55a6f297bf73d8d23d4f4266f23d04`.
- Rama histórica: `ncs/m1-fix-chat-context-generation-limit`, ref base reportada por el endpoint compare `e52d2657c69173bd9b655c80cd6ae196fc358302`.
- GitHub compare reportó `status=diverged`, `ahead_by=3518`, `behind_by=41`, merge-base `0a8b5a0d8bde2d91b78e3eb1ea5a1d563dbdc852`. La diferencia global de ramas es demasiado amplia para tratarla como un parche directo o hacer cherry-pick sin revisión por archivo.
- Endpoint de comparación: https://github.com/snowdenxrp/aldea-ia/compare/ncs/m1-fix-chat-context-generation-limit...ncs-clean-architecture

## 2. Hechos observados en fuentes exactas

### Kotlin / presentación del prompt

- Canónico `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt`, blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`.
- Histórico, mismo path, blob `9cff99daaf48a91eb1076236ad1aae1733834f59`.
- En ambos, `sendPrompt()` llama a `activeEngine.sendUserPrompt(userText, MAX_GENERATED_TOKENS).collect { token -> output.append(token) }`; limpia la salida antes de cada pregunta y muestra directamente los fragmentos emitidos. El método no compone por sí mismo una transcripción mult-turn.
- Las diferencias inspeccionadas en el entorno de UI (insets, selección de texto y detalles de pantalla) no prueban una corrección de reconstrucción de contexto ni de límite nativo.
- La constante de UI `MAX_GENERATED_TOKENS = 256` no prueba por sí sola que el motor nativo cumpla el límite exacto.

### Auditoría y plan históricos

- Auditoría: [NEXO_M1_OUTPUT_FORMAT_ROOT_CAUSE_AUDIT_2026-10-10.md](NEXO_M1_OUTPUT_FORMAT_ROOT_CAUSE_AUDIT_2026-10-10.md), blob `1029dce05ad6ef39f6c077ba756e6dfe79d8dba9`, presente en la rama histórica, no en el árbol canónico inspeccionado.
- Plan de regresión: [M1_CHAT_CONTEXT_GENERATION_REGRESSION_TESTS.md](M1_CHAT_CONTEXT_GENERATION_REGRESSION_TESTS.md), blob `9bb6aa11c9b240f6c47a369e82b9bcb6e769485a`, presente en la rama histórica, no en el árbol canónico inspeccionado.
- Script de parche: `NEXO_NCS/M1_ANDROID/apply-native-diagnostics.py`, blob `7ea0f3e56dac32680d8bcaee69eafc90b4419ef3`, presente en la rama histórica, no encontrado en la rama canónica inspeccionada.

### Qué pretendía cambiar el script histórico

La lectura estática del script muestra reemplazos propuestos en el código upstream nativo `llama.cpp/examples/llama.android/lib/src/main/cpp/ai_chat.cpp` y en `InferenceEngineImpl.kt`:
1. activar la plantilla Jinja integrada y `enable_thinking=false` para el formato Qwen3;
2. reconstruir el historial completo y verificar que el contexto anterior sea un prefijo exacto antes de extraer el sufijo;
3. fallar explícitamente si el formato/contexto no coincide;
4. evitar añadir BOS redundante en los sufijos ya formateados;
5. calcular el límite a partir de los tokens de prompt realmente decodificados tras truncamiento, en vez de volver a sumar el tamaño del prompt en `stop_generation_position`;
6. añadir captura limitada de errores nativos y propagación JNI/Kotlin para diagnóstico de carga.

**Importante:** el script contiene anclas de sustitución y aserciones post-parche, pero su existencia no prueba que se ejecutara, que las anclas coincidieran en la revisión upstream utilizada, que el código resultante compilara o que llegara a un APK instalado. No se ejecutó el script.

## 3. Interpretación separada por claim

| Claim | Estado documental |
|---|---|
| El flujo Kotlin canónico sigue mostrando directamente el stream nativo | **OBSERVADO** en el blob canónico citado |
| El flujo Kotlin por sí solo explica la respuesta genérica repetida | **NO DEMOSTRADO** |
| El script histórico define cambios concretos para plantilla/contexto/BOS/límite | **OBSERVADO** por lectura del blob histórico |
| Esos cambios están aplicados en el árbol canónico actual | **NO EVIDENCIADO; UNKNOWN** |
| El límite real de 256 tokens se respeta en la APK instalada | **UNKNOWN; no se midió** |
| La APK actualmente instalada corresponde al HEAD canónico o a la rama histórica | **UNKNOWN; no se comparó identidad de APK instalada** |
| El fallo de respuestas repetidas está resuelto | **NO DECLARAR RESUELTO** |

## 4. Continuación exacta

1. Mantener esta reconciliación y los artefactos históricos como evidencia de diseño, no como código integrado.
2. Si se requiere una nueva comparación, identificar primero los commits concretos que introdujeron el script y los cambios de upstream; luego comparar blobs/patches de forma acotada, sin ejecutar nada.
3. No copiar ni aplicar el script histórico de manera automática: contiene cambios nativos de producción y la rama completa está divergida.
4. Conservar los criterios del plan histórico: salida exacta `VERDE`, cálculo `17 × 23 = 391`, contexto temporal `AZUL-27`, tres preguntas distintas consecutivas, medición nativa real del límite y rechazo fail-closed de mismatch de plantilla.
5. Validación futura requiere autorización explícita nueva. Hasta entonces, no tests, CI, compilación, APK, instalación ni cambios del dispositivo.

## 5. Límites de autorización y estado

- Solo lectura de GitHub y documentación; no se ejecutaron tests/CI ni scripts.
- No se modificaron runtime, tests, workflows, APK, instalación ni dispositivo.
- M1: issue conocido; corrección integrada **UNKNOWN**; validación de runtime **PENDING**.
- NCS M0: estado y gates sin cambios. M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
