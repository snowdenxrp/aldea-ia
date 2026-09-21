import assert from "node:assert/strict";
import { getVillageLayout } from "../src/village-layout.js";

const layout=getVillageLayout();
assert.ok(layout.river && Number.isFinite(layout.river.centerX),"el río debe tener un eje X definido");
assert.ok(layout.river.width >= 8,"el cauce debe tener anchura suficiente para lectura visual");
assert.ok(layout.bridge && layout.bridge.lengthX >= layout.river.width + 2,"el puente debe cruzar todo el ancho del río con margen");
assert.ok(layout.bridge.widthZ >= 3.4,"el puente debe tener una plataforma legible");
assert.ok(Math.abs(layout.bridge.x-layout.river.centerX) < 0.01,"el puente debe centrarse sobre el río");
assert.ok(layout.paths.some(p=>p.name==="bridge-west") && layout.paths.some(p=>p.name==="bridge-east"),"el puente debe tener accesos en ambas orillas");
assert.ok(layout.buildings.filter(b=>b.type==="house").length >= 10,"la aldea necesita densidad residencial reconocible");
assert.ok(layout.paths.length >= 7,"la aldea necesita una red de caminos conectada");
assert.ok(layout.trees.length >= 12,"la aldea necesita vegetación distribuida");
assert.ok(layout.plaza && layout.well && layout.market,"la aldea debe tener un centro reconocible");
console.log(JSON.stringify({audit:"lumina-village-visual-geometry",river:layout.river,bridge:layout.bridge,buildings:layout.buildings.length,paths:layout.paths.length,trees:layout.trees.length,verdict:"PASS"},null,2));
