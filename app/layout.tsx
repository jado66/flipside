import "./globals.css";

import React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/contexts/auth-provider";
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
      <head>{/* Your existing head content */}</head>
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
            <AuthProvider>
              <UserProvider>
                <TrickipediaLayoutServer>
                  {children}
                  <TrickipediaFooter />
                </TrickipediaLayoutServer>
              </UserProvider>
            </AuthProvider>
          </ConfettiProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
