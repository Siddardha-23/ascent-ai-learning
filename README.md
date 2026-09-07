# Ascent — a 30-day AI learning studio

A personal, self-paced learning portal for **Harshith** and **Aparna** that turns the
authored *Ascent* curriculum (30 units, 240 core tasks, 77 sources, 123 glossary
terms) into a working application. It runs on Next.js and deploys to Vercel, with
private Vercel Blob persistence and a local development fallback.

The portal requires **no model/LLM API key** — it serves the course, records your
progress, notes, evidence and reflections, and provides interactive learning aids.
The Python agent labs are run by you on your own machine; the web server never
executes lab code.

> Profile selection is a simple name choice for a trusted personal deployment. It
> is **not** secure authentication — anyone with access to the app can choose
> either profile.

---

## Tech stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS
- Zod for runtime content/state validation
- `@vercel/blob` v2 (private storage)
- Vitest for unit tests

## Project layout

```
content/                 canonical course content (versioned, never mutated)
  curriculum.json        30 lessons + 240 task records
  sources.json           77 sources
  glossary.json          123 terms
  starter-labs/          fictional corpus, dev/holdout questions, baseline.py
src/
  app/                   routes (profile entry, /learn/*, /api/*)
  components/            UI (dashboard, lesson workspace, aids, etc.)
  lib/content/           content schemas + loaders/selectors
  lib/progress/          learner-state schema, reducer, completion, repositories
scripts/validate-package.py   structural content validator
tests/                   vitest unit tests
.kiro/                   specs (requirements/design/tasks) + steering
```

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

Without `BLOB_READ_WRITE_TOKEN`, the app runs in **local mode**: progress is written
to `./.ascent-data/<profile>.json`. This is device/server local — not cross-device
sync — and the UI labels it accordingly.

## Verification

```bash
npm run typecheck        # tsc --noEmit
npm run test             # vitest (28 unit tests)
npm run validate:content # python scripts/validate-package.py
npm run build            # production build (41 routes)
npm run lint             # eslint
```

Current status (verified locally):

- `npm run test` → **28/28 passing** (content integrity, completion rules, reducer,
  activity, backup, server-side validation).
- `npm run validate:content` → **passed** (30 lessons, 240 tasks, 77 sources, 123
  glossary terms, all IDs resolve; baseline dev recall@3 = 1.0).
- `npm run build` → **succeeds**, 41 routes including all 30 lesson pages.
- Manual API smoke test (local mode) confirmed: fresh read returns null, create
  returns a revision, a stale-revision write returns **409 conflict**, a correct
  revision write succeeds, profiles are isolated, bad `Origin` → 403, unknown
  profile → 400.

## Storage: private Vercel Blob

The app persists learner state through a `ProgressRepository` interface with two
adapters:

- **`BlobRepository`** (production): private Vercel Blob, one object per profile
  (`ascent/progress/v1/<profile>.json`). The object **ETag is the revision**.
  - Reads use `get(..., { access: "private", useCache: false })` for a fresh,
    authoritative read.
  - First creation uses `allowOverwrite: false` (a collision becomes a conflict,
    never a silent overwrite).
  - Updates use `ifMatch: <revision>`; a mismatch throws
    `BlobPreconditionFailedError` and the API returns **409** with the current
    state so the client can reconcile.
  - The token stays server-side; object URLs are never exposed to the browser.
- **`LocalRepository`** (development): JSON files under `./.ascent-data`. Explicitly
  labeled device-local; not durable in serverless production.

### Connect a private Blob store

1. In the Vercel dashboard: **Storage → connect/create a Blob store** with access
   set to **Private**, and connect it to this project.
2. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically in deployed environments.
3. For local testing against the real store: `vercel env pull .env.local`.
4. Restart the app. The dashboard and Settings will report **private cloud
   (Vercel Blob)** as the storage mode.

If only a **public** Blob store is available, keep the app in local mode — do not
place personal notes in public objects. Alternatively, an already-authorized Vercel
Marketplace **Postgres** integration could implement the same `ProgressRepository`
interface (not included here).

## Deploy to Vercel

```bash
npm i -g vercel          # if needed
vercel                   # link + preview deploy
vercel --prod            # production
```

