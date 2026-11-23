# Evidencia 126 — BRService$5: selección de estado previo a preload y escrituras condicionadas

**Fecha:** 2026-11-22  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`. Fragmentos copiados por el usuario desde Termux; no verificación independiente ni ejecución dinámica.

## Ventanas recibidas

- `BRService$5.smali`: líneas físicas 1125–1170, 1235–1300 y 1310–1460.
- El tercer bloque contiene tramos con formato/espaciado dañado; se limita el análisis a instrucciones y etiquetas que pueden leerse sin reconstrucción especulativa.

## Hallazgos confirmados

### 1. Writer físico 1151: `state = v14`

En la ruta mostrada, se obtiene el nombre de `BRItem.bakFilePath`, se llama a `TransFileServiceUtils.findBakInCachePath(name)` y, si el resultado no es nulo, se ejecuta `iput v14, BRItem.state`.

**Valor de v14 no resuelto:** la ventana comienza después de posibles definiciones previas y no muestra la última asignación a ese registro. No se infiere un número ni significado.

### 2. Writer físico 1259: selección condicional del estado

Para `packageName == "files_for_backup"`, se carga el estado actual de BRItem en `v0`; para cualquier otro paquete se carga `const/4 v0, 0x4`. En ambos casos se escribe `v0` en `BRItem.state`.

Por tanto:
- `files_for_backup`: conserva el estado que tenía el objeto inmediatamente antes de esta escritura.
- Otros paquetes: reciben explícitamente `state=4`.

Después se llama a `notifyItemTaskPreload(packageName, feature)`.

### 3. Writers físicos 1283 y 1336: estado/error desde registros aún no resueltos

En la rama `AppUtils.isPadDisableApps(packageName)`, se escribe `state=v10` y `error=v3`; después se llama a `notifyItemTaskError(..., v3)`.

En la rama de elemento de sistema cuyo paquete no existe según `Utils.isPkgExist(packageManager, packageName)`, se vuelve a escribir `state=v10,error=v3`, se notifica el error y luego se llama a `notifyItemTaskEnd`.

Los valores concretos de `v10` y `v3` no aparecen definidos en las ventanas recibidas. No se deben etiquetar como estado fallido/error específico hasta rastrear sus definiciones dominantes.

### 4. Writer físico 1441: estado/error y ausencia de GMS

En la rama donde `mIsGMSInstalled` es falso y `Customization.isGMSAPP(packageName)` es verdadero, se escribe `state=v10` y explícitamente `error=13); luego se notifica el fin del ítem.

El valor de `v10` sigue sin resolverse. La condición y el error 13 sí están visibles en el fragmento.

## Dedupe con evidencia previa

Las coordenadas 1151, 1259, 1283, 1336 y 1441 ya figuraban en el inventario grep previo. Esta evidencia añade el contexto de ramas y operandos visibles; no declara writers nuevos ni duplica las coordenadas como descubrimientos independientes. El contexto de 1544 y 1557–1589 ya se documentó en evidencia 124, por lo que aquí no se vuelve a registrar.

## Pendientes concretos

1. Obtener el inicio del método y rastrear la última definición de `v14` que alcanza el writer físico 1151.
2. Rastrear las definiciones de `v10` y `v3` que alcanzan los writers físicos 1283, 1336 y 1441.
3. Confirmar el nombre del método y el flujo completo alrededor de los writers, con ventanas sin corrupción de formato.
4. No extrapolar `state=4` fuera de la rama de paquete distinto de `files_for_backup`.

No se ejecutó ninguna operación de Backup/Restore ni prueba dinámica.
