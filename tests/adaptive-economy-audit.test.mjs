import assert from "node:assert/strict";
import { createAgent } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { normalizeEconomyWorld, advanceEconomyDay, getDynamicPrice } from "../src/economy.js";

const world = { day: 20, timeOfDay: 8, resources: {} };
const seller = createAgent({ id: "seller", name: "Vendedora", age: 30 });
seller.inventory = [{ type: "fish", amount: 1 }, { type: "wood", amount: 20 }];
const buyer = createAgent({ id: "buyer", name: "Comprador", age: 30 });
buyer.inventory = [{ type: "wood", amount: 1 }];
const sim = createSimulation(world, [seller, buyer], { random: () => 0.5 });
normalizeEconomyWorld(world);
const before = getDynamicPrice(world, "fish");
advanceEconomyDay(sim);
const after = getDynamicPrice(world, "fish");
assert.ok(after > 0 && Number.isFinite(after));
assert.ok(after >= before * 0.95, "la escasez no debe hundir bruscamente el precio");
assert.equal(world.economy.priceHistory.length, 5);
console.log("Adaptive economy audit OK");
