# NCS M0 — opciones técnicas para release incierto y re-admisión D2
Fecha: 2026-10-24
Rama: `ncs-clean-architecture`
Estado: **ANÁLISIS DE OPCIONES — DECISIÓN PENDIENTE — SIN IMPLEMENTACIÓN**

## 1. Problema exacto

En los stores actuales, el release verifica el token de `owner.json` y después elimina el lock por ruta. Entre ambas acciones puede reemplazarse el directorio. Releer el token reduce algunos casos, pero no elimina la ventana TOCTOU. Continuity añade un segundo intento de limpieza; si la ruta fue reemplazada entre intentos, repetir `rm(lockPath)` puede afectar al nuevo lock. La compensación ante fallo al escribir `owner.json` también puede eliminar por ruta sin demostrar que el path sigue representando el directorio creado por esta operación.

Esto es una debilidad de contrato identificada por inspección estática; no es evidencia de que el interleaving ya haya ocurrido en producción.

## 2. Alternativas reales

### Opción A — recuperación externa con quiescencia demostrada

Al detectar release incierto, no se intenta una limpieza adicional por ruta. Se bloquea nueva admisión y se requiere un procedimiento externo que demuestre que no queda ningún actor capaz de modificar ese lock/path antes de inspección y recuperación.

- **Ventaja:** no finge que un token reread o una cuarentena local son coordinación global.
- **Coste:** recuperación operativa explícita; puede bloquear indefinidamente si no existe un operador/entorno capaz de demostrar quiescencia.
- **Gate crítico:** hoy no está identificado/aprobado el entorno runtime ni demostrado un mecanismo de quiescencia para él (D3).
- **No resuelve automáticamente:** el caso de release normal ni la compensación de bootstrap si se conserva el borrado directo por ruta; esos caminos deben diseñarse y probarse por separado.

### Opción B — mecanismo de filesystem ligado a identidad del objeto

Diseñar una operación de retirada que permita demostrar que el objeto retirado es exactamente el objeto validado, y que no abre una ventana en la que un reemplazo pueda borrarse o quedar admitido como si no existiera lock.

- **Ventaja:** puede dar una ruta técnica automatizable si la primitiva disponible ofrece la garantía requerida.
- **Coste:** debe demostrarse que la API/plataforma concreta soporta esa garantía. Las operaciones ordinarias por nombre/ruta y una comparación previa de token no bastan por sí solas.
- **Gate crítico:** diseño específico de filesystem/OS y semántica de recuperación; no está seleccionada una primitiva válida para todos los entornos.
- **No asumir:** que rename a un nombre de cuarentena, volver a leer el token, comprobar inode o usar `rm` con más verificaciones constituye por sí solo una solución atómica. Cualquier propuesta debe analizar qué ocurre si la ruta se reemplaza antes/durante/después del movimiento, si otro proceso crea un nuevo lock y si el proceso cae a mitad de la recuperación.

### Opción C — dejar el lock en estado bloqueado hasta intervención explícita

Ante cualquier resultado ambiguo, no ejecutar otra limpieza automática y no re-admitir. La operación de recuperación inspecciona y restaura/reti ra el estado solo después de una condición de seguridad aprobada.

- **Ventaja:** política simple de fallo cerrado.
- **Coste:** sin un protocolo operativo autorizado puede convertirse en bloqueo permanente. Un estado solo en memoria no sobrevive al proceso y no coordina otros procesos; no debe presentarse como solución global.
- **Gate crítico:** decidir si se permite un mecanismo persistente de recuperación, su autoridad, integridad y lifecycle. No se debe añadir marker, sidecar ni estado nuevo por conveniencia sin decisión.

## 3. Comparación

| Criterio | A: quiescencia externa | B: identidad de objeto | C: bloqueo hasta intervención |
|---|---|---|---|
| Automatización | Baja | Potencialmente alta, si la primitiva es válida | Baja |
| Depende de D3 | Sí, directamente | Depende del runtime/FS elegido | Sí para intervención confiable |
| Cierra TOCTOU por sí sola | No; evita limpiar hasta quiescencia | Solo si la primitiva y el protocolo lo prueban | No; evita reintentar/ admitir, pero recuperación requiere mecanismo |
| Riesgo de bloqueo | Alto | Depende del diseño/fallos | Alto |
| Puede aprobarse con tests solamente | No | No | No |
| Añade estado persistente por defecto | No | No necesariamente | No necesariamente; no asumirlo |

## 4. Recomendación técnica acotada

No aprobar todavía una de las tres opciones. Primero exigir a cualquier diseño B un protocolo de interleavings y crash points que pruebe la identidad del objeto y la re-admisión; si no puede demostrarse con la API/entorno seleccionados, descartar B en vez de suavizar la garantía. A o C requieren que D3 identifique quién puede demostrar quiescencia y ejecutar la recuperación. En todos los casos, persistencia, release y re-admisión deben ser resultados separados.

Para el código actual, el siguiente paso autorizado por el estado presente es **diseño y prueba determinista después de decisión/autorización**, no parchear a ciegas el segundo `rm` ni añadir un lock/marker nuevo.

## 5. Preguntas que deben quedar cerradas para D2

1. ¿Cuál es la garantía requerida: solo procesos cooperantes bajo el API, o también reemplazo accidental/concurrente de paths por otros actores locales?
2. ¿Qué actor autorizado puede recuperar un release incierto y con qué evidencia de quiescencia?
3. ¿Se acepta bloqueo operativo indefinido hasta recuperación, o se exige recuperación automática?
4. ¿Se permite estado persistente de recuperación, o debe resolverse con las primitivas existentes?
5. ¿Qué evidencia habilita re-admisión y cómo se verifica en todos los procesos, no solo en el proceso que registró el fallo?

Estas preguntas no solicitan escoger implementación en abstracto; definen la garantía que la implementación debe cumplir.

## 6. Estado canónico

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Este análisis no acepta una opción, no cambia runtime/tests/workflows y no demuestra que el entorno sea resistente a actores locales hostiles.
