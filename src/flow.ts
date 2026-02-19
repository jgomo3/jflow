export type MaybePromise<T> = T | Promise<T>;

export type ContinueTransition<S extends string, D> = {
  state: S;
  data: D;
};

export type DoneTransition<D> = {
  done: true;
  data: D;
};

export type ErrorTransition<D> = {
  error: unknown;
  data?: D;
};

export type Transition<S extends string, D> =
  | ContinueTransition<S, D>
  | DoneTransition<D>
  | ErrorTransition<D>;

export type StateHandler<D, Ctx, S extends string> = (
  data: D,
  context: Ctx
) => MaybePromise<Transition<S, D>>;

export type StateMap<D, Ctx, S extends string> = Record<S, StateHandler<D, Ctx, S>>;

export type Flow<D, Ctx, S extends string> = {
  initial: S;
  states: StateMap<D, Ctx, S>;
};

export type StateEvent<D, Ctx, S extends string> = {
  state: S;
  step: number;
  data: D;
  context: Ctx;
};

export type TransitionEvent<D, Ctx, S extends string> = {
  from: S;
  to?: S;
  done?: boolean;
  step: number;
  data: D;
  context: Ctx;
};

export type ErrorEvent<D, Ctx, S extends string> = {
  state: S;
  step: number;
  error: unknown;
  data?: D;
  context: Ctx;
};

export type RunOptions<D, Ctx, S extends string> = {
  context?: Ctx;
  maxSteps?: number;
  onState?: (event: StateEvent<D, Ctx, S>) => void;
  onTransition?: (event: TransitionEvent<D, Ctx, S>) => void;
  onError?: (event: ErrorEvent<D, Ctx, S>) => void;
};

export class FlowError extends Error {
  state?: string;
  step?: number;
  cause?: unknown;

  constructor(message: string, info?: { state?: string; step?: number; cause?: unknown }) {
    super(message);
    this.name = "FlowError";
    this.state = info?.state;
    this.step = info?.step;
    this.cause = info?.cause;
  }
}

export function createFlow<D, Ctx, S extends string>(
  config: Flow<D, Ctx, S>
): Flow<D, Ctx, S> {
  return config;
}

export function next<S extends string, D>(state: S, data: D): ContinueTransition<S, D> {
  return { state, data };
}

export function done<D>(data: D): DoneTransition<D> {
  return { done: true, data };
}

export function error<D>(err: unknown, data?: D): ErrorTransition<D> {
  return { error: err, data };
}

export async function run<D, Ctx, S extends string>(
  flow: Flow<D, Ctx, S>,
  input: D,
  options?: RunOptions<D, Ctx, S>
): Promise<D> {
  const maxSteps = options?.maxSteps ?? 10000;
  const context = options?.context as Ctx;
  let state = flow.initial;
  let data = input;

  for (let step = 0; step < maxSteps; step += 1) {
    options?.onState?.({ state, step, data, context });

    const handler = flow.states[state];
    if (!handler) {
      throw new FlowError(`Unknown state "${state}"`, { state, step });
    }

    let result: Transition<S, D>;
    try {
      result = await handler(data, context);
    } catch (err) {
      options?.onError?.({ state, step, error: err, data, context });
      throw new FlowError("State handler threw", { state, step, cause: err });
    }

    if ("error" in result) {
      options?.onError?.({
        state,
        step,
        error: result.error,
        data: result.data ?? data,
        context
      });
      throw new FlowError("Flow error", { state, step, cause: result.error });
    }

    if ("done" in result && result.done) {
      options?.onTransition?.({
        from: state,
        done: true,
        step,
        data: result.data,
        context
      });
      return result.data;
    }

    if (!("state" in result)) {
      throw new FlowError("Invalid transition", { state, step });
    }

    if (!flow.states[result.state]) {
      throw new FlowError(`Unknown state "${result.state}"`, {
        state: result.state,
        step
      });
    }

    options?.onTransition?.({
      from: state,
      to: result.state,
      step,
      data: result.data,
      context
    });

    state = result.state;
    data = result.data;
  }

  throw new FlowError(`Max steps ${maxSteps} exceeded`, { state, step: maxSteps });
}
