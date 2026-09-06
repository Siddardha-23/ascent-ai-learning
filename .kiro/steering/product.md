---
inclusion: always
---
# Ascent product intent

Build the personal learning portal described in KIRO-PROMPT.md and .kiro/specs/ascent/. The users are Harshith and Aparna. Name-only profile selection is intentional. Do not add registration or password complexity.

Use curriculum.json as canonical course content. Preserve all 30 learning units, task IDs, authored explanations, labs, checkpoints, citations and optional extensions. Content is not generated at runtime. The app works without model API keys.

A learning day is self-paced, not a deadline. Show actual progress and evidence; never seed fake completion or streaks. The objective is practical understanding, not interview-only preparation or claims of universal AI mastery.

Use Vercel for the portal. Separate course content, learner state and learner-run Python labs. A configured private Blob adapter provides persistence; local mode must be clearly labeled.

