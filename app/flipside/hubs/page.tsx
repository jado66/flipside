"use client";

import { useState, useEffect } from "react";

import { MainNav } from "@/components/main-nav";
import { HubCard } from "@/components/hub-card";
import { HubSearch } from "@/components/hub-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase-client";

interface Hub {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website_url: string | null;
  images: string[];
  sports: string[];
  amenities: string[];
}

interface SearchFilters {
  query: string;
  sport: string;
  city: string;
  state: string;
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadHubs();
    loadUser();
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUser({ ...user, role: profile?.role });
    }
  };

  const loadHubs = async (filters?: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from("hubs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (filters?.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }
      if (filters?.sport) {
        query = query.contains("sports", [filters.sport]);
      }
      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters?.state) {
        query = query.eq("state", filters.state);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHubs(data || []);
    } catch (error) {
      console.error("Error loading hubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    loadHubs(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Action Sports Hubs
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover training facilities and gyms in your area
            </p>
          </div>

          <Link href="/hubs/create">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Hub
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <HubSearch onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : hubs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hubs found. Try adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
