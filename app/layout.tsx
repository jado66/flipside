import React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
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
import { SupabaseProvider } from "@/utils/supabase/useSupabase";

export const metadata: Metadata = {
  // ... your existing metadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>{/* Your existing head content */}</head>
      <body className="font-sans antialiased">
        <Toaster position="top-center" closeButton />
        <PWARegister />
        <StructuredData data={generateWebsiteStructuredData()} />
        <StructuredData data={generateOrganizationStructuredData()} />

        <ThemeProvider
          attribute="class"
          defaultTheme="trickipedia"
          themes={["trickipedia"]}
        >
          <ConfettiProvider>
            <SupabaseProvider>
              <AuthProvider>
                <TrickipediaLayoutServer>
                  {children}
                  <TrickipediaFooter />
                </TrickipediaLayoutServer>
              </AuthProvider>
            </SupabaseProvider>
          </ConfettiProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
