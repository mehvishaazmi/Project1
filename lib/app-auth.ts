"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useClerk,
  useAuth,
  useUser,
} from "@clerk/nextjs";

import {
  demoAdminUser,
  demoUser,
  isDemoMode,
} from "@/lib/demo-mode";

type DemoLocalUser = typeof demoUser;

type AppUserLike = {
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
  emailAddresses?: Array<{
    emailAddress?: string | null;
  }>;
} | null | undefined;

const demoSessionKey = "travelbuddy-demo-session";
const demoUserKey = "travelbuddy-demo-user";
const demoAuthChangedEvent = "travelbuddy-demo-auth-changed";

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
    return null;
  }

  const hasSession = window.localStorage.getItem(
    demoSessionKey,
  );

  if (!hasSession) {
    return null;
  }

  const stored = window.localStorage.getItem(
    demoUserKey,
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

export function setStoredDemoUser(user: DemoLocalUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(demoSessionKey, "true");
  window.localStorage.setItem(demoUserKey, JSON.stringify(user));
  window.dispatchEvent(new Event(demoAuthChangedEvent));
}

export function clearStoredDemoUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(demoSessionKey);
  window.localStorage.removeItem(demoUserKey);
  window.dispatchEvent(new Event(demoAuthChangedEvent));
}

export function getUserEmail(user: AppUserLike) {
  return (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  );
}

const fallbackAdminUser = toAppUser(demoAdminUser);

export function useAppAuth() {
  if (isDemoMode) {
    const [currentUser, setCurrentUser] =
      useState<DemoLocalUser | null>(() => getStoredDemoUser());

    useEffect(() => {
      const refreshUser = () => {
        setCurrentUser(getStoredDemoUser());
      };

      refreshUser();

      window.addEventListener("storage", refreshUser);
      window.addEventListener(demoAuthChangedEvent, refreshUser);

      return () => {
        window.removeEventListener("storage", refreshUser);
        window.removeEventListener(demoAuthChangedEvent, refreshUser);
      };
    }, []);

    return {
      isLoaded: true,
      isSignedIn: Boolean(currentUser),
      userId: currentUser?.id || null,
    };
  }

  return useAuth();
}

export function useAppSignOut() {
  if (isDemoMode) {
    return () => {
      clearStoredDemoUser();
      window.location.assign("/");
    };
  }

  const { signOut } = useClerk();

  return () => signOut({ redirectUrl: "/" });
}

export function useAppUser() {
  if (isDemoMode) {
    const [currentUser, setCurrentUser] =
      useState<DemoLocalUser | null>(() => getStoredDemoUser());

    useEffect(() => {
      const refreshUser = () => {
        const storedUser = getStoredDemoUser();

        setCurrentUser((previousUser) =>
          previousUser?.id === storedUser?.id &&
          previousUser?.email === storedUser?.email
            ? previousUser
            : storedUser,
        );
      };

      refreshUser();

      window.addEventListener("storage", refreshUser);
      window.addEventListener(demoAuthChangedEvent, refreshUser);

      return () => {
        window.removeEventListener("storage", refreshUser);
        window.removeEventListener(demoAuthChangedEvent, refreshUser);
      };
    }, []);

    const user = useMemo(
      () =>
        !currentUser
          ? null
          : currentUser.email === demoAdminUser.email
          ? fallbackAdminUser
          : toAppUser(currentUser),
      [currentUser],
    );

    return {
      isLoaded: true,
      isSignedIn: Boolean(user),
      user,
    };
  }

  return useUser();
}
