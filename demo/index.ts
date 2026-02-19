import { createFlow, done, next, run } from "../src/index.js";

type Order = {
  id: string;
  items: Array<{ sku: string; qty: number }>;
  total: number;
  status: string;
  charged?: boolean;
  fulfilled?: boolean;
  notes: string[];
};

type Context = {
  now: () => Date;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const orderFlow = createFlow<Order, Context, "received" | "validated" | "charged" | "fulfilled" | "notified">({
  initial: "received",
  states: {
    received: (order) =>
      next("validated", {
        ...order,
        status: "received",
        notes: [...order.notes, "Order received"]
      }),
    validated: (order) => {
      if (order.items.length === 0 || order.total <= 0) {
        return {
          error: new Error("Invalid order"),
          data: { ...order, status: "invalid", notes: [...order.notes, "Validation failed"] }
        };
      }

      return next("charged", {
        ...order,
        status: "validated",
        notes: [...order.notes, "Order validated"]
      });
    },
    charged: async (order, ctx) => {
      await delay(100);
      return next("fulfilled", {
        ...order,
        status: "charged",
        charged: true,
        notes: [...order.notes, `Payment captured at ${ctx.now().toISOString()}`]
      });
    },
    fulfilled: async (order, ctx) => {
      await delay(100);
      return next("notified", {
        ...order,
        status: "fulfilled",
        fulfilled: true,
        notes: [...order.notes, `Order fulfilled at ${ctx.now().toISOString()}`]
      });
    },
    notified: (order) =>
      done({
        ...order,
        status: "notified",
        notes: [...order.notes, "Customer notified"]
      })
  }
});

const order: Order = {
  id: "A-1001",
  items: [
    { sku: "SKU-1", qty: 2 },
    { sku: "SKU-2", qty: 1 }
  ],
  total: 74.5,
  status: "new",
  notes: []
};

const context: Context = {
  now: () => new Date()
};

const result = await run(orderFlow, order, {
  context,
  onTransition: (event) => {
    if (event.done) {
      console.log(`Done after step ${event.step}`);
    } else {
      console.log(`Transition ${event.from} -> ${event.to}`);
    }
  }
});

console.log("Final order:", result);
