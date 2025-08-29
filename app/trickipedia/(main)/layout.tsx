import type React from "react";
import { DonorBanner } from "@/components/donor-banner";
import { MasterSideNav } from "@/components/master-side-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-80 border-r bg-muted/10">
          <MasterSideNav />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {" "}
          <DonorBanner />
          {children}
        </main>
      </div>
    </>
  );
}
