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

type LocalAccount = DemoLocalUser & {
  password: string;
};

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
const demoAccountsKey = "travelbuddy-local-accounts";
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

function getLocalAccounts() {
  if (typeof window === "undefined") {
    return [] as LocalAccount[];
  }

  const stored = window.localStorage.getItem(
    demoAccountsKey,
  );

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as LocalAccount[];
  } catch {
    return [];
  }
}

function saveLocalAccounts(
  accounts: LocalAccount[],
) {
  window.localStorage.setItem(
    demoAccountsKey,
    JSON.stringify(accounts),
  );
}

function createLocalUserId() {
  const randomId =
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  return `local-user-${randomId}`;
}

export function createLocalAccount({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const accounts = getLocalAccounts();
  const existing = accounts.find(
    (account) =>
      account.email.toLowerCase() ===
      normalizedEmail,
  );

  if (existing) {
    throw new Error(
      "An account with this email already exists. Please sign in.",
    );
  }

  const user: DemoLocalUser = {
    ...demoUser,
    id: createLocalUserId(),
    email: normalizedEmail,
    name,
    initials: name.slice(0, 2).toUpperCase(),
  };

  saveLocalAccounts([
    ...accounts,
    {
      ...user,
      password,
    },
  ]);

  setStoredDemoUser(user);

  return user;
}

export function signInLocalAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const account = getLocalAccounts().find(
    (storedAccount) =>
      storedAccount.email.toLowerCase() ===
      normalizedEmail,
  );

  if (!account) {
    throw new Error(
      "No account found with this email. Please sign up first.",
    );
  }

  if (account.password !== password) {
    throw new Error(
      "Incorrect password.",
    );
  }

  const user: DemoLocalUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    initials: account.initials,
  };

  setStoredDemoUser(user);

  return user;
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
