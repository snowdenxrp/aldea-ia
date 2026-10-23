# NCS M0 — matriz de política para rutas reservadas y symlinks (D0/D3)

Fecha: 2026-10-23  
Rama: ncs-clean-architecture  
Estado: ANÁLISIS DE CONTRATO — DECISIONES PENDIENTES — SIN IMPLEMENTACIÓN

## 1. Hallazgo concreto

El contrato de raíz establece que la raíz debe canonicalizarse y que las rutas de stores se derivan de ella. Sin embargo, canonicalizar la raíz no garantiza que los destinos reservados dentro de ella sean archivos físicos dentro de esa raíz: si continuity.json o chronicle.json son symlinks, las operaciones normales de filesystem pueden seguirlos hacia fuera.

La propia sección de D3 del contrato de raíz reconoce este hueco. Este documento lo separa en una matriz verificable, para que no quede perdido dentro del plan de migración.

## 2. Matriz de estados y comportamiento requerido para decidir

| Objeto observado | Riesgo | Comportamiento candidato fail-closed | Estado |
|---|---|---|---|
| Raíz indicada como symlink/alias | Dos nombres podrían referir al mismo directorio | Canonicalizar a ruta real; definir si se admite explícitamente el alias; no tratar normalización lexical como prueba de identidad física | Regla final OPEN |
| continuity.json ausente | Podría confundirse ausencia con permiso de bootstrap | No crear durante validación; bootstrap solo por operación explícita autorizada | Regla de bootstrap OPEN |
| continuity.json archivo regular | Destino esperado | Validar tipo y ruta antes de abrir; luego usar los locks de store preservados | Requiere test |
| continuity.json symlink hacia dentro | Puede ocultar alias y alterar semántica del archivo canónico | Candidato: rechazar todo symlink en nombre reservado, incluso si parece apuntar dentro | Decisión OPEN |
| continuity.json symlink hacia fuera | Escritura/lectura fuera de la raíz de instancia | Candidato: rechazar antes de abrir; error estructurado, sin mutación externa | Decisión OPEN |
| chronicle.json ausente / regular / symlink | Riesgos análogos a Continuity | Misma política simétrica que Continuity | Decisión OPEN |
| Nombre reservado ocupado por directorio u otro tipo especial | La store puede fallar de modo no previsto o afectar rutas inesperadas | Rechazar como estado de filesystem incompatible/ambiguo antes de mutación | Requiere test |
| .nexo-instance.lock ausente | Admisión disponible | Intento de creación atómica con mkdir después de validar la raíz | Protocolo D2 OPEN |
| .nexo-instance.lock symlink o tipo inesperado | Podría redirigir coordinación o confundir propiedad | Candidato: rechazar como LOCK_STATE_UNKNOWN; nunca seguir symlink ni eliminarlo automáticamente | Decisión OPEN |
| owner.json symlink, archivo especial, corrupto o excesivo | Estado de propiedad no verificable | Candidato: UNKNOWN/BLOCKED; respetar límite lockOwnerBytes; sin stale recovery automática | Decisión OPEN |
| Temporal .tmp preexistente ambiguo | Podría representar escritura incompleta o residuo | No borrar durante validación de configuración; aplicar política existente del store solo dentro de operación admitida y bajo sus reglas | Compatibilidad por verificar |
| Ruta cambia entre lstat/realpath y open | Carrera TOCTOU ante proceso local que modifica filesystem | Declarar fuera de garantía cooperante salvo que se diseñe una primitiva segura del SO; no prometer protección hostil | Limitación explícita |

## 3. Decisiones de diseño que no deben confundirse

1. **Canonicalización de raíz**: determina el directorio usado por la instancia; no valida automáticamente cada hijo.
2. **Validación de rutas reservadas**: determina tipos de filesystem permitidos y evita seguir symlinks inesperados bajo el modelo cooperante.
3. **Admisión D2**: serializa operaciones cooperantes; no es autoridad constitucional ni protección ante un proceso local hostil.
4. **Bootstrap**: decide si y cuándo puede inicializarse un store ausente; no debe ocurrir como efecto lateral de una consulta.
5. **Migración D3**: controla escritores y procedencia de la copia; una ruta validada no demuestra quiescencia ni frescura de la copia.
6. **TOCTOU y atacante local**: una comprobación seguida de una apertura normal no es una sandbox. Si el modelo de amenaza exige resistencia a cambios hostiles simultáneos, se necesita un diseño específico dependiente del SO y no debe simularse con una verificación previa.

## 4. Criterios mínimos de prueba cuando se autorice la implementación

Las pruebas futuras deben usar directorios temporales aislados y comprobar tanto el resultado como la ausencia de mutaciones fuera de la raíz:

- raíz regular, raíz inexistente, raíz archivo, raíz symlink y alias a la misma raíz;
- store ausente, regular, symlink roto, symlink hacia dentro, symlink hacia fuera y directorio en el nombre reservado;
- lock ausente, lock directorio válido, lock symlink, lock tipo inesperado, owner ausente durante creación, owner corrupto, owner symlink y owner por encima del límite;
- dos operaciones concurrentes intentando admitir la misma raíz;
- sustitución/cambio de ruta entre validación y uso, documentando la cobertura real del modelo cooperante;
- fallos de admisión no crean stores, no inicializan Continuity, no eliminan temporales y no escriben fuera de root;
- fallo de validación no se presenta como autorización evaluada ni permite dispatch/repair/settlement.

Estas son especificaciones de pruebas futuras; no se ejecutaron en esta pasada.

## 5. Orden de cierre

1. Resolver la regla de alias/symlink de raíz dentro de D0.
2. Resolver tipos admitidos para los nombres reservados de stores y lock.
3. Alinear bootstrap para que validación no cree ni inicialice datos.
4. Incorporar fixtures negativos al diseño D1 antes de congelar el manifiesto.
5. Con la secuencia y autorización resueltas, implementar en una unidad coherente y ejecutar pruebas sobre el SHA exacto.
6. Mantener D3 OPEN hasta que, además de validar rutas, exista evidencia del entorno real y del control de todos los writers durante migración.

## 6. Estado

- D0: OPEN (alias/canonicalización/tipos reservados no cerrados).
- D1: OPEN (fixtures y prueba no implementados).
- D2: OPEN (admisión/lock no implementados).
- D3: OPEN (sin entorno objetivo ni migración probada).
- M0: INCOMPLETO.
- Autorización: NOT_EVALUATED.
- Raíz legítima: PENDING/UNKNOWN.
- Efectos protegidos: STOP.
- Runtime/tests/workflows: sin cambios; tests/CI no ejecutados.

## 7. Continuidad

Cruzar esta matriz con las secciones 1.2, 3 y D3 del contrato de raíz, y con el mapa de dependencias D0/D1/D2/D3. No hacer un nuevo censo de callers. No convertir los comportamientos candidatos en decisiones del propietario sin registro explícito.
