// MySQL-backed admin compatibility client.
// Existing server routes still import `supabaseAdmin`, but persistence now goes through MySQL.

import "server-only";

import {
  dbClient,
} from "@/lib/db-client";

export const supabaseAdmin = dbClient;
