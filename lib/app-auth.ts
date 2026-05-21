"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
  useUser,
} from "@clerk/nextjs";

import {
  demoAdminUser,
  demoUser,
  isDemoMode,
} from "@/lib/demo-mode";

type DemoLocalUser = typeof demoUser;

function toAppUser(user: DemoLocalUser) {
  return {
    id: user.id,
    firstName: user.name.split(" ")[0],
    fullName: user.name,
    username: user.email.split("@")[0],
    primaryEmailAddress: {
      emailAddress: user.email,
    },
    emailAddresses: [
      {
        emailAddress: user.email,
      },
    ],
  };
}

export function getStoredDemoUser() {
  if (typeof window === "undefined") {
    return demoUser;
  }

  const stored = window.localStorage.getItem(
    "travelbuddy-demo-user",
  );

  if (!stored) {
    return demoUser;
  }

  try {
    return JSON.parse(stored) as DemoLocalUser;
  } catch {
    return demoUser;
  }
}

export function getUserEmail(user: any) {
  return (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  );
}

const fallbackAdminUser = toAppUser(demoAdminUser);

export function useAppAuth() {
  if (isDemoMode) {
    return {
      isLoaded: true,
      isSignedIn: true,
      userId: demoUser.id,
    };
  }

  return useAuth();
}

export function useAppUser() {
  if (isDemoMode) {
    const [currentUser, setCurrentUser] =
      useState(() => getStoredDemoUser());

    useEffect(() => {
      const storedUser = getStoredDemoUser();

      setCurrentUser((previousUser) =>
        previousUser.id === storedUser.id &&
        previousUser.email === storedUser.email
          ? previousUser
          : storedUser,
      );
    }, []);

    const user = useMemo(
      () =>
        currentUser.email === demoAdminUser.email
          ? fallbackAdminUser
          : toAppUser(currentUser),
      [currentUser],
    );

    return {
      isLoaded: true,
      isSignedIn: true,
      user,
    };
  }

  return useUser();
}
