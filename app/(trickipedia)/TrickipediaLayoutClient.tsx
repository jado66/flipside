"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { TrickipediaHeader } from "@/components/trickipedia-header";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MasterSideNav } from "@/components/side-nav";

export function TrickipediaLayoutClient({
  children,
  geistSans,
  geistMono,
}: {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="trickipedia"
      themes={["trickipedia"]}
    >
      <TrickipediaHeader onMobileMenuClick={() => setMobileSidebarOpen(true)} />
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <SidebarProvider defaultOpen={true}>
          <div className="fixed inset-0 z-50 bg-black/40 flex">
            <div className="bg-background w-[90vw] max-w-[420px] h-full shadow-lg relative animate-slide-in-left overflow-y-auto px-2 pt-2">
              <button
                aria-label="Close menu"
                className="absolute top-2 right-2 p-2 rounded hover:bg-muted"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <MasterSideNav onItemClick={() => setMobileSidebarOpen(false)} />
            </div>
            {/* Click outside to close */}
            <div
              className="flex-1"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        </SidebarProvider>
      )}
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <Sidebar className="hidden md:flex md:w-65 border-r bg-muted/10">
            <MasterSideNav />
          </Sidebar>
          <SidebarInset className="flex-1">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
