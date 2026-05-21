"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    quote: "I met my hiking crew through TravelBuddy and we've now done three trips together.",
    name: "Mira Patel",
    role: "Solo traveler · 14 trips",
    initials: "MP",
  },
  {
    quote: "The AI itinerary saved me hours. It felt like a local guide in my pocket.",
    name: "Lucas Bernard",
    role: "Photographer · Paris",
    initials: "LB",
  },
  {
    quote: "Best travel app I've used in years. The buddy matching just works.",
    name: "Aiko Tanaka",
    role: "Designer · Tokyo",
    initials: "AT",
  },
];

export const Testimonials = () => {
  const router = useRouter();

  return (
    <section className="py-24 sm:py-32 gradient-soft">
      <div className="container">

        {/* HEADER */}
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
            Loved worldwide
          </span>

          <h2 className="mt-4 text-4xl sm:text-5xl font-bold">
            Trusted by{" "}
            <span className="text-gradient">
              120,000+ travelers
            </span>
          </h2>
        </div>

        {/* GRID */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              onClick={() => router.push("/plan-trip")}
              className="cursor-pointer rounded-3xl bg-card border p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >
              {/* STARS */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* TEXT */}
              <blockquote className="mt-4 text-sm text-muted-foreground leading-relaxed">
                "{t.quote}"
              </blockquote>

              {/* USER */}
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full gradient-hero grid place-items-center text-white font-semibold text-sm">
                  {t.initials}
                </div>

                <div>
                  <div className="font-semibold text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}
                  </div>
                </div>
              </figcaption>

              {/* CTA ON HOVER */}
              <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition">
                Plan your trip →
              </div>
            </figure>
          ))}
        </div>

        {/* 🔥 MAIN CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => router.push("/plan-trip")}
            className="px-8 py-4 rounded-full text-white text-lg font-semibold 
            bg-gradient-to-r from-blue-500 to-cyan-500 
            hover:scale-105 transition shadow-lg"
          >
            ✨ Start Your Journey
          </button>
        </div>

      </div>
    </section>
  );
};