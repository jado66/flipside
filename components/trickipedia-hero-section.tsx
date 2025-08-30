"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader2 } from "lucide-react";
import { createClient } from "@/lib/client"; // Adjust import path as needed

interface HeroStats {
  totalTricks: number;
  totalUsers: number;
  totalCategories: number;
  totalViews: number;
}

export function TrickipediaHeroSection() {
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        const supabase = await createClient();

        // Fetch all stats in parallel
        const [
          { count: totalTricks },
          { count: totalUsers },
          { count: totalCategories },
          { data: viewsData },
        ] = await Promise.all([
          // Published tricks count
          supabase
            .from("tricks")
            .select("*", { count: "exact", head: true })
            .eq("is_published", true),

          // Total users count
          supabase.from("users").select("*", { count: "exact", head: true }),

          // Active master categories count
          supabase
            .from("master_categories")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true),

          // Sum of all view counts for published tricks
          supabase.from("tricks").select("view_count").eq("is_published", true),
        ]);

        // Calculate total views
        const totalViews =
          viewsData?.reduce((sum, trick) => sum + (trick.view_count || 0), 0) ||
          0;

        setStats({
          totalTricks: totalTricks || 0,
          totalUsers: totalUsers || 0,
          totalCategories: totalCategories || 0,
          totalViews,
        });
      } catch (err) {
        console.error("Error fetching hero stats:", err);
        // Set default values on error
        setStats({
          totalTricks: 0,
          totalUsers: 0,
          totalCategories: 0,
          totalViews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroStats();
  }, []);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toLocaleString();
  };

  // Generate hero stats based on real data
  const getHeroStats = (stats: HeroStats) => [
    {
      value: formatNumber(stats.totalTricks),
      label: stats.totalTricks === 1 ? "Documented Trick" : "Documented Tricks",
      fallback: "500+",
    },
    {
      value: formatNumber(stats.totalUsers),
      label: stats.totalUsers === 1 ? "Community Member" : "Community Members",
      fallback: "1.2k",
    },
    {
      value: stats.totalCategories.toString(),
      label: stats.totalCategories === 1 ? "Discipline" : "Disciplines",
      fallback: "4",
    },
    {
      value: stats.totalViews > 0 ? formatNumber(stats.totalViews) : "24/7",
      label: stats.totalViews > 0 ? "Total Views" : "Learning Access",
      fallback: "24/7",
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Master Every <span className="text-primary">Trick</span> in Your
            Discipline
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            The ultimate collaborative wiki for parkour, tricking, gymnastics,
            and trampwall. Learn, share, and perfect your skills with our
            comprehensive trick database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/sports-and-disciplines">
                Explore Tricks
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {loading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                </div>
              ))
            ) : stats ? (
              // Real data
              getHeroStats(stats).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))
            ) : (
              // Fallback static data
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Documented Tricks
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    1.2k
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Community Members
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4</div>
                  <div className="text-sm text-muted-foreground">
                    Disciplines
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Learning Access
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Additional info for empty database */}
          {stats && stats.totalTricks === 0 && (
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ready to build the ultimate trick database? Start by adding your
                first trick!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
