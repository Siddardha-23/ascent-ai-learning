# Paste this prompt into Kiro

Build **Ascent**, a polished personal AI learning application for **Harshith and Aparna**, using the complete curriculum and specifications in this folder. Implement the application, not a landing page, a wireframe, an empty learning-management shell or another plan.

## Read the supplied package first

Read START-HERE.md, curriculum.json, sources.json, glossary.json, TOPIC-MAP.md, and .kiro/specs/ascent/{requirements.md,design.md,tasks.md}. CURRICULUM.md is the human-readable edition of curriculum.json. The JSON is the canonical seed content. The .kiro/steering files preserve the product and teaching requirements.

The package contains 30 fully authored learning units, explanations, examples, labs, acceptance checks, knowledge checkpoints, resource assignments and references. Do not replace them with short generic summaries, placeholder cards, invented links or runtime AI-generated lessons. Import all content faithfully, preserving stable IDs and source metadata.

## Who this is for

I know Python, AWS/GCP basics, Flask, backend APIs, the web request lifecycle, Docker and some Kubernetes/Helm. I am starting AI from scratch: ML, math, weights, neural networks and transformers cannot be assumed. I want practical skill and the ability to design useful systems, not interview cramming.

The 30 days are sequential learning units, not calendar deadlines. I can take multiple sessions to finish a day. The core course estimates 82.5 hours total; optional advanced study adds time. Do not claim mastery of all AI in a month.

Keep the progression: backend bridge → math and ML → neural networks → tokens and transformers → model lifecycle and APIs → prompting → embeddings and RAG → vector and knowledge graphs → plain Python tool loop → LangChain → LangGraph → memory and durable approvals → MCP/A2A and multi-agent systems → evaluation/security → caching/scaling → multimodal/tuning → cloud deployment → tested capstone and innovation.

## Build this experience

1. Opening screen: two clear profile buttons, Harshith and Aparna. One click opens that person's learning dashboard. No email, registration or password flow. This is profile selection, not secure authentication; anyone with access to the app can choose either profile. Explain that once in a small useful note, not a modal or repeated warning.
2. Dashboard: continue the next incomplete task, actual progress, completed learning days, logged study time, calendar activity, weekly learning target and milestone evidence. Empty profiles start at zero. Encourage returning without shame or countdown pressure.
3. Course map: all 30 units grouped into four phases, with prerequisites, estimated effort, real completion state and a link to each lesson. Browsing ahead is allowed with a prerequisite hint.
4. Lesson workspace: prerequisite bridge, plain explanation, real-world analogy, goals, topics, purposeful resources, step-by-step lab, acceptance checks, self-assessed knowledge checkpoint, evidence note, reflection and optional depth. Save exact task progress and notes. Keep the main reading column comfortable and the next action visible.
5. Resources: searchable by topic, type and publisher; show core versus optional assignments, reading instructions, source title, direct URL, publisher, available date and date checked. Video embeds may fail; always provide the original link. Do not claim a video is complete because a link was clicked.
6. Glossary and topic map: searchable definitions, examples and lesson links. Clearly distinguish LangChain, LangGraph, LangSmith, model APIs, vector databases, knowledge graphs, computation graphs, workflow graphs, memory and different caches.
7. Project/evidence view: collect lab evidence, code URLs or filenames, reflections, competency levels and capstone artifacts. Distinguish self-reported completion from verified test results.
8. Settings: choose a weekly target, correct study-time entries, export/import a versioned progress backup, and switch profiles. Include a carefully confirmed per-profile reset with backup offered; never silently erase another profile.
9. Small learning aids: a transparent context-budget worksheet, weighted-sum/attention examples and graph comparison diagrams where they improve understanding. Do not fake provider tokenization or present simulation outputs as live model results.
10. The full learning app must work without model API keys. Python/agent experiments are course labs run by the learner, not arbitrary code executed by the web server. A live AI tutor is outside this initial scope.

## Design direction

Use a calm, focused developer learning studio: deep navy navigation, crisp light reading surfaces, restrained blue actions and green progress accents. Prioritize excellent typography, readable code, purposeful spacing and a coherent lesson layout. Avoid an oversized marketing hero, fake analytics, stock AI imagery, neon gradients everywhere or dense cards that obscure the course.

Make it responsive on phones, tablets and desktops. Use semantic controls, keyboard navigation, visible focus, good contrast, accessible status announcements and reduced-motion support. Provide useful loading, empty, failed-save, offline and conflict states.

## Implementation and persistence

Use current stable Next.js App Router + TypeScript + React, with accessible UI primitives, validated content schemas and a maintained test setup. Use the existing project's compatible stack if one is already present. Read current framework and SDK docs; lock versions and preserve the lockfile. The portal runs on Vercel. Python remains the language of the labs.

Implement a ProgressRepository interface with a real Vercel private Blob adapter and a clearly labeled local development adapter. Prefer the existing private Blob store when available. Read the supplied design for revision checks, fresh reads, creation races, profile namespaces and recoverable save behavior. All credentials remain server-side. A browser cache is not cloud synchronization.

If the account has only a public Blob store, do not put private notes into public objects. Finish the app with the local adapter and explain exactly which private storage configuration is needed, or use an already-authorized Vercel Marketplace Postgres integration behind the same repository interface. Never pretend unconfigured cloud persistence is working.

Name selection deliberately does not establish real user identity. A signed profile session can bind requests consistently but must not be described as proof of identity. This app is for a trusted personal deployment. Follow the supplied boundaries instead of adding an enterprise login system.

Content ships with the application; only learner state is mutable. Course updates must preserve task IDs or provide an explicit migration. Use atomic revision checks so two devices cannot silently overwrite each other's progress. Saving indicators must reflect the actual storage mode and outcome.

## Content and scientific accuracy

Cover every supplied lesson and topic. Papers and deep extensions stay optional inside the same 30 units. Reuse the same fictional support corpus across labs. Add missing pedagogical detail only when needed, source it and preserve the authored sequence.

Never claim RAG, temperature zero, JSON schema, prompting, guardrails or a framework guarantees factual truth. Deterministic rules should handle exact calculations, permissions and policy gates. Show evidence, abstention and measurable reliability.

Teach one provider implementation in depth and compare OpenAI, Claude and Gemini contracts. Do not require three paid accounts. Teach one real cloud deployment when access is available and map AWS/GCP/Azure responsibilities. Distinguish designing a cloud architecture from executing a deployment.

Do not invent proprietary training details, enterprise adoption metrics, benchmark results, video durations or current prices. The first-party enterprise case studies include explicit limitations. Recheck rapidly changing APIs and mark inaccessible sources honestly.

## Complete the work

Follow the supplied tasks, refine the spec if implementation reveals a necessary detail, and proceed through the implementation rather than stopping after generating requirements. If your Kiro workflow requires an explicit spec approval, present the concrete completed spec; after approval, execute all tasks.

Implement content import and validation, complete UI, progress semantics, both storage modes, backups, tests and deployment documentation. Run the relevant unit/integration/end-to-end checks, a production build and responsive/accessibility verification. Record what actually ran.

Use no fabricated completion data. Do not leave later days as placeholders or mark unimplemented tasks done. If credentials are missing, complete all independent implementation and local testing, then report the exact remaining configuration step. Ask me only for information or permission truly needed for a consequential external action; do not invent secrets or provision paid infrastructure silently.

At handoff, give me the runnable app, concise setup and Vercel instructions, passing/failing checks, exact storage mode, known limitations and a deployed URL only if deployment was actually completed. Verify persistence by save → reload → profile switch → independent session, including a concurrent-edit conflict. Show the finished learning workspace.

