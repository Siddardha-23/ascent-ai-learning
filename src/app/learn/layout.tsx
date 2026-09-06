import { redirect } from "next/navigation";
import { getSelectedProfile } from "@/lib/profile";
import { CONTENT_VERSION } from "@/lib/content/content";
import { ProgressProvider } from "@/lib/progress/client-store";
import { LearnShell } from "@/components/LearnShell";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSelectedProfile();
  if (!profile) redirect("/");

  // Server default timezone; the client refines it from the browser.
  const timezone = "UTC";

  return (
    <ProgressProvider
      profileId={profile.id}
      displayName={profile.displayName}
      contentVersion={CONTENT_VERSION}
      timezone={timezone}
    >
      <LearnShell displayName={profile.displayName}>{children}</LearnShell>
    </ProgressProvider>
  );
}
