"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, ArrowUpRight, Heart } from "lucide-react";

const destinations = [
  {
    name: "Santorini",
    country: "Greece",
    price: "$1,240",
    rating: 4.9,
    trips: 128,
    tag: "Romantic",
  },
  {
    name: "Ubud",
    country: "Bali, Indonesia",
    price: "$890",
    rating: 4.8,
    trips: 214,
    tag: "Wellness",
  },
  {
    name: "Tokyo",
    country: "Japan",
    price: "$1,560",
    rating: 4.9,
    trips: 96,
    tag: "Culture",
  },
  {
    name: "Zermatt",
    country: "Switzerland",
    price: "$1,820",
    rating: 4.9,
    trips: 73,
    tag: "Adventure",
  },
];

export const Destinations = () => {
  const router = useRouter();

  const getImage = (name: string) =>
    `https://picsum.photos/seed/${name}/600/800`; // ✅ dynamic images

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container">

        {/* HEADER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
              🔥 Trending now
            </span>

            <h2 className="mt-5 text-4xl sm:text-5xl font-bold">
              Destinations{" "}
              <span className="text-gradient">made for memories</span>
            </h2>

            <p className="mt-4 text-muted-foreground">
              Hand-picked places with real travelers & AI plans.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d, i) => (
            <div
              key={i}
              onClick={() =>
                router.push(`/plan-trip?destination=${d.name}`)
              }
              className="group cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              {/* IMAGE */}
              <div className="relative h-[300px]">
                <Image
                  src={getImage(d.name)}
                  alt={d.name}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* TOP */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-white/80 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {d.rating}
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs opacity-80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {d.country}
                  </p>

                  <h3 className="text-xl font-bold">{d.name}</h3>

                  <p className="text-sm opacity-80">
                    {d.trips} trips • {d.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};