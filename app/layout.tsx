// cspell:disable
import "./globals.css";

import React from "react";
import type { Metadata } from "next";

import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/structured-data";
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from "@/lib/structured-data-utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfettiProvider } from "@/contexts/confetti-provider";
import { TrickipediaLayoutServer } from "./layout-server";
import { TrickipediaFooter } from "@/components/trickipdedia-footer";
import { UserProvider } from "@/contexts/user-provider";
import { UserProgressProvider } from "@/contexts/user-progress-provider";
import { NotificationsProvider } from "@/contexts/notifications-provider";
import { CategoriesProvider } from "@/contexts/categories-provider";

export const metadata: Metadata = {
  title: "Trickipedia - Learn New Tricks",
  description:
    "Discover and master new skills with Trickipedia. Explore a wide range of tricks, track your progress, and join a community of learners.",
  keywords:
    "tricks, learn tricks, skill development, trick tutorials, progress tracking, community learning",
  authors: [{ name: "Trickipedia", url: "https://trickipedia.app" }],
  openGraph: {
    title: "Trickipedia - Learn New Tricks",
    description:
      "Discover and master new skills with Trickipedia. Explore a wide range of tricks, track your progress, and join a community of learners.",
    url: "https://trickipedia.app",
    siteName: "Trickipedia",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Trickipedia" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Trickipedia" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Trickipedia" />
        {/* PWA Debug Script - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <script src="/pwa-debug.js" async></script>
        )}
      </head>
      <body className="font-sans antialiased">
        <Toaster position="top-center" closeButton />
        <PWARegister />
        <StructuredData data={generateWebsiteStructuredData()} />
        <StructuredData data={generateOrganizationStructuredData()} />

        <ThemeProvider
          attribute="class"
          defaultTheme="trickipedia"
          themes={["trickipedia", "dark"]}
          enableSystem={false}
        >
          <ConfettiProvider>
            <UserProvider>
              <CategoriesProvider>
                <UserProgressProvider>
                  <NotificationsProvider>
                    <TrickipediaLayoutServer>
                      {children}
                      <TrickipediaFooter />
                    </TrickipediaLayoutServer>
                  </NotificationsProvider>
                </UserProgressProvider>
              </CategoriesProvider>
            </UserProvider>
          </ConfettiProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
