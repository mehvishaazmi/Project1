"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import {
  adminEmail,
  adminPassword,
  demoAdminUser,
  demoUser,
} from "@/lib/demo-mode";
import { setStoredDemoUser } from "@/lib/app-auth";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const continueWithEmail = () => {
    const normalizedEmail =
      email.trim().toLowerCase();
    const isAdminEmail =
      normalizedEmail === adminEmail;

    if (
      isAdminEmail &&
      password !== adminPassword
    ) {
      setError("Enter the correct admin password.");
      return;
    }

    setError("");

    const user =
      isAdminEmail
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

    setStoredDemoUser(user);

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
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use your email to continue. Admin access requires the admin password.
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
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            continueWithEmail();
          }
        }}
        className="mb-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        placeholder="you@example.com"
      />

      <label
        htmlFor="demo-password"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Password
      </label>

      <input
        id="demo-password"
        type="password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            continueWithEmail();
          }
        }}
        className="mb-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        placeholder={
          email.trim().toLowerCase() === adminEmail
            ? "Admin password"
            : "Optional for travelers"
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

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
