# jflow

Minimal flow/state-machine pipeline library for JavaScript and TypeScript.

## Install

```bash
pnpm add jflow
```

## Quickstart

```ts
import { createFlow, done, next, run } from "jflow";

type Data = { count: number };

const flow = createFlow<Data, undefined, "start" | "step" | "done">({
  initial: "start",
  states: {
    start: (data) => next("step", { count: data.count + 1 }),
    step: (data) => next("done", { count: data.count + 1 }),
    done: (data) => done(data)
  }
});

const result = await run(flow, { count: 0 });
console.log(result.count);
```

## API

### createFlow

```ts
createFlow({ initial, states })
```

- `initial`: starting state key
- `states`: map of state handlers

### run

```ts
run(flow, input, options?)
```

- `options.context`: context passed to handlers
- `options.maxSteps`: guard for infinite loops (default 10000)
- `options.onState`: called before each handler
- `options.onTransition`: called after each transition
- `options.onError`: called when a handler throws or returns `error`

### Transition helpers

```ts
next(state, data)
done(data)
error(err, data?)
```

## Demo

Order processing example:

```bash
pnpm demo
```

The demo source is in `demo/index.ts`.

## Appendix

This project is inspired by Clojure's flow project and adapts similar ideas to a minimal JS/TS API.
