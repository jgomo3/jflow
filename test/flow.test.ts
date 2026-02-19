import { describe, expect, it } from "vitest";
import { FlowError, createFlow, done, next, run } from "../src/index.js";

type Data = { value: number };

describe("flow", () => {
  it("runs a sync flow to completion", async () => {
    const flow = createFlow<Data, undefined, "start" | "done">({
      initial: "start",
      states: {
        start: (data) => next("done", { value: data.value + 1 }),
        done: (data) => done(data)
      }
    });

    const result = await run(flow, { value: 1 });
    expect(result.value).toBe(2);
  });

  it("runs an async flow", async () => {
    const flow = createFlow<Data, undefined, "start" | "wait" | "done">({
      initial: "start",
      states: {
        start: (data) => next("wait", { value: data.value + 1 }),
        wait: async (data) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return next("done", { value: data.value + 1 });
        },
        done: (data) => done(data)
      }
    });

    const result = await run(flow, { value: 1 });
    expect(result.value).toBe(3);
  });

  it("throws FlowError for unknown state", async () => {
    const flow = createFlow<Data, undefined, "start">({
      initial: "start",
      states: {
        start: (data) => ({ state: "missing" as "start", data })
      }
    });

    await expect(run(flow, { value: 1 })).rejects.toBeInstanceOf(FlowError);
  });

  it("stops after max steps", async () => {
    const flow = createFlow<Data, undefined, "loop">({
      initial: "loop",
      states: {
        loop: (data) => next("loop", data)
      }
    });

    await expect(run(flow, { value: 1 }, { maxSteps: 3 })).rejects.toBeInstanceOf(FlowError);
  });
});
