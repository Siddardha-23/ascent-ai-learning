import { ResourcesBrowser } from "@/components/ResourcesBrowser";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Resources</h1>
        <p className="mt-1 max-w-reading text-sm text-ink-muted">
          Every source used across the course, with publisher, type, dates and
          the days that assign it. Links may change over time; the original URL
          is always shown. Opening a link never marks it complete.
        </p>
      </div>
      <ResourcesBrowser />
    </div>
  );
}
