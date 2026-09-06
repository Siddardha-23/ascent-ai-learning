# Your Ascent implementation package

This package gives Kiro the researched course content and a concrete application specification. **It is an implementation package, not a finished or deployed application.**

## Use it with Kiro

1. Extract the complete ZIP into a project folder and open that folder in Kiro. Keep the dot-prefixed .kiro folder.
2. Open KIRO-PROMPT.md, copy everything after its title, and paste it into Kiro.
3. Let Kiro read the supplied content and specifications, then implement the app. If its spec workflow pauses for review, review the concrete specification and tell it to execute the tasks.
4. Connect the chosen Vercel storage configuration when deployment is ready. No credentials are included in this package.

Kiro's [Specs documentation](https://kiro.dev/docs/specs/) describes requirements, design and task files. Its [Steering documentation](https://kiro.dev/docs/steering/) explains the repository instructions included here.

## What is included

- **KIRO-PROMPT.md:** the complete implementation prompt.
- **CURRICULUM.md:** the complete course, readable without any app.
- **curriculum.json:** canonical seed content for all 30 lessons and 240 task records.
- **SOURCES.md / sources.json:** 77 source records, with assignments, dates where recorded, source limitations and original video links.
- **glossary.json / TOPIC-MAP.md:** terminology and coverage, including optional advanced branches.
- **.kiro/specs/ascent/:** requirements, architecture and implementation tasks.
- **.kiro/steering/:** persistent product and teaching requirements.
- **starter-labs/:** fictional support documents, development/holdout question sets, and a runnable keyword baseline.
- **validate-package.py:** structural checks for the package.

## Learning expectations

The course estimates **82.5 core hours**, normally 2.5–3 hours per learning day. A day can take several sessions. Optional full courses, papers, training runs and cloud setup add time. Start at your existing Python/API knowledge; unfamiliar math has explicit prerequisite support.

The target is a substantial practical foundation and a tested prototype, with advanced concepts introduced in context. No honest 30-day plan can establish mastery of every AI discipline. Your progress will be demonstrated by working artifacts and the ability to explain decisions.

The portal needs no model API key. Most initial labs are local; later live model calls and cloud experiments can have costs. Use one provider and one cloud for the core implementation and compare the others. Any mock or unexecuted experiment must be labeled.

## Login and storage, kept simple

Choose Harshith or Aparna. They have separate progress, but anyone with app access can select either name. This is intentionally simple profile selection, not private account authentication.

Kiro should implement server-side private Blob persistence with explicit conflict handling and a local development fallback. Cloud persistence remains unverified until connected and tested in the actual app. A Postgres adapter is an alternative if the project already has an appropriate Vercel Marketplace integration.

## Read the curriculum now

Open CURRICULUM.md and begin day 1. The included baseline runs with Python's standard library:

```text
python starter-labs/baseline.py --split dev
python validate-package.py
```

On Windows, `py` may be used instead of `python`. Run from the extracted package root. Save results to your own lab notebook; the script prints JSON and does not change the supplied fixtures. The holdout is reserved for the frozen capstone, not prompt tuning.

Research checked 5 September 2026. Resources can change; the package records the sources consulted, not a promise that every future SDK snippet will remain valid.

