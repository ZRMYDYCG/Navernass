Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure checks pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Project Map

Narraverse is a pnpm monorepo for an AI-assisted novel writing platform.

| Path | Role |
| --- | --- |
| `apps/frontend` | **Primary app** — Next.js 16 App Router UI |
| `apps/backend` | NestJS API, Prisma, agent/skills runtime |
| `apps/desktop` | Electron + React + TypeScript desktop shell (electron-vite) |

Root tooling owns lint/format for `frontend` + `backend` + `desktop`.

### Stack

**Frontend (`@narraverse/frontend`)**

- Next.js 16 (App Router; `middleware` → `proxy`), React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI / `base-nova`)
- next-intl (`zh-CN` default, `en-US`)
- Zustand 5 + immer slices; TanStack Query / Form
- Ky + Zod for HTTP/request validation

**Backend (`@narraverse/backend`)**

- NestJS 12, Prisma, better-auth
- Vitest (`test/**/*.spec.ts`)
- AI SDK + skill files under `apps/backend/skills/`

**Desktop (`@narraverse/desktop`)**

- Electron + React 19 + TypeScript, built with electron-vite
- `src/main` / `src/preload` / `src/renderer` standard three-process layout

**Package manager:** pnpm only (`pnpm@11`). Never use npm/yarn/bun for installs or scripts.

### Commands

```bash
pnpm dev                 # frontend
pnpm dev:backend         # backend
pnpm dev:desktop         # electron
pnpm dev:all             # frontend + backend
pnpm lint                # oxlint (frontend + backend + desktop)
pnpm lint:fix
pnpm format              # oxfmt --check
pnpm format:fix
pnpm typecheck           # frontend
pnpm typecheck:all       # frontend + backend + desktop
pnpm test                # backend (vitest)
```

After substantive edits, run `pnpm lint` and `pnpm format` (or `*:fix`) and fix failures.

---

## Engineering Principles

- Prefer proven patterns over inventing new ones.
- No defensive code for type-guaranteed / deterministic paths. Validate at untrusted boundaries only (HTTP, env, external I/O).
- Occam's razor — simplest solution that fully solves the problem.

### Abstraction Bar — business code stays business code

Extract only what carries core correctness. Everything else lives inside its business component.

- The state machine is the one abstraction worth extracting: a pure `State × Event → State` reducer with no React, no side effects, unit-testable (see `apps/frontend/src/app/[locale]/(core)/workspace/_components/chat-panel/machine.ts`). Complex state transitions belong here — not in components, not scattered across effects.
- Single-consumer logic stays in the business component that uses it, as private (non-exported) functions. No `utils.ts` / `hooks.ts` / `model/` intermediate layers for one caller.
- `src/lib/` is shared infrastructure only (http client, error, schemas). Feature business logic never goes there — `lib` means shared, and lib must not import from feature folders.
- Target blast radius: a change to one business concern touches exactly one file. If a "helper" edit forces touching several files, it's misplaced.
- Store classes consumed via `useSyncExternalStore` live beside the component that renders from them (e.g. `StreamingMessageStore` inside `chat-messages.tsx`), not in separate files.

### Type Safety

- Prefer explicit types, `unknown`, or generics over `any`.
- Prefer narrowing / type guards over `as` assertions.
- Don't add speculative utility types or over-generic APIs.

### Frontend — React & UI

- Keep components focused; split when responsibility boundaries are clear — not just to shrink line count.
- Prefer `apps/frontend/src/components/ui/` (shadcn) over raw HTML when an equivalent exists.
- **Do not** edit shadcn primitives under `src/components/ui/` unless the user explicitly asks. Compose / wrap / use `className` + props instead.
- `@shadcn/lint` enforces design-system usage (`shadcn/no-restyle` etc.). Layout spacing on owned components belongs on wrappers, not on CardTitle/CardContent/Button classNames. UI primitives themselves are exempt via `.oxlintrc.json` overrides.
- No hardcoded colors/borders/shadows/radius — use theme CSS variables from `apps/frontend/src/app/globals.css`.
- Prefer Tailwind spacing scale over arbitrary values when equivalent (`w-37.5` not `w-[150px]`).
- Don't stash Tailwind class strings in constants/objects; keep them at the call site or inside a component.

### Frontend — State & Data

- Zustand: use slice pattern; use `useShallow` for multi-field selectors; use immer middleware for complex mutations.
- Server state via TanStack Query; keep query keys in `src/lib/query/`.
- HTTP via `apiRequest` / Ky helpers in `src/lib/http/` with Zod schemas in `src/schemas/`.

### Frontend — i18n (next-intl)

- Locales: `zh-CN`, `en-US`. Messages live in `apps/frontend/messages/`.
- One `useTranslations` per component is fine; prefer full keys or a single namespace consistently with nearby code.
- Don't prop-drill `t`. Child components that need copy call `useTranslations` themselves.
- Pure helpers may accept a narrowly typed translate function — that is not prop drilling.

### Frontend — Next.js 16

This is not the Next.js your training data assumes. Before App Router / config / routing changes, read the relevant guide under `apps/frontend/node_modules/next/dist/docs/` (or the hoisted `next` package). Heed deprecation notices. Request interception uses `proxy`, not `middleware`.

### Backend

- Follow existing Nest module layout: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts` / `*.dto.ts`.
- Prisma client is generated — don't hand-edit `src/generated/`.
- Skills live in `apps/backend/skills/<name>/SKILL.md`; keep progressive-disclosure loading patterns consistent with existing agent code.
- Tests: Vitest under `apps/backend/test/**/*.spec.ts`. Test critical logic only — no appearance/className assertions, no meaningless wrappers.

### Diff Review Smells (judgment, not dogma)

Focus on the diff. Skip anything oxlint/oxfmt already enforces.

- Mysterious names → rename; if no honest name fits, redesign.
- Duplicated logic across hunks → extract shared function.
- Feature envy / data clumps / primitive obsession → move or elevate types.
- Speculative generality → delete until needed.
- Shotgun surgery / divergent change → consolidate or split by responsibility.
