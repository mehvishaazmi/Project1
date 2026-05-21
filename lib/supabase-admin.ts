// lib/supabase-admin.ts

import "server-only";

import {
  createClient,
} from "@supabase/supabase-js";

import { isDemoMode } from "@/lib/demo-mode";

// ====================================
// ENV VALIDATION
// ====================================

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;

const missingSupabaseEnv =
  !supabaseUrl ||
  !serviceRoleKey;

// ====================================
// ADMIN CLIENT
// ====================================
// SERVER-ONLY
//
// Used for:
// - protected APIs
// - admin DB operations
// - payment verification
// - secure inserts/updates
//
// NEVER import this into:
// - client components
// - browser code
// ====================================

const missingSupabaseClient =
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Missing Supabase environment variables",
        );
      },
    },
  );

export const supabaseAdmin =
  missingSupabaseEnv
    ? isDemoMode
      ? (missingSupabaseClient as ReturnType<typeof createClient>)
      : (() => {
          throw new Error(
            "Missing Supabase environment variables",
          );
        })()
    : createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },

          global: {
            headers: {
              "x-application-name":
                "travelbuddy",
            },
          },
        },
      );
