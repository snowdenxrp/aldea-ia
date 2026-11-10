# NCS M0 — Diseño de arquitectura para cerrar P05-C y P07-C

## Arquitectura candidata ACA-1

Fecha: 2026-11-10
Tipo: **DISEÑO DE ARQUITECTURA CANDIDATA — PROPUESTA, NO RATIFICADA —
NO IMPLEMENTA — NO ESCRIBE CÓDIGO PARA INTEGRAR — NO EJECUTA PRUEBAS,
CI NI COMANDOS EN POCO/TERMUX — NO MODIFICA EL REPOSITORIO**
Repositorio: `snowdenxrp/aldea-ia`
Rama documental de referencia: `ncs-continuity-handoff-correction-2026-11-07`
HEAD verificado de la rama: `eee2ae772e5569ffbc90d6334f47c6633f4961fb`
(`git ls-remote`, verificado 2026-11-10; sin cambios desde la falsación.)

Estado: **NO DECLARA M0 CERRADO — NO AUTORIZA IMPLEMENTACIÓN NI
EFECTOS PROTEGIDOS — NINGUNA DECISIÓN DE ESTE DOCUMENTO ESTÁ
RATIFICADA.**

## 0. Propósito, método y honestidad del diseño

### 0.1 Qué es este documento y qué no es

Este documento **diseña**; no vuelve a auditar. La falsación ya
demostró (UNKNOWN/BLOCKING, imposibilidad condicionada) que la
arquitectura más fuerte compatible con R1 no basta, y la
especificación de rollback ya definió los cuatro alcances RB-1–RB-4
y sus decisiones. Este diseño parte de esos resultados como
**restricciones de diseño**, no como problemas a re-argumentar:
cuando necesita un resultado, lo cita por sección en lugar de
repetirlo.

La honestidad que el encargo exige —y que este diseño practica— es:
una arquitectura candidata que oculte sus imposibilidades detrás de
nombres nuevos (un "mediador" que en realidad no media, un "fencing"
que en realidad es un CAS, una "detección" presentada como
"prevención") sería peor que no diseñar. Cada garantía de este
documento dice explícitamente si es **demostrable, condicional o
imposible** bajo R1, y cada imposibilidad nombra la decisión del
propietario que la cambiaría. El veredicto final (§11) es **PARCIAL**,
y el documento explica exactamente qué parte es viable, qué parte
no lo es y qué habría que cambiar para que lo fuera.

### 0.2 Bases

| Base | Identificación | Uso |
|---|---|---|
| Falsación CE-1/CE-5/CE-7 | `NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md`, 70.990 bytes, SHA-256 `8f1bb64646db47553ffe9c29541b827110e80ce09120eac0fe8a06ff477ae8b9` (verificado 2026-11-10) | ACM-1, CE-1–CE-11, P-RESTORE, imposibilidad condicionada, M0.55 |
| Semántica de rollback | `NCS_M0_ROLLBACK_SEMANTICS_AND_OWNER_DECISIONS_SNOW_2026-11-10.md`, 61.003 bytes, SHA-256 `f36008ec442736cfd822b5cd956c2ddfe4e8d6119a74816cf34c033630d343a4` (verificado 2026-11-10) | RB-1–RB-4, D-RB-01–D-RB-09, detectabilidad, ejecutor SO |
| P05-C (política) | Ratificada 2026-11-07; P05 OPEN | Objetivo 1 y 5; estado BLOCKED/UNKNOWN |
| P07 V2.3 (normativa) | Ratificada 8-Nov-2026; P07-C UNKNOWN/BLOCKING | Objetivo 3; R-OBJ/R-NAME; clases de actor B; `PASS_GATE` |
| R1 (modelo) | Aceptado 2026-11-02; **no se modifica** | Límite de todo el diseño |
| Obligaciones O1–O9 | Obligaciones P05/P07, 2026-11-07, rama HEAD `eee2ae77`, SHA-256 `83d70ffd…` | §8, matriz de cierre |
| Reconciliación P09 | 2026-11-07, SHA-256 `fd44f337…` | Objetivo 4; cobertura de escritores |
| Contrato del owner de Continuity | 2026-10-18, rama | C4/C6: revisión local no es epoch ni prueba de currentness; restore no prueba autoridad |

### 0.3 Etiquetas

| Etiqueta | Significado |
|---|---|
| **[RATIFICADO]** | Decisión expresa del propietario o política ratificada |
| **[EVIDENCIA]** | Verificado en una fuente primaria abierta y nombrable |
| **[PROPUESTA]** | Elemento de este diseño; no ratificado, no seleccionado |
| **[SUPUESTO]** | Premisa técnica necesaria sin evidencia en el target |
| **[DECISIÓN DEL PROPIETARIO]** | Solo el propietario puede decidirlo (§10) |
| **DEMOSTRABLE / CONDICIONAL / IMPOSIBLE** | Clasificación de garantías (§6). "Demostrable" significa: el diseño provee un mecanismo cuya corrección puede comprobarse (no que ya esté demostrado: nada está implementado ni ejecutado). |

### 0.4 Los cinco objetivos, reformulados como requisitos de diseño

| # | Objetivo del encargo | Requisito de diseño |
|---|---|---|
| G-1 | Bloqueo durable después de rollback | La admisión debe fallar sin prueba positiva de vigencia, y el rollback detectable debe dejar el sistema en BLOCKED/cuarentena |
| G-2 | Revocación efectiva de procesos antiguos y operaciones en curso | Ninguna capacidad entregada en una generación anterior puede producir efectos en la generación vigente |
| G-3 | Identidad verificable de objeto y namespace | R-OBJ y R-NAME verificados por separado en cada mutación; identidad post-crash/post-restore tratada como UNKNOWN por defecto |
| G-4 | Serialización de escritores y admisión | Un solo escritor efectivo; admisión antes del primer I/O persistente; todos los escritores cubiertos por la frontera |
| G-5 | Recuperación controlada sin readmisión automática | Ninguna transición automática fuera de BLOCKED/cuarentena; recuperación solo por procedimiento del propietario con predicados |

## 1. Arquitectura propuesta y diagrama de componentes

### 1.1 Nombre y principio rector

**ACA-1 — Mediador de único escritor con supervisor, generación
cruzada y recuperación por atestación del propietario.**

Principio rector: **fail-closed por construcción, no por registro.**
ACA-1 no intenta que un registro de BLOCKED sobreviva al rollback
—la falsación demostró que no puede, si el registro vive dentro del
ámbito restaurable—. En su lugar, invierte la carga de la prueba:
**la admisión exige evidencia positiva y cruzada de vigencia; sin
ella, no hay admisión.** El estado por defecto del sistema es
BLOCKED; NORMAL es el estado que hay que ganar en cada admisión con
evidencia, no el estado que hay que perder con un registro. Un
rollback RB-3/RB-4 que restaura un estado autoconsistente sigue
siendo el caso que este principio no resuelve —y el diseño lo dice
en §6.3 en lugar de esconderlo—: ahí la contención es por política
(moratoria RB-3/RB-4 + declaración del ejecutor + registro externo),
no por mecanismo.

Principios secundarios:

1. **Un solo escritor efectivo.** Solo el mediador toca el recurso.
   Los clientes piden; no escriben.
2. **Verificar en aceptación, no en autorización.** Toda mutación se
   re-verifica (generación, identidad, nonce) en el instante de
   ejecutarse, no en el instante de concederse.
3. **Separar lo que V2.3 ordena separar.** Detección ≠ prevención;
   CAS ≠ fencing; nombre ≠ identidad; R-OBJ ≠ R-NAME; revisión
   local ≠ epoch de autoridad.
4. **Ninguna transición automática fuera de BLOCKED.** La
   recuperación es un procedimiento del propietario, no un estado al
   que se llega por timeout, ausencia o reintento.
5. **Contención por política donde el mecanismo es imposible.** Lo
   imposible se declara imposible y se contiene por decisión del
   propietario; no se renombra como "mitigado".

### 1.2 Diagrama de componentes

