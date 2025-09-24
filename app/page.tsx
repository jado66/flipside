// app/page.tsx (or wherever HomePageServer is)
import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { TrickipediaHeroSection } from "@/components/trickipedia-hero-section";
import ContributingSection from "@/components/contributing-section";

export default async function HomePageServer() {
  return (
    <main>
      <TrickipediaHeroSection />
      {/* Get the App Section */}
      <section className="w-full flex flex-col items-center py-8 px-4">
        <div className="max-w-xl w-full text-center bg-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">App Coming Soon!</h2>
          <p className="mb-4 text-muted-foreground">
            Trickipedia app coming soon! Stay tuned for updates and new
            features.
          </p>
          <img
            src="/favicon/android-chrome-192x192.png"
            alt="Flipside App Icon"
            className="mx-auto mb-2 w-16 h-16 rounded"
          />
          <span className="text-xs text-muted-foreground block mt-2">
            PWA enabled for offline access
          </span>
        </div>
      </section>
      <ContributingSection />
      <FeaturedCategories />
      <RecentTricks />
      <CommunityStats />
    </main>
  );
}
