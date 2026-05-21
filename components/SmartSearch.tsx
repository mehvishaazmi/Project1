"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Wallet, CalendarRange, Users, Search } from "lucide-react";

export const SmartSearch = () => {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [travelers, setTravelers] = useState("");

  const handleSearch = () => {
    if (!destination) return;

    const query = new URLSearchParams({
      destination,
      budget,
      duration,
      travelers,
    }).toString();

    router.push(`/plan-trip?${query}`);
  };

  return (
    <section id="explore" className="py-20 sm:py-24 relative">
      <div className="container">

        {/* HEADER */}
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Smart search
          </span>

          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Find your <span className="text-gradient">perfect trip</span>
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Customize your trip instantly — AI will plan everything for you.
          </p>
        </div>

        {/* 🔥 SEARCH BOX */}
        <div className="mt-12 max-w-5xl mx-auto glass rounded-3xl p-5 shadow-elevated">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* DESTINATION */}
            <div className="rounded-2xl px-4 py-3 bg-white/60">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Destination
              </label>
              <input
                className="mt-1 w-full bg-transparent outline-none font-semibold"
                placeholder="Goa, Bali..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* BUDGET */}
            <div className="rounded-2xl px-4 py-3 bg-white/60">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Budget
              </label>
              <input
                className="mt-1 w-full bg-transparent outline-none font-semibold"
                placeholder="₹5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* DURATION */}
            <div className="rounded-2xl px-4 py-3 bg-white/60">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                Duration
              </label>
              <input
                className="mt-1 w-full bg-transparent outline-none font-semibold"
                placeholder="3-5 days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* TRAVELERS */}
            <div className="rounded-2xl px-4 py-3 bg-white/60">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Travelers
              </label>
              <input
                className="mt-1 w-full bg-transparent outline-none font-semibold"
                placeholder="2 people"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>

          </div>

          {/* BUTTON */}
          <Button
            onClick={handleSearch}
            className="mt-4 w-full rounded-2xl gradient-hero text-white shadow-glow"
          >
            <Search className="h-4 w-4 mr-2" />
            Search trips
          </Button>
        </div>
      </div>
    </section>
  );
};