- Confirm you are deploying to the intended Vercel project/account before running.
- Connect the private Blob store (above) so persistence survives across devices and
  serverless invocations.
- **Rollback:** use the Vercel dashboard **Deployments → Promote** a previous
  deployment, or `vercel rollback <deployment-url>`.

## Backups & reset

- **Settings** exports a versioned per-profile JSON backup and imports one with a
  preview + explicit confirmation (wrong-profile and invalid files are rejected).
- **Reset** is per-profile, confirmed, and offers an export first. Other profiles are
  never touched.

## Known limitations / remaining configuration

- **Cloud persistence is unverified until a private Blob store is connected.** All
  independent work (UI, content import, local persistence, tests, build) is complete;
  the only remaining step is connecting `BLOB_READ_WRITE_TOKEN` from a private store
  and running a real save/reload smoke test in the deployed app.
- No deployed URL is claimed — deployment has not been performed from here.
- The three-way merge for conflicting notes is intentionally a simple "keep mine /
  take theirs" reconciliation that never discards either version silently.
- Learning aids (context budget, weighted sum, attention) are **educational
  computations with visible assumptions**, not live model calls or a real tokenizer.

## Content accuracy

Course content ships versioned (`contentVersion`) and separate from mutable learner
state. Sources record publisher, type, and the date checked (2026-09-05). Links can
change over time; the original URL is always shown and opening a link never marks a
resource complete.


---

## v2 — Adaptive learning (optional, non-breaking)

Version 2 adds an **optional** personalized layer on top of the unchanged 30-unit
course. Nothing about v1 changes: the standard path is still the default and the
common destination, all lesson/task IDs and completion rules are preserved, and
every learner (v1 or v2) reaches the same generative-AI + agentic-AI destination.

### Standard vs custom path

- **Standard path (default):** follow the 30 units in order. Complete on its own,
  needs no assessment and no AI.
- **Custom path (optional):** take a 12–18 minute **skills check** (`/learn/assessment`).
  A deterministic scorer produces a transparent per-skill result and a
  **plan composer** proposes a reversible route to the same destination — adding
  prerequisite *bridge* units where foundations are missing and offering faster
  *revision lanes* where prior knowledge is verified.

Key guarantees:

- The plan is **composed deterministically** — no AI decides your path, ordering,
  prerequisites, or completion. Identical answers always produce the same plan.
- Plans are **previewed before activation** and **fully reversible**: switch plans,
  restore a previous revision, or **return to the standard path** at any time.
  Switching never erases progress; completed tasks stay complete.
- Verified prior knowledge is recorded **separately** from completed tasks — the
  assessment never auto-completes canonical work. Confidence alone never validates
  a skill; only correct diagnostics do.

### New pages

- `/learn/assessment` — the skills-check wizard (saves after every step, resumable,
  retakable, keyboard-accessible, "I'm not sure" everywhere).
- `/learn/plan` — My plan: active revision, comparison vs standard, route list,
  history with preview/restore, and "return to standard path".
- `/learn/skills` — Skills map: the competency dependency graph with your verified
  evidence state (no fabricated mastery percentages).
- `/learn/prerequisite/[id]` — a prerequisite bridge unit.

Lessons now also include **enhancement blocks** (why-this-matters, connect-to-what-you-know,
mental model, worked walkthrough, annotated code, predict-before-reveal, play,
misconception, explain-back) with a **simple / deeper / implementation** depth
toggle (persisted), plus accessible **interactive visuals** (weighted sum, gradient
step, tokenization+sampling, attention, embeddings/cosine, RAG pipeline, tool loop,
LangGraph, graph-type comparison, prompt-injection boundary, cache taxonomy). All
visuals have play/pause/reset where animated, text alternatives, keyboard operation,
and honor reduced-motion. Required lab steps and sources are never hidden inside
collapsed content.

### Optional AI enhancement (OpenRouter)

AI is **off by default** and **never controls the curriculum**. When enabled by
configuration *and* opted in by the learner, it only:

- rewrites the deterministic plan findings into a friendlier explanation,
- offers an alternate analogy from a supplied lesson excerpt, and
- gives rubric-based feedback on an explain-back answer (labeled AI feedback, not a
  grade or proof of mastery).

