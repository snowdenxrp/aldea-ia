import assert from "node:assert/strict";
import { getVillageLayout } from "../src/village-layout.js";

const layout=getVillageLayout();
assert.ok(layout.river && Number.isFinite(layout.river.centerX),"el río debe tener un eje X definido");
assert.ok(layout.river.width >= 8,"el cauce debe tener anchura suficiente para lectura visual");
assert.ok(layout.bridge && layout.bridge.lengthX >= layout.river.width + 1,"el puente debe cruzar todo el ancho del río");
assert.ok(Math.abs(layout.bridge.x-layout.river.centerX) < 0.01,"el puente debe centrarse sobre el río");
assert.ok(layout.paths.some(p=>p.name==="bridge-west") && layout.paths.some(p=>p.name==="bridge-east"),"el puente debe tener accesos en ambas orillas");
assert.ok(layout.buildings.filter(b=>b.type==="house").length >= 6,"la aldea necesita viviendas reconocibles");
assert.ok(layout.plaza && layout.well && layout.market,"la aldea debe tener un centro reconocible");
console.log(JSON.stringify({audit:"lumina-village-visual-geometry",river:layout.river,bridge:layout.bridge,buildings:layout.buildings.length,verdict:"PASS"},null,2));
