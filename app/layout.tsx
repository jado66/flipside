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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/"
  ),
  title: {
    default: "Trickipedia - Master Every Trick",
    template: "%s | Trickipedia",
  },
  description:
    "The ultimate collaborative wiki for parkour, tricking, gymnastics, and trampwall tricks. Learn step-by-step tutorials, watch videos, and master every move.",
  keywords: [
    "parkour",
    "tricking",
    "gymnastics",
    "trampwall",
    "tutorials",
    "tricks",
    "how to",
    "learn",
    "action sports",
    "movement",
    "wiki",
    "community",
  ],
  authors: [{ name: "Trickipedia Community" }],
  creator: "Trickipedia",
  publisher: "Trickipedia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Trickipedia",
    title: "Trickipedia - Master Every Trick",
    description:
      "The ultimate collaborative wiki for parkour, tricking, gymnastics, and trampwall tricks. Learn step-by-step tutorials, watch videos, and master every move.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trickipedia - Master Every Trick",
    description:
      "The ultimate collaborative wiki for parkour, tricking, gymnastics, and trampwall tricks. Learn step-by-step tutorials, watch videos, and master every move.",
    creator: "@trickipedia", // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "mi0X-IH1RpX97JzuuF16GCbe4TDMeAryBiUDYvBHc7c",
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
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
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`font-sans  ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Toaster position="top-center" closeButton />
        <PWARegister />
        <StructuredData data={generateWebsiteStructuredData()} />
        <StructuredData data={generateOrganizationStructuredData()} />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="trickipedia"
            themes={["trickipedia"]}
          >
            <ConfettiProvider>{children}</ConfettiProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
