import { notFound } from "next/navigation";
import { prerequisiteModules, getPrerequisiteModule } from "@/lib/content/v2-content";
import { PrerequisiteView } from "@/components/PrerequisiteView";

export function generateStaticParams() {
  return prerequisiteModules.map((m) => ({ id: m.id }));
}

export default async function PrerequisitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = getPrerequisiteModule(id);
  if (!mod) notFound();
  return <PrerequisiteView module={mod} />;
}
