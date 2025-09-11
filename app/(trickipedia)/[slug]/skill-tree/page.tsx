"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkillTree } from "@/components/skill-tree";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SkillTreePage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
      ? params.slug[0]
      : null;

  // No redirect for unauthenticated users

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

  // Show alert for unauthenticated users

  return (
    <main className="min-h-[calc(100vh-64px)] ">
      <div className="mx-auto h-full ">
        {slug ? (
          <SkillTree selectedCategory={slug} />
        ) : (
          <div className="text-center">No slug selected.</div>
        )}
      </div>
    </main>
  );
}
