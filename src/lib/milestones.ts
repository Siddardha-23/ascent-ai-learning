import { getLessons } from "@/lib/content/content";
import { evaluateDay, getDayState } from "@/lib/progress/completion";
import type { LearnerState } from "@/lib/progress/schema";

export interface Milestone {
  day: number;
  label: string;
}

/** Milestones from CURRICULUM.md. */
export const MILESTONES: Milestone[] = [
  { day: 8, label: "Explain weights, training, tokens and attention; run small models." },
  { day: 16, label: "Build retrieval and cited answers; justify vectors vs graphs." },
  { day: 23, label: "Build bounded tools, LangChain/LangGraph, memory and evaluations." },
  { day: 30, label: "Demonstrate a tested prototype and design a new experiment." },
];

/** Whether every lesson up to and including `day` is complete. */
export function milestoneReached(state: LearnerState, day: number): boolean {
  const lessons = getLessons().filter((l) => l.day <= day);
  return lessons.every((l) => evaluateDay(l, getDayState(state, l.id)).complete);
}

export function nextMilestone(state: LearnerState): Milestone | null {
  for (const m of MILESTONES) {
    if (!milestoneReached(state, m.day)) return m;
  }
  return null;
}