```
                         ┌─────────────────────────────────────────┐
                         │  PROPIETARIO (fuera de banda)         │
                         │  - lanza la sesión manual (R1)        │
                         │  - atesta vigencia en recuperación    │
                         │  - declara rollback (registro externo)│
                         │  - decide (D-RB, A-01..A-09)          │
                         └───────┬─────────────────┬─────────────┘
                                 │ lanza / mata    │ atestación /
                                 │ (grupo proc.)   │ declaración
                                 ▼                 ▼
                    ┌────────────────────────┐  ┌──────────────────┐
                    │ SUPERVISOR (SUP)       │  │ REGISTRO EXTERNO │
                    │ - líder de grupo de    │  │ (D-RB-09)        │
                    │   procesos             │  │ - ámbito, snap-  │
                    │ - SIGSTOP/SIGKILL al   │  │   shot, ejecutor,│
                    │   grupo                │  │   instante       │
                    │ - verifica /proc:      │  │ - fuera de DOM   │
                    │   ningún poseedor vivo │  └────────┬─────────┘
                    └───────┬────────────────┘           │ consulta
                            │ arranca/supervisa          │ (recuperación)
                            ▼                              ▼
                    ┌────────────────────────┐  ┌──────────────────┐
                    │ MEDIADOR (MED)         │◄─┤ TESTIGO (WIT)    │
                    │ único escritor efectivo│  │ - generación +   │
                    │ - admisión (leases)    │  │   manifiesto     │
                    │ - verifica GEN/ID/nonce│  │   (2.º dominio)  │
                    │   en aceptación        │  │ - [CONDICIONAL]  │
                    │ - ejecuta mutaciones   │  └──────────────────┘
                    │ - serializa escritores │           ▲
                    │ - retiene el único fd  │           │ espejo GEN
                    │   sobre RES            │           │
                    └───────┬────────────────┘           │
                            │ IPC (socket Unix)            │
              ┌─────────────┼──────────────┐               │
              ▼             ▼              ▼               │
   ┌────────────────┐ ┌───────────┐ ┌──────────────┐       │
   │ CLIENTES       │ │ D2        │ │ CUARENTENA   │       │
   │ COVERED        │ │ (solo     │ │ (QRT)        │       │
   │ - piden, no    │ │  observa; │ │ - estado     │       │
   │   escriben     │ │  nunca    │ │   sospechoso │
   │ - sin fd       │ │  admite)  │ │ - nunca se   │       │
   │   directo a RES│ └───────────┘ │   activa solo│       │
   └────────────────┘               └──────────────┘       │
              │                                             │
              │  (fuera de la frontera: RAW — ver §1.4)     │
              ▼                                             ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  ESTADO (tres conjuntos + testigo; ver §1.3)                 │
   │  RES: Continuity + Chronicle  │ COORD: locks, owner.json,    │
   │  AUTH: nonces, PREPARED,     │   storeRevision, GEN         │
   │        revocaciones           │ WIT: GEN + manifiesto (2.º dominio) │
   └──────────────────────────────────────────────────────────────┘
```

### 1.3 Componentes

| Componente | Función | Estado que guarda | Modo de fallo característico |
|---|---|---|---|
| **SUP — Supervisor** [PROPUESTA] | Proceso lanzado manualmente por el propietario en la sesión foreground (R1). Padre/líder de grupo de MED y de todos los clientes. Ejecuta la revocación (SIGSTOP → verificación → SIGKILL → verificación) y arranca/para MED. | Grupo de procesos; lista de hijos. | Un proceso que escapa del grupo (setsid, doble fork, reparentado) no es alcanzable (CE-12). SUP no ve procesos que no lanzó. |
| **MED — Mediador** [PROPUESTA] | Único escritor efectivo. Recibe solicitudes por IPC, verifica (generación, identidad, nonce) en aceptación, ejecuta la mutación con el único `fd` sobre RES, serializa, registra el resultado (negocio y release por separado, O9). Retiene el `fd`; los clientes no abren RES. | Lease vigentes; generación; registro de nonces consumidos; diario de decisiones. | MED puede morir (crash): su diario es estado local restaurable (CE-8/CE-16). Dos instancias de MED = split-brain (CE-16). MED no impide la escritura directa por path (RAW). |
| **GEN — Generación cruzada** [PROPUESTA] | Contador monótono de generación guardado redundantemente en RES, COORD, AUTH y WIT. La admisión exige acuerdo entre las copias. **No es un epoch de autoridad** (C4 [EVIDENCIA]): es un marcador de consistencia, no una prueba de autoridad. | Un entero + su historia de incrementos, en 4 copias. | Un rollback de todos los ámbitos revierte las 4 copias a la vez: acuerdo falso (RB-3/RB-4). La generación no detecta lo autoconsistente. |
| **IDN — Identidad** [PROPUESTA] | En admisión: apertura por `dirfd` + `openat` con restricciones, registro de (st_dev, st_ino, generación, hash de contenido, nlink). En cada mutación: re-validación `fstat(fd)` (R-OBJ) y `stat(path)` (R-NAME) por separado, y control de `nlink` (P07-21). | Identidad ligada (objeto, nombre, generación). | Disponibilidad de las primitivas en el Node de Termux: UNKNOWN [SUPUESTO]. Sustituto con atributos idénticos: indetectable (CE-7). Post-crash: UNKNOWN por defecto. |
| **LS — Leases de un solo uso** [PROPUESTA] | Credencial (generación, identidad-objeto, operación, nonce) emitida por MED, consumida antes del efecto (registro previo en AUTH y espejo en WIT) y verificada en aceptación. | Nonces consumidos (AUTH + WIT). | Doble escritura AUTH+WIT no es atómica entre sí; crash entre ambas = ambigüedad (CE-8). Rollback RB-3/RB-4 revierte el consumo (CE-5). |
| **WIT — Testigo** [PROPUESTA, CONDICIONAL] | Copia mínima (generación + manifiesto hash + resumen de nonces consumidos) en un segundo dominio cuyo comportamiento de restore es independiente del de HOME. Dos variantes: WIT-local (segundo dominio en el dispositivo) y WIT-propietario (registro externo llevado por el propietario, D-RB-09). | Generación + manifiesto. | Su independencia de restore no está verificada: un backup integral del dispositivo puede revertir ambos dominios a la vez (CE-14). WIT-propietario depende del humano (CE-15). |
| **QRT — Cuarentena** [PROPUESTA] | Área que conserva el estado sospechoso (post-crash ambiguo, rollback detectado, inconsistencia) sin activarlo. Nada sale de QRT automáticamente (C09 [EVIDENCIA]). | Estado sospechoso + su diagnóstico. | QRT es almacenamiento local: un rollback RB-4 la revierte también. Su contenido debe inventariarse en el registro externo. |
| **D2 — Diagnóstico** [PROPUESTA, sobre P05-C] | Observa evidencia externa y metadata del protocolo; nunca abre stores canónicos para decidir, nunca modifica locks, nunca admite. | Ninguno (solo lectura). | D2 no puede distinguir "viejo" de "restaurado" sin referencia externa (rollback, §4.2). |
| **REC — Procedimiento de recuperación** [PROPUESTA] | Secuencia de pasos con predicados (§3.5) que lleva de BLOCKED/QRT a NORMAL. Sin transiciones automáticas. Requiere atestación del propietario. | Estado de la máquina (NORMAL/BLOCKED/QRT/REC). | Su raíz de confianza es humana (CE-15). |
| **Clientes COVERED** | Piden operaciones a MED por IPC; nunca abren RES; nunca conservan `fd` sobre RES. | Nada durable. | Un cliente puede bifurcarse antes de la revocación o pasar un `fd` que no debería tener (CE-11). |
| **Escritores RAW** (fuera de la frontera) | Cualquier proceso que abre RES por path directamente (API path-based, import directo, herramienta). No es un componente de ACA-1: es el límite declarado. | — | No mediados, no serializados, no revocables por MED. Contenidos por P09 y por detección (hash/GEN), no por prevención. |

### 1.4 Límites declarados del diseño (léase antes de los flujos)

