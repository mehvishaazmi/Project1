import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { demoUser, isDemoMode } from "@/lib/demo-mode";
import { supabaseAdmin } from "@/lib/supabase-admin";

// VALID CATEGORIES
const VALID_CATEGORIES = [
  "Food",
  "Hotel",
  "Transport",
  "Shopping",
  "Activities",
  "Other",
];

type TripMember = {
  user_id: string;
  user_name?: string;
};

// ====================================
// CREATE EXPENSE
// ====================================

export async function POST(
  req: Request,
) {

  try {
    const body =
      await req.json();

    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        expense: {
          id: `demo-expense-${Date.now()}`,
          user_id: demoUser.id,
          paid_by: demoUser.id,
          paid_by_name: demoUser.name,
          created_at: new Date().toISOString(),
          ...body,
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
      trip_id,
      title,
      amount,
      category,
    } = body;

    // ====================================
    // VALIDATION
    // ====================================

    if (
      !trip_id ||
      !title ||
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

    const total =
      Number(amount);

    if (
      isNaN(total) ||
      total <= 0
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid amount",
        },
        { status: 400 },
      );
    }

    // CATEGORY VALIDATION
    const safeCategory =
      VALID_CATEGORIES.includes(
        category,
      )
        ? category
        : "Other";

    // ====================================
    // GET MEMBERS
    // ====================================

    const {
      data: members,
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          "trip_members",
        )
        .select("*")
        .eq(
          "trip_id",
          trip_id,
        );

    if (
      memberError
    ) {

      return NextResponse.json(
        {
          error:
            memberError.message,
        },
        { status: 500 },
      );
    }

    if (
      !members ||
      members.length === 0
    ) {

      return NextResponse.json(
        {
          error:
            "No trip members found",
        },
        { status: 400 },
      );
    }

    // ====================================
    // SECURITY CHECK
    // ====================================

    const currentMember =
      (members as TripMember[]).find(
        (
          member,
        ) =>
          member.user_id ===
          userId,
      );

    if (
      !currentMember
    ) {

      return NextResponse.json(
        {
          error:
            "You are not a member of this trip",
        },
        { status: 403 },
      );
    }

    // ====================================
    // CREATE EXPENSE
    // ====================================

    const {
      data: expense,
      error:
        expenseError,
    } =
      await supabaseAdmin
        .from(
          "expenses",
        )
        .insert({
          trip_id:
            String(
              trip_id,
            ),

          user_id:
            String(
              userId,
            ),

          title:
            String(
              title,
            ).trim(),

          amount:
            total,

          paid_by:
            String(
              userId,
            ),

          paid_by_name:
            currentMember.user_name,

          category:
            safeCategory,
        })
        .select()
        .single();

    if (
      expenseError ||
      !expense
    ) {

      console.error(
        expenseError,
      );

      return NextResponse.json(
        {
          error:
            expenseError?.message ||
            "Failed to create expense",
        },
        { status: 500 },
      );
    }

    // ====================================
    // SPLIT LOGIC
    // ====================================

    const memberCount =
      members.length;

    // AVOID FLOATING LOSS
    const baseSplit =
      Math.floor(
        (total /
          memberCount) *
          100,
      ) / 100;

    let remaining =
      total;

    const splitRows =
      (members as TripMember[]).map(
        (
          member,
          index,
        ) => {

          let splitAmount =
            baseSplit;

          // LAST MEMBER GETS REMAINDER
          if (
            index ===
            memberCount -
              1
          ) {

            splitAmount =
              Number(
                remaining.toFixed(
                  2,
                ),
              );
          }

          remaining -=
            splitAmount;

          return {
            expense_id:
              expense.id,

            user_id:
              String(
                member.user_id,
              ),

            amount:
              splitAmount,
          };
        },
      );

    // ====================================
    // INSERT SPLITS
    // ====================================

    const {
      error:
        splitError,
    } =
      await supabaseAdmin
        .from(
          "expense_splits",
        )
        .insert(
          splitRows,
        );

    // ROLLBACK EXPENSE
    if (splitError) {

      console.error(
        splitError,
      );

      // DELETE ORPHAN EXPENSE
      await supabaseAdmin
        .from("expenses")
        .delete()
        .eq(
          "id",
          expense.id,
        );

      return NextResponse.json(
        {
          error:
            "Failed to split expense",
        },
        { status: 500 },
      );
    }

    // ====================================
    // SUCCESS
    // ====================================

    return NextResponse.json({
      success: true,

      expense,
    });

  } catch (error: any) {

    console.error(
      "EXPENSE API ERROR:",
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
