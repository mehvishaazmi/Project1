import { Suspense } from "react";
import { PlanTripContent } from "./plan-trip-content";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function PlanTripPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlanTripContent />
    </Suspense>
  );
}
