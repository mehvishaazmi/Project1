"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAppUser as useUser } from "@/lib/app-auth";
import { Loader2, Plus, Trash2, Users, Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


type Expense = {
  id: string;
  title: string;
  amount: number;
  created_at: string;
};

export default function MyTripPage() {
  const params = useParams();
  const { user } = useUser();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [buddies, setBuddies] = useState<string[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [buddyName, setBuddyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user?.id || !id) return;
    fetchExpenses();
    fetchBuddies();
  }, [user?.id, id]);

  async function fetchExpenses() {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: true });
    setExpenses(data ?? []);
    setLoading(false);
  }

  async function fetchBuddies() {
    const { data } = await supabase
      .from("trip_buddies")
      .select("name")
      .eq("trip_id", id);
    if (data) setBuddies(data.map((b) => b.name));
  }

  async function addBuddy() {
    if (!buddyName.trim()) return;
    await supabase
      .from("trip_buddies")
      .insert({ trip_id: id, name: buddyName.trim() });
    setBuddies((p) => [...p, buddyName.trim()]);
    setBuddyName("");
  }

  async function removeBuddy(name: string) {
    await supabase
      .from("trip_buddies")
      .delete()
      .eq("trip_id", id)
      .eq("name", name);
    setBuddies((p) => p.filter((b) => b !== name));
  }

  async function addExpense() {
    if (!expenseName.trim() || !amount || !user?.id) return;
    setAdding(true);
    const { data } = await supabase
      .from("expenses")
      .insert({
        trip_id: id,
        user_id: user.id,
        title: expenseName.trim(),
        amount: Number(amount),
      })
      .select()
      .single();
    if (data) {
      setExpenses((prev) => [...prev, data]);
      toast.success("Expense added");
    } else {
      toast.error("Failed to add expense");
    }
  }

  async function deleteExpense(expenseId: string) {
    await supabase.from("expenses").delete().eq("id", expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const perPerson = buddies.length > 0 ? Math.ceil(total / buddies.length) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-10 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "var(--gradient-mesh)" }}
        />
        <div className="container">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Active Trip
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
            Trip Expense Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and split expenses with your travel buddies.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {/* Add expense */}
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
                <Receipt className="h-5 w-5 text-primary" /> Add Expense
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Expense
                  </Label>
                  <Input
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    placeholder="e.g. Hotel, Dinner..."
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="w-36">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Amount (₹)
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="self-end">
                  <Button
                    variant="hero"
                    className="h-11 rounded-xl px-5 shadow-glow"
                    onClick={addExpense}
                    disabled={adding || !expenseName.trim() || !amount}
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expense list */}
            <div className="rounded-3xl border border-border/60 bg-card shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Expenses</h2>
                <span className="text-xs text-muted-foreground">
                  {expenses.length} items
                </span>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No expenses yet. Add your first one!
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {expenses.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-smooth"
                    >
                      <div>
                        <p className="font-medium text-sm">{e.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(e.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-lg">
                          ₹{Number(e.amount).toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="h-8 w-8 grid place-items-center rounded-xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-smooth"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {expenses.length > 0 && (
                <div className="p-5 border-t border-border/60 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-display font-bold text-2xl text-gradient">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: buddies + split */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
                <Users className="h-5 w-5 text-primary" /> Buddies on this trip
              </h2>
              <div className="flex gap-2">
                <Input
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  placeholder="Enter name..."
                  className="rounded-xl h-10"
                />
                <Button
                  variant="hero"
                  className="rounded-xl h-10 px-4 shadow-glow"
                  onClick={addBuddy}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {buddies.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Add people to split with.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {buddies.map((b) => (
                    <li
                      key={b}
                      className="flex justify-between items-center p-3 rounded-xl bg-secondary/50"
                    >
                      <span className="text-sm font-medium">👤 {b}</span>
                      <button
                        onClick={() => removeBuddy(b)}
                        className="text-muted-foreground hover:text-destructive transition-smooth"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Split summary */}
            {buddies.length > 0 && expenses.length > 0 && (
              <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" /> Split Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total expenses
                    </span>
                    <span className="font-bold">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Splitting between
                    </span>
                    <span className="font-bold">{buddies.length} people</span>
                  </div>
                  <div className="pt-3 border-t border-primary/20 flex justify-between">
                    <span className="font-semibold">Per person</span>
                    <span className="font-display font-bold text-xl text-gradient">
                      ₹{perPerson.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {buddies.map((b, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center p-3 rounded-xl bg-card text-sm"
                    >
                      <span>👤 {b}</span>
                      <span className="font-semibold text-primary">
                        owes ₹{perPerson.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
