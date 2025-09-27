// app/page.tsx (or wherever HomePageServer is)
import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { TrickipediaHeroSection } from "@/components/trickipedia-hero-section";
import ContributingSection from "@/components/contributing-section";
import { InstallPWAApp } from "@/components/install-pwa-app";

export default async function HomePageServer() {
  return (
    <main>
      <TrickipediaHeroSection />
      {/* Get the App Section */}
      <InstallPWAApp />
      <ContributingSection />
      <FeaturedCategories />
      <RecentTricks />
      <CommunityStats />
    </main>
  );
}