1. **MED media solo a quien le pregunta.** La escritura directa por
   path (RAW) no pasa por MED. ACA-1 la **detecta** (cambio de hash
   o de generación sin decisión de MED → BLOCKED) pero no la
   **impide**. Impedirla exigiría mediación a nivel de kernel, fuera
   de R1. Esta es la concesión central del diseño y no se disfraza.
2. **SUP revoca solo a su grupo.** Los procesos fuera del grupo
   (lanzados por otro padre, escapados por `setsid`/doble fork,
   supervivientes de un crash del supervisor) no son revocables por
   SUP.
3. **GEN detecta inconsistencia, no vigencia.** Un acuerdo entre
   copias prueba que las copias coinciden, no que sean vigentes
   (F8: validez ≠ vigencia).
4. **WIT es condicional.** Su efectividad depende de una
   independencia de restore no verificada (CE-14). Sin WIT, ACA-1
   se sostiene solo para RB-1/RB-2 y por contención de política para
   RB-3/RB-4.
5. **La recuperación confía en el propietario.** La atestación es
   la raíz de confianza última (CE-15). El diseño la hace explícita
   y auditable (registro externo), no la elimina.

## 2. Flujos

### 2.1 Máquina de estados (común a todos los flujos)

```
   ┌──────────┐  admisión con evidencia   ┌──────────┐
   │  NORMAL  │ ────────────────────────► │  NORMAL  │
   │ (GEN g,  │  (operación admitida)     │ (GEN g)  │
   │  MED vivo│                           └──────────┘
   └────┬─────┘
        │ cualquier incertidumbre: crash ambiguo, inconsistencia,
        │ rollback detectado, lease inválido, identidad no verificada,
        │ MED muerto, holder desconocido
        ▼
   ┌──────────┐  diagnóstico D2 +       ┌──────────┐
   │ BLOCKED  │ ───────────────────────► │   QRT    │
   │ (sin     │  (estado sospechoso     │(cuarentena│
   │  admisión│   conservado)           │ + diagnóstico)
   │  normal) │                          └────┬─────┘
   └────┬─────┘                               │
        │ solo vía REC (§3.5),                  │ solo vía REC (§3.5),
        │ con predicados +                     │ con predicados +
        │ atestación                           │ atestación
        ▼                                      ▼
   ┌──────────────────────────────────────────────────┐
   │  REC — recuperación controlada (§3.5)            │
   │  fracaso en cualquier paso → BLOCKED / QRT       │
   └──────────────────┬───────────────────────────────┘
                      │ éxito: GEN fresca, identidad
                      │ re-verificada, sin holders
                      ▼
                 ┌──────────┐
                 │  NORMAL  │  (nueva generación)
                 └──────────┘
```

Reglas de la máquina [PROPUESTA, derivadas de P05-C
[RATIFICADO]]:

- No existe transición automática BLOCKED → NORMAL ni QRT → NORMAL.
- No existe transición por timeout, ausencia, edad, PID o reintento.
- Toda transición a NORMAL exige los predicados de REC (§3.5) y
  deja registro (en AUTH y en el registro externo).
- MED muerto = BLOCKED: sin mediador no hay admisión. El reinicio
  de MED no reanuda NORMAL: arranca en BLOCKED y solo REC lo saca
  (contra CE-16).

### 2.2 Flujo de admisión (G-4; D1–D6, P03/P04)

Precondición: el sistema está en NORMAL con generación vigente `g`
y MED vivo. **Ninguna API pública (queries, append, bootstrap)
toca un store antes de este flujo** —esto corrige la brecha pre-read
de P09 [EVIDENCIA]: las cinco queries y el append actuales leen por
path antes de la admisión; en ACA-1 obtienen primero un contexto de
admisión de MED.

1. El cliente solicita admisión a MED por IPC, indicando operación
   y objeto (por nombre aprobado, no por `fd` propio: el cliente no
   tiene `fd`).
2. MED verifica el estado: NORMAL, MED vivo, GEN acordada entre
   RES/COORD/AUTH/WIT (si WIT no responde: BLOCKED, no se asume
   acuerdo).
3. MED abre (o reusa su `fd` retenido) el objeto y verifica
   identidad: `fstat(fd)` = identidad ligada (R-OBJ) y `stat(path)`
   = nombre aprobado (R-NAME). Divergencia → BLOCKED + QRT.
4. MED emite un lease de un solo uso: (generación `g`, identidad
   del objeto, operación, nonce). El lease tiene vigencia de una
   sola operación y no es transferible.
5. MED registra el lease emitido (AUTH). El cliente recibe el lease,
   no un `fd`, no un token reutilizable.
6. Si cualquier verificación falla, MED no emite lease y el sistema
   pasa a BLOCKED. La denegación es explícita y registrada; el
   cliente no puede reintentarlo como si nada (el reintento es una
   nueva solicitud, evaluada de nuevo).

### 2.3 Flujo de escritura (G-4; aceptación, no autorización)

1. El cliente presenta el lease a MED con los datos de la operación.
2. MED re-verifica **en aceptación**: generación vigente (`g` sin
   cambio desde la emisión), nonce no consumido, identidad del
   objeto re-validada (`fstat(fd)` + `stat(path)` + `nlink`), estado
   NORMAL.
3. MED registra el nonce como consumido **antes** de ejecutar el
   efecto, en AUTH y en WIT (doble registro; si alguno falla →
   BLOCKED sin ejecutar). Este es el punto de diseño contra CE-5
   en RB-1/RB-2: el consumo sobrevive mientras AUTH o WIT
   sobrevivan.
4. MED ejecuta la mutación con su propio `fd` (nunca por path
   re-resuelto en el momento de escribir: la escritura usa el
   descriptor cuya identidad se verificó en el paso 2). Para
   cleanup destructivo: re-validación inmediatamente antes de la
   syscall destructiva y uso de la operación condicionada al
   descriptor (`unlinkat` sobre `dirfd`) en lugar de borrado por
   path [PROPUESTA; disponibilidad de la primitiva: SUPUESTO].
5. MED registra el resultado en dos dimensiones separadas (O9):
   resultado de negocio/persistencia y resultado de release/
   admisión. Si el release es incierto, el negocio confirmado se
   conserva y el release queda UNKNOWN/BLOCKED (P05-C [RATIFICADO]).
6. MED responde al cliente con el resultado estructurado. Un
   timeout o una respuesta perdida no autoriza reintento: el
   reintento es una operación nueva con lease nuevo, y su
   admisibilidad se evalúa contra el estado actual (incluido el
   nonce ya consumido).

### 2.4 Flujo de bloqueo (G-1)

Disparadores (cualquiera): crash con resultado ambiguo;
inconsistencia GEN entre copias; identidad no verificable; lease
inválido o reutilizado; nonce consumido re-presentado; MED muerto;
detección de escritura directa (hash/GEN cambiado sin decisión de
MED); rollback declarado por el ejecutor; holder desconocido
detectado por SUP.

1. MED (o SUP, si MED murió) declara BLOCKED: deja de emitir
   leases y de ejecutar mutaciones. Las operaciones en curso se
   interrumpen en el próximo punto de aceptación; las ya ejecutadas
   conservan su resultado registrado.
2. El estado sospechoso se conserva en QRT con su diagnóstico (qué
   se observó, qué no se sabe). Nada se borra, nada se "repara"
   automáticamente.
3. El bloqueo se registra en AUTH y en el registro externo (si el
   bloqueo lo declara SUP por muerte de MED, el registro externo es
   el único testigo).
4. El sistema permanece en BLOCKED hasta REC (§3.5). No hay
   readmisión normal, no hay retry de negocio, no hay segunda
   limpieza por path.

**Bloqueo durable después de rollback (G-1):** el mecanismo es la
combinación de (a) admisión por evidencia positiva (§1.1): tras un
rollback RB-1/RB-2, GEN discrepa entre copias → sin evidencia →
BLOCKED; (b) QRT + registro externo: el bloqueo declarado antes del
rollback queda registrado fuera del ámbito revertido; (c)
contención por política para RB-3/RB-4 (moratoria + declaración).
Lo que el mecanismo **no** hace —y el diseño lo declara— es
sobrevivir a un rollback RB-3/RB-4 no declarado: véase §6.3.

