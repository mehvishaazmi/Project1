"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useAppUser as useUser,
} from "@/lib/app-auth";

import { supabase } from "@/lib/supabase";

import {
  Loader2,
} from "lucide-react";

import {
  toast,
} from "sonner";


export default function JoinTripPage() {

  const params =
    useParams();

  const router =
    useRouter();

  const {
    user,
    isLoaded,
  } = useUser();

  const code =
    Array.isArray(
      params?.code,
    )
      ? params.code[0]
      : params?.code;

  const [loading, setLoading] =
    useState(true);

  // ====================================
  // JOIN FLOW
  // ====================================

  useEffect(() => {

    if (!isLoaded)
      return;

    // NOT LOGGED IN
    if (!user?.id) {

      toast.error(
        "Please sign in first",
      );

      router.push(
        "/sign-in",
      );

      return;
    }

    if (!code)
      return;

    joinTrip();

  }, [
    code,
    user?.id,
    isLoaded,
  ]);

  // ====================================
  // JOIN TRIP
  // ====================================

  async function joinTrip() {

    try {

      // ====================================
      // FIND TRIP
      // ====================================

      const {
        data: trip,
        error: tripError,
      } = await supabase
        .from("trips")
        .select("*")
        .eq(
          "invite_code",
          code,
        )
        .single();

      if (
        tripError ||
        !trip
      ) {

        toast.error(
          "Invalid invite link",
        );

        router.push(
          "/trips",
        );

        return;
      }

      // ====================================
      // CHECK IF ALREADY MEMBER
      // ====================================

      const {
        data:
          existingMember,
      } = await supabase
        .from(
          "trip_members",
        )
        .select("id")
        .eq(
          "trip_id",
          trip.id,
        )
        .eq(
          "user_id",
          user?.id,
        )
        .single();

      // ====================================
      // ALREADY JOINED
      // ====================================

      if (
        existingMember
      ) {

        toast.success(
          "Already joined trip",
        );

        router.push(
          `/trips/${trip.id}`,
        );

        return;
      }

      // ====================================
      // JOIN THROUGH SECURE API
      // ====================================

      const response =
        await fetch(
          "/api/trip-members",
          {
            method:
              "POST",

            headers:
              {
                "Content-Type":
                  "application/json",
              },

            body:
              JSON.stringify({
                trip_id:
                  trip.id,

                member_user_id:
                  user?.id,

                member_name:
                  user?.fullName ||
                  user?.firstName ||
                  "Traveler",

                invite_join:
                  true,
              }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {

        toast.error(
          data.error ||
            "Failed to join trip",
        );

        router.push(
          "/trips",
        );

        return;
      }

      toast.success(
        "Joined trip successfully!",
      );

      // ====================================
      // REDIRECT
      // ====================================

      router.push(
        `/trips/${trip.id}`,
      );

    } catch (error) {

      console.error(
        error,
      );

      toast.error(
        "Something went wrong",
      );

      router.push(
        "/trips",
      );

    } finally {

      setLoading(false);
    }
  }

  // ====================================
  // LOADING
  // ====================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">

      <div className="flex flex-col items-center gap-5">

        <Loader2
          className="
            h-12
            w-12
            animate-spin
            text-cyan-400
          "
        />

        <p className="text-lg text-white">

          Joining trip...
        </p>
      </div>
    </div>
  );
}
