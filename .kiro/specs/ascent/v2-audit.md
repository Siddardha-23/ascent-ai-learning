# Ascent v2 — strict completion audit

Evidence-based audit of the v2 implementation. Every row was verified by reading
the current code and running the check named; results reflect only observed runs,
not prior claims.

## How verification was run

| Check | Command | Result |
|---|---|---|
| Content validation | `npm run validate:content` (python + tsx) | PASS — 30 lessons / 240 core tasks / 77 sources / 123 glossary; 18 competencies / 7 prerequisite modules / 29 assessment questions / 12 lesson enhancements / 13 added sources |
| Unit + integration | `npm run test` (vitest) | PASS — 84 tests, 13 files |
| End-to-end | `npm run test:e2e` (Playwright) | PASS — 16 (8 tests × desktop + mobile) |
| Types | `npm run typecheck` (tsc --noEmit) | PASS — clean |
| Lint | `npm run lint` (ESLint CLI) | PASS — 0 problems |
| Production build | `npm run build` | PASS — 51 routes |
| Live/cloud smoke | dev server + private Blob (`.env.local`) | PASS — full v2 state round-trip; 409 on stale write; live OpenRouter `openai/gpt-4o-mini` success + fallbacks |

## Requirement traceability (Prompt 1 §2–§11 → R13–R20)

| Req | Requirement | Implementation | Verification | Result |
|---|---|---|---|---|
| R13 | Standard 30-unit path stays default + intact; v1 IDs/data preserved; dismiss/resume/retake; "30 days" = units, bridges not renamed day 31+ | `content/curriculum.json` (unchanged, `.length(30)`), `Dashboard.tsx` onboarding, `PlanView.tsx` return-to-standard, `composer.ts` (bridges are `prerequisite` refType, never renamed days) | `scenarios.test.ts` (all 30 lessons browsable in every plan), `migration.test.ts`, e2e return-to-standard | PASS |
| R14 | Curated competency + prerequisite model; sources resolve; not everyone forced through every prerequisite | `content/{competencies,prerequisiteModules,assessmentBank,lessonEnhancements,sources-v2}.json`, `v2-content.ts` (`checkV2Integrity` throws on bad ref) | `validate-v2-content.ts`, `content` referential checks | PASS |
| R15 | Optional 12–18 min assessment; save/resume/retake; "I'm not sure"; transparent deterministic scoring (4 states + explanations); confidence not sole basis; destination not weakenable | `wizard-steps.ts`, `AssessmentWizard.tsx`, `scorer.ts` (`SCORER_VERSION`, `decide()`) | `plan.test.ts` (confidence never validates), `wizard-steps.test.ts`, e2e assessment save→submit | PASS |
| R16 | Deterministic reversible plan composer (no AI); stable refIds; preview→confirm→activate; restore; never auto-complete canonical tasks; validated recorded separately | `composer.ts` (pure), `plan-view.ts`, `PlanView.tsx`, `reducer.ts` (`addPlanRevision`/`activatePlan`/`returnToStandardPath`) | `plan.test.ts` (byte-identical determinism), `scenarios.test.ts` (no `completedTaskIds` in plan), e2e activate/return | PASS |
| R17 | schemaVersion-2 state + v1→v2 migration; backups v2 accept v1; content outside mutable state | `progress/schema.ts` (`parseAndMigrate`, `parseAndMigrateBackup`), `v2-schema.ts`, all readers migrate on read | `migration.test.ts` (real v1 Harshith/Aparna, zero loss; idempotent), `backup.test.ts` | PASS |
| R18 | OpenRouter optional via server-only interface + deterministic fallback; allowed uses only; consent+revocation; server-built prompts; strict JSON re-validated; bounds/timeout/retry/budget/dedupe/cache; no key/PII leak | `ai/provider.ts`, `ai/deterministic.ts`, `ai/openrouter.ts`, `ai/config.ts`, `ai/factory.ts`, `ai/rate-limit.ts`, `api/ai/{enhance,status}/route.ts`, `AIConsentPanel.tsx` | `ai.test.ts` (12: success validated + model recorded, all fallbacks, PII isolation, cache+dedup), live smoke | PASS |
| R19 | Clearer lessons: authored blocks + depth disclosure; accurate accessible interactive visuals; simple/deeper/implementation persisted; required steps/sources never hidden | `LessonEnhancements.tsx`, `visuals/*` (12 registered), `CodeBlock.tsx`, `content/lessonEnhancements.json` | e2e depth toggle + visual text-desc + reduced-motion; `validate-v2-content.ts` | PASS |
| R20 | Server-side creds; Zod bounds; same-origin/CSRF; AI rate limit; Blob ETag conflict; local drafts; no code exec; sanitized render | `blob-repository.ts`, all `api/*` routes (`sameOrigin`), `validate-state.ts`, `rate-limit.ts`, `CodeBlock.tsx` (text-only) | `security.test.ts` (8), grep audit (no `dangerouslySetInnerHTML`/`eval`/`NEXT_PUBLIC_`) | PASS |

## The 15 likely failure modes

