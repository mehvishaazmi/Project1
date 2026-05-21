import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }, // ✅ FIX
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ MUST unwrap params
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  console.log("API ID:", id);

  const { data, error } = await supabaseAdmin
    .from("trips")
    .select("*")
    .eq("id", id);
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const trip = data[0];

  // 🔐 SECURITY CHECK
  if (trip.user_id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(trip);
}
