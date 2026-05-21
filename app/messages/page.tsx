"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAppUser as useUser } from "@/lib/app-auth";

import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";

import { Footer } from "@/components/Footer";

import { Loader2 } from "lucide-react";


type Conversation = {
  user_id: string;
  name: string;
  city: string;
  lastMessage: string;
};

export default function MessagesPage() {
  const router = useRouter();

  const { user } = useUser();

  const [loading, setLoading] =
    useState(true);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  async function fetchConversations() {
    try {
      const { data: messages } =
        await supabase
          .from("messages")
          .select("*")
          .or(
            `sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`,
          )
          .order("created_at", {
            ascending: false,
          });

      const uniqueUsers =
        new Map();

      for (const msg of messages || []) {
        const otherUser =
          msg.sender_id === user?.id
            ? msg.receiver_id
            : msg.sender_id;

        if (
          !uniqueUsers.has(otherUser)
        ) {
          uniqueUsers.set(otherUser, msg);
        }
      }

      const ids = Array.from(
        uniqueUsers.keys(),
      );

      if (ids.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } =
        await supabase
          .from("buddy_profiles")
          .select("*")
          .in("user_id", ids);

      const merged =
        profiles?.map((profile: any) => ({
          user_id: profile.user_id,
          name: profile.name,
          city: profile.city,
          lastMessage:
            uniqueUsers.get(
              profile.user_id,
            )?.content || "",
        })) || [];

      setConversations(merged);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
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
        <div className="mx-auto max-w-4xl px-6">

          <h1 className="text-5xl font-bold text-slate-900">
            Messages
          </h1>

          <div className="mt-12 space-y-4">

            {conversations.map((chat) => (
              <div
                key={chat.user_id}
                onClick={() =>
                  router.push(
                    `/messages/${chat.user_id}`,
                  )
                }
                className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  {chat.name}
                </h2>

                <p className="mt-1 text-slate-500">
                  {chat.city}
                </p>

                <p className="mt-4 line-clamp-1 text-slate-600">
                  {chat.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
