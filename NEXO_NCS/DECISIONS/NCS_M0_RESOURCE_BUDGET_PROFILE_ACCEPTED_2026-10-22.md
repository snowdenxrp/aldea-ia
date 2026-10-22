# NCS M0 — aceptación del perfil numérico de presupuesto de recursos
Fecha: 2026-10-22
Estado: **ACEPTADO POR EL PROPIETARIO COMO BASE DE IMPLEMENTACIÓN; VALIDACIÓN E IMPLEMENTACIÓN PENDIENTES**

## Decisión registrada

El propietario acepta el perfil numérico de `NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md` como base para implementar el presupuesto de recursos de la instancia local de Nexo bajo Opción A.

Se aceptan estos máximos candidatos como topes operativos iniciales, sujetos a pruebas de frontera y ajuste explícito si los resultados demuestran que son inadecuados:

| Recurso | Límite aceptado como base |
|---|---:|
| Contenido crudo leído desde `--content-stdin` | 256 KiB |
| Contenido UTF-8 de una entrada Chronicle | 256 KiB |
| Entradas Chronicle después del append | 10.000 |
| Documento Chronicle serializado | 32 MiB |
| Colección `missions` en Continuity | 10.000 elementos |
| Colección `attempts` en Continuity | 20.000 elementos |
| Colección `doNotRepeat` en Continuity | 20.000 elementos |
| Colección `executions` en Continuity | 10.000 elementos |
| Colección `effectJournal` en Continuity | 20.000 elementos |
| Envelope/snapshot Continuity serializado | 16 MiB |

KiB/MiB usan base binaria. Los límites son inclusivos; texto medido por bytes UTF-8. Se rechaza el exceso sin truncamiento ni eliminación automática del historial.

## Límites de la aceptación

- Esta decisión acepta el perfil numérico como base de implementación; **no** declara que la implementación exista ni que las pruebas hayan pasado.
- El requisito de lectura acotada aplica tanto al documento existente como al candidato de escritura: no basta con `stat` ni con leer todo el archivo a un Buffer y medir después.
- Los límites de bytes deben verificarse antes de parsear o materializar el documento completo. La admisión y el commit deben comprobar cardinalidad/tamaño bajo la misma exclusión mutua que protege la escritura.
- Rechazos previos a escritura deben preservar bytes y revisión; no deben crear directorios/locks evitables.
- No se acepta un presupuesto agregado de disco/heap ni se declara seguro el uso agregado. Esa cuestión permanece OPEN antes de servicio concurrente/multiusuario.
- No se aprueban Constitución completa, autoridad raíz, commissioning ni efectos protegidos.

## Estado posterior a la decisión

Perfil numérico: **ACEPTADO COMO BASE**. Implementación: **PENDING**. Validación de fronteras: **PENDING**. M0: **INCOMPLETO**. Autorización: `NOT_EVALUATED`. Raíz legítima: `PENDING/UNKNOWN`. Efectos protegidos: `STOP`.
