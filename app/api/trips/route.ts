import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import crypto from "crypto";

import { demoUser, isDemoMode } from "@/lib/demo-mode";
import { supabaseAdmin } from "@/lib/supabase-admin";

const demoTrips = [
  {
    id: "demo-trip-bali",
    user_id: demoUser.id,
    destination: "Bali",
    days: 5,
    budget: 45000,
    created_at: new Date().toISOString(),
    invite_code: "DEMO123",
    plan: null,
  },
  {
    id: "demo-trip-tokyo",
    user_id: demoUser.id,
    destination: "Tokyo",
    days: 7,
    budget: 120000,
    created_at: new Date().toISOString(),
    invite_code: "DEMO456",
    plan: null,
  },
];

// ====================================
// GET USER TRIPS
// ====================================

export async function GET() {

  try {
    if (isDemoMode) {
      return NextResponse.json(demoTrips);
    }

    const { userId } =
      await auth();

    if (!userId) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 },
      );
    }

    // ====================================
    // GET MEMBERSHIPS
    // ====================================

    const {
      data: memberships,
      error:
        membershipError,
    } = await supabaseAdmin
      .from(
        "trip_members",
      )
      .select(
        "trip_id",
      )
      .eq(
        "user_id",
        userId,
      );

    if (
      membershipError
    ) {

      return NextResponse.json(
        {
          error:
            membershipError.message,
        },
        { status: 500 },
      );
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

      return NextResponse.json(
        [],
      );
    }

    // ====================================
    // GET TRIPS
    // ====================================

    const {
      data,
      error,
    } = await supabaseAdmin
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

    if (error) {

      console.error(
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      data || [],
    );

  } catch (err: any) {

    console.error(
      err,
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Server error",
      },
      { status: 500 },
    );
  }
}

// ====================================
// CREATE TRIP
// ====================================

export async function POST(
  req: Request,
) {

  try {
    const body =
      await req.json();

    if (isDemoMode) {
      const {
        destination,
        days,
        budget,
        plan,
      } = body;

      return NextResponse.json({
        success: true,
        message:
          "Demo trip created successfully",
        trip: {
          id: `demo-trip-${crypto.randomUUID()}`,
          user_id: demoUser.id,
          destination,
          days,
          budget,
          plan,
          invite_code: "DEMO",
          created_at: new Date().toISOString(),
        },
      });
    }

    // ====================================
    // AUTH
    // ====================================

    const { userId } =
      await auth();

    if (!userId) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 },
      );
    }

    // ====================================
    // BODY
    // ====================================

    const {
      destination,
      days,
      budget,
      plan,
      user_name,
    } = body;

    // ====================================
    // VALIDATION
    // ====================================

    if (
      !destination ||
      !days ||
      !budget ||
      !plan
    ) {

      return NextResponse.json(
        {
          error:
            "Missing required fields",
        },
        { status: 400 },
      );
    }

    // DAYS
    if (
      Number(days) <= 0
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid days",
        },
        { status: 400 },
      );
    }

    // BUDGET
    if (
      Number(budget) <= 0
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid budget",
        },
        { status: 400 },
      );
    }

    // ====================================
    // GENERATE INVITE CODE
    // ====================================

    const inviteCode =
      crypto.randomUUID();

    // ====================================
    // CREATE TRIP
    // ====================================

    const {
      data: trip,
      error: tripError,
    } = await supabaseAdmin
      .from("trips")
      .insert({
        user_id:
          userId,

        destination:
          String(
            destination,
          ).trim(),

        days:
          Number(days),

        budget:
          Number(budget),

        plan,

        invite_code:
          inviteCode,
      })
      .select()
      .single();

    if (
      tripError ||
      !trip
    ) {

      console.error(
        tripError,
      );

      return NextResponse.json(
        {
          error:
            tripError?.message ||
            "Failed to create trip",
        },
        { status: 500 },
      );
    }

    // ====================================
    // AUTO ADD OWNER
    // ====================================

    const {
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .insert({
          trip_id:
            trip.id,

          user_id:
            userId,

          user_name:
            user_name ||
            "Trip Owner",

          role:
            "owner",
        });

    // ROLLBACK TRIP IF MEMBER FAILS
    if (memberError) {

      console.error(
        memberError,
      );

      // DELETE CREATED TRIP
      await supabaseAdmin
        .from("trips")
        .delete()
        .eq(
          "id",
          trip.id,
        );

      return NextResponse.json(
        {
          error:
            "Failed to initialize trip",
        },
        { status: 500 },
      );
    }

    // ====================================
    // SUCCESS
    // ====================================

    return NextResponse.json({
      success: true,

      message:
        "Trip created successfully",

      trip,
    });

  } catch (err: any) {

    console.error(
      err,
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Server error",
      },
      { status: 500 },
    );
  }
}
