"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { useAppUser as useUser } from "@/lib/app-auth";

import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";

import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";


type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
};

export default function ChatPage() {
  const params = useParams();

  const { user } = useUser();

  const otherUserId =
    params.id as string;

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user?.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user?.id})`,
      )
      .order("created_at", {
        ascending: true,
      });

    setMessages(data || []);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    await supabase
      .from("messages")
      .insert({
        sender_id: user?.id,
        receiver_id: otherUserId,
        content: input,
      });

    setInput("");

    fetchMessages();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">

          <div className="rounded-3xl bg-white p-6 shadow-xl">

            <div className="space-y-4">

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id ===
                    user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 ${
                      msg.sender_id ===
                      user?.id
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">

              <Input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value,
                  )
                }
                placeholder="Type message..."
              />

              <Button
                onClick={sendMessage}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