### 2.5 Flujo de revocación (G-2)

Precondición: SUP vivo y líder del grupo de procesos. La revocación
es una operación del supervisor, no del mediador: MED no puede
revocar capacidades que no controla (los `fd` de otros procesos).

1. SUP declara el inicio de revocación: MED deja de emitir leases
   (admisión cerrada) y rechaza nuevas solicitudes.
2. SUP envía SIGSTOP al grupo de procesos (clientes + MED salvo el
   propio SUP). Pausar antes de matar evita que una operación en
   curso se complete durante la revocación —con el límite de CE-13
   (syscall ya en vuelo).
3. SUP verifica poseedores: inspecciona `/proc/<pid>/fd` de cada
   proceso del grupo buscando descriptores sobre RES
   [PROPUESTA; disponibilidad y semántica en Termux: SUPUESTO].
   Todo poseedor queda registrado. Si aparece un proceso fuera del
   grupo con `fd` sobre RES, la revocación es **incompleta** y se
   declara como tal (no se finge completitud): el sistema queda en
   BLOCKED.
4. SUP envía SIGKILL al grupo (salvo MED, que se detiene
   ordenadamente tras el paso 5, o se mata si no responde).
5. SUP verifica que el grupo está vacío (re-inspección de `/proc`):
   ningún proceso vivo, ningún `fd` retenido. Si la verificación
   falla o es imposible, BLOCKED (no se asume quiescencia).
6. MED (reiniciado por SUP si fue necesario) emite una generación
   fresca `g+1`, invalida todos los leases de `g` y registra la
   revocación en AUTH y en el registro externo. La generación nueva
   no se emite hasta que el paso 5 haya tenido éxito.
7. Solo entonces se reabre la admisión (NORMAL, generación `g+1`).

Nótese el orden: **matar y verificar primero, nueva generación
después**. Emitir la generación nueva antes de verificar que no
quedan poseedores sería repetir el error de CE-1 (admitir la nueva
generación mientras la antigua sigue viva). La revocación no es
"subir la generación": es "eliminar la capacidad y demostrarlo, y
después subir la generación".

### 2.6 Flujo de recuperación controlada (G-5; REC)

REC es el único camino BLOCKED/QRT → NORMAL. Pasos con predicados;
el fracaso de cualquiera deja el sistema en BLOCKED/QRT.

1. **Congelar.** Sin admisión, sin mutaciones, sin limpieza. MED
   detenido o en modo solo-diagnóstico.
2. **Diagnosticar (D2).** Recoger evidencia externa y metadata:
   qué GEN hay en cada copia, qué identidad tiene cada objeto,
   qué leases están emitidos/consumidos, qué procesos existen,
   qué declaró el ejecutor en el registro externo.
3. **Poner en cuarentena.** El estado sospechoso va a QRT con su
   diagnóstico (C09 [EVIDENCIA]). No se activa nada restaurado sin
   verificación.
4. **Verificar poseedores (SUP).** Como en revocación §2.5 pasos
   2–5: ningún poseedor vivo de capacidad sobre RES. Sin esta
   verificación no hay recuperación.
5. **Re-identificar (IDN).** Verificar R-OBJ y R-NAME del objeto
   vigente; si la identidad no puede verificarse con los medios
   descriptivos (CE-7), el objeto se trata como **no identificado**:
   no se opera sobre él hasta la atestación del propietario.
6. **Atestación del propietario.** El propietario confirma fuera de
   banda: qué ocurrió (crash, rollback declarado y su alcance,
   intervención manual), y que el estado en QRT es el que debe
   activarse o descartarse. La atestación queda registrada en el
   registro externo. Sin atestación no hay recuperación: es la raíz
   de confianza última (CE-15).
7. **Emitir generación fresca.** Solo tras 4–6. Invalida todos los
   leases anteriores.
8. **Re-admitir.** Transición a NORMAL con la generación fresca.
   La primera operación tras REC es una operación de verificación
   (lectura de identidad + GEN), no una operación de negocio.

## 3. Tratamiento individual de CE-1/5/7/8/9/10/11

Cada contraejemplo: qué hace ACA-1, qué no puede hacer, riesgo
residual y decisión del propietario que lo cambiaría. Las citas a la
falsación son por sección; no se re-argumenta.

### 3.1 CE-1 — Proceso antiguo pausado que reanuda con capacidad de mutar

**Qué hace ACA-1.** (a) Vía API: el lease antiguo (generación `g`)
es inválido en `g+1`; MED lo rechaza en aceptación (§2.3 paso 2).
(b) Vía `fd` propio del cliente: los clientes COVERED **no tienen
`fd` sobre RES** (solo MED lo retiene); un proceso antiguo que
reanuda no tiene por dónde mutar directamente. (c) Revocación:
SUP mata el grupo y verifica que no queden poseedores antes de
emitir la generación nueva (§2.5).

**Qué no puede hacer.** Un proceso antiguo que obtuvo un `fd`
directo **antes** de que ACA-1 existiera, o por vía RAW (apertura
directa por path), conserva su `fd` y puede mutar sin pasar por MED
(falsación §4.1(b)). SUP no puede revocar un `fd` sin matar el
proceso, y no puede matar procesos fuera de su grupo (CE-12).

**Residual.** CE-1 queda contenido para clientes COVERED bajo SUP,
no resuelto en general. La condición para la contención total sería
mediación a nivel de kernel.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-08]:
aceptar un mediador a nivel de syscall/kernel (cambio de modelo,
fuera de R1) o aceptar la contención por política (solo clientes
COVERED bajo SUP; RAW fuera del claim).

### 3.2 CE-5 — Replay de release tras restore

**Qué hace ACA-1.** Doble registro del consumo (AUTH + WIT) antes
del efecto (§2.3 paso 3); verificación cruzada de GEN en admisión;
moratoria RB-3/RB-4 (A-02) con declaración obligatoria del ejecutor;
registro externo del consumo (D-RB-09). En RB-1/RB-2 el replay se
**detecta** (el nonce figura consumido en la copia superviviente) y
el sistema pasa a BLOCKED.

**Qué no puede hacer.** En RB-3/RB-4 no declarado, el consumo se
revierte en todas las copias locales y el replay es indistinguible
de un primer uso (falsación §4.2). WIT solo ayuda si su dominio no
se revirtió a la vez (CE-14).

**Residual.** CE-5 queda contenido por **detección + prohibición**,
no por prevención mecánica. La prevención mecánica exigiría un ancla
monótona fuera del ámbito restaurable.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-08]:
aceptar un ancla externa monótona (contador/log fuera del dominio
restaurable) como componente del diseño, o mantener la contención
por política.

### 3.3 CE-7 — Identidad descriptiva post-crash/post-restore

**Qué hace ACA-1.** Identidad verificada en vida del proceso
(`fstat`/`stat`/`nlink`, R-OBJ/R-NAME por separado, §1.3 IDN);
detección de rename (R-NAME) y de hardlink (`nlink`, P07-21);
identidad **UNKNOWN por defecto** tras crash/restore, con
re-identificación por procedimiento (REC pasos 5–6) en lugar de
inferencia descriptiva.

**Qué no puede hacer.** Demostrar que el objeto post-restore es el
originalmente adquirido a partir de atributos descriptivos
(falsación §4.3). La re-identificación en REC no es una demostración
técnica: es una decisión del propietario (atestación) sobre un
objeto verificado como coherente pero no como idéntico.

