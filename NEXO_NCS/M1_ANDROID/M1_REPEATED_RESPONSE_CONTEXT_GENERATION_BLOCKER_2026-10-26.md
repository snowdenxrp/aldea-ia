# M1 — bloqueo de respuestas repetidas y reconstrucción de contexto

Fecha: 2026-10-26  
Estado: **ISSUE CONOCIDO — PENDIENTE DE VALIDACIÓN — SOLO DOCUMENTACIÓN**  
Rama canónica de trabajo: `ncs-clean-architecture`

## 1. Síntoma que no debe perderse

M1 llegó a repetir la misma respuesta/frase genérica en preguntas distintas (el ejemplo histórico observado fue «¿Quieres hablar de algo?»). No debe tratarse como un defecto cosmético ni como una conversación simplemente “poco inteligente”: hay que comprobar el ensamblado del contexto del chat, la frontera de generación y el límite real de tokens.

**No declarar M1 corregido** por una compilación correcta, por una respuesta aislada o porque el modelo cargue sin error. La regresión clave es que tres preguntas distintas y consecutivas produzcan respuestas pertinentes a cada pregunta, sin copiar la respuesta anterior ni regresar a la frase genérica.

## 2. Evidencia fuente actual inspeccionada (solo lectura)

- Archivo: `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt`
- Blob en `ncs-clean-architecture`: `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`
- En `sendPrompt()`, la UI toma el texto actual y llama a `activeEngine.sendUserPrompt(userText, MAX_GENERATED_TOKENS).collect { token -> output.append(token) }`.
- La UI vacía `output` antes de cada solicitud y presenta directamente el flujo de texto recibido.
- El comentario de clase y la interfaz declaran que el historial es solo en memoria/no persistente. La UI no construye explícitamente una transcripción mult-turn en ese método; el comportamiento del historial depende del wrapper nativo `InferenceEngine`/llama.cpp.
- El límite declarado en la UI es `MAX_GENERATED_TOKENS = 256`; esta constante por sí sola no demuestra que el motor nativo respete exactamente ese máximo.

Estos son hechos de lectura estática del blob citado; no son evidencia de comportamiento de la APK actualmente instalada.

## 3. Diagnóstico previo que debe conservarse con su nivel de certeza

Un análisis de solo lectura previo, conservado en la rama histórica `ncs/m1-fix-chat-context-generation-limit`, documentó dos candidatos concretos:
1. **Reconstrucción/formateo de contexto:** comprobar el prefijo exacto del historial formateado antes de extraer un sufijo; no usar una búsqueda de subcadena permisiva que pueda reconstruir el mensaje incorrecto. Mantener correctamente BOS/EOS y saltos de línea, y evitar añadir un BOS extra.
2. **Contabilidad del límite de generación:** el cálculo nativo de posición de parada parecía sumar el tamaño del prompt del usuario por segunda vez después de haberlo incluido en la posición actual. Eso puede incumplir el límite solicitado; es un defecto separado de la repetición de respuestas.

La auditoría histórica también identificó que el flujo nativo se presenta directamente en pantalla y que el formato de chat Qwen3 puede necesitar configuración explícita. Esos hallazgos son hipótesis/observaciones de aquella revisión y **no deben presentarse como verificados en el HEAD actual** sin volver a contrastar los blobs exactos.

Referencia histórica: `NEXO_NCS/M1_ANDROID/NEXO_M1_OUTPUT_FORMAT_ROOT_CAUSE_AUDIT_2026-10-10.md`, blob `1029dce05ad6ef39f6c077ba756e6dfe79d8dba9` en la rama `ncs/m1-fix-chat-context-generation-limit`. No forma parte del pin activo de `ncs-clean-architecture` a la fecha de este documento.

## 4. Criterios de regresión para una futura validación autorizada

Estos son criterios documentales; **no se ejecutaron**.

