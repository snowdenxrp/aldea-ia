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


## 6. Commits exactos de la corrección histórica y comprobación de ancestralidad

La consulta de historial por ruta en la rama histórica identifica estos commits:
- `f2c33093cf9e08e777f3041832ff14c76acb545f` — configuración de plantilla Qwen3 / thinking mode.
- `83ad5f40a1a7ff4add68c61b301ebfb39e54fe65` — límites de tokens y tokenización de prompt templated.
- `695ff1249cffc3560db4e971dd07a3bab2320ff0` — fail-closed ante historial de plantilla inconsistente.
- `e5fd005495d03d0e937c9b200adee447e3de8a28` — política BOS/EOS y salto de línea.
- `4789f74289aac92140f9ee39ae2d4bff35635d6b` — reparación de anchors del script nativo.
- `b5bad536ea5ba928f750dd9d9116301d18bcddbb` — aserciones de invariantes de contexto/generación.
- `a7d1076f32891c5044a2e7a12369853f4b9df347` — plan de aceptación/regresión.

Se comparó cada uno de los commits representativos `f2c33093…`, `83ad5f40…`, `695ff124…`, `e5fd0054…` y `a7d1076f…` contra `ncs-clean-architecture`. Cada comparación reportó `status=diverged` con merge-base `0a8b5a0d8bde2d91b78e3eb1ea5a1d563dbdc852`; por tanto, ninguno se confirma como ancestro directo del HEAD canónico. Esto respalda la conclusión de que no se debe tratar la corrección histórica como integrada por herencia de commits.

La comparación de ramas divergidas no excluye que un cambio equivalente se haya portado manualmente a otro archivo/artefacto; no se encontró evidencia suficiente para afirmar tal port. Para cerrar ese claim solo sería válido un cotejo estático por contenido del código nativo efectivo incluido en el árbol canónico y, posteriormente con autorización, evidencia del build/APK correspondiente. No ejecutar pruebas ni builds ahora.


## 7. Nueva evidencia estática decisiva: el build canónico fija upstream sin aplicar el parche histórico

Esta sección eleva la conclusión para el **árbol/build declarado**: ya no es solo que el script no aparezca en el árbol canónico; las instrucciones de build leídas muestran que el flujo canónico obtiene la fuente upstream sin ejecutar ese script.

### 7.1 Preparación y workflow canónicos

- `NEXO_NCS/M1_ANDROID/prepare-llama-android.sh`, blob `1981bf23223f5ac580ed604c7c67efbcd54e86c8`:
  - fija `LLAMA_CPP_SHA=10a60cf303566e10d6a7a2774c17d2085503d87b`;
  - clona/descarga y hace checkout detached de esa revisión;
  - verifica el SHA;
  - copia `llama-lib.build.gradle.kts` sobre el Gradle upstream.
  - **No invoca** `apply-native-diagnostics.py` ni aplica modificaciones a `ai_chat.cpp` o `InferenceEngineImpl.kt`.
- `.github/workflows/nexo-m1-android-build.yml`, blob `b21eb080d9024c7cf580b7f06729bbe65a89cb59`:
  - ejecuta `prepare-llama-android.sh`;
  - verifica que la fuente descargada tenga el SHA esperado;
  - verifica mediante `grep` la forma antigua del log `Formatted and added %s message:`;
  - después ejecutaría `gradle ... assembleDebug`.
  - No contiene un paso que ejecute `apply-native-diagnostics.py`.
- No se ejecutó este workflow ni se construyó nada durante esta revisión. La conclusión anterior describe el **flujo de build definido en el código**, no un build ejecutado en esta sesión.

### 7.2 Fuente upstream exacta fijada por el build

Consulté directamente la fuente pública `ggml-org/llama.cpp` en el SHA `10a60cf303566e10d6a7a2774c17d2085503d87b` fijado por el script.

- `examples/llama.android/lib/src/main/cpp/ai_chat.cpp`, blob upstream `ca6f7172d910da06a26be0eaaa3da1ff01834639`:
  - líneas 289–297: `chat_add_and_format` llama a `common_chat_format_single(... /* use_jinja */ false)`; añade el mensaje al historial y devuelve el formato.
  - líneas 432–448: `user_prompt_size` se calcula antes del truncamiento; el vector `user_tokens` puede reducirse en las líneas 434–438, pero la posición se incrementa luego usando el tamaño anterior en la línea 447 y la parada se calcula como `current_position + user_prompt_size + n_predict` en la línea 448. Es la discrepancia de contabilidad que el parche histórico intentaba corregir.
- `examples/llama.android/lib/src/main/java/com/arm/aichat/internal/InferenceEngineImpl.kt`, blob upstream `a293796f9017326531021c9be38bdd33fcb9667e`:
  - líneas 217–244: `sendUserPrompt(message, predictLength)` pasa la pregunta y el límite a `processUserPrompt`, luego emite los tokens que devuelve la generación.
- Fuente de la app canónica `MainActivity.kt`, blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`: `sendPrompt()` llama a `sendUserPrompt(userText, MAX_GENERATED_TOKENS)` y añade cada fragmento a la salida; la constante de UI es 256.

### 7.3 Conclusión actualizada por alcance

| Afirmación | Estado |
|---|---|
| El build declarado descarga una revisión upstream exacta y la deja sin aplicar el script histórico de corrección | **OBSERVADO** en el script y workflow canónicos |
| Esa revisión upstream contiene el uso de plantilla `use_jinja=false` y la contabilidad anterior del límite | **OBSERVADO** en el blob upstream fijado, líneas citadas |
| El flujo de build canónico definido incluye las correcciones del script histórico | **CONTRADICHO por las fuentes inspeccionadas**: no hay paso de aplicación; el workflow exige el patrón de log antiguo |
| Se ejecutó un build de esa fuente durante esta revisión | **NO** |
| La APK instalada en el POCO corresponde a ese build o a otro artefacto corregido | **UNKNOWN** |
| Estos defectos explican por completo la frase genérica repetida observada por el propietario | **NO DEMOSTRADO**; son defectos concretos que requieren validación controlada posterior |

**Resultado técnico:** existe una brecha verificable entre el arreglo histórico propuesto y el flujo de build canónico documentado. El siguiente paso, aún documental, es revisar el historial/artefactos de build ya existentes solo si aportan identidad de commit y APK; no ejecutar el workflow ni generar una APK nueva sin autorización expresa. No aplicar el parche automáticamente.
