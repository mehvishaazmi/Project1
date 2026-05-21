import { NextResponse } from "next/server";

import {
  runDbOperation,
  type DbOperation,
} from "@/lib/mysql-server";

export async function POST(req: Request) {
  try {
    const operation =
      (await req.json()) as DbOperation;

    const result =
      await runDbOperation(operation);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Database error",
        },
      },
      {
        status: 500,
      },
    );
  }
}
