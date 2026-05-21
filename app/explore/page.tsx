"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowUpRight,
  Clock,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

type Trip = {
  id: number;
  img: string;
  location: string;
  title: string;
  rating: number;
  reviews: number;
  duration: number;
  price: number;
  tags: string[];
  type: "Adventure" | "Honeymoon" | "Family" | "Weekend";
  popularity: number;
};

const TRIPS: Trip[] = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format",
    location: "Goa",
    title: "Beaches, Nightlife & Water Sports",
    rating: 4.8,
    reviews: 520,
    duration: 4,
    price: 8000,
    tags: ["Beach", "Party"],
    type: "Weekend",
    popularity: 95,
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format",
    location: "Manali",
    title: "Snow, Mountains & Adventure",
    rating: 4.9,
    reviews: 410,
    duration: 5,
    price: 9000,
    tags: ["Snow", "Adventure"],
    type: "Adventure",
    popularity: 92,
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format",
    location: "Amritsar",
    title: "Golden Temple & Wagah Border",
    rating: 4.8,
    reviews: 260,
    duration: 2,
    price: 5500,
    tags: ["Spiritual", "History"],
    type: "Family",
    popularity: 86,
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format",
    location: "Ladakh",
    title: "Road Trip & High Pass Adventure",
    rating: 4.9,
    reviews: 260,
    duration: 7,
    price: 15000,
    tags: ["Roadtrip", "Mountains"],
    type: "Adventure",
    popularity: 97,
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format",
    location: "Kerala",
    title: "Backwaters & Nature Escape",
    rating: 4.8,
    reviews: 350,
    duration: 6,
    price: 11000,
    tags: ["Nature", "Relax"],
    type: "Honeymoon",
    popularity: 91,
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1200&auto=format",
    location: "Rishikesh",
    title: "River Rafting & Spiritual Trip",
    rating: 4.7,
    reviews: 280,
    duration: 3,
    price: 6000,
    tags: ["Adventure", "Spiritual"],
    type: "Weekend",
    popularity: 85,
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format",
    location: "Shimla",
    title: "Hills, Snow & Toy Train",
    rating: 4.6,
    reviews: 240,
    duration: 4,
    price: 7500,
    tags: ["Hills", "Snow"],
    type: "Family",
    popularity: 82,
  },
  {
    id: 8,
    img: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?q=80&w=1200&auto=format",
    location: "Varanasi",
    title: "Ganga Aarti & Spiritual Experience",
    rating: 4.8,
    reviews: 310,
    duration: 2,
    price: 5000,
    tags: ["Spiritual", "Culture"],
    type: "Family",
    popularity: 87,
  },
  {
    id: 9,
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format",
    location: "Andaman",
    title: "Islands, Scuba & Beaches",
    rating: 4.9,
    reviews: 200,
    duration: 5,
    price: 18000,
    tags: ["Island", "Scuba"],
    type: "Honeymoon",
    popularity: 93,
  },
  {
    id: 10,
    img: "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format",
    location: "Udaipur",
    title: "City of Lakes & Royal Stay",
    rating: 4.8,
    reviews: 270,
    duration: 3,
    price: 8500,
    tags: ["Lakes", "Royal"],
    type: "Honeymoon",
    popularity: 89,
  },
  {
    id: 11,
    img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format",
    location: "Coorg",
    title: "Coffee Estates & Waterfalls",
    rating: 4.7,
    reviews: 180,
    duration: 3,
    price: 6000,
    tags: ["Coffee", "Nature"],
    type: "Weekend",
    popularity: 81,
  },
  {
    id: 12,
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format",
    location: "Ooty",
    title: "Tea Gardens & Scenic Hills",
    rating: 4.6,
    reviews: 190,
    duration: 3,
    price: 6500,
    tags: ["Nature", "Hills"],
    type: "Family",
    popularity: 80,
  },
  {
    id: 13,
    img: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1200&auto=format",
    location: "Darjeeling",
    title: "Toy Train & Tea Estates",
    rating: 4.7,
    reviews: 210,
    duration: 4,
    price: 7000,
    tags: ["Tea", "Mountains"],
    type: "Family",
    popularity: 83,
  },
  {
    id: 14,
    img: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1200&auto=format",
    location: "Kashmir",
    title: "Paradise on Earth Experience",
    rating: 5.0,
    reviews: 390,
    duration: 6,
    price: 14000,
    tags: ["Snow", "Nature"],
    type: "Honeymoon",
    popularity: 99,
  },
  {
    id: 15,
    img: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=1200&auto=format",
    location: "Mysore",
    title: "Palaces & Heritage Walk",
    rating: 4.6,
    reviews: 150,
    duration: 2,
    price: 5500,
    tags: ["Heritage", "Culture"],
    type: "Weekend",
    popularity: 78,
  },
];

const TYPES = ["Adventure", "Honeymoon", "Family", "Weekend"] as const;
const PAGE_SIZE = 6;

