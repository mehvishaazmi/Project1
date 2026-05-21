"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAppUser as useUser } from "@/lib/app-auth";

import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";

import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";

import { Loader2, Heart } from "lucide-react";


type Buddy = {
  id: string;
  user_id: string;
  name: string;
  city: string;
  bio: string;
  interests: string[];
};

export default function SavedPage() {
  const router = useRouter();

  const { user } = useUser();

  const [loading, setLoading] =
    useState(true);

  const [buddies, setBuddies] =
    useState<Buddy[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedBuddies();
    }
  }, [user]);

  async function fetchSavedBuddies() {
    try {
      const { data: saved } =
        await supabase
          .from("saved_buddies")
          .select("*")
          .eq("saver_user_id", user?.id);

      const ids =
        saved?.map(
          (s: any) => s.saved_user_id,
        ) || [];

      if (ids.length === 0) {
        setBuddies([]);
        return;
      }

      const { data: profiles } =
        await supabase
          .from("buddy_profiles")
          .select("*")
          .in("user_id", ids);

      setBuddies(profiles || []);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }

  async function removeSaved(
    buddyId: string,
  ) {
    try {
      await supabase
        .from("saved_buddies")
        .delete()
        .eq("saver_user_id", user?.id)
        .eq("saved_user_id", buddyId);

      setBuddies((prev) =>
        prev.filter(
          (b) => b.user_id !== buddyId,
        ),
      );

    } catch (error) {
      console.error(error);
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Navbar />

      <section className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">

          <h1 className="text-5xl font-bold text-slate-900">
            Saved Buddies
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Your favorite travel companions.
          </p>

          {buddies.length === 0 && (
            <div className="mt-16 rounded-3xl bg-white p-16 text-center shadow-lg">
              <h2 className="text-2xl font-bold">
                No saved buddies yet
              </h2>
            </div>
          )}

          <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">

            {buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
              >
                <h2 className="text-2xl font-bold text-slate-900">
                  {buddy.name}
                </h2>

                <p className="mt-1 text-slate-500">
                  {buddy.city}
                </p>

                <p className="mt-5 line-clamp-3 text-slate-600">
                  {buddy.bio}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {buddy.interests?.map(
                    (interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-cyan-100 px-3 py-1 text-xs text-cyan-700"
                      >
                        {interest}
                      </span>
                    ),
                  )}
                </div>

                <div className="mt-8 flex gap-3">

                  <Button
                    onClick={() =>
                      router.push(
                        `/buddies/${buddy.user_id}`,
                      )
                    }
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                  >
                    View Profile
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      removeSaved(
                        buddy.user_id,
                      )
                    }
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
