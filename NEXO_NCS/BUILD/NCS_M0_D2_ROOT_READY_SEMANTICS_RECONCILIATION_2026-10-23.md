# NCS M0 — reconciliación semántica de ROOT_READY entre D0-C2 y D2

Fecha: 2026-10-23  
Estado: **RECONCILIACIÓN DOCUMENTAL PROPUESTA — SIN CAMBIO DE RUNTIME — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Hallazgo

Los documentos vigentes usan ROOT_READY con dos alcances distintos:

- La matriz D2 lo describe como una ruta raíz existente, de tipo directorio y validada según la política aprobada; luego aún queda adquirir el lock y validar owner/stores.
- El gate D0-C2 usa ROOT_READY de forma más amplia, cercana a una instancia inicializada y lista para admitir operaciones.

El uso compartido puede inducir a error de estado: validar un path no equivale a que la instancia esté inicializada, que una operación haya adquirido admisión ni que la autoridad constitucional exista.

## 2. Reconciliación propuesta, sin añadir estado persistente

Hasta que el propietario apruebe el contrato final, leer ROOT_READY en la matriz D2 en sentido **local y limitado**: la ruta raíz ha pasado las comprobaciones de configuración/tipo/canonicalización que estén aprobadas. No significa que stores estén abiertos o validados, que el lock esté adquirido, que el bootstrap haya terminado ni que se autorice una operación.

En el gate D0-C2, evitar usar ROOT_READY como etiqueta de “todo listo”. Expresar el criterio como una **conjunción de precondiciones para admitir la primera operación normal**:
1. Ruta raíz validada según D0-C1/C3.
2. Estado de bootstrap conocido y completo conforme al protocolo D0-C2 aprobado.
3. Stores existentes o inicializados por el flujo explícito aprobado, con integridad y límites comprobados.
4. Admisión D2 adquirida y ownership verificado durante el alcance de operación requerido.
5. Si el protocolo de bootstrap/migración depende de quiescencia, ésta fue demostrada en el entorno pertinente.
6. La autorización constitucional se evalúa por separado; nunca se deriva de las condiciones anteriores.

Esta reconciliación es editorial/conceptual. No propone nuevo enum, campo persistente, marker, lock, archivo ni transición runtime. Si el diseño final requiere estados de instancia más explícitos, se presenta como decisión separada antes de implementación.

## 3. Invariantes que no cambian

- Ruta validada ≠ instancia inicializada.
- Instancia inicializada ≠ lock adquirido.
- Lock adquirido ≠ autoridad constitucional.
- Resultado de persistencia ≠ resultado de release.
- BOOTSTRAP_PARTIAL o incertidumbre en cualquiera de las precondiciones implica UNKNOWN/BLOCKED; operación normal no repara, completa ni borra automáticamente.
- La raíz no es un sandbox y el lock no resuelve TOCTOU frente a procesos locales hostiles, mounts o garantías de durabilidad no especificadas.

## 4. Qué documentos deben alinearse

1. Matriz D2: mantener el sentido limitado de ROOT_READY y aclarar que lock/owner/stores son pasos posteriores.
2. Gate D0-C2: describir precondiciones conjuntas para admitir operación normal sin llamar ROOT_READY al estado global.
3. Decision packet D0-C2 y checkpoint: registrar esta como recomendación documental, no decisión del propietario.
4. Tests futuros: comprobar que path validado por sí solo no permite leer stores ni ejecutar una operación sin admisión y validación de estado de bootstrap. No se implementan ni ejecutan en esta etapa.

## 5. Estado

No se modifica ninguno de los documentos normativos originales en esta pasada; este artefacto explica la reconciliación propuesta para evitar editar de forma unilateral contratos que aún tienen decisiones abiertas.

M0 INCOMPLETO; D0/D1/D2/D3 OPEN; D0-C2 pendiente; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.
