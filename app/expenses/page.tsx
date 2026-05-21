"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Plus, Receipt, Users, ArrowRight, Check, TrendingUp, TrendingDown,
  Calendar, Tag, Wallet, Send, CreditCard, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAppUser as useUser } from "@/lib/app-auth";


// ── Types ──────────────────────────────────────────────────────────────────
type Member = { id: string; name: string; initials: string; gradient: string };
type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  paidBy: string;       // member id
  paid_by_name: string;
  date: string;
  splitWith: string[];  // member ids
  split_count: number;
};
type Trip = { id: string; destination: string; days: string; budget: string; created_at: string };

const categories = ["Stay", "Food", "Transport", "Activity", "Shopping", "Other"];

const categoryColors: Record<string, string> = {
  Stay: "bg-primary/10 text-primary",
  Food: "bg-accent/15 text-accent",
  Transport: "bg-primary-glow/15 text-primary",
  Activity: "bg-secondary text-foreground/70",
  Shopping: "bg-accent/10 text-accent",
  Other: "bg-muted text-muted-foreground",
};

const GRADIENTS = [
  "from-primary to-primary-glow",
  "from-accent to-primary",
  "from-primary-glow to-accent",
  "from-primary to-accent",
];

// ── Component ──────────────────────────────────────────────────────────────
const Expenses = () => {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const userName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "You";
  const userInitials = userName.slice(0, 2).toUpperCase();

  // Real data state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savedBuddies, setSavedBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("u1");
  const [category, setCategory] = useState("Food");
  const [adding, setAdding] = useState(false);

  // ── Build members list from real data ──────────────────────────────────
  const members: Member[] = useMemo(() => {
    const you: Member = { id: "u1", name: userName, initials: userInitials, gradient: GRADIENTS[0] };
    const buddyMembers: Member[] = savedBuddies.map((b, i) => ({
      id: b.user_id ?? `buddy_${i}`,
      name: b.name,
      initials: b.avatar_initials ?? b.name.slice(0, 2).toUpperCase(),
      gradient: b.gradient ?? GRADIENTS[(i + 1) % GRADIENTS.length],
    }));
    return [you, ...buddyMembers.slice(0, 3)]; // max 4 members
  }, [savedBuddies, userName, userInitials]);

  const memberById = (id: string) =>
    members.find((m) => m.id === id) ?? members[0];

  // ── Fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchTrips(), fetchBuddies()]);
    setLoading(false);
  }

  async function fetchTrips() {
    const { data } = await supabase
      .from("trips")
      .select("id, destination, days, budget, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const list = data ?? [];
    setTrips(list);
    if (list.length > 0) {
      setSelectedTripId(list[0].id);
      await fetchExpenses(list[0].id);
    }
  }

  async function fetchBuddies() {
    const { data } = await supabase
      .from("saved_buddies")
      .select("saved_user_id, buddy_profiles(*)")
      .eq("saver_user_id", userId)
      .limit(3);
    if (data) {
      setSavedBuddies(
        data.map((r: any) => r.buddy_profiles).filter(Boolean)
      );
    }
  }

  async function fetchExpenses(tripId: string) {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    const mapped: Expense[] = (data ?? []).map((e: any) => ({
      id: e.id,
      description: e.title,
      category: e.category ?? "Other",
      amount: Number(e.amount),
      paidBy: e.user_id === userId ? "u1" : (e.paid_by_name ?? "u2"),
      paid_by_name: e.paid_by_name ?? userName,
      date: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      splitWith: members.map((m) => m.id),
      split_count: e.split_count ?? members.length,
    }));
    setExpenses(mapped);
  }

  async function handleTripChange(tripId: string) {
    setSelectedTripId(tripId);
    setLoading(true);
    await fetchExpenses(tripId);
    setLoading(false);
  }

  // ── Add expense ─────────────────────────────────────────────────────────
  async function handleAdd() {
    const value = parseFloat(amount);
    if (!desc.trim() || !value || value <= 0) {
      toast.error("Add a description and amount");
      return;
    }
    if (!selectedTripId) {
      toast.error("Please select a trip first");
      return;
    }
    setAdding(true);

    const paidByMember = memberById(paidBy);
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        trip_id: selectedTripId,
        user_id: userId,
        title: desc.trim(),
        amount: value,
        category,
        paid_by_name: paidByMember.name,
        split_count: members.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add expense");
    } else {
      const newExp: Expense = {
        id: data.id,
        description: data.title,
        category: data.category ?? "Other",
        amount: Number(data.amount),
        paidBy,
        paid_by_name: data.paid_by_name ?? userName,
        date: new Date(data.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        splitWith: members.map((m) => m.id),
        split_count: data.split_count ?? members.length,
      };
      setExpenses((prev) => [newExp, ...prev]);
      toast.success("Expense added", { description: `${desc} · ₹${value.toFixed(2)}` });
    }

    setDesc(""); setAmount(""); setOpen(false); setAdding(false);
  }

  // ── Settle ──────────────────────────────────────────────────────────────
  async function handleSettle(from: string, to: string, amt: number) {
    const fromMember = memberById(from);
    const toMember = memberById(to);
    const { data } = await supabase
      .from("expenses")
      .insert({
        trip_id: selectedTripId,
        user_id: userId,
        title: `Settlement · ${fromMember.name} → ${toMember.name}`,
        amount: amt,
        category: "Other",
        paid_by_name: fromMember.name,
        split_count: 1,
      })
      .select()
      .single();

    if (data) {
      const settlementExp: Expense = {
        id: data.id,
        description: data.title,
        category: "Other",
        amount: amt,
        paidBy: from,
        paid_by_name: fromMember.name,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        splitWith: [to],
        split_count: 1,
      };
      setExpenses((prev) => [settlementExp, ...prev]);
    }
    toast.success("Marked as settled", {
      description: `₹${amt.toFixed(2)} from ${fromMember.name} to ${toMember.name}`,
    });
  }

  // ── Computed values ─────────────────────────────────────────────────────
  const balances = useMemo(() => {
    const net: Record<string, number> = Object.fromEntries(members.map((m) => [m.id, 0]));
    for (const e of expenses) {
      const share = e.amount / (e.split_count || members.length);
      net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
      for (const id of e.splitWith) net[id] = (net[id] ?? 0) - share;
    }
    return net;
  }, [expenses, members]);

  const settlements = useMemo(() => {
    const debtors = Object.entries(balances)
      .filter(([, v]) => v < -0.01)
      .map(([id, v]) => ({ id, amt: -v }))
      .sort((a, b) => b.amt - a.amt);
    const creditors = Object.entries(balances)
      .filter(([, v]) => v > 0.01)
      .map(([id, v]) => ({ id, amt: v }))
      .sort((a, b) => b.amt - a.amt);

    const result: { from: string; to: string; amount: number }[] = [];
    let i = 0; let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amt, creditors[j].amt);
      result.push({ from: debtors[i].id, to: creditors[j].id, amount: pay });
      debtors[i].amt -= pay; creditors[j].amt -= pay;
      if (debtors[i].amt < 0.01) i++;
      if (creditors[j].amt < 0.01) j++;
    }
    return result;
  }, [balances]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const yourShare = expenses.reduce(
    (s, e) => s + (e.splitWith.includes("u1") ? e.amount / (e.split_count || 1) : 0), 0
  );
  const yourNet = balances["u1"] ?? 0;

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  // ── Avatar ──────────────────────────────────────────────────────────────
  const Avatar = ({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) => {
    const m = memberById(id);
    const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-12 w-12 text-sm" };
    return (
      <div className={cn(
        "rounded-full bg-gradient-to-br grid place-items-center text-primary-foreground font-semibold shadow-glow shrink-0",
        sizes[size], m.gradient
      )}>
        {m.initials}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Group overview */}
      <section className="pt-28 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "var(--gradient-mesh)" }} />
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Group expenses
              </span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
                {selectedTrip ? selectedTrip.destination : "Your Trips"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {selectedTrip && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedTrip.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="h-4 w-4" /> Budget ₹{Number(selectedTrip.budget).toLocaleString()}
                    </span>
                  </>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {members.length} members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" /> {expenses.length} expenses
                </span>
              </div>

              {/* Trip selector */}
              {trips.length > 1 && (
                <div className="mt-4">
                  <Select value={selectedTripId} onValueChange={handleTripChange}>
                    <SelectTrigger className="w-64 rounded-xl h-10 border-border/60">
                      <SelectValue placeholder="Select trip" />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.destination}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {members.map((m) => (
                  <div key={m.id} className="ring-2 ring-background rounded-full">
                    <Avatar id={m.id} size="md" />
                  </div>
                ))}
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg" className="rounded-xl shadow-glow">
                    <Plus className="h-5 w-5" /> Add expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[460px] rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Add an expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                      <Input value={desc} onChange={(e) => setDesc(e.target.value)}
                        placeholder="e.g. Dinner at warung" className="mt-1.5 h-11 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (₹)</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00" className="pl-7 h-11 rounded-xl" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paid by</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {members.map((m) => (
                          <button key={m.id} onClick={() => setPaidBy(m.id)}
                            className={cn(
                              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-smooth",
                              paidBy === m.id
                                ? "bg-primary text-primary-foreground border-primary shadow-glow"
                                : "bg-secondary/60 border-transparent hover:bg-secondary"
                            )}>
                            <Avatar id={m.id} size="sm" /> {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
                      Split equally between all {members.length} members.
                    </div>
                  </div>
                  <DialogFooter className="mt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button variant="hero" onClick={handleAdd} disabled={adding} className="rounded-xl">
                      {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add expense"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stat cards — identical to original */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Wallet className="h-4 w-4" /> Total spent
              </div>
              <div className="mt-2 font-display text-3xl font-bold tracking-tight">₹{total.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">across {expenses.length} expenses</div>
            </div>
            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Receipt className="h-4 w-4" /> Your share
              </div>
              <div className="mt-2 font-display text-3xl font-bold tracking-tight">₹{yourShare.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((yourShare / Math.max(total, 1)) * 100).toFixed(0)}% of total
              </div>
            </div>
            <div className={cn("rounded-2xl border p-5 shadow-soft",
              yourNet >= 0 ? "bg-primary/5 border-primary/30" : "bg-accent/5 border-accent/30")}>
              <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
                yourNet >= 0 ? "text-primary" : "text-accent")}>
                {yourNet >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {yourNet >= 0 ? "You're owed" : "You owe"}
              </div>
              <div className="mt-2 font-display text-3xl font-bold tracking-tight">₹{Math.abs(yourNet).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Net balance after all splits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main grid — identical layout to original */}
      <section className="pb-24">
        <div className="container grid lg:grid-cols-[1.5fr_1fr] gap-6">

          {/* Expense list */}
          <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Expenses
              </h2>
              <span className="text-xs text-muted-foreground">Most recent first</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : expenses.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                No expenses yet for this trip.<br />
                <button onClick={() => setOpen(true)} className="mt-2 text-primary font-medium">Add the first one →</button>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {expenses.map((e) => {
                  const share = e.amount / (e.split_count || members.length);
                  const youOweThis = e.paidBy !== "u1" && e.splitWith.includes("u1");
                  return (
                    <li key={e.id} className="p-5 flex items-center gap-4 hover:bg-secondary/30 transition-smooth">
                      <span className={cn(
                        "grid place-items-center h-11 w-11 rounded-xl shrink-0",
                        categoryColors[e.category] ?? categoryColors.Other
                      )}>
                        <Tag className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{e.description}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Avatar id={e.paidBy} size="sm" />
                            {e.paid_by_name} paid
                          </span>
                          <span>·</span>
                          <span>{e.date}</span>
                          <span>·</span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground/70 text-[10px] font-medium">
                            {e.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-lg font-bold tabular-nums">₹{e.amount.toFixed(2)}</div>
                        <div className={cn("text-[11px] font-medium tabular-nums",
                          youOweThis ? "text-accent" : "text-muted-foreground")}>
                          {youOweThis
                            ? `you owe ₹${share.toFixed(2)}`
                            : e.paidBy === "u1"
                            ? `split / person ₹${share.toFixed(2)}`
                            : `split equally`}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <button onClick={() => setOpen(true)}
              className="w-full p-4 border-t border-dashed border-border text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-smooth flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add another expense
            </button>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Balance summary */}
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border/60">
                <h2 className="font-display text-lg font-semibold">Balance summary</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Net balance for each member</p>
              </div>
              <ul className="divide-y divide-border/60">
                {members.map((m) => {
                  const net = balances[m.id] ?? 0;
                  const positive = net >= 0;
                  return (
                    <li key={m.id} className="p-4 flex items-center gap-3">
                      <Avatar id={m.id} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.abs(net) < 0.01 ? "all settled" : positive ? "gets back" : "owes"}
                        </div>
                      </div>
                      <div className={cn("font-display text-base font-bold tabular-nums",
                        Math.abs(net) < 0.01 ? "text-muted-foreground" : positive ? "text-primary" : "text-accent")}>
                        {positive ? "+" : "-"}₹{Math.abs(net).toFixed(2)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Settle up */}
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border/60 gradient-soft">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Settle up
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Simplest way to clear all balances</p>
              </div>

              {settlements.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="grid mx-auto place-items-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    <Check className="h-6 w-6" />
                  </span>
                  <p className="mt-3 font-semibold">All settled up</p>
                  <p className="text-xs text-muted-foreground mt-1">No one owes anything right now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {settlements.map((s, i) => (
                    <li key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar id={s.from} size="md" />
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Avatar id={s.to} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-semibold">{memberById(s.from).name}</span>{" "}
                            <span className="text-muted-foreground">pays</span>{" "}
                            <span className="font-semibold">{memberById(s.to).name}</span>
                          </div>
                          <div className="font-display text-lg font-bold text-gradient tabular-nums">
                            ₹{s.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="hero" className="flex-1 rounded-xl"
                          onClick={() => handleSettle(s.from, s.to, s.amount)}>
                          <Check className="h-4 w-4" /> Mark settled
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl"
                          onClick={() => toast.success("Reminder sent", {
                            description: `${memberById(s.from).name} was nudged.`
                          })}>
                          <Send className="h-4 w-4" /> Remind
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Expenses;
