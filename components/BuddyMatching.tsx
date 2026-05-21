"use client";

import { Button } from "@/components/ui/button";
import { BadgeCheck, Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const buddies = [
  {
    initials: "SR",
    name: "Sara Reyes",
    age: 27,
    city: "Lisbon, PT",
    match: 96,
    interests: ["Hiking", "Photography", "Foodie"],
    trip: "Bali · Mar 12 – 22",
    gradient: "from-primary to-primary-glow",
  },
  {
    initials: "JK",
    name: "Jamal Khan",
    age: 31,
    city: "Toronto, CA",
    match: 92,
    interests: ["Surfing", "Coffee", "Slow travel"],
    trip: "Bali · Mar 14 – 24",
    gradient: "from-accent to-primary",
  },
  {
    initials: "EN",
    name: "Elif Nazari",
    age: 25,
    city: "Berlin, DE",
    match: 89,
    interests: ["Yoga", "Art", "Local markets"],
    trip: "Bali · Mar 10 – 20",
    gradient: "from-primary-glow to-accent",
  },
];

export const BuddyMatching = () => {
  const router = useRouter();

  return (
    <section id="buddies" className="py-24 sm:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SIDE */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
              Buddy matching
            </span>

            <h2 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight">
              Travel with people who{" "}
              <span className="text-gradient">just get it</span>
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Match with verified travelers by interests, pace & destination.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Verified profiles · 4.9★ rating
            </div>

            {/* 🔥 FIXED BUTTON */}
            <Button
              className="mt-8"
              onClick={() => router.push("/explore")}
            >
              Find my buddies →
            </Button>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {buddies.map((b, i) => (
              <article
                key={b.name}
                onClick={() =>
                  router.push(`/plan-trip?destination=Bali`)
                }
                className={`group cursor-pointer rounded-3xl bg-card border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition ${
                  i === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex justify-between">

                  {/* USER */}
                  <div className="flex gap-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-white font-bold`}>
                      {b.initials}
                    </div>

                    <div>
                      <div className="font-semibold">
                        {b.name}, {b.age}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {b.city}
                      </div>
                    </div>
                  </div>

                  {/* MATCH */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {b.match}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      match
                    </div>
                  </div>
                </div>

                {/* INTERESTS */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="mt-5 flex justify-between items-center border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    {b.trip}
                  </span>

                  <div className="flex gap-2">
                    <button className="p-2 rounded hover:bg-gray-100">
                      <Heart className="w-4 h-4" />
                    </button>

                    <button className="p-2 rounded hover:bg-gray-100">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};