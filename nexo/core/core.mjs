import { createEvent, createResult, createState } from "./contracts.mjs";

export class NexoCore {
  #state;
  #events;

  constructor(options = {}) {
    this.#state = createState(options);
    this.#events = [];
  }

  getState() {
    return structuredClone(this.#state);
  }

  getEvents() {
    return this.#events.map((event) => structuredClone(event));
  }

  setMode(mode) {
    const previous = this.#state.mode;
    this.#state = { ...this.#state, mode };
    this.#record(createEvent({
      type: "MODE_CHANGED",
      payload: { previous, mode },
    }));
    return this.getState();
  }

  setAvailability(availability) {
    this.#state = { ...this.#state, availability };
    this.#record(createEvent({
      type: "AVAILABILITY_CHANGED",
      payload: { availability },
    }));
    return this.getState();
  }

  startTask(task) {
    if (this.#state.currentTask) {
      throw new Error("Nexo Core already has an active task");
    }
    this.#state = { ...this.#state, currentTask: task };
    this.#record(createEvent({
      type: "TASK_STARTED",
      payload: { taskId: task.id, title: task.title },
    }));
    return this.getState();
  }

  finishTask(result) {
    if (!this.#state.currentTask) {
      throw new Error("Nexo Core has no active task");
    }
    const task = this.#state.currentTask;
    if (result.taskId !== task.id) {
      throw new Error("Result does not belong to the active task");
    }
    this.#state = { ...this.#state, currentTask: null };
    this.#record(createEvent({
      type: "TASK_FINISHED",
      payload: { taskId: task.id, status: result.status },
    }));
    return createResult(result);
  }

  #record(event) {
    this.#events.push(event);
  }
}
