# NCS M0 — Matriz de decisión del contrato de rutas de persistencia

Estado: propuesta documental no ratificada. No cambia runtime ni autoriza implementación.

## Anclaje
- Rama: `ncs-clean-architecture`
- HEAD previo: `5cd257aa1f1f7c0934c64a9fb0affc69cbf2b6ad`
- Informe de evidencia: [contrato de rutas y fallo CI](NCS_M0_PERSISTENCE_PATH_CONTRACT_AND_CI_FAILURE_2026-10-26.md)
- Run existente: [GitHub Actions 40270739196](https://github.com/snowdenxrp/aldea-ia/actions/runs/40270739196)

## Problema observado
Las fuentes inspeccionadas usan cadenas y URL `file:` como representaciones de `statePath`. `scripts/simulate.mjs` deriva lock y temporales usando `.pathname`; una cadena no tiene esa propiedad y el `.pathname` de una URL puede contener codificación URL, no una ruta nativa equivalente. La incompatibilidad de cadena es un defecto estático; la causa original del fallo CI sigue UNKNOWN.

## Alternativas

| Opción | Contrato | Ventaja | Coste |
|---|---|---|---|
| A — Solo cadena nativa | Todos los callers convierten URL antes de invocar. | API interna simple. | Exige adaptar los callers directos que hoy usan URL. |
| B — Unión explícita en persistencia | `persistState()` acepta cadena o URL `file:`, normaliza una vez a ruta nativa absoluta; el adaptador de commit sigue string-only salvo decisión separada. | Compatible con las dos formas observadas en callers. | Hay que definir rutas relativas, URL inválidas, enlaces simbólicos y portabilidad. |
| C — URL interna | Todos los callers usan URL `file:` y las conversiones son explícitas. | Consistencia en callers URL. | No encaja directamente con el adaptador string-only y amplía la revisión de fronteras. |

## Recomendación provisional
Evaluar primero la opción B como vía de compatibilidad mínima, sin adoptarla automáticamente. La implementación futura debería validar el tipo en cada frontera, convertir URL solo con esquema `file:` mediante `fileURLToPath()`, definir explícitamente la política de rutas relativas, y reutilizar una sola ruta nativa absoluta para lectura, revisión, lock, limpieza, temporal, escritura, rename y liberación. Los temporales deben estar en el directorio destino. Errores de persistencia no pueden convertirse en confirmación de commit y el código original debe conservarse durante reconciliación.

## Decisiones abiertas
- No se ha seleccionado A, B ni C.
- Política de rutas relativas.
- Resolución de enlaces simbólicos.
- Propagación de errores de limpieza y preservación del error primario.
- Contrato multiplataforma para caracteres codificados, Windows/POSIX y volúmenes.

## Matriz mínima de aceptación futura
- Cadena absoluta: lectura, lock, temporal y destino refieren al mismo archivo.
- URL `file:` admitida: mismo archivo que su ruta equivalente, incluidos espacios y caracteres codificados.
- URL no `file:`: rechazo antes de tocar el estado.
- Ruta relativa: resultado definido por política ratificada.
- Dos destinos: locks y temporales aislados.
- Revisión obsoleta: conflicto sin sobrescritura.
- Fallo de write/rename: nunca declarar commit confirmado por defecto; reconciliar incertidumbre.
- Fallo de limpieza: no ocultar el error primario ni afirmar éxito.
- Reinicio: solo cargar snapshot confirmado.

Pruebas y CI no ejecutados. Runtime/tests/workflows no modificados. M0 INCOMPLETO; implementación NO AUTORIZADA; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP; bootstrap A/B/C/D sin seleccionar.
