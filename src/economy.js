// Economía emergente: los habitantes pueden transferir bienes por dinero o cooperación.
// El motor decide cuándo tiene sentido intercambiar; este módulo solo aplica consecuencias reales.

export const DEFAULT_PRICES = Object.freeze({
  fish: 4,
  farm_food: 3,
  wood: 2,
  stone: 2,
  tool: 12
});

export function inventoryAmount(agent, type) {
  return (agent.inventory ?? []).reduce((sum, item) => item.type === type ? sum + (Number(item.amount) || 0) : sum, 0);
}

function removeInventory(agent, type, amount) {
  let remaining = amount;
  for (const item of agent.inventory ?? []) {
    if (item.type !== type || remaining <= 0) continue;
    const used = Math.min(Number(item.amount) || 0, remaining);
    item.amount -= used;
    remaining -= used;
  }
  agent.inventory = (agent.inventory ?? []).filter(item => (Number(item.amount) || 0) > 0);
  return amount - remaining;
}

function addInventory(agent, type, amount) {
  if (amount <= 0) return;
  const stack = (agent.inventory ?? []).find(item => item.type === type);
  if (stack) stack.amount += amount;
  else agent.inventory.push({ type, amount });
}

export function trade(simulation, seller, buyer, offerType, amount, price = DEFAULT_PRICES[offerType] ?? 1) {
  const quantity = Math.max(0, Number(amount) || 0);
  const unitPrice = Math.max(0.01, Number(price) || 1);
  const total = quantity * unitPrice;
  if (!buyer || buyer.id === seller.id) return { success: false, reason: "invalid_partner" };
  if (inventoryAmount(seller, offerType) < quantity) return { success: false, reason: "seller_lacks_goods" };
  if (Number(buyer.money ?? 0) < total) return { success: false, reason: "buyer_lacks_money" };

  removeInventory(seller, offerType, quantity);
  addInventory(buyer, offerType, quantity);
  seller.money = Number(seller.money ?? 0) + total;
  buyer.money = Number(buyer.money ?? 0) - total;
  seller.currentActivity = "trading";
  buyer.currentActivity = "trading";

  simulation.world.economy ??= { trades: [], priceMemory: {} };
  simulation.world.economy.trades ??= [];
  simulation.world.economy.priceMemory ??= {};
  simulation.world.economy.priceMemory[offerType] = unitPrice;
  simulation.world.economy.trades.push({ day: simulation.day, sellerId: seller.id, buyerId: buyer.id, type: offerType, amount: quantity, unitPrice, total });
  if (simulation.world.economy.trades.length > 5000) simulation.world.economy.trades = simulation.world.economy.trades.slice(-5000);
  return { success: true, effect: "trade_completed", type: offerType, amount: quantity, unitPrice, total };
}

export function recordCooperation(simulation, a, b, type = "cooperation") {
  simulation.world.cooperation ??= [];
  const event = { day: simulation.day, type, participants: [a.id, b.id] };
  simulation.world.cooperation.push(event);
  if (simulation.world.cooperation.length > 5000) simulation.world.cooperation = simulation.world.cooperation.slice(-5000);
  return event;
}
