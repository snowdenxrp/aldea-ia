function clone(value) {
  return value == null ? value : structuredClone(value);
}

export function createOfflineQueue({ clock = () => new Date().toISOString(), maxItems = 1000 } = {}) {
  const items = [];

  const enqueue = (task) => {
    const item = {
      id: task.id || "task-" + Date.now() + "-" + (items.length + 1),
      createdAt: clock(),
      attempts: 0,
      status: "pending",
      ...clone(task)
    };
    items.push(item);
    if (items.length > maxItems) items.splice(0, items.length - maxItems);
    return clone(item);
  };

  const pending = () => items.filter(item => item.status === "pending").map(clone);

  const markRunning = (id) => {
    const item = items.find(entry => entry.id === id);
    if (!item) throw new Error("Unknown queued task: " + id);
    item.status = "running";
    item.attempts += 1;
    return clone(item);
  };

  const markDone = (id, result = null) => {
    const item = items.find(entry => entry.id === id);
    if (!item) throw new Error("Unknown queued task: " + id);
    item.status = "done";
    item.result = clone(result);
    item.completedAt = clock();
    return clone(item);
  };

  const markPending = (id, error = null) => {
    const item = items.find(entry => entry.id === id);
    if (!item) throw new Error("Unknown queued task: " + id);
    item.status = "pending";
    item.lastError = error ? String(error?.message || error) : null;
    return clone(item);
  };

  const snapshot = () => clone(items);
  const hydrate = (saved) => {
    if (!Array.isArray(saved)) throw new Error("Invalid offline queue");
    items.length = 0;
    items.push(...clone(saved));
    return snapshot();
  };

  return Object.freeze({ enqueue, pending, markRunning, markDone, markPending, snapshot, hydrate });
}
