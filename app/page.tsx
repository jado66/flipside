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

      <FeaturedCategories />
      <RecentTricks />
      <div className="py-10 px-4">
        <InstallPWAApp className="max-w-lg mx-auto" />
      </div>
      <hr className="mb-10 border-t border-muted" />
      <ContributingSection />
      <CommunityStats />
    </main>
  );
}
