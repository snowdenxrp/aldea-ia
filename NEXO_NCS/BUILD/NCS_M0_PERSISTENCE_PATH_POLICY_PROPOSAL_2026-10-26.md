# NCS M0 — Propuesta de política para rutas de persistencia (2026-10-26)

Estado: propuesta de diseño para cerrar decisiones; no ratificada y no autoriza implementación.

## Propósito

Convertir las decisiones abiertas de la matriz de rutas en reglas comprobables. Esta propuesta no afirma que sea la única política válida ni que el fallo CI ya esté explicado.

## Base de evidencia

- Rama de trabajo consultada: `ncs-clean-architecture`.
- Matriz existente: [NCS_M0_PERSISTENCE_PATH_CONTRACT_DECISION_MATRIX_2026-10-26.md](NCS_M0_PERSISTENCE_PATH_CONTRACT_DECISION_MATRIX_2026-10-26.md).
- Inventario existente: [NCS_M0_PERSISTENCE_CALLER_BOUNDARY_INVENTORY_2026-10-26.md](NCS_M0_PERSISTENCE_CALLER_BOUNDARY_INVENTORY_2026-10-26.md).
- Fallo CI observado: run `40270739196`, resultado `RECONCILE_REQUIRED` frente a `SAFE_COMMIT`. La excepción primaria sigue UNKNOWN.

## Política candidata para evaluación

### P1. Tipos aceptados en la frontera de persistencia

- Aceptar una cadena de ruta nativa o un objeto `URL` con protocolo `file:`.
- Rechazar explícitamente valores vacíos, tipos inesperados, URL con otro esquema y URL malformadas antes de adquirir locks o tocar el archivo de estado.
- Para URL `file:`, usar conversión de URL a ruta nativa (`fileURLToPath()`), no leer `.pathname` manualmente.
- No ampliar automáticamente el contrato del adaptador de commit condicional: este puede seguir exigiendo cadena, con decisión separada si se quiere cambiar esa API.

### P2. Rutas relativas

**Candidata conservadora:** rechazar cadenas relativas en la frontera canónica de persistencia. Exigir ruta nativa absoluta o URL `file:`.

Motivo: evitar que el resultado dependa implícitamente del directorio de trabajo del proceso. Si se decide aceptar rutas relativas, su base (por ejemplo, `process.cwd()`) deberá quedar escrita en el contrato y cubierta por pruebas; no debe quedar implícita.

### P3. Una única ruta para todas las operaciones

Normalizar una vez por llamada y reutilizar exactamente la ruta nativa resultante para:
- lectura del estado actual y revisión;
- nombre/ubicación del lock y su liberación;
- búsqueda y limpieza de temporales obsoletos;
- archivo temporal nuevo;
- escritura y rename al destino;
- limpieza tras error.

Los temporales deben ubicarse en el mismo directorio del destino para no cruzar volúmenes durante el rename. El lock debe derivarse del mismo destino normalizado. Ningún paso posterior debe volver a interpretar el valor original de entrada.

### P4. Espacios y caracteres codificados

- Las cadenas nativas conservan su semántica nativa; no aplicar decodificación URL a cadenas.
- Las URL `file:` se convierten con la utilidad estándar del runtime para respetar espacios y escapes.
- Una URL `file:` y la ruta nativa equivalente deben apuntar al mismo destino en pruebas, incluyendo espacios y caracteres no ASCII.
- En Windows, las URL con host remoto/UNC requieren casos de prueba específicos; no asumir equivalencia POSIX/Windows por inspección textual.

### P5. Enlaces simbólicos y alias de ruta

**No cerrar esta decisión solo con `path.resolve()`:** eso normaliza segmentos, pero no resuelve enlaces simbólicos.

Candidata para el primer alcance:
- exigir que el directorio padre del destino exista;
- obtener una representación canónica del directorio padre con `realpath()` y combinarla con el nombre base del archivo;
- si el archivo destino ya existe y es un enlace simbólico, decidir explícitamente si se rechaza o si se resuelve al destino real antes de crear el lock;
- evitar que dos alias conocidos del mismo archivo creen locks independientes.

Esta política necesita pruebas y una decisión explícita sobre enlaces simbólicos al archivo final. La canonicalización no elimina por sí sola las carreras TOCTOU frente a cambios concurrentes del sistema de archivos; no debe presentarse como una garantía criptográfica ni como aislamiento completo contra procesos hostiles.

### P6. Errores y estado del commit

- Un fallo de write o rename nunca equivale a commit confirmado.
- Un error de conflicto de revisión debe conservar su clasificación específica.
- Si falla la limpieza después de un error primario, el error primario debe seguir disponible; el fallo de limpieza puede adjuntarse como información secundaria, sin reemplazarlo silenciosamente.
- Si no se puede determinar si el destino quedó reemplazado, devolver un resultado indeterminado y exigir reconciliación; no inferir `SAFE_COMMIT`.
- No eliminar temporales de otros escritores sin una regla de propiedad/lock demostrable y sin verificar que pertenecen al destino normalizado.

### P7. Plataformas y límites

- Usar `node:path` y `node:url` para la plataforma activa, sin concatenar manualmente separadores.
- Documentar y probar las plataformas soportadas en CI. No declarar portabilidad Windows/POSIX hasta ejecutar la matriz correspondiente.
- No asumir que dos cadenas con aspecto parecido representan el mismo archivo; las pruebas deben comparar el destino observado mediante operaciones reales del sistema de archivos.

## Pruebas de aceptación propuestas (no ejecutadas)

1. Cadena absoluta POSIX y URL `file:` equivalente apuntan al mismo archivo.
2. Rutas con espacios, acentos y caracteres codificados.
3. Cadena relativa rechazada antes de tocar estado (si se ratifica P2).
4. URL con esquema distinto de `file:` rechazada antes de tocar estado.
5. Tipo inesperado, cadena vacía y URL inválida rechazados.
6. Directorio padre inexistente y destino con permisos insuficientes fallan sin confirmar commit.
7. Dos destinos concurrentes usan locks/temporales separados; dos alias del mismo destino no permiten doble escritor inadvertido.
8. Conflicto de revisión no sobrescribe la revisión actual.
9. Fallo inyectado en escritura, rename y cleanup preserva el estado de commit y el error primario.
10. Fallo tras crear temporal no deja temporal huérfano sin diagnóstico.
11. Reinicio solo lee un snapshot íntegro y confirmado.
12. Casos específicos de Windows/UNC si esa plataforma está dentro del soporte declarado.

## Decisiones que siguen requiriendo ratificación

- A/B/C del contrato general; esta propuesta se alinea provisionalmente con la compatibilidad de B, pero no la adopta.
- Si las rutas relativas se rechazan o se resuelven desde una base declarada.
- Si se rechazan o resuelven enlaces simbólicos en el destino final.
- Plataformas soportadas.
- Forma exacta de conservar y exponer errores secundarios de cleanup.

## Estado de ejecución

Solo documentación. No se modificaron runtime, pruebas ni workflows. No se ejecutaron pruebas ni CI. Ninguna opción se considera ratificada. M0 INCOMPLETO; D1-IMPLEMENTATION NO AUTORIZADA; authorization NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
