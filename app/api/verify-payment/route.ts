import { NextResponse } from "next/server";

import crypto from "crypto";

import { auth } from "@clerk/nextjs/server";

import { isDemoMode } from "@/lib/demo-mode";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ====================================
// VERIFY PAYMENT
// ====================================

export async function POST(
  req: Request,
) {

  try {
    const body =
      await req.json();

    if (
      isDemoMode ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json({
        success: true,
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      trip_id,
      receiver_name,
      amount,
    } = body;

    // ====================================
    // VALIDATION
    // ====================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !trip_id ||
      !receiver_name ||
      !amount
    ) {

      return NextResponse.json(
        {
          error:
            "Missing required fields",
        },
        { status: 400 },
      );
    }

    const normalizedAmount =
      Number(amount);

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

    // ====================================
    // VERIFY USER IS MEMBER
    // ====================================

    const {
      data: currentMember,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .select("*")
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
            "You are not a member of this trip",
        },
        { status: 403 },
      );
    }

    // ====================================
    // VERIFY SIGNATURE
    // ====================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET!,
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`,
        )
        .digest(
          "hex",
        );

    const isAuthentic =
      generatedSignature ===
      razorpay_signature;

    if (!isAuthentic) {

      return NextResponse.json(
        {
          error:
            "Invalid payment signature",
        },
        { status: 400 },
      );
    }

    // ====================================
    // PREVENT DUPLICATES
    // ====================================

    const {
      data:
        existingSettlement,
    } =
      await supabaseAdmin
        .from(
          "settlements",
        )
        .select("id")
        .eq(
          "razorpay_payment_id",
          razorpay_payment_id,
        )
        .single();

    if (
      existingSettlement
    ) {

      return NextResponse.json(
        {
          error:
            "Settlement already exists",
        },
        { status: 400 },
      );
    }

    // ====================================
    // SAVE SETTLEMENT
    // ====================================

    const {
      error:
        settlementError,
    } =
      await supabaseAdmin
        .from(
          "settlements",
        )
        .insert({
          trip_id,

          payer_name:
            currentMember.user_name,

          receiver_name,

          amount:
            normalizedAmount,

          razorpay_payment_id,

          status:
            "completed",
        });

    // HANDLE RACE CONDITION
    if (
      settlementError?.code ===
      "23505"
    ) {

      return NextResponse.json(
        {
          error:
            "Payment already verified",
        },
        { status: 400 },
      );
    }

    if (
      settlementError
    ) {

      console.error(
        settlementError,
      );

      return NextResponse.json(
        {
          error:
            settlementError.message,
        },
        { status: 500 },
      );
    }

    // ====================================
    // SUCCESS
    // ====================================

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {

    console.error(
      "VERIFY PAYMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Server error",
      },
      { status: 500 },
    );
  }
}
