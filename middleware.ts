// middleware.ts

import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import { isDemoMode } from "@/lib/demo-mode";

// ====================================
// PUBLIC ROUTES
// ====================================

const isPublicRoute =
  createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/join-trip(.*)",
  ]);

// ====================================
// PROTECTED ROUTES
// ====================================

const isProtectedRoute =
  createRouteMatcher([
    "/dashboard(.*)",
    "/admin(.*)",
    "/buddies(.*)",
    "/trips(.*)",
    "/my-trips(.*)",
    "/plan-trip(.*)",
    "/explore(.*)",

    // APIs
    "/api/trips(.*)",
    "/api/expenses(.*)",
    "/api/buddies(.*)",
    "/api/trip-members(.*)",
    "/api/create-order(.*)",
    "/api/verify-payment(.*)",
  ]);

export default clerkMiddleware(
  async (
    auth,
    req,
  ) => {
    if (isDemoMode) {
      return;
    }

    // ====================================
    // ALLOW PUBLIC
    // ====================================

    if (
      isPublicRoute(
        req,
      )
    ) {

      return;
    }

    // ====================================
    // PROTECT PRIVATE
    // ====================================

    if (
      isProtectedRoute(
        req,
      )
    ) {

      await auth.protect();
    }
  },
);

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - static files
     * - Next.js internals
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
