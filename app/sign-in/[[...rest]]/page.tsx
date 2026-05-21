import { SignIn } from "@clerk/nextjs";
import DemoAuthCard from "@/components/DemoAuthCard";
import { isDemoMode } from "@/lib/demo-mode";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">

      {/* Background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "var(--gradient-mesh)",
        }}
      />

      {/* Clerk Sign In */}
      <div className="relative z-10">
        {isDemoMode ? (
          <DemoAuthCard mode="sign-in" />
        ) : (
          <SignIn
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        )}
      </div>

    </div>
  );
}
