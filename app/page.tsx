import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { CTASection } from "@/components/cta-section";
import { MainNav } from "@/components/main-nav";
import { ThemeProvider } from "@/components/theme-provider";

export default function HomePage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="flipside"
      themes={["flipside", "trickipedia"]}
    >
      <div className="min-h-screen">
        <MainNav />
        <main>
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <footer className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FS</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    Flipside
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Connecting the action sports community through hubs, events,
                  and shared passion for movement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Find Hubs</li>
                  <li>Browse Events</li>
                  <li>Schedule Training</li>
                  <li>Connect Athletes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Sports</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Parkour</li>
                  <li>Trampoline</li>
                  <li>Tricking</li>
                  <li>Freerunning</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Help Center</li>
                  <li>Community Guidelines</li>
                  <li>Contact Us</li>
                  <li>Privacy Policy</li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
              <p>&copy; 2024 Flipside. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
