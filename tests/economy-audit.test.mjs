import assert from "node:assert/strict";
import { trade, inventoryAmount } from "../src/economy.js";
import { createDecisionContext, evaluateOptions } from "../src/decision.js";

const seller = { id: "alex", name: "Alex", alive: true, money: 100, inventory: [{ type: "fish", amount: 3 }], currentActivity: "idle" };
const buyer = { id: "bruno", name: "Bruno", alive: true, money: 100, inventory: [], currentActivity: "idle" };
const simulation = { day: 4, world: { economy: { trades: [], priceMemory: {} }, cooperation: [] } };
const result = trade(simulation, seller, buyer, "fish", 1, 4);
assert.equal(result.success, true);
assert.equal(inventoryAmount(seller, "fish"), 2);
assert.equal(inventoryAmount(buyer, "fish"), 1);
assert.equal(seller.money, 104);
assert.equal(buyer.money, 96);
assert.equal(simulation.world.economy.trades.length, 1);
assert.equal(simulation.world.economy.priceMemory.fish, 4);
assert.equal(trade(simulation, seller, buyer, "fish", 10, 4).success, false);
assert.equal(seller.money, 104);
assert.equal(buyer.money, 96);
console.log("Lúmina economy audit: transferencia, dinero, precios y límites verificados.");


const decisionAgent = {
  id: "buyer",
  needs: { hunger: 20, thirst: 80, energy: 80, social: 80, safety: 80, health: 100 },
  knowledge: [],
  relationships: [],
  memories: [],
  lastAttemptedAction: null,
  lastActionName: null,
  lastActionResult: null
};
const context = createDecisionContext(decisionAgent, { nearbyResources: [], visibleAgents: [] });
const evaluatedTrade = evaluateOptions(context, [{
  name: "trade",
  baseValue: 0.1,
  effects: { hunger: 1.5 },
  distance: 1,
  tradeValue: ctx => Math.max(0, 55 - ctx.needs.hunger) * 0.04
}]);
assert.equal(evaluatedTrade[0].name, "trade");
assert.ok(evaluatedTrade[0].score > 0);
console.log("Lúmina economy audit: el comercio también entra en la valoración de decisiones.");
