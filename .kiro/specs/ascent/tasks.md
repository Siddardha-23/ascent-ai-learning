# Ascent implementation tasks

These tasks are pending for Kiro. Do not mark a task complete unless its implementation and relevant checks are done.

## 1. Establish the project

- [ ] Read the full package; inspect existing project instructions and preserve compatible conventions.
- [ ] Create or confirm the Next.js/TypeScript project, dependency lock and scripts.
- [ ] Copy/import canonical course, source and glossary content without shortening it.
- [ ] Implement runtime/build-time schemas and run the supplied package validator.
- [ ] Apply the shared visual tokens and create the two-profile entry screen.

## 2. Build the complete learning experience

- [ ] Dashboard with real empty state, resume action and derived progress.
- [ ] All 30 lessons, four phases and prerequisite navigation.
- [ ] Full lesson workspace: every supplied content field, resource assignment, lab and checkpoint.
- [ ] Task toggles, acceptance attestations, notes, evidence, reflection and competency self-assessment.
- [ ] Resource search, glossary search and topic/coverage view.
- [ ] Project evidence collection and milestone views.
- [ ] Study-session entry/correction and weekly-target settings.
- [ ] Educational context/weighted-sum/attention aids and meaningful architecture diagrams.
- [ ] Responsive layouts, keyboard behavior and all specified empty/error states.

## 3. Implement state and persistence

- [ ] Define the validated LearnerState and ProgressRepository contracts.
- [ ] Local development adapter with honest device-local status and corruption recovery.
- [ ] Server progress API with allowlisted profiles and content IDs, bounded inputs and safe errors.
- [ ] Server-only private Blob adapter using current supported SDK features.
- [ ] Fresh reads, first-create collision handling and revision-checked updates.
- [ ] Local draft recovery, serialized/debounced saves and protection from stale cross-profile responses.
- [ ] Conflict UX preserving local and remote work.
- [ ] Versioned backup export/import, preview and explicit replacement confirmation.
- [ ] Per-profile reset with backup opportunity.
- [ ] Preserve stable IDs and implement content-version migration behavior.

## 4. Verify functionality

- [ ] Content integrity: exactly 30 lessons, complete fields, resolvable sources, unique IDs.
- [ ] Completion and reversal rules, no duplicate task counts and no optional-task penalty.
- [ ] Reload and profile separation, including notes and late network responses.
- [ ] Two simultaneous writers, concurrent creation, stale revisions and lost responses.
- [ ] Offline/storage-error draft recovery and no misleading saved status.
- [ ] Backup round-trip, invalid schema, unsafe URL and wrong-profile import behavior.
- [ ] Study-session totals and timezone boundary behavior.
- [ ] Checkpoint self-review and evidence requirements.
- [ ] Browser flows at mobile/tablet/desktop, keyboard/focus and accessible status.
- [ ] Production build and applicable lint/type checks.

## 5. Prepare deployment and handoff

- [ ] Add a documented .env.example without secrets.
- [ ] Document local run, private Blob connection, authorized Postgres alternative, backup and rollback.
- [ ] Verify selected Vercel project/account before external deployment.
- [ ] If storage is configured, run a real save/read/reload/independent-session smoke test.
- [ ] If deployment is authorized and configured, deploy and verify the preview URL.
- [ ] Otherwise report exactly what remains unconfigured; do not label local mode as cloud sync.
- [ ] Deliver finished UI, source, setup, test evidence and honest limitations.

## Completion rule

The portal is complete only when all required functionality is implemented and verified. Configuration-dependent cloud steps may be reported as pending, but all independent work must be done. The provided course labs are learning tasks; implementing the portal does not mean the learner has completed them.

