# Ascent requirements

Version 1 · 2026-09-05 · This is a build specification, not evidence that features already exist.

## R1 — Simple profiles

- WHEN the portal opens without a selected profile, it SHALL show only Harshith and Aparna as profile choices.
- WHEN a learner selects a profile, it SHALL open that profile's dashboard in one action.
- It SHALL NOT require email, registration, passwords or OAuth for this personal version.
- It SHALL store state under stable lowercase IDs harshith/aparna and reject unknown IDs at the server.
- It SHALL explain that name selection is not secure authentication and either profile is accessible to anyone with access to the app.
- Switching profile SHALL flush or preserve pending edits safely, then load the chosen profile without stale data or in-flight responses from the previous profile.

## R2 — Complete, linear course content

- The app SHALL import all 30 units in curriculum.json, not only titles or sample days.
- Every lesson SHALL render all explanation, bridge, analogy, goals, topics, resource assignments, lab steps, acceptance checks, checkpoint question/answer and optional depth.
- Stable IDs SHALL survive cosmetic edits. Content migrations SHALL map changed/deleted IDs rather than silently losing progress.
- The map SHALL show four stages: Foundations (1–8), Generative AI & retrieval (9–16), Agent engineering (17–23), Production & innovation (24–30).
- Prerequisites SHALL be visible. Learners MAY browse ahead without a lock or forced waiting period.
- Thirty days SHALL mean thirty learning units with optional extensions inside them. Do not add day 31 or a compulsory calendar deadline.

## R3 — Honest progress and completion

- Each of the 240 supplied task IDs SHALL support independent completion and reversal.
- A day SHALL be complete only when its eight core tasks are complete, an evidence note and reflection are present, and its checkpoint has been attempted and self-reviewed.
- The app SHALL show required missing evidence instead of silently completing a day.
- Acceptance-check attestations SHALL be stored separately from claims that a test ran automatically. Use wording such as 'I checked this' unless the app actually executes a trusted verification.
- Optional reading or labs SHALL NOT block core completion or silently change the denominator.
- Completion percentage SHALL derive from completed core task IDs / 240; completed-day count SHALL use the full completion rule.
- Undoing a prerequisite task SHALL update counts without deleting subsequent work.
- No demo progress, invented scores, fake certificates, employer-readiness claims or universal mastery percentages.

## R4 — Continue learning

- The dashboard SHALL link directly to the first incomplete task in the chosen/current learning unit.
- It SHALL offer the next incomplete unit after the current one is complete.
- It SHALL show real completed units, activity, study time and next milestone.
- It SHALL use encouraging neutral language, e.g. 'Continue where you left off'. Missing a calendar day SHALL NOT erase learning progress.
- Reading time SHALL be an estimate. No video completion SHALL be inferred from clicking a link.

## R5 — Notes, evidence and reflection

- Each lesson SHALL have editable notes, evidence text, optional artifact/code URLs, reflection and a self-assessed competency level.
- Levels SHALL be 'Can explain', 'Can implement with guidance', 'Can implement independently', and 'Can diagnose or extend'; default unset.
- Free-form checkpoint answers SHALL be persisted before displaying the reference explanation. Learners can revise and mark understood / revisit.
- The app SHALL NOT pretend a free-form answer was automatically graded by a model. No paid grading service is required.
- Save status SHALL distinguish saving, saved locally, saved to cloud, offline/pending, conflict and failure.
- Unsaved edits SHALL be recoverable after navigation or failed requests.

## R6 — Study sessions and motivation

- Learners SHALL be able to log and correct study minutes against a lesson and local date.
- A configurable weekly target SHALL affect encouragement, not course completion.
- Activity SHALL derive from recorded sessions or meaningful completed work, not simply opening the page.
- Timezone-aware calendar dates SHALL be used. Handle midnight, DST where applicable and travel without duplicating sessions.
- A timer is optional; if implemented, it SHALL pause when requested and avoid counting long inactive/background periods as learning.
- Show weekly consistency and total active days. If a streak is shown, define it precisely and do not use it to penalize the learner.

## R7 — Sources, glossary and coverage

- All source IDs in curriculum.json SHALL resolve in sources.json.
- Resource cards SHALL expose direct URL, title, publisher, resource type, core/optional status, assignment and recorded dates.
- Link failures SHALL have a fallback original URL and an honest unavailable state. Do not fabricate a replacement or completion.
- Search SHALL include lesson titles, topics, glossary terms and resource titles; provide useful no-result states.
- Glossary entries SHALL include definition, example, first relevant lesson and linked source IDs.
- TOPIC-MAP.md coverage distinctions SHALL be reflected in a topic/competency view.
- Explain that first-party enterprise accounts illustrate reported practices, not independently verified outcome guarantees.

## R8 — Backups and persistence

