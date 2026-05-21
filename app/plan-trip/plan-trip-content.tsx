"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAppUser as useUser } from "@/lib/app-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";

import {
  Loader2,
  MapPin,
  Clock,
  Wallet,
  ChevronRight,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import { toast } from "sonner";

type DayPlan = {
  day: number;
  title: string;
  activities: string[];
};

type TripPlan = {
  itinerary: DayPlan[];
  budget: Record<string, string>;
  tips?: string[];
  places?: string[];
  trip_dates?: {
    start_date: string;
    end_date: string;
  };
};

const getInclusiveDays = (
  startDate: string,
  endDate: string,
) => {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff =
    end.getTime() -
    start.getTime();

  if (Number.isNaN(diff) || diff < 0) {
    return null;
  }

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24),
  ) + 1;
};

export function PlanTripContent() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const {
    user,
    isLoaded,
  } = useUser();

  const [destination, setDestination] =
    useState("");

  const [days, setDays] =
    useState(3);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [budget, setBudget] =
    useState(5000);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [plan, setPlan] =
    useState<TripPlan | null>(null);

  const [error, setError] =
    useState("");

  // ====================================
  // PREFILL DESTINATION
  // ====================================

  useEffect(() => {

    const dest =
      searchParams.get("destination");

    if (dest) {
      setDestination(dest);
    }

  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user?.id) {
      router.replace(
        "/sign-up?redirect_url=/plan-trip",
      );
    }
  }, [isLoaded, router, user?.id]);

  useEffect(() => {
    const tripDays = getInclusiveDays(
      startDate,
      endDate,
    );

    if (tripDays) {
      setDays(tripDays);
    }
  }, [startDate, endDate]);

  // ====================================
  // GENERATE TRIP
  // ====================================

  async function generateTrip() {

    if (!destination.trim()) {

      toast.error(
        "Please enter a destination",
      );

      return;
    }

    if (days < 1 || days > 30) {

      toast.error(
        "Days must be between 1 and 30",
      );

      return;
    }

    if (!startDate || !endDate) {

      toast.error(
        "Please select trip dates",
      );

      return;
    }

    if (
      !getInclusiveDays(
        startDate,
        endDate,
      )
    ) {

      toast.error(
        "End date must be after start date",
      );

      return;
    }

    if (budget < 500) {

      toast.error(
        "Budget must be at least ₹500",
      );

      return;
    }

    setLoading(true);

    setError("");

    setPlan(null);

    try {

      const res =
        await fetch(
          "/api/ai/plan-trip",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              destination,
              days,
              budget,
            }),
          },
        );

      const data =
        await res.json();

      if (!res.ok) {

        const message =
          data.error ||
          "Something went wrong";

        setError(message);

        toast.error(message);

        return;
      }

      setPlan({
        ...data.plan,
        trip_dates: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      toast.success(
        "Trip generated successfully!",
      );

    } catch (err) {

      console.error(err);

      const message =
        "Failed to generate trip.";

      setError(message);

      toast.error(message);

    } finally {

      setLoading(false);
    }
  }

  // ====================================
  // SAVE TRIP
  // ====================================

  async function saveTrip() {

    if (!plan) return;

    if (!user) {

      toast.error(
        "Please sign in first",
      );

      return;
    }

    setSaving(true);

    try {

      // ====================================
      // GET BEST POSSIBLE USER NAME
      // ====================================

      const userName =
        user.fullName ||
        user.username ||
        user.firstName ||
        user.primaryEmailAddress
          ?.emailAddress
          ?.split("@")[0] ||
        "User";

      // ====================================
      // SAVE TRIP
      // ====================================

      const res =
        await fetch(
          "/api/trips",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              destination:
                destination.trim(),

              days,

              budget,

              plan: {
                ...plan,
                trip_dates: {
                  start_date: startDate,
                  end_date: endDate,
                },
              },

              user_name: userName,
            }),
          },
        );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data.error ||
          "Failed to save trip",
        );
      }

      toast.success(
        "Trip saved successfully!",
      );

      router.push(
        `/trips/${data.trip.id}`,
      );

    } catch (err: any) {

      console.error(err);

      toast.error(
        err?.message ||
          "Failed to save trip",
      );

    } finally {

      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {!isLoaded || !user?.id ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>

      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden
          pt-28
          pb-10
        "
      >
        <div
          className="
            absolute
            inset-0
            -z-10
            opacity-60
          "
          style={{
            background:
              "var(--gradient-mesh)",
          }}
        />

        <div className="container max-w-3xl">

          <span
            className="
              inline-block
              rounded-full
              bg-primary/10
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-primary
            "
          >
            AI Trip Planner
          </span>

          <h1
            className="
              mt-4
              font-display
              text-4xl
              font-bold
              tracking-tight
              sm:text-5xl
            "
          >
            Plan your trip with{" "}

            <span className="text-gradient">
              AI ✨
            </span>
          </h1>

          <p
            className="
              mt-4
              text-lg
              text-muted-foreground
            "
          >
            Tell us where you want to go and
            AI will generate a complete trip.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pb-24">

        <div className="container max-w-3xl space-y-6">

          {/* FORM */}
          <div
            className="
              space-y-5
              rounded-3xl
              border
              border-border/60
              bg-card
              p-6
              shadow-soft
            "
          >

            {/* DESTINATION */}
            <div>

              <Label
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Destination
              </Label>

              <div className="relative">

                <MapPin
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  placeholder="Goa, Bali, Kashmir..."
                  value={destination}
                  onChange={(e) =>
                    setDestination(
                      e.target.value,
                    )
                  }
                  className="
                    h-12
                    rounded-xl
                    pl-9
                  "
                />
              </div>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>

                <Label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Date From
                </Label>

                <div className="relative">

                  <CalendarDays
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value,
                      )
                    }
                    className="
                      h-12
                      rounded-xl
                      pl-9
                    "
                  />
                </div>
              </div>

              <div>

                <Label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Date To
                </Label>

                <div className="relative">

                  <CalendarDays
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value,
                      )
                    }
                    className="
                      h-12
                      rounded-xl
                      pl-9
                    "
                  />
                </div>
              </div>
            </div>

            {/* DAYS + BUDGET */}
            <div className="grid grid-cols-2 gap-4">

              {/* DAYS */}
              <div>

                <Label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Days
                </Label>

                <div className="relative">

                  <Clock
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <Input
                    type="number"
                    value={days}
                    min={1}
                    max={30}
                    onChange={(e) =>
                      setDays(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="
                      h-12
                      rounded-xl
                      pl-9
                    "
                  />
                </div>
              </div>

              {/* BUDGET */}
              <div>

                <Label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Budget
                </Label>

                <div className="relative">

                  <Wallet
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <Input
                    type="number"
                    value={budget}
                    min={500}
                    onChange={(e) =>
                      setBudget(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="
                      h-12
                      rounded-xl
                      pl-9
                    "
                  />
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  p-3
                  text-sm
                  text-red-500
                "
              >
                {error}
              </div>
            )}

            {/* BUTTON */}
            <Button
              variant="hero"
              className="
                h-12
                w-full
                rounded-xl
                text-base
                shadow-glow
              "
              onClick={generateTrip}
              disabled={
                loading ||
                !destination.trim()
              }
            >
              {loading ? (
                <>
                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />

                  Generate Plan
                </>
              )}
            </Button>
          </div>

          {/* RESULT */}
          {plan && (
            <div className="space-y-5">

              {/* HEADER */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <h2
                  className="
                    font-display
                    text-2xl
                    font-bold
                  "
                >
                  Your plan for {destination}
                </h2>

                <Button
                  variant="hero"
                  className="
                    rounded-xl
                    shadow-glow
                  "
                  onClick={saveTrip}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        className="
                          h-4
                          w-4
                          animate-spin
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    "💾 Save Trip"
                  )}
                </Button>
              </div>

              {/* ITINERARY */}
              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border/60
                  bg-card
                  shadow-soft
                "
              >

                <div
                  className="
                    border-b
                    border-border/60
                    p-5
                  "
                >
                  <h3
                    className="
                      font-display
                      text-lg
                      font-semibold
                    "
                  >
                    📅 Itinerary
                  </h3>
                </div>

                <div className="divide-y divide-border/60">

                  {plan.itinerary.map(
                    (day) => (
                      <div
                        key={day.day}
                        className="p-5"
                      >
                        <div
                          className="
                            mb-3
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className="
                              grid
                              h-8
                              w-8
                              place-items-center
                              rounded-full
                              bg-primary/10
                              text-xs
                              font-bold
                              text-primary
                            "
                          >
                            {day.day}
                          </span>

                          <h4 className="font-semibold">
                            Day {day.day} — {day.title}
                          </h4>
                        </div>

                        <ul className="space-y-1.5 pl-11">

                          {day.activities.map(
                            (
                              activity,
                              index,
                            ) => (
                              <li
                                key={index}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  text-sm
                                  text-foreground/75
                                "
                              >
                                <ChevronRight
                                  className="
                                    h-3.5
                                    w-3.5
                                    text-primary
                                  "
                                />

                                {activity}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
        </>
      )}
    </div>
  );
}
