"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppUser as useUser } from "@/lib/app-auth";
import {
  Calendar, MapPin, Users, Wallet, TrendingUp, TrendingDown,
  Plane, MessageCircle, Receipt, UserPlus, CheckCircle2,
  Sparkles, ArrowUpRight, Bell, Plus, Clock, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


type Trip = {
  id: string;
  destination: string;
  days: string;
  budget: string;
  created_at: string;
  plan?: any;
};

type BuddyProfile = {
  id: string;
  name: string;
  avatar_initials: string;
  gradient: string;
  city: string;
};

type SavedBuddy = {
  saved_user_id: string;
  buddy_profiles: BuddyProfile;
};

const GRADIENTS = [
  "from-primary to-primary-glow",
  "from-accent to-primary",
  "from-primary-glow to-accent",
  "from-primary to-accent",
  "from-primary-glow to-primary",
];

const Avatar = ({
  initials, gradient, size = "md",
}: {
  initials: string; gradient: string; size?: "sm" | "md" | "lg";
}) => {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-11 w-11 text-xs", lg: "h-14 w-14 text-sm" };
  return (
    <div className={cn(
      "grid place-items-center rounded-full bg-gradient-to-br font-semibold text-primary-foreground shadow-glow shrink-0",
      sizes[size], gradient
    )}>
      {initials}
    </div>
  );
};

const getImage = (destination: string) =>
  `https://picsum.photos/seed/${destination.replace(/\s/g, "")}/900/500`;

const statusColor = (i: number) =>
  i === 0 ? "bg-primary/90 text-primary-foreground" : "bg-background/80 text-foreground";

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const userId = user?.id ?? "";
  const userName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Traveller";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedBuddies, setSavedBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container pt-32">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Checking sign-in status...
          </div>
        </main>
      </div>
    );
  }

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchTrips(), fetchBuddies()]);
    setLoading(false);
  }

  async function fetchTrips() {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6);
    setTrips(data ?? []);
  }

  async function fetchBuddies() {
    const { data } = await supabase
      .from("saved_buddies")
      .select("saved_user_id, buddy_profiles!saved_buddies_saved_user_id_fkey(*)")
      .eq("saver_user_id", userId)
      .limit(5);

    if (data) {
      const profiles = data
        .map((r: any) => r.buddy_profiles)
        .filter(Boolean);
      setSavedBuddies(profiles);
    }
  }

  // Stats derived from real data
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget ?? 0), 0);
  const upcomingCount = trips.length;

  const statCards = [
    { icon: Plane, label: "Upcoming trips", value: String(upcomingCount), hint: "from your plans", tone: "primary" },
    { icon: Users, label: "Travel buddies", value: String(savedBuddies.length), hint: "saved buddies", tone: "accent" },
    { icon: Wallet, label: "Total budget", value: `₹${totalBudget.toLocaleString()}`, hint: "across all trips", tone: "primary" },
    { icon: TrendingUp, label: "Avg per trip", value: upcomingCount ? `₹${Math.round(totalBudget / upcomingCount).toLocaleString()}` : "—", hint: "budget average", tone: "primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pb-10 pt-28">
        <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-mesh)" }} />
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar initials={userInitials} gradient="from-primary to-primary-glow" size="lg" />
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Dashboard
                </span>
                <h1 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, <span className="text-gradient">{userName}</span> 👋
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  You have{" "}
                  <span className="font-semibold text-foreground">{upcomingCount} trips</span>{" "}
                  and{" "}
                  <span className="font-semibold text-foreground">{savedBuddies.length} saved buddies</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="relative rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="hero" className="rounded-xl shadow-glow" onClick={() => router.push("/plan-trip")}>
                <Plus className="h-4 w-4" /> New trip
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl",
                    s.tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent")}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight tabular-nums">{s.value}</div>
                <div className="mt-0.5 text-sm font-medium">{s.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">

            {/* Trips */}
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">Your trips</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">All your planned adventures</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link href="/trips">View all</Link>
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : trips.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground text-sm">No trips yet.</p>
                  <Button variant="hero" className="mt-4 rounded-xl" onClick={() => router.push("/plan-trip")}>
                    Plan your first trip ✨
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                  {trips.map((t, i) => (
                    <Link href={`/trips/${t.id}`} key={t.id}
                      className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card">
                      <div className="relative h-36 overflow-hidden">
                        <img src={getImage(t.destination)} alt={t.destination} loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                        <span className={cn(
                          "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md",
                          statusColor(i)
                        )}>
                          {i === 0 ? "Latest" : "Planning"}
                        </span>
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md">
                          <Clock className="h-3 w-3" /> {t.days}d
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
                          <div className="inline-flex items-center gap-1 text-[11px] opacity-90">
                            <MapPin className="h-3 w-3" /> {t.destination}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(t.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                          <span className="font-semibold text-primary">₹{Number(t.budget).toLocaleString()}</span>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Planning progress</span>
                            <span className="font-semibold text-foreground">
                              {t.plan ? "100%" : "60%"}
                            </span>
                          </div>
                          <Progress value={t.plan ? 100 : 60} className="h-1.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses overview — static visual, real budget data */}
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">Budget overview</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Across all your trips</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link href="/expenses">Open</Link>
                </Button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <TrendingUp className="h-4 w-4" /> Total budget
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold tabular-nums">
                    ₹{totalBudget.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">across {upcomingCount} trips</div>
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                    <TrendingDown className="h-4 w-4" /> Avg per day
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold tabular-nums">
                    ₹{trips.length ? Math.round(totalBudget / trips.reduce((s, t) => s + Number(t.days ?? 1), 0)).toLocaleString() : "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">estimated daily</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-secondary/60 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Wallet className="h-4 w-4" /> Total days
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold tabular-nums">
                    {trips.reduce((s, t) => s + Number(t.days ?? 0), 0)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">days of travel planned</div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Budget by category (estimated)</span>
                    <span className="font-semibold text-foreground">All trips</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    <span className="bg-primary" style={{ width: "40%" }} />
                    <span className="bg-primary-glow" style={{ width: "25%" }} />
                    <span className="bg-accent" style={{ width: "20%" }} />
                    <span className="bg-secondary-foreground/30" style={{ width: "15%" }} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                    {[["Stays","40%","bg-primary"],["Food","25%","bg-primary-glow"],["Activities","20%","bg-accent"],["Other","15%","bg-secondary-foreground/30"]].map(([k,v,c]) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", c)} />
                        <span className="text-muted-foreground">{k}</span>
                        <span className="ml-auto font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Saved buddies */}
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">Travel buddies</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{savedBuddies.length} saved</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link href="/buddies">All</Link>
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : savedBuddies.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No saved buddies yet.<br />
                  <Link href="/buddies" className="text-primary font-medium">Find some →</Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {savedBuddies.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 p-4 transition-smooth hover:bg-secondary/30">
                      <div className="relative">
                        <Avatar initials={b.avatar_initials ?? b.name.slice(0,2).toUpperCase()}
                          gradient={b.gradient ?? GRADIENTS[0]} size="md" />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{b.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{b.city}</div>
                      </div>
                      <Link href="/buddies"
                        className="grid h-9 w-9 place-items-center rounded-xl bg-secondary transition-smooth hover:bg-primary hover:text-primary-foreground">
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <Link href="/buddies"
                className="block w-full border-t border-dashed border-border p-4 text-center text-sm font-medium text-muted-foreground transition-smooth hover:bg-primary/5 hover:text-primary">
                <UserPlus className="mr-1.5 inline h-4 w-4" /> Find more buddies
              </Link>
            </div>

            {/* Recent activity — derived from trips */}
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
              <div className="border-b border-border/60 p-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" /> Recent activity
                </h2>
              </div>
              <ol className="p-2">
                {trips.slice(0, 5).map((t, i) => {
                  const icons = [Plane, Receipt, CheckCircle2, MapPin, Calendar];
                  const colors = ["bg-primary/10 text-primary","bg-accent/15 text-accent","bg-primary-glow/15 text-primary","bg-secondary text-foreground/70","bg-primary/10 text-primary"];
                  const Icon = icons[i % icons.length];
                  return (
                    <li key={t.id} className="flex items-start gap-3 rounded-2xl p-3 transition-smooth hover:bg-secondary/40">
                      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", colors[i % colors.length])}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-snug">
                          Trip to {t.destination} planned
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.days} days · ₹{Number(t.budget).toLocaleString()} ·{" "}
                          {new Date(t.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {trips.length === 0 && !loading && (
                  <li className="p-4 text-center text-sm text-muted-foreground">No activity yet.</li>
                )}
              </ol>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
