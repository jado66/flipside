import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturedCategories />
        <RecentTricks />
        <CommunityStats />
      </main>
    </div>
  );
}
