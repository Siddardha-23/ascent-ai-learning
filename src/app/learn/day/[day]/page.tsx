import { notFound } from "next/navigation";
import { getLessonByDay, getLessons } from "@/lib/content/content";
import { LessonWorkspace } from "@/components/LessonWorkspace";

export function generateStaticParams() {
  return getLessons().map((l) => ({ day: String(l.day) }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const dayNum = Number(day);
  if (!Number.isInteger(dayNum)) notFound();
  const lesson = getLessonByDay(dayNum);
  if (!lesson) notFound();

  return <LessonWorkspace lesson={lesson} />;
}