The app depends only on a server-only `AIEnhancementProvider` interface with a
**deterministic fallback**, so the full flow works unchanged when AI is disabled,
keyless, rate-limited, timed out, or returns invalid output.

Data minimization: prompts are built server-side from **allowlisted structured
fields only** (skill-area IDs, approved lesson excerpts). Learner **names, notes,
evidence, links, and full progress are never sent**. Learner free text is treated
as untrusted data and delimited. Output is re-validated with Zod. The API key is a
**server-only** environment variable — never `NEXT_PUBLIC_`, never entered in a
client form, never logged.

**Free-router variability:** if `OPENROUTER_MODEL` is unset, OpenRouter free routing
picks an available free model that can vary between requests — a sensible
experimental default, not a reliability promise. Set `OPENROUTER_MODEL` (e.g.
`openai/gpt-4o-mini`) to pin a model. Provider logging/retention policies differ; the
app requests conservative routing (`data_collection: "deny"`) where supported.

Official references: OpenRouter
[quickstart](https://openrouter.ai/docs/quickstart),
[free router](https://openrouter.ai/docs/guides/routing/routers/free-router),
[structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs),
[data collection](https://openrouter.ai/docs/guides/privacy/data-collection),
[provider logging](https://openrouter.ai/docs/guides/privacy/provider-logging).
Content was rephrased for compliance with licensing restrictions.

#### Enabling AI on Vercel

Set these as **server** environment variables (Project → Settings → Environment
Variables) — do not expose them to the browser:

```
OPENROUTER_API_KEY=<your key>
OPENROUTER_MODEL=openai/gpt-4o-mini   # optional; omit for free routing
AI_PERSONALIZATION_ENABLED=true
AI_TIMEOUT_MS=12000
AI_MAX_CALLS_PER_PROFILE_PER_DAY=5
AI_MAX_INPUT_CHARS=12000
AI_MAX_OUTPUT_TOKENS=900
```

Then redeploy. Learners still must opt in from **Settings → AI enhancement**.

### State schema v2 & migration

Learner state is now `schemaVersion: 2`, adding optional `v2` fields (assessment
results/draft, preferences, plan revisions + history, validated prior knowledge,
AI consent/cache metadata) alongside all v1 fields. **v1 states migrate on read**
(`parseAndMigrate`) in every reader — Blob, local adapter, browser draft, and backup
import — so existing Harshith/Aparna data loads with zero loss. The Blob namespace is
unchanged (`ascent/progress/v1/<profile>.json`).

Backups are now **version 2**; **v1 backups still import** (upgraded on import with a
preview and a clear notice). A wrong-profile or invalid backup is rejected.

### Verification (v2)

All checks were run and passed:

- `npm run validate:content` — content + v2 modules (30 lessons / 240 tasks / 77
  sources / 123 glossary; 18 competencies, 7 prerequisite modules, 29 assessment
  questions, 12 lesson enhancements).
- `npm run test` — **77** unit/integration tests (12 files): migration (v1→v2, zero
  loss), composer determinism + all six starting profiles converging on the same
  destination, scorer (confidence never validates), AI success + every fallback
  (malformed / 401 / 429 / 5xx / timeout / invalid / disabled / no-key), AI PII
  isolation, v2 referential validation, backup v1/v2 round-trip.
- `npm run test:e2e` — **12** Playwright flows at phone + desktop (profile entry,
  lesson depth toggle + visual, assessment → plan preview → activate → return to
  standard, skills map, no horizontal clipping).
- `npm run typecheck`, `npm run lint` (ESLint CLI), `npm run build` (51 routes) — all clean.
- Live smoke: private-Blob round-trip of the full v2 state (plan + assessment +
  consent) with a 409 conflict on stale writes; one live OpenRouter success
  (schema-validated, model recorded) plus forced fallbacks.

### Known limitations

- Free-router model selection can vary per request; pin `OPENROUTER_MODEL` for
  stability.
- The AI daily budget limiter is in-memory (per server instance) — a soft guard for
  a low-volume personal app, not a distributed limiter.
- Name-only profiles are not authentication; anyone with the link can enter any name.
