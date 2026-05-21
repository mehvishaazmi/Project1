import type {
  Metadata,
} from "next";

import Script from "next/script";

import {
  ClerkProvider,
} from "@clerk/nextjs";

import AdminTracker from "@/components/AdminTracker";
import { Toaster } from "sonner";

import { isDemoMode } from "@/lib/demo-mode";

import "./globals.css";

export const metadata:
  Metadata = {
    title:
      "TravelBuddy",

    description:
      "AI-powered travel planning platform",
  };

export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const page = (
    <>
      {children}

      <AdminTracker />

      {/* GLOBAL TOASTS */}
      <Toaster
        richColors
        position="top-right"
      />
    </>
  );

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">

        {isDemoMode ? page : (
          <ClerkProvider>
            {page}
          </ClerkProvider>
        )}

        {!isDemoMode && (
          <>
            {/* RAZORPAY */}
            <Script
              src="https://checkout.razorpay.com/v1/checkout.js"
              strategy="lazyOnload"
            />
          </>
        )}

      </body>
    </html>
  );
}
