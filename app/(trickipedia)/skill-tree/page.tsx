"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkillTree } from "@/components/skill-tree";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect to login if user is not authenticated
    if (!user) {
      router.push("/trickipedia/login");
      return;
    }
  }, [user, authLoading, router]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the page if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-4">
                You must be logged in to access the Skill Tree.
              </p>
              <Button asChild>
                <Link href="/trickipedia/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen  p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold  mb-2 ">Trick Skill Tree</h1>
          <p className=" text-lg">
            Master tricks by unlocking prerequisites and following branching
            paths
          </p>
        </div>
        <SkillTree />
      </div>
    </main>
  );
}
