# Ascent implementation tasks

Do not mark a task complete unless its implementation and relevant checks are done.

## v1 — Standard 30-unit course (verified complete)

These were reconciled against the shipped code during the v2 audit and confirmed implemented and verified (production build, 32 passing unit tests, live Vercel deploy with private Blob smoke test).

## 1. Establish the project

- [x] Read the full package; inspect existing project instructions and preserve compatible conventions.
- [x] Create or confirm the Next.js/TypeScript project, dependency lock and scripts.
- [x] Copy/import canonical course, source and glossary content without shortening it.
- [x] Implement runtime/build-time schemas and run the supplied package validator.
- [x] Apply the shared visual tokens and create the profile entry screen (now name-only entry, retrofitting harshith/aparna).

## 2. Build the complete learning experience

- [x] Dashboard with real empty state, resume action and derived progress.
- [x] All 30 lessons, four phases and prerequisite navigation.
- [x] Full lesson workspace: every supplied content field, resource assignment, lab and checkpoint.
- [x] Task toggles, acceptance attestations, notes, evidence, reflection and competency self-assessment.
- [x] Resource search, glossary search and topic/coverage view.
- [x] Project evidence collection and milestone views.
- [x] Study-session entry/correction and weekly-target settings.
- [x] Educational context/weighted-sum/attention aids and meaningful architecture diagrams.
- [x] Responsive layouts, keyboard behavior and all specified empty/error states.

## 3. Implement state and persistence

- [x] Define the validated LearnerState and ProgressRepository contracts.
- [x] Local development adapter with honest device-local status and corruption recovery.
- [x] Server progress API with slug-validated profiles and content IDs, bounded inputs and safe errors.
- [x] Server-only private Blob adapter using current supported SDK features.
- [x] Fresh reads, first-create collision handling and revision-checked updates.
- [x] Local draft recovery, serialized/debounced saves and protection from stale cross-profile responses.
- [x] Conflict UX preserving local and remote work.
- [x] Versioned backup export/import, preview and explicit replacement confirmation.
- [x] Per-profile reset with backup opportunity.
- [x] Preserve stable IDs and implement content-version migration behavior.

## 4. Verify functionality

- [x] Content integrity: exactly 30 lessons, complete fields, resolvable sources, unique IDs.
- [x] Completion and reversal rules, no duplicate task counts and no optional-task penalty.
- [x] Reload and profile separation, including notes and late network responses.
- [x] Two simultaneous writers, concurrent creation, stale revisions and lost responses.
- [x] Offline/storage-error draft recovery and no misleading saved status.
- [x] Backup round-trip, invalid schema, unsafe URL and wrong-profile import behavior.
- [x] Study-session totals and timezone boundary behavior.
- [x] Checkpoint self-review and evidence requirements.
- [x] Browser flows at mobile/tablet/desktop, keyboard/focus and accessible status.
- [x] Production build and applicable lint/type checks.

## 5. Prepare deployment and handoff

- [x] Add a documented .env.example without secrets.
- [x] Document local run, private Blob connection, authorized Postgres alternative, backup and rollback.
- [x] Verify selected Vercel project/account before external deployment.
- [x] If storage is configured, run a real save/read/reload/independent-session smoke test.
- [x] Deploy and verify the preview/production URL (ai-learning-two-lake.vercel.app, private Blob connected).
- [x] Deliver finished UI, source, setup, test evidence and honest limitations.

---

# v2 — Adaptive learning extension (optional, non-breaking)

The v1 30-unit course remains the default path and the common destination. Everything below is additive; it must never change canonical lesson/task IDs, completion rules, sources, or existing saved learner state.

## v2.1 Content model (authored, build-time validated)

- [ ] `content/competencies.json` — stable IDs, description, destination level, dependencies, teaching lesson IDs, verifying diagnostic IDs.
- [ ] `content/prerequisiteModules.json` — stable IDs, target gaps, explanation blocks, examples, small exercises, estimated minutes, evidence/checkpoint, sources, unlocked canonical lesson IDs. Covers the 7 prerequisite areas.
- [ ] `content/assessmentBank.json` — stable question IDs, skill area, difficulty, type, choices, explanation, rubric, evidence strength.
- [ ] `content/lessonEnhancements.json` — blocks keyed to existing lesson IDs (bridges, examples, code, diagrams/interactives, misconceptions, explain-back).
- [ ] Zod schemas + build-time validator; every source reference resolves to the canonical catalog or a newly recorded source (no model-invented URLs).

## v2.2 State + migration

- [ ] schemaVersion 2 learner state with bounded new fields (assessment draft/results/history, preferences, active plan + history, validatedPriorKnowledge, AI consent/enhancement-cache metadata) plus all v1 fields.
- [ ] Explicit v1→v2 migrate-on-read in both repositories, client draft load, and backup import; keep Blob namespace and never drop v1 data.
- [ ] Backup version 2 that still accepts v1 backups through migration, with preview.
- [ ] Fixture tests: real-shaped v1 Harshith/Aparna state migrates with zero data loss.

## v2.3 Deterministic plan composer

- [ ] Pure, unit-tested composer: (assessment result + preferences) → versioned reversible `PlanRevision`. No AI call.
- [ ] Plan items reference stable canonical lesson / prerequisite-module / presentation-variant IDs; statuses foundation/standard/revision/challenge/optional-depth; unchanged destination competencies + capstone.
- [ ] Preview vs standard path; explicit confirm to activate; revision history; Return to standard path; Restore previous plan. Never auto-complete canonical tasks; record validatedPriorKnowledge separately.

## v2.4 Assessment wizard

- [ ] Accessible, responsive, 12–18 min, save-each-step, resume, retake with history; transparent deterministic scoring with the 4 states + explanations; verified diagnostics separate from confidence.
- [ ] All six starting scenarios converge on the same destination competency graph + capstone.

## v2.5 Onboarding, plan & skills UI

- [ ] Dashboard/onboarding choice: standard path (primary) vs create-a-plan (secondary), dismissible/resumable.
- [ ] My plan page, Skills map (no fake mastery %), assessment/plan actions in dashboard + settings; resume follows active plan; progress displays separate canonical/prereq/validated/depth/study-time.

## v2.6 Optional OpenRouter enhancement

- [ ] Server-only `AIEnhancementProvider` interface + deterministic (no-AI) provider; app depends on the interface only.
- [ ] Consent panel, revocation, bounded controls (timeout, per-profile daily budget, char/token caps, one retry), salted-hash cache, status view, actual-model recording.
- [ ] Allowed uses only; strict Zod validation of JSON output; never leak key/PII/raw errors to browser.

## v2.7 Lesson enhancement presentation

- [ ] Reusable authored block types + simple/deeper/implementation disclosure levels (persisted).
- [ ] Accessible interactive visuals (play/pause/reset, text equivalents, keyboard, reduced-motion, real deterministic calcs); safe code blocks with copy.

## v2.8 Reliability/security + tests + docs

- [ ] Extend Zod bounds, same-origin/CSRF, AI rate limiting, ETag conflict for larger state, local drafts, no code exec, sanitized render.
- [ ] Unit/integration/Playwright coverage per prompt §11; migrate `next lint` to ESLint CLI; run build/typecheck/tests and record results.
- [ ] Update README, .env.example, storage/backup/Vercel docs; deliver handoff.

## Completion rule

v2 is done only when a new learner can choose the unchanged standard course OR complete the optional assessment and receive a deterministic, explainable, reversible path; all prior progress is preserved; and the app works fully with no OpenRouter key and during any AI failure. OpenRouter enhances but never controls the curriculum contract.

