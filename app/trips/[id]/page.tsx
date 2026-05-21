"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";

import {
  MapPin,
  Clock,
  Wallet,
  Calendar,
  ChevronRight,
  Loader2,
  Users,
  Plus,
  Receipt,
  MessageCircle,
} from "lucide-react";

import { Footer } from "@/components/Footer";

import { supabase } from "@/lib/supabase";

import { useAppUser as useUser } from "@/lib/app-auth";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

type Trip = {
  id: string;

  destination: string;

  days: string;

  budget: string;

  created_at: string;

  invite_code: string;

  plan: TripPlan;
};

type Member = {
  id: string;

  user_id: string;

  user_name: string;
};

type Buddy = {
  user_id: string;

  name: string;
};

const getImage = (
  destination: string,
) =>
  `https://picsum.photos/seed/${destination.replace(
    /\s/g,
    "",
  )}/1400/800`;

function formatTripDateRange(
  dates?: TripPlan["trip_dates"],
) {
  if (
    !dates?.start_date ||
    !dates?.end_date
  ) {
    return "";
  }

  const start = new Date(
    `${dates.start_date}T00:00:00`,
  );
  const end = new Date(
    `${dates.end_date}T00:00:00`,
  );

  return `${start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })} - ${end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export default function TripDetailPage() {

  const params =
    useParams();

  const router =
    useRouter();

  const { user } =
    useUser();

  const id =
    Array.isArray(
      params?.id,
    )
      ? params.id[0]
      : params?.id;

  const [trip, setTrip] =
    useState<Trip | null>(
      null,
    );

  const [members, setMembers] =
    useState<Member[]>([]);

  const [
    savedBuddies,
    setSavedBuddies,
  ] = useState<Buddy[]>(
    [],
  );

  const [
    selectedBuddy,
    setSelectedBuddy,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    inviteLoading,
    setInviteLoading,
  ] = useState(false);

  // ====================================
  // REALTIME MEMBERS
  // ====================================

  useEffect(() => {

    let channel:
      ReturnType<typeof supabase.channel> | null =
        null;

    if (id) {

      channel =
        supabase
          .channel(
            `trip-members-${id}`,
          )

          .on(
            "postgres_changes",
            {
              event: "*",

              schema:
                "public",

              table:
                "trip_members",

              filter:
                `trip_id=eq.${id}`,
            },

            async () => {

              await fetchMembers();
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

  }, [id]);

  // ====================================
  // FETCH DATA
  // ====================================

  useEffect(() => {

    if (
      !id ||
      !user?.id
    )
      return;

    fetchAll();

  }, [id, user?.id]);

  async function fetchAll() {

    try {

      setLoading(true);

      // ====================================
      // VERIFY MEMBER ACCESS
      // ====================================

      const {
        data: memberCheck,
      } = await supabase
        .from(
          "trip_members",
        )
        .select("*")
        .eq(
          "trip_id",
          id,
        )
        .eq(
          "user_id",
          user?.id,
        )
        .single();

      if (!memberCheck) {

        toast.error(
          "Access denied",
        );

        router.push(
          "/trips",
        );

        return;
      }

      // ====================================
      // FETCH TRIP
      // ====================================

      const {
        data,
        error,
      } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (
        error ||
        !data
      ) {

        console.error(
          error,
        );

        setNotFound(
          true,
        );

        return;
      }

      setTrip(data);

      // MEMBERS
      await fetchMembers();

      // ====================================
      // FETCH SAVED BUDDIES
      // ====================================

      const {
        data: buddies,
      } = await supabase
        .from(
          "saved_buddies",
        )
        .select("*")
        .eq(
          "saver_user_id",
          user?.id,
        );

      if (buddies) {

        const mapped =
          buddies.map(
            (b: any) => ({
              user_id:
                b.saved_user_id,

              name:
                b.saved_user_name ||
                "Buddy",
            }),
          );

        setSavedBuddies(
          mapped,
        );
      }

    } catch (error) {

      console.error(
        error,
      );

      toast.error(
        "Failed to load trip",
      );

    } finally {

      setLoading(false);
    }
  }

  // ====================================
  // FETCH MEMBERS
  // ====================================

  async function fetchMembers() {

    const {
      data:
        membersData,
    } = await supabase
      .from(
        "trip_members",
      )
      .select("*")
      .eq(
        "trip_id",
        id,
      );

    setMembers(
      membersData || [],
    );
  }

  // ====================================
  // INVITE MEMBER
  // ====================================

  async function inviteMember() {

    if (
      !selectedBuddy
    ) {

      toast.error(
        "Please select a buddy",
      );

      return;
    }

    try {

      setInviteLoading(
        true,
      );

      const buddy =
        savedBuddies.find(
          (b) =>
            b.user_id ===
            selectedBuddy,
        );

      if (!buddy) {

        toast.error(
          "Buddy not found",
        );

        return;
      }

      // PREVENT DUPLICATES
      const alreadyExists =
        members.some(
          (m) =>
            m.user_id ===
            selectedBuddy,
        );

      if (
        alreadyExists
      ) {

        toast.error(
          "Already added",
        );

        return;
      }

      // INSERT
      const res =
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
                  id,

                member_user_id:
                  buddy.user_id,

                member_name:
                  buddy.name,
              }),
          },
        );

      const data =
        await res.json();

      if (!res.ok) {

        toast.error(
          data.error ||
            "Failed to add member",
        );

        return;
      }

      toast.success(
        "Member added!",
      );

      setSelectedBuddy(
        "",
      );

      await fetchMembers();

    } catch (error) {

      console.error(
        error,
      );

      toast.error(
        "Something went wrong",
      );

    } finally {

      setInviteLoading(
        false,
      );
    }
  }

  // ====================================
  // COPY INVITE LINK
  // ====================================

  async function copyInviteLink() {

    if (
      !trip?.invite_code
    ) {

      toast.error(
        "Invite link unavailable",
      );

      return;
    }

    try {

      const inviteLink =
        `${window.location.origin}/join-trip/${trip.invite_code}`;

      await navigator.clipboard.writeText(
        inviteLink,
      );

      toast.success(
        "Invite link copied!",
      );

    } catch (error) {

      console.error(
        error,
      );

      toast.error(
        "Failed to copy link",
      );
    }
  }

  // ====================================
  // LOADING
  // ====================================

  if (loading) {

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

  // ====================================
  // NOT FOUND
  // ====================================

  if (
    notFound ||
    !trip
  ) {

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">

        <p className="text-2xl font-semibold">

          Trip not found
        </p>

        <Button
          className="
            bg-cyan-500
            hover:bg-cyan-600
          "
          onClick={() =>
            router.push(
              "/trips",
            )
          }
        >
          Back to Trips
        </Button>
      </div>
    );
  }

  const plan: TripPlan =
    typeof trip.plan ===
    "string"
      ? JSON.parse(
          trip.plan,
        )
      : trip.plan;

  const tripDateRange =
    formatTripDateRange(
      plan?.trip_dates,
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">

      <Navbar />

      {/* HERO */}
      <div className="relative h-[420px] overflow-hidden">

        <img
          src={getImage(
            trip.destination,
          )}
          alt={
            trip.destination
          }
          className="h-full w-full object-cover"
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-black/20
            to-transparent
          "
        />

        {/* BACK */}
        <button
          onClick={() =>
            router.back()
          }
          className="
            absolute
            left-6
            top-28
            rounded-full
            bg-white/20
            px-5
            py-2
            text-sm
            text-white
            backdrop-blur-md
            transition
            hover:bg-white/30
          "
        >
          ← Back
        </button>

        {/* CONTENT */}
        <div className="container absolute bottom-10 left-0 right-0">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-sm text-white/80">

                <MapPin className="h-4 w-4" />

                {
                  trip.destination
                }
              </div>

              <h1 className="text-5xl font-bold text-white lg:text-6xl">

                {
                  trip.destination
                }
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/80">

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
                    members.length
                  }{" "}
                  members
                </span>

                <span className="flex items-center gap-1">

                  <Calendar className="h-4 w-4" />

                  {tripDateRange ||
                    new Date(
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
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3">

              {/* INVITE */}
              <Dialog>

                <DialogTrigger asChild>

                  <Button
                    className="
                      rounded-2xl
                      bg-white
                      text-black
                      hover:bg-slate-200
                    "
                  >
                    <Plus className="mr-2 h-4 w-4" />

                    Invite Member
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-3xl">

                  <DialogHeader>

                    <DialogTitle>
                      Invite Buddy
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    <Select
                      value={
                        selectedBuddy
                      }
                      onValueChange={
                        setSelectedBuddy
                      }
                    >
                      <SelectTrigger>

                        <SelectValue placeholder="Select buddy" />

                      </SelectTrigger>

                      <SelectContent>

                        {savedBuddies.length >
                        0 ? (
                          savedBuddies.map(
                            (
                              buddy,
                            ) => (
                              <SelectItem
                                key={
                                  buddy.user_id
                                }
                                value={
                                  buddy.user_id
                                }
                              >
                                {
                                  buddy.name
                                }
                              </SelectItem>
                            ),
                          )
                        ) : (
                          <div className="p-3 text-sm text-slate-500">

                            No saved buddies
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={
                        inviteMember
                      }
                      disabled={
                        inviteLoading
                      }
                      className="
                        w-full
                        bg-cyan-500
                        hover:bg-cyan-600
                      "
                    >
                      {inviteLoading
                        ? "Adding..."
                        : "Add to Trip"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* INVITE LINK */}
              <Button
                onClick={
                  copyInviteLink
                }
                className="
                  rounded-2xl
                  bg-white
                  text-black
                  hover:bg-slate-200
                "
              >
                <Plus className="mr-2 h-4 w-4" />

                Copy Invite Link
              </Button>

              {/* EXPENSES */}
              <Button
                onClick={() =>
                  router.push(
                    `/trips/${trip.id}/expenses`,
                  )
                }
                className="
                  rounded-2xl
                  bg-cyan-500
                  text-white
                  hover:bg-cyan-600
                "
              >
                <Receipt className="mr-2 h-4 w-4" />

                Expenses
              </Button>

              {/* CHAT */}
              <Button
                onClick={() =>
                  toast.info(
                    "Chat feature coming soon 🚀",
                  )
                }
                variant="outline"
                className="
                  rounded-2xl
                  border-white/30
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  hover:bg-white/20
                "
              >
                <MessageCircle className="mr-2 h-4 w-4" />

                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container space-y-8 py-10">

        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-5">

          {[
            {
              label:
                "Duration",

              value: `${trip.days} days`,
            },

            {
              label:
                "Budget",

              value: `₹${Number(
                trip.budget,
              ).toLocaleString()}`,
            },

            {
              label:
                "Members",

              value:
                members.length,
            },

            {
              label:
                "Dates",

              value:
                tripDateRange ||
                "Not set",
            },

            {
              label:
                "Daily Avg",

              value: `₹${Math.round(
                Number(
                  trip.budget,
                ) /
                  Number(
                    trip.days,
                  ),
              ).toLocaleString()}`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="
                rounded-3xl
                bg-white
                p-6
                text-center
                shadow-md
              "
            >
              <p className="text-sm text-slate-500">

                {s.label}
              </p>

              <h2
                className={cn(
                  "mt-2 font-bold text-slate-900",
                  s.label === "Dates"
                    ? "text-base leading-snug"
                    : "text-3xl",
                )}
              >

                {s.value}
              </h2>
            </div>
          ))}
        </div>

        {/* MEMBERS */}
        <div className="rounded-3xl bg-white p-8 shadow-md">

          <h2 className="text-2xl font-bold text-slate-900">

            Trip Members
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {members.length >
            0 ? (
              members.map(
                (
                  member,
                ) => (

                  <div
                    key={
                      member.id
                    }
                    className="
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-slate-200
                      p-5
                    "
                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-cyan-100
                        text-lg
                        font-bold
                        text-cyan-700
                      "
                    >
                      {member.user_name
                        ?.charAt(
                          0,
                        )
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3 className="text-lg font-semibold text-slate-900">

                        {
                          member.user_name
                        }
                      </h3>

                      <p className="text-sm text-slate-500">

                        Trip Member
                      </p>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="text-slate-500">

                No members yet
              </div>
            )}
          </div>
        </div>

        {/* ITINERARY */}
        {(plan?.itinerary ??
          []).length >
          0 && (

          <div className="overflow-hidden rounded-3xl bg-white shadow-md">

            <div className="border-b border-slate-200 p-6">

              <h2 className="text-2xl font-bold text-slate-900">

                📅 Day-by-day itinerary
              </h2>
            </div>

            <div className="divide-y divide-slate-200">

              {(
                plan.itinerary ??
                []
              ).map((day) => (

                <div
                  key={
                    day.day
                  }
                  className="
                    p-6
                    transition
                    hover:bg-slate-50
                  "
                >

                  <div className="mb-4 flex items-center gap-3">

                    <span
                      className="
                        grid
                        h-10
                        w-10
                        place-items-center
                        rounded-full
                        bg-cyan-100
                        text-sm
                        font-bold
                        text-cyan-700
                      "
                    >
                      {day.day}
                    </span>

                    <h3 className="text-xl font-semibold text-slate-900">

                      Day{" "}
                      {day.day} —{" "}
                      {day.title}
                    </h3>
                  </div>

                  <ul className="space-y-2 pl-14">

                    {day.activities.map(
                      (
                        a,
                        j,
                      ) => (

                        <li
                          key={j}
                          className="
                            flex
                            items-center
                            gap-2
                            text-slate-700
                          "
                        >

                          <ChevronRight className="h-4 w-4 text-cyan-500" />

                          {a}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
