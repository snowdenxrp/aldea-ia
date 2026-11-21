# Evidencia 73 — Reclasificación de escrituras literales BRService.state/error

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación de mensajes literales del usuario del 2026-11-19; no se reabrió la extracción local.
- Clasificación: `USER-PASTED-SOURCE / RECOVERED-CHAT` para las instrucciones y constantes transcritas; no `LOCAL-VERIFIED`.
- Alcance: corregir la clasificación probatoria de tres coordenadas ya incluidas en evidencia 71. No es un nuevo descubrimiento de ubicaciones.

## 1. Fragmentos literales recuperados

El usuario había compartido las siguientes instrucciones Smali de `BRService.smali`:

```smali
# Coordenada física 14173
const/4 v0, 0x3
iput v0, p4, Lcom/miui/backup/service/BRItem;->state:I

# Coordenada física 14178
const/16 v0, 0x9
iput v0, p4, Lcom/miui/backup/service/BRItem;->error:I

# Coordenada física 16697
const/4 v7, 0x6
iput v7, v10, Lcom/miui/backup/service/BRItem;->state:I
```

Las coordenadas físicas identifican las instrucciones `iput`; las constantes inmediatamente anteriores fueron conservadas en el mismo bloque/contexto compartido por el usuario. No se conserva aquí el encabezado completo del método ni todas las ramas dominantes.

## 2. Semántica estrictamente demostrable

| Coordenada | Campo escrito | Valor cargado inmediatamente antes | Afirmación admisible |
|---:|---|---:|---|
| 14173 | `BRItem.state` | `0x3` (3) | La instrucción escribe el valor 3 en `state` del objeto referenciado por `p4`. |
| 14178 | `BRItem.error` | `0x9` (9) | La instrucción escribe el valor 9 en `error` del mismo objeto referenciado por `p4`. |
| 16697 | `BRItem.state` | `0x6` (6) | La instrucción escribe el valor 6 en `state` del objeto referenciado por `v10`. |

Las dos escrituras en 14173 y 14178 usan el mismo registro objeto `p4`; en el bloque recuperado aparecen como pareja `state=3,error=9`. Esto demuestra la pareja de escrituras en el fragmento, pero sin el método y sus ramas completas no debe generalizarse a todos los caminos ni asignarse una causa funcional no conservada.

La escritura en 16697 es independiente en cuanto al registro objeto (`v10`) y asigna `state=6`. No se afirma que sea el mismo objeto que `p4`, ni se infiere condición causal.

## 3. Corrección de evidencia 71

Evidencia 71 §1 no debe seguir describiendo 14173, 14178 y 16697 como coordenadas de grep sin instrucciones literales. Las tres coordenadas ya estaban inventariadas; evidencia 73 solo recupera y conserva su contenido literal parcial y su clasificación correcta.

- 14173: `USER-PASTED-SOURCE`, `BRItem.state=3`.
- 14178: `USER-PASTED-SOURCE`, `BRItem.error=9`.
- 16697: `USER-PASTED-SOURCE`, `BRItem.state=6`.

No contar estas tres líneas como nuevas ubicaciones respecto de evidencia 71 ni como nuevos escritores respecto del inventario histórico: es una mejora de la calidad de la evidencia.

## 4. Límites pendientes

- Recuperar encabezado `.method`, descriptor y contexto completo de 14165–14185 para identificar el método y la condición que dominan la pareja state/error.
- Recuperar el encabezado y contexto de 16697 para identificar método y condición.
- No usar esta evidencia para inferir el estado global de BRService ni para confundir `BRItem.state/error` con los parámetros de `setState(IIII)`.
- No inferir runtime, frecuencia, éxito de restauración ni causalidad externa.

## 5. Reconciliación con inventarios existentes

- Evidencia 71 ya contenía las tres coordenadas: no duplicar.
- Evidencias 47/53/69 contienen otros bloques y la semántica global de `setState(IIII)`; mantener separadas esas capas.
- Evidencia 70 contiene coordenadas grep de `BRService$6/$7`; sus ubicaciones no se elevan aquí a fragmentos Smali literales.
- Las otras coordenadas de `BRService.smali` recuperadas literalmente en la misma conversación (16791, 16914–16917, 17153–17158 y 17431–17436) ya están referenciadas por evidencia 53/47; no duplicarlas.

**Resultado:** se corrige la procedencia de tres instrucciones previamente clasificadas solo como grep. No se declara `LOCAL-VERIFIED` ni se amplía la cobertura de ubicaciones.
