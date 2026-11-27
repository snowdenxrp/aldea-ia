# NCS M0 — Inventario de recuperación del árbol local Termux
Fecha de captura: 2026-11-27 07:20:50 -06:00
Repositorio local declarado: `/data/data/com.termux/files/home/aldea-ia`
Rama local: `main`
HEAD local: `1834182a2eaf4b1bfe59f9802ce3e49fc89b2ca7`
Referencia remota mostrada por Git: `origin/main` en el mismo HEAD.
Remoto configurado: `git@github.com:snowdenxrp/aldea-ia.git`

## 1. Propósito y alcance
Registro documental de la salida de inventario entregada por el propietario el 2026-11-27. La captura fue de lectura solamente. No se ejecutaron pruebas, launcher, CI, ni comandos de restauración, limpieza, checkout o modificación.

Este expediente registra el estado observado; no certifica que los cambios sean correctos, seguros, relacionados con NCS, ni que estén respaldados remotamente.

## 2. Estado Git observado
`git status --short --branch` reportó `## main...origin/main`.

Ocho archivos rastreados modificados:
- `src/exploration.js`
- `src/main-stable.js`
- `src/movement.js`
- `src/simulation.js`
- `tests/settlement-state-audit.test.mjs`
- `tests/village-visual-audit.test.mjs`
- `tests/visual-detail-audit.test.mjs`
- `tests/visual-role-accessories-audit.test.mjs`

Resumen de `git diff --stat`: 8 archivos cambiados, 297 inserciones y 29 eliminaciones.
`git diff --check`: no produjo salida (sin errores de whitespace detectados por ese comando).

## 3. Archivos no rastreados observados
- `how-ref | grep -E 'ncs-lumina|ncs-clean-architecture|719ba206|b8353435'`
- `lumina-test.log`
- `src/movement.js.bak-target`
- `src/needs.js.bak-survival-final`
- `src/simulation.js.bak-discovery-priority`
- `src/simulation.js.bak-emergency-rest`
- `src/simulation.js.bak-emergency-rest-v2`
- `src/simulation.js.bak-emergency-rest-v3`
- `src/simulation.js.bak-energy`
- `src/simulation.js.bak-food-priority`
- `src/simulation.js.bak-rest-loop`
- `src/simulation.js.bak-rest-movement`
- `src/simulation.js.bak-survival-cycle-v2`
- `src/simulation.js.bak-survival-cycle-v3`
- `src/simulation.js.bak-survival-cycle-v3b`
- `src/simulation.js.bak-survival-final`
- `src/simulation.js.bak-survival-hysteresis`
- `src/simulation.js.bak-survival-priority`
- `src/spatial.js.bak`
- `te esa referencia remota en la copia local"`

El inventario de `find src -maxdepth 1 -type f -name '*.bak*'` reportó 17 respaldos `.bak*`. El comando más estrecho `find . -type f -name '*.bak' -print` había mostrado solamente `src/spatial.js.bak`; no es contradicción: los demás tienen sufijos adicionales.

## 4. SHA-256 de los ocho archivos modificados
Los siguientes hashes fueron calculados sobre los archivos locales en el momento de la captura:
- `src/exploration.js`: `9abf2ddcdd762d1d0d05966e20859a967c53a22dc3184f39dffbddcda200833b`
- `src/main-stable.js`: `bb0ba94fb3830bb3f91112d4df02974198074af3a6e159dc138462daae9d0775`
- `src/movement.js`: `38a67d0b5da3ab830e6ea7b46f6984dcea6b195bce53b08463bbb3c8e4da5d14`
- `src/simulation.js`: `c958804bb98e558e00c66f63130abe4893db19ba893c277cc4adfe987bdb65f3`
- `tests/settlement-state-audit.test.mjs`: `f74b887285441ac35f634dc48d572138e4ec308e96e8955415b4e30033968f7f`
- `tests/village-visual-audit.test.mjs`: `938dc2fe9630df600604ce1f964e37281e687c01ae89ecc5b29a852b4be83a88`
- `tests/visual-detail-audit.test.mjs`: `418fa2aab4289c353b91beda3734545e1128364a166a27c82b2df0e2ea2ab220`
- `tests/visual-role-accessories-audit.test.mjs`: `8c9d03b2d8159bff569e4f9abf2848c52a39768cfa753dbce3a838a46f076a38`

## 5. Últimos commits observados
- `1834182a` — `fix: encode visual audit metadata safely`
- `f85b671c` — `docs: document automatic GitHub visual audit capture`
- `2fa2dfd1` — `feat: add secure GitHub visual audit receiver`
- `d4bb1f37` — `feat: configure visual audit capture endpoint`
- `f4249c6b` — `feat: auto-upload visual audits to GitHub inbox`

## 6. Evaluación provisional y límites
- Los cambios locales y respaldos siguen presentes en la captura; por tanto, no se debe asumir que el árbol de trabajo fue borrado.
- La salida no revela el contenido semántico de los diffs ni el contenido de los respaldos o del log.
- Los nombres anómalos parecen contener fragmentos de comandos/salida, pero su origen no está probado.
- La relación de estos cambios con NCS M0 no está establecida.
- El hecho de que Git muestre `main...origin/main` y ambos nombres apunten al mismo HEAD no significa que los cambios locales estén respaldados en GitHub.
- Los hashes documentan la identidad de los ocho archivos modificados en el instante de la captura; no autentican su origen ni su validez.

## 7. Preservación y siguiente paso
No borrar, renombrar, restaurar, añadir al índice, ejecutar ni probar estos archivos todavía. El siguiente trabajo autorizado es inspección documental de solo lectura: revisar los diffs por archivo, identificar procedencia y dependencias, inventariar contenido y hashes de los `.bak*` y `lumina-test.log`, e investigar los dos nombres anómalos sin ejecutarlos. Separar explícitamente cualquier hallazgo de Lúmina del expediente NCS.

Estado NCS M0: sin cambio. Este inventario no cierra ningún gate, no constituye PASS, no cambia `authorization: NOT_EVALUATED`, y no modifica el estado UNKNOWN/STOP aplicable.
