"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  getUserEmail,
  useAppUser,
} from "@/lib/app-auth";
import { isDemoMode } from "@/lib/demo-mode";
import { trackUserVisit } from "@/lib/admin-users";

export default function AdminTracker() {
  const pathname = usePathname();
  const { user } = useAppUser();

  useEffect(() => {
    if (!isDemoMode || !user?.id) {
      return;
    }

    trackUserVisit({
      id: user.id,
      name:
        user.fullName ||
        user.firstName ||
        "Unknown User",
      email: getUserEmail(user),
      page: pathname || "/",
    });
  }, [pathname, user]);

  return null;
}
