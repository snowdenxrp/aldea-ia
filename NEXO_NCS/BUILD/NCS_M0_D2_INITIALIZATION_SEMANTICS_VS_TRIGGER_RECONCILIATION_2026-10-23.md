# NCS M0 — reconciliación de semántica de inicialización vs disparador legacy

Fecha: 2026-10-23  
Estado: **DISTINCIÓN CONTRACTUAL PROPUESTA — SIN IMPLEMENTACIÓN**

## 1. Hallazgo dirigido

El contrato de raíz contiene una prueba candidata que pide que “owner bootstrap, inicialización legacy y commit/append usen la misma admisión sin cambiar la semántica de inicialización”. En otra sección, el mismo documento identifica que callers de simulate/assistants que entregan legacyMemory pueden producir bootstrap/migración implícitos y recomienda poner la migración detrás de una operación explícita admitida, no preservar la inicialización lateral accidental.

No es necesariamente una contradicción de diseño, pero la frase “sin cambiar semántica de inicialización” puede interpretarse demasiado ampliamente como mantener el disparador implícito.

## 2. Distinción que debe quedar explícita

Separar dos contratos:

- **Semántica de datos/inicialización una vez autorizada:** reglas de precedencia entre store canónico y legacy, comportamiento de allowEmptyInitialization, formato/validación, errores y resultado persistido. Cualquier migración explícita debe preservar estas reglas salvo decisión separada y pruebas de compatibilidad.
- **Política de disparo y admisión:** qué comando o API puede iniciar bootstrap/migración, cuándo puede ocurrir y qué raíz/lock/autoridad requiere. Que una ruta legacy históricamente inicializara al abrirse no obliga a conservar ese disparador implícito. La recomendación actual es que una operación normal/consulta/simulación no cree ni migre estado incidentalmente; bootstrap/migración debe ser explícito y admitido.

Así se puede preservar la semántica de datos sin perpetuar el side effect implícito.

## 3. Consecuencias de diseño y prueba

1. El contrato de caller debe distinguir lectura pura, apertura de store existente, bootstrap explícito y migración explícita.
2. Una operación de lectura/preview con raíz ausente o estado parcial debe bloquear sin crear stores ni convertir legacy.
3. Una migración explícita debe declarar fuente/destino y demostrar precedencia, allowEmptyInitialization, preservación de bytes/revisión y cero merge/dual-write automático.
4. La prueba debe demostrar tanto compatibilidad de datos como ausencia de disparadores implícitos; son dos propiedades distintas.
5. No modificar callers/runtime ni escribir tests antes de resolver los gates D0/D1/D2 y recibir autorización separada.

## 4. Alcance y estado

Esto no reabre el censo de callers ni altera su resultado ya documentado. Es una precisión de lenguaje derivada del contrato existente. No se cambia código, tests ni workflows y no se ejecutan pruebas/CI.

M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
