"use client";

import { useRouter } from "next/navigation";

const steps = [
  {
    n: "01",
    title: "Tell us your dream",
    desc: "Share destination, vibe & dates.",
  },
  {
    n: "02",
    title: "Match your buddies",
    desc: "Connect with verified travelers.",
  },
  {
    n: "03",
    title: "Plan together",
    desc: "Build itinerary with AI.",
  },
  {
    n: "04",
    title: "Travel & split",
    desc: "Enjoy & manage expenses easily.",
  },
];

export const HowItWorks = () => {
  const router = useRouter();

  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="container">

        {/* HEADER */}
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase">
            How it works
          </span>

          <h2 className="mt-4 text-4xl sm:text-5xl font-bold">
            From dream to departure in{" "}
            <span className="text-gradient">4 steps</span>
          </h2>
        </div>

        {/* STEPS */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.n}
              onClick={() => router.push("/plan-trip")}
              className="group cursor-pointer relative"
            >
              <div className="rounded-3xl bg-card border p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition h-full">

                <div className="text-5xl font-bold text-gradient">
                  {s.n}
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  {s.title}
                </h3>

                <p className="mt-2 text-muted-foreground text-sm">
                  {s.desc}
                </p>

                {/* HOVER CTA */}
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition">
                  Start →
                </div>

              </div>

              {/* CONNECTOR LINE */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}
            </div>
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
            ✨ Start Planning Your Trip
          </button>
        </div>

      </div>
    </section>
  );
};