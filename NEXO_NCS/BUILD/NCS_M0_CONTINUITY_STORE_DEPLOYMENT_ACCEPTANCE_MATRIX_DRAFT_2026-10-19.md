# NCS M0 — matriz preliminar de aceptación del store de continuidad

**Estado:** BORRADOR DE EVALUACIÓN; no autoriza despliegue ni cierra M0.  
**Fecha:** 2026-10-19  
**Rama de referencia:** `ncs-clean-architecture`  
**Propósito:** separar invariantes que ya tienen pruebas de software de propiedades de despliegue que el store no reclama. Este trabajo es independiente de adquirir la llave física.

## 1. Base observada

Archivos revisados en la rama:

- `src/nexo/core/continuity-store.mjs`
- `tests/nexo/continuity-store.test.mjs`
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`
- `tests/nexo/chronicle-runtime.test.mjs`

Ejecución integrada posterior al test actual: [run 39342543741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543741), SHA exacto `4c0cec1833842103f21194b1f4a3ebdfe168181d`, job `tests`, paso `Run tests` SUCCESS. El log incluye la ejecución de `tests/nexo/root-bootstrap-protocol.test.mjs` y su mensaje de vector aprobado. La comparación hasta el HEAD actual `ba6b10bdf3c389995980c528a5602fcd7688e7cd` muestra solo documentación añadida/modificada después del SHA de test; no se modificaron runtime ni tests.

El test PASS acredita los contratos ejecutados, no durabilidad física universal, resistencia a un host comprometido ni autoridad constitucional.

## 2. Matriz de invariantes de software

| Invariante | Prueba observada en el código | Lectura precisa |
|---|---|---|
| Estado ausente no se convierte en store vacío | `continuity-store.test.mjs`: `loadCurrent()` rechaza con `NEXO_CONTINUITY_STORE_NOT_FOUND` | Cubre el caso probado; no prueba que todo procedimiento de despliegue preserve los archivos. |
| Ruta padre ausente/no directorio devuelve fallo contractual | Pruebas de `initialize` y `commitIfCurrent` para `ENOENT` / `ENOTDIR` | PASS de normalización de error para esos escenarios. |
| Escrituras concurrentes con la misma revisión no ambas ganan | Dos `commitIfCurrent(0, ...)`: exactamente un `committed`, un `conflict` | Coordinación de escritores locales cooperantes; no fencing global. |
| El store no acepta un campo arbitrario `authority` | Snapshot con `authority: { status: "AUTHORIZED" }` es rechazado por esquema | Persistir una claim no crea autoridad. |
| Fallo al escribir el registro del dueño del lock no deja lock huérfano en el caso probado | Inyección de fallo en `owner.json`, seguida de comprobación de ausencia del directorio `.lock` | Cubre ese punto de fallo inyectado, no todos los fallos del filesystem. |
| Respuesta de inicialización perdida después de rename se reconcilia por lectura del envelope exacto | Inyección que hace rename y después lanza; store observa contenido coincidente | Reconciliación de ese corte de respuesta; no prueba durabilidad frente a pérdida eléctrica. |
| Rename fallido antes de persistir con destino ausente no se confunde con commit | Inyección de fallo de rename y lectura posterior ausente | Resultado `failed` para ese escenario. |
| Agotamiento de revisión no escribe una revisión no segura | `Number.MAX_SAFE_INTEGER`: resultado `NEXO_CONTINUITY_STORE_REVISION_EXHAUSTED` y bytes intactos | Evita desbordar el contrato entero; no evita rollback a un archivo anterior válido. |
| Lock stale no se elimina mediante check-then-remove automático | Lock con propietario muerto y edad suficiente: `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED` | Fallo cerrado; recuperación explícita queda fuera de este test. |
| Outcomes ambiguos no habilitan redispatch automático | Crash cuts / runtime tests verifican UNKNOWN y `redispatchAuthorized: false` en escenarios cubiertos | Contrato de recuperación del caso probado; no prueba causalidad externa. |

## 3. Límites expresamente NO garantizados por el código actual

El propio `continuity-store.mjs` declara que:

- La escritura temporal + rename **no es una promesa de fsync ni de durabilidad frente a pérdida de energía**.
- `storeRevision` coordina escritores cooperantes; no proporciona autoridad, fencing global ni anti-rollback.
- No se reclama soporte de filesystem de red/distribuido.
- `filePath` es configuración confiable, no una sandbox.
- No se reclama resistencia a symlinks, path attacks ni procesos locales hostiles capaces de modificar los archivos o locks.
- Un store ausente/corrupto no debe regenerarse silenciosamente.

Estos son límites de garantía, no defectos que deban “arreglarse” automáticamente. No introducir hashes encadenados, snapshots redundantes, otro journal, nuevos epochs o wrappers transaccionales antes de definir la amenaza y el requisito.

## 4. Preguntas de despliegue todavía abiertas

| Pregunta | Estado | Evidencia necesaria para cambiar el estado |
|---|---|---|
| ¿La primera versión exige supervivencia a pérdida abrupta de energía? | PENDING — decisión de requisito no demostrada en estos archivos | Requisito explícito y prueba apropiada; una prueba Node en CI no basta para acreditar comportamiento físico del dispositivo. |
| ¿La primera versión debe detectar rollback a un archivo anterior válido? | PENDING — el store no lo garantiza | Definir el atacante/capacidad, la fuente externa de frescura y el comportamiento fail-closed; luego diseñar y probar. |
| ¿Se requiere resistencia a modificación por otro proceso local o symlink/path attacks? | PENDING — fuera de las garantías declaradas | Definir límites de permisos/OS, directorio confiable y pruebas de amenaza; no inferir aislamiento desde el API del store. |
| ¿Se permite filesystem de red/distribuido? | No soportado por el contrato actual | Si fuera requisito, detenerse y diseñar un store con semántica apropiada; no adaptar por parche. |
| ¿Se puede recuperar un lock stale automáticamente? | No: el comportamiento actual exige recuperación explícita | Diseñar un procedimiento de recuperación verificable antes de automatizar cualquier recolección. |
| ¿Los PASS de store autorizan efectos protegidos? | NO | No existe esa inferencia: store, autoridad, autorización y efecto son capas separadas. |

## 5. Puerta de decisión recomendada

Antes de cambiar el store, decidir explícitamente qué modelo de despliegue se busca para la primera versión:

1. **Modelo local cooperativo y de riesgo acotado:** aceptar por escrito las limitaciones declaradas, mantener el estado y la raíz en UNKNOWN cuando el entorno no sea confiable y no exponer efectos protegidos.
2. **Modelo resistente a host local comprometido/rollback/pérdida de energía:** no declarar que el store actual cumple; definir la fuente de confianza/frescura y el modelo de amenaza, y rediseñar la frontera antes de escribir código.

No se elige aquí entre esos modelos. Esta matriz hace visibles las preguntas para que no se decidan implícitamente mediante un parche.

## 6. Estado

- Evidencia de suite completa: PASS en SHA exacto `4c0cec1833842103f21194b1f4a3ebdfe168181d`, run [39342543741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543741).
- Requisitos de despliegue enumerados en §4: PENDING; no se han convertido en PASS.
- Llave/fingerprint real: PENDING, pero no bloquea esta matriz ni el trabajo M0 restante.
- M0 global: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
