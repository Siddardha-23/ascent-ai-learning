import { redirect } from "next/navigation";
import { getSelectedProfile } from "@/lib/profile";
import { ProfilePicker } from "@/components/ProfilePicker";
import { curriculum } from "@/lib/content/content";

export default async function HomePage() {
  const selected = await getSelectedProfile();
  if (selected) redirect("/learn");

  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12"
    >
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-action-soft">
            Ascent
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            A 30-day AI learning studio
          </h1>
          <p className="mt-3 text-navy-600 text-sm text-slate-300">
            From your Python and backend foundations to building measured,
            deployable AI agents. Self-paced — a day is a learning unit, not a
            deadline.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Enter your name to begin
          </h2>
          <ProfilePicker />
          <p className="mt-5 text-xs leading-relaxed text-slate-400">
            Typing a name simply opens that learning space and remembers your
            progress. This is not secure authentication — anyone with the link
            can enter any name, and the same name always opens the same space.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {curriculum.lessons.length} learning units · ~
          {curriculum.estimatedCoreHours} core hours · content version{" "}
          {curriculum.contentVersion}
        </p>
      </div>
    </main>
  );
}
