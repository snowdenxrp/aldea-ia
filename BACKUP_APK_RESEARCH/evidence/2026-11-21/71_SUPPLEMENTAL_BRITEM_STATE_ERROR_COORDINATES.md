# Evidencia 71 — Coordenadas complementarias del inventario BRItem.state/error

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Procedencia: recuperación de grep compartido por el usuario el 2026-11-19 y cotejo de coordenadas contra las evidencias existentes.
- Clasificación: `USER-REPORTED-GREP / RECOVERED-CHAT`; sin bloques Smali literales disponibles en esta recuperación.
- No LOCAL-VERIFIED; no ejecución dinámica.

## 1. BRService.smali: coordenadas adicionales

El usuario reportó las siguientes ubicaciones físicas dentro de `BRService.smali` como resultados del inventario de instrucciones `iput` relacionadas con `BRItem.state/error`:

- 14173
- 14178
- 16697

El expediente existente evidencia 53 ya documenta otros bloques de `BRService.smali`, entre ellos 12849–12956, 16787–16791, 16914–16917, 17153–17158, 17431–17436, y las propagaciones 6855–6862 y 7004–7009. Las coordenadas 14173, 14178 y 16697 no aparecen en la evidencia 53 ni en la evidencia 47, por lo que se preservan aquí como referencias adicionales del inventario.

**No asignar todavía** a cada coordenada un campo concreto (`state` o `error`), valor, método, registro fuente ni condición: el resumen recuperado no conserva las instrucciones literales que permitirían distinguirlos. No contar cada coordenada como un productor semántico distinto hasta cotejar el `iput` y el contexto del método.

## 2. ProgressItemAdapter: referencias adicionales dentro de rangos ya inspeccionados

El inventario grep recuperado reportó referencias `iput/iget` de `BRItem.state/error` en:

- 477
- 582
- 589
- 1379
- 1384
- 1492
- 1544

Archivo reportado: `ProgressPageFragmentBase$ProgressItemAdapter.smali`.

Estas coordenadas caen dentro de rangos ya registrados en evidencia 09 (445–495, 550–600, 1350–1400 y 1450–1570). Por tanto, **no requieren repetir esas extracciones completas**. La novedad documental aquí es conservar la ubicación de las referencias del grep que no se habían individualizado en los addenda posteriores.

La evidencia 54 y la evidencia 67 ya contienen los hallazgos funcionales del adapter y las coordenadas de callbacks principales; esta evidencia no vuelve a describir sus métodos ni afirma que las siete referencias sean todas escrituras. El resumen histórico solo conserva que son coincidencias `iput/iget` del inventario de campos.

## 3. Reconciliación con otras evidencias para evitar duplicación

- Evidencia 08 contiene el mapa de callbacks de `BRService$11`, `BRService$FakeBackupListenerImp` y las ubicaciones principales del adapter. No se vuelve a inventariar aquí.
- Evidencia 09 conserva los rangos inspeccionados del adapter; las coordenadas de §2 están dentro de esos rangos.
- Evidencias 53 y 47 conservan los escritores/propagaciones ya descritos de `BRService.smali`; no repetirlos.
- Evidencia 70 conserva las ubicaciones adicionales de `BRService$6`, `BRService$7`, `CompatibilityActivity$1` y `ProgressPageFragmentBase`. No duplicar esas clases aquí.
- Evidencia 27 conserva la escritura `BRItem.error=1` en `ArchiveHelper.unzipFiles()`. La coordenada grep `ArchiveHelper.smali:1741` de evidencia 70 puede corresponder a esa misma instrucción física; hasta cotejar el archivo, no contarla como segundo writer.

## 4. Próximo delta, sin repetir trabajo

Si se recuperan bloques adicionales, limitarse a:
1. `BRService.smali:14165–14185` y el contexto alrededor de 16697, incluyendo encabezado del método y destino exacto del `iput`.
2. Las instrucciones concretas en las siete coordenadas del adapter, solo si la pregunta analítica requiere resolver qué campo se lee/escribe y en qué rama. Los rangos amplios ya fueron inspeccionados; no pedir que se repitan.
3. Reconciliar `ArchiveHelper.smali:1741` con el `error=1` de evidencia 27 antes de declarar un writer distinto.

No volver a ejecutar grep global de `BRItem.state/error` solo para reproducir el inventario existente.

**Resultado:** se preservan tres coordenadas adicionales de `BRService.smali` y siete referencias de `ProgressItemAdapter` que faltaban en los addenda recientes. Permanecen como ubicaciones de grep, sin atribución de valor/condición ni elevación a evidencia Smali literal.
