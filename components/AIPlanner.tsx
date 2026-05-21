"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";

export const AIPlanner = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 GENERATE PLAN
  const handleGenerate = async () => {
    if (!destination || !days || !budget) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("/api/ai/plan-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          days,
          budget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI failed");
      }

      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <section className="py-24 gradient-soft">
      <div className="max-w-5xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            AI Trip Planner
          </div>

          <h2 className="mt-4 text-4xl font-bold">
            Plan your trip with AI ✨
          </h2>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white/70 backdrop-blur border shadow-xl rounded-3xl p-6 space-y-4">

          <input
            placeholder="Destination (e.g. Goa, Bali)"
            className="w-full p-3 rounded-xl border outline-none"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="Days (e.g. 3)"
              className="p-3 rounded-xl border outline-none"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />

            <input
              placeholder="Budget (₹5000)"
              className="p-3 rounded-xl border outline-none"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl gradient-hero text-white"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate AI Plan"}
          </Button>

          {error && (
            <p className="text-red-500 text-center text-sm">
              {error}
            </p>
          )}
        </div>

        {/* LOADING UI */}
        {loading && (
          <div className="mt-10 space-y-4 animate-pulse">
            <div className="h-[200px] bg-gray-200 rounded-2xl" />
            <div className="h-[80px] bg-gray-200 rounded-xl" />
            <div className="h-[80px] bg-gray-200 rounded-xl" />
          </div>
        )}

        {/* RESULT */}
        {!loading && plan && (
          <div className="mt-10 space-y-8">

            {/* ITINERARY */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                📅 Itinerary
              </h3>

              {plan.itinerary?.map((day: any, i: number) => (
                <div
                  key={i}
                  className="bg-white/80 border shadow rounded-2xl p-5 mb-4"
                >
                  <h4 className="font-semibold">
                    Day {day.day} — {day.title}
                  </h4>

                  <ul className="mt-2 text-sm">
                    {day.activities?.map((a: string, j: number) => (
                      <li key={j}>• {a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* BUDGET */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                💰 Budget
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(plan.budget || {}).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-white border rounded-xl p-4 text-center"
                  >
                    <p className="text-sm">{k}</p>
                    <p className="font-bold">{v as string}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
};