1. **Respuesta exacta:** pedir que responda exactamente `VERDE`; comprobar salida completa y ausencia de frase genérica repetida.
2. **Aritmética:** preguntar cuánto es 17 × 23; resultado esperado 391.
3. **Contexto mult-turn:** en un turno dar el dato temporal `AZUL-27`; en el siguiente pedir que lo repita. Esto valida solo contexto volátil dentro del proceso, no memoria persistente.
4. **Tres preguntas distintas seguidas:** verificar que cada respuesta corresponda a su propia pregunta, sin repetición obsoleta ni respuesta vacía.
5. **Límite real de generación:** medir tokens generados con contador nativo fiable; no aproximar con caracteres o palabras.
6. **Desajuste de plantilla/contexto:** un harness de prueba debe fallar de forma explícita si el prefijo esperado no coincide, nunca producir silenciosamente un sufijo incorrecto.

La especificación histórica más detallada de estos casos está en `M1_CHAT_CONTEXT_GENERATION_REGRESSION_TESTS.md`, blob `9bb6aa11c9b240f6c47a369e82b9bcb6e769485a` en `ncs/m1-fix-chat-context-generation-limit`. Reutilizarla como referencia documental; no duplicar ni ejecutar ahora.

## 5. Límites y siguientes pasos

- No instalar ni reconstruir APK en este ciclo.
- No borrar ni reemplazar la instalación M1 actual ni reimportar el GGUF si no hay una razón basada en evidencia.
- No ejecutar tests ni CI: la autorización vigente es solo documental.
- Antes de una futura prueba, reconciliar la rama de corrección histórica con el HEAD actual mediante blobs/commits verificables y comprobar si la corrección de contexto y la de límite de generación están realmente presentes.
- Cualquier prueba de runtime futura requiere autorización nueva y específica, y debe usar el modelo local ya verificado, sin descargarlo otra vez salvo fallo de integridad confirmado.

## 6. Estado

- Síntoma de respuestas repetidas: **conocido; no declarado resuelto**.
- Corrección fuente en HEAD canónico: **UNKNOWN hasta reconciliar ramas y blobs**.
- Pruebas mult-turn en dispositivo: **PENDING; no ejecutadas en este ciclo**.
- APK corregida instalada: **no afirmado**.
- Instalación existente y modelo local: preservar.
- Nexo M0 gates: sin cambios; este problema M1 no cambia autorización, raíz ni estado de efectos protegidos.


## 7. Reconciliación documental de la rama histórica (2026-10-26)

Se creó [M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md](M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md), commit `71422c8b88f6cd06d0e3d4b5018e9bf2f6cd23e6`.

Hallazgos confirmados por lectura estática:
- El HEAD canónico observado es `d6d08c086c55a6f297bf73d8d23d4f4266f23d04`.
- La comparación de ramas devuelve `diverged`; no debe tratarse como un parche directo ni hacerse cherry-pick por inferencia.
- El `MainActivity.kt` canónico (blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`) y el histórico (blob `9cff99daaf48a91eb1076236ad1aae1733834f59`) mantienen el mismo flujo central: pasan el prompt al motor y añaden directamente el stream a la salida.
- El script histórico `apply-native-diagnostics.py` (blob `7ea0f3e56dac32680d8bcaee69eafc90b4419ef3`) propone cambios para Jinja/`enable_thinking=false`, prefijo exacto del contexto, BOS y límite de generación, pero no está en el árbol canónico inspeccionado. No se ejecutó; su existencia no demuestra integración ni build.
- La auditoría histórica (blob `1029dce05ad6ef39f6c077ba756e6dfe79d8dba9`) y el plan de regresión (blob `9bb6aa11c9b240f6c47a369e82b9bcb6e769485a`) permanecen en la rama histórica, no en el árbol canónico inspeccionado.

Conclusión: corrección integrada = **NO EVIDENCIADA / UNKNOWN**; comportamiento de la APK instalada = **UNKNOWN**; no declarar el fallo resuelto. No tests/CI, compilación, instalación, cambios runtime ni dispositivo. La siguiente acción es documental y acotada: si hace falta, rastrear los commits exactos del script/cambios upstream; no copiar ni aplicar el script automáticamente.
