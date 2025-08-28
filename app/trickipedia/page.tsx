import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { TrickipediaHeroSection } from "@/components/trickipedia-hero-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <TrickipediaHeroSection />
        <FeaturedCategories />
        <RecentTricks />
        <CommunityStats />
      </main>
    </div>
  );
}
