"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Sparkles } from "lucide-react";

export const Hero = () => {
return ( <section className="relative pt-32 pb-20 overflow-hidden">

  {/* 🔥 BACKGROUND */}
  <div className="absolute inset-0 gradient-mesh -z-10" />
  <div className="absolute inset-0 gradient-soft -z-10 opacity-80" />

  <div className="container grid md:grid-cols-2 gap-12 items-center">

    {/* LEFT */}
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
        <Sparkles className="h-3.5 w-3.5" />
        AI Powered Travel Planning
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
        Find Travel Buddies &{" "}
        <span className="text-gradient">
          Plan Smarter Trips
        </span>
      </h1>

      <p className="mt-6 text-lg text-muted-foreground max-w-xl">
        Discover destinations, match with travelers, generate AI itineraries,
        and split expenses — all in one place.
      </p>

      {/* CTA */}
      <div className="mt-8 flex gap-4">
        <Link href="/plan-trip">
          <Button className="gradient-hero text-white px-6 py-5 rounded-full shadow-glow hover:scale-105 transition">
            Start Planning →
          </Button>
        </Link>

        <Link href="/explore">
          <Button variant="outline" className="px-6 py-5 rounded-full">
            Explore Trips
          </Button>
        </Link>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        ⭐⭐⭐⭐⭐ 4.9 · Loved by 120,000+ travelers
      </div>
    </div>

    {/* RIGHT */}
    <div className="relative">

      {/* MAIN CARD */}
      <div className="glass rounded-3xl p-6 shadow-elevated">
        <div className="space-y-5">

          <div>
            <p className="text-xs text-muted-foreground">WHERE</p>
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Bali, Indonesia
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">WHEN</p>
            <div className="flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Mar 12 – 22
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">BUDDIES</p>
            <div className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-primary" />
              2 travelers
            </div>
          </div>

          {/* 🔥 FIXED BUTTON */}
          <Link href="/explore">
            <Button className="w-full mt-4 gradient-hero text-white rounded-full shadow-glow">
              Explore trips
            </Button>
          </Link>
        </div>
      </div>

      {/* FLOATING CARD - BOTTOM */}
      <div className="absolute -bottom-6 left-6 glass rounded-xl px-4 py-3 shadow-card text-sm">
        <p className="font-medium">Sara matched with you</p>
        <p className="text-muted-foreground text-xs">
          96% compatibility · Bali
        </p>
      </div>

      {/* FLOATING CARD - TOP */}
      <div className="absolute -top-6 right-0 glass rounded-xl px-4 py-3 shadow-card text-sm">
        <p className="text-xs text-muted-foreground">TRIP GENERATED</p>
        <p className="font-semibold">4 days · Bali</p>
        <p className="text-green-500 text-xs">✔ Ready in 2.4s</p>
      </div>

    </div>
  </div>
</section>
);
};
