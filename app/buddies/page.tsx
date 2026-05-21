"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAppUser as useUser } from "@/lib/app-auth";
import { supabase } from "@/lib/supabase";
import type { DateRange } from "react-day-picker";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";


type BuddyProfile = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  avatar_initials: string;
  gradient: string;
  is_verified: boolean;
};

type Trip = {
  id: string;
  user_id: string;
  destination: string;
  days: string;
  budget: string;
};

type BuddyWithTrip = BuddyProfile & {
  trip?: Trip;
  match: number;
};

function calcMatch(
  myInterests: string[],
  theirInterests: string[],
): number {
  if (!myInterests.length && !theirInterests.length) {
    return 75;
  }

  const shared = myInterests.filter((i) =>
    theirInterests.includes(i),
  ).length;

  const base = 70;
  const bonus = Math.min(shared * 8, 28);

  return base + bonus;
}

export default function Buddies() {
  const router = useRouter();

  const { user } = useUser();

  const currentUserId = user?.id ?? "guest";

  const [destination, setDestination] =
    useState("");

  const [budget, setBudget] = useState<
    number[]
  >([15000]);

  const [dateRange, setDateRange] =
    useState<DateRange | undefined>();

  const [interests, setInterests] =
    useState<string[]>([]);

  const [buddies, setBuddies] = useState<
    BuddyWithTrip[]
  >([]);

  const [myProfile, setMyProfile] =
    useState<BuddyProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // INITIAL FETCH
  // =========================================

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  async function fetchAll() {
    setLoading(true);

    try {
      const profile = await fetchMyProfile();

      await fetchBuddies(profile);

    } catch (error) {
      console.error("fetchAll error:", error);

    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // FETCH MY PROFILE
  // =========================================

  async function fetchMyProfile() {
    try {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("buddy_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "fetchMyProfile error:",
          error,
        );

        return null;
      }

      if (data) {
        setMyProfile(data);
      }

      return data;

    } catch (error) {
      console.error(
        "Unexpected fetchMyProfile error:",
        error,
      );

      return null;
    }
  }

  // =========================================
  // FETCH BUDDIES
  // =========================================

  async function fetchBuddies(
    profile: BuddyProfile | null,
  ) {
    try {
      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from("buddy_profiles")
        .select("*")
        .neq("user_id", currentUserId);

      if (profilesError) {
        console.error(
          "Failed to fetch profiles:",
          profilesError,
        );

        return;
      }

      const safeProfiles = profiles || [];

      if (safeProfiles.length === 0) {
        setBuddies([]);
        return;
      }

      const buddyIds = safeProfiles.map(
        (p: BuddyProfile) => p.user_id,
      );

      const {
        data: trips,
        error: tripsError,
      } = await supabase
        .from("trips")
        .select(
          "id, user_id, destination, days, budget",
        )
        .in("user_id", buddyIds);

      if (tripsError) {
        console.error(
          "Failed to fetch trips:",
          tripsError,
        );

        return;
      }

      const tripsByUser: Record<
        string,
        Trip
      > = {};

      (trips || []).forEach((trip: Trip) => {
        tripsByUser[trip.user_id] = trip;
      });

      const myInterests =
        profile?.interests || [];

      const merged: BuddyWithTrip[] =
        safeProfiles.map(
          (buddy: BuddyProfile) => ({
            ...buddy,

            trip:
              tripsByUser[buddy.user_id],

            match: calcMatch(
              myInterests,
              buddy.interests || [],
            ),
          }),
        );

      merged.sort(
        (a, b) => b.match - a.match,
      );

      setBuddies(merged);

    } catch (error) {
      console.error(
        "Unexpected fetchBuddies error:",
        error,
      );
    }
  }

  // =========================================
  // FILTERING
  // =========================================

  const filtered = useMemo(() => {
    return buddies.filter((b) => {
      if (
        destination &&
        !b.trip?.destination
          ?.toLowerCase()
          .includes(destination.toLowerCase())
      ) {
        return false;
      }

      if (
        b.trip &&
        Number(b.trip.budget) > budget[0]
      ) {
        return false;
      }

      if (
        interests.length > 0 &&
        !interests.some((i) =>
          b.interests?.includes(i),
        )
      ) {
        return false;
      }

      return true;
    });

  }, [
    buddies,
    destination,
    budget,
    interests,
  ]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        </div>

        <Footer />
      </div>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Navbar />

      <section className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">

          {/* HEADER */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Travel Buddies
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Find compatible travel partners
              for your next adventure.
            </p>
          </div>

          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-md">
              <h2 className="text-2xl font-bold text-slate-900">
                No buddies found
              </h2>

              <p className="mt-4 text-slate-600">
                Try again later or adjust
                filters.
              </p>
            </div>
          )}

          {/* BUDDIES GRID */}
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">

            {filtered.map((buddy) => (
              <div
                key={buddy.id}
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-md
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >
                {/* TOP */}
                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {buddy.name}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      {buddy.city}
                    </p>
                  </div>

                  <div className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700">
                    {buddy.match}% Match
                  </div>
                </div>

                {/* BIO */}
                <p className="mt-5 line-clamp-3 leading-relaxed text-slate-600">
                  {buddy.bio}
                </p>

                {/* TRIP */}
                {buddy.trip && (
                  <div className="mt-6 rounded-2xl bg-slate-100 p-5">

                    <h3 className="text-lg font-semibold text-slate-900">
                      {buddy.trip.destination}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      {buddy.trip.days} days · ₹
                      {Number(
                        buddy.trip.budget,
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* INTERESTS */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {(buddy.interests || []).map(
                    (interest) => (
                      <span
                        key={interest}
                        className="
                          rounded-full
                          bg-slate-100
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          text-slate-700
                        "
                      >
                        {interest}
                      </span>
                    ),
                  )}
                </div>

                {/* BUTTON */}
                <Button
                  className="
                    mt-8
                    h-12
                    w-full
                    rounded-2xl
                    bg-cyan-500
                    text-base
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:bg-cyan-600
                  "
                  onClick={() =>
                    router.push(
                      `/buddies/${buddy.user_id}`,
                    )
                  }
                >
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
