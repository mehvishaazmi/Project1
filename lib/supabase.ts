// MySQL-backed compatibility client.
// Existing app code still imports `supabase`, but persistence now goes through MySQL.

import {
  dbClient,
} from "@/lib/db-client";

export const supabase = dbClient;
