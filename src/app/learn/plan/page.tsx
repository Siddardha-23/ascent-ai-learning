import { Suspense } from "react";
import { PlanView } from "@/components/plan/PlanView";

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded bg-surface-sunken" />}>
      <PlanView />
    </Suspense>
  );
}
