"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getUserEmail,
  useAppUser,
} from "@/lib/app-auth";
import { adminEmail } from "@/lib/demo-mode";
import {
  AdminTrackedUser,
  getTrackedUsers,
} from "@/lib/admin-users";
import { cn } from "@/lib/utils";

const statusStyles = {
  online: "bg-emerald-100 text-emerald-700",
  active: "bg-cyan-100 text-cyan-700",
  idle: "bg-amber-100 text-amber-700",
};

function formatLastSeen(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useAppUser();
  const [users, setUsers] = useState<AdminTrackedUser[]>([]);

  const email = getUserEmail(user).toLowerCase();
  const isAdmin = email === adminEmail;

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }

    setUsers(getTrackedUsers());
  }, [isLoaded, isAdmin, router]);

  const stats = useMemo(() => {
    const online = users.filter(
      (trackedUser) => trackedUser.status === "online",
    ).length;

    return {
      total: users.length,
      online,
      admins: users.filter(
        (trackedUser) => trackedUser.role === "admin",
      ).length,
    };
  }, [users]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container pt-32">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Checking admin access...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pb-20 pt-32">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              User status
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Dev-only view for accounts signed in as admin@gmail.com.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Total users",
              value: stats.total,
              icon: Users,
            },
            {
              label: "Online",
              value: stats.online,
              icon: Activity,
            },
            {
              label: "Admins",
              value: stats.admins,
              icon: ShieldCheck,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {item.label}
                </span>
                <item.icon className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="mt-3 text-3xl font-bold text-slate-950">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="grid grid-cols-[1.3fr_1fr_.7fr_.8fr] gap-4 border-b border-border bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>User</span>
            <span>Last page</span>
            <span>Status</span>
            <span>Last seen</span>
          </div>

          {users.map((trackedUser) => (
            <div
              key={trackedUser.id}
              className="grid grid-cols-[1.3fr_1fr_.7fr_.8fr] items-center gap-4 border-b border-border/70 px-5 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-500 text-sm font-bold text-white">
                  {trackedUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-950">
                      {trackedUser.name}
                    </span>
                    {trackedUser.role === "admin" && (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-600" />
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {trackedUser.email}
                  </div>
                </div>
              </div>

              <div className="truncate text-sm text-slate-600">
                {trackedUser.page}
              </div>

              <span
                className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  statusStyles[trackedUser.status],
                )}
              >
                {trackedUser.status}
              </span>

              <div className="text-sm text-slate-600">
                {formatLastSeen(trackedUser.lastSeen)}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-slate-500">
              <UserRound className="h-8 w-8 text-slate-400" />
              No tracked users yet.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
