# NCS M0 — D0-C2: opciones de protocolo de bootstrap

Fecha: 2026-10-23  
Estado: **ANÁLISIS COMPARATIVO — DECISIÓN DEL PROPIETARIO PENDIENTE — SIN IMPLEMENTACIÓN**

## 1. Pregunta exacta

¿Cómo se autoriza y coordina la primera creación de una raíz Nexo y sus stores, si el lock de admisión propuesto está dentro de esa raíz y por ello todavía no existe al comenzar el bootstrap?

La raíz es una ubicación de persistencia, no identidad criptográfica ni autoridad. El bootstrap no concede legitimidad al propietario, no autoriza efectos protegidos y no debe activarse implícitamente al ejecutar status, preview, consulta o una operación normal.

## 2. Invariantes comunes

1. Operación normal con raíz ausente: rechazo y cero mutaciones.
2. Ningún segundo proceso debe interpretar una raíz parcialmente creada como instancia lista.
3. No asumir que la ausencia de uno o ambos stores demuestra que la instancia es nueva.
4. No sobreescribir, fusionar ni migrar datos existentes automáticamente.
5. Fallo de bootstrap en estado parcial: `BLOCKED/UNKNOWN`; recuperación explícita, no reparación heurística.
6. Cualquier limpieza debe demostrar que actúa sobre el objeto creado por el proceso, no sobre una ruta reemplazada.
7. La admisión no implica autorización constitucional, commissioning, dispatch ni efectos protegidos.
8. Las opciones son propuestas de diseño. No se elige aquí ninguna por el propietario.

## 3. Opciones comparadas

### Opción A — Bootstrap offline con exclusión operativa externa

**Idea:** el operador garantiza que no hay procesos Nexo activos ni posibilidad de relanzamiento mientras se crea la raíz, se inicializan/verifican los stores y se habilita la operación normal.

**Ventajas**
- No introduce un lock hermano ni un marcador persistente nuevo.
- Mantiene el lock de instancia dentro de la raíz para las operaciones posteriores.
- Puede encajar en una primera instalación manual controlada.

**Obligaciones y límites**
- La exclusión debe ser real y verificable: detener procesos, launchers, jobs y supervisores que puedan reabrir la instancia.
- Si no puede probarse la ausencia de escritores/relanzamientos, bootstrap no procede.
- El protocolo de primera instalación no se protege a sí mismo contra dos comandos concurrentes; su seguridad depende de la precondición operativa.
- Debe registrarse cuándo y con qué evidencia se consideró satisfecha la precondición.

**No sirve si:** se requiere bootstrap concurrente o autónomo sin un operador capaz de imponer quiescencia.

### Opción B — Preparación en directorio temporal y publicación atómica

**Idea:** construir y validar la instancia en un directorio de preparación separado, y publicar el directorio completo mediante una operación atómica del filesystem cuando sea posible.

**Ventajas**
- Los lectores de la ruta final no deberían observar el contenido parcial si la publicación es realmente atómica y todos los lectores usan la ruta final.
- Permite validar los stores antes de publicarlos.

**Obligaciones y límites**
- Hay que especificar ubicación del staging, permisos, colisiones, limpieza, recuperación tras crash, mismo volumen/filesystem y semántica real de rename.
- No resuelve automáticamente dos bootstraps competidores; ambos pueden preparar contenido y competir por publicar. El perdedor debe detenerse sin sobrescribir ni mezclar.
- Alias/symlinks y paths reservados siguen sujetos a D0-C3.
- Introduce nombres y estados temporales que deben estar explícitamente documentados; no deben convertirse en una cola o protocolo persistente adicional por accidente.

**No sirve si:** el filesystem objetivo no garantiza la publicación atómica requerida o si no se puede demostrar que todos los consumidores ignoran staging.

### Opción C — Marcador persistente de estado de inicialización

**Idea:** almacenar un estado explícito de bootstrap (por ejemplo, en curso/listo) que las operaciones normales validen antes de admitir acceso a stores.

