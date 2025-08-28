import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TrickipediaHeader } from "@/components/trickipedia-header";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Trickipedia - Master Every Trick",
  description:
    "The ultimate collaborative wiki for parkour, tricking, gymnastics, and trampwall.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {" "}
      <TrickipediaHeader />
      {children}
    </main>
  );
}
