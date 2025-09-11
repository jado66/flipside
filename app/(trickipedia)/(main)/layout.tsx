import { ContributorBanner } from "@/components/contributor-banner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContributorBanner />
      {children}
    </>
  );
}
