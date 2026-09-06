import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center"
    >
      <h1 className="text-2xl font-bold text-navy">Page not found</h1>
      <p className="text-sm text-ink-muted">
        That page or learning unit doesn&apos;t exist. Days run from 1 to 30.
      </p>
      <Link
        href="/learn"
        className="rounded-lg bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
