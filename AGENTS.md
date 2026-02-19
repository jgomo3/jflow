# AGENTS

This document orients agentic coders to this repository. Follow existing conventions
and keep changes minimal and focused.

## Project Snapshot
- Name: jflow
- Purpose: minimal flow/state-machine pipeline library for JS/TS
- Module system: ESM (`"type": "module"`)
- Language: TypeScript (strict)
- Build output: `dist/`

## Repo Layout
- `src/`: library source
- `demo/`: runnable example
- `dist/`: build output (generated)
- `README.md`: public API and usage

## Build / Lint / Test
There is no lint script or config in this repo.

Install deps (pnpm is assumed):
```bash
pnpm install
```

Build:
```bash
pnpm build
```

Tests (full suite):
```bash
pnpm test
```

Run demo (builds first):
```bash
pnpm demo
```

### Single-Test / Focused Runs
Vitest is used via `vitest run`.

Run a single test file:
```bash
pnpm test -- path/to/file.test.ts
```

Run tests matching a name pattern:
```bash
pnpm test -- -t "pattern"
```

Run tests in watch mode (if needed during local dev):
```bash
pnpm exec vitest
```

## Code Style (Observed)
Follow patterns in `src/` and `demo/`.

### Formatting
- Indentation: 2 spaces
- Semicolons: always
- Quotes: double quotes
- Trailing commas: used in multiline objects/arrays
- Line width: keep readable; prefer wrapping long generics/objects

### Imports / Exports
- Use ESM imports with explicit `.js` extension in TS source
  - Example: `import { run } from "./flow.js";`
- Re-export public API from `src/index.ts`
- Prefer named exports over default exports

### Naming
- Types: `PascalCase` (`FlowError`, `RunOptions`)
- Functions/variables: `camelCase` (`createFlow`, `maxSteps`)
- Generics: short, conventional (`D`, `Ctx`, `S`)
- Constants: `camelCase` unless truly constant globals

### Types & Generics
- Strict TS is enabled (`"strict": true` in `tsconfig.json`)
- Prefer explicit types for public API and helpers
- Use `type` aliases for object shapes and unions
- Keep union types small and intentional (`Transition` as tagged union)

### Error Handling
- Use `FlowError` for runtime validation failures in core logic
- Include context (`state`, `step`, `cause`) when throwing
- When a handler throws, wrap it and surface as `FlowError`
- For recoverable flow errors, return `{ error, data? }`

### Control Flow Patterns
- Favor small, pure state handlers
- Use the `next`, `done`, `error` helpers to create transitions
- Validate state keys before transitioning (see `run` implementation)

### Public API Conventions
- Keep API surface small and explicit (exports from `src/index.ts`)
- Preserve existing function signatures and type names
- Avoid breaking changes without updating `README.md`

## Testing Conventions
- Tests (if added) should use Vitest defaults
- Name tests descriptively; align with API behavior in `README.md`
- Prefer deterministic behavior and small fixtures

## Documentation
- Update `README.md` when adding/removing exported APIs
- Keep examples minimal and copy-pasteable

## Cursor / Copilot Rules
No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
No Copilot instructions found in `.github/copilot-instructions.md`.

## Notes for Agents
- Do not edit `dist/` directly; it is build output
- Preserve ESM `.js` import specifiers in TS
- Keep changes consistent with current minimal style
- When unsure, follow patterns in `src/flow.ts` and `demo/index.ts`