**Ventajas**
- Puede hacer detectable una inicialización interrumpida sin inferirlo solo por presencia/ausencia de stores.
- Facilita estados explícitos de `BOOTSTRAP_PARTIAL` y recuperación.

**Obligaciones y límites**
- Añade formato, semántica, compatibilidad, integridad, escritura atómica, orden respecto al lock, corrupción, versionado y política de recuperación.
- El marcador no coordina por sí mismo dos escritores: también necesita un protocolo de exclusión antes de crearlo/modificarlo.
- Si el marcador dice “ready” antes de que todos los datos sean durables/validables, crea falsa seguridad.
- No debe introducirse hasta demostrar que las opciones sin marcador no satisfacen el contrato.

**No sirve si:** se trata el marcador como prueba de autoridad o como sustituto del lock.

### Opción D — Coordinación externa a la raíz

**Idea:** adquirir un mecanismo de coordinación en una ubicación fuera de la raíz, que exista antes de ella.

**Ventajas**
- Puede serializar el primer bootstrap antes de que exista la raíz.

**Obligaciones y límites**
- Es un nuevo lock/artefacto externo que necesita ubicación canónica, permisos, propiedad, recuperación, limpieza, alias, migración y prevención de colisiones.
- Puede multiplicar las raíces equivalentes o producir divergencia si el nombre del lock externo no deriva de una identidad de ruta inequívoca.
- Contradice el principio de no añadir una capa sin necesidad demostrada y no debe asumirse como solución por defecto.

**No sirve si:** no se puede definir una identidad estable de coordinación independiente de la raíz sin ambigüedad.

## 4. Comparación resumida

| Criterio | A: offline | B: staging + publish | C: marcador | D: coordinación externa |
|---|---|---|---|---|
| Evita ver estado parcial | Sí, por precondición operativa | Potencialmente, si publish es atómico y lectores usan ruta final | Detecta estado si se ordena correctamente; no coordina por sí solo | No por sí solo; depende del protocolo completo |
| Bootstrap concurrente | No; debe impedirse externamente | Requiere arbitraje del publicador | Requiere lock/propietario además del marcador | Puede coordinarlo si está bien definido |
| Artefacto persistente nuevo | No | Staging transitorio | Sí | Sí, fuera de raíz |
| Complejidad de recuperación | Operativa/manual | Filesystem, staging y publicación | Formato y estados del marcador más exclusión | Lock externo y su identidad |
| Riesgo de falsa instancia lista | Si se viola la quiescencia | Si lectores acceden a staging o publish no es atómico | Si estado `ready` no corresponde al contenido | Si el lock externo no es único o se libera incorrectamente |
| Estado actual | No aceptada | No aceptada | No aceptada | No aceptada |

## 5. Recomendación técnica provisional (no decisión)

Para el primer alcance, **no habilitar bootstrap concurrente/autónomo mientras no exista un protocolo probado**. La opción A es la menos invasiva si el producto puede exigir una instalación inicial offline con quiescencia demostrable. Si ese requisito operacional no es viable, evaluar B frente a los requisitos del filesystem y la competencia de publicadores. C y D solo deberían introducirse con una necesidad demostrada y un contrato de propiedad/recuperación completo.

Esta recomendación no afirma que A sea suficiente para todos los despliegues y no autoriza implementación.

## 6. Preguntas de cierre D0-C2

- ¿Se acepta que el bootstrap inicial requiera operador y quiescencia verificable, sin concurrencia, o el producto exige bootstrap concurrente/autónomo?
- ¿Cuál es el filesystem/entorno real de la primera instancia y qué garantías de rename/mkdir ofrece?
- ¿Qué evidencia convierte una raíz recién creada en `ROOT_READY`?
- ¿Cómo se detecta y trata una inicialización interrumpida sin asumir que stores ausentes significan una instancia nueva?
- ¿Qué recuperación explícita se permite tras un bootstrap parcial, y quién puede ejecutarla?
- ¿Qué proceso impide relanzamientos durante bootstrap y cómo se evidencia?

Hasta resolver estas preguntas, D0-C2 y D2 permanecen OPEN. No se cambian runtime/tests/workflows. Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
