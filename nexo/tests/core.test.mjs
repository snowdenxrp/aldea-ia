import assert from "node:assert/strict";
import { NexoCore } from "../core/core.mjs";
import { createTask } from "../core/contracts.mjs";

const core = new NexoCore();
assert.equal(core.getState().mode, "normal");
assert.equal(core.getState().currentTask, null);

core.setAvailability("offline");
assert.equal(core.getState().availability, "offline");
assert.equal(core.getEvents().at(-1).type, "AVAILABILITY_CHANGED");

const task = createTask({ title: "foundation audit" });
core.startTask(task);
assert.equal(core.getState().currentTask.id, task.id);
assert.throws(() => core.startTask(task), /already has an active task/);

const result = core.finishTask({ taskId: task.id, status: "success", value: "verified" });
assert.equal(result.status, "success");
assert.equal(core.getState().currentTask, null);
assert.equal(core.getEvents().at(-1).type, "TASK_FINISHED");

assert.throws(() => core.finishTask({ taskId: task.id }), /no active task/);

console.log("Nexo Core contract audit: PASS");