**Residual.** CE-7 queda convertido en un procedimiento seguro
(BLOCKED + atestación), no resuelto como problema técnico. La
identidad post-restore sigue siendo una decisión humana
documentada, no una prueba.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-06]:
aprobar el criterio de identidad (P07-A: qué cuenta como "el mismo
objeto") y el procedimiento de re-identificación, incluida la
política de aliases.

### 3.4 CE-8 — Ambigüedad de la decisión del mediador

**Qué hace ACA-1.** El diario de decisiones de MED se escribe con
la misma disciplina que los leases: registro previo en AUTH + WIT
antes de ejecutar, y resultado en dos dimensiones (O9). El reinicio
de MED arranca en BLOCKED (§2.1): una decisión ambigua no se
"resuelve" reintentando, se congela. El reintento de una solicitud
es una solicitud nueva con lease nuevo; el nonce consumido la
delata como duplicada en RB-1/RB-2.

**Qué no puede hacer.** Eliminar la ambigüedad fundamental: un
crash entre el registro y el efecto deja el resultado desconocido
(E2), y en RB-3/RB-4 el registro mismo se revierte. CE-8 no se
resuelve; se **contiene** (BLOCKED + no reintento + REC).

**Residual.** Toda decisión de MED bajo crash ambiguo exige REC.
La tasa de REC puede ser alta; es el coste de no reintentar.

**Decisión que lo cambiaría:** ninguna dentro de R1: la ambigüedad
crash/efecto es estructural (problema de exactamente-una-vez). Solo
un ancla externa transaccional la eliminaría (A-08).

### 3.5 CE-9 — Mutación en vuelo en la frontera de la syscall

**Qué hace ACA-1.** SIGSTOP al grupo antes de SIGKILL (§2.5 paso
2) reduce la ventana; la verificación de poseedores antes de la
nueva generación impide admitir mientras pueda haber efectos en
vuelo; los efectos en vuelo que aterrizan después se detectan por
cambio de hash/GEN sin decisión de MED → BLOCKED.

**Qué no puede hacer.** Retirar una syscall ya entrada en el kernel
ni impedir que su efecto aterrice. La pausa no es un recall.

**Residual.** Una mutación en vuelo puede aterrizar en la
generación nueva. La arquitectura lo **detecta** (y bloquea
después), no lo **impide**.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-08]:
serialización a nivel de kernel/syscall (fuera de R1).

### 3.6 CE-10 — Snapshots sesgados (composición de restores)

**Qué hace ACA-1.** GEN cruzada entre cuatro copias: un rollback
parcial o sesgado (RES en T0, COORD en T1) produce desacuerdo de
GEN → BLOCKED. La atomicidad entre conjuntos es requisito (D-RB-03)
y el diario de rollback se registra fuera del ámbito (D-RB-09).

**Qué no puede hacer.** Detectar un sesgo autoconsistente: si todos
los conjuntos se revirtieron al mismo T0, no hay desacuerdo que
detectar. Y la atomicidad entre conjuntos no puede verificarse con
un registro que pertenece a uno de los conjuntos (rollback §4.1).

**Residual.** CE-10 queda contenido para sesgos **parciales**,
no para reverts totales coherentes.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-08]:
ancla externa con atomicidad del snapshot compuesto, o moratoria
de RB-3/RB-4 (A-02).

### 3.7 CE-11 — Herencia y transferencia de capacidad fuera del registro

**Qué hace ACA-1.** Los clientes no reciben `fd` sobre RES, así que
no hay nada que heredar ni transferir por `SCM_RIGHTS` en el diseño
nominal. SUP verifica poseedores por `/proc` antes de emitir la
nueva generación (§2.5 paso 3). El fork de un cliente produce otro
cliente sin `fd`: inofensivo por diseño.

**Qué no puede hacer.** Impedir que un proceso RAW (que abrió RES
directamente) herede o transfiera su `fd` a otro proceso. La
verificación por `/proc` tiene carreras frente a fork/exec y su
disponibilidad en Termux es [SUPUESTO]. Un `fd` transferido a un
proceso fuera del grupo es invisible para SUP (CE-12).

**Residual.** CE-11 queda resuelto **dentro** del diseño (clientes
sin `fd`) y abierto **fuera** de él (RAW). La frontera es P09.

**Decisión que lo cambiaría** [DECISIÓN DEL PROPIETARIO, A-05]:
cerrar P09 (qué entry points y consumidores existen y cuáles deben
pasar por MED), y A-08 para el caso RAW.

## 4. Garantías demostrables, condicionales e imposibles

### 4.1 Demostrables (por diseño; pendientes de implementación y verificación)

"Demostrable" significa que ACA-1 provee un mecanismo concreto cuya
corrección puede comprobarse con oráculos (E1–E9, P07-01…22). Nada
de esto está demostrado hoy: no hay implementación ni ejecución.

| # | Garantía | Mecanismo en ACA-1 | Oráculo que la comprobaría |
|---|---|---|---|
| D-1 | Admisión antes del primer I/O persistente (clientes COVERED) | MED es el único que toca stores; las APIs obtienen contexto de admisión antes de cualquier I/O (§2.2) | P09 cerrado para el universo declarado; fixtures de bypass (import directo → sin admisión → BLOCKED) |
| D-2 | Serialización de escritores COVERED | MED único escritor; leases de una sola operación; verificación en aceptación | E7 con procesos separados y barreras; P07-05/06 |
| D-3 | Separación negocio/release (O9) | Resultados en dos dimensiones; sin retry de negocio ante release incierto | E1/E2/E9 |
| D-4 | Detección de rollback RB-1/RB-2 | GEN cruzada (4 copias); desacuerdo → BLOCKED | Rollback RB-1/RB-2 en harness con crash/restore en cada punto de corte |
| D-5 | Detección de sustitución con atributos distintos | Re-validación R-OBJ/R-NAME + `nlink` en cada mutación | P07-16/18/19/21 (oráculos V2.3) |
| D-6 | Ninguna readmisión automática | Máquina de estados sin transiciones automáticas fuera de BLOCKED (§2.1) | E8: D2 no desbloquea; intento de operación normal en BLOCKED → rechazado |
| D-7 | Cuarentena antes de activación | QRT + C09; nada sale de QRT sin REC | E3/E4 con centinela; activación directa → FAIL |
| D-8 | Cleanup condicionado al descriptor | Re-validación + `unlinkat` sobre `dirfd` (si la primitiva está disponible) | P07-19/21 con sustitución entre fallo y cleanup |

### 4.2 Condicionales (válidas solo si se cumple la condición)

| # | Garantía | Condición | Si la condición falla |
|---|---|---|---|
| C-1 | Revocación efectiva de procesos antiguos | Todos los poseedores están en el grupo de SUP y `/proc` permite verificarlo | CE-12: poseedor fuera del grupo sobrevive |
| C-2 | Single-use de release | El rollback es RB-1/RB-2 (AUTH o WIT sobreviven) o el rollback fue declarado | CE-5 en RB-3/RB-4 no declarado |
| C-3 | Identidad verificable en vida del proceso | Primitivas (`openat`, `dirfd`, `unlinkat`, `/proc`) disponibles en el Node de Termux | IDN degrada a comprobación por path (check/use, insuficiente) |
| C-4 | BLOCKED durable tras rollback | El rollback es detectable (RB-1/RB-2) o declarado (registro externo) | Incumplimiento silencioso de P05-C |
| C-5 | El testigo (WIT) detecta RB-3/RB-4 | Los dos dominios no se restauran juntos | CE-14: correlación de dominios |
| C-6 | La recuperación re-identifica el objeto | El propietario atesta con información correcta | CE-15: atestación errónea |
| C-7 | Cobertura universal de la frontera | P09 cerrado para el universo declarado | RAW fuera de la frontera (G-4 incompleto) |

### 4.3 Imposibles (bajo R1 y las restricciones del encargo)

Cada imposibilidad indica la decisión del propietario que la
cambiaría. "Imposible" aquí significa imposibilidad condicionada en
el sentido de la falsación (bajo P-R1 + P-RESTORE + P-FD), no
imposibilidad lógica universal.

