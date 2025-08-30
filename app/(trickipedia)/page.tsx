import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { TrickipediaHeroSection } from "@/components/trickipedia-hero-section";
import { ThemeProvider } from "@/components/theme-provider";
import { TrickipediaHeader } from "@/components/trickipedia-header";
import { InstallPWAButton } from "@/components/install-pwa-button";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MasterSideNav } from "@/components/side-nav";
import ContributingSection from "@/components/contributing-section";

export default function HomePage() {
  return (
    <main>
      <TrickipediaHeroSection />
      {/* Get the App Section */}
      <section className="w-full flex flex-col items-center py-8 px-4">
        <div className="max-w-xl w-full text-center bg-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Get the App</h2>
          <p className="mb-4 text-muted-foreground">
            Install Flipside on your device for the best experience. Tap the{" "}
            <span className="font-semibold">Share</span> icon and choose{" "}
            <span className="font-semibold">Add to Home Screen</span> on mobile,
            or use your browser&apos;s install option on desktop.
          </p>
          <img
            src="/favicon/android-chrome-192x192.png"
            alt="Flipside App Icon"
            className="mx-auto mb-2 w-16 h-16 rounded"
          />
          <InstallPWAButton />
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
