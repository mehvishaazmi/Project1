import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { isDemoMode } from "@/lib/demo-mode";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ======================================
// ADD MEMBER TO TRIP
// ======================================

export async function POST(
  req: Request,
) {

  try {
    const body =
      await req.json();

    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        member: {
          id: `demo-member-${Date.now()}`,
          trip_id: body.trip_id,
          user_id: body.member_user_id,
          user_name: body.member_name || "Demo Traveler",
        },
      });
    }

    // ======================================
    // AUTH
    // ======================================

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

    // ======================================
    // BODY
    // ======================================

    const {
  trip_id,
  member_user_id,
  member_name,
  invite_join,
} = body;

    // ======================================
    // VALIDATION
    // ======================================

    if (
      !trip_id ||
      !member_user_id
    ) {

      return NextResponse.json(
        {
          error:
            "Missing fields",
        },
        { status: 400 },
      );
    }

    // ======================================
    // VERIFY CURRENT USER IS TRIP MEMBER
    // ======================================

    const {
      data: currentMember,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .select("id")
        .eq(
          "trip_id",
          trip_id,
        )
        .eq(
          "user_id",
          userId,
        )
        .single();

    if (!currentMember) {

      return NextResponse.json(
        {
          error:
            "Access denied",
        },
        { status: 403 },
      );
    }

    // ======================================
    // PREVENT SELF-ADD
    // ======================================

    if (
  member_user_id ===
    userId &&
  !invite_join
) {

      return NextResponse.json(
        {
          error:
            "You are already part of this trip",
        },
        { status: 400 },
      );
    }

    // ======================================
    // PREVENT DUPLICATES
    // ======================================

    const {
      data: existing,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .select("id")
        .eq(
          "trip_id",
          trip_id,
        )
        .eq(
          "user_id",
          member_user_id,
        )
        .single();

    if (existing) {

      return NextResponse.json(
        {
          error:
            "Member already added",
        },
        { status: 400 },
      );
    }

    // ======================================
    // INSERT MEMBER
    // ======================================

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .insert({
          trip_id,

          user_id:
            member_user_id,

          user_name:
            member_name ||
            "Traveler",
        })
        .select()
        .single();

    // ======================================
    // HANDLE DUPLICATE RACE CONDITION
    // ======================================

    if (
      error?.code ===
      "23505"
    ) {

      return NextResponse.json(
        {
          error:
            "Member already exists",
        },
        { status: 400 },
      );
    }

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

    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json({
      success: true,

      member: data,
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
