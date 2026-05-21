import { NextResponse } from "next/server";

import crypto from "crypto";

import { auth } from "@clerk/nextjs/server";

import { isDemoMode } from "@/lib/demo-mode";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ====================================
// CREATE ORDER
// ====================================

export async function POST(
  req: Request,
) {

  try {
    const body =
      await req.json();

    const {
      amount,
      trip_id,
    } = body;

    const normalizedAmount =
      Number(amount);

    if (
      isDemoMode ||
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json({
        id: `order_demo_${crypto.randomUUID()}`,
        amount: Math.round((normalizedAmount || 0) * 100),
        currency: "INR",
        status: "created",
        demo: true,
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

    // ====================================
    // VALIDATION
    // ====================================

    if (
      isNaN(
        normalizedAmount,
      ) ||
      normalizedAmount <= 0
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid amount",
        },
        { status: 400 },
      );
    }

    // MAX LIMIT
    if (
      normalizedAmount >
      100000
    ) {

      return NextResponse.json(
        {
          error:
            "Amount exceeds limit",
        },
        { status: 400 },
      );
    }

    // ====================================
    // VERIFY TRIP MEMBERSHIP
    // ====================================

    if (!trip_id) {

      return NextResponse.json(
        {
          error:
            "Trip ID required",
        },
        { status: 400 },
      );
    }

    const {
      data: member,
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

    if (!member) {

      return NextResponse.json(
        {
          error:
            "Access denied",
        },
        { status: 403 },
      );
    }

    // ====================================
    // CREATE ORDER
    // ====================================

    const { default: Razorpay } =
      await import("razorpay");

    const razorpay =
      new Razorpay({
        key_id:
          process.env
            .RAZORPAY_KEY_ID!,

        key_secret:
          process.env
            .RAZORPAY_KEY_SECRET!,
      });

    const order =
      await razorpay.orders.create(
        {
          amount:
            Math.round(
              normalizedAmount *
                100,
            ),

          currency:
            "INR",

          receipt:
            `receipt_${crypto.randomUUID()}`,

          notes: {
            trip_id,
            user_id:
              userId,
          },
        },
      );

    // ====================================
    // SUCCESS
    // ====================================

    return NextResponse.json(
      order,
    );

  } catch (error) {

    console.error(
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create order",
      },
      { status: 500 },
    );
  }
}
