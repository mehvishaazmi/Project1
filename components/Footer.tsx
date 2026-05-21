"use client";

import Link from "next/link";
import { Compass, Globe, MessagesSquare } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      { name: "Discover", href: "/explore" },
      { name: "Trips", href: "/trips" },
      { name: "Plan Trip", href: "/plan-trip" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/" },
      { name: "Careers", href: "/" },
      { name: "Contact", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help center", href: "/" },
      { name: "Blog", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "/" },
      { name: "Terms", href: "/" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t py-16 bg-background">
      <div className="container">

        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">

          {/* LOGO */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-hero">
                <Compass className="h-5 w-5 text-white" />
              </span>

              <span className="font-bold text-lg">
                TravelBuddy
              </span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Discover trips, find travel buddies, and plan unforgettable journeys.
            </p>

            {/* SOCIAL */}
            <div className="mt-5 flex gap-2">
              {[Globe, MessagesSquare, Compass].map((Icon, i) => (
                <button
                  key={i}
                  className="h-9 w-9 grid place-items-center rounded-xl bg-secondary hover:bg-primary hover:text-white transition"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* LINKS */}
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold">
                {c.title}
              </h4>

              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* BOTTOM */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TravelBuddy
          </p>

          <p className="text-xs text-muted-foreground">
            Built for modern travelers ✈️
          </p>
        </div>

      </div>
    </footer>
  );
};