| # | Garantía imposible | Demostración (resumen; detalle en falsación) | Decisión que la cambiaría |
|---|---|---|---|
| I-1 | Impedir la mutación por `fd` directo de un proceso antiguo | No hay punto de aceptación en MED para una `write(2)` sobre un `fd` ya abierto; el kernel no revoca el `fd` al cambiar la generación (falsación §4.1(b)) | A-08: mediador a nivel de syscall/kernel (cambio de modelo, fuera de R1) |
| I-2 | Single-use de release bajo rollback RB-3/RB-4 no declarado | El registro de consumo vive dentro del ámbito restaurable; el restore lo borra (falsación §4.2; M0.55) | A-08: ancla monótona externa al snapshot (cambio de modelo) |
| I-3 | Identidad post-restore a partir de atributos descriptivos | Cada atributo es reutilizable/copiable; el criterio está sin definir (falsación §4.3) | A-06: criterio de identidad P07-A + procedimiento de re-identificación (no lo hace demostrable técnicamente; lo convierte en decisión documentada) |
| I-4 | Retirar una mutación en vuelo | La syscall ya entrada no puede ser retirada desde espacio de usuario (falsación CE-9) | A-08: serialización a nivel de kernel |
| I-5 | Detectar un rollback total autoconsistente sin testigo externo | El estado restaurado es idéntico a un estado legítimo pasado; ninguna comprobación interna distingue ambos (rollback §3.3/§3.4) | A-08: ancla externa; o A-02: moratoria RB-3/RB-4 (contención, no detección) |
| I-6 | Enumeración completa de poseedores de capacidad | Los `fd` se heredan y transfieren por canales no observables desde el registro de admisión; `/proc` tiene carreras (falsación §4.1(c),(e); CE-11) | A-08: mediación a nivel de kernel con censo de descriptores, o A-05: universo cerrado demostrable (P09) |
| I-7 | Anti-rollback con información puramente local | Toda información local puede restaurarse; es la restricción expresa del encargo y la conclusión de F6/F7 | A-08: componente externo al dominio restaurable (ancla, TEE, servicio) — fuera de las restricciones actuales |

## 5. Supuestos y dependencias

### 5.1 Supuestos técnicos (sin evidencia en el target)

| ID | Supuesto | Qué depende de él | Cómo se verificaría (no se ejecuta aquí) |
|---|---|---|---|
| S-1 | Las primitivas `openat`/`openat2`, `dirfd`, `unlinkat`, OFD locks y `/proc/PID/fd` están disponibles y se comportan como en Linux estándar en el Node de Termux del POCO X7 Pro | IDN, cleanup condicionado, verificación de poseedores (C-3, C-1) | Fingerprint del target (O8): versión de Node, syscalls disponibles, inspección de `/proc` en el dispositivo, con autorización específica |
| S-2 | Un proceso supervisor puede ser líder de grupo y enviar SIGSTOP/SIGKILL a todo el grupo en Termux/Android, y los procesos no escapan del grupo por defecto | Revocación (C-1) | Observación en el dispositivo del ciclo de vida de procesos y grupos |
| S-3 | IPC por socket Unix entre MED y clientes funciona en el sandbox Termux con la latencia y fiabilidad necesarias | Toda la mediación | Verificación en el target; alternativa (si falla): MED como biblioteca en proceso — que destruiría la separación mediador/cliente y debe re-diseñarse, no asumirse |
| S-4 | Los dos dominios de WIT tienen comportamiento de restore independiente | WIT (C-5) | Verificación de qué cubre el backup de Android y el saved-state para cada dominio; si no son independientes, WIT-local se descarta |
| S-5 | El propietario puede lanzar la sesión manual, ejecutar la revocación y atestar fuera de banda de forma fiable | SUP, REC (C-6) | Es una capacidad humana y procedimental, no técnica: se verifica por el procedimiento, no por un test |
| S-6 | Los clientes legítimos pueden reescribirse para no abrir RES directamente (P09 cerrable para el universo declarado) | G-4, C-7 | Cierre de P09: inventario de entry points, loaders y consumidores; conversión de APIs path-based en superficie interna |

### 5.2 Dependencias (qué debe existir antes)

| Dependencia | Estado | Bloquea |
|---|---|---|
| D-RB-01–D-RB-09 (rollback) | Pendientes del propietario (rollback §7) | G-1, C-2, C-4: sin alcance de rollback decidido, ACA-1 no sabe qué debe detectar |
| P07-A (identidad/aliases) y P01/P02 (autoridad de raíz) | Pendientes del propietario | G-3, I-3: sin criterio de identidad no hay re-identificación definible |
| P09 cerrado | OPEN/UNKNOWN [EVIDENCIA] | G-4, C-7: sin universo cerrado no hay frontera completa |
| E2/E3 (control de launchers/writers) | PARTIAL/NOT CLOSED | G-2, C-1: sin control de lanzadores no hay revocación completa |
| O8 (fingerprint del target) | UNKNOWN | S-1–S-4: sin fingerprint, los supuestos no se verifican |
| A-01–A-09 (§10) | Pendientes | La implementación misma: este diseño no autoriza nada |

## 6. Matriz O1–O9

| ID | Obligación | Cómo la aborda ACA-1 | Estado |
|---|---|---|---|
| O1 | BLOCKED sobrevive a la terminación del proceso dueño | Fail-closed por construcción: sin MED vivo y sin evidencia positiva no hay admisión; el bloqueo no depende de un registro que deba sobrevivir | **SATISFECHO POR DISEÑO** (para la terminación; para rollback ver O1-nota: en RB-3/RB-4 no declarado, el bloqueo no puede declararse porque el rollback no se detecta → CONDICIONAL, ver C-4) |
| O2 | La nueva invocación descubre el estado anterior sin inferirlo por PID/edad/ausencia | GEN cruzada + comprobación RES↔COORD↔AUTH + registro externo; nunca PID/edad/ausencia | **CONDICIONAL** (C-4): RB-1/RB-2 sí; RB-3/RB-4 no |
| O3 | El estado de coordinación tiene identidad estable | IDN: identidad ligada (dev, ino, GEN, hash, nlink); R-OBJ/R-NAME por separado; re-validación en cada mutación | **CONDICIONAL** (C-3): en vida del proceso sí (si S-1); post-crash UNKNOWN por defecto + REC |
| O4 | Release/cleanup solo afecta el objeto adquirido | MED ejecuta cleanup con re-validación inmediata + operación condicionada al descriptor (`unlinkat`/`dirfd`) | **CONDICIONAL** (C-3): depende de S-1; RAW bypass fuera de alcance |
| O5 | No existe readmisión por pérdida, sustitución, ilegibilidad o desaparición del estado | Fail-closed: pérdida/ilegibilidad/desaparición → BLOCKED; sustitución detectada por IDN → BLOCKED; sustitución con atributos idénticos → indetectable (I-3 residual, contenido por QRT+REC) | **SATISFECHO POR DISEÑO** para pérdida/ilegibilidad/desaparición; **CONDICIONAL** para sustitución |
| O6 | El estado solo se reclasifica mediante procedimiento aprobado | Máquina de estados (§2.1): solo REC reclasifica; REC exige predicados + atestación + registro | **SATISFECHO POR DISEÑO** (como arquitectura; el procedimiento REC concreto requiere aprobación, A-06) |
| O7 | Todo caller/writer cubierto respeta la frontera | MED como frontera única; admisión antes del primer I/O; corrección de la brecha pre-read | **CONDICIONAL** (C-7): requiere P09 cerrado |
| O8 | La garantía corresponde al entorno R1 real | Nada en ACA-1 presupone un entorno distinto de R1; pero la correspondencia no está verificada | **UNKNOWN**: requiere fingerprint del target y verificación de S-1–S-4 |
| O9 | Persistencia de negocio y estado de admisión no se confunden | Resultados en dos dimensiones separadas en MED; sin retry de negocio ante release incierto; oráculos separados | **SATISFECHO POR DISEÑO** |

## 7. Contraejemplos que todavía podrían romper la propuesta

Nuevos en este documento (CE-12–CE-16). No figuran en la falsación
(CE-1–CE-11) ni en P07-01…22, E1–E9 u O1–O9 en estas formas exactas.
Se registran como abiertos, no ratificados. Cada uno nombra el
componente que ataca y la defensa que le queda a ACA-1.

