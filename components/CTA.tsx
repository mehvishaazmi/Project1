"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Apple, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

export const CTA = () => {
  const router = useRouter();

  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-10 sm:p-16 lg:p-20 shadow-card">
          {/* BACKGROUND BLOBS */}
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Your next adventure starts today.
            </h2>

            <p className="mt-5 text-lg sm:text-xl text-white/80">
              Plan smarter trips, find travel buddies, and explore the world
              together.
            </p>

            {/* CTA BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* 🔥 PRIMARY ACTION */}
              <Button
                onClick={() => router.push("/plan-trip")}
                className="group px-6 py-5 rounded-full text-lg font-semibold bg-white text-black hover:scale-105 transition"
              >
                Get started free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
              </Button>

              {/* 🔥 SECONDARY */}
              <Button
                onClick={() => alert("Coming soon")}
                className="px-6 py-5 rounded-full 
  bg-white/15 backdrop-blur-lg 
  text-white border border-white/30 
  shadow-lg hover:scale-105 hover:bg-white/25 transition"
              >
                <Apple className="mr-2 h-5 w-5" />
                Download app
              </Button>
            </div>

            {/* FOOT NOTE */}
            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Smartphone className="h-4 w-4" />
              No credit card required · iOS & Android
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
