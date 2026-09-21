import assert from "node:assert/strict";
import { createOfflineQueue } from "../nexo/offline-queue.mjs";

const queue = createOfflineQueue({ clock: (() => { let i = 0; return () => "t" + (++i); })() });
queue.enqueue({ id: "web-task", tool: "search", input: { q: "Lúmina" } });
assert.equal(queue.pending().length, 1);
queue.markRunning("web-task");
assert.equal(queue.pending().length, 0);
queue.markPending("web-task", new Error("offline"));
assert.equal(queue.pending().length, 1);
queue.markRunning("web-task");
queue.markDone("web-task", { ok: true });
assert.equal(queue.pending().length, 0);
assert.equal(queue.snapshot()[0].status, "done");
console.log("nexo-offline-queue: ok");
