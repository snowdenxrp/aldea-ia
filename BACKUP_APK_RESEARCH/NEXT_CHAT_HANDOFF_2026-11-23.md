# Handoff de continuidad — MIUI Backup.apk — 2026-11-23

## Fuente de verdad

- Repositorio: `snowdenxrp/aldea-ia`
- Rama: `backup-apk-static-research-2026-11-19`
- Índice maestro: `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`
- Versión del índice: **1.25**
- Último HEAD antes de crear este handoff: `e92946f3dd6f394d92761a36a46048cdc35849bd` (índice de evidencia 127)
- Evidencia nueva: `evidence/2026-11-23/127_FAKEBACKUPLISTENER_ONBACKUPEND_STATE_REGISTER_RESOLUTION.md`
- Evidencias relacionadas: 123 (callbacks de ProgressItemAdapter), 124 (writers de callbacks), 126 (writers BRService$5).

## Delta guardado en esta sesión

Se recuperaron en el chat los bloques históricos de Termux para `BRService$FakeBackupListenerImp.smali`:
- 1100–1165
- 1160–1225
- 1220–1290

**Corrección esencial:** en `onBackupEnd(String,int)`, antes del writer físico 1273 aparece `const/4 v3, 0x1`. Las ventanas intermedias no muestran redefinición de `v3`; por tanto `iput v3, v0, BRItem.state` escribe **`state=1`**. Esto corrige evidencia 124, que había dejado `v3` sin resolver por no disponer de la ventana previa.

También se recuperó un grep global de `BRItem.state`, pero mezcla lecturas `iget` y escrituras `iput`; no es un inventario exclusivo de writers. Las escrituras de `ProgressPageFragmentBase$ProgressItemAdapter.smali` ya están preservadas en evidencia 123 y no se duplicaron.

## Comando fallido que no debe confundirse con una extracción

El usuario intentó asignar `F` con una línea malformada similar a:

```bash
="$D/com/miui/backup/service/BRService$5.smali"
```

Bash respondió que no existía el comando/ruta. El `grep` posterior usó el valor anterior de `F`, que apuntaba a `ProgressPageFragmentBase$ProgressItemAdapter.smali`. Por ello **no se obtuvo una extracción de BRService$5** mediante ese comando. No afirmar que sus métodos se inspeccionaron por ese intento ni repetirlo sin una necesidad concreta.

## Continuidad inmediata

El usuario está reconstruyendo el orden de una conversación anterior y compartiendo sus bloques de salida. Continuar recibiendo el siguiente fragmento histórico en el orden original. Por ahora:
- no adelantar comandos ni nuevas extracciones;
- no repetir los bloques ya recuperados;
- distinguir hallazgos previos de deltas nuevos;
- no duplicar evidencia 123 ni reabrir los writers ya cubiertos por 124/126;
- cotejar el índice y las evidencias antes de guardar cualquier otro delta;
- conservar clasificación `USER-PROVIDED / RECOVERED-CHAT-TERMUX-OUTPUT` cuando la fuente sea una salida histórica pegada en el chat, no `LOCAL-VERIFIED`;
- no atribuir semántica global a los números de `BRItem.state` solo por sus valores.

## Estado de verificación

Evidencia 127 e índice maestro fueron escritos en la rama indicada. Este handoff se añade como documento de continuidad independiente; después de crearlo, verificar el HEAD y volver a leer los tres archivos (evidencia 127, índice y handoff) antes de declarar la preservación completa.
