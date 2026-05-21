"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAppUser as useUser,
} from "@/lib/app-auth";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";

import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";

import {
  Loader2,
  MapPin,
  Clock,
  Wallet,
  Plus,
  Users,
  Receipt,
  ArrowRight,
} from "lucide-react";


type Trip = {
  id: string;

  destination: string;

  days: string;

  budget: string;

  created_at: string;

  plan?: any;
};

type TripWithMembers =
  Trip & {
    membersCount: number;
  };

const getImage = (
  destination: string,
) =>
  `https://picsum.photos/seed/${destination.replace(
    /\s/g,
    "",
  )}/1200/700`;

export default function TripsPage() {

  const {
    user,
    isLoaded,
  } = useUser();

  const router =
    useRouter();

  const [trips, setTrips] =
    useState<
      TripWithMembers[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================
  // REALTIME
  // ====================================

  useEffect(() => {

    let channel:
      RealtimeChannel;

    if (user?.id) {

      channel =
        supabase
          .channel(
            `user-trips-${user.id}`,
          )

          .on(
            "postgres_changes",
            {
              event: "*",

              schema:
                "public",

              table:
                "trip_members",
            },

            async () => {

              await fetchTrips();
            },
          )

          .subscribe();
    }

    return () => {

      if (channel) {

        supabase.removeChannel(
          channel,
        );
      }
    };

  }, [user?.id]);

  // ====================================
  // FETCH
  // ====================================

  useEffect(() => {

    if (!isLoaded)
      return;

    if (!user?.id) {

      router.push(
        "/sign-in",
      );

      return;
    }

    fetchTrips();

  }, [
    user?.id,
    isLoaded,
  ]);

  // ====================================
  // FETCH TRIPS
  // ====================================

  async function fetchTrips() {

    try {

      setLoading(true);

      setError("");

      // ====================================
      // GET USER MEMBERSHIPS
      // ====================================

      const {
        data:
          memberships,
        error:
          membershipError,
      } = await supabase
        .from(
          "trip_members",
        )
        .select(
          "trip_id",
        )
        .eq(
          "user_id",
          user?.id,
        );

      if (
        membershipError
      ) {

        console.error(
          membershipError,
        );

        setError(
          "Failed to load trips",
        );

        return;
      }

      const tripIds =
        memberships?.map(
          (
            m,
          ) => m.trip_id,
        ) || [];

      // NO TRIPS
      if (
        tripIds.length === 0
      ) {

        setTrips([]);

        return;
      }

      // ====================================
      // GET TRIPS
      // ====================================

      const {
        data:
          tripsData,
        error:
          tripsError,
      } = await supabase
        .from("trips")
        .select("*")
        .in(
          "id",
          tripIds,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

      if (
        tripsError
      ) {

        console.error(
          tripsError,
        );

        setError(
          "Failed to load trips",
        );

        return;
      }

      const safeTrips =
        tripsData || [];

      // ====================================
      // GET ALL MEMBER COUNTS
      // ====================================

      const {
        data:
          allMembers,
      } = await supabase
        .from(
          "trip_members",
        )
        .select(
          "trip_id",
        )
        .in(
          "trip_id",
          tripIds,
        );

      // COUNT MAP
      const countMap:
        Record<
          string,
          number
        > = {};

      (
        allMembers ||
        []
      ).forEach(
        (
          member,
        ) => {

          countMap[
            member.trip_id
          ] =
            (countMap[
              member.trip_id
            ] || 0) +
            1;
        },
      );

      // ENRICH
      const enrichedTrips =
        safeTrips.map(
          (
            trip,
          ) => ({
            ...trip,

            membersCount:
              countMap[
                trip.id
              ] || 1,
          }),
        );

      setTrips(
        enrichedTrips,
      );

    } catch (err) {

      console.error(
        err,
      );

      setError(
        "Something went wrong",
      );

    } finally {

      setLoading(false);
    }
  }

  // ====================================
  // STATS
  // ====================================

  const totalBudget =
    trips.reduce(
      (
        sum,
        trip,
      ) =>
        sum +
        Number(
          trip.budget,
        ),

      0,
    );

  const totalMembers =
    trips.reduce(
      (
        sum,
        trip,
      ) =>
        sum +
        trip.membersCount,

      0,
    );

  // ====================================
  // LOADING
  // ====================================

  if (
    loading &&
    trips.length === 0
  ) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <Loader2
          className="
            h-10
            w-10
            animate-spin
            text-cyan-500
          "
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">

      <Navbar />

      <main className="container pb-24 pt-28">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1
              className="
                text-5xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Your Trips ✈️
            </h1>

            <p
              className="
                mt-3
                text-lg
                text-slate-600
              "
            >
              Manage your adventures,
              group expenses,
              and travel members.
            </p>
          </div>

          <Button
            className="
              h-12
              rounded-2xl
              bg-cyan-500
              px-6
              text-white
              hover:bg-cyan-600
            "
            onClick={() =>
              router.push(
                "/plan-trip",
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Plan New Trip
          </Button>
        </div>

        {/* STATS */}
        {!loading &&
          trips.length >
            0 && (

            <div className="mb-10 grid gap-6 md:grid-cols-3">

              {/* TRIPS */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  p-6
                  shadow-md
                "
              >
                <p className="text-sm text-slate-500">

                  Total Trips
                </p>

                <h2 className="mt-2 text-4xl font-bold text-slate-900">

                  {trips.length}
                </h2>
              </div>

              {/* BUDGET */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  p-6
                  shadow-md
                "
              >
                <p className="text-sm text-slate-500">

                  Total Budget
                </p>

                <h2 className="mt-2 text-4xl font-bold text-slate-900">

                  ₹
                  {totalBudget.toLocaleString()}
                </h2>
              </div>

              {/* MEMBERS */}
              <div
                className="
                  rounded-3xl
                  bg-white
                  p-6
                  shadow-md
                "
              >
                <p className="text-sm text-slate-500">

                  Total Members
                </p>

                <h2 className="mt-2 text-4xl font-bold text-slate-900">

                  {totalMembers}
                </h2>
              </div>
            </div>
          )}

        {/* ERROR */}
        {!loading &&
          error && (

            <div
              className="
                rounded-3xl
                bg-red-50
                p-8
                text-center
              "
            >
              <p className="font-medium text-red-600">

                {error}
              </p>
            </div>
          )}

        {/* EMPTY */}
        {!loading &&
          trips.length ===
            0 && (

            <div
              className="
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                py-24
                text-center
              "
            >
              <h2 className="text-3xl font-bold text-slate-900">

                No trips yet 😔
              </h2>

              <p className="mt-3 text-slate-500">

                Start planning your
                first AI-powered trip.
              </p>

              <Button
                className="
                  mt-8
                  rounded-2xl
                  bg-cyan-500
                  px-6
                  text-white
                  hover:bg-cyan-600
                "
                onClick={() =>
                  router.push(
                    "/plan-trip",
                  )
                }
              >
                Plan Trip ✨
              </Button>
            </div>
          )}

        {/* TRIPS */}
        {!loading &&
          trips.length >
            0 && (

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

              {trips.map(
                (
                  trip,
                ) => (

                  <div
                    key={
                      trip.id
                    }
                    className="
                      group
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      shadow-md
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                    "
                  >

                    {/* IMAGE */}
                    <div className="relative h-56 overflow-hidden">

                      <img
                        src={getImage(
                          trip.destination,
                        )}
                        alt={
                          trip.destination
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-700
                          group-hover:scale-110
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/70
                          via-black/10
                          to-transparent
                        "
                      />

                      <div className="absolute bottom-5 left-5 text-white">

                        <div className="flex items-center gap-2 text-sm opacity-90">

                          <MapPin className="h-4 w-4" />

                          {
                            trip.destination
                          }
                        </div>

                        <h2 className="mt-2 text-3xl font-bold">

                          {
                            trip.destination
                          }
                        </h2>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-6">

                      {/* INFO */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">

                        <span className="flex items-center gap-1">

                          <Clock className="h-4 w-4" />

                          {trip.days} days
                        </span>

                        <span className="flex items-center gap-1">

                          <Wallet className="h-4 w-4" />

                          ₹
                          {Number(
                            trip.budget,
                          ).toLocaleString()}
                        </span>

                        <span className="flex items-center gap-1">

                          <Users className="h-4 w-4" />

                          {
                            trip.membersCount
                          }{" "}
                          members
                        </span>
                      </div>

                      {/* DATE */}
                      <p className="mt-4 text-xs text-slate-400">

                        Created{" "}

                        {new Date(
                          trip.created_at,
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month:
                              "short",
                            year:
                              "numeric",
                          },
                        )}
                      </p>

                      {/* ACTIONS */}
                      <div className="mt-6 flex gap-3">

                        {/* OPEN */}
                        <Button
                          onClick={() =>
                            router.push(
                              `/trips/${trip.id}`,
                            )
                          }
                          className="
                            flex-1
                            rounded-2xl
                            bg-cyan-500
                            text-white
                            hover:bg-cyan-600
                          "
                        >
                          Open Trip

                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        {/* EXPENSES */}
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/trips/${trip.id}/expenses`,
                            )
                          }
                          className="rounded-2xl"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}
