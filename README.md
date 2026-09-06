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
