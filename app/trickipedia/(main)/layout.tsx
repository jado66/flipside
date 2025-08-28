import type React from "react";
import { DonorBanner } from "@/components/donor-banner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DonorBanner />
      {children}
    </>
  );
}
