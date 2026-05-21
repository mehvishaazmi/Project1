"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Receipt, Wallet, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const expenses = [
  { who: "You", what: "Villa booking · 3 nights", amount: 480, paidBy: "You", split: 4 },
  { who: "Sara", what: "Scooter rentals", amount: 120, paidBy: "Sara", split: 4 },
  { who: "Jamal", what: "Group dinner · Ubud", amount: 92, paidBy: "Jamal", split: 4 },
];

const balances = [
  { from: "Sara", to: "You", amount: 90 },
  { from: "Jamal", to: "You", amount: 90 },
  { from: "Elif", to: "Sara", amount: 30 },
];

export const ExpenseSplit = () => {
  const router = useRouter();

  return (
    <section className="py-24 sm:py-32 gradient-soft">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: MOCK UI */}
          <div className="order-2 lg:order-1 space-y-4">

            {/* EXPENSE LIST */}
            <div className="rounded-3xl bg-card border shadow-card overflow-hidden">
              <div className="p-5 flex justify-between border-b">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Receipt className="h-5 w-5" />
                  </span>

                  <div>
                    <div className="font-semibold">
                      Bali trip · 4 people
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total spent · $692
                    </div>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs">
                  Active
                </span>
              </div>

              <ul className="divide-y">
                {expenses.map((e) => (
                  <li key={e.what} className="p-5 flex gap-4">
                    <span className="h-9 w-9 rounded-full gradient-hero grid place-items-center text-white text-xs font-semibold">
                      {e.paidBy[0]}
                    </span>

                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {e.what}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paid by {e.paidBy} · split {e.split}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${e.amount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${e.amount / e.split}/ea
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* BALANCES */}
            <div className="rounded-3xl bg-card border shadow-card p-5">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                Who owes whom
              </div>

              <ul className="mt-4 space-y-3">
                {balances.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <span>{b.from}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{b.to}</span>

                    <span className="ml-auto font-semibold text-primary">
                      ${b.amount}
                    </span>
                  </li>
                ))}
              </ul>

              {/* 🔥 FIXED BUTTON */}
              <Button
                onClick={() => router.push("/plan-trip")}
                className="mt-5 w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Try Expense Split
              </Button>
            </div>
          </div>

          {/* RIGHT: TEXT */}
          <div className="order-1 lg:order-2">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs uppercase">
              Expense splitting
            </span>

            <h2 className="mt-4 text-4xl font-bold">
              No more{" "}
              <span className="text-gradient">
                awkward math
              </span>
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Log expenses, split automatically, and settle instantly.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Multi-currency support",
                "Smart split logic",
                "One-tap payments",
              ].map((b) => (
                <li key={b} className="flex gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {b}
                </li>
              ))}
            </ul>

            {/* 🔥 CTA */}
            <Button
              onClick={() => router.push("/plan-trip")}
              className="mt-8"
            >
              Start Planning →
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};