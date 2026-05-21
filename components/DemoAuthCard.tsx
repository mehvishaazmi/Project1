"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import {
  adminEmail,
  demoAdminUser,
  demoUser,
} from "@/lib/demo-mode";

type DemoAuthCardProps = {
  mode: "sign-in" | "sign-up";
};

export default function DemoAuthCard({
  mode,
}: DemoAuthCardProps) {
  const router = useRouter();

  const isSignUp = mode === "sign-up";

  const [email, setEmail] =
    useState(demoUser.email);

  const continueWithEmail = () => {
    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      normalizedEmail === adminEmail
        ? demoAdminUser
        : {
            ...demoUser,
            email:
              normalizedEmail ||
              demoUser.email,
            name:
              normalizedEmail
                .split("@")[0]
                ?.replace(/[._-]/g, " ")
                ?.replace(/\b\w/g, (letter) =>
                  letter.toUpperCase(),
                ) || demoUser.name,
          };

    window.localStorage.setItem(
      "travelbuddy-demo-user",
      JSON.stringify(user),
    );
    router.push(
      user.email === demoAdminUser.email
        ? "/admin"
        : "/dashboard",
    );
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500 text-xl font-bold text-white shadow-lg">
          T
        </div>
        <h1 className="text-2xl font-bold text-slate-950">
          {isSignUp ? "Create demo account" : "Sign in to demo"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Offline demo mode uses a local sample profile, so no internet auth is
          required.
        </p>
      </div>

      <label
        htmlFor="demo-email"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Email
      </label>

      <input
        id="demo-email"
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            continueWithEmail();
          }
        }}
        className="mb-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        placeholder="you@example.com"
      />

      <button
        type="button"
        onClick={continueWithEmail}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-600"
      >
        {isSignUp ? (
          <UserPlus className="h-4 w-4" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Continue
      </button>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Use admin@gmail.com to open the admin section.
      </p>
    </div>
  );
}