- Course content SHALL ship versioned with the app and remain separate from mutable learner progress.
- A ProgressRepository SHALL support local development and real server-side private Vercel Blob storage.
- Local mode SHALL remain useful without credentials but SHALL be labeled device-local; it is not cross-device sync.
- Cloud mode SHALL keep tokens and private object URLs out of browser code and logs.
- Reads SHALL retrieve current state; writes SHALL compare the client's revision and reject stale saves.
- A concurrent first creation SHALL not overwrite another successful creation.
- On conflict, preserve the local draft and show a clear reconciliation choice. Never silently choose last-write-wins for notes.
- Autosave SHALL be debounced and serialized per profile; retain unsent drafts and flush deliberately on profile switch.
- Export SHALL create a versioned per-profile JSON backup. Import SHALL validate size/schema/profile/content version, show a preview, and require confirmation before replacing state.
- Reset SHALL be per-profile, explicit, confirmed and offer export first.
- Production serverless storage SHALL not use an ephemeral local filesystem as durable state.
- If only public Blob is available, do not write personal notes there. Finish the local mode and report the configuration needed for private storage, or use an already-authorized Postgres integration.

## R9 — Useful learning aids

- Include a context-budget worksheet with clearly labeled illustrative capacity and overhead; do not claim an exact provider token count from whitespace.
- Show the weighted-sum and attention examples as educational computations using supplied values, with assumptions visible.
- Include diagrams comparing retrieval, tool-loop and state-graph architectures.
- Interactive controls SHALL change actual computed results.
- The portal SHALL NOT execute learner-provided Python, shell code or arbitrary URLs on its server.
- No live chatbot, model hosting or API-key collection is required to read the course.

## R10 — Interface quality

- Use a working dashboard and lesson surface, not a promotional landing page after login.
- Main text SHALL be readable at normal size and 200% zoom; use a comfortable reading width.
- Controls SHALL have semantic labels, keyboard access, visible focus and non-color-only state cues.
- Test at mobile, tablet and desktop widths; code blocks and tables SHALL not break page layout.
- Honor reduced motion. Keep animation optional and modest.
- Implement loading, empty, missing-resource, offline, save-error, import-error and conflict states.
- Use no fake metrics, fabricated testimonials, distracting AI artwork or unnecessary account setup.

## R11 — Deployment and maintainability

- Use a current compatible Next.js/TypeScript stack for Vercel, validated seed content and stable dependency locks.
- Keep provider-specific Python experiments in learner labs, separate from the portal runtime.
- Provide .env.example containing names and descriptions only, with no secrets.
- Document local run, production build, storage setup, preview deployment, rollback and known limitations.
- Do not silently provision paid resources. Confirm actual target project/account and paid effects when needed.
- Claim a deployed URL only after successful deployment and smoke verification.
- Missing credentials SHALL NOT excuse leaving UI, content import, local persistence, tests or documentation unfinished.

## R12 — Acceptance scenarios

1. Fresh Harshith profile shows 0/30 days and 0/240 tasks; all content is immediately readable.
2. Finish part of day 1, save, reload and continue at the correct task.
3. Switch to Aparna: no Harshith notes/tasks appear. Switch back: Harshith state remains.
4. Uncheck a task: task count and day completion update while notes survive.
5. A day cannot complete with missing evidence or an unattempted checkpoint.
6. Read any unit, including days 19, 25 and 30: full content and real resources render.
7. Two cloud clients edit from the same revision: one succeeds, the other receives a conflict and retains its draft.
8. Two first writes to a new profile cannot silently replace each other.
9. Simulate offline/storage failure: edits remain recoverable; no false 'cloud saved' message.
10. Export/import round-trip preserves all supported state, but invalid or wrong-profile imports cannot silently replace it.
11. Local mode runs with no API keys; cloud mode uses real configured storage and survives an independent session.
12. Verify keyboard/mobile navigation and production build; inspect source integrity with the package validator.



---

# v2 requirements — Adaptive learning extension

Version 2 · Additive and non-breaking. The v1 requirements above remain authoritative for the standard course.

## R13 — Standard path stays default and intact

- The unchanged, versioned 30-unit curriculum SHALL remain the default path and the common destination for every learner, fully usable with no AI API key.
- Stable lesson IDs, task IDs, resources, notes, evidence, completion rules and the capstone SHALL survive the extension. Existing `harshith`/`aparna` IDs and saved state SHALL be preserved.
- A learner MAY dismiss personalization, start it later, save/resume, retake, preview a revision, and return to an earlier plan revision.
- "30 days" SHALL mean 30 destination learning units. Prerequisite bridge units MAY precede or sit beside them and add estimated time, but SHALL NOT be renamed day 31, 32, …

## R14 — Curated competency & prerequisite model

- Authored, versioned, build-time-validated: `competencies`, `prerequisiteModules`, `assessmentBank`, `lessonEnhancements`, each with stable IDs.
- Every source reference SHALL resolve to the canonical catalog or a newly recorded source (title, publisher, direct URL, access/date notes, purpose). No model-invented URLs.
- Cover ≥ the 7 prerequisite areas (CLI/Git, Python/logic, web/HTTP, frontend, backend/data, math/data, delivery). The composer SHALL select only evidence-supported gaps; no learner is forced through every prerequisite.

