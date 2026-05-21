"use client";

import { useRouter } from "next/navigation";
import {
  Compass,
  Users,
  Map,
  Wallet,
  Sparkles,
  Shield,
} from "lucide-react";

type Feature = {
  icon: any;
  title: string;
  desc: string;
  color: string;
  link: string;
};

const features: Feature[] = [
  {
    icon: Compass,
    title: "Discover trips",
    desc: "Curated journeys from solo adventures to group expeditions.",
    color: "from-primary to-primary-glow",
    link: "/explore",
  },
  {
    icon: Users,
    title: "Match with buddies",
    desc: "Find verified travel companions with shared interests.",
    color: "from-accent to-accent",
    link: "/explore",
  },
  {
    icon: Map,
    title: "Smart itineraries",
    desc: "AI builds day-by-day plans automatically.",
    color: "from-primary-glow to-primary",
    link: "/plan-trip",
  },
  {
    icon: Wallet,
    title: "Split expenses",
    desc: "Track and divide trip costs easily.",
    color: "from-accent to-primary",
    link: "/plan-trip",
  },
  {
    icon: Sparkles,
    title: "Local experiences",
    desc: "Book curated experiences and activities.",
    color: "from-primary to-accent",
    link: "/explore",
  },
  {
    icon: Shield,
    title: "Travel safely",
    desc: "Verified users and safe travel features.",
    color: "from-primary-glow to-accent",
    link: "/explore",
  },
];

export const Features = () => {
  const router = useRouter();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] gradient-mesh opacity-60 -z-10" />

      <div className="container">
        {/* HEADER */}
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
            Why TravelBuddy
          </span>

          <h2 className="mt-5 text-4xl sm:text-5xl font-bold">
            Everything you need for the
            <span className="text-gradient"> perfect trip</span>
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            From inspiration to itinerary — we cover everything.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              onClick={() => router.push(f.link)}
              className="group cursor-pointer relative card-premium p-8 overflow-hidden transition hover:scale-[1.02]"
            >
              {/* hover gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.05] transition`}
              />

              {/* ICON */}
              <div
                className={`relative h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${f.color}`}
              >
                <f.icon className="h-6 w-6 text-white" />
              </div>

              {/* TEXT */}
              <h3 className="mt-6 text-lg font-semibold">
                {f.title}
              </h3>

              <p className="mt-2 text-muted-foreground text-sm">
                {f.desc}
              </p>

              {/* CTA */}
              <div className="mt-5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition">
                Learn more →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};