**CE-12 — El supervisor tiene un punto ciego: escape del grupo de
procesos.** Un proceso cliente ejecuta `setsid` o doble fork y queda
reparentado fuera del grupo de SUP (o sobrevive a la muerte de SUP).
SUP envía SIGKILL al grupo y verifica `/proc`: el grupo está vacío,
pero el escapado sigue vivo con capacidad (si es RAW, con `fd`).
La verificación de quiescencia (§2.5 paso 5) da un falso positivo.
Ataca: SUP, C-1, G-2. Defensa restante: la verificación de
poseedores por `/proc` global (no solo del grupo) —que tiene sus
propias carreras— y la detección por hash/GEN (el escapado que muta
delata su mutación, pero después del efecto). Clasificación:
**CONDICIONAL** (depende de S-2); sin contención por grupo cerrado,
**IMPOSIBLE** de cerrar en espacio de usuario.

**CE-13 — Carrera de revocación: la señal y la escritura.**
SUP envía SIGSTOP; un cliente ya había entrado en la syscall de
escritura (o su escritura ya estaba en la capa de almacenamiento).
La escritura aterriza después del SIGSTOP, o entre la verificación
de poseedores y el SIGKILL, o entre el SIGKILL y la emisión de la
generación nueva. La generación nueva se emite sobre un efecto de
la generación antigua. Ataca: §2.5, CE-9. Defensa restante:
detección posterior (hash/GEN) → BLOCKED, y el orden
matar-verificar-generación (§2.5) que minimiza la ventana sin
eliminarla. Clasificación: **IMPOSIBLE** de eliminar sin
serialización a nivel de kernel (I-4).

**CE-14 — Correlación de dominios del testigo.** WIT vive en un
segundo dominio para que un rollback de HOME no lo alcance. Pero
una operación de backup/restore integral del dispositivo (o una
copia manual de todo el dispositivo, o la restauración de fábrica
con backup) revierte HOME y el segundo dominio a la vez, con el
mismo T0. GEN acuerda falsamente. WIT es indistinguible de no
haber existido. Ataca: WIT, C-5, G-1. Defensa restante: WIT-
propietario (registro externo humano), que no se restaura con el
dispositivo —a costa de depender del humano (CE-15). Clasificación:
**CONDICIONAL** (depende de S-4, no verificado).

**CE-15 — Atestación errónea del propietario.** La recuperación
confía en que el propietario ateste con información correcta. El
propietario puede atestar sobre un estado que no es el que cree
(rollback no notado, alcance mal declarado, confusión entre dos
snapshots, error humano bajo presión). Una atestación errónea
re-admite un estado revertido con todas las bendiciones del
procedimiento: el sistema sale de BLOCKED por la vía legítima,
sobre datos ilegítimos. Ataca: REC, C-6, G-5. Defensa restante:
la atestación debe ser específica (qué ocurrió, qué alcance, qué
snapshot) y contrastarse con el registro externo y con D2; una
atestación genérica ("todo bien") no es predicado válido. Pero el
contraste también puede estar revertido (RB-4). Clasificación:
**residual irreductible** mientras la raíz de confianza sea humana;
se mitiga con procedimiento, no se elimina.

**CE-16 — Amnesia del mediador: doble instancia y re-emisión.**
MED muere y SUP lo reinicia; el MED reiniciado arranca desde un
estado restaurado (RB-1: AUTH en T0) y re-emite un lease/nonce ya
emitido, o dos instancias de MED corren a la vez (una antigua
pausada que reanuda —CE-1 aplicado al mediador— y una nueva).
Dos mediadores con la misma generación emiten leases contradictorios;
el invariante de único escritor se rompe por dentro. Ataca: MED,
G-4, C-2. Defensa restante: arranque de MED en BLOCKED (§2.1),
registro de instancia única (el segundo MED que arranca detecta al
primero por IPC/lock —que es, irónicamente, otro lock cooperativo—)
y generación fresca obligatoria tras reinicio de MED (nunca reanudar
la generación anterior). Clasificación: **CONDICIONAL** (la
detección de doble instancia es cooperativa); la unicidad del
mediador no puede garantizarse sin un mecanismo de exclusión que a
su vez puede fallar (CE-8).

## 8. Decisiones que requieren autorización del propietario

Ninguna de estas decisiones está tomada por este documento. Cada una
lleva opciones y consecuencias; la recomendación es [PROPUESTA].

| ID | Decisión | Opciones | Consecuencias | Recomendación razonada [PROPUESTA] |
|---|---|---|---|---|
| A-01 | Autorizar el mediador (MED) y el supervisor (SUP) como mecanismos nuevos | **A.** Sí: MED+SUP como arquitectura. **B.** No: mantener el modelo por invocación. **C.** MED sin SUP (mediador sin revocación por grupo). | **A:** habilita G-2/G-4; introduce un proceso persistente y un punto único de fallo (CE-16); es un mecanismo nuevo (daemon) que las obligaciones prohibían inventar sin decisión. **B:** ACA-1 no se implementa; se mantiene el estado actual (O4/O5 no satisfechas). **C:** mediación sin revocación: CE-1 sin contención. | **A.** Razón: sin mediador de único escritor no hay serialización ni aceptación verificable; sin supervisor no hay revocación. El coste (punto único de fallo) se contiene con arranque en BLOCKED y REC. C es peor que B: da la apariencia de mediación sin su garantía. |
| A-02 | Moratoria RB-3/RB-4 (D-RB-01 A) como precondición de ACA-1 | **A.** Sí: rollback fuera de R1; RB-3/RB-4 prohibidos. **B.** No: se admiten todos los alcances. **C.** Solo RB-1 admitido. | **A:** contiene CE-5 por prohibición; sin vía de recuperación de AUTH corrupta. **B:** ACA-1 no puede sostener G-1/C-2/C-4 para esos alcances (I-2, I-5). **C:** máxima restricción operativa; recuperación de RES corrupto posible, de COORD/AUTH no. | **A.** Razón: es la condición que hace honestas las garantías condicionales (C-2, C-4). Sin A, el veredicto de §11 pasaría de PARCIAL a INVIABLE para G-1. |
| A-03 | Desactivar o declarar el backup/saved-state de Android para el dominio | **A.** Desactivar backup y saved-state para el dominio. **B.** Declararlos como ejecutores con BLOCKED posterior. **C.** No hacer nada. | **A:** elimina el ejecutor SO no declarado; puede perder la vía de recuperación del dispositivo. **B:** realista; exige detectar el restore del SO (¿cómo? el SO no declara). **C:** deja el ejecutor más probable sin clasificar (rollback §4.4). | **A si es posible técnicamente; si no, B con cuarentena automática tras cualquier reinicio con saved-state.** Razón: un ejecutor no declarado invalida D-RB-02 y con él C-2/C-4. |
| A-04 | Atestación del propietario como raíz de confianza de REC | **A.** Sí: la recuperación exige atestación fuera de banda. **B.** No: recuperación solo automática por predicados técnicos. **C.** Atestación solo para RB-3/RB-4. | **A:** hace explícita la confianza humana (CE-15); lenta; auditable. **B:** imposible: los predicados técnicos no distinguen un revertido autoconsistente (I-5). **C:** incoherente: RB-1/RB-2 también necesitan decidir qué activar (C09). | **A.** Razón: B es imposible por I-5; la atestación es el único testigo que sobrevive a RB-4. Su falibilidad (CE-15) se mitiga con atestación específica + registro externo, no se elimina. |
| A-05 | Cierre de P09: universo de escritores que deben pasar por MED | **A.** Cerrar P09 para un universo declarado (entry points, APIs, consumidores). **B.** Dejar P09 OPEN y limitar el claim a los clientes conocidos. **C.** No cerrar nunca (claim universal abandonado). | **A:** habilita G-4/C-7; exige inventario y conversión de APIs path-based. **B:** ACA-1 funciona para los conocidos; RAW queda fuera del claim (honesto pero parcial). **C:** G-4 se abandona como objetivo. | **A con B como postura transitoria.** Razón: sin universo declarado no hay frontera que cerrar; B es el estado actual y no cierra nada. A es trabajo documental previo a cualquier implementación. |
| A-06 | Criterio de identidad (P07-A) y procedimiento de re-identificación | **A.** Aprobar un criterio (qué cuenta como mismo objeto) y el procedimiento REC pasos 5–6. **B.** Dejarlo pendiente y mantener identidad UNKNOWN post-crash (sin recuperación de objetos no identificados). **C.** Criterio puramente descriptivo. | **A:** habilita G-3 en su forma procedimental; no hace demostrable I-3. **B:** seguro pero sin recuperación: todo objeto post-crash queda inutilizable hasta decisión caso por caso. **C:** contradice la falsación §4.3 (falsos positivos y negativos). | **A.** Razón: C está refutado; B es conforme pero convierte cada crash en un bloqueo permanente de facto. A es el único camino que permite recuperación controlada, con la honestidad de que es una decisión, no una prueba. |
| A-07 | Diseño del testigo (WIT): dual-dominio vs. registro del propietario | **A.** WIT-local (segundo dominio). **B.** WIT-propietario (registro externo, D-RB-09). **C.** Ambos. **D.** Ninguno. | **A:** automático pero con independencia no verificada (CE-14). **B:** robusto frente a restore del dispositivo; depende del humano (CE-15); lento. **C:** lo mejor de ambos; mayor complejidad. **D:** ACA-1 pierde C-5; solo RB-1/RB-2 por GEN cruzada local. | **C, con B como mínimo obligatorio.** Razón: A solo es insuficiente (CE-14) y B solo es lento pero es el único testigo que sobrevive a RB-4. D degrada el diseño a detección local. |
| A-08 | Aceptar la contención por política para las garantías imposibles, o cambiar el modelo | **A.** Aceptar: I-1–I-7 se contienen por política (moratoria, prohibición, atestación) y el claim se restringe. **B.** Cambiar el modelo: autorizar ancla externa y/o mediador a nivel de kernel (nuevo R1). **C.** No aceptar ni cambiar (mantener el claim universal sin mecanismo). | **A:** veredicto PARCIAL; claim restringido pero honesto. **B:** podría llevar el veredicto a VIABLE para el claim ampliado; exige redefinir R1 y nuevos mecanismos (TEE, ancla, kernel) con sus propias decisiones y verificaciones. **C:** incoherente: afirma lo que la falsación refutó. | **A ahora; B como decisión separada y posterior.** Razón: B es una decisión de modelo, no de arquitectura, y no debe tomarse implícitamente al aprobar un diseño. A mantiene el diseño útil dentro de R1. C debe rechazarse. |
| A-09 | Autorizar la implementación (fase posterior, separada) | **A.** Sí, tras A-01–A-08 y con SHA congelado, harness y fingerprint del target. **B.** No por ahora. | **A:** convierte el diseño en código verificable; exige resolver S-1–S-6. **B:** el diseño queda como documento. | **B por ahora; A solo después de A-01–A-08.** Razón: implementar sin decisiones es implementar sin especificación. Este documento no solicita A-09. |

