"use client";

import {
  adminEmail,
  demoAdminUser,
  demoUser,
} from "@/lib/demo-mode";

export type AdminUserStatus =
  | "online"
  | "active"
  | "idle";

export type AdminTrackedUser = {
  id: string;
  name: string;
  email: string;
  status: AdminUserStatus;
  lastSeen: string;
  role: "admin" | "user";
  page: string;
};

const storageKey = "travelbuddy-admin-users";

const defaultUsers: AdminTrackedUser[] = [
  {
    id: demoAdminUser.id,
    name: demoAdminUser.name,
    email: demoAdminUser.email,
    status: "online",
    lastSeen: new Date().toISOString(),
    role: "admin",
    page: "/admin",
  },
  {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    status: "active",
    lastSeen: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    role: "user",
    page: "/dashboard",
  },
  {
    id: "demo-user-2",
    name: "Maya Rao",
    email: "maya@example.com",
    status: "idle",
    lastSeen: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    role: "user",
    page: "/trips",
  },
];

function readUsers() {
  if (typeof window === "undefined") {
    return defaultUsers;
  }

  const stored =
    window.localStorage.getItem(storageKey);

  if (!stored) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(defaultUsers),
    );
    return defaultUsers;
  }

  try {
    return JSON.parse(stored) as AdminTrackedUser[];
  } catch {
    return defaultUsers;
  }
}

export function getTrackedUsers() {
  return readUsers();
}

export function trackUserVisit(user: {
  id: string;
  name: string;
  email: string;
  page: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const users = readUsers();
  const nextUser: AdminTrackedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    status: "online",
    lastSeen: new Date().toISOString(),
    role:
      user.email.toLowerCase() === adminEmail
        ? "admin"
        : "user",
    page: user.page,
  };

  const nextUsers = [
    nextUser,
    ...users.filter(
      (storedUser) => storedUser.id !== user.id,
    ),
  ];

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(nextUsers),
  );
}
