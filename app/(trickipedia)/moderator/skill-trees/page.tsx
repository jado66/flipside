"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkillTreeAdmin } from "@/components/skill-tree-admin";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
                Admin Access Required
              </h2>
              <p className="text-muted-foreground mb-4">
                You must be logged in as an admin to access this page.
              </p>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="fixed top-4 left-4 z-50 lg:block hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to View Mode
          </Link>
        </Button>
      </div>
      <SkillTreeAdmin />
    </main>
  );
}