## 9. Veredicto: PARCIAL bajo R1

**Veredicto: PARCIAL.**

ACA-1 es **viable como arquitectura de claim restringido** e
**inviable como arquitectura de claim universal** bajo R1. La frase
anterior es el veredicto completo; lo que sigue es su desglose
exacto, para que nadie tenga que interpretarlo.

**Lo que ACA-1 sí cierra (claim restringido):**

- Serialización y admisión de escritores **COVERED** bajo SUP, con
  admisión antes del primer I/O y verificación en aceptación (D-1,
  D-2, G-4 parcial).
- Detección de rollback **RB-1/RB-2** por GEN cruzada, con BLOCKED y
  cuarentena (D-4, G-1 parcial).
- Detección de sustitución con atributos distintos y de rename/
  hardlink (D-5, G-3 parcial).
- Separación negocio/release, ninguna readmisión automática,
  cuarentena antes de activación, cleanup condicionado al descriptor
  (D-3, D-6, D-7, D-8, G-5).
- Revocación de procesos **del grupo de SUP** con verificación de
  poseedores antes de emitir la generación nueva (G-2 parcial).
- Recuperación controlada por procedimiento con predicados y
  atestación (G-5).

**Lo que ACA-1 no cierra (y por qué el veredicto no es VIABLE):**

- Prevención de la mutación por `fd` directo (I-1, CE-1(b)).
- Single-use bajo rollback RB-3/RB-4 no declarado (I-2, CE-5).
- Identidad post-restore como demostración técnica (I-3, CE-7).
- Retiro de mutaciones en vuelo (I-4, CE-9).
- Detección de rollback total autoconsistente sin testigo externo
  (I-5, CE-10/RB-4).
- Enumeración completa de poseedores (I-6, CE-11/CE-12).
- Anti-rollback con información puramente local (I-7).

**Qué cambiaría el veredicto:**

- A **VIABLE** (para el claim universal): una decisión de cambio de
  modelo (A-08 opción B) —ancla monótona externa al dominio
  restaurable y/o mediador obligatorio a nivel de syscall/kernel—,
  con sus propias verificaciones. Nótese: eso no haría viable a
  ACA-1; haría viable a una arquitectura distinta, con un R1
  distinto. Debe decidirse como tal.
- A **INVIABLE** (incluso para el claim restringido): si el
  propietario rechaza A-02 (moratoria RB-3/RB-4) y A-01 (mediador),
  o si S-1/S-2/S-3 (primitivas, grupos de procesos, IPC) resultan
  falsas en el target. En ese caso no hay diseño dentro de R1 que
  sostenga ni el claim restringido.
- **PARCIAL es estable** si el propietario acepta A-01, A-02 y A-08
  opción A: el diseño es implementable y verificable para el claim
  restringido, con los imposibles contenidos por política y
  registrados como tales.

**Lo que este veredicto no significa:** no significa que M0 esté
cerrado (sigue INCOMPLETO: P05 OPEN, P07-C UNKNOWN/BLOCKING, P09
OPEN/UNKNOWN, E2/E3 PARTIAL/NOT CLOSED, `authorization:
NOT_EVALUATED`, raíz constitucional PENDING/UNKNOWN, commissioning y
efectos protegidos STOP). No autoriza implementación (A-09 no se
solicita). No selecciona tecnología ni framework: ACA-1 es una
arquitectura candidata con componentes abstractos (MED, SUP, GEN,
IDN, WIT), no una elección de implementación.

---

## Anexo A. Trazabilidad y verificación de esta entrega

- Método: diseño a partir de la falsación (SHA-256 verificado
  `8f1bb646…`) y de la especificación de rollback (SHA-256 verificado
  `f36008ec…`); rama `ncs-continuity-handoff-correction-2026-11-07`,
  HEAD `eee2ae77` re-verificado por `ls-remote` 2026-11-10.
- No se repite la auditoría CE-1/CE-5/CE-7: los resultados se citan
  por sección de la falsación (§3, §6.3).
- No se presupone acceso privilegiado al kernel, TEE, hardware
  externo ni servicio remoto: cada vez que el diseño necesitaría uno,
  lo declara imposible (I-1–I-7) y remite a A-08.
- No se declara que un mecanismo local resuelva anti-rollback: I-7
  lo prohíbe expresamente y §1.4 lo repite.
- No se confunden detección con prevención, CAS con fencing ni
  nombre con identidad: §1.1 principio 3 y §1.3 (GEN no es epoch,
  C4) lo establecen; cada garantía dice si detecta o previene.
- No se modifica el repositorio. No se escribe código para integrar
  (los flujos son secuencias de pasos, no implementación). No se
  ejecutan pruebas, CI, comandos en Termux ni operaciones sobre
  dispositivos. No se declara M0 cerrado.
- GitHub: NOT_CONNECTED (verificado 2026-11-10). Entrega local para
  revisión del propietario.

## Anexo B. Glosario mínimo

- **ACA-1:** arquitectura candidata de este documento.
- **MED/SUP/GEN/IDN/LS/WIT/QRT/D2/REC:** componentes (§1.3).
- **RB-1–RB-4:** alcances de rollback (rollback §1.4).
- **Lease:** credencial de un solo uso (generación, identidad,
  operación, nonce).
- **Atestación:** confirmación fuera de banda del propietario en REC.
- **CE-12–CE-16:** contraejemplos nuevos de este documento (§7).

*Fin del documento.*
