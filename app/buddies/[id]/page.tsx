"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { useAppUser as useUser } from "@/lib/app-auth";

import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";

import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Loader2,
  Heart,
} from "lucide-react";


type BuddyProfile = {
  id: string;
  user_id: string;
  name: string;
  city: string;
  bio: string;
  interests: string[];
};

type Trip = {
  destination: string;
  days: string;
  budget: string;
};

export default function BuddyProfilePage() {
  const params = useParams();

  const { user } = useUser();

  const buddyId = params.id as string;

  const [profile, setProfile] =
    useState<BuddyProfile | null>(null);

  const [trip, setTrip] =
    useState<Trip | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  // =====================================
  // FETCH DATA
  // =====================================

  useEffect(() => {
    fetchBuddy();
    checkSavedStatus();
  }, []);

  async function fetchBuddy() {
    try {
      const { data: profileData } =
        await supabase
          .from("buddy_profiles")
          .select("*")
          .eq("user_id", buddyId)
          .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: tripData } =
        await supabase
          .from("trips")
          .select("*")
          .eq("user_id", buddyId)
          .maybeSingle();

      if (tripData) {
        setTrip(tripData);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // CHECK SAVED STATUS
  // =====================================

  async function checkSavedStatus() {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from("saved_buddies")
        .select("*")
        .eq("saver_user_id", user.id)
        .eq("saved_user_id", buddyId)
        .maybeSingle();

      if (data) {
        setSaved(true);
      }

    } catch (error) {
      console.error(error);
    }
  }

  // =====================================
  // SEND MESSAGE
  // =====================================

  async function sendMessage() {
    if (!message.trim()) return;

    if (!user?.id) {
      alert("Please sign in first");
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: buddyId,
          content: message,
        });

      if (error) {
        console.error(error);

        alert("Failed to send message");

        return;
      }

      alert("Message sent successfully!");

      setMessage("");

    } catch (error) {
      console.error(error);

      alert("Something went wrong");

    } finally {
      setSending(false);
    }
  }

  // =====================================
  // SAVE BUDDY
  // =====================================

  async function saveBuddy() {
    if (!user?.id) {
      alert("Please sign in first");
      return;
    }

    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_buddies")
          .delete()
          .eq("saver_user_id", user.id)
          .eq("saved_user_id", buddyId);

        if (error) {
          console.error(error);
          return;
        }

        setSaved(false);

        alert("Buddy removed");

      } else {
        const { error } = await supabase
          .from("saved_buddies")
          .insert({
            saver_user_id: user.id,
            saved_user_id: buddyId,
          });

        if (error) {
          console.error(error);

          alert("Failed to save buddy");

          return;
        }

        setSaved(true);

        alert("Buddy saved!");
      }

    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  }

  // =====================================
  // LOADING
  // =====================================

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

  // =====================================
  // NOT FOUND
  // =====================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex h-[80vh] items-center justify-center">
          <h1 className="text-2xl font-bold">
            Buddy not found
          </h1>
        </div>

        <Footer />
      </div>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Navbar />

      <section className="pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6">

          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">

            {/* TOP */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <h1 className="text-5xl font-bold text-slate-900">
                  {profile.name}
                </h1>

                <p className="mt-3 text-xl text-slate-600">
                  {profile.city}
                </p>
              </div>

              <div className="rounded-full bg-cyan-100 px-5 py-2 font-semibold text-cyan-700">
                Verified Buddy
              </div>
            </div>

            {/* ABOUT */}
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-slate-900">
                About
              </h2>

              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                {profile.bio}
              </p>
            </div>

            {/* TRIP */}
            {trip && (
              <div className="mt-10 rounded-3xl bg-slate-100 p-6">

                <h2 className="text-2xl font-semibold text-slate-900">
                  Upcoming Trip
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-3">

                  <div>
                    <p className="text-sm text-slate-500">
                      Destination
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {trip.destination}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Duration
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {trip.days} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Budget
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      ₹
                      {Number(
                        trip.budget,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* INTERESTS */}
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-slate-900">
                Interests
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {profile.interests?.map(
                  (interest) => (
                    <span
                      key={interest}
                      className="
                        rounded-full
                        bg-cyan-100
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-cyan-700
                      "
                    >
                      {interest}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-12 flex flex-wrap gap-4">

              {/* MESSAGE */}
              <Dialog>

                <DialogTrigger asChild>
                  <Button
                    className="
                      h-12
                      rounded-2xl
                      bg-cyan-500
                      px-8
                      text-white
                      hover:bg-cyan-600
                    "
                  >
                    Send Message
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-3xl">

                  <DialogHeader>
                    <DialogTitle>
                      Message {profile.name}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">

                    <Textarea
                      placeholder="Write your message..."
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value,
                        )
                      }
                      className="min-h-[140px]"
                    />

                    <Button
                      onClick={sendMessage}
                      disabled={sending}
                      className="
                        w-full
                        bg-cyan-500
                        hover:bg-cyan-600
                      "
                    >
                      {sending
                        ? "Sending..."
                        : "Send Message"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* SAVE */}
              <Button
                variant="outline"
                onClick={saveBuddy}
                className="
                  h-12
                  rounded-2xl
                  px-8
                "
              >
                <Heart className="mr-2 h-4 w-4" />

                {saved
                  ? "Saved"
                  : "Save Buddy"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