const TripCard = ({ t, onStart }: { t: Trip; onStart: (t: Trip) => void }) => (
  <article className="group card-premium flex flex-col overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={t.img}
        alt={t.title}
        onError={(e: any) => {
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format";
        }}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-80" />
      <span className="glass absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
        <Star className="h-3 w-3 fill-accent text-accent" />
        {t.rating}
        <span className="font-normal text-muted-foreground">({t.reviews})</span>
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-accent/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
        {t.type}
      </span>
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-primary-foreground">
        <MapPin className="h-3.5 w-3.5" />
        <span className="text-xs font-medium drop-shadow">{t.location}</span>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-balance font-display text-lg font-bold leading-snug tracking-tight">
        {t.title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {t.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground/80"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {t.duration} days
        </span>
        <span className="text-foreground">
          <span className="text-xs text-muted-foreground">from </span>
          <span className="font-display text-lg font-bold text-foreground">
            ₹{t.price.toLocaleString()}
          </span>
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <Link href={`/plan-trip?destination=${encodeURIComponent(t.location)}`}>
          <Button variant="default" className="group/btn w-full rounded-xl">
            Plan This Trip
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => onStart(t)}
        >
          🚀 Start Trip
        </Button>
      </div>
    </div>
  </article>
);

type Filters = {
  destination: string;
  budget: [number, number];
  duration: string;
  types: string[];
  minRating: number;
};

const FiltersPanel = ({
  filters,
  setFilters,
  onReset,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onReset: () => void;
}) => (
  <div className="space-y-7">
    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Destination
      </Label>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Where to?"
          value={filters.destination}
          onChange={(e) =>
            setFilters({ ...filters, destination: e.target.value })
          }
          className="rounded-xl pl-9"
        />
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Budget
        </Label>
        <span className="text-xs font-semibold text-foreground">
          ₹{filters.budget[0]} – ₹{filters.budget[1]}
        </span>
      </div>
      <Slider
        value={filters.budget}
        min={0}
        max={20000}
        step={50}
        onValueChange={(v) =>
          setFilters({ ...filters, budget: [v[0], v[1]] as [number, number] })
        }
        className="mt-4"
      />
    </div>

    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Duration
      </Label>
      <Select
        value={filters.duration}
        onValueChange={(v) => setFilters({ ...filters, duration: v })}
      >
        <SelectTrigger className="mt-2 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any length</SelectItem>
          <SelectItem value="short">1–4 days</SelectItem>
          <SelectItem value="medium">5–7 days</SelectItem>
          <SelectItem value="long">8+ days</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Travel type
      </Label>
      <div className="mt-3 space-y-2.5">
        {TYPES.map((t) => {
          const checked = filters.types.includes(t);
          return (
            <label
              key={t}
              className="group/chk -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-smooth hover:bg-secondary/60"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(c) => {
                  const next = c
                    ? [...filters.types, t]
                    : filters.types.filter((x) => x !== t);
                  setFilters({ ...filters, types: next });
                }}
              />
              <span className="text-sm font-medium">{t}</span>
            </label>
          );
        })}
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Minimum rating
        </Label>
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {filters.minRating.toFixed(1)}+
        </span>
      </div>
      <Slider
        value={[filters.minRating]}
        min={0}
        max={5}
        step={0.1}
        onValueChange={(v) => setFilters({ ...filters, minRating: v[0] })}
        className="mt-4"
      />
    </div>

    <Button variant="outline" className="w-full rounded-xl" onClick={onReset}>
      Reset filters
    </Button>
  </div>
);

const Explore = () => {
  const router = useRouter();
  const initial: Filters = {
    destination: "",
    budget: [0, 20000],
    duration: "any",
    types: [],
    minRating: 0,
  };

 const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);

  function handleStart(t: Trip) {
    router.push(`/plan-trip?destination=${encodeURIComponent(t.location)}`);
  }

  const filtered = useMemo(() => {
    let list = TRIPS.filter((t) => {
      if (
        filters.destination &&
        !t.location.toLowerCase().includes(filters.destination.toLowerCase())
      )
        return false;
      if (t.price < filters.budget[0] || t.price > filters.budget[1])
        return false;
      if (filters.duration === "short" && t.duration > 4) return false;
      if (filters.duration === "medium" && (t.duration < 5 || t.duration > 7))
        return false;
      if (filters.duration === "long" && t.duration < 8) return false;
      if (filters.types.length && !filters.types.includes(t.type)) return false;
      if (t.rating < filters.minRating) return false;
      return true;
    });

    if (sort === "price-asc")
      list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "rating")
      list = [...list].sort((a, b) => b.rating - a.rating);
    else list = [...list].sort((a, b) => b.popularity - a.popularity);

    return list;
  }, [filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (page > totalPages) {
    setPage(1);
  }

  const currentPage = Math.min(page, totalPages);
  const pageSlice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const reset = () => {
    setFilters(initial);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pb-12 pt-32 sm:pb-16 sm:pt-40">
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Explore trips
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              Find your next{" "}
              <span className="text-gradient">unforgettable trip</span>
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Curated, traveler-loved itineraries across every budget and vibe.
              Filter by destination, duration, or style — then book with
              friends.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <div className="mb-6 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-base font-bold">Filters</h2>
                </div>
                <FiltersPanel
                  filters={filters}
                  setFilters={(f) => {
                    setFilters(f);
                    setPage(1);
                  }}
                  onReset={reset}
                />
              </div>
            </aside>

            <main>
              <div className="mb-6 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {filtered.length}
                  </span>{" "}
                  trips found
                </p>
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl lg:hidden"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[320px] overflow-y-auto sm:w-[380px]"
                    >
                      <SheetHeader>
                        <SheetTitle className="font-display">
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersPanel
                          filters={filters}
                          setFilters={(f) => {
                            setFilters(f);
                            setPage(1);
                          }}
                          onReset={reset}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most popular</SelectItem>
                      <SelectItem value="price-asc">
                        Price: low to high
                      </SelectItem>
                      <SelectItem value="rating">Top rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {pageSlice.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {pageSlice.map((t) => (
                    <TripCard key={t.id} t={t} onStart={handleStart} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
                  <h3 className="font-display text-xl font-bold">
                    No trips match those filters
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try widening your budget or clearing some filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-5 rounded-xl"
                    onClick={reset}
                  >
                    Reset filters
                  </Button>
                </div>
              )}

              {totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(Math.max(1, currentPage - 1));
                        }}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(Math.min(totalPages, currentPage + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;