## R15 — Optional adaptive assessment

- Accessible, responsive wizard, normally 12–18 min, saving after every step, with progress indicator, back/next, keyboard support, "I'm not sure" options, glossary help, and resume-later.
- Collect experience/languages, per-area familiarity, confidence + recency (not relied on alone), verified diagnostics (predict code, order a flow, choose a metric, identify a boundary, explain a system), weekly time, session size, teaching-mode preferences, compute/API constraints, cloud preference.
- The destination is fixed (practical GenAI + agentic engineering). The learner SHALL NOT be able to select a weaker destination that removes core competencies.
- Deterministic transparent scoring with exactly four per-area states: Needs a foundation / Ready to learn the course topic / Verify prior knowledge / Validated prior knowledge, each with an explanation of why and which evidence mattered. Retakes retained with history. Self-report alone SHALL NOT award course completion.

## R16 — Deterministic, reversible plan composition

- A pure, unit-tested composer SHALL turn assessment result + preferences into a versioned `PlanRevision` without calling a model.
- Plan items reference stable canonical lesson / prerequisite-module / presentation-variant IDs (no copying lesson bodies into learner state), with rationale, status (foundation/standard/revision/challenge/optional-depth), estimated minutes and dependencies. Destination competencies + capstone milestones stay unchanged.
- A preview SHALL compare against the standard path and require explicit confirmation before activating. Switching/regenerating SHALL never erase progress; completed stable tasks stay complete. Provide Return to standard path and Restore previous plan. Validated prior knowledge is recorded separately from `completedTaskIds`.

## R17 — Safe state migration

- schemaVersion-2 learner state with explicit v1→v2 migration; bounded schemas for assessment, preferences, plan revisions/history, validated-prior-knowledge, AI consent/cache metadata, plus all v1 fields.
- Backups upgrade to a new version while still importing valid v1 backups through migration, with a preview and content-version/profile checks. Course content stays outside mutable learner state; optional generated enhancements are stored by ID under a bounded namespace, never duplicating the curriculum per learner.

## R18 — OpenRouter as optional enhancement only

- A server-only `AIEnhancementProvider` interface with a deterministic no-AI provider SHALL make the full custom-plan flow work when AI is disabled, keyless, quota-exhausted, timed out, rejected, or output-invalid.
- Allowed: friendly plan explanation from deterministic findings; bounded "connect what you know" text from allowlisted skill IDs + approved facts; alternate analogy/practice from a supplied lesson excerpt; rubric-based explain-back feedback labeled as AI, not truth or completion.
- Disallowed: selecting prerequisites, ordering the plan, changing completion/grading; generating/replacing curriculum, sources, URLs, diagnostics, acceptance checks or safety policy; executing code/URLs/tools; receiving names/IDs/notes/reflections/evidence/links/secrets/full progress.
- Consent required before the first call, revocable; no calls without consent. Prompts built server-side from allowlisted fields; learner text treated as untrusted and delimited; strict JSON re-validated with Zod; char/token bounds, 12s timeout, ≤1 retry, per-profile daily budget, dedupe; cache keyed by salted hash (no raw text/key in keys or logs). Key configured only as a server env var, never a client form.

## R19 — Clearer, engaging lessons (presentation only)

- Preserve current content/sources; enrich presentation with reusable authored blocks following the why→connect→mental-model→walkthrough→annotated-code→predict→play→misconception→explain-back→build rhythm, carrying the Atlas Support example across lessons.
- Provide accurate, deterministic, accessible interactive visuals (flow, weighted sum/gradient, forward/backprop, tokenization+sampling labeled as simulation, attention+mask, embeddings/cosine/NN vs knowledge graph, RAG pipeline, HNSW vs knowledge vs workflow graph, tool loop, LangGraph, memory/cache taxonomy, evaluation/metrics, injection boundary). Every animation has play/pause/reset, text equivalent, keyboard control, visible focus, and reduced-motion support.
- simple/deeper/implementation disclosure levels, persisted; required lab instructions and sources never hidden inside collapsed content.

## R20 — Reliability, security, verification (extends R8/R10/R11)

- Credentials and AI calls server-side; Zod-bounded I/O; same-origin/CSRF consistent with progress routes; rate-limited AI endpoint returning no stack traces/provider payloads; private Blob stays private with ETag conflict semantics for the larger state; local drafts preserved on conflict/failed activation/offline/AI failure; never execute learner code/URLs/tool calls; sanitize rendered code/Markdown; exact calculations/permissions/completion/policy gates stay deterministic.
- Verification per prompt §11 (14 scenarios), migrate `next lint` to the ESLint CLI, and record actual command results; claim a check passed only if it ran.
