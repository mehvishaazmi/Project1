"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  UserButton,
} from "@clerk/nextjs";

import { adminEmail, demoUser, isDemoMode } from "@/lib/demo-mode";
import {
  getUserEmail,
  useAppAuth,
  useAppSignOut,
  useAppUser,
} from "@/lib/app-auth";
import { cn } from "@/lib/utils";

import { useState } from "react";

import {
  LogOut,
  Menu,
  X,
} from "lucide-react";

// ====================================
// PUBLIC LINKS
// ====================================

const publicLinks = [
  {
    name: "Home",
    href: "/",
  },

  {
    name: "Explore",
    href: "/explore",
  },
];

// ====================================
// PRIVATE LINKS
// ====================================

const privateLinks = [
  {
    name: "Trips",
    href: "/trips",
  },

  {
    name: "Buddies",
    href: "/buddies",
  },

  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export default function Navbar() {

  const pathname =
    usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const {
    isSignedIn,
    isLoaded,
  } = useAppAuth();

  const {
    user,
  } = useAppUser();

  const signOut =
    useAppSignOut();

  const currentEmail =
    getUserEmail(user).toLowerCase();

  const currentInitials =
    (
      user?.fullName ||
      user?.firstName ||
      demoUser.name
    )
      .slice(0, 2)
      .toUpperCase();

  const isAdmin =
    currentEmail === adminEmail;

  const signedIn =
    isSignedIn;

  const authLoaded =
    isDemoMode ||
    isLoaded;

  const navLinks = [
    ...publicLinks,

    ...(signedIn
      ? privateLinks
      : []),

    ...(signedIn && isAdmin
      ? [
          {
            name: "Admin",
            href: "/admin",
          },
        ]
      : []),
  ];

  return (
    <header className="fixed left-0 top-0 z-50 w-full">

      <div className="mx-auto max-w-7xl px-4 py-4">

        <div
          className="
            rounded-3xl
            border
            border-white/20
            bg-white/80
            shadow-xl
            backdrop-blur-xl
          "
        >

          {/* NAV */}
          <div className="flex items-center justify-between px-6 py-4">

            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() =>
                setMobileOpen(false)
              }
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-500
                  text-lg
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                T
              </div>

              <div className="flex flex-col">

                <span className="text-lg font-bold tracking-tight text-slate-900">

                  TravelBuddy
                </span>

                <span className="text-xs text-slate-500">

                  Explore Together
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-8 lg:flex">

              {navLinks.map(
                (link) => {

                  const active =
                    pathname ===
                    link.href;

                  return (
                    <Link
                      key={
                        link.href
                      }
                      href={
                        link.href
                      }
                      className={cn(
                        `
                          relative
                          text-sm
                          font-semibold
                          transition-all
                          duration-200
                        `,

                        active
                          ? "text-cyan-600"
                          : "text-slate-600 hover:text-slate-900",
                      )}
                    >

                      <span className="relative">

                        {
                          link.name
                        }

                        {active && (

                          <span
                            className="
                              absolute
                              -bottom-2
                              left-0
                              h-[2px]
                              w-full
                              rounded-full
                              bg-cyan-500
                            "
                          />
                        )}
                      </span>
                    </Link>
                  );
                },
              )}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

              {/* AUTH */}
              {authLoaded &&
                (signedIn ? (

                  <div className="hidden items-center gap-3 md:flex">

                    {isDemoMode ? (
                      <div
                        className="
                          grid
                          h-9
                          w-9
                          place-items-center
                          rounded-full
                          bg-cyan-500
                          text-xs
                          font-bold
                          text-white
                        "
                        title={user?.fullName || demoUser.name}
                      >
                        {currentInitials}
                      </div>
                    ) : (
                      <UserButton />
                    )}

                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white/70
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-700
                        transition-all
                        hover:bg-slate-100
                        hover:text-slate-950
                      "
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>

                ) : (

                  <div className="hidden items-center gap-3 md:flex">

                    {/* SIGN IN */}
                    <Link
                      href="/sign-in"
                      className="
                        text-sm
                        font-semibold
                        text-slate-600
                        transition-all
                        hover:text-slate-900
                      "
                    >
                      Sign In
                    </Link>

                    {/* SIGN UP */}
                    <Link
                      href="/sign-up"
                      className="
                        rounded-2xl
                        bg-cyan-500
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        transition-all
                        hover:bg-cyan-600
                      "
                    >
                      Sign Up
                    </Link>
                  </div>
                ))}

              {/* MOBILE BUTTON */}
              <button
                onClick={() =>
                  setMobileOpen(
                    (prev) =>
                      !prev,
                  )
                }
                className="
                  grid
                  h-10
                  w-10
                  place-items-center
                  rounded-2xl
                  bg-slate-100
                  transition-all
                  hover:bg-slate-200
                  lg:hidden
                "
                aria-label="Toggle menu"
              >

                {mobileOpen ? (

                  <X className="h-5 w-5 text-slate-700" />

                ) : (

                  <Menu className="h-5 w-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileOpen && (

            <nav
              className="
                border-t
                border-slate-200
                px-6
                py-5
                lg:hidden
              "
            >

              <div className="flex flex-col gap-2">

                {navLinks.map(
                  (link) => {

                    const active =
                      pathname ===
                      link.href;

                    return (
                      <Link
                        key={
                          link.href
                        }
                        href={
                          link.href
                        }
                        onClick={() =>
                          setMobileOpen(false)
                        }
                        className={cn(
                          `
                            rounded-2xl
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition-all
                          `,

                          active
                            ? "bg-cyan-100 text-cyan-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                      >
                        {
                          link.name
                        }
                      </Link>
                    );
                  },
                )}

                {/* MOBILE AUTH */}
                {authLoaded && (

                    <div
                      className="
                        mt-4
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-slate-200
                        pt-4
                      "
                    >

                      {signedIn ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            signOut();
                          }}
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-slate-200
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-slate-700
                            hover:bg-slate-100
                          "
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      ) : (
                        <>
                          {/* SIGN IN */}
                          <Link
                            href="/sign-in"
                            onClick={() =>
                              setMobileOpen(false)
                            }
                            className="
                              rounded-2xl
                              px-4
                              py-3
                              text-sm
                              font-semibold
                              text-slate-700
                              hover:bg-slate-100
                            "
                          >
                            Sign In
                          </Link>

                          {/* SIGN UP */}
                          <Link
                            href="/sign-up"
                            onClick={() =>
                              setMobileOpen(false)
                            }
                            className="
                              rounded-2xl
                              bg-cyan-500
                              px-4
                              py-3
                              text-center
                              text-sm
                              font-semibold
                              text-white
                              shadow-lg
                              hover:bg-cyan-600
                            "
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