| # | Failure mode | Result | Evidence / repair |
|---|---|---|---|
| 1 | v1 progress/backups lose data on migration | PASS | `migration.test.ts` proves real v1 Harshith/Aparna → v2 with every field preserved; idempotent. Hardened `v2` default to a factory. |
| 2 | Custom plan is AI prose, not deterministic revision | PASS | `composer.ts` is pure and imports no AI; produces structured `PlanRevision`. `plan.test.ts` asserts byte-identical output. |
| 3 | Confidence checkboxes mark lessons complete | PASS | `evaluateDay` requires core tasks + evidence + reflection + reviewed checkpoint; assessment/validated play no role. |
| 4 | Profiles lose destination competencies/capstone | PASS | `scenarios.test.ts` — all six profiles: identical 18 destination competencies, capstone present, all 30 lessons browsable. |
| 5 | Replanning mutates content / duplicates curriculum / resets task IDs | PASS | Composer stores `refId` references only; no content writes; canonical task IDs untouched. |
| 6 | `openrouter/free` treated as stable / AI failure blocks onboarding | PASS | Model recorded from the actual response; onboarding + plan work fully via deterministic provider; failures fall back. |
| 7 | Key/PII/answers leak to client/logs/cache keys/telemetry/provider | PASS (repaired) | No `NEXT_PUBLIC_`; key server-only; prompts from allowlisted fields; cache key = salted SHA-256 of canonical input (server-only, never returned/logged). **Repaired:** key previously derived from `kind` only. |
| 8 | Structured output trusted without local validation + fallback | PASS | `openrouter.ts` re-validates JSON with Zod; invalid → deterministic fallback. |
| 9 | Consent missing/unclear; revocation still allows calls | PASS | Client `aiOptIn = ai.consent === true` gates all AI UI; server 403s `consent !== true`. |
| 10 | Daily limits/timeouts/retry/caching/dedupe cosmetic | PASS (repaired) | **Repaired:** implemented real server-side response cache (bounded 500, 1h TTL, LRU) + in-flight dedup; cache serves before consuming budget. `ai.test.ts` covers it. Timeout/retry/budget were already enforced. |
| 11 | Enhancements are filler / fake calcs / decorative / inaccessible / false exact-provider claims | PASS | Visuals compute real values (weighted sum, gradient, softmax, cosine); tokenization labelled a simulation; `VisualFrame` provides text alternative + reduced-motion; controls keyboard-operable. |
| 12 | Dashboard merges prereq/validated/optional into a misleading % | PASS (repaired) | Course % = completed core tasks / 240 only. **Repaired:** added a "Tracked separately (not counted in course %)" card for validated prior knowledge + prerequisite bridges. |
| 13 | Assessment/plan/code/diagrams break on mobile/keyboard/reduced-motion | PASS | Playwright desktop + mobile: no horizontal clipping, keyboard nav (desktop link + mobile hamburger toggle), reduced-motion lesson render. |
| 14 | Old Kiro spec contradictory / unsupported completion claims | PASS | v1 tasks marked complete only after reconciliation; v2 spec appended (requirements R13–R20, design, tasks). This audit file records observed results. |
| 15 | `next lint` deprecated / no browser tests / unexecuted claims | PASS | `lint` script uses ESLint CLI; Playwright added and run; all results above are from actual runs this session. |

## Repairs made during this audit

1. **AI caching + request deduplication (FM7/FM10)** — were cosmetic (`cacheKey` computed, never used). Implemented a real bounded server-side response cache + in-flight dedup in `src/lib/ai/rate-limit.ts`; the enhance route now keys on a salted hash of the actual (server-only) canonical input, serves cache hits without consuming the daily budget, dedupes concurrent identical calls, and caches only genuine successes. Added a unit test.
2. **Dashboard honesty (FM12)** — added a "Tracked separately (not counted in course %)" card so validated prior knowledge and prerequisite bridges are visible without inflating canonical completion.
3. **Migration hardening (FM1)** — `v2` schema default changed to a factory (`() => emptyV2Block()`) to avoid any shared-reference risk.
4. **Accessibility coverage (FM13)** — added Playwright keyboard-navigation and reduced-motion tests (desktop + mobile).
5. **Six-scenario comparison (FM4)** — added `tests/scenarios.test.ts` that prints a readable table and asserts identical destination + capstone across all six profiles while prerequisites/emphasis differ.

## Six-scenario plan comparison (from `tests/scenarios.test.ts`)

```
scenario              bridges  standard  revision  depth  ~hours  destComp  capstone
1-complete-beginner   3        30        0         0      89      18        yes
2-programmer-no-web   1        30        0         0      84.5    18        yes
3-frontend-dev        0        30        0         0      82.5    18        yes
4-backend-cloud       0        28        2         2      78.9    18        yes
5-data-engineer       0        29        1         1      81      18        yes
6-ml-practitioner     0        22        8         8      69.6    18        yes
```

All profiles converge on the same 18 destination competencies + capstone; prerequisites
and revision lanes differ appropriately (beginner gets the most bridges; the ML
practitioner earns the most revision lanes and the shortest estimated time).

Note: the frontend-dev profile self-reported moderate Python ("can read and tweak
code") and marked the Python diagnostic "unsure", so Python scored *ready-to-learn*
rather than *needs-foundation* — the scorer only forces a bridge on the lowest
self-report level. This is intentional (§3: don't force every learner through every
prerequisite), not a defect.

## Remaining blockers (external only)

- **Live AI in production:** the deployed app has no OpenRouter key set in Vercel, so
  AI runs in deterministic-fallback mode in production. Enabling it requires adding
  `OPENROUTER_API_KEY` + `AI_PERSONALIZATION_ENABLED=true` (and optional bounds) to the
  Vercel project env — a consequential action needing the owner's decision.
- **Key rotation:** the OpenRouter key shared earlier is exposed and should be rotated
  before use in production.
- **Push/deploy:** pushing repairs to `main` auto-deploys via the GitHub integration;
  awaiting owner authorization.

No code-level blockers remain. All independent work is complete and